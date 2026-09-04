import React, { useState, useEffect } from 'react';
import { Camera, Image as ImageIcon, Copy, Check } from 'lucide-react';

interface BottomControlsProps {
  currentFen: string;
  currentPgn: string;
  onApplyFen: (fen: string) => void;
  onApplyPgn?: (pgn: string) => void;
  onOpenScanModal: () => void;
  onFileInputChange: (file: File) => void;
}

export const BottomControls: React.FC<BottomControlsProps> = ({
  currentFen,
  currentPgn,
  onApplyFen,
  onApplyPgn,
  onOpenScanModal,
  onFileInputChange,
}) => {
  const [fenInput, setFenInput] = useState(currentFen);
  const [pgnInput, setPgnInput] = useState(currentPgn);
  const [copiedFen, setCopiedFen] = useState(false);
  const [fenError, setFenError] = useState<string | null>(null);

  useEffect(() => {
    setFenInput(currentFen);
    setFenError(null);
  }, [currentFen]);

  useEffect(() => {
    setPgnInput(currentPgn);
  }, [currentPgn]);

  const handleApplyFen = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = fenInput.trim();
    if (!trimmed) return;
    try {
      onApplyFen(trimmed);
      setFenError(null);
    } catch {
      setFenError('Invalid FEN format');
    }
  };

  const handleApplyPgn = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (onApplyPgn && pgnInput.trim()) {
      onApplyPgn(pgnInput.trim());
    }
  };

  const handleCopyFen = async () => {
    try {
      await navigator.clipboard.writeText(currentFen);
      setCopiedFen(true);
      setTimeout(() => setCopiedFen(false), 1800);
    } catch {
      setCopiedFen(true);
      setTimeout(() => setCopiedFen(false), 1800);
    }
  };

  return (
    <div
      id="chessvision-bottom-controls"
      className="w-full bg-[#f8f9fa] border-t border-zinc-300 p-3 sm:p-4 select-none relative"
    >
      <div className="max-w-3xl mx-auto flex flex-col gap-3 pb-16">
        {/* FEN Input with Set FEN button (exact screenshot styling) */}
        <form onSubmit={handleApplyFen} className="flex flex-col gap-1">
          <div className="relative">
            <span className="absolute -top-2.5 left-3 bg-[#f8f9fa] px-1 text-[11px] font-semibold text-zinc-500">
              FEN
            </span>
            <div className="flex items-center gap-2">
              <input
                id="input-fen-field"
                type="text"
                value={fenInput}
                onChange={(e) => setFenInput(e.target.value)}
                placeholder="Paste or enter FEN..."
                className="flex-1 bg-white border border-zinc-300 rounded-lg px-3 py-2 text-xs font-mono text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-blue-500 shadow-xs"
              />

              <button
                type="button"
                onClick={handleCopyFen}
                title="Copy FEN"
                className="p-2 rounded-lg bg-zinc-200 hover:bg-zinc-300 text-zinc-700 transition-colors shrink-0"
              >
                {copiedFen ? (
                  <Check className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>

              <button
                type="submit"
                id="btn-set-fen"
                className="px-4 py-2 rounded-lg bg-zinc-200 hover:bg-zinc-300 active:bg-zinc-400 text-xs font-semibold text-zinc-700 transition-colors shrink-0 shadow-xs cursor-pointer"
              >
                Set FEN
              </button>
            </div>
          </div>

          {fenError && (
            <span className="text-[11px] text-red-500 px-2 font-medium">
              {fenError}
            </span>
          )}
        </form>

        {/* PGN Input with Set PGN button (exact screenshot styling) */}
        <form onSubmit={handleApplyPgn} className="flex flex-col gap-1">
          <div className="relative">
            <span className="absolute -top-2.5 left-3 bg-[#f8f9fa] px-1 text-[11px] font-semibold text-zinc-500">
              PGN
            </span>
            <div className="flex items-center gap-2">
              <input
                id="input-pgn-field"
                type="text"
                value={pgnInput}
                onChange={(e) => setPgnInput(e.target.value)}
                placeholder="1. d4 Nf6 *"
                className="flex-1 bg-white border border-zinc-300 rounded-lg px-3 py-2 text-xs font-mono text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-blue-500 shadow-xs"
              />

              <button
                type="submit"
                id="btn-set-pgn"
                className="px-4 py-2 rounded-lg bg-zinc-200 hover:bg-zinc-300 active:bg-zinc-400 text-xs font-semibold text-zinc-700 transition-colors shrink-0 shadow-xs cursor-pointer"
              >
                Set PGN
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Floating Action Buttons (FABs) in bottom right (Exact Screenshot UI) */}
      <div className="fixed bottom-4 right-4 z-40 flex items-center gap-3">
        {/* Gallery / Image Upload FAB */}
        <label
          id="fab-upload-gallery"
          title="Upload Chessboard Image"
          className="w-12 h-12 rounded-full bg-[#3b82f6] hover:bg-blue-600 active:scale-95 text-white flex items-center justify-center shadow-lg shadow-blue-500/40 cursor-pointer transition-transform"
        >
          <ImageIcon className="w-5 h-5" />
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                onFileInputChange(file);
                e.target.value = '';
              }
            }}
          />
        </label>

        {/* Camera Scan FAB (Prominent vibrant blue button with camera icon) */}
        <button
          id="fab-camera-scanner"
          onClick={onOpenScanModal}
          title="Scan Chessboard with AI Camera"
          className="w-14 h-14 rounded-full bg-[#2563eb] hover:bg-blue-700 active:scale-95 text-white flex items-center justify-center shadow-xl shadow-blue-600/50 cursor-pointer transition-transform"
        >
          <Camera className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};
