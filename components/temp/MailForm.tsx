"use client";
import { useState } from "react";
import emailjs from '@emailjs/browser';

export default function MailForm({ onStatusChange }: { onStatusChange?: (text: string) => void }) {
  const [senderEmail, setSenderEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

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
      // Clear form
      setSenderEmail("");
      setSubject("");
      setMessage("");
      
      // Reset status after 3 seconds
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
    <div className="flex flex-col h-full bg-grey-light p-2 gap-2">
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
              className="flex-1 px-2 py-1.5 text-sm bg-white border-2 border-t-grey-dark border-l-grey-dark border-b-white border-r-white focus:outline-none"
            />
          </div>

          {/* To (Receiver) */}
          <div className="flex items-center gap-2">
            <label className="text-sm w-20 shrink-0">To</label>
            <div className="flex-1 px-2 py-1.5 text-sm bg-white border-2 border-t-grey-dark border-l-grey-dark border-b-white border-r-white">
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
              className="flex-1 px-2 py-1.5 text-sm bg-white border-2 border-t-grey-dark border-l-grey-dark border-b-white border-r-white focus:outline-none"
            />
          </div>
        </div>

        {/* Right - Send button */}
        <div className="flex items-center">
          <button
            onClick={handleSend}
            disabled={isSending}
            className="px-5 h-full text-sm bg-grey-light border-2 border-t-white border-l-white border-r-black border-b-black shadow-[inset_1px_1px_0_0_#dfdfdf,inset_-1px_-1px_0_0_#808080] active:border-t-black active:border-l-black active:border-r-white active:border-b-white flex items-center gap-1.5 cursor-pointer hover:bg-grey-mid transition-colors disabled:opacity-50"
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
        className="flex-1 px-2 py-2 text-sm bg-white border-2 border-t-grey-dark border-l-grey-dark border-b-white border-r-white resize-none font-sans focus:outline-none"
      />
    </div>
  );
}