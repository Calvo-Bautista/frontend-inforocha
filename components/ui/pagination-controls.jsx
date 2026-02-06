"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function PaginationControls({
    currentPage,
    totalPages,
    onPageChange,
    totalItems,
    itemsPerPage,
}) {
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    return (
        <div className="flex items-center justify-between px-2">
            <div className="text-sm text-muted-foreground">
                Mostrando {startItem}-{endItem} de {totalItems} registros
            </div>
            <div className="flex items-center space-x-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="sr-only">Anterior</span>
                </Button>
                <div className="text-sm font-medium">
                    Página {currentPage} de {totalPages}
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                >
                    <ChevronRight className="h-4 w-4" />
                    <span className="sr-only">Siguiente</span>
                </Button>
            </div>
        </div>
    );
}
