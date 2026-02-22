<?php
require_once __DIR__ . '/../models/Proveedor.php';

class ProveedoresController {
    private Proveedor $proveedorModel;

    public function __construct() {
        $this->proveedorModel = new Proveedor();
    }

    public function index(): void {
        $proveedores = $this->proveedorModel->getAll();
        require __DIR__ . '/../views/proveedores/index.php';
    }

    public function guardar(): void {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            header('Location: index.php?mod=proveedores');
            exit;
        }

        $data = $this->sanitizar($_POST);

        if (empty($data['nombre'])) {
            $_SESSION['errores'] = ['El nombre del proveedor es requerido'];
            header('Location: index.php?mod=proveedores');
            exit;
        }

        // Validar formato de email si se provee
        if (!empty($data['email']) && !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            $_SESSION['errores'] = ['El formato del correo electrónico no es válido'];
            header('Location: index.php?mod=proveedores');
            exit;
        }

        if (!empty($data['id'])) {
            $ok = $this->proveedorModel->actualizar((int)$data['id'], $data);
            $_SESSION['msg'] = $ok ? 'Proveedor actualizado' : 'Error al actualizar';
        } else {
            $ok = $this->proveedorModel->crear($data);
            $_SESSION['msg'] = $ok ? 'Proveedor registrado' : 'Error al registrar';
        }

        header('Location: index.php?mod=proveedores');
        exit;
    }

    public function eliminar(): void {
        $id = (int)($_GET['id'] ?? 0);
        if ($id > 0) {
            try {
                $ok = $this->proveedorModel->eliminar($id);
                $_SESSION['msg'] = $ok ? 'Proveedor eliminado' : 'No se pudo eliminar';
            } catch (PDOException $e) {
                $_SESSION['errores'] = ['No se puede eliminar: tiene productos o compras asociadas'];
            }
        }
        header('Location: index.php?mod=proveedores');
        exit;
    }

    private function sanitizar(array $data): array {
        return array_map(fn($v) => htmlspecialchars(trim((string)$v), ENT_QUOTES, 'UTF-8'), $data);
    }
}
