"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { configAPI } from "@/lib/api";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

const configSchema = z.object({
    shipping_cost: z.coerce.number().min(0, "El costo debe ser mayor o igual a 0"),
    discounts: z.array(z.object({
        threshold: z.coerce.number().min(0, "El umbral debe ser mayor o igual a 0"),
        percentage: z.coerce.number().min(0).max(100, "El porcentaje debe estar entre 0 y 100"),
    }))
});

export default function SettingsModal({ isOpen, onClose }) {
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const {
        register,
        control,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(configSchema),
        defaultValues: {
            shipping_cost: 0,
            discounts: []
        },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "discounts",
    });

    useEffect(() => {
        if (isOpen) {
            loadConfig();
        }
    }, [isOpen]);

    const loadConfig = async () => {
        try {
            setIsLoading(true);
            const data = await configAPI.get();
            // Ensure discounts is an array
            if (!data.discounts) data.discounts = [];
            reset(data);
        } catch (error) {
            console.error("Error loading config:", error);
            toast.error("Error al cargar la configuración");
        } finally {
            setIsLoading(false);
        }
    };

    const onSubmit = async (data) => {
        try {
            setIsSaving(true);
            await configAPI.update(data);
            toast.success("Configuración actualizada correctamente");
            onClose();
        } catch (error) {
            console.error("Error updating config:", error);
            toast.error("Error al guardar los cambios");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Configuración del Sistema</DialogTitle>
                    <DialogDescription>
                        Ajusta los costos de envío y reglas de descuento.
                    </DialogDescription>
                </DialogHeader>

                {isLoading ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4 flex-1 flex flex-col overflow-hidden">

                        {/* Shipping Cost Section */}
                        <div className="space-y-2 p-4 border rounded-lg bg-secondary/20">
                            <Label className="text-base font-semibold">Costo de Envío</Label>
                            <div className="space-y-1">
                                <Label className="text-xs text-muted-foreground">Valor por defecto ($)</Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    {...register("shipping_cost")}
                                    className={errors.shipping_cost ? "border-destructive" : ""}
                                />
                                {errors.shipping_cost && (
                                    <p className="text-sm text-destructive">{errors.shipping_cost.message}</p>
                                )}
                            </div>
                        </div>

                        {/* Dynamic Discounts Section */}
                        <div className="flex-1 flex flex-col min-h-0 border rounded-lg p-4 bg-secondary/20">
                            <div className="flex justify-between items-center mb-4">
                                <Label className="text-base font-semibold">Reglas de Descuento</Label>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => append({ threshold: 0, percentage: 0 })}
                                    className="gap-2"
                                >
                                    <Plus className="w-4 h-4" />
                                    Agregar Regla
                                </Button>
                            </div>

                            <ScrollArea className="flex-1 pr-4">
                                <div className="space-y-4">
                                    {fields.map((field, index) => (
                                        <div key={field.id} className="flex gap-4 items-start p-3 bg-background rounded-md border animate-in fade-in slide-in-from-bottom-2">
                                            <div className="flex-1 space-y-2">
                                                <Label className="text-xs">Umbral ($)</Label>
                                                <Input
                                                    type="number"
                                                    {...register(`discounts.${index}.threshold`)}
                                                    placeholder="Ej: 100000"
                                                />
                                                {errors.discounts?.[index]?.threshold && (
                                                    <p className="text-xs text-destructive">{errors.discounts[index].threshold.message}</p>
                                                )}
                                            </div>
                                            <div className="flex-1 space-y-2">
                                                <Label className="text-xs">Porcentaje (%)</Label>
                                                <Input
                                                    type="number"
                                                    step="0.1"
                                                    {...register(`discounts.${index}.percentage`)}
                                                    placeholder="Ej: 5"
                                                />
                                                {errors.discounts?.[index]?.percentage && (
                                                    <p className="text-xs text-destructive">{errors.discounts[index].percentage.message}</p>
                                                )}
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="mt-8 text-muted-foreground hover:text-destructive"
                                                onClick={() => remove(index)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ))}
                                    {fields.length === 0 && (
                                        <div className="text-center py-8 text-muted-foreground text-sm border-2 border-dashed rounded-lg">
                                            No hay reglas de descuento definidas
                                        </div>
                                    )}
                                </div>
                            </ScrollArea>
                        </div>

                        <DialogFooter className="mt-auto pt-4">
                            <Button type="button" variant="outline" onClick={onClose}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isSaving}>
                                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Guardar Cambios
                            </Button>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}
