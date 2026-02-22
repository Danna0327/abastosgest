<?php
/**
 * AbastosGest — Front Controller
 * Enruta peticiones al controlador correcto y protege rutas con sesión.
 */

require_once __DIR__ . '/config/app.php';
require_once __DIR__ . '/config/database.php';

// Crear tabla usuarios e insertar admin por defecto si no existe
require_once __DIR__ . '/models/Usuario.php';
try {
    $usuarioModel = new Usuario();
    $usuarioModel->crearTablaSiNoExiste();
    $usuarioModel->crearAdminPorDefecto();
} catch (Exception $e) {
    error_log('Init error: ' . $e->getMessage());
}

$modulo = preg_replace('/[^a-z]/', '', strtolower($_GET['mod']    ?? 'dashboard'));
$accion = preg_replace('/[^a-z]/', '', strtolower($_GET['accion'] ?? 'index'));

$rutasPublicas = ['login'];

if (empty($_SESSION['usuario']) && !in_array($modulo, $rutasPublicas)) {
    header('Location: index.php?mod=login');
    exit;
}

$productosAlertaCount = 0;
if (!empty($_SESSION['usuario'])) {
    try {
        $db = Database::getInstance();
        $productosAlertaCount = (int) $db->query(
            "SELECT COUNT(*) FROM productos WHERE stock <= stock_minimo"
        )->fetchColumn();
    } catch (Exception $e) {}
}

$rutas = [
    'login'       => ['controller' => 'AuthController',        'acciones' => ['index', 'post', 'logout']],
    'dashboard'   => ['controller' => 'DashboardController',   'acciones' => ['index']],
    'inventario'  => ['controller' => 'InventarioController',  'acciones' => ['index', 'guardar', 'eliminar']],
    'ventas'      => ['controller' => 'VentasController',      'acciones' => ['index', 'registrar']],
    'compras'     => ['controller' => 'ComprasController',     'acciones' => ['index', 'registrar']],
    'proveedores' => ['controller' => 'ProveedoresController', 'acciones' => ['index', 'guardar', 'eliminar']],
];

if (!isset($rutas[$modulo])) { $modulo = 'dashboard'; $accion = 'index'; }
$ruta = $rutas[$modulo];
if (!in_array($accion, $ruta['acciones'])) { $accion = 'index'; }

$metodosAuth = ['index' => 'loginForm', 'post' => 'loginPost', 'logout' => 'logout'];

$controladorNombre = $ruta['controller'];
require_once __DIR__ . '/controllers/' . $controladorNombre . '.php';
$controlador = new $controladorNombre();
$metodo = ($controladorNombre === 'AuthController') ? ($metodosAuth[$accion] ?? 'loginForm') : $accion;
$controlador->$metodo();
