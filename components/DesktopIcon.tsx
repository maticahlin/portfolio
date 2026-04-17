type DesktopIconProps = {
  label: string;
  icon: string;
  onClick: () => void;
};

export default function DesktopIcon({ label, icon, onClick }: DesktopIconProps) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center cursor-pointer group"
    >
      <img src={icon} alt={label} className="w-14 h-14" />
      <span className="mt-1.5 text-white text-[14px] font-sans text-center">{label}</span>
    </button>
  );
}