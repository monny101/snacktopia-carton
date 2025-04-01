import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

// Categories data
const categories = [
  { name: "Snacks", description: "Delicious snacks and treats" },
  { name: "Biscuits", description: "Crispy and tasty biscuits" },
  { name: "Detergents", description: "Cleaning products for your home" },
  { name: "Beverages", description: "Refreshing drinks and beverages" },
  { name: "Groceries", description: "Essential grocery items" },
];

// Subcategories data
const subcategories = [
  {
    name: "Candies",
    category_index: 0,
    description: "Sweet treats and candies",
  },
  {
    name: "Chocolates",
    category_index: 0,
    description: "Delicious chocolate products",
  },
  { name: "Chips", category_index: 0, description: "Crispy and savory chips" },
  {
    name: "Sweet Biscuits",
    category_index: 1,
    description: "Sweet and delicious biscuits",
  },
  {
    name: "Crackers",
    category_index: 1,
    description: "Savory crackers and biscuits",
  },
  {
    name: "Cookies",
    category_index: 1,
    description: "Homestyle cookies and treats",
  },
  {
    name: "Laundry Detergents",
    category_index: 2,
    description: "Products for clean clothes",
  },
  {
    name: "Dish Soaps",
    category_index: 2,
    description: "Products for clean dishes",
  },
  {
    name: "Surface Cleaners",
    category_index: 2,
    description: "Products for clean surfaces",
  },
  {
    name: "Soft Drinks",
    category_index: 3,
    description: "Carbonated beverages",
  },
  { name: "Juices", category_index: 3, description: "Fruit juices and drinks" },
  { name: "Water", category_index: 3, description: "Bottled water products" },
  {
    name: "Rice & Pasta",
    category_index: 4,
    description: "Rice, pasta and grains",
  },
  {
    name: "Canned Foods",
    category_index: 4,
    description: "Preserved and canned foods",
  },
  {
    name: "Cooking Oils",
    category_index: 4,
    description: "Cooking oils and condiments",
  },
];

