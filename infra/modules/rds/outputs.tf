output "db_endpoint" { value = aws_db_instance.this.endpoint }
output "db_port" { value = aws_db_instance.this.port }
output "db_username" { value = var.db_username }
output "db_name" { value = var.db_name }
output "db_password_secret_arn" { value = aws_secretsmanager_secret.db_password.arn }
output "connection_string" { value = "postgresql://${var.db_username}:${random_password.db.result}@${aws_db_instance.this.endpoint}:${aws_db_instance.this.port}/${var.db_name}?sslmode=require" }
