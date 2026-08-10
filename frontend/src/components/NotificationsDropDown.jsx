import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { UserPlus, MessageCircle, CornerDownRight, Heart } from "lucide-react";
import api from "../api.js";

const ICONS = {
  follow: <UserPlus size={15} className="text-recipia-red" />,
  comment: <MessageCircle size={15} className="text-blue-500" />,
  reply: <CornerDownRight size={15} className="text-green-600" />,
  save: <Heart size={15} className="text-recipia-red" />,
};

function messageFor(n) {
  const name = n.actor?.name || "Someone";
  switch (n.type) {
    case "follow": return `${name} started following you`;
    case "comment": return `${name} commented on "${n.recipe?.title || "your recipe"}"`;
    case "reply": return `${name} replied to your comment`;
    case "save": return `${name} saved "${n.recipe?.title || "your recipe"}"`;
    default: return "New notification";
  }
}

function linkFor(n) {
  if (n.type === "follow") return `/profile/${n.actor?._id}`;
  if (n.recipe) return `/recipe/${n.recipe._id}`;
  return "#";
}

export default function NotificationsDropdown({ onClose, onRead }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/notifications")
      .then((res) => setNotifications(res.data.notifications))
      .finally(() => setLoading(false));
    api.put("/notifications/read-all").then(() => onRead?.()).catch(() => {});
  }, [onRead]);

  return (
    <div className="absolute right-0 top-8 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 max-h-96 overflow-y-auto">
      <div className="px-4 py-3 border-b border-gray-100 font-bold text-sm text-gray-800">Notifications</div>
      {loading ? (
        <p className="text-gray-400 text-sm p-4">Loading...</p>
      ) : notifications.length === 0 ? (
        <p className="text-gray-400 text-sm p-4">No notifications yet.</p>
      ) : (
        <div className="flex flex-col">
          {notifications.map((n) => (
            <Link
              key={n._id}
              to={linkFor(n)}
              onClick={onClose}
              className={`flex items-start gap-2.5 px-4 py-3 hover:bg-gray-50 border-b border-gray-50 ${!n.read ? "bg-red-50/40" : ""}`}
            >
              <span className="mt-0.5">{ICONS[n.type]}</span>
              <div className="flex-1">
                <p className="text-sm text-gray-700">{messageFor(n)}</p>
                <p className="text-xs text-gray-400 mt-0.5">{new Date(n.createdAt).toLocaleDateString()}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}