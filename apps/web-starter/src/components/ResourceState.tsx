import { AlertCircle, RefreshCcw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
export function ResourceError({ title, error, retry, className }: { title: string; error: unknown; retry?: () => void; className?: string }) {
  return <Alert variant="destructive" className={className}><AlertCircle /><AlertTitle>{title}</AlertTitle><AlertDescription className="flex flex-wrap items-center justify-between gap-3"><span>{error instanceof Error ? error.message : "An unexpected error occurred."}</span>{retry && <Button type="button" size="sm" variant="outline" onClick={retry}><RefreshCcw className="size-3.5" />Retry</Button>}</AlertDescription></Alert>;
}
export function EmptyState({ title, description, retry }: { title: string; description: string; retry?: () => void }) {
  return <div className="flex min-h-48 flex-col items-center justify-center rounded-xl border px-6 text-center"><h2 className="text-base font-medium">{title}</h2><p className="mt-2 max-w-md text-sm text-muted-foreground">{description}</p>{retry && <Button size="sm" variant="outline" className="mt-4" onClick={retry}><RefreshCcw className="size-3.5" />Retry</Button>}</div>;
}
