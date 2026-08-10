import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, Trash2, Lock, Globe, Heart } from "lucide-react";
import api from "../api.js";
import cook4 from "../assets/cook4.png";

export default function Collections() {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [isPrivate, setIsPrivate] = useState(true);
  const [creating, setCreating] = useState(false);

  const load = () => {
    api
      .get("/collections/mine")
      .then((res) => setCollections(res.data.collections))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const create = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setCreating(true);
    try {
      const res = await api.post("/collections", { name, isPrivate });
      setCollections((c) => [...c, res.data.collection]);
      setName("");
      setIsPrivate(true);
    } finally {
      setCreating(false);
    }
  };

  const togglePrivacy = async (c) => {
    if (c.isFavorites) return;
    const res = await api.put(`/collections/${c._id}`, { isPrivate: !c.isPrivate });
    setCollections((cs) =>
      cs.map((x) => (x._id === c._id ? { ...x, isPrivate: res.data.collection.isPrivate } : x))
    );
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this collection? Recipes inside it won't be deleted.")) return;
    try {
      await api.delete(`/collections/${id}`);
      setCollections((cs) => cs.filter((c) => c._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete collection");
    }
  };

  return (
    <div className="collback rcp-page" style={{ backgroundImage: `url(${cook4})` }}>
      <div className="rcp-sheet">
        <header className="rcp-sheet__head">
          <h1 className="rcp-title">My Collections</h1>
          <p className="rcp-sub">
            {collections.length} collection{collections.length !== 1 ? "s" : ""}
          </p>
        </header>

        <form onSubmit={create} className="rcp-newcol">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="New collection name (e.g. Weeknight Dinners)"
            className="rcp-newcol__input"
          />
          <label className="rcp-newcol__check">
            <input
              type="checkbox"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
              className="accent-recipia-red"
            />
            Private
          </label>
          <button disabled={creating} className="rcp-newcol__btn">
            <Plus size={16} /> Create
          </button>
        </form>

        {loading ? (
          <p className="rcp-muted">Loading…</p>
        ) : collections.length === 0 ? (
          <p className="rcp-muted">No collections yet — create your first one above.</p>
        ) : (
          <ul className="rcp-colgrid">
            {collections.map((c) => (
              <li key={c._id} className={`rcp-col${c.isFavorites ? " rcp-col--fav" : ""}`}>
                <Link to={`/collection/${c._id}`} className="rcp-col__name">
                  {c.isFavorites && (
                    <Heart size={14} className="text-recipia-red" fill="currentColor" />
                  )}
                  {c.name}
                </Link>
                <p className="rcp-col__count">
                  {c.recipes.length} recipe{c.recipes.length !== 1 ? "s" : ""}
                </p>

                <div className="rcp-col__foot">
                  {c.isFavorites ? (
                    <span className="rcp-col__tag rcp-col__tag--static">Always private</span>
                  ) : (
                    <button onClick={() => togglePrivacy(c)} className="rcp-col__tag">
                      {c.isPrivate ? (
                        <>
                          <Lock size={12} /> Private
                        </>
                      ) : (
                        <>
                          <Globe size={12} /> Public
                        </>
                      )}
                    </button>
                  )}

                  {!c.isFavorites && (
                    <button
                      onClick={() => remove(c._id)}
                      className="rcp-col__del"
                      aria-label={`Delete ${c.name}`}
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
