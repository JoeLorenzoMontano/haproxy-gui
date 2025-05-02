#!/bin/bash

# Script to validate HAProxy config and handle errors
# This script is meant to be run from the backend container

CONFIG_PATH="/etc/haproxy/haproxy.cfg"
BACKUP_PATH="/etc/haproxy/haproxy.cfg.backup"

# Create backup if it doesn't exist
if [ ! -f "$BACKUP_PATH" ]; then
  cp "$CONFIG_PATH" "$BACKUP_PATH"
fi

# Validate the configuration
haproxy -c -f "$CONFIG_PATH" 2>&1

# Check validation result
if [ $? -ne 0 ]; then
  echo "Validation failed, restoring backup"
  cp "$BACKUP_PATH" "$CONFIG_PATH"
  exit 1
fi

echo "Configuration is valid"
exit 0