# GameVault — Digital Products Storefront

Custom digital game keys, subscriptions, gift cards, and software license storefront with **ElectronicFirst Worldwide** catalog extraction, **Manual Payments** (default), **PayPal International Checkout**, and **Rapid Gateway PKR** (JazzCash, Easypaisa, Raast, Bank, Card).

Designed to run smoothly on **Windows 10/11**, **macOS**, and **Linux** in **Kimi Code Desktop**, **Codex**, **VS Code**, or standard Node.js terminals.

---

## 1. Quick Start (Windows / Kimi Code Desktop / Codex)

### Prerequisites
- **Node.js 20+** (LTS recommended)
- **npm 10+**

### Install & Run
```bash
npm install
copy .env.example .env   # On Windows CMD (or cp .env.example .env in PowerShell/Bash)
npm run dev
```
Open `http://localhost:3000`.

### Production Build
```bash
npm run build
npm run start
```

---

## 2. Environment Variables (`.env`)

All credentials live strictly server-side in `.env` (never exposed to browser JS):

| Variable | Purpose |
| :--- | :--- |
| `PORT` | Express + Vite server port (default `3000`) |
| `APP_URL` | Public origin for PayPal return URLs & links |
| `USD_TO_PKR_RATE` | Conversion rate for local PKR totals (default `278.5`) |
| `ELECTRONICFIRST_API_KEY` | ElectronicFirst Partner API Bearer token |
| `ELECTRONICFIRST_API_BASE` | Partner API base URL (`https://www.electronicfirst.com/partners/api/v1`) |
| `PAYPAL_ENV` | `sandbox` or `live` |
| `PAYPAL_CLIENT_ID` | PayPal REST API v2 Client ID |
| `PAYPAL_CLIENT_SECRET` | PayPal REST API v2 Secret |
| `RAPID_ENV` | `TEST` or `LIVE` |
| `RAPID_BASE_URL` | `https://secure.rapid-gateway.com` |
| `RAPID_MERCHANT_ID` | Rapid Gateway Merchant ID |
| `RAPID_CLIENT_ID` | Rapid Gateway OAuth2 Client ID |
| `RAPID_CLIENT_SECRET` | Rapid Gateway OAuth2 Client Secret |
| `RAPID_SIGNING_SALT` | HMAC-SHA256 webhook verification salt |

---

## 3. Architecture & Endpoints

- **ElectronicFirst Partner API v1**:
  - `GET /api/electronicfirst/products` — Returns Worldwide digital catalog
  - `POST /api/electronicfirst/sync` — Live sync against `GET /partners/api/v1/products` & `/balance`
- **Manual Payment Rail (Default)**:
  - `POST /api/orders/manual` — Creates `PENDING_VERIFICATION` order with TID/IBAN reference
  - `POST /api/orders/:orderId/approve-manual` — Merchant confirmation & instant key release
- **PayPal International (REST v2)**:
  - `POST /api/paypal/create-order` — Server-side OAuth2 + order creation (`USD`)
  - `POST /api/paypal/capture-order` — Captures approved PayPal order & fulfills keys
- **Rapid Gateway Local PKR**:
  - `POST /api/rapid/create-session` — OAuth2 token + `POST /v1/checkout-sessions` (`PKR`)
  - `GET /api/rapid/verify-session/:sessionId` — Authoritative server-side status check
  - `POST /api/webhooks/rapid` — Timing-safe HMAC-SHA256 signed webhook receiver
