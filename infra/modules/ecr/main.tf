# ─── ECR module ─────────────────────────────────────────────────────────────────
variable "environment" { type = string }
variable "name" { type = string; default = "forgeboard" }
variable "image_tag_mutability" { type = string; default = "IMMUTABLE" }
variable "scan_on_push" { type = bool; default = true }
variable "max_image_count" { type = number; default = 10 }
variable "tags" { type = map(string); default = {} }

resource "aws_ecr_repository" "main" {
  name                 = "${var.name}-${var.environment}"
  image_tag_mutability = var.image_tag_mutability

  image_scanning_configuration {
    scan_on_push = var.scan_on_push
  }

  encryption_configuration {
    encryption_type = "AES256"
  }

  tags = merge(var.tags, {
    Name        = "${var.name}-${var.environment}"
    Environment = var.environment
  })
}

# Lifecycle: keep only the most recent N images
resource "aws_ecr_lifecycle_policy" "main" {
  repository = aws_ecr_repository.main.name

  policy = jsonencode({
    rules = [{
      rulePriority = 1
      description  = "Keep only the most recent ${var.max_image_count} images"
      action = { type = "expire" }
      selection = {
        tagStatus   = "any"
        countType   = "imageCountMoreThan"
        countNumber = var.max_image_count
      }
    }]
  })
}

output "repository_url" { value = aws_ecr_repository.main.repository_url }
output "repository_arn" { value = aws_ecr_repository.main.arn }
output "repository_name" { value = aws_ecr_repository.main.name }
