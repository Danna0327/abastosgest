<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/Producto.php';

class Compra {
    private PDO $db;
    private Producto $productoModel;

    public function __construct() {
        $this->db = Database::getInstance();
        $this->productoModel = new Producto();
    }

    public function getAll(int $limite = 100): array {
        $stmt = $this->db->prepare("
            SELECT c.*, pr.nombre AS proveedor_nombre,
                   COUNT(dc.id) AS num_productos
            FROM compras c
            LEFT JOIN proveedores pr ON pr.id = c.proveedor_id
            LEFT JOIN detalle_compra dc ON dc.compra_id = c.id
            GROUP BY c.id, pr.nombre
            ORDER BY c.fecha DESC
            LIMIT :limite
        ");
        $stmt->bindValue(':limite', $limite, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    /**
     * Registra una compra y actualiza el inventario automáticamente
     */
    public function registrar(array $compra, array $items): array {
        try {
            $this->db->beginTransaction();

            $total = 0;
            foreach ($items as $item) {
                $total += $item['cantidad'] * $item['precio_unitario'];
            }

            $stmt = $this->db->prepare("
                INSERT INTO compras (proveedor_id, total, notas)
                VALUES (:proveedor_id, :total, :notas)
                RETURNING id
            ");
            $stmt->execute([
                ':proveedor_id' => !empty($compra['proveedor_id']) ? $compra['proveedor_id'] : null,
                ':total'        => $total,
                ':notas'        => $compra['notas'] ?? null,
            ]);
            $compraId = $stmt->fetchColumn();

            $stmtDetalle = $this->db->prepare("
                INSERT INTO detalle_compra (compra_id, producto_id, cantidad, precio_unitario, subtotal)
                VALUES (:compra_id, :producto_id, :cantidad, :precio_unitario, :subtotal)
            ");

            foreach ($items as $item) {
                $subtotal = $item['cantidad'] * $item['precio_unitario'];

                $stmtDetalle->execute([
                    ':compra_id'      => $compraId,
                    ':producto_id'    => $item['producto_id'],
                    ':cantidad'       => $item['cantidad'],
                    ':precio_unitario'=> $item['precio_unitario'],
                    ':subtotal'       => $subtotal,
                ]);

                // Sumar al inventario
                $this->productoModel->sumarStock((int)$item['producto_id'], (int)$item['cantidad']);
            }

            $this->db->commit();
            return ['ok' => true, 'id' => $compraId, 'total' => $total];

        } catch (PDOException $e) {
            $this->db->rollBack();
            error_log('Compra error: ' . $e->getMessage());
            return ['ok' => false, 'msg' => 'Error al registrar la compra'];
        }
    }
}
