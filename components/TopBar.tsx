export default function TopBar() {
  return (
    <div className="w-full h-6 shrink-0 flex items-center overflow-hidden relative" style={{ backgroundColor: '#323232' }}>
      <div className="flex animate-scroll-seamless">
        {/* First set */}
        <div className="flex shrink-0">
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={`a-${i}`} className="text-sm font-sans whitespace-nowrap px-4" style={{ color: '#888888' }}>
              Page under construction, browsing is limited
            </span>
          ))}
        </div>
        {/* Second set */}
        <div className="flex shrink-0">
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={`a-${i}`} className="text-sm font-sans whitespace-nowrap px-4" style={{ color: '#888888' }}>
              Page under construction, browsing is limited
            </span>
          ))}
        </div>
        <div className="flex shrink-0">
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={`a-${i}`} className="text-sm font-sans whitespace-nowrap px-4" style={{ color: '#888888' }}>
              Page under construction, browsing is limited
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}