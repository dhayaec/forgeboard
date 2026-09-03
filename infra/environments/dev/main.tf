provider "aws" {
  region = "us-east-1"

  default_tags {
    tags = {
      Project     = "forgeboard"
      Environment = "dev"
      ManagedBy   = "terraform"
      Owner       = "platform-team"
    }
  }
}

terraform {
  backend "s3" {
    bucket         = "forgeboard-terraform-state-dev"
    key            = "dev/infrastructure.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "forgeboard-terraform-lock-dev"
  }
}

# ─── Network ────────────────────────────────────────────────────────────────────
module "vpc" {
  source = "../../modules/vpc"

  environment          = "dev"
  cidr                 = "10.0.0.0/16"
  enable_nat_gateway   = true
  single_nat_gateway   = true            # dev: cheaper
  availability_zones   = ["us-east-1a", "us-east-1b"]
}

# ─── Storage ────────────────────────────────────────────────────────────────────
module "s3" {
  source = "../../modules/s3"

  environment = "dev"
  bucket_name = "forgeboard-dev-assets"
}

# ─── Database ────────────────────────────────────────────────────────────────────
module "rds" {
  source = "../../modules/rds"

  identifier             = "forgeboard-dev-db"
  environment            = "dev"
  engine_version         = "16.1"
  instance_class         = "db.t4g.micro"
  allocated_storage      = 20
  max_allocated_storage  = 100
  vpc_id                 = module.vpc.vpc_id
  subnet_ids             = module.vpc.private_subnet_ids
  security_group_ids     = [module.vpc.rds_security_group_id]
  skip_final_snapshot    = true
  backup_retention_days  = 1
}

# ─── Cache ──────────────────────────────────────────────────────────────────────
module "elasticache" {
  source = "../../modules/elasticache"

  environment        = "dev"
  vpc_id             = module.vpc.vpc_id
  subnet_ids         = module.vpc.private_subnet_ids
  security_group_ids = [module.vpc.elasticache_security_group_id]
  node_type          = "cache.t4g.micro"
  num_cache_nodes    = 1
}

# ─── Secrets ────────────────────────────────────────────────────────────────────
module "secrets" {
  source = "../../modules/secrets"

  environment = "dev"
}

# ─── IAM + Logs ──────────────────────────────────────────────────────────────────
module "iam" {
  source = "../../modules/iam"

  environment = "dev"
}

# ─── ECR ────────────────────────────────────────────────────────────────────────
module "ecr" {
  source = "../../modules/ecr"

  environment    = "dev"
  max_image_count = 5
}

# ─── DNS (optional, only if you have a hosted zone) ─────────────────────────────
# module "dns" {
#   source = "../../modules/dns"
#   environment = "dev"
#   domain_name = "dev.forgeboard.example.com"
#   alb_dns_name = module.alb.alb_dns_name
#   alb_zone_id  = module.alb.alb_zone_id
#   hosted_zone_id = "Z1234..."
# }

# ─── CloudWatch (alarms + dashboard) ────────────────────────────────────────────
module "cloudwatch" {
  source = "../../modules/cloudwatch"

  environment         = "dev"
  log_group_name      = module.iam.log_group_name
  ecs_cluster_name    = "forgeboard"
  ecs_service_name    = "forgeboard-dev"
  sns_topic_arn       = null  # dev: no pager
  alarm_pager_email   = null
}

# ─── Outputs ─────────────────────────────────────────────────────────────────────
output "vpc_id"           { value = module.vpc.vpc_id }
output "db_endpoint"     { value = module.rds.db_endpoint }
output "redis_endpoint"  { value = module.elasticache.cluster_endpoint }
output "s3_bucket"       { value = module.s3.bucket_name }
output "ecr_url"         { value = module.ecr.repository_url }
