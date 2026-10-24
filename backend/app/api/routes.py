from fastapi import APIRouter, UploadFile, File, HTTPException, status
from fastapi.responses import JSONResponse, PlainTextResponse

from ..schemas.models import AnalysisResponse
from ..utils.validator import validate_css_file
from ..services.css_parser import parse_css_stylesheet
from ..services.statistics import calculate_css_statistics

router = APIRouter(prefix="/api", tags=["css-insight"])

SAMPLE_CSS = """/* ==========================================================================
   CSS INSIGHT — Showcase Stylesheet
   Demonstrates modern CSS variables, functions, media queries & layout rules
   ========================================================================== */

:root {
  --font-primary: 'Inter', -apple-system, sans-serif;
  --bg-canvas: #090d16;
  --surface-card: #131b2e;
  --accent-cyan: #06b6d4;
  --accent-violet: #8b5cf6;
  --text-primary: #f8fafc;
  --text-muted: #94a3b8;
  --border-subtle: rgba(255, 255, 255, 0.08);
  --space-unit: 8px;
}

/* Base reset */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: var(--font-primary);
  background-color: var(--bg-canvas);
  color: var(--text-primary);
  line-height: 1.6;
  min-height: 100vh;
}

/* Multi-selector rule */
h1, h2, h3, .heading-prominent {
  font-weight: 700;
  letter-spacing: -0.025em;
  color: #ffffff !important;
}

h1 {
  font-size: calc(2rem + 1.5vw);
  margin-bottom: calc(var(--space-unit) * 3);
}

/* Interactive primary action */
.btn-primary, .action-trigger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--accent-cyan), var(--accent-violet));
  color: #ffffff;
  padding: 12px 24px;
  border-radius: 8px;
  border: 1px solid var(--border-subtle);
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(6, 182, 212, 0.25);
}

/* Container component */
.insight-card {
  background: var(--surface-card);
  border: 1px solid var(--border-subtle);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 20px;
}

/* Animation definition */
@keyframes pulseGlow {
  0% {
    opacity: 0.6;
    transform: scale(0.98);
  }
  50% {
    opacity: 1;
    transform: scale(1);
  }
  100% {
    opacity: 0.6;
    transform: scale(0.98);
  }
}

/* Responsive grid layout */
@media screen and (min-width: 768px) {
  .dashboard-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: calc(var(--space-unit) * 3);
  }

  .insight-card {
    padding: 32px;
  }
}
"""


@router.get("/health")
async def health_check():
    """Health check endpoint for CSS Insight API."""
    return {
        "status": "healthy",
        "service": "CSS INSIGHT",
        "engine": "tinycss2",
        "version": "1.0.0"
    }


@router.get("/sample")
async def get_sample_css():
    """Returns sample stylesheet for testing and demonstration."""
    return {
        "filename": "showcase_sample.css",
        "content": SAMPLE_CSS
    }


@router.post("/analyze", response_model=AnalysisResponse)
async def analyze_css_file(file: UploadFile = File(...)):
    """
    Accepts a CSS file upload via multipart/form-data.
    Validates file integrity, enforces size limits, decodes safely,
    and runs genuine tinycss2 parsing to extract rules, declarations,
    at-rules, colors, and calculate accurate metrics.
    """
    if not file:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No file was uploaded. Please upload a .css file."
        )

    try:
        raw_bytes = await file.read()
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to read uploaded file: {str(exc)}"
        )

    # Validate file size, extension, null bytes, and encoding
    safe_filename, css_text = validate_css_file(file.filename, raw_bytes)

    # Parse stylesheet using tinycss2
    rules, at_rules, warnings, comments_count, parse_time_ms = parse_css_stylesheet(
        css_text,
        filename=safe_filename
    )

    # Compute statistics and build structured response
    analysis_result = calculate_css_statistics(
        filename=safe_filename,
        file_size_bytes=len(raw_bytes),
        rules=rules,
        at_rules=at_rules,
        warnings=warnings,
        comments_count=comments_count,
        parse_time_ms=parse_time_ms,
        css_content=css_text
    )

    return analysis_result
