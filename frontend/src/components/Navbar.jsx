import { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Menu, X, Bell } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import NotificationsDropdown from "./NotificationsDropdown.jsx";
import api from "../api.js";
import logo from "../assets/logo.png";

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [unread, setUnread] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    const load = () => api.get("/notifications/unread-count").then((res) => setUnread(res.data.count)).catch(() => {});
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate("/");
    setOpen(false);
  };

  const linkClass = ({ isActive }) =>
    `text-sm font-semibold transition-colors ${isActive ? "text-recipia-red" : "text-gray-600 hover:text-recipia-red"}`;

  return (
    <nav className="nav sticky top-0 z-50  border-b shadow-sm">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="logo text-xl font-extrabold text-recipia-red tracking-tight flex items-center">
  <img 
    src={logo} 
    alt="Recipia logo" 
    className="w-9 h-9 object-contain -mr-4 mb-2"
  />
  ecipia
</Link>

        <button className="md:hidden" onClick={() => setOpen((o) => !o)}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>

        <div className="hidden md:flex items-center gap-7">
          <NavLink to="/" end className={linkClass}>Browse</NavLink>
          {user && <NavLink to="/dashboard" className={linkClass}>Dashboard</NavLink>}
          {user && <NavLink to="/collections" className={linkClass}>Collections</NavLink>}
          <NavLink to="/about" className={linkClass}>About</NavLink>
          {isAdmin && <NavLink to="/admin-dashboard" className={linkClass}>Admin</NavLink>}

          {user ? (
            <div className="flex items-center gap-4 pl-3 border-l border-gray-200">
              <div className="relative">
                <button onClick={() => setShowNotifs((s) => !s)} className="relative text-gray-500 hover:text-recipia-red">
                  <Bell size={20} />
                  {unread > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-recipia-red text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                      {unread > 9 ? "9+" : unread}
                    </span>
                  )}
                </button>
                {showNotifs && (
                  <NotificationsDropdown
                    onClose={() => setShowNotifs(false)}
                    onRead={() => setUnread(0)}
                  />
                )}
              </div>

              <Link to={`/profile/${user._id}`} className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-recipia-yellow flex items-center justify-center text-xs font-bold text-recipia-olive overflow-hidden">
                  {user.profilePicture ? (
                    <img src={user.profilePicture} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    user.name?.charAt(0).toUpperCase()
                  )}
                </div>
                <span className="text-sm font-semibold text-gray-700">{user.name}</span>
              </Link>
              <button onClick={handleLogout} className="text-sm font-semibold text-gray-500 hover:text-recipia-red">
                Log out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
              <Link to="/login" className="text-sm font-semibold text-gray-600 hover:text-recipia-red">Log in</Link>
              <Link to="/register" className="text-sm font-semibold bg-recipia-red text-white px-4 py-2 rounded-lg hover:bg-recipia-redDark transition-colors">
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>

      {open && (
        <div className="md:hidden px-6 pb-4 flex flex-col gap-3 bg-white border-t border-gray-100">
          <NavLink to="/" end className={linkClass} onClick={() => setOpen(false)}>Browse</NavLink>
          {user && <NavLink to="/dashboard" className={linkClass} onClick={() => setOpen(false)}>Dashboard</NavLink>}
          {user && <NavLink to="/collections" className={linkClass} onClick={() => setOpen(false)}>Collections</NavLink>}
          <NavLink to="/about" className={linkClass} onClick={() => setOpen(false)}>About</NavLink>
          {isAdmin && <NavLink to="/admin-dashboard" className={linkClass} onClick={() => setOpen(false)}>Admin</NavLink>}
          {user ? (
            <button onClick={handleLogout} className="text-left text-sm font-semibold text-gray-500">Log out</button>
          ) : (
            <>
              <Link to="/login" className={linkClass} onClick={() => setOpen(false)}>Log in</Link>
              <Link to="/register" className={linkClass} onClick={() => setOpen(false)}>Sign up</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}