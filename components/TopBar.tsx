export default function TopBar() {
  return (
    <div className="w-full h-7.5 bg-desktop-dark flex items-center px-2.5 gap-2 shrink-0">
      <img src="/profile.png" alt="" className="w-5 h-5 rounded-full shrink-0" />
      <span className="text-white text-sm font-sans">Matic Ahlin</span>
    </div>
  );
}