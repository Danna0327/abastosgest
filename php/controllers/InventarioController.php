<?php
require_once __DIR__ . '/../models/Producto.php';
require_once __DIR__ . '/../models/Proveedor.php';

class InventarioController {
    private Producto $productoModel;
    private Proveedor $proveedorModel;

    public function __construct() {
        $this->productoModel = new Producto();
        $this->proveedorModel = new Proveedor();
    }

    public function index(): void {
        $productos   = $this->productoModel->getAll();
        $proveedores = $this->proveedorModel->getAll();
        $bajoStock   = $this->productoModel->getBajoStock();
        require __DIR__ . '/../views/inventario/index.php';
    }

    public function guardar(): void {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            header('Location: index.php?mod=inventario');
            exit;
        }

        $data = $this->sanitizar($_POST);
        $errores = $this->validarProducto($data);

        if (!empty($errores)) {
            $_SESSION['errores'] = $errores;
            $_SESSION['form_data'] = $data;
            header('Location: index.php?mod=inventario');
            exit;
        }

        if (!empty($data['id'])) {
            $ok = $this->productoModel->actualizar((int)$data['id'], $data);
            $_SESSION['msg'] = $ok ? 'Producto actualizado correctamente' : 'Error al actualizar';
        } else {
            $ok = $this->productoModel->crear($data);
            $_SESSION['msg'] = $ok ? 'Producto registrado correctamente' : 'Error al registrar';
        }

        header('Location: index.php?mod=inventario');
        exit;
    }

    public function eliminar(): void {
        $id = (int)($_GET['id'] ?? 0);
        if ($id > 0) {
            try {
                $ok = $this->productoModel->eliminar($id);
                $_SESSION['msg'] = $ok ? 'Producto eliminado' : 'No se pudo eliminar';
            } catch (PDOException $e) {
                $_SESSION['errores'] = ['No se puede eliminar: el producto tiene movimientos registrados'];
            }
        }
        header('Location: index.php?mod=inventario');
        exit;
    }

    /** Sanitiza inputs del formulario */
    private function sanitizar(array $data): array {
        return array_map(fn($v) => htmlspecialchars(trim((string)$v), ENT_QUOTES, 'UTF-8'), $data);
    }

    /** Valida campos requeridos y tipos */
    private function validarProducto(array $data): array {
        $errores = [];
        if (empty($data['nombre'])) $errores[] = 'El nombre es requerido';
        if (!is_numeric($data['precio_compra'] ?? '') || $data['precio_compra'] < 0)
            $errores[] = 'Precio de compra inválido';
        if (!is_numeric($data['precio_venta'] ?? '') || $data['precio_venta'] < 0)
            $errores[] = 'Precio de venta inválido';
        if (!is_numeric($data['stock'] ?? '') || $data['stock'] < 0)
            $errores[] = 'Stock inválido';
        return $errores;
    }
}
