.PHONY: install dev dev-frontend dev-backend lint build

install:
	cd frontend && npm install
	cd backend && pip install -e ".[dev]"

dev-frontend:
	cd frontend && npm run dev

dev-backend:
	cd backend && uvicorn app.main:app --reload --port 8000

dev:
	make dev-frontend & make dev-backend

lint:
	cd frontend && npm run lint

build:
	cd frontend && npm run build
