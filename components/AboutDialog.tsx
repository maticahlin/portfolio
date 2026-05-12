"use client";
import { motion } from 'framer-motion';
import { useState } from 'react';
import { border, t } from '@/lib/theme';

export default function AboutDialog({ onClose }: { onClose: () => void }) {
  const [pressed, setPressed] = useState(false);

  return (
    <>
      <motion.div 
        className="absolute inset-0 bg-black/40 z-40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        onClick={onClose}
      />
      
      <motion.div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[92vw] md:w-200 max-h-[90vh] overflow-y-auto bg-grey-mid border border-t-white border-l-white border-r-black border-b-black shadow-2xl z-50"
        initial={{ scale: 0.95, opacity: 0  }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.15, ease: [0.32, 0.72, 0, 1] }}
      >
        <button
          onMouseDown={() => setPressed(true)}
          onMouseUp={() => { setPressed(false); onClose(); }}
          onMouseLeave={() => setPressed(false)}
          className="absolute top-2 right-2 w-6 h-5 border flex items-center justify-center cursor-pointer"
          style={{
            backgroundColor: '#cccccc',
            borderTopColor:    pressed ? '#a6a6a6' : 'white',
            borderLeftColor:   pressed ? '#a6a6a6' : 'white',
            borderRightColor:  pressed ? 'white' : '#a6a6a6',
            borderBottomColor: pressed ? 'white' : '#a6a6a6',
            color: '#000000',
          }}
        >
          <span className="text-xs leading-none">✕</span>
        </button>

        <div className="flex flex-col md:flex-row p-5 md:p-8">
          {/* Image */}
          <div className="w-24 md:w-32 shrink-0 mb-5 md:mb-0 md:mr-8">
            <img src="/profile.png" alt="" className="w-full aspect-square border border-t-white border-l-white border-r-grey-dark border-b-grey-dark" />
          </div>

          {/* Content */}
          <div className="flex-1">
            <h1 className="text-4xl md:text-7xl font-serif leading-tight">Matic Ahlin</h1>
            <p className="text-sm italic mb-4 md:mb-6">Designing visuals. Building websites.</p>

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
      </motion.div>
    </>
  );
}