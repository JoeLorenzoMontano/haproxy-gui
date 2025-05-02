#!/bin/bash

# Script to control HAProxy service from within a Docker container
# This script is meant to be run from the backend container

ACTION=$1

if [ -z "$ACTION" ]; then
  echo "Usage: $0 [start|stop|restart|reload]"
  exit 1
fi

# Define HAProxy configuration path
HAPROXY_CONFIG="/etc/haproxy/haproxy.cfg"

# Direct HAProxy control using the binary
# This avoids systemctl which might not be available or properly mapped in container
case "$ACTION" in
  start)
    echo "Starting HAProxy..."
    if pgrep haproxy > /dev/null; then
      echo "HAProxy is already running"
    else
      haproxy -f $HAPROXY_CONFIG -D -p /var/run/haproxy.pid
    fi
    ;;
  stop)
    echo "Stopping HAProxy..."
    if [ -f /var/run/haproxy.pid ]; then
      kill -TERM $(cat /var/run/haproxy.pid)
    else
      pkill -TERM haproxy
    fi
    ;;
  restart)
    echo "Restarting HAProxy..."
    if [ -f /var/run/haproxy.pid ]; then
      kill -TERM $(cat /var/run/haproxy.pid)
    else
      pkill -TERM haproxy
    fi
    sleep 1
    haproxy -f $HAPROXY_CONFIG -D -p /var/run/haproxy.pid
    ;;
  reload)
    echo "Reloading HAProxy..."
    # Try direct HAProxy reload
    if [ -f /var/run/haproxy.pid ]; then
      haproxy -f $HAPROXY_CONFIG -D -p /var/run/haproxy.pid -sf $(cat /var/run/haproxy.pid)
    else
      # Fall back to systemctl if available
      if command -v systemctl >/dev/null 2>&1; then
        systemctl reload haproxy
      else
        # Last resort - stop and start
        pkill -TERM haproxy
        sleep 1
        haproxy -f $HAPROXY_CONFIG -D -p /var/run/haproxy.pid
      fi
    fi
    ;;
  *)
    echo "Invalid action: $ACTION. Must be start, stop, restart, or reload."
    exit 1
    ;;
esac

# Check if the action was successful
if [ $? -eq 0 ]; then
  echo "HAProxy $ACTION completed successfully."
  if [ "$ACTION" = "reload" ] || [ "$ACTION" = "start" ] || [ "$ACTION" = "restart" ]; then
    echo "HAProxy is running with PID: $(cat /var/run/haproxy.pid 2>/dev/null || pgrep haproxy)"
  fi
  exit 0
else
  echo "HAProxy $ACTION failed."
  exit 1
fi