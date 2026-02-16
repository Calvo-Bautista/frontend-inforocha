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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
  const [invoiceType, setInvoiceType] = useState("sin_factura");
  const [applyDiscount, setApplyDiscount] = useState(false);
  const [waiveShipping, setWaiveShipping] = useState(false);

  // Repair service states
  const [includesRepair, setIncludesRepair] = useState(false);
  const [repairDescription, setRepairDescription] = useState("");
  const [repairAmount, setRepairAmount] = useState(0);

  // Payment method state
  const [paymentMethod, setPaymentMethod] = useState("");

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
      prev.map((item) => {
        if (item.productId === productId) {
          if (newQuantity > item.stock) {
            toast.warning(`Solo hay ${item.stock} unidades disponibles`);
            return { ...item, quantity: item.stock };
          }
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };

  // Calculate totals with discounts
  const cartSubtotal = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cartItems]);

  // Determine available discount percentage based on subtotal

  const availableDiscountPercent = useMemo(() => {
    if (!systemConfig || !systemConfig.discounts || !Array.isArray(systemConfig.discounts)) return 0;

    const subtotal = Number(cartSubtotal);

    // Sort discounts by threshold descending to find the highest applicable one first
    const sortedDiscounts = [...systemConfig.discounts]
      .map(d => ({ ...d, threshold: Number(d.threshold), percentage: Number(d.percentage) }))
      .sort((a, b) => b.threshold - a.threshold);

    for (const discount of sortedDiscounts) {
      if (subtotal >= discount.threshold) {
        return discount.percentage;
      }
    }

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
    const repairCost = includesRepair ? parseFloat(repairAmount) || 0 : 0;
    return cartSubtotal - discountAmount + shippingCost + repairCost;
  }, [cartSubtotal, discountAmount, shippingCost, includesRepair, repairAmount]);

  const handleSubmitOrder = async () => {
    // Require either products OR repair service
    if (!selectedClient || (cartItems.length === 0 && !includesRepair)) return;

    // Validate repair fields if repair is included
    if (includesRepair && (!repairDescription || !repairAmount || parseFloat(repairAmount) <= 0)) {
      toast.error("Error de validación", {
        description: "Por favor completa la descripción y el monto de la reparación",
      });
      return;
    }

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
        shipping: waiveShipping ? 0 : shippingCost,
        shipping_discount: waiveShipping,
        total: cartTotal,
        invoice_type: invoiceType === "sin_factura" ? null : invoiceType,
        notes: orderNotes || null,
        repair_description: includesRepair ? repairDescription : null,
        repair_amount: includesRepair ? parseFloat(repairAmount) || 0 : 0,
        payment_method: paymentMethod,
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

  // Allow submission if there are products OR if there's a valid repair
  const hasProducts = cartItems.length > 0;
  const hasValidRepair = includesRepair &&
    repairDescription?.trim().length > 0 &&
    repairAmount &&
    parseFloat(repairAmount) > 0;
  const canSubmit = selectedClient && (hasProducts || hasValidRepair) && paymentMethod && !isSubmitting;

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
              {invoiceType !== "sin_factura" && ` (con Factura ${invoiceType})`}
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

              {/* Invoice Type Radio Group */}
              <div className="space-y-3 p-3 bg-secondary/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <Label className="font-medium">Tipo de Facturación</Label>
                </div>
                <RadioGroup
                  value={invoiceType}
                  onValueChange={setInvoiceType}
                  className="grid grid-cols-2 sm:grid-cols-4 gap-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="A" id="ft-a" />
                    <Label htmlFor="ft-a" className="cursor-pointer">Factura A</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="B" id="ft-b" />
                    <Label htmlFor="ft-b" className="cursor-pointer">Factura B</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="C" id="ft-c" />
                    <Label htmlFor="ft-c" className="cursor-pointer">Factura C</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="sin_factura" id="ft-none" />
                    <Label htmlFor="ft-none" className="cursor-pointer">Sin Factura</Label>
                  </div>
                </RadioGroup>
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

          {/* Repair Service Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Servicio de Reparación
              </CardTitle>
              <CardDescription>
                Agrega un cargo por reparación a esta orden
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-secondary/30 rounded-lg">
                <Checkbox
                  id="includesRepair"
                  checked={includesRepair}
                  onCheckedChange={(checked) => {
                    setIncludesRepair(checked);
                    if (!checked) {
                      setRepairDescription("");
                      setRepairAmount(0);
                    }
                  }}
                />
                <Label htmlFor="includesRepair" className="cursor-pointer font-normal">
                  ¿Incluye servicio de reparación?
                </Label>
              </div>

              {includesRepair && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="repairDescription">Descripción del Servicio *</Label>
                    <Textarea
                      id="repairDescription"
                      placeholder="Ej: Reparación de impresora HP LaserJet, cambio de fusor..."
                      value={repairDescription}
                      onChange={(e) => setRepairDescription(e.target.value)}
                      rows={3}
                      required={includesRepair}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="repairAmount">Monto del Servicio *</Label>
                    <Input
                      id="repairAmount"
                      type="number"
                      min={0}
                      step={0.01}
                      placeholder="0.00"
                      value={repairAmount}
                      onKeyDown={(e) => {
                        if (["-", "+", "e", "E"].includes(e.key)) {
                          e.preventDefault();
                        }
                      }}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "" || parseFloat(val) >= 0) {
                          setRepairAmount(val);
                        }
                      }}
                      required={includesRepair}
                    />
                  </div>

                  {repairAmount > 0 && (
                    <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
                      <p className="text-sm font-medium text-primary">
                        Cargo por reparación: {formatCurrency(parseFloat(repairAmount) || 0)}
                      </p>
                    </div>
                  )}
                </>
              )}
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
                <div className="space-y-2 flex-1 min-w-0">
                  <Label htmlFor="quantity">Cantidad</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min={1}
                    max={selectedProduct?.stock || 999}
                    value={quantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 1;
                      const max = selectedProduct?.stock || 999;
                      if (val > max) {
                        setQuantity(max);
                        toast.warning(`Solo hay ${max} unidades disponibles`);
                      } else {
                        setQuantity(Math.max(1, val));
                      }
                    }}
                  />
                </div>
                <Button
                  onClick={handleAddToCart}
                  disabled={!selectedProduct || quantity < 1}
                  size="icon"
                  className="shrink-0 sm:w-auto sm:px-4 sm:gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Agregar</span>
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
              {cartItems.length === 0 && !hasValidRepair ? (
                <div className="text-center py-8">
                  <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">
                    Agrega productos al carrito o incluye un servicio de reparación
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Cart Items */}
                  {cartItems.length > 0 && (
                    <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                      {cartItems.map((item) => (
                        <div
                          key={item.productId}
                          className="p-3 bg-secondary/30 rounded-lg space-y-2"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-sm truncate">
                                {item.productName}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatCurrency(item.price)} c/u
                              </p>
                            </div>
                            <p className="text-sm font-medium whitespace-nowrap">
                              {formatCurrency(item.price * item.quantity)}
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
                              className="h-8 w-8 shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => handleRemoveFromCart(item.productId)}
                            >
                              <Trash2 className="w-4 h-4" />
                              <span className="sr-only">Eliminar</span>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Discount Options */}
                  <div className="border-t border-border pt-4 space-y-3">
                    <p className="text-sm font-medium text-foreground">Descuentos</p>

                    {/* Percentage Discount */}
                    <div className={cn(
                      "flex flex-wrap items-center justify-between gap-2 p-3 rounded-lg",
                      availableDiscountPercent > 0 ? "bg-success/10 border border-success/20" : "bg-secondary/30"
                    )}>
                      <div className="flex items-center space-x-3 min-w-0">
                        <Checkbox
                          id="discount"
                          checked={applyDiscount}
                          onCheckedChange={setApplyDiscount}
                          disabled={availableDiscountPercent === 0 || cartItems.length === 0}
                          className="shrink-0"
                        />
                        <div className="flex items-center gap-2 min-w-0">
                          <Percent className="w-4 h-4 text-muted-foreground shrink-0" />
                          <Label htmlFor="discount" className={cn(
                            "cursor-pointer font-normal text-sm",
                            availableDiscountPercent === 0 || cartItems.length === 0 && "text-muted-foreground"
                          )}>
                            {availableDiscountPercent > 0 && cartItems.length > 0
                              ? `Aplicar ${availableDiscountPercent}% descuento`
                              : "Descuento no disponible"
                            }
                          </Label>
                        </div>
                      </div>
                      {applyDiscount && discountAmount > 0 && (
                        <span className="text-sm font-medium text-success whitespace-nowrap">
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
                    <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-secondary/30 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          id="shipping"
                          checked={waiveShipping}
                          onCheckedChange={setWaiveShipping}
                          className="shrink-0"
                        />
                        <div className="flex items-center gap-2">
                          <Truck className="w-4 h-4 text-muted-foreground shrink-0" />
                          <Label htmlFor="shipping" className="cursor-pointer font-normal text-sm">
                            Sin cargo de envío
                          </Label>
                        </div>
                      </div>
                      {waiveShipping ? (
                        <span className="text-sm font-medium text-success whitespace-nowrap">
                          -{formatCurrency(Number(systemConfig?.shipping_cost || DEFAULT_SHIPPING_COST))}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground whitespace-nowrap">
                          +{formatCurrency(Number(systemConfig?.shipping_cost || DEFAULT_SHIPPING_COST))}
                        </span>
                      )}
                    </div>

                    {/* Payment Method */}
                    <div className="p-3 bg-secondary/30 rounded-lg space-y-2">
                      <Label htmlFor="paymentMethod" className="text-sm font-medium">
                        Método de Pago *
                      </Label>
                      <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                        <SelectTrigger id="paymentMethod">
                          <SelectValue placeholder="Selecciona un método de pago" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="efectivo">Efectivo</SelectItem>
                          <SelectItem value="transferencia">Transferencia</SelectItem>
                          <SelectItem value="tarjeta">Tarjeta</SelectItem>
                        </SelectContent>
                      </Select>
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
                    {includesRepair && repairAmount > 0 && (
                      <div className="text-xs text-muted-foreground">
                        Incluye reparación: {formatCurrency(parseFloat(repairAmount) || 0)}
                      </div>
                    )}
                    {invoiceType !== "sin_factura" && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <FileText className="w-3 h-3" />
                        <span>Se emitirá Factura {invoiceType}</span>
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

                  {selectedClient && !hasProducts && !hasValidRepair && (
                    <div className="flex items-center gap-2 p-3 bg-warning/10 border border-warning/20 rounded-lg text-sm">
                      <AlertCircle className="w-4 h-4 text-warning shrink-0" />
                      <span className="text-warning">
                        Agrega productos al carrito o incluye un servicio de reparación
                      </span>
                    </div>
                  )}

                  {selectedClient && (hasProducts || hasValidRepair) && !paymentMethod && (
                    <div className="flex items-center gap-2 p-3 bg-warning/10 border border-warning/20 rounded-lg text-sm">
                      <AlertCircle className="w-4 h-4 text-warning shrink-0" />
                      <span className="text-warning">
                        Selecciona un método de pago para continuar
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
