import { useRef, useState, useEffect } from 'react';
import { toPng } from 'html-to-image';
import { ColorPalette } from "../../types";
import ColorDot from "../shared/ColorDot";
import ImageCover from "./ImageCover";
import { Download, Share2 } from 'lucide-react';

interface GalleryCardProps {
  palette: ColorPalette;
}

const GalleryCard = ({ palette }: GalleryCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  useEffect(() => {
    const generate = async () => {
      if (!cardRef.current) return;
      try {
        const dataUrl = await toPng(cardRef.current, { cacheBust: true, pixelRatio: 1.5 });
        setGeneratedImage(dataUrl);
      } catch (error) {
        console.error('Could not generate image', error);
      }
    };

    const timer = setTimeout(generate, 500); // Delay to ensure DOM is ready
    return () => clearTimeout(timer);
  }, [palette]);

  const handleShare = async () => {
    if (!generatedImage) return alert('图片仍在生成中，请稍候...');
    try {
      const blob = await (await fetch(generatedImage)).blob();
      const file = new File([blob], 'color-muse.png', { type: blob.type });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file] });
      } else {
        alert('你的浏览器不支持分享文件。');
      }
    } catch (error) {
      console.error('Share failed', error);
      alert('分享失败。');
    }
  };

  const handleDownload = () => {
    if (!generatedImage) return alert('图片仍在生成中，请稍候...');
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = 'color-muse.png';
    link.click();
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
      
      <div className="absolute -top-5 -right-5 flex flex-col gap-2">
        <button 
          onClick={handleShare}
          disabled={!generatedImage}
          className="bg-white p-3 rounded-full shadow-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
        >
          <Share2 className={`w-5 h-5 ${!generatedImage ? 'text-gray-300' : 'text-gray-600'}`} />
        </button>
        <button 
          onClick={handleDownload}
          disabled={!generatedImage}
          className="bg-white p-3 rounded-full shadow-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
        >
          <Download className={`w-5 h-5 ${!generatedImage ? 'text-gray-300' : 'text-gray-600'}`} />
        </button>
      </div>
    </div>
  );
};

export default GalleryCard;
