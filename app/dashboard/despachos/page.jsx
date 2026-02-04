"use client";

import { useState, useMemo, useEffect } from "react";
import { formatCurrency, getOrderStatus } from "@/lib/mock-data";
import { ordersAPI } from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Truck,
  Package,
  CheckCircle2,
  User,
  Calendar,
  MapPin,
  Phone,
  FileText,
  Eye,
  Receipt,
  Percent,
  MessageSquare,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";

const statusColorMap = {
  warning: "bg-warning text-warning-foreground",
  default: "bg-secondary text-secondary-foreground",
  primary: "bg-primary text-primary-foreground",
  success: "bg-success text-success-foreground",
};

const statusOptions = [
  { value: "preparacion", label: "En Preparación" },
  { value: "enviado", label: "Enviado" },
  { value: "entregado", label: "Entregado" },
];

export default function DespachosPage() {
  const [ordersList, setOrdersList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Fetch orders from API (excluding pending)
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        const data = await ordersAPI.getAll();
        // Filter out pending orders on client side
        setOrdersList(data.filter(o => o.status !== "pendiente"));
      } catch (err) {
        console.error("Error fetching orders:", err);
        toast.error("Error al cargar órdenes", {
          description: err.message,
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const shippableOrders = useMemo(() => {
    return ordersList.filter((o) => o.status !== "pendiente");
  }, [ordersList]);

  const filteredOrders = useMemo(() => {
    return shippableOrders.filter((order) => {
      const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [shippableOrders, searchTerm, statusFilter]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await ordersAPI.update(orderId, { status: newStatus });
      setOrdersList((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
      toast.success("Estado actualizado exitosamente");
    } catch (err) {
      console.error("Error updating order status:", err);
      toast.error("Error al actualizar estado", {
        description: err.message,
      });
    }
  };

  const ordersByStatus = useMemo(() => {
    return {
      preparacion: shippableOrders.filter((o) => o.status === "preparacion"),
      enviado: shippableOrders.filter((o) => o.status === "enviado"),
      entregado: shippableOrders.filter((o) => o.status === "entregado"),
    };
  }, [shippableOrders]);

  const inPreparation = ordersByStatus.preparacion.length;
  const shipped = ordersByStatus.enviado.length;
  const delivered = ordersByStatus.entregado.length;

  const openDetail = (order) => {
    setSelectedOrder(order);
    setIsDetailOpen(true);
  };

  const getTotalItems = (items) => {
    return items.reduce((acc, item) => acc + item.quantity, 0);
  };

  const statusFilters = [
    { value: "all", label: "Todas las Órdenes" },
    { value: "preparacion", label: "En Preparación" },
    { value: "enviado", label: "Enviado" },
    { value: "entregado", label: "Entregado" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Despachos</h1>
        <p className="text-muted-foreground">
          Prepara y gestiona el envío de los pedidos
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por número de orden..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
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

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-secondary rounded-lg">
                <Package className="w-6 h-6 text-secondary-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{inPreparation}</p>
                <p className="text-sm text-muted-foreground">En Preparación</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Truck className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{shipped}</p>
                <p className="text-sm text-muted-foreground">Enviados</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-success/10 rounded-lg">
                <CheckCircle2 className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{delivered}</p>
                <p className="text-sm text-muted-foreground">Entregados</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* List View */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Truck className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-1">
                No se encontraron pedidos
              </h3>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== "all"
                  ? "Intenta con otros términos de búsqueda o cambia el filtro"
                  : "Los pedidos pendientes aparecerán aquí cuando estén listos"}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredOrders.map((order) => {
            const orderStatus = getOrderStatus(order.status);
            const totalItems = getTotalItems(order.items);
            return (
              <Card key={order.id} className="overflow-hidden">
                <CardContent className="p-0">
                  {/* Header row */}
                  <div className="p-4 border-b border-border bg-muted/30">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-bold text-lg">{order.id}</h3>
                          <Badge className={statusColorMap[orderStatus.color]}>
                            {orderStatus.label}
                          </Badge>
                          {order.facturaA && (
                            <Badge variant="outline" className="border-primary text-primary">
                              <FileText className="w-3 h-3 mr-1" />
                              Factura A
                            </Badge>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1.5">
                            <User className="w-4 h-4" />
                            {order.clientName}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4" />
                            {new Date(order.date).toLocaleDateString("es-AR")}
                          </span>
                          <span className="flex items-center gap-1.5 font-medium text-foreground">
                            <Package className="w-4 h-4" />
                            {totalItems} unidades ({order.items.length} productos)
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2 bg-transparent"
                          onClick={() => openDetail(order)}
                        >
                          <Eye className="w-4 h-4" />
                          Ver Detalle
                        </Button>
                        <Select
                          value={order.status}
                          onValueChange={(value) =>
                            handleStatusChange(order.id, value)
                          }
                        >
                          <SelectTrigger className="w-44">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {statusOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Info row */}
                  <div className="p-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Dirección de Envío</p>
                      <p className="text-sm font-medium flex items-start gap-1.5">
                        <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-muted-foreground" />
                        {order.clientAddress}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Teléfono</p>
                      <p className="text-sm font-medium flex items-center gap-1.5">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        {order.clientPhone}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Vendedor</p>
                      <p className="text-sm font-medium">{order.sellerName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Total</p>
                      <p className="text-lg font-bold text-primary">{formatCurrency(order.total)}</p>
                    </div>
                  </div>

                  {/* Products table */}
                  <div className="px-4 pb-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>SKU</TableHead>
                          <TableHead>Producto</TableHead>
                          <TableHead className="text-center">Cantidad</TableHead>
                          <TableHead className="text-right">Precio Unit.</TableHead>
                          <TableHead className="text-right">Subtotal</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {order.items.map((item, idx) => (
                          <TableRow key={idx}>
                            <TableCell className="font-mono text-xs">{item.sku}</TableCell>
                            <TableCell className="font-medium">{item.productName}</TableCell>
                            <TableCell className="text-center">
                              <Badge variant="secondary" className="font-bold">
                                x{item.quantity}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">{formatCurrency(item.price)}</TableCell>
                            <TableCell className="text-right font-medium">
                              {formatCurrency(item.price * item.quantity)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Notes if any */}
                  {order.notes && (
                    <div className="px-4 pb-4">
                      <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg">
                        <p className="text-sm flex items-start gap-2">
                          <MessageSquare className="w-4 h-4 mt-0.5 text-warning shrink-0" />
                          <span><strong>Nota:</strong> {order.notes}</span>
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Order Detail Modal */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <span>Detalle del Pedido {selectedOrder?.id}</span>
              {selectedOrder && (
                <Badge className={statusColorMap[getOrderStatus(selectedOrder.status).color]}>
                  {getOrderStatus(selectedOrder.status).label}
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6 mt-4">
              {/* Client Info */}
              <div className="grid gap-4 sm:grid-cols-2">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Información del Cliente
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="font-semibold text-lg">{selectedOrder.clientName}</p>
                    <p className="text-sm flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      {selectedOrder.clientPhone}
                    </p>
                    <p className="text-sm flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                      {selectedOrder.clientAddress}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Información del Pedido
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      {new Date(selectedOrder.date).toLocaleDateString("es-AR", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                    <p className="text-sm flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      Vendedor: {selectedOrder.sellerName}
                    </p>
                    <div className="flex items-center gap-2">
                      {selectedOrder.facturaA ? (
                        <Badge className="bg-primary text-primary-foreground">
                          <FileText className="w-3 h-3 mr-1" />
                          Requiere Factura A
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          Sin Factura A
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Products */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    Productos a Preparar ({getTotalItems(selectedOrder.items)} unidades)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>SKU</TableHead>
                        <TableHead>Producto</TableHead>
                        <TableHead className="text-center">Cant.</TableHead>
                        <TableHead className="text-right">Subtotal</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedOrder.items.map((item, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-mono text-xs">{item.sku}</TableCell>
                          <TableCell className="font-medium">{item.productName}</TableCell>
                          <TableCell className="text-center">
                            <Badge variant="secondary" className="font-bold text-base">
                              {item.quantity}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(item.price * item.quantity)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Pricing Summary */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Receipt className="w-4 h-4" />
                    Resumen de Precios
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal:</span>
                      <span>{formatCurrency(selectedOrder.subtotal)}</span>
                    </div>
                    {selectedOrder.discountPercent > 0 && (
                      <div className="flex justify-between text-sm text-success">
                        <span className="flex items-center gap-1">
                          <Percent className="w-3 h-3" />
                          Descuento ({selectedOrder.discountPercent}%):
                        </span>
                        <span>-{formatCurrency(selectedOrder.discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Envío:</span>
                      {selectedOrder.shippingDiscount ? (
                        <span className="text-success">Bonificado</span>
                      ) : (
                        <span>{formatCurrency(selectedOrder.shipping)}</span>
                      )}
                    </div>
                    <div className="border-t border-border pt-2 mt-2">
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total:</span>
                        <span className="text-primary">{formatCurrency(selectedOrder.total)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Notes */}
              {selectedOrder.notes && (
                <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
                  <p className="text-sm flex items-start gap-2">
                    <MessageSquare className="w-4 h-4 mt-0.5 text-warning shrink-0" />
                    <span><strong>Notas del pedido:</strong> {selectedOrder.notes}</span>
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
