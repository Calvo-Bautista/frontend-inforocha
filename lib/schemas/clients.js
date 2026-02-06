import { z } from "zod";

/**
 * Enum de estados de cliente (debe coincidir con el backend)
 */
const clientStatuses = ["active", "prospect"];

/**
 * Enum de tipos de cliente (debe coincidir con el backend)
 */
const clientTypes = ["alta", "media", "baja"];

/**
 * Schema de validación para crear cliente
 * Replica las validaciones del backend ClientCreate (Pydantic)
 */
export const createClientSchema = z.object({
    name: z
        .string()
        .min(1, "El nombre de la empresa es requerido")
        .min(2, "El nombre debe tener al menos 2 caracteres")
        .max(200, "El nombre no puede exceder 200 caracteres"),
    phone: z
        .string()
        .min(1, "El teléfono es requerido")
        .min(8, "El teléfono debe tener al menos 8 caracteres")
        .max(20, "El teléfono no puede exceder 20 caracteres"),
    address: z
        .string()
        .max(300, "La dirección no puede exceder 300 caracteres")
        .optional()
        .or(z.literal("")),
    industry: z
        .string()
        .max(100, "El rubro no puede exceder 100 caracteres")
        .optional()
        .or(z.literal("")),
    maquinas: z
        .string()
        .max(500, "La descripción de máquinas no puede exceder 500 caracteres")
        .optional()
        .or(z.literal("")),
    tipoCliente: z
        .enum(clientTypes, {
            errorMap: () => ({ message: "Selecciona un tipo de cliente válido" }),
        })
        .optional()
        .or(z.literal("")),
    proveedorActual: z
        .string()
        .max(200, "El proveedor actual no puede exceder 200 caracteres")
        .optional()
        .or(z.literal("")),
    status: z
        .enum(clientStatuses, {
            errorMap: () => ({ message: "Selecciona un estado válido" }),
        })
        .default("prospect"),
});

/**
 * Schema de validación para editar cliente
 * Replica las validaciones del backend ClientUpdate (Pydantic)
 */
export const editClientSchema = z.object({
    name: z
        .string()
        .min(1, "El nombre de la empresa es requerido")
        .min(2, "El nombre debe tener al menos 2 caracteres")
        .max(200, "El nombre no puede exceder 200 caracteres"),
    phone: z
        .string()
        .min(1, "El teléfono es requerido")
        .min(8, "El teléfono debe tener al menos 8 caracteres")
        .max(20, "El teléfono no puede exceder 20 caracteres"),
    address: z
        .string()
        .max(300, "La dirección no puede exceder 300 caracteres")
        .optional()
        .or(z.literal("")),
    industry: z
        .string()
        .max(100, "El rubro no puede exceder 100 caracteres")
        .optional()
        .or(z.literal("")),
    maquinas: z
        .string()
        .max(500, "La descripción de máquinas no puede exceder 500 caracteres")
        .optional()
        .or(z.literal("")),
    tipoCliente: z
        .enum(clientTypes, {
            errorMap: () => ({ message: "Selecciona un tipo de cliente válido" }),
        })
        .optional()
        .or(z.literal("")),
    proveedorActual: z
        .string()
        .max(200, "El proveedor actual no puede exceder 200 caracteres")
        .optional()
        .or(z.literal("")),
    status: z
        .enum(clientStatuses, {
            errorMap: () => ({ message: "Selecciona un estado válido" }),
        }),
});
