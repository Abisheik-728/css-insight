import React from 'react';
import { ArrowDownCircle, Play, FileCode, CheckCircle2 } from 'lucide-react';

interface HeroProps {
  onAnalyzeClick: () => void;
  onTrySample: () => void;
  isLoading: boolean;
}

export const Hero: React.FC<HeroProps> = ({ onAnalyzeClick, onTrySample, isLoading }) => {
  return (
    <section className="relative pt-12 pb-16 overflow-hidden border-b border-white/[0.06]">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-tr from-cyan-500/10 via-violet-600/10 to-transparent blur-3xl pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-medium mb-6">
            <span className="flex h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
            Milestone 1: CSS Parser Engine & AST Analysis
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
            Understand Your CSS.{' '}
            <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-violet-400 bg-clip-text text-transparent">
              Instantly.
            </span>
          </h1>

          {/* Tagline & Supporting text */}
          <p className="text-lg sm:text-xl text-slate-300 font-medium mb-3">
            Turn raw CSS into meaningful, structured intelligence.
          </p>
          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto mb-8 leading-relaxed">
            Upload a stylesheet to extract selectors, declarations, styling properties, and structured insights in seconds. Powered by tinycss2.
          </p>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={onAnalyzeClick}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white font-medium text-sm shadow-lg shadow-cyan-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <ArrowDownCircle className="h-4 w-4" />
              Analyze CSS
            </button>
            <button
              onClick={onTrySample}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-slate-200 border border-white/[0.1] font-medium text-sm transition-all hover:border-cyan-500/30"
            >
              <Play className="h-4 w-4 text-cyan-400 fill-cyan-400/20" />
              {isLoading ? 'Parsing Sample...' : 'Try Sample CSS'}
            </button>
          </div>

          {/* Trust points */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400" />
              Genuine tinycss2 parser
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400" />
              Zero regex heuristics
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-violet-400" />
              Accurate AST telemetry
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-violet-400" />
              Instant JSON export
            </span>
          </div>
        </div>

        {/* Visual Preview Side-by-Side: Raw CSS vs Structured JSON */}
        <div className="mt-14 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left: Raw CSS Code Box */}
          <div className="rounded-xl border border-white/[0.08] bg-[#0c1222]/90 shadow-2xl overflow-hidden backdrop-blur-sm">
            <div className="px-4 py-2.5 bg-white/[0.03] border-b border-white/[0.06] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
                <span className="ml-2 text-xs font-mono text-slate-400">input.css</span>
              </div>
              <span className="text-[11px] font-mono text-slate-500">Raw Source</span>
            </div>
            <div className="p-4 text-xs font-mono text-slate-300 leading-relaxed overflow-x-auto">
              <div><span className="text-slate-500">/* Responsive Card */</span></div>
              <div><span className="text-cyan-400">.metric-card</span>, <span className="text-cyan-400">.insight-tile</span> &#123;</div>
              <div className="pl-4"><span className="text-violet-300">display</span>: <span className="text-emerald-300">flex</span>;</div>
              <div className="pl-4"><span className="text-violet-300">background</span>: <span className="text-amber-200">#0f172a</span>;</div>
              <div className="pl-4"><span className="text-violet-300">width</span>: <span className="text-cyan-300">calc(100% - 24px)</span>;</div>
              <div className="pl-4"><span className="text-violet-300">color</span>: <span className="text-rose-400">#ffffff</span> <span className="text-amber-400 font-semibold">!important</span>;</div>
              <div>&#125;</div>
              <div className="mt-2"><span className="text-purple-400">@media</span> <span className="text-slate-400">(min-width: 768px)</span> &#123;</div>
              <div className="pl-4"><span className="text-cyan-400">.metric-card</span> &#123; <span className="text-violet-300">padding</span>: <span className="text-emerald-300">32px</span>; &#125;</div>
              <div>&#125;</div>
            </div>
          </div>

          {/* Right: Extracted JSON AST Output */}
          <div className="rounded-xl border border-white/[0.08] bg-[#0c1222]/90 shadow-2xl overflow-hidden backdrop-blur-sm">
            <div className="px-4 py-2.5 bg-white/[0.03] border-b border-white/[0.06] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCode className="h-3.5 w-3.5 text-cyan-400" />
                <span className="text-xs font-mono text-slate-400">ast_analysis.json</span>
              </div>
              <span className="text-[11px] font-mono text-cyan-400 font-semibold">Structured Output</span>
            </div>
            <div className="p-4 text-xs font-mono text-slate-300 leading-relaxed overflow-x-auto">
              <div>&#123;</div>
              <div className="pl-4"><span className="text-cyan-400">"metadata"</span>: &#123;</div>
              <div className="pl-8"><span className="text-violet-300">"total_rules"</span>: <span className="text-emerald-300">2</span>,</div>
              <div className="pl-8"><span className="text-violet-300">"total_selectors"</span>: <span className="text-emerald-300">3</span>,</div>
              <div className="pl-8"><span className="text-violet-300">"total_declarations"</span>: <span className="text-emerald-300">5</span>,</div>
              <div className="pl-8"><span className="text-violet-300">"unique_colors"</span>: <span className="text-emerald-300">2</span></div>
              <div className="pl-4">&#125;,</div>
              <div className="pl-4"><span className="text-cyan-400">"rules"</span>: [</div>
              <div className="pl-8">&#123;</div>
              <div className="pl-12"><span className="text-violet-300">"selector"</span>: <span className="text-emerald-200">".metric-card, .insight-tile"</span>,</div>
              <div className="pl-12"><span className="text-violet-300">"selectors"</span>: [<span className="text-emerald-200">".metric-card"</span>, <span className="text-emerald-200">".insight-tile"</span>],</div>
              <div className="pl-12"><span className="text-violet-300">"declarations"</span>: [&#123; <span className="text-violet-300">"property"</span>: <span className="text-emerald-200">"color"</span>, <span className="text-violet-300">"important"</span>: <span className="text-amber-400">true</span> &#125;]</div>
              <div className="pl-8">&#125;</div>
              <div className="pl-4">]</div>
              <div>&#125;</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
