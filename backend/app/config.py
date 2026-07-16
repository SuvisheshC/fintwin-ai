"""
Application configuration loaded from environment variables (.env file).
"""
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    SECRET_KEY: str = "fintwin-super-secret-key-change-me"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    AI_PROVIDER: str = ""  # "openai", "gemini", or "" for rule-based only
    OPENAI_API_KEY: str = ""
    GEMINI_API_KEY: str = ""

    DATABASE_URL: str = "sqlite:///./fintwin.db"

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
