import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import type { TabId } from './components/Header';
import { OverviewView } from './components/OverviewView';
import { AnalyzeView } from './components/AnalyzeView';
import { SelectorView } from './components/SelectorView';
import { PropertiesView } from './components/PropertiesView';
import { AtRulesView } from './components/AtRulesView';
import { DiagnosticsView } from './components/DiagnosticsView';
import { JsonView } from './components/JsonView';
import { DocumentationView } from './components/DocumentationView';
import type { AnalysisResult } from './types';

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
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [stagedFile, setStagedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [apiHealth, setApiHealth] = useState<{ online: boolean; latency: number }>({
    online: false,
    latency: 0,
  });

  // Check backend health periodically and measure latency
  useEffect(() => {
    const checkHealth = async () => {
      const startTime = performance.now();
      try {
        const res = await fetch(`${API_BASE_URL}/api/health`);
        const elapsed = Math.round(performance.now() - startTime);
        if (res.ok) {
          setApiHealth({ online: true, latency: Math.max(elapsed, 4) });
        } else {
          setApiHealth({ online: false, latency: 0 });
        }
      } catch {
        setApiHealth({ online: false, latency: 0 });
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  // Analyze file via POST /api/analyze
  const executeAnalysis = async (file: File) => {
    setIsLoading(true);
    setErrorMessage(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`${API_BASE_URL}/api/analyze`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        const detail = errorData?.detail || `Server returned ${res.status}: ${res.statusText}`;
        setErrorMessage(detail);
        setIsLoading(false);
        return;
      }

      const result: AnalysisResult = await res.json();
      setAnalysisResult(result);
      setStagedFile(file);
      setActiveTab('overview');
    } catch (err: any) {
      setErrorMessage(
        err.message || 'Failed to communicate with FastAPI backend. Ensure server is active on :8000.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleStageFile = (file: File) => {
    setStagedFile(file);
    setErrorMessage(null);
  };

  const handleRemoveFile = () => {
    setStagedFile(null);
    setErrorMessage(null);
  };

  const handleLoadSample = async (type: 'standard' | 'edge_cases') => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      let file: File;
      if (type === 'standard') {
        const res = await fetch(`${API_BASE_URL}/api/sample`);
        if (!res.ok) throw new Error('Failed to load sample from backend API');
        const data = await res.json();
        file = new File([data.content], data.filename || 'showcase_sample.css', {
          type: 'text/css',
        });
      } else {
        file = new File([EDGE_CASES_CSS], 'torture_edge_cases.css', {
          type: 'text/css',
        });
      }
      setStagedFile(file);
      await executeAnalysis(file);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error loading sample CSS');
      setIsLoading(false);
    }
  };

  const handleExportJson = () => {
    if (!analysisResult) return;
    const jsonString = JSON.stringify(analysisResult, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${analysisResult.metadata.filename.replace(/\.css$/i, '')}_analysis.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 antialiased flex flex-col selection:bg-indigo-100 selection:text-indigo-800">
      {/* Compact Header with 8 Horizontal Tabs (Tasks 4 & 5) */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        analysisResult={analysisResult}
        stagedFileName={stagedFile?.name}
        apiHealth={apiHealth}
        onTrySample={() => handleLoadSample('standard')}
        onExportJson={handleExportJson}
        isLoading={isLoading}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-space-lg py-space-xl">
        {activeTab === 'overview' && (
          <OverviewView
            data={analysisResult}
            onGoToAnalyze={() => setActiveTab('analyze')}
            onGoToSelectors={() => setActiveTab('selectors')}
            onGoToProperties={() => setActiveTab('properties')}
            onLoadSample={() => handleLoadSample('standard')}
          />
        )}

        {activeTab === 'analyze' && (
          <AnalyzeView
            onAnalyze={executeAnalysis}
            onLoadSample={handleLoadSample}
            stagedFile={stagedFile}
            onStageFile={handleStageFile}
            onRemoveFile={handleRemoveFile}
            isLoading={isLoading}
            errorMessage={errorMessage}
            analysisResult={analysisResult}
            onViewResults={() => setActiveTab('overview')}
            onViewJson={() => setActiveTab('json')}
          />
        )}

        {activeTab === 'selectors' && (
          analysisResult ? (
            <SelectorView rules={analysisResult.rules} />
          ) : (
            <OverviewView
              data={null}
              onGoToAnalyze={() => setActiveTab('analyze')}
              onGoToSelectors={() => setActiveTab('selectors')}
              onGoToProperties={() => setActiveTab('properties')}
              onLoadSample={() => handleLoadSample('standard')}
            />
          )
        )}

        {activeTab === 'properties' && (
          analysisResult ? (
            <PropertiesView
              rules={analysisResult.rules}
              topProperties={analysisResult.top_properties}
            />
          ) : (
            <OverviewView
              data={null}
              onGoToAnalyze={() => setActiveTab('analyze')}
              onGoToSelectors={() => setActiveTab('selectors')}
              onGoToProperties={() => setActiveTab('properties')}
              onLoadSample={() => handleLoadSample('standard')}
            />
          )
        )}

        {activeTab === 'at_rules' && (
          analysisResult ? (
            <AtRulesView atRules={analysisResult.at_rules} />
          ) : (
            <OverviewView
              data={null}
              onGoToAnalyze={() => setActiveTab('analyze')}
              onGoToSelectors={() => setActiveTab('selectors')}
              onGoToProperties={() => setActiveTab('properties')}
              onLoadSample={() => handleLoadSample('standard')}
            />
          )
        )}

        {activeTab === 'diagnostics' && (
          analysisResult ? (
            <DiagnosticsView warnings={analysisResult.warnings} />
          ) : (
            <OverviewView
              data={null}
              onGoToAnalyze={() => setActiveTab('analyze')}
              onGoToSelectors={() => setActiveTab('selectors')}
              onGoToProperties={() => setActiveTab('properties')}
              onLoadSample={() => handleLoadSample('standard')}
            />
          )
        )}

        {activeTab === 'json' && (
          <JsonView
            data={analysisResult}
            onGoToAnalyze={() => setActiveTab('analyze')}
          />
        )}

        {activeTab === 'docs' && (
          <DocumentationView />
        )}
      </main>

      {/* Compact Polished Footer */}
      <footer className="w-full border-t border-slate-200 bg-white py-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
            <span className="font-semibold text-slate-800">CSS INSIGHT</span>
            <span className="text-slate-300">•</span>
            <span>Skill First Labs Internship Shortlisting — Milestone 1: CSS Parser</span>
          </div>
          <div className="flex items-center gap-2 font-mono text-[11px] justify-center">
            <span>Powered by <strong className="text-indigo-600 font-semibold">tinycss2</strong> & <strong className="text-indigo-600 font-semibold">FastAPI</strong></span>
            <span className="text-slate-300">•</span>
            <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 font-medium">v1.2.4-prod</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
