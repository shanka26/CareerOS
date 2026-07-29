import { z } from "zod";

export const explainedClaimSchema = z.object({ text: z.string().min(1), factIds: z.array(z.string().min(1)).min(1), explanation: z.string().min(1) });

export function assertGroundedClaims(claims: Array<z.infer<typeof explainedClaimSchema>>, allowedFactIds: ReadonlySet<string>) {
  for (const claim of claims) for (const factId of claim.factIds) if (!allowedFactIds.has(factId)) throw new Error(`AI output cited an unverified or unknown fact: ${factId}`);
  return claims;
}
