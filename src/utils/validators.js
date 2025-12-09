// Small, synchronous validators for forms & guards
import { z } from 'zod';

export const isRequired = (v) => (v !== null && v !== undefined && String(v).trim() !== '') || 'This field is required';

export const minLength = (min) => (v) =>
  (String(v ?? '').length >= min) || `Must be at least ${min} characters`;

export const maxLength = (max) => (v) =>
  (String(v ?? '').length <= max) || `Must be at most ${max} characters`;

export const isEmail = (v) =>
  (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v ?? ''))) || 'Invalid email address';

export const isNumeric = (v) =>
  (/^\d+(\.\d+)?$/.test(String(v ?? ''))) || 'Must be a number';

export const isInteger = (v) =>
  (/^-?\d+$/.test(String(v ?? ''))) || 'Must be an integer';

export const inRange = (min, max) => (v) => {
  const n = Number(v);
  return (!Number.isNaN(n) && n >= min && n <= max) || `Must be between ${min} and ${max}`;
};

export const isStrongPassword = (v) =>
  (/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(String(v ?? ''))) ||
  'Password must be 8+ chars, include upper, lower, and a number';

export const isUUID = (v) =>
  (/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(v ?? ''))) ||
  'Invalid UUID v4';

// Login form validation
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),

  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
})

export const isPhone = (v) =>
  (/^\+?\d{7,15}$/.test(String(v ?? ''))) || 'Invalid phone number';

export const composeValidators =
  (...validators) =>
  (value) => {
    for (const v of validators) {
      const res = typeof v === 'function' ? v(value) : true;
      if (res !== true) return res;
    }
    return true;
  };
// Example usage:
// const validate = composeValidators(isRequired, isEmail, maxLength(100));
// const result = validate('test@example.com');

// ============================================
// Meter validation schemas
// ============================================
export const createMeterSchema = z.object({
  meter_id: z
    .string()
    .min(1, 'Meter ID is required')
    .max(50, 'Meter ID must be at most 50 characters'),

  meter_type: z
    .string()
    .min(1, 'Meter type is required')
    .max(100, 'Meter type must be at most 100 characters'),

  location: z
    .string()
    .max(255, 'Location must be at most 255 characters')
    .optional()
    .or(z.literal('')),

  status: z.enum(
    ['active', 'suspended', 'maintenance', 'fault', 'offline', 'tamper'],
    { required_error: 'Status is required' },
  ),
})
export const updateMeterSchema = createMeterSchema.extend({
  meter_id: z
    .string()
    .min(1, 'Meter ID is required')
    .max(50, 'Meter ID must be at most 50 characters'),
})

// ============================================
// Customer validation schemas
// ============================================
export const createCustomerSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be at most 100 characters'),

  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .max(100, 'Email must be at most 100 characters')
    .optional()
    .or(z.literal('')),

  phone: z
    .string()
    .min(1, 'Phone is required')
    .max(20, 'Phone must be at most 20 characters'),

  address: z
    .string()
    .max(255, 'Address must be at most 255 characters')
    .optional()
    .or(z.literal('')),
})


export const updateCustomerSchema = createCustomerSchema.extend({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be at most 100 characters'),
})
