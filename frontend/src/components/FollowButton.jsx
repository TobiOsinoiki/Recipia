import { useState } from "react";
import { UserPlus, UserCheck } from "lucide-react";
import api from "../api.js";

export default function FollowButton({ userId, initiallyFollowing, onChange }) {
  const [following, setFollowing] = useState(initiallyFollowing);
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    setLoading(true);
    try {
      const res = await api.post(`/users/${userId}/follow`);
      setFollowing(res.data.following);
      onChange?.(res.data.following, res.data.followerCount);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-60 ${
        following ? "bg-gray-100 text-gray-600 hover:bg-gray-200" : "bg-recipia-red text-white hover:bg-recipia-redDark"
      }`}
    >
      {following ? <UserCheck size={16} /> : <UserPlus size={16} />}
      {following ? "Following" : "Follow"}
    </button>
  );
}