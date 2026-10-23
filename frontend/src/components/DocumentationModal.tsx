import React from 'react';
import { X, BookOpen, Cpu, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface DocumentationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DocumentationModal: React.FC<DocumentationModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] rounded-2xl border border-white/[0.1] bg-[#0c1222] shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-white/[0.08] flex items-center justify-between bg-white/[0.01]">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
              <BookOpen className="h-4 w-4 text-violet-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">CSS INSIGHT Documentation</h2>
              <p className="text-xs text-slate-400">Milestone 1 Technical Architecture & Specification</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.05] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
          {/* Section 1 */}
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-2">
              <Cpu className="h-4 w-4 text-cyan-400" />
              1. AST Parsing vs. Naive Regular Expressions
            </h3>
            <p className="text-slate-400 mb-2">
              CSS INSIGHT utilizes <strong>tinycss2</strong>, a true W3C CSS Syntax Level 3 parser. Unlike regular expressions or naive string splitting:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-300">
              <li>Properly tokens bracket pairs, parenthesized expressions like <code className="text-cyan-300 font-mono">calc()</code> and <code className="text-cyan-300 font-mono">var()</code>, and quoted strings without false positives.</li>
              <li>Preserves top-level selector lists (e.g. <code className="text-cyan-300 font-mono">h1, :is(div, p), .card</code>) without mistakenly splitting commas inside functional pseudo-classes.</li>
              <li>Correctly parses conditional blocks such as <code className="text-violet-300 font-mono">@media</code>, <code className="text-violet-300 font-mono">@supports</code>, and keyframes.</li>
              <li>Emits genuine syntax recovery warnings rather than crashing silently on malformed declarations.</li>
            </ul>
          </div>

          {/* Section 2 */}
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-2">
              <ShieldCheck className="h-4 w-4 text-violet-400" />
              2. Security & File Validation Architecture
            </h3>
            <p className="text-slate-400 mb-2">
              All uploads pass through strict multi-stage security validation on the Python backend:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-300">
              <li><strong>Size Throttling:</strong> Enforces a strict 2 MB configurable limit prior to processing.</li>
              <li><strong>Binary Signature Rejection:</strong> Inspects magic headers to reject images (PNG, JPEG, GIF), executables (ELF, PE MZ), and archives (ZIP PK).</li>
              <li><strong>Null-byte Detection:</strong> Rejects binary streams containing <code className="text-rose-300 font-mono">\x00</code> bytes.</li>
              <li><strong>No Execution:</strong> Uploaded CSS is purely tokenized in an isolated AST engine without DOM insertion or client execution.</li>
            </ul>
          </div>

          {/* Section 3 */}
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              3. Telemetry Metrics Glossary
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
              <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06]">
                <strong className="text-cyan-300 block font-mono text-xs">Style Rules</strong>
                <span className="text-slate-400 text-xs">Total qualified rule blocks mapping selectors to declaration blocks.</span>
              </div>
              <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06]">
                <strong className="text-sky-300 block font-mono text-xs">Individual Selectors</strong>
                <span className="text-slate-400 text-xs">Count of every discrete selector extracted from comma-delimited selector lists.</span>
              </div>
              <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06]">
                <strong className="text-violet-300 block font-mono text-xs">Declarations</strong>
                <span className="text-slate-400 text-xs">Total property-value statements, including <code className="font-mono">!important</code> flags and vendor overrides.</span>
              </div>
              <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06]">
                <strong className="text-pink-300 block font-mono text-xs">Detectable Colors</strong>
                <span className="text-slate-400 text-xs">Catalog of unique hex codes, rgb/rgba, hsl/hsla, and CSS color keywords.</span>
              </div>
            </div>
          </div>

          {/* Section 4 */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-2">4. REST API Specification</h3>
            <div className="space-y-2 font-mono text-xs">
              <div className="p-2.5 rounded bg-[#090d16] border border-white/[0.06]">
                <span className="text-emerald-400 font-bold">POST</span> <span className="text-slate-200">/api/analyze</span>
                <p className="text-slate-400 font-sans text-xs mt-1">Accepts multipart/form-data <code className="text-cyan-300">file</code> (.css). Returns complete AST JSON telemetry.</p>
              </div>
              <div className="p-2.5 rounded bg-[#090d16] border border-white/[0.06]">
                <span className="text-cyan-400 font-bold">GET</span> <span className="text-slate-200">/api/sample</span>
                <p className="text-slate-400 font-sans text-xs mt-1">Returns pre-bundled showcase CSS with modern variables and media queries.</p>
              </div>
              <div className="p-2.5 rounded bg-[#090d16] border border-white/[0.06]">
                <span className="text-cyan-400 font-bold">GET</span> <span className="text-slate-200">/api/health</span>
                <p className="text-slate-400 font-sans text-xs mt-1">Returns backend health status and parser engine version.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/[0.08] bg-white/[0.01] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-white text-xs font-medium transition-colors"
          >
            Close Documentation
          </button>
        </div>
      </div>
    </div>
  );
};
