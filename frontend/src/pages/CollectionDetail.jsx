import { useParams, useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Lock, Globe, Heart } from "lucide-react";
import api from "../api.js";
import RecipeCard from "../components/RecipeCard.jsx";

export default function CollectionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [collection, setCollection] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/collections/${id}`)
      .then((res) => setCollection(res.data.collection))
      .catch((err) => setError(err.response?.data?.message || "Failed to load collection"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="text-center text-gray-400 py-20">Loading...</p>;
  if (error) {
    return (
      <div className="max-w-lg mx-auto text-center py-20">
        <p className="text-gray-500 mb-4">{error}</p>
        <button onClick={() => navigate(-1)} className="text-recipia-red font-semibold">← Back</button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-5 py-9">
      <button onClick={() => navigate(-1)} className="text-recipia-red font-semibold mb-4">← Back</button>

      <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
            {collection.isFavorites && <Heart size={20} className="text-recipia-red" fill="currentColor" />}
            {collection.name}
          </h1>
          <Link to={`/profile/${collection.owner._id}`} className="text-sm text-gray-400 hover:text-recipia-red">
            by {collection.owner.name}
          </Link>
        </div>
        <span className="flex items-center gap-1.5 text-sm font-semibold text-gray-500">
          {collection.isPrivate ? <><Lock size={14} /> Private</> : <><Globe size={14} /> Public</>}
        </span>
      </div>

      {collection.recipes.length === 0 ? (
        <p className="text-gray-400 text-center py-16">No recipes in this collection yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {collection.recipes.map((r) => <RecipeCard key={r._id} recipe={r} />)}
        </div>
      )}
    </div>
  );
}