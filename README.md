# AI Automation Agency CRM

Production-ready CRM built for an AI Automation Agency with role-based access, real-time pipeline, revenue tracking, and integrations.

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS, ShadCN UI, Framer Motion, Recharts |
| Backend | Node.js, Express.js, Socket.io |
| Database | MongoDB Atlas (Mongoose ODM) |
| Auth | JWT + bcrypt + Role-Based Access Control |
| Storage | Cloudinary (proposals, contracts, assets) |

## Project Structure

```
crm/
├── backend/
│   ├── src/
│   │   ├── config/          # DB, Cloudinary, RBAC roles
│   │   ├── models/          # Mongoose schemas (8 collections)
│   │   ├── controllers/     # Business logic
│   │   ├── routes/          # Express API routes
│   │   ├── middleware/      # JWT auth, error handling
│   │   ├── services/        # Email, WhatsApp, notifications
│   │   ├── utils/           # Activity logger, AI lead scoring
│   │   ├── scripts/         # Database seed
│   │   └── server.js        # Entry point + Socket.io
│   └── .env.example
├── frontend/
│   └── src/
│       ├── app/             # Next.js App Router pages
│       ├── components/      # UI components (ShadCN)
│       ├── context/         # Auth context
│       └── lib/             # API client, utilities
└── README.md
```

## MongoDB Collections

| Collection | Purpose |
|-----------|---------|
| `users` | Team members with roles and performance stats |
| `leads` | Sales leads with AI scoring |
| `clients` | Active clients, payments, projects |
| `tasks` | Task management with priorities |
| `activities` | Audit log of all actions |
| `revenues` | Payment and revenue records |
| `notifications` | Follow-up, meeting, task reminders |
| `files` | Cloudinary file metadata |

## Roles & Permissions

| Role | Access |
|------|--------|
| **Admin** | Full access to everything |
| **Sameed** (Technical Lead) | Leads, clients, tasks, revenue, files, team |
| **Saboor** (Sales & Design) | Leads, clients, tasks, revenue, files |
| **Fatiq** (Operations) | Leads, tasks, clients (read), revenue (read) |

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas account
- Cloudinary account (optional, for file uploads)
- SMTP credentials (optional, for email)
- Twilio credentials (optional, for WhatsApp)

### 1. Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI, JWT secret, etc.
npm install
npm run seed    # Seed demo data
npm run dev     # Starts on http://localhost:5000
```

### 2. Frontend Setup

```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev     # Starts on http://localhost:3000
```

### Demo Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@agency.com | admin123 |
| Sameed | sameed@agency.com | sameed123 |
| Saboor | saboor@agency.com | saboor123 |
| Fatiq | fatiq@agency.com | fatiq123 |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login |
| GET | `/api/dashboard` | Dashboard stats |
| GET/POST | `/api/leads` | Lead CRUD |
| GET | `/api/leads/kanban` | Kanban pipeline data |
| PATCH | `/api/leads/:id/status` | Update lead status (real-time) |
| POST | `/api/leads/import` | CSV/JSON import |
| POST | `/api/leads/scrape` | Lead scraping module |
| GET/POST | `/api/clients` | Client management |
| GET/POST | `/api/tasks` | Task management |
| GET/POST | `/api/revenue` | Revenue tracking |
| GET | `/api/dashboard/team` | Team performance |
| GET | `/api/dashboard/search` | Global search |
| GET | `/api/notifications` | Notifications |
| POST | `/api/files` | Upload to Cloudinary |
| POST | `/api/leads/:id/email` | Send email to lead |
| POST | `/api/leads/:id/whatsapp` | Send WhatsApp to lead |

## Features

- **Dashboard** — KPIs, revenue charts, lead status breakdown, activity feed
- **Lead Management** — Full CRUD, filters, AI scoring, import/export
- **Kanban Pipeline** — Drag-and-drop with Socket.io real-time sync
- **Client Management** — Retainers, payments, projects
- **Task Management** — Kanban-style task board with priorities
- **Team Performance** — Per-member metrics tracking
- **Revenue Tracking** — One-time and monthly retainer payments
- **Activity Logs** — Complete audit trail
- **Notifications** — Automated follow-up, meeting, task reminders
- **File Storage** — Cloudinary integration for PDFs and assets
- **Global Search** — Search across leads, clients, tasks
- **Dark Mode** — Premium SaaS UI with theme toggle
- **Bonus**: WhatsApp, Email, AI Lead Scoring, Lead Scraping, CSV Import/Export

## Production Deployment

1. Set strong `JWT_SECRET` in production
2. Configure MongoDB Atlas IP whitelist
3. Set `FRONTEND_URL` to your production domain
4. Build frontend: `cd frontend && npm run build && npm start`
5. Run backend: `cd backend && npm start`
6. Use PM2 or similar for process management

## License

Private — AI Automation Agency
