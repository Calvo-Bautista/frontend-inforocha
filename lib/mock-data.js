// Mock Products Data
export const products = [
  {
    id: 1,
    name: "Tóner HP 85A",
    description: "Cartucho de tóner negro compatible con HP LaserJet P1102, M1132",
    price: 45000,
    stock: 150,
    category: "toner",
    sku: "TON-HP-85A",
  },
  {
    id: 2,
    name: "Tóner Brother TN-1060",
    description: "Cartucho de tóner negro para impresoras Brother HL-1110, DCP-1512",
    price: 38000,
    stock: 85,
    category: "toner",
    sku: "TON-BRO-1060",
  },
  {
    id: 3,
    name: "Cartucho HP 664 Negro",
    description: "Cartucho de tinta negro original HP para Deskjet 1115, 2135, 3635",
    price: 18500,
    stock: 12,
    category: "cartucho",
    sku: "CAR-HP-664N",
  },
  {
    id: 4,
    name: "Cartucho HP 664 Color",
    description: "Cartucho de tinta tricolor original HP para Deskjet 1115, 2135, 3635",
    price: 22000,
    stock: 8,
    category: "cartucho",
    sku: "CAR-HP-664C",
  },
  {
    id: 5,
    name: "Tóner Samsung MLT-D101S",
    description: "Cartucho de tóner negro para Samsung ML-2160, SCX-3400",
    price: 42000,
    stock: 65,
    category: "toner",
    sku: "TON-SAM-101S",
  },
  {
    id: 6,
    name: "Cartucho Epson T664 Pack x4",
    description: "Pack de 4 botellas de tinta para EcoTank L200, L210, L355",
    price: 35000,
    stock: 45,
    category: "cartucho",
    sku: "CAR-EPS-664P",
  },
  {
    id: 7,
    name: "Drum Brother DR-1060",
    description: "Unidad de tambor para impresoras Brother HL-1110, DCP-1512",
    price: 55000,
    stock: 3,
    category: "drum",
    sku: "DRM-BRO-1060",
  },
  {
    id: 8,
    name: "Tóner Canon 128",
    description: "Cartucho de tóner negro para Canon MF4410, MF4450, D530",
    price: 48000,
    stock: 28,
    category: "toner",
    sku: "TON-CAN-128",
  },
  {
    id: 9,
    name: "Cartucho Canon PG-210",
    description: "Cartucho de tinta negro original Canon para Pixma MP250, MP280",
    price: 19500,
    stock: 0,
    category: "cartucho",
    sku: "CAR-CAN-210",
  },
  {
    id: 10,
    name: "Tóner HP 12A",
    description: "Cartucho de tóner negro compatible con HP LaserJet 1010, 1020, 3050",
    price: 40000,
    stock: 92,
    category: "toner",
    sku: "TON-HP-12A",
  },
  {
    id: 11,
    name: "Fusor HP LaserJet P1102",
    description: "Unidad fusora de repuesto para HP LaserJet P1102",
    price: 125000,
    stock: 5,
    category: "repuesto",
    sku: "REP-HP-FUS102",
  },
  {
    id: 12,
    name: "Rodillo de Presión Brother",
    description: "Rodillo de presión compatible para Brother HL-1110, DCP-1512",
    price: 35000,
    stock: 18,
    category: "repuesto",
    sku: "REP-BRO-ROD",
  },
];

