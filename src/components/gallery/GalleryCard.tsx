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

  const openImageOnlyPreview = (dataUrl: string) => {
    const newWindow = window.open();
    if (!newWindow) return;
    newWindow.document.open();
    newWindow.document.write(
      `<html><head><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body style="margin:0;background:#000;display:flex;align-items:center;justify-content:center;min-height:100vh"><img src="${dataUrl}" style="max-width:100%;height:auto" /></body></html>`
    );
    newWindow.document.close();
  };

  useEffect(() => {
    const generate = async () => {
      if (!cardRef.current) return;
      setGeneratedImage(null);
      const rect = cardRef.current.getBoundingClientRect();
      const exportRoot = document.createElement('div');
      exportRoot.style.position = 'fixed';
      exportRoot.style.left = '0';
      exportRoot.style.top = '0';
      exportRoot.style.padding = '40px';
      exportRoot.style.background = '#FBF9F6';
      exportRoot.style.display = 'flex';
      exportRoot.style.alignItems = 'center';
      exportRoot.style.justifyContent = 'center';
      exportRoot.style.pointerEvents = 'none';
      exportRoot.style.boxSizing = 'border-box';
      exportRoot.style.transform = 'translateX(-200vw)';

      const cardClone = cardRef.current.cloneNode(true) as HTMLDivElement;
      cardClone.style.width = `${Math.ceil(rect.width)}px`;
      cardClone.style.maxWidth = `${Math.ceil(rect.width)}px`;
      cardClone.style.minWidth = `${Math.ceil(rect.width)}px`;
      cardClone.style.transform = 'scale(0.85)';
      cardClone.style.transformOrigin = 'center';
      exportRoot.appendChild(cardClone);

      document.body.appendChild(exportRoot);

      try {
        const images = Array.from(exportRoot.querySelectorAll('img'));
        await Promise.all(
          images.map((img) => {
            const anyImg = img as HTMLImageElement;
            if (anyImg.complete && anyImg.naturalWidth > 0) return Promise.resolve();
            return new Promise<void>((resolve) => {
              anyImg.onload = () => resolve();
              anyImg.onerror = () => resolve();
            });
          })
        );

        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

        const dataUrl = await (toPng as unknown as (node: HTMLElement, options: unknown) => Promise<string>)(exportRoot, {
          cacheBust: true,
          pixelRatio: 4,
          backgroundColor: '#FBF9F6',
          filter: (node: unknown) => {
            if (!(node instanceof Element)) return true;
            const tagName = node.tagName.toUpperCase();
            const isButton = tagName === 'BUTTON';
            const isButtonIcon = tagName === 'SVG' || node.parentElement?.tagName.toUpperCase() === 'BUTTON';
            return !isButton && !isButtonIcon;
          },
        });
        setGeneratedImage(dataUrl);
      } catch (error) {
        console.error('Could not generate image', error);
      } finally {
        exportRoot.remove();
      }
    };

    const timer = setTimeout(generate, 1000); // 增加等待时间确保渲染完全
    return () => clearTimeout(timer);
  }, [palette]);

  const handleShare = async () => {
    if (!generatedImage) return;
    try {
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (isMobile) {
        openImageOnlyPreview(generatedImage);
        return;
      }

      const blob = await (await fetch(generatedImage)).blob();
      const imageFile = new File([blob], `color-muse-${Date.now()}.png`, { type: 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [imageFile] })) {
        await navigator.share({ files: [imageFile] });
      } else {
        openImageOnlyPreview(generatedImage);
      }
    } catch (err) {
      console.error('Share failed:', err);
    }
  };

  const handleDownload = () => {
    if (!generatedImage) return;
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile) {
      openImageOnlyPreview(generatedImage);
      return;
    }
    const link = document.createElement('a');
    link.download = `color-muse-${Date.now()}.png`;
    link.href = generatedImage;
    link.click();
  };

  return (
    <div className="relative">
      <div ref={cardRef} className="bg-white rounded-2xl shadow-[0_20px_40px_-10px_rgba(0,0,0,0.08)] w-full max-w-sm">
        <ImageCover imageUrl={palette.imageUrl} />
        <div className="flex justify-center items-center gap-x-5 pt-[2px] pb-5 px-6">
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
