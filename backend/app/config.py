from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql+asyncpg://histarix:changeme@db:5432/histarix"
    allowed_origins: str = "http://localhost:3093,http://localhost:5173"
    wikipedia_user_agent: str = "Histarix/0.1 (https://github.com/histarix; contact@histarix.dev)"
    rest_countries_api_url: str = "https://restcountries.com/v3.1"
    wikipedia_api_url: str = "https://en.wikipedia.org/api/rest_v1"
    wikidata_api_url: str = "https://query.wikidata.org/sparql"
    wikimedia_feed_url: str = "https://api.wikimedia.org/feed/v1/wikipedia/en/onthisday"
    jwt_secret: str
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 1440  # 24 hours
    redis_url: str = "redis://localhost:6379/0"
    smtp_host: str = "smtp.gmail.com"
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_password: str = ""
    app_url: str = "https://histarix.semo3.com"

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}

    @property
    def origins_list(self) -> list[str]:
        return [o.strip() for o in self.allowed_origins.split(",") if o.strip()]


settings = Settings()
