"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { clientsAPI, productsAPI, ordersAPI, configAPI } from "@/lib/api";
import { formatCurrency } from "@/lib/mock-data";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
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
  ShoppingCart,
  Plus,
  Trash2,
  Package,
  User,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Percent,
  Truck,
  FileText,
  Search,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const DEFAULT_SHIPPING_COST = 8000;

export default function NuevaOrdenPage() {
  const router = useRouter();
  const [selectedClientId, setSelectedClientId] = useState("");
  const [orderNotes, setOrderNotes] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [cartItems, setCartItems] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // New states for invoice and discounts
  const [wantsFacturaA, setWantsFacturaA] = useState(false);
  const [applyDiscount, setApplyDiscount] = useState(false);
  const [waiveShipping, setWaiveShipping] = useState(false);

  // Search states
  const [clientSearchTerm, setClientSearchTerm] = useState("");
  const [productSearchTerm, setProductSearchTerm] = useState("");
  const [isClientDropdownOpen, setIsClientDropdownOpen] = useState(false);
  const [isProductDropdownOpen, setIsProductDropdownOpen] = useState(false);

  // Data from API
  // Data from API
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [systemConfig, setSystemConfig] = useState(null);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Refs for click outside
  const clientDropdownRef = useRef(null);
  const productDropdownRef = useRef(null);

  // Fetch clients and products on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoadingData(true);

        const [clientsData, productsData, configData] = await Promise.all([
          clientsAPI.getAll({ status: 'active' }),
          productsAPI.getAll(),
          configAPI.get(),
        ]);
        setClients(clientsData);
        setProducts(productsData);
        setSystemConfig(configData);
      } catch (err) {
        console.error("Error fetching data:", err);
        toast.error("Error al cargar datos", {
          description: err.message,
        });
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchData();
  }, []);

  const selectedClient = clients.find((c) => c.id.toString() === selectedClientId);
  const selectedProduct = products.find((p) => p.id.toString() === selectedProductId);

  // Filtered clients for search
  const filteredClients = useMemo(() => {
    const activeClients = clients.filter((c) => c.status === "active");
    if (!clientSearchTerm.trim()) {
      return activeClients.slice(0, 50); // Limit to 50 when no search
    }
    const searchLower = clientSearchTerm.toLowerCase();
    return activeClients
      .filter((c) =>
        c.name.toLowerCase().includes(searchLower) ||
        (c.legajo && c.legajo.toLowerCase().includes(searchLower))
      )
      .slice(0, 50); // Limit to 50 results
  }, [clientSearchTerm]);

  // Filtered products for search
  const filteredProducts = useMemo(() => {
    const availableProducts = products.filter((p) => p.stock > 0);
    if (!productSearchTerm.trim()) {
      return availableProducts.slice(0, 50); // Limit to 50 when no search
    }
    const searchLower = productSearchTerm.toLowerCase();
    return availableProducts
      .filter((p) => p.name.toLowerCase().includes(searchLower))
      .slice(0, 50); // Limit to 50 results
  }, [productSearchTerm]);

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (clientDropdownRef.current && !clientDropdownRef.current.contains(event.target)) {
        setIsClientDropdownOpen(false);
      }
      if (productDropdownRef.current && !productDropdownRef.current.contains(event.target)) {
        setIsProductDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAddToCart = () => {
    if (!selectedProduct || quantity < 1) return;

    const existingItemIndex = cartItems.findIndex(
      (item) => item.productId === selectedProduct.id
    );

    // Calculate total quantity if product already in cart
    const currentCartQuantity = existingItemIndex > -1 ? cartItems[existingItemIndex].quantity : 0;
    const totalRequested = currentCartQuantity + quantity;

    if (totalRequested > selectedProduct.stock) {
      toast.error(`No hay suficiente stock. Disponible: ${selectedProduct.stock}, En carrito: ${currentCartQuantity}`);
      return;
    }

    if (existingItemIndex > -1) {
      setCartItems((prev) =>
        prev.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      );
    } else {
      setCartItems((prev) => [
        ...prev,
        {
          productId: selectedProduct.id,
          productName: selectedProduct.name,
          price: selectedProduct.price,
          quantity,
          stock: selectedProduct.stock,
        },
      ]);
    }

    setSelectedProductId("");
    setQuantity(1);
  };

  const handleRemoveFromCart = (productId) => {
    setCartItems((prev) => prev.filter((item) => item.productId !== productId));
  };

  const handleUpdateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    setCartItems((prev) =>
      prev.map((item) =>
        item.productId === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  // Calculate totals with discounts
  const cartSubtotal = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cartItems]);

  // Determine available discount percentage based on subtotal

  const availableDiscountPercent = useMemo(() => {
    if (!systemConfig) return 0;

    // Cast strict numeric values to avoid string comparison issues
    const subtotal = Number(cartSubtotal);
    const threshold1 = Number(systemConfig.discount_threshold_1);
    const threshold2 = Number(systemConfig.discount_threshold_2);
    const threshold3 = Number(systemConfig.discount_threshold_3);

    if (subtotal >= threshold3) return Number(systemConfig.discount_percentage_3);
    if (subtotal >= threshold2) return Number(systemConfig.discount_percentage_2);
    if (subtotal >= threshold1) return Number(systemConfig.discount_percentage_1);
    return 0;
  }, [cartSubtotal, systemConfig]);

  // Calculate discount amount
  const discountAmount = useMemo(() => {
    if (!applyDiscount || availableDiscountPercent === 0) return 0;
    return Math.round(cartSubtotal * (availableDiscountPercent / 100));
  }, [cartSubtotal, applyDiscount, availableDiscountPercent]);

  // Calculate shipping
  // Calculate shipping
  const shippingCost = waiveShipping ? 0 : Number(systemConfig?.shipping_cost || DEFAULT_SHIPPING_COST);

  // Calculate final total
  const cartTotal = useMemo(() => {
    return cartSubtotal - discountAmount + shippingCost;
  }, [cartSubtotal, discountAmount, shippingCost]);

  const handleSubmitOrder = async () => {
    if (!selectedClient || cartItems.length === 0) return;

    setIsSubmitting(true);

    try {
      const orderData = {
        client_id: parseInt(selectedClientId),
        order_date: new Date().toISOString().split('T')[0], // Format: YYYY-MM-DD
        items: cartItems.map(item => ({
          product_id: item.productId,
          quantity: item.quantity,
          price_at_time: item.price,
        })),
        subtotal: cartSubtotal,
        discount: discountAmount,
        discount_percent: applyDiscount ? availableDiscountPercent : 0,
        shipping: waiveShipping ? 0 : SHIPPING_COST,
        shipping_discount: waiveShipping,
        total: cartTotal,
        factura_a: wantsFacturaA,
        notes: orderNotes || null,
      };

      await ordersAPI.create(orderData);

      toast.success("Orden creada exitosamente");
      setShowSuccess(true);

      // Reset form and redirect after success
      setTimeout(() => {
        router.push("/dashboard/mis-pedidos");
      }, 2000);
    } catch (err) {
      console.error("Error creating order:", err);
      toast.error("Error al crear orden", {
        description: err.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit = selectedClient && cartItems.length > 0 && !isSubmitting;

  if (showSuccess) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md w-full">
          <CardContent className="pt-12 pb-8 text-center">
            <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-success" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Orden Confirmada
            </h3>
            <p className="text-muted-foreground mb-4">
              Tu pedido ha sido creado exitosamente
              {wantsFacturaA && " (con Factura A)"}
            </p>
            <p className="text-sm text-muted-foreground">
              Redirigiendo a Mis Pedidos...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Nueva Orden</h1>
        <p className="text-muted-foreground">
          Crea un nuevo pedido para un cliente
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column - Client Selection & Notes */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Seleccionar Cliente
              </CardTitle>
              <CardDescription>
                Elige el cliente para este pedido
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="client">Cliente</Label>
                <div className="relative" ref={clientDropdownRef}>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
                    <Input
                      id="client"
                      placeholder={selectedClient ? selectedClient.name : "Buscar cliente por nombre..."}
                      value={clientSearchTerm}
                      onChange={(e) => setClientSearchTerm(e.target.value)}
                      onFocus={() => setIsClientDropdownOpen(true)}
                      className="pl-9 pr-9"
                    />
                    {selectedClient && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedClientId("");
                          setClientSearchTerm("");
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground z-10"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {isClientDropdownOpen && !selectedClient && (
                    <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {filteredClients.length > 0 ? (
                        <>
                          <div className="px-3 py-2 text-xs text-muted-foreground border-b border-border">
                            {filteredClients.length === 50 ? "Mostrando primeros 50 resultados" : `${filteredClients.length} cliente(s) encontrado(s)`}
                          </div>
                          {filteredClients.map((client) => (
                            <button
                              key={client.id}
                              type="button"
                              onClick={() => {
                                setSelectedClientId(client.id.toString());
                                setClientSearchTerm("");
                                setIsClientDropdownOpen(false);
                              }}
                              className="w-full px-3 py-2 text-left hover:bg-accent transition-colors border-b border-border last:border-0"
                            >
                              <div className="flex items-center justify-between">
                                <p className="font-medium text-sm">{client.name}</p>
                                {client.legajo && (
                                  <span className="font-mono text-xs text-muted-foreground">
                                    {client.legajo}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground">{client.phone}</p>
                            </button>
                          ))}
                        </>
                      ) : (
                        <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                          No se encontraron clientes
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {selectedClient && (
                <div className="p-3 bg-secondary/50 rounded-lg space-y-1 text-sm">
                  <p className="font-medium">{selectedClient.name}</p>
                  <p className="text-muted-foreground">{selectedClient.phone}</p>
                  <p className="text-muted-foreground">{selectedClient.address}</p>
                </div>
              )}

              {/* Factura A Checkbox */}
              <div className="flex items-center space-x-3 p-3 bg-secondary/30 rounded-lg">
                <Checkbox
                  id="facturaA"
                  checked={wantsFacturaA}
                  onCheckedChange={setWantsFacturaA}
                />
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <Label htmlFor="facturaA" className="cursor-pointer font-normal">
                    El cliente requiere Factura A
                  </Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notas del Pedido</Label>
                <Textarea
                  id="notes"
                  placeholder="Instrucciones especiales, notas de entrega..."
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Add Products Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Agregar Productos
              </CardTitle>
              <CardDescription>
                Selecciona productos y cantidades
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="product">Producto</Label>
                <div className="relative" ref={productDropdownRef}>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
                    <Input
                      id="product"
                      placeholder={selectedProduct ? selectedProduct.name : "Buscar producto por nombre..."}
                      value={productSearchTerm}
                      onChange={(e) => setProductSearchTerm(e.target.value)}
                      onFocus={() => setIsProductDropdownOpen(true)}
                      className="pl-9 pr-9"
                    />
                    {selectedProduct && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedProductId("");
                          setProductSearchTerm("");
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground z-10"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {isProductDropdownOpen && !selectedProduct && (
                    <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {filteredProducts.length > 0 ? (
                        <>
                          <div className="px-3 py-2 text-xs text-muted-foreground border-b border-border">
                            {filteredProducts.length === 50 ? "Mostrando primeros 50 resultados" : `${filteredProducts.length} producto(s) encontrado(s)`}
                          </div>
                          {filteredProducts.map((product) => (
                            <button
                              key={product.id}
                              type="button"
                              onClick={() => {
                                setSelectedProductId(product.id.toString());
                                setProductSearchTerm("");
                                setIsProductDropdownOpen(false);
                              }}
                              className="w-full px-3 py-2 text-left hover:bg-accent transition-colors border-b border-border last:border-0"
                            >
                              <div className="flex items-center justify-between">
                                <p className="font-medium text-sm">{product.name}</p>
                                <span className="text-xs text-muted-foreground">
                                  Stock: {product.stock}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {formatCurrency(product.price)}
                              </p>
                            </button>
                          ))}
                        </>
                      ) : (
                        <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                          No se encontraron productos
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {selectedProduct && (
                <div className="p-3 bg-secondary/50 rounded-lg text-sm">
                  <p className="font-medium">{selectedProduct.name}</p>
                  <p className="text-muted-foreground">
                    {formatCurrency(selectedProduct.price)} - Stock:{" "}
                    {selectedProduct.stock} unidades
                  </p>
                </div>
              )}

              <div className="flex gap-3 items-end">
                <div className="space-y-2 flex-1">
                  <Label htmlFor="quantity">Cantidad</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min={1}
                    max={selectedProduct?.stock || 999}
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                    }
                  />
                </div>
                <Button
                  onClick={handleAddToCart}
                  disabled={!selectedProduct || quantity < 1}
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Agregar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Cart */}
        <div>
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Carrito
              </CardTitle>
              <CardDescription>
                {cartItems.length === 0
                  ? "No hay productos agregados"
                  : `${cartItems.length} producto(s) en el carrito`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {cartItems.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">
                    Agrega productos al carrito para crear la orden
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Cart Items */}
                  <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                    {cartItems.map((item) => (
                      <div
                        key={item.productId}
                        className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">
                            {item.productName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatCurrency(item.price)} c/u
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min={1}
                            max={item.stock}
                            value={item.quantity}
                            onChange={(e) =>
                              handleUpdateQuantity(
                                item.productId,
                                parseInt(e.target.value) || 1
                              )
                            }
                            className="w-16 h-8 text-center text-sm"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleRemoveFromCart(item.productId)}
                          >
                            <Trash2 className="w-4 h-4" />
                            <span className="sr-only">Eliminar</span>
                          </Button>
                        </div>
                        <p className="text-sm font-medium w-24 text-right">
                          {formatCurrency(item.price * item.quantity)}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Discount Options */}
                  <div className="border-t border-border pt-4 space-y-3">
                    <p className="text-sm font-medium text-foreground">Descuentos</p>

                    {/* Percentage Discount */}
                    <div className={cn(
                      "flex items-center justify-between p-3 rounded-lg",
                      availableDiscountPercent > 0 ? "bg-success/10 border border-success/20" : "bg-secondary/30"
                    )}>
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          id="discount"
                          checked={applyDiscount}
                          onCheckedChange={setApplyDiscount}
                          disabled={availableDiscountPercent === 0}
                        />
                        <div className="flex items-center gap-2">
                          <Percent className="w-4 h-4 text-muted-foreground" />
                          <Label htmlFor="discount" className={cn(
                            "cursor-pointer font-normal text-sm",
                            availableDiscountPercent === 0 && "text-muted-foreground"
                          )}>
                            {availableDiscountPercent > 0
                              ? `Aplicar ${availableDiscountPercent}% descuento`
                              : "Descuento no disponible"
                            }
                          </Label>
                        </div>
                      </div>
                      {applyDiscount && discountAmount > 0 && (
                        <span className="text-sm font-medium text-success">
                          -{formatCurrency(discountAmount)}
                        </span>
                      )}
                    </div>

                    {availableDiscountPercent === 0 && cartSubtotal > 0 && (
                      <p className="text-xs text-muted-foreground px-1">
                        {cartSubtotal < 100000
                          ? `Faltan ${formatCurrency(100000 - cartSubtotal)} para obtener 5% de descuento`
                          : ""
                        }
                      </p>
                    )}

                    {/* Waive Shipping */}
                    <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          id="shipping"
                          checked={waiveShipping}
                          onCheckedChange={setWaiveShipping}
                        />
                        <div className="flex items-center gap-2">
                          <Truck className="w-4 h-4 text-muted-foreground" />
                          <Label htmlFor="shipping" className="cursor-pointer font-normal text-sm">
                            Sin cargo de envío
                          </Label>
                        </div>
                      </div>
                      {waiveShipping ? (
                        <span className="text-sm font-medium text-success">
                          -{formatCurrency(Number(systemConfig?.shipping_cost || DEFAULT_SHIPPING_COST))}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          +{formatCurrency(Number(systemConfig?.shipping_cost || DEFAULT_SHIPPING_COST))}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="border-t border-border pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>{formatCurrency(cartSubtotal)}</span>
                    </div>
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-sm text-success">
                        <span>Descuento ({availableDiscountPercent}%)</span>
                        <span>-{formatCurrency(discountAmount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Envío</span>
                      <span className={waiveShipping ? "line-through text-muted-foreground" : ""}>
                        {formatCurrency(Number(systemConfig?.shipping_cost || DEFAULT_SHIPPING_COST))}
                      </span>
                    </div>
                    <div className="flex justify-between text-lg font-bold pt-2 border-t border-border">
                      <span>Total</span>
                      <span>{formatCurrency(cartTotal)}</span>
                    </div>
                    {wantsFacturaA && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <FileText className="w-3 h-3" />
                        <span>Se emitirá Factura A</span>
                      </div>
                    )}
                  </div>

                  {/* Warnings */}
                  {!selectedClient && (
                    <div className="flex items-center gap-2 p-3 bg-warning/10 border border-warning/20 rounded-lg text-sm">
                      <AlertCircle className="w-4 h-4 text-warning shrink-0" />
                      <span className="text-warning">
                        Selecciona un cliente para confirmar la orden
                      </span>
                    </div>
                  )}

                  {/* Submit Button */}
                  <Button
                    className="w-full"
                    size="lg"
                    disabled={!canSubmit}
                    onClick={handleSubmitOrder}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Procesando...
                      </>
                    ) : (
                      "Confirmar Orden"
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
