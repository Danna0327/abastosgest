<?php
require_once __DIR__ . '/../models/Venta.php';
require_once __DIR__ . '/../models/Producto.php';

class VentasController {
    private Venta $ventaModel;
    private Producto $productoModel;

    public function __construct() {
        $this->ventaModel   = new Venta();
        $this->productoModel = new Producto();
    }

    public function index(): void {
        $ventas    = $this->ventaModel->getAll();
        $productos = $this->productoModel->getAll();
        require __DIR__ . '/../views/ventas/index.php';
    }

    public function registrar(): void {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            header('Location: index.php?mod=ventas');
            exit;
        }

        // Los ítems vienen como JSON desde el frontend
        $itemsJson = $_POST['items'] ?? '[]';
        $items = json_decode($itemsJson, true);

        if (empty($items)) {
            $_SESSION['errores'] = ['Debe agregar al menos un producto a la venta'];
            header('Location: index.php?mod=ventas');
            exit;
        }

        $venta = [
            'cliente'     => htmlspecialchars(trim($_POST['cliente'] ?? 'Cliente General'), ENT_QUOTES, 'UTF-8'),
            'metodo_pago' => $_POST['metodo_pago'] ?? 'efectivo',
            'notas'       => htmlspecialchars(trim($_POST['notas'] ?? ''), ENT_QUOTES, 'UTF-8'),
        ];

        // Validar y sanitizar cada ítem
        $itemsSanitizados = [];
        foreach ($items as $item) {
            if (empty($item['producto_id']) || empty($item['cantidad']) || empty($item['precio_unitario'])) continue;
            $itemsSanitizados[] = [
                'producto_id'    => (int)$item['producto_id'],
                'cantidad'       => (int)$item['cantidad'],
                'precio_unitario'=> (float)$item['precio_unitario'],
            ];
        }

        $resultado = $this->ventaModel->registrar($venta, $itemsSanitizados);

        if ($resultado['ok']) {
            $_SESSION['msg'] = "Venta #{$resultado['id']} registrada — Total: $" . number_format($resultado['total'], 2);
        } else {
            $_SESSION['errores'] = [$resultado['msg']];
        }

        header('Location: index.php?mod=ventas');
        exit;
    }
}
