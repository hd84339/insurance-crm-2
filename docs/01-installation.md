# Installation Guide

## Prerequisites

| Tool | Version | Check |
|------|---------|-------|
| Node.js | 16+ | `node --version` |
| npm | 8+ | `npm --version` |
| MongoDB | 4.4+ | `mongosh --version` |
| Git | any | `git --version` |

---

## Step 1 – Extract the Project

```bash
tar -xzf insurance-crm-complete.tar.gz
cd insurance-crm-complete
```

---

## Step 2 – Set Up the Database

### Option A: MongoDB Atlas (Cloud — Recommended)

1. Go to https://www.mongodb.com/cloud/atlas → Sign up free
2. Create a **Free M0** cluster
3. Add a database user (Database Access → Add New User)
4. Allow all IPs (Network Access → 0.0.0.0/0) for dev
5. Click **Connect → Connect your application** → copy the URI
6. It will look like:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/insurance-crm?retryWrites=true&w=majority
   ```

### Option B: Local MongoDB

```bash
# Ubuntu / Debian
sudo apt-get install -y mongodb-org
sudo systemctl start mongod && sudo systemctl enable mongod

# macOS
brew install mongodb-community && brew services start mongodb-community

# Verify
mongosh          # should open a shell
```

---

## Step 3 – Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Open `.env` and edit:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/insurance-crm   # or Atlas URI
JWT_SECRET=replace-with-a-random-64-char-string
FRONTEND_URL=http://localhost:3000
```

Start the server:
```bash
npm run dev          # development (auto-restart)
npm start            # production
```

Load sample data (optional but recommended for first run):
```bash
npm run seed
```

**Verify:**  
Open http://localhost:5000 — you should see the API welcome JSON.  
Open http://localhost:5000/health — should return `{"success":true}`.

---

## Step 4 – Frontend Setup

```bash
cd ../frontend
npm install
cp .env.example .env
```

`.env` contents:
```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=Insurance CRM
```

Start:
```bash
npm run dev
```

Open **http://localhost:3000** in your browser.

---

## Step 5 – Verify Everything Works

1. Dashboard loads with stats
2. Go to **Employees** → you see 6 seeded employees
3. Go to **Roles** → you see 5 roles (Admin, Manager, etc.)
4. Go to **Tasks** → you see 5 sample tasks
5. Click **Transfer** on a task → fill in reason → send
6. Switch to another employee's view → see the transfer alert

---

## Default Credentials (after seeding)

| Name | Email | Password | Role |
|------|-------|----------|------|
| Arun Sharma | arun@crm.com | password123 | Admin |
| Priya Mehta | priya@crm.com | password123 | Manager |
| Vivek Kumar | vivek@crm.com | password123 | Senior Agent |
| Sneha Patel | sneha@crm.com | password123 | Agent |
| Rahul Joshi | rahul@crm.com | password123 | Agent |
| Anita Desai | anita@crm.com | password123 | Trainee |

---

## Troubleshooting

| Error | Fix |
|-------|-----|
| `Cannot connect to MongoDB` | Ensure mongod is running or Atlas URI is correct |
| `Port 5000 already in use` | `lsof -ti:5000 \| xargs kill -9` or change PORT in .env |
| `Port 3000 already in use` | Change `port: 3000` in `vite.config.js` |
| Frontend shows blank page | Check VITE_API_URL in `.env`, ensure backend is running |
| CORS errors in console | Set `FRONTEND_URL=http://localhost:3000` in backend `.env` |
| `Email already registered` | Each employee must have a unique email |
| Seed script fails | Make sure MONGODB_URI in `.env` is correct first |
