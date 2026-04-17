export default function TopBar() {
  return (
    <div className="w-full h-6 bg-accent shrink-0 flex items-center overflow-hidden relative">
      <div className="flex animate-scroll-seamless">
        {/* First set */}
        <div className="flex shrink-0">
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={`a-${i}`} className="text-white text-sm font-sans whitespace-nowrap px-4">
              Page under construction, browsing is limited
            </span>
          ))}
        </div>
        {/* Second set - exact duplicate for seamless loop */}
        <div className="flex shrink-0">
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={`b-${i}`} className="text-white text-sm font-sans whitespace-nowrap px-4">
              Page under construction, browsing is limited
            </span>
          ))}
        </div>
        <div className="flex shrink-0">
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={`b-${i}`} className="text-white text-sm font-sans whitespace-nowrap px-4">
              Page under construction, browsing is limited
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}