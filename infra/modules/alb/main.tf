# ─── ALB module ─────────────────────────────────────────────────────────────────
variable "environment" { type = string }
variable "vpc_id" { type = string }
variable "subnet_ids" { type = list(string) }
variable "security_group_ids" { type = list(string) }
variable "certificate_arn" { type = string }
variable "internal_only" { type = bool; default = false }
variable "tags" { type = map(string); default = {} }

resource "aws_lb" "main" {
  name               = "forgeboard-${var.environment}"
  internal           = var.internal_only
  load_balancer_type = "application"
  security_groups    = var.security_group_ids
  subnets            = var.subnet_ids

  enable_deletion_protection = var.environment == "prod"
  drop_invalid_header_fields = true

  access_logs {
    bucket  = aws_s3_bucket.alb_logs.id
    prefix  = "alb"
    enabled = true
  }

  tags = merge(var.tags, {
    Name        = "forgeboard-${var.environment}-alb"
    Environment = var.environment
  })
}

resource "aws_s3_bucket" "alb_logs" {
  bucket        = "forgeboard-${var.environment}-alb-logs"
  force_destroy = false

  tags = merge(var.tags, { Name = "forgeboard-${var.environment}-alb-logs" })
}

resource "aws_s3_bucket_public_access_block" "alb_logs" {
  bucket                = aws_s3_bucket.alb_logs.id
  block_public_acls     = true
  block_public_policy   = true
  ignore_public_acls    = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_lifecycle_configuration" "alb_logs" {
  bucket = aws_s3_bucket.alb_logs.id

  rule {
    id     = "expire-old-logs"
    status = "Enabled"

    expiration { days = 90 }
  }
}

# Default target group (forwards to ECS service)
resource "aws_lb_target_group" "app" {
  name        = "forgeboard-${var.environment}-tg"
  port        = 3000
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  target_type = "ip"

  health_check {
    enabled             = true
    path                = "/api/health"
    matcher             = "200"
    port                = "traffic-port"
    interval            = 30
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 3
  }

  deregistration_delay = 30

  tags = merge(var.tags, { Name = "forgeboard-${var.environment}-tg" })
}

# HTTP listener → redirect to HTTPS
resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.main.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type = "redirect"

    redirect {
      port        = "443"
      protocol    = "HTTPS"
      status_code = "HTTP_301"
    }
  }
}

# HTTPS listener → forward to ECS
resource "aws_lb_listener" "https" {
  load_balancer_arn = aws_lb.main.arn
  port              = 443
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS13-1-2-2021-06"
  certificate_arn   = var.certificate_arn

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.app.arn
  }
}

output "alb_arn" { value = aws_lb.main.arn }
output "alb_dns_name" { value = aws_lb.main.dns_name }
output "alb_zone_id" { value = aws_lb.main.zone_id }
output "target_group_arn" { value = aws_lb_target_group.app.arn }
output "https_listener_arn" { value = aws_lb_listener.https.arn }
output "http_listener_arn" { value = aws_lb_listener.http.arn }
