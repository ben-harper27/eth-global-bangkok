import logging
import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    test_mode: bool = os.environ.get("IS_TEST_MODE", True)
    log_level: str = os.environ.get("LOG_LEVEL", "INFO")


class SecureSettings(BaseSettings):
    coinbase_api_key: str = os.environ.get("COINBASE_API_KEY", "")
    coinbase_api_private_key: str = os.environ.get("COINBASE_API_PRIVATE_KEY", "")
    open_api_key: str = os.environ.get("OPENAI_API_KEY", "")


settings = Settings()
secure_settings = SecureSettings()

if settings.test_mode:
    settings.log_level = "DEBUG"
    logging.getLogger("httpcore").setLevel("INFO")
