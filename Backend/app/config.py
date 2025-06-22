from pydantic_settings import BaseSettings
import os

class Settings(BaseSettings):
    google_api_key: str
    frontend_url: str = "http://localhost:3000"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()
os.environ['GOOGLE_API_KEY'] = settings.google_api_key  # <-- Add this line