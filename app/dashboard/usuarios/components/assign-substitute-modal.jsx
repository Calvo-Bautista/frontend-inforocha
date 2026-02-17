"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2, UserCheck } from "lucide-react";
import { usersAPI } from "@/lib/api";
import { toast } from "sonner";

export default function AssignSubstituteModal({ open, onOpenChange, user, onAssignSuccess }) {
    const [substitutes, setSubstitutes] = useState([]);
    const [selectedSubstitute, setSelectedSubstitute] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (open && user) {
            fetchSubstitutes();
            // If user already has a substitute, set it (though the API structure implies we might need to fetch user details again or pass full user object)
            if (user.substitute_id) {
                setSelectedSubstitute(user.substitute_id.toString());
            } else {
                setSelectedSubstitute("");
            }
        }
    }, [open, user]);

    const fetchSubstitutes = async () => {
        try {
            setIsLoading(true);
            // Fetch users with the SAME role
            const data = await usersAPI.getAll({ role: user.role, limit: 100 });
            // Filter out the user themselves
            const available = data.filter(u => u.id !== user.id && u.is_active);
            setSubstitutes(available);
        } catch (error) {
            console.error("Error fetching substitutes:", error);
            toast.error("Error al cargar lista de suplentes");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedSubstitute) return;

        setIsSubmitting(true);
        try {
            await usersAPI.setLeave(user.id, parseInt(selectedSubstitute));
            toast.success("Suplencia asignada correctamente");
            onOpenChange(false);
            if (onAssignSuccess) onAssignSuccess();
        } catch (error) {
            console.warn("Error assigning substitute:", error); // Use warn to avoid Next.js error overlay
            toast.error("No se pudo asignar el suplente", {
                description: error.message || "Ocurrió un error inesperado",
                duration: 5000, // Make it stay longer
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReturnFromLeave = async () => {
        setIsSubmitting(true);
        try {
            await usersAPI.returnFromLeave(user.id);
            toast.success("Usuario regresado de vacaciones");
            onOpenChange(false);
            if (onAssignSuccess) onAssignSuccess();
        } catch (error) {
            console.error("Error returning from leave:", error);
            toast.error("Error al finalizar vacaciones", {
                description: error.message
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!user) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Asignar Suplencia</DialogTitle>
                    <DialogDescription>
                        Selecciona un suplente para <strong>{user.name}</strong> ({user.role}).
                        El suplente tendrá acceso a los pedidos de este usuario mientras duren las vacaciones.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="substitute">Suplente ({user.role})</Label>
                        {isLoading ? (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Loader2 className="h-4 w-4 animate-spin" /> Cargando usuarios...
                            </div>
                        ) : (
                            <Select
                                value={selectedSubstitute}
                                onValueChange={setSelectedSubstitute}
                                disabled={user.is_on_leave}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar usuario..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {substitutes.map((sub) => (
                                        <SelectItem key={sub.id} value={sub.id.toString()}>
                                            {sub.name}
                                            {sub.is_on_leave && " (De Vacaciones)"}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                        {user.is_on_leave && (
                            <p className="text-sm text-amber-600 font-medium">
                                El usuario está actualmente de vacaciones.
                            </p>
                        )}
                        {selectedSubstitute && substitutes.find(s => s.id.toString() === selectedSubstitute)?.is_on_leave && (
                            <p className="text-sm text-destructive font-medium">
                                El usuario seleccionado está de vacaciones y no puede ser suplente.
                            </p>
                        )}
                    </div>

                    <DialogFooter className="flex-col sm:flex-row gap-2">
                        {user.is_on_leave ? (
                            <Button
                                type="button"
                                variant="destructive"
                                onClick={handleReturnFromLeave}
                                disabled={isSubmitting}
                                className="w-full sm:w-auto"
                            >
                                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                Finalizar Vacaciones
                            </Button>
                        ) : (
                            <Button
                                type="submit"
                                disabled={
                                    isSubmitting ||
                                    !selectedSubstitute ||
                                    substitutes.find(s => s.id.toString() === selectedSubstitute)?.is_on_leave
                                }
                                className="w-full sm:w-auto"
                            >
                                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserCheck className="mr-2 h-4 w-4" />}
                                Asignar Suplente
                            </Button>
                        )}
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
