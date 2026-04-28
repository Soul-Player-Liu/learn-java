#!/usr/bin/env bash
set -euo pipefail

export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
export PATH="$JAVA_HOME/bin:$PATH"

docker compose up -d mysql

cd backend
./mvnw test
./mvnw verify -Pintegration-test

cd ../frontend
npm ci
npm run build
