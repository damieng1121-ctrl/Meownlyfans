"use client";

import { useActionState } from "react";
import { login } from "@/app/actions";
import { SubmitButton } from "@/components/SubmitButton";
import { FormError } from "@/components/FormError";

export function LoginForm({ next }: { next: string }) {
  const [state, action] = useActionState(login, undefined);
  return (
    <form action={action} className="mt-6 space-y-4">
      <input type="hidden" name="next" value={next} />
      <div>
        <label className="label" htmlFor="login">Email or username</label>
        <input id="login" name="login" required autoComplete="username" className="input" defaultValue={state?.values?.login} />
      </div>
      <div>
        <label className="label" htmlFor="password">Password</label>
        <input id="password" name="password" type="password" required autoComplete="current-password" className="input" />
      </div>
      <FormError error={state?.error} />
      <SubmitButton className="btn-primary w-full py-3" pendingText="Logging in…">Log in</SubmitButton>
    </form>
  );
}
