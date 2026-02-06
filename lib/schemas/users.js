import { z } from "zod";

/**
 * Enum de roles de usuario (debe coincidir con el backend)
 */
const userRoles = ["vendedor", "logistica", "admin", "owner"];

/**
 * Schema de validación para crear usuario
 * Replica las validaciones del backend UserCreate (Pydantic)
 */
export const createUserSchema = z.object({
    name: z
        .string()
        .min(1, "El nombre es requerido")
        .min(2, "El nombre debe tener al menos 2 caracteres")
        .max(100, "El nombre no puede exceder 100 caracteres"),
    email: z
        .string()
        .min(1, "El correo electrónico es requerido")
        .email("Ingresa un correo electrónico válido"),
    password: z
        .string()
        .min(1, "La contraseña es requerida")
        .min(6, "La contraseña debe tener al menos 6 caracteres")
        .max(72, "La contraseña no puede exceder 72 caracteres"),
    role: z
        .enum(userRoles, {
            errorMap: () => ({ message: "Selecciona un rol válido" }),
        }),
});

/**
 * Schema de validación para editar usuario
 * Replica las validaciones del backend UserUpdate (Pydantic)
 */
export const editUserSchema = z.object({
    name: z
        .string()
        .min(1, "El nombre es requerido")
        .min(2, "El nombre debe tener al menos 2 caracteres")
        .max(100, "El nombre no puede exceder 100 caracteres"),
    email: z
        .string()
        .min(1, "El correo electrónico es requerido")
        .email("Ingresa un correo electrónico válido"),
    role: z
        .enum(userRoles, {
            errorMap: () => ({ message: "Selecciona un rol válido" }),
        }),
});

/**
 * Schema de validación para cambiar contraseña
 */
export const changePasswordSchema = z
    .object({
        newPassword: z
            .string()
            .min(1, "La nueva contraseña es requerida")
            .min(6, "La contraseña debe tener al menos 6 caracteres")
            .max(72, "La contraseña no puede exceder 72 caracteres"),
        confirmPassword: z
            .string()
            .min(1, "Debes confirmar la contraseña"),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Las contraseñas no coinciden",
        path: ["confirmPassword"],
    });
