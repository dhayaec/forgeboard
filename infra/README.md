# ForgeBoard Infrastructure (Terraform)

This directory contains the Terraform code that provisions AWS infrastructure for ForgeBoard.

## Layout

```
infra/
├── terraform.tf              # provider + terraform version (no backend here)
├── modules/
│   ├── vpc/                  # Network foundation
│   ├── rds/                  # PostgreSQL 16 (single-AZ in dev, multi-AZ in prod)
│   ├── elasticache/          # Redis 7
│   ├── s3/                   # Asset bucket (uploads, exports)
│   ├── ecs/                  # Fargate service + task definition + autoscaling
│   ├── alb/                  # Application Load Balancer + listener rules
│   ├── dns/                  # Route 53 record sets
│   ├── ecr/                  # Container registry
│   ├── iam/                  # Task role + execution role
│   ├── secrets/              # Secret rotation + access policies
│   ├── cloudwatch/           # Log groups, alarms, dashboards
│   └── cdn/                  # CloudFront distribution
└── environments/
    ├── dev/                  # Dev: single NAT, no deletion protection, db.t4g.micro
    ├── staging/              # Staging: similar to prod but smaller instance sizes
    └── prod/                 # Prod: multi-AZ, deletion protection, larger instances
```

## State

Each environment has its own S3 backend with DynamoDB locking. State files are
**never** committed (see root `.gitignore`).

The shared `terraform.tf` declares providers and required versions, but does
**not** declare a backend — backends are configured per environment in
`environments/*/backend.tf` so that each can live in a separate state.

## Usage

```bash
# 1. Bootstrap the state bucket + lock table (one-time)
cd infra
terraform init -backend-config=environments/dev/backend.hcl
terraform apply -target=aws_s3_bucket.terraform_state -target=aws_dynamodb_table.terraform_lock

# 2. Provision an environment
cd environments/dev
terraform init
terraform plan -out tfplan
terraform apply tfplan
```

## Modules

Every module:
- Takes `environment` and `tags` as variables
- Tags all resources with `Environment = var.environment` and `Name = forgeboard-${environment}-${resource}`
- Uses IAM least-privilege — tasks can only read the specific secrets they need
- Logs to CloudWatch with structured JSON
- Encrypts at rest (RDS, S3, EBS, secrets)
- Encrypts in transit (RDS force_ssl, ALB TLS-only, Redis in-transit encryption)

## Secrets

- All secrets are in AWS Secrets Manager, never in code or env files
- The DB module generates a password and stores it in Secrets Manager
- The ECS module reads from Secrets Manager at task start
- Secret rotation is the responsibility of each consuming module

## Cost notes

- Dev: ~$50/mo — single NAT, no NAT in dev is on the wishlist
- Staging: ~$120/mo
- Prod: ~$400/mo (estimated, depends on traffic)
