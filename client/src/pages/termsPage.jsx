// Imports
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeftCircleIcon,
  ShieldCheckIcon,
  UserIcon,
  DatabaseIcon,
  FileTextIcon,
  BellIcon,
  UsersIcon,
  BanIcon,
  LockIcon,
  AlertTriangleIcon,
  ScaleIcon,
  RefreshCwIcon,
  ChevronDownIcon,
} from "lucide-react";
import { Link } from "react-router-dom";

const sections = [
  {
    id: "disclaimer",
    icon: AlertTriangleIcon,
    color: "from-amber-500 to-orange-500",
    bgLight: "bg-amber-50 dark:bg-amber-900/10",
    borderLight: "border-amber-200 dark:border-amber-800",
    title: "1. Non-Affiliation Disclaimer",
    highlight: true,
    content: [
      "CampusHub is an independent, student-built platform developed by individual developers. It is NOT officially affiliated with, endorsed by, sponsored by, or associated with Chuka University or any other academic institution in any official capacity.",
      "CampusHub does not represent official university policy, timetables, academic records, or administration. All information published on the platform — including schedules, CAT dates, assignment details, and course materials — is user-generated content managed by student Class Representatives and may not reflect official institutional data.",
      "Users are strongly advised to verify all critical academic information (exam dates, grade records, official deadlines) through official university channels, noticeboards, and staff before acting on it.",
      "Chuka University bears no responsibility for this platform, its content, or its availability.",
    ],
  },
  {
    id: "accounts",
    icon: UserIcon,
    color: "from-blue-500 to-indigo-600",
    bgLight: "bg-blue-50 dark:bg-blue-900/10",
    borderLight: "border-blue-200 dark:border-blue-800",
    title: "2. User Accounts & Eligibility",
    content: [
      "To use CampusHub you must be a current student, class representative, or authorized administrator of the relevant academic institution, or be explicitly invited by an admin.",
      "You must provide accurate, current, and complete information during registration — including your full name, a valid email address, a phone number, and your student registration ID.",
      "You are solely responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account. Do not share your password with anyone.",
      "CampusHub reserves the right to suspend, restrict, or permanently terminate any account found to be in violation of these Terms, or for any other reason at our discretion.",
      "You must be at least 18 years of age to use this platform. By registering, you confirm you meet this requirement.",
    ],
  },
  {
    id: "data",
    icon: DatabaseIcon,
    color: "from-indigo-500 to-purple-600",
    bgLight: "bg-indigo-50 dark:bg-indigo-900/10",
    borderLight: "border-indigo-200 dark:border-indigo-800",
    title: "3. Data Collection & Usage",
    content: [
      "We collect the following personal data when you use CampusHub: your name, email address, phone number, student ID, course & cohort, IP address, and browser/device information (User-Agent) for security audit purposes.",
      "Your data is used to: authenticate your account, send academic notifications (email, SMS, browser push alerts), enable role-based features (student, class rep, admin views), and maintain security audit logs.",
      "Your phone number may be shared with Africa's Talking, a third-party SMS provider based in Kenya, solely for the purpose of delivering SMS notifications you have opted into.",
      "Files you upload are stored on Cloudinary, a third-party cloud storage service. By uploading a file, you consent to it being transmitted to and stored on Cloudinary's servers.",
      "Security audit logs (containing your IP address, device info, and actions) are automatically and permanently deleted after 90 days.",
      "We do not sell, rent, or trade your personal data to any third party for marketing purposes. Please also see our Privacy Policy for full details.",
    ],
  },
  {
    id: "files",
    icon: FileTextIcon,
    color: "from-emerald-500 to-teal-600",
    bgLight: "bg-emerald-50 dark:bg-emerald-900/10",
    borderLight: "border-emerald-200 dark:border-emerald-800",
    title: "4. File Uploads & Intellectual Property",
    content: [
      "You may only upload content that you own, have authored, or have explicit permission to share. Do not upload copyrighted textbooks, publisher-owned exam papers, or any third-party material that you do not have the right to distribute.",
      "CampusHub is not responsible for the accuracy, legality, or completeness of user-uploaded content. We are not liable for any copyright infringement caused by content uploaded by users.",
      "We reserve the right to remove any uploaded file at any time, without notice, if it is found to violate these Terms or any applicable law.",
      "Files you upload remain your intellectual property. By uploading, you grant CampusHub a limited, non-exclusive, royalty-free license to store, display, and distribute the file to members of your cohort for academic purposes only.",
    ],
  },
  {
    id: "notifications",
    icon: BellIcon,
    color: "from-sky-500 to-cyan-600",
    bgLight: "bg-sky-50 dark:bg-sky-900/10",
    borderLight: "border-sky-200 dark:border-sky-800",
    title: "5. Notifications & Communications",
    content: [
      "By creating an account and enabling notifications, you consent to receiving email alerts, SMS messages (where available), and browser push notifications from CampusHub regarding academic updates relevant to your cohort.",
      "You may opt out of email or push notifications at any time via the Settings page in your account. SMS notifications can also be disabled in your notification preferences.",
      "CampusHub is not responsible for SMS delivery failures, delays, or any carrier charges that may apply on your mobile network. Carrier fees are outside our control.",
      "System emails required for account security (e.g., email verification, password reset) cannot be opted out of, as they are essential for account operation.",
    ],
  },
  {
    id: "roles",
    icon: UsersIcon,
    color: "from-violet-500 to-purple-600",
    bgLight: "bg-violet-50 dark:bg-violet-900/10",
    borderLight: "border-violet-200 dark:border-violet-800",
    title: "6. Roles & Responsibilities",
    content: [
      "Class Representatives are responsible for the accuracy and timeliness of all content they publish — including unit schedules, CAT dates, assignment details, emergency overrides, and uploaded materials. Posting false or misleading academic information may result in immediate account suspension.",
      "Administrators are responsible for user management, broadcast messages, platform configuration, and cohort activation. Admin-level actions are fully audit-logged.",
      "Misuse of elevated roles (e.g., broadcasting spam, creating false CAT entries, unauthorized role elevation) constitutes a serious violation of these Terms and may result in immediate and permanent account termination.",
    ],
  },
  {
    id: "prohibited",
    icon: BanIcon,
    color: "from-red-500 to-rose-600",
    bgLight: "bg-red-50 dark:bg-red-900/10",
    borderLight: "border-red-200 dark:border-red-800",
    title: "7. Prohibited Conduct",
    content: [
      "You must not share your login credentials, impersonate another student, class rep, lecturer, or administrator, or attempt to access data belonging to another cohort, course, or role.",
      "You must not upload or share malicious files, executable scripts, viruses, or any content intended to harm other users or the platform.",
      "You must not use CampusHub for commercial solicitation, advertising, spamming, or any non-academic purpose.",
      "You must not attempt to reverse-engineer, scrape, probe, or exploit any part of the platform's backend, API, or database.",
      "You must not post offensive, discriminatory, defamatory, sexually explicit, or otherwise illegal content via feedback forms, file uploads, or any other platform feature.",
    ],
  },
  {
    id: "security",
    icon: LockIcon,
    color: "from-slate-500 to-slate-700",
    bgLight: "bg-slate-50 dark:bg-slate-800/30",
    borderLight: "border-slate-200 dark:border-slate-700",
    title: "8. Security",
    content: [
      "All passwords are stored using industry-standard cryptographic hashing. Plain-text passwords are never stored, logged, or transmitted.",
      "Session management is handled using JWT (JSON Web Tokens) with expiry controls. Audit logs record your IP address and device for security monitoring purposes and are automatically deleted after 90 days.",
      "Despite our best efforts and security measures, CampusHub cannot guarantee absolute security. In the unlikely event of a data breach caused by factors outside our reasonable control, we will take steps to notify affected users as soon as practically possible.",
      "You agree to notify us immediately at support@campushubapp.co.ke if you suspect any unauthorized access to your account.",
    ],
  },
  {
    id: "liability",
    icon: AlertTriangleIcon,
    color: "from-orange-500 to-amber-600",
    bgLight: "bg-orange-50 dark:bg-orange-900/10",
    borderLight: "border-orange-200 dark:border-orange-800",
    title: "9. Disclaimers & Limitation of Liability",
    content: [
      "CampusHub is provided \"as is\" and \"as available\" without any warranty of any kind, express or implied, including warranties of merchantability, fitness for a particular purpose, or non-infringement.",
      "CampusHub is not responsible for any missed assignments, CAT tests, or academic deadlines resulting from notification failures, platform downtime, inaccurate user-posted schedules, or any other platform-related issues.",
      "Since CampusHub is an unofficial independent platform, Chuka University and its staff bear no responsibility for this platform's content, availability, or accuracy.",
      "To the maximum extent permitted by Kenyan law, CampusHub's total liability for any claim arising from use of this platform shall not exceed the amount you have paid us (which is zero, as CampusHub is free).",
    ],
  },
  {
    id: "governing",
    icon: ScaleIcon,
    color: "from-teal-500 to-emerald-600",
    bgLight: "bg-teal-50 dark:bg-teal-900/10",
    borderLight: "border-teal-200 dark:border-teal-800",
    title: "10. Governing Law",
    content: [
      "These Terms and Conditions are governed by and construed in accordance with the laws of the Republic of Kenya, including the Kenya Data Protection Act, 2019 (No. 24 of 2019) and its associated regulations.",
      "Any disputes arising from these Terms shall first be attempted to be resolved amicably. If unresolved, disputes shall be subject to the exclusive jurisdiction of the courts of Kenya.",
    ],
  },
  {
    id: "changes",
    icon: RefreshCwIcon,
    color: "from-blue-400 to-blue-600",
    bgLight: "bg-blue-50 dark:bg-blue-900/10",
    borderLight: "border-blue-200 dark:border-blue-800",
    title: "11. Changes to These Terms",
    content: [
      "We reserve the right to update, modify, or replace these Terms at any time. When we make material changes, we will notify users through the in-app notification system and/or by email.",
      "Your continued use of CampusHub after changes have been posted constitutes your acceptance of the revised Terms. If you disagree with any updated Terms, you must discontinue use of the platform.",
      "The date of the last revision is displayed at the top of this page. We encourage you to review these Terms periodically.",
    ],
  },
];

