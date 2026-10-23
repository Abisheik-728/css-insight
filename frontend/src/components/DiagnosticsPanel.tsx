import React from 'react';
import type { Warning } from '../types';
import { AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';

interface DiagnosticsPanelProps {
  warnings: Warning[];
}

export const DiagnosticsPanel: React.FC<DiagnosticsPanelProps> = ({ warnings }) => {
  const duplicates = warnings.filter(w => w.type === 'duplicate_declaration');
  const parseErrors = warnings.filter(w => w.type === 'parse_error' || w.type === 'fatal_parse_error');
  const otherWarnings = warnings.filter(w => w.type !== 'duplicate_declaration' && w.type !== 'parse_error' && w.type !== 'fatal_parse_error');

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#0c1222]/90 shadow-xl overflow-hidden">
      <div className="p-4 sm:p-6 border-b border-white/[0.06] bg-white/[0.01]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className={`h-5 w-5 ${warnings.length > 0 ? 'text-amber-400' : 'text-emerald-400'}`} />
            <h3 className="text-lg font-bold text-white">Diagnostics & Telemetry Warnings</h3>
          </div>
          <span className={`text-xs px-2.5 py-0.5 rounded-full font-mono ${
            warnings.length > 0
              ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
              : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
          }`}>
            {warnings.length} {warnings.length === 1 ? 'Notice' : 'Notices'}
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Proactive AST detection for duplicate declarations, vendor prefix fallbacks, and recovery warnings.
        </p>
      </div>

      <div className="p-4 sm:p-6">
        {warnings.length === 0 ? (
          <div className="py-8 flex flex-col items-center justify-center text-center">
            <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-3">
              <CheckCircle className="h-6 w-6 text-emerald-400" />
            </div>
            <p className="text-sm font-semibold text-slate-200">Zero Syntax or Duplication Anomalies</p>
            <p className="text-xs text-slate-500 mt-1 max-w-md">
              The AST parser parsed this stylesheet cleanly with no duplicate property overrides or syntax recovery errors.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {duplicates.length > 0 && (
              <div>
                <span className="text-xs font-semibold uppercase text-amber-400 tracking-wider mb-2 block">
                  Duplicate Declarations ({duplicates.length})
                </span>
                <div className="space-y-2">
                  {duplicates.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl border border-amber-500/20 bg-amber-500/[0.04] text-xs font-mono text-slate-200 flex items-start gap-2.5"
                    >
                      <Info className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-amber-200/90 leading-relaxed">{item.message}</p>
                        {item.line && (
                          <span className="text-[10px] text-amber-400/70 mt-1 block">
                            Triggered at line {item.line}{item.column ? `:${item.column}` : ''}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {parseErrors.length > 0 && (
              <div className="mt-4">
                <span className="text-xs font-semibold uppercase text-rose-400 tracking-wider mb-2 block">
                  Syntax Errors & AST Recoveries ({parseErrors.length})
                </span>
                <div className="space-y-2">
                  {parseErrors.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl border border-rose-500/20 bg-rose-500/[0.04] text-xs font-mono text-slate-200 flex items-start gap-2.5"
                    >
                      <XCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-rose-200/90 leading-relaxed">{item.message}</p>
                        {item.line && (
                          <span className="text-[10px] text-rose-400/70 mt-1 block">
                            Syntax error at line {item.line}{item.column ? `:${item.column}` : ''}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {otherWarnings.length > 0 && (
              <div className="mt-4">
                <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider mb-2 block">
                  General AST Warnings ({otherWarnings.length})
                </span>
                <div className="space-y-2">
                  {otherWarnings.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl border border-white/[0.06] bg-white/[0.02] text-xs font-mono text-slate-300 flex items-start gap-2.5"
                    >
                      <Info className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="leading-relaxed">{item.message}</p>
                        {item.line && (
                          <span className="text-[10px] text-slate-500 mt-1 block">
                            Line {item.line}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
