"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Loader2, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

export function LogCallModal({ client, open, onOpenChange, onSubmit }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date(),
    industry: client?.industry || "",
    usesPrinters: "",
    printerType: "",
    interestedInQuote: "",
    notes: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const callLog = {
      client_id: client.id,
      call_date: format(formData.date, "yyyy-MM-dd"),
      industry: formData.industry,
      uses_printers: formData.usesPrinters === "yes",
      printer_type: formData.printerType,
      interested_in_quote: formData.interestedInQuote === "yes",
      notes: formData.notes,
    };

    if (onSubmit) {
      onSubmit(callLog);
    }

    setIsSubmitting(false);
    setShowSuccess(true);

    // Reset and close after showing success
    setTimeout(() => {
      setShowSuccess(false);
      setFormData({
        date: new Date(),
        industry: client?.industry || "",
        usesPrinters: "",
        printerType: "",
        interestedInQuote: "",
        notes: "",
      });
      onOpenChange(false);
    }, 1500);
  };

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (!client) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        {showSuccess ? (
          <div className="py-12 text-center">
            <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-success" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">
              Reporte Guardado
            </h3>
            <p className="text-muted-foreground">
              La llamada ha sido registrada exitosamente
            </p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Registrar Llamada</DialogTitle>
              <DialogDescription>
                Registra la interacción con{" "}
                <span className="font-medium text-foreground">
                  {client.name}
                </span>
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-5 mt-4">
              {/* Fecha de interacción */}
              <div className="space-y-2">
                <Label>Fecha de Interacción</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.date ? (
                        format(formData.date, "PPP", { locale: es })
                      ) : (
                        <span>Seleccionar fecha</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.date}
                      onSelect={(date) => updateField("date", date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Rubro */}
              <div className="space-y-2">
                <Label htmlFor="industry">Rubro</Label>
                <Input
                  id="industry"
                  placeholder="Ej: Papelería, Tecnología, Educación..."
                  value={formData.industry}
                  onChange={(e) => updateField("industry", e.target.value)}
                />
              </div>

              {/* ¿Usa impresoras? */}
              <div className="space-y-3">
                <Label>¿Usa impresoras?</Label>
                <RadioGroup
                  value={formData.usesPrinters}
                  onValueChange={(value) => updateField("usesPrinters", value)}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="printers-yes" />
                    <Label htmlFor="printers-yes" className="font-normal cursor-pointer">
                      Sí
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="printers-no" />
                    <Label htmlFor="printers-no" className="font-normal cursor-pointer">
                      No
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Tipo de impresoras (condicional) */}
              {formData.usesPrinters === "yes" && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  <Label htmlFor="printerType">¿Qué tipo de impresoras usa?</Label>
                  <Input
                    id="printerType"
                    placeholder="Ej: HP LaserJet, Brother, Epson EcoTank..."
                    value={formData.printerType}
                    onChange={(e) => updateField("printerType", e.target.value)}
                  />
                </div>
              )}

              {/* ¿Interesado en cotización? */}
              <div className="space-y-3">
                <Label>¿Interesado en cotización?</Label>
                <RadioGroup
                  value={formData.interestedInQuote}
                  onValueChange={(value) => updateField("interestedInQuote", value)}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="quote-yes" />
                    <Label htmlFor="quote-yes" className="font-normal cursor-pointer">
                      Sí
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="quote-no" />
                    <Label htmlFor="quote-no" className="font-normal cursor-pointer">
                      No
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Comentarios / Observaciones */}
              <div className="space-y-2">
                <Label htmlFor="notes">Comentarios / Observaciones</Label>
                <Textarea
                  id="notes"
                  placeholder="Ingresa notas adicionales sobre la llamada..."
                  value={formData.notes}
                  onChange={(e) => updateField("notes", e.target.value)}
                  rows={4}
                />
              </div>

              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    "Guardar Reporte"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
