FROM python:3.11-slim

# Install system dependencies needed for GeoPandas/Shapely/psycopg2 and psql client
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        gdal-bin libgdal-dev libproj-dev libgeos-dev \
        build-essential libpq-dev postgresql-client && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python dependencies (copy requirements from repo layout)
COPY backend/requirements.txt backend/requirements.txt
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy entire repo so backend/ and frontend/ exist under /app
COPY . .

EXPOSE 8000

CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
