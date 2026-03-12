# ▦ AbastosGest — Sistema de Gestión de Abarrotes

> Proyecto Final — Ingeniería en Sistemas de Información  
> Sistema web para la gestión integral del negocio familiar **Nancy Market**

---

## 🔗 Enlaces

| Recurso | URL |
|---------|-----|
| **Demo en producción** | https://abastosgest-production.up.railway.app |
| **Repositorio GitHub** | [https://github.com/Danna0327/abastosgest]|
| **Respaldo de Base de Datos** | [`scripts/001-create-tables.sql`](scripts/001-create-tables.sql) |
| **Datos de prueba** | [`scripts/002-seed-data.sql`](scripts/002-seed-data.sql) |

---

## 📋 Descripción del Proyecto

**AbastosGest** es un sistema de gestión web diseñado para el negocio familiar de abarrotes **Nancy Market**, especializado en productos de alta rotación (arroz, aceite, atún, azúcar, etc.).

Desarrollado como proyecto final universitario aplicando buenas prácticas de ingeniería de software:

- **Arquitectura MVC** (Model-View-Controller)
- **PHP 8.1+ orientado a objetos**
- **PostgreSQL** con relaciones normalizadas e integridad referencial
- **HTML5 semántico + CSS3 + JavaScript Vanilla**
- **Seguridad**: PDO con prepared statements, hash de contraseñas con `bcrypt`, sanitización de entradas, manejo de sesiones

---

## 🏗️ Estructura del Proyecto

```
/abastosgest
├── /config
│   ├── database.php      # Conexión PDO a PostgreSQL (patrón Singleton)
│   └── app.php           # Constantes globales y sesiones
├── /models
│   ├── Producto.php      # CRUD productos + control de stock
│   ├── Venta.php         # Registro de ventas con transacciones
│   ├── Compra.php        # Registro de compras con transacciones
│   ├── Proveedor.php     # CRUD proveedores
│   └── Usuario.php       # Autenticación con bcrypt
├── /views
│   ├── /auth             # Login
│   ├── /dashboard        # Panel principal con KPIs
│   ├── /inventario       # Tabla + modal CRUD
│   ├── /ventas           # Historial + carrito dinámico
│   ├── /compras          # Historial + registro con ítems
│   ├── /proveedores      # Tabla + modal CRUD
│   └── /partials         # Header y footer compartidos
├── /controllers
│   ├── AuthController.php
│   ├── DashboardController.php
│   ├── InventarioController.php
│   ├── VentasController.php
│   ├── ComprasController.php
│   └── ProveedoresController.php
├── /public
│   ├── /css/main.css     # Diseño dark mode tipo dashboard
│   └── /js/main.js       # Modales y utilidades
├── /scripts
│   ├── 001-create-tables.sql   # Esquema completo de la BD
│   └── 002-seed-data.sql       # Datos de prueba
├── /docs
│   ├── mapa-navegacion.html    # Mapa de navegación del sistema
│   └── wireframes.html         # Wireframes de las pantallas
└── index.php             # Front Controller / Router
```

---

## 🗄️ Base de Datos

### Estructura (PostgreSQL)

```sql
usuarios        -- Autenticación y roles (admin / vendedor)
proveedores     -- Directorio de proveedores
productos       -- Catálogo con precios y stock
ventas          -- Cabecera de cada transacción de venta
detalle_venta   -- Ítems de cada venta (FK → ventas, productos)
compras         -- Cabecera de cada orden de compra
detalle_compra  -- Ítems de cada compra (FK → compras, productos)
```

### Restaurar la base de datos

```bash
# Con psql (reemplaza con tus credenciales)
psql -h crossover.proxy.rlwy.net -U postgres -p 33184 -d railway \
  -f scripts/001-create-tables.sql

# Datos de prueba (opcional)
psql -h crossover.proxy.rlwy.net -U postgres -p 33184 -d railway \
  -f scripts/002-seed-data.sql
```

---

## ⚙️ Funcionalidades

### 🔐 Autenticación
- Login con email y contraseña
- Contraseñas hasheadas con `bcrypt`
- Sesiones PHP con regeneración de ID
- Protección de rutas privadas

### 📊 Dashboard
- Total de ventas del día
- Productos con stock bajo (alertas automáticas)
- Valor total del inventario
- Últimas 5 ventas registradas

### 📦 Inventario
- CRUD completo de productos
- Alerta visual cuando `stock ≤ stock_mínimo`
- Búsqueda en tiempo real

### 💰 Ventas
- Registro con múltiples productos (carrito JS)
- Cálculo automático de totales
- Descuento automático de stock con transacciones
- Historial completo

### 🛒 Compras
- Registro de compras a proveedores
- Suma automática al inventario
- Historial con totales

### 👥 Proveedores
- CRUD completo con validación de email

---

## 🚀 Despliegue en Railway

### Requisitos
- PHP 8.1+ con extensión `pdo_pgsql`
- PostgreSQL (incluido en Railway)

### Variables de entorno
Railway provee `DATABASE_URL` automáticamente al conectar el servicio de PostgreSQL.

### Pasos
1. Hacer fork o clonar este repositorio
2. Conectar el repo a Railway
3. Agregar un servicio **PostgreSQL** en el mismo proyecto
4. Railway asigna `DATABASE_URL` automáticamente
5. Ejecutar `scripts/001-create-tables.sql` en la consola de la BD

---

## 🔑 Credenciales por defecto

| Campo | Valor |
|-------|-------|
| Email | `admin@abastosgest.com` |
| Contraseña | `admin123` |

> ⚠️ Cambiar la contraseña después del primer ingreso en producción.

---

## 📐 Documentación

| Documento | Descripción |
|-----------|-------------|
| [`docs/mapa-navegacion.html`](docs/mapa-navegacion.html) | Mapa completo de navegación del sistema |
| [`docs/wireframes.html`](docs/wireframes.html) | Wireframes: Login, Dashboard, Módulos, Usuarios |

---

## 🛠️ Tecnologías

| Capa | Tecnología |
|------|-----------|
| Frontend | HTML5 semántico, CSS3, JavaScript Vanilla |
| Backend | PHP 8.1+ (OOP, MVC) |
| Base de Datos | PostgreSQL 17 |
| Hosting | Railway |
| Control de versiones | Git + GitHub |
| Tipografía | IBM Plex Sans + IBM Plex Mono |

---

## 👨‍💻 Autor

Desarrollado como **Proyecto Final** de la asignatura de Sistemas de Información  
Carrera de Ingeniería en Sistemas — 2026
