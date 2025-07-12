import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "../ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import {
  FaTelegramPlane,
  FaWhatsapp,
  FaBullhorn,
  FaArrowLeft,
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
      answer:
        "Go to Dashboard → Deposit → Enter INR → Pay via UPI → Receive USDT.",
    },
    {
      question: "How long does withdrawal take?",
      answer: "Usually within 2–3 mins if UPI payment is successful.",
    },
    {
      question: "Is SetupXPay safe?",
      answer: "Yes. It's a non-custodial wallet. You control your keys.",
    },
    {
      question: "Minimum & maximum amount?",
      answer: "Minimum ₹10. Max ₹49,000 per UPI payment.",
    },
  ];

  const filteredFaqs = faqs.filter((faq) =>
    faq.question.toLowerCase().includes(faqSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white text-gray-800">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b shadow-sm">
        <button
          onClick={() => navigate(-1)}
          className="text-gray-700 text-lg hover:text-blue-600"
        >
          <FaArrowLeft />
        </button>
        <h1 className="text-xl font-bold">Community Hub</h1>
      </div>

      {/* Main Tabs */}
      <div className="max-w-3xl mx-auto px-4 py-6">
        <Tabs defaultValue="announcements" className="space-y-4">
          <TabsList className="grid grid-cols-3 bg-gray-100 rounded-xl overflow-hidden">
            <TabsTrigger value="announcements">📢 Announce</TabsTrigger>
            <TabsTrigger value="groups">💬 Groups</TabsTrigger>
            <TabsTrigger value="faq">📚 FAQ</TabsTrigger>
          </TabsList>

          {/* Announcements */}
          <TabsContent value="announcements" asChild>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center gap-2 text-blue-600">
                    <FaBullhorn />
                    <span>🎉 Razorpay QR added for instant INR deposit</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <FaBullhorn />
                    <span>📢 Maintenance scheduled on 12 July, 2AM–3AM</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <FaBullhorn />
                    <span>💡 Sell USDT QR now supports Paytm UPI</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Groups */}
          <TabsContent value="groups" asChild>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardContent className="p-4 space-y-4">
                  <a
                    href="https://t.me/setupxpay"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 border rounded-xl hover:bg-gray-50"
                  >
                    <FaTelegramPlane className="text-blue-500 text-xl" />
                    <span>Join our Telegram Group</span>
                  </a>
                  <a
                    href="https://chat.whatsapp.com/xyz"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 border rounded-xl hover:bg-gray-50"
                  >
                    <FaWhatsapp className="text-green-500 text-xl" />
                    <span>Join WhatsApp Community</span>
                  </a>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* FAQ with Search + Support */}
          <TabsContent value="faq" asChild>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardContent className="p-4 space-y-4">
                  <Input
                    placeholder="Search FAQ..."
                    className="mb-4"
                    value={faqSearch}
                    onChange={(e) => setFaqSearch(e.target.value)}
                  />

                  {filteredFaqs.length ? (
                    filteredFaqs.map((faq, index) => (
                      <div key={index}>
                        <h3 className="font-semibold">{faq.question}</h3>
                        <p className="text-sm text-gray-600">{faq.answer}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">No matching questions found.</p>
                  )}

                  <div className="text-center pt-4">
                    <Button
                      onClick={() => setSupportOpen(true)}
                      variant="outline"
                      className="text-blue-600 border-blue-600"
                    >
                      Need more help? Submit a ticket
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Support Ticket Modal */}
      <Dialog open={supportOpen} onOpenChange={setSupportOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Submit a Support Ticket</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="Your Name"
              name="name"
              value={ticket.name}
              onChange={handleTicketChange}
            />
            <Input
              placeholder="Your Email"
              name="email"
              value={ticket.email}
              onChange={handleTicketChange}
            />
            <textarea
              placeholder="Describe your issue..."
              name="message"
              value={ticket.message}
              onChange={handleTicketChange}
              className="w-full border border-gray-300 rounded-md p-2 text-sm"
              rows={4}
            />
            <Button
              onClick={() => {
                console.log("Support ticket submitted:", ticket);
                setSupportOpen(false);
                setTicket({ name: "", email: "", message: "" });
              }}
              className="w-full"
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
