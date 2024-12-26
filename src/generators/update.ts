import * as fs from "fs";
import * as path from "path";
import { Config } from "../types";

export function generateUpdateScript(config: Config, projectRoot: string) {
  const updateScriptContent = `#!/bin/bash
echo "Updating containers..."
docker-compose pull
docker-compose up -d`;

  const updateScriptPath = path.join(projectRoot, "update.sh");
  fs.writeFileSync(updateScriptPath, updateScriptContent);
  fs.chmodSync(updateScriptPath, "755"); // Make script executable
}