// Products data
const products = [
  // Candies
  {
    name: "Fruit Chews Assorted",
    description:
      "Chewy fruit-flavored candies in various flavors including strawberry, orange, and grape.",
    price: 850,
    quantity: 100,
    image_url:
      "https://images.unsplash.com/photo-1581798459219-306262b46c8f?w=600&q=80",
    subcategory_index: 0,
    featured: true,
  },
  {
    name: "Mint Drops",
    description: "Refreshing mint-flavored hard candies that freshen breath.",
    price: 550,
    quantity: 150,
    image_url:
      "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=600&q=80",
    subcategory_index: 0,
    featured: false,
  },
  // Chocolates
  {
    name: "Milk Chocolate Bar",
    description: "Smooth and creamy milk chocolate bar, perfect for snacking.",
    price: 1200,
    quantity: 80,
    image_url:
      "https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=600&q=80",
    subcategory_index: 1,
    featured: true,
  },
  {
    name: "Chocolate Truffles Box",
    description:
      "Assorted chocolate truffles with different fillings in an elegant box.",
    price: 3500,
    quantity: 40,
    image_url:
      "https://images.unsplash.com/photo-1526081347589-7fa3cb873804?w=600&q=80",
    subcategory_index: 1,
    featured: false,
  },
  // Chips
  {
    name: "Potato Chips Original",
    description: "Crispy potato chips with just the right amount of salt.",
    price: 750,
    quantity: 120,
    image_url:
      "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=600&q=80",
    subcategory_index: 2,
    featured: true,
  },
  {
    name: "Spicy Plantain Chips",
    description: "Crunchy plantain chips with a spicy kick.",
    price: 850,
    quantity: 90,
    image_url:
      "https://images.unsplash.com/photo-1621607512214-68297480165e?w=600&q=80",
    subcategory_index: 2,
    featured: false,
  },
  // Sweet Biscuits
  {
    name: "Cream Sandwich Biscuits",
    description: "Delicious sandwich biscuits with vanilla cream filling.",
    price: 650,
    quantity: 110,
    image_url:
      "https://images.unsplash.com/photo-1531685932387-e60fae5f6163?w=600&q=80",
    subcategory_index: 3,
    featured: true,
  },
  {
    name: "Chocolate Coated Biscuits",
    description: "Crunchy biscuits coated with rich milk chocolate.",
    price: 950,
    quantity: 75,
    image_url:
      "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&q=80",
    subcategory_index: 3,
    featured: false,
  },
  // Crackers
  {
    name: "Salted Crackers",
    description:
      "Thin, crispy salted crackers perfect for snacking or with toppings.",
    price: 550,
    quantity: 130,
    image_url:
      "https://images.unsplash.com/photo-1590005354167-6da97870c757?w=600&q=80",
    subcategory_index: 4,
    featured: false,
  },
  {
    name: "Cheese Flavored Crackers",
    description: "Savory crackers with rich cheese flavor.",
    price: 750,
    quantity: 95,
    image_url:
      "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=600&q=80",
    subcategory_index: 4,
    featured: true,
  },
  // Cookies
  {
    name: "Chocolate Chip Cookies",
    description: "Classic cookies loaded with chocolate chips.",
    price: 850,
    quantity: 85,
    image_url:
      "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=600&q=80",
    subcategory_index: 5,
    featured: true,
  },
  {
    name: "Oatmeal Raisin Cookies",
    description: "Hearty oatmeal cookies with sweet raisins.",
    price: 800,
    quantity: 70,
    image_url:
      "https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=600&q=80",
    subcategory_index: 5,
    featured: false,
  },
  // Laundry Detergents
  {
    name: "Premium Laundry Powder",
    description:
      "High-quality laundry detergent powder for clean, fresh clothes.",
    price: 2500,
    quantity: 60,
    image_url:
      "https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=600&q=80",
    subcategory_index: 6,
    featured: true,
  },
  {
    name: "Liquid Laundry Detergent",
    description: "Concentrated liquid detergent that removes tough stains.",
    price: 3200,
    quantity: 50,
    image_url:
      "https://images.unsplash.com/photo-1585670149967-b4f4da0bea4f?w=600&q=80",
    subcategory_index: 6,
    featured: false,
  },
  // Dish Soaps
  {
    name: "Dish Washing Liquid",
    description:
      "Effective dish soap that cuts through grease and food residue.",
    price: 1800,
    quantity: 75,
    image_url:
      "https://images.unsplash.com/photo-1622398925373-3f91b1e275f5?w=600&q=80",
    subcategory_index: 7,
    featured: true,
  },
  {
    name: "Dishwasher Tablets",
    description: "Convenient dishwasher tablets for spotless dishes.",
    price: 2900,
    quantity: 45,
    image_url:
      "https://images.unsplash.com/photo-1622398925273-5f8c07369f6e?w=600&q=80",
    subcategory_index: 7,
    featured: false,
  },
  // Surface Cleaners
  {
    name: "Multi-Surface Cleaner",
    description: "All-purpose cleaner for various surfaces in your home.",
    price: 1500,
    quantity: 80,
    image_url:
      "https://images.unsplash.com/photo-1585421514738-01798e348b17?w=600&q=80",
    subcategory_index: 8,
    featured: false,
  },
  {
    name: "Glass Cleaner Spray",
    description: "Streak-free formula for clean, clear glass and mirrors.",
    price: 1300,
    quantity: 70,
    image_url:
      "https://images.unsplash.com/photo-1563453392212-326f5e854473?w=600&q=80",
    subcategory_index: 8,
    featured: true,
  },
  // Soft Drinks
  {
    name: "Cola Soda",
    description: "Refreshing cola carbonated beverage.",
    price: 450,
    quantity: 150,
    image_url:
      "https://images.unsplash.com/photo-1554866585-cd94860890b7?w=600&q=80",
    subcategory_index: 9,
    featured: true,
  },
  {
    name: "Lemon-Lime Soda",
    description: "Crisp and refreshing lemon-lime flavored carbonated drink.",
    price: 450,
    quantity: 140,
    image_url:
      "https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=600&q=80",
    subcategory_index: 9,
    featured: false,
  },
  // Juices
  {
    name: "Orange Juice",
    description: "100% pure orange juice, rich in vitamin C.",
    price: 950,
    quantity: 90,
    image_url:
      "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=600&q=80",
    subcategory_index: 10,
    featured: true,
  },
  {
    name: "Mixed Fruit Juice",
    description:
      "Blend of various fruits for a delicious and nutritious drink.",
    price: 1050,
    quantity: 80,
    image_url:
      "https://images.unsplash.com/photo-1589733955941-5eeaf752f6dd?w=600&q=80",
    subcategory_index: 10,
    featured: false,
  },
  // Water
  {
    name: "Mineral Water (500ml)",
    description: "Natural mineral water in a convenient 500ml bottle.",
    price: 250,
    quantity: 200,
    image_url:
      "https://images.unsplash.com/photo-1560847468-5eef330f455a?w=600&q=80",
    subcategory_index: 11,
    featured: false,
  },
  {
    name: "Sparkling Water",
    description: "Refreshing carbonated water with no added sugars.",
    price: 350,
    quantity: 120,
    image_url:
      "https://images.unsplash.com/photo-1603394630850-69b3ca8121ca?w=600&q=80",
    subcategory_index: 11,
    featured: true,
  },
  // Rice & Pasta
  {
    name: "Premium Basmati Rice",
    description: "High-quality basmati rice with aromatic flavor.",
    price: 3500,
    quantity: 50,
    image_url:
      "https://images.unsplash.com/photo-1586201375761-83865001e8ac?w=600&q=80",
    subcategory_index: 12,
    featured: true,
  },
  {
    name: "Spaghetti Pasta",
    description: "Traditional Italian spaghetti pasta.",
    price: 1200,
    quantity: 85,
    image_url:
      "https://images.unsplash.com/photo-1551462147-ff29053bfc14?w=600&q=80",
    subcategory_index: 12,
    featured: false,
  },
  // Canned Foods
  {
    name: "Canned Tomatoes",
    description: "Peeled whole tomatoes in tomato juice.",
    price: 750,
    quantity: 100,
    image_url:
      "https://images.unsplash.com/photo-1534483509719-3feaee7c30da?w=600&q=80",
    subcategory_index: 13,
    featured: false,
  },
  {
    name: "Canned Tuna",
    description: "Chunk light tuna in water, high in protein.",
    price: 950,
    quantity: 90,
    image_url:
      "https://images.unsplash.com/photo-1597131628347-c769fc631754?w=600&q=80",
    subcategory_index: 13,
    featured: true,
  },
  // Cooking Oils
  {
    name: "Extra Virgin Olive Oil",
    description:
      "Premium quality extra virgin olive oil for cooking and dressing.",
    price: 4500,
    quantity: 40,
    image_url:
      "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&q=80",
    subcategory_index: 14,
    featured: true,
  },
  {
    name: "Vegetable Oil",
    description: "All-purpose vegetable oil for cooking and frying.",
    price: 2200,
    quantity: 65,
    image_url:
      "https://images.unsplash.com/photo-1616484880726-ab8d7524b4de?w=600&q=80",
    subcategory_index: 14,
    featured: false,
  },
];

