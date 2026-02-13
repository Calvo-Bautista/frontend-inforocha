"use client";

import { useState, useMemo, useEffect } from "react";
import { formatCurrency, getStockStatus } from "@/lib/mock-data";
import { productsAPI } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, Package, AlertCircle, Plus, Loader2, MoreHorizontal, Pencil, Trash2, FileText, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Loading from "./loading";
import { PaginationControls } from "@/components/ui/pagination-controls"; // Import
import { toast } from "sonner";

export default function ProductosPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const searchParams = useSearchParams();

  // Pagination State
  const [page, setPage] = useState(1);
  const [limit] = useState(8);
  const [totalItems, setTotalItems] = useState(0);

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false); // New state for download loading
  const [productToEdit, setProductToEdit] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);

  // New product form state
  const [newProduct, setNewProduct] = useState({
    sku: "",
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "",
  });

  // Edit product form state
  const [editProduct, setEditProduct] = useState({
    sku: "",
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "",
  });

  // Debounced search term to avoid losing focus
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset page to 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [categoryFilter, debouncedSearchTerm]);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const params = {
          skip: (page - 1) * limit,
          limit: limit,
        };
        if (categoryFilter !== "all") {
          params.category = categoryFilter;
        }
        if (debouncedSearchTerm) {
          params.search = debouncedSearchTerm;
        }

        const data = await productsAPI.getAll(params);
        setProducts(data);
        if (data.total !== undefined) {
          setTotalItems(data.total);
        }
      } catch (err) {
        console.error("Error fetching products:", err);
        setError(err.message);
        toast.error("Error al cargar productos", {
          description: err.message,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [categoryFilter, debouncedSearchTerm, page, limit]);

  const categories = [
    { value: "all", label: "Todos" },
    { value: "toner", label: "Tóners" },
    { value: "cartucho", label: "Cartuchos" },
    { value: "drum", label: "Drums" },
    { value: "repuesto", label: "Repuestos" },
  ];

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const productData = {
        sku: newProduct.sku,
        name: newProduct.name,
        description: newProduct.description,
        price: parseFloat(newProduct.price),
        stock: parseInt(newProduct.stock),
        category: newProduct.category,
      };

      const createdProduct = await productsAPI.create(productData);
      setProducts((prev) => [...prev, createdProduct]);

      toast.success("Producto creado", {
        description: `${createdProduct.name} ha sido agregado al inventario`,
      });

      setIsCreateOpen(false);
      setNewProduct({
        sku: "",
        name: "",
        description: "",
        price: "",
        stock: "",
        category: "",
      });
    } catch (err) {
      console.error("Error creating product:", err);
      toast.error("Error al crear producto", {
        description: err.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditDialog = (product) => {
    setProductToEdit(product);
    setEditProduct({
      sku: product.sku,
      name: product.name,
      description: product.description || "",
      price: product.price.toString(),
      stock: product.stock.toString(),
      category: product.category,
    });
    setIsEditOpen(true);
  };

  const handleEditProduct = async (e) => {
    e.preventDefault();
    if (!productToEdit) return;

    setIsSubmitting(true);

    try {
      const productData = {
        sku: editProduct.sku,
        name: editProduct.name,
        description: editProduct.description,
        price: parseFloat(editProduct.price),
        stock: parseInt(editProduct.stock),
        category: editProduct.category,
      };

      const updatedProduct = await productsAPI.update(productToEdit.id, productData);

      setProducts((prev) =>
        prev.map((p) => (p.id === productToEdit.id ? updatedProduct : p))
      );

      toast.success("Producto actualizado", {
        description: `${updatedProduct.name} ha sido actualizado`,
      });

      setIsEditOpen(false);
      setProductToEdit(null);
    } catch (err) {
      console.error("Error updating product:", err);
      toast.error("Error al actualizar producto", {
        description: err.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;

    setIsSubmitting(true);

    try {
      // Mark as inactive instead of deleting
      await productsAPI.update(productToDelete.id, { is_active: false });

      setProducts((prev) => prev.filter((p) => p.id !== productToDelete.id));

      toast.success("Producto eliminado", {
        description: `${productToDelete.name} ha sido marcado como inactivo`,
      });

      setIsDeleteOpen(false);
      setProductToDelete(null);
    } catch (err) {
      console.error("Error deleting product:", err);
      toast.error("Error al eliminar producto", {
        description: err.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadBudget = async () => {
    try {
      setIsDownloading(true);

      const params = {};
      if (categoryFilter !== "all") {
        params.category = categoryFilter;
      }
      if (debouncedSearchTerm) {
        params.search = debouncedSearchTerm;
      }

      const blob = await productsAPI.downloadBudget(params);

      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `presupuesto_${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Presupuesto descargado con éxito");
    } catch (err) {
      console.error("Error downloading budget:", err);
      toast.error("Error al descargar presupuesto", {
        description: err.message,
      });
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <Suspense fallback={<Loading />}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Productos</h1>
            <p className="text-muted-foreground">
              Consulta el inventario y disponibilidad de stock
            </p>
          </div>
          {user?.role === "owner" && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleDownloadBudget}
                disabled={isDownloading || products.length === 0}
                className="gap-2"
              >
                {isDownloading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                Descargar Presupuesto
              </Button>
              <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Nuevo Producto
              </Button>
            </div>
          )}
        </div>

        {/* Error State */}
        {error && (
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="w-5 h-5" />
                <p className="font-medium">Error al cargar productos</p>
              </div>
              <p className="text-sm text-muted-foreground mt-2">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Search and Filters */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, descripción o SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {categories.map((category) => (
              <button
                key={category.value}
                onClick={() => setCategoryFilter(category.value)}
                className={cn(
                  "px-3 py-1.5 text-sm font-medium rounded-lg transition-colors",
                  categoryFilter === category.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                )}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <Card
              key={product.id}
              className={cn(
                "overflow-hidden transition-shadow hover:shadow-md",
                product.stock === 0 && "opacity-75"
              )}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2 flex-1">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Package className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                  {user?.role === "owner" && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="w-4 h-4" />
                          <span className="sr-only">Abrir menú</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditDialog(product)}>
                          <Pencil className="w-4 h-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => {
                            setProductToDelete(product);
                            setIsDeleteOpen(true);
                          }}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
                <CardTitle className="text-base mt-3 leading-tight">
                  {product.name}
                </CardTitle>
                <p className="text-xs text-muted-foreground font-mono">
                  {product.sku}
                </p>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                  {product.description}
                </p>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Precio</p>
                    <p className="text-lg font-bold text-foreground">
                      {formatCurrency(product.price)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Stock</p>
                    <p
                      className={cn(
                        "text-2xl font-bold",
                        product.stock === 0
                          ? "text-destructive"
                          : product.stock <= 10
                            ? "text-warning"
                            : "text-success"
                      )}
                    >
                      {product.stock}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
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
        {products.length === 0 && !isLoading && !error && (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-1">
              No se encontraron productos
            </h3>
            <p className="text-muted-foreground">
              Intenta con otros términos de búsqueda o cambia el filtro de categoría
            </p>
          </div>
        )}

        {/* Create Product Dialog */}
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Nuevo Producto</DialogTitle>
              <DialogDescription>
                Agrega un nuevo producto al inventario
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateProduct}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="sku">SKU *</Label>
                  <Input
                    id="sku"
                    placeholder="Ej: TN-450"
                    value={newProduct.sku}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, sku: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="name">Nombre *</Label>
                  <Input
                    id="name"
                    placeholder="Ej: Toner Brother TN-450"
                    value={newProduct.name}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    placeholder="Descripción del producto..."
                    value={newProduct.description}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, description: e.target.value })
                    }
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="price">Precio *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={newProduct.price}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, price: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="stock">Stock *</Label>
                    <Input
                      id="stock"
                      type="number"
                      min="0"
                      placeholder="0"
                      value={newProduct.stock}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, stock: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="category">Categoría *</Label>
                  <Select
                    value={newProduct.category}
                    onValueChange={(value) =>
                      setNewProduct({ ...newProduct, category: value })
                    }
                    required
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Seleccionar categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="toner">Tóner</SelectItem>
                      <SelectItem value="cartucho">Cartucho</SelectItem>
                      <SelectItem value="drum">Drum</SelectItem>
                      <SelectItem value="repuesto">Repuesto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creando...
                    </>
                  ) : (
                    "Crear Producto"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Product Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Editar Producto</DialogTitle>
              <DialogDescription>
                Modifica la información del producto
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditProduct}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-sku">SKU *</Label>
                  <Input
                    id="edit-sku"
                    value={editProduct.sku}
                    onChange={(e) =>
                      setEditProduct({ ...editProduct, sku: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-name">Nombre *</Label>
                  <Input
                    id="edit-name"
                    value={editProduct.name}
                    onChange={(e) =>
                      setEditProduct({ ...editProduct, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-description">Descripción</Label>
                  <Textarea
                    id="edit-description"
                    value={editProduct.description}
                    onChange={(e) =>
                      setEditProduct({ ...editProduct, description: e.target.value })
                    }
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-price">Precio *</Label>
                    <Input
                      id="edit-price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={editProduct.price}
                      onChange={(e) =>
                        setEditProduct({ ...editProduct, price: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-stock">Stock *</Label>
                    <Input
                      id="edit-stock"
                      type="number"
                      min="0"
                      value={editProduct.stock}
                      onChange={(e) =>
                        setEditProduct({ ...editProduct, stock: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-category">Categoría *</Label>
                  <Select
                    value={editProduct.category}
                    onValueChange={(value) =>
                      setEditProduct({ ...editProduct, category: value })
                    }
                    required
                  >
                    <SelectTrigger id="edit-category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="toner">Tóner</SelectItem>
                      <SelectItem value="cartucho">Cartucho</SelectItem>
                      <SelectItem value="drum">Drum</SelectItem>
                      <SelectItem value="repuesto">Repuesto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditOpen(false)}
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
                    "Guardar Cambios"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar producto?</AlertDialogTitle>
              <AlertDialogDescription>
                El producto <strong>{productToDelete?.name}</strong> será marcado como inactivo.
                No aparecerá en el inventario pero se mantendrá en el historial de órdenes.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isSubmitting}>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteProduct}
                disabled={isSubmitting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Eliminando...
                  </>
                ) : (
                  "Eliminar"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Suspense>
  );
}
