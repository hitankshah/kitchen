import { z } from 'zod';

// Menu Item validation
export const menuItemSchema = z.object({
  name: z.string().min(2, 'Item name must be at least 2 characters').max(100, 'Item name too long'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(500, 'Description too long'),
  price: z.number().min(0.01, 'Price must be greater than 0').max(999999, 'Price too high'),
  category: z.enum(['Salad', 'Rolls', 'Deserts', 'Sandwich', 'Cake', 'Pure Veg', 'Pasta', 'Noodles'], {
    errorMap: () => ({ message: 'Please select a valid category' })
  }),
  image_url: z.string().url('Invalid image URL').optional(),
  is_vegetarian: z.boolean().optional().default(false),
  is_available: z.boolean().optional().default(true)
});

// Order validation
export const orderSchema = z.object({
  customer_name: z.string().min(2, 'Customer name must be at least 2 characters'),
  customer_email: z.string().email('Invalid email format'),
  customer_phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  delivery_address: z.string().min(10, 'Delivery address must be at least 10 characters'),
  total_amount: z.number().min(0, 'Total amount must be positive'),
  status: z.enum(['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled']).optional().default('pending'),
  special_instructions: z.string().max(500, 'Special instructions too long').optional()
});

// Admin Login validation
export const adminLoginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

// User update validation
export const userUpdateSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  phone: z.string().min(10, 'Phone must be at least 10 digits').optional(),
  role: z.enum(['customer', 'admin']).optional()
});
