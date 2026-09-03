# ─── VPC module ───────────────────────────────────────────────────────────────
variable "cidr" {
  description = "IPv4 CIDR block for the VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "environment" {
  description = "Deployment environment: dev, staging, prod"
  type        = string
}

variable "enable_nat_gateway" {
  description = "Provision NAT Gateways for private subnets"
  type        = bool
  default     = true
}

variable "single_nat_gateway" {
  description = "Use a single shared NAT Gateway (cheaper for dev)"
  type        = bool
  default     = false
}

variable "availability_zones" {
  description = "AZs to use for public and private subnets"
  type        = list(string)
  default     = ["us-east-1a", "us-east-1b"]
}

variable "tags" {
  description = "Extra tags merged with the standard resource tags"
  type        = map(string)
  default     = {}
}

output "vpc_id"              { value = aws_vpc.main.id }
output "public_subnet_ids"   { value = aws_subnet.public[*].id }
output "private_subnet_ids"  { value = aws_subnet.private[*].id }
output "nat_gateway_ids"     { value = aws_nat_gateway.this[*].id }
output "igw_id"              { value = aws_internet_gateway.main.id }

resource "aws_vpc" "main" {
  cidr_block           = var.cidr
  enable_dns_hostnames = true
  enable_dns_support   = true
  tags = merge(var.tags, {
    Name        = "forgeboard-${var.environment}-vpc"
    Environment = var.environment
  })
}

resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id
  tags = merge(var.tags, {
    Name        = "forgeboard-${var.environment}-igw"
    Environment = var.environment
  })
}

# ─── Public subnets ───────────────────────────────────────────────────────────
resource "aws_subnet" "public" {
  count = length(var.availability_zones)

  vpc_id                  = aws_vpc.main.id
  cidr_block              = cidrsubnet(var.cidr, 8, count.index)
  availability_zone       = var.availability_zones[count.index]
  map_public_ip_on_launch = true

  tags = merge(var.tags, {
    Name        = "forgeboard-${var.environment}-public-${count.index + 1}"
    Environment = var.environment
    Tier        = "public"
  })
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }

  tags = merge(var.tags, {
    Name        = "forgeboard-${var.environment}-public-rt"
    Environment = var.environment
  })
}

