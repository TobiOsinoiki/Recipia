import logo from "../assets/logo.png";
import spat from "../assets/spat.webp";
import cook from "../assets/cook.png";
export default function About() {
  const features = [
    {title: "Upload Recipes", desc: "Share your dishes with the community, and save incomplete ones as drafts." },
    {title: "Save & Organize", desc: "Heart recipes to your Favorites, and build custom public or private collections." },
    {title: "Comment & Reply", desc: "Discuss recipes with threaded comments— even on your own uploads." },
    {title: "Follow Cooks", desc: "Follow other users that match your immaculate tastes." },
  ];

  return (
    <div className="aboutback min-h-screen py-12"   style={{ backgroundImage: `url(${cook})` }} >
      <div className="max-w-6xl mx-auto px-5 flex items-center gap-10">

      
        <div className="about rounded-2xl shadow-lg p-8 flex-1">
          <h1 className="logo text-3xl font-extrabold text-recipia-red mb-3 flex items-center">
            About 
            <img 
              src={logo} 
              alt="Recipia logo" 
              className="w-11 h-11 object-contain -mr-4 mb-2"
            />
            ecipia
          </h1>

          <p className="leading-relaxed mb-4">
            Recipia is a social platform for home cooks, aspiring chefs and anyone who wants to upload their own recipes, discuss dishes and organize favourite recipes into collections you can keep private or share with the world. We all love food, let's learn and share together, yeah?
          </p>

          <p className="leading-relaxed mb-8">
            Create a free account to unlock the full recipe library, follow other cooks, and start building your own public profile.
          </p>

          <div className="space-y-5">
  {features.map((f, index) => (
    <div 
      key={f.title} 
      className={`flex items-start gap-5 group ${
        index % 2 === 0 ? "ml-0" : "md:ml-8"
      }`}
    >
        <div className="flex flex-col items-center">
        <div className="w-10 h-10 rounded-full bg-recipia-red text-white flex items-center justify-center font-bold shadow-md">
          {String(index + 1).padStart(2, "0")}
        </div>

        {index !== features.length - 1 && (
          <div className="w-px h-12 bg-red-200 mt-2"></div>
        )}
      </div>

      {/* Feature text */}
      <div className="pb-4">
        <h3 className="font-bold text-gray-800 text-lg group-hover:text-recipia-red transition">
          {f.title}
        </h3>
        <p className="text-sm text-gray-500 max-w-md leading-relaxed">
          {f.desc}
        </p>
      </div>
    </div>
  ))}
</div>        </div>

        {/* Image */}
        <div className="hidden md:block flex-1">
          <img 
            src={spat}
            alt="Cooking illustration"
            className="cook-image w-full max-w-md mx-auto object-contain"
          />
        </div>

      </div>
    </div>
  );
}