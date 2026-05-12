"use client";
import { useEffect, useRef } from 'react';

export default function P5Sketch({ code }: { code: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sketchRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current || typeof window === 'undefined') return;

    // Clear container
    containerRef.current.innerHTML = '';

    try {
      // Wrap code in instance mode
      const sketchCode = `
        return function(p) {
          ${code.replace(/createCanvas\([^)]+\)/g, (match) => {
            // Remove .parent() calls from createCanvas
            return match.replace(/\.parent\([^)]+\)/, '');
          })}
        }
      `;

      const sketchFunction = new Function(sketchCode)();
      sketchRef.current = new (window as any).p5(sketchFunction, containerRef.current);
    } catch (error) {
      console.error('Error running p5 sketch:', error);
      if (containerRef.current) {
        containerRef.current.innerHTML = `
          <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #666; font-size: 14px;">
            Sketch error - check console
          </div>
        `;
      }
    }

    return () => {
      if (sketchRef.current && sketchRef.current.remove) {
        sketchRef.current.remove();
      }
    };
  }, [code]);

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full flex items-center justify-center bg-grey-mid"
    />
  );
}