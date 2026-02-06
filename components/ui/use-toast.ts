// components/ui/use-toast.ts
// Simple toast implementation
export function toast({
  title,
  description,
  variant = "default",
}: {
  title: string;
  description?: string;
  variant?: "default" | "destructive";
}) {
  // In a real app, you'd use a toast library like sonner or react-hot-toast
  console.log(`Toast: ${title} - ${description}`);

  // For now, we'll use browser alert
  if (typeof window !== "undefined") {
    alert(`${title}: ${description || ""}`);
  }
}
