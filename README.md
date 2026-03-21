# Prasad Hospitals VIP Health Card — POC

## Quick Start

### Prerequisites
- Node.js 18+

### Setup
```bash
# Install dependencies
cd server && npm install
cd ../prasad-hospitals-app && npm install

# Seed the database
cd ../server && npm run seed

# Start both servers
cd .. && ./dev.sh
```

### Demo Credentials
| Role | Username | Password | URL |
|------|----------|----------|-----|
| Admin | `admin` | `admin123` | http://localhost:5173/admin/login |
| Reception | `reception` | `reception123` | http://localhost:5173/vip/login |

### Demo Cards
| Card ID | Branch | Status |
|---------|--------|--------|
| PH-2025-DEMO1 | Kukatpally | Active |
| PH-2025-DEMO2 | Ameerpet | Active |
| PH-2024-EXPR1 | Miyapur | Expired |

## Deployment

### Backend (Railway / Render)
1. Deploy the `server/` directory
2. Set environment variable: `JWT_SECRET=<random-string>`
3. The SQLite database is stored at `./vip.db` on the server

### Frontend (Vercel)
1. Deploy `prasad-hospitals-app/`
2. Set environment variable: `VITE_API_URL=https://your-backend-url`
