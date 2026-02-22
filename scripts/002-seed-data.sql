-- Seed data for AbastosGest
-- First truncate to avoid duplicates
TRUNCATE TABLE detalle_compra, detalle_venta, compras, ventas, productos, proveedores RESTART IDENTITY CASCADE;

-- Proveedores
INSERT INTO proveedores (nombre, contacto, telefono, email, direccion) VALUES
('Distribuidora Central', 'Carlos Mendoza', '0212-5551234', 'carlos@distcentral.com', 'Av. Principal, Caracas'),
('Alimentos del Valle', 'Maria Lopez', '0241-5559876', 'maria@alivalles.com', 'Zona Industrial, Valencia'),
('Productos Frescos CA', 'Jose Garcia', '0261-5554321', 'jose@pfrescos.com', 'Calle 72, Maracaibo'),
('Lacteos del Sur', 'Ana Rodriguez', '0276-5558765', 'ana@lacteossur.com', 'Av. Libertador, San Cristobal'),
('Granos y Cereales SA', 'Pedro Martinez', '0251-5556543', 'pedro@granosyc.com', 'Carrera 19, Barquisimeto');

-- Productos (IDs will be 1-15 after RESTART IDENTITY)
INSERT INTO productos (nombre, descripcion, categoria, precio_compra, precio_venta, stock, stock_minimo, unidad, proveedor_id) VALUES
('Arroz Premium 1kg', 'Arroz de grano largo tipo 1', 'Granos', 1.50, 2.25, 150, 30, 'kg', 5),
('Harina PAN 1kg', 'Harina de maiz precocida', 'Harinas', 1.20, 1.80, 200, 50, 'kg', 1),
('Aceite Vegetal 1L', 'Aceite vegetal refinado', 'Aceites', 2.00, 3.00, 80, 20, 'litro', 1),
('Azucar Refinada 1kg', 'Azucar blanca refinada', 'Endulzantes', 1.00, 1.50, 120, 25, 'kg', 2),
('Leche Completa 1L', 'Leche entera pasteurizada', 'Lacteos', 1.80, 2.50, 60, 15, 'litro', 4),
('Pasta Larga 500g', 'Espagueti de semola', 'Pastas', 0.80, 1.25, 180, 40, 'unidad', 2),
('Cafe Molido 500g', 'Cafe tostado y molido', 'Bebidas', 3.50, 5.00, 45, 10, 'unidad', 3),
('Queso Blanco 1kg', 'Queso fresco tipo llanero', 'Lacteos', 4.00, 6.00, 25, 8, 'kg', 4),
('Frijoles Negros 1kg', 'Caraotas negras seleccionadas', 'Granos', 1.60, 2.40, 100, 20, 'kg', 5),
('Atun en Lata 170g', 'Atun en aceite vegetal', 'Enlatados', 1.50, 2.20, 90, 15, 'unidad', 3),
('Sardinas en Lata 170g', 'Sardinas en salsa de tomate', 'Enlatados', 1.00, 1.60, 70, 15, 'unidad', 3),
('Margarina 500g', 'Margarina con sal', 'Lacteos', 1.80, 2.60, 55, 12, 'unidad', 4),
('Sal Refinada 1kg', 'Sal yodada refinada', 'Condimentos', 0.50, 0.80, 200, 30, 'kg', 2),
('Lentejas 1kg', 'Lentejas seleccionadas', 'Granos', 1.40, 2.10, 8, 20, 'kg', 5),
('Jabon de Bano', 'Jabon antibacterial 120g', 'Higiene', 0.60, 1.00, 150, 30, 'unidad', 1);

-- Ventas
INSERT INTO ventas (fecha, total, cliente, metodo_pago) VALUES
('2026-02-20 10:30:00', 15.45, 'Cliente General', 'efectivo'),
('2026-02-20 14:15:00', 29.10, 'Maria Fernandez', 'tarjeta'),
('2026-02-21 09:00:00', 7.50, 'Cliente General', 'efectivo'),
('2026-02-21 16:45:00', 41.05, 'Roberto Diaz', 'transferencia');

-- Detalle ventas
INSERT INTO detalle_venta (venta_id, producto_id, cantidad, precio_unitario, subtotal) VALUES
(1, 1, 2, 2.25, 4.50),
(1, 2, 3, 1.80, 5.40),
(1, 6, 3, 1.25, 3.75),
(1, 13, 1, 0.80, 0.80),
(1, 15, 1, 1.00, 1.00),
(2, 7, 2, 5.00, 10.00),
(2, 8, 1, 6.00, 6.00),
(2, 5, 3, 2.50, 7.50),
(2, 3, 1, 3.00, 3.00),
(2, 12, 1, 2.60, 2.60),
(3, 10, 2, 2.20, 4.40),
(3, 11, 1, 1.60, 1.60),
(3, 4, 1, 1.50, 1.50),
(4, 1, 5, 2.25, 11.25),
(4, 9, 4, 2.40, 9.60),
(4, 3, 3, 3.00, 9.00),
(4, 14, 2, 2.10, 4.20),
(4, 7, 1, 5.00, 5.00);

-- Compras
INSERT INTO compras (fecha, total, proveedor_id) VALUES
('2026-02-18 08:00:00', 229.00, 5),
('2026-02-19 10:00:00', 186.00, 1),
('2026-02-20 09:30:00', 103.00, 4);

-- Detalle compras
INSERT INTO detalle_compra (compra_id, producto_id, cantidad, precio_unitario, subtotal) VALUES
(1, 1, 50, 1.50, 75.00),
(1, 9, 40, 1.60, 64.00),
(1, 14, 30, 1.40, 42.00),
(1, 6, 60, 0.80, 48.00),
(2, 2, 80, 1.20, 96.00),
(2, 3, 20, 2.00, 40.00),
(2, 15, 50, 0.60, 30.00),
(2, 13, 40, 0.50, 20.00),
(3, 5, 20, 1.80, 36.00),
(3, 8, 10, 4.00, 40.00),
(3, 12, 15, 1.80, 27.00);
