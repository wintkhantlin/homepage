#!/usr/bin/env bash

# check-google-verification.sh
# Runs every 1 minute until a TXT result appears, then prints it and stops.

DOMAIN="wintkhantlin.com"
INTERVAL=60

echo "Checking TXT records for $DOMAIN every ${INTERVAL}s..."

while true; do
    RESULT=$(dig TXT "$DOMAIN" +short | grep "google-site-verification")

    if [[ -n "$RESULT" ]]; then
        echo ""
        echo "✅ Found verification record:"
        echo "$RESULT"
        exit 0
    fi

    echo "⏳ No result yet... ($(date '+%H:%M:%S'))"
    sleep "$INTERVAL"
done

