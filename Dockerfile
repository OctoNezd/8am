FROM python:3.10-bullseye AS requirements
WORKDIR /build/
RUN pip install poetry==1.1.13
COPY poetry.lock pyproject.toml /build/
RUN poetry export -f requirements.txt --without-hashes > requirements.txt

FROM node:18-alpine AS webpack
WORKDIR /build/
COPY ./static/package* ./
COPY ./static/webpack.config.js ./
RUN npm install 
COPY ./static/js ./js
RUN npm run build && ls

FROM python:3.10-bullseye AS app
WORKDIR /app
# Project initialization:
COPY --from=requirements /build/requirements.txt /app/
RUN pip install -r requirements.txt
# Copy only requirements to cache them in docker layer
COPY ./static/icons/ /app/static/icons
COPY ./static/android_sync_guide/ /app/static/android_sync_guide
COPY ./static/*.html /app/static/
COPY --from=webpack /build/sharaga-bundle* /app/static/
# Creating folders, and files for a project:
COPY webserver.py /app/
COPY dec_reader.py /app/
USER 33:33
EXPOSE 80
ENV REDIS=redis://redis:6379/0
CMD gunicorn -b 0.0.0.0:80 --access-logfile '-' --forwarded-allow-ips '*' webserver:app --workers 4 --worker-class uvicorn.workers.UvicornWorker
