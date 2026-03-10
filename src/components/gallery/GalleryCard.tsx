import { useRef, useState } from 'react';
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
  const [isGenerating, setIsGenerating] = useState(false);

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
      alert('图片生成失败，请稍后重试。');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShare = async () => {
    if (!generatedImage) return;
    const blob = await (await fetch(generatedImage)).blob();
    const imageFile = new File([blob], `color-muse-${Date.now()}.png`, { type: 'image/png' });

    if (navigator.canShare && navigator.canShare({ files: [imageFile] })) {
      await navigator.share({ files: [imageFile] });
    } else {
      alert('你的浏览器不支持分享功能。');
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
        <div className="flex justify-center items-center gap-x-3 pt-3 pb-5 px-3">
          {palette.colors.map((color) => (
            <ColorDot key={color} color={color} />
          ))}
        </div>
      </div>
      
      <div className="absolute -top-5 -right-5 flex flex-col gap-2 bg-red-500 p-2 rounded-lg">
        {!generatedImage ? (
          <button 
            onClick={generateImage}
            disabled={isGenerating}
            className="bg-white p-3 rounded-full shadow-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            {isGenerating ? '...' : <Download className="w-5 h-5 text-gray-600" />}
          </button>
        ) : (
          <>
            <button onClick={handleShare} className="bg-white p-3 rounded-full shadow-lg hover:bg-gray-100 transition-colors">
              <Share2 className="w-5 h-5 text-gray-600" />
            </button>
            <button onClick={handleDownload} className="bg-white p-3 rounded-full shadow-lg hover:bg-gray-100 transition-colors">
              <Download className="w-5 h-5 text-gray-600" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default GalleryCard;
