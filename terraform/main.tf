terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "=5.1.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "3.9.0"
    }
  }

  backend "azurerm" {
    resource_group_name  = "rg-finance-hub-tfstate"
    storage_account_name = "stfinancehubtfstate15169"
    container_name       = "tfstate"
    key                  = "finance-hub.terraform.tfstate"
  }
}

provider "azurerm" {
  features {

  }
}

resource "random_string" "suffix" {
  length  = 6
  special = false
  upper   = false
}

resource "azurerm_resource_group" "rg" {
  name     = "rg-${var.project_name}"
  location = var.location
}

resource "azurerm_postgresql_flexible_server" "db" {
  name                   = "psql-${var.project_name}-${random_string.suffix.result}"
  resource_group_name    = azurerm_resource_group.rg.name
  location               = azurerm_resource_group.rg.location
  version                = 16
  administrator_login    = var.db_admin_user
  administrator_password = var.db_admin_password

  sku_name   = "B_Standard_B1ms"
  storage_mb = 32768

  public_network_access_enabled = true
  zone                          = "1"
}

resource "azurerm_postgresql_flexible_server_database" "financehub_db" {
  name      = "financehub_db"
  server_id = azurerm_postgresql_flexible_server.db.id
  collation = "en_US.utf8"
  charset   = "utf8"
}

resource "azurerm_postgresql_flexible_server_firewall_rule" "allow_azure" {
  name             = "AllowAllAzureServicesAndResourcesWithinAzureIps"
  server_id        = azurerm_postgresql_flexible_server.db.id
  start_ip_address = "0.0.0.0"
  end_ip_address   = "0.0.0.0"
}

resource "azurerm_service_plan" "asp" {
  name                = "asp-${var.project_name}"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  os_type             = "Linux"
  sku_name            = "F1"
}

resource "azurerm_linux_web_app" "app" {
  name                = "app-${var.project_name}-${random_string.suffix.result}"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  service_plan_id     = azurerm_service_plan.asp.id

  site_config {
    always_on = false
    application_stack {
      node_version = "20-lts"
    }
  }

  app_settings = {
    "NODE_ENV"                          = "production"
    "PORT"                              = "8080"
    "NEXTAUTH_URL"                      = "https://app-${var.project_name}-${random_string.suffix.result}.azurewebsites.net"
    "NEXTAUTH_SECRET"                   = var.nextauth_secret
    "AUTH_MICROSOFT_ENTRA_ID_ID"        = var.ms_client_id
    "AUTH_MICROSOFT_ENTRA_ID_SECRET"    = var.ms_client_secret
    "AUTH_MICROSOFT_ENTRA_ID_TENANT_ID" = var.ms_tenant_id

    "DATABASE_URL" = "postgresql://${var.db_admin_user}:${var.db_admin_password}@${azurerm_postgresql_flexible_server.db.fqdn}:5432/${azurerm_postgresql_flexible_server_database.financehub_db.name}?sslmode=require"
  }
}