import { useParams, useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Bookmark, Trash2, Pencil, Clock, Flame, Users, ArrowLeft } from "lucide-react";
import api from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";
import CommentsSection from "../components/CommentsSection.jsx";
import SaveToCollectionModal from "../components/SaveToCollectionModal.jsx";
import ReportButton from "../components/ReportButton.jsx";
import cook3 from "../assets/cook3.webp";

export default function RecipeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSaveModal, setShowSaveModal] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const load = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/recipes/${id}`);
        setRecipe(res.data.recipe);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm("Delete this recipe? This cannot be undone.")) return;
    try {
      await api.delete(`/recipes/${id}`);
      navigate("/dashboard");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete recipe");
    }
  };

  if (loading) {
    return (
      <div className="rd-page">
        <p className="rd-state">Loading recipe…</p>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="rd-page">
        <div className="rd-shell">
          <button className="rd-back" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} /> Back
          </button>
          <p className="rd-state">Recipe not found.</p>
        </div>
      </div>
    );
  }

  const isOwner = user?._id === recipe.author?._id;
  const total = (Number(recipe.prepTime) || 0) + (Number(recipe.cookTime) || 0);

  return (
    <div className="rd-page"   style={{
        backgroundImage: `
            linear-gradient(rgba(76, 40, 40, 0.55), rgba(103, 55, 55, 0.65)),
          url(${cook3})
        `,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat"}}>
      

      <div className="rd-shell">
        <button className="rd-back" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> Back
        </button>

        <article className="rd-sheet">
          <header className="rd-head">
            <ul className="rd-tags">
              <li className="rd-tag rd-tag--red">{recipe.category}</li>
              <li className="rd-tag rd-tag--olive">{recipe.difficulty}</li>
              <li className="rd-tag rd-tag--ghost">Serves {recipe.servings}</li>
            </ul>

            <h1 className="rd-title">{recipe.title}</h1>

            {recipe.author?.name && (
              <Link to={`/profile/${recipe.author._id}`} className="rd-author">
                by {recipe.author.name}
              </Link>
            )}

            {recipe.description && <p className="rd-desc">{recipe.description}</p>}
          </header>

          {recipe.image && (
            <figure className="rd-hero">
              <img src={recipe.image} alt={recipe.title} />
            </figure>
          )}

          <ul className="rd-times">
            <li className="rd-time">
              <Clock size={16} />
              <span className="rd-time__k">Prep</span>
              <span className="rd-time__v">{recipe.prepTime} mins</span>
            </li>
            <li className="rd-time">
              <Flame size={16} />
              <span className="rd-time__k">Cook</span>
              <span className="rd-time__v">{recipe.cookTime} mins</span>
            </li>
            <li className="rd-time rd-time--accent">
              <Users size={16} />
              <span className="rd-time__k">Total</span>
              <span className="rd-time__v">{total} mins</span>
            </li>
          </ul>

          <div className="rd-cols">
            <section className="rd-sec rd-sec--ing">
              <h2 className="rd-sec__title">Ingredients</h2>
              <ul className="rd-ing">
                {recipe.ingredients.map((ing, i) => (
                  <li key={i} className="rd-ing__item">{ing}</li>
                ))}
              </ul>
            </section>


  {recipe.materials?.length > 0 && (
    <section className="rd-sec">
      <h2 className="rd-sec__title">Materials</h2>

      <ul className="rd-ing">
        {recipe.materials.map((material, i) => (
          <li key={i} className="rd-ing__item">
            {material}
          </li>
        ))}
      </ul>
    </section>
  )}


            <section className="rd-sec">
              <h2 className="rd-sec__title">Instructions</h2>
              <ol className="rd-steps">
                {recipe.instructions.map((step, i) => (
                  <li key={i} className="rd-step">
                    <span className="rd-step__n">{i + 1}</span>
                    <p className="rd-step__t">{step}</p>
                  </li>
                ))}
              </ol>
            </section>
          </div>

<div className="rd-actions">
  {user && !isOwner && (
    <button className="rd-btn rd-btn--red" onClick={() => setShowSaveModal(true)}>
      <Bookmark size={16} /> Save to collection
    </button>
  )}
  {user && !isOwner && <ReportButton recipeId={recipe._id} />}
  {isOwner && (
    <>
      <Link to={`/add-recipe?edit=${recipe._id}`} className="rd-btn rd-btn--olive">
        <Pencil size={16} /> Edit
      </Link>
      <button className="rd-btn rd-btn--ghost" onClick={handleDelete}>
        <Trash2 size={16} /> Delete
      </button>
    </>
  )}
</div>

          <div className="rd-comments">
            <CommentsSection recipeId={recipe._id} recipeAuthorId={recipe.author?._id} />
          </div>
        </article>
      </div>

      {showSaveModal && (
        <SaveToCollectionModal recipeId={recipe._id} onClose={() => setShowSaveModal(false)} />
      )}
    </div>
  );
}
