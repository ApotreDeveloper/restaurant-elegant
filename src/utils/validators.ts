
import { z } from 'zod';

const phoneRegex = /^(\+225|00225)?\s?(\d{2}\s?){4}\d{2}$/;

export const reservationSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Adresse email invalide"),
  phone: z.string().regex(phoneRegex, "Format invalide (ex: +225 07 07 07 07 07)"),
  date: z.string().min(1, "La date est requise"),
  time: z.string().min(1, "L'heure est requise"),
  guests: z.number().min(1, "Au moins 1 personne").max(20, "Pour plus de 20 personnes, veuillez nous contacter"),
  notes: z.string().optional(),
  dish_id: z.string().optional()
});

export const orderSchema = z.object({
  name: z.string().min(2, "Nom requis"),
  email: z.string().email("Email invalide"),
  phone: z.string().regex(phoneRegex, "Numéro invalide"),
  address: z.string().optional(),
  instructions: z.string().optional(),
});

export const reviewSchema = z.object({
  author: z.string().min(2, "Nom requis"),
  rating: z.number().min(1).max(5),
  comment: z.string().min(10, "Le commentaire doit faire au moins 10 caractères"),
});

export const contactSchema = z.object({
  name: z.string().min(2, "Nom requis"),
  email: z.string().email("Email invalide"),
  message: z.string().min(10, "Message trop court"),
});
