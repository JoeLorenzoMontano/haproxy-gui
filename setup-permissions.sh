#!/bin/bash

# Script to set up necessary permissions for the HAProxy GUI

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  echo "Please run as root"
  exit 1
fi

# Path to HAProxy configuration
HAPROXY_CFG="/etc/haproxy/haproxy.cfg"

# Create a backup of the current configuration
echo "Creating a backup of current HAProxy configuration..."
cp $HAPROXY_CFG "${HAPROXY_CFG}.bak.$(date +%Y%m%d%H%M%S)"

# Set appropriate permissions on the HAProxy config
echo "Setting permissions on HAProxy configuration files..."
chmod 664 $HAPROXY_CFG
chmod 775 $(dirname $HAPROXY_CFG)  # Make directory writable
chown root:docker $HAPROXY_CFG

# Create the config directory for storing backups
mkdir -p /home/jolomoadmin/haproxy-gui/config
chown -R jolomoadmin:jolomoadmin /home/jolomoadmin/haproxy-gui/config

# Add the necessary sudoers entry to allow managing HAProxy
echo "Setting up sudoers for HAProxy management..."
cat > /etc/sudoers.d/haproxy-gui << EOF
# Allow the Docker container to manage HAProxy
jolomoadmin ALL=(root) NOPASSWD: /bin/systemctl start haproxy
jolomoadmin ALL=(root) NOPASSWD: /bin/systemctl stop haproxy
jolomoadmin ALL=(root) NOPASSWD: /bin/systemctl restart haproxy
jolomoadmin ALL=(root) NOPASSWD: /bin/systemctl reload haproxy
jolomoadmin ALL=(root) NOPASSWD: /bin/systemctl status haproxy
jolomoadmin ALL=(root) NOPASSWD: /usr/sbin/haproxy -c -f /etc/haproxy/haproxy.cfg
jolomoadmin ALL=(root) NOPASSWD: /usr/bin/socat unix-connect\:/var/run/haproxy.sock stdio
EOF
chmod 440 /etc/sudoers.d/haproxy-gui

echo "Permissions set up successfully!"
echo "You can now run the HAProxy GUI using: docker-compose up -d"