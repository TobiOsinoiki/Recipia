import { useEffect, useState } from "react";
import { Users, ChefHat, Search, Trash2, BadgeCheck } from "lucide-react";
import api from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";

const TABS = ["Overview", "Users", "Recipes", "Reports"];

export default function AdminDashboard() {
  const { user: admin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("Overview");

  useEffect(() => {
    api.get("/admin/users").then((res) => setUsers(res.data.users)).finally(() => setLoading(false));
  }, []);

  const handlePromote = async (id) => {
    await api.put(`/admin/users/${id}/make-admin`);
    setUsers((us) => us.map((u) => (u._id === id ? { ...u, roles: [...(u.roles || []), "admin"] } : u)));
  };

  const handleRemoveAdmin = async (id) => {
    if (id === admin._id) return alert("You cannot remove your own admin role.");
    await api.put(`/admin/users/${id}/remove-admin`);
    setUsers((us) => us.map((u) => (u._id === id ? { ...u, roles: (u.roles || []).filter((r) => r !== "admin") } : u)));
  };

  const handleDelete = async (id) => {
    if (id === admin._id) return alert("You cannot delete your own account.");
    if (!window.confirm("Delete this user and all of their recipes?")) return;
    await api.delete(`/admin/users/${id}`);
    setUsers((us) => us.filter((u) => u._id !== id));
  };

  if (loading) return <p className="text-center text-gray-400 py-20">Loading...</p>;

  return (
    <div className="max-w-5xl mx-auto px-5 py-9">
      <h1 className="text-2xl font-extrabold text-gray-900 mb-6">Admin Dashboard</h1>

      <div className="flex gap-2 mb-7">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold ${tab === t ? "bg-recipia-red text-white" : "bg-white text-gray-500"}`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Overview" && <Overview users={users} />}
      {tab === "Users" && (
        <UsersTab users={users} admin={admin} onPromote={handlePromote} onRemoveAdmin={handleRemoveAdmin} onDelete={handleDelete} />
      )}
      {tab === "Recipes" && <RecipesTab />}
      
  {tab === "Overview" && <Overview users={users} />}
      {tab === "Users" && (
        <UsersTab users={users} admin={admin} onPromote={handlePromote} onRemoveAdmin={handleRemoveAdmin} onDelete={handleDelete} />
      )}
      {tab === "Recipes" && <RecipesTab />}
      {tab === "Reports" && <ReportsTab />}
    </div>
  );
}
function Overview({ users }) {
  const totalUsers = users.length;
  const totalAdmins = users.filter((u) => u.roles?.includes("admin")).length;
  const officialCount = users.filter((u) => u.isOfficial).length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="bg-white rounded-xl p-5 shadow-sm flex items-center gap-3">
        <Users className="text-recipia-red" />
        <div>
          <p className="text-2xl font-bold text-gray-900">{totalUsers}</p>
          <p className="text-sm text-gray-500">Total users ({totalAdmins} admins)</p>
        </div>
      </div>
      <div className="bg-white rounded-xl p-5 shadow-sm flex items-center gap-3">
        <BadgeCheck className="text-recipia-red" />
        <div>
          <p className="text-2xl font-bold text-gray-900">{officialCount}</p>
          <p className="text-sm text-gray-500">Official accounts</p>
        </div>
      </div>
      <div className="bg-white rounded-xl p-5 shadow-sm flex items-center gap-3">
        <ChefHat className="text-recipia-red" />
        <div>
          <p className="text-2xl font-bold text-gray-900">Recipia</p>
          <p className="text-sm text-gray-500">Moderate content in the Recipes tab</p>
        </div>
      </div>
    </div>
  );
}

function UsersTab({ users, admin, onPromote, onRemoveAdmin, onDelete }) {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const filtered = users.filter((u) => {
    const matchesSearch =
      !search || u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase());
    const matchesRole =
      roleFilter === "all" ||
      (roleFilter === "admin" && u.roles?.includes("admin")) ||
      (roleFilter === "user" && !u.roles?.includes("admin"));
    return matchesSearch && matchesRole;
  });

  const isSelf = (id) => id === admin._id;

  return (
    <div>
      <div className="bg-white rounded-xl p-4 shadow-sm mb-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-recipia-red"
          />
        </div>
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
          <option value="all">All roles</option>
          <option value="admin">Admins only</option>
          <option value="user">Users only</option>
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-gray-400 text-left">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Roles</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={4} className="text-center text-gray-400 py-8">No users match your filters.</td></tr>
            ) : filtered.map((u) => (
              <tr key={u._id} className="border-t border-gray-100">
                <td className="px-4 py-3 font-semibold text-gray-800">
                  {u.name} {u.isOfficial && <BadgeCheck size={13} className="inline text-recipia-red ml-1" />} {isSelf(u._id) && <span className="text-xs text-gray-400 ml-1">(You)</span>}
                </td>
                <td className="px-4 py-3 text-gray-500">{u.email}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${u.roles?.includes("admin") ? "bg-amber-100 text-amber-700" : "bg-blue-50 text-blue-700"}`}>
                    {u.roles?.join(", ") || "user"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {isSelf(u._id) ? (
                    <span className="text-gray-400 italic text-xs">Your account</span>
                  ) : (
                    <div className="flex gap-2">
                      {!u.roles?.includes("admin") ? (
                        <button onClick={() => onPromote(u._id)} className="text-xs font-semibold text-green-700 bg-green-50 px-2.5 py-1 rounded-lg">Make Admin</button>
                      ) : (
                        <button onClick={() => onRemoveAdmin(u._id)} className="text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg">Remove Admin</button>
                      )}
                      <button onClick={() => onDelete(u._id)} className="text-xs font-semibold text-recipia-red bg-red-50 px-2.5 py-1 rounded-lg">Delete</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RecipesTab() {
  const [recipes, setRecipes] = useState([]);
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get("/admin/recipes", { params: { status } }).then((res) => setRecipes(res.data.recipes)).finally(() => setLoading(false));
  }, [status]);

  const remove = async (id) => {
    if (!window.confirm("Remove this recipe? This cannot be undone.")) return;
    await api.delete(`/admin/recipes/${id}`);
    setRecipes((rs) => rs.filter((r) => r._id !== id));
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
          <option value="all">All recipes</option>
          <option value="published">Published only</option>
          <option value="draft">Drafts only</option>
        </select>
      </div>

      {loading ? (
        <p className="text-gray-400">Loading...</p>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-gray-400 text-left">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Author</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Saves</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {recipes.length === 0 ? (
                <tr><td colSpan={5} className="text-center text-gray-400 py-8">No recipes found.</td></tr>
              ) : recipes.map((r) => (
                <tr key={r._id} className="border-t border-gray-100">
                  <td className="px-4 py-3 font-semibold text-gray-800">{r.title}</td>
                  <td className="px-4 py-3 text-gray-500 flex items-center gap-1">
                    {r.author?.name} {r.author?.isOfficial && <BadgeCheck size={13} className="text-recipia-red" />}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${r.isDraft ? "bg-gray-100 text-gray-500" : "bg-green-50 text-green-700"}`}>
                      {r.isDraft ? "Draft" : "Published"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{r.saveCount}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => remove(r._id)} className="flex items-center gap-1 text-xs font-semibold text-recipia-red bg-red-50 px-2.5 py-1 rounded-lg">
                      <Trash2 size={13} /> Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}


function ReportsTab() {
  const [reports, setReports] = useState([]);
  const [status, setStatus] = useState("open");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get("/admin/reports", { params: { status } }).then((res) => setReports(res.data.reports)).finally(() => setLoading(false));
  }, [status]);

  const setReportStatus = async (id, newStatus) => {
    await api.put(`/admin/reports/${id}`, { status: newStatus });
    setReports((rs) => rs.filter((r) => r._id !== id));
  };

  return (
    <div>
      <select value={status} onChange={(e) => setStatus(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm mb-4">
        <option value="open">Open</option>
        <option value="resolved">Resolved</option>
        <option value="dismissed">Dismissed</option>
        <option value="all">All</option>
      </select>

      {loading ? <p className="text-gray-400">Loading...</p> : reports.length === 0 ? (
        <p className="text-gray-400 text-center py-8">No reports.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {reports.map((r) => (
            <div key={r._id} className="bg-white rounded-xl p-4 shadow-sm">
              <p className="font-semibold text-gray-800">{r.recipe?.title || "Recipe removed"}</p>
              <p className="text-xs text-gray-400 mb-2">Reported by {r.reporter?.name} ({r.reporter?.email})</p>
              <p className="text-sm text-gray-600 mb-3">{r.reason}</p>
              {r.status === "open" && (
                <div className="flex gap-2">
                  <button onClick={() => setReportStatus(r._id, "resolved")} className="text-xs font-semibold text-green-700 bg-green-50 px-2.5 py-1 rounded-lg">Mark resolved</button>
                  <button onClick={() => setReportStatus(r._id, "dismissed")} className="text-xs font-semibold text-gray-500 bg-gray-50 px-2.5 py-1 rounded-lg">Dismiss</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}