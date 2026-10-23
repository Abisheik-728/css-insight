import { useState, useRef } from 'react';
import type { DragEvent, ChangeEvent } from 'react';
import { UploadCloud, FileCode2, Trash2, RefreshCw, AlertTriangle, CheckCircle, Sparkles, Loader2 } from 'lucide-react';

interface UploadPanelProps {
  onAnalyze: (file: File) => void;
  onLoadSample: (type: 'normal' | 'edge_cases') => void;
  onClear: () => void;
  isLoading: boolean;
  currentFilename?: string;
  currentFileSize?: number;
  errorMessage?: string | null;
}

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

export const UploadPanel: React.FC<UploadPanelProps> = ({
  onAnalyze,
  onLoadSample,
  onClear,
  isLoading,
  currentFilename,
  currentFileSize,
  errorMessage,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleFileProcess = (file: File) => {
    setLocalError(null);

    // 1. Check extension
    if (!file.name.toLowerCase().endsWith('.css')) {
      setLocalError(`Invalid file format '${file.name}'. Only .css files are supported.`);
      return;
    }

    // 2. Check size
    if (file.size > MAX_FILE_SIZE) {
      setLocalError(
        `File '${file.name}' (${formatFileSize(file.size)}) exceeds the 2 MB upload threshold.`
      );
      return;
    }

    // Trigger analysis
    onAnalyze(file);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileProcess(e.target.files[0]);
    }
  };

  const activeError = localError || errorMessage;

  return (
    <div id="upload-panel" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
      <div className="rounded-2xl border border-white/[0.1] bg-[#0c1222]/95 shadow-2xl p-6 sm:p-8 backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-white/[0.06]">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FileCode2 className="h-5 w-5 text-cyan-400" />
              Upload Stylesheet for Telemetry
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Drop your .css file to initiate tinycss2 AST parsing, selector mapping, and metrics calculation.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onLoadSample('normal')}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 transition-colors disabled:opacity-50"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Standard Sample
            </button>
            <button
              onClick={() => onLoadSample('edge_cases')}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-violet-500/10 hover:bg-violet-500/20 text-violet-300 border border-violet-500/30 transition-colors disabled:opacity-50"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Edge Cases Sample
            </button>
            {currentFilename && (
              <button
                onClick={onClear}
                disabled={isLoading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 transition-colors disabled:opacity-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Drag and Drop Zone */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 ${
            isDragOver
              ? 'border-cyan-400 bg-cyan-500/[0.08] scale-[1.005]'
              : currentFilename
              ? 'border-emerald-500/40 bg-emerald-500/[0.03] hover:border-emerald-500/60'
              : 'border-white/[0.12] bg-white/[0.02] hover:border-cyan-500/40 hover:bg-white/[0.04]'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".css"
            onChange={handleFileInputChange}
            className="hidden"
          />

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-4">
              <Loader2 className="h-10 w-10 text-cyan-400 animate-spin mb-3" />
              <p className="text-sm font-semibold text-white">Analyzing CSS Abstract Syntax Tree...</p>
              <p className="text-xs text-slate-400 mt-1">Executing tinycss2 engine, tokenizing declarations & computing metrics</p>
            </div>
          ) : currentFilename ? (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-lg bg-white/[0.03] border border-white/[0.06]">
              <div className="flex items-center gap-3.5 text-left">
                <div className="h-10 w-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-white">{currentFilename}</span>
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                      Parsed
                    </span>
                  </div>
                  {currentFileSize !== undefined && (
                    <span className="text-xs text-slate-400">{formatFileSize(currentFileSize)}</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 border border-white/[0.1] transition-all"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Replace File
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-2">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-violet-600/20 border border-cyan-500/30 flex items-center justify-center mb-3">
                <UploadCloud className="h-6 w-6 text-cyan-400" />
              </div>
              <p className="text-sm font-semibold text-white">
                Drag & drop your stylesheet here, or <span className="text-cyan-400 hover:underline">browse files</span>
              </p>
              <p className="text-xs text-slate-400 mt-1.5">
                Accepts standalone <span className="font-mono text-slate-300">.css</span> files up to 2 MB
              </p>
            </div>
          )}
        </div>

        {/* Error notification */}
        {activeError && (
          <div className="mt-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-rose-300 text-xs sm:text-sm">
            <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold text-rose-200">Validation Error: </span>
              {activeError}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
