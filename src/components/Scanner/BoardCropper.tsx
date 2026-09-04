import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Crop, Sparkles, RotateCw, ZoomIn, ZoomOut, Check, ArrowLeft, Maximize2 } from 'lucide-react';

interface BoardCropperProps {
  imageSrc: string;
  onCropAndScan: (croppedBase64: string, isCropped: boolean) => void;
  onScanOriginal: () => void;
  onCancel: () => void;
}

export const BoardCropper: React.FC<BoardCropperProps> = ({
  imageSrc,
  onCropAndScan,
  onScanOriginal,
  onCancel,
}) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Crop box in percentages (0 to 100)
  // [x%, y%, size%] where size is both width and height (1:1 square)
  const [crop, setCrop] = useState<{ x: number; y: number; size: number }>({
    x: 10,
    y: 10,
    size: 80,
  });

  const [rotation, setRotation] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragMode, setDragMode] = useState<'move' | 'nw' | 'ne' | 'se' | 'sw' | null>(null);
  const dragStartRef = useRef<{ clientX: number; clientY: number; crop: { x: number; y: number; size: number } }>({
    clientX: 0,
    clientY: 0,
    crop: { x: 10, y: 10, size: 80 },
  });

  // Auto-center and fit crop box when image loads
  const handleImageLoad = () => {
    if (!imgRef.current) return;
    const { naturalWidth, naturalHeight } = imgRef.current;
    if (naturalWidth <= 0 || naturalHeight <= 0) return;

    // For a phone screenshot (e.g. 9:16 or 9:20), the board is usually centered horizontally and takes 85-95% of width
    const aspect = naturalWidth / naturalHeight;
    let newSize = 80;
    let newX = 10;
    let newY = 10;

    if (aspect < 0.75) {
      // Tall phone screenshot (board usually in upper-middle or center)
      newSize = 90;
      newX = 5;
      newY = 22; // roughly center-screen where board sits
    } else if (aspect > 1.25) {
      // Wide desktop screenshot
      newSize = 80;
      newX = 25;
      newY = 10;
    } else {
      // Near square
      newSize = 90;
      newX = 5;
      newY = 5;
    }

    setCrop({
      x: Math.max(0, Math.min(100 - newSize, newX)),
      y: Math.max(0, Math.min(100 - newSize, newY)),
      size: newSize,
    });
  };

  // Center the box
  const handleCenterBox = () => {
    const size = crop.size;
    setCrop({
      x: Math.max(0, (100 - size) / 2),
      y: Math.max(0, (100 - size) / 2),
      size,
    });
  };

  // Resize box with slider or zoom buttons
  const handleSizeChange = (newSize: number) => {
    const clampedSize = Math.max(30, Math.min(100, newSize));
    setCrop((prev) => {
      // Keep center point while resizing
      const centerX = prev.x + prev.size / 2;
      const centerY = prev.y + prev.size / 2;
      let nextX = centerX - clampedSize / 2;
      let nextY = centerY - clampedSize / 2;

      nextX = Math.max(0, Math.min(100 - clampedSize, nextX));
      nextY = Math.max(0, Math.min(100 - clampedSize, nextY));

      return { x: nextX, y: nextY, size: clampedSize };
    });
  };

  // Start drag (mouse or touch)
  const startDrag = (
    clientX: number,
    clientY: number,
    mode: 'move' | 'nw' | 'ne' | 'se' | 'sw'
  ) => {
    setIsDragging(true);
    setDragMode(mode);
    dragStartRef.current = {
      clientX,
      clientY,
      crop: { ...crop },
    };
  };

  const handlePointerDown = (
    e: React.MouseEvent | React.TouchEvent,
    mode: 'move' | 'nw' | 'ne' | 'se' | 'sw'
  ) => {
    e.stopPropagation();
    if ('touches' in e) {
      const touch = e.touches[0];
      if (touch) startDrag(touch.clientX, touch.clientY, mode);
    } else {
      startDrag(e.clientX, e.clientY, mode);
    }
  };

  // Window drag listeners
  const handlePointerMove = useCallback(
    (clientX: number, clientY: number) => {
      if (!isDragging || !dragMode || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;

      const deltaXPercent = ((clientX - dragStartRef.current.clientX) / rect.width) * 100;
      const deltaYPercent = ((clientY - dragStartRef.current.clientY) / rect.height) * 100;
      const initial = dragStartRef.current.crop;

      if (dragMode === 'move') {
        let newX = initial.x + deltaXPercent;
        let newY = initial.y + deltaYPercent;

        newX = Math.max(0, Math.min(100 - initial.size, newX));
        newY = Math.max(0, Math.min(100 - initial.size, newY));

        setCrop({ x: newX, y: newY, size: initial.size });
      } else {
        // Corner resize
        let deltaSize = 0;
        if (dragMode === 'se') {
          deltaSize = Math.max(deltaXPercent, deltaYPercent);
        } else if (dragMode === 'nw') {
          deltaSize = -Math.max(deltaXPercent, deltaYPercent);
        } else if (dragMode === 'ne') {
          deltaSize = Math.max(deltaXPercent, -deltaYPercent);
        } else if (dragMode === 'sw') {
          deltaSize = Math.max(-deltaXPercent, deltaYPercent);
        }

        const newSize = Math.max(25, Math.min(100, initial.size + deltaSize));
        let newX = initial.x;
        let newY = initial.y;

        if (dragMode === 'nw') {
          newX = initial.x + (initial.size - newSize);
          newY = initial.y + (initial.size - newSize);
        } else if (dragMode === 'ne') {
          newY = initial.y + (initial.size - newSize);
        } else if (dragMode === 'sw') {
          newX = initial.x + (initial.size - newSize);
        }

        newX = Math.max(0, Math.min(100 - newSize, newX));
        newY = Math.max(0, Math.min(100 - newSize, newY));

        setCrop({ x: newX, y: newY, size: newSize });
      }
    },
    [isDragging, dragMode]
  );

  useEffect(() => {
    if (!isDragging) return;

    const onMouseMove = (e: MouseEvent) => handlePointerMove(e.clientX, e.clientY);
    const onMouseUp = () => {
      setIsDragging(false);
      setDragMode(null);
    };

    const onTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (touch) handlePointerMove(touch.clientX, touch.clientY);
    };
    const onTouchEnd = () => {
      setIsDragging(false);
      setDragMode(null);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [isDragging, handlePointerMove]);

  // Execute Crop to High-Contrast Square Image
  const executeCrop = () => {
    if (!imgRef.current) return;
    const img = imgRef.current;
    const naturalWidth = img.naturalWidth;
    const naturalHeight = img.naturalHeight;

    if (!naturalWidth || !naturalHeight) {
      onScanOriginal();
      return;
    }

    // Convert percentages to exact pixel bounds on natural image
    const cropPixelX = Math.round((crop.x / 100) * naturalWidth);
    const cropPixelY = Math.round((crop.y / 100) * naturalHeight);
    const cropPixelW = Math.round((crop.size / 100) * naturalWidth);
    const cropPixelH = Math.round((crop.size / 100) * naturalHeight);

    // Target output is a high-resolution 1024x1024 square image of the 64 squares
    const outputCanvas = document.createElement('canvas');
    const outSize = 1024;
    outputCanvas.width = outSize;
    outputCanvas.height = outSize;
    const ctx = outputCanvas.getContext('2d');

    if (!ctx) {
      onScanOriginal();
      return;
    }

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    if (rotation !== 0) {
      ctx.translate(outSize / 2, outSize / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.translate(-outSize / 2, -outSize / 2);
    }

    // Draw the cropped slice
    ctx.drawImage(
      img,
      cropPixelX,
      cropPixelY,
      cropPixelW,
      cropPixelH,
      0,
      0,
      outSize,
      outSize
    );

    // Subtle contrast enhancement for peak piece silhouette clarity
    try {
      const imgData = ctx.getImageData(0, 0, outSize, outSize);
      const data = imgData.data;
      const contrastFactor = 1.08; // subtle 8% boost
      for (let i = 0; i < data.length; i += 4) {
        data[i] = Math.min(255, Math.max(0, (data[i] - 128) * contrastFactor + 128));
        data[i + 1] = Math.min(255, Math.max(0, (data[i + 1] - 128) * contrastFactor + 128));
        data[i + 2] = Math.min(255, Math.max(0, (data[i + 2] - 128) * contrastFactor + 128));
      }
      ctx.putImageData(imgData, 0, 0);
    } catch {
      // In case of CORS or canvas security, ignore and use plain draw
    }

    const croppedBase64 = outputCanvas.toDataURL('image/jpeg', 0.94);
    onCropAndScan(croppedBase64, true);
  };

  return (
    <div className="flex flex-col gap-3 text-zinc-200">
      {/* Top Banner Guide */}
      <div className="flex items-center justify-between bg-zinc-950 p-2.5 rounded-xl border border-zinc-800 text-xs">
        <div className="flex items-center gap-2">
          <Crop className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-semibold text-zinc-200">
            Align the 8x8 Grid Box over the Chessboard
          </span>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="text-zinc-400 hover:text-white flex items-center gap-1 text-[11px] px-2 py-1 rounded hover:bg-zinc-800 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Change Image</span>
        </button>
      </div>

      {/* Interactive Crop Stage */}
      <div className="relative w-full max-h-[380px] sm:max-h-[440px] flex items-center justify-center bg-black/90 rounded-2xl overflow-hidden border border-zinc-800 select-none touch-none">
        <div
          ref={containerRef}
          className="relative inline-block max-w-full max-h-[380px] sm:max-h-[440px]"
        >
          {/* Source Image */}
          <img
            ref={imgRef}
            src={imageSrc}
            alt="Board to scan"
            onLoad={handleImageLoad}
            style={{ transform: `rotate(${rotation}deg)` }}
            className="max-h-[380px] sm:max-h-[440px] w-auto object-contain block pointer-events-none select-none transition-transform duration-200"
          />

          {/* Dimmed Overlay outside the crop box */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(circle at ${crop.x + crop.size / 2}% ${
                crop.y + crop.size / 2
              }%, transparent ${crop.size / 2}%, rgba(0,0,0,0.65) ${crop.size / 2 + 1}%)`,
            }}
          />

          {/* The 8x8 Crop Box */}
          <div
            id="crop-selection-box"
            style={{
              left: `${crop.x}%`,
              top: `${crop.y}%`,
              width: `${crop.size}%`,
              height: `${crop.size}%`,
            }}
            onMouseDown={(e) => handlePointerDown(e, 'move')}
            onTouchStart={(e) => handlePointerDown(e, 'move')}
            className={`absolute border-2 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.5)] cursor-move ${
              isDragging ? 'ring-2 ring-emerald-300' : ''
            }`}
          >
            {/* 8x8 Grid lines inside the crop box */}
            <div className="w-full h-full grid grid-cols-8 grid-rows-8 pointer-events-none">
              {Array.from({ length: 64 }).map((_, i) => (
                <div
                  key={i}
                  className="border-r border-b border-emerald-400/30 last:border-r-0"
                />
              ))}
            </div>

            {/* Corner Rank & File Coordinate Labels inside Crop Box */}
            <div className="absolute top-1 left-1.5 text-[9px] font-mono font-bold text-emerald-300 bg-black/60 px-1 rounded pointer-events-none">
              8x8 Grid
            </div>

            {/* 4 Corner Resize Handles */}
            <div
              onMouseDown={(e) => handlePointerDown(e, 'nw')}
              onTouchStart={(e) => handlePointerDown(e, 'nw')}
              className="absolute -top-2.5 -left-2.5 w-6 h-6 bg-emerald-400 hover:bg-emerald-300 rounded-full border-2 border-zinc-950 shadow-md cursor-nwse-resize z-20 flex items-center justify-center"
            />
            <div
              onMouseDown={(e) => handlePointerDown(e, 'ne')}
              onTouchStart={(e) => handlePointerDown(e, 'ne')}
              className="absolute -top-2.5 -right-2.5 w-6 h-6 bg-emerald-400 hover:bg-emerald-300 rounded-full border-2 border-zinc-950 shadow-md cursor-nesw-resize z-20 flex items-center justify-center"
            />
            <div
              onMouseDown={(e) => handlePointerDown(e, 'sw')}
              onTouchStart={(e) => handlePointerDown(e, 'sw')}
              className="absolute -bottom-2.5 -left-2.5 w-6 h-6 bg-emerald-400 hover:bg-emerald-300 rounded-full border-2 border-zinc-950 shadow-md cursor-nesw-resize z-20 flex items-center justify-center"
            />
            <div
              onMouseDown={(e) => handlePointerDown(e, 'se')}
              onTouchStart={(e) => handlePointerDown(e, 'se')}
              className="absolute -bottom-2.5 -right-2.5 w-6 h-6 bg-emerald-400 hover:bg-emerald-300 rounded-full border-2 border-zinc-950 shadow-md cursor-nwse-resize z-20 flex items-center justify-center"
            />
          </div>
        </div>
      </div>

      {/* Crop Controls (Zoom, Fit, Rotate) */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-zinc-950/80 border border-zinc-800 rounded-xl text-xs">
        {/* Zoom / Size Slider */}
        <div className="flex items-center gap-2 flex-1 min-w-[180px]">
          <button
            type="button"
            onClick={() => handleSizeChange(crop.size - 5)}
            className="p-1 hover:bg-zinc-800 rounded text-zinc-300"
            title="Smaller Box"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <input
            type="range"
            min={25}
            max={100}
            value={crop.size}
            onChange={(e) => handleSizeChange(parseInt(e.target.value, 10))}
            className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
          />
          <button
            type="button"
            onClick={() => handleSizeChange(crop.size + 5)}
            className="p-1 hover:bg-zinc-800 rounded text-zinc-300"
            title="Larger Box"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleCenterBox}
            className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded text-[11px] font-medium flex items-center gap-1 transition-colors"
          >
            <Maximize2 className="w-3 h-3 text-zinc-400" />
            <span>Center</span>
          </button>

          <button
            type="button"
            onClick={() => setRotation((r) => (r + 90) % 360)}
            className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded text-[11px] font-medium flex items-center gap-1 transition-colors"
          >
            <RotateCw className="w-3 h-3 text-zinc-400" />
            <span>Rotate</span>
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
        {/* Primary: Scan Cropped Board (High-Precision Chessvision-like Mode) */}
        <button
          type="button"
          id="btn-scan-cropped-board"
          onClick={executeCrop}
          className="w-full sm:flex-1 py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-[0.98] text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-emerald-200" />
          <span>🎯 SCAN FOCUSED BOARD (HIGHEST ACCURACY)</span>
        </button>

        {/* Secondary: Full Image Scan fallback */}
        <button
          type="button"
          onClick={onScanOriginal}
          className="w-full sm:w-auto py-3 px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium text-xs rounded-xl transition-colors"
        >
          Scan Full Image
        </button>
      </div>

      <p className="text-[11px] text-zinc-400 text-center">
        💡 <strong>Tip:</strong> Drag the green box so all 64 squares fit inside the grid. This isolates the pieces from phone status bars and gives 99%+ accuracy!
      </p>
    </div>
  );
};
