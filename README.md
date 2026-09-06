# Finance Hub

**Language:** [English](README.md) · [Polski](README.pl.md)

Finance Hub is a web application for freelancers and small businesses in Poland to manage companies, clients, services, and invoices in one place. It supports Polish tax identifiers (NIP), PLN billing, and automatic company lookup from the Ministry of Finance VAT register.

## Features

### Dashboard & analytics
- Global overview across all your companies
- Per-company dashboard with revenue KPIs (total sales, paid, pending)
- Revenue charts powered by Recharts

### Company management
- Manage multiple business profiles under one account
- Switch active company from the sidebar
- Set a default company for quick access

### Invoices
- Create and browse invoices with pagination, search, and filters
- Invoice statuses: pending, paid, partially paid, overdue
- Line items with VAT rates and optional link to service catalog
- PDF export for individual invoices
- CSV export with filters (year, month, status)
- Payment tracking with multiple payment methods (transfer, cash, card, other)

### Clients
- Client directory per company
- Auto-fill company data by NIP using the [Ministry of Finance white list API](https://wl-api.mf.gov.pl/)

### Service catalog
- Reusable services with net price and VAT rate
- Add catalog items directly to invoice line items

### Authentication
- Email and password registration/login
- Microsoft Entra ID (Azure AD) OAuth sign-in
- Session-based access control for all dashboard routes

## Tech stack

| Layer | Technology |
| --- | --- |
| Framework | [Next.js 16](https://nextjs.org) (App Router, Server Actions) |
| UI | [React 19](https://react.dev), [Tailwind CSS 4](https://tailwindcss.com), [Lucide](https://lucide.dev) icons |
| Language | [TypeScript](https://www.typescriptlang.org) |
| Database | [PostgreSQL](https://www.postgresql.org) via [Prisma 7](https://www.prisma.io) |
| Auth | [NextAuth.js v5](https://authjs.dev) (Credentials + Microsoft Entra ID) |
| Validation | [Zod](https://zod.dev), [React Hook Form](https://react-hook-form.com) |
| Charts | [Recharts](https://recharts.org) |
| PDF | [jsPDF](https://github.com/parallax/jsPDF), html2canvas-pro |
| Testing | [Vitest](https://vitest.dev) |
| Infrastructure | [Terraform](https://www.terraform.io) on Azure |
| CI/CD | GitHub Actions |

## Architecture

The codebase follows a layered structure:

```
src/
├── app/           # Next.js routes, pages, and Server Actions
├── components/    # UI components
├── services/      # Business logic
├── repositories/  # Database access (Prisma)
├── schemas/       # Zod validation schemas
├── hooks/         # Client-side hooks
└── utils/         # Shared helpers
```

## Getting started

### Prerequisites

- Node.js 20+
- PostgreSQL database
- (Optional) Microsoft Entra ID app registration for OAuth

### Installation

```bash
git clone <repository-url>
cd finance-hub
npm ci
```

### Environment variables

Create a `.env` file in the project root:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Optional — Microsoft Entra ID OAuth
AUTH_MICROSOFT_ENTRA_ID="your-client-id"
AUTH_MICROSOFT_ENTRA_ID_SECRET="your-client-secret"
AUTH_MICROSOFT_ENTRA_ID_TENANT_ID="your-tenant-id"
```

### Database setup

```bash
npx prisma generate
npx prisma db push
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Other scripts

| Command | Description |
| --- | --- |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run test` | Run Vitest unit tests |
| `npm run test:ui` | Run tests with Vitest UI |

## Deployment

The app is configured for standalone output (`output: 'standalone'`) and deployed to **Azure App Service** via GitHub Actions.

Infrastructure (Azure Resource Group, PostgreSQL Flexible Server, App Service Plan, Linux Web App) is managed with Terraform in the `terraform/` directory.

### Workflows

- **CI/CD Pipeline** (`.github/workflows/ci.yml`) — typecheck, tests, build, deploy to Azure on push to `main`
- **Terraform Infrastructure** (`.github/workflows/terraform.yml`) — plan and apply infrastructure changes

## Project structure

```
finance-hub/
├── prisma/              # Database schema and migrations
├── terraform/           # Azure infrastructure as code
├── src/
│   ├── app/             # Next.js App Router
│   ├── components/
│   ├── services/
│   └── ...
└── .github/workflows/   # CI/CD pipelines
```




