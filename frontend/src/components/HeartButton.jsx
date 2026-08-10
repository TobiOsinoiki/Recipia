import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import api from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function HeartButton({ recipeId, saveCount, onCountChange, size = 18 }) {
  const { user } = useAuth();
  const [hearted, setHearted] = useState(false);
  const [count, setCount] = useState(saveCount || 0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    api.get(`/recipes/${recipeId}/heart-status`).then((res) => setHearted(res.data.hearted)).catch(() => {});
  }, [recipeId, user]);

  useEffect(() => setCount(saveCount || 0), [saveCount]);

  const toggle = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await api.post(`/recipes/${recipeId}/heart`);
      setHearted(res.data.hearted);
      setCount(res.data.saveCount);
      onCountChange?.(res.data.saveCount);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggle}
      disabled={!user || loading}
      title={user ? "Save to Favorites" : "Log in to save"}
      className={`flex items-center gap-2 font-semibold px-5 py-2.5 rounded-lg transition disabled:opacity-60 ${
        hearted ? "bg-recipia-red text-white hover:bg-recipia-redDark" : "bg-red-50 text-recipia-red hover:bg-red-100"
      }`}
    >
      <Heart size={size} fill={hearted ? "currentColor" : "none"} />
      {hearted ? "Saved" : "Save"}
      {count > 0 && <span className="text-xs opacity-80">({count})</span>}
    </button>
  );
}