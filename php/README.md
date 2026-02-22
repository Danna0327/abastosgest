# AbastosGest — Sistema de Gestión de Abarrotes

Sistema web desarrollado con PHP OOP + PostgreSQL + MVC para la gestión de un negocio familiar de abarrotes.

## Requisitos del servidor
- PHP >= 8.1 con extensión `pdo_pgsql`
- PostgreSQL (Railway o local)
- Apache con `mod_rewrite` activado

## Estructura
```
/abastosgest
  /config          → Conexión BD y constantes
  /models          → Lógica de negocio y acceso a datos (PDO)
  /views           → Plantillas HTML/PHP
    /partials      → Header y footer compartidos
    /dashboard     → Vista del panel principal
    /inventario    → CRUD de productos
    /ventas        → Registro de ventas
    /compras       → Registro de compras
    /proveedores   → CRUD de proveedores
  /controllers     → Controladores MVC
  /public          → Assets estáticos (CSS, JS, img)
  index.php        → Front controller / router
```

## Instalación

1. **Subir archivos** al servidor (carpeta pública o subdirectorio)

2. **Configurar BD** en `config/database.php`:
   ```php
   define('DB_HOST', 'tu-host');
   define('DB_PORT', '5432');
   define('DB_NAME', 'railway');
   define('DB_USER', 'postgres');
   define('DB_PASS', 'tu-password');
   ```

3. **Crear las tablas** ejecutando el script SQL en tu PostgreSQL:
   - `scripts/001-create-tables.sql`
   - `scripts/002-seed-data.sql` (opcional, datos de prueba)

4. Acceder a `http://tu-dominio/abastosgest/`

## Seguridad implementada
- PDO con prepared statements en todas las queries
- Sanitización con `htmlspecialchars()` en todas las salidas
- Validación de entrada en frontend (HTML5) y backend (PHP)
- Enrutamiento seguro: solo acciones permitidas explícitamente
- `.htaccess` bloquea acceso directo a carpetas sensibles
- Transacciones de BD para ventas y compras (rollback en error)
