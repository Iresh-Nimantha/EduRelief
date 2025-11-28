import { z } from "zod";

export const noteSchema = z.object({
  title: z.string().min(3).max(120),
  description: z.string().min(10).max(500),
  grade: z.string().min(1),
  subject: z.string().min(1),
});

export type NoteSchema = z.infer<typeof noteSchema>;

