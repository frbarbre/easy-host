# EasyHost - VS Code Extension

EasyHost is a Visual Studio Code extension that simplifies the process of deploying Docker-based applications. It generates all necessary deployment configurations and scripts with an intuitive user interface.

## Features

- 🎯 **One-Click Configuration**: Generate all necessary deployment files through a user-friendly interface
- 🐳 **Docker Support**: Automatically generates Dockerfiles and docker-compose configurations
- 🔒 **SSL Setup**: Includes automatic SSL certificate generation with Let's Encrypt
- 🌐 **Nginx Configuration**: Creates optimized Nginx configurations for your web applications
- 📦 **Multi-Container Support**: Handle multiple containers with different configurations
- 🔄 **Update Scripts**: Generates scripts for easy updates and deployments
- 🔐 **Private Repository Support**: Handles both public and private GitHub repositories

## Supported Frameworks & Technologies

### Frontend Frameworks

- ⚛️ Next.js (with standalone output)
- 🎯 SvelteKit (with Node adapter)

### Backend Frameworks

- 🚀 Laravel

### Databases

- 🐘 PostgreSQL

## Installation

1. Open VS Code
2. Go to the Extensions view (`Ctrl+Shift+X` or `Cmd+Shift+X`)
3. Search for "EasyHost"
4. Click Install

## Usage

1. Open your project in VS Code
2. Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac)
3. Type "EasyHost" and select the command
4. Fill in the configuration form:
   - Project settings (domain, email, location)
   - GitHub repository details
   - Container configurations
   - Environment variables
5. Click "Generate Files" to create deployment configurations

## Generated Files

The extension will generate the following files in your project:

- `Dockerfile` for each container
- `docker-compose.yml`
- `deploy.sh` (deployment script)
- `update.sh` (update script)
- Nginx configuration
- Updates to `.gitignore` (if sensitive variables are included)

### Framework-Specific Configurations

- **Next.js**: Automatically configures `next.config.js` for standalone output
- **SvelteKit**: Updates `svelte.config.js` to use Node adapter
- **Laravel**: Generates optimized PHP-FPM configurations
- **Database Containers**: Includes volume configurations and backup scripts

## Requirements

- Git installed and configured
- A server running linux
- A domain name pointed to your server

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT](LICENSE.md)

## Support

If you encounter any problems or have suggestions, please [open an issue](https://github.com/frbarbre/easy-host/issues) on our GitHub repository.
