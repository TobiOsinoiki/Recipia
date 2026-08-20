import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import connectDB from "../Config/db.js";
import User from "../models/User.js";
import Recipe from "../models/Recipe.js";

dotenv.config();

const KITCHEN_EMAIL = "kitchen@recipia.app";
const KITCHEN_NAME = "Recipia Kitchen";

const CATEGORY_TEMPLATES = {
  Breakfast: {
    ingredientPool: ["eggs", "milk", "flour", "butter", "sugar", "oats", "baking powder", "salt", "vanilla extract", "fresh fruit", "cinnamon"],
    instructionPool: [
      "Preheat your pan or oven and prepare your baking dish or skillet.",
      "Mix the dry ingredients together in a large bowl.",
      "Whisk the wet ingredients together in a separate bowl until smooth.",
      "Combine wet and dry ingredients, stirring just until incorporated.",
      "Cook over medium heat, flipping or checking doneness as needed.",
      "Serve warm with your favorite toppings.",
    ],
  },
  Lunch: {
    ingredientPool: ["mixed greens", "chicken breast", "olive oil", "lemon juice", "garlic", "tomatoes", "cucumber", "feta cheese", "bread", "mustard"],
    instructionPool: [
      "Prep all vegetables and proteins, chopping to bite-sized pieces.",
      "Cook the protein in a hot pan with a little oil until done through.",
      "Toss the greens and vegetables together in a large bowl.",
      "Whisk together the dressing ingredients.",
      "Combine everything and toss well, or assemble as a sandwich/wrap.",
      "Season to taste and serve immediately.",
    ],
  },
  Dinner: {
    ingredientPool: ["onion", "garlic", "olive oil", "protein of choice", "canned tomatoes", "stock", "herbs", "rice or pasta", "salt", "pepper"],
    instructionPool: [
      "Heat oil in a large pot or pan over medium heat.",
      "Sauté the onion and garlic until fragrant and translucent.",
      "Add the main protein and cook until browned on all sides.",
      "Stir in remaining ingredients and bring to a simmer.",
      "Cover and cook until everything is tender and flavors have melded.",
      "Taste, adjust seasoning, and serve hot.",
    ],
  },
  Dessert: {
    ingredientPool: ["flour", "sugar", "butter", "eggs", "vanilla extract", "baking powder", "chocolate", "milk", "salt", "cocoa powder"],
    instructionPool: [
      "Preheat the oven and prepare your baking pan.",
      "Cream the butter and sugar together until light and fluffy.",
      "Beat in the eggs one at a time, then the vanilla.",
      "Fold in the dry ingredients until just combined.",
      "Pour or spoon into the prepared pan and bake until set.",
      "Cool before slicing and serving.",
    ],
  },
  Snack: {
    ingredientPool: ["nuts", "oats", "honey", "dried fruit", "seeds", "chickpeas", "olive oil", "spices", "yogurt", "crackers"],
    instructionPool: [
      "Preheat the oven if baking, or prepare a mixing bowl if not.",
      "Combine all ingredients together thoroughly.",
      "Spread onto a lined baking sheet if applicable.",
      "Bake or chill until set, checking periodically.",
      "Cool completely before breaking into pieces or portioning.",
      "Store in an airtight container.",
    ],
  },
};

const CUISINES = ["Italian", "Mexican", "Indian", "Thai", "French", "Japanese", "Mediterranean", "American", "Chinese", "Middle Eastern"];
const DIFFICULTIES = ["Easy", "Medium", "Hard"];

const DISHES_BY_CATEGORY = {
  Breakfast: [
    "Skillet Frittata", "Golden Pancakes", "Overnight Oats", "Shakshuka", "French Toast",
    "Breakfast Burrito", "Granola Bowl", "Veggie Omelette", "Banana Bread", "Avocado Toast",
  ],
  Lunch: [
    "Cobb Salad", "Chicken Caesar Wrap", "Tomato Basil Soup", "Grilled Cheese", "Quinoa Bowl",
    "Falafel Pita", "BLT Sandwich", "Caprese Salad", "Lentil Soup", "Turkey Club",
  ],
  Dinner: [
    "Roast Chicken", "Beef Stir Fry", "Vegetable Curry", "Baked Salmon", "Spaghetti Bolognese",
    "Butter Chicken", "Fish Tacos", "Stuffed Peppers", "Pad Thai", "Ratatouille",
  ],
  Dessert: [
    "Chocolate Chip Cookies", "Apple Pie", "Tiramisu", "Cheesecake", "Brownies",
    "Panna Cotta", "Lemon Bars", "Carrot Cake", "Creme Brulee", "Rice Pudding",
  ],
  Snack: [
    "Trail Mix", "Energy Bites", "Hummus & Veggies", "Popcorn Mix", "Roasted Chickpeas",
    "Fruit & Yogurt Parfait", "Cheese & Crackers", "Spiced Nuts", "Granola Bars", "Veggie Chips",
  ],
};

function pick(arr, n) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

function buildRecipe(title, category, cuisine, difficulty, index) {
  const template = CATEGORY_TEMPLATES[category];
  const ingredients = pick(template.ingredientPool, 6 + (index % 3)).map(
    (item, i) => `${1 + (i % 3)} ${["cup", "tbsp", "tsp", "piece(s)"][i % 4]} ${item}`
  );

  return {
    title: `${cuisine} ${title}`,
    description: `A ${difficulty.toLowerCase()}-difficulty ${cuisine.toLowerCase()}-inspired ${category.toLowerCase()} dish from the Recipia Kitchen team, built for reliable results every time.`,
    category,
    cuisine,
    tags: [cuisine.toLowerCase(), category.toLowerCase(), difficulty.toLowerCase()],
    image: "",
    prepTime: String(10 + (index % 4) * 5),
    cookTime: String(15 + (index % 5) * 5),
    servings: 2 + (index % 4),
    difficulty,
    ingredients,
    instructions: template.instructionPool,
    isDraft: false,
  };
}

async function seed() {
  await connectDB();

  let kitchen = await User.findOne({ email: KITCHEN_EMAIL });
  if (!kitchen) {
    const hashed = await bcrypt.hash("b00m$haka1aka", 10);
    kitchen = await User.create({
      name: KITCHEN_NAME,
      email: KITCHEN_EMAIL,
      password: hashed,
      bio: "The official Recipia team account. We publish tested, reliable recipes for the whole community.",
      isOfficial: true,
      isVerified: true,
      roles: ["user"],
    });
  
  }

  const existingCount = await Recipe.countDocuments({ author: kitchen._id });
  if (existingCount >= 100) {
    console.log(`Official account already has ${existingCount} recipes. Skipping seed.`);
    await mongoose.disconnect();
    return;
  }

  const recipesToCreate = [];
  let index = 0;
  for (const [category, dishes] of Object.entries(DISHES_BY_CATEGORY)) {
    for (const dish of dishes) {
    
      for (let variant = 0; variant < 2; variant++) {
        const cuisine = CUISINES[index % CUISINES.length];
        const difficulty = DIFFICULTIES[index % DIFFICULTIES.length];
        recipesToCreate.push({ ...buildRecipe(dish, category, cuisine, difficulty, index), author: kitchen._id });
        index++;
      }
    }
  }

  await Recipe.insertMany(recipesToCreate.slice(0, 100));
  console.log(`Seeded ${Math.min(recipesToCreate.length, 100)} official recipes for ${KITCHEN_NAME}.`);

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});