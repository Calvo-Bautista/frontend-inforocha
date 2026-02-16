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
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Plus, Trash2, Shield, Settings, Percent } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const MODULES = [
    { id: "productos", label: "Productos" },
    { id: "clientes", label: "Compradores & Llamadas" },
    { id: "nueva-orden", label: "Nueva Orden" },
    { id: "mis-pedidos", label: "Mis Pedidos" },
    { id: "despachos", label: "Despachos" },
    { id: "usuarios", label: "Usuarios" },
];

const ROLES = [
    { id: "vendedor", label: "Vendedor" },
    { id: "logistica", label: "Logística" },
    { id: "admin", label: "Administrador" },
    { id: "owner", label: "Owner" },
];

const configSchema = z.object({
    shipping_cost: z.coerce.number().min(0, "El costo debe ser mayor o igual a 0"),
    discounts: z.array(z.object({
        threshold: z.coerce.number().min(0, "El umbral debe ser mayor o igual a 0"),
        percentage: z.coerce.number().min(0).max(100, "El porcentaje debe estar entre 0 y 100"),
    })),
    role_permissions: z.record(z.array(z.string()))
});

export default function SettingsModal({ isOpen, onClose }) {
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const {
        register,
        control,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(configSchema),
        defaultValues: {
            shipping_cost: 0,
            discounts: [],
            role_permissions: {}
        },
    });

    const rolePermissions = watch("role_permissions");

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
            // Ensure defaults
            if (!data.discounts) data.discounts = [];
            if (!data.role_permissions) data.role_permissions = {};

            // Initialize missing roles
            ROLES.forEach(role => {
                if (!data.role_permissions[role.id]) {
                    data.role_permissions[role.id] = [];
                }
            });

            reset(data);
        } catch (error) {
            console.error("Error loading config:", error);
            toast.error("Error al cargar la configuración");
        } finally {
            setIsLoading(false);
        }
    };

    const togglePermission = (roleId, moduleId) => {
        const currentPermissions = { ...rolePermissions };
        const rolePerms = currentPermissions[roleId] || [];

        if (rolePerms.includes(moduleId)) {
            currentPermissions[roleId] = rolePerms.filter(id => id !== moduleId);
        } else {
            currentPermissions[roleId] = [...rolePerms, moduleId];
        }

        setValue("role_permissions", currentPermissions, { shouldDirty: true });
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
            <DialogContent className="sm:max-w-[700px] h-[85vh] flex flex-col p-0">
                <div className="p-6 pb-2">
                    <DialogHeader>
                        <DialogTitle>Configuración del Sistema</DialogTitle>
                        <DialogDescription>
                            Ajusta los costos, descuentos y permisos de acceso por rol.
                        </DialogDescription>
                    </DialogHeader>
                </div>

                {isLoading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col min-h-0">
                        <Tabs defaultValue="costs" className="flex-1 flex flex-col min-h-0">
                            <div className="px-6 border-b">
                                <TabsList className="bg-transparent border-b-0 w-full justify-start overflow-x-auto h-auto p-0 gap-6">
                                    <TabsTrigger value="costs" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none shadow-none px-0 pb-3 pt-2 h-auto shrink-0">
                                        <Percent className="w-4 h-4 mr-2" />
                                        Precios y Descuentos
                                    </TabsTrigger>
                                    <TabsTrigger value="permissions" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none shadow-none px-0 pb-3 pt-2 h-auto shrink-0">
                                        <Shield className="w-4 h-4 mr-2" />
                                        Permisos por Rol
                                    </TabsTrigger>
                                </TabsList>
                            </div>

                            <div className="flex-1 overflow-hidden">
                                <TabsContent value="costs" className="h-full m-0 p-6 space-y-6 overflow-y-auto">
                                    {/* Shipping Cost Section */}
                                    <div className="space-y-4 p-4 border rounded-lg bg-secondary/20">
                                        <Label className="flex items-center gap-2 text-base font-semibold">
                                            <Settings className="w-4 h-4" />
                                            Costo de Envío
                                        </Label>
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
                                    <div className="space-y-4 p-4 border rounded-lg bg-secondary/20 min-h-[300px]">
                                        <div className="flex justify-between items-center">
                                            <Label className="flex items-center gap-2 text-base font-semibold">
                                                <Percent className="w-4 h-4" />
                                                Reglas de Descuento
                                            </Label>
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
                                                    </div>
                                                    <div className="flex-1 space-y-2">
                                                        <Label className="text-xs">Porcentaje (%)</Label>
                                                        <Input
                                                            type="number"
                                                            step="0.1"
                                                            {...register(`discounts.${index}.percentage`)}
                                                            placeholder="Ej: 5"
                                                        />
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
                                    </div>
                                </TabsContent>

                                <TabsContent value="permissions" className="h-full m-0 p-6 overflow-y-auto">
                                    <div className="border rounded-lg overflow-x-auto">
                                        <table className="w-full text-sm min-w-[600px]">
                                            <thead className="bg-secondary/50 border-b">
                                                <tr>
                                                    <th className="p-3 text-left font-semibold">Módulo / Permiso</th>
                                                    {ROLES.map(role => (
                                                        <th key={role.id} className="p-3 text-center font-semibold">
                                                            {role.label}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y">
                                                {MODULES.map(mod => (
                                                    <tr key={mod.id} className="hover:bg-secondary/10 transition-colors">
                                                        <td className="p-3 font-medium">{mod.label}</td>
                                                        {ROLES.map(role => {
                                                            const isOwner = role.id === 'owner';
                                                            const isChecked = isOwner || rolePermissions?.[role.id]?.includes(mod.id);
                                                            return (
                                                                <td key={`${role.id}-${mod.id}`} className="p-3 text-center">
                                                                    <Checkbox
                                                                        checked={isChecked}
                                                                        disabled={isOwner}
                                                                        onCheckedChange={() => !isOwner && togglePermission(role.id, mod.id)}
                                                                    />
                                                                </td>
                                                            );
                                                        })}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-4 italic">
                                        * Los cambios reiniciarán el acceso de los usuarios la próxima vez que carguen la aplicación.
                                    </p>
                                </TabsContent>
                            </div>
                        </Tabs>

                        <div className="p-6 border-t mt-auto">
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={onClose}>
                                    Cancelar
                                </Button>
                                <Button type="submit" disabled={isSaving}>
                                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Guardar Cambios
                                </Button>
                            </DialogFooter>
                        </div>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}
