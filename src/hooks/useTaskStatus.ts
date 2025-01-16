import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Tables } from "@/types/schema";
import { supabase } from "@/utils/supabase";

export type UpdateTaskStatusProps = Partial<Tables<"TASK_STATUS">>;

export const useTaskStatus = (id?: string) => {
  const queryClient = useQueryClient();

  const { mutateAsync: createTaskStatus } = useMutation<
    Tables<"TASK_STATUS">,
    Error,
    Partial<Tables<"TASK_STATUS">>
  >({
    mutationFn: async (props: Partial<Tables<"TASK_STATUS">>) => {
      const response = await fetch("/api/task-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(props),
      });
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error);
      }
      console.log("[SUCCESS] Task status created: ", json.data);
      return json.data;
    },
    onError: (error) => {
      console.error("[ERROR] Failed to create task status: ", error);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["taskStatus", data.id] });
    },
  });

  const { mutateAsync: updateTaskStatus } = useMutation<
    Tables<"TASK_STATUS">,
    Error,
    UpdateTaskStatusProps
  >({
    mutationFn: async (props: UpdateTaskStatusProps) => {
      const response = await fetch("/api/task-status", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(props),
      });
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error);
      }
      console.log("[SUCCESS] Task status updated: ", json.data);
      return json.data;
    },
    onError: (error) => {
      console.error("[ERROR] Failed to update task status: ", error);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["taskStatus", "company", data.company_id],
      });
    },
  });

  const { mutateAsync: updateTaskStatusByIds } = useMutation<
    Tables<"TASK_STATUS">,
    Error,
    {
      company_id: string;
      task_id: string;
      status: Tables<"TASK_STATUS">["status"];
    }
  >({
    mutationFn: async ({ company_id, task_id, status }) => {
      const statusResponse = await fetch(
        `/api/task-status?company_id=${company_id}&task_id=${task_id}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );
      const statusJson = await statusResponse.json();
      if (!statusResponse.ok) {
        throw new Error(statusJson.error);
      }
      const existingStatus = statusJson.data[0];

      if (!existingStatus) {
        throw new Error("Task status not found");
      }

      const response = await fetch("/api/task-status", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: existingStatus.id,
          status,
        }),
      });

      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error);
      }
      return json.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["taskStatus", "company", variables.company_id],
      });
    },
  });

  return {
    createTaskStatus,
    updateTaskStatus,
    updateTaskStatusByIds,
  };
};

export const useTaskStatusByCompany = (companyId: string) =>
  useQuery<Tables<"TASK_STATUS">[] | undefined, Error>({
    queryKey: ["taskStatus", "company", companyId],
    queryFn: async () => {
      const response = await fetch(`/api/task-status?company_id=${companyId}`, {
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

export const useTaskStatusByTask = (taskId: string) =>
  useQuery<Tables<"TASK_STATUS">[] | undefined, Error>({
    queryKey: ["taskStatus", "task", taskId],
    queryFn: async () => {
      const response = await fetch(`/api/task-status?task_id=${taskId}`, {
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