// Function to populate the database
export const populateDatabase = async () => {
  try {
    // Step 1: Insert categories
    const { data: categoriesData, error: categoriesError } = await supabase
      .from("categories")
      .insert(
        categories.map((cat) => ({
          name: cat.name,
          description: cat.description,
        })),
      )
      .select();

    if (categoriesError) {
      console.error("Error inserting categories:", categoriesError);
      toast({
        title: "Error",
        description: "Failed to insert categories",
        variant: "destructive",
      });
      return false;
    }

    console.log("Categories inserted:", categoriesData);

    // Step 2: Insert subcategories
    const subcategoriesWithIds = subcategories.map((subcat) => ({
      name: subcat.name,
      description: subcat.description,
      category_id: categoriesData[subcat.category_index].id,
    }));

    const { data: subcategoriesData, error: subcategoriesError } =
      await supabase
        .from("subcategories")
        .insert(subcategoriesWithIds)
        .select();

    if (subcategoriesError) {
      console.error("Error inserting subcategories:", subcategoriesError);
      toast({
        title: "Error",
        description: "Failed to insert subcategories",
        variant: "destructive",
      });
      return false;
    }

    console.log("Subcategories inserted:", subcategoriesData);

    // Step 3: Insert products
    const productsWithIds = products.map((product) => ({
      name: product.name,
      description: product.description,
      price: product.price,
      quantity: product.quantity,
      image_url: product.image_url,
      subcategory_id: subcategoriesData[product.subcategory_index].id,
      featured: product.featured,
    }));

    const { data: productsData, error: productsError } = await supabase
      .from("products")
      .insert(productsWithIds)
      .select();

    if (productsError) {
      console.error("Error inserting products:", productsError);
      toast({
        title: "Error",
        description: "Failed to insert products",
        variant: "destructive",
      });
      return false;
    }

    console.log("Products inserted:", productsData);
    toast({
      title: "Success",
      description: `Database populated with ${products.length} products, ${categories.length} categories, and ${subcategories.length} subcategories`,
      duration: 5000,
    });

    return true;
  } catch (error) {
    console.error("Error populating database:", error);
    toast({
      title: "Error",
      description: "An unexpected error occurred while populating the database",
      variant: "destructive",
    });
    return false;
  }
};
