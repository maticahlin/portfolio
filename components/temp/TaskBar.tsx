"use client";
import React from "react";

export default function TaskBar({ 
  onOpenAbout 
}: { 
  onOpenAbout?: () => void;
}) {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="w-full h-9 py-1 flex items-stretch justify-end px-2.5 shrink-0">
      {/* Right side - System tray + Clock */}
      <div className="flex items-stretch gap-2">
        {/* System Tray Icons */}
        <div className="flex items-center gap-3.5 px-2">
          {/* LinkedIn */}
          <button
            onClick={() => window.open('https://www.linkedin.com/in/matic-ahlin/', '_blank')}
            className="text-[14px] font-sans text-white cursor-pointer hover:underline"
            title="LinkedIn"
          >
            LinkedIn
          </button>
          
          {/* Instagram */}
          <button
            onClick={() => window.open('https://www.instagram.com/maticahlin/', '_blank')}
            className="text-[14px] font-sans text-white cursor-pointer hover:underline"
            title="Instagram"
          >
            Instagram
          </button>
          
          {/* About/CV */}
          <button
            onClick={onOpenAbout}
            className="hover:opacity-80 transition-opacity cursor-pointer"
            title="About"
          >
            <img src="/msagent-0.png" alt="About" className="w-5 h-5" />
          </button>
        </div>

        {/* Divider + Clock - Desktop only */}
        {!isMobile && (
          <>
            <div className="border-l border-grey-dark" />
            <div className="h-full flex items-center px-2 text-sm font-sans text-white leading-none border border-grey-dark">
              <Clock />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Clock() {
  const [time, setTime] = React.useState("");

  React.useEffect(() => {
    const update = () => {
      const now = new Date();
      const h = now.getHours().toString().padStart(2, "0");
      const m = now.getMinutes().toString().padStart(2, "0");
      const offset = -now.getTimezoneOffset() / 60;
      const zone = `GMT${offset >= 0 ? "+" : ""}${offset}`;
      setTime(`${h}:${m} (${zone})`);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return <span>Ljubljana, {time}</span>;
}