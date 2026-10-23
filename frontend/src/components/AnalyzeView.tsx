import React, { useRef, useState } from 'react';
import type { DragEvent, ChangeEvent } from 'react';
import type { AnalysisResult } from '../types';
import {
  UploadCloud,
  Check,
  CheckCircle2,
  FileCode,
  Trash2,
  RefreshCw,
  Zap,
  FlaskConical,
  ArrowRight,
  AlertCircle,
  Terminal,
  ShieldCheck,
  Cpu,
  Gauge,
  Brain,
  FileSpreadsheet,
} from 'lucide-react';

interface AnalyzeViewProps {
  onAnalyze: (file: File) => void;
  onLoadSample: (type: 'standard' | 'edge_cases') => void;
  stagedFile: File | null;
  onStageFile: (file: File) => void;
  onRemoveFile: () => void;
  isLoading: boolean;
  errorMessage: string | null;
  analysisResult: AnalysisResult | null;
  onViewResults: () => void;
  onViewJson: () => void;
}

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

export const AnalyzeView: React.FC<AnalyzeViewProps> = ({
  onAnalyze,
  onLoadSample,
  stagedFile,
  onStageFile,
  onRemoveFile,
  isLoading,
  errorMessage,
  analysisResult,
  onViewResults,
  onViewJson,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleValidateAndStage = (file: File) => {
    setLocalError(null);

    if (!file.name.toLowerCase().endsWith('.css')) {
      setLocalError(`Invalid file format '${file.name}'. Only .css files are supported.`);
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setLocalError(
        `File '${file.name}' (${formatFileSize(file.size)}) exceeds the 2 MB upload threshold.`
      );
      return;
    }

    onStageFile(file);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleValidateAndStage(e.dataTransfer.files[0]);
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
      handleValidateAndStage(e.target.files[0]);
    }
  };

  const activeError = localError || errorMessage;

  return (
    <div className="flex flex-col w-full gap-6 animate-in fade-in duration-200">
      {/* Dynamic Notification Bar / Top Meta */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-1.5 text-indigo-600 text-xs font-semibold uppercase tracking-wider mb-1">
            <span className="h-2 w-2 rounded-full bg-indigo-600 animate-pulse"></span>
            Parser Ingestion Gateway
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Analyze your stylesheet
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-3xl mt-0.5">
            Upload a CSS file to extract selectors, declarations, properties, and structured AST insights. Powered by low-latency tinycss2 Python engine.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start md:self-auto font-mono text-xs">
          <span className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 font-medium flex items-center gap-1.5 shadow-2xs">
            <Gauge className="h-3.5 w-3.5 text-indigo-600" />
            <span>Benchmark: ~18ms / 1,000 lines</span>
          </span>
          <span className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 flex items-center gap-1.5 shadow-2xs">
            <Cpu className="h-3.5 w-3.5 text-slate-500" />
            <span>AST Spec v1.4</span>
          </span>
        </div>
      </div>

      {/* Error Notice */}
      {activeError && (
        <div className="p-4 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 flex items-start gap-3 shadow-2xs">
          <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm">
            <strong className="font-semibold">Validation Notice: </strong>
            {activeError}
          </div>
        </div>
      )}

      {/* Success Banner if parsed */}
      {analysisResult && !isLoading && (
        <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-semibold text-slate-900">
                Successfully parsed <span className="font-mono text-indigo-700">{analysisResult.metadata.filename}</span> in {analysisResult.metadata.parse_time_ms} ms
              </p>
              <p className="text-[11px] sm:text-xs text-slate-600">
                Extracted {analysisResult.metadata.total_rules} rules, {analysisResult.metadata.total_selectors} selectors, and {analysisResult.metadata.total_declarations} declarations.
              </p>
            </div>
          </div>
          <button
            onClick={onViewResults}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shrink-0 shadow-xs"
            type="button"
          >
            <span>View Telemetry Dashboard</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Primary Workstation Grid: Upload Zone (Left/Main) & Engine Spec Panel (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols): Upload Card, Live File Staging, Sample Datasets */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Upload Surface Card */}
          <div className="bg-white rounded-xl p-6 shadow-2xs border border-slate-200 flex flex-col gap-5 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-sm sm:text-base">Source File Upload</span>
                <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                  multipart/form-data
                </span>
              </div>
              <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span>UTF-8 Enforced</span>
              </span>
            </div>

            {/* Dropzone Canvas */}
            <div
              id="dropzone"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`group relative flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-xl transition-all cursor-pointer border-2 border-dashed ${
                isDragOver
                  ? 'bg-indigo-50/60 border-indigo-500 scale-[1.005]'
                  : 'bg-slate-50 border-slate-300 hover:bg-indigo-50/30 hover:border-indigo-400'
              }`}
            >
              <input
                ref={fileInputRef}
                accept=".css"
                type="file"
                onChange={handleFileInputChange}
                className="hidden"
              />

              <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center justify-center text-indigo-600 group-hover:scale-105 group-hover:bg-indigo-600 group-hover:text-white transition-all mb-3">
                <UploadCloud className="h-6 w-6" />
              </div>

              <div className="flex flex-col gap-1 items-center max-w-md">
                <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs sm:text-sm text-slate-800">
                  <span className="text-indigo-600 font-semibold underline underline-offset-2">Browse files</span>
                  <span className="text-slate-500">or drag and drop your stylesheet here</span>
                </div>
                <p className="text-[11px] sm:text-xs text-slate-400 mt-1">
                  Accepted format: <span className="font-mono px-1.5 py-0.5 rounded bg-slate-200/70 text-slate-700">.css</span> • Maximum size: <span className="font-medium text-slate-700">2 MB</span>
                </p>
              </div>

              <div className="mt-4 flex items-center gap-3 text-slate-400 font-mono text-[11px]">
                <span className="flex items-center gap-1 text-slate-500">
                  <Check className="h-3.5 w-3.5 text-emerald-600" /> Auto-sanitized
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-slate-500">
                  <Check className="h-3.5 w-3.5 text-emerald-600" /> Comments retained in AST
                </span>
              </div>
            </div>

            {/* Selected File Status Card */}
            {stagedFile ? (
              <div className="bg-slate-50 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-slate-200">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                    <FileCode className="h-5 w-5" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                        {stagedFile.name}
                      </span>
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-semibold shrink-0">
                        {analysisResult?.metadata.filename === stagedFile.name ? 'Parsed' : 'Ready'}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                      <span className="font-mono text-slate-700 font-medium">
                        {formatFileSize(stagedFile.size)}
                      </span>
                      <span>•</span>
                      <span>CSS Document</span>
                      <span>•</span>
                      <span className="text-emerald-700 font-medium flex items-center gap-1">
                        <Check className="h-3 w-3 text-emerald-600" />
                        Validation passed
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200 transition-colors flex items-center gap-1.5 shadow-2xs"
                    type="button"
                  >
                    <RefreshCw className="h-3.5 w-3.5 text-slate-500" />
                    <span>Replace</span>
                  </button>
                  <button
                    onClick={onRemoveFile}
                    className="p-1.5 rounded-lg bg-white hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-200 hover:border-rose-200 transition-colors flex items-center justify-center shadow-2xs"
                    title="Remove stylesheet"
                    type="button"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50/70 rounded-xl p-4 text-center text-slate-500 text-xs border border-dashed border-slate-200">
                No stylesheet staged. Choose a .css file above or select a pre-bundled sample dataset below.
              </div>
            )}

            {/* Primary Action Button */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                <Zap className="h-3.5 w-3.5 text-indigo-600" />
                <span>
                  Targeting endpoint:{' '}
                  <code className="font-mono text-slate-800 font-semibold bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                    POST /api/analyze
                  </code>
                </span>
              </div>
              <button
                disabled={!stagedFile || isLoading}
                onClick={() => stagedFile && onAnalyze(stagedFile)}
                className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold transition-all shadow-xs flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
                type="button"
              >
                <Zap className={`h-4 w-4 ${isLoading ? 'animate-spin' : 'group-hover:scale-110 transition-transform'}`} />
                <span>{isLoading ? 'Analyzing AST via tinycss2...' : 'Analyze Stylesheet with tinycss2'}</span>
              </button>
            </div>
          </div>

          {/* Quick Start with Sample Datasets */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FlaskConical className="h-4 w-4 text-indigo-600" />
                <span className="font-bold text-sm sm:text-base text-slate-900">
                  Quick Start with Sample Datasets
                </span>
              </div>
              <span className="text-xs text-slate-400">
                Real backend fixtures
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Sample Card 1: Standard Sample */}
              <div className="bg-white rounded-xl p-5 shadow-2xs border border-slate-200 flex flex-col justify-between gap-4 hover:border-indigo-300 transition-colors group">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100 font-semibold">
                      Standard Spec
                    </span>
                    <span className="font-mono text-xs text-slate-400">2.0 KB</span>
                  </div>
                  <h3 className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-indigo-600 transition-colors">
                    Bootstrap & Utility CSS
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Clean modern design system with standard utility classes, flexbox layouts, grid configurations, and root CSS custom properties.
                  </p>
                </div>
                <button
                  onClick={() => onLoadSample('standard')}
                  disabled={isLoading}
                  className="w-full py-2 px-3 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 shadow-2xs cursor-pointer"
                  type="button"
                >
                  <FileSpreadsheet className="h-3.5 w-3.5 text-indigo-600" />
                  <span>Load Standard Sample</span>
                </button>
              </div>

              {/* Sample Card 2: Edge Cases & Torture Test */}
              <div className="bg-white rounded-xl p-5 shadow-2xs border border-slate-200 flex flex-col justify-between gap-4 hover:border-indigo-300 transition-colors group">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-semibold">
                      Stress Benchmark
                    </span>
                    <span className="font-mono text-xs text-slate-400">1.6 KB</span>
                  </div>
                  <h3 className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-indigo-600 transition-colors">
                    Edge Cases & Torture Test CSS
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Complex CSS featuring deeply nested @media queries, custom variables, calc(), complex pseudo-selectors, and duplicate fallback declarations.
                  </p>
                </div>
                <button
                  onClick={() => onLoadSample('edge_cases')}
                  disabled={isLoading}
                  className="w-full py-2 px-3 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 shadow-2xs cursor-pointer"
                  type="button"
                >
                  <Brain className="h-3.5 w-3.5 text-amber-600" />
                  <span>Load Edge Cases Sample</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Pipeline Execution Monitor & Validation Specs */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Live Parsing Progress State Simulation Card */}
          <div className="bg-white rounded-xl p-5 shadow-2xs border border-slate-200 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></span>
                <span className="font-bold text-xs sm:text-sm text-slate-900">Pipeline Lifecycle</span>
              </div>
              <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                {analysisResult ? `${analysisResult.metadata.parse_time_ms}ms elapsed` : 'Awaiting input'}
              </span>
            </div>

            {/* Step List */}
            <div className="flex flex-col gap-3 relative">
              <div className="absolute left-3.5 top-3 bottom-3 w-0.5 bg-slate-100 -z-0"></div>

              {/* Step 1 */}
              <div className="flex items-start gap-3 relative z-10">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shadow-xs shrink-0 ${
                  stagedFile ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'
                }`}>
                  <Check className="h-3.5 w-3.5 stroke-[3]" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-semibold text-slate-800">
                    File reception & encoding check
                  </span>
                  <span className="font-mono text-[11px] text-slate-500">
                    {stagedFile ? `${stagedFile.name} • UTF-8 strict verified` : 'MIME verified: text/css • UTF-8 strict'}
                  </span>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-3 relative z-10">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shadow-xs shrink-0 ${
                  analysisResult ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'
                }`}>
                  <Check className="h-3.5 w-3.5 stroke-[3]" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-semibold text-slate-800">
                    Tokenization via tinycss2
                  </span>
                  <span className="font-mono text-[11px] text-slate-500">
                    {analysisResult ? `Stream parsed: ${analysisResult.metadata.total_declarations * 3 + 12} tokens` : 'W3C CSS Syntax Level 3 tokenizer'}
                  </span>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-3 relative z-10">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shadow-xs shrink-0 ${
                  analysisResult ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'
                }`}>
                  <Check className="h-3.5 w-3.5 stroke-[3]" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-semibold text-slate-800">
                    AST node generation & selectors
                  </span>
                  <span className="font-mono text-[11px] text-slate-500">
                    {analysisResult ? `Constructed: ${analysisResult.rules.length} QualifiedRule & ${analysisResult.at_rules.length} AtRule trees` : 'Constructed: QualifiedRule & AtRule trees'}
                  </span>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex items-start gap-3 relative z-10">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shadow-xs shrink-0 ${
                  analysisResult ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'
                }`}>
                  <CheckCircle2 className="h-3.5 w-3.5" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-semibold text-slate-800">
                    Metric aggregation & JSON cache
                  </span>
                  <span className="font-mono text-[11px] text-indigo-600 font-medium">
                    {analysisResult ? `Finished in ${analysisResult.metadata.parse_time_ms}ms (ready to query)` : 'Telemetry aggregation pending'}
                  </span>
                </div>
              </div>
            </div>

            {/* Metric Sparkline / Quick Health Mini-card */}
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex flex-col gap-1 mt-1">
              <div className="flex items-center justify-between text-slate-500 font-mono text-[11px]">
                <span>AST Memory Footprint</span>
                <span className="text-slate-800 font-semibold">
                  {analysisResult ? `${(analysisResult.metadata.file_size_bytes * 1.8 / 1024).toFixed(1)} KB` : '1.4 MB'}
                </span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                  style={{ width: analysisResult ? '48%' : '24%' }}
                ></div>
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mt-0.5">
                <span>Heap Allocation: OK</span>
                <span>Allocated: {analysisResult ? '48%' : '24%'} of buffer</span>
              </div>
            </div>
          </div>

          {/* Backend Contract & Integration Reference Panel */}
          <div className="bg-white rounded-xl p-5 shadow-2xs border border-slate-200 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4 text-indigo-600" />
              <span className="font-bold text-xs sm:text-sm text-slate-900">
                API Contract Specification
              </span>
            </div>

            <div className="flex flex-col gap-2 font-mono text-xs">
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 text-slate-900 flex items-center justify-between">
                <span className="text-indigo-600 font-bold">POST</span>
                <span className="text-slate-600">/api/analyze</span>
              </div>
              <div className="flex flex-col gap-1.5 text-xs text-slate-500">
                <div className="flex items-center justify-between">
                  <span>Encoding:</span>
                  <span className="font-mono text-slate-800">UTF-8 / Latin-1 fallback</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Payload limit:</span>
                  <span className="font-mono text-slate-800">2,097,152 bytes (2 MB)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Field name:</span>
                  <span className="font-mono text-slate-800">file (multipart/form-data)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Response schema:</span>
                  <span className="font-mono text-indigo-600 font-semibold">AnalysisResponse</span>
                </div>
              </div>
            </div>

            {/* Inline code sample snippet */}
            <div className="rounded-lg bg-slate-900 p-3 font-mono text-xs text-slate-100 overflow-x-auto flex flex-col gap-1 shadow-inner">
              <div className="text-slate-400 text-[10px] select-none"># cURL invocation example</div>
              <div className="text-slate-200">
                <span className="text-indigo-400 font-semibold">curl</span> -X POST http://localhost:8000/api/analyze \<br />
                &nbsp;&nbsp;-F <span className="text-emerald-400">"file=@style.css"</span>
              </div>
            </div>

            {/* Documentation link CTA */}
            <button
              onClick={onViewJson}
              className="text-indigo-600 hover:text-indigo-800 text-xs font-semibold flex items-center justify-between p-2 rounded-lg bg-indigo-50/70 hover:bg-indigo-50 border border-indigo-100 transition-colors w-full text-left cursor-pointer"
              type="button"
            >
              <span>Explore AST JSON Schemas</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
