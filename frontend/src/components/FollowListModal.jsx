import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { X, BadgeCheck } from "lucide-react";
import api from "../api.js";

export default function FollowListModal({ userId, mode, onClose }) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get(`/users/${userId}/${mode}`)
      .then((res) => setList(res.data[mode]))
      .finally(() => setLoading(false));
  }, [userId, mode]);

  return (
    <div className="fixed inset-0 bg-black/45 flex items-center justify-center z-50 px-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl max-h-[70vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-extrabold text-gray-800 capitalize">{mode}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-recipia-red">
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 flex flex-col gap-1">
          {loading ? (
            <p className="text-gray-400 text-sm text-center py-8">Loading...</p>
          ) : list.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">
              {mode === "followers" ? "No followers yet." : "Not following anyone yet."}
            </p>
          ) : (
            list.map((u) => (
              <Link
                key={u._id}
                to={`/profile/${u._id}`}
                onClick={onClose}
                className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-gray-50 transition"
              >
                <div className="w-10 h-10 rounded-full bg-recipia-yellow flex items-center justify-center text-sm font-bold text-recipia-olive overflow-hidden shrink-0">
                  {u.profilePicture ? (
                    <img src={u.profilePicture} alt={u.name} className="w-full h-full object-cover" />
                  ) : (
                    u.name.charAt(0).toUpperCase()
                  )}
                </div>
                <span className="text-sm font-semibold text-gray-800 flex items-center gap-1">
                  {u.name} {u.isOfficial && <BadgeCheck size={13} className="text-recipia-red" />}
                </span>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}