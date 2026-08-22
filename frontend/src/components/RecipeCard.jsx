import { Link } from "react-router-dom";
import { Clock, Flame, Heart, Eye } from "lucide-react";
import defaultCover from "../assets/default.webp";

export default function RecipeCard({ recipe }) {
  const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);

  return (
    <Link to={`/recipe/${recipe._id}`} className="recipe-card">
      <div className="recipe-card-img-wrap">
        <div className="recipe-card-img-clip">
          <img src={recipe.image || defaultCover} alt={recipe.title} loading="lazy" />
        </div>
        {recipe.category && <span className="recipe-card-category">{recipe.category}</span>}
        {recipe.isDraft && <span className="recipe-card-draft">Draft</span>}
      </div>

      <div className="recipe-card-body">
        <h3 className="recipe-card-title">{recipe.title}</h3>

        {recipe.description && <p className="recipe-card-desc">{recipe.description}</p>}

        <div className="recipe-card-meta">
          {totalTime > 0 && (
            <span className="recipe-card-meta-item">
              <Clock size={11} /> {totalTime} min
            </span>
          )}
          {recipe.difficulty && (
            <span className="recipe-card-meta-item">
              <Flame size={11} /> {recipe.difficulty}
            </span>
          )}
          {recipe.cuisine && (
            <span className="recipe-card-meta-item">{recipe.cuisine}</span>
          )}
          <span className="recipe-card-meta-item">
            <Heart size={11} /> {recipe.saveCount || 0}
          </span>
          <span className="recipe-card-meta-item">
            <Eye size={11} /> {recipe.viewCount || 0}
          </span>
        </div>

        {recipe.author && (
          <div className="recipe-card-author">
            <div className="recipe-card-author-avatar">
              {recipe.author.profilePicture ? (
                <img
                  src={recipe.author.profilePicture}
                  alt={recipe.author.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                recipe.author.name?.charAt(0).toUpperCase()
              )}
            </div>
            <span className="recipe-card-author-name">{recipe.author.name}</span>
          </div>
        )}
      </div>
    </Link>
  );
}