"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
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
import { Loader2 } from "lucide-react";

const configSchema = z.object({
    shipping_cost: z.coerce.number().min(0, "El costo debe ser mayor o igual a 0"),
    discount_threshold_1: z.coerce.number().min(0, "El umbral debe ser mayor o igual a 0"),
    discount_percentage_1: z.coerce.number().min(0).max(100, "El porcentaje debe estar entre 0 y 100"),
    discount_threshold_2: z.coerce.number().min(0, "El umbral debe ser mayor o igual a 0"),
    discount_percentage_2: z.coerce.number().min(0).max(100, "El porcentaje debe estar entre 0 y 100"),
    discount_threshold_3: z.coerce.number().min(0, "El umbral debe ser mayor o igual a 0"),
    discount_percentage_3: z.coerce.number().min(0).max(100, "El porcentaje debe estar entre 0 y 100"),
});

export default function SettingsModal({ isOpen, onClose }) {
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(configSchema),
        defaultValues: {
            shipping_cost: 0,
            discount_threshold_1: 100000,
            discount_percentage_1: 5,
            discount_threshold_2: 300000,
            discount_percentage_2: 10,
            discount_threshold_3: 500000,
            discount_percentage_3: 15,
        },
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
            <DialogContent className="sm:max-w-[500px]">
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
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Costo de Envío ($)</Label>
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

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Umbral Descuento 1 ($)</Label>
                                <Input
                                    type="number"
                                    {...register("discount_threshold_1")}
                                />
                                {errors.discount_threshold_1 && (
                                    <p className="text-sm text-destructive">{errors.discount_threshold_1.message}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label>Porcentaje 1 (%)</Label>
                                <Input
                                    type="number"
                                    step="0.1"
                                    {...register("discount_percentage_1")}
                                />
                                {errors.discount_percentage_1 && (
                                    <p className="text-sm text-destructive">{errors.discount_percentage_1.message}</p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Umbral Descuento 2 ($)</Label>
                                <Input
                                    type="number"
                                    {...register("discount_threshold_2")}
                                />
                                {errors.discount_threshold_2 && (
                                    <p className="text-sm text-destructive">{errors.discount_threshold_2.message}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label>Porcentaje 2 (%)</Label>
                                <Input
                                    type="number"
                                    step="0.1"
                                    {...register("discount_percentage_2")}
                                />
                                {errors.discount_percentage_2 && (
                                    <p className="text-sm text-destructive">{errors.discount_percentage_2.message}</p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Umbral Descuento 3 ($)</Label>
                                <Input
                                    type="number"
                                    {...register("discount_threshold_3")}
                                />
                                {errors.discount_threshold_3 && (
                                    <p className="text-sm text-destructive">{errors.discount_threshold_3.message}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label>Porcentaje 3 (%)</Label>
                                <Input
                                    type="number"
                                    step="0.1"
                                    {...register("discount_percentage_3")}
                                />
                                {errors.discount_percentage_3 && (
                                    <p className="text-sm text-destructive">{errors.discount_percentage_3.message}</p>
                                )}
                            </div>
                        </div>

                        <DialogFooter>
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