// Mock Clients Data
export const clients = [
  {
    id: 1,
    legajo: "CLI-001",
    name: "Papelería El Lápiz",
    phone: "+54 11 4555-1234",
    address: "Av. Corrientes 1234, CABA",
    status: "active",
    industry: "Papelería",
    maquinas: "HP LaserJet Pro M15w",
    tipoCliente: "alta", // 1 por mes
    proveedorActual: "",
  },
  {
    id: 2,
    legajo: "CLI-002",
    name: "Tecnología Express S.A.",
    phone: "+54 11 4666-5678",
    address: "Av. Santa Fe 2345, CABA",
    status: "active",
    industry: "Tecnología",
    maquinas: "Brother HL-1110, Epson L3150",
    tipoCliente: "alta",
    proveedorActual: "Suministros BA",
  },
  {
    id: 3,
    legajo: "CLI-003",
    name: "Oficinas Modernas",
    phone: "+54 11 4777-9012",
    address: "Av. Libertador 3456, Vicente López",
    status: "prospect",
    industry: "Mobiliario",
    maquinas: "",
    tipoCliente: "",
    proveedorActual: "",
  },
  {
    id: 4,
    legajo: "CLI-004",
    name: "Imprenta Rápida",
    phone: "+54 11 4888-3456",
    address: "Calle Florida 567, CABA",
    status: "active",
    industry: "Imprenta",
    maquinas: "HP LaserJet Enterprise M507, Canon imageRUNNER",
    tipoCliente: "alta",
    proveedorActual: "",
  },
  {
    id: 5,
    legajo: "CLI-005",
    name: "Estudio Contable García",
    phone: "+54 11 4999-7890",
    address: "Av. Belgrano 789, CABA",
    status: "prospect",
    industry: "Servicios Profesionales",
    maquinas: "Samsung ML-2160",
    tipoCliente: "media", // 1 cada 2-3 meses
    proveedorActual: "Toner Express",
  },
  {
    id: 6,
    legajo: "CLI-006",
    name: "Escuela Técnica N°5",
    phone: "+54 11 5000-1234",
    address: "Av. Rivadavia 4567, Caballito",
    status: "active",
    industry: "Educación",
    maquinas: "HP LaserJet Pro MFP M428, Brother DCP-L2540DW",
    tipoCliente: "alta",
    proveedorActual: "",
  },
  {
    id: 7,
    legajo: "CLI-007",
    name: "Copistería Central",
    phone: "+54 11 5111-5678",
    address: "Calle Lavalle 890, CABA",
    status: "active",
    industry: "Copistería",
    maquinas: "Canon imageRUNNER ADVANCE, Konica Minolta",
    tipoCliente: "alta",
    proveedorActual: "",
  },
  {
    id: 8,
    legajo: "CLI-008",
    name: "Distribuidora Norte",
    phone: "+54 11 5222-9012",
    address: "Av. Maipú 1234, San Isidro",
    status: "prospect",
    industry: "Distribución",
    maquinas: "HP DeskJet 2775",
    tipoCliente: "baja", // 1 cada 6 meses o más
    proveedorActual: "Mercado Libre",
  },
];

// Mock Orders Data
export const orders = [
  {
    id: "ORD-001",
    clientId: 1,
    clientName: "Papelería El Lápiz",
    clientPhone: "+54 11 4555-1234",
    clientAddress: "Av. Corrientes 1234, CABA",
    date: "2026-01-20",
    items: [
      { productId: 1, productName: "Tóner HP 85A", sku: "TON-HP-85A", quantity: 10, price: 45000 },
      { productId: 3, productName: "Cartucho HP 664 Negro", sku: "CAR-HP-664N", quantity: 20, price: 18500 },
    ],
    subtotal: 820000,
    discount: 0,
    discountPercent: 0,
    shippingDiscount: false,
    shipping: 8000,
    total: 828000,
    facturaA: true,
    status: "pendiente",
    sellerId: 1,
    sellerName: "Carlos Vendedor",
    notes: "Entregar en horario de mañana",
  },
  {
    id: "ORD-002",
    clientId: 2,
    clientName: "Tecnología Express S.A.",
    clientPhone: "+54 11 4666-5678",
    clientAddress: "Av. Santa Fe 2345, CABA",
    date: "2026-01-19",
    items: [
      { productId: 2, productName: "Tóner Brother TN-1060", sku: "TON-BRO-1060", quantity: 15, price: 38000 },
    ],
    subtotal: 570000,
    discount: 57000,
    discountPercent: 10,
    shippingDiscount: true,
    shipping: 0,
    total: 513000,
    facturaA: true,
    status: "preparacion",
    sellerId: 1,
    sellerName: "Carlos Vendedor",
    notes: "",
  },
  {
    id: "ORD-003",
    clientId: 4,
    clientName: "Imprenta Rápida",
    clientPhone: "+54 11 4888-3456",
    clientAddress: "Calle Florida 567, CABA",
    date: "2026-01-18",
    items: [
      { productId: 6, productName: "Cartucho Epson T664 Pack x4", sku: "CAR-EPS-664P", quantity: 8, price: 35000 },
      { productId: 5, productName: "Tóner Samsung MLT-D101S", sku: "TON-SAM-101S", quantity: 5, price: 42000 },
    ],
    subtotal: 490000,
    discount: 24500,
    discountPercent: 5,
    shippingDiscount: false,
    shipping: 8000,
    total: 473500,
    facturaA: false,
    status: "enviado",
    sellerId: 1,
    sellerName: "Carlos Vendedor",
    notes: "Llamar antes de enviar",
  },
  {
    id: "ORD-004",
    clientId: 6,
    clientName: "Escuela Técnica N°5",
    clientPhone: "+54 11 5000-1234",
    clientAddress: "Av. Rivadavia 4567, Caballito",
    date: "2026-01-17",
    items: [
      { productId: 10, productName: "Tóner HP 12A", sku: "TON-HP-12A", quantity: 25, price: 40000 },
    ],
    subtotal: 1000000,
    discount: 100000,
    discountPercent: 10,
    shippingDiscount: true,
    shipping: 0,
    total: 900000,
    facturaA: true,
    status: "entregado",
    sellerId: 1,
    sellerName: "Carlos Vendedor",
    notes: "Entregado a recepción",
  },
  {
    id: "ORD-005",
    clientId: 7,
    clientName: "Copistería Central",
    clientPhone: "+54 11 5111-5678",
    clientAddress: "Calle Lavalle 890, CABA",
    date: "2026-01-21",
    items: [
      { productId: 1, productName: "Tóner HP 85A", sku: "TON-HP-85A", quantity: 30, price: 45000 },
      { productId: 8, productName: "Tóner Canon 128", sku: "TON-CAN-128", quantity: 15, price: 48000 },
    ],
    subtotal: 2070000,
    discount: 207000,
    discountPercent: 10,
    shippingDiscount: true,
    shipping: 0,
    total: 1863000,
    facturaA: true,
    status: "preparacion",
    sellerId: 1,
    sellerName: "Carlos Vendedor",
    notes: "Pedido urgente - cliente VIP",
  },
];

