SHELL := /bin/bash

VENV_DIR := backend/.venv
PYTHON   := $(VENV_DIR)/bin/python
PIP      := $(VENV_DIR)/bin/pip

BACKEND_CRIME_API_DIR := backend/crime_api
FRONTEND_DIR          := frontend

CRIME_DB_URL ?= postgresql://postgres:postgres@localhost:5432/boston_crime
CRIME_API_PORT ?= 4000

TMP_DIR            := tmp
CRIME_API_PID_FILE := $(TMP_DIR)/crime_api.pid
FRONTEND_PID_FILE  := $(TMP_DIR)/frontend.pid

.PHONY: help setup-all deps backend-venv backend-deps node-backend-deps node-frontend-deps etl db-schema db-load db-all start stop run-crime-api run-frontend clean

help:
	@echo "Targets:"
	@echo "  setup-all   - First-time setup (deps + ETL + DB schema + DB load)"
	@echo "  deps        - Install Python + Node dependencies"
	@echo "  etl         - Run crime ETL script"
	@echo "  db-schema   - Apply crime DB schema"
	@echo "  db-load     - Load crime artifacts into DB"
	@echo "  db-all      - Apply schema and load data"
	@echo "  start       - Start crime API and frontend (dev) in background"
	@echo "  stop        - Stop crime API and frontend"
	@echo "  clean       - Remove venv and tmp PID/logs (DB untouched)"

backend-venv:
	@if [ ! -d "$(VENV_DIR)" ]; then \
	  echo "Creating Python virtual environment in $(VENV_DIR)"; \
	  python -m venv "$(VENV_DIR)"; \
	else \
	  echo "Python virtual environment already exists at $(VENV_DIR)"; \
	fi

backend-deps: backend-venv
	@echo "Installing Python dependencies into venv..."
	@$(PIP) install --upgrade pip
	@$(PIP) install -r backend/requirements.txt

node-backend-deps:
	@echo "Installing Node dependencies for crime API..."
	@cd "$(BACKEND_CRIME_API_DIR)" && npm install

node-frontend-deps:
	@echo "Installing Node dependencies for frontend..."
	@cd "$(FRONTEND_DIR)" && npm install

deps: backend-deps node-backend-deps node-frontend-deps
	@echo "All project dependencies installed."

etl: backend-venv
	@echo "Running crime ETL (prepare_crime_data.py)..."
	@$(PYTHON) backend/scripts/prepare_crime_data.py

db-schema:
	@if [ -z "$(CRIME_DB_URL)" ]; then \
	  echo "CRIME_DB_URL is not set. Example:"; \
	  echo "  make db-schema CRIME_DB_URL=postgresql://user:pass@localhost:5432/boston_crime"; \
	  exit 1; \
	fi
	@echo "Applying crime schema to $(CRIME_DB_URL)..."
	@psql "$(CRIME_DB_URL)" -f backend/crime_db/schema.sql

db-load: backend-venv
	@if [ -z "$(CRIME_DB_URL)" ]; then \
	  echo "CRIME_DB_URL is not set. Example:"; \
	  echo "  make db-load CRIME_DB_URL=postgresql://user:pass@localhost:5432/boston_crime"; \
	  exit 1; \
	fi
	@echo "Loading crime artifacts into Postgres..."
	@CRIME_DB_URL="$(CRIME_DB_URL)" $(PYTHON) backend/scripts/load_crime_to_postgres.py

db-all: db-schema db-load
	@echo "Database schema applied and crime data loaded."

setup-all: deps etl db-all
	@echo "Initial setup complete. You can now run 'make start' to launch servers."

run-crime-api:
	@if [ -z "$(CRIME_DB_URL)" ]; then \
	  echo "CRIME_DB_URL is not set. Example:"; \
	  echo "  make start CRIME_DB_URL=postgresql://user:pass@localhost:5432/boston_crime"; \
	  exit 1; \
	fi
	@mkdir -p "$(TMP_DIR)"
	@echo "Starting crime API on port $(CRIME_API_PORT)..."
	@cd "$(BACKEND_CRIME_API_DIR)" && \
	  CRIME_DB_URL="$(CRIME_DB_URL)" PORT="$(CRIME_API_PORT)" npm run dev \
	  > ../../$(TMP_DIR)/crime_api.log 2>&1 & echo $$! > ../../$(CRIME_API_PID_FILE)
	@echo "Crime API PID: $$(cat $(CRIME_API_PID_FILE))"

run-frontend:
	@mkdir -p "$(TMP_DIR)"
	@echo "Starting frontend dev server..."
	@cd "$(FRONTEND_DIR)" && \
	  npm run dev > ../$(TMP_DIR)/frontend.log 2>&1 & echo $$! > ../$(FRONTEND_PID_FILE)
	@echo "Frontend PID: $$(cat $(FRONTEND_PID_FILE))"

start: run-crime-api run-frontend
	@echo "Crime API and frontend started."
	@echo "  Crime API: http://localhost:$(CRIME_API_PORT)"
	@echo "  Frontend:  http://localhost:3000"

stop:
	@echo "Stopping servers..."
	@if [ -f "$(CRIME_API_PID_FILE)" ]; then \
	  echo "Stopping crime API (PID $$(cat $(CRIME_API_PID_FILE)))..."; \
	  kill $$(cat $(CRIME_API_PID_FILE)) || true; \
	  rm -f "$(CRIME_API_PID_FILE)"; \
	else \
	  echo "No crime API PID file found."; \
	fi
	@if [ -f "$(FRONTEND_PID_FILE)" ]; then \
	  echo "Stopping frontend (PID $$(cat $(FRONTEND_PID_FILE)))..."; \
	  kill $$(cat $(FRONTEND_PID_FILE)) || true; \
	  rm -f "$(FRONTEND_PID_FILE)"; \
	else \
	  echo "No frontend PID file found."; \
	fi
	@echo "Done."

clean:
	@echo "Cleaning venv and tmp PID/log files (DB is untouched)..."
	@rm -rf "$(VENV_DIR)" "$(TMP_DIR)"
