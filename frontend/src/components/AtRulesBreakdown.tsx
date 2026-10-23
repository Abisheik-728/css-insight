import React from 'react';
import type { AtRule } from '../types';
import { Layers, Monitor, PlayCircle, ShieldCheck, Type, Code } from 'lucide-react';

interface AtRulesBreakdownProps {
  atRules: AtRule[];
}

export const AtRulesBreakdown: React.FC<AtRulesBreakdownProps> = ({ atRules }) => {
  const getAtRuleIcon = (keyword: string) => {
    switch (keyword) {
      case 'media':
        return <Monitor className="h-4 w-4 text-cyan-400" />;
      case 'keyframes':
      case '-webkit-keyframes':
        return <PlayCircle className="h-4 w-4 text-violet-400" />;
      case 'supports':
        return <ShieldCheck className="h-4 w-4 text-emerald-400" />;
      case 'font-face':
        return <Type className="h-4 w-4 text-amber-400" />;
      default:
        return <Code className="h-4 w-4 text-slate-400" />;
    }
  };

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#0c1222]/90 shadow-xl overflow-hidden">
      <div className="p-4 sm:p-6 border-b border-white/[0.06] bg-white/[0.01]">
        <div className="flex items-center gap-2">
          <Layers className="h-5 w-5 text-cyan-400" />
          <h3 className="text-lg font-bold text-white">
            Media Queries & At-Rules Registry
          </h3>
          <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-mono">
            {atRules.length} at-rules
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Catalog of conditional contexts, media queries, keyframe animations, and custom font definitions.
        </p>
      </div>

      <div className="p-4 sm:p-6">
        {atRules.length === 0 ? (
          <div className="py-8 text-center text-slate-500">
            <p className="text-sm">No at-rules or @media queries detected in this stylesheet.</p>
            <p className="text-xs text-slate-600 mt-1">Styles are strictly top-level global rules.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {atRules.map((rule, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-md bg-white/[0.04]">
                      {getAtRuleIcon(rule.at_keyword)}
                    </div>
                    <span className="font-mono font-bold text-xs text-purple-300">
                      @{rule.at_keyword}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500">
                    {rule.line ? `Line ${rule.line}` : '—'}
                  </span>
                </div>

                {rule.prelude && (
                  <p className="text-xs font-mono text-cyan-200/90 bg-[#090d16] px-2.5 py-1.5 rounded-md border border-white/[0.04] mb-2 truncate" title={rule.prelude}>
                    {rule.prelude}
                  </p>
                )}

                <div className="flex items-center gap-4 text-[11px] text-slate-400">
                  {rule.rules_count > 0 && (
                    <span>
                      Nested Rules: <strong className="text-slate-200 font-mono">{rule.rules_count}</strong>
                    </span>
                  )}
                  {rule.declarations_count > 0 && (
                    <span>
                      Direct Declarations: <strong className="text-slate-200 font-mono">{rule.declarations_count}</strong>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
