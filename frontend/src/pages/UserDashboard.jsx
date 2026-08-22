import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { Plus, Bookmark, User as UserIcon, Trash2, X } from "lucide-react";
import api from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";
import RecipeCard from "../components/RecipeCard.jsx";
import AddRecipe from "./AddRecipe.jsx";

const TABS = ["My Recipes", "My Collections", "Edit Profile"];

export default function UserDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState("My Recipes");

  return (
    <div className="dashboard-page boardback" style={{backgroundSize: "contain", backgroundRepeat: "no-repeat", backgroundPosition: "right bottom" }}>

    

      <div className="dashboard-page-inner back max-w-5xl mx-auto px-5 py-8" style={{ minHeight: "100vh" }}>
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-full bg-recipia-yellow flex items-center justify-center text-2xl font-bold text-recipia-olive overflow-hidden">
            {user.profilePicture ? (
              <img src={user.profilePicture} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              user.name.charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Welcome, {user.name}!</h1>
            <Link to={`/profile/${user._id}`} className="text-sm text-recipia-red font-semibold">View my public profile →</Link>
          </div>
        </div>

        <div className="flex gap-2 mb-7 flex-wrap">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                tab === t ? "bg-recipia-red text-white" : "bg-white text-gray-500 hover:text-recipia-red"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === "My Recipes"    && <MyRecipes />}
        {tab === "My Collections" && <MyCollections />}
        {tab === "Edit Profile"  && <EditProfile />}
      </div>
    </div>
  );
}

