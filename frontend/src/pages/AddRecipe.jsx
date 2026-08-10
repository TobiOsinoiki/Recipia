import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Upload } from "lucide-react";
import api from "../api.js";
import { fileToDataURL } from "../utils/fileToDataURL.js";
import backFallback from "../assets/default.png";
import cook2 from "../assets/cook2.png";

const emptyForm = {
  title: "", description: "", category: "Dinner", cuisine: "", tags: "",
  image: "", prepTime: "", cookTime: "", servings: "", difficulty: "Easy",
  ingredients: "", instructions: "",
};

export default function AddRecipe() {
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit");
  const [form, setForm] = useState(emptyForm);
  const [imagePreview, setImagePreview] = useState("");
  const [imageError, setImageError] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(!!editId);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!editId) return;
    api.get(`/recipes/${editId}`).then((res) => {
      const r = res.data.recipe;
      setForm({
        title: r.title, description: r.description, category: r.category,
        cuisine: r.cuisine || "", tags: (r.tags || []).join(", "),
        image: r.image, prepTime: r.prepTime, cookTime: r.cookTime,
        servings: r.servings, difficulty: r.difficulty,
        ingredients: r.ingredients.join("\n"), instructions: r.instructions.join("\n"),
      });
      setImagePreview(r.image || "");
      setLoading(false);
    });
  }, [editId]);

  const handle = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageError("");
    try {
      const dataUrl = await fileToDataURL(file);
      setForm((f) => ({ ...f, image: dataUrl }));
      setImagePreview(dataUrl);
    } catch (err) {
      setImageError(err.message);
    }
  };

  const buildPayload = (isDraft) => ({
    ...form,
    tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
    servings: Number(form.servings) || 2,
    ingredients: form.ingredients.split("\n").map((s) => s.trim()).filter(Boolean),
    materials: form.materials.split("\n").map((s) => s.trim()).filter(Boolean),
    instructions: form.instructions.split("\n").map((s) => s.trim()).filter(Boolean),
    isDraft,
  });

  const submit = async (e, isDraft) => {
    e.preventDefault();
    setError("");

    if (!form.title.trim()) {
      setError("A title is required, even for drafts.");
      return;
    }
    if (!isDraft && (!form.ingredients.trim() || !form.instructions.trim())) {
      setError("Ingredients and instructions are required to publish. Save as a draft instead if you're not ready.");
      return;
    }

    setSaving(true);
    const payload = buildPayload(isDraft);

    try {
      if (editId) {
        await api.put(`/recipes/${editId}`, payload);
        navigate(`/recipe/${editId}`);
      } else {
        const res = await api.post("/recipes", payload);
        setSuccess(isDraft ? "draft" : "published");
        setTimeout(() => navigate(`/recipe/${res.data.recipe._id}`), 1200);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save recipe");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-center text-gray-400 py-20">Loading...</p>;

  if (success) {
    return (
      <div className="max-w-lg mx-auto text-center py-20">
        <div className="text-5xl mb-3">{success === "draft" ? "📝" : "🎉"}</div>
        <h2 className="text-xl font-bold text-gray-800">{success === "draft" ? "Draft saved!" : "Recipe published!"}</h2>
        <p className="text-gray-500 mt-1">Redirecting...</p>
      </div>
    );
  }

  const inputCls = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-recipia-red bg-gray-50 focus:bg-white";

  return (
    
    <div className="add max-w-2xl mx-auto px-5 py-9" style={{ backgroundImage: `url(${cook2})` }}>
      <form className="form rounded-2xl shadow-md p-9" onSubmit={(e) => e.preventDefault()}>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">{editId ? "Edit Recipe" : "Upload a Recipe"}</h2>

        {error && <p className="bg-red-50 text-red-600 text-sm rounded-lg px-3 py-2 mb-4">{error}</p>}

        <div className="pic mb-5">
          <label className="block text-sm font-semibold text-gray-600 mb-1">Picture</label>
          <div className="flex items-center gap-4">
            <img src={imagePreview || backFallback} alt="preview" className="w-24 h-24 rounded-lg object-cover border border-gray-200" />
            <label className="flex items-center gap-2 bg-yellow-300 hover:bg-yellow-200 text-gray-700 text-sm font-semibold px-4 py-2 rounded-lg cursor-pointer transition">
              <Upload size={15} /> Upload your food image
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
          </div>
          {imageError && <p className="text-xs text-red-500 mt-1">{imageError}</p>}
          <p className="text-xs mt-1">No photo? A default image is used instead.</p>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-600 mb-1">Recipe Title *</label>
          <input name="title" className={inputCls} value={form.title} onChange={handle} placeholder="e.g. Grandma's Apple Pie" />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-600 mb-1">Description</label>
          <textarea name="description" className={inputCls} value={form.description} onChange={handle} rows={3} placeholder="A short description of the dish..." />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">Category</label>
            <select name="category" className={inputCls} value={form.category} onChange={handle}>
              <option>Breakfast</option><option>Lunch</option><option>Dinner</option><option>Dessert</option><option>Snack</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">Difficulty</label>
            <select name="difficulty" className={inputCls} value={form.difficulty} onChange={handle}>
              <option>Easy</option><option>Medium</option><option>Hard</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">Cuisine</label>
            <input name="cuisine" className={inputCls} value={form.cuisine} onChange={handle} placeholder="e.g. Italian" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">Tags (comma separated)</label>
            <input name="tags" className={inputCls} value={form.tags} onChange={handle} placeholder="e.g. vegan, quick, spicy" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">Prep Time (mins)</label>
            <input type="number" min="0" name="prepTime" className={inputCls} value={form.prepTime} onChange={handle} placeholder="15" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">Cook Time (mins)</label>
            <input type="number" min="0" name="cookTime" className={inputCls} value={form.cookTime} onChange={handle} placeholder="30" />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-600 mb-1">Servings</label>
          <input type="number" min="1" name="servings" className={inputCls} value={form.servings} onChange={handle} placeholder="4" />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-600 mb-1">Ingredients (one per line)</label>
          <textarea name="ingredients" className={inputCls} value={form.ingredients} onChange={handle} rows={6} placeholder={"2 cups flour\n1 cup sugar\n3 eggs"} />
        </div>
<div className="mb-4">
  <label className="block text-sm font-semibold text-gray-600 mb-1">Materials (one per line)</label>
  <textarea name="materials" className={inputCls} value={form.materials} onChange={handle} rows={4} placeholder={"Pot\nOven\nMixing bowl"} />
</div>
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-600 mb-1">Instructions (one step per line)</label>
          <textarea name="instructions" className={inputCls} value={form.instructions} onChange={handle} rows={7} placeholder={"Preheat oven to 180°C.\nMix flour and sugar.\nAdd eggs and stir."} />
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            disabled={saving}
            onClick={(e) => submit(e, true)}
            className="flex-1 bg-yellow-300 text-gray-700 font-bold py-3 rounded-lg hover:bg-yellow-200 transition disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save as Draft"}
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={(e) => submit(e, false)}
            className="flex-1 bg-recipia-red text-white font-bold py-3 rounded-lg hover:bg-recipia-redDark transition disabled:opacity-60"
          >
            {saving ? "Saving…" : editId ? "Save Changes" : "Publish Recipe"}
          </button>
        </div>
      </form>
    </div>
  );
}