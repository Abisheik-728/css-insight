import React, { useState } from 'react';
import type { AnalysisResult } from '../types';
import {
  FileCode,
  FolderTree,
  Layers,
  SlidersHorizontal,
  Palette,
  AlertTriangle,
  Clock,
  ArrowRight,
  UploadCloud,
  Play,
  Check,
  Copy,
  Info,
} from 'lucide-react';

interface OverviewViewProps {
  data: AnalysisResult | null;
  onGoToAnalyze: () => void;
  onGoToSelectors: () => void;
  onGoToProperties: () => void;
  onLoadSample: () => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  data,
  onGoToAnalyze,
  onGoToSelectors,
  onGoToProperties,
  onLoadSample,
}) => {
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  const handleCopyColor = (color: string) => {
    navigator.clipboard.writeText(color);
    setCopiedColor(color);
    setTimeout(() => setCopiedColor(null), 2000);
  };

  // Compact, centered empty state as requested in Item 3
  if (!data) {
    return (
      <div className="max-w-md mx-auto my-8 sm:my-14 bg-white rounded-2xl border border-slate-200/90 shadow-sm p-8 text-center animate-in fade-in duration-200">
        <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mx-auto mb-4 shadow-2xs">
          <FileCode className="h-6 w-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 mb-1.5">No stylesheet analyzed yet</h2>
        <p className="text-xs sm:text-sm text-slate-500 mb-6 leading-relaxed">
          Upload a CSS file to extract selectors, declarations, properties, and AST telemetry, or try a pre-bundled sample stylesheet.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
          <button
            onClick={onGoToAnalyze}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs sm:text-sm shadow-xs transition-colors"
          >
            <UploadCloud className="h-4 w-4" />
            <span>Upload stylesheet</span>
          </button>
          <button
            onClick={onLoadSample}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-medium text-xs sm:text-sm transition-colors shadow-2xs"
          >
            <Play className="h-4 w-4 fill-indigo-600 text-indigo-600" />
            <span>Load sample CSS</span>
          </button>
        </div>
      </div>
    );
  }

  const meta = data.metadata;

  const cards = [
    {
      title: 'Style Rules',
      value: meta.total_rules,
      icon: FileCode,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-100',
      description: 'Qualified rule blocks mapping selectors to declarations.',
    },
    {
      title: 'Individual Selectors',
      value: meta.total_selectors,
      icon: FolderTree,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-100',
      description: 'Discrete targets extracted from comma-separated selector lists.',
    },
    {
      title: 'Declarations',
      value: meta.total_declarations,
      icon: Layers,
      color: 'text-violet-600',
      bgColor: 'bg-violet-50',
      borderColor: 'border-violet-100',
      description: 'Property-value statements declared inside rule blocks.',
    },
    {
      title: 'Unique Properties',
      value: meta.unique_properties,
      icon: SlidersHorizontal,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-100',
      description: 'Distinct CSS property names utilized in the stylesheet.',
    },
    {
      title: 'Detectable Colors',
      value: meta.unique_colors,
      icon: Palette,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
      borderColor: 'border-pink-100',
      description: 'Catalog of unique hex, rgb(), hsl(), and named colors.',
    },
    {
      title: 'Diagnostics & Warnings',
      value: data.warnings.length,
      icon: AlertTriangle,
      color: data.warnings.length > 0 ? 'text-amber-600' : 'text-emerald-600',
      bgColor: data.warnings.length > 0 ? 'bg-amber-50' : 'bg-emerald-50',
      borderColor: data.warnings.length > 0 ? 'border-amber-100' : 'border-emerald-100',
      description: data.warnings.length > 0 ? 'Duplicate declarations or syntax recovery notices.' : 'Clean AST parse without duplication or syntax warnings.',
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Overview Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-1.5 text-indigo-600 text-xs font-semibold uppercase tracking-wider mb-1">
            <span className="h-2 w-2 rounded-full bg-indigo-600"></span>
            Telemetry Dashboard
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Stylesheet Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Real AST calculations from <span className="font-mono text-indigo-700 font-semibold">{meta.filename}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-mono flex items-center gap-2 shadow-2xs">
            <Clock className="h-3.5 w-3.5 text-indigo-600" />
            <span>Parse duration: <strong className="font-semibold text-slate-900">{meta.parse_time_ms} ms</strong></span>
          </div>
        </div>
      </div>

      {/* Prominent Non-CSS / Plain Text Notice */}
      {(!data.has_valid_rules && !data.is_empty) && (
        <div className="p-4 sm:p-5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-100 border border-amber-200 flex items-center justify-center shrink-0 text-amber-700">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-amber-950">
                No valid CSS rules found. Please upload a valid CSS stylesheet.
              </h3>
              <p className="text-xs text-amber-800 mt-0.5">
                The uploaded file contains no recognized CSS selectors, rule blocks, or at-rules. Technical parser diagnostics ({data.warnings.length} {data.warnings.length === 1 ? 'notice' : 'notices'}) are viewable in the Diagnostics tab.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <button
              onClick={onGoToAnalyze}
              className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs shadow-xs transition-colors cursor-pointer"
            >
              Upload Another File
            </button>
            <button
              onClick={onLoadSample}
              className="px-3 py-1.5 rounded-lg bg-white hover:bg-amber-100/50 border border-amber-200 text-amber-900 font-medium text-xs transition-colors shadow-2xs cursor-pointer"
            >
              Load Sample CSS
            </button>
          </div>
        </div>
      )}

      {/* Empty Stylesheet Friendly Notice */}
      {data.is_empty && (
        <div className="p-4 sm:p-5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-100 border border-blue-200 flex items-center justify-center shrink-0 text-blue-700">
              <Info className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-blue-950">
                Your stylesheet is empty. Add some CSS rules or upload another file.
              </h3>
              <p className="text-xs text-blue-700 mt-0.5">
                This file contains zero CSS rules, selectors, and declarations. No syntax errors were detected.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <button
              onClick={onGoToAnalyze}
              className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs shadow-xs transition-colors cursor-pointer"
            >
              Upload Stylesheet
            </button>
            <button
              onClick={onLoadSample}
              className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-medium text-xs transition-colors shadow-2xs cursor-pointer"
            >
              Load Sample CSS
            </button>
          </div>
        </div>
      )}

      {/* 6 Real Backend Metrics Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {cards.map((c, idx) => {
          const Icon = c.icon;
          return (
            <div
              key={idx}
              className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs flex flex-col justify-between hover:border-slate-300 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-slate-500 truncate">{c.title}</span>
                  <div className={`w-7 h-7 rounded-lg ${c.bgColor} ${c.borderColor} border flex items-center justify-center shrink-0`}>
                    <Icon className={`h-4 w-4 ${c.color}`} />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 tracking-tight">
                  {c.value.toLocaleString()}
                </div>
              </div>
              <p className="text-[11px] text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                {c.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Extracted Color Palette */}
      {data.detected_colors.length > 0 && (
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Palette className="h-4 w-4 text-pink-600" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                Extracted Color Palette ({data.detected_colors.length})
              </h3>
            </div>
            <span className="text-[11px] text-slate-400">Click swatch to copy</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {data.detected_colors.map((color, idx) => (
              <button
                key={idx}
                onClick={() => handleCopyColor(color)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-mono text-slate-700 transition-colors shadow-2xs cursor-pointer group"
                title="Click to copy color code"
              >
                <span
                  className="w-3.5 h-3.5 rounded-full border border-slate-300 shadow-xs shrink-0"
                  style={{ backgroundColor: color }}
                />
                <span className="font-medium">{color}</span>
                {copiedColor === color ? (
                  <Check className="h-3 w-3 text-emerald-600 animate-in fade-in" />
                ) : (
                  <Copy className="h-3 w-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Top Properties & Architecture Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left: Top Properties */}
        <div className="lg:col-span-8 bg-white rounded-xl p-5 border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-indigo-600" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                Top Utilized CSS Properties
              </h3>
            </div>
            <button
              onClick={onGoToProperties}
              className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
            >
              <span>Explore all declarations</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {data.top_properties.slice(0, 10).map((p, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex flex-col gap-1"
              >
                <div className="flex items-center justify-between font-mono text-xs">
                  <span className="font-semibold text-indigo-700 truncate">{p.property}</span>
                  <span className="text-slate-500 font-sans text-[11px]">{p.count}x ({p.percentage}%)</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-1">
                  <div
                    className="bg-indigo-600 h-full rounded-full"
                    style={{ width: `${Math.min(p.percentage * 2.5, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Architecture Summary */}
        <div className="lg:col-span-4 bg-white rounded-xl p-5 border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Info className="h-4 w-4 text-slate-500" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
              Stylesheet Architecture
            </h3>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
              <span className="text-slate-500">File Name:</span>
              <span className="font-mono font-semibold text-slate-800 truncate max-w-[160px]">
                {meta.filename}
              </span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
              <span className="text-slate-500">File Size:</span>
              <span className="font-mono font-semibold text-slate-800">
                {(meta.file_size_bytes / 1024).toFixed(1)} KB
              </span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
              <span className="text-slate-500">At-Rules / Queries:</span>
              <span className="font-mono font-semibold text-indigo-600">
                {meta.total_at_rules} rules
              </span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
              <span className="text-slate-500">Comments Parsed:</span>
              <span className="font-mono font-semibold text-slate-800">
                {meta.total_comments} blocks
              </span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
              <span className="text-slate-500">Parser Engine:</span>
              <span className="font-mono font-semibold text-indigo-600">
                tinycss2 W3C Spec
              </span>
            </div>
          </div>

          <button
            onClick={onGoToSelectors}
            className="w-full py-2 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-medium transition-colors flex items-center justify-center gap-1.5 mt-2"
          >
            <FolderTree className="h-3.5 w-3.5 text-indigo-600" />
            <span>View All {meta.total_rules} Rule Blocks</span>
          </button>
        </div>
      </div>
    </div>
  );
};
