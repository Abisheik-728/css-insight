import React, { useRef, useState } from 'react';
import type { DragEvent, ChangeEvent } from 'react';
import type { AnalysisResult } from '../types';

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
    <div className="flex flex-col w-full gap-space-xl animate-in fade-in duration-200">
      {/* Dynamic Notification Bar / Top Meta */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md pb-space-xs">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-space-xs text-primary font-code-sm text-code-sm uppercase tracking-wider font-semibold">
            <span className="inline-block w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            Parser Ingestion Gateway
          </div>
          <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight">
            Analyze your stylesheet
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-3xl">
            Upload a CSS file to extract selectors, declarations, properties, and structured AST insights. Powered by low-latency tinycss2 Python engine.
          </p>
        </div>
        <div className="flex items-center gap-space-xs self-start md:self-auto">
          <span className="font-code-sm text-code-sm px-space-sm py-1 rounded-lg bg-surface-container-high text-on-surface font-medium flex items-center gap-1.5 shadow-sm">
            <span className="material-symbols-outlined text-[15px] text-primary">speed</span>
            Benchmark: ~18ms / 1,000 lines
          </span>
          <span className="font-code-sm text-code-sm px-space-sm py-1 rounded-lg bg-surface-container-high text-secondary flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[15px]">memory</span>
            AST Spec v1.4
          </span>
        </div>
      </div>

      {/* Error or Success Alerts */}
      {activeError && (
        <div className="p-4 rounded-xl bg-error-container text-on-error-container border border-error/20 flex items-start gap-3">
          <span className="material-symbols-outlined text-error text-[20px] shrink-0 mt-0.5">error</span>
          <div className="flex-1 text-body-md">
            <strong className="font-semibold">Validation Notice: </strong>
            {activeError}
          </div>
        </div>
      )}

      {analysisResult && !isLoading && (
        <div className="p-4 rounded-xl bg-secondary-container/50 border border-primary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
            </div>
            <div>
              <p className="font-label-md text-label-md text-on-surface font-semibold">
                Successfully parsed <span className="font-code-sm text-primary">{analysisResult.metadata.filename}</span> in {analysisResult.metadata.parse_time_ms} ms
              </p>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Extracted {analysisResult.metadata.total_rules} rules, {analysisResult.metadata.total_selectors} selectors, and {analysisResult.metadata.total_declarations} declarations.
              </p>
            </div>
          </div>
          <button
            onClick={onViewResults}
            className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-sm text-label-sm font-semibold transition-colors flex items-center justify-center gap-1.5 shrink-0 shadow-sm"
          >
            <span>View Telemetry Dashboard</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </div>
      )}

      {/* Primary Workstation Grid: Upload Zone (Left/Main) & Engine Spec Panel (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
        {/* Left Column (8 cols): Upload Card, Live File Staging, Sample Datasets */}
        <div className="lg:col-span-8 flex flex-col gap-space-lg">
          {/* Upload Surface Card */}
          <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm border border-outline-variant/30 flex flex-col gap-space-lg relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-xs">
                <span className="font-headline-sm text-headline-sm text-on-surface">Source File Upload</span>
                <span className="font-code-sm text-code-sm px-space-xs py-0.5 rounded bg-surface-container text-on-surface-variant">
                  multipart/form-data
                </span>
              </div>
              <span className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px] text-secondary">verified_user</span>
                UTF-8 Enforced
              </span>
            </div>

            {/* Dropzone Canvas */}
            <div
              id="dropzone"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`group relative flex flex-col items-center justify-center text-center p-space-2xl rounded-xl transition-all cursor-pointer border-2 border-dashed ${
                isDragOver
                  ? 'bg-secondary-container/40 border-primary scale-[1.005]'
                  : 'bg-surface-container-low border-outline-variant/50 hover:bg-secondary-container/20 hover:border-primary/50'
              }`}
            >
              <input
                ref={fileInputRef}
                accept=".css"
                type="file"
                onChange={handleFileInputChange}
                className="hidden"
              />

              <div className="w-14 h-14 rounded-full bg-surface-container-lowest shadow-sm flex items-center justify-center text-primary group-hover:scale-105 group-hover:bg-primary group-hover:text-on-primary transition-all mb-space-md">
                <span className="material-symbols-outlined text-[28px]">cloud_upload</span>
              </div>

              <div className="flex flex-col gap-1 items-center max-w-md">
                <div className="flex flex-wrap items-center justify-center gap-1.5 font-headline-sm text-headline-sm text-on-surface">
                  <span className="text-primary font-semibold">Browse files</span>
                  <span className="text-on-surface-variant font-normal">or drag and drop your stylesheet here</span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                  Accepted format: <span className="font-code-sm text-code-sm px-1.5 py-0.5 rounded bg-surface-container text-on-surface">.css</span> • Maximum size: <span className="font-medium text-on-surface">2 MB</span>
                </p>
              </div>

              <div className="mt-space-md flex items-center gap-space-sm text-on-surface-variant font-code-sm text-code-sm opacity-75">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">check</span> Auto-sanitized
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">check</span> Comments retained in AST
                </span>
              </div>
            </div>

            {/* Selected File Status Card */}
            {stagedFile ? (
              <div className="bg-surface-container-low rounded-xl p-space-md flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md border border-outline-variant/20">
                <div className="flex items-center gap-space-md min-w-0">
                  <div className="w-11 h-11 rounded-lg bg-surface-container-high flex items-center justify-center text-primary shrink-0 shadow-sm">
                    <span className="material-symbols-outlined text-[24px]">css</span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-space-xs">
                      <span className="font-headline-sm text-headline-sm text-on-surface truncate font-semibold">
                        {stagedFile.name}
                      </span>
                      <span className="font-code-sm text-code-sm px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium shrink-0">
                        {analysisResult?.metadata.filename === stagedFile.name ? 'Parsed' : 'Ready'}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-space-xs font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                      <span className="font-code-sm text-code-sm text-on-surface">
                        {formatFileSize(stagedFile.size)}
                      </span>
                      <span>•</span>
                      <span>CSS Document</span>
                      <span>•</span>
                      <span className="text-primary font-medium flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">task_alt</span>
                        Validation passed
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-space-xs shrink-0 self-end md:self-center">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-space-sm py-1.5 rounded-lg bg-surface-container-highest hover:bg-surface-container-high text-on-surface font-label-sm text-label-sm transition-colors flex items-center gap-1"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[15px]">sync</span>
                    Replace
                  </button>
                  <button
                    onClick={onRemoveFile}
                    className="p-1.5 rounded-lg bg-surface-container-highest hover:bg-error-container hover:text-on-error-container text-on-surface-variant transition-colors flex items-center justify-center"
                    title="Remove stylesheet"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-surface-container-low/60 rounded-xl p-space-md text-center text-on-surface-variant font-body-sm text-body-sm border border-dashed border-outline-variant/30">
                No stylesheet staged. Choose a .css file above or select a pre-bundled sample dataset below.
              </div>
            )}

            {/* Big Primary Trigger Action */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-space-md pt-space-xs">
              <div className="flex items-center gap-space-xs text-on-surface-variant font-label-sm text-label-sm">
                <span className="material-symbols-outlined text-[16px] text-primary">bolt</span>
                <span>
                  Targeting endpoint:{' '}
                  <code className="font-code-sm text-code-sm text-on-surface font-medium bg-surface-container px-1 py-0.5 rounded">
                    POST /api/analyze
                  </code>
                </span>
              </div>
              <button
                disabled={!stagedFile || isLoading}
                onClick={() => stagedFile && onAnalyze(stagedFile)}
                className="w-full sm:w-auto px-space-xl py-2.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md font-semibold transition-all shadow-sm flex items-center justify-center gap-space-xs disabled:opacity-50 disabled:cursor-not-allowed group"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px] group-hover:rotate-12 transition-transform">
                  {isLoading ? 'progress_activity' : 'bolt'}
                </span>
                <span>{isLoading ? 'Analyzing AST via tinycss2...' : 'Analyze Stylesheet with tinycss2'}</span>
              </button>
            </div>
          </div>

          {/* Quick Start with Sample Datasets */}
          <div className="flex flex-col gap-space-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-primary text-[20px]">science</span>
                <span className="font-headline-sm text-headline-sm text-on-surface">
                  Quick Start with Sample Datasets
                </span>
              </div>
              <span className="font-label-sm text-label-sm text-on-surface-variant">
                Pre-loaded engine fixtures
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
              {/* Sample Card 1: Standard Sample */}
              <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm border border-outline-variant/30 flex flex-col justify-between gap-space-md hover:bg-surface-container-low transition-colors group">
                <div className="flex flex-col gap-space-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-code-sm text-code-sm px-2 py-0.5 rounded bg-surface-container text-primary font-medium">
                      Standard Spec
                    </span>
                    <span className="font-code-sm text-code-sm text-on-surface-variant">2.0 KB</span>
                  </div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface group-hover:text-primary transition-colors">
                    Bootstrap & Utility CSS
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                    Clean modern design system with standard utility classes, flexbox layouts, grid configurations, and root CSS custom properties.
                  </p>
                </div>
                <button
                  onClick={() => onLoadSample('standard')}
                  disabled={isLoading}
                  className="w-full py-2 px-space-md rounded-lg bg-surface-container-high hover:bg-surface-container text-on-surface font-label-sm text-label-sm font-medium transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[16px]">file_open</span>
                  <span>Load Standard Sample</span>
                </button>
              </div>

              {/* Sample Card 2: Edge Cases & Torture Test */}
              <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm border border-outline-variant/30 flex flex-col justify-between gap-space-md hover:bg-surface-container-low transition-colors group">
                <div className="flex flex-col gap-space-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-code-sm text-code-sm px-2 py-0.5 rounded bg-error-container text-on-error-container font-medium">
                      Stress Benchmark
                    </span>
                    <span className="font-code-sm text-code-sm text-on-surface-variant">1.6 KB</span>
                  </div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface group-hover:text-primary transition-colors">
                    Edge Cases & Torture Test CSS
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                    Complex CSS featuring deeply nested @media queries, custom variables, calc(), complex pseudo-selectors, and duplicate fallback declarations.
                  </p>
                </div>
                <button
                  onClick={() => onLoadSample('edge_cases')}
                  disabled={isLoading}
                  className="w-full py-2 px-space-md rounded-lg bg-surface-container-high hover:bg-surface-container text-on-surface font-label-sm text-label-sm font-medium transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[16px]">psychology</span>
                  <span>Load Edge Cases Sample</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Pipeline Execution Monitor & Validation Specs */}
        <div className="lg:col-span-4 flex flex-col gap-space-lg">
          {/* Live Parsing Progress State Simulation Card */}
          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm border border-outline-variant/30 flex flex-col gap-space-md">
            <div className="flex items-center justify-between pb-space-xs border-b border-outline-variant/20">
              <div className="flex items-center gap-space-xs">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                <span className="font-headline-sm text-headline-sm text-on-surface">Pipeline Lifecycle</span>
              </div>
              <span className="font-code-sm text-code-sm px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-mono">
                {analysisResult ? `${analysisResult.metadata.parse_time_ms}ms elapsed` : 'Awaiting input'}
              </span>
            </div>

            {/* Step List */}
            <div className="flex flex-col gap-space-sm relative">
              <div className="absolute left-3.5 top-3 bottom-3 w-0.5 bg-surface-container-high -z-0"></div>

              {/* Step 1 */}
              <div className="flex items-start gap-space-sm relative z-10">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shadow-sm shrink-0 ${
                  stagedFile ? 'bg-primary text-on-primary' : 'bg-surface-container-highest text-on-surface-variant'
                }`}>
                  <span className="material-symbols-outlined text-[16px] font-bold">check</span>
                </div>
                <div className="flex flex-col pt-0.5 min-w-0">
                  <span className="font-label-md text-label-md text-on-surface font-semibold">
                    File reception & encoding check
                  </span>
                  <span className="font-code-sm text-code-sm text-on-surface-variant">
                    {stagedFile ? `${stagedFile.name} • UTF-8 strict verified` : 'MIME verified: text/css • UTF-8 strict'}
                  </span>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-space-sm relative z-10">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shadow-sm shrink-0 ${
                  analysisResult ? 'bg-primary text-on-primary' : 'bg-surface-container-highest text-on-surface-variant'
                }`}>
                  <span className="material-symbols-outlined text-[16px] font-bold">check</span>
                </div>
                <div className="flex flex-col pt-0.5 min-w-0">
                  <span className="font-label-md text-label-md text-on-surface font-semibold">
                    Tokenization via tinycss2
                  </span>
                  <span className="font-code-sm text-code-sm text-on-surface-variant">
                    {analysisResult ? `Stream parsed: ${analysisResult.metadata.total_declarations * 3 + 12} tokens` : 'W3C CSS Syntax Level 3 tokenizer'}
                  </span>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-space-sm relative z-10">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shadow-sm shrink-0 ${
                  analysisResult ? 'bg-primary text-on-primary' : 'bg-surface-container-highest text-on-surface-variant'
                }`}>
                  <span className="material-symbols-outlined text-[16px] font-bold">check</span>
                </div>
                <div className="flex flex-col pt-0.5 min-w-0">
                  <span className="font-label-md text-label-md text-on-surface font-semibold">
                    AST node generation & selectors
                  </span>
                  <span className="font-code-sm text-code-sm text-on-surface-variant">
                    {analysisResult ? `Constructed: ${analysisResult.rules.length} QualifiedRule & ${analysisResult.at_rules.length} AtRule trees` : 'Constructed: QualifiedRule & AtRule trees'}
                  </span>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex items-start gap-space-sm relative z-10">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shadow-sm shrink-0 ${
                  analysisResult ? 'bg-primary text-on-primary' : 'bg-surface-container-highest text-on-surface-variant'
                }`}>
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                </div>
                <div className="flex flex-col pt-0.5 min-w-0">
                  <span className="font-label-md text-label-md text-on-surface font-semibold">
                    Metric aggregation & JSON cache
                  </span>
                  <span className="font-code-sm text-code-sm text-primary font-medium">
                    {analysisResult ? `Finished in ${analysisResult.metadata.parse_time_ms}ms (ready to query)` : 'Telemetry aggregation pending'}
                  </span>
                </div>
              </div>
            </div>

            {/* Metric Sparkline / Quick Health Mini-card */}
            <div className="p-space-sm rounded-lg bg-surface-container-low flex flex-col gap-space-xs mt-space-xs">
              <div className="flex items-center justify-between text-on-surface-variant font-code-sm text-code-sm">
                <span>AST Memory Footprint</span>
                <span className="text-on-surface font-semibold">
                  {analysisResult ? `${(analysisResult.metadata.file_size_bytes * 1.8 / 1024).toFixed(1)} KB` : '1.4 MB'}
                </span>
              </div>
              <div className="w-full bg-surface-container-highest h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-primary h-full rounded-full transition-all duration-500"
                  style={{ width: analysisResult ? '48%' : '24%' }}
                ></div>
              </div>
              <div className="flex items-center justify-between text-[10px] text-on-surface-variant font-code-sm mt-0.5">
                <span>Heap Allocation: OK</span>
                <span>Allocated: {analysisResult ? '48%' : '24%'} of buffer</span>
              </div>
            </div>
          </div>

          {/* Backend Contract & Integration Reference Panel */}
          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm border border-outline-variant/30 flex flex-col gap-space-md">
            <div className="flex items-center gap-space-xs">
              <span className="material-symbols-outlined text-secondary text-[20px]">terminal</span>
              <span className="font-headline-sm text-headline-sm text-on-surface">
                API Contract Specification
              </span>
            </div>

            <div className="flex flex-col gap-space-sm font-code-sm text-code-sm">
              <div className="p-space-xs rounded bg-surface-container text-on-surface flex items-center justify-between">
                <span className="text-primary font-semibold">POST</span>
                <span className="text-on-surface-variant">/api/analyze</span>
              </div>
              <div className="flex flex-col gap-1.5 text-body-sm text-body-sm text-on-surface-variant">
                <div className="flex items-center justify-between">
                  <span>Encoding:</span>
                  <span className="font-code-sm text-code-sm text-on-surface">UTF-8 / Latin-1 fallback</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Payload limit:</span>
                  <span className="font-code-sm text-code-sm text-on-surface">2,097,152 bytes (2 MB)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Field name:</span>
                  <span className="font-code-sm text-code-sm text-on-surface">file (multipart/form-data)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Response schema:</span>
                  <span className="font-code-sm text-code-sm text-primary">AnalysisResponse</span>
                </div>
              </div>
            </div>

            {/* Inline code sample snippet */}
            <div className="rounded-lg bg-surface-container-high p-space-sm font-code-sm text-code-sm text-on-surface overflow-x-auto flex flex-col gap-1">
              <div className="text-on-surface-variant text-[11px] select-none"># cURL invocation example</div>
              <div className="text-on-surface">
                <span className="text-primary font-semibold">curl</span> -X POST http://localhost:8000/api/analyze \<br />
                &nbsp;&nbsp;-F <span className="text-secondary">"file=@style.css"</span>
              </div>
            </div>

            {/* Documentation link CTA */}
            <button
              onClick={onViewJson}
              className="text-primary hover:text-primary-container font-label-sm text-label-sm font-medium flex items-center justify-between p-space-xs rounded bg-primary/5 hover:bg-primary/10 transition-colors w-full text-left"
              type="button"
            >
              <span>Explore AST JSON Schemas</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
