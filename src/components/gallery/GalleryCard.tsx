import { useRef, useState, useEffect } from 'react';
import { toPng } from 'html-to-image';
import { ColorPalette } from "../../types";
import ColorDot from "../shared/ColorDot";
import ImageCover from "./ImageCover";
import { Download, Share2, Loader2 } from 'lucide-react';

interface GalleryCardProps {
  palette: ColorPalette;
}

const GalleryCard = ({ palette }: GalleryCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // 当卡片挂载后自动预生成图片，以便用户可以一键下载/分享
  useEffect(() => {
    const timer = setTimeout(() => {
      generateImage();
    }, 1000); // 稍微延迟以确保 DOM 渲染完成
    return () => clearTimeout(timer);
  }, [palette]);

  const generateImage = async () => {
    if (!cardRef.current) return;
    setIsGenerating(true);
    try {
      const dataUrl = await toPng(cardRef.current, { 
        cacheBust: true, 
        pixelRatio: 2,
      });
      setGeneratedImage(dataUrl);
    } catch (err) {
      console.error('Image generation failed:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAction = async () => {
    if (!generatedImage) return;

    // 检测是否为移动设备
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (isMobile) {
      try {
        const blob = await (await fetch(generatedImage)).blob();
        const imageFile = new File([blob], `color-muse-${Date.now()}.png`, { type: 'image/png' });

        if (navigator.canShare && navigator.canShare({ files: [imageFile] })) {
          await navigator.share({ files: [imageFile] });
        } else {
          // 降级：在新标签页打开，让用户长按保存
          const newWindow = window.open();
          if (newWindow) {
            newWindow.document.write(`<style>body{margin:0; background:#eee; display:flex; align-items:center; justify-content:center; height:100vh;} img{max-width:100%; height:auto; box-shadow:0 10px 30px rgba(0,0,0,0.1);}</style><img src="${generatedImage}" alt="Color Muse Palette" />`);
          }
        }
      } catch (err) {
        console.error('Share failed:', err);
      }
    } else {
      // 桌面端：直接触发下载
      const link = document.createElement('a');
      link.download = `color-muse-${Date.now()}.png`;
      link.href = generatedImage;
      link.click();
    }
  };

  return (    <div className="relative">
      <div ref={cardRef} className="bg-white rounded-2xl shadow-[0_20px_40px_-10px_rgba(0,0,0,0.08)] w-full max-w-sm">
        <ImageCover imageUrl={palette.imageUrl} />
        <div className="flex justify-center items-center gap-x-3 pt-3 pb-5 px-3">
          {palette.colors.map((color) => (
            <ColorDot key={color} color={color} />
          ))}
        </div>
      </div>
      
      <div className="absolute -top-5 -right-5">
        <button 
          onClick={handleAction}
          disabled={!generatedImage}
          className={`bg-white p-3 rounded-full shadow-lg transition-all ${
            !generatedImage ? 'opacity-50 cursor-not-allowed scale-90' : 'hover:bg-gray-100 hover:scale-105 active:scale-95'
          }`}
        >
          {isGenerating ? (
            <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
          ) : (
            <Download className={`w-5 h-5 ${!generatedImage ? 'text-gray-300' : 'text-gray-600'}`} />
          )}
        </button>
      </div>
    </div>
  );
};

export default GalleryCard;
