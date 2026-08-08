import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name"),
  email: z.string().trim().email("Enter a valid email address"),
  phone: z.string().trim().optional(),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const addonSchema = z.object({
  name: z.string(),
  price: z.number().nonnegative(),
});

export const cartItemSchema = z.object({
  itemId: z.string().min(1),
  quantity: z.number().int().min(1).max(99),
  addons: z.array(addonSchema).default([]),
  note: z.string().max(200).optional(),
});

export const placeOrderSchema = z.object({
  deliveryName: z.string().trim().min(2, "Enter the delivery name"),
  deliveryPhone: z.string().trim().min(7, "Enter a valid phone number"),
  deliveryAddress: z.string().trim().min(10, "Enter a complete delivery address"),
  items: z.array(cartItemSchema).min(1, "Your cart is empty"),
  promoCode: z.string().trim().toUpperCase().optional(),
  specialInstructions: z.string().max(500).optional(),
  paymentMethod: z.enum(["COD", "UPI"]),
  paymentRef: z.string().trim().optional(),
});

export const reviewSchema = z.object({
  orderId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
});

export const addressSchema = z.object({
  label: z.string().trim().min(1, "Add a label like Home or Office"),
  fullAddress: z.string().trim().min(10, "Enter a complete address"),
  phone: z.string().trim().optional(),
});

export const menuItemSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(2, "Name is required"),
  description: z.string().trim().min(5, "Description is required"),
  price: z.coerce.number().positive("Price must be positive"),
  categoryId: z.string().min(1, "Choose a category"),
  emoji: z.string().trim().max(8).optional(),
  imageUrl: z.string().trim().url("Must be a valid URL").or(z.literal("")).optional(),
  prepTime: z.coerce.number().int().min(1).max(180).default(15),
  spiceLevel: z.coerce.number().int().min(0).max(3).default(0),
  isVeg: z.boolean().default(false),
  isAvailable: z.boolean().default(true),
  isTrending: z.boolean().default(false),
  tags: z.string().trim().optional(),
  addons: z.array(addonSchema).default([]),
});

export const categorySchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(2, "Category name is required"),
  emoji: z.string().trim().max(8).optional(),
  sortOrder: z.coerce.number().int().min(0).default(0),
});

export const hoursEntrySchema = z.object({
  day: z.number().int().min(0).max(6),
  open: z.string(),
  close: z.string(),
  closed: z.boolean(),
});

export const settingsSchema = z.object({
  storeStatus: z.enum(["OPEN", "LIMITED", "CLOSED"]),
  emergencyMessage: z.string().max(200).optional(),
  deliveryEnabled: z.boolean(),
  deliveryFee: z.coerce.number().min(0).max(500),
  freeDeliveryAbove: z.coerce.number().min(0).max(50000),
  minOrderValue: z.coerce.number().min(0).max(50000),
  codEnabled: z.boolean(),
  codMaxAmount: z.coerce.number().min(0).max(500000),
  upiEnabled: z.boolean(),
  upiId: z.string().trim().min(3, "Enter the UPI ID (VPA)"),
  hours: z.array(hoursEntrySchema).length(7),
});
