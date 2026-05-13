"use client";
import React from "react";
import { t, border } from '@/lib/theme';

export default function TaskBar({ 
  onOpenAbout,
  onOpenProjects,
  onOpenMail,
  onOpenQR,
  showProjects,
  showMail,
  showQR,
  activeWindow,
}: { 
  onOpenAbout?: () => void;
  onOpenProjects?: () => void;
  onOpenMail?: () => void;
  onOpenQR?: () => void;
  showProjects?: boolean;
  showMail?: boolean;
  showQR?: boolean;
  activeWindow?: string | null;
}) {
  const [isMobile, setIsMobile] = React.useState(false);
  const [pressed, setPressed] = React.useState<string | null>(null);

  React.useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const getLaunchStyle = (name: string, isOpen?: boolean) => {
    const isFocused = activeWindow === name;
    const isPressed = pressed === name;

    if (isPressed) return {
      backgroundColor: t.bgInner,
      color: t.text,
      ...border.button.pressed,
    };
    if (isFocused) return {
      backgroundColor: t.bgWindow,
      color: t.text,
      ...border.button.pressed,
    };
    if (isOpen) return {
      backgroundColor: '#3a3a3a',
      color: t.textMuted,
      ...border.button.pressed,
    };
    return {
      backgroundColor: 'transparent',
      color: t.text,
      border: 'none',
      boxShadow: 'none',
    };
  };

  return (
    <div 
      className="w-full h-9 flex items-stretch justify-between px-2 shrink-0 relative"
      style={{
        backgroundColor: '#3a3a3a',
        borderTop: `1px solid ${t.borderLight}`,
        borderBottom: `1px solid ${t.borderDark}`,
        zIndex: 10,
      }}
    >
      {/* Left side — App launchers */}
      <div className="flex items-stretch gap-1 py-1">
        {[
          { name: 'projects', label: 'Projects', icon: '/projects.png', onClick: onOpenProjects, isOpen: showProjects },
          { name: 'mail',     label: 'Mail',     icon: '/mail.png',     onClick: onOpenMail,     isOpen: showMail },
          { name: 'qr',       label: 'QR Tool',  icon: '/qr.png',       onClick: onOpenQR,       isOpen: showQR },
        ].map(({ name, label, icon, onClick, isOpen }) => (
          <button
            key={name}
            onMouseDown={() => setPressed(name)}
            onMouseUp={() => { setPressed(null); onClick?.(); }}
            onMouseLeave={() => setPressed(null)}
            className="flex items-center gap-1.5 px-3 h-full text-sm border cursor-pointer transition-none"
            style={getLaunchStyle(name, isOpen)}
          >
            <img src={icon} alt="" className="w-4 h-4 shrink-0" />
            {!isMobile && (
              <span>
                <span className="underline">{label[0]}</span>{label.slice(1)}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Divider */}
      <div className="flex-1" />

      {/* Right side — Social + About + Clock */}
      <div className="flex items-stretch gap-2">

        {/* Social links + About */}
        <div className="flex items-center gap-4 px-2">
          <button
            onClick={() => window.open('https://www.linkedin.com/in/matic-ahlin/', '_blank')}
            className="text-sm font-sans cursor-pointer hover:underline"
            style={{ color: t.text }}
          >
            LinkedIn
          </button>
          <button
            onClick={() => window.open('https://www.instagram.com/maticahlin/', '_blank')}
            className="text-sm font-sans cursor-pointer hover:underline"
            style={{ color: t.text }}
          >
            Instagram
          </button>
          <button
            onClick={onOpenAbout}
            className="hover:opacity-80 transition-opacity cursor-pointer"
            title="About"
          >
            <img src="/msagent-0.png" alt="About" className="w-5 h-5" />
          </button>
        </div>

        {/* Divider */}
        {!isMobile && (
          <div className="w-px my-1" style={{ backgroundColor: t.borderDark }} />
        )}

        {/* Clock — recessed inset panel */}
        {!isMobile && (
          <div 
            className="flex items-center px-3 text-sm font-sans my-1 border"
            style={{ 
              color: t.text,
              backgroundColor: t.bgInner,
              ...border.inset,
            }}
          >
            <Clock />
          </div>
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