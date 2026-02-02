"use client";

import { useState, useMemo } from "react";
import { clients as initialClients, callLogs, getClientStatus, getClientPriority } from "@/lib/mock-data";
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
  Search,
  Phone,
  Users,
  MapPin,
  Building2,
  Plus,
  Printer,
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
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedClient, setSelectedClient] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNewContactOpen, setIsNewContactOpen] = useState(false);
  const [logs, setLogs] = useState(callLogs);
  const [clientsList, setClientsList] = useState(initialClients);
  const searchParams = useSearchParams();

  // New contact form state
  const [newContact, setNewContact] = useState({
    name: "",
    phone: "",
    address: "",
    industry: "",
    maquinas: "",
    tipoCliente: "",
    proveedorActual: "",
  });

  const filteredClients = useMemo(() => {
    return clientsList.filter((client) => {
      const matchesSearch =
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.phone.includes(searchTerm) ||
        client.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (client.legajo && client.legajo.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus =
        statusFilter === "all" || client.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, statusFilter, clientsList]);

  const handleLogCall = (client) => {
    setSelectedClient(client);
    setIsModalOpen(true);
  };

  const handleCallSubmit = (callLog) => {
    setLogs((prev) => [{ ...callLog, id: prev.length + 1 }, ...prev]);
  };

  const handleNewContactSubmit = () => {
    const newClient = {
      id: clientsList.length + 1,
      ...newContact,
      status: "prospect",
    };
    setClientsList((prev) => [...prev, newClient]);
    setNewContact({
      name: "",
      phone: "",
      address: "",
      industry: "",
      maquinas: "",
      tipoCliente: "",
      proveedorActual: "",
    });
    setIsNewContactOpen(false);
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
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Nombre de la Empresa *</Label>
                  <Input
                    id="name"
                    value={newContact.name}
                    onChange={(e) =>
                      setNewContact((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="Ej: Papelería Central"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Teléfono *</Label>
                    <Input
                      id="phone"
                      value={newContact.phone}
                      onChange={(e) =>
                        setNewContact((prev) => ({ ...prev, phone: e.target.value }))
                      }
                      placeholder="+54 11 1234-5678"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="industry">Rubro</Label>
                    <Input
                      id="industry"
                      value={newContact.industry}
                      onChange={(e) =>
                        setNewContact((prev) => ({ ...prev, industry: e.target.value }))
                      }
                      placeholder="Ej: Tecnología"
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="address">Dirección</Label>
                  <Input
                    id="address"
                    value={newContact.address}
                    onChange={(e) =>
                      setNewContact((prev) => ({ ...prev, address: e.target.value }))
                    }
                    placeholder="Av. Corrientes 1234, CABA"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="maquinas">Máquinas (Marca/Modelo)</Label>
                  <Input
                    id="maquinas"
                    value={newContact.maquinas}
                    onChange={(e) =>
                      setNewContact((prev) => ({ ...prev, maquinas: e.target.value }))
                    }
                    placeholder="Ej: HP LaserJet Pro M15w, Brother HL-1110"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="tipoCliente">Tipo de Cliente</Label>
                    <Select
                      value={newContact.tipoCliente}
                      onValueChange={(value) =>
                        setNewContact((prev) => ({ ...prev, tipoCliente: value }))
                      }
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
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="proveedorActual">Proveedor Actual</Label>
                    <Input
                      id="proveedorActual"
                      value={newContact.proveedorActual}
                      onChange={(e) =>
                        setNewContact((prev) => ({ ...prev, proveedorActual: e.target.value }))
                      }
                      placeholder="Ej: Suministros BA"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsNewContactOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={handleNewContactSubmit}
                  disabled={!newContact.name || !newContact.phone}
                >
                  Guardar Contacto
                </Button>
              </DialogFooter>
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
        </div>

        {/* Clients Table - Desktop */}
        <Card className="hidden lg:block">
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
                    const clientPriority = getClientPriority(client.tipoCliente);
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
                          {client.tipoCliente ? (
                            <Badge className={statusColorMap[clientPriority.color]}>
                              {clientPriority.label}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {client.proveedorActual || "-"}
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
                          <Button
                            size="sm"
                            onClick={() => handleLogCall(client)}
                            className="gap-2"
                          >
                            <Phone className="w-4 h-4" />
                            Registrar Llamada
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Clients Cards - Mobile/Tablet */}
        <div className="lg:hidden space-y-4">
          {filteredClients.map((client) => {
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
          })}
        </div>

        {/* Empty State */}
        {filteredClients.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-1">
              No se encontraron contactos
            </h3>
            <p className="text-muted-foreground">
              Intenta con otros términos de búsqueda o cambia el filtro de estado
            </p>
          </div>
        )}

        {/* Log Call Modal */}
        <LogCallModal
          client={selectedClient}
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          onSubmit={handleCallSubmit}
        />
      </div>
    </Suspense>
  );
}
