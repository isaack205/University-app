# 🎓 CampusHub — University Academic Management System

[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-green?logo=node.js)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-v18-blue?logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-v5-646CFF?logo=vite)](https://vitejs.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb)](https://www.mongodb.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v3-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**CampusHub** is a modern, full-stack university management platform designed to streamline academic scheduling, Continuous Assessment Tests (CATs), assignment submissions, learning material distribution, and real-time student alerts via **Email, SMS, and Web Push Notifications**.

---

## 🌟 Key Features

* 📅 **Dynamic Timetables & Schedule Overrides**: Real-time class schedules, lecturer tracking, venue allocations, and emergency class rescheduling.
* 🚨 **CAT & Exam Management**: Dedicated CAT manager with instant multi-channel alerts (Email, SMS, WebPush) when CATs are added or rescheduled.
* 📚 **Assignment Tracking**: Submissions, deadlines, file attachments, and automated reminders before due dates.
* 📁 **Learning Material Hub**: Secure file sharing and course document uploads backed by **Cloudinary**.
* 🔔 **Multi-Channel Notification Engine**:
  * **Email Alerts**: Styled HTML emails sent via Nodemailer.
  * **SMS Alerts**: Instant SMS notifications via **Africa's Talking**.
  * **Web Push Notifications**: Browser-level push alerts using VAPID keys.
* 🔑 **Authentication & Security**:
  * Dual auth support: Email/Password & **Google SSO**.
  * Role-Based Access Control (**RBAC**): Admin, Lecturer, and Student roles.
  * JWT authentication with optional auth middleware.
* ⚙️ **Service Worker & PWA Support**: Live update banner and silent refresh nudges when new application versions release.
* 🛡️ **Automated Disaster Recovery**: Daily automated MongoDB database dumps stored on **GitHub Actions Artifacts** and **Cloudflare R2**.

---

## 🏗️ Project Architecture

```
University-app/
├── .github/
│   └── workflows/
│       └── mongodb-backup.yml   # Daily automated database backup to GitHub & Cloudflare R2
├── client/                      # Frontend Application (React 18 + Vite + TailwindCSS)
│   ├── src/
│   │   ├── components/          # Reusable UI components & modals
│   │   ├── contexts/            # React Contexts (AuthContext, UpdateContext)
│   │   ├── pages/               # Application view pages
│   │   ├── services/            # Axios API service callers
│   │   └── utils/               # Helper utilities & push notification scripts
│   └── public/                  # Static assets & update-config.json
├── server/                      # Backend API Server (Node.js + Express + Mongoose)
│   ├── config/                  # DB, Cloudinary, WebPush, and SMS configs
│   ├── controllers/             # Business logic controllers
│   ├── middlewares/             # Auth, RBAC, and error handlers
│   ├── models/                  # Mongoose Schemas (User, CAT, Assignment, etc.)
│   ├── routes/                  # Express RESTful route handlers
│   └── utils/                   # Email & notification utilities
└── README.md                    # Main Project Documentation
```

---

## 💻 Tech Stack

| Domain | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 18, Vite | High-performance Single Page Application (SPA) |
| **Styling** | Tailwind CSS, Lucide Icons | Responsive UI & modern icons |
| **Backend** | Node.js, Express.js | Scalable RESTful API web server |
| **Database** | MongoDB Atlas, Mongoose | NoSQL Relational Object Data Modeling |
| **Cloud Storage**| Cloudinary | Image and file document storage |
| **Messaging** | Nodemailer, Africa's Talking | Multi-channel Email & SMS delivery |
| **Push Alerts** | Web-Push (VAPID) | Browser push notifications |
| **Automated CI/CD**| GitHub Actions, Cloudflare R2 | Daily automated database snapshots |

---

## 🚀 Quick Start Guide

### Prerequisites
* **Node.js** (v18.0.0 or higher)
* **npm** or **pnpm** installed
* **MongoDB Atlas** database cluster (or local MongoDB instance)

---

### 1. Backend Setup

```bash
# Navigate to the server folder
cd server

# Install dependencies
npm install

# Create environment configuration file
cp .env.example .env
```

Edit your `server/.env` file with your credentials:
```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.xxx.mongodb.net/university_db
JWT_SECRET=your_secret_key
FRONTEND_URL=http://localhost:5173
ALLOWED_ORIGINS=http://localhost:5173
```

Start the backend server:
```bash
npm run dev
# Server running at http://localhost:5000
```

---

### 2. Frontend Setup

```bash
# Open a new terminal and navigate to the client folder
cd client

# Install dependencies
npm install

# Create frontend environment configuration file
cp .env.example .env
```

Edit your `client/.env` file:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Start the frontend development server:
```bash
npm run dev
# Frontend running at http://localhost:5173
```

---

## 🛡️ Database Backup Strategy

CampusHub uses an automated **Disaster Recovery Pipeline** configured in [.github/workflows/mongodb-backup.yml](.github/workflows/mongodb-backup.yml):

* **Schedule**: Runs automatically every day at **9:00 PM EAT (18:00 UTC)**.
* **Archive Format**: Compressed `.gz` archive using `mongodump`.
* **Dual Storage**:
  1. **GitHub Artifacts**: Downloadable from GitHub Actions tab for 30 days.
  2. **Cloudflare R2**: Uploaded to Cloudflare R2 Object Storage for permanent free cloud storage.

---

## 📄 Documentation

* [Backend Server Documentation](server/README.md) — API endpoints, models, and integrations guide.
* [Frontend Client Documentation](client/README.md) — Component architecture, state management, and PWA setup.

---

## 📝 License

This project is licensed under the [MIT License](LICENSE).
