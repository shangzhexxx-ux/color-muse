interface ColorDotProps {
  color: string;
}

const ColorDot = ({ color }: ColorDotProps) => {
  return (
    <div className="flex flex-col items-center space-y-2">
      <div
        className="w-10 h-10 rounded-full border border-gray-200 cursor-pointer transition-transform hover:scale-110"
        style={{ backgroundColor: color }}
        onClick={() => navigator.clipboard.writeText(color)}
      ></div>
      <div className="font-mono text-[10px] text-gray-600 tracking-tight">{color}</div>
    </div>
  );
};

export default ColorDot;
