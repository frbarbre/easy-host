import * as fs from "fs";
import * as path from "path";

export function updateNextConfig(containerPath: string) {
  // Find existing Next.js config file
  const possibleConfigFiles = [
    "next.config.js",
    "next.config.mjs",
    "next.config.ts",
  ];

  const configFile = possibleConfigFiles.find((file) =>
    fs.existsSync(path.join(containerPath, file))
  );

  if (configFile) {
    // Read existing config
    const configPath = path.join(containerPath, configFile);
    const existingConfig = fs.readFileSync(configPath, "utf-8");

    if (!existingConfig.includes('output: "standalone"')) {
      let updatedConfig;

      if (configFile.endsWith(".ts")) {
        // Handle TypeScript config
        if (!existingConfig.includes("nextConfig:")) {
          updatedConfig = `import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
};

export default nextConfig;`;
        } else {
          updatedConfig = existingConfig.replace(
            /const\s+nextConfig\s*:\s*NextConfig\s*=\s*{/,
            'const nextConfig: NextConfig = {\n  output: "standalone",'
          );
        }
      } else {
        // Handle JS/MJS config
        if (!existingConfig.includes("nextConfig")) {
          updatedConfig = `/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
};

export default nextConfig;`;
        } else {
          // Preserve existing config while adding standalone output
          const configMatch = existingConfig.match(
            /const\s+nextConfig\s*=\s*({[\s\S]*?});/
          );
          if (configMatch) {
            const existingObject = configMatch[1];
            // Add output: "standalone" to the beginning of the config object
            const updatedObject = existingObject.replace(
              /{/,
              '{\n  output: "standalone",'
            );
            updatedConfig = existingConfig.replace(
              /const\s+nextConfig\s*=\s*{[\s\S]*?};/,
              `const nextConfig = ${updatedObject};`
            );
          }
        }
      }

      fs.writeFileSync(configPath, updatedConfig || "");
    }
  } else {
    // Create new config file
    const configPath = path.join(containerPath, "next.config.js");
    const newConfig = `/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
};

export default nextConfig;`;
    fs.writeFileSync(configPath, newConfig);
  }
}
