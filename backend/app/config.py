from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql+asyncpg://histarix:changeme@localhost:5432/histarix"
    allowed_origins: str = "http://localhost:3093,http://localhost:5173"
    wikipedia_user_agent: str = "Histarix/0.1 (https://github.com/histarix; contact@histarix.dev)"
    rest_countries_api_url: str = "https://restcountries.com/v3.1"
    wikipedia_api_url: str = "https://en.wikipedia.org/api/rest_v1"
    wikidata_api_url: str = "https://query.wikidata.org/sparql"
    wikimedia_feed_url: str = "https://api.wikimedia.org/feed/v1/wikipedia/en/onthisday"

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}

    @property
    def origins_list(self) -> list[str]:
        return [o.strip() for o in self.allowed_origins.split(",") if o.strip()]


settings = Settings()
