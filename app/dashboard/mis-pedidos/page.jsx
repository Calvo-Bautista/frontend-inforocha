"use client";

import { useState, useMemo, useEffect } from "react";
import { formatCurrency, getOrderStatus } from "@/lib/mock-data";
import { ordersAPI } from "@/lib/api";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { toast } from "sonner";
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
  Search,
  ClipboardList,
  Calendar,
  User,
  Package,
  TrendingUp,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import Loading from "./loading";

const statusColorMap = {
  warning: "bg-warning text-warning-foreground",
  default: "bg-secondary text-secondary-foreground",
  primary: "bg-primary text-primary-foreground",
  success: "bg-success text-success-foreground",
};

export default function MisPedidosPage() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const searchParams = useSearchParams();

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
  }, [statusFilter, searchTerm]);

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
  }, [statusFilter, searchTerm, page, limit]);

  // Fetch stats separately
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await ordersAPI.getStats();
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
  }, []);

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
  ];

  // Stats
  const totalOrders = stats.totalOrders;
  const filteredRevenue = stats.totalRevenue;
  const pendingOrders = stats.pending;

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
      <div className="grid gap-4 sm:grid-cols-3">
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por ID o nombre de cliente..."
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
                  <p className="text-xl font-bold text-foreground">
                    {formatCurrency(order.total)}
                  </p>
                </div>
                <CardDescription className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-1">
                  <span className="flex items-center gap-1.5">
                    <User className="w-4 h-4" />
                    {order.client?.name || `Cliente #${order.client_id}`}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    {new Date(order.order_date).toLocaleDateString("es-AR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
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
                                {item.product?.name || `Producto #${item.product_id}`}
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
                {(order.notes || order.factura_a || order.repair_description) && (
                  <div className="mt-3 pt-3 border-t border-border space-y-2">
                    {order.factura_a && (
                      <div className="flex items-center gap-2 text-sm">
                        <FileText className="w-4 h-4 text-primary" />
                        <span className="font-medium">Requiere Factura A</span>
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

      {/* Empty State */}
      {filteredOrders.length === 0 && (
        <div className="text-center py-12">
          <ClipboardList className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-1">
            No se encontraron pedidos
          </h3>
          <p className="text-muted-foreground">
            Intenta con otros términos de búsqueda o cambia el filtro de estado
          </p>
        </div>
      )}
    </div>
  );
}
