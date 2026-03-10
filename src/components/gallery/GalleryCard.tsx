import { useRef, useState, useEffect } from 'react';
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

  const openImageOnlyPreview = async (dataUrl: string) => {
    const newWindow = window.open('about:blank');
    if (!newWindow) {
      window.location.href = dataUrl;
      return;
    }

    try {
      const blob = await (await fetch(dataUrl)).blob();
      const blobUrl = URL.createObjectURL(blob);
      newWindow.location.replace(blobUrl);
      window.setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
    } catch {
      newWindow.location.replace(dataUrl);
    }
  };

  useEffect(() => {
    const drawRoundedRect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
      const radius = Math.min(r, w / 2, h / 2);
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.arcTo(x + w, y, x + w, y + h, radius);
      ctx.arcTo(x + w, y + h, x, y + h, radius);
      ctx.arcTo(x, y + h, x, y, radius);
      ctx.arcTo(x, y, x + w, y, radius);
      ctx.closePath();
    };

    const drawTrackedText = (ctx: CanvasRenderingContext2D, text: string, xCenter: number, y: number, trackingPx: number) => {
      const chars = Array.from(text);
      const widths = chars.map((ch) => ctx.measureText(ch).width);
      const totalWidth = widths.reduce((sum, w) => sum + w, 0) + trackingPx * Math.max(0, chars.length - 1);
      let x = xCenter - totalWidth / 2;
      for (let i = 0; i < chars.length; i += 1) {
        ctx.fillText(chars[i], x, y);
        x += widths[i] + trackingPx;
      }
    };

    const loadImage = (src: string) =>
      new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.decoding = 'async';
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('image load failed'));
        img.src = src;
      });

    const generate = async () => {
      setGeneratedImage(null);
      try {
        const scale = 3;
        const bgColor = '#FBF9F6';

        const cardWidth = 384 * scale;
        const cardShadowBlur = 40 * scale;
        const cardShadowOffsetY = 20 * scale;
        const outerPadding = cardShadowBlur + cardShadowOffsetY + 8 * scale;
        const cardRadius = 16 * scale;
        const cardPaddingX = 32 * scale;
        const coverPaddingTop = 16 * scale;
        const coverPaddingBottom = 16 * scale;
        const headerFontSize = 11 * scale;
        const headerGap = 16 * scale;
        const imageRadius = 12 * scale;

        const paletteTopPadding = 2 * scale;
        const paletteBottomPadding = 20 * scale;
        const dotSize = 40 * scale;
        const dotRadius = dotSize / 2;
        const dotTextSize = 10 * scale;
        const dotTextGap = 8 * scale;
        const dotGapX = 20 * scale;

        const img = await loadImage(palette.imageUrl);
        const imageWidth = cardWidth - cardPaddingX * 2;
        const imageHeight = Math.round(imageWidth * (img.naturalHeight / img.naturalWidth));

        const paletteRowHeight = dotSize + dotTextGap + dotTextSize;
        const cardHeight =
          coverPaddingTop +
          headerFontSize +
          headerGap +
          imageHeight +
          coverPaddingBottom +
          paletteTopPadding +
          paletteRowHeight +
          paletteBottomPadding;

        const canvas = document.createElement('canvas');
        canvas.width = cardWidth + outerPadding * 2;
        canvas.height = cardHeight + outerPadding * 2;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const cardX = outerPadding;
        const cardY = outerPadding;

        ctx.save();
        ctx.shadowColor = 'rgba(0,0,0,0.08)';
        ctx.shadowBlur = cardShadowBlur;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = cardShadowOffsetY;
        ctx.fillStyle = '#FFFFFF';
        drawRoundedRect(ctx, cardX, cardY, cardWidth, cardHeight, cardRadius);
        ctx.fill();
        ctx.restore();

        let cursorY = cardY + coverPaddingTop;

        ctx.fillStyle = '#D1D5DB';
        ctx.font = `700 ${headerFontSize}px system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        drawTrackedText(ctx, '#COLOR MUSE', cardX + cardWidth / 2, cursorY, headerFontSize * 0.4);

        cursorY += headerFontSize + headerGap;

        const imageX = cardX + cardPaddingX;
        const imageY = cursorY;

        ctx.save();
        ctx.shadowColor = 'rgba(0,0,0,0.12)';
        ctx.shadowBlur = 9 * scale;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 4 * scale;
        ctx.fillStyle = '#FFFFFF';
        drawRoundedRect(ctx, imageX, imageY, imageWidth, imageHeight, imageRadius);
        ctx.fill();
        ctx.restore();

        ctx.save();
        drawRoundedRect(ctx, imageX, imageY, imageWidth, imageHeight, imageRadius);
        ctx.clip();
        ctx.drawImage(img, imageX, imageY, imageWidth, imageHeight);
        ctx.restore();

        cursorY += imageHeight + coverPaddingBottom + paletteTopPadding;

        const dotsCount = palette.colors.length;
        const dotsTotalWidth = dotsCount * dotSize + (dotsCount - 1) * dotGapX;
        const dotsStartX = cardX + (cardWidth - dotsTotalWidth) / 2;

        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.font = `${dotTextSize}px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace`;
        ctx.fillStyle = '#4B5563';

        palette.colors.forEach((color, idx) => {
          const cx = dotsStartX + idx * (dotSize + dotGapX) + dotRadius;
          const cy = cursorY + dotRadius;

          ctx.beginPath();
          ctx.arc(cx, cy, dotRadius, 0, Math.PI * 2);
          ctx.fillStyle = color;
          ctx.fill();

          ctx.lineWidth = 1 * scale;
          ctx.strokeStyle = '#E5E7EB';
          ctx.stroke();

          ctx.fillStyle = '#4B5563';
          ctx.fillText(color, cx, cursorY + dotSize + dotTextGap);
        });

        setGeneratedImage(canvas.toDataURL('image/png'));
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
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (isMobile) {
        await openImageOnlyPreview(generatedImage);
        return;
      }

      const blob = await (await fetch(generatedImage)).blob();
      const imageFile = new File([blob], `color-muse-${Date.now()}.png`, { type: 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [imageFile] })) {
        await navigator.share({ files: [imageFile] });
      } else {
        await openImageOnlyPreview(generatedImage);
      }
    } catch (err) {
      console.error('Share failed:', err);
    }
  };

  const handleDownload = () => {
    if (!generatedImage) return;
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile) {
      void openImageOnlyPreview(generatedImage);
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
