import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Upload, Heart, Users as UsersIcon, Lock, Search, BadgeCheck } from "lucide-react";
import api from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";
import RecipeCard from "../components/RecipeCard.jsx";
import cook3 from "../assets/cook3.png";
import food1 from "../assets/food1.png";
import food2 from "../assets/food2.png";
import food3 from "../assets/food3.png";
import food4 from "../assets/food4.png";
import food5 from "../assets/food5.png";

import food17 from "../assets/food17.png";
import food9 from "../assets/food9.png";
import food10 from "../assets/food10.png";
import food11 from "../assets/food11.png";
import food12 from "../assets/food12.png";
import food13 from "../assets/food13.png";
import food14 from "../assets/food14.png";
import food15 from "../assets/food15.png";
import food16 from "../assets/food16.png";
import logo from "../assets/logo.png";
const CATEGORIES  = ["All", "Breakfast", "Lunch", "Dinner", "Dessert", "Snack"];
const DIFFICULTIES = ["All", "Easy", "Medium", "Hard"];

export default function Home() {
  const { user } = useAuth();
  const [tab,        setTab]        = useState("recipes");
  const [recipes,    setRecipes]    = useState([]);
  const [people,     setPeople]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState("");
  const [category,   setCategory]   = useState("All");
  const [cuisine,    setCuisine]    = useState("");
  const [difficulty, setDifficulty] = useState("All");
  const [tags,       setTags]       = useState("");
  const [ingredient, setIngredient] = useState("");
  const [sort,       setSort]       = useState("recent");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (!user) {
      setLoading(true);
      api.get("/recipes").then((res) => setRecipes(res.data.recipes)).finally(() => setLoading(false));
      return;
    }
    setLoading(true);
    if (tab === "people") {
      if (!search.trim()) { setPeople([]); setLoading(false); return; }
      api.get("/users/search", { params: { q: search } })
        .then((res) => setPeople(res.data.users))
        .finally(() => setLoading(false));
    } else {
      const params = {
        search, sort,
        category:   category   !== "All" ? category   : "",
        cuisine,
        difficulty: difficulty !== "All" ? difficulty : "",
        tags, ingredient,
      };
      api.get("/recipes", { params })
        .then((res) => setRecipes(res.data.recipes))
        .finally(() => setLoading(false));
    }
  }, [user, tab, search, category, cuisine, difficulty, tags, ingredient, sort]);



const LEFT_IMAGES  = [food1,  food3,  food4,  food5,  food9,  food12, food13];
const RIGHT_IMAGES = [food2,  food10, food11, food14, food15, food16, food17];


const ROTATIONS = [ 12, -10,  8, -14, 16,  -8, 20, -12, 10, -16,  6, 18, -6, 14];
const DURATIONS = [5.0, 5.4, 5.8, 4.8, 6.2, 5.2, 5.6, 4.6, 6.0, 5.1, 5.3, 5.5, 4.9, 6.1];
const DELAYS    = [0.0, 0.8, 1.2, 0.5, 0.3, 1.4, 0.7, 0.9, 1.5, 0.6, 1.1, 0.4, 1.8, 0.2];

const SLOT_PX   = 100;   
const MIN_SLOTS =   10;   

