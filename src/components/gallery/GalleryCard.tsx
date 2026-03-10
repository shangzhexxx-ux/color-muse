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

  const handleSaveImage = async () => {
    if (!cardRef.current) return;

    try {
      const dataUrl = await toPng(cardRef.current, { cacheBust: true });
      const blob = await (await fetch(dataUrl)).blob();
      const imageFile = new File([blob], `color-muse-${Date.now()}.png`, { type: 'image/png' });

      // 检查是否支持 Web Share API 并且可以分享文件
      if (navigator.canShare && navigator.canShare({ files: [imageFile] })) {
        await navigator.share({
          files: [imageFile],
          title: 'Color Muse Palette',
          text: 'Check out this color palette I created!',
        });
      } else {
        // 降级方案：创建虚拟链接并点击，适用于桌面端
        const link = document.createElement('a');
        link.download = `color-muse-${Date.now()}.png`;
        link.href = dataUrl;
        link.click();
      }
    } catch (err) {
      console.error('Oops, something went wrong!', err);
      // 可以在这里添加用户友好的错误提示
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
