import { z } from "zod";

export const courseInputSchema = z.object({
  name: z.string().trim().min(1),
  nameRu: z.string().trim().min(1),
  price: z.coerce.number().int().min(0),
  durationMonths: z.coerce.number().int().min(1).default(1),
  description: z.string().trim().optional().nullable(),
});

export const resultInputSchema = z.object({
  title: z.string().trim().min(1),
  imageUrl: z.string().trim().min(1),
});

export const centerInputSchema = z.object({
  name: z.string().trim().min(1, "Nom kiritilishi shart"),
  description: z.string().trim().optional().nullable(),
  descriptionRu: z.string().trim().optional().nullable(),
  districtId: z.string().min(1, "Tuman tanlang"),
  address: z.string().trim().min(1, "Manzil kiritilishi shart"),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  phone: z.string().trim().min(1, "Telefon kiritilishi shart"),
  telegramUrl: z.string().trim().optional().nullable(),
  logoUrl: z.string().trim().optional().nullable(),
  photos: z.array(z.string()).default([]),
  rating: z.coerce.number().min(0).max(5).default(0),
  isActive: z.boolean().default(true),
  courses: z.array(courseInputSchema).default([]),
  results: z.array(resultInputSchema).default([]),
});

export type CenterInput = z.infer<typeof centerInputSchema>;
