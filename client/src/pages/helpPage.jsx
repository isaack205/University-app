import React, { useState } from "react";
import {
  ChevronDown,
  MessageSquare,
  Phone,
  Mail,
  BookOpen,
  Users,
  Settings,
  BarChart3,
  Clock,
  AlertCircle,
  ArrowLeftCircleIcon
} from "lucide-react";
import { useAuth } from "@/contexts/authContext";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Contact from "@/components/contact";

export default function HelpPage() {
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [activeTab, setActiveTab] = useState("faq");
  const { user } = useAuth();

  const faqs = [
    {
      id: 1,
      question: "How do I log in to my account?",
      answer:
        "To log in, click the 'Login' button on the home page. Enter your registratio number/Id and password, then click 'Sign In'. If you forgot your password, use the 'Forgot Password' link to reset it.",
    },
    {
      id: 2,
      question: "How do I change my profile information?",
      answer:
        "Click your profile picture in the top-right corner, select 'Settings' > 'Profile', and edit your information. Remember to click 'Save Changes' to apply the updates.",
    },
    {
      id: 3,
      question: "Can I download course materials?",
      answer:
        "Yes, all course materials are available in the 'Files' section. Click the download icon next to any file to save it to your device.",
    },
    {
      id: 4,
      question: "How do I reset my password?",
      answer:
        "On the login page, click 'Forgot Password', enter your email address, and follow the instructions sent to your email to create a new password.",
    },
  ];

  const gettingStarted = [
    {
      step: 1,
      title: "Create Your Account",
      description:
        "Click 'Register' and fill in your details: name, email, student ID, select cohort, ... .",
      icon: Users,
    },
    {
      step: 2,
      title: "Explore Your Dashboard",
      description:
        "Check your 'Dashboard' to see your academic overview, pending assignments, and important announcements from your institution.",
      icon: BarChart3,
    },
    {
      step: 3,
      title: "Get assignments",
      description:
        "Visit the 'Assignment' section to see posted assignments and ther due dates.",
      icon: BookOpen,
    },
    {
      step: 4,
      title: "Access Course Materials",
      description:
        "Visit the 'Files' section to download lecture notes, past papers, and supplementary materials for your courses.",
      icon: BookOpen,
    },
    {
      step: 5,
      title: "Access CAT Dates",
      description:
        "Visit the 'CAT' section to check CAT dates and whether they are take-aways or sitting.",
      icon: BookOpen,
    },
  ];

  const troubleshooting = [
    {
      issue: "I can't log in to my account",
      solutions: [
        "Verify that you've entered the correct email/username and password",
        "Check if CAPS LOCK is on",
        "Click 'Forgot Password' to reset your password",
        "Ensure your email address is verified",
        "Clear your browser cache and try again",
      ],
    },
    {
      issue: "I'm not receiving email notifications",
      solutions: [
        "Check your 'Notification Settings' in the Settings page",
        "Verify that email notifications are enabled",
        "Check your spam or junk folder",
        "Ensure your email address is correct in your profile",
        "Whitelist [INSERT_APP_EMAIL_ADDRESS] in your email provider",
      ],
    },
  ];

  const toggleFaq = (id) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      {/* Header */}
      <div className="mb-12">
        <div className="flex items-center gap-1 hover:underline hover:text-blue-500">
            <ArrowLeftCircleIcon />
            {user && <Link to='/home'>Back to Home</Link> || <Link to='/login'>Back to Login</Link> }
        </div>
        <h1 className="text-3xl md:text-5xl font-bold text-blue-900 mb-3 underline text-center">
          Help & Support
        </h1>
        <p className="text-gray-600 text-lg">
          Find answers to common questions and learn how to use <span className="italic font-bold ">CampusHub app</span>
        </p>
      </div>
        
      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-3 mb-8">
        {[
          { id: "faq", label: "FAQ" },
          { id: "getting-started", label: "Getting Started" },
          { id: "troubleshooting", label: "Troubleshooting" },
          { id: "contact", label: "Contact Us" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === tab.id
                ? "bg-blue-600 text-white shadow-lg"
                : "bg-white text-gray-700 hover:bg-gray-100 shadow"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Sections */}
      <div>
        {/* FAQ Section */}
        {activeTab === "faq" && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Frequently Asked Questions
            </h2>
            {faqs.map((faq) => (
              <div
                key={faq.id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
              >
                <button
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <span className="text-lg font-semibold text-gray-900 text-left">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-600 transition-transform ${
                      expandedFaq === faq.id ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {expandedFaq === faq.id && (
                  <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
                    <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Getting Started Section */}
        {activeTab === "getting-started" && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              Getting Started Guide
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {gettingStarted.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.step}
                    className="bg-white rounded-lg shadow hover:shadow-lg transition-all p-6 border-l-4 border-blue-600"
                  >
                    <div className="flex items-start gap-4">
                      <div className="bg-blue-100 rounded-full p-3 flex-shrink-0">
                        <Icon className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                          Step {item.step}: {item.title}
                        </h3>
                        <p className="text-gray-600 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Troubleshooting Section */}
        {activeTab === "troubleshooting" && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              Troubleshooting Guide
            </h2>
            <div className="space-y-6">
              {troubleshooting.map((item, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6"
                >
                  <div className="flex items-start gap-3 mb-4">
                    <AlertCircle className="w-6 h-6 text-orange-500 flex-shrink-0 mt-1" />
                    <h3 className="text-lg font-bold text-gray-900">
                      {item.issue}
                    </h3>
                  </div>
                  <div className="ml-9">
                    <p className="text-gray-600 font-semibold mb-3">
                      Try these solutions:
                    </p>
                    <ul className="space-y-2">
                      {item.solutions.map((solution, idx) => (
                        <li key={idx} className="flex gap-3 text-gray-700">
                          <span className="text-blue-600 font-bold">•</span>
                          <span>{solution}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contact Us Section */}
        {activeTab === "contact" && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              Contact Us
            </h2>
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {[
                {
                  icon: Mail,
                  title: "Email Support",
                  value: "kahuraisaac30@gmail.com",
                  href: "mailto:kahuraisaac30@gmail.com",
                  description: "Response time: within 24 hours",
                  color: "bg-blue-100",
                  iconColor: "text-blue-600",
                },
                {
                  icon: Phone,
                  title: "Phone Support",
                  value: "+254 742328330",
                  href: "tel:+254742328330",
                  description: "Monday - Saturday, 9:00 AM - 5:00 PM EAT",
                  color: "bg-green-100",
                  iconColor: "text-green-600",
                },
                // {
                //   icon: MessageSquare,
                //   title: "Live Chat",
                //   value: "Available on our website",
                //   href: "#",
                //   description: "Real-time support during business hours",
                //   color: "bg-purple-100",
                //   iconColor: "text-purple-600",
                // },
                {
                  icon: Clock,
                  title: "Office Hours",
                  value: "Chuka, Tharaka Niithi",
                  href: "#",
                  description: "Visit our office at Tharaka Niithi",
                  color: "bg-orange-100",
                  iconColor: "text-orange-600",
                },
              ].map((contact, index) => {
                const Icon = contact.icon;
                return (
                  <div
                    key={index}
                    className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6"
                  >
                    <div className={`${contact.color} rounded-full w-12 h-12 flex items-center justify-center mb-4`}>
                      <Icon className={`w-6 h-6 ${contact.iconColor}`} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {contact.title}
                    </h3>
                    <a 
                      href={contact.href}
                      className="text-blue-600 font-semibold mb-2 hover:underline hover:text-blue-700 transition-colors inline-block"
                    >
                      {contact.value}
                    </a>
                    <p className="text-gray-600 text-sm">{contact.description}</p>
                  </div>
                );
              })}
            </div>

            {/* Contact Form */}
            <Contact />
          </div>
        )}
        
      </div>

      {/* Footer Info */}
      <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <p className="text-gray-700">
          <span className="font-semibold">📚 Pro Tip:</span> Check our{" "}
          <a href="#" className="text-blue-600 hover:underline">
            Knowledge Base
          </a>{" "}
          and{" "}
          <a href="#" className="text-blue-600 hover:underline">
            Video Tutorials
          </a>{" "}
          for more in-depth guides.
        </p>
      </div>
    </div>
  );
}
