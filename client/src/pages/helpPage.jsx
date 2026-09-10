import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  Phone,
  Mail,
  BookOpen,
  Users,
  Settings,
  BarChart3,
  Clock,
  AlertCircle,
  ArrowLeftCircleIcon,
  BellRing,
  HelpCircle
} from "lucide-react";
import { useAuth } from "@/contexts/authContext";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import Contact from "@/components/contact";

export default function HelpPage() {
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [activeTab, setActiveTab] = useState("faq");
  const { user } = useAuth();
  const navigate = useNavigate();

  const faqs = [
    {
      id: 1,
      question: "How do I verify my email address?",
      answer:
        "When you first register, CampusHub automatically sends a verification link to your email. Check your inbox (or spam folder), click the link, and you will be instantly verified and ready to log in!",
    },
    {
      id: 2,
      question: "Why can't I see my CAT dates?",
      answer:
        "CAT dates are managed by your Class Representative. If your dashboard says 'No CATs found', it means your Class Rep has not yet published the dates for your cohort. You will receive an instant email notification the moment they are published.",
    },
    {
      id: 3,
      question: "How do I change my notification preferences?",
      answer:
        "Click your profile icon on the sidebar and navigate to 'Settings'. From there, you can toggle Email or Push Notifications on or off.",
    },
    {
      id: 4,
      question: "How do I download lecture notes or past papers?",
      answer:
        "Navigate to the 'Files' tab in your dashboard. You can search by unit code or description. Click the download icon next to any file to instantly save it to your device.",
    },
    {
      id: 5,
      question: "I forgot my password, how do I recover it?",
      answer:
        "On the login page, click 'Forgot Password', enter your email address, and we will send you a secure link to reset your password.",
    },
  ];

  const gettingStarted = [
    {
      step: 1,
      title: "Verify Your Account",
      description:
        "Ensure your email is verified so you can successfully log in and start receiving important academic alerts.",
      icon: Users,
    },
    {
      step: 2,
      title: "Set Up Notifications",
      description:
        "Head to Settings and enable your preferred notification channels so you never miss a rescheduled CAT or assignment deadline.",
      icon: BellRing,
    },
    {
      step: 3,
      title: "Check Your Academic Feed",
      description:
        "Your Dashboard acts as your central hub. It will highlight upcoming CATs, pending assignments, and recent file uploads specifically for your cohort.",
      icon: BarChart3,
    },
    {
      step: 4,
      title: "Access Course Materials",
      description:
        "Visit the 'Files' section to access materials uploaded by your Class Reps or Lecturers. You can view them online or download them.",
      icon: BookOpen,
    },
  ];

  const troubleshooting = [
    {
      issue: "I'm not receiving Email Alerts for CATs",
      solutions: [
        "Check your 'Settings' page and ensure 'Email Reminders' is toggled ON.",
        "Check your Spam or Promotions folder in your email app.",
        "Ensure the email you registered with is spelled correctly.",
      ],
    },
    {
      issue: "I get 'Ghost User' or Verification Errors when registering",
      solutions: [
        "If the verification email fails to send during registration, your account won't be created to prevent getting locked out. Wait a moment and try registering again.",
        "Ensure you are using a valid email format.",
      ],
    },
    {
      issue: "My Dashboard says 'No Data'",
      solutions: [
        "This simply means your Class Rep or Admin hasn't added any files or CATs for your specific Cohort yet.",
        "Contact your Class Rep to have them upload the schedule.",
      ],
    },
  ];

  const toggleFaq = (id) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  const handleBack = () => {
    if (user?.role === 'admin') navigate('/admin/dashboard');
    else if (user) navigate('/home');
    else navigate('/login');
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 pb-20">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12 relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-700 p-8 md:p-12 text-white shadow-2xl"
        >
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white opacity-10 blur-3xl"></div>
          
          <button 
            onClick={handleBack}
            className="flex items-center gap-2 mb-6 text-blue-100 hover:text-white transition-colors bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm w-fit cursor-pointer"
          >
            <ArrowLeftCircleIcon className="w-5 h-5" />
            <span className="font-medium">Back to {user ? 'Dashboard' : 'Login'}</span>
          </button>
          
          <div className="flex flex-col md:flex-row gap-6 items-center justify-between relative z-10">
            <div className="max-w-2xl">
              <h1 className="text-4xl md:text-6xl font-extrabold mb-4 tracking-tight">
                How can we help?
              </h1>
              <p className="text-lg md:text-xl text-blue-100 leading-relaxed">
                Find answers, troubleshoot issues, or get in touch with the CampusHub support team. We've got your back!
              </p>
            </div>
            <div className="hidden md:flex bg-white/10 p-6 rounded-2xl backdrop-blur-md">
                <HelpCircle className="w-24 h-24 text-blue-100 opacity-80" />
            </div>
          </div>
        </motion.div>
          
        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 md:gap-4 mb-10 justify-center md:justify-start">
          {[
            { id: "faq", label: "FAQ", icon: HelpCircle },
            { id: "getting-started", label: "Getting Started", icon: BookOpen },
            { id: "troubleshooting", label: "Troubleshooting", icon: AlertCircle },
            { id: "contact", label: "Contact Us", icon: Phone },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold transition-all cursor-pointer duration-300 text-sm md:text-base ${
                  activeTab === tab.id
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30 scale-105"
                    : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-800"
                }`}
              >
                <Icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-blue-100' : 'text-slate-400'}`} />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Content Sections */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, y: -10 }}
            className="min-h-[400px]"
          >
            {/* FAQ Section */}
            {activeTab === "faq" && (
              <div className="max-w-3xl space-y-4">
                {faqs.map((faq) => (
                  <motion.div
                    variants={itemVariants}
                    key={faq.id}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                  >
                    <button
                      onClick={() => toggleFaq(faq.id)}
                      className="w-full px-6 py-5 flex items-center justify-between text-left cursor-pointer"
                    >
                      <span className="text-lg font-bold text-slate-800 dark:text-slate-100 pr-4">
                        {faq.question}
                      </span>
                      <motion.div
                        animate={{ rotate: expandedFaq === faq.id ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                        className="bg-slate-100 dark:bg-slate-800 p-2 rounded-full shrink-0"
                      >
                        <ChevronDown className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </motion.div>
                    </button>
                    <AnimatePresence>
                      {expandedFaq === faq.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className="px-6 pb-6 pt-2 text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800 mt-2">
                            {faq.answer}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Getting Started Section */}
            {activeTab === "getting-started" && (
              <div className="grid md:grid-cols-2 gap-6">
                {gettingStarted.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      variants={itemVariants}
                      key={item.step}
                      className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm hover:shadow-xl transition-all p-8 border border-slate-200 dark:border-slate-800 group relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 p-8 opacity-5 transform group-hover:scale-150 transition-transform duration-700">
                         <Icon className="w-32 h-32" />
                      </div>
                      <div className="flex items-start gap-5 relative z-10">
                        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-4 flex-shrink-0 text-white shadow-lg shadow-blue-500/30">
                          <Icon className="w-7 h-7" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-blue-600 mb-1 tracking-wider uppercase">Step {item.step}</div>
                          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-3">
                            {item.title}
                          </h3>
                          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* Troubleshooting Section */}
            {activeTab === "troubleshooting" && (
              <div className="max-w-4xl space-y-6">
                {troubleshooting.map((item, index) => (
                  <motion.div
                    variants={itemVariants}
                    key={index}
                    className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-8"
                  >
                    <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
                      <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-full">
                        <AlertCircle className="w-7 h-7 text-orange-600 dark:text-orange-500" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                        {item.issue}
                      </h3>
                    </div>
                    <div>
                      <p className="text-slate-800 dark:text-slate-200 font-bold mb-4 flex items-center gap-2">
                         <Settings className="w-4 h-4 text-blue-500" /> Try these solutions:
                      </p>
                      <ul className="grid md:grid-cols-2 gap-4">
                        {item.solutions.map((solution, idx) => (
                          <li key={idx} className="flex gap-3 text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl">
                            <div className="min-w-6 flex justify-center">
                               <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                            </div>
                            <span className="leading-relaxed">{solution}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Contact Us Section */}
            {activeTab === "contact" && (
              <div className="space-y-8">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    {
                      icon: Mail,
                      title: "Email Support",
                      value: "kahuraisaac30@gmail.com",
                      href: "mailto:kahuraisaac30@gmail.com",
                      description: "Average response: 24h",
                      color: "from-blue-500 to-blue-600",
                    },
                    {
                      icon: Phone,
                      title: "Phone Support",
                      value: "+254 742328330",
                      href: "tel:+254742328330",
                      description: "Mon-Sat, 9AM-5PM EAT",
                      color: "from-emerald-500 to-emerald-600",
                    },
                    {
                      icon: Clock,
                      title: "Office Hours",
                      value: "Chuka, Tharaka Niithi",
                      href: "#",
                      description: "Main Campus Office",
                      color: "from-orange-500 to-orange-600",
                    },
                  ].map((contact, index) => {
                    const Icon = contact.icon;
                    return (
                      <motion.div
                        variants={itemVariants}
                        key={index}
                        className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden group"
                      >
                        <div className={`h-2 w-full bg-gradient-to-r ${contact.color}`}></div>
                        <div className="p-6">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 bg-gradient-to-br ${contact.color} text-white shadow-lg`}>
                                <Icon className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">
                            {contact.title}
                            </h3>
                            <a 
                            href={contact.href}
                            className="text-lg font-bold text-slate-600 dark:text-slate-300 mb-2 block hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            >
                            {contact.value}
                            </a>
                            <p className="text-slate-500 text-sm font-medium">{contact.description}</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Contact Form */}
                <motion.div variants={itemVariants}>
                    <Contact />
                </motion.div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Footer Info */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-16 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-2xl p-6 text-center"
        >
          <p className="text-slate-600 dark:text-slate-400">
            <span className="font-bold text-blue-600 dark:text-blue-400 mr-2">📚 Need more help?</span> 
            Ask your Class Representative or reach out directly to the administration.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
