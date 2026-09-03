# ─── IAM module: ECS task roles ───────────────────────────────────────────────
variable "environment" { type = string }
variable "tags" { type = map(string); default = {} }

# ECS execution role (pulls images, writes logs)
resource "aws_iam_role" "ecs_execution" {
  name = "forgeboard-${var.environment}-ecs-execution"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = { Service = "ecs-tasks.amazonaws.com" }
      Action = "sts:AssumeRole"
    }]
  })

  tags = merge(var.tags, { Name = "forgeboard-${var.environment}-ecs-execution" })
}

resource "aws_iam_role_policy" "ecs_execution" {
  name = "forgeboard-${var.environment}-ecs-execution"
  role = aws_iam_role.ecs_execution.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ecr:GetAuthorizationToken",
          "ecr:BatchCheckLayerAvailability",
          "ecr:GetDownloadUrlForLayer",
          "ecr:BatchGetImage",
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogStream",
          "logs:PutLogEvents",
        ]
        Resource = "arn:aws:logs:*:*:*"
      },
      {
        Effect = "Allow"
        Action = ["secretsmanager:GetSecretValue"]
        Resource = "arn:aws:secretsmanager:*:*:secret:forgeboard/${var.environment}/*"
      },
      {
        Effect = "Allow"
        Action = ["ssm:GetParameters"]
        Resource = "arn:aws:ssm:*:*:parameter/forgeboard/${var.environment}/*"
      },
    ]
  })
}

# ECS task role (runtime permissions)
resource "aws_iam_role" "ecs_task" {
  name = "forgeboard-${var.environment}-ecs-task"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = { Service = "ecs-tasks.amazonaws.com" }
      Action = "sts:AssumeRole"
    }]
  })

  tags = merge(var.tags, { Name = "forgeboard-${var.environment}-ecs-task" })
}

resource "aws_iam_role_policy" "ecs_task" {
  name = "forgeboard-${var.environment}-ecs-task"
  role = aws_iam_role.ecs_task.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject",
        ]
        Resource = "arn:aws:s3:::*-forgeboard-${var.environment}-*/*"
      },
      {
        Effect = "Allow"
        Action = ["secretsmanager:GetSecretValue"]
        Resource = "arn:aws:secretsmanager:*:*:secret:forgeboard/${var.environment}/*"
      },
    ]
  })
}

# CloudWatch log group (created here so we control retention)
resource "aws_cloudwatch_log_group" "app" {
  name              = "/forgeboard/${var.environment}/app"
  retention_in_days = var.environment == "prod" ? 30 : 7
  tags = merge(var.tags, { Name = "forgeboard-${var.environment}-app-logs" })
}

output "execution_role_arn" { value = aws_iam_role.ecs_execution.arn }
output "task_role_arn" { value = aws_iam_role.ecs_task.arn }
output "log_group_name" { value = aws_cloudwatch_log_group.app.name }
output "log_group_arn" { value = aws_cloudwatch_log_group.app.arn }
