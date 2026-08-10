import { useState } from "react";
import { Flag } from "lucide-react";
import api from "../api.js";

export default function ReportButton({ recipeId }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    if (!reason.trim()) { setError("Please describe the issue."); return; }
    setSending(true);
    setError("");
    try {
      await api.post(`/recipes/${recipeId}/report`, { reason });
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit report");
    } finally {
      setSending(false);
    }
  };

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="rd-btn rd-btn--ghost">
        <Flag size={15} /> Report
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/45 flex items-center justify-center z-50 px-4" onClick={() => setOpen(false)}>
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {done ? (
          <>
            <h3 className="text-lg font-extrabold text-gray-800 mb-2">Report sent</h3>
            <p className="text-sm text-gray-500 mb-4">Thanks — our team will take a look.</p>
            <button onClick={() => setOpen(false)} className="text-sm font-semibold text-recipia-red">Close</button>
          </>
        ) : (
          <>
            <h3 className="text-lg font-extrabold text-gray-800 mb-1">Report this recipe</h3>
            <p className="text-xs text-gray-400 mb-3">Tell us what's wrong.</p>
            {error && <p className="text-xs text-red-500 mb-2">{error}</p>}
            <textarea
              value={reason} onChange={(e) => setReason(e.target.value)} rows={4}
              placeholder="What's the issue?"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-3"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setOpen(false)} className="text-sm font-semibold text-gray-500">Cancel</button>
              <button onClick={submit} disabled={sending} className="bg-recipia-red text-white text-sm font-semibold px-4 py-2 rounded-lg disabled:opacity-60">
                {sending ? "Sending…" : "Submit"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}