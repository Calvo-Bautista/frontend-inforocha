/**
 * Utility functions for data formatting and display
 * Note: Mock data has been removed - all data now comes from the backend API
 */

// Helper function to format currency (Argentine Peso)
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

// Helper function to get stock status
export function getStockStatus(stock) {
  if (stock === 0) return { label: "Sin Stock", color: "destructive" };
  if (stock <= 10) return { label: "Stock Bajo", color: "warning" };
  if (stock <= 30) return { label: "Stock Medio", color: "default" };
  return { label: "Stock Alto", color: "success" };
}

// Helper function to get order status
export function getOrderStatus(status) {
  const statusMap = {
    pendiente: { label: "Pendiente", color: "warning" },
    preparacion: { label: "En Preparación", color: "default" },
    enviado: { label: "Enviado", color: "primary" },
    entregado: { label: "Entregado", color: "success" },
    cancelado: { label: "Cancelado", color: "destructive" },
  };
  return statusMap[status] || { label: status, color: "default" };
}

// Helper function to get client status
export function getClientStatus(status) {
  const statusMap = {
    prospect: { label: "Prospecto", color: "warning" },
    active: { label: "Cliente Activo", color: "success" },
  };
  return statusMap[status] || { label: status, color: "default" };
}

// Helper function to get client priority type
export function getClientPriority(tipoCliente) {
  const priorityMap = {
    ALTA: { label: "Alta Prioridad", color: "success", description: "1 por mes" },
    MEDIA: { label: "Media Prioridad", color: "warning", description: "1 cada 2-3 meses" },
    BAJA: { label: "Baja Prioridad", color: "default", description: "1 cada 6+ meses" },
  };
  return priorityMap[tipoCliente] || { label: "-", color: "default", description: "" };
}

// Helper function to get role information
export function getRoleInfo(role) {
  const roleMap = {
    vendedor: { label: "Vendedor", color: "primary" },
    logistica: { label: "Logística", color: "warning" },
    admin: { label: "Administrador", color: "success" },
    owner: { label: "Owner", color: "purple" },
  };
  return roleMap[role] || { label: role, color: "default" };
}
