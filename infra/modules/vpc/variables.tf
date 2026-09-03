variable "cidr" { type = string; default = "10.0.0.0/16" }
variable "environment" { type = string }
variable "enable_nat_gateway" { type = bool; default = true }
variable "single_nat_gateway" { type = bool; default = false }
variable "availability_zones" { type = list(string); default = ["us-east-1a", "us-east-1b"] }
variable "tags" { type = map(string); default = {} }
