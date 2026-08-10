import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { CornerDownRight } from "lucide-react";
import api from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function CommentsSection({ recipeId, recipeAuthorId }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/recipes/${recipeId}/comments`)
      .then((res) => setComments(res.data.comments))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [recipeId]);

  const threaded = useMemo(() => {
    const topLevel = comments.filter((c) => !c.parentComment);
    return topLevel.map((c) => ({
      ...c,
      replies: comments.filter((r) => String(r.parentComment) === String(c._id)),
    }));
  }, [comments]);

  const submitComment = async (e) => {
    e.preventDefault();
    if (!user) { setError("Log in to leave a comment."); return; }
    if (!text.trim()) return;
    try {
      const res = await api.post(`/recipes/${recipeId}/comments`, { text });
      setComments((c) => [...c, res.data.comment]);
      setText("");
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to post comment");
    }
  };

  const submitReply = async (parentId) => {
    if (!user || !replyText.trim()) return;
    try {
      const res = await api.post(`/recipes/${recipeId}/comments`, { text: replyText, parentComment: parentId });
      setComments((c) => [...c, res.data.comment]);
      setReplyText("");
      setReplyTo(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to post reply");
    }
  };

  const remove = async (id) => {
    try {
      await api.delete(`/comments/${id}`);
      setComments((c) => c.filter((cm) => cm._id !== id && cm.parentComment !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const canDelete = (comment) => user && (user._id === comment.user?._id || user._id === recipeAuthorId);

  return (
    <div className="mt-9 pt-7 border-t border-gray-200">
      <h2 className="text-xl font-bold text-recipia-red mb-6">Comments</h2>

      <form onSubmit={submitComment} className="flex gap-2 mb-6">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={user ? "Share a tip or a question..." : "Log in to comment"}
          disabled={!user}
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-recipia-red disabled:bg-gray-100"
        />
        <button type="submit" disabled={!user} className="bg-recipia-red text-white font-semibold px-5 rounded-lg disabled:opacity-50">
          Post
        </button>
      </form>
      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      {loading ? (
        <p className="text-gray-400 text-sm">Loading comments...</p>
      ) : threaded.length === 0 ? (
        <p className="text-gray-400 text-sm text-center py-6">No comments yet. Share your thoughts first</p>
      ) : (
        <div className="flex flex-col gap-4">
          {threaded.map((c) => (
            <div key={c._id} className="bg-white border border-gray-100 rounded-lg p-4 shadow-sm">
              <CommentRow comment={c} canDelete={canDelete(c)} onDelete={remove} />

              <button
                className="text-xs text-gray-400 hover:text-recipia-red font-semibold mt-2 ml-1"
                onClick={() => setReplyTo(replyTo === c._id ? null : c._id)}
              >
                Reply
              </button>

              {replyTo === c._id && (
                <div className="flex gap-2 mt-2 ml-1">
                  <input
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Write a reply..."
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-recipia-red"
                  />
                  <button onClick={() => submitReply(c._id)} className="bg-recipia-olive text-white text-sm font-semibold px-3 rounded-lg">
                    Send
                  </button>
                </div>
              )}

              {c.replies.length > 0 && (
                <div className="mt-3 ml-5 pl-3 border-l-2 border-gray-100 flex flex-col gap-3">
                  {c.replies.map((r) => (
                    <div key={r._id} className="flex gap-1.5">
                      <CornerDownRight size={14} className="text-gray-300 mt-1 shrink-0" />
                      <div className="flex-1">
                        <CommentRow comment={r} canDelete={canDelete(r)} onDelete={remove} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CommentRow({ comment, canDelete, onDelete }) {
  return (
    <div>
      <div className="flex justify-between items-start mb-1">
        <Link to={`/profile/${comment.user?._id}`} className="font-bold text-sm text-gray-900 hover:text-recipia-red">
          {comment.user?.name || "Deleted user"}
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">{new Date(comment.createdAt).toLocaleDateString()}</span>
          {canDelete && (
            <button onClick={() => onDelete(comment._id)} className="text-gray-300 hover:text-recipia-red text-xs">✕</button>
          )}
        </div>
      </div>
      <p className="text-sm text-gray-600">{comment.text}</p>
    </div>
  );
}