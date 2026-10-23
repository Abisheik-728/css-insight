import React from 'react';
import type { Metadata } from '../types';
import { FileCode, Target, Layers, Palette, AlertCircle, Clock, Info } from 'lucide-react';

interface SummaryCardsProps {
  metadata: Metadata;
  detectedColors: string[];
  warningsCount: number;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  metadata,
  detectedColors,
  warningsCount,
}) => {
  const cards = [
    {
      title: 'Style Rules',
      value: metadata.total_rules,
      icon: FileCode,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10',
      borderColor: 'border-cyan-500/20',
      description: 'Total qualified CSS blocks mapped to one or more selectors.',
    },
    {
      title: 'Individual Selectors',
      value: metadata.total_selectors,
      icon: Target,
      color: 'text-sky-400',
      bgColor: 'bg-sky-500/10',
      borderColor: 'border-sky-500/20',
      description: 'Discrete targets extracted from comma-separated selector lists.',
    },
    {
      title: 'Declarations',
      value: metadata.total_declarations,
      icon: Layers,
      color: 'text-violet-400',
      bgColor: 'bg-violet-500/10',
      borderColor: 'border-violet-500/20',
      description: 'Individual property-value pairs declared inside rule blocks.',
    },
    {
      title: 'Unique Properties',
      value: metadata.unique_properties,
      icon: Info,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20',
      description: 'Distinct CSS property names utilized across the stylesheet.',
    },
    {
      title: 'Detectable Colors',
      value: metadata.unique_colors,
      icon: Palette,
      color: 'text-pink-400',
      bgColor: 'bg-pink-500/10',
      borderColor: 'border-pink-500/20',
      description: 'Unique hex, rgb(), hsl(), and standard named color codes.',
    },
    {
      title: 'Diagnostics & Warnings',
      value: warningsCount,
      icon: AlertCircle,
      color: warningsCount > 0 ? 'text-amber-400' : 'text-emerald-400',
      bgColor: warningsCount > 0 ? 'bg-amber-500/10' : 'bg-emerald-500/10',
      borderColor: warningsCount > 0 ? 'border-amber-500/20' : 'border-emerald-500/20',
      description: 'Duplicate declarations, vendor fallback notes, and syntax errors.',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Metric telemetry header */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-1">
        <div>
          <h3 className="text-base font-semibold text-white">Stylesheet Metrics Overview</h3>
          <p className="text-xs text-slate-400">
            Real AST calculations generated directly from <span className="font-mono text-cyan-300">{metadata.filename}</span>
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400 bg-white/[0.03] px-3 py-1.5 rounded-lg border border-white/[0.06]">
          <Clock className="h-3.5 w-3.5 text-cyan-400" />
          <span>AST Parse Time:</span>
          <span className="text-white font-semibold">{metadata.parse_time_ms} ms</span>
        </div>
      </div>

      {/* Grid of cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="group relative rounded-xl border border-white/[0.08] bg-[#0c1222]/80 p-4 transition-all duration-200 hover:border-white/[0.18] hover:bg-[#0c1222]"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-slate-400 truncate">{card.title}</span>
                <div className={`h-7 w-7 rounded-md ${card.bgColor} ${card.borderColor} border flex items-center justify-center shrink-0`}>
                  <Icon className={`h-4 w-4 ${card.color}`} />
                </div>
              </div>

              <div className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-1.5 font-mono">
                {card.value.toLocaleString()}
              </div>

              <p className="text-[11px] text-slate-400 line-clamp-2 leading-tight">
                {card.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Palette Preview if colors are detected */}
      {detectedColors.length > 0 && (
        <div className="rounded-xl border border-white/[0.08] bg-[#0c1222]/80 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Palette className="h-4 w-4 text-pink-400" />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Extracted Color Palette ({detectedColors.length})
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {detectedColors.map((color, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-white/[0.03] border border-white/[0.08] text-xs font-mono text-slate-300 hover:border-white/[0.2] transition-colors"
              >
                <span
                  className="h-3.5 w-3.5 rounded-full border border-white/20 shadow-sm shrink-0"
                  style={{ backgroundColor: color }}
                />
                <span>{color}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
