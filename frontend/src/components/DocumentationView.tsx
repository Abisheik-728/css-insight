import React from 'react';

export const DocumentationView: React.FC = () => {
  return (
    <div className="bg-surface-container-lowest rounded-xl p-space-lg sm:p-space-xl shadow-sm border border-outline-variant/30 flex flex-col gap-space-xl animate-in fade-in duration-200">
      {/* Title */}
      <div className="pb-space-xs border-b border-outline-variant/20">
        <div className="flex items-center gap-space-xs text-primary font-code-sm text-code-sm uppercase tracking-wider font-semibold">
          <span className="material-symbols-outlined text-[18px]">menu_book</span>
          Technical Specification
        </div>
        <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight mt-1">
          CSS INSIGHT Documentation
        </h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-3xl mt-1">
          Architectural deep-dive, parsing heuristics, security model, and API specifications for Milestone 1.
        </p>
      </div>

      {/* Grid of Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-space-lg">
        {/* Section 1 */}
        <div className="p-space-md rounded-xl bg-surface-container-low border border-outline-variant/30 flex flex-col gap-space-sm">
          <div className="flex items-center gap-space-xs text-primary">
            <span className="material-symbols-outlined text-[20px]">memory</span>
            <h3 className="font-headline-sm text-headline-sm text-on-surface">
              1. AST Parsing vs. Naive Regex
            </h3>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
            CSS INSIGHT utilizes <strong>tinycss2</strong>, a true W3C CSS Syntax Level 3 parser. Unlike regular expressions or naive string splitting:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 font-body-sm text-body-sm text-on-surface">
            <li>Properly tokens bracket pairs, parenthesized expressions like <code className="font-code-sm text-primary font-medium">calc()</code> and <code className="font-code-sm text-primary font-medium">var()</code>, and quoted strings without false positives.</li>
            <li>Preserves top-level selector lists (e.g. <code className="font-code-sm text-primary font-medium">h1, :is(div, p), .card</code>) without mistakenly splitting commas inside functional pseudo-classes.</li>
            <li>Correctly parses conditional blocks such as <code className="font-code-sm text-secondary font-medium">@media</code>, <code className="font-code-sm text-secondary font-medium">@supports</code>, and keyframes.</li>
            <li>Emits genuine syntax recovery warnings rather than crashing silently on malformed declarations.</li>
          </ul>
        </div>

        {/* Section 2 */}
        <div className="p-space-md rounded-xl bg-surface-container-low border border-outline-variant/30 flex flex-col gap-space-sm">
          <div className="flex items-center gap-space-xs text-primary">
            <span className="material-symbols-outlined text-[20px]">security</span>
            <h3 className="font-headline-sm text-headline-sm text-on-surface">
              2. Security & File Validation
            </h3>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
            All uploads pass through strict multi-stage security validation on the Python backend:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 font-body-sm text-body-sm text-on-surface">
            <li><strong>Size Throttling:</strong> Enforces a strict 2 MB configurable limit prior to reading into memory.</li>
            <li><strong>Binary Signature Rejection:</strong> Inspects magic headers to reject images (PNG, JPEG, GIF), executables (ELF, PE MZ), and archives (ZIP PK).</li>
            <li><strong>Null-byte Detection:</strong> Rejects binary streams containing <code className="font-code-sm text-error font-medium">\x00</code> bytes.</li>
            <li><strong>Zero Client Execution:</strong> Uploaded CSS is purely tokenized in an isolated AST engine without DOM insertion or client execution.</li>
          </ul>
        </div>

        {/* Section 3 */}
        <div className="p-space-md rounded-xl bg-surface-container-low border border-outline-variant/30 flex flex-col gap-space-sm">
          <div className="flex items-center gap-space-xs text-primary">
            <span className="material-symbols-outlined text-[20px]">analytics</span>
            <h3 className="font-headline-sm text-headline-sm text-on-surface">
              3. Telemetry Metrics Glossary
            </h3>
          </div>
          <div className="space-y-2 font-body-sm text-body-sm">
            <div>
              <strong className="text-on-surface font-semibold">Style Rules:</strong>
              <p className="text-on-surface-variant text-[12px]">Total qualified rule blocks mapping selectors to declaration blocks.</p>
            </div>
            <div>
              <strong className="text-on-surface font-semibold">Individual Selectors:</strong>
              <p className="text-on-surface-variant text-[12px]">Count of discrete targets extracted from comma-delimited selector lists.</p>
            </div>
            <div>
              <strong className="text-on-surface font-semibold">Declarations:</strong>
              <p className="text-on-surface-variant text-[12px]">Total property-value statements, including <code className="font-code-sm text-primary">!important</code> flags.</p>
            </div>
            <div>
              <strong className="text-on-surface font-semibold">Detectable Colors:</strong>
              <p className="text-on-surface-variant text-[12px]">Catalog of unique hex codes, rgb/rgba, hsl/hsla, and CSS color keywords.</p>
            </div>
          </div>
        </div>

        {/* Section 4 */}
        <div className="p-space-md rounded-xl bg-surface-container-low border border-outline-variant/30 flex flex-col gap-space-sm">
          <div className="flex items-center gap-space-xs text-primary">
            <span className="material-symbols-outlined text-[20px]">terminal</span>
            <h3 className="font-headline-sm text-headline-sm text-on-surface">
              4. REST API Specification
            </h3>
          </div>
          <div className="space-y-2 font-code-sm text-code-sm">
            <div className="p-2 rounded bg-surface-container-lowest border border-outline-variant/30">
              <span className="text-primary font-bold">POST</span> <span className="text-on-surface">/api/analyze</span>
              <p className="font-body-sm text-[11px] text-on-surface-variant mt-0.5">
                Accepts multipart/form-data <code className="text-primary">file</code> (.css, max 2MB). Returns complete AST JSON telemetry.
              </p>
            </div>
            <div className="p-2 rounded bg-surface-container-lowest border border-outline-variant/30">
              <span className="text-secondary font-bold">GET</span> <span className="text-on-surface">/api/sample</span>
              <p className="font-body-sm text-[11px] text-on-surface-variant mt-0.5">
                Returns pre-bundled showcase CSS with modern variables and media queries.
              </p>
            </div>
            <div className="p-2 rounded bg-surface-container-lowest border border-outline-variant/30">
              <span className="text-secondary font-bold">GET</span> <span className="text-on-surface">/api/health</span>
              <p className="font-body-sm text-[11px] text-on-surface-variant mt-0.5">
                Returns backend health status, engine, and version info.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
