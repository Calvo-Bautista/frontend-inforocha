import { z } from "zod";

/**
 * Schema de validación para registro de llamadas
 * Replica las validaciones del backend CallLogCreate (Pydantic)
 */
export const callLogSchema = z.object({
    date: z
        .date({
            required_error: "La fecha es requerida",
            invalid_type_error: "Ingresa una fecha válida",
        }),
    industry: z
        .string()
        .max(100, "El rubro no puede exceder 100 caracteres")
        .optional()
        .or(z.literal("")),
    usesPrinters: z
        .string()
        .min(1, "Debes indicar si usa impresoras")
        .refine((val) => val === "yes" || val === "no", {
            message: "Selecciona una opción válida",
        }),
    printerType: z
        .string()
        .max(200, "El tipo de impresora no puede exceder 200 caracteres")
        .optional()
        .or(z.literal("")),
    interestedInQuote: z
        .string()
        .min(1, "Debes indicar si está interesado en cotización")
        .refine((val) => val === "yes" || val === "no", {
            message: "Selecciona una opción válida",
        }),
    notes: z
        .string()
        .max(1000, "Las notas no pueden exceder 1000 caracteres")
        .optional()
        .or(z.literal("")),
});
