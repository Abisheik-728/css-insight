# CSS INSIGHT — Intelligent CSS Parser & Analyzer

> **Skill First Labs Internship Shortlisting — Milestone 1: CSS Parser**  
> *"Turn raw CSS into meaningful, structured intelligence."*

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI_0.110+-009688.svg?logo=fastapi)](https://fastapi.tiangolo.com)
[![Parser](https://img.shields.io/badge/Parser-tinycss2_W3C_Spec-3b82f6.svg)](https://github.com/Kozea/tinycss2)
[![Frontend](https://img.shields.io/badge/Frontend-React_19_+_Vite_+_TypeScript-61dafb.svg?logo=react)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind_CSS_v3-38bdf8.svg?logo=tailwindcss)](https://tailwindcss.com)
[![Tests](https://img.shields.io/badge/Tests-Pytest_18_Passed-success.svg?logo=pytest)](https://pytest.org)

---

## 1. Project Overview

**CSS INSIGHT** is a developer-grade web application and AST telemetry engine designed to inspect, analyze, and decompose cascading stylesheets into structured Abstract Syntax Trees (AST). Instead of treating CSS as raw unstructured text or relying on error-prone regular expressions, CSS INSIGHT executes the W3C-compliant `tinycss2` parsing engine to extract style rules, multi-selector lists, property-value declarations, media queries, CSS variables, functions, and diagnostics.

---

## 2. Key Features

- **Genuine W3C AST Parsing:** Powered by `tinycss2`. Correctly handles complex CSS syntax including comma-separated selector lists (`h1, :is(div, p), .card`), CSS functions (`calc()`, `rgb()`, `var()`, `clamp()`), and vendor fallbacks.
- **Decomposed Multi-Selector Mapping:** Parses selector lists into discrete selector targets while maintaining the full parent rule context and source line locations.
- **Diagnostics & Duplicate Tracking:** Identifies duplicate property declarations (e.g., `-webkit-flex` followed by `flex`) and syntax recovery errors without discarding or modifying declarations.
- **At-Rule & Media Query Registry:** Full introspection for `@media`, `@supports`, `@keyframes`, and `@font-face` blocks, including nested rule mappings.
- **Color Extraction:** Detects and visualizes hex codes, rgb/rgba, hsl/hsla, and standard CSS named color keywords with palette preview swatches.
- **Structured JSON & Report Generation:** Direct export of verified Pydantic JSON schemas or Markdown audit reports for CI/CD linting pipelines.
- **Developer-Focused UI:** Integrated with Google Stitch design system, crisp light-theme palette, Material Symbols, compact header with 8 horizontal tabs, and interactive telemetry.
- **Security-Hardened File Validation:** Multi-stage validation enforcing a configurable 2 MB limit, binary magic byte rejection (PNG, PE, ELF, ZIP), and null-byte sanitization.

---

## 3. Screenshots

> *To add screenshots to your repository, capture images of the running application and place them in the `docs/screenshots/` folder, referencing them below.*

| Main Analysis Dashboard | Selector & Properties Explorer |
|:---:|:---:|
| `![Dashboard](docs/screenshots/dashboard.png)` | `![Selectors](docs/screenshots/selectors.png)` |

| Diagnostics & Duplicate Detection | Structured AST JSON Viewer |
|:---:|:---:|
| `![Diagnostics](docs/screenshots/diagnostics.png)` | `![JSON Viewer](docs/screenshots/json_viewer.png)` |

---

## 4. Technology Stack

### Backend
- **Python 3.11+**
- **FastAPI:** High-performance asynchronous REST framework.
- **Uvicorn:** ASGI production web server.
- **tinycss2:** Low-level, W3C CSS Syntax Level 3 parsing engine.
- **Pydantic v2:** Strict input/output schema validation.
- **Pytest:** Comprehensive automated test suite.

### Frontend
- **React 19 with Vite**
- **TypeScript 5.8**
- **Tailwind CSS v3:** Customized dark developer theme.
- **Lucide Icons:** Clean developer UI icons.

---

## 5. Project Architecture & Structure

```
css-insight/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                 # FastAPI application, CORS, error handling
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   └── routes.py           # REST endpoints (/analyze, /sample, /health)
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── css_parser.py       # tinycss2 AST parsing engine
│   │   │   ├── statistics.py       # Metrics and telemetry calculations
│   │   │   └── color_extractor.py  # Regex & keyword color extractor
│   │   ├── schemas/
│   │   │   ├── __init__.py
│   │   │   └── models.py           # Pydantic response models
│   │   └── utils/
│   │       ├── __init__.py
│   │       └── validator.py        # File size, binary magic bytes & encoding validation
│   ├── tests/
│   │   ├── __init__.py
│   │   └── test_parser_and_api.py  # 18 automated Pytest test cases
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.tsx
│   │   │   ├── Hero.tsx
│   │   │   ├── UploadPanel.tsx
│   │   │   ├── SummaryCards.tsx
│   │   │   ├── SelectorExplorer.tsx
│   │   │   ├── PropertiesExplorer.tsx
│   │   │   ├── AtRulesBreakdown.tsx
│   │   │   ├── DiagnosticsPanel.tsx
│   │   │   ├── JsonViewer.tsx
│   │   │   └── DocumentationModal.tsx
│   │   ├── App.tsx
│   │   ├── types.ts
│   │   ├── main.tsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── vite.config.ts
├── samples/
│   ├── normal_sample.css           # Production application stylesheet
│   └── edge_cases_sample.css       # Duplicate properties, functions & at-rules
├── docs/
├── MILESTONE_1_EXPLANATION.md       # 3-4 line required assignment explanation
├── DEMO_SCRIPT.md                  # 60-90 second walkthrough video guide
├── README.md
└── .gitignore
```

---

## 6. Installation & Quickstart

### Prerequisites
- Python 3.11+
- Node.js 18+ and npm

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create a virtual environment (optional but recommended)
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Linux / macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start FastAPI development server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
The API server will run at `http://localhost:8000`. Interactive Swagger documentation is available at `http://localhost:8000/docs`.

### 2. Frontend Setup

```bash
# In a new terminal, navigate to frontend directory
cd frontend

# Install npm dependencies
npm install

# Start Vite development server
npm run dev
```
The web application will open at `http://localhost:5173`.

---

## 7. Automated Testing

The backend includes a comprehensive test suite executed with Pytest covering 18 test cases across all 16 assignment criteria:

1. Basic CSS with multiple rules
2. Multiple selectors in one rule
3. CSS comments handling
4. Empty CSS input handling
5. Whitespace-only CSS input
6. Invalid CSS syntax and error recovery
7. Duplicate declarations detection
8. `!important` declaration flags
9. `@media` queries and nested rule parsing
10. CSS variables (`var(--...)`)
11. Complex CSS functions (`calc()`, `rgb()`, `min()`)
12. Malformed or unsupported at-rules
13. Non-CSS binary upload rejection (PNG, PE, ELF)
14. Oversized upload rejection (> 2 MB)
15. Invalid text encoding & null-byte rejection
16. Correct statistics and JSON schema validation
17. Backend `/api/health` status
18. Backend `/api/sample` payload validation

To execute the test suite:

```bash
# Run pytest from the repository root or backend directory
python -m pytest backend/tests -v
```

---

## 8. API Specification

### `POST /api/analyze`
Accepts a CSS file via `multipart/form-data`.
- **Request:** Form field `file` (`.css` format, max 2 MB).
- **Response:** JSON matching `AnalysisResponse` schema:

```json
{
  "metadata": {
    "filename": "style.css",
    "file_size_bytes": 1024,
    "total_rules": 2,
    "total_selectors": 3,
    "total_declarations": 4,
    "unique_properties": 3,
    "unique_colors": 1,
    "total_at_rules": 0,
    "total_comments": 1,
    "parse_time_ms": 1.2
  },
  "rules": [
    {
      "selector": "h1, h2",
      "selectors": ["h1", "h2"],
      "declarations": [
        {
          "property": "color",
          "value": "#ff0055",
          "important": true,
          "line": 4,
          "column": 9
        }
      ],
      "line": 3,
      "parent_at_rule": null
    }
  ],
  "at_rules": [],
  "detected_colors": ["#ff0055"],
  "warnings": []
}
```

### `GET /api/sample`
Returns pre-bundled sample CSS with modern CSS features.

### `GET /api/health`
Returns service status and engine telemetry.

---

## 9. Security Considerations

- **Strict Size Throttling:** Uploads exceeding 2 MB are rejected immediately with HTTP 413.
- **Magic Header Rejection:** Inspects binary magic numbers to prevent malicious executable or media files disguised as `.css`.
- **Null-Byte Sanitization:** Detects `\x00` null bytes commonly present in exploits.
- **No Client Execution:** Stylesheets are parsed into data structures and never injected into the document DOM.
- **Stack Trace Suppression:** Global exception handling prevents leakage of internal server tracebacks.

---

## 10. Publishing to a Public GitHub Repository

To publish this project to your public GitHub account:

```bash
# 1. Initialize git repository from workspace root
git init

# 2. Add all files
git add .

# 3. Create initial commit
git commit -m "feat: complete CSS INSIGHT milestone 1 implementation"

# 4. Set main branch
git branch -M main

# 5. Add your GitHub repository remote (replace <YOUR_USERNAME> and <REPO_NAME>)
git remote add origin https://github.com/<YOUR_USERNAME>/<REPO_NAME>.git

# 6. Push to GitHub
git push -u origin main
```
