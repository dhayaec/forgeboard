# ─── ElastiCache Redis 7 module ──────────────────────────────────────────────────
variable "environment" { type = string }
variable "vpc_id" { type = string }
variable "subnet_ids" { type = list(string) }
variable "security_group_ids" { type = list(string) }
variable "node_type" { type = string; default = "cache.t4g.micro" }
variable "num_cache_nodes" { type = number; default = 1 }
variable "tags" { type = map(string); default = {} }

output "cluster_endpoint" {
  description = "Redis cluster endpoint (for connection strings)"
  value = aws_elasticache_replication_group.this.primary_endpoint_address
}
output "port" { value = aws_elasticache_replication_group.this.port }
output "auth_token" { value = aws_elasticache_replication_group.this.auth_token_enabled ? aws_elasticache_replication_group.this.auth_token : null }
output "replication_group_id" { value = aws_elasticache_replication_group.this.id }

resource "aws_elasticache_subnet_group" "this" {
  name       = "forgeboard-${var.environment}-redis-subnet"
  subnet_ids = var.subnet_ids
}

resource "aws_elasticache_parameter_group" "this" {
  name   = "forgeboard-${var.environment}-redis7"
  family = "redis7"

  parameter {
    name  = "maxmemory-policy"
    value = "allkeys-lru"
  }

  parameter {
    name  = "activedefrag"
    value = "yes"
  }
}

resource "aws_elasticache_replication_group" "this" {
  replication_group_id       = "forgeboard-${var.environment}"
  replication_group_description = "ForgeBoard Redis ${var.environment}"

  engine               = "redis"
  engine_version       = "7.0"
  node_type            = var.node_type
  number_cache_clusters = var.num_cache_nodes

  port                     = 6379
  parameter_group_name     = aws_elasticache_parameter_group.this.name
  subnet_group_name        = aws_elasticache_subnet_group.this.name
  security_group_ids       = var.security_group_ids
  vpc_security_group_ids   = var.security_group_ids

  # Persistence
  at_rest_encryption_enabled = true
  transit_encryption_enabled = true
  auth_token_enabled         = true
  auto_minor_version_upgrade = true

  # Backup
  snapshot_retention_limit   = var.environment == "prod" ? 7 : 1
  snapshot_window            = "03:00-05:00"

  multi_az_enabled = var.num_cache_nodes > 1

  tags = merge(var.tags, {
    Name        = "forgeboard-${var.environment}-redis"
    Environment = var.environment
  })
}
