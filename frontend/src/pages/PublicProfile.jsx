import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Heart, BadgeCheck } from "lucide-react";
import api from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";
import RecipeCard from "../components/RecipeCard.jsx";
import FollowButton from "../components/FollowButton.jsx";
import FollowListModal from "../components/FollowListModal.jsx";
import cook1 from "../assets/cook1.png";


export default function PublicProfile() {
  const { id } = useParams();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
const [listModal, setListModal] = useState(null);
  useEffect(() => {
    setLoading(true);
    api
      .get(`/users/${id}/public`)
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) return <p className="rcp-muted text-center py-20">Loading profile…</p>;
  if (!data) return <p className="rcp-muted text-center py-20">Profile not found.</p>;

  const { user: profileUser, uploadedRecipes, mostSavedRecipes, isFollowing } = data;
  const isOwnProfile = user?._id === profileUser._id;

  return (
    <div className="homeback rcp-page" style={{ backgroundImage: `url(${cook1})` }}>
      <div className="rcp-sheet">
        <header className="rcp-prof">
          <div className="rcp-prof__avatar">
            {profileUser.profilePicture ? (
              <img src={profileUser.profilePicture} alt={profileUser.name} />
            ) : (
              profileUser.name.charAt(0).toUpperCase()
            )}
          </div>

          <div className="rcp-prof__main">
            <div className="rcp-prof__nameline">
              <h1 className="rcp-prof__name">{profileUser.name}</h1>
              {profileUser.isOfficial && (
                <span className="rcp-badge">
                  <BadgeCheck size={13} /> Official
                </span>
              )}
            </div>

            <p className="rcp-prof__bio">
              {profileUser.bio || "This user hasn't written a bio yet."}
            </p>
<div className="rcp-stats">
  <button onClick={() => setListModal("followers")} className="hover:text-recipia-red transition-colors">
    <strong>{profileUser.followerCount}</strong> followers
  </button>
  <span className="rcp-stats__dot" aria-hidden="true" />
  <button onClick={() => setListModal("following")} className="hover:text-recipia-red transition-colors">
    <strong>{profileUser.followingCount}</strong> following
  </button>
  <span className="rcp-stats__dot" aria-hidden="true" />
  <span className="rcp-stats__joined">
    Joined {new Date(profileUser.createdAt).toLocaleDateString()}
  </span>
</div>

            <div className="rcp-prof__actions">
              {isOwnProfile ? (
                <Link to="/dashboard" className="rcp-link">
                  Edit profile →
                </Link>
              ) : user ? (
                <FollowButton userId={profileUser._id} initiallyFollowing={isFollowing} />
              ) : null}
            </div>
          </div>
        </header>

        {mostSavedRecipes.length > 0 && (
          <section className="rcp-sec">
            <h2 className="rcp-sec__title">
              <Heart size={17} className="text-recipia-red" fill="currentColor" /> Most saved recipes
            </h2>
            <div className="rcp-recgrid">
              {mostSavedRecipes.map((r) => (
                <RecipeCard key={r._id} recipe={r} />
              ))}
            </div>
          </section>
        )}

        <section className="rcp-sec">
          <h2 className="rcp-sec__title">All uploaded recipes ({uploadedRecipes.length})</h2>
          {uploadedRecipes.length === 0 ? (
            <p className="rcp-muted">No recipes uploaded yet.</p>
          ) : (
            <div className="rcp-recgrid">
              {uploadedRecipes.map((r) => (
                <RecipeCard key={r._id} recipe={r} />
              ))}
            </div>
          )}
        </section>
        {listModal && (
  <FollowListModal
    userId={profileUser._id}
    mode={listModal}
    onClose={() => setListModal(null)}
  />
)}
      </div>
    </div>
  );
}
