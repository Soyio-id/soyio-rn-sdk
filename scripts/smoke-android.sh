#!/usr/bin/env bash
set -euo pipefail

if ! command -v /usr/libexec/java_home >/dev/null 2>&1; then
  echo "Missing /usr/libexec/java_home. Install JDK 17 and retry." >&2
  exit 1
fi

JAVA_HOME_17=$(/usr/libexec/java_home -v 17 2>/dev/null || true)

if [[ -z "$JAVA_HOME_17" ]]; then
  echo "JDK 17 not found. Install Temurin 17 (or another JDK 17) and retry." >&2
  exit 1
fi

export JAVA_HOME="$JAVA_HOME_17"

echo "Using JAVA_HOME=$JAVA_HOME"

cd example/app

yarn android
