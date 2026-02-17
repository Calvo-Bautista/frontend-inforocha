"use client";

import { useState, useMemo, useEffect } from "react";
import { formatCurrency, getOrderStatus } from "@/lib/mock-data";
import { ordersAPI } from "@/lib/api";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
  Search,
  ClipboardList,
  Calendar,
  User,
  Package,
  TrendingUp,
  FileText,
  FileDown,
  Eye,
  MapPin,
  Phone,
  Receipt,
  Percent,
  MessageSquare
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import Loading from "./loading";

const statusColorMap = {
  warning: "bg-warning text-warning-foreground",
  default: "bg-secondary text-secondary-foreground",
  primary: "bg-primary text-primary-foreground",
  success: "bg-success text-success-foreground",
  destructive: "bg-destructive text-destructive-foreground",
};

const months = [
  { value: 1, label: "Enero" },
  { value: 2, label: "Febrero" },
  { value: 3, label: "Marzo" },
  { value: 4, label: "Abril" },
  { value: 5, label: "Mayo" },
  { value: 6, label: "Junio" },
  { value: 7, label: "Julio" },
  { value: 8, label: "Agosto" },
  { value: 9, label: "Septiembre" },
  { value: 10, label: "Octubre" },
  { value: 11, label: "Noviembre" },
  { value: 12, label: "Diciembre" },
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

const formatDateUTC = (dateString) => {
  if (!dateString) return "";
  const date = new Date(`${dateString}T12:00:00`);
  return date.toLocaleDateString("es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

export default function MisPedidosPage() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [monthFilter, setMonthFilter] = useState((new Date().getMonth() + 1).toString());
  const [yearFilter, setYearFilter] = useState(currentYear.toString());

  const searchParams = useSearchParams();

  // Detail Modal State
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Pagination State
  const [page, setPage] = useState(1);

  const [limit] = useState(8);
  const [totalItems, setTotalItems] = useState(0);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    pending: 0
  });

  // Reset page to 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [statusFilter, searchTerm, monthFilter, yearFilter]);

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
        if (monthFilter !== "all") {
          params.month = parseInt(monthFilter);
        }
        if (yearFilter !== "all") {
          params.year = parseInt(yearFilter);
        }

        const data = await ordersAPI.getAll(params);
        setOrders(data);
        if (data.total !== undefined) {
          setTotalItems(data.total);
        }
      } catch (err) {
        console.error("Error fetching orders:", err);
        toast.error("Error al cargar pedidos", {
          description: err.message,
        });
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchOrders();
    }, 300);

    return () => clearTimeout(timer);
  }, [statusFilter, searchTerm, page, limit, monthFilter, yearFilter]);

  // Fetch stats separately
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const params = {};
        if (monthFilter !== "all") {
          params.month = parseInt(monthFilter);
        }
        if (yearFilter !== "all") {
          params.year = parseInt(yearFilter);
        }

        const data = await ordersAPI.getStats(params);
        setStats({
          totalOrders: data.total_orders,
          totalRevenue: data.total_revenue,
          pending: data.by_status.pendiente || 0
        });
      } catch (err) {
        console.error("Error fetching stats:", err);
      }
    };
    fetchStats();
  }, [monthFilter, yearFilter]);

  // Debug: log first order to see structure
  useEffect(() => {
    if (orders.length > 0) {
      console.log('First order data:', orders[0]);
    }
  }, [orders]);

  const filteredOrders = useMemo(() => {
    return orders;
  }, [orders]);

  const statusFilters = [
    { value: "all", label: "Todos" },
    { value: "pendiente", label: "Pendiente" },
    { value: "preparacion", label: "En Preparación" },
    { value: "enviado", label: "Enviado" },
    { value: "entregado", label: "Entregado" },
    { value: "cancelado", label: "Cancelado" },
  ];

  // Stats
  const totalOrders = stats.totalOrders;
  const filteredRevenue = stats.totalRevenue;
  const pendingOrders = stats.pending;

  const handleDownloadRemito = async (orderId, orderNumber) => {
    try {
      const blob = await ordersAPI.downloadRemito(orderId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Remito-${orderNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Remito descargado");
    } catch (err) {
      console.error("Error downloading remito:", err);
      toast.error("Error al descargar remito", {
        description: err.message,
      });
    }
  };

  const openDetail = (order) => {
    setSelectedOrder(order);
    setIsDetailOpen(true);
  };

  const getTotalItems = (items) => {
    if (!items) return 0;
    return items.reduce((acc, item) => acc + item.quantity, 0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Mis Pedidos</h1>
        <p className="text-muted-foreground">
          Visualiza el estado de tus órdenes de venta
        </p>
      </div>

      {/* Stats Cards */}
      <div className="hidden md:grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <ClipboardList className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalOrders}</p>
                <p className="text-sm text-muted-foreground">Total Pedidos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-success/10 rounded-lg">
                <TrendingUp className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatCurrency(filteredRevenue)}</p>
                <p className="text-sm text-muted-foreground">Total Vendido</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-warning/10 rounded-lg">
                <Package className="w-6 h-6 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingOrders}</p>
                <p className="text-sm text-muted-foreground">Pendientes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por ID o nombre de cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            <Select
              value={monthFilter}
              onValueChange={setMonthFilter}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Mes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los Meses</SelectItem>
                {months.map((m) => (
                  <SelectItem key={m.value} value={m.value.toString()}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={yearFilter}
              onValueChange={setYearFilter}
            >
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Año" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {years.map((y) => (
                  <SelectItem key={y} value={y.toString()}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.map((order) => {
          const orderStatus = getOrderStatus(order.status);
          return (
            <Card key={order.id}>
              <CardHeader className="pb-2">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-lg">{order.order_number || `#${order.id}`}</CardTitle>
                    <Badge className={statusColorMap[orderStatus.color]}>
                      {orderStatus.label}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        openDetail(order);
                      }}
                    >
                      <Eye className="w-4 h-4" />
                      <span className="hidden sm:inline">Ver Detalle</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownloadRemito(order.id, order.order_number);
                      }}
                    >
                      <FileDown className="w-4 h-4" />
                      <span className="hidden sm:inline">Remito</span>
                    </Button>
                    <p className="text-xl font-bold text-foreground ml-auto">
                      {formatCurrency(order.total)}
                    </p>
                  </div>
                </div>
                <CardDescription className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-1">
                  <span className="flex items-center gap-1.5">
                    <User className="w-4 h-4" />
                    {order.client?.name || `Cliente #${order.client_id}`}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    {formatDateUTC(order.order_date)}
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="items" className="border-0">
                    <AccordionTrigger className="py-2 text-sm hover:no-underline">
                      <span className="flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        Ver detalle ({order.items.length} productos)
                      </span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2 pt-2">
                        {order.items.map((item, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg"
                          >
                            <div>
                              <p className="font-medium text-sm">
                                {item.product?.description || `Producto #${item.product_id}`}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatCurrency(item.price_at_time)} x {item.quantity}
                              </p>
                            </div>
                            <p className="font-medium">
                              {formatCurrency(item.price_at_time * item.quantity)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                {/* Notes, Factura A, and Repair */}
                {(order.notes || order.invoice_type || order.repair_description) && (
                  <div className="mt-3 pt-3 border-t border-border space-y-2">
                    {order.invoice_type && (
                      <div className="flex items-center gap-2 text-sm">
                        <FileText className="w-4 h-4 text-primary" />
                        <span className="font-medium">Requiere Factura {order.invoice_type}</span>
                      </div>
                    )}
                    {order.repair_description && (
                      <div className="text-sm">
                        <p className="font-medium text-muted-foreground mb-1">Reparación:</p>
                        <p className="text-foreground">{order.repair_description}</p>
                        <p className="text-primary font-medium mt-1">
                          Cargo: {formatCurrency(order.repair_amount || 0)}
                        </p>
                      </div>
                    )}
                    {order.payment_method && (
                      <div className="text-sm">
                        <p className="font-medium text-muted-foreground mb-1">Método de Pago:</p>
                        <p className="text-foreground capitalize">{order.payment_method}</p>
                      </div>
                    )}
                    {order.notes && (
                      <div className="text-sm">
                        <p className="font-medium text-muted-foreground mb-1">Notas:</p>
                        <p className="text-foreground">{order.notes}</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
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
        <DialogContent className="max-w-2xl w-[calc(100vw-2rem)] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="flex flex-wrap items-center gap-2 pr-6">
              <span className="text-base sm:text-lg">Detalle del Pedido {selectedOrder?.order_number || selectedOrder?.id}</span>
              {selectedOrder && (
                <Badge className={statusColorMap[getOrderStatus(selectedOrder.status).color]}>
                  {getOrderStatus(selectedOrder.status).label}
                </Badge>
              )}
            </DialogTitle>
            {selectedOrder && (
              <Button
                variant="outline"
                size="sm"
                className="gap-2 w-fit mt-2"
                onClick={() => handleDownloadRemito(selectedOrder.id, selectedOrder.order_number)}
              >
                <FileDown className="w-4 h-4" />
                Descargar Remito
              </Button>
            )}
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
                    <p className="text-sm flex items-center gap-2">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      {selectedOrder.client?.cuit ? `CUIT: ${selectedOrder.client.cuit}` : "Sin CUIT"}
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
                      {selectedOrder.order_date ? formatDateUTC(selectedOrder.order_date) : "Fecha inválida"}
                    </p>
                    <p className="text-sm flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      Vendedor: {selectedOrder.seller?.name || "Desconocido"}
                    </p>
                    <div className="flex items-center gap-2">
                      {selectedOrder.invoice_type ? (
                        <Badge className="bg-primary text-primary-foreground">
                          <FileText className="w-3 h-3 mr-1" />
                          Factura {selectedOrder.invoice_type}
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          Sin Factura
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
                    Productos ({getTotalItems(selectedOrder.items)} unidades)
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 sm:p-6">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="hidden sm:table-cell">Articulo</TableHead>
                          <TableHead>Descripción</TableHead>
                          <TableHead className="text-center">Cant.</TableHead>
                          <TableHead className="text-right">Subtotal</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedOrder.items.map((item, idx) => (
                          <TableRow key={idx}>
                            <TableCell className="font-mono text-xs hidden sm:table-cell">{item.product?.articulo || "N/A"}</TableCell>
                            <TableCell className="font-medium text-sm">{item.product?.description || "Eliminado"}</TableCell>
                            <TableCell className="text-center">
                              <Badge variant="secondary" className="font-bold text-base">
                                {item.quantity}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right whitespace-nowrap">
                              {formatCurrency(item.price_at_time * item.quantity)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
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

      {/* Empty State */}
      {
        filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <ClipboardList className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-1">
              No se encontraron pedidos
            </h3>
            <p className="text-muted-foreground">
              Intenta con otros términos de búsqueda o cambia el filtro de estado
            </p>
          </div>
        )
      }
    </div >
  );
}
