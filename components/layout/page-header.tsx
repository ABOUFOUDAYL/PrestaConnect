import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PageHeaderProps {
  title: string;
  description: string;
  backHref?: string;
}

export function PageHeader({
  title,
  description,
  backHref = "/",
}: PageHeaderProps) {
  return (
    <div className="border-b border-border bg-muted/30">
      <div className="mx-auto max-w-3xl px-4 py-12 md:px-6 md:py-16">
        <Button
          variant="ghost"
          size="sm"
          className="mb-6 -ml-2"
          render={<Link href={backHref} />}
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Retour
        </Button>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {title}
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
