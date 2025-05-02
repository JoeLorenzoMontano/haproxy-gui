#!/bin/bash

# Script to control HAProxy service from within a Docker container
# This script is meant to be run from the backend container

ACTION=$1

if [ -z "$ACTION" ]; then
  echo "Usage: $0 [start|stop|restart|reload]"
  exit 1
fi

# Check if we're running in a container
if [ -f /.dockerenv ]; then
  # When running in a container, we need to execute the command on the host
  # This requires that the docker-compose.yml has proper volume mounts
  # and that the sudo permissions are correctly set up
  
  case "$ACTION" in
    start)
      echo "Starting HAProxy..."
      if command -v sudo >/dev/null 2>&1; then
        sudo systemctl start haproxy
      else
        # Fallback if sudo is not available
        ssh -o StrictHostKeyChecking=no localhost "systemctl start haproxy" || \
        echo "Error: Cannot start HAProxy. Make sure permissions are set correctly."
      fi
      ;;
    stop)
      echo "Stopping HAProxy..."
      if command -v sudo >/dev/null 2>&1; then
        sudo systemctl stop haproxy
      else
        ssh -o StrictHostKeyChecking=no localhost "systemctl stop haproxy" || \
        echo "Error: Cannot stop HAProxy. Make sure permissions are set correctly."
      fi
      ;;
    restart)
      echo "Restarting HAProxy..."
      if command -v sudo >/dev/null 2>&1; then
        sudo systemctl restart haproxy
      else
        ssh -o StrictHostKeyChecking=no localhost "systemctl restart haproxy" || \
        echo "Error: Cannot restart HAProxy. Make sure permissions are set correctly."
      fi
      ;;
    reload)
      echo "Reloading HAProxy..."
      if command -v sudo >/dev/null 2>&1; then
        sudo systemctl reload haproxy
      else
        ssh -o StrictHostKeyChecking=no localhost "systemctl reload haproxy" || \
        echo "Error: Cannot reload HAProxy. Make sure permissions are set correctly."
      fi
      ;;
    *)
      echo "Invalid action: $ACTION. Must be start, stop, restart, or reload."
      exit 1
      ;;
  esac
else
  # Running directly on the host
  systemctl "$ACTION" haproxy
fi

# Check if the action was successful
if [ $? -eq 0 ]; then
  echo "HAProxy $ACTION completed successfully."
  exit 0
else
  echo "HAProxy $ACTION failed."
  exit 1
fi