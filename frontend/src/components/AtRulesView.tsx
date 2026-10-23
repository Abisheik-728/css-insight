import React from 'react';
import type { AtRule } from '../types';

interface AtRulesViewProps {
  atRules: AtRule[];
}

export const AtRulesView: React.FC<AtRulesViewProps> = ({ atRules }) => {
  const getAtRuleIcon = (keyword: string) => {
    switch (keyword) {
      case 'media':
        return 'devices';
      case 'keyframes':
      case '-webkit-keyframes':
        return 'animation';
      case 'supports':
        return 'verified';
      case 'font-face':
        return 'font_download';
      default:
        return 'data_object';
    }
  };

  return (
    <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm border border-outline-variant/30 flex flex-col gap-space-lg animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md pb-space-xs border-b border-outline-variant/20">
        <div>
          <div className="flex items-center gap-space-xs">
            <span className="material-symbols-outlined text-primary text-[22px]">data_object</span>
            <h2 className="font-headline-lg text-headline-lg text-on-surface">Media Queries & At-Rules Registry</h2>
            <span className="font-code-sm text-code-sm px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
              {atRules.length} at-rules
            </span>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
            Introspection of conditional CSS blocks, media query queries, keyframe animations, and custom font configurations.
          </p>
        </div>
      </div>

      {atRules.length === 0 ? (
        <div className="py-12 text-center text-on-surface-variant">
          <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant mx-auto mb-2">
            <span className="material-symbols-outlined text-[24px]">filter_none</span>
          </div>
          <p className="font-headline-sm text-headline-sm text-on-surface mb-1">No At-Rules Detected</p>
          <p className="font-body-sm text-body-sm">The current stylesheet does not define @media queries or at-rules.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
          {atRules.map((rule, idx) => (
            <div
              key={idx}
              className="p-space-md rounded-xl border border-outline-variant/30 bg-surface-container-low hover:bg-surface-container transition-colors flex flex-col justify-between gap-space-sm shadow-xs"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-surface-container-high text-primary flex items-center justify-center">
                      <span className="material-symbols-outlined text-[18px]">
                        {getAtRuleIcon(rule.at_keyword)}
                      </span>
                    </div>
                    <span className="font-code-sm text-code-sm font-bold text-primary">
                      @{rule.at_keyword}
                    </span>
                  </div>
                  <span className="font-code-sm text-code-sm text-on-surface-variant">
                    {rule.line ? `Line ${rule.line}` : '—'}
                  </span>
                </div>

                {rule.prelude && (
                  <p
                    className="font-code-sm text-code-sm text-on-surface bg-surface-container-lowest px-2.5 py-1.5 rounded-lg border border-outline-variant/30 mb-2 truncate"
                    title={rule.prelude}
                  >
                    {rule.prelude}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-4 font-body-sm text-body-sm text-on-surface-variant pt-2 border-t border-outline-variant/20">
                {rule.rules_count > 0 && (
                  <span>
                    Nested Rules: <strong className="text-on-surface font-code-sm">{rule.rules_count}</strong>
                  </span>
                )}
                {rule.declarations_count > 0 && (
                  <span>
                    Direct Declarations: <strong className="text-on-surface font-code-sm">{rule.declarations_count}</strong>
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
