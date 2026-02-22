<?php
require_once __DIR__ . '/../config/database.php';

class Producto {
    private PDO $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    /** Obtiene todos los productos con nombre del proveedor */
    public function getAll(): array {
        $stmt = $this->db->query("
            SELECT p.*, pr.nombre AS proveedor_nombre
            FROM productos p
            LEFT JOIN proveedores pr ON pr.id = p.proveedor_id
            ORDER BY p.nombre ASC
        ");
        return $stmt->fetchAll();
    }

    /** Obtiene un producto por ID */
    public function getById(int $id): array|false {
        $stmt = $this->db->prepare("SELECT * FROM productos WHERE id = :id");
        $stmt->execute([':id' => $id]);
        return $stmt->fetch();
    }

    /** Productos con stock por debajo del mínimo */
    public function getBajoStock(): array {
        $stmt = $this->db->query("
            SELECT p.*, pr.nombre AS proveedor_nombre
            FROM productos p
            LEFT JOIN proveedores pr ON pr.id = p.proveedor_id
            WHERE p.stock <= p.stock_minimo
            ORDER BY p.stock ASC
        ");
        return $stmt->fetchAll();
    }

    /** Crea un nuevo producto */
    public function crear(array $data): bool {
        $stmt = $this->db->prepare("
            INSERT INTO productos (nombre, descripcion, categoria, precio_compra, precio_venta, stock, stock_minimo, unidad, proveedor_id)
            VALUES (:nombre, :descripcion, :categoria, :precio_compra, :precio_venta, :stock, :stock_minimo, :unidad, :proveedor_id)
        ");
        return $stmt->execute([
            ':nombre'       => $data['nombre'],
            ':descripcion'  => $data['descripcion'] ?? null,
            ':categoria'    => $data['categoria'] ?? null,
            ':precio_compra'=> $data['precio_compra'],
            ':precio_venta' => $data['precio_venta'],
            ':stock'        => $data['stock'] ?? 0,
            ':stock_minimo' => $data['stock_minimo'] ?? 5,
            ':unidad'       => $data['unidad'] ?? 'unidad',
            ':proveedor_id' => !empty($data['proveedor_id']) ? $data['proveedor_id'] : null,
        ]);
    }

    /** Actualiza datos de un producto */
    public function actualizar(int $id, array $data): bool {
        $stmt = $this->db->prepare("
            UPDATE productos SET
                nombre       = :nombre,
                descripcion  = :descripcion,
                categoria    = :categoria,
                precio_compra= :precio_compra,
                precio_venta = :precio_venta,
                stock        = :stock,
                stock_minimo = :stock_minimo,
                unidad       = :unidad,
                proveedor_id = :proveedor_id
            WHERE id = :id
        ");
        return $stmt->execute([
            ':id'           => $id,
            ':nombre'       => $data['nombre'],
            ':descripcion'  => $data['descripcion'] ?? null,
            ':categoria'    => $data['categoria'] ?? null,
            ':precio_compra'=> $data['precio_compra'],
            ':precio_venta' => $data['precio_venta'],
            ':stock'        => $data['stock'],
            ':stock_minimo' => $data['stock_minimo'] ?? 5,
            ':unidad'       => $data['unidad'] ?? 'unidad',
            ':proveedor_id' => !empty($data['proveedor_id']) ? $data['proveedor_id'] : null,
        ]);
    }

    /** Descuenta stock al registrar una venta */
    public function descontarStock(int $id, int $cantidad): bool {
        $stmt = $this->db->prepare("
            UPDATE productos SET stock = stock - :cantidad WHERE id = :id AND stock >= :cantidad
        ");
        $stmt->execute([':cantidad' => $cantidad, ':id' => $id]);
        return $stmt->rowCount() > 0;
    }

    /** Suma stock al registrar una compra */
    public function sumarStock(int $id, int $cantidad): bool {
        $stmt = $this->db->prepare("
            UPDATE productos SET stock = stock + :cantidad WHERE id = :id
        ");
        return $stmt->execute([':cantidad' => $cantidad, ':id' => $id]);
    }

    /** Elimina un producto (solo si no tiene movimientos) */
    public function eliminar(int $id): bool {
        $stmt = $this->db->prepare("DELETE FROM productos WHERE id = :id");
        return $stmt->execute([':id' => $id]);
    }

    /** Total de productos registrados */
    public function contarTotal(): int {
        return (int) $this->db->query("SELECT COUNT(*) FROM productos")->fetchColumn();
    }

    /** Valor total del inventario a precio de venta */
    public function valorInventario(): float {
        return (float) $this->db->query("SELECT COALESCE(SUM(precio_venta * stock), 0) FROM productos")->fetchColumn();
    }
}
