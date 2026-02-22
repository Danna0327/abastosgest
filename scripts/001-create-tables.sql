-- AbastosGest Database Schema

-- Proveedores (Suppliers)
CREATE TABLE IF NOT EXISTS proveedores (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(200) NOT NULL,
  contacto VARCHAR(200),
  telefono VARCHAR(50),
  email VARCHAR(200),
  direccion TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Productos (Products/Inventory)
CREATE TABLE IF NOT EXISTS productos (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(200) NOT NULL,
  descripcion TEXT,
  categoria VARCHAR(100),
  precio_compra NUMERIC(10,2) NOT NULL DEFAULT 0,
  precio_venta NUMERIC(10,2) NOT NULL DEFAULT 0,
  stock INTEGER NOT NULL DEFAULT 0,
  stock_minimo INTEGER NOT NULL DEFAULT 5,
  unidad VARCHAR(50) DEFAULT 'unidad',
  proveedor_id INTEGER REFERENCES proveedores(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Ventas (Sales)
CREATE TABLE IF NOT EXISTS ventas (
  id SERIAL PRIMARY KEY,
  fecha TIMESTAMP DEFAULT NOW(),
  total NUMERIC(10,2) NOT NULL DEFAULT 0,
  metodo_pago VARCHAR(50) DEFAULT 'efectivo',
  cliente VARCHAR(200),
  notas TEXT
);

-- Detalle de Ventas (Sale Items)
CREATE TABLE IF NOT EXISTS detalle_venta (
  id SERIAL PRIMARY KEY,
  venta_id INTEGER NOT NULL REFERENCES ventas(id) ON DELETE CASCADE,
  producto_id INTEGER NOT NULL REFERENCES productos(id) ON DELETE RESTRICT,
  cantidad INTEGER NOT NULL,
  precio_unitario NUMERIC(10,2) NOT NULL,
  subtotal NUMERIC(10,2) NOT NULL
);

-- Compras (Purchases)
CREATE TABLE IF NOT EXISTS compras (
  id SERIAL PRIMARY KEY,
  fecha TIMESTAMP DEFAULT NOW(),
  proveedor_id INTEGER REFERENCES proveedores(id) ON DELETE SET NULL,
  total NUMERIC(10,2) NOT NULL DEFAULT 0,
  notas TEXT
);

-- Detalle de Compras (Purchase Items)
CREATE TABLE IF NOT EXISTS detalle_compra (
  id SERIAL PRIMARY KEY,
  compra_id INTEGER NOT NULL REFERENCES compras(id) ON DELETE CASCADE,
  producto_id INTEGER NOT NULL REFERENCES productos(id) ON DELETE RESTRICT,
  cantidad INTEGER NOT NULL,
  precio_unitario NUMERIC(10,2) NOT NULL,
  subtotal NUMERIC(10,2) NOT NULL
);
