import * as fs from "fs";
import * as path from "path";
import { Config } from "../types";

export function generateDeployScript(config: Config, projectRoot: string) {
  const deployScriptContent = `#!/bin/bash
${config.github.isPrivate ? 'GITHUB_TOKEN="your_token_here"' : ""}

# Script Variables
REPO_URL="${config.github.isPrivate ? "https://$GITHUB_TOKEN@" : "https://"}${
    config.github.uri
  }"
APP_DIR=~${config.location}
SWAP_SIZE="1G"
DOMAIN_NAME="${config.domain}"
EMAIL="${config.email}"
NGINX_CONFIG_NAME="${config.nginx?.configName || "app"}"

${generateEnvironmentVariables(config)}

# Update and install dependencies
sudo apt update && sudo apt upgrade -y

# Add Swap Space
echo "Adding swap space..."
sudo fallocate -l $SWAP_SIZE /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# Install Docker and Docker Compose
${generateDockerInstallation()}
# Clone the Git repository
if [ -d "$APP_DIR" ]; then
  echo "Directory $APP_DIR already exists. Pulling latest changes..."
  cd $APP_DIR && git pull
else
  echo "Cloning repository from $REPO_URL..."
  git clone $REPO_URL $APP_DIR
  cd $APP_DIR
fi

${generateEnvFileSetup(config)}

# Install and configure Nginx
${generateNginxSetup(config)}

# Build and run Docker Compose services
cd $APP_DIR
sudo docker-compose up --build -d

echo "Deployment complete. Your application is available at https://$DOMAIN_NAME"
`;

  const deployScriptPath = path.join(projectRoot, "deploy.sh");
  fs.writeFileSync(deployScriptPath, deployScriptContent);
  fs.chmodSync(deployScriptPath, "755"); // Make script executable
}

function generateEnvironmentVariables(config: Config): string {
  let envVars = "";

  // Global env variables
  config.env_variables.forEach(({ key, value }) => {
    if (config.include_sensitive_env_variables) {
      envVars += `${key}="${value}"\n`;
    } else {
      envVars += `${key}="very_secret_value"\n`;
    }
  });

  return envVars;
}

function generateDockerInstallation(): string {
  return `sudo apt install apt-transport-https ca-certificates curl software-properties-common -y
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" -y
sudo apt update
sudo apt install docker-ce -y

sudo curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
sudo ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose

sudo systemctl enable docker
sudo systemctl start docker`;
}

function generateEnvFileSetup(config: Config): string {
  let setup = "";
  let rootEnvVars = [...config.env_variables];

  // Add SvelteKit env variables to root
  const svelteKitContainer = config.containers.find(
    (c) => c.id === "sveltekit"
  );
  if (svelteKitContainer) {
    rootEnvVars = [...rootEnvVars, ...svelteKitContainer.env_variables];
  }

  // Set up root-level .env file
  if (rootEnvVars.length > 0) {
    setup += `\n# Set up root environment variables\n`;
    setup += `cat > "$APP_DIR/.env" << EOL\n`;
    rootEnvVars.forEach(({ key, value }) => {
      if (config.include_sensitive_env_variables) {
        setup += `${key}=${value}\n`;
      } else {
        let v = "very_secret_value";
        if (key === config.api_url_env || key === "ORIGIN") {
          v = value;
        }
        setup += `${key}=${v}\n`;
      }
    });
    setup += "EOL\n";
  }

  // Then set up container-specific .env files
  config.containers.forEach((container) => {
    if (container.id === "sveltekit") {
      return; // Skip SvelteKit as its vars are now in root
    }

    if (container.env_variables.length > 0) {
      const envPath = container.context
        ? `"$APP_DIR/${container.context}/.env"`
        : `"$APP_DIR/.env"`;

      setup += `\n# Set up ${container.name} environment variables\n`;
      setup += `cat > ${envPath} << EOL\n`;
      container.env_variables.forEach(({ key, value }) => {
        if (config.include_sensitive_env_variables) {
          setup += `${key}=${value}\n`;
        } else {
          let v = "very_secret_value";
          if (key === config.api_url_env || key === "ORIGIN") {
            v = value;
          }
          setup += `${key}=${v}\n`;
        }
      });
      setup += "EOL\n";
    }
  });

  return setup;
}

function generateNginxSetup(config: Config): string {
  const nginxConfig = generateNginxConfig(config);

  return `sudo apt install nginx -y

sudo rm -f /etc/nginx/sites-available/$NGINX_CONFIG_NAME
sudo rm -f /etc/nginx/sites-enabled/$NGINX_CONFIG_NAME

sudo systemctl stop nginx

sudo apt install certbot -y
sudo certbot certonly --standalone -d $DOMAIN_NAME --non-interactive --agree-tos -m $EMAIL

sudo wget -q https://raw.githubusercontent.com/certbot/certbot/main/certbot_nginx/certbot_nginx/_internal/tls_configs/options-ssl-nginx.conf -P /etc/letsencrypt/
sudo openssl dhparam -out /etc/letsencrypt/ssl-dhparams.pem 2048

cat > /etc/nginx/sites-available/$NGINX_CONFIG_NAME << EOL
${nginxConfig}
EOL

sudo ln -s /etc/nginx/sites-available/$NGINX_CONFIG_NAME /etc/nginx/sites-enabled/$NGINX_CONFIG_NAME
sudo systemctl restart nginx`;
}

function generateNginxConfig(config: Config): string {
  const locations = config.containers
    .filter((container) => container.proxy)
    .map(
      (container) => `
    location ${container.proxy === "/" ? "/" : `${container.proxy}/`} {
        proxy_pass http://localhost:${container.port};
        proxy_http_version 1.1;
        proxy_set_header Upgrade \\$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \\$host;
        proxy_cache_bypass \\$http_upgrade;
        ${
          container.proxy === "/"
            ? `
        proxy_buffering off;
        proxy_set_header X-Accel-Buffering no;`
            : `
        proxy_set_header X-Real-IP \\$remote_addr;
        proxy_set_header X-Forwarded-For \\$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \\$scheme;`
        }
    }`
    )
    .join("\n");

  return `server {
    listen 80;
    server_name \${DOMAIN_NAME}; 

    # Redirect all HTTP requests to HTTPS
    return 301 https://\\$host\\$request_uri;
}

server {
    listen 443 ssl;
    server_name \${DOMAIN_NAME};

    ssl_certificate /etc/letsencrypt/live/\${DOMAIN_NAME}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/\${DOMAIN_NAME}/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

${locations}
}`;
}
