# ─── RDS PostgreSQL 16 module ───────────────────────────────────────────────────
variable "identifier" {
  description = "DB instance identifier"
  type        = string
  default     = "forgeboard"
}

variable "engine_version"   { type = string; default = "16.1" }
variable "instance_class"   { type = string; default = "db.t4g.micro" }
variable "allocated_storage" { type = number; default = 20 }
variable "max_allocated_storage" { type = number; default = 100 }
variable "db_username" { type = string; default = "forgeboard" }
variable "db_name" { type = string; default = "forgeboard" }
variable "vpc_id" { type = string }
variable "subnet_ids" { type = list(string) }
variable "security_group_ids" { type = list(string) }
variable "environment" { type = string }
variable "tags" { type = map(string); default = {} }

variable "skip_final_snapshot" { type = bool; default = false }
variable "backup_retention_days" { type = number; default = 7 }

resource "aws_db_subnet_group" "this" {
  name       = "forgeboard-${var.environment}-db-subnet-group"
  subnet_ids = var.subnet_ids

  tags = merge(var.tags, {
    Name        = "forgeboard-${var.environment}-db-subnet-group"
    Environment = var.environment
  })
}

resource "aws_db_parameter_group" "this" {
  name   = "forgeboard-${var.environment}-pg16"
  family = "postgres16"

  parameter {
    name  = "log_connections"
    value = "1"
  }

  parameter {
    name  = "log_disconnections"
    value = "1"
  }

  tags = merge(var.tags, { Environment = var.environment })
}

resource "aws_db_instance" "this" {
  identifier              = var.identifier
  engine                  = "postgres"
  engine_version          = var.engine_version
  instance_class          = var.instance_class
  allocated_storage       = var.allocated_storage
  max_allocated_storage   = var.max_allocated_storage
  db_name                  = var.db_name
  username                = var.db_username
  password                = random_password.db.result

  db_subnet_group_name = aws_db_subnet_group.this.name
  parameter_group_name = aws_db_parameter_group.this.name
  vpc_security_group_ids = var.security_group_ids

  multi_az              = var.environment == "prod"
  backup_retention_period = var.backup_retention_days
  skip_final_snapshot   = var.skip_final_snapshot
  deletion_protection   = var.environment == "prod"
  publicly_accessible   = false

  tags = merge(var.tags, {
    Name        = "forgeboard-${var.environment}-db"
    Environment = var.environment
  })
}

resource "random_password" "db" {
  length  = 32
  special = false
}

# ─── Secrets Manager entry ──────────────────────────────────────────────────────
resource "aws_secretsmanager_secret" "db_password" {
  name        = "forgeboard/${var.environment}/db-password"
  description = "PostgreSQL master password for ForgeBoard ${var.environment}"
  tags = merge(var.tags, { Environment = var.environment })
}

resource "aws_secretsmanager_secret_version" "db_password" {
  secret_id     = aws_secretsmanager_secret.db_password.id
  secret_string = random_password.db.result
}

# ─── Outputs ────────────────────────────────────────────────────────────────────
output "db_endpoint"       { value = aws_db_instance.this.endpoint }
output "db_port"         { value = aws_db_instance.this.port }
output "db_username"     { value = var.db_username }
output "db_name"         { value = var.db_name }
output "db_password_secret_arn" { value = aws_secretsmanager_secret.db_password.arn }
output "connection_string" {
  value = "postgresql://${var.db_username}:${random_password.db.result}@${aws_db_instance.this.endpoint}:${aws_db_instance.this.port}/${var.db_name}?sslmode=require"
}