// Mock Call Logs
export const callLogs = [
  {
    id: 1,
    clientId: 3,
    clientName: "Oficinas Modernas",
    date: "2026-01-20",
    industry: "Mobiliario",
    usesPrinters: true,
    printerType: "HP LaserJet, Brother",
    interestedInQuote: true,
    notes: "Muy interesado en tóners compatibles. Llamar la próxima semana para cerrar venta.",
    sellerId: 1,
  },
  {
    id: 2,
    clientId: 5,
    clientName: "Estudio Contable García",
    date: "2026-01-19",
    industry: "Servicios Profesionales",
    usesPrinters: true,
    printerType: "Samsung ML-2160",
    interestedInQuote: false,
    notes: "Ya tiene proveedor actual. Hacer seguimiento en 3 meses.",
    sellerId: 1,
  },
  {
    id: 3,
    clientId: 8,
    clientName: "Distribuidora Norte",
    date: "2026-01-18",
    industry: "Distribución",
    usesPrinters: false,
    printerType: "",
    interestedInQuote: false,
    notes: "No utilizan impresoras propias, tercerizan impresión.",
    sellerId: 1,
  },
];

// Mock Users for Admin
export const systemUsers = [
  {
    id: 1,
    email: "vendedor@rocha.com",
    name: "Carlos Vendedor",
    role: "vendedor",
    legajo: "LEG-001",
    createdAt: "2025-06-15",
  },
  {
    id: 2,
    email: "logistica@rocha.com",
    name: "María Logística",
    role: "logistica",
    legajo: "LEG-002",
    createdAt: "2025-08-20",
  },
  {
    id: 3,
    email: "admin@rocha.com",
    name: "Admin Rocha",
    role: "admin",
    legajo: "LEG-003",
    createdAt: "2025-01-01",
  },
  {
    id: 4,
    email: "vendedor2@rocha.com",
    name: "Ana García",
    role: "vendedor",
    legajo: "LEG-004",
    createdAt: "2025-11-10",
  },
  {
    id: 5,
    email: "owner@rocha.com",
    name: "Owner Rocha",
    role: "owner",
    legajo: "LEG-000",
    createdAt: "2025-01-01",
  },
];

// Helper function to format currency (Argentine Peso)
export function formatCurrency(amount) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
  }).format(amount);
}

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
    alta: { label: "Alta Prioridad", color: "success", description: "1 por mes" },
    media: { label: "Media Prioridad", color: "warning", description: "1 cada 2-3 meses" },
    baja: { label: "Baja Prioridad", color: "default", description: "1 cada 6+ meses" },
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
