FROM python:3.11-bookworm AS requirements
WORKDIR /build/
RUN pip install poetry==1.4.1
COPY poetry.lock pyproject.toml /build/
RUN poetry export -f requirements.txt --without-hashes > requirements.txt

FROM python:3.11-bookworm AS app
WORKDIR /app
# Project initialization:
COPY --from=requirements /build/requirements.txt /app/
RUN pip install -r requirements.txt
# Copy only requirements to cache them in docker layer
COPY ./static/ /app/static/
# Creating folders, and files for a project:
COPY *.py /app/
USER 33:33
EXPOSE 80
ENV REDIS=redis://redis:6379/0
CMD gunicorn -b 0.0.0.0:80 --access-logfile '-' --forwarded-allow-ips '*' webserver:app --workers 4 --worker-class uvicorn.workers.UvicornWorker
