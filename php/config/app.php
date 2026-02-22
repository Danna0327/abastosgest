<?php
/**
 * Constantes globales de la aplicación
 */

define('APP_NAME', 'AbastosGest');
define('APP_VERSION', '1.0.0');
define('BASE_URL', '/abastosgest');
define('STOCK_ALERTA_COLOR', '#e74c3c');

// Nivel de stock bajo (porcentaje respecto al stock mínimo)
define('STOCK_BAJO_MULTIPLICADOR', 1.5);

session_start();
