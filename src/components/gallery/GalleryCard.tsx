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
    if (!cardRef.current) {
      alert('错误：找不到卡片元素。');
      return;
    }

    try {
      alert('步骤 1/5: 开始生成图片...');
      const dataUrl = await toPng(cardRef.current, { 
        cacheBust: true, 
        pixelRatio: 2, 
      });
      alert('步骤 2/5: 图片已生成，正在转换为文件...');

      const blob = await (await fetch(dataUrl)).blob();
      const imageFile = new File([blob], `color-muse-${Date.now()}.png`, { type: 'image/png' });
      alert('步骤 3/5: 文件已创建，正在检查分享功能...');

      if (navigator.canShare && navigator.canShare({ files: [imageFile] })) {
        alert('步骤 4/5: 支持分享功能，即将调用分享面板...');
        await navigator.share({
          files: [imageFile],
          title: 'Color Muse Palette',
          text: 'A color palette from Color Muse',
        });
        alert('步骤 5/5: 分享面板已调用。');
      } else {
        alert('步骤 4/5 (备选): 不支持分享功能，将尝试直接下载。');
        const link = document.createElement('a');
        link.download = `color-muse-${Date.now()}.png`;
        link.href = dataUrl;
        link.click();
        alert('步骤 5/5 (备选): 下载链接已点击。');
      }
    } catch (err: any) {
      alert(`发生错误: ${err.message}`);
    }
  };

  return (
    <div className="relative">
      <div ref={cardRef} className="bg-white rounded-2xl shadow-[0_20px_40px_-10px_rgba(0,0,0,0.08)] w-full max-w-sm">
        <ImageCover imageUrl={palette.imageUrl} />
        <div className="flex justify-center items-center gap-x-3 pt-3 pb-5 px-3">
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
