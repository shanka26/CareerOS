"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, KeyRound, LoaderCircle, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type ChangeEventHandler, type FocusEventHandler, type Ref } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/shared/ui/button";

import { authClient } from "./client";
import { getAuthErrorMessage, getUnexpectedAuthErrorMessage } from "./error-message";
import { signInSchema, signUpSchema, type SignInInput, type SignUpInput } from "./schemas";

type Mode = "sign-in" | "sign-up";

function Field({ label, type = "text", autoComplete, error, ...registration }: {
  label: string;
  type?: string;
  autoComplete?: string;
  error?: string | undefined;
  name: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
  onBlur: FocusEventHandler<HTMLInputElement>;
  ref: Ref<HTMLInputElement>;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold">
      {label}
      <input type={type} autoComplete={autoComplete} aria-invalid={Boolean(error)} className="min-h-12 rounded-xl border border-[var(--line)] bg-white/80 px-4 font-normal outline-none transition focus:border-[var(--focus)] focus:ring-2 focus:ring-[color:var(--focus)]/15" {...registration} />
      {error ? <span className="text-xs font-medium text-red-700">{error}</span> : null}
    </label>
  );
}

export function AuthForm({ initialMode, googleEnabled, nextPath }: { initialMode: Mode; googleEnabled: boolean; nextPath?: string | undefined }) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [serverError, setServerError] = useState<string>();
  const [googlePending, setGooglePending] = useState(false);
  const router = useRouter();
  const callbackURL = nextPath?.startsWith("/") ? nextPath : "/dashboard";

  const signInForm = useForm<SignInInput>({ resolver: zodResolver(signInSchema), defaultValues: { email: "", password: "" } });
  const signUpForm = useForm<SignUpInput>({ resolver: zodResolver(signUpSchema), defaultValues: { name: "", email: "", password: "", confirmPassword: "" } });

  const switchMode = (nextMode: Mode) => {
    setMode(nextMode);
    setServerError(undefined);
    router.replace(nextMode === "sign-in" ? "/sign-in" : "/sign-up");
  };

  const onSignIn = signInForm.handleSubmit(async (values) => {
    setServerError(undefined);
    try {
      const result = await authClient.signIn.email({ ...values, callbackURL });
      if (result.error) return setServerError(getAuthErrorMessage("sign-in", result.error));
      router.push(callbackURL);
      router.refresh();
    } catch (error) {
      setServerError(getUnexpectedAuthErrorMessage("sign-in", error));
    }
  });

  const onSignUp = signUpForm.handleSubmit(async (values) => {
    setServerError(undefined);
    try {
      const result = await authClient.signUp.email({ name: values.name, email: values.email, password: values.password, callbackURL });
      if (result.error) return setServerError(getAuthErrorMessage("sign-up", result.error));
      router.push(callbackURL);
      router.refresh();
    } catch (error) {
      setServerError(getUnexpectedAuthErrorMessage("sign-up", error));
    }
  });

  const continueWithGoogle = async () => {
    setGooglePending(true);
    setServerError(undefined);
    try {
      const result = await authClient.signIn.social({ provider: "google", callbackURL });
      if (!result?.error) return;
      setServerError(getAuthErrorMessage("google", result.error));
      setGooglePending(false);
    } catch (error) {
      setServerError(getUnexpectedAuthErrorMessage("google", error));
      setGooglePending(false);
    }
  };

  const pending = signInForm.formState.isSubmitting || signUpForm.formState.isSubmitting;

  return (
    <div>
      <div className="mb-7 grid grid-cols-2 rounded-xl bg-[var(--paper)] p-1" role="tablist" aria-label="Authentication mode">
        {(["sign-in", "sign-up"] as const).map((item) => (
          <button key={item} type="button" role="tab" aria-selected={mode === item} onClick={() => switchMode(item)} className={`rounded-lg px-3 py-2.5 text-sm font-bold transition ${mode === item ? "bg-white shadow-sm" : "text-[var(--muted)]"}`}>
            {item === "sign-in" ? "Sign in" : "Create account"}
          </button>
        ))}
      </div>

      <div className="mb-7">
        <h1 className="font-[family-name:var(--font-display)] text-4xl tracking-[-.035em]">{mode === "sign-in" ? "Welcome back." : "Start with your story."}</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{mode === "sign-in" ? "Return to the career knowledge you've built." : "Create an account, then upload the resume you already have."}</p>
      </div>

      {googleEnabled ? (
        <Button type="button" variant="secondary" className="w-full" onClick={continueWithGoogle} disabled={googlePending || pending}>
          {googlePending ? <LoaderCircle className="mr-2 size-4 animate-spin" /> : <KeyRound className="mr-2 size-4" />} Continue with Google
        </Button>
      ) : (
        <div className="flex items-start gap-2 rounded-xl border border-dashed border-[var(--line)] bg-[var(--paper)]/60 p-3 text-xs leading-5 text-[var(--muted)]"><ShieldCheck className="mt-0.5 size-4 shrink-0" aria-hidden="true" />Google sign-in becomes available when both OAuth credentials are configured.</div>
      )}

      <div className="my-6 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[.18em] text-[var(--muted)] before:h-px before:flex-1 before:bg-[var(--line)] after:h-px after:flex-1 after:bg-[var(--line)]">or use email</div>
      {serverError ? <div role="alert" aria-live="assertive" className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-800">{serverError}</div> : null}

      {mode === "sign-in" ? (
        <form className="grid gap-4" onSubmit={onSignIn} noValidate>
          <Field label="Email" type="email" autoComplete="email" error={signInForm.formState.errors.email?.message} {...signInForm.register("email")} />
          <Field label="Password" type="password" autoComplete="current-password" error={signInForm.formState.errors.password?.message} {...signInForm.register("password")} />
          <Button type="submit" className="mt-2 w-full" disabled={pending}>{pending ? <LoaderCircle className="mr-2 size-4 animate-spin" /> : null}Sign in <ArrowRight className="ml-2 size-4" /></Button>
        </form>
      ) : (
        <form className="grid gap-4" onSubmit={onSignUp} noValidate>
          <Field label="Name" autoComplete="name" error={signUpForm.formState.errors.name?.message} {...signUpForm.register("name")} />
          <Field label="Email" type="email" autoComplete="email" error={signUpForm.formState.errors.email?.message} {...signUpForm.register("email")} />
          <Field label="Password" type="password" autoComplete="new-password" error={signUpForm.formState.errors.password?.message} {...signUpForm.register("password")} />
          <Field label="Confirm password" type="password" autoComplete="new-password" error={signUpForm.formState.errors.confirmPassword?.message} {...signUpForm.register("confirmPassword")} />
          <Button type="submit" className="mt-2 w-full" disabled={pending}>{pending ? <LoaderCircle className="mr-2 size-4 animate-spin" /> : null}Create account <ArrowRight className="ml-2 size-4" /></Button>
        </form>
      )}
    </div>
  );
}
