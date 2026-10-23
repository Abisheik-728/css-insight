import React from 'react';
import type { Warning } from '../types';

interface DiagnosticsViewProps {
  warnings: Warning[];
}

export const DiagnosticsView: React.FC<DiagnosticsViewProps> = ({ warnings }) => {
  const duplicates = warnings.filter(w => w.type === 'duplicate_declaration');
  const parseErrors = warnings.filter(w => w.type === 'parse_error' || w.type === 'fatal_parse_error');
  const otherWarnings = warnings.filter(w => w.type !== 'duplicate_declaration' && w.type !== 'parse_error' && w.type !== 'fatal_parse_error');

  return (
    <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm border border-outline-variant/30 flex flex-col gap-space-lg animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md pb-space-xs border-b border-outline-variant/20">
        <div>
          <div className="flex items-center gap-space-xs">
            <span className="material-symbols-outlined text-primary text-[22px]">warning</span>
            <h2 className="font-headline-lg text-headline-lg text-on-surface">Diagnostics & Telemetry Warnings</h2>
            <span className={`font-code-sm text-code-sm px-2.5 py-0.5 rounded-full font-medium ${
              warnings.length > 0
                ? 'bg-error-container text-on-error-container'
                : 'bg-surface-container text-primary'
            }`}>
              {warnings.length} {warnings.length === 1 ? 'Notice' : 'Notices'}
            </span>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
            AST identification of duplicate declaration overrides, vendor prefix fallbacks, and CSS syntax recoveries.
          </p>
        </div>
      </div>

      {warnings.length === 0 ? (
        <div className="py-12 flex flex-col items-center justify-center text-center">
          <div className="w-14 h-14 rounded-full bg-surface-container flex items-center justify-center text-primary mb-3 shadow-xs">
            <span className="material-symbols-outlined text-[28px]">check_circle</span>
          </div>
          <h3 className="font-headline-sm text-headline-sm text-on-surface mb-1">
            Zero Syntax or Duplication Anomalies
          </h3>
          <p className="font-body-sm text-body-sm text-on-surface-variant max-w-md">
            The AST engine parsed this stylesheet cleanly with no duplicate property overrides or syntax recovery errors.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-space-md">
          {duplicates.length > 0 && (
            <div className="flex flex-col gap-2">
              <span className="font-label-sm text-label-sm font-semibold uppercase text-secondary tracking-wider">
                Duplicate Declarations ({duplicates.length})
              </span>
              <div className="space-y-2">
                {duplicates.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-secondary-container bg-secondary-container/20 text-body-sm text-on-surface flex items-start gap-3 shadow-xs"
                  >
                    <span className="material-symbols-outlined text-secondary text-[20px] shrink-0 mt-0.5">
                      info
                    </span>
                    <div className="flex-1">
                      <p className="font-code-sm text-code-sm leading-relaxed text-on-surface">{item.message}</p>
                      {item.line && (
                        <span className="font-code-sm text-[11px] text-on-surface-variant mt-1 block">
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
              <span className="font-label-sm text-label-sm font-semibold uppercase text-error tracking-wider">
                Syntax Errors & AST Recoveries ({parseErrors.length})
              </span>
              <div className="space-y-2">
                {parseErrors.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-error-container bg-error-container/30 text-body-sm text-on-surface flex items-start gap-3 shadow-xs"
                  >
                    <span className="material-symbols-outlined text-error text-[20px] shrink-0 mt-0.5">
                      error
                    </span>
                    <div className="flex-1">
                      <p className="font-code-sm text-code-sm leading-relaxed text-on-error-container font-medium">{item.message}</p>
                      {item.line && (
                        <span className="font-code-sm text-[11px] text-error mt-1 block">
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
              <span className="font-label-sm text-label-sm font-semibold uppercase text-on-surface-variant tracking-wider">
                General Notices ({otherWarnings.length})
              </span>
              <div className="space-y-2">
                {otherWarnings.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl border border-outline-variant/30 bg-surface-container-low text-body-sm text-on-surface flex items-start gap-3"
                  >
                    <span className="material-symbols-outlined text-on-surface-variant text-[18px] shrink-0 mt-0.5">
                      info
                    </span>
                    <div className="flex-1">
                      <p className="font-code-sm text-code-sm">{item.message}</p>
                      {item.line && (
                        <span className="font-code-sm text-[11px] text-on-surface-variant mt-1 block">
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
