import { googleAuthEnabled } from "@/config/server-env";
import { AuthForm } from "@/domains/settings/auth/auth-form";

export default async function SignUpPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return <AuthForm initialMode="sign-up" googleEnabled={googleAuthEnabled} nextPath={next} />;
}