function MyRecipes() {
  const [recipes, setRecipes]     = useState([]);
  const [status, setStatus]       = useState("all");
  const [loading, setLoading]     = useState(true);
  const [showUpload, setShowUpload] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get("/recipes/mine", { params: { status } })
      .then((res) => setRecipes(res.data.recipes))
      .finally(() => setLoading(false));
  }, [status]);

  useEffect(() => {
    if (showUpload) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }
    return () => document.body.classList.remove("modal-open");
  }, [showUpload]);

  const remove = async (id) => {
    if (!window.confirm("Delete this recipe?")) return;
    await api.delete(`/recipes/${id}`);
    setRecipes((rs) => rs.filter((r) => r._id !== id));
  };

  const handleUploadClose = (newRecipe) => {
    setShowUpload(false);
    if (newRecipe) setRecipes((rs) => [newRecipe, ...rs]);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-5 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-gray-800">Your recipes</h2>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="border border-gray-300 rounded-lg px-2.5 py-1.5 text-sm bg-white"
          >
            <option value="all">All</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
          </select>
        </div>
        <button
          onClick={() => setShowUpload(true)}
          className="flex items-center gap-1.5 bg-recipia-red text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-recipia-redDark transition-colors"
        >
          <Plus size={16} /> Upload Recipe
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : recipes.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="mb-2">Nothing here yet.</p>
          <button onClick={() => setShowUpload(true)} className="text-recipia-red font-semibold">
            Upload your first recipe
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {recipes.map((r, i) => (
            <div key={r._id} className="relative card-reveal" style={{ animationDelay: `${i * 0.06}s` }}>
              <RecipeCard recipe={r} />
              <button
                onClick={() => remove(r._id)}
                className="absolute top-2 right-2 bg-white/90 text-recipia-red p-1.5 rounded-full shadow hover:bg-white transition-colors"
                title="Delete"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {showUpload && createPortal(
        <div
          className="modal-overlay"
          onClick={(e) => { if (e.target === e.currentTarget) setShowUpload(false); }}
        >
          <div className="modal-inner">
            <button
              onClick={() => setShowUpload(false)}
              className="absolute -top-3 -right-3 z-10 bg-white rounded-full shadow-md p-1.5 text-gray-500 hover:text-recipia-red transition-colors"
            >
              <X size={18} />
            </button>
            <AddRecipe onClose={handleUploadClose} />
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

function MyCollections() {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    api.get("/collections/mine")
      .then((res) => setCollections(res.data.collections))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-gray-500">Loading...</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-lg font-bold text-gray-800">Your collections</h2>
        <Link to="/collections" className="flex items-center gap-1.5 text-recipia-red text-sm font-semibold">
          <Bookmark size={16} /> Manage collections
        </Link>
      </div>
      {collections.length === 0 ? (
        <p className="text-gray-400 text-center py-12">No collections yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {collections.map((c) => (
            <Link key={c._id} to={`/collection/${c._id}`} className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-gray-800 flex items-center gap-1.5">
                  {c.isFavorites && "❤️"} {c.name}
                </h3>
                <span className="text-xs text-gray-400">{c.isPrivate ? "Private" : "Public"}</span>
              </div>
              <p className="text-sm text-gray-400">{c.recipes.length} recipe{c.recipes.length !== 1 ? "s" : ""}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
function EditProfile() {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState(user.bio || "");
  const [profilePicture, setProfilePicture] = useState(user.profilePicture || "");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [settings, setSettings] = useState(
    user.notificationSettings || {
      follow: true, comment: true, reply: true,
      heart: true, collectionSave: true, newRecipe: true,
    }
  );
  const [savingSettings, setSavingSettings] = useState(false);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setProfilePicture(reader.result);
    reader.readAsDataURL(file);
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const payload = { name, bio, profilePicture };
      if (newPassword) {
        if (!oldPassword) {
          setError("Enter your current password to set a new one.");
          setSaving(false);
          return;
        }
        payload.oldPassword = oldPassword;
        payload.newPassword = newPassword;
      }
      const res = await api.put("/me/profile", payload);
      updateUser(res.data.user);
      setOldPassword("");
      setNewPassword("");
      setMessage("Profile updated!");
      if (req.body.newPassword) {
  const match = await bcrypt.compare(req.body.oldPassword || "", user.password);
  if (!match) return res.status(400).json({ message: "Current password is incorrect" });
  user.password = await bcrypt.hash(req.body.newPassword, 10);
}
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const toggleSetting = async (key) => {
    const next = { ...settings, [key]: !settings[key] };
    setSettings(next);
    setSavingSettings(true);
    try {
      const res = await api.put("/me/notification-settings", next);
      setSettings(res.data.notificationSettings);
      updateUser({ ...user, notificationSettings: res.data.notificationSettings });
    } catch {
      setSettings(settings); // revert on failure
    } finally {
      setSavingSettings(false);
    }
  };

  const NOTIF_LABELS = {
    follow: "Someone follows you",
    comment: "Someone comments on your recipe",
    reply: "Someone replies to your comment",
    heart: "Someone hearts your recipe",
    collectionSave: "Someone saves your recipe to a collection",
    newRecipe: "Cooks you follow post a new recipe",
  };

  return (
    <div className="max-w-xl">
      <form onSubmit={save} className="bg-white rounded-xl p-6 shadow-sm flex flex-col gap-4 mb-6">
        <h2 className="text-lg font-bold text-gray-800">Edit Profile</h2>

        {error && <p className="bg-red-50 text-red-600 text-sm rounded-lg px-3 py-2">{error}</p>}
        {message && <p className="bg-green-50 text-green-700 text-sm rounded-lg px-3 py-2">{message}</p>}

        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-recipia-yellow flex items-center justify-center text-xl font-bold text-recipia-olive overflow-hidden">
            {profilePicture ? (
              <img src={profilePicture} alt="" className="w-full h-full object-cover" />
            ) : (
              name.charAt(0).toUpperCase()
            )}
          </div>
          <label className="text-sm font-semibold text-recipia-red cursor-pointer">
            Change photo
            <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
          </label>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-1">Display name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-1">Bio</label>
          <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>

        <div className="border-t pt-4">
          <p className="text-sm font-semibold text-gray-600 mb-2">Change password</p>
          <input
            type="password" placeholder="Current password" value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-2"
          />
          <input
            type="password" placeholder="New password" value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>

        <button disabled={saving} className="bg-recipia-red text-white font-bold py-2.5 rounded-lg disabled:opacity-60">
          {saving ? "Saving…" : "Save changes"}
        </button>
      </form>

      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-800 mb-3">Notifications</h2>
        <div className="flex flex-col gap-3">
          {Object.entries(NOTIF_LABELS).map(([key, label]) => (
            <label key={key} className="flex items-center justify-between text-sm">
              <span className="text-gray-600">{label}</span>
              <input
                type="checkbox"
                checked={!!settings[key]}
                disabled={savingSettings}
                onChange={() => toggleSetting(key)}
                className="accent-recipia-red w-4 h-4"
              />
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};