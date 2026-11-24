"use client";

import { useActionState } from "react";
import { signup } from "@/app/actions";
import { SubmitButton } from "@/components/SubmitButton";
import { FormError } from "@/components/FormError";

export function SignupForm() {
  const [state, action] = useActionState(signup, undefined);
  return (
    <form action={action} className="mt-6 space-y-4">
      <div>
        <label className="label" htmlFor="displayName">Your name</label>
        <input id="displayName" name="displayName" required maxLength={50} autoComplete="name" className="input" defaultValue={state?.values?.displayName} />
      </div>
      <div>
        <label className="label" htmlFor="username">Username</label>
        <input
          id="username"
          name="username"
          required
          pattern="[A-Za-z0-9_]{3,20}"
          title="3–20 letters, numbers or underscores"
          autoComplete="username"
          className="input"
          defaultValue={state?.values?.username}
        />
      </div>
      <div>
        <label className="label" htmlFor="email">Email</label>
        <input id="email" name="email" type="email" required autoComplete="email" className="input" defaultValue={state?.values?.email} />
      </div>
      <div>
        <label className="label" htmlFor="password">Password</label>
        <input id="password" name="password" type="password" required minLength={8} autoComplete="new-password" className="input" />
      </div>
      <FormError error={state?.error} />
      <SubmitButton className="btn-primary w-full py-3" pendingText="Creating account…">Create account</SubmitButton>
    </form>
  );
}
