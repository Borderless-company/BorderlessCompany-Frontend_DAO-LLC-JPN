import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Tables } from "@/types/schema";

export type CreateTaskProps = Partial<Tables<"TASK">>;

export const useTask = (id?: string) => {
  const queryClient = useQueryClient();

  const { mutateAsync: createTask } = useMutation<
    Tables<"TASK">,
    Error,
    CreateTaskProps
  >({
    mutationFn: async (props: CreateTaskProps) => {
      const response = await fetch("/api/task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(props),
      });
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error);
      }
      console.log("[SUCCESS] Task created: ", json.data);
      return json.data;
    },
    onError: (error) => {
      console.error("[ERROR] Failed to create task: ", error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task", id] });
    },
  });

  const { data: task } = useQuery<Tables<"TASK"> | undefined, Error>({
    queryKey: ["task", id],
    queryFn: async () => {
      if (!id) return undefined;
      const response = await fetch(`/api/task?id=${id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error);
      }
      return json.data;
    },
  });

  return { createTask, task };
};
