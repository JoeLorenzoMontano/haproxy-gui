#!/bin/bash

# Script to install Docker and Docker Compose on Ubuntu

# Update package index
sudo apt update

# Install Docker from Ubuntu's repository
sudo apt install -y docker.io

# Start and enable Docker service
sudo systemctl enable --now docker

# Install required packages for Docker Compose
sudo apt install -y curl

# Install Docker Compose
COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep 'tag_name' | cut -d\" -f4)
sudo curl -L "https://github.com/docker/compose/releases/download/${COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Add your user to the docker group so you can run Docker commands without sudo
sudo usermod -aG docker $USER

# Verify installations
echo "Docker version:"
docker --version
echo "Docker Compose version:"
docker-compose --version

echo -e "\nDocker and Docker Compose have been installed successfully!"
echo "Log out and log back in for the group changes to take effect."
echo "You can verify the installation by running 'docker run hello-world'"