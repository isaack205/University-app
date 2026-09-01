# CampusHub — Coding Signature & Style Guide

This document captures the actual conventions used throughout this repo (product name **"CampusHub"**, folder name `University-app`). It exists so that any AI assistant doing a revamp, refactor, or feature addition **matches the existing signature** instead of introducing a different style. When in doubt, mimic what's already here over "best practice" defaults.

Monorepo layout: `client/` (React SPA) + `server/` (Node/Express API). No shared root `package.json`, no CI config, no Docker. Package manager is **pnpm** in both packages.

---

## 1. Stack

**Client** (`client/package.json`, `campushub`):
- React 19 + Vite 7 (`@vitejs/plugin-react`) — not CRA
- Routing: `react-router-dom` v7
- Styling: **Tailwind CSS v4** (CSS-first config via `@tailwindcss/vite`, no PostCSS file)
- Component base: **shadcn/ui** ("new-york" style, "neutral" base color) built on `radix-ui`, `class-variance-authority`, `clsx`, `tailwind-merge`
- Icons: `lucide-react` (default), `react-icons` (rare exception)
- Animation: `framer-motion` / `motion`,,,partially used not commonly, but present in some flourish components
- Charts: `recharts`
- HTTP: `axios`
- Toasts: `sonner`
- Dates: `dayjs`
- Dark mode: `next-themes`
- PWA: `vite-plugin-pwa` + custom `src/sw.js` (this app is a PWA with push notifications)
- **Plain JavaScript / JSX — no TypeScript anywhere.** Path alias `@/*` → `./src/*` via `jsconfig.json`.
- No PropTypes, no Prettier config.

**Server** (`server/package.json`, `server`):
- **Express 5** + **Mongoose 8** (MongoDB)
- Auth: `jsonwebtoken`, `bcryptjs`
- Middleware: `helmet`, `cors`, `morgan`, `express-validator`
- Uploads: `multer` + `cloudinary`
- Comms: `nodemailer`, `mailgun.js`, `africastalking` (SMS — East Africa focus), `web-push`
- Scheduling: `node-cron`
- **CommonJS** (`require`/`module.exports`) — note this differs from the client's ESM.
- No tests configured, no TypeScript.

---

## 2. Icons

Default to **`lucide-react`**. Import individual icons by name, always suffixed `...Icon`:

```js
import { KeyRoundIcon, EyeOffIcon, MailIcon, LoaderIcon } from 'lucide-react';
```

`react-icons` (specifically `react-icons/fa`) is used only in one legacy spot (`metricCard.jsx`) — don't introduce it in new code, prefer lucide equivalents.

`components.json` declares `"iconLibrary": "lucide"` explicitly — respect that when generating/adding shadcn components.

---

## 3. UI Components / "Templates"

- Base system is **shadcn/ui**, generated into `client/src/components/ui/` (button, card, dialog, dropdown-menu, input, select, sidebar, table, tabs, badge, chart, sonner, etc.). Add new primitives via the shadcn CLI in the same style rather than hand-rolling Radix wrappers.
- Layered on top: a small set of **Aceternity-UI-style flourish components** (`background-gradient.jsx`, `card-stack.jsx`, `colourful-text.jsx`, `text-generate-effect.jsx`) — gradient/motion-heavy components built with `framer-motion` over shadcn primitives. Use this pattern (not a new animation library) for "flashy" UI moments.
- No Bootstrap, MUI, Chakra, Ant Design, or DaisyUI. Don't introduce another component library — extend shadcn/Aceternity patterns.
- Feature/page components are hand-composed from shadcn primitives + raw Tailwind utility divs, not from a page-template kit. There is no documented external template/Figma source — the "design system" is whatever shadcn's new-york/neutral preset + oklch theme tokens produce.

---

## 4. CSS Approach

- **Tailwind utility classes directly in JSX** is the dominant (near-exclusive) pattern. Expect long `className="..."` strings on components, including template-literal conditional classes:
  ```jsx
  className={`pl-10 text-black border ${studentIdError || error ? 'border-red-700 shadow-md shadow-red-400' : 'border-black shadow-xl'}`}
  ```
