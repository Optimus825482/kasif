import { z } from "zod";

/** Admin login body */
export const loginSchema = z.object({
  username: z.string().min(1, "Kullanıcı adı gerekli"),
  password: z.string().min(1, "Şifre gerekli"),
});

/** Analytics event body */
export const eventSchema = z.object({
  eventType: z.string().min(1, "eventType gerekli"),
  locationId: z.string().optional().nullable(),
  sessionId: z.string().min(1, "sessionId gerekli"),
  metadata: z.record(z.string(), z.unknown()).optional().nullable(),
});

/** Location create body (API) */
export const locationCreateSchema = z.object({
  name: z.string().min(1),
  nameEn: z.string().min(1),
  description: z.string().min(1),
  descriptionEn: z.string().min(1),
  shortDesc: z.string().optional().default(""),
  shortDescEn: z.string().optional().default(""),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  categoryId: z.string().min(1),
  images: z.array(z.string()).optional().default([]),
  visitHours: z.string().optional().nullable(),
  fee: z.string().optional().nullable(),
  feeEn: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  addressEn: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  website: z.string().url().optional().nullable().or(z.literal("")),
  accessibility: z.string().optional().nullable(),
  publicTransport: z.string().optional().nullable(),
  publicTransportEn: z.string().optional().nullable(),
  isFeatured: z.boolean().optional().default(false),
});

/** Location update body (API) - all fields optional */
export const locationUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  nameEn: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  descriptionEn: z.string().min(1).optional(),
  shortDesc: z.string().optional(),
  shortDescEn: z.string().optional(),
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
  categoryId: z.string().min(1).optional(),
  images: z.array(z.string()).optional(),
  visitHours: z.string().optional().nullable(),
  fee: z.string().optional().nullable(),
  feeEn: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  addressEn: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  website: z.string().url().optional().nullable().or(z.literal("")),
  accessibility: z.string().optional().nullable(),
  publicTransport: z.string().optional().nullable(),
  publicTransportEn: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type EventInput = z.infer<typeof eventSchema>;
export type LocationCreateInput = z.infer<typeof locationCreateSchema>;
export type LocationUpdateInput = z.infer<typeof locationUpdateSchema>;
