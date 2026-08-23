variable "project_name" {
  type        = string
  default     = "finance-hub"
  description = "Name prefix for resources"
}

variable "location" {
  type        = string
  default     = "sweden central"
  description = "Azure Region"
}

variable "db_admin_user" {
  type    = string
  default = "pgadmin"
}

variable "db_admin_password" {
  type        = string
  sensitive   = true
  description = "Must be complex: 8+ chars"
}

variable "nextauth_secret" {
  type        = string
  sensitive   = true
  description = "Generate random secret for NextAuth"
}

variable "ms_client_id" {
  type        = string
  sensitive   = true
  description = "Microsoft Entra ID Client ID (Application ID)"
}

variable "ms_client_secret" {
  type        = string
  sensitive   = true
  description = "Microsoft Entra ID Client Secret"
}

variable "ms_tenant_id" {
  type        = string
  sensitive   = true
  description = "Microsoft Entra ID tenant ID"
}
