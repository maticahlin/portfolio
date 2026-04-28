"use client";
import { useState, useEffect, useRef } from "react";
import QRCode from "qrcode";

export default function QRGenerator({ theme = 'grey' }: { theme?: 'grey' | 'dark' }) {
  const [text, setText] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [qrSvg, setQrSvg] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const bgColor = theme === 'dark' ? '#474747' : '#e6e6e6';
  const innerBg = theme === 'dark' ? '#323232' : '#ffffff';
  const textColor = theme === 'dark' ? '#E2E2E2' : '#000000';
  const borderLight = theme === 'dark' ? '#9F9F9F' : 'white';
  const borderDark = theme === 'dark' ? '#000000' : '#a6a6a6';

  useEffect(() => {
    if (text && canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, text, { width: 300 }, (error) => {
        if (error) console.error(error);
      });
      
      QRCode.toDataURL(text, { width: 300 }, (error, url) => {
        if (error) console.error(error);
        setQrDataUrl(url);
      });

      QRCode.toString(text, { type: 'svg', width: 300 }, (error, svg) => {
        if (error) console.error(error);
        setQrSvg(svg);
      });
    }
  }, [text]);

  const handleDownloadPNG = () => {
    if (!qrDataUrl) return;
    
    const link = document.createElement("a");
    link.download = "qr-code.png";
    link.href = qrDataUrl;
    link.click();
  };

  const handleDownloadSVG = () => {
    if (!qrSvg) return;
    
    const blob = new Blob([qrSvg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = "qr-code.svg";
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div 
      className="flex flex-col h-full p-6 gap-4"
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      <div>
        <label className="text-sm font-bold mb-2 block">Enter text or URL:</label>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="https://example.com or any text..."
          className="w-full px-3 py-2 text-sm border focus:outline-none"
          style={{
            backgroundColor: innerBg,
            color: textColor,
            borderTopColor: borderDark,
            borderLeftColor: borderDark,
            borderBottomColor: borderLight,
            borderRightColor: borderLight
          }}
        />
      </div>

      {text && (
        <>
          <div 
            className="flex-1 flex items-center justify-center border p-4"
            style={{
              backgroundColor: bgColor,
              borderTopColor: borderDark,
              borderLeftColor: borderDark,
              borderBottomColor: borderLight,
              borderRightColor: borderLight
            }}
          >
            <canvas ref={canvasRef} />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleDownloadPNG}
              className="flex-1 px-6 py-2 text-sm border cursor-pointer hover:brightness-110 transition-all"
              style={{
                backgroundColor: innerBg,
                color: textColor,
                borderTopColor: borderLight,
                borderLeftColor: borderLight,
                borderRightColor: borderDark,
                borderBottomColor: borderDark,
                boxShadow: theme === 'dark'
                  ? `inset 1px 1px 0 0 ${borderLight}, inset -1px -1px 0 0 ${borderDark}`
                  : 'inset 1px 1px 0 0 #dfdfdf, inset -1px -1px 0 0 #808080'
              }}
            >
              Download PNG
            </button>
            <button
              onClick={handleDownloadSVG}
              className="flex-1 px-6 py-2 text-sm border cursor-pointer hover:brightness-110 transition-all"
              style={{
                backgroundColor: innerBg,
                color: textColor,
                borderTopColor: borderLight,
                borderLeftColor: borderLight,
                borderRightColor: borderDark,
                borderBottomColor: borderDark,
                boxShadow: theme === 'dark'
                  ? `inset 1px 1px 0 0 ${borderLight}, inset -1px -1px 0 0 ${borderDark}`
                  : 'inset 1px 1px 0 0 #dfdfdf, inset -1px -1px 0 0 #808080'
              }}
            >
              Download SVG
            </button>
          </div>
        </>
      )}

      {!text && (
        <div 
          className="flex-1 flex items-center justify-center text-sm"
          style={{ 
            backgroundColor: bgColor,
            color: theme === 'dark' ? '#9F9F9F' : '#a6a6a6'
          }}
        >
          Enter text above to generate QR code
        </div>
      )}
    </div>
  );
}