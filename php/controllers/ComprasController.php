<?php
require_once __DIR__ . '/../models/Compra.php';
require_once __DIR__ . '/../models/Producto.php';
require_once __DIR__ . '/../models/Proveedor.php';

class ComprasController {
    private Compra $compraModel;
    private Producto $productoModel;
    private Proveedor $proveedorModel;

    public function __construct() {
        $this->compraModel   = new Compra();
        $this->productoModel = new Producto();
        $this->proveedorModel = new Proveedor();
    }

    public function index(): void {
        $compras     = $this->compraModel->getAll();
        $productos   = $this->productoModel->getAll();
        $proveedores = $this->proveedorModel->getAll();
        require __DIR__ . '/../views/compras/index.php';
    }

    public function registrar(): void {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            header('Location: index.php?mod=compras');
            exit;
        }

        $itemsJson = $_POST['items'] ?? '[]';
        $items = json_decode($itemsJson, true);

        if (empty($items)) {
            $_SESSION['errores'] = ['Debe agregar al menos un producto a la compra'];
            header('Location: index.php?mod=compras');
            exit;
        }

        $compra = [
            'proveedor_id' => !empty($_POST['proveedor_id']) ? (int)$_POST['proveedor_id'] : null,
            'notas'        => htmlspecialchars(trim($_POST['notas'] ?? ''), ENT_QUOTES, 'UTF-8'),
        ];

        $itemsSanitizados = [];
        foreach ($items as $item) {
            if (empty($item['producto_id']) || empty($item['cantidad'])) continue;
            $itemsSanitizados[] = [
                'producto_id'    => (int)$item['producto_id'],
                'cantidad'       => (int)$item['cantidad'],
                'precio_unitario'=> (float)$item['precio_unitario'],
            ];
        }

        $resultado = $this->compraModel->registrar($compra, $itemsSanitizados);

        if ($resultado['ok']) {
            $_SESSION['msg'] = "Compra #{$resultado['id']} registrada — Total: $" . number_format($resultado['total'], 2);
        } else {
            $_SESSION['errores'] = [$resultado['msg']];
        }

        header('Location: index.php?mod=compras');
        exit;
    }
}