export default function TermsPage() {
  const navigate = useNavigate();
  const [expandedSection, setExpandedSection] = useState(null);

  const toggle = (id) => setExpandedSection(expandedSection === id ? null : id);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">

      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 text-white">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-blue-600/20 blur-3xl" />
          <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-indigo-600/15 blur-3xl" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 mb-6 text-slate-300 hover:text-white transition-colors bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm w-fit cursor-pointer text-sm font-medium"
          >
            <ArrowLeftCircleIcon className="w-5 h-5" />
            Back
          </button>

          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="h-16 w-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
              <ShieldCheckIcon className="w-9 h-9 text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
                Terms & Conditions
              </h1>
              <p className="text-slate-400 text-sm sm:text-base font-medium mt-2">
                Last updated: September 2026 &nbsp;·&nbsp; Effective immediately upon registration
              </p>
            </div>
          </div>

          {/* Critical disclaimer badge */}
          <div className="mt-6 inline-flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-300 text-sm font-bold">
            <AlertTriangleIcon className="w-4 h-4 shrink-0" />
            CampusHub is NOT an official Chuka University platform. See Section 1.
          </div>
        </div>
      </div>

      {/* Intro paragraph */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium shadow-sm">
          Please read these Terms and Conditions carefully before using CampusHub. By registering or using the platform you agree to be bound by these Terms. If you disagree with any part of these Terms, you may not use CampusHub. These Terms apply to all users including students, class representatives, and administrators.
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
              className={`rounded-2xl border overflow-hidden shadow-sm transition-all duration-200 ${
                section.highlight
                  ? "border-amber-300 dark:border-amber-700 ring-1 ring-amber-300/50"
                  : "border-slate-200 dark:border-slate-800"
              } bg-white dark:bg-slate-900`}
            >
              {/* Section Header / Toggle Button */}
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

              {/* Section Content */}
              {isOpen && (
                <div className={`px-5 sm:px-6 pb-6 pt-1 border-t ${section.borderLight} ${section.bgLight}`}>
                  <ul className="space-y-3 mt-4">
                    {section.content.map((para, i) => (
                      <li key={i} className="flex gap-3 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                        <span className="mt-1.5 h-2 w-2 rounded-full bg-slate-400 dark:bg-slate-500 shrink-0" />
                        <span>{para}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer Card */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900/40 rounded-2xl p-6 text-center space-y-3">
          <p className="text-slate-700 dark:text-slate-300 text-sm font-medium">
            Have questions about these Terms? Contact us at{" "}
            <a href="mailto:support@campushubapp.co.ke" className="text-blue-600 dark:text-blue-400 font-bold hover:underline">
              support@campushubapp.co.ke
            </a>
          </p>
          <div className="flex items-center justify-center gap-4 text-xs font-bold text-slate-500">
            <Link to="/privacy" className="text-blue-600 dark:text-blue-400 hover:underline">
              Privacy Policy
            </Link>
            <span>·</span>
            <Link to="/help" className="text-blue-600 dark:text-blue-400 hover:underline">
              Help Center
            </Link>
            <span>·</span>
            <Link to="/" className="text-blue-600 dark:text-blue-400 hover:underline">
              Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
