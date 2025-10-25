// src/tools/agent/generate-signature.ts
import { z } from "zod";
import { Context, Tool } from "hedera-agent-kit";
import { Client } from "@hashgraph/sdk";

/**
 * Generate a random string of specified length
 * @param length The length of the random string to generate
 * @returns Random string containing alphanumeric characters
 */
export function generateChallengExecute(length: number): string {
  if (!length || length <= 0) {
    throw new Error("length is required and must be greater than 0");
  }

  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    result += chars[randomIndex];
  }
  return result;
}

/* Zod schema for parameters */
export const generateChallengExecuteParameters = (context: Context = {}) =>
  z.object({
    length: z
      .number()
      .int()
      .positive()
      .describe("Length of the random string to generate"),
  });

const generateChallengExecutePrompt = (context: Context = {}) => `
Generates a random string of specified length using alphanumeric characters.

Parameters:
- length: Length of the random string to generate (must be positive integer)

Returns: Random string containing uppercase letters, lowercase letters, and digits
`;

const generateChallengExecuteExecute = async (
  client: Client,
  context: Context,
  params: z.infer<ReturnType<typeof generateChallengExecuteParameters>>
) => {
  try {
    const { length } = params;
    const signature = generateChallengExecute(length);
    return { success: true, signature };
  } catch (err: any) {
    return { success: false, error: err.message || String(err) };
  }
};

export const GENERATE_CHALLENGE_TOOL = "generate_random_challenge";

const tool = (context: Context): Tool => ({
  method: GENERATE_CHALLENGE_TOOL,
  name: "Generate Random Challenge",
  description: generateChallengExecutePrompt(context),
  parameters: generateChallengExecuteParameters(context) as any,
  execute: generateChallengExecuteExecute,
});

export default tool;