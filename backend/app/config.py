from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # PocketBase
    pocketbase_url: str = "http://pocketbase:8090"
    pocketbase_admin_email: str = "admin@palmier.local"
    pocketbase_admin_password: str = "changeme"

    # Claude API
    anthropic_api_key: str = ""

    # Telegram
    telegram_bot_token: str = ""
    telegram_chat_id: str = ""

    # Crawling
    crawl_schedule_hour: int = 7
    crawl_timeout_seconds: int = 300
    max_events_per_crawl: int = 200

    # Flight deals
    flight_deal_threshold_percent: float = 30.0
    flight_deal_min_history_days: int = 7
    flight_crawl_enabled: bool = True

    # API
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    api_env: str = "development"

    model_config = {"env_file": ".env", "extra": "ignore"}


settings = Settings()
