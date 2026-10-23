import React from 'react';
import type { AnalysisResult } from '../types';
import {
  LayoutDashboard,
  UploadCloud,
  FolderTree,
  SlidersHorizontal,
  Layers,
  AlertTriangle,
  Code2,
  BookOpen,
  FileCode,
  Download,
  Play,
} from 'lucide-react';

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
  stagedFileName?: string | null;
  apiHealth: { online: boolean; latency: number };
  onTrySample: () => void;
  onExportJson: () => void;
  isLoading: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  analysisResult,
  stagedFileName,
  apiHealth,
  onTrySample,
  onExportJson,
  isLoading,
}) => {
  const tabs = [
    { id: 'overview' as TabId, label: 'Overview', icon: LayoutDashboard },
    { id: 'analyze' as TabId, label: 'Analyze CSS', icon: UploadCloud },
    {
      id: 'selectors' as TabId,
      label: 'Selector Explorer',
      icon: FolderTree,
      badge: analysisResult ? analysisResult.metadata.total_selectors : undefined,
    },
    {
      id: 'properties' as TabId,
      label: 'Properties',
      icon: SlidersHorizontal,
      badge: analysisResult ? analysisResult.metadata.unique_properties : undefined,
    },
    {
      id: 'at_rules' as TabId,
      label: 'At-Rules',
      icon: Layers,
      badge: analysisResult && analysisResult.at_rules.length > 0 ? analysisResult.at_rules.length : undefined,
    },
    {
      id: 'diagnostics' as TabId,
      label: 'Diagnostics',
      icon: AlertTriangle,
      badge: analysisResult && analysisResult.warnings.length > 0 ? analysisResult.warnings.length : undefined,
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    },
    { id: 'json' as TabId, label: 'Structured JSON', icon: Code2 },
    { id: 'docs' as TabId, label: 'Documentation', icon: BookOpen },
  ];

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      {/* Top Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand & Optional File Badge */}
        <div className="flex items-center gap-3 min-w-0">
          <div
            onClick={() => onTabChange('overview')}
            className="flex items-center gap-2.5 cursor-pointer select-none shrink-0"
          >
            <div className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs">
              <FileCode className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base sm:text-lg text-slate-900 tracking-tight">
                  CSS INSIGHT
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60 font-mono">
                  v1.2
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium leading-none hidden sm:block">
                Intelligent AST Parser
              </p>
            </div>
          </div>

          {/* Show Current Filename ONLY when a file has been selected or analyzed */}
          {(analysisResult || stagedFileName) && (
            <div className="hidden md:flex items-center gap-1.5 pl-3 border-l border-slate-200 min-w-0">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-xs text-slate-700 font-mono truncate max-w-[220px]">
                <FileCode className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                <span className="truncate">{analysisResult ? analysisResult.metadata.filename : stagedFileName}</span>
              </span>
              {analysisResult ? (
                <span className="text-[11px] text-slate-400 font-mono whitespace-nowrap">
                  {formatFileSize(analysisResult.metadata.file_size_bytes)} · {analysisResult.metadata.parse_time_ms}ms
                </span>
              ) : (
                <span className="text-[11px] text-indigo-600 font-mono whitespace-nowrap bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
                  Ready to analyze
                </span>
              )}
            </div>
          )}
        </div>

        {/* Right Actions & Health Badge */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Compact Health Badge */}
          <div
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
              apiHealth.online
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                : 'bg-rose-50 border-rose-200 text-rose-700'
            }`}
            title={`API status: ${apiHealth.online ? 'Online' : 'Offline'}`}
          >
            <span className="relative flex h-2 w-2">
              {apiHealth.online ? (
                <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </>
              ) : (
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              )}
            </span>
            <span className="hidden sm:inline font-mono">
              {apiHealth.online ? `API :8000 (${apiHealth.latency}ms)` : 'API Offline'}
            </span>
            <span className="sm:hidden font-mono">{apiHealth.online ? 'Online' : 'Offline'}</span>
          </div>

          {/* Try Sample CSS Button */}
          <button
            onClick={onTrySample}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/80 transition-colors disabled:opacity-50 shadow-2xs"
            type="button"
          >
            <Play className="h-3.5 w-3.5 fill-indigo-600 text-indigo-600" />
            <span>{isLoading ? 'Parsing...' : 'Try Sample CSS'}</span>
          </button>

          {/* Export JSON Button */}
          <button
            onClick={onExportJson}
            disabled={!analysisResult}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition-colors disabled:opacity-40 shadow-2xs"
            type="button"
          >
            <Download className="h-3.5 w-3.5 text-slate-500" />
            <span>Export JSON</span>
          </button>

          {/* Documentation CTA */}
          <button
            onClick={() => onTabChange('docs')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shadow-2xs ${
              activeTab === 'docs'
                ? 'bg-slate-900 text-white'
                : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
            }`}
            type="button"
          >
            <BookOpen className="h-3.5 w-3.5 text-slate-500" />
            <span className="hidden sm:inline">Docs</span>
          </button>
        </div>
      </div>

      {/* Horizontal Tab Navigation Bar */}
      <div className="bg-slate-50/80 border-t border-slate-200/80 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center gap-1.5 overflow-x-auto py-2 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm whitespace-nowrap transition-all select-none ${
                  isActive
                    ? 'bg-white text-indigo-700 font-semibold shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/80 border border-transparent font-medium'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span
                    className={`font-mono text-[11px] px-1.5 py-0.2 rounded-full border ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-700 border-indigo-200 font-bold'
                        : tab.badgeColor || 'bg-slate-200/70 text-slate-700 border-slate-300/60 font-medium'
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
