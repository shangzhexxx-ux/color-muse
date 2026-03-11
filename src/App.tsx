import React, { useEffect, useRef, useState } from 'react';
import GalleryCard from "./components/gallery/GalleryCard";
import Uploader from "./components/shared/Uploader";
import { ColorPalette } from "./types";
import ColorThief from 'colorthief';

const App: React.FC = () => {
  const [palette, setPalette] = useState<ColorPalette | null>(null);
  const isWeChat = /MicroMessenger/i.test(navigator.userAgent);
  const historyInitRef = useRef(false);
  const [wxDomainTip, setWxDomainTip] = useState(false);

  useEffect(() => {
    if (!isWeChat) return;
    if (historyInitRef.current) return;
    historyInitRef.current = true;

    try {
      window.history.replaceState({ cmHome: true }, '', '#home');
    } catch {
      // ignore
    }

    const onPopState = (e: PopStateEvent) => {
      const state = (e.state ?? {}) as { cmHome?: boolean };
      if (state.cmHome) setPalette(null);
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [isWeChat]);

  useEffect(() => {
    if (!isWeChat) return;
    const state = (window.history.state ?? {}) as { cmHome?: boolean; cmResult?: boolean };

    if (palette) {
      if (!state.cmResult) {
        try {
          window.history.pushState({ cmResult: true }, '', '#result');
        } catch {
          // ignore
        }
      }
      return;
    }

    if (!state.cmHome) {
      try {
        window.history.replaceState({ cmHome: true }, '', '#home');
      } catch {
        // ignore
      }
    }
  }, [isWeChat, palette]);

  useEffect(() => {
    if (!isWeChat) return;
    const isTcloudDomain = typeof location !== 'undefined' && /\.tcloudbaseapp\.com$/.test(location.hostname);
    if (isTcloudDomain) {
      setWxDomainTip(true);
      const t = window.setTimeout(() => setWxDomainTip(false), 4000);
      return () => window.clearTimeout(t);
    }
  }, [isWeChat]);

  const handleImageUpload = (imageUrl: string) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = imageUrl;
    img.onload = () => {
      // @ts-expect-error colorthief 的类型定义与实际用法不一致（实际可 new）
      const colorThief = new ColorThief();
      const rawPalette = colorThief.getPalette(img, 5);

      // 将 RGB 转换为 HSL 并进行排序以实现“邻近色”渐变效果
      type ColorHsl = { hex: string; h: number; s: number; l: number };

      const sortedColors = rawPalette
        .map((rgb: number[]): ColorHsl => {
          const r = rgb[0] / 255;
          const g = rgb[1] / 255;
          const b = rgb[2] / 255;
          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          let h = 0;
          let s = 0;
          const l = (max + min) / 2;

          if (max === min) {
            h = 0;
            s = 0;
          } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
              case r: h = (g - b) / d + (g < b ? 6 : 0); break;
              case g: h = (b - r) / d + 2; break;
              case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
          }
          return {
            hex: `#${rgb.map(c => c.toString(16).padStart(2, '0')).join('')}`,
            h, s, l
          };
        })
        .sort((a: ColorHsl, b: ColorHsl) => {
          // 优先按色相 (Hue) 排序，如果色相接近，则按亮度 (Lightness) 排序
          if (Math.abs(a.h - b.h) > 0.1) {
            return a.h - b.h;
          }
          return a.l - b.l;
        })
        .map((c: ColorHsl) => c.hex);

      setPalette({
        id: "1",
        imageUrl,
        title: "EMPTY",
        serialNumber: `No.${new Date().toISOString().slice(0, 10).replace(/-/g, '')}`,
        author: "@HUNTER",
        colors: sortedColors,
        createdAt: Date.now(),
      });
    };
  };

  return (
    <div className="bg-[#FBF9F6] min-h-screen flex items-center justify-center p-8">
      {wxDomainTip ? (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-white/90 border border-black/5 text-black/60 px-4 py-2 rounded-full text-[13px] font-sans tracking-[0.04em] shadow">
          若看到“继续访问”，请点继续；建议右上角在浏览器打开
        </div>
      ) : null}
      {palette ? (
        <div className="w-full max-w-[422px]">
          <div className="flex flex-col items-center gap-8">
            <GalleryCard palette={palette} />
            <button 
              onClick={() => setPalette(null)}
              className="text-gray-400 hover:text-gray-600 transition-colors text-sm font-sans"
            >
              ← 上传新图片
            </button>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-[422px] px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-sans font-black tracking-widest text-gray-800">COLOR MUSE</h1>
          </div>
          <Uploader onImageUpload={handleImageUpload} />
        </div>
      )}
    </div>
  );
};

export default App;
