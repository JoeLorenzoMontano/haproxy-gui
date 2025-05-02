#!/bin/bash

# Script to set up HAProxy stats socket and page
# This script should be run on the host

CONFIG_PATH="/etc/haproxy/haproxy.cfg"
BACKUP_PATH="/etc/haproxy/haproxy.cfg.bak.$(date +%Y%m%d%H%M%S)"

# Create backup
cp "$CONFIG_PATH" "$BACKUP_PATH"

# Check if stats already configured
if grep -q "stats socket" "$CONFIG_PATH"; then
  echo "Stats socket already configured"
else
  # Add stats socket to global section
  sed -i '/^global/a\    stats socket /var/run/haproxy.sock mode 666 level admin' "$CONFIG_PATH"
  echo "Added stats socket to global section"
fi

# Check if stats page already configured
if grep -q "stats enable" "$CONFIG_PATH"; then
  echo "Stats page already configured"
else
  # Add stats page configuration
  cat << EOF >> "$CONFIG_PATH"

# Stats configuration
listen stats
    bind *:8404
    mode http
    stats enable
    stats uri /
    stats refresh 10s
    stats admin if TRUE
EOF
  echo "Added stats page configuration"
fi

# Validate config
haproxy -c -f "$CONFIG_PATH"
if [ $? -ne 0 ]; then
  echo "Config validation failed. Restoring backup."
  cp "$BACKUP_PATH" "$CONFIG_PATH"
  exit 1
fi

# Reload HAProxy
systemctl reload haproxy
if [ $? -ne 0 ]; then
  echo "Failed to reload HAProxy. Restoring backup."
  cp "$BACKUP_PATH" "$CONFIG_PATH"
  exit 1
fi

echo "HAProxy stats setup successfully!"
exit 0