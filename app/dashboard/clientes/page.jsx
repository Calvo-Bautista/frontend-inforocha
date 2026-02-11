"use client";

import { useState, useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClientSchema, editClientSchema } from "@/lib/schemas/clients";
import { getClientStatus, getClientPriority } from "@/lib/mock-data";
import { clientsAPI } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "sonner";

import { PaginationControls } from "@/components/ui/pagination-controls";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Phone,
  Users,
  MapPin,
  Building2,
  Plus,
  Printer,
  MoreHorizontal,
  Pencil,
  Eye,
  Trash2,
  Mail,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Loading from "./loading";

const statusColorMap = {
  warning: "bg-warning text-warning-foreground",
  success: "bg-success text-success-foreground",
  default: "bg-secondary text-secondary-foreground",
};

export default function ClientesPage() {
  const { user } = useAuth();
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Pagination State
  const [page, setPage] = useState(1);
  const [limit] = useState(8);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedClient, setSelectedClient] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNewContactOpen, setIsNewContactOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [clientToEdit, setClientToEdit] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [clientToView, setClientToView] = useState(null);

  const searchParams = useSearchParams();

  // Form for creating new client
  const {
    register: registerNew,
    handleSubmit: handleSubmitNew,
    reset: resetNew,
    formState: { errors: errorsNew },
  } = useForm({
    resolver: zodResolver(createClientSchema),
    defaultValues: {
      name: "",
      phone: "",
      address: "",
      industry: "",
      maquinas: "",
      tipoCliente: "",
      proveedorActual: "",
      status: "prospect",
    },
  });

  // Form for editing client
  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    reset: resetEdit,
    formState: { errors: errorsEdit },
  } = useForm({
    resolver: zodResolver(editClientSchema),
  });

  // State for managing printer lists
  const [newPrinters, setNewPrinters] = useState([""]);
  const [editPrinters, setEditPrinters] = useState([""]);

  // Reset page to 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [statusFilter, searchTerm]);

  // Fetch clients from API
  useEffect(() => {
    const fetchClients = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const params = {
          skip: (page - 1) * limit,
          limit: limit,
        };
        if (statusFilter !== "all") {
          params.status = statusFilter;
        }
        if (searchTerm) {
          params.search = searchTerm;
        }

        const data = await clientsAPI.getAll(params);
        setClients(data);
        if (data.total !== undefined) {
          setTotalItems(data.total);
        }
      } catch (err) {
        console.error("Error fetching clients:", err);
        setError(err.message);
        toast.error("Error al cargar clientes", {
          description: err.message,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchClients();
  }, [statusFilter, searchTerm, page, limit]);

  const filteredClients = clients;



  const handleNewContactSubmit = async (data) => {
    try {
      const clientData = {
        ...data,
        priority: data.tipoCliente || null,
        proveedor_actual: data.proveedorActual,
        printers: newPrinters.filter(p => p.trim() !== ""),  // Only send non-empty printers
      };
      // Remove old fields
      delete clientData.tipoCliente;
      delete clientData.proveedorActual;
      delete clientData.maquinas;

      const createdClient = await clientsAPI.create(clientData);
      setClients((prev) => [...prev, createdClient]);
      resetNew();
      setNewPrinters([""]);
      setIsNewContactOpen(false);
      toast.success("Cliente creado exitosamente");
    } catch (err) {
      console.error("Error creating client:", err);
      toast.error("Error al crear cliente", {
        description: err.message,
      });
    }
  };

  const openEditDialog = (client) => {
    setClientToEdit(client);
    resetEdit({
      name: client.name,
      phone: client.phone,
      address: client.address || "",
      industry: client.industry || "",
      maquinas: client.maquinas || "",
      tipoCliente: client.priority || "",
      proveedorActual: client.proveedor_actual || "",
      status: client.status || "prospect",
    });

    // Populate printers from client.printers array or fallback to maquinas
    if (client.printers && client.printers.length > 0) {
      setEditPrinters(client.printers.map(p => p.printer_model));
    } else if (client.maquinas) {
      // Fallback: split maquinas string by comma
      setEditPrinters(client.maquinas.split(',').map(p => p.trim()).filter(p => p));
    } else {
      setEditPrinters([""]);
    }

    setIsEditOpen(true);
  };

  const handleEditContactSubmit = async (data) => {
    if (!clientToEdit) return;

    try {
      const clientData = {
        ...data,
        priority: data.tipoCliente || null,
        proveedor_actual: data.proveedorActual,
        printers: editPrinters.filter(p => p.trim() !== ""),  // Only send non-empty printers
      };
      // Remove old fields
      delete clientData.tipoCliente;
      delete clientData.proveedorActual;
      delete clientData.maquinas;

      const updatedClient = await clientsAPI.update(clientToEdit.id, clientData);

      setClients((prev) =>
        prev.map((c) => (c.id === clientToEdit.id ? updatedClient : c))
      );

      setIsEditOpen(false);
      setClientToEdit(null);
      toast.success("Cliente actualizado exitosamente");
    } catch (err) {
      console.error("Error updating client:", err);
      toast.error("Error al actualizar cliente", {
        description: err.message,
      });
    }
  };

  const confirmDelete = (client) => {
    setClientToDelete(client);
    setIsDeleteOpen(true);
  };

  const openDetailsDialog = (client) => {
    setClientToView(client);
    setIsDetailsOpen(true);
  };

  const handleDeleteClient = async () => {
    if (!clientToDelete) return;

    try {
      await clientsAPI.delete(clientToDelete.id);

      setClients((prev) => prev.filter((c) => c.id !== clientToDelete.id));

      toast.success("Cliente eliminado", {
        description: `${clientToDelete.name} ha sido eliminado del sistema`,
      });

      setIsDeleteOpen(false);
      setClientToDelete(null);
    } catch (err) {
      console.error("Error deleting client:", err);
      toast.error("Error al eliminar cliente", {
        description: err.message,
      });
    }
  };



  const statusFilters = [
    { value: "all", label: "Todos" },
    { value: "active", label: "Clientes Activos" },
    { value: "prospect", label: "Prospectos" },
  ];

  return (
    <Suspense fallback={<Loading />}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Compradores & Llamadas
            </h1>
            <p className="text-muted-foreground">
              Gestiona tus clientes y registra las interacciones comerciales
            </p>
          </div>
          <Dialog open={isNewContactOpen} onOpenChange={setIsNewContactOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Nuevo Contacto
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Registrar Nuevo Contacto</DialogTitle>
                <DialogDescription>
                  Agrega un nuevo cliente o prospecto a la lista
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmitNew(handleNewContactSubmit)}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Nombre de la Empresa *</Label>
                    <Input
                      id="name"
                      {...registerNew("name")}
                      placeholder="Ej: Papelería Central"
                    />
                    {errorsNew.name && (
                      <p className="text-sm text-destructive">
                        {errorsNew.name.message}
                      </p>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="phone">Teléfono *</Label>
                      <Input
                        id="phone"
                        {...registerNew("phone")}
                        placeholder="+54 11 1234-5678"
                      />
                      {errorsNew.phone && (
                        <p className="text-sm text-destructive">
                          {errorsNew.phone.message}
                        </p>
                      )}
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="industry">Rubro</Label>
                      <Input
                        id="industry"
                        {...registerNew("industry")}
                        placeholder="Ej: Tecnología"
                      />
                      {errorsNew.industry && (
                        <p className="text-sm text-destructive">
                          {errorsNew.industry.message}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="address">Dirección</Label>
                    <Input
                      id="address"
                      {...registerNew("address")}
                      placeholder="Av. Corrientes 1234, CABA"
                    />
                    {errorsNew.address && (
                      <p className="text-sm text-destructive">
                        {errorsNew.address.message}
                      </p>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label>Impresoras (Marca/Modelo)</Label>
                    {newPrinters.map((printer, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={printer}
                          onChange={(e) => {
                            const updated = [...newPrinters];
                            updated[index] = e.target.value;
                            setNewPrinters(updated);
                          }}
                          placeholder="Ej: HP LaserJet Pro M15w"
                        />
                        {newPrinters.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => {
                              setNewPrinters(newPrinters.filter((_, i) => i !== index));
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setNewPrinters([...newPrinters, ""])}
                      className="w-full"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Agregar Impresora
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="tipoCliente">Tipo de Cliente</Label>
                      <Select
                        onValueChange={(value) => {
                          const finalValue = value === "unspecified" ? "" : value;
                          const event = { target: { name: "tipoCliente", value: finalValue } };
                          registerNew("tipoCliente").onChange(event);
                        }}
                        defaultValue="unspecified"
                      >
                        <SelectTrigger id="tipoCliente">
                          <SelectValue placeholder="Seleccionar..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unspecified">Sin especificar</SelectItem>
                          <SelectItem value="ALTA">Alta Prioridad (1/mes)</SelectItem>
                          <SelectItem value="MEDIA">Media Prioridad (1 cada 2-3 meses)</SelectItem>
                          <SelectItem value="BAJA">Baja Prioridad (1 cada 6+ meses)</SelectItem>
                        </SelectContent>
                      </Select>
                      {errorsNew.tipoCliente && (
                        <p className="text-sm text-destructive">
                          {errorsNew.tipoCliente.message}
                        </p>
                      )}
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="proveedorActual">Proveedor Actual</Label>
                      <Input
                        id="proveedorActual"
                        {...registerNew("proveedorActual")}
                        placeholder="Ej: Suministros BA"
                      />
                      {errorsNew.proveedorActual && (
                        <p className="text-sm text-destructive">
                          {errorsNew.proveedorActual.message}
                        </p>
                      )}
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="status">Estado *</Label>
                      <Select
                        onValueChange={(value) => {
                          const event = { target: { name: "status", value } };
                          registerNew("status").onChange(event);
                        }}
                        defaultValue="prospect"
                      >
                        <SelectTrigger id="status">
                          <SelectValue placeholder="Seleccionar estado..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="prospect">Prospecto</SelectItem>
                          <SelectItem value="active">Cliente Activo</SelectItem>
                        </SelectContent>
                      </Select>
                      {errorsNew.status && (
                        <p className="text-sm text-destructive">
                          {errorsNew.status.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" type="button" onClick={() => setIsNewContactOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    Guardar Contacto
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* Edit Contact Dialog */}
          <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Editar Cliente</DialogTitle>
                <DialogDescription>
                  Modifica la información del cliente
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmitEdit(handleEditContactSubmit)}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-name">Nombre de la Empresa *</Label>
                    <Input
                      id="edit-name"
                      {...registerEdit("name")}
                    />
                    {errorsEdit.name && (
                      <p className="text-sm text-destructive">
                        {errorsEdit.name.message}
                      </p>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="edit-phone">Teléfono *</Label>
                      <Input
                        id="edit-phone"
                        {...registerEdit("phone")}
                      />
                      {errorsEdit.phone && (
                        <p className="text-sm text-destructive">
                          {errorsEdit.phone.message}
                        </p>
                      )}
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-industry">Rubro</Label>
                      <Input
                        id="edit-industry"
                        {...registerEdit("industry")}
                      />
                      {errorsEdit.industry && (
                        <p className="text-sm text-destructive">
                          {errorsEdit.industry.message}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-address">Dirección</Label>
                    <Input
                      id="edit-address"
                      {...registerEdit("address")}
                    />
                    {errorsEdit.address && (
                      <p className="text-sm text-destructive">
                        {errorsEdit.address.message}
                      </p>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label>Impresoras (Marca/Modelo)</Label>
                    {editPrinters.map((printer, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={printer}
                          onChange={(e) => {
                            const updated = [...editPrinters];
                            updated[index] = e.target.value;
                            setEditPrinters(updated);
                          }}
                          placeholder="Ej: HP LaserJet Pro M15w"
                        />
                        {editPrinters.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => {
                              setEditPrinters(editPrinters.filter((_, i) => i !== index));
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setEditPrinters([...editPrinters, ""])}
                      className="w-full"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Agregar Impresora
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="edit-tipoCliente">Tipo de Cliente</Label>
                      <Select
                        onValueChange={(value) => {
                          const finalValue = value === "unspecified" ? "" : value;
                          const event = { target: { name: "tipoCliente", value: finalValue } };
                          registerEdit("tipoCliente").onChange(event);
                        }}
                        defaultValue={clientToEdit?.priority || "unspecified"}
                      >
                        <SelectTrigger id="edit-tipoCliente">
                          <SelectValue placeholder="Seleccionar..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unspecified">Sin especificar</SelectItem>
                          <SelectItem value="ALTA">Alta Prioridad (1/mes)</SelectItem>
                          <SelectItem value="MEDIA">Media Prioridad (1 cada 2-3 meses)</SelectItem>
                          <SelectItem value="BAJA">Baja Prioridad (1 cada 6+ meses)</SelectItem>
                        </SelectContent>
                      </Select>
                      {errorsEdit.tipoCliente && (
                        <p className="text-sm text-destructive">
                          {errorsEdit.tipoCliente.message}
                        </p>
                      )}
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-proveedorActual">Proveedor Actual</Label>
                      <Input
                        id="edit-proveedorActual"
                        {...registerEdit("proveedorActual")}
                      />
                      {errorsEdit.proveedorActual && (
                        <p className="text-sm text-destructive">
                          {errorsEdit.proveedorActual.message}
                        </p>
                      )}
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-status">Estado *</Label>
                      <Select
                        onValueChange={(value) => {
                          const event = { target: { name: "status", value } };
                          registerEdit("status").onChange(event);
                        }}
                        defaultValue=""
                      >
                        <SelectTrigger id="edit-status">
                          <SelectValue placeholder="Seleccionar estado..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="prospect">Prospecto</SelectItem>
                          <SelectItem value="active">Cliente Activo</SelectItem>
                        </SelectContent>
                      </Select>
                      {errorsEdit.status && (
                        <p className="text-sm text-destructive">
                          {errorsEdit.status.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" type="button" onClick={() => setIsEditOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    Guardar Cambios
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, teléfono o dirección..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            {statusFilters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setStatusFilter(filter.value)}
                className={cn(
                  "px-3 py-1.5 text-sm font-medium rounded-lg transition-colors",
                  statusFilter === filter.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div >

        {/* Clients Table - Desktop */}
        < Card className="hidden lg:block" >
          <CardHeader>
            <CardTitle>Lista de Contactos</CardTitle>
            <CardDescription>
              {filteredClients.length} contactos encontrados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Legajo</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Teléfono</TableHead>
                    <TableHead>Máquinas</TableHead>
                    <TableHead>Tipo Cliente</TableHead>
                    <TableHead>Proveedor Actual</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acción</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClients.map((client) => {
                    const clientStatus = getClientStatus(client.status);
                    const clientPriority = getClientPriority(client.priority);

                    return (
                      <TableRow key={client.id}>
                        <TableCell>
                          <span className="font-mono text-sm text-muted-foreground">
                            {client.legajo || "-"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{client.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {client.industry || "-"}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-muted-foreground" />
                            {client.phone}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 max-w-xs">
                            <Printer className="w-4 h-4 text-muted-foreground shrink-0" />
                            <span className="truncate text-sm">
                              {client.printers && client.printers.length > 0
                                ? client.printers.map(p => p.printer_model).join(", ")
                                : client.maquinas || "-"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {client.priority ? (
                            <Badge className={statusColorMap[clientPriority.color]}>
                              {clientPriority.label}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {client.proveedor_actual || "-"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge className={statusColorMap[clientStatus.color]}>
                            {clientStatus.label}
                          </Badge>

                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="w-4 h-4" />
                                <span className="sr-only">Abrir menú</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openDetailsDialog(client)}>
                                <Eye className="w-4 h-4 mr-2" />
                                Ver
                              </DropdownMenuItem>
                              {(user?.role === "vendedor" || user?.role === "owner") && (
                                <DropdownMenuItem onClick={() => openEditDialog(client)}>
                                  <Pencil className="w-4 h-4 mr-2" />
                                  Editar
                                </DropdownMenuItem>
                              )}

                              {(user?.role === "admin" || user?.role === "owner") && (
                                <>
                                  <DropdownMenuItem
                                    className="text-destructive focus:text-destructive"
                                    onClick={() => confirmDelete(client)}
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Eliminar
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card >

        {/* Clients Cards - Mobile/Tablet */}
        < div className="lg:hidden space-y-4" >
          {
            filteredClients.map((client) => {
              const clientStatus = getClientStatus(client.status);
              const clientPriority = getClientPriority(client.priority);

              return (
                <Card key={client.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        <h3 className="font-medium text-foreground">
                          {client.name}
                        </h3>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                          <Building2 className="w-3.5 h-3.5" />
                          {client.industry || "-"}
                        </div>
                      </div>
                      <div className="flex flex-col gap-1 items-end">
                        <Badge className={statusColorMap[clientStatus.color]}>
                          {clientStatus.label}
                        </Badge>
                        {client.tipoCliente && (
                          <Badge variant="outline" className="text-xs">
                            {clientPriority.label}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2 text-sm mb-4">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="w-4 h-4" />
                        {client.phone}
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="w-4 h-4 shrink-0" />
                        <span className="truncate">{client.address || "-"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Printer className="w-4 h-4 shrink-0" />
                        <span className="truncate">
                          {client.printers && client.printers.length > 0
                            ? client.printers.map(p => p.printer_model).join(", ")
                            : client.maquinas || "-"}
                        </span>
                      </div>
                      {client.proveedorActual && (
                        <div className="text-muted-foreground">
                          <span className="font-medium">Proveedor:</span> {client.proveedorActual}
                        </div>
                      )}
                    </div>


                  </CardContent>
                </Card>
              );
            })
          }
        </div >

        {/* Pagination Controls */}
        <PaginationControls
          currentPage={page}
          totalPages={Math.ceil(totalItems / limit)}
          onPageChange={setPage}
          totalItems={totalItems}
          itemsPerPage={limit}
        />

        {/* Empty State */}
        {
          filteredClients.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-1">
                No se encontraron contactos
              </h3>
              <p className="text-muted-foreground">
                Intenta con otros términos de búsqueda o cambia el filtro de estado
              </p>
            </div>
          )
        }





        {/* Client Details Modal */}
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Detalles del Cliente</DialogTitle>
              <DialogDescription>
                Información completa del cliente
              </DialogDescription>
            </DialogHeader>
            {clientToView && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-muted-foreground text-xs">Nombre</Label>
                    <p className="text-base font-medium">{clientToView.name}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground text-xs">Legajo</Label>
                      <p className="text-sm font-mono">{clientToView.legajo || "-"}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-xs">Estado</Label>
                      <div className="mt-1">
                        <Badge className={statusColorMap[getClientStatus(clientToView.status).color]}>
                          {getClientStatus(clientToView.status).label}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4 pt-4 border-t">
                  <h4 className="font-medium text-sm">Información de Contacto</h4>
                  <div className="grid gap-4">
                    <div>
                      <Label className="text-muted-foreground text-xs flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        Teléfono
                      </Label>
                      <p className="text-sm">{clientToView.phone || "-"}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-xs flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        Email
                      </Label>
                      <p className="text-sm">{clientToView.email || "-"}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-xs flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        Dirección
                      </Label>
                      <p className="text-sm">{clientToView.address || "-"}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4 pt-4 border-t">
                  <h4 className="font-medium text-sm">Información del Negocio</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground text-xs flex items-center gap-1">
                        <Building2 className="w-3 h-3" />
                        Industria
                      </Label>
                      <p className="text-sm">{clientToView.industry || "-"}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-xs">Prioridad</Label>
                      <div className="mt-1">
                        {clientToView.priority ? (
                          <Badge variant="outline">
                            {getClientPriority(clientToView.priority).label}
                          </Badge>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Proveedor Actual</Label>
                    <p className="text-sm">{clientToView.proveedorActual || "-"}</p>
                  </div>
                </div>
                <div className="space-y-4 pt-4 border-t">
                  <h4 className="font-medium text-sm flex items-center gap-1">
                    <Printer className="w-4 h-4" />
                    Impresoras
                  </h4>
                  {clientToView.printers && clientToView.printers.length > 0 ? (
                    <div className="space-y-2">
                      {clientToView.printers.map((printer, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm bg-muted/50 p-2 rounded">
                          <Printer className="w-3.5 h-3.5 text-muted-foreground" />
                          <span>{printer.printer_model}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {clientToView.maquinas || "No hay impresoras registradas"}
                    </p>
                  )}
                </div>
                {clientToView.notes && (
                  <div className="space-y-2 pt-4 border-t">
                    <Label className="text-muted-foreground text-xs">Notas</Label>
                    <p className="text-sm whitespace-pre-wrap bg-muted/30 p-3 rounded">
                      {clientToView.notes}
                    </p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t text-xs text-muted-foreground">
                  <div>
                    <Label className="text-muted-foreground text-xs">Creado</Label>
                    <p className="text-sm">
                      {new Date(clientToView.created_at).toLocaleDateString("es-AR")}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Actualizado</Label>
                    <p className="text-sm">
                      {new Date(clientToView.updated_at).toLocaleDateString("es-AR")}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar cliente?</AlertDialogTitle>
              <AlertDialogDescription>
                {clientToDelete && (
                  <>
                    Estás a punto de eliminar a <strong>{clientToDelete.name}</strong>.
                    Esta acción no se puede deshacer.
                  </>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteClient}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div >
    </Suspense >
  );
}
