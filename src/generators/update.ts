import * as fs from "fs";
import * as path from "path";
import { Config } from "../types";

export function generateUpdateScript(config: Config, projectRoot: string) {
  const updateScriptContent = `#!/bin/bash

# Script Variables
${config.github.isPrivate ? "GITHUB_TOKEN=very-secret-token" : ""}
REPO_URL="${config.github.isPrivate ? "https://$GITHUB_TOKEN@" : "https://"}${
    config.github.uri
  }.git"
APP_DIR=~${config.location}

# Pull the latest changes from the Git repository
if [ -d "$APP_DIR" ]; then
  echo "Pulling latest changes from the repository..."
  cd $APP_DIR
  git pull origin main
else
  echo "Cloning repository from $REPO_URL..."
  git clone $REPO_URL $APP_DIR
  cd $APP_DIR
fi

# Rebuild the Docker images without using cache
echo "Building Docker containers without cache..."
sudo docker-compose build --no-cache

# Restart the Docker containers after the build
echo "Rebuilding and restarting Docker containers..."
sudo docker-compose down
sudo docker-compose up -d

# Check if Docker Compose started correctly
if ! sudo docker-compose ps | grep "Up"; then
  echo "Docker containers failed to start. Check logs with 'docker-compose logs'."
  exit 1
fi

# Output final message
echo "Update complete. Your application has been redeployed with the latest changes."`;

  const updateScriptPath = path.join(projectRoot, "update.sh");
  fs.writeFileSync(updateScriptPath, updateScriptContent);
  fs.chmodSync(updateScriptPath, "755"); // Make script executable
}
