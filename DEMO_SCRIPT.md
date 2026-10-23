# CSS INSIGHT — 60 to 90 Second Video Demonstration Script

**Project:** CSS INSIGHT — Intelligent CSS Parser & Analyzer  
**Milestone:** Skill First Labs Internship Shortlisting — Milestone 1: CSS Parser  
**Presenter Tone:** Confident, concise, technical, developer-focused.  

---

## Timeline & Narration

### [00:00 – 00:15] — 1. Introduction & Architecture
- **Screen:** Show CSS INSIGHT application with Google Stitch light-theme design system, compact header with real-time "API Connected (14ms)" live status indicator, and horizontal navigation tabs.
- **Voiceover:**
  > "Welcome to CSS INSIGHT. Modern developer workflows treat stylesheets as dumb strings, but CSS is structured code. CSS INSIGHT uses the W3C-compliant `tinycss2` parsing engine to analyze raw CSS files into an Abstract Syntax Tree, extracting deep architectural metrics, selector lists, and declaration telemetry in real-time."

---

### [00:15 – 00:35] — 2. Upload & AST Extraction
- **Action:** Click **"Try Sample CSS"** or drag-and-drop `samples/normal_sample.css` into the upload zone.
- **Screen:** The drag-and-drop zone displays parsing feedback (`"Analyzing CSS Abstract Syntax Tree..."`) and renders the telemetry dashboard within ~10 milliseconds.
- **Voiceover:**
  > "Let's upload a production stylesheet. Notice the backend immediately tokenizes the stylesheet in less than 5 milliseconds. We get 6 calculated summary cards: total qualified style rules, individual selectors decomposed from comma-delimited lists, declaration pairs, unique properties, detectable color swatches, and diagnostics."

---

### [00:35 – 00:55] — 3. Deep Telemetry & Selectors Explorer
- **Action:** Click into the **"Selector Explorer"** tab. Type `.button` or `h1` in the search box, then click the chevron on `.button-primary` to reveal expandable declarations drawer.
- **Voiceover:**
  > "In the Selector Explorer, multi-selector lists like `h1, h2, h3` are cleanly indexed as discrete selector targets without losing context. Expanding any rule reveals its individual declarations with source line locations, values, and `!important` flags. In the Properties Telemetry tab, we see top property distributions and complex functions like `calc()`, `var()`, and `rgb()` preserved intact."

---

### [00:55 – 01:10] — 4. Structured AST JSON & Export
- **Action:** Switch to the **"Structured AST JSON"** tab. Click **"Copy JSON"** (shows checkmark feedback), then click **"Download Report (MD)"**.
- **Voiceover:**
  > "Every metric is backed by our strict Pydantic JSON schema—no fabricated values. Developers can copy the structured JSON payload with one click or export a Markdown analysis report for CI/CD audit logs."

---

### [01:10 – 01:30] — 5. Edge Cases & Resilience Testing
- **Action:** Click **"Edge Cases Sample"** or upload `samples/edge_cases_sample.css`. Then switch to the **"Diagnostics & Warnings"** tab.
- **Voiceover:**
  > "Now let's test an edge case: vendor prefix duplicates like `display: -webkit-box` and `display: flex`. While naive parsers overwrite or drop prior declarations, CSS INSIGHT preserves both declarations and highlights duplicate property overrides in our Diagnostics registry. Uploading invalid binaries, oversized files, or corrupt syntax is safely caught with friendly HTTP error messages without server crashes."

---

### [01:30 – 01:35] — Conclusion
- **Voiceover:**
  > "CSS INSIGHT turns raw stylesheets into verifiable intelligence. Built with FastAPI, tinycss2, React, and TypeScript."
