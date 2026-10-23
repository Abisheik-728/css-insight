import { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { UploadPanel } from './components/UploadPanel';
import { SummaryCards } from './components/SummaryCards';
import { SelectorExplorer } from './components/SelectorExplorer';
import { PropertiesExplorer } from './components/PropertiesExplorer';
import { AtRulesBreakdown } from './components/AtRulesBreakdown';
import { DiagnosticsPanel } from './components/DiagnosticsPanel';
import { JsonViewer } from './components/JsonViewer';
import { DocumentationModal } from './components/DocumentationModal';
import type { AnalysisResult } from './types';
import { Tag, SlidersHorizontal, Layers, AlertTriangle, Code2 } from 'lucide-react';

const API_BASE_URL = 'http://localhost:8000';

const EDGE_CASES_CSS = `/* ==========================================================================
   CSS INSIGHT — Edge Cases & Stress Test Stylesheet
   Demonstrates duplicate declarations, multi-selectors, fallback values,
   functions (calc, rgb, hsl, clamp), !important flags, keyframes & at-rules.
   ========================================================================== */

/* Multi-selector with pseudo-classes & attributes */
input[type="text"], input[type="password"], textarea:focus, .form-input-active {
  outline: none;
  border-color: #3b82f6 !important;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.35);
}

/* Duplicate declarations (intentional legacy CSS fallbacks) */
.compatibility-box {
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  color: black;
  color: #1e293b;
  width: 100%;
  width: calc(100vw - 40px);
}

/* Complex math functions & modern CSS tokens */
.fluid-typography {
  font-size: clamp(1rem, 2.5vw, 2.5rem);
  line-height: calc(1.2em + 0.5vw);
  background: hsl(210, 50%, 15%);
  color: rgb(241, 245, 249);
}

/* Keyframes at-rule */
@keyframes shimmerGlow {
  0% {
    background-position: -200% 0;
    opacity: 0.4;
  }
  50% {
    opacity: 0.9;
  }
  100% {
    background-position: 200% 0;
    opacity: 0.4;
  }
}

/* Nested conditional at-rules */
@supports (backdrop-filter: blur(10px)) {
  .glass-panel {
    backdrop-filter: blur(12px);
    background-color: rgba(15, 23, 42, 0.75);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
}

@media (min-width: 1280px) and (orientation: landscape) {
  .hero-container {
    max-width: 1200px;
    margin: 0 auto;
  }
}
`;

export function App() {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDocsOpen, setIsDocsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'selectors' | 'properties' | 'at_rules' | 'diagnostics' | 'json'>('selectors');

  const scrollToUpload = () => {
    const el = document.getElementById('upload-panel');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleAnalyzeFile = async (file: File) => {
    setIsLoading(true);
    setErrorMessage(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_BASE_URL}/api/analyze`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const detail = errorData?.detail || `Server returned ${response.status}: ${response.statusText}`;
        setErrorMessage(detail);
        setIsLoading(false);
        return;
      }

      const result: AnalysisResult = await response.json();
      setAnalysisResult(result);
    } catch (err: any) {
      setErrorMessage(
        err.message || 'Failed to connect to CSS Insight backend. Please ensure the Python server is running on port 8000.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadSample = async (type: 'normal' | 'edge_cases') => {
    if (type === 'normal') {
      try {
        setIsLoading(true);
        setErrorMessage(null);
        const res = await fetch(`${API_BASE_URL}/api/sample`);
        if (!res.ok) throw new Error('Failed to fetch sample from backend');
        const data = await res.json();
        const file = new File([data.content], data.filename || 'showcase_sample.css', { type: 'text/css' });
        await handleAnalyzeFile(file);
      } catch (err: any) {
        setErrorMessage(err.message || 'Error loading sample CSS');
        setIsLoading(false);
      }
    } else {
      const file = new File([EDGE_CASES_CSS], 'edge_cases_sample.css', { type: 'text/css' });
      await handleAnalyzeFile(file);
    }
  };

  const handleClear = () => {
    setAnalysisResult(null);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-canvas text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      <Navbar
        onOpenDocs={() => setIsDocsOpen(true)}
        onScrollToUpload={scrollToUpload}
      />

      <main className="flex-1 pb-20">
        <Hero
          onAnalyzeClick={scrollToUpload}
          onTrySample={() => handleLoadSample('normal')}
          isLoading={isLoading}
        />

        <UploadPanel
          onAnalyze={handleAnalyzeFile}
          onLoadSample={handleLoadSample}
          onClear={handleClear}
          isLoading={isLoading}
          currentFilename={analysisResult?.metadata.filename}
          currentFileSize={analysisResult?.metadata.file_size_bytes}
          errorMessage={errorMessage}
        />

        {/* Dashboard Area */}
        {analysisResult && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 space-y-8 animate-in fade-in duration-300">
            {/* Top Summary Cards */}
            <SummaryCards
              metadata={analysisResult.metadata}
              detectedColors={analysisResult.detected_colors}
              warningsCount={analysisResult.warnings.length}
            />

            {/* Navigation Tabs for Deep Inspection */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/[0.03] border border-white/[0.08] overflow-x-auto">
              <button
                onClick={() => setActiveTab('selectors')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  activeTab === 'selectors'
                    ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]'
                }`}
              >
                <Tag className="h-3.5 w-3.5" />
                Selector Explorer ({analysisResult.rules.length})
              </button>

              <button
                onClick={() => setActiveTab('properties')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  activeTab === 'properties'
                    ? 'bg-violet-500/10 text-violet-300 border border-violet-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]'
                }`}
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                Properties Telemetry ({analysisResult.metadata.total_declarations})
              </button>

              <button
                onClick={() => setActiveTab('at_rules')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  activeTab === 'at_rules'
                    ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]'
                }`}
              >
                <Layers className="h-3.5 w-3.5" />
                Media & At-Rules ({analysisResult.at_rules.length})
              </button>

              <button
                onClick={() => setActiveTab('diagnostics')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  activeTab === 'diagnostics'
                    ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]'
                }`}
              >
                <AlertTriangle className="h-3.5 w-3.5" />
                Diagnostics & Warnings ({analysisResult.warnings.length})
              </button>

              <button
                onClick={() => setActiveTab('json')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  activeTab === 'json'
                    ? 'bg-white/[0.1] text-white border border-white/[0.2] shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]'
                }`}
              >
                <Code2 className="h-3.5 w-3.5" />
                Structured AST JSON
              </button>
            </div>

            {/* Active Tab View */}
            <div>
              {activeTab === 'selectors' && (
                <SelectorExplorer rules={analysisResult.rules} />
              )}
              {activeTab === 'properties' && (
                <PropertiesExplorer
                  rules={analysisResult.rules}
                  topProperties={analysisResult.top_properties}
                />
              )}
              {activeTab === 'at_rules' && (
                <AtRulesBreakdown atRules={analysisResult.at_rules} />
              )}
              {activeTab === 'diagnostics' && (
                <DiagnosticsPanel warnings={analysisResult.warnings} />
              )}
              {activeTab === 'json' && (
                <JsonViewer data={analysisResult} />
              )}
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-white/[0.08] bg-[#090d16] py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">CSS INSIGHT</span>
            <span>•</span>
            <span>Skill First Labs Internship Shortlisting — Milestone 1: CSS Parser</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Powered by <span className="font-mono text-cyan-400">tinycss2</span> & <span className="font-mono text-violet-400">FastAPI</span></span>
          </div>
        </div>
      </footer>

      {/* Documentation Modal */}
      <DocumentationModal
        isOpen={isDocsOpen}
        onClose={() => setIsDocsOpen(false)}
      />
    </div>
  );
}

export default App;
