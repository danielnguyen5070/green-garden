import { LogoMark } from "@/components/layout/header/logo";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { adminCopy } from "@/lib/admin-copy";
import { getSafeAdminRedirect } from "@/lib/auth-cookies";
import { AdminLoginForm } from "./login-form";

type Props = {
  searchParams: Promise<{ redirect?: string }>;
};

export default async function AdminLoginPage({ searchParams }: Props) {
  const params = await searchParams;
  const redirectTo = getSafeAdminRedirect(params.redirect);

  return (
    <main className="flex min-h-dvh flex-1 items-center justify-center bg-background px-4 py-10">
      <Card className="w-full max-w-md py-8 shadow-none [--card-spacing:--spacing(6)]">
        <CardHeader className="justify-items-center px-6 text-center">
          <LogoMark className="size-12" />
          <CardTitle className="font-heading text-xl font-semibold">
            {adminCopy.login.title}
          </CardTitle>
          <CardDescription>{adminCopy.login.description}</CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-2">
          <AdminLoginForm redirectTo={redirectTo} />
        </CardContent>
      </Card>
    </main>
  );
}
