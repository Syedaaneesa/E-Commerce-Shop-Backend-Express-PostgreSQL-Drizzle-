import { db } from "./index";
import {
  categoriesTable,
  brandsTable,
  productsTable,
  couponsTable,
} from "./schema";

async function main() {
  console.log("Seeding database...");

  const categories = await db
    .insert(categoriesTable)
    .values([
      { name: "Footwear", slug: "footwear", description: "Sneakers, boots and sandals", imageUrl: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800" },
      { name: "Apparel", slug: "apparel", description: "Streetwear essentials", imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800" },
      { name: "Accessories", slug: "accessories", description: "Bags, hats and more", imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800" },
      { name: "Electronics", slug: "electronics", description: "Audio and wearables", imageUrl: "https://images.unsplash.com/photo-1518444065439-e933c06ce9cd?w=800" },
      { name: "Home", slug: "home", description: "Objects for modern living", imageUrl: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800" },
    ])
    .returning();

  const brands = await db
    .insert(brandsTable)
    .values([
      { name: "Nova Athletics", slug: "nova-athletics", logoUrl: "https://api.dicebear.com/9.x/initials/svg?seed=NA" },
      { name: "Urban Field", slug: "urban-field", logoUrl: "https://api.dicebear.com/9.x/initials/svg?seed=UF" },
      { name: "Solstice", slug: "solstice", logoUrl: "https://api.dicebear.com/9.x/initials/svg?seed=SO" },
      { name: "Wavelength", slug: "wavelength", logoUrl: "https://api.dicebear.com/9.x/initials/svg?seed=WL" },
    ])
    .returning();

  const byCat = (slug: string) => categories.find((c) => c.slug === slug)!.id;
  const byBrand = (slug: string) => brands.find((b) => b.slug === slug)!.id;

  const products = [
    {
      name: "Aero Runner Sneakers",
      slug: "aero-runner-sneakers",
      description: "Lightweight performance sneakers with responsive foam cushioning.",
      richDescription: "Engineered mesh upper, breathable lining, and a carbon-infused midsole for all-day comfort.",
      price: 129.99,
      salePrice: 99.99,
      stock: 42,
      sku: "NA-AR-001",
      images: [
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200",
        "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=1200",
      ],
      colors: ["Black", "White", "Red"],
      sizes: ["7", "8", "9", "10", "11"],
      categoryId: byCat("footwear"),
      brandId: byBrand("nova-athletics"),
      tags: ["running", "bestseller"],
      featured: true,
      trending: true,
      bestSeller: true,
    },
    {
      name: "Trailblazer High-Top Boots",
      slug: "trailblazer-high-top-boots",
      description: "Rugged all-terrain boots built for the city and beyond.",
      richDescription: "Water-resistant leather, reinforced toe cap, grip-lock outsole.",
      price: 189.0,
      stock: 25,
      sku: "UF-TB-002",
      images: ["https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=1200"],
      colors: ["Brown", "Black"],
      sizes: ["8", "9", "10", "11", "12"],
      categoryId: byCat("footwear"),
      brandId: byBrand("urban-field"),
      tags: ["boots", "outdoor"],
      newArrival: true,
    },
    {
      name: "Classic Canvas Slip-Ons",
      slug: "classic-canvas-slip-ons",
      description: "Everyday slip-on sneakers in durable canvas.",
      price: 59.99,
      salePrice: 44.99,
      stock: 60,
      sku: "SO-CC-003",
      images: ["https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=1200"],
      colors: ["Navy", "Beige", "Black"],
      sizes: ["6", "7", "8", "9", "10"],
      categoryId: byCat("footwear"),
      brandId: byBrand("solstice"),
      tags: ["casual"],
      trending: true,
    },
    {
      name: "Oversized Fleece Hoodie",
      slug: "oversized-fleece-hoodie",
      description: "Heavyweight fleece hoodie with a relaxed drop-shoulder fit.",
      richDescription: "400gsm brushed cotton fleece, ribbed cuffs, kangaroo pocket.",
      price: 84.0,
      stock: 80,
      sku: "UF-OH-004",
      images: [
        "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=1200",
        "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=1200",
      ],
      colors: ["Charcoal", "Cream", "Olive"],
      sizes: ["S", "M", "L", "XL"],
      categoryId: byCat("apparel"),
      brandId: byBrand("urban-field"),
      tags: ["hoodie", "bestseller"],
      bestSeller: true,
      featured: true,
    },
    {
      name: "Featherweight Windbreaker",
      slug: "featherweight-windbreaker",
      description: "Packable windbreaker for unpredictable weather.",
      price: 96.5,
      stock: 35,
      sku: "NA-FW-005",
      images: ["https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=1200"],
      colors: ["Cobalt", "Black"],
      sizes: ["S", "M", "L", "XL"],
      categoryId: byCat("apparel"),
      brandId: byBrand("nova-athletics"),
      tags: ["outerwear"],
      newArrival: true,
      trending: true,
    },
    {
      name: "Everyday Straight Denim",
      slug: "everyday-straight-denim",
      description: "Mid-rise straight leg denim in rigid selvedge.",
      price: 78.0,
      salePrice: 62.0,
      stock: 50,
      sku: "SO-ED-006",
      images: ["https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=1200"],
      colors: ["Indigo", "Black"],
      sizes: ["28", "30", "32", "34", "36"],
      categoryId: byCat("apparel"),
      brandId: byBrand("solstice"),
      tags: ["denim"],
    },
    {
      name: "Canvas Tote Weekender",
      slug: "canvas-tote-weekender",
      description: "Oversized canvas tote for travel and everyday carry.",
      price: 68.0,
      stock: 40,
      sku: "WL-CT-007",
      images: ["https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=1200"],
      colors: ["Natural", "Black"],
      sizes: [],
      categoryId: byCat("accessories"),
      brandId: byBrand("wavelength"),
      tags: ["bag"],
      newArrival: true,
    },
    {
      name: "Structured Wool Cap",
      slug: "structured-wool-cap",
      description: "Six-panel wool cap with an embroidered logo.",
      price: 32.0,
      stock: 90,
      sku: "UF-WC-008",
      images: ["https://images.unsplash.com/photo-1521369909029-2afed882baee?w=1200"],
      colors: ["Black", "Grey", "Camel"],
      sizes: ["One Size"],
      categoryId: byCat("accessories"),
      brandId: byBrand("urban-field"),
      tags: ["hat"],
      trending: true,
    },
    {
      name: "Pulse Wireless Earbuds",
      slug: "pulse-wireless-earbuds",
      description: "Active noise cancelling earbuds with 30-hour battery life.",
      richDescription: "Hybrid ANC, IPX5 sweat resistance, wireless charging case.",
      price: 149.0,
      salePrice: 119.0,
      stock: 55,
      sku: "WL-PE-009",
      images: [
        "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=1200",
        "https://images.unsplash.com/photo-1590658165737-15a047b8b5f0?w=1200",
      ],
      colors: ["Black", "White"],
      sizes: [],
      categoryId: byCat("electronics"),
      brandId: byBrand("wavelength"),
      tags: ["audio", "bestseller"],
      bestSeller: true,
      featured: true,
      trending: true,
    },
    {
      name: "Orbit Fitness Tracker",
      slug: "orbit-fitness-tracker",
      description: "Slim fitness tracker with heart-rate and sleep monitoring.",
      price: 89.0,
      stock: 65,
      sku: "NA-OF-010",
      images: ["https://images.unsplash.com/photo-1544117519-31a4b719223d?w=1200"],
      colors: ["Black", "Sand"],
      sizes: [],
      categoryId: byCat("electronics"),
      brandId: byBrand("nova-athletics"),
      tags: ["wearable"],
      newArrival: true,
    },
    {
      name: "Ceramic Pour-Over Set",
      slug: "ceramic-pour-over-set",
      description: "Hand-glazed ceramic pour-over coffee dripper with server.",
      price: 54.0,
      stock: 30,
      sku: "SO-CP-011",
      images: ["https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1200"],
      colors: ["White", "Charcoal"],
      sizes: [],
      categoryId: byCat("home"),
      brandId: byBrand("solstice"),
      tags: ["kitchen"],
    },
    {
      name: "Linen Throw Blanket",
      slug: "linen-throw-blanket",
      description: "Breathable linen-blend throw for the couch or bed.",
      price: 74.0,
      salePrice: 59.0,
      stock: 38,
      sku: "WL-LT-012",
      images: ["https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=1200"],
      colors: ["Sand", "Sage", "Ivory"],
      sizes: [],
      categoryId: byCat("home"),
      brandId: byBrand("wavelength"),
      tags: ["home"],
      trending: true,
    },
  ];

  await db.insert(productsTable).values(products);

  await db.insert(couponsTable).values([
    {
      code: "WELCOME10",
      discountType: "percentage",
      discountValue: 10,
      minOrderAmount: 0,
      active: true,
    },
    {
      code: "SAVE20",
      discountType: "fixed",
      discountValue: 20,
      minOrderAmount: 100,
      active: true,
    },
  ]);

  console.log("Seed complete.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
