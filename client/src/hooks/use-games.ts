import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type InsertGame } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useGames() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const gamesQuery = useQuery({
    queryKey: [api.games.list.path],
    queryFn: async () => {
      const res = await fetch(api.games.list.path);
      if (!res.ok) throw new Error("Failed to fetch games");
      return api.games.list.responses[200].parse(await res.json());
    },
  });

  const createGameMutation = useMutation({
    mutationFn: async (data: InsertGame) => {
      const res = await fetch(api.games.create.path, {
        method: api.games.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create game");
      return api.games.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.games.list.path] });
      toast({ title: "Game created" });
    },
    onError: (e: Error) => toast({ variant: "destructive", title: "Error", description: e.message }),
  });

  const updateGameMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: number } & Partial<InsertGame>) => {
      const url = buildUrl(api.games.update.path, { id });
      const res = await fetch(url, {
        method: api.games.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update game");
      return api.games.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.games.list.path] });
      toast({ title: "Game updated" });
    },
  });

  const deleteGameMutation = useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.games.delete.path, { id });
      const res = await fetch(url, { method: api.games.delete.method });
      if (!res.ok) throw new Error("Failed to delete game");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.games.list.path] });
      toast({ title: "Game deleted" });
    },
  });

  return {
    games: gamesQuery.data,
    isLoading: gamesQuery.isLoading,
    createGame: createGameMutation.mutate,
    updateGame: updateGameMutation.mutate,
    deleteGame: deleteGameMutation.mutate,
  };
}
