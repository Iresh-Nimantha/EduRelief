import { CheckCircleIcon } from "lucide-react";
export function PlatformGuarantees() {
  const guarantees = [
    "Guest access for browsing, searching, and downloading",
    "Firebase Auth protected uploads & note management",
    "GitHub repository for tamper-proof file storage",
    "Firestore metadata powering filters & search",
  ];

  return (
    <div className="rounded-3xl border border-emerald-100 bg-emerald-50/30 p-8 text-sm text-emerald-900 backdrop-blur-md shadow-md max-w-md mx-auto md:mx-0">
      <h3 className="text-xl font-semibold mb-4 text-emerald-900">
        Platform Guarantees
      </h3>
      <ul className="space-y-3">
        {guarantees.map((item, index) => (
          <li key={index} className="flex items-start gap-3">
            <CheckCircleIcon className="h-5 w-5 flex-shrink-0 text-emerald-600 mt-1" />
            <span className="text-emerald-900">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
