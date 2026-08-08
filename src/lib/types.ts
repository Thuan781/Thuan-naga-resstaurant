export interface MenuItemView {
  id: string;
  name: string;
  description: string;
  price: number;
  emoji: string | null;
  imageUrl: string | null;
  spiceLevel: number;
  isVeg: boolean;
  rating: number;
  ratingCount: number;
  prepTime: number;
  categoryName: string;
  categorySlug: string;
  isAvailable: boolean;
  isTrending: boolean;
}

export interface CategoryView {
  id: string;
  name: string;
  slug: string;
  emoji: string | null;
  sortOrder: number;
}

export interface OrderItemView {
  id: string;
  itemId: string | null;
  name: string;
  price: number;
  quantity: number;
  addons: Array<{ name: string; price: number }>;
  note: string | null;
}
