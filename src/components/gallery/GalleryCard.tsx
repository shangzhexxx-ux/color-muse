import { useRef } from 'react';
import { toPng } from 'html-to-image';
import { ColorPalette } from "../../types";
import ColorDot from "../shared/ColorDot";
import ImageCover from "./ImageCover";
import { Download } from 'lucide-react';

interface GalleryCardProps {
  palette: ColorPalette;
}

const GalleryCard = ({ palette }: GalleryCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleSaveImage = () => {
    if (cardRef.current) {
      toPng(cardRef.current, { cacheBust: true, })
        .then((dataUrl) => {
          const newWindow = window.open();
          if (newWindow) {
            newWindow.document.write(`<img src="${dataUrl}" alt="Color Muse Palette" />`);
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };

  return (
    <div className="relative">
      <div ref={cardRef} className="bg-white rounded-2xl shadow-[0_20px_40px_-10px_rgba(0,0,0,0.08)] w-full max-w-md">
        <ImageCover imageUrl={palette.imageUrl} />
        <div className="flex justify-around p-6">
          {palette.colors.map((color) => (
            <ColorDot key={color} color={color} />
          ))}
        </div>
      </div>
      <button 
        onClick={handleSaveImage}
        className="absolute -top-4 -right-4 bg-white p-3 rounded-full shadow-lg hover:bg-gray-100 transition-colors"
      >
        <Download className="w-5 h-5 text-gray-600" />
      </button>
    </div>
  );
};

export default GalleryCard;
