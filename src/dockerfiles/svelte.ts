export function getSveltekitDockerFile(port: number): string {
  return `FROM node:alpine

WORKDIR /app
COPY package.json ./
RUN npm install --force

COPY . .
RUN npm run build

CMD ["node", "build"]

EXPOSE ${port}
  `;
}
