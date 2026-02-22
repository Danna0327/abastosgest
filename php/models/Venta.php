<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/Producto.php';

class Venta {
    private PDO $db;
    private Producto $productoModel;

    public function __construct() {
        $this->db = Database::getInstance();
        $this->productoModel = new Producto();
    }

    /** Obtiene ventas con sus ítems (últimas N) */
    public function getAll(int $limite = 100): array {
        $stmt = $this->db->prepare("
            SELECT v.*, 
                   json_agg(json_build_object(
                       'producto', p.nombre,
                       'cantidad', dv.cantidad,
                       'precio_unitario', dv.precio_unitario,
                       'subtotal', dv.subtotal
                   )) AS items
            FROM ventas v
            LEFT JOIN detalle_venta dv ON dv.venta_id = v.id
            LEFT JOIN productos p ON p.id = dv.producto_id
            GROUP BY v.id
            ORDER BY v.fecha DESC
            LIMIT :limite
        ");
        $stmt->bindValue(':limite', $limite, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    /** Últimas 5 ventas para el dashboard */
    public function getUltimas(int $n = 5): array {
        $stmt = $this->db->prepare("
            SELECT v.id, v.fecha, v.total, v.cliente, v.metodo_pago,
                   COUNT(dv.id) AS num_productos
            FROM ventas v
            LEFT JOIN detalle_venta dv ON dv.venta_id = v.id
            GROUP BY v.id
            ORDER BY v.fecha DESC
            LIMIT :n
        ");
        $stmt->bindValue(':n', $n, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    /** Total de ventas del día actual */
    public function totalHoy(): float {
        $result = $this->db->query("
            SELECT COALESCE(SUM(total), 0) FROM ventas
            WHERE DATE(fecha) = CURRENT_DATE
        ")->fetchColumn();
        return (float) $result;
    }

    /** Número de ventas del día */
    public function countHoy(): int {
        return (int) $this->db->query("
            SELECT COUNT(*) FROM ventas WHERE DATE(fecha) = CURRENT_DATE
        ")->fetchColumn();
    }

    /**
     * Registra una venta completa con transacción:
     * 1. Inserta en ventas
     * 2. Inserta cada ítem en detalle_venta
     * 3. Descuenta stock de cada producto
     */
    public function registrar(array $venta, array $items): array {
        try {
            $this->db->beginTransaction();

            // Calcular total desde los ítems para evitar manipulación frontend
            $total = 0;
            foreach ($items as $item) {
                $total += $item['cantidad'] * $item['precio_unitario'];
            }

            // Insertar cabecera de venta
            $stmt = $this->db->prepare("
                INSERT INTO ventas (total, cliente, metodo_pago, notas)
                VALUES (:total, :cliente, :metodo_pago, :notas)
                RETURNING id
            ");
            $stmt->execute([
                ':total'       => $total,
                ':cliente'     => $venta['cliente'] ?? 'Cliente General',
                ':metodo_pago' => $venta['metodo_pago'] ?? 'efectivo',
                ':notas'       => $venta['notas'] ?? null,
            ]);
            $ventaId = $stmt->fetchColumn();

            // Insertar cada ítem y descontar stock
            $stmtDetalle = $this->db->prepare("
                INSERT INTO detalle_venta (venta_id, producto_id, cantidad, precio_unitario, subtotal)
                VALUES (:venta_id, :producto_id, :cantidad, :precio_unitario, :subtotal)
            ");

            foreach ($items as $item) {
                $subtotal = $item['cantidad'] * $item['precio_unitario'];

                // Verificar stock disponible antes de continuar
                $stockOk = $this->productoModel->descontarStock(
                    (int)$item['producto_id'],
                    (int)$item['cantidad']
                );

                if (!$stockOk) {
                    $this->db->rollBack();
                    return ['ok' => false, 'msg' => 'Stock insuficiente para uno o más productos'];
                }

                $stmtDetalle->execute([
                    ':venta_id'       => $ventaId,
                    ':producto_id'    => $item['producto_id'],
                    ':cantidad'       => $item['cantidad'],
                    ':precio_unitario'=> $item['precio_unitario'],
                    ':subtotal'       => $subtotal,
                ]);
            }

            $this->db->commit();
            return ['ok' => true, 'id' => $ventaId, 'total' => $total];

        } catch (PDOException $e) {
            $this->db->rollBack();
            error_log('Venta error: ' . $e->getMessage());
            return ['ok' => false, 'msg' => 'Error al registrar la venta'];
        }
    }
}
