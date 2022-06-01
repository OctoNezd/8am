FROM python:3.10-bullseye

RUN pip install poetry==1.1.13

# Copy only requirements to cache them in docker layer
WORKDIR /app
COPY poetry.lock pyproject.toml /app/

# Project initialization:
RUN poetry export -f requirements.txt --without-hashes | pip install -r /dev/stdin

# Creating folders, and files for a project:
COPY . /app/
USER 33:33
EXPOSE 80
CMD uvicorn webserver:app --port 80
