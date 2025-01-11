import { FormSchema } from "@/schemas/form-schema";
import { CodeBlock } from "./code-block";
import Step from "./step";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

export function ManualSteps({ values }: { values: FormSchema | null }) {
  if (!values) return null;

  console.log(values);
  return (
    <ul className="space-y-4">
      <Step step="1" title="Commit your changes">
        <CodeBlock>
          {`git add .
git commit -m "Your commit message"
git push`}
        </CodeBlock>
      </Step>

      <Step
        step="2"
        title="Connect to the server, and create a deploy.sh file."
      >
        <CodeBlock>
          {`mkdir ~/${values.location.split("/")[1]}
cd ~/${values.location.split("/")[1]}
touch deploy.sh`}
        </CodeBlock>
      </Step>

      <Step
        step="3"
        title="Use your preferred editor to edit the deploy.sh file."
      >
        <Tabs className="mt-4" defaultValue="nvim">
          <TabsList>
            <TabsTrigger value="nvim">nvim</TabsTrigger>
            <TabsTrigger value="vim">vim</TabsTrigger>
            <TabsTrigger value="nano">nano</TabsTrigger>
          </TabsList>

          <TabsContent value="nvim">
            <CodeBlock>{`nvim deploy.sh`}</CodeBlock>
          </TabsContent>

          <TabsContent value="vim">
            <CodeBlock>{`vim deploy.sh`}</CodeBlock>
          </TabsContent>

          <TabsContent value="nano">
            <CodeBlock>{`nano deploy.sh`}</CodeBlock>
          </TabsContent>
        </Tabs>
      </Step>

      <Step
        step="4"
        title="Copy paste the content of the deploy.sh file. (it's located in the root of your project)"
        description="If your repository is private, remember to change the GITHUB_TOKEN variable to your GitHub token before running the script."
      ></Step>

      <Step step="5" title="Run the deploy.sh script.">
        <CodeBlock>{`chmod +x deploy.sh
./deploy.sh`}</CodeBlock>
      </Step>

      <Step
        step="6"
        title="Wait for the deployment to finish."
        description="You can also follow the same process to add the update.sh script. Running the script will pull the latest changes from GitHub and deploy them."
      ></Step>
    </ul>
  );
}
