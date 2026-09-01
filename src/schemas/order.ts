import { z } from "zod";

export const checkoutCustomerSchema = z.object({
  name: z.string().min(1, "Required"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().optional(),
  note: z.string().optional(),
});
export type CheckoutCustomerInput = z.infer<typeof checkoutCustomerSchema>;

export const cartItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.coerce.number().int().positive(),
});
export type CartItemInput = z.infer<typeof cartItemSchema>;

export const createOrderSchema = z.object({
  customer: checkoutCustomerSchema,
  items: z.array(cartItemSchema).min(1, "Cart is empty"),
});
export type CreateOrderInput = z.infer<typeof createOrderSchema>;

export const orderLookupSchema = z.object({
  orderId: z.string().min(1, "Required"),
  email: z.string().email("Enter a valid email"),
});
export type OrderLookupInput = z.infer<typeof orderLookupSchema>;
