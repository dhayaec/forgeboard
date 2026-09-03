variable "environment" { type = string }
variable "bucket_name" {
  type        = string
  description = "S3 bucket name (must be globally unique)"
  default     = null
}
variable "tags" { type = map(string); default = {} }

resource "aws_s3_bucket" "assets" {
  bucket = var.bucket_name != null ? var.bucket_name : "forgeboard-${var.environment}-assets"

  tags = merge(var.tags, {
    Name        = "forgeboard-${var.environment}-assets"
    Environment = var.environment
  })
}

resource "aws_s3_bucket_public_access_block" "assets" {
  bucket = aws_s3_bucket.assets.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_server_side_encryption_configuration" "assets" {
  bucket = aws_s3_bucket.assets.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
    bucket_key_enabled = true
  }
}

resource "aws_s3_bucket_versioning" "assets" {
  bucket = aws_s3_bucket.assets.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "assets" {
  bucket = aws_s3_bucket.assets.id

  rule {
    id     = "expire-old-uploads"
    status = "Enabled"

    expiration {
      days = 180
    }

    noncurrent_version_expiration {
      noncurrent_days = 30
    }
  }
}

output "bucket_name" { value = aws_s3_bucket.assets.id }
output "bucket_arn"  { value = aws_s3_bucket.assets.arn }
