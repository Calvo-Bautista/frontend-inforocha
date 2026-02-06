"use client";

import { useState, useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClientSchema, editClientSchema } from "@/lib/schemas/clients";
import { getClientStatus, getClientPriority } from "@/lib/mock-data";
import { clientsAPI, callLogsAPI } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "sonner";
import { LogCallModal } from "@/components/log-call-modal";
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
  const [selectedClient, setSelectedClient] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNewContactOpen, setIsNewContactOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [clientToEdit, setClientToEdit] = useState(null);
  const [logs, setLogs] = useState([]);
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

  // Fetch clients from API
  useEffect(() => {
    const fetchClients = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const params = {};
        if (statusFilter !== "all") {
          params.status = statusFilter;
        }
        if (searchTerm) {
          params.search = searchTerm;
        }

        const data = await clientsAPI.getAll(params);
        setClients(data);
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
  }, [statusFilter, searchTerm]);

  const filteredClients = clients;

  const handleLogCall = (client) => {
    setSelectedClient(client);
    setIsModalOpen(true);
  };

  const handleCallSubmit = async (callLog) => {
    try {
      const createdLog = await callLogsAPI.create(callLog);
      setLogs((prev) => [createdLog, ...prev]);
      toast.success("Llamada registrada exitosamente");
    } catch (err) {
      console.error("Error creating call log:", err);
      toast.error("Error al registrar llamada", {
        description: err.message,
      });
    }
  };

  const handleNewContactSubmit = async (data) => {
    try {
      const clientData = {
        ...data,
        tipo_cliente: data.tipoCliente,
        proveedor_actual: data.proveedorActual,
      };

      const createdClient = await clientsAPI.create(clientData);
      setClients((prev) => [...prev, createdClient]);
      resetNew();
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
      tipoCliente: client.tipo_cliente || "",
      proveedorActual: client.proveedor_actual || "",
      status: client.status || "prospect",
    });
    setIsEditOpen(true);
  };

  const handleEditContactSubmit = async (data) => {
    if (!clientToEdit) return;

    try {
      const clientData = {
        ...data,
        tipo_cliente: data.tipoCliente,
        proveedor_actual: data.proveedorActual,
      };

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

  const getClientLogs = (clientId) => {
    return logs.filter((log) => log.clientId === clientId);
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
                    <Label htmlFor="maquinas">Máquinas (Marca/Modelo)</Label>
                    <Input
                      id="maquinas"
                      {...registerNew("maquinas")}
                      placeholder="Ej: HP LaserJet Pro M15w, Brother HL-1110"
                    />
                    {errorsNew.maquinas && (
                      <p className="text-sm text-destructive">
                        {errorsNew.maquinas.message}
                      </p>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="tipoCliente">Tipo de Cliente</Label>
                      <Select
                        onValueChange={(value) => {
                          const event = { target: { name: "tipoCliente", value } };
                          registerNew("tipoCliente").onChange(event);
                        }}
                        defaultValue=""
                      >
                        <SelectTrigger id="tipoCliente">
                          <SelectValue placeholder="Seleccionar..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="alta">Alta Prioridad (1/mes)</SelectItem>
                          <SelectItem value="media">Media Prioridad (1 cada 2-3 meses)</SelectItem>
                          <SelectItem value="baja">Baja Prioridad (1 cada 6+ meses)</SelectItem>
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
                    <Label htmlFor="edit-maquinas">Máquinas (Marca/Modelo)</Label>
                    <Input
                      id="edit-maquinas"
                      {...registerEdit("maquinas")}
                    />
                    {errorsEdit.maquinas && (
                      <p className="text-sm text-destructive">
                        {errorsEdit.maquinas.message}
                      </p>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="edit-tipoCliente">Tipo de Cliente</Label>
                      <Select
                        onValueChange={(value) => {
                          const event = { target: { name: "tipoCliente", value } };
                          registerEdit("tipoCliente").onChange(event);
                        }}
                        defaultValue=""
                      >
                        <SelectTrigger id="edit-tipoCliente">
                          <SelectValue placeholder="Seleccionar..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="alta">Alta Prioridad (1/mes)</SelectItem>
                          <SelectItem value="media">Media Prioridad (1 cada 2-3 meses)</SelectItem>
                          <SelectItem value="baja">Baja Prioridad (1 cada 6+ meses)</SelectItem>
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
                    const clientPriority = getClientPriority(client.tipo_cliente);
                    const clientLogs = getClientLogs(client.id);
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
                              {client.maquinas || "-"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {client.tipo_cliente ? (
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
                          {clientLogs.length > 0 && (
                            <span className="ml-2 text-xs text-muted-foreground">
                              ({clientLogs.length} llamadas)
                            </span>
                          )}
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
                              {(user?.role === "vendedor" || user?.role === "owner") && (
                                <DropdownMenuItem onClick={() => openEditDialog(client)}>
                                  <Pencil className="w-4 h-4 mr-2" />
                                  Editar
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem onClick={() => handleLogCall(client)}>
                                <Phone className="w-4 h-4 mr-2" />
                                Registrar Llamada
                              </DropdownMenuItem>
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
              const clientPriority = getClientPriority(client.tipoCliente);
              const clientLogs = getClientLogs(client.id);
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
                        <span className="truncate">{client.maquinas || "-"}</span>
                      </div>
                      {client.proveedorActual && (
                        <div className="text-muted-foreground">
                          <span className="font-medium">Proveedor:</span> {client.proveedorActual}
                        </div>
                      )}
                    </div>
                    {clientLogs.length > 0 && (
                      <p className="text-xs text-muted-foreground mb-4">
                        {clientLogs.length} llamadas registradas
                      </p>
                    )}
                    <Button
                      className="w-full gap-2"
                      onClick={() => handleLogCall(client)}
                    >
                      <Phone className="w-4 h-4" />
                      Registrar Llamada
                    </Button>
                  </CardContent>
                </Card>
              );
            })
          }
        </div >

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

        {/* Log Call Modal */}
        <LogCallModal
          client={selectedClient}
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          onSubmit={handleCallSubmit}
        />
      </div >
    </Suspense >
  );
}
