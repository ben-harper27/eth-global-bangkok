import json
import logging
import sys
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .router import routers
from .settings import settings, secure_settings

VERSION = "0.1.0"

logging.basicConfig(stream=sys.stdout, level=settings.log_level)
log = logging.getLogger(__name__)

app = FastAPI(
    title="API",
    version=VERSION,
    docs_url="/hidden/docs",
    redoc_url="/hidden/redoc",
    openapi_url="/hidden/openapi.json"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)


@app.on_event("startup")
def on_startup():
    log.info(f"Starting API service - version: {VERSION}")
    log.info(json.dumps(
        settings.dict(),
        sort_keys=True,
        indent=4,
        separators=(',', ': ')
    ))
    if settings.test_mode:
        log.info("Running in test mode")
        log.info(json.dumps(
            secure_settings.dict(),
            sort_keys=True,
            indent=4,
            separators=(',', ': ')
        ))


for router in routers:
    app.include_router(router)


@app.on_event("shutdown")
async def on_shutdown():
    log.info("Shutting down API service")


@app.get("/", name="Base", include_in_schema=False)
async def root():
    return {"message": "Hello World"}


@app.get("/healthz", include_in_schema=False)
async def healthcheck():
    return {"msg": "ok"}
