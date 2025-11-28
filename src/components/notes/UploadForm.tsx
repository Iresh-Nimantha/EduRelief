"use client";

import { ReactNode, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { noteSchema, NoteSchema } from "@/lib/validation";
import { useAuth } from "../providers/AuthProvider";

const gradeOptions = [
  { value: "01", label: "Grade 01" },
  { value: "02", label: "Grade 02" },
  { value: "03", label: "Grade 03" },
  { value: "04", label: "Grade 04" },
  { value: "05", label: "Grade 05" },
  { value: "06", label: "Grade 06" },
  { value: "07", label: "Grade 07" },
  { value: "08", label: "Grade 08" },
  { value: "09", label: "Grade 09" },
  { value: "10", label: "Grade 10" },
  { value: "11", label: "Grade 11 (OL)" },
  { value: "AL-Science", label: "A/L Science" },
  { value: "AL-Commerce", label: "A/L Commerce" },
  { value: "AL-Arts", label: "A/L Arts" },
  { value: "AL-Technology", label: "A/L Technology" },
  { value: "University", label: "University" },
];

const subjectOptions = [
  // Core Subjects (All Grades)
  "Maths",
  "Science",
  "English",
  "Sinhala",
  "Tamil", // O/L Specific Subjects

  "ICT",
  "History",
  "Geography",
  "Religion (Buddhism)",
  "Religion (Christianity)",
  "Religion (Islam)",
  "Religion (Hinduism)",
  "Business & Accounting Studies",
  "Commerce",
  "Economics",
  "Health Science",
  "Beauty Care & Hair Beauty",
  "Food Technology", // A/L Science Stream

  "Biology",
  "Chemistry",
  "Physics",
  "Combined Mathematics",
  "Higher Mathematics", // A/L Commerce Stream

  "Accounting",
  "Business Studies",
  "Economics",
  "Logic & Scientific Method", // A/L Arts Stream

  "Political Science",
  "Geography",
  "History",
  "Communication & Media Studies",
  "Logic & Scientific Method",
  "Sinhala & Literature",
  "Tamil & Literature",
  "English Literature",
  "Drama & Theatre",
  "Dancing",
  "Music",
  "Art",
  "Entrepreneurship", // A/L Technology Stream

  "Civil Technology",
  "Electrical Technology",
  "Mechanical Technology",
  "Bio-system Technology",
  "Science for Technology", // Additional Subjects

  "Agriculture",
  "Aquatic Resources & Fishing Technology",
];

const formSchema = noteSchema.extend({
  file: z
    .any()
    .refine((files) => files?.length === 1, "Please attach one file."),
});

type FormValues = NoteSchema & { file: FileList };

export function UploadForm() {
  const { user, login, getToken } = useAuth();
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  const fieldErrors = useMemo(() => {
    const fileMessage =
      typeof errors.file?.message === "string"
        ? errors.file.message
        : undefined;
    return {
      title: errors.title?.message,
      description: errors.description?.message,
      grade: errors.grade?.message,
      subject: errors.subject?.message,
      file: fileMessage,
    };
  }, [errors]);

  const onSubmit = async (values: FormValues) => {
    if (!user) {
      await login();
      return;
    }

    const file = values.file?.item(0);
    if (!file) {
      setMessage("Please attach a file before uploading.");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const token = await getToken();
      if (!token) {
        throw new Error("Unable to verify your session. Please log in again.");
      }

      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("description", values.description);
      formData.append("grade", values.grade);
      formData.append("subject", values.subject);
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error ?? "Upload failed");
      }

      setStatus("success");
      setMessage("Note uploaded successfully!");
      reset();
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Upload failed");
    }
  };

  return (
    <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-lg">
      {!user && (
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Please log in to upload new study materials.
        </div>
      )}

      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
        <Field label="Title" error={fieldErrors.title}>
          <input
            type="text"
            placeholder="e.g. Advanced Newton Laws Notes"
            className="w-full rounded-2xl border border-zinc-200 px-4 py-3 focus:border-emerald-500 focus:outline-none"
            {...register("title")}
          />
        </Field>

        <Field label="Description" error={fieldErrors.description}>
          <textarea
            rows={4}
            placeholder="Tell students what this resource covers..."
            className="w-full rounded-2xl border border-zinc-200 px-4 py-3 focus:border-emerald-500 focus:outline-none"
            {...register("description")}
          />
        </Field>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Grade" error={fieldErrors.grade}>
            <select
              className="w-full rounded-2xl border border-zinc-200 px-4 py-3 focus:border-emerald-500 focus:outline-none"
              {...register("grade")}
            >
              <option value="">Select grade</option>
              {gradeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Subject" error={fieldErrors.subject}>
            <select
              className="w-full rounded-2xl border border-zinc-200 px-4 py-3 focus:border-emerald-500 focus:outline-none"
              {...register("subject")}
            >
              <option value="">Select subject</option>
              {subjectOptions.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Upload file" error={fieldErrors.file}>
          <input
            type="file"
            accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.png"
            className="w-full rounded-2xl border border-dashed border-zinc-300 px-4 py-8 text-sm text-zinc-500 file:mr-4 file:rounded-full file:border-0 file:bg-emerald-50 file:px-4 file:py-2 file:text-emerald-700"
            {...register("file")}
          />
        </Field>

        <button
          type="submit"
          disabled={!user || status === "loading"}
          className="w-full rounded-full bg-emerald-600 py-3 text-center text-sm font-semibold uppercase tracking-wide text-white hover:bg-emerald-500 disabled:opacity-50"
        >
          {status === "loading" ? "Uploading..." : "Upload note"}
        </button>

        {message && (
          <p
            className={`text-center text-sm ${
              status === "error" ? "text-red-500" : "text-emerald-600"
            }`}
          >
            {message}
          </p>
        )}
      </form>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="block space-y-2 text-sm font-medium text-zinc-700">
      <span>{label}</span>
      {children}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </label>
  );
}
