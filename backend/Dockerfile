FROM python:3.12-slim

WORKDIR /app

# Dependencies come from pyproject.toml (single source of truth, same list CI
# tests against); separate layer so code changes keep the dependency cache
COPY pyproject.toml .
RUN python -c "import tomllib; ds = tomllib.load(open('pyproject.toml', 'rb'))['project']['dependencies']; open('/tmp/requirements.txt', 'w').write('\n'.join(ds))" \
    && pip install --no-cache-dir -r /tmp/requirements.txt

COPY . .

RUN adduser --disabled-password --gecos '' appuser
USER appuser

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
