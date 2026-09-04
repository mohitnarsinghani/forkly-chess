import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Camera,
  Upload,
  X,
  Sparkles,
  AlertCircle,
  Video,
  CheckCircle2,
  RefreshCw,
  Image as ImageIcon,
  Zap,
} from 'lucide-react';
import { SAMPLE_BOARDS } from '../../data/sampleBoards';
import { SampleBoard } from '../../types';
import { BoardCropper } from './BoardCropper';

interface CameraScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanImage: (base64Image: string, mimeType: string, isCropped?: boolean) => Promise<void>;
  onSelectSample: (board: SampleBoard) => void;
  onOpenEditor?: () => void;
  isScanning: boolean;
  scanError: string | null;
}

export const CameraScanModal: React.FC<CameraScanModalProps> = ({
  isOpen,
  onClose,
  onScanImage,
  onSelectSample,
  onOpenEditor,
  isScanning,
  scanError,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'camera' | 'samples'>('upload');
  const [isDragOver, setIsDragOver] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedPreview, setCapturedPreview] = useState<string | null>(null);
  const [imageForCrop, setImageForCrop] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Stop camera stream safely
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  }, []);

  // Start live camera
  const startCamera = async () => {
    setCameraError(null);
    stopCamera();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err: any) {
      console.error('Camera access error:', err);
      setCameraError(
        'Unable to access camera. Please check camera permissions in your browser or use file upload.'
      );
      setCameraActive(false);
    }
  };

  // Stop camera when modal closes or tab changes
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setCapturedPreview(null);
      setImageForCrop(null);
    } else if (activeTab === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isOpen, activeTab]);

  // Capture frame from video stream
  const captureFrame = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedPreview(dataUrl);
    setImageForCrop(dataUrl);
    stopCamera();
  };

  // Helper to optimize image resolution (resize massive phone photos down to crisp 1400px)
  const optimizeImage = (dataUrl: string, maxDim = 1400): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        let w = img.width;
        let h = img.height;
        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL('image/jpeg', 0.92));
        } else {
          resolve(dataUrl);
        }
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    });
  };

  // Handle file selection
  const processFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, WEBP, etc.).');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const result = e.target?.result as string;
      if (result) {
        // Optimize resolution for fast upload and peak AI vision precision
        const optimized = await optimizeImage(result, 1400);
        setCapturedPreview(optimized);
        setImageForCrop(optimized);
      }
    };
    reader.readAsDataURL(file);
  };

  // Drag & drop handlers
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  // Clipboard paste support (e.g. Snipping tool screenshot)
  useEffect(() => {
    if (!isOpen) return;

    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile();
          if (file) {
            processFile(file);
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      id="camera-scan-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        className="relative w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 bg-zinc-900/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-zinc-100">
                Forkly Position AI Scanner
              </h2>
              <p className="text-xs text-zinc-400">
                Powered by Forkly Vision & Stockfish 18 NNUE
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation or Crop Mode Indicator */}
        {imageForCrop && !isScanning ? (
          <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-950/80 px-4 py-2.5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-semibold text-emerald-300">
                Step 2: Align 8x8 Grid with Chessboard Corners
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                setImageForCrop(null);
                setCapturedPreview(null);
              }}
              className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="flex items-center border-b border-zinc-800 bg-zinc-950/60 px-4 pt-2">
            <button
              onClick={() => {
                setActiveTab('upload');
                setCapturedPreview(null);
              }}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                activeTab === 'upload'
                  ? 'border-emerald-500 text-emerald-400'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>Upload Screenshot</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('camera');
                setCapturedPreview(null);
              }}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                activeTab === 'camera'
                  ? 'border-emerald-500 text-emerald-400'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Video className="w-4 h-4" />
              <span>Live Camera</span>
            </button>

            <button
              onClick={() => setActiveTab('samples')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                activeTab === 'samples'
                  ? 'border-emerald-500 text-emerald-400'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Zap className="w-4 h-4" />
              <span>Sample Boards</span>
            </button>
          </div>
        )}

        {/* Modal Content Body */}
        <div className="p-5 overflow-y-auto flex-1 flex flex-col gap-4">
          {/* Scanning Progress Overlay */}
          {isScanning && (
            <div className="py-8 flex flex-col items-center justify-center gap-4 text-center">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin" />
                <Sparkles className="w-6 h-6 text-emerald-400 absolute inset-0 m-auto animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-zinc-100">
                  Scanning 64 Squares with Gemini AI Vision...
                </h3>
                <p className="text-xs text-zinc-400 mt-1 max-w-sm">
                  Analyzing algebraic coordinates, piece silhouettes, and computing Lichess Stockfish analysis.
                </p>
              </div>
            </div>
          )}

          {/* Scan Error Message */}
          {scanError && !isScanning && (
            <div className="p-3.5 rounded-xl bg-red-950/50 border border-red-800 text-red-300 text-xs flex flex-col gap-2">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="font-semibold block">Recognition Notice</span>
                  <span>{scanError}</span>
                </div>
              </div>
              {onOpenEditor && (
                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => {
                      onClose();
                      onOpenEditor();
                    }}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
                  >
                    <span>Edit Board Pieces Manually</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Crop Mode: High Precision 8x8 Grid Alignment */}
          {imageForCrop && !isScanning && (
            <BoardCropper
              imageSrc={imageForCrop}
              onCropAndScan={async (croppedBase64, isCropped) => {
                await onScanImage(croppedBase64, 'image/jpeg', isCropped);
              }}
              onScanOriginal={async () => {
                await onScanImage(imageForCrop, 'image/jpeg', false);
              }}
              onCancel={() => {
                setImageForCrop(null);
                setCapturedPreview(null);
              }}
            />
          )}

          {/* Tab 1: Upload / Drag & Drop */}
          {!imageForCrop && !isScanning && activeTab === 'upload' && (
            <div className="flex flex-col gap-4">
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-3 text-center cursor-pointer transition-all ${
                  isDragOver
                    ? 'border-emerald-500 bg-emerald-950/20'
                    : 'border-zinc-700/80 bg-zinc-950/50 hover:border-zinc-500 hover:bg-zinc-800/40'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) processFile(file);
                  }}
                />

                <div className="w-12 h-12 rounded-xl bg-zinc-800/80 border border-zinc-700 flex items-center justify-center text-zinc-300">
                  <ImageIcon className="w-6 h-6 text-emerald-400" />
                </div>

                <div>
                  <p className="text-sm font-semibold text-zinc-200">
                    Click to browse or drag & drop chessboard image
                  </p>
                  <p className="text-xs text-zinc-400 mt-1">
                    Supports PNG, JPG, WebP, screenshots, or press <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-300 font-mono">Ctrl+V</kbd> to paste
                  </p>
                </div>
              </div>

              {capturedPreview && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 bg-zinc-950 border border-zinc-800 rounded-xl">
                  <div className="flex items-center gap-3">
                    <img
                      src={capturedPreview}
                      alt="Preview"
                      className="w-14 h-14 object-cover rounded-lg border border-zinc-700 shrink-0"
                    />
                    <div className="text-xs">
                      <span className="font-semibold text-zinc-200 block">
                        Uploaded Screenshot
                      </span>
                      <span className="text-zinc-400">
                        Image optimized and ready for analysis.
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => onScanImage(capturedPreview, 'image/jpeg')}
                      className="flex-1 sm:flex-none px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Re-Scan</span>
                    </button>
                    {onOpenEditor && (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onOpenEditor();
                        }}
                        className="flex-1 sm:flex-none px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <span>Edit Manually</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Helpful Scanning Advice Box */}
              <div className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800/80 text-[11px] text-zinc-400 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-zinc-300 block mb-0.5">
                    Scanning Advice:
                  </span>
                  Lichess and Chess.com screenshots scan best when all 4 corners (a1 to h8) are visible. If a piece isn't recognized or has an arrow/highlight over it, use the <strong className="text-amber-400">Board Editor (Pencil icon)</strong> to place or move pieces with drag & drop!
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Live Camera */}
          {!imageForCrop && !isScanning && activeTab === 'camera' && (
            <div className="flex flex-col gap-4">
              {cameraError ? (
                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-center flex flex-col items-center gap-3">
                  <AlertCircle className="w-8 h-8 text-amber-400" />
                  <p className="text-xs text-zinc-300">{cameraError}</p>
                  <button
                    onClick={startCamera}
                    className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Retry Camera
                  </button>
                </div>
              ) : (
                <div className="relative aspect-video max-h-72 rounded-xl overflow-hidden bg-black border border-zinc-800 flex items-center justify-center">
                  <video
                    ref={videoRef}
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />

                  {/* Alignment Frame overlay */}
                  <div className="absolute inset-4 border-2 border-emerald-400/70 border-dashed rounded-lg pointer-events-none flex items-center justify-center">
                    <span className="text-[11px] font-mono text-emerald-300/90 bg-black/60 px-2 py-0.5 rounded">
                      Align chessboard within frame
                    </span>
                  </div>
                </div>
              )}

              {cameraActive && !cameraError && (
                <button
                  onClick={captureFrame}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 transition-all cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                  <span>Capture & Scan Frame</span>
                </button>
              )}
            </div>
          )}

          {/* Tab 3: Sample Positions */}
          {!imageForCrop && !isScanning && activeTab === 'samples' && (
            <div className="flex flex-col gap-2.5">
              <p className="text-xs text-zinc-400 mb-1">
                Select a grandmaster game or tactical study to load and analyze instantly:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {SAMPLE_BOARDS.map((sample) => (
                  <button
                    key={sample.name}
                    onClick={() => {
                      onSelectSample(sample);
                      onClose();
                    }}
                    className="text-left p-3 rounded-xl bg-zinc-950/60 hover:bg-zinc-800/80 border border-zinc-800/80 hover:border-emerald-500/50 transition-all flex flex-col gap-1 cursor-pointer group"
                  >
                    <span className="text-xs font-bold text-zinc-200 group-hover:text-emerald-300 flex items-center justify-between">
                      {sample.name}
                      <CheckCircle2 className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-emerald-400 transition-opacity" />
                    </span>
                    <span className="text-[11px] text-zinc-400 line-clamp-2">
                      {sample.description}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
