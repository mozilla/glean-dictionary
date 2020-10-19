.PHONY: help lint lint-fix
help:
	@echo "  lint                   Check style with flake8, black and isort"
	@echo "  lint-fix               Format code with black and isort"

lint: 
	flake8
	black --check .
	isort --check-only .

lint-fix:
	autoflake -r -i --remove-all-unused-imports scripts
	black .
	isort .
