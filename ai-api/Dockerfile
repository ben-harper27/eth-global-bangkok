FROM python:3.11-slim-buster AS base

# Allow statements and log messages to immediately appear in the Knative logs
ENV PYTHONUNBUFFERED True

WORKDIR /app

COPY requirements.txt requirements.txt

RUN apt-get -qq update && \
  apt-get install --no-install-recommends -y -qq gcc python3-pip libpq-dev python3-dev  \
  build-essential ca-certificates automake libtool make pkg-config locales locales-all && \
  pip3 install -r requirements.txt

FROM base AS release

COPY . ./

USER 1005

ENTRYPOINT ["uvicorn", "api.main:app", "--loop", "asyncio", "--host", "0.0.0.0", "--workers", "1"]
