// components/ui/use-toast.ts
export function toast({
  title,
  description,
  variant = "default",
}: {
  title: string;
  description?: string;
  variant?: "default" | "destructive";
}) {
  console.log(`Toast: ${title} - ${description}`);

  if (typeof window !== "undefined") {
    alert(`${title}: ${description || ""}`);
  }
}
