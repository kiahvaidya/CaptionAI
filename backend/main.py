import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from backend.database.db import init_db
from backend.api.auth import router as auth_router
from backend.api.captions import router as captions_router
from backend.api.campaigns import router as campaigns_router
from backend.api.ecommerce import router as ecommerce_router
from backend.api.seo import router as seo_router
from backend.api.history import router as history_router
from backend.api.analytics import router as analytics_router
from backend.api.ml_model import router as ml_router

# Initialize database
init_db()

app = FastAPI(
    title="CaptionAI Backend API",
    description="Intelligent Image Caption Generation Platform powered by ResNet50-LSTM Deep Learning Architecture",
    version="1.0.0"
)

# Enable CORS for frontend development and production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers
app.include_router(auth_router, prefix="/api")
app.include_router(captions_router, prefix="/api")
app.include_router(campaigns_router, prefix="/api")
app.include_router(ecommerce_router, prefix="/api")
app.include_router(seo_router, prefix="/api")
app.include_router(history_router, prefix="/api")
app.include_router(analytics_router, prefix="/api")
app.include_router(ml_router, prefix="/api")

@app.get("/")
def root():
    return {
        "platform": "CaptionAI",
        "tagline": "From pixels to publish-ready content.",
        "status": "online",
        "version": "1.0.0",
        "docs_url": "/docs",
        "api_endpoints": [
            "/api/captions/generate",
            "/api/campaigns",
            "/api/ecommerce/generate",
            "/api/seo/generate",
            "/api/history",
            "/api/analytics/overview",
            "/api/ml/architecture",
            "/api/ml/metrics"
        ]
    }

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": "CaptionAI Core API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
