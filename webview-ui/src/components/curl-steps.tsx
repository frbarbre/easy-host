import { CodeBlock } from "./code-block";
import Step from "./step";
import { FormSchema } from "@/schemas/form-schema";

export function CurlSteps({ values }: { values: FormSchema | null }) {
  if (!values) return null;

  function convertGithubUriToRaw(uri: string) {
    return uri.replace("github.com", "raw.githubusercontent.com");
  }

  function generateCurlCommand(values: FormSchema) {
    if (values.github.isPrivate) {
      return `curl -H "Authorization: token your-github-token" -o ~/${
        values.location.split("/")[1]
      }/deploy.sh ${convertGithubUriToRaw(values.github.uri)}/main/deploy.sh`;
    }

    return `curl -o ~/${
      values.location.split("/")[1]
    }/deploy.sh ${convertGithubUriToRaw(values.github.uri)}/main/deploy.sh`;
  }

  return (
    <ul className="space-y-4">
      <Step step="1" title="Commit your changes">
        <CodeBlock>
          {`git add .
git commit -m "Your commit message"
git push`}
        </CodeBlock>
      </Step>

      <Step step="2" title="Connect to the server, curl the deploy.sh file">
        <CodeBlock>{generateCurlCommand(values)}</CodeBlock>
      </Step>

      <Step
        step="3"
        title="Open the deploy.sh file and replace the placeholder .env variables, with your own values"
        description="If your GitHub repository is private, you will need to add your GitHub token to the GITHUB_TOKEN variable in the deploy.sh file."
      >
        <CodeBlock>{`cd ~/${values.location.split("/")[1]}
vim deploy.sh`}</CodeBlock>
      </Step>

      <Step step="4" title="Run the deploy.sh file">
        <CodeBlock>
          {`cd ~/${values.location.split("/")[1]}
chmod +x deploy.sh
./deploy.sh`}
        </CodeBlock>
      </Step>

      <Step
        step="5"
        title="Wait for the deployment to finish."
        description="You can also follow the same process to add the update.sh script. Running the script will pull the latest changes from GitHub and deploy them."
      ></Step>
    </ul>
  );
}
