import React from 'react';
import type { AnalysisResult } from '../types';

export type TabId =
  | 'overview'
  | 'analyze'
  | 'selectors'
  | 'properties'
  | 'at_rules'
  | 'diagnostics'
  | 'json'
  | 'docs';

interface HeaderProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  analysisResult: AnalysisResult | null;
  apiHealth: { online: boolean; latency: number };
  onTrySample: () => void;
  onExportJson: () => void;
  isLoading: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  analysisResult,
  apiHealth,
  onTrySample,
  onExportJson,
  isLoading,
}) => {
  const tabs: { id: TabId; label: string; icon: string; badge?: string | number; badgeColor?: string }[] = [
    { id: 'overview', label: 'Overview', icon: 'dashboard' },
    { id: 'analyze', label: 'Analyze CSS', icon: 'upload_file' },
    {
      id: 'selectors',
      label: 'Selector Explorer',
      icon: 'account_tree',
      badge: analysisResult ? analysisResult.metadata.total_selectors : undefined,
    },
    {
      id: 'properties',
      label: 'Properties',
      icon: 'bar_chart',
      badge: analysisResult ? analysisResult.metadata.unique_properties : undefined,
    },
    {
      id: 'at_rules',
      label: 'At-Rules',
      icon: 'data_object',
      badge: analysisResult && analysisResult.at_rules.length > 0 ? `${analysisResult.at_rules.length}` : undefined,
    },
    {
      id: 'diagnostics',
      label: 'Diagnostics',
      icon: 'warning',
      badge: analysisResult && analysisResult.warnings.length > 0 ? `${analysisResult.warnings.length}` : undefined,
      badgeColor: analysisResult && analysisResult.warnings.length > 0 ? 'bg-error text-on-error' : undefined,
    },
    { id: 'json', label: 'Structured JSON', icon: 'code' },
    { id: 'docs', label: 'Documentation', icon: 'menu_book' },
  ];

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <header className="sticky top-0 z-40 bg-surface/95 backdrop-blur-md border-b border-outline-variant/30 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      {/* Top Brand & Status Row */}
      <div className="max-w-7xl mx-auto px-space-lg h-16 flex items-center justify-between gap-space-md">
        {/* Logo and Breadcrumb */}
        <div className="flex items-center gap-space-md min-w-0">
          <div
            onClick={() => onTabChange('overview')}
            className="flex items-center gap-space-sm cursor-pointer select-none shrink-0"
          >
            <div className="h-9 w-9 rounded-lg bg-primary-container flex items-center justify-center text-on-primary shadow-sm">
              <span className="material-symbols-outlined text-[22px]">css</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-headline-sm text-headline-sm text-on-surface tracking-tight font-bold">
                  CSS INSIGHT
                </span>
                <span className="font-code-sm text-code-sm px-1.5 py-0.2 rounded bg-surface-container text-primary font-medium">
                  v1.2
                </span>
              </div>
              <span className="font-code-sm text-code-sm text-on-surface-variant hidden sm:block">
                Intelligent AST Parser
              </span>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-space-xs font-label-md text-label-md text-on-surface-variant truncate">
            <span className="text-outline">/</span>
            <span className="text-on-surface font-medium">AST Engine</span>
            <span className="text-outline">/</span>
            {analysisResult ? (
              <span className="px-space-xs py-0.5 rounded bg-surface-container-high text-on-surface font-code-sm text-code-sm truncate max-w-xs">
                {analysisResult.metadata.filename} · {formatFileSize(analysisResult.metadata.file_size_bytes)}
              </span>
            ) : (
              <span className="font-code-sm text-code-sm text-on-surface-variant">Staging Gateway</span>
            )}
            {analysisResult && (
              <>
                <span className="text-outline">/</span>
                <span className="font-code-sm text-code-sm text-on-surface-variant">
                  {analysisResult.metadata.parse_time_ms}ms
                </span>
              </>
            )}
          </div>
        </div>

        {/* Right Actions & Health Pill */}
        <div className="flex items-center gap-space-xs sm:gap-space-sm shrink-0">
          {/* Live API Health Pill */}
          <div className="flex items-center gap-space-xs px-space-sm py-1 rounded-lg bg-surface-container-low border border-outline-variant/30 text-on-surface font-code-sm text-code-sm">
            <span className="relative flex h-2 w-2">
              {apiHealth.online ? (
                <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </>
              ) : (
                <span className="relative inline-flex rounded-full h-2 w-2 bg-error"></span>
              )}
            </span>
            <span className="hidden sm:inline font-medium">
              {apiHealth.online ? `API Connected (${apiHealth.latency}ms)` : 'API Offline'}
            </span>
            <span className="sm:hidden font-medium">{apiHealth.online ? 'Online' : 'Offline'}</span>
          </div>

          <button
            onClick={onTrySample}
            disabled={isLoading}
            className="px-space-sm py-1.5 rounded-lg bg-surface-container text-on-surface hover:bg-surface-container-high transition-colors font-label-sm text-label-sm font-medium disabled:opacity-50"
            type="button"
          >
            {isLoading ? 'Parsing...' : 'Try Sample CSS'}
          </button>

          <button
            onClick={onExportJson}
            disabled={!analysisResult}
            className="hidden md:flex px-space-sm py-1.5 rounded-lg bg-surface-container text-on-surface hover:bg-surface-container-high transition-colors items-center gap-1 font-label-sm text-label-sm font-medium disabled:opacity-40"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">download</span>
            <span>Export JSON</span>
          </button>

          <button
            onClick={() => onTabChange('docs')}
            className="px-space-sm py-1.5 rounded-lg bg-surface-container text-on-surface hover:bg-surface-container-high transition-colors font-label-sm text-label-sm font-medium"
            type="button"
          >
            Docs
          </button>

          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary shadow-sm">
            <span className="material-symbols-outlined text-[18px]">terminal</span>
          </div>
        </div>
      </div>

      {/* Horizontal Tabs Row (Requirement 4 & 5) */}
      <div className="bg-surface-container-low border-t border-outline-variant/30 px-space-lg">
        <div className="max-w-7xl mx-auto flex items-center gap-1 overflow-x-auto py-1.5 scrollbar-none">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-space-xs px-3 py-1.5 rounded-lg whitespace-nowrap transition-all font-label-md text-label-md select-none ${
                  isActive
                    ? 'bg-primary-container text-on-primary font-semibold shadow-sm'
                    : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[17px]">{tab.icon}</span>
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span
                    className={`font-code-sm text-code-sm px-1.5 py-0.2 rounded-full ${
                      isActive
                        ? 'bg-white/20 text-on-primary font-bold'
                        : tab.badgeColor || 'bg-surface-container-high text-primary font-medium'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
