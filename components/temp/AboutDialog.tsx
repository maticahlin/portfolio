"use client";

export default function AboutDialog({ onClose }: { onClose: () => void }) {
  return (
    <>
      {/* Dark overlay backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 z-40"
        onClick={onClose}
      />
      
      {/* Dialog */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-200 bg-grey-mid border-2 border-t-white border-l-white border-r-black border-b-black shadow-2xl z-50"
      >
        {/* Close button - top right */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 w-6 h-5 bg-grey-mid border border-t-white border-l-white border-r-black border-b-black flex items-center justify-center shadow-[inset_1px_1px_0_0_#dfdfdf,inset_-1px_-1px_0_0_#808080] cursor-pointer hover:bg-grey-light transition-colors"
        >
          <span className="text-xs leading-none">✕</span>
        </button>

        <div className="flex p-8">
          {/* Left side - Image */}
          <div className="w-32 shrink-0 mr-8">
            <img src="/profile.png" alt="" className="w-full aspect-square border-2 border-t-white border-l-white border-r-grey-dark border-b-grey-dark" />
          </div>

          {/* Right side - Content */}
          <div className="flex-1">
            <h1 className="text-7xl font-serif leading-tight">Matic Ahlin</h1>
            <p className="text-sm italic mb-6">Designing visuals. Building websites.</p>

            <p className="text-sm leading-relaxed mb-4">
              Born in 2001, I'm a visual designer and frontend developer based in Slovenia. After completing my Bachelor's degree in Visual Communications, I discovered a passion for merging design and code—exploring the web as a medium for interactivity, storytelling, and creative expression.
            </p>

            <p className="text-sm leading-relaxed mb-4">
              With a foundation in graphic design, motion graphics, and brand identity, I approach web development through a designer's lens. I believe the best digital experiences happen when visual craft meets technical precision, creating interfaces that are both beautiful and functional.
            </p>

            <p className="text-sm leading-relaxed mb-4 text-grey-dark">
              <a 
                href="/ahlin_cv_en.pdf" 
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:no-underline"
              >
                Resume ↓
              </a>
              {" · "}
              <a 
                href="mailto:maticahlin2@gmail.com"
                target="_blank"
                className="underline hover:no-underline"
              >
                maticahlin2@gmail.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}