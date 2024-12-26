import * as fs from "fs";
import * as path from "path";

export function generateDeployScript(projectRoot: string) {
  const deployScriptContent = `#!/bin/bash
echo "Deploying containers..."
docker-compose down
docker-compose up -d --build`;

  const deployScriptPath = path.join(projectRoot, "deploy.sh");
  fs.writeFileSync(deployScriptPath, deployScriptContent);
  fs.chmodSync(deployScriptPath, "755"); // Make script executable
}
