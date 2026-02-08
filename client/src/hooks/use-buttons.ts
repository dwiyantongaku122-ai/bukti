import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type InsertButton } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useButtons() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const buttonsQuery = useQuery({
    queryKey: [api.buttons.list.path],
    queryFn: async () => {
      const res = await fetch(api.buttons.list.path);
      if (!res.ok) throw new Error("Failed to fetch buttons");
      return res.json();
    },
  });

  const createButtonMutation = useMutation({
    mutationFn: async (data: InsertButton) => {
      const res = await fetch(api.buttons.create.path, {
        method: api.buttons.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create button");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.buttons.list.path] });
      toast({ title: "Tombol ditambahkan" });
    },
    onError: (e: Error) => toast({ variant: "destructive", title: "Error", description: e.message }),
  });

  const updateButtonMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: number } & Partial<InsertButton>) => {
      const url = buildUrl(api.buttons.update.path, { id });
      const res = await fetch(url, {
        method: api.buttons.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update button");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.buttons.list.path] });
      toast({ title: "Tombol diperbarui" });
    },
  });

  const deleteButtonMutation = useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.buttons.delete.path, { id });
      const res = await fetch(url, { method: api.buttons.delete.method });
      if (!res.ok) throw new Error("Failed to delete button");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.buttons.list.path] });
      toast({ title: "Tombol dihapus" });
    },
  });

  return {
    buttons: buttonsQuery.data as import("@shared/schema").SiteButton[] | undefined,
    isLoading: buttonsQuery.isLoading,
    createButton: createButtonMutation.mutate,
    updateButton: updateButtonMutation.mutate,
    deleteButton: deleteButtonMutation.mutate,
  };
}
