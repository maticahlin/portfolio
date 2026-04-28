"use client";
import { useState } from "react";
import emailjs from '@emailjs/browser';

export default function MailForm({ 
  onStatusChange,
  theme = 'grey'
}: { 
  onStatusChange?: (text: string) => void;
  theme?: 'grey' | 'dark';
}) {
  const [senderEmail, setSenderEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const bgColor = theme === 'dark' ? '#474747' : '#e6e6e6';
  const innerBg = theme === 'dark' ? '#323232' : '#ffffff';
  const textColor = theme === 'dark' ? '#E2E2E2' : '#000000';
  const borderLight = theme === 'dark' ? '#9F9F9F' : 'white';
  const borderDark = theme === 'dark' ? '#000000' : '#a6a6a6';

  const handleSend = async () => {
    if (!senderEmail || !subject || !message) {
      onStatusChange?.("Please fill in all fields");
      return;
    }

    setIsSending(true);
    onStatusChange?.("Sending message...");

    try {
      await emailjs.send(
        'service_9zed2kc',
        'template_lxzdw35',
        {
          from_email: senderEmail,
          subject: subject,
          message: message,
          to_email: 'maticahlin2@gmail.com'
        },
        'TePM2peV6N0trT3LH'
      );

      onStatusChange?.("Message sent successfully! 🚀");
      setSenderEmail("");
      setSubject("");
      setMessage("");
      
      setTimeout(() => {
        onStatusChange?.("Have a project in mind? I'd be happy to learn about it.");
      }, 3000);
    } catch (error) {
      console.error("Failed to send:", error);
      onStatusChange?.("Failed to send message. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div 
      className="flex flex-col h-full p-2 gap-2"
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      {/* Top section - Fields and Send button */}
      <div className="flex gap-2">
        {/* Left - Form fields */}
        <div className="flex-1 flex flex-col gap-2">
          {/* From */}
          <div className="flex items-center gap-2">
            <label className="text-sm w-20 shrink-0">From</label>
            <input
              type="email"
              value={senderEmail}
              onChange={(e) => setSenderEmail(e.target.value)}
              placeholder="user@domain.com"
              className="flex-1 px-2 py-1.5 text-sm border focus:outline-none"
              style={{
                backgroundColor: innerBg,
                color: textColor,
                borderTopColor: borderDark,
                borderLeftColor: borderDark,
                borderBottomColor: borderLight,
                borderRightColor: borderLight
              }}
            />
          </div>

          {/* To (Receiver) */}
          <div className="flex items-center gap-2">
            <label className="text-sm w-20 shrink-0">To</label>
            <div 
              className="flex-1 px-2 py-1.5 text-sm border"
              style={{
                backgroundColor: innerBg,
                color: textColor,
                borderTopColor: borderDark,
                borderLeftColor: borderDark,
                borderBottomColor: borderLight,
                borderRightColor: borderLight
              }}
            >
              maticahlin2@gmail.com
            </div>
          </div>

          {/* Subject */}
          <div className="flex items-center gap-2">
            <label className="text-sm w-20 shrink-0">Subject:</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Hello!"
              className="flex-1 px-2 py-1.5 text-sm border focus:outline-none"
              style={{
                backgroundColor: innerBg,
                color: textColor,
                borderTopColor: borderDark,
                borderLeftColor: borderDark,
                borderBottomColor: borderLight,
                borderRightColor: borderLight
              }}
            />
          </div>
        </div>

        {/* Right - Send button */}
        <div className="flex items-center">
          <button
            onClick={handleSend}
            disabled={isSending}
            className="px-5 h-full text-sm border flex items-center gap-1.5 cursor-pointer hover:brightness-110 transition-all disabled:opacity-50"
            style={{
              backgroundColor: innerBg,
              color: textColor,
              borderTopColor: borderLight,
              borderLeftColor: borderLight,
              borderRightColor: borderDark,
              borderBottomColor: borderDark,
              boxShadow: theme === 'dark'
                ? `inset 1px 1px 0 0 ${borderLight}, inset -1px -1px 0 0 ${borderDark}`
                : 'inset 1px 1px 0 0 #dfdfdf, inset -1px -1px 0 0 #808080'
            }}
          >
            {isSending ? "Sending..." : "📧 Send"}
          </button>
        </div>
      </div>

      {/* Bottom section - Message */}
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Start typing your message here..."
        className="flex-1 px-2 py-2 text-sm border resize-none font-sans focus:outline-none"
        style={{
          backgroundColor: innerBg,
          color: textColor,
          borderTopColor: borderDark,
          borderLeftColor: borderDark,
          borderBottomColor: borderLight,
          borderRightColor: borderLight
        }}
      />
    </div>
  );
}