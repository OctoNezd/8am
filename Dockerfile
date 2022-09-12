FROM python:3.10-bullseye AS requirements
WORKDIR /build/
RUN pip install poetry==1.1.13
COPY poetry.lock pyproject.toml /build/
RUN poetry export -f requirements.txt --without-hashes > requirements.txt

FROM node:18-bullseye AS webpack
RUN apt update && apt install git automake build-essential autoconf nasm -y
WORKDIR /build/
COPY ./web/package.json ./web/package-lock.json ./
COPY ./web/patches ./patches
RUN npm install 
COPY ./.git ./.git
COPY ./web/ ./
RUN npm run build

FROM python:3.10-bullseye AS app
WORKDIR /app
# Project initialization:
COPY --from=requirements /build/requirements.txt /app/
RUN pip install -r requirements.txt
# Copy only requirements to cache them in docker layer
COPY ./static/ /app/static/
COPY --from=webpack /build/dist /app/web/dist
# Creating folders, and files for a project:
COPY webserver.py /app/
COPY dec_reader.py /app/
USER 33:33
EXPOSE 80
ENV REDIS=redis://redis:6379/0
CMD gunicorn -b 0.0.0.0:80 --access-logfile '-' --forwarded-allow-ips '*' webserver:app --workers 4 --worker-class uvicorn.workers.UvicornWorker
