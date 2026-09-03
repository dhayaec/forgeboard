# ─── ECS Fargate module ───────────────────────────────────────────────────────────
variable "environment" { type = string }
variable "vpc_id" { type = string }
variable "cluster_name" { type = string; default = "forgeboard" }
variable "subnet_ids" { type = list(string) }
variable "security_group_ids" { type = list(string) }
variable "task_execution_role_arn" { type = string }
variable "task_role_arn" { type = string }
variable "log_group_name" { type = string }
variable "container_image" { type = string }
variable "container_port" { type = number; default = 3000 }
variable "desired_count" { type = number; default = 1 }
variable "cpu" { type = number; default = 256 }
variable "memory" { type = number; default = 512 }
variable "environment_secrets" { type = list(object({
    name = string
    value_from = string
  })); default = [] }
variable "tags" { type = map(string); default = {} }

# ─── Cluster ────────────────────────────────────────────────────────────────────
resource "aws_ecs_cluster" "main" {
  name = var.cluster_name

  setting {
    name  = "containerInsights"
    value = "enabled"
  }

  tags = merge(var.tags, {
    Name        = "forgeboard-${var.environment}-cluster"
    Environment = var.environment
  })
}

# ─── Task definition ─────────────────────────────────────────────────────────────
resource "aws_ecs_task_definition" "app" {
  family                   = "forgeboard-${var.environment}"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.cpu
  memory                   = var.memory
  execution_role_arn       = var.task_execution_role_arn
  task_role_arn            = var.task_role_arn

  container_definitions = jsonencode([{
    name      = "web"
    image     = var.container_image
    essential = true
    portMappings = [{ containerPort = var.container_port, protocol = "tcp" }]
    environment = [
      { name = "NODE_ENV", value = "production" },
      { name = "PORT", value = tostring(var.container_port) },
    ]
    secrets = var.environment_secrets
    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = var.log_group_name
        "awslogs-region"        = data.aws_region.current.name
        "awslogs-stream-prefix" = "web"
      }
    }
    healthCheck = {
      command  = ["CMD-SHELL", "wget -qO- http://localhost:${var.container_port}/api/health || exit 1"]
      interval = 30
      timeout  = 5
      retries  = 3
    }
  }])

  runtime_platform {
    operating_system_family = "LINUX"
    cpu_architecture      = "ARM64"
  }

  tags = merge(var.tags, {
    Name        = "forgeboard-${var.environment}-task"
    Environment = var.environment
  })
}

data "aws_region" "current" {}

# ─── Autoscaling ─────────────────────────────────────────────────────────────────
resource "aws_appautoscaling_target" "app" {
  max_capacity       = var.environment == "prod" ? 4 : 2
  min_capacity       = 1
  resource_id        = "service/${aws_ecs_cluster.main.name}/${aws_ecs_service.app.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}

resource "aws_appautoscaling_policy" "cpu" {
  name               = "forgeboard-${var.environment}-cpu-scaling"
  resource_id        = aws_appautoscaling_target.app.resource_id
  scalable_dimension = aws_appautoscaling_target.app.scalable_dimension
  service_namespace  = "ecs"

  target_tracking_scaling_policy_configuration {
    targetValue       = 70
    scaleInCooldown   = 60
    scaleOutCooldown  = 60
    predefinedMetricSpecification {
      predefinedMetricType = "ECSServiceAverageCPUUtilization"
    }
  }
}

resource "aws_appautoscaling_policy" "memory" {
  name               = "forgeboard-${var.environment}-memory-scaling"
  resource_id        = aws_appautoscaling_target.app.resource_id
  scalable_dimension = aws_appautoscaling_target.app.scalable_dimension
  service_namespace  = "ecs"

  target_tracking_scaling_policy_configuration {
    targetValue       = 80
    scaleInCooldown   = 60
    scaleOutCooldown  = 60
    predefinedMetricSpecification {
      predefinedMetricType = "ECSServiceAverageMemoryUtilization"
    }
  }
}

# ─── Service ────────────────────────────────────────────────────────────────────
resource "aws_ecs_service" "app" {
  name            = "forgeboard-${var.environment}"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.app.arn
  desired_count   = var.desired_count
  launch_type     = "FARGATE"

  deployment_controller { type = "ECS" }

  deployment_circuit_breaker {
    enable   = true
    rollback = true
  }

  deployment_maximum_percent         = 200
  deployment_minimum_healthy_percent = 100
  health_check_grace_period_seconds  = 10

  network_configuration {
    subnets          = var.subnet_ids
    security_groups  = var.security_group_ids
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = var.target_group_arn
    container_name   = "web"
    container_port   = var.container_port
  }

  lifecycle {
    ignore_changes = [task_definition]
  }

  tags = merge(var.tags, {
    Name        = "forgeboard-${var.environment}-service"
    Environment = var.environment
  })
}

variable "target_group_arn" { type = string }
output "cluster_id" { value = aws_ecs_cluster.main.id }
output "service_id" { value = aws_ecs_service.app.id }
output "task_definition_arn" { value = aws_ecs_task_definition.app.arn }
output "log_group_name" { value = var.log_group_name }
