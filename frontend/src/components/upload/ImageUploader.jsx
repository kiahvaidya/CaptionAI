import React, { useRef, useState } from 'react';
import { UploadCloud, Image as ImageIcon, X, Sparkles } from 'lucide-react';

const PRESETS = [
  {
    id: 'sunset',
    title: 'Coast Sunset',
    draw: (ctx, w, h) => {
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, '#f97316');
      grad.addColorStop(0.5, '#f43f5e');
      grad.addColorStop(1, '#1e293b');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
      // Sun
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(w / 2, h * 0.55, 36, 0, Math.PI * 2);
      ctx.fill();
      // Horizon / water
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, h * 0.72, w, h * 0.28);
    }
  },
  {
    id: 'coffee',
    title: 'Artisan Cafe',
    draw: (ctx, w, h) => {
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, '#f8fafc');
      grad.addColorStop(1, '#f1f5f9');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
      // Table
      ctx.fillStyle = '#d97706';
      ctx.fillRect(40, 80, w - 80, h - 80);
      // Cup
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(w / 2, h / 2 + 10, 32, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#78350f';
      ctx.beginPath();
      ctx.arc(w / 2, h / 2 + 10, 24, 0, Math.PI * 2);
      ctx.fill();
    }
  },
  {
    id: 'nature',
    title: 'Alpine Peak',
    draw: (ctx, w, h) => {
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, '#38bdf8');
      grad.addColorStop(1, '#e2e8f0');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
      // Mountain
      ctx.fillStyle = '#475569';
      ctx.beginPath();
      ctx.moveTo(w * 0.5, h * 0.25);
      ctx.lineTo(w * 0.85, h * 0.85);
      ctx.lineTo(w * 0.15, h * 0.85);
      ctx.closePath();
      ctx.fill();
      // Snowcap
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(w * 0.5, h * 0.25);
      ctx.lineTo(w * 0.62, h * 0.45);
      ctx.lineTo(w * 0.38, h * 0.45);
      ctx.closePath();
      ctx.fill();
    }
  },
  {
    id: 'product',
    title: 'Minimalist Tote',
    draw: (ctx, w, h) => {
      ctx.fillStyle = '#fce7eb';
      ctx.fillRect(0, 0, w, h);
      // Bag body
      ctx.fillStyle = '#be123c';
      ctx.roundRect(w * 0.28, h * 0.35, w * 0.44, h * 0.45, [12, 12, 6, 6]);
      ctx.fill();
      // Handle
      ctx.strokeStyle = '#9f1239';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(w * 0.5, h * 0.35, 30, Math.PI, 0, false);
      ctx.stroke();
    }
  }
];

export default function ImageUploader({ onImageSelected, selectedImage, onClear }) {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file) => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert('Please upload a JPG, JPEG, PNG, or WEBP image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      onImageSelected({
        file: file,
        dataUrl: e.target.result,
        name: file.name
      });
      if (inputRef.current) inputRef.current.value = '';
    };
    reader.readAsDataURL(file);
  };

  // Convert canvas graphic into real Base64 PNG
  const selectPreset = (preset) => {
    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 225;
    const ctx = canvas.getContext('2d');
    preset.draw(ctx, 300, 225);
    const pngDataUrl = canvas.toDataURL('image/png');

    if (inputRef.current) inputRef.current.value = '';

    onImageSelected({
      file: null,
      dataUrl: pngDataUrl,
      name: `${preset.id}_sample.png`
    });
  };

  return (
    <div className="space-y-4">
      {/* Upload Drop Zone / Preview */}
      {selectedImage ? (
        <div className="relative rounded-2xl overflow-hidden border border-zinc-200 bg-white p-2.5 shadow-sm">
          <div className="relative max-h-72 w-full overflow-hidden rounded-xl flex items-center justify-center bg-zinc-100">
            <img
              src={selectedImage.dataUrl}
              alt="Selected Preview"
              className="max-h-72 w-auto object-contain rounded-lg"
            />
            <button
              onClick={() => {
                if (inputRef.current) inputRef.current.value = '';
                onClear();
              }}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-white/90 text-zinc-600 hover:text-black hover:bg-zinc-100 transition shadow border border-zinc-200"
              title="Remove image"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-lg border border-zinc-200 text-xs text-zinc-800 flex items-center gap-2 shadow-sm font-medium">
              <ImageIcon className="w-3.5 h-3.5 text-zinc-900" />
              <span className="truncate max-w-[200px]">{selectedImage.name}</span>
            </div>
          </div>
        </div>
      ) : (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => inputRef.current && inputRef.current.click()}
          className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ${
            dragActive
              ? 'border-indigo-600 bg-indigo-50/40'
              : 'border-zinc-300 hover:border-indigo-400 bg-white hover:bg-indigo-50/10'
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept=".jpg,.jpeg,.png,.webp"
            onChange={handleChange}
          />
          <div className="flex flex-col items-center justify-center space-y-2.5">
            <div className="p-3.5 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-200/80">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900">
                Upload image
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                Drag and drop your file here, or browse from your device
              </p>
            </div>
            <div className="text-[11px] text-zinc-400 font-medium">
              Supports JPG, PNG, WEBP (up to 10MB)
            </div>
          </div>
        </div>
      )}

      {/* Preset Demo Images */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-zinc-700 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            Sample visuals:
          </span>
          <span className="text-[11px] text-zinc-400">Click to test instantly</span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => selectPreset(preset)}
              className="p-2 rounded-xl border border-zinc-200 hover:border-indigo-400 bg-white hover:bg-indigo-50/20 transition text-center group shadow-xs"
            >
              <div className="w-full h-12 rounded-lg bg-zinc-50 border border-zinc-200/80 mb-1 flex items-center justify-center text-[10px] font-bold text-zinc-700 group-hover:text-indigo-600 transition">
                {preset.title}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