function FloatingFoods() {
  const [slots, setSlots] = useState(MIN_SLOTS);

  useEffect(() => {
    const update = () => {
     const h = window.innerHeight;
      setSlots(Math.max(MIN_SLOTS, Math.ceil(h / SLOT_PX)));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(document.body);
    return () => ro.disconnect();
  }, []);

  const tops = Array.from({ length: slots }, (_, i) =>
    slots === 1 ? 50 : 5 + (i / (slots - 1)) * 90   
  );

  return (
    <div className="ff-wrap" aria-hidden="true" >
      {tops.map((topPct, i) => {
        const rot1  = ROTATIONS[ i          % ROTATIONS.length];
        const rot2  = ROTATIONS[(i + 7)     % ROTATIONS.length];
        const dur1  = DURATIONS[ i          % DURATIONS.length];
        const dur2  = DURATIONS[(i + 7)     % DURATIONS.length];
        const del1  = DELAYS[    i          % DELAYS.length];
        const del2  = DELAYS[   (i + 7)     % DELAYS.length];
        const lSrc  = LEFT_IMAGES [ i % LEFT_IMAGES.length];
        const rSrc  = RIGHT_IMAGES[ i % RIGHT_IMAGES.length];

        return [
          // LEFT
          <img
            key={`l-${i}`}
            src={lSrc}
            alt=""
            className="ff"
            style={{
              top:       `${topPct}%`,
              left:      "-0px",
              width:     "300px",
              "--rot":   `${rot1}deg`,
              animation: `ffloat ${dur1}s ease-in-out ${del1}s infinite`,
            }}
          />,
          // RIGHT
          <img
            key={`r-${i}`}
            src={rSrc}
            alt=""
            className="ff"
            style={{
              top:       `${topPct}%`,
              right:     "-0px",
              width:     "300px",
              "--rot":   `${rot2}deg`,
              animation: `ffloat ${dur2}s ease-in-out ${del2}s infinite`,
            }}
          />,
        ];
      })}
    </div>
  );
}
  const floats = <FloatingFoods />;

  if (!user) {
    return (
       <div className="homeback min-h-screen"  >
      <div className="home-page">
        {floats}
        <div className="home-page-inner">

 
<section
  className="homback home-hero px-6 py-16 text-white relative overflow-hidden"
  style={{
    backgroundImage: `
        linear-gradient(rgba(76, 40, 40, 0.55), rgba(103, 55, 55, 0.65)),
      url(${cook3})
    `,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat"
  }}
>
       <div className="max-w-5xl mx-auto relative z-10 bg-white/5 backdrop-blur-sm p-6 sm:p-8 rounded-2xl">     
            <div className="max-w-5xl mx-auto relative z-10">
<h1 className="font-extrabold leading-tight drop-shadow-xl text-center sm:text-left">
  
  <span className="logotext text-recipia-red tracking-tight flex items-center justify-center sm:justify-start">
    
    <img 
      src={logo} 
      alt="Recipia logo" 
      className="w-16 h-16 sm:w-24 sm:h-24 md:w-28 md:h-28 object-contain"
    />

    <span className="-ml-7 sm:-ml-8 mt-6">
      ecipia
    </span>

  </span>

  <span className="block text-3xl sm:text-5xl md:text-6xl mt-2">
    Discover, Cook, Share
  </span>

</h1>

<p className="text-lg sm:text-xl opacity-95 max-w-xl mb-10 text-gray-100">
  Recipia is a community of home cooks sharing, saving, and discussing their favourite recipes.
  Create a free account to unlock the full library.
</p>
              <div className="flex flex-wrap gap-4">
               <Link
  to="/register"
  className="bg-white text-recipia-red font-extrabold px-8 py-4 rounded-2xl shadow-xl hover:scale-105 hover:bg-gray-100 transition-all"
>
  Create free account
</Link>
              <Link
  to="/login"
  className="border-2 border-white/80 font-bold px-8 py-4 rounded-2xl backdrop-blur-md bg-white/10 hover:bg-white/20 hover:scale-105 transition-all"
>
  Log in
</Link>
              </div>
            </div>
            </div>
          </section>

<section className="rcp-points">
  <span className="rcp-points__rule" aria-hidden="true" />

  <ul className="rcp-points__list">
    {[
      { Icon: Upload,     tint: "green", title: "Upload your recipes", text: "Share what you cook in a couple of taps." },
      { Icon: Heart,      tint: "red",   title: "Save & organize",     text: "Keep every favourite in one tidy place." },
      { Icon: UsersIcon,  tint: "green", title: "Follow other cooks",  text: "Build a feed of people you actually cook like." },
    ].map(({ Icon, tint, title, text }) => (
      <li key={title} className={`rcp-point rcp-point--${tint}`}>
        <span className="rcp-point__badge">
          <Icon size={22} strokeWidth={2.2} />
        </span>
        <h3 className="rcp-point__title">{title}</h3>
        <p className="rcp-point__text">{text}</p>
      </li>
    ))}
  </ul>
</section>


               <section className="max-w-5xl mx-auto px-6 pb-16">
            <div className="flex items-center justify-between mb-5">
              <h2 className="pop text-3xl font-bold text-gray-800">Popular recipes</h2>
            
            </div>
            {loading ? <p className="text-gray-500">Loading...</p> : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {recipes.map((r, i) => (
                  <div key={r._id} className="card-reveal" style={{ animationDelay: `${i * 0.07}s` }}>
                    <RecipeCard recipe={r} />
                  </div>
                ))}
              </div>
            )}
            <div className="text-center mt-10">
           <Link
  to="/register"
  className="inline-flex items-center justify-center text-center whitespace-normal max-w-[90%] mx-auto bg-recipia-red text-white font-bold px-8 py-3 rounded-xl hover:bg-recipia-redDark transition-colors shadow"
>
  Unlock the full recipe library
</Link>

            </div>
          </section>
        </div>
      </div>
      </div>
    );
  }
// const base = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. ";
// const targetWords = 100000;

// let text = "";
// let count = 0;

