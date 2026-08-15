# Makefile for Intelligent Support Engine Frontend
# Run `make help` to see all available commands

.PHONY: help install dev build start clean lint test

help:
	@echo "Available commands:"
	@echo "  install       - Install all dependencies"
	@echo "  dev           - Start development server"
	@echo "  build         - Build for production"
	@echo "  start         - Start production server"
	@echo "  clean         - Clean build artifacts"
	@echo "  lint          - Run ESLint"
	@echo "  test          - Run tests"

install:
	npm install
	npm run build

dev:
	npm run dev

build:
	npm run build

start:
	npm run start

clean:
	rm -rf .next
	rm -rf node_modules

lint:
	npm run lint

test:
	npm run test