import React from 'react';
import {
  BookOpen,
  Cpu,
  ShieldCheck,
  BarChart2,
  Terminal,
  Layers,
  Search,
  AlertTriangle,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

export const DocumentationView: React.FC = () => {
  return (
    <div className="bg-white rounded-xl p-6 sm:p-8 shadow-2xs border border-slate-200 flex flex-col gap-6 animate-in fade-in duration-200">
      {/* Title */}
      <div className="pb-3 border-b border-slate-200">
        <div className="flex items-center gap-1.5 text-indigo-600 text-xs font-semibold uppercase tracking-wider mb-1">
          <BookOpen className="h-4 w-4" />
          Technical Specification
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          CSS INSIGHT Documentation
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-3xl mt-0.5">
          Architectural deep-dive, parsing heuristics, security model, and API specifications for Milestone 1.
        </p>
      </div>

      {/* Parser Design Decisions (Milestone 1 Core Specification) */}
      <section className="p-6 sm:p-7 rounded-xl bg-gradient-to-br from-indigo-50/40 via-white to-slate-50/60 border border-indigo-100 shadow-2xs flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-indigo-100/70">
          <div>
            <div className="flex items-center gap-1.5 text-indigo-600 text-xs font-semibold uppercase tracking-wider mb-1">
              <Sparkles className="h-4 w-4" />
              Core Architecture
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Parser Design Decisions
            </h2>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-medium border border-indigo-200/60 self-start sm:self-auto">
            <CheckCircle2 className="h-3.5 w-3.5 text-indigo-600" />
            Milestone 1 Assignment
          </span>
        </div>

        {/* Primary Explanation */}
        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-white/90 p-4 rounded-lg border border-slate-200/80 shadow-2xs">
          CSS INSIGHT extracts CSS rules, selectors, declarations, properties, colors, at-rules, and comments into structured JSON. These details help developers understand and inspect stylesheets efficiently. The parser uses tinycss2 to process CSS while preserving meaningful information. One edge case considered is malformed CSS, which should produce a diagnostic instead of crashing the application.
        </p>

        {/* 3 Subsections */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Subsection 1: What I Extract */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 flex flex-col gap-2.5 shadow-2xs">
            <div className="flex items-center gap-2 text-indigo-600">
              <Layers className="h-4 w-4" />
              <h3 className="font-bold text-sm text-slate-900">
                What I Extract
              </h3>
            </div>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-700">
              <li>CSS rules and selectors</li>
              <li>Property-value declarations</li>
              <li>Colors, at-rules, and comments</li>
              <li>Structured JSON and diagnostics</li>
            </ul>
          </div>

          {/* Subsection 2: Why I Chose These Details */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 flex flex-col gap-2.5 shadow-2xs">
            <div className="flex items-center gap-2 text-indigo-600">
              <Search className="h-4 w-4" />
              <h3 className="font-bold text-sm text-slate-900">
                Why I Chose These Details
              </h3>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              Structured information helps developers inspect stylesheets, understand their contents, and identify potential issues.
            </p>
            <p className="text-xs text-slate-500 leading-relaxed">
              Decomposing rules into distinct selectors and declarations allows granular analysis of specificity, duplicate properties, and stylesheet footprint.
            </p>
          </div>

          {/* Subsection 3: Edge Case Considered */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 flex flex-col gap-2.5 shadow-2xs">
            <div className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="h-4 w-4" />
              <h3 className="font-bold text-sm text-slate-900">
                Edge Case Considered
              </h3>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              Malformed CSS may contain missing braces, invalid declarations, or incomplete rules. The parser should handle such input gracefully and provide useful diagnostics rather than crashing.
            </p>
            <p className="text-xs text-slate-500 leading-relaxed">
              Using tinycss2&apos;s error recovery, invalid declarations or syntax errors generate diagnostic warnings while remaining valid rules continue to be parsed cleanly.
            </p>
          </div>
        </div>
      </section>

      {/* Grid of Technical Specifications */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Section 1 */}
        <div className="p-5 rounded-xl bg-slate-50/70 border border-slate-200 flex flex-col gap-3 shadow-2xs">
          <div className="flex items-center gap-2 text-indigo-600">
            <Cpu className="h-4 w-4" />
            <h3 className="font-bold text-sm text-slate-900">
              1. AST Parsing vs. Naive Regex
            </h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            CSS INSIGHT utilizes <strong>tinycss2</strong>, a true W3C CSS Syntax Level 3 parser. Unlike regular expressions or naive string splitting:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-700">
            <li>Properly tokenizes bracket pairs, parenthesized expressions like <code className="font-mono text-indigo-600 font-semibold bg-white px-1 py-0.5 rounded border border-slate-200">calc()</code> and <code className="font-mono text-indigo-600 font-semibold bg-white px-1 py-0.5 rounded border border-slate-200">var()</code>, and quoted strings without false positives.</li>
            <li>Preserves top-level selector lists (e.g. <code className="font-mono text-indigo-600 font-semibold bg-white px-1 py-0.5 rounded border border-slate-200">h1, :is(div, p), .card</code>) without mistakenly splitting commas inside functional pseudo-classes.</li>
            <li>Correctly parses conditional blocks such as <code className="font-mono text-purple-700 font-semibold bg-white px-1 py-0.5 rounded border border-slate-200">@media</code>, <code className="font-mono text-purple-700 font-semibold bg-white px-1 py-0.5 rounded border border-slate-200">@supports</code>, and keyframes.</li>
            <li>Emits genuine syntax recovery warnings rather than crashing silently on malformed declarations.</li>
          </ul>
        </div>

        {/* Section 2 */}
        <div className="p-5 rounded-xl bg-slate-50/70 border border-slate-200 flex flex-col gap-3 shadow-2xs">
          <div className="flex items-center gap-2 text-indigo-600">
            <ShieldCheck className="h-4 w-4" />
            <h3 className="font-bold text-sm text-slate-900">
              2. Security & File Validation
            </h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            All uploads pass through strict multi-stage security validation on the Python backend:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-700">
            <li><strong>Size Throttling:</strong> Enforces a strict 2 MB configurable limit prior to reading into memory.</li>
            <li><strong>Binary Signature Rejection:</strong> Inspects magic headers to reject images (PNG, JPEG, GIF), executables (ELF, PE MZ), and archives (ZIP PK).</li>
            <li><strong>Null-byte Detection:</strong> Rejects binary streams containing <code className="font-mono text-rose-600 font-bold bg-white px-1 py-0.5 rounded border border-slate-200">\x00</code> bytes.</li>
            <li><strong>Zero Client Execution:</strong> Uploaded CSS is purely tokenized in an isolated AST engine without DOM insertion or client execution.</li>
          </ul>
        </div>

        {/* Section 3 */}
        <div className="p-5 rounded-xl bg-slate-50/70 border border-slate-200 flex flex-col gap-3 shadow-2xs">
          <div className="flex items-center gap-2 text-indigo-600">
            <BarChart2 className="h-4 w-4" />
            <h3 className="font-bold text-sm text-slate-900">
              3. Telemetry Metrics Glossary
            </h3>
          </div>
          <div className="space-y-2.5 text-xs">
            <div>
              <strong className="text-slate-900">Style Rules:</strong>
              <p className="text-slate-500 text-[11px]">Total qualified rule blocks mapping selectors to declaration blocks.</p>
            </div>
            <div>
              <strong className="text-slate-900">Individual Selectors:</strong>
              <p className="text-slate-500 text-[11px]">Count of discrete targets extracted from comma-delimited selector lists.</p>
            </div>
            <div>
              <strong className="text-slate-900">Declarations:</strong>
              <p className="text-slate-500 text-[11px]">Total property-value statements, including <code className="font-mono text-indigo-600">!important</code> flags.</p>
            </div>
            <div>
              <strong className="text-slate-900">Detectable Colors:</strong>
              <p className="text-slate-500 text-[11px]">Catalog of unique hex codes, rgb/rgba, hsl/hsla, and CSS color keywords.</p>
            </div>
          </div>
        </div>

        {/* Section 4 */}
        <div className="p-5 rounded-xl bg-slate-50/70 border border-slate-200 flex flex-col gap-3 shadow-2xs">
          <div className="flex items-center gap-2 text-indigo-600">
            <Terminal className="h-4 w-4" />
            <h3 className="font-bold text-sm text-slate-900">
              4. REST API Specification
            </h3>
          </div>
          <div className="space-y-2 font-mono text-xs">
            <div className="p-2.5 rounded-lg bg-white border border-slate-200 shadow-2xs">
              <span className="text-indigo-600 font-bold">POST</span> <span className="text-slate-900">/api/analyze</span>
              <p className="font-sans text-[11px] text-slate-500 mt-0.5">
                Accepts multipart/form-data <code className="text-indigo-600 font-mono">file</code> (.css, max 2MB). Returns complete AST JSON telemetry.
              </p>
            </div>
            <div className="p-2.5 rounded-lg bg-white border border-slate-200 shadow-2xs">
              <span className="text-emerald-700 font-bold">GET</span> <span className="text-slate-900">/api/sample</span>
              <p className="font-sans text-[11px] text-slate-500 mt-0.5">
                Returns pre-bundled showcase CSS with modern variables and media queries.
              </p>
            </div>
            <div className="p-2.5 rounded-lg bg-white border border-slate-200 shadow-2xs">
              <span className="text-emerald-700 font-bold">GET</span> <span className="text-slate-900">/api/health</span>
              <p className="font-sans text-[11px] text-slate-500 mt-0.5">
                Returns backend health status, engine, and version info.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
