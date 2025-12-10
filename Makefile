SHELL := /bin/bash

.PHONY: help setup-all start stop clean

help:
	@echo "Targets:"
	@echo "  setup-all   - Build images, start db, run ETL once to prepare DB"
	@echo "  start       - Start db, price-api, crime-api, and frontend"
	@echo "  stop        - Stop all containers (keeping volumes)"
	@echo "  clean       - Stop containers and remove volumes (wipe DB)"

setup-all:
	@echo "Building Docker images..."
	@mkdir -p .docker-nocreds && echo '{"auths":{},"credsStore":""}' > .docker-nocreds/config.json
	DOCKER_BUILDKIT=0 COMPOSE_DOCKER_CLI_BUILD=0 DOCKER_CONFIG=$(PWD)/.docker-nocreds docker-compose build
	@echo "Starting database container..."
	docker-compose up -d db
	@echo "Running ETL job to prepare crime data..."
	docker-compose run --rm etl
	@echo "Initial setup complete. You can now run 'make start' to launch the full stack."

start:
	@echo "Starting full stack (db, price-api, crime-api, frontend)..."
	docker-compose up -d db price-api crime-api frontend
	@echo "Services are starting:"
	@echo "  Frontend:   http://localhost:3000"
	@echo "  Price API:  http://localhost:8000"
	@echo "  Crime API:  http://localhost:4000"
	@echo "  Postgres:   localhost:5432 (db=boston_crime, user=postgres)"

stop:
	@echo "Stopping all containers (keeping volumes)..."
	docker-compose down

clean:
	@echo "Stopping containers and removing volumes (this will wipe the DB)..."
	docker-compose down -v
