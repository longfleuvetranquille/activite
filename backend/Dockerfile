FROM python:3.12-slim AS base

WORKDIR /app

# Install system dependencies for Playwright
RUN apt-get update && apt-get install -y --no-install-recommends \
    wget \
    fonts-unifont \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install Playwright Chromium; fall back to browser-only if --with-deps fails
RUN playwright install --with-deps chromium 2>/dev/null || playwright install chromium

COPY . .

EXPOSE 8000

# Default: production (no --reload)
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]
