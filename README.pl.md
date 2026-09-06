# Finance Hub

**Język:** [English](README.md) · [Polski](README.pl.md)

Finance Hub to aplikacja webowa dla freelancerów i małych firm w Polsce. Umożliwia zarządzanie firmami, klientami, usługami i fakturami w jednym miejscu. Obsługuje polskie NIP-y, rozliczenia w PLN oraz automatyczne pobieranie danych firmy z białej listy VAT Ministerstwa Finansów.

## Funkcje

### Panel główny i analityka
- Globalny podgląd wszystkich firm przypisanych do konta
- Panel per firma z KPI przychodów (sprzedaż, opłacone, oczekujące)
- Wykresy przychodów (Recharts)

### Zarządzanie firmami
- Wiele profili działalności pod jednym kontem użytkownika
- Przełączanie aktywnej firmy w panelu bocznym
- Ustawianie domyślnej firmy

### Faktury
- Tworzenie i przeglądanie faktur z paginacją, wyszukiwaniem i filtrami
- Statusy: oczekująca, opłacona, częściowo opłacona, przeterminowana
- Pozycje faktury z stawkami VAT i opcjonalnym powiązaniem z katalogiem usług
- Eksport pojedynczej faktury do PDF
- Eksport CSV z filtrami (rok, miesiąc, status)
- Śledzenie płatności (przelew, gotówka, karta, inne)

### Klienci
- Baza klientów przypisana do firmy
- Automatyczne uzupełnianie danych po NIP z [API białej listy MF](https://wl-api.mf.gov.pl/)

### Katalog usług
- Wielokrotnego użytku usługi z ceną netto i stawką VAT
- Dodawanie pozycji z katalogu bezpośrednio na fakturę

### Uwierzytelnianie
- Rejestracja i logowanie e-mailem oraz hasłem
- Logowanie przez Microsoft Entra ID (Azure AD)
- Kontrola dostępu do panelu na podstawie sesji

## Stos technologiczny

| Warstwa | Technologia |
| --- | --- |
| Framework | [Next.js 16](https://nextjs.org) (App Router, Server Actions) |
| UI | [React 19](https://react.dev), [Tailwind CSS 4](https://tailwindcss.com), ikony [Lucide](https://lucide.dev) |
| Język | [TypeScript](https://www.typescriptlang.org) |
| Baza danych | [PostgreSQL](https://www.postgresql.org) przez [Prisma 7](https://www.prisma.io) |
| Auth | [NextAuth.js v5](https://authjs.dev) (Credentials + Microsoft Entra ID) |
| Walidacja | [Zod](https://zod.dev), [React Hook Form](https://react-hook-form.com) |
| Wykresy | [Recharts](https://recharts.org) |
| PDF | [jsPDF](https://github.com/parallax/jsPDF), html2canvas-pro |
| Testy | [Vitest](https://vitest.dev) |
| Infrastruktura | [Terraform](https://www.terraform.io) na Azure |
| CI/CD | GitHub Actions |

## Architektura

Projekt ma warstwową strukturę:

```
src/
├── app/           # Trasy Next.js, strony i Server Actions
├── components/    # Komponenty UI
├── services/      # Logika biznesowa
├── repositories/  # Dostęp do bazy (Prisma)
├── schemas/       # Schematy walidacji Zod
├── hooks/         # Hooki po stronie klienta
└── utils/         # Funkcje pomocnicze
```

## Uruchomienie lokalne

### Wymagania

- Node.js 20+
- Baza PostgreSQL
- (Opcjonalnie) Rejestracja aplikacji Microsoft Entra ID dla OAuth

### Instalacja

```bash
git clone <url-repozytorium>
cd finance-hub
npm ci
```

### Zmienne środowiskowe

Utwórz plik `.env` w katalogu głównym projektu:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require"
NEXTAUTH_SECRET="twoj-sekretny-klucz"
NEXTAUTH_URL="http://localhost:3000"

# Opcjonalnie — logowanie Microsoft Entra ID
AUTH_MICROSOFT_ENTRA_ID="twoj-client-id"
AUTH_MICROSOFT_ENTRA_ID_SECRET="twoj-client-secret"
AUTH_MICROSOFT_ENTRA_ID_TENANT_ID="twoj-tenant-id"
```

### Konfiguracja bazy danych

```bash
npx prisma generate
npx prisma db push
```

### Tryb deweloperski

```bash
npm run dev
```

Otwórz [http://localhost:3000](http://localhost:3000).

### Pozostałe komendy

| Komenda | Opis |
| --- | --- |
| `npm run build` | Build produkcyjny |
| `npm run start` | Uruchomienie serwera produkcyjnego |
| `npm run lint` | ESLint |
| `npm run test` | Testy jednostkowe (Vitest) |
| `npm run test:ui` | Testy z interfejsem Vitest UI |

## Wdrożenie

Aplikacja jest skonfigurowana do wdrożenia standalone (`output: 'standalone'`) i publikowana na **Azure App Service** przez GitHub Actions.

Infrastruktura (grupa zasobów Azure, PostgreSQL Flexible Server, App Service Plan, Linux Web App) jest zarządzana przez Terraform w katalogu `terraform/`.

### Workflow GitHub Actions

- **CI/CD Pipeline** (`.github/workflows/ci.yml`) — typecheck, testy, build, deploy na Azure po pushu na `main`
- **Terraform Infrastructure** (`.github/workflows/terraform.yml`) — plan i apply zmian infrastruktury

## Struktura projektu

```
finance-hub/
├── prisma/              # Schemat bazy i migracje
├── terraform/           # Infrastruktura Azure (IaC)
├── src/
│   ├── app/             # Next.js App Router
│   ├── components/
│   ├── services/
│   └── ...
└── .github/workflows/   # Pipeline CI/CD
```

