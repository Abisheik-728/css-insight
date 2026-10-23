import React, { useState } from 'react';
import type { AnalysisResult } from '../types';

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

  if (!data) {
    return (
      <div className="bg-surface-container-lowest rounded-xl p-space-2xl shadow-sm border border-outline-variant/30 text-center flex flex-col items-center justify-center gap-space-md py-16 animate-in fade-in duration-200">
        <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center text-primary mb-2">
          <span className="material-symbols-outlined text-[32px]">dashboard</span>
        </div>
        <h2 className="font-headline-lg text-headline-lg text-on-surface">No Stylesheet Analyzed Yet</h2>
        <p className="font-body-md text-body-md text-on-surface-variant max-w-md">
          Upload a stylesheet in the Analyze tab or run one of our pre-bundled sample datasets to unlock real AST telemetry and metrics.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
          <button
            onClick={onGoToAnalyze}
            className="px-space-lg py-2.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md font-semibold transition-colors flex items-center gap-2 shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">upload_file</span>
            <span>Upload Stylesheet</span>
          </button>
          <button
            onClick={onLoadSample}
            className="px-space-lg py-2.5 rounded-lg bg-surface-container-high hover:bg-surface-container text-on-surface font-label-md text-label-md font-medium transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">science</span>
            <span>Load Standard Sample</span>
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
      icon: 'format_paint',
      badge: 'Rules',
      desc: 'Total qualified CSS blocks mapped to one or more selectors.',
    },
    {
      title: 'Individual Selectors',
      value: meta.total_selectors,
      icon: 'account_tree',
      badge: 'Targets',
      desc: 'Discrete targets extracted from comma-separated selector lists.',
    },
    {
      title: 'Declarations',
      value: meta.total_declarations,
      icon: 'layers',
      badge: 'Statements',
      desc: 'Individual property-value pairs declared inside rule blocks.',
    },
    {
      title: 'Unique Properties',
      value: meta.unique_properties,
      icon: 'tune',
      badge: 'Distinct',
      desc: 'Distinct CSS property names utilized across the stylesheet.',
    },
    {
      title: 'Detectable Colors',
      value: meta.unique_colors,
      icon: 'palette',
      badge: 'Palette',
      desc: 'Unique hex codes, rgb/rgba, hsl/hsla, and named colors.',
    },
    {
      title: 'Diagnostics & Warnings',
      value: data.warnings.length,
      icon: 'warning',
      badge: data.warnings.length > 0 ? 'Notices' : 'Clean',
      badgeColor: data.warnings.length > 0 ? 'bg-error-container text-on-error-container' : 'bg-surface-container text-primary',
      desc: 'Duplicate declarations, vendor fallback notes, and syntax errors.',
    },
  ];

  return (
    <div className="flex flex-col w-full gap-space-xl animate-in fade-in duration-200">
      {/* Overview Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md pb-space-xs border-b border-outline-variant/30">
        <div>
          <div className="flex items-center gap-space-xs text-primary font-code-sm text-code-sm uppercase tracking-wider font-semibold">
            <span className="inline-block w-2 h-2 rounded-full bg-primary"></span>
            Telemetry Dashboard
          </div>
          <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight">
            Stylesheet Overview
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
            Real AST calculations generated directly from <span className="font-code-sm text-primary font-semibold">{meta.filename}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-space-md py-1.5 rounded-lg bg-surface-container-high text-on-surface font-code-sm text-code-sm flex items-center gap-2 shadow-sm">
            <span className="material-symbols-outlined text-[16px] text-primary">timer</span>
            <span>Parse duration: <strong className="font-semibold">{meta.parse_time_ms} ms</strong></span>
          </div>
        </div>
      </div>

      {/* 6 Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-space-md">
        {cards.map((c, idx) => (
          <div
            key={idx}
            className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm border border-outline-variant/30 flex flex-col justify-between hover:bg-surface-container-low transition-colors group"
          >
            <div>
              <div className="flex items-center justify-between mb-space-sm">
                <span className="font-label-sm text-label-sm text-on-surface-variant">{c.title}</span>
                <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary group-hover:scale-105 transition-transform shadow-xs">
                  <span className="material-symbols-outlined text-[18px]">{c.icon}</span>
                </div>
              </div>
              <div className="font-headline-xl text-headline-xl text-on-surface font-bold tracking-tight mb-1">
                {c.value.toLocaleString()}
              </div>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2 mt-2 leading-relaxed">
              {c.desc}
            </p>
          </div>
        ))}
      </div>

      {/* Extracted Color Palette */}
      {data.detected_colors.length > 0 && (
        <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm border border-outline-variant/30 flex flex-col gap-space-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-space-xs">
              <span className="material-symbols-outlined text-primary text-[20px]">palette</span>
              <h3 className="font-headline-sm text-headline-sm text-on-surface">
                Extracted Color Palette ({data.detected_colors.length})
              </h3>
            </div>
            <span className="font-label-sm text-label-sm text-on-surface-variant">Click to copy hex/code</span>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {data.detected_colors.map((color, idx) => (
              <button
                key={idx}
                onClick={() => handleCopyColor(color)}
                className="flex items-center gap-2 px-space-sm py-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container-high border border-outline-variant/30 transition-all cursor-pointer font-code-sm text-code-sm text-on-surface group shadow-xs"
                title="Click to copy color code"
              >
                <span
                  className="w-4 h-4 rounded-full border border-outline-variant shadow-xs shrink-0"
                  style={{ backgroundColor: color }}
                />
                <span className="font-medium">{color}</span>
                {copiedColor === color && (
                  <span className="text-[10px] text-primary font-bold animate-in fade-in">Copied!</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Top Properties & AST Telemetry Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
        {/* Left (8 cols): Top Properties Frequency */}
        <div className="lg:col-span-8 bg-surface-container-lowest rounded-xl p-space-lg shadow-sm border border-outline-variant/30 flex flex-col gap-space-md">
          <div className="flex items-center justify-between pb-space-xs border-b border-outline-variant/20">
            <div className="flex items-center gap-space-xs">
              <span className="material-symbols-outlined text-primary text-[20px]">bar_chart</span>
              <h3 className="font-headline-sm text-headline-sm text-on-surface">
                Top Utilized CSS Properties
              </h3>
            </div>
            <button
              onClick={onGoToProperties}
              className="text-primary hover:text-primary-container font-label-sm text-label-sm font-medium flex items-center gap-1"
            >
              <span>Explore all declarations</span>
              <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
            {data.top_properties.slice(0, 10).map((p, idx) => (
              <div
                key={idx}
                className="p-space-sm rounded-lg bg-surface-container-low flex flex-col gap-1 border border-outline-variant/20"
              >
                <div className="flex items-center justify-between font-code-sm text-code-sm">
                  <span className="font-semibold text-primary">{p.property}</span>
                  <span className="text-on-surface-variant font-medium">{p.count}x ({p.percentage}%)</span>
                </div>
                <div className="w-full bg-surface-container-highest h-1.5 rounded-full overflow-hidden mt-1">
                  <div
                    className="bg-primary h-full rounded-full"
                    style={{ width: `${Math.min(p.percentage * 2.5, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right (4 cols): Telemetry Specs */}
        <div className="lg:col-span-4 bg-surface-container-lowest rounded-xl p-space-lg shadow-sm border border-outline-variant/30 flex flex-col gap-space-md">
          <div className="flex items-center gap-space-xs pb-space-xs border-b border-outline-variant/20">
            <span className="material-symbols-outlined text-secondary text-[20px]">info</span>
            <h3 className="font-headline-sm text-headline-sm text-on-surface">
              Stylesheet Architecture
            </h3>
          </div>

          <div className="flex flex-col gap-space-sm font-body-sm text-body-sm">
            <div className="flex items-center justify-between p-2 rounded bg-surface-container-low">
              <span className="text-on-surface-variant">File Name:</span>
              <span className="font-code-sm text-code-sm font-semibold text-on-surface truncate max-w-[180px]">
                {meta.filename}
              </span>
            </div>

            <div className="flex items-center justify-between p-2 rounded bg-surface-container-low">
              <span className="text-on-surface-variant">File Size:</span>
              <span className="font-code-sm text-code-sm font-semibold text-on-surface">
                {(meta.file_size_bytes / 1024).toFixed(1)} KB
              </span>
            </div>

            <div className="flex items-center justify-between p-2 rounded bg-surface-container-low">
              <span className="text-on-surface-variant">At-Rules / Queries:</span>
              <span className="font-code-sm text-code-sm font-semibold text-primary">
                {meta.total_at_rules} rules
              </span>
            </div>

            <div className="flex items-center justify-between p-2 rounded bg-surface-container-low">
              <span className="text-on-surface-variant">Comments Parsed:</span>
              <span className="font-code-sm text-code-sm font-semibold text-on-surface">
                {meta.total_comments} blocks
              </span>
            </div>

            <div className="flex items-center justify-between p-2 rounded bg-surface-container-low">
              <span className="text-on-surface-variant">Parser Engine:</span>
              <span className="font-code-sm text-code-sm font-semibold text-primary">
                tinycss2 W3C Spec
              </span>
            </div>
          </div>

          <button
            onClick={onGoToSelectors}
            className="w-full py-2 px-space-md rounded-lg bg-surface-container-high hover:bg-surface-container text-on-surface font-label-sm text-label-sm font-medium transition-colors flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">account_tree</span>
            <span>View All {meta.total_rules} Rule Blocks</span>
          </button>
        </div>
      </div>
    </div>
  );
};
