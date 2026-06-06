"use client";

import { useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadZoneProps {
  onFileSelect: (file: File, previewUrl: string) => void;
  previewUrl?: string | null;
  onClear?: () => void;
}

export function UploadZone({ onFileSelect, previewUrl, onClear }: UploadZoneProps) {
  const [dragging, setDragging] = useState(false);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) return;
      const url = URL.createObjectURL(file);
      onFileSelect(file, url);
    },
    [onFileSelect]
  );

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        {previewUrl ? (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative overflow-hidden rounded-2xl border border-white/[0.08]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="Drawing preview"
              className="aspect-[4/3] w-full object-cover"
            />
            {onClear && (
              <button
                type="button"
                onClick={onClear}
                className="absolute right-3 top-3 rounded-full bg-black/60 p-2 text-white/80 backdrop-blur-sm hover:bg-black/80"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </motion.div>
        ) : (
          <motion.label
            key="upload"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            className={cn(
              "flex aspect-[4/3] cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed transition-colors",
              dragging
                ? "border-violet-400 bg-violet-500/10"
                : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
            )}
          >
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
            />
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/15">
              <Upload className="h-6 w-6 text-violet-400" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium">Upload your drawing</p>
              <p className="mt-1 text-xs text-white/40">
                PNG, JPG up to 10MB · or drag & drop
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs text-white/30">
              <ImageIcon className="h-3.5 w-3.5" />
              Photo of sketch works too
            </div>
          </motion.label>
        )}
      </AnimatePresence>
    </div>
  );
}
