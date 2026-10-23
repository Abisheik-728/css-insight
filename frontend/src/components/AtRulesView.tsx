import React from 'react';
import type { AtRule } from '../types';
import {
  Layers,
  Smartphone,
  Film,
  CheckCircle2,
  Type,
  FileQuestion,
} from 'lucide-react';

interface AtRulesViewProps {
  atRules: AtRule[];
}

export const AtRulesView: React.FC<AtRulesViewProps> = ({ atRules }) => {
  const renderAtRuleIcon = (keyword: string) => {
    switch (keyword) {
      case 'media':
        return <Smartphone className="h-4 w-4 text-indigo-600" />;
      case 'keyframes':
      case '-webkit-keyframes':
        return <Film className="h-4 w-4 text-indigo-600" />;
      case 'supports':
        return <CheckCircle2 className="h-4 w-4 text-indigo-600" />;
      case 'font-face':
        return <Type className="h-4 w-4 text-indigo-600" />;
      default:
        return <Layers className="h-4 w-4 text-indigo-600" />;
    }
  };

  return (
    <div className="bg-white rounded-xl p-5 sm:p-6 shadow-2xs border border-slate-200 flex flex-col gap-5 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-indigo-600" />
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Media Queries & At-Rules Registry</h2>
            <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-semibold border border-indigo-100">
              {atRules.length} at-rules
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Introspection of conditional CSS blocks, media queries, keyframe animations, and custom font configurations.
          </p>
        </div>
      </div>

      {atRules.length === 0 ? (
        <div className="py-12 text-center text-slate-500">
          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-3">
            <FileQuestion className="h-6 w-6" />
          </div>
          <p className="font-bold text-slate-800 text-sm mb-1">No At-Rules Detected</p>
          <p className="text-xs text-slate-400">The current stylesheet does not define @media queries or at-rules.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {atRules.map((rule, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 hover:border-slate-300 transition-colors flex flex-col justify-between gap-3 shadow-2xs"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                      {renderAtRuleIcon(rule.at_keyword)}
                    </div>
                    <span className="font-mono text-xs font-bold text-indigo-700">
                      @{rule.at_keyword}
                    </span>
                  </div>
                  <span className="font-mono text-xs text-slate-400">
                    {rule.line ? `Line ${rule.line}` : '—'}
                  </span>
                </div>

                {rule.prelude && (
                  <p
                    className="font-mono text-xs text-slate-800 bg-white px-3 py-2 rounded-lg border border-slate-200 mb-2 truncate shadow-2xs"
                    title={rule.prelude}
                  >
                    {rule.prelude}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-500 pt-2 border-t border-slate-200">
                {rule.rules_count > 0 && (
                  <span>
                    Nested Rules: <strong className="text-slate-900 font-mono font-semibold">{rule.rules_count}</strong>
                  </span>
                )}
                {rule.declarations_count > 0 && (
                  <span>
                    Direct Declarations: <strong className="text-slate-900 font-mono font-semibold">{rule.declarations_count}</strong>
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
