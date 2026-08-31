import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "FraudGraph AI"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    
    MONGODB_URI: str = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
    MONGODB_DB_NAME: str = os.getenv("MONGODB_DB_NAME", "fraudgraph_db")
    
    NEO4J_URI: str = os.getenv("NEO4J_URI", "bolt://localhost:7687")
    NEO4J_USERNAME: str = os.getenv("NEO4J_USERNAME", "neo4j")
    NEO4J_PASSWORD: str = os.getenv("NEO4J_PASSWORD", "password123")
    
    SECRET_KEY: str = os.getenv("SECRET_KEY", "fraudgraph_secret_key_2026")
    
    class Config:
        case_sensitive = True

settings = Settings()
