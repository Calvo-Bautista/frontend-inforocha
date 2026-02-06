import { z } from "zod";

/**
 * Schema de validación para login
 * Replica las validaciones del backend (Pydantic)
 */
export const loginSchema = z.object({
    email: z
        .string()
        .min(1, "El correo electrónico es requerido")
        .email("Ingresa un correo electrónico válido"),
    password: z
        .string()
        .min(1, "La contraseña es requerida")
        .min(6, "La contraseña debe tener al menos 6 caracteres"),
});
