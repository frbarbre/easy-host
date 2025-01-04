import { containers } from "@/utils";
import * as z from "zod";

export const formSchema = z.object({
  containers: z
    .array(
      z.object({
        port: z.string().refine(
          (value) => {
            return !isNaN(parseInt(value));
          },
          { message: "Port must be a number" }
        ),
        name: z.string().min(1, { message: "Name is required" }),
        id: z.enum(containers.map((c) => c.id) as [string, ...string[]]),
        context: z.string().nullable(),
        proxy: z.string().nullable(),
        env_variables: z.array(
          z.object({
            key: z.string().min(1, { message: "Key is required" }),
            value: z.string().min(1, { message: "Value is required" }),
          })
        ),
      })
    )
    .min(1, { message: "At least one container is required" }),
  github: z.object({
    isPrivate: z.boolean(),
    uri: z
      .string()
      .min(1, { message: "GitHub repository URI is required" })
      .refine((value) => /^github\.com\/.+/.test(value), {
        message:
          "Invalid GitHub repository URI - should be in format github.com/user/repo",
      }),
  }),
  env_variables: z.array(
    z.object({
      key: z.string().min(1, { message: "Key is required" }),
      value: z.string().min(1, { message: "Value is required" }),
    })
  ),
  network_name: z.string(),
  domain: z.string().min(1, { message: "Domain is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  api_url_env: z
    .string()
    .min(1, { message: "API URL environment variable key is required" }),
  include_sensitive_env_variables: z.boolean(),
  location: z.string().min(1, { message: "Location is required" }),
  nginx: z.object({
    configName: z.string().min(1, { message: "Nginx config name is required" }),
  }),
});

export type FormSchema = z.infer<typeof formSchema>;

export const defaultFormValues: FormSchema = {
  containers: [],
  network_name: "",
  domain: "",
  email: "",
  api_url_env: "API_URL",
  include_sensitive_env_variables: false,
  location: "",
  github: {
    isPrivate: true,
    uri: "",
  },
  env_variables: [],
  nginx: {
    configName: "",
  },
} as const;
