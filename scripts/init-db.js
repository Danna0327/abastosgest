// scripts/init-db.js
// Corre este script una sola vez para crear las tablas e insertar datos de prueba
// Ejecutar con: node scripts/init-db.js

const postgres = require("postgres")

const sql = postgres(process.env.DATABASE_URL, {
  ssl: { rejectUnauthorized: false },
})

async function main() {
  console.log("🚀 Inicializando base de datos AbastosGest...")

  await sql`
    CREATE TABLE IF NOT EXISTS proveedores (
      id SERIAL PRIMARY KEY,
      nombre VARCHAR(200) NOT NULL,
      contacto VARCHAR(200),
      telefono VARCHAR(50),
      email VARCHAR(200),
      direccion TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `

  await sql`
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
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS ventas (
      id SERIAL PRIMARY KEY,
      fecha TIMESTAMP DEFAULT NOW(),
      total NUMERIC(10,2) NOT NULL DEFAULT 0,
      metodo_pago VARCHAR(50) DEFAULT 'efectivo',
      cliente VARCHAR(200),
      notas TEXT
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS detalle_venta (
      id SERIAL PRIMARY KEY,
      venta_id INTEGER NOT NULL REFERENCES ventas(id) ON DELETE CASCADE,
      producto_id INTEGER NOT NULL REFERENCES productos(id) ON DELETE RESTRICT,
      cantidad INTEGER NOT NULL,
      precio_unitario NUMERIC(10,2) NOT NULL,
      subtotal NUMERIC(10,2) NOT NULL
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS compras (
      id SERIAL PRIMARY KEY,
      fecha TIMESTAMP DEFAULT NOW(),
      proveedor_id INTEGER REFERENCES proveedores(id) ON DELETE SET NULL,
      total NUMERIC(10,2) NOT NULL DEFAULT 0,
      notas TEXT
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS detalle_compra (
      id SERIAL PRIMARY KEY,
      compra_id INTEGER NOT NULL REFERENCES compras(id) ON DELETE CASCADE,
      producto_id INTEGER NOT NULL REFERENCES productos(id) ON DELETE RESTRICT,
      cantidad INTEGER NOT NULL,
      precio_unitario NUMERIC(10,2) NOT NULL,
      subtotal NUMERIC(10,2) NOT NULL
    )
  `

  console.log("✅ Tablas creadas correctamente.")
  console.log("💡 Tip: También puedes correr el archivo scripts/002-seed-data.sql para datos de prueba.")

  await sql.end()
}

main().catch((err) => {
  console.error("❌ Error al inicializar la base de datos:", err)
  process.exit(1)
})
