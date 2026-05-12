"use client";
import { useState, useEffect, useRef } from "react";
import QRCode from "qrcode";
import { t, border } from '@/lib/theme';

export default function QRGenerator() {
  const [text, setText]           = useState("");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [qrSvg, setQrSvg]         = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (text && canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, text, { width: 300 }, (err) => { if (err) console.error(err); });
      QRCode.toDataURL(text, { width: 300 }, (err, url) => { if (err) console.error(err); setQrDataUrl(url); });
      QRCode.toString(text, { type: 'svg', width: 300 }, (err, svg) => { if (err) console.error(err); setQrSvg(svg); });
    }
  }, [text]);

  const handleDownloadPNG = () => {
    if (!qrDataUrl) return;
    const link = document.createElement("a");
    link.download = "qr-code.png"; link.href = qrDataUrl; link.click();
  };

  const handleDownloadSVG = () => {
    if (!qrSvg) return;
    const blob = new Blob([qrSvg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = "qr-code.svg"; link.href = url; link.click();
    URL.revokeObjectURL(url);
  };

  const inputStyle  = { backgroundColor: t.bgInner, color: t.text, ...border.inset };
  const buttonStyle = { backgroundColor: t.bgInner, color: t.text, ...border.raised };

  return (
    <div className="flex flex-col h-full p-6 gap-4" style={{ backgroundColor: t.bgWindow, color: t.text }}>
      <div>
        <label className="text-sm font-bold mb-2 block">Enter text or URL:</label>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="https://example.com or any text..."
          className="w-full px-3 py-2 text-sm border focus:outline-none"
          style={inputStyle}
        />
      </div>

      {text && (
        <>
          <div
            className="flex-1 flex items-center justify-center border p-4"
            style={{ backgroundColor: t.bgWindow, ...border.inset }}
          >
            <canvas ref={canvasRef} />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleDownloadPNG}
              className="flex-1 px-6 py-2 text-sm border cursor-pointer hover:brightness-110 transition-all"
              style={buttonStyle}
            >
              Download PNG
            </button>
            <button
              onClick={handleDownloadSVG}
              className="flex-1 px-6 py-2 text-sm border cursor-pointer hover:brightness-110 transition-all"
              style={buttonStyle}
            >
              Download SVG
            </button>
          </div>
        </>
      )}

      {!text && (
        <div
          className="flex-1 flex items-center justify-center text-sm"
          style={{ backgroundColor: t.bgWindow, color: t.textMuted }}
        >
          Enter text above to generate QR code
        </div>
      )}
    </div>
  );
}
