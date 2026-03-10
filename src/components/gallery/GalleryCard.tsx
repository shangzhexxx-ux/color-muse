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
      const dataUrl = await toPng(cardRef.current, { 
        cacheBust: true, 
        pixelRatio: 2, 
      });

      // 检测是否为移动设备
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

      if (isMobile) {
        // 移动端：在新标签页打开，让用户长按保存
        const newWindow = window.open();
        if (newWindow) {
          newWindow.document.write(`<style>body{margin:0; background:#eee;} img{max-width:100%; height:auto;}</style><img src="${dataUrl}" alt="Color Muse Palette" />`);
        }
      } else {
        // 桌面端：创建虚拟链接并点击下载
        const link = document.createElement('a');
        link.download = `color-muse-${Date.now()}.png`;
        link.href = dataUrl;
        link.click();
      }

    } catch (err) {
      console.error('Oops, something went wrong!', err);
      alert('图片生成失败，请稍后重试');
    }
  };

  return (
    <div className="relative">
      <div ref={cardRef} className="bg-white rounded-2xl shadow-[0_20px_40px_-10px_rgba(0,0,0,0.08)] w-full max-w-md">
        <ImageCover imageUrl={palette.imageUrl} />
        <div className="flex justify-center items-center gap-x-6 p-3">
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
