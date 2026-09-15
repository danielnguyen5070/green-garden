"use client";

import { useState, type SubmitEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login } from "@/lib/api/auth";
import { ApiError, getErrorMessage } from "@/lib/api/errors";
import { adminCopy } from "@/lib/admin-copy";
import { toast } from "@/lib/toast";

type AdminLoginFormProps = {
  redirectTo: string;
};

function AdminLoginForm({ redirectTo }: AdminLoginFormProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    if (!email || !password) {
      toast.error(adminCopy.login.error);
      return;
    }

    setPending(true);
    try {
      await login(email, password);
      router.replace(redirectTo);
      router.refresh();
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        toast.error(adminCopy.login.error);
      } else if (err instanceof ApiError && err.status === 422) {
        toast.error(getErrorMessage(err, adminCopy.login.validationError));
      } else {
        toast.error(getErrorMessage(err, adminCopy.login.networkError));
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
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
