import { useRef, useState, useEffect } from 'react';
import { toPng } from 'html-to-image';
import { ColorPalette } from "../../types";
import ColorDot from "../shared/ColorDot";
import ImageCover from "./ImageCover";
import { Download, Share2 } from 'lucide-react';

interface GalleryCardProps {
  palette: ColorPalette;
}

const proxy = (url: string) => {
  return fetch(url)
    .then((response) => response.blob())
    .then((blob) => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    }));
}

const GalleryCard = ({ palette }: GalleryCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  useEffect(() => {
    const generate = async () => {
      if (!cardRef.current) return;
      try {
        // @ts-ignore
        const dataUrl = await toPng(cardRef.current, { 
          cacheBust: true, 
          pixelRatio: 4, // 提高到 4 倍以获得极致清晰度
          backgroundColor: '#FBF9F6', // 使用与网页底色一致的颜色，消除圆角边缘瑕疵
          fetchRequest: proxy,
          style: {
            padding: '40px', // 进一步增加内边距，确保长投影也能被完整捕获
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          },
          // 排除掉所有按钮，防止意外捕获
          filter: (node: any) => {
            const isButton = node.tagName === 'BUTTON';
            const isButtonIcon = node.tagName === 'svg' || (node.parentElement && node.parentElement.tagName === 'BUTTON');
            return !isButton && !isButtonIcon;
          }
        });
        setGeneratedImage(dataUrl);
      } catch (error) {
        console.error('Could not generate image', error);
      }
    };

    const timer = setTimeout(generate, 1000); // 增加等待时间确保渲染完全
    return () => clearTimeout(timer);
  }, [palette]);

  const handleShare = async () => {
    if (!generatedImage) return;
    try {
      const blob = await (await fetch(generatedImage)).blob();
      const imageFile = new File([blob], `color-muse-${Date.now()}.png`, { type: 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [imageFile] })) {
        await navigator.share({ files: [imageFile] });
      } else {
        // 分享失败或不支持时，打开预览页供长按保存
        const newWindow = window.open();
        if (newWindow) {
          newWindow.document.write(`<html><body style="margin:0;background:#000;display:flex;align-items:center;justify-content:center;min-height:100vh"><img src="${generatedImage}" style="max-width:100%;height:auto" /></body></html>`);
        }
      }
    } catch (err) {
      console.error('Share failed:', err);
    }
  };

  const handleDownload = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.download = `color-muse-${Date.now()}.png`;
    link.href = generatedImage;
    link.click();
  };

  return (
    <div className="relative">
      <div ref={cardRef} className="bg-white rounded-2xl shadow-[0_20px_40px_-10px_rgba(0,0,0,0.08)] w-full max-w-sm">
        <ImageCover imageUrl={palette.imageUrl} />
        <div className="flex justify-center items-center gap-x-5 pt-2 pb-5 px-3">
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
