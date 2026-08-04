type AuthOriginEnvironment = {
  BETTER_AUTH_URL?: string | undefined;
  NODE_ENV?: "development" | "test" | "production" | undefined;
  VERCEL?: string | undefined;
  VERCEL_URL?: string | undefined;
  VERCEL_BRANCH_URL?: string | undefined;
  VERCEL_PROJECT_PRODUCTION_URL?: string | undefined;
};

const localOrigin = "http://localhost:3000";

function toVercelOrigin(host?: string): string | undefined {
  if (!host) return undefined;

  try {
    const url = new URL(`https://${host}`);
    if (url.protocol !== "https:" || url.username || url.password || url.pathname !== "/") return undefined;
    return url.origin;
  } catch {
    return undefined;
  }
}

function isLocalOrigin(origin?: string): boolean {
  if (!origin) return false;

  try {
    const hostname = new URL(origin).hostname;
    return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]";
  } catch {
    return false;
  }
}

export function getAuthOriginConfig(environment: AuthOriginEnvironment): { baseURL: string; trustedOrigins: string[] } {
  const deploymentOrigin = toVercelOrigin(environment.VERCEL_URL);
  const branchOrigin = toVercelOrigin(environment.VERCEL_BRANCH_URL);
  const productionOrigin = toVercelOrigin(environment.VERCEL_PROJECT_PRODUCTION_URL);
  const isVercel = environment.VERCEL === "1" || Boolean(deploymentOrigin);

  const explicitOrigin = environment.BETTER_AUTH_URL;
  const baseURL = isVercel && isLocalOrigin(explicitOrigin)
    ? deploymentOrigin ?? productionOrigin ?? explicitOrigin ?? localOrigin
    : explicitOrigin ?? deploymentOrigin ?? productionOrigin ?? localOrigin;

  const trustedOrigins = [baseURL, deploymentOrigin, branchOrigin, productionOrigin];
  if (environment.NODE_ENV !== "production") trustedOrigins.push(localOrigin);

  return { baseURL, trustedOrigins: [...new Set(trustedOrigins.filter((origin): origin is string => Boolean(origin)))] };
}
