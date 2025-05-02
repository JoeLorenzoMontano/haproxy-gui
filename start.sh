#!/bin/bash

# Script to start the HAProxy GUI application

echo "Starting HAProxy GUI..."

# Check if Docker and Docker Compose are available
if ! command -v docker &> /dev/null || ! command -v docker-compose &> /dev/null; then
    echo "Error: Docker and Docker Compose are required to run this application."
    exit 1
fi

# Build and start the containers
docker-compose up -d

if [ $? -eq 0 ]; then
    echo "HAProxy GUI is now running!"
    echo "You can access it at: http://localhost:8080"
    echo ""
    echo "To view logs, run: docker-compose logs -f"
    echo "To stop the application, run: docker-compose down"
else
    echo "Error: Failed to start HAProxy GUI."
    echo "Check the logs with: docker-compose logs"
    exit 1
fi