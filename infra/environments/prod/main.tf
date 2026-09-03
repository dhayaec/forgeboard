provider "aws" {
  region = "us-east-1"

  default_tags {
    tags = {
      Project     = "forgeboard"
      Environment = "prod"
      ManagedBy   = "terraform"
      Owner       = "platform-team"
    }
  }
}

terraform {
  backend "s3" {
    bucket         = "forgeboard-terraform-state-prod"
    key            = "prod/infrastructure.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "forgeboard-terraform-lock-prod"
  }
}

module "vpc" {
  source = "../../modules/vpc"
  environment        = "prod"
  cidr               = "10.2.0.0/16"
  enable_nat_gateway = true
  single_nat_gateway = false
  availability_zones = ["us-east-1a", "us-east-1b", "us-east-1c"]
}

module "s3" {
  source      = "../../modules/s3"
  environment = "prod"
  bucket_name = "forgeboard-prod-assets"
}

module "rds" {
  source               = "../../modules/rds"
  identifier           = "forgeboard-prod-db"
  environment          = "prod"
  engine_version       = "16.1"
  instance_class       = "db.r8g.large"
  allocated_storage    = 100
  max_allocated_storage = 500
  multi_az             = true
  vpc_id               = module.vpc.vpc_id
  subnet_ids           = module.vpc.private_subnet_ids
  security_group_ids   = [module.vpc.rds_security_group_id]
  skip_final_snapshot  = false
  backup_retention_days = 30
}

module "elasticache" {
  source             = "../../modules/elasticache"
  environment        = "prod"
  vpc_id             = module.vpc.vpc_id
  subnet_ids         = module.vpc.private_subnet_ids
  security_group_ids = [module.vpc.elasticache_security_group_id]
  node_type          = "cache.r8g.large"
  num_cache_nodes    = 2
}

module "alb" {
  source      = "../../modules/alb"
  environment = "prod"
  vpc_id      = module.vpc.vpc_id
  subnet_ids  = module.vpc.public_subnet_ids
}

output "vpc_id"          { value = module.vpc.vpc_id }
output "db_endpoint"     { value = module.rds.db_endpoint }
output "redis_endpoint"  { value = module.elasticache.cluster_endpoint }
output "s3_bucket"       { value = module.s3.bucket_name }
output "alb_dns_name"    { value = module.alb.alb_dns_name }