resource "aws_route_table_association" "public" {
  count = length(var.availability_zones)

  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

# ─── Private subnets ──────────────────────────────────────────────────────────
resource "aws_subnet" "private" {
  count = length(var.availability_zones)

  vpc_id            = aws_vpc.main.id
  cidr_block        = cidrsubnet(var.cidr, 8, length(var.availability_zones) + count.index)
  availability_zone = var.availability_zones[count.index]

  tags = merge(var.tags, {
    Name        = "forgeboard-${var.environment}-private-${count.index + 1}"
    Environment = var.environment
    Tier        = "private"
  })
}

resource "aws_eip" "nat" {
  count = var.enable_nat_gateway ? (var.single_nat_gateway ? 1 : length(var.availability_zones)) : 0
  domain = "vpc"

  tags = merge(var.tags, {
    Name        = "forgeboard-${var.environment}-nat-eip-${count.index + 1}"
    Environment = var.environment
  })
}

resource "aws_nat_gateway" "this" {
  count = var.enable_nat_gateway ? (var.single_nat_gateway ? 1 : length(var.availability_zones)) : 0

  allocation_id = aws_eip.nat[count.index].id
  subnet_id     = aws_subnet.public[var.single_nat_gateway ? 0 : count.index].id

  tags = merge(var.tags, {
    Name        = "forgeboard-${var.environment}-nat-${count.index + 1}"
    Environment = var.environment
  })

  depends_on = [aws_internet_gateway.main]
}

resource "aws_route_table" "private" {
  count = length(var.availability_zones)

  vpc_id = aws_vpc.main.id

  dynamic "route" {
    for_each = var.enable_nat_gateway ? [1] : []
    content {
      cidr_block     = "0.0.0.0/0"
      nat_gateway_id = aws_nat_gateway.this[var.single_nat_gateway ? 0 : count.index].id
    }
  }

  tags = merge(var.tags, {
    Name        = "forgeboard-${var.environment}-private-rt-${count.index + 1}"
    Environment = var.environment
  })
}

resource "aws_route_table_association" "private" {
  count = length(var.availability_zones)

  subnet_id      = aws_subnet.private[count.index].id
  route_table_id = aws_route_table.private[count.index].id
}

# ─── Security groups ───────────────────────────────────────────────────────────
resource "aws_security_group" "ecs_tasks" {
  name        = "forgeboard-${var.environment}-ecs-tasks"
  description = "Security group for ECS Fargate tasks"
  vpc_id      = aws_vpc.main.id

  tags = merge(var.tags, {
    Name        = "forgeboard-${var.environment}-ecs-tasks-sg"
    Environment = var.environment
  })
}

resource "aws_security_group_rule" "ecs_allow_alb" {
  type                     = "ingress"
  from_port                = 3000
  to_port                  = 3000
  protocol                 = "tcp"
  source_security_group_id = aws_security_group.alb.id
  security_group_id        = aws_security_group.ecs_tasks.id
  description              = "Allow traffic from ALB"
}

resource "aws_security_group" "alb" {
  name        = "forgeboard-${var.environment}-alb"
  description = "Security group for the Application Load Balancer"
  vpc_id      = aws_vpc.main.id

  tags = merge(var.tags, {
    Name        = "forgeboard-${var.environment}-alb-sg"
    Environment = var.environment
  })
}

resource "aws_security_group_rule" "alb_allow_http" {
  type              = "ingress"
  from_port         = 443
  to_port           = 443
  protocol          = "tcp"
  cidr_blocks       = ["0.0.0.0/0"]
  security_group_id = aws_security_group.alb.id
  description       = "HTTPS from anywhere"
}

resource "aws_security_group_rule" "alb_allow_http80" {
  type              = "ingress"
  from_port         = 80
  to_port           = 80
  protocol          = "tcp"
  cidr_blocks       = ["0.0.0.0/0"]
  security_group_id = aws_security_group.alb.id
  description       = "HTTP from anywhere (redirect)"
}

resource "aws_security_group_rule" "alb_allow_all_egress" {
  type              = "egress"
  from_port         = 0
  to_port           = 0
  protocol          = "-1"
  cidr_blocks      = ["0.0.0.0/0"]
  security_group_id = aws_security_group.alb.id
  description       = "Allow all outbound"
}

resource "aws_security_group" "rds" {
  name        = "forgeboard-${var.environment}-rds"
  description = "Security group for RDS PostgreSQL"
  vpc_id      = aws_vpc.main.id

  tags = merge(var.tags, {
    Name        = "forgeboard-${var.environment}-rds-sg"
    Environment = var.environment
  })
}

resource "aws_security_group_rule" "rds_allow_ecs" {
  type                     = "ingress"
  from_port                = 5432
  to_port                  = 5432
  protocol                 = "tcp"
  source_security_group_id  = aws_security_group.ecs_tasks.id
  security_group_id        = aws_security_group.rds.id
  description              = "Allow PostgreSQL from ECS tasks"
}

resource "aws_security_group" "elasticache" {
  name        = "forgeboard-${var.environment}-elasticache"
  description = "Security group for ElastiCache Redis"
  vpc_id      = aws_vpc.main.id

  tags = merge(var.tags, {
    Name        = "forgeboard-${var.environment}-elasticache-sg"
    Environment = var.environment
  })
}

resource "aws_security_group_rule" "elasticache_allow_ecs" {
  type                     = "ingress"
  from_port                = 6379
  to_port                  = 6379
  protocol                 = "tcp"
  source_security_group_id = aws_security_group.ecs_tasks.id
  security_group_id        = aws_security_group.elasticache.id
  description              = "Allow Redis from ECS tasks"
}
