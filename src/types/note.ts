export type Note = {
  id: string;
  title: string;
  description: string;
  grade: string;
  subject: string;
  filePath: string;
  fileUrl: string;
  uploaderId: string;
  uploaderName: string;
  uploadedAt: string;
  createdAt?: string;
};

export type NoteInput = {
  title: string;
  description: string;
  grade: string;
  subject: string;
};
