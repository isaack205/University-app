# 💻 CampusHub — Frontend Client Application

The frontend client for CampusHub is a high-performance Single Page Application (SPA) built with **React 18**, **Vite**, **Tailwind CSS**, and **Lucide Icons**.

---

## 📁 Directory Structure

```
client/
├── public/
│   ├── update-config.json     # PWA / Service Worker version update config
│   └── favicon.ico
├── src/
│   ├── assets/                # Logos & static images
│   ├── components/            # Reusable UI components
│   │   ├── common/            # Banners, loaders, update alerts
│   │   ├── layout/            # Navbar, Sidebar, Footer
│   │   ├── modals/            # CAT, Assignment, and Schedule modals
│   │   └── ui/                # Buttons, inputs, badges
│   ├── contexts/              # Global React Contexts
│   │   ├── authContext.jsx    # User authentication & JWT session state
│   │   └── updateContext.jsx  # PWA live update banner & Service Worker nudges
│   ├── lib/                   # Utility helpers (Axios instances)
│   ├── pages/                 # Full view application pages
│   │   ├── assignmentPage.jsx # Assignment tracking & file submission
│   │   ├── catPage.jsx        # CAT manager & rescheduled test alerts
│   │   ├── filePages.jsx      # Learning materials & document download
│   │   ├── home.jsx           # Student / Lecturer main dashboard
│   │   ├── landingPage.jsx    # Product landing page & feature highlights
│   │   ├── lecturerPage.jsx   # Lecturer management portal
│   │   ├── loginPage.jsx      # User login & Google SSO
│   │   ├── notificationPage.jsx # In-app notification bell history
│   │   ├── profilePage.jsx    # User profile & preferences
│   │   ├── registerPage.jsx   # User registration
│   │   ├── schedulePage.jsx   # Timetable & emergency overrides
│   │   └── settingsPage.jsx   # App preferences & notification settings
│   ├── services/              # API caller modules
│   │   ├── api.js             # Base Axios instance with JWT interceptors
│   │   ├── authApi.js         # Authentication API calls
│   │   └── pushService.js     # Web Push subscription helper
│   ├── utils/                 # General utility scripts
│   ├── App.jsx                # Main React router & layout root
│   ├── main.jsx               # App entry point
│   └── sw.js                  # Service Worker for push notifications & updates
├── .env.example               # Frontend environment variables template
├── tailwind.config.js         # Tailwind styling configuration
└── vite.config.js             # Vite build & PWA proxy setup
```

---

## 🔑 Environment Variables

Create a `.env` file in the `client/` directory using [.env.example](.env.example):

```env
# API Base URL
VITE_API_BASE_URL=http://localhost:5000/api

# Google SSO Client ID
VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com

# WebPush VAPID Public Key
VITE_VAPID_PUBLIC_KEY=your_vapid_public_key
```

---

## ⚡ Global React Contexts

### 1. `AuthContext` ([authContext.jsx](src/contexts/authContext.jsx))
Manages global user authentication state, JWT storage in `localStorage`, user role decoding (`student`, `lecturer`, `admin`), and Google SSO login flows.

### 2. `UpdateContext` ([updateContext.jsx](src/contexts/updateContext.jsx))
Monitors application version updates via Service Worker listeners. Displays a non-intrusive **Update Banner** or **Refresh Nudge** when a new build/deployment is available, ensuring users always run the latest version.

---

## 📱 Service Worker & Web Push Notifications

CampusHub includes a dedicated Service Worker ([src/sw.js](src/sw.js)) that handles:
* **Background Web Push Notifications**: Receives and displays push alerts for rescheduled CATs or assignment deadlines even when the browser tab is closed.
* **Notification Clicks**: Opens the relevant application page (`/cats` or `/schedule`) when a user clicks a push notification.

---

## 🛠️ Development & Build Commands

```bash
# Install dependencies
npm install

# Start local development server with HMR
npm run dev
# Running at http://localhost:5173

# Type-check and build for production
npm run build

# Preview production build locally
npm run preview

# Run ESLint check
npm run lint
```
