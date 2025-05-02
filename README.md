# HAProxy GUI

A web-based GUI for managing HAProxy configuration through a user-friendly interface.

## Features

- View and edit HAProxy configuration file
- Validate configuration before applying
- Monitor HAProxy statistics
- Simple dashboard for status overview

## Prerequisites

- Docker and Docker Compose
- HAProxy installed on the host machine
- Node.js and npm (for development)

## Installation

1. Clone this repository:
```bash
git clone <repository-url>
cd haproxy-gui
```

2. Start the application using Docker Compose:
```bash
docker-compose up -d
```

3. Access the GUI at http://localhost:8080

## Development

### Backend

The backend is a Node.js Express server that:
- Reads and writes the HAProxy configuration file
- Validates configuration changes
- Reloads HAProxy when configuration is updated
- Exposes stats API endpoints

To run the backend in development mode:
```bash
cd backend
npm install
npm run dev
```

### Frontend

The frontend is a React application that provides:
- A configuration editor
- Dashboard overview
- Statistics visualization

To run the frontend in development mode:
```bash
cd frontend
npm install
npm start
```

## Security Considerations

- The backend requires privileged access to manage HAProxy
- Consider implementing authentication for production use
- Ensure proper file permissions for HAProxy configuration

## License

MIT