
import { z } from 'zod';

// User validation schemas
export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const signupSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
  username: z.string().min(2, 'Username must be at least 2 characters').max(30, 'Username must be less than 30 characters'),
  firstName: z.string().min(1, 'First name is required').max(50, 'First name must be less than 50 characters'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name must be less than 50 characters'),
  location: z.string().min(1, 'Location is required').max(100, 'Location must be less than 100 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Confirm password must be at least 6 characters'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "New passwords don't match",
  path: ["confirmPassword"],
});

// Listing validation schemas
export const listingSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(1000, 'Description must be less than 1000 characters'),
  category: z.string().min(1, 'Category is required'),
  condition: z.enum(['new', 'like_new', 'good', 'fair', 'poor'], {
    errorMap: () => ({ message: 'Please select a condition' })
  }),
  estimatedValue: z.number().min(0, 'Value must be positive').max(10000, 'Value must be less than $10,000'),
  location: z.string().min(1, 'Location is required').max(100, 'Location must be less than 100 characters'),
});

// Message validation schema
export const messageSchema = z.object({
  content: z.string().min(1, 'Message cannot be empty').max(1000, 'Message must be less than 1000 characters'),
});

// Rating validation schema
export const ratingSchema = z.object({
  rating: z.number().min(1, 'Rating must be between 1 and 5').max(5, 'Rating must be between 1 and 5'),
  comment: z.string().max(500, 'Comment must be less than 500 characters').optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;
export type PasswordChangeFormData = z.infer<typeof passwordChangeSchema>;
export type ListingFormData = z.infer<typeof listingSchema>;
export type MessageFormData = z.infer<typeof messageSchema>;
export type RatingFormData = z.infer<typeof ratingSchema>;
