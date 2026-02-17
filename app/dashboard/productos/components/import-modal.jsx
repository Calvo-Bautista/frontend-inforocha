"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileSpreadsheet, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { productsAPI } from "@/lib/api";
import { toast } from "sonner";

export function ImportProductsModal({ isOpen, onClose, onSuccess }) {
    const [file, setFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [result, setResult] = useState(null);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && selectedFile.name.endsWith('.xlsx')) {
            setFile(selectedFile);
            setResult(null);
        } else {
            toast.error("Por favor seleccione un archivo Excel (.xlsx)");
            setFile(null);
        }
    };

    const handleImport = async () => {
        if (!file) return;

        setIsUploading(true);
        setResult(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const data = await productsAPI.importProducts(formData);
            setResult(data);
            toast.success("Importación completada con éxito");
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error("Import error:", error);
            toast.error("Error al importar productos", {
                description: error.message
            });
        } finally {
            setIsUploading(false);
        }
    };

    const handleClose = () => {
        setFile(null);
        setResult(null);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileSpreadsheet className="h-5 w-5 text-green-600" />
                        Importar Productos
                    </DialogTitle>
                    <DialogDescription>
                        Seleccione un archivo Excel para importar o actualizar productos.
                        <br />
                        <span className="text-xs text-muted-foreground mt-1 block">
                            Hojas requeridas: Toner, Cartucho, Drum (match flexible)
                            <br />
                            Columnas: Articulo, Descripción, Precio venta
                        </span>
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    {!result ? (
                        <div className="grid w-full max-w-sm items-center gap-1.5">
                            <Label htmlFor="excel-file">Archivo Excel</Label>
                            <Input
                                id="excel-file"
                                type="file"
                                accept=".xlsx"
                                onChange={handleFileChange}
                                disabled={isUploading}
                            />
                        </div>
                    ) : (
                        <div className="bg-green-50 border border-green-200 rounded-md p-4 text-sm text-green-800">
                            <div className="flex items-center gap-2 font-medium mb-1">
                                <CheckCircle2 className="h-4 w-4" /> Importación exitosa
                            </div>
                            <ul className="list-disc list-inside pl-4 space-y-1">
                                <li>Nuevos productos: <strong>{result.created}</strong></li>
                                <li>Actualizados: <strong>{result.updated}</strong></li>
                            </ul>
                        </div>
                    )}
                </div>

                <DialogFooter className="sm:justify-between">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={handleClose}
                        disabled={isUploading}
                    >
                        {result ? "Cerrar" : "Cancelar"}
                    </Button>
                    {!result && (
                        <Button
                            type="button"
                            onClick={handleImport}
                            disabled={!file || isUploading}
                        >
                            {isUploading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Importando...
                                </>
                            ) : (
                                <>
                                    <Upload className="mr-2 h-4 w-4" />
                                    Iniciar Importación
                                </>
                            )}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
