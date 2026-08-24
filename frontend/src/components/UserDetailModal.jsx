import { Link } from "react-router-dom";
import { X, BadgeCheck, ShieldCheck, ShieldOff, Ban, ShieldAlert, Trash2, ExternalLink } from "lucide-react";

export default function UserDetailModal({
  user, admin, onClose, onPromote, onRemoveAdmin, onDelete, onSuspend, onUnsuspend,
}) {
  const isSelf = user._id === admin._id;
  const isAdminUser = user.roles?.includes("admin");

  return (
    <div className="fixed inset-0 bg-black/45 flex items-center justify-center z-50 px-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-recipia-yellow flex items-center justify-center text-lg font-bold text-recipia-olive overflow-hidden">
              {user.profilePicture ? (
                <img src={user.profilePicture} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                user.name?.charAt(0).toUpperCase()
              )}
            </div>
            <div>
              <p className="font-extrabold text-gray-800 flex items-center gap-1.5">
                {user.name}
                {user.isOfficial && <BadgeCheck size={15} className="text-recipia-red" />}
              </p>
              <p className="text-xs text-gray-400">{user.email}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-recipia-red">
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <span className={`text-xs font-bold px-2 py-1 rounded-full ${isAdminUser ? "bg-amber-100 text-amber-700" : "bg-blue-50 text-blue-700"}`}>
            {user.roles?.join(", ") || "user"}
          </span>
          {user.suspended && (
            <span className="text-xs font-bold px-2 py-1 rounded-full bg-red-100 text-red-700">Suspended</span>
          )}
          {user.isVerified === false && (
            <span className="text-xs font-bold px-2 py-1 rounded-full bg-gray-100 text-gray-500">Unverified</span>
          )}
        </div>

        <dl className="text-sm text-gray-600 flex flex-col gap-2 mb-5">
          <div className="flex justify-between">
            <dt className="text-gray-400">Bio</dt>
            <dd className="text-right max-w-[65%]">{user.bio || "—"}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-400">Followers</dt>
            <dd>{user.followers?.length ?? 0}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-400">Following</dt>
            <dd>{user.following?.length ?? 0}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-400">Joined</dt>
            <dd>{new Date(user.createdAt).toLocaleDateString()}</dd>
          </div>
        </dl>

        {isSelf ? (
          <p className="text-xs text-gray-400 italic mb-2">This is your own account.</p>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {!isAdminUser ? (
              <button
                onClick={() => onPromote(user._id)}
                className="flex items-center justify-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 px-3 py-2 rounded-lg hover:bg-green-100"
              >
                <ShieldCheck size={14} /> Make Admin
              </button>
            ) : (
              <button
                onClick={() => onRemoveAdmin(user._id)}
                className="flex items-center justify-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 px-3 py-2 rounded-lg hover:bg-amber-100"
              >
                <ShieldOff size={14} /> Remove Admin
              </button>
            )}

            {user.suspended ? (
              <button
                onClick={() => onUnsuspend(user._id)}
                className="flex items-center justify-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 px-3 py-2 rounded-lg hover:bg-green-100"
              >
                <ShieldAlert size={14} /> Unsuspend
              </button>
            ) : (
              <button
                onClick={() => onSuspend(user._id)}
                className="flex items-center justify-center gap-1.5 text-xs font-semibold text-orange-700 bg-orange-50 px-3 py-2 rounded-lg hover:bg-orange-100"
              >
                <Ban size={14} /> Suspend
              </button>
            )}

            <button
              onClick={() => onDelete(user._id)}
              className="flex items-center justify-center gap-1.5 text-xs font-semibold text-recipia-red bg-red-50 px-3 py-2 rounded-lg hover:bg-red-100"
            >
              <Trash2 size={14} /> Delete
            </button>

            <Link
              to={`/profile/${user._id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 text-xs font-semibold text-gray-600 bg-gray-100 px-3 py-2 rounded-lg hover:bg-gray-200"
            >
              <ExternalLink size={14} /> View Profile
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}