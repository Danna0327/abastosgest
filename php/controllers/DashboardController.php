<?php
require_once __DIR__ . '/../models/Producto.php';
require_once __DIR__ . '/../models/Venta.php';
require_once __DIR__ . '/../models/Proveedor.php';

class DashboardController {
    private Producto $productoModel;
    private Venta $ventaModel;
    private Proveedor $proveedorModel;

    public function __construct() {
        $this->productoModel  = new Producto();
        $this->ventaModel     = new Venta();
        $this->proveedorModel = new Proveedor();
    }

    public function index(): void {
        $totalProductos    = $this->productoModel->contarTotal();
        $valorInventario   = $this->productoModel->valorInventario();
        $productosAlerta   = $this->productoModel->getBajoStock();
        $ventasHoy         = $this->ventaModel->totalHoy();
        $numVentasHoy      = $this->ventaModel->countHoy();
        $ultimasVentas     = $this->ventaModel->getUltimas(5);
        $totalProveedores  = $this->proveedorModel->contarTotal();

        require __DIR__ . '/../views/dashboard/index.php';
    }
}
