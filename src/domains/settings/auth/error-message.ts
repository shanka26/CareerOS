export type AuthAction = "sign-in" | "sign-up" | "google";

type AuthError = {
  code?: string | undefined;
  message?: string | undefined;
  status?: number | undefined;
  statusText?: string | undefined;
};

const messagesByCode: Record<string, string> = {
  INVALID_EMAIL_OR_PASSWORD: "The email or password is incorrect. Check both fields and try again.",
  INVALID_PASSWORD: "The password is incorrect. Check it and try again.",
  USER_NOT_FOUND: "The email or password is incorrect. Check both fields and try again.",
  CREDENTIAL_ACCOUNT_NOT_FOUND: "This account does not have a password. Use the sign-in method you originally chose.",
  EMAIL_NOT_VERIFIED: "Verify your email address before signing in, then try again.",
  USER_ALREADY_EXISTS: "An account already exists for this email. Sign in instead or use a different email.",
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: "An account already exists for this email. Sign in instead or use a different email.",
  PASSWORD_TOO_SHORT: "Your password is too short. Use at least 10 characters.",
  PASSWORD_TOO_LONG: "Your password is too long. Use no more than 128 characters.",
  INVALID_EMAIL: "Enter a valid email address.",
  INVALID_ORIGIN: "This sign-in page is not authorized for the current web address. Check the app URL configuration.",
  INVALID_CALLBACK_URL: "The destination after authentication is invalid. Return to the sign-in page and try again.",
  INVALID_REDIRECT_URL: "The destination after authentication is invalid. Return to the sign-in page and try again.",
  CROSS_SITE_NAVIGATION_LOGIN_BLOCKED: "The sign-in request was blocked for security. Reload this page and try again.",
  PROVIDER_NOT_FOUND: "Google sign-in is not configured for this app. Use email and password instead.",
  SOCIAL_ACCOUNT_ALREADY_LINKED: "This Google account is already linked to another CareerOS account.",
  FAILED_TO_CREATE_USER: "CareerOS could not create your account. No account was created; try again in a moment.",
  FAILED_TO_CREATE_SESSION: "Your account was accepted, but CareerOS could not start a session. Try signing in again.",
};

function normalizedCode(error: AuthError) {
  return error.code?.trim().toUpperCase().replaceAll("-", "_").replaceAll(" ", "_");
}

export function getAuthErrorMessage(action: AuthAction, error?: AuthError | null): string {
  const code = error ? normalizedCode(error) : undefined;
  if (code && messagesByCode[code]) return messagesByCode[code];

  if (error?.status === 429 || code === "TOO_MANY_REQUESTS") {
    return "Too many attempts were made. Wait one minute, then try again.";
  }

  if (error?.status && error.status >= 500) {
    return action === "sign-up"
      ? "CareerOS could not reach the account service. No account was created; try again in a moment."
      : "CareerOS could not reach the account service. Try again in a moment.";
  }

  if (action === "google") return "Google sign-in could not start. Check your connection and try again.";
  if (action === "sign-up") return "CareerOS could not create your account. Check your details and try again.";
  return "CareerOS could not sign you in. Check your details and try again.";
}

export function getUnexpectedAuthErrorMessage(action: AuthAction, error: unknown): string {
  if (error instanceof TypeError || (error instanceof Error && /fetch|network|connection/i.test(error.message))) {
    return "CareerOS could not connect to the account service. Check your connection and try again.";
  }

  return getAuthErrorMessage(action);
}
