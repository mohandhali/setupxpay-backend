import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "../ui/card";

import {
  FaTelegramPlane,
  FaWhatsapp,
  FaBullhorn,
  FaArrowLeft,
  FaUsers,
  FaQuestionCircle,
  FaStar,
  FaGift,
  FaRocket,
  FaShieldAlt,
  FaClock,
  FaCheckCircle,
  FaEnvelope,
  FaPhone,
  FaGlobe,
  FaTimes
} from "react-icons/fa";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { motion } from "framer-motion";

const Community = () => {
  const navigate = useNavigate();
  const [faqSearch, setFaqSearch] = useState("");
  const [supportOpen, setSupportOpen] = useState(false);
  const [ticket, setTicket] = useState({ name: "", email: "", message: "" });

  const handleTicketChange = (e) => {
    setTicket({ ...ticket, [e.target.name]: e.target.value });
  };

  const faqs = [
    {
      question: "How to buy USDT?",
      answer: "Go to Dashboard → Buy USDT → Enter INR amount → Pay via UPI/Card → Receive USDT instantly.",
      category: "Trading"
    },
    {
      question: "How to sell USDT?",
      answer: "Go to Dashboard → Sell USDT → Scan merchant QR → Enter amount → Receive INR via UPI.",
      category: "Trading"
    },
    {
      question: "How long does withdrawal take?",
      answer: "USDT transfers: 2-5 minutes. INR withdrawals: Instant via UPI, 2-3 minutes via bank transfer.",
      category: "Withdrawals"
    },
    {
      question: "Is SetupXPay safe?",
      answer: "Yes! SetupXPay uses non-custodial wallets. You control your private keys and funds are never stored on our servers.",
      category: "Security"
    },
    {
      question: "What are the minimum & maximum amounts?",
      answer: "Minimum: ₹10. Maximum: ₹49,000 per UPI payment. For larger amounts, use multiple transactions.",
      category: "Limits"
    },
    {
      question: "Which networks are supported?",
      answer: "We support TRC20 (Tron) and BEP20 (BSC) networks. Choose based on your preference for speed and fees.",
      category: "Networks"
    },
    {
      question: "How to backup my wallet?",
      answer: "During signup, you'll get a 12-word mnemonic phrase. Write it down safely - it's your wallet backup.",
      category: "Security"
    },
    {
      question: "What are the fees?",
      answer: "Buy/Sell: 1% platform fee. Network fees: TRC20 (₹5), BEP20 (₹1). No hidden charges.",
      category: "Fees"
    }
  ];

  const announcements = [
    {
      type: "feature",
      title: "🎉 BEP20 Network Support Added!",
      description: "Now trade USDT on both TRC20 and BEP20 networks",
      date: "2024-01-15"
    },
    {
      type: "maintenance",
      title: "🔧 Scheduled Maintenance",
      description: "System upgrade on Jan 20, 2AM-3AM IST. Minimal downtime expected.",
      date: "2024-01-18"
    },
    {
      type: "update",
      title: "📱 New Mobile App Features",
      description: "Biometric authentication and improved QR scanning now available",
      date: "2024-01-12"
    },
    {
      type: "promo",
      title: "🎁 Referral Bonus Program",
      description: "Earn up to ₹100 for each friend who joins SetupXPay",
      date: "2024-01-10"
    }
  ];

  const filteredFaqs = faqs.filter((faq) =>
    faq.question.toLowerCase().includes(faqSearch.toLowerCase())
  );

  const socialLinks = [
    {
      name: "Telegram Community",
      icon: <FaTelegramPlane className="text-blue-500" />,
      url: "https://t.me/setupxpay",
      members: "2,500+",
      description: "Join our main community for updates and support"
    },
    {
      name: "WhatsApp Group",
      icon: <FaWhatsapp className="text-green-500" />,
      url: "https://chat.whatsapp.com/setupxpay",
      members: "1,200+",
      description: "Quick support and daily market updates"
    },
    {
      name: "Discord Server",
      icon: <FaUsers className="text-purple-500" />,
      url: "https://discord.gg/setupxpay",
      members: "800+",
      description: "Developer community and technical discussions"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="flex items-center gap-3 p-4 max-w-4xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-700 text-lg hover:text-blue-600 transition"
          >
            <FaArrowLeft />
          </button>
          <h1 className="text-xl font-bold text-gray-800">Community Hub</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-6 pb-20">
        <div className="space-y-8">
          <div className="bg-white rounded-xl shadow-sm p-1">
            <div className="grid grid-cols-4 gap-1">
              <button 
                onClick={() => {
                  document.getElementById('announcements-section')?.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start' 
                  });
                }}
                className="flex flex-col items-center justify-center gap-1 px-2 py-3 text-xs font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FaBullhorn className="text-sm" />
                <span>Updates</span>
              </button>
              <button 
                onClick={() => {
                  document.getElementById('groups-section')?.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start' 
                  });
                }}
                className="flex flex-col items-center justify-center gap-1 px-2 py-3 text-xs font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FaUsers className="text-sm" />
                <span>Groups</span>
              </button>
              <button 
                onClick={() => {
                  document.getElementById('faq-section')?.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start' 
                  });
                }}
                className="flex flex-col items-center justify-center gap-1 px-2 py-3 text-xs font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FaQuestionCircle className="text-sm" />
                <span>FAQ</span>
              </button>
              <button 
                onClick={() => {
                  document.getElementById('support-section')?.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start' 
                  });
                }}
                className="flex flex-col items-center justify-center gap-1 px-2 py-3 text-xs font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FaEnvelope className="text-sm" />
                <span>Support</span>
              </button>
            </div>
          </div>

          {/* Announcements */}
          <motion.div
            id="announcements-section"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
              {announcements.map((announcement, index) => (
                <Card key={index} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className={`p-4 ${
                      announcement.type === 'feature' ? 'bg-gradient-to-r from-green-50 to-green-100 border-l-4 border-green-500' :
                      announcement.type === 'maintenance' ? 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-l-4 border-yellow-500' :
                      announcement.type === 'update' ? 'bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-blue-500' :
                      'bg-gradient-to-r from-purple-50 to-purple-100 border-l-4 border-purple-500'
                    }`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800 mb-1">
                            {announcement.title}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {announcement.description}
                          </p>
                        </div>
                        <span className="text-xs text-gray-500 ml-4">
                          {announcement.date}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </motion.div>

          {/* Groups */}
            <motion.div
              id="groups-section"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              {socialLinks.map((social, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <a
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition"
                    >
                      <div className="text-2xl">
                        {social.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800">{social.name}</h3>
                        <p className="text-sm text-gray-600">{social.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <FaUsers className="text-xs text-gray-400" />
                          <span className="text-xs text-gray-500">{social.members} members</span>
                        </div>
                      </div>
                      <div className="text-gray-400">
                        <FaGlobe />
                      </div>
                    </a>
                  </CardContent>
                </Card>
              ))}
            </motion.div>

          {/* FAQ */}
            <motion.div
              id="faq-section"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="mb-6">
                    <Input
                      placeholder="Search FAQ..."
                      className="mb-4"
                      value={faqSearch}
                      onChange={(e) => setFaqSearch(e.target.value)}
                    />
                    <div className="text-sm text-gray-500">
                      {filteredFaqs.length} of {faqs.length} questions
                    </div>
                  </div>

                  <div className="space-y-6">
                    {filteredFaqs.length ? (
                      filteredFaqs.map((faq, index) => (
                        <motion.div 
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          className="border-l-4 border-blue-500 pl-4"
                        >
                          <div className="flex items-start gap-3">
                            <FaQuestionCircle className="text-blue-500 mt-1 flex-shrink-0" />
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-800 mb-2">{faq.question}</h3>
                              <p className="text-sm text-gray-600 mb-2">{faq.answer}</p>
                              <span className="inline-block bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                                {faq.category}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <FaQuestionCircle className="text-4xl text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">No matching questions found.</p>
                        <p className="text-sm text-gray-400 mt-2">Try different keywords or contact support.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

          {/* Support */}
            <motion.div
              id="support-section"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Contact Methods */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Get Help</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                      <FaEnvelope className="text-blue-500" />
                      <div>
                        <div className="font-medium">Email Support</div>
                        <div className="text-sm text-gray-600">support@setupxpay.com</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                      <FaPhone className="text-green-500" />
                      <div>
                        <div className="font-medium">Phone Support</div>
                        <div className="text-sm text-gray-600">+91 8791439964</div>
                        <div className="text-sm text-gray-600">+91 7617611021</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Submit Ticket */}
              <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-8">
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-2">Submit Support Ticket</h3>
                  <p className="text-gray-600 mb-4">Can't find what you're looking for? We're here to help!</p>
                  <div className="flex justify-center">
                    <button
                      onClick={() => setSupportOpen(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-md text-sm flex items-center justify-center gap-2 w-full sm:w-auto transition-colors"
                      style={{ minHeight: '44px', maxWidth: '200px' }}
                    >
                      <FaEnvelope />
                      Submit Ticket
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
        </div>
      </div>

      {/* Support Ticket Modal */}
      <Dialog open={supportOpen} onOpenChange={setSupportOpen}>
        <DialogContent className="max-w-md relative">
          <DialogHeader>
            <DialogTitle className="text-center">
              Submit Support Ticket
            </DialogTitle>
            <button
              onClick={() => setSupportOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FaTimes className="text-xl" />
            </button>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Your Name"
              name="name"
              value={ticket.name}
              onChange={handleTicketChange}
            />
            <Input
              placeholder="Your Email"
              name="email"
              type="email"
              value={ticket.email}
              onChange={handleTicketChange}
            />
            <textarea
              placeholder="Describe your issue in detail..."
              name="message"
              value={ticket.message}
              onChange={handleTicketChange}
              className="w-full border border-gray-300 rounded-md p-3 text-sm resize-none"
              rows={4}
            />
            <Button
              onClick={() => {
                console.log("Support ticket submitted:", ticket);
                setSupportOpen(false);
                setTicket({ name: "", email: "", message: "" });
                alert("Support ticket submitted successfully! We'll get back to you within 24 hours.");
              }}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Submit Ticket
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Community;
