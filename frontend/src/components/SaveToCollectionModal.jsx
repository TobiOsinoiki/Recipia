import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api.js";

export default function SaveToCollectionModal({ recipeId, onClose }) {
  const [collections, setCollections] = useState([]);
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/collections/mine")
      .then((res) => setCollections(res.data.collections.filter((c) => !c.isFavorites)))
      .finally(() => setLoading(false));
  }, []);

  const toggle = async (collectionId) => {
    const res = await api.post(`/collections/${collectionId}/toggle-recipe`, { recipeId });
    setCollections((cs) => cs.map((c) => (c._id === collectionId ? res.data.collection : c)));
  };

  const createAndAdd = async () => {
    if (!newName.trim()) return;
    const res = await api.post("/collections", { name: newName, isPrivate: true });
    await api.post(`/collections/${res.data.collection._id}/toggle-recipe`, { recipeId });
    setCollections((cs) => [{ ...res.data.collection, recipes: [recipeId] }, ...cs]);
    setNewName("");
  };

  const isIn = (c) => c.recipes.some((r) => (typeof r === "string" ? r : r._id) === recipeId);

  return (
    <div className="fixed inset-0 bg-black/45 flex items-center justify-center z-50 px-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-extrabold text-gray-800 mb-1">Save to a collection</h3>
        <p className="text-xs text-gray-400 mb-4">Use the heart button to quick-save to Favorites — these are your custom collections for organizing.</p>

        {loading ? (
          <p className="text-gray-400 text-sm">Loading...</p>
        ) : (
          <div className="flex flex-col gap-2 max-h-52 overflow-y-auto mb-4">
            {collections.length === 0 && <p className="text-sm text-gray-400">You have no custom collections yet.</p>}
            {collections.map((c) => (
              <label key={c._id} className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={isIn(c)} onChange={() => toggle(c._id)} className="accent-recipia-red" />
                <span className="flex-1">{c.name}</span>
                <span className="text-xs text-gray-400">{c.isPrivate ? "Private" : "Public"}</span>
              </label>
            ))}
          </div>
        )}

        <div className="flex gap-2 mb-4">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="New collection name"
            className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-recipia-red"
          />
          <button onClick={createAndAdd} className="bg-recipia-olive text-white text-sm font-semibold px-3 rounded-lg">
            Create
          </button>
        </div>

        <div className="flex justify-between items-center">
          <Link to="/collections" className="text-xs text-recipia-red font-semibold" onClick={onClose}>
            Manage all collections
          </Link>
          <button onClick={onClose} className="text-sm font-semibold text-gray-500">Done</button>
        </div>
      </div>
    </div>
  );
}