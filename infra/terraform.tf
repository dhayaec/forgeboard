terraform {
  required_version = ">= 1.9.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    bucket = "forgeboard-terraform-state"
    key    = "dev/infrastructure.tfstate"
    region = "us-east-1"
    encrypt = true
    dynamodb_table = "forgeboard-terraform-lock"
  }
}
