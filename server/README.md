# ⚙️ CampusHub — Backend API Server

The backend server for CampusHub is built with **Node.js**, **Express.js**, and **MongoDB (Mongoose)**. It provides a secure RESTful API powering authentication, schedule overrides, CAT management, multi-channel notifications, file distribution, and audit logs.

---

## 📁 Directory Overview

```
server/
├── config/
│   ├── db.js                 # MongoDB connection setup
│   ├── cloudinaryConfig.js   # Cloudinary SDK setup for file uploads
│   ├── smsConfig.js          # Africa's Talking SMS API configuration
│   └── webPush.js            # VAPID web push notification setup
├── controllers/              # Request handlers & core business logic
│   ├── assignmentController.js
│   ├── catController.js
│   ├── cohortController.js
│   ├── courseController.js
│   ├── fileUploadController.js
│   ├── notificationController.js
│   ├── scheduleOverrideController.js
│   ├── unitScheduleController.js
│   └── userController.js
├── middlewares/              # Security & verification middlewares
│   ├── auth.js               # JWT verification & role authorization
│   ├── optionalAuth.js       # Optional auth reader
│   └── uploadMiddleware.js   # Multer file handling middleware
├── models/                   # Mongoose Data Schemas
│   ├── assignment.js
│   ├── auditLog.js
│   ├── cat.js
│   ├── cohort.js
│   ├── course.js
│   ├── fileUpload.js
│   ├── notification.js
│   ├── scheduleOverride.js
│   ├── unit.js
│   └── user.js
├── routes/                   # Express REST API routes
├── services/                 # External service helpers (SMS, push)
└── utils/                    # Email sender (sendEmail.js)
```

---

## 🔑 Environment Variables

Create a `.env` file inside the `server/` directory using [.env.example](.env.example):

```env
# Server Configuration
PORT=5000
ALLOWED_ORIGINS=http://localhost:5173,https://yourdomain.com
FRONTEND_URL=http://localhost:5173
JWT_SECRET=your_super_secret_jwt_key

# Database
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxx.mongodb.net/university_db

# Cloudinary Storage
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_FOLDER=campus_hub_uploads

# Email Setup (SMTP)
EMAIL_FROM=no-reply@yourdomain.com
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USERNAME=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

# Africa's Talking SMS
AT_API_KEY=your_at_api_key
AT_USERNAME=sandbox

# WebPush Notifications (VAPID)
VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
```

---

## 📡 REST API Endpoint Reference

### 🔐 Authentication & Users (`/api/users`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/users/register` | Public | Register a new user account |
| `POST` | `/api/users/login` | Public | Login with email & password |
| `POST` | `/api/users/google-auth` | Public | Google SSO sign-in / registration |
| `POST` | `/api/users/forgot-password` | Public | Send password reset token email |
| `POST` | `/api/users/reset-password` | Public | Reset password using valid token |
| `GET` | `/api/users/profile` | Authenticated | Get current authenticated user details |
| `PUT` | `/api/users/profile` | Authenticated | Update user profile & notification preferences |

---

### 🚨 CAT Management (`/api/cats`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/cats` | Authenticated | Fetch CATs for the user's cohort |
| `POST` | `/api/cats` | Admin / Lecturer | Create a CAT and trigger Email/SMS/Push alerts |
| `PUT` | `/api/cats/:id` | Admin / Lecturer | Reschedule/update CAT details & alert students |
| `DELETE` | `/api/cats/:id` | Admin / Lecturer | Delete CAT record |

---

### 📅 Timetables & Overrides (`/api/unit-schedules` & `/api/schedule-overrides`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/unit-schedules` | Authenticated | Fetch regular weekly timetable |
| `POST` | `/api/unit-schedules` | Admin | Create/update unit schedules |
| `GET` | `/api/schedule-overrides` | Authenticated | Get active timetable overrides/reschedules |
| `POST` | `/api/schedule-overrides` | Admin / Lecturer | Post an emergency schedule override |

---

### 📚 Assignments (`/api/assignments`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/assignments` | Authenticated | Get active assignments for user's cohort |
| `POST` | `/api/assignments` | Admin / Lecturer | Create a new assignment with due dates |
| `POST` | `/api/assignments/:id/submit` | Student | Submit assignment file attachment |

---

### 🔔 Notifications & Subscriptions (`/api/notifications`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/notifications` | Authenticated | Fetch user's in-app notification history |
| `PUT` | `/api/notifications/:id/read` | Authenticated | Mark notification as read |
| `POST` | `/api/notifications/subscribe` | Authenticated | Register browser WebPush subscription |

---

### 📁 Uploads & Files (`/api/uploads`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/uploads` | Admin / Lecturer | Upload document/file to Cloudinary |
| `GET` | `/api/uploads` | Authenticated | List course learning materials |

---

## 🗄️ Database Schemas Overview

* **User**: Stores user account details, role (`student`, `lecturer`, `admin`), verified status, course, cohort, and notification preferences.
* **CAT**: Stores assessment title, unit code, venue, date, time, and lecturer info.
* **Assignment**: Stores assignments, due dates, instructions, attached files, and student submissions.
* **Unit / Course / Cohort**: Manages university academic hierarchy and student group assignments.
* **ScheduleOverride**: Tracks venue changes, class cancellations, or emergency time shifts.
* **Notification**: In-app notification bell logs.

---

## 🛠️ Running Server Locally

```bash
# Install dependencies
npm install

# Start in development mode (Nodemon)
npm run dev

# Start in production mode
npm start
```
