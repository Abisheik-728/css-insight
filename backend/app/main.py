import logging
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .api.routes import router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("css_insight")

app = FastAPI(
    title="CSS INSIGHT API",
    description="Intelligent CSS Parser & Analyzer API powered by tinycss2",
    version="1.0.0"
)

# CORS configuration for local React / Vite frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API router
app.include_router(router)


@app.get("/")
async def root():
    return {
        "name": "CSS INSIGHT API",
        "description": "Turn raw CSS into meaningful, structured intelligence.",
        "docs_url": "/docs",
        "health_url": "/api/health",
        "analyze_url": "/api/analyze",
        "sample_url": "/api/sample"
    }


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled server error on {request.url.path}: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": "An internal server error occurred while processing the stylesheet.",
            "error_type": type(exc).__name__
        }
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
