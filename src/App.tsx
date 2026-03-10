import React, { useState } from 'react';
import GalleryCard from "./components/gallery/GalleryCard";
import Uploader from "./components/shared/Uploader";
import { ColorPalette } from "./types";
import ColorThief from 'colorthief';

const App: React.FC = () => {
  const [palette, setPalette] = useState<ColorPalette | null>(null);

  const handleImageUpload = (imageUrl: string) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = imageUrl;
    img.onload = () => {
      // @ts-ignore
      const colorThief = new ColorThief();
      const rawPalette = colorThief.getPalette(img, 5);

      // 将 RGB 转换为 HSL 并进行排序以实现“邻近色”渐变效果
      const sortedColors = rawPalette
        .map((rgb: number[]) => {
          const r = rgb[0] / 255;
          const g = rgb[1] / 255;
          const b = rgb[2] / 255;
          const max = Math.max(r, g, b), min = Math.min(r, g, b);
          let h = 0, s, l = (max + min) / 2;

          if (max === min) {
            h = s = 0;
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
        .sort((a: any, b: any) => {
          // 优先按色相 (Hue) 排序，如果色相接近，则按亮度 (Lightness) 排序
          if (Math.abs(a.h - b.h) > 0.1) {
            return a.h - b.h;
          }
          return a.l - b.l;
        })
        .map((c: any) => c.hex);

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
    <div className="bg-[#FBF9F6] min-h-screen flex items-center justify-center p-4">
      {palette ? (
        <div className="flex flex-col items-center gap-8">
          <GalleryCard palette={palette} />
          <button 
            onClick={() => setPalette(null)}
            className="text-gray-400 hover:text-gray-600 transition-colors text-sm font-sans"
          >
            ← 上传新图片
          </button>
        </div>
      ) : (
        <div className="w-full max-w-md px-4">
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
