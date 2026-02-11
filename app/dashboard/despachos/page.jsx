"use client";

import { useState, useMemo, useEffect } from "react";
import { formatCurrency, getOrderStatus } from "@/lib/mock-data";
import { ordersAPI } from "@/lib/api";
import { PaginationControls } from "@/components/ui/pagination-controls";
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
  { value: "pendiente", label: "Pendiente" },
  { value: "preparacion", label: "En Preparación" },
  { value: "enviado", label: "Enviado" },
  { value: "entregado", label: "Entregado" },
];

export default function DespachosPage() {
  const [ordersList, setOrdersList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Pagination State
  const [page, setPage] = useState(1);
  const [limit] = useState(8);
  const [totalItems, setTotalItems] = useState(0);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [stats, setStats] = useState({
    pending: 0,
    inPreparation: 0,
    shipped: 0,
    delivered: 0
  });

  // Fetch orders from API
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
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

        const data = await ordersAPI.getAll(params);
        setOrdersList(data);
        if (data.total !== undefined) {
          setTotalItems(data.total);
        }
      } catch (err) {
        console.error("Error fetching orders:", err);
        toast.error("Error al cargar órdenes", {
          description: err.message,
        });
      } finally {
        setIsLoading(false);
      }
    };

    // Simple debounce via timeout
    const timer = setTimeout(() => {
      fetchOrders();
    }, 300);

    return () => clearTimeout(timer);
  }, [statusFilter, searchTerm, page, limit]);

  // Fetch stats separately (only once on mount or when needed)
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await ordersAPI.getStats();
        setStats({
          pending: data.by_status.pendiente || 0,
          inPreparation: data.by_status.preparacion || 0,
          shipped: data.by_status.enviado || 0,
          delivered: data.by_status.entregado || 0
        });
      } catch (err) {
        console.error("Error fetching stats:", err);
      }
    };
    fetchStats();
  }, []);

  const shippableOrders = useMemo(() => {
    return ordersList;
  }, [ordersList]);

  const filteredOrders = useMemo(() => {
    return shippableOrders;
  }, [shippableOrders]);

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
      pendiente: shippableOrders.filter((o) => o.status === "pendiente"),
      preparacion: shippableOrders.filter((o) => o.status === "preparacion"),
      enviado: shippableOrders.filter((o) => o.status === "enviado"),
      entregado: shippableOrders.filter((o) => o.status === "entregado"),
    };
  }, [shippableOrders]);

  const pending = stats.pending;
  const inPreparation = stats.inPreparation;
  const shipped = stats.shipped;
  const delivered = stats.delivered;

  const openDetail = (order) => {
    setSelectedOrder(order);
    setIsDetailOpen(true);
  };

  const getTotalItems = (items) => {
    if (!items) return 0;
    return items.reduce((acc, item) => acc + item.quantity, 0);
  };

  const statusFilters = [
    { value: "all", label: "Todas las Órdenes" },
    { value: "pendiente", label: "Pendientes" },
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
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-secondary rounded-lg">
                <Receipt className="w-6 h-6 text-secondary-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pending}</p>
                <p className="text-sm text-muted-foreground">Pendientes</p>
              </div>
            </div>
          </CardContent>
        </Card>
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
                          <h3 className="font-bold text-lg">{order.order_number || order.id}</h3>
                          <Badge className={statusColorMap[orderStatus.color]}>
                            {orderStatus.label}
                          </Badge>
                          {order.factura_a && (
                            <Badge variant="outline" className="border-primary text-primary">
                              <FileText className="w-3 h-3 mr-1" />
                              Factura A
                            </Badge>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1.5">
                            <User className="w-4 h-4" />
                            {order.client?.name || "Sin cliente"}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4" />
                            {order.created_at ? new Date(order.created_at).toLocaleDateString("es-AR") : "N/A"}
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
                        {order.client?.address || "Sin dirección"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Teléfono</p>
                      <p className="text-sm font-medium flex items-center gap-1.5">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        {order.client?.phone || "Sin teléfono"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Vendedor</p>
                      <p className="text-sm font-medium">{order.seller?.name || "Desconocido"}</p>
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
                            <TableCell className="font-mono text-xs">{item.product?.sku || "N/A"}</TableCell>
                            <TableCell className="font-medium">{item.product?.name || "Producto Eliminado"}</TableCell>
                            <TableCell className="text-center">
                              <Badge variant="secondary" className="font-bold">
                                x{item.quantity}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">{formatCurrency(item.price_at_time)}</TableCell>
                            <TableCell className="text-right font-medium">
                              {formatCurrency(item.price_at_time * item.quantity)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Notes and Repair if any */}
                  {(order.notes || order.repair_description) && (
                    <div className="px-4 pb-4 space-y-3">
                      {order.repair_description && (
                        <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
                          <p className="text-sm flex items-start gap-2">
                            <Package className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                            <span><strong>Reparación:</strong> {order.repair_description}</span>
                          </p>
                          <p className="text-sm font-medium text-primary mt-2 ml-6">
                            Cargo: {formatCurrency(order.repair_amount || 0)}
                          </p>
                        </div>
                      )}
                      {order.payment_method && (
                        <div className="p-3 bg-secondary/30 border border-border rounded-lg">
                          <p className="text-sm flex items-start gap-2">
                            <span><strong>Método de Pago:</strong> <span className="capitalize">{order.payment_method}</span></span>
                          </p>
                        </div>
                      )}
                      {order.notes && (
                        <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg">
                          <p className="text-sm flex items-start gap-2">
                            <MessageSquare className="w-4 h-4 mt-0.5 text-warning shrink-0" />
                            <span><strong>Nota:</strong> {order.notes}</span>
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Pagination Controls */}
      <PaginationControls
        currentPage={page}
        totalPages={Math.ceil(totalItems / limit)}
        onPageChange={setPage}
        totalItems={totalItems}
        itemsPerPage={limit}
      />

      {/* Order Detail Modal */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <span>Detalle del Pedido {selectedOrder?.order_number || selectedOrder?.id}</span>
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
                    <p className="font-semibold text-lg">{selectedOrder.client?.name || "Sin Nombre"}</p>
                    <p className="text-sm flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      {selectedOrder.client?.phone || "Sin Teléfono"}
                    </p>
                    <p className="text-sm flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                      {selectedOrder.client?.address || "Sin Dirección"}
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
                      {selectedOrder.created_at ? new Date(selectedOrder.created_at).toLocaleDateString("es-AR", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }) : "Fecha inválida"}
                    </p>
                    <p className="text-sm flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      Vendedor: {selectedOrder.seller?.name || "Desconocido"}
                    </p>
                    <div className="flex items-center gap-2">
                      {selectedOrder.factura_a ? (
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
                          <TableCell className="font-mono text-xs">{item.product?.sku || "N/A"}</TableCell>
                          <TableCell className="font-medium">{item.product?.name || "Eliminado"}</TableCell>
                          <TableCell className="text-center">
                            <Badge variant="secondary" className="font-bold text-base">
                              {item.quantity}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(item.price_at_time * item.quantity)}
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
                    {selectedOrder.discount_percent > 0 && (
                      <div className="flex justify-between text-sm text-success">
                        <span className="flex items-center gap-1">
                          <Percent className="w-3 h-3" />
                          Descuento ({selectedOrder.discount_percent}%):
                        </span>
                        <span>-{formatCurrency(selectedOrder.discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Envío:</span>
                      {selectedOrder.shipping_discount ? (
                        <span className="text-success">Bonificado</span>
                      ) : (
                        <span>{formatCurrency(selectedOrder.shipping)}</span>
                      )}
                    </div>
                    {selectedOrder.repair_amount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Reparación:</span>
                        <span>{formatCurrency(selectedOrder.repair_amount)}</span>
                      </div>
                    )}
                    <div className="border-t border-border pt-2 mt-2">
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total:</span>
                        <span className="text-primary">{formatCurrency(selectedOrder.total)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Notes, Repair, and Payment Method */}
              {(selectedOrder.notes || selectedOrder.repair_description || selectedOrder.payment_method) && (
                <div className="space-y-3">
                  {selectedOrder.repair_description && (
                    <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                      <p className="text-sm flex items-start gap-2">
                        <Package className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                        <span><strong>Reparación:</strong> {selectedOrder.repair_description}</span>
                      </p>
                    </div>
                  )}
                  {selectedOrder.payment_method && (
                    <div className="p-4 bg-secondary/30 border border-border rounded-lg">
                      <p className="text-sm">
                        <strong>Método de Pago:</strong> <span className="capitalize">{selectedOrder.payment_method}</span>
                      </p>
                    </div>
                  )}
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
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
