import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const hash = (pw: string) => bcrypt.hashSync(pw, 10);

const hours = Array.from({ length: 7 }, (_, day) => ({
  day,
  open: day === 0 ? "11:00" : "10:00",
  close: "21:30",
  closed: false,
}));

interface SeedAddon {
  name: string;
  price: number;
}

async function main() {
  // Wipe in dependency order so the seed is idempotent
  await prisma.review.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.address.deleteMany();
  await prisma.session.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.category.deleteMany();
  await prisma.promoCode.deleteMany();
  await prisma.user.deleteMany();
  await prisma.restaurantSettings.deleteMany();

  await prisma.user.create({
    data: {
      name: "Thuankubuan Kamei",
      email: "admin@thuannaga.com",
      phone: "+91 60099 21828",
      passwordHash: hash("admin123"),
      role: "ADMIN",
    },
  });

  const demo = await prisma.user.create({
    data: {
      name: "Rina Khangembam",
      email: "demo@thuannaga.com",
      phone: "+91 98625 12345",
      passwordHash: hash("demo123"),
      role: "CUSTOMER",
    },
  });

  const home = await prisma.address.create({
    data: {
      userId: demo.id,
      label: "Home",
      fullAddress:
        "House No. 7, Phaibou Road, Near District Hospital, Tamenglong, Manipur 795141",
      phone: "+91 98625 12345",
      isDefault: true,
    },
  });

  await prisma.restaurantSettings.create({
    data: {
      id: 1,
      storeStatus: "OPEN",
      hours: JSON.stringify(hours),
      deliveryEnabled: true,
      deliveryFee: 25,
      freeDeliveryAbove: 300,
      minOrderValue: 100,
      codEnabled: true,
      codMaxAmount: 1500,
      upiEnabled: true,
      upiId: "kthuan781-1@okaxis",
      address: "Thuan Naga Restaurant, Phaibou Road, Tamenglong, Manipur 795141",
      phone: "+91 60099 21828",
    },
  });

  await prisma.promoCode.createMany({
    data: [
      { code: "WELCOME10", description: "10% off your first order", discountPercent: 10, minOrder: 100, active: true },
      { code: "SPICY15", description: "15% off orders above ₹300", discountPercent: 15, minOrder: 300, active: true },
      { code: "THUAN20", description: "20% off orders above ₹500", discountPercent: 20, minOrder: 500, active: true },
    ],
  });

  const cats: Array<{ name: string; slug: string; emoji: string; sortOrder: number }> = [
    { name: "Traditional Naga", slug: "traditional", emoji: "🍲", sortOrder: 1 },
    { name: "Starters & Snacks", slug: "starters", emoji: "🥟", sortOrder: 2 },
    { name: "Mains & Curries", slug: "mains", emoji: "🍛", sortOrder: 3 },
    { name: "Rice & Sides", slug: "rice-sides", emoji: "🍚", sortOrder: 4 },
    { name: "Desserts", slug: "desserts", emoji: "🍮", sortOrder: 5 },
    { name: "Beverages", slug: "beverages", emoji: "🧋", sortOrder: 6 },
  ];

  const categoryMap: Record<string, string> = {};
  for (const c of cats) {
    const created = await prisma.category.create({ data: c });
    categoryMap[c.slug] = created.id;
  }

  const addons: Record<string, SeedAddon[]> = {
    standard: [
      { name: "Extra chilli", price: 10 },
      { name: "Extra bamboo shoot", price: 30 },
      { name: "Extra gravy", price: 25 },
    ],
    pork: [
      { name: "Extra pork", price: 60 },
      { name: "Extra chilli", price: 10 },
    ],
    veg: [
      { name: "Extra vegetables", price: 30 },
      { name: "Cheese", price: 40 },
    ],
  };

  interface SeedItem {
    cat: string;
    name: string;
    description: string;
    price: number;
    emoji: string;
    spice: number;
    veg?: boolean;
    tags?: string[];
    trending?: boolean;
    prep?: number;
    addons?: SeedAddon[];
  }

  const items: SeedItem[] = [
    {
      cat: "traditional", name: "Smoked Pork with Bamboo Shoot",
      description: "Slow-smoked pork cooked with tender bamboo shoot and axone — the soul of Naga cuisine.",
      price: 220, emoji: "🍖", spice: 3, trending: true, prep: 30, addons: addons.pork,
    },
    {
      cat: "traditional", name: "Naga Thali",
      description: "A complete platter: smoked pork, rice, seasonal boiled vegetables, chutney and king chilli.",
      price: 180, emoji: "🍱", spice: 2, trending: true, prep: 20, addons: addons.standard,
    },
    {
      cat: "traditional", name: "Pork with Anishi",
      description: "Pork cooked with anishi — fermented taro leaves that give a deep, earthy flavour.",
      price: 200, emoji: "🥘", spice: 2, prep: 25, addons: addons.pork,
    },
    {
      cat: "traditional", name: "Chicken with Khongpoh",
      description: "Free-range chicken simmered with fermented soybean (khongpoh) and local herbs.",
      price: 190, emoji: "🍗", spice: 2, prep: 25, addons: addons.standard,
    },
    {
      cat: "traditional", name: "Smoked Fish Chutney",
      description: "Smoked ngari fish pounded with red chilli, tomato and onion — a Tamenglong special.",
      price: 120, emoji: "🐟", spice: 3, prep: 10, addons: addons.standard,
    },
    {
      cat: "starters", name: "Pork Momos (6 pcs)",
      description: "Steamed momos stuffed with spiced minced pork, served with fiery chutney.",
      price: 140, emoji: "🥟", spice: 2, trending: true, prep: 15, addons: addons.standard,
    },
    {
      cat: "starters", name: "Chicken Skewers",
      description: "Char-grilled chicken skewers marinated in ginger, garlic and Naga spices.",
      price: 160, emoji: "🍢", spice: 2, prep: 15, addons: addons.standard,
    },
    {
      cat: "starters", name: "Bamboo Shoot Fritters",
      description: "Crispy golden fritters of tender bamboo shoot — vegetarian and addictive.",
      price: 110, emoji: "🥠", spice: 1, veg: true, prep: 12, addons: addons.veg,
    },
    {
      cat: "starters", name: "King Chilli Wings",
      description: "Chicken wings tossed in a sticky king chilli glaze. Not for the faint-hearted.",
      price: 180, emoji: "🌶️", spice: 3, trending: true, prep: 18, addons: addons.standard,
    },
    {
      cat: "starters", name: "Steamed Veg Momos (6 pcs)",
      description: "Light, juicy momos with seasonal vegetable filling and sesame chutney.",
      price: 120, emoji: "🥬", spice: 1, veg: true, prep: 15, addons: addons.veg,
    },
    {
      cat: "mains", name: "Smoked Chicken Curry",
      description: "Rich curry of smoked chicken in a tomato-onion base with a hint of axone.",
      price: 210, emoji: "🍛", spice: 2, trending: true, prep: 25, addons: addons.standard,
    },
    {
      cat: "mains", name: "Pork Vom (Traditional Stew)",
      description: "A comforting pork stew with mustard leaves, the way grandmothers make it.",
      price: 230, emoji: "🥣", spice: 2, prep: 30, addons: addons.pork,
    },
    {
      cat: "mains", name: "King Chilli Chicken Dry",
      description: "Stir-fried chicken with the legendary bhut jolokia — smoky, intense, unforgettable.",
      price: 240, emoji: "🔥", spice: 3, prep: 20, addons: addons.standard,
    },
    {
      cat: "mains", name: "Fish in Bamboo Shoot",
      description: "Fresh river fish cooked with bamboo shoot and herbs in a light broth.",
      price: 250, emoji: "🐠", spice: 2, prep: 25, addons: addons.standard,
    },
    {
      cat: "mains", name: "Bhut Jolokia Chicken",
      description: "Our spiciest! Bhut jolokia chicken for those who take the challenge.",
      price: 260, emoji: "🌋", spice: 3, prep: 20, addons: addons.standard,
    },
    {
      cat: "rice-sides", name: "Sticky Rice (Khotok)",
      description: "Glutinous rice, steamed to perfection — the perfect partner to Naga curries.",
      price: 60, emoji: "🍙", spice: 0, veg: true, prep: 15, addons: [{ name: "Extra rice", price: 30 }],
    },
    {
      cat: "rice-sides", name: "Red Rice",
      description: "Nutritious local red rice, cooked with a pinch of salt.",
      price: 50, emoji: "🍚", spice: 0, veg: true, prep: 20,
    },
    {
      cat: "rice-sides", name: "Colocasia Leaves (Spinach)",
      description: "Tender colocasia leaves cooked simply with garlic — a home-style classic.",
      price: 80, emoji: "🥗", spice: 1, veg: true, prep: 12, addons: addons.veg,
    },
    {
      cat: "rice-sides", name: "Fermented Bamboo Shoot Salad",
      description: "Tangy bamboo shoot salad with onion, green chilli and a squeeze of lime.",
      price: 90, emoji: "🥙", spice: 2, veg: true, prep: 10, addons: addons.veg,
    },
    {
      cat: "rice-sides", name: "Axone Chutney",
      description: "Fermented soybean chutney with roasted sesame — bold and umami-rich.",
      price: 70, emoji: "🫙", spice: 2, veg: true, prep: 8,
    },
    {
      cat: "desserts", name: "Rice Pudding with Jaggery",
      description: "Slow-cooked rice pudding sweetened with jaggery and a whisper of cardamom.",
      price: 90, emoji: "🍮", spice: 0, veg: true, prep: 10,
    },
    {
      cat: "desserts", name: "Fried Banana with Honey",
      description: "Caramelised bananas with local honey and a dusting of cinnamon.",
      price: 80, emoji: "🍌", spice: 0, veg: true, prep: 10,
    },
    {
      cat: "beverages", name: "Ginger Honey Lemonade",
      description: "Fresh ginger, lemon and local honey over ice.",
      price: 70, emoji: "🍋", spice: 0, veg: true, prep: 5,
    },
    {
      cat: "beverages", name: "Naga Black Tea",
      description: "Strong black tea brewed the Naga way, with milk on request.",
      price: 40, emoji: "🫖", spice: 0, veg: true, prep: 5,
    },
    {
      cat: "beverages", name: "Fresh Lime Soda",
      description: "Sparkling lime soda — sweet, salted or mixed.",
      price: 50, emoji: "🥤", spice: 0, veg: true, prep: 5,
    },
  ];

  const IMG: Record<string, string> = {
    "Smoked Pork with Bamboo Shoot": "/food/01.jpg",
    "Naga Thali": "/food/02.jpg",
    "Pork with Anishi": "/food/03.jpg",
    "Chicken with Khongpoh": "/food/04.jpg",
    "Smoked Fish Chutney": "/food/05.jpg",
    "Pork Momos (6 pcs)": "/food/06.jpg",
    "Chicken Skewers": "/food/07.jpg",
    "Bamboo Shoot Fritters": "/food/08.jpg",
    "King Chilli Wings": "/food/09.jpg",
    "Steamed Veg Momos (6 pcs)": "/food/10.jpg",
    "Smoked Chicken Curry": "/food/11.jpg",
    "Pork Vom (Traditional Stew)": "/food/12.jpg",
    "King Chilli Chicken Dry": "/food/13.jpg",
    "Fish in Bamboo Shoot": "/food/14.jpg",
    "Bhut Jolokia Chicken": "/food/15.jpg",
    "Sticky Rice (Khotok)": "/food/16.jpg",
    "Red Rice": "/food/17.jpg",
    "Colocasia Leaves (Spinach)": "/food/18.jpg",
    "Fermented Bamboo Shoot Salad": "/food/19.jpg",
    "Axone Chutney": "/food/20.jpg",
    "Rice Pudding with Jaggery": "/food/21.jpg",
    "Fried Banana with Honey": "/food/22.jpg",
    "Ginger Honey Lemonade": "/food/23.jpg",
    "Naga Black Tea": "/food/24.jpg",
    "Fresh Lime Soda": "/food/25.jpg",
  };

  const itemMap: Record<string, string> = {};
  for (const it of items) {
    const created = await prisma.menuItem.create({
      data: {
        categoryId: categoryMap[it.cat],
        name: it.name,
        description: it.description,
        price: it.price,
        emoji: it.emoji,
        imageUrl: IMG[it.name] ?? null,
        spiceLevel: it.spice,
        isVeg: it.veg ?? false,
        tags: (it.tags ?? []).join(","),
        addons: JSON.stringify(it.addons ?? addons.standard),
        isTrending: it.trending ?? false,
        prepTime: it.prep ?? 15,
        rating: it.trending ? 4.7 : 4.3,
        ratingCount: it.trending ? 128 : 42,
      },
    });
    itemMap[it.name] = created.id;
  }

  const mkHistory = (statuses: Array<[string, number]>) =>
    JSON.stringify(statuses.map(([s, minsAgo]) => ({ status: s, at: new Date(Date.now() - minsAgo * 60000).toISOString() })));

  const delivered = await prisma.order.create({
    data: {
      orderNumber: 1,
      userId: demo.id,
      deliveryName: demo.name,
      deliveryPhone: demo.phone ?? "",
      deliveryAddress: home.fullAddress,
      items: {
        create: [
          { itemId: itemMap["Smoked Pork with Bamboo Shoot"], name: "Smoked Pork with Bamboo Shoot", price: 220, quantity: 1, addons: JSON.stringify([{ name: "Extra chilli", price: 10 }]) },
          { itemId: itemMap["Sticky Rice (Khotok)"], name: "Sticky Rice (Khotok)", price: 60, quantity: 2, addons: "[]" },
        ],
      },
      subtotal: 340,
      tax: 17,
      deliveryFee: 25,
      discount: 0,
      total: 382,
      paymentMethod: "COD",
      paymentStatus: "PAID",
      status: "DELIVERED",
      statusHistory: mkHistory([
        ["CONFIRMED", 150],
        ["PREPARING", 130],
        ["READY", 80],
        ["OUT_FOR_DELIVERY", 60],
        ["DELIVERED", 20],
      ]),
      estimatedMinutes: 40,
      deliveredAt: new Date(Date.now() - 20 * 60000),
      createdAt: new Date(Date.now() - 150 * 60000),
    },
  });

  await prisma.review.create({
    data: {
      orderId: delivered.id,
      userId: demo.id,
      rating: 5,
      comment: "The smoked pork was incredible — tasted just like home! Delivery was quick too.",
    },
  });

  await prisma.order.create({
    data: {
      orderNumber: 2,
      userId: demo.id,
      deliveryName: demo.name,
      deliveryPhone: demo.phone ?? "",
      deliveryAddress: home.fullAddress,
      items: {
        create: [
          { itemId: itemMap["King Chilli Wings"], name: "King Chilli Wings", price: 180, quantity: 1, addons: "[]" },
          { itemId: itemMap["Ginger Honey Lemonade"], name: "Ginger Honey Lemonade", price: 70, quantity: 1, addons: "[]" },
        ],
      },
      subtotal: 250,
      tax: 12.5,
      deliveryFee: 25,
      discount: 25,
      promoCode: "WELCOME10",
      total: 262.5,
      paymentMethod: "COD",
      paymentStatus: "PENDING",
      status: "PREPARING",
      statusHistory: mkHistory([
        ["CONFIRMED", 25],
        ["PREPARING", 12],
      ]),
      estimatedMinutes: 35,
      createdAt: new Date(Date.now() - 25 * 60000),
    },
  });

  console.log(`Seeded DB: ${items.length} menu items, ${cats.length} categories, 2 users, 2 sample orders.`);
  console.log("Admin login: admin@thuannaga.com / admin123");
  console.log("Customer login: demo@thuannaga.com / demo123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