// while (count < targetWords) {
//   text += base;
//   count += base.split(" ").length;
// }
  /* ═══ LOGGED-IN VIEW ════════════════════════════════════════════════ */
  return (
     <div className="homeback" >
    <div className="home-page">
      {floats}
      <div className="home-page-inner">

        {/* Search / filter bar */}
        <section className ="homback px-6 py-16 text-black relative overflow-hidden"  style={{
    backgroundImage: `
      url(${cook3})
    `,
  
  }} >
      

            
 

       <div className="max-w-5xl mx-auto relative z-10 bg-white/5 backdrop-blur-sm p-6 sm:p-8 rounded-2xl">  
            <div className="flex items-center gap-2 mb-4">
              <h1 className="text-2xl font-extrabold text-gray-900 flex-1">
                {tab === "recipes" ? "Discover Delicious Recipes" : "Find Other Cooks"}
              </h1>
              <div className="flex bg-gray-100 rounded-lg p-1 text-sm font-semibold">
                <button onClick={() => setTab("recipes")} className={`px-3 py-1.5 rounded-md transition-colors ${tab === "recipes" ? "bg-white shadow-sm text-recipia-red" : "text-gray-500"}`}>Recipes</button>
                <button onClick={() => setTab("people")}  className={`px-3 py-1.5 rounded-md transition-colors ${tab === "people"  ? "bg-white shadow-sm text-recipia-red" : "text-gray-500"}`}>People</button>
              </div>
            </div>

            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={tab === "recipes" ? "Search recipes, ingredients..." : "Search people by name..."}
                className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:border-recipia-red bg-white"
              />
            </div>

            {tab === "recipes" && (
              <>
                <div className="flex gap-2 flex-wrap mt-4">
                  {CATEGORIES.map((c) => (
                    <button
                      key={c}
                      onClick={() => setCategory(c)}
                      className={`px-4 py-1.5 rounded-full text-sm font-semibold border-2 transition-colors ${
                        category === c
                          ? "bg-recipia-red border-recipia-red text-white"
                          : "border-gray-200 text-gray-500 hover:border-recipia-red hover:text-recipia-red bg-white/70"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                  <button
                    onClick={() => setShowFilters((s) => !s)}
                    className="px-4 py-1.5 rounded-full text-sm font-semibold border-2 border-gray-200 text-gray-500 hover:border-recipia-red hover:text-recipia-red bg-white/70 transition-colors"
                  >
                    {showFilters ? "Hide filters" : "More filters"}
                  </button>
                </div>

                {showFilters && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                    <input value={cuisine}    onChange={(e) => setCuisine(e.target.value)}    placeholder="Cuisine"           className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white" />
                    <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white">
                      {DIFFICULTIES.map((d) => <option key={d}>{d}</option>)}
                    </select>
                    <input value={tags}       onChange={(e) => setTags(e.target.value)}       placeholder="Tags (comma sep.)" className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white" />
                    <input value={ingredient} onChange={(e) => setIngredient(e.target.value)} placeholder="Has ingredient"    className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white" />
                  </div>
                )}

                <div className="mt-4">
                  <select value={sort} onChange={(e) => setSort(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white">
                    <option value="recent">Most recent</option>
                    <option value="popular">Most popular</option>
                  </select>
                </div>
              </>
            )}
          </div>
        </section>

        {/* Results */}
        <section className="max-w-5xl mx-auto px-6 py-8">
          {loading ? (
            <p className="text-gray-500 lorem">Loading...</p>
        


          ) : tab === "recipes" ? (
            recipes.length === 0 ? (
              <p className="text-center text-gray-400 py-16">Sorry, no recipes match your search</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {recipes.map((r, i) => (
                  <div key={r._id} className="card-reveal" style={{ animationDelay: `${i * 0.06}s` }}>
                    <RecipeCard recipe={r} />
                  </div>
                ))}
              </div>
            )
          ) : people.length === 0 ? (
            <p className="text-center text-gray-400 py-16">{search ? "No users match your search." : "Search for a name to find other cooks."}</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {people.map((p) => (
                <Link key={p._id} to={`/profile/${p._id}`} className="bg-white/85 backdrop-blur-sm rounded-xl p-4 shadow-sm hover:shadow-md transition flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-recipia-yellow flex items-center justify-center text-sm font-bold text-recipia-olive overflow-hidden shrink-0">
                    {p.profilePicture ? <img src={p.profilePicture} alt={p.name} className="w-full h-full object-cover" /> : p.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-gray-800 flex items-center gap-1 truncate">
                      {p.name} {p.isOfficial && <BadgeCheck size={14} className="text-recipia-red shrink-0" />}
                    </p>
                    <p className="text-xs text-gray-400 truncate">{p.bio || "No bio yet"}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
    </div>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div className="feature-card">
      <div className="feature-card-icon">{icon}</div>
      <h3 className="font-bold text-gray-800 mb-1">{title}</h3>
      <p className="text-sm text-gray-500">{desc}</p>
    </div>
  );
}
