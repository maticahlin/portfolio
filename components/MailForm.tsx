"use client";
import { useState } from "react";
import emailjs from '@emailjs/browser';
import { t, border } from '@/lib/theme';

export default function MailForm({ 
  onStatusChange,
  onSubjectChange,
}: { 
  onStatusChange?: (text: string) => void;
  onSubjectChange?: (subject: string) => void;
}) {
  const [senderEmail, setSenderEmail] = useState("");
  const [subject, setSubject]         = useState("");
  const [message, setMessage]         = useState("");
  const [isSending, setIsSending]     = useState(false);

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
        { from_email: senderEmail, subject, message, to_email: 'maticahlin2@gmail.com' },
        'TePM2peV6N0trT3LH'
      );
      onStatusChange?.("Message sent successfully! 🚀");
      setSenderEmail(""); setSubject(""); setMessage("");
      setTimeout(() => onStatusChange?.("Have a project in mind? I'd be happy to learn about it."), 3000);
    } catch (error) {
      console.error("Failed to send:", error);
      onStatusChange?.("Failed to send message. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const inputStyle = {
    backgroundColor: t.bgInner,
    color: t.text,
    ...border.inset,
  };

  return (
    <div className="flex flex-col h-full p-2 gap-2" style={{ backgroundColor: t.bgWindow, color: t.text }}>
      {/* Top section */}
      <div className="flex gap-2">
        {/* Fields */}
        <div className="flex-1 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <label className="text-sm w-20 shrink-0">From</label>
            <input
              type="email"
              value={senderEmail}
              onChange={(e) => setSenderEmail(e.target.value)}
              placeholder="user@domain.com"
              className="flex-1 px-2 py-1.5 text-sm border focus:outline-none"
              style={inputStyle}
            />
          </div>

          {/* <div className="flex items-center gap-2">
            <label className="text-sm w-20 shrink-0">To</label>
            <div className="flex-1 px-2 py-1.5 text-sm border" style={inputStyle}>
              maticahlin2@gmail.com
            </div>
          </div> */}

          <div className="flex items-center gap-2">
            <label className="text-sm w-20 shrink-0">Subject:</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => { setSubject(e.target.value); onSubjectChange?.(e.target.value); }}
              placeholder="Hello!"
              className="flex-1 px-2 py-1.5 text-sm border focus:outline-none"
              style={inputStyle}
            />
          </div>
        </div>

        {/* Send button */}
        <div className="flex items-center">
          <button
            onClick={handleSend}
            disabled={isSending}
            className="px-5 h-full text-sm border flex items-center gap-1.5 cursor-pointer hover:brightness-110 transition-all disabled:opacity-50"
            style={{ backgroundColor: '#5a5a5a', color: t.text, ...border.button.raised }}
          >
            {isSending ? "Sending..." : "📧 Send"}
          </button>
        </div>
      </div>

      {/* Message */}
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Start typing your message here..."
        className="flex-1 px-2 py-2 text-sm border resize-none font-sans focus:outline-none"
        style={inputStyle}
      />
    </div>
  );
}
