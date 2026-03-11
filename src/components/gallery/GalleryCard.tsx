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
  const [isGenerating, setIsGenerating] = useState(false);
  const generateRef = useRef<() => Promise<string | null>>(async () => null);
  const isGeneratingRef = useRef(false);
  const generatedImageRef = useRef<string | null>(null);
  const [weChatToastVisible, setWeChatToastVisible] = useState(false);
  const [weChatToastText, setWeChatToastText] = useState('');
  const [weChatOverlayUrl, setWeChatOverlayUrl] = useState<string | null>(null);
  const [weChatTipVisible, setWeChatTipVisible] = useState(false);

  const downloadDataUrl = async (dataUrl: string, filename: string) => {
    const blob = await (await fetch(dataUrl)).blob();
    const blobUrl = URL.createObjectURL(blob);
    try {
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      link.rel = 'noopener';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
    } catch {
      window.location.href = blobUrl;
      window.setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
    }
  };

  const isWeChat = /MicroMessenger/i.test(navigator.userAgent);
  const isWeChatMobile = isWeChat && ((window.matchMedia?.('(pointer: coarse)')?.matches ?? false) || /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent));
  const isAndroidChrome =
    /Android/i.test(navigator.userAgent) &&
    /Chrome/i.test(navigator.userAgent) &&
    !/Edg/i.test(navigator.userAgent) &&
    !/OPR/i.test(navigator.userAgent) &&
    !/SamsungBrowser/i.test(navigator.userAgent) &&
    !isWeChat;

  const dataUrlToPngBytes = (dataUrl: string) => {
    const commaIndex = dataUrl.indexOf(',');
    const base64 = commaIndex >= 0 ? dataUrl.slice(commaIndex + 1) : dataUrl;
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  };

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
    if (!weChatToastVisible) return;
    const timer = window.setTimeout(() => setWeChatToastVisible(false), 1800);
    return () => window.clearTimeout(timer);
  }, [weChatToastVisible]);

  useEffect(() => {
    if (!weChatOverlayUrl) return;
    if (!isWeChatMobile) return;
    setWeChatTipVisible(true);
    const t = window.setTimeout(() => setWeChatTipVisible(false), 3000);
    return () => window.clearTimeout(t);
  }, [weChatOverlayUrl, isWeChatMobile]);

  useEffect(() => {
    const onPopState = () => {
      setWeChatOverlayUrl(null);
      setWeChatTipVisible(false);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    if (!isWeChat) return;
    if (!generatedImage) return;
    if (!('serviceWorker' in navigator)) return;

    const send = async () => {
      try {
        const bytes = dataUrlToPngBytes(generatedImage);
        const reg = await navigator.serviceWorker.ready;
        const sw = reg.active ?? navigator.serviceWorker.controller;
        if (!sw) return;

        const channel = new MessageChannel();
        await new Promise<void>((resolve) => {
          channel.port1.onmessage = () => resolve();
          sw.postMessage(
            { type: 'SET_EXPORT', buffer: bytes.buffer, contentType: 'image/png' },
            [channel.port2, bytes.buffer]
          );
        });
      } catch {
        // ignore
      }
    };

    void send();
    return () => {};
  }, [generatedImage, isWeChat]);

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

    const generate = async (targetScale?: number): Promise<string | null> => {
      if (isGeneratingRef.current) return generatedImageRef.current;
      isGeneratingRef.current = true;
      setIsGenerating(true);
      try {
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        const isWeChatLocal = /MicroMessenger/i.test(navigator.userAgent);
        const defaultScale = isWeChatLocal || isMobile ? 2.5 : 3.5;
        const scale = targetScale ?? defaultScale;
        const bgColor = '#FBF9F6';

        let cardWidthCss = cardRef.current?.getBoundingClientRect().width ?? 0;
        if (cardWidthCss < 10) {
          await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
          await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
          cardWidthCss = cardRef.current?.getBoundingClientRect().width ?? 0;
        }
        if (cardWidthCss < 200) cardWidthCss = 384;
        const cardWidth = Math.round(cardWidthCss * scale);
        const cardShadowBlur = 40 * scale;
        const cardShadowOffsetY = 20 * scale;
        const outerPadding = Math.round((cardShadowBlur + cardShadowOffsetY) * 0.5 + 4 * scale);
        const cardRadius = 16 * scale;
        const cardPaddingX = 32 * scale;
        const coverPaddingTop = 16 * scale;
        const coverPaddingBottom = 16 * scale;
        const headerFontSize = 11 * scale;
        const headerGap = 16 * scale;
        const imageRadius = 8 * scale;

        const paletteTopPadding = 2 * scale;
        const paletteBottomPadding = 20 * scale;
        const dotSize = 40 * scale;
        const dotRadius = dotSize / 2;
        const dotTextSize = 10 * scale;
        const dotTextGap = 8 * scale;
        const dotGapX = 20 * scale;

        const img = await loadImage(palette.imageUrl);
        const imageWidth = Math.max(1, cardWidth - cardPaddingX * 2);
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
        if (!ctx) return null;

        const cardX = outerPadding;
        const cardY = outerPadding;

        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

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

        const dataUrl = canvas.toDataURL('image/png');
        generatedImageRef.current = dataUrl;
        setGeneratedImage(dataUrl);
        return dataUrl;
      } catch (error) {
        console.error('Could not generate image', error);
        return null;
      } finally {
        isGeneratingRef.current = false;
        setIsGenerating(false);
      }
    };

    generateRef.current = async () => {
      const result = await generate();
      if (result) return result;
      const retry = await generate(1.5);
      return retry;
    };

    generatedImageRef.current = null;
    setGeneratedImage(null);
    const timer = setTimeout(() => {
      void generateRef.current();
    }, 300);
    return () => clearTimeout(timer);
  }, [palette]);

  const ensureGeneratedImage = async () => {
    if (generatedImageRef.current) return generatedImageRef.current;

    for (let i = 0; i < 20; i += 1) {
      const result = await generateRef.current();
      if (result) return result;
      if (generatedImageRef.current) return generatedImageRef.current;
      await new Promise<void>((resolve) => setTimeout(resolve, 50));
    }

    return generatedImageRef.current;
  };

  const handleShare = async () => {
    try {
      const url = await ensureGeneratedImage();
      if (!url) return;

      if (isWeChat) {
        const dataUrl = generatedImageRef.current;
        if (!dataUrl) {
          setWeChatToastText('图片生成中，请稍后再试');
          setWeChatToastVisible(true);
          return;
        }
        setWeChatToastText('点击右上角 “...” 保存图片到相册');
        setWeChatToastVisible(true);
        window.location.assign(dataUrl);
        return;
      }

      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      const blob = await (await fetch(url)).blob();
      const imageFile = new File([blob], `color-muse-${Date.now()}.png`, { type: 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [imageFile] })) {
        await navigator.share({ files: [imageFile] });
      } else {
        if (isMobile) {
          await openImageOnlyPreview(url);
        } else if (navigator.share) {
          await navigator.share({ url });
        } else {
          await openImageOnlyPreview(url);
        }
      }
    } catch (err) {
      console.error('Share failed:', err);
      if (generatedImage) await openImageOnlyPreview(generatedImage);
    }
  };

  const handleDownload = async () => {
    try {
      if (isAndroidChrome) {
        const previewWindow = window.open('about:blank');
        const dataUrl = generatedImageRef.current ?? (await ensureGeneratedImage());
        if (!dataUrl) return;

        const bytes = dataUrlToPngBytes(dataUrl);
        const blobUrl = URL.createObjectURL(new Blob([bytes], { type: 'image/png' }));
        if (previewWindow) {
          previewWindow.location.replace(blobUrl);
        } else {
          window.location.href = blobUrl;
        }
        window.setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
        return;
      }

      if (isWeChat) {
        const dataUrl = generatedImageRef.current ?? (await ensureGeneratedImage());
        if (!dataUrl) {
          setWeChatToastText('图片生成中，请稍后再点下载');
          setWeChatToastVisible(true);
          return;
        }

        if (!isWeChatMobile) {
          await downloadDataUrl(dataUrl, `color-muse-${Date.now()}.png`);
          return;
        }

        setWeChatOverlayUrl(dataUrl);
        window.history.pushState({ cmWeChatPreview: true }, '', '#preview');
        return;
      }

      const url = await ensureGeneratedImage();
      if (!url) return;

      await downloadDataUrl(url, `color-muse-${Date.now()}.png`);
    } catch (err) {
      console.error('Download failed:', err);
      if (generatedImage) await openImageOnlyPreview(generatedImage);
    }
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
        {isWeChat ? (
          <button 
            onClick={handleDownload}
            disabled={false}
            className="bg-white p-3 rounded-full shadow-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            <Download className={`w-5 h-5 ${isGenerating || !generatedImage ? 'text-gray-300' : 'text-gray-600'}`} />
          </button>
        ) : (
          <>
            <button 
              onClick={handleShare}
              disabled={isGenerating}
              className="bg-white p-3 rounded-full shadow-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              <Share2 className={`w-5 h-5 ${isGenerating || !generatedImage ? 'text-gray-300' : 'text-gray-600'}`} />
            </button>
            <button 
              onClick={handleDownload}
              disabled={isGenerating}
              className="bg-white p-3 rounded-full shadow-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              <Download className={`w-5 h-5 ${isGenerating || !generatedImage ? 'text-gray-300' : 'text-gray-600'}`} />
            </button>
          </>
        )}
      </div>

      {isWeChat && weChatToastVisible ? (
        <div className="pointer-events-none fixed left-1/2 top-4 -translate-x-1/2 z-50 bg-white/90 border border-black/5 text-black/55 px-4 py-2 rounded-full text-[13px] font-sans tracking-[0.08em] whitespace-nowrap">
          {weChatToastText}
        </div>
      ) : null}

      {isWeChat && weChatOverlayUrl ? (
        <div
          className="fixed inset-0 z-50 bg-[#e9e9e9]"
          onClick={() => {
            setWeChatOverlayUrl(null);
            setWeChatTipVisible(false);
            if (window.location.hash === '#preview') {
              history.back();
            }
          }}
        >
          {weChatTipVisible ? (
            <div className="pointer-events-none absolute left-1/2 top-4 -translate-x-1/2 bg-white/90 border border-black/5 text-black/55 px-4 py-2 rounded-full text-[13px] font-sans tracking-[0.08em] whitespace-nowrap">
              长按图片保存到相册
            </div>
          ) : null}
          <img
            src={weChatOverlayUrl}
            alt="Color Muse Export"
            className="w-screen h-screen object-contain"
            style={{ WebkitTouchCallout: 'default' }}
            draggable={false}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      ) : null}

    </div>
  );
};

export default GalleryCard;