- Theme tokens live in `client/src/index.css` as **oklch CSS custom properties** under `@theme inline { ... }` (`--background`, `--primary`, `--chart-1..5`, `--sidebar-*`), following the shadcn "new-york" preset. `tailwind.config.js` has an empty `theme.extend` — there is no bespoke brand palette, dark mode is `class`-based (`.dark`) via `next-themes`.
- No CSS modules, no styled-components, no SCSS/SASS, no BEM naming.
- `client/src/App.css` still has unmodified Vite/CRA boilerplate (`.logo`, `.read-the-docs`) — this is dead cruft, not a pattern to replicate; feel free to clean it up in a revamp.
- Occasional raw Tailwind gradient utilities with literal color stops appear inline (`bg-gradient-to-b from-blue-300 via-white to-purple-400`) rather than being pulled from theme tokens — consistent with the "compose Tailwind utilities directly" style, not a mistake to "fix" by itself.

---

## 5. Folder & File Structure

Grouped **by type**, not by feature module. Preserve this shape when adding new areas.

```
client/src/
  components/
    common/                 # layout.jsx, header.jsx, footer.jsx, logoutDialog.jsx, floatingActionButtons.jsx
    dashboard/
      adminDashboard/       # adminDashboard.jsx, coursePage.jsx, cohortPage.jsx, usersPage.jsx
      classRepDashboard/    # dasboard.jsx, manageAssignments.jsx, manageCAT.jsx, manageFiles.jsx, ...
    ui/                     # shadcn primitives (kebab-case, CLI-generated)
    <flat feature components>.jsx
  contexts/                 # authContext.jsx, themeContext.jsx
  lib/utils.js               # cn() helper
  pages/                     # one file per route
  services/                  # one API-client module per resource
  utils/                      # pushManager.js
  sw.js                       # service worker

server/
  config/          # db.js, cloudinaryConfig.js, smsConfig.js, webPush.js
  controllers/     # <name>Controller.js
  middlewares/     # auth.js, customLogger.js, userValidation.js
  models/          # singular Mongoose schema per file: user.js, course.js, lecturer.js
  routes/          # <name>Routes.js
  services/        # notificationScheduler.js, notificationService.js, smsService.js, ...
  utils/           # sendEmail.js
```

**Naming conventions:**
- Component/page files: **camelCase** (`loginPage.jsx`, `adminDashboard.jsx`), even though the exported component itself is PascalCase (`export default function LoginPage()`). This is a deliberate deviation from typical React file-naming — keep it consistent, don't switch files to PascalCase mid-revamp.
- `components/ui/` files: kebab-case (shadcn CLI convention) — leave these as the CLI generates them.
- Backend files: camelCase; models are singular nouns; controllers/routes use `<name>Controller.js` / `<name>Routes.js` suffixes.
- Folders: camelCase.
- **Known baked-in typos that are part of the existing signature** — don't silently "fix" these without discussing it, since renaming breaks imports across the codebase: `assignement` (used throughout instead of "assignment" — `assignementController.js`, `assignement.js` model, `assignememntRoutes.js`), and `dasboard.jsx` (classRepDashboard's dashboard file). If a revamp includes a deliberate rename pass, do it as one dedicated commit touching all references.

---

## 6. Code Structure & Patterns

**Frontend:**
- 100% functional components + hooks. No class components.
- Global state: **React Context API only** (`authContext.jsx`, `themeContext.jsx`) — no Redux/Zustand/Jotai. Follow the existing `useAuth()`-style hook pattern for any new context.
- API calls: **axios only**, through one central client `client/src/services/api.js` (baseURL from `import.meta.env.VITE_API_BASE_URL`, request interceptor attaches Bearer token from `localStorage`, response interceptor logs errors). Each resource gets its own service object in `services/`, methods following this exact template:
  ```js
  registerUser: async (userData) => {
      try {
          const res = await API.post('/auth/register', userData);
          return res.data;
      } catch (error) {
          console.error('Error registering user:', error.response?.data || error.message);
          throw error;
      }
  },
  ```
- Standard client-side error-message fallback chain: `error.response?.data?.message || error.message || '<fallback string>'`.
- `async/await` everywhere; avoid `.then` chains (only exception historically is DB connect in `server.js`).
- A short `// Imports` banner comment sits above the import block in most files — replicate this. Comments are otherwise light: single-line intent notes before logic blocks, no JSDoc blocks.
- Exports: **default export** for components/pages, **named exports** (`export const xService = {...}`) for services/utils/contexts.
- No PropTypes, no TypeScript — plain runtime JS.
- Tone: user-facing strings and even some console logs/push notifications use **emoji liberally** (`"🔔 Notifications successfully enabled!"`, `"📊 Admin Overview"`, `"⏰ Reminder! The clock's ticking! ... 🚀"`). Keep this playful tone in new user-facing copy and dev logs.

**Backend:**
- Controllers follow this near-universal template:
  ```js
  exports.someAction = async (req, res) => {
      try {
          // ...
          res.status(200).json({ message: '...' });
      } catch (err) {
          res.status(500).json({ message: '...', error: err.message });
      }
  };
  ```
- JSON response shape is always `{ message: '...' }` (success) or `{ message: '...', error: err.message }` (failure).
- Role checks are done **both** via route middleware (`protect`, `authorize([...roles])` from `middlewares/auth.js`) **and** again inline in controllers (`if (req.user.role !== 'classRep') ...`) — belt-and-suspenders, keep both layers for new endpoints rather than relying on just one.
- Mongoose models: flat schemas, `{ timestamps: true }`, `enum` for role/status fields, `ref` for relations.
- Soft-delete via an `isDeleted` boolean + `toggleDeleted` controller is preferred over hard deletes for user-facing resources.
- `node-cron` powers scheduled jobs in `services/notificationScheduler.js` (hourly assignment reminders, 15-min class reminders) — follow this pattern for new scheduled work rather than an external job queue.
- `server.js` disables `console.*` in production via monkey-patching at the top of the file, and builds CORS `allowedOrigins` from a comma-separated env var.

---

## 7. Environment & Config

- Separate `.env` per package: `client/.env` (`VITE_API_BASE_URL`, `VITE_VAPID_PUBLIC_KEY`), `server/.env` (`MONGO_URI`, `JWT_SECRET`, `ALLOWED_ORIGINS`, `FRONTEND_URL`, Cloudinary/Mailgun/SMTP/Africa's Talking/VAPID keys).
- ESLint: flat config (`client/eslint.config.js`), `js.configs.recommended` + `react-hooks` + `react-refresh`, with `no-unused-vars` downgraded to `"warn"`.
- No Prettier config — formatting is whatever the editor does; don't impose a new formatter/style pass without asking.
- No CI/CD (no `.github/workflows`). No Docker.

---

## 8. Distinctive / Domain Notes

- Integrations: Cloudinary (uploads), Mailgun + Nodemailer (dual email path), Africa's Talking (SMS), Web Push (VAPID), Formspree (contact form).
- PWA-first: custom service worker, push subscription flow auto-triggers on login (`authContext.jsx` + `utils/pushManager.js`) if `user.notificationsEnabled`.
- Domain is a Kenyan/East-African university **class-rep system**: roles are `student`, `classRep`, `admin`; core entities are cohort, course, unit schedule, and **CAT** (Continuous Assessment Test) — use these exact terms, don't rename to generic "quiz"/"exam".
- Git commit style: short descriptive sentences, loosely Conventional-Commit-flavored (`feat: ...`, `chore: release vX.Y.Z`) mixed with plain narrative messages — not strict Conventional Commits. Version-bump commits track `package.json` version alongside feature work.
- App is internally called **"CampusHub"** (see `client/package.json` name, and UI copy "Welcome Back to CampusHub") even though the repo directory is `University-app`.

---

## How to use this for a revamp prompt

When asking an AI to revamp a page or feature, point it at this file and say: keep the stack (Vite/React 19, Tailwind v4, shadcn/ui, lucide-react), keep the by-type folder structure and camelCase file naming, keep the axios-service-layer + Context-API pattern, keep the emoji-flecked casual tone in UI copy, and don't introduce TypeScript, a new UI kit, or a new state manager unless explicitly asked.
