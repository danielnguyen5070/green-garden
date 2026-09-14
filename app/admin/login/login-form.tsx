"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { adminCopy } from "@/lib/admin-copy";
import {
  loginAdminAction,
  type AdminLoginState,
} from "@/app/admin/login/actions";

type AdminLoginFormProps = {
  redirectTo: string;
};

function AdminLoginForm({ redirectTo }: AdminLoginFormProps) {
  const [state, formAction, pending] = useActionState<
    AdminLoginState,
    FormData
  >(loginAdminAction, null);

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="redirect" value={redirectTo} />

      <div className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email">{adminCopy.login.email}</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="username"
            required
            disabled={pending}
            className="h-11 rounded"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">{adminCopy.login.password}</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            disabled={pending}
            className="h-11 rounded"
          />
        </div>
      </div>

      {state?.error ? (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}

      <Button
        type="submit"
        size="lg"
        className="h-11 w-full rounded"
        disabled={pending}
      >
        {pending ? adminCopy.login.submitting : adminCopy.login.submit}
      </Button>
    </form>
  );
}

export { AdminLoginForm };
