"use client";

import { FormEvent, useId, useState } from "react";
import { useTranslations } from "next-intl";
import { MailIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Container } from "@/components/layout/container";
import { cn } from "@/lib/utils";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function NewsletterSection({ className }: { className?: string }) {
  const t = useTranslations("home.newsletter");
  const emailId = useId();
  const errorId = useId();
  const successId = useId();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const value = email.trim();

    if (!value || !EMAIL_PATTERN.test(value)) {
      setError(t("invalidEmail"));
      setSubmitted(false);
      return;
    }

    setError(null);
    setSubmitted(true);
    setEmail("");
  }

  return (
    <section
      data-slot="home-newsletter"
      aria-labelledby="home-newsletter-heading"
      className={cn("bg-background pt-6 pb-12 md:pt-8 md:pb-16 lg:pt-20 lg:pb-28", className)}
    >
      <Container>
        <div className="rounded-xl bg-secondary px-6 py-12 text-center md:rounded-2xl md:px-10 md:py-16 lg:px-16 lg:py-20">
          <MailIcon
            aria-hidden="true"
            className="mx-auto size-8 stroke-[1.5] text-primary md:size-9"
          />

          <h2
            id="home-newsletter-heading"
            className="mt-5 font-heading text-h3 font-bold tracking-tight text-foreground md:mt-6 md:text-[clamp(1.85rem,1.6rem+0.8vw,2.35rem)]"
          >
            {t("title")}
          </h2>

          <div className="mx-auto mt-3 w-full max-w-xl md:mt-4">
            <p className="font-sans text-body text-muted-foreground">
              {t("description")}
            </p>

            {submitted ? (
              <p
                id={successId}
                role="status"
                aria-live="polite"
                className="mt-8 font-sans text-body font-medium text-primary"
              >
                {t("success")}
              </p>
            ) : (
              <form className="mt-8" onSubmit={handleSubmit} noValidate>
                <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-start">
                  <div className="min-w-0 w-full sm:flex-1">
                    <label htmlFor={emailId} className="sr-only">
                      {t("emailLabel")}
                    </label>
                    <Input
                      id={emailId}
                      type="email"
                      name="email"
                      autoComplete="email"
                      inputMode="email"
                      value={email}
                      onChange={(event) => {
                        setEmail(event.target.value);
                        if (error) setError(null);
                      }}
                      placeholder={t("emailPlaceholder")}
                      aria-invalid={error ? true : undefined}
                      aria-describedby={error ? errorId : undefined}
                      className="h-11 w-full rounded border-border bg-card px-4 font-sans text-sm shadow-subtle"
                    />
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="h-11 w-full shrink-0 rounded px-6 font-sans text-sm sm:w-[9.5rem]"
                  >
                    {t("subscribe")}
                  </Button>
                </div>

                {error ? (
                  <p
                    id={errorId}
                    role="alert"
                    className="mt-3 font-sans text-small text-destructive"
                  >
                    {error}
                  </p>
                ) : null}
              </form>
            )}

            <p className="mt-5 font-sans text-small text-muted-foreground">
              {t("privacy")}
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}

export { NewsletterSection };
