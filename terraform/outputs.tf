output "app_url" {
  value       = "https://${azurerm_linux_web_app.app.default_hostname}"
  description = "The deployed URL of Next.js app"
}

output "postgres_fqdn" {
  value       = azurerm_postgresql_flexible_server.db.fqdn
  description = "Host endpoint for the postgres instance"
}

output "nextauth_callback_url" {
  value       = "https://${azurerm_linux_web_app.app.default_hostname}/api/auth/callback/microsoft-entra-id"
  description = "URI for Microsoft Entra ID App Registration"
}