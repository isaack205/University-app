// Imports
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeftCircleIcon,
  EyeIcon,
  DatabaseIcon,
  ServerIcon,
  ClockIcon,
  UserCogIcon,
  ShieldCheckIcon,
  ChevronDownIcon,
  MailIcon,
  PhoneIcon,
} from "lucide-react";
import { Link } from "react-router-dom";

const sections = [
  {
    id: "what-we-collect",
    icon: DatabaseIcon,
    color: "from-blue-500 to-indigo-600",
    borderColor: "border-blue-200 dark:border-blue-800",
    bgColor: "bg-blue-50 dark:bg-blue-900/10",
    title: "1. What Personal Data We Collect",
    items: [
      {
        label: "Account Data",
        desc: "Full name, email address, phone number, student registration ID, hashed password, and your assigned course and cohort.",
      },
      {
        label: "Authentication Data",
        desc: "If you use Google Sign-In, we receive your Google profile name, email, and a Google-issued ID token. We do not receive or store your Google password.",
      },
      {
        label: "Notification Subscription Data",
        desc: "When you enable browser push notifications, we store your browser's push subscription endpoint and cryptographic keys (p256dh and auth) to deliver alerts to your specific device.",
      },
      {
        label: "Activity & Security Logs",
        desc: "We log your IP address, browser type (User-Agent), and specific actions (e.g., logins, password resets) for security and fraud monitoring. These logs are automatically deleted after 90 days.",
      },
      {
        label: "User-Generated Content",
        desc: "Files you upload (lecture notes, assignments, CAT documents), assignment completion records, and feedback messages you submit.",
      },
      {
        label: "Preference Data",
        desc: "Your notification preferences (email on/off, SMS on/off, push on/off), appearance settings (dark mode), and last login time.",
      },
    ],
  },
  {
    id: "how-we-use",
    icon: EyeIcon,
    color: "from-emerald-500 to-teal-600",
    borderColor: "border-emerald-200 dark:border-emerald-800",
    bgColor: "bg-emerald-50 dark:bg-emerald-900/10",
    title: "2. How We Use Your Data",
    items: [
      { label: "Account Authentication", desc: "To verify your identity when you log in and manage your session securely using JWT tokens." },
      { label: "Academic Notifications", desc: "To send you email alerts, SMS messages, and browser push notifications about CAT dates, schedule changes, assignment deadlines, and emergency overrides for your cohort." },
      { label: "Role-Based Access", desc: "To determine which features and data you can access based on your role (student, class rep, or admin)." },
      { label: "File Delivery", desc: "To store and serve academic files (notes, assignments, CAT papers) uploaded for your cohort." },
      { label: "Security Monitoring", desc: "To detect and respond to suspicious activity, unauthorized access attempts, and abuse of the platform." },
      { label: "Platform Improvement", desc: "To understand how the platform is used (e.g., common errors, feature usage) and improve its quality." },
    ],
  },
  {
    id: "third-parties",
    icon: ServerIcon,
    color: "from-violet-500 to-purple-600",
    borderColor: "border-violet-200 dark:border-violet-800",
    bgColor: "bg-violet-50 dark:bg-violet-900/10",
    title: "3. Third-Party Services We Use",
    items: [
      {
        label: "Africa's Talking (SMS)",
        desc: "Your phone number is transmitted to Africa's Talking, a Kenyan-based SMS aggregator, solely to deliver SMS notifications you have opted into. Africa's Talking processes your phone number under their own privacy policy. We only share your number when you have SMS notifications enabled.",
      },
      {
        label: "Cloudinary (File Storage)",
        desc: "Files you upload are stored on Cloudinary's cloud servers. By uploading a file, you consent to it being transmitted to Cloudinary. Cloudinary processes this data under their own privacy policy. We use Cloudinary's secure URLs to serve files.",
      },
      {
        label: "Google OAuth (Sign-In)",
        desc: "If you choose to log in with Google, Google processes your authentication. We receive a limited profile (name, email, Google ID) to create or match your account. Google's data handling is governed by Google's Privacy Policy.",
      },
      {
        label: "MongoDB Atlas (Database)",
        desc: "Your account data, academic records, and preferences are stored in a MongoDB Atlas cloud database hosted on secure cloud infrastructure. MongoDB Atlas complies with international cloud security standards.",
      },
      {
        label: "GitHub Actions & Cloudflare R2 (Backups)",
        desc: "Automated daily database backups are stored as encrypted archives on GitHub Actions Artifacts (retained 30 days) and Cloudflare R2 object storage for disaster recovery purposes.",
      },
    ],
  },
  {
    id: "retention",
    icon: ClockIcon,
    color: "from-amber-500 to-orange-500",
    borderColor: "border-amber-200 dark:border-amber-800",
    bgColor: "bg-amber-50 dark:bg-amber-900/10",
    title: "4. Data Retention",
    items: [
      { label: "Account Data", desc: "Retained for as long as your account is active. You may delete your account at any time via Settings → Security → Delete Account, which permanently removes your personal data from our systems." },
      { label: "Security Audit Logs", desc: "Automatically and permanently deleted after 90 days. This is enforced at the database level and cannot be overridden." },
      { label: "Notification Subscriptions", desc: "Retained while your account is active and push notifications are enabled. Deleted automatically when you unsubscribe or delete your account." },
      { label: "Uploaded Files", desc: "Retained until deleted by a class rep, admin, or you (if you are the uploader). After account deletion, file records in our database are removed, though Cloudinary may retain the raw file for up to 30 days per their own retention policy." },
      { label: "Backup Copies", desc: "Database backups are retained for 30 days on GitHub and indefinitely on Cloudflare R2. These are encrypted and inaccessible to anyone except authorized administrators." },
    ],
  },
  {
    id: "your-rights",
    icon: UserCogIcon,
    color: "from-sky-500 to-cyan-600",
    borderColor: "border-sky-200 dark:border-sky-800",
    bgColor: "bg-sky-50 dark:bg-sky-900/10",
    title: "5. Your Rights (Kenya Data Protection Act, 2019)",
    items: [
      { label: "Right of Access", desc: "You can export a copy of your personal account data at any time from Settings → Data & Support → Export Account Data." },
      { label: "Right to Rectification", desc: "You can update your name, phone number, and email address via your profile settings at any time." },
      { label: "Right to Erasure", desc: "You can permanently delete your account and all associated personal data from Settings → Security → Delete Account." },
      { label: "Right to Opt Out", desc: "You can disable email notifications, push notifications, and SMS reminders at any time from Settings → Notifications." },
      { label: "Right to Object", desc: "You may contact us at support@campushubapp.co.ke to object to specific processing of your data. We will respond within 30 days." },
    ],
  },
  {
    id: "security",
    icon: ShieldCheckIcon,
    color: "from-slate-600 to-slate-800",
    borderColor: "border-slate-200 dark:border-slate-700",
    bgColor: "bg-slate-50 dark:bg-slate-800/30",
    title: "6. Security Measures",
    items: [
      { label: "Password Hashing", desc: "All passwords are hashed using bcrypt before storage. We never store, log, or transmit plain-text passwords." },
      { label: "JWT Session Tokens", desc: "Authentication is managed via signed JWT tokens with expiration. Tokens are validated on every protected request." },
      { label: "HTTPS Only", desc: "All data transmitted between your browser and CampusHub is encrypted using HTTPS/TLS." },
      { label: "VAPID Keys", desc: "Browser push subscriptions use VAPID (Voluntary Application Server Identification) keys to ensure only CampusHub can send push notifications to subscribed browsers." },
      { label: "No Third-Party Tracking", desc: "We do not use Google Analytics, Facebook Pixel, or any third-party tracking/advertising SDKs on this platform." },
    ],
  },
];

export default function PrivacyPage() {
  const navigate = useNavigate();
  const [expandedSection, setExpandedSection] = useState(null);

  const toggle = (id) => setExpandedSection(expandedSection === id ? null : id);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">

      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-700 via-blue-800 to-indigo-800 text-white">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-blue-400/20 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-indigo-400/15 blur-3xl" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 mb-6 text-blue-200 hover:text-white transition-colors bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm w-fit cursor-pointer text-sm font-medium"
          >
            <ArrowLeftCircleIcon className="w-5 h-5" />
            Back
          </button>

          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="h-16 w-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
              <ShieldCheckIcon className="w-9 h-9 text-blue-300" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
                Privacy Policy
              </h1>
              <p className="text-blue-300 text-sm sm:text-base font-medium mt-2">
                Last updated: September 2026 &nbsp;·&nbsp; Governed by the Kenya Data Protection Act, 2019
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Intro */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium shadow-sm">
          This Privacy Policy explains how CampusHub collects, uses, shares, and protects your personal information when you use our platform. CampusHub is an independent, student-built platform and is not officially affiliated with any university. By using CampusHub you agree to the practices described in this policy. Please also read our{" "}
          <Link to="/terms" className="text-blue-600 dark:text-blue-400 font-bold hover:underline">Terms & Conditions</Link>.
        </div>
      </div>

      {/* Accordion Sections */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-4">
        {sections.map((section) => {
          const Icon = section.icon;
          const isOpen = expandedSection === section.id;

          return (
            <div
              key={section.id}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm bg-white dark:bg-slate-900"
            >
              <button
                onClick={() => toggle(section.id)}
                className="w-full flex items-center justify-between gap-4 p-5 sm:p-6 text-left cursor-pointer group"
              >
                <div className="flex items-center gap-4">
                  <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${section.color} flex items-center justify-center shrink-0 shadow-md`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {section.title}
                  </span>
                </div>
                <div className={`bg-slate-100 dark:bg-slate-800 p-2 rounded-full shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}>
                  <ChevronDownIcon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                </div>
              </button>

              {isOpen && (
                <div className={`px-5 sm:px-6 pb-6 pt-1 border-t ${section.borderColor} ${section.bgColor}`}>
                  <dl className="space-y-4 mt-4">
                    {section.items.map((item, i) => (
                      <div key={i} className="flex gap-3">
                        <span className="mt-1 h-2 w-2 rounded-full bg-slate-400 dark:bg-slate-500 shrink-0" />
                        <div>
                          <dt className="text-sm font-bold text-slate-800 dark:text-slate-200">{item.label}</dt>
                          <dd className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mt-0.5">{item.desc}</dd>
                        </div>
                      </div>
                    ))}
                  </dl>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Contact Footer */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-200 dark:border-indigo-900/40 rounded-2xl p-6 space-y-4">
          <h3 className="font-black text-slate-900 dark:text-slate-100">Contact the Data Controller</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
            For any privacy-related questions, data access requests, or complaints, please reach us at:
          </p>
          <div className="flex flex-col sm:flex-row gap-4 text-sm font-bold">
            <a href="mailto:support@campushubapp.co.ke" className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline">
              <MailIcon className="w-4 h-4" /> support@campushubapp.co.ke
            </a>
            <a href="tel:+254742328330" className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline">
              <PhoneIcon className="w-4 h-4" /> +254 742 328 330
            </a>
          </div>
          <div className="flex items-center gap-4 text-xs font-bold text-slate-500 pt-2 border-t border-indigo-200 dark:border-indigo-800">
            <Link to="/terms" className="text-blue-600 dark:text-blue-400 hover:underline">Terms & Conditions</Link>
            <span>·</span>
            <Link to="/help" className="text-blue-600 dark:text-blue-400 hover:underline">Help Center</Link>
            <span>·</span>
            <Link to="/" className="text-blue-600 dark:text-blue-400 hover:underline">Home</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
