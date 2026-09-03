provider "aws" {
  region = "us-east-1"

  default_tags {
    tags = {
      Project     = "forgeboard"
      Environment = "staging"
      ManagedBy   = "terraform"
      Owner       = "platform-team"
    }
  }
}

terraform {
  backend "s3" {
    bucket         = "forgeboard-terraform-state-staging"
    key            = "staging/infrastructure.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "forgeboard-terraform-lock-staging"
  }
}

module "vpc" {
  source = "../../modules/vpc"
  environment        = "staging"
  cidr               = "10.1.0.0/16"
  enable_nat_gateway = true
  single_nat_gateway = true
  availability_zones = ["us-east-1a", "us-east-1b"]
}

module "s3" {
  source      = "../../modules/s3"
  environment = "staging"
  bucket_name = "forgeboard-staging-assets"
}

module "rds" {
  source               = "../../modules/rds"
  identifier           = "forgeboard-staging-db"
  environment          = "staging"
  engine_version       = "16.1"
  instance_class       = "db.t4g.small"
  allocated_storage    = 50
  max_allocated_storage = 200
  vpc_id               = module.vpc.vpc_id
  subnet_ids           = module.vpc.private_subnet_ids
  security_group_ids   = [module.vpc.rds_security_group_id]
  skip_final_snapshot  = false
  backup_retention_days = 7
}

module "elasticache" {
  source             = "../../modules/elasticache"
  environment        = "staging"
  vpc_id             = module.vpc.vpc_id
  subnet_ids         = module.vpc.private_subnet_ids
  security_group_ids = [module.vpc.elasticache_security_group_id]
  node_type          = "cache.t4g.micro"
  num_cache_nodes    = 1
}

module "alb" {
  source      = "../../modules/alb"
  environment = "staging"
  vpc_id      = module.vpc.vpc_id
  subnet_ids  = module.vpc.public_subnet_ids
}

output "vpc_id"          { value = module.vpc.vpc_id }
output "db_endpoint"     { value = module.rds.db_endpoint }
output "redis_endpoint"  { value = module.elasticache.cluster_endpoint }
output "s3_bucket"       { value = module.s3.bucket_name }
output "alb_dns_name"    { value = module.alb.alb_dns_name }
