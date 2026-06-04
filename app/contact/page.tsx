"use client";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function ContactPage() {
  const { toast } = useToast();

  return (
    <>
      <PageHeader
        title="Contact"
        description="Une question ? Notre équipe basée à Cotonou vous répond."
      />
      <div className="mx-auto max-w-md px-4 py-8 md:px-6">
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            toast({
              title: "Message envoyé",
              description: "Nous vous répondrons sous 24h.",
            });
          }}
        >
          <div>
            <label htmlFor="name" className="mb-1.5 block text-sm font-medium">
              Nom complet
            </label>
            <input
              id="name"
              type="text"
              className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              required
            />
          </div>
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
              Email ou WhatsApp
            </label>
            <input
              id="email"
              type="text"
              placeholder="+229 ou email@exemple.com"
              className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              required
            />
          </div>
          <div>
            <label htmlFor="message" className="mb-1.5 block text-sm font-medium">
              Message
            </label>
            <textarea
              id="message"
              rows={4}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              required
            />
          </div>
          <Button type="submit" className="h-11 w-full">
            Envoyer
          </Button>
        </form>
      </div>
    </>
  );
}
