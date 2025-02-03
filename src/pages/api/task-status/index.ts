import { Database, Tables } from "@/types/schema";
import { authMiddleware } from "@/utils/verifyJWT";
import { createClient } from "@supabase/supabase-js";
import type { NextApiRequest, NextApiResponse } from "next";

const serviveRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabase = createClient<Database>(supabaseUrl!, serviveRoleKey!);

async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case "POST": {
      // CREATE / UPSERT TASK STATUS
      const { id, company_id, task_id, status }: Tables<"TASK_STATUS"> =
        req.body;

      const { data, error } = await supabase
        .from("TASK_STATUS")
        .upsert({
          id,
          company_id,
          task_id,
          status,
        })
        .select();

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      return res.status(201).json({ data: data[0] });
    }

    case "PUT": {
      // UPDATE TASK STATUS
      const { id, status }: Tables<"TASK_STATUS"> = req.body;

      if (!id) {
        return res.status(400).json({ error: "id is required" });
      }

      const { data, error } = await supabase
        .from("TASK_STATUS")
        .update({
          status,
        })
        .eq("id", id)
        .select();

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      return res.status(200).json({ data: data[0] });
    }

    case "GET": {
      const { company_id, task_id } = req.query;

      if (!company_id && !task_id) {
        return res
          .status(400)
          .json({ error: "company_id or task_id is required" });
      }

      if (company_id && Array.isArray(company_id)) {
        return res.status(400).json({ error: "company_id must be a string" });
      }

      if (task_id && Array.isArray(task_id)) {
        return res.status(400).json({ error: "task_id must be a string" });
      }

      let query = supabase.from("TASK_STATUS").select();

      if (company_id) {
        query = query.eq("company_id", company_id as string);
      }

      if (task_id) {
        query = query.eq("task_id", task_id as string);
      }

      const { data, error } = await query;

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      return res.status(200).json({ data });
    }

    case "DELETE": {
      const { id, company_id, task_id } = req.query;

      if (id && !Array.isArray(id)) {
        const { error } = await supabase
          .from("TASK_STATUS")
          .delete()
          .eq("id", id);

        if (error) {
          return res.status(400).json({ error: error.message });
        }

        return res
          .status(200)
          .json({ message: "Task status deleted successfully" });
      }

      if (
        !company_id ||
        !task_id ||
        Array.isArray(company_id) ||
        Array.isArray(task_id)
      ) {
        return res.status(400).json({
          error:
            "Either id or both company_id and task_id (as strings) are required",
        });
      }

      const { error } = await supabase
        .from("TASK_STATUS")
        .delete()
        .eq("company_id", company_id)
        .eq("task_id", task_id);

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      return res
        .status(200)
        .json({ message: "Task status deleted successfully" });
    }

    default:
      return res.status(405).json({ error: "Method not allowed" });
  }
}

export default authMiddleware(handler);
