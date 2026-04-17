"use client";
import React from "react";

export default function TaskBar({ 
  openWindows,
  onOpenAbout 
}: { 
  openWindows?: Array<{ title: string; icon?: string; isMinimized: boolean; isActive: boolean; onRestore: () => void }>;
  onOpenAbout?: () => void;
}) {
  return (
    <div className="w-full h-11 py-1 bg-desktop-dark flex items-stretch justify-between px-2.5 shrink-0">
      {/* Open window buttons */}
      <div className="flex items-stretch gap-1">
        {openWindows?.map((window, i) => (
          <button
            key={i}
            onClick={window.onRestore}
            className={`
              h-full bg-grey-dark text-black text-sm flex items-center gap-2 leading-none px-2 border cursor-pointer transition-colors
              ${
                !window.isMinimized && window.isActive
                  ? "border-t-black border-l-black border-r-white border-b-white" // PRESSED (active)
                  : "border-t-white border-l-white border-r-black border-b-black" // RAISED (open)
              }
            `}
          >
            {window.icon && <img src={window.icon} alt="" className="w-5 h-5" />}
            {window.title}
          </button>
        ))}
      </div>

      {/* Right side - System tray + Clock */}
      <div className="flex items-stretch gap-2">
        {/* System Tray Icons */}
        <div className="flex items-center gap-3.5 px-2 border-l border-grey-dark">
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

        {/* Clock */}
        <div className="h-full flex items-center border border-grey-dark bg-desktop-dark px-2 text-sm font-sans text-white leading-none">
          <Clock />
        </div>
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