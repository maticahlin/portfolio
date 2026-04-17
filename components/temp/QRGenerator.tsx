"use client";
import { useState, useEffect, useRef } from "react";
import QRCode from "qrcode";

export default function QRGenerator() {
  const [text, setText] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [qrSvg, setQrSvg] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (text && canvasRef.current) {
      // Generate canvas preview
      QRCode.toCanvas(canvasRef.current, text, { width: 300 }, (error) => {
        if (error) console.error(error);
      });
      
      // Generate PNG data URL
      QRCode.toDataURL(text, { width: 300 }, (error, url) => {
        if (error) console.error(error);
        setQrDataUrl(url);
      });

      // Generate SVG string
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
    <div className="flex flex-col h-full bg-grey-light p-6 gap-4">
      <div>
        <label className="text-sm font-bold mb-2 block">Enter text or URL:</label>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="https://example.com or any text..."
          className="w-full px-3 py-2 text-sm bg-white border-2 border-t-grey-dark border-l-grey-dark border-b-white border-r-white focus:outline-none"
        />
      </div>

      {text && (
        <>
          <div className="flex-1 flex items-center justify-center bg-grey-light border-2 border-t-grey-dark border-l-grey-dark border-b-white border-r-white p-4">
            <canvas ref={canvasRef} />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleDownloadPNG}
              className="flex-1 px-6 py-2 text-sm bg-grey-light border-2 border-t-white border-l-white border-r-black border-b-black shadow-[inset_1px_1px_0_0_#dfdfdf,inset_-1px_-1px_0_0_#808080] cursor-pointer hover:bg-grey-mid transition-colors active:border-t-black active:border-l-black active:border-r-white active:border-b-white"
            >
              Download PNG
            </button>
            <button
              onClick={handleDownloadSVG}
              className="flex-1 px-6 py-2 text-sm bg-grey-light border-2 border-t-white border-l-white border-r-black border-b-black shadow-[inset_1px_1px_0_0_#dfdfdf,inset_-1px_-1px_0_0_#808080] cursor-pointer hover:bg-grey-mid transition-colors active:border-t-black active:border-l-black active:border-r-white active:border-b-white"
            >
              Download SVG
            </button>
          </div>
        </>
      )}

      {!text && (
        <div className="flex-1 flex items-center justify-center bg-grey-light text-grey-dark text-sm">
          Enter text above to generate QR code
        </div>
      )}
    </div>
  );
}