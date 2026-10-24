import React from 'react';
import type { Warning } from '../types';
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  AlertCircle,
} from 'lucide-react';

interface DiagnosticsViewProps {
  warnings: Warning[];
}

export const DiagnosticsView: React.FC<DiagnosticsViewProps> = ({ warnings }) => {
  const duplicates = warnings.filter(w => w.type === 'duplicate_declaration');
  const parseErrors = warnings.filter(w => w.type === 'parse_error' || w.type === 'fatal_parse_error');
  const otherWarnings = warnings.filter(w => w.type !== 'duplicate_declaration' && w.type !== 'parse_error' && w.type !== 'fatal_parse_error');

  return (
    <div className="bg-white rounded-xl p-5 sm:p-6 shadow-2xs border border-slate-200 flex flex-col gap-5 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Diagnostics & Telemetry Warnings</h2>
            <span className={`font-mono text-xs px-2.5 py-0.5 rounded-full font-semibold border ${
              warnings.length > 0
                ? 'bg-amber-50 text-amber-800 border-amber-200'
                : 'bg-emerald-50 text-emerald-800 border-emerald-200'
            }`}>
              {warnings.length} {warnings.length === 1 ? 'Notice' : 'Notices'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            AST identification of duplicate declaration overrides, vendor prefix fallbacks, and CSS syntax recoveries.
          </p>
        </div>
      </div>

      {warnings.length === 0 ? (
        <div className="py-12 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-3 shadow-2xs">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm sm:text-base mb-1">
            Zero Syntax or Duplication Anomalies
          </h3>
          <p className="text-xs text-slate-500 max-w-md">
            The AST engine parsed this stylesheet cleanly with no duplicate property overrides or syntax recovery errors.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {duplicates.length > 0 && (
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase text-slate-700 tracking-wider">
                Duplicate Declarations ({duplicates.length})
              </span>
              <div className="space-y-2">
                {duplicates.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-indigo-100 bg-indigo-50/40 text-xs sm:text-sm text-slate-800 flex items-start gap-3 shadow-2xs"
                  >
                    <Info className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-xs leading-relaxed text-slate-900">{item.message}</p>
                      {item.line && (
                        <span className="font-mono text-[11px] text-slate-500 mt-1 block">
                          Triggered at Line {item.line}{item.column ? `:${item.column}` : ''}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {parseErrors.length > 0 && (
            <div className="flex flex-col gap-2 mt-2">
              <span className="text-xs font-semibold uppercase text-rose-700 tracking-wider">
                Syntax Errors & AST Recoveries ({parseErrors.length})
              </span>
              <div className="space-y-2">
                {parseErrors.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/60 text-xs sm:text-sm text-slate-800 flex items-start gap-3 shadow-2xs"
                  >
                    <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-xs leading-relaxed text-rose-950 font-medium">{item.message}</p>
                      {item.message.includes('EOF reached before {}') && (
                        <p className="text-[11px] text-amber-800 mt-1 bg-amber-50 border border-amber-200 rounded p-1.5 font-sans">
                          <strong>Note:</strong> tinycss2 reached end-of-file without encountering a style rule block <code className="font-mono text-[10px] bg-amber-100 px-1 py-0.5 rounded">{`{}`}</code>. This occurs when uploading plain text or incomplete CSS.
                        </p>
                      )}
                      {item.line && (
                        <span className="font-mono text-[11px] text-rose-700 mt-1 block">
                          Syntax recovery at Line {item.line}{item.column ? `:${item.column}` : ''}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {otherWarnings.length > 0 && (
            <div className="flex flex-col gap-2 mt-2">
              <span className="text-xs font-semibold uppercase text-slate-600 tracking-wider">
                General Notices ({otherWarnings.length})
              </span>
              <div className="space-y-2">
                {otherWarnings.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm text-slate-800 flex items-start gap-3"
                  >
                    <Info className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-xs text-slate-800">{item.message}</p>
                      {item.line && (
                        <span className="font-mono text-[11px] text-slate-400 mt-1 block">
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
  );
};
