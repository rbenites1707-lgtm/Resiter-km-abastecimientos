# 🚛 Resiter Perú — Sistema de Control de Flota
**Versión 1.0 | Supervisor de Monitoreo y Control**

---

## 📁 Estructura del proyecto

```
resiter/
├── index.html      → Estructura HTML completa (todos los módulos)
├── styles.css      → Estilos visuales (tema industrial, responsive)
├── data.js         → Datos maestros: flota, conductores, mantenimiento
├── app.js          → Lógica principal + zona de mejoras
└── README.md       → Esta guía
```

---

## 🚀 Cómo usar

### Opción 1 — Abrir directo (sin servidor)
Abre `index.html` directamente en tu navegador (Chrome, Edge o Firefox).
> **Nota:** El Asistente IA requiere conexión a internet para conectarse a la API de Claude.

### Opción 2 — Con servidor local (recomendado)
```bash
# Con Python
python -m http.server 8080
# Abre http://localhost:8080

# Con Node.js (npx)
npx serve .
# Abre http://localhost:3000
```

### Opción 3 — Hospedar en servidor web
Sube los 4 archivos a cualquier servidor web (Apache, Nginx, IIS).
No requiere backend — es 100% frontend.

---

## 🏗️ Módulos del sistema

| Módulo | Descripción |
|---|---|
| 📊 Dashboard | Métricas en tiempo real, rendimiento, alertas |
| 📷 Odómetro | Captura con cámara, OCR automático, validación manual |
| ⛽ Abastecimiento | Manual o carga masiva Excel/CSV |
| 📋 Historial | Todos los registros con filtros y exportación |
| 🚛 Maestro | 181 unidades con División y CECO editables |
| 👤 Conductores | Gestión, licencias, asignación de unidades |
| 🔧 Mantenimiento | Programación por KM y fecha con alertas |
| 📂 Documentos | SOAT, RT, pólizas con alertas de vencimiento |
| 🗺️ Rutas y viajes | KM programados vs reales por viaje |
| 📍 Zonas / CECO | Distribución de flota por zona geográfica |
| 📈 Comparativo | Rendimiento por marca, división, CECO, año |
| 📄 Reportes | Ejecutivo, rendimiento, documentos, rutas |
| ✨ Asistente IA | Análisis inteligente powered by Claude |

---

## 📊 Datos de la flota

El archivo `data.js` contiene las **181 unidades reales** de Resiter Perú con:
- Placa, marca, año, combustible, GPS
- Estado actual (EN USO / EN REPARACION / COMISARIA / POR ENTREGAR)
- División y CECO de asignación
- Historial de reasignaciones

### Divisiones
- **Administracion** — 8 unidades
- **Aguas** — 7 unidades  
- **Hidro carburos** — 1 unidad (Petroperu lote 192)
- **Industrial** — 43 unidades (Lima, Chiclayo, Piura, Pisco, Talara, CNPC...)
- **Mineria** — 122 unidades (Antamina, Chinalco, Las Bambas, San Gabriel...)

---

## ➕ Cómo agregar mejoras

### Agregar un nuevo módulo

1. **En `index.html`** — Agrega el botón en el sidebar:
```html
<button class="nav-item" data-tab="mi_modulo">
  <span class="nav-icon">🆕</span> Mi módulo
</button>
```

2. **En `index.html`** — Agrega el contenido del tab:
```html
<div class="tab-c" id="tab-c-mi_modulo">
  <div class="page-header">
    <h1>Mi módulo</h1>
    <p>Descripción del módulo</p>
  </div>
  <div class="card">
    <!-- Contenido aquí -->
  </div>
</div>
```

3. **En `app.js`** — Agrega el título en `TAB_TITLES`:
```javascript
const TAB_TITLES = {
  // ... existentes ...
  mi_modulo: 'Mi módulo'
};
```

4. **En `app.js`** — Agrega el render en `goTab()`:
```javascript
if (t === 'mi_modulo') renderMiModulo();
```

5. **En `app.js`** (zona de mejoras al final) — Agrega la lógica:
```javascript
function renderMiModulo() {
  // Tu código aquí
}
```

### Agregar una unidad nueva

En `data.js`, al array `FLEET_RAW` agrega una línea:
```javascript
[285, 'NUE-VAP', 'Toyota', 2025, 'DIESEL', 'CLS', 'EN USO', 'Mineria', 'Antamina'],
```
Formato: `[n, placa, marca, anio, combustible, gps, estado, division, ceco]`

### Agregar un conductor

En `data.js`, al array `conductores` agrega:
```javascript
{ id:11, nombre:'Apellido, Nombre', dni:'12345678', lic:'A-IIb', venc:'2026-12-31',
  tel:'999888777', div:'Mineria', unidad:'NUE-VAP', estado:'Activo' },
```

---

## 🔧 Configuración del Asistente IA

El asistente usa la API de **Claude (Anthropic)**. Para que funcione:

1. La app ya está configurada para conectarse a `https://api.anthropic.com/v1/messages`
2. Si usas un backend propio, modifica la URL en `app.js` función `sendIA()`:
```javascript
const res = await fetch('https://TU-BACKEND.com/api/chat', { ... });
```
3. Para uso en producción, **nunca expongas tu API key en el frontend**.
   Usa un proxy backend (Node.js, Python Flask, etc.)

### Ejemplo de proxy Node.js simple
```javascript
// proxy.js
const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

app.post('/api/chat', async (req, res) => {
  const response = await axios.post('https://api.anthropic.com/v1/messages', req.body, {
    headers: {
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json'
    }
  });
  res.json(response.data);
});

app.listen(3000);
```

---

## 📤 Exportaciones disponibles

| Módulo | Formato | Nombre de archivo |
|---|---|---|
| Historial | CSV | `historial_resiter.csv` |
| Maestro | CSV | `maestro_resiter.csv` |
| Conductores | CSV | `conductores_resiter.csv` |
| Documentos | CSV | `documentos_resiter.csv` |
| Rutas | CSV | `rutas_resiter.csv` |
| Reporte ejecutivo | TXT | `reporte_resiter_ejecutivo_FECHA.txt` |
| Reporte rendimiento | TXT + CSV | `reporte_resiter_rendimiento_FECHA.txt` |
| Plantilla abastecimiento | CSV | `plantilla_abastecimiento_resiter.csv` |

---

## 🎨 Personalización visual

En `styles.css`, modifica las variables CSS en `:root`:
```css
:root {
  --primary:   #1B4FD8;   /* Color principal (azul) */
  --success:   #16A34A;   /* Verde */
  --warning:   #D97706;   /* Naranja */
  --danger:    #DC2626;   /* Rojo */
  --sidebar-bg: #0D1526;  /* Fondo del sidebar */
}
```

---

## 📱 Soporte móvil

La app es **responsive** y funciona en celulares:
- En pantallas < 768px el sidebar se oculta automáticamente
- El botón ☰ abre/cierra el menú lateral
- Las tablas tienen scroll horizontal
- La captura de odómetro usa la cámara trasera del celular

---

## 🔐 Seguridad (para producción)

Para desplegar en producción se recomienda:
- [ ] Agregar autenticación de usuarios (login)
- [ ] Usar una base de datos (PostgreSQL, MySQL, SQLite)
- [ ] Configurar HTTPS
- [ ] Mover la API key de Claude a variables de entorno del servidor
- [ ] Agregar logs de auditoría por usuario

---

## 🗺️ Roadmap de mejoras sugeridas

- [ ] **Base de datos real** — Conectar a SQLite o PostgreSQL
- [ ] **Multi-usuario** — Login por supervisor/conductor/admin
- [ ] **OCR real** — Integrar Google Vision API para leer odómetros
- [ ] **GPS en tiempo real** — Integrar con CLS/HUNTER/RRV APIs
- [ ] **Notificaciones** — Alertas por email/WhatsApp al vencer documentos
- [ ] **App móvil** — PWA instalable en celular
- [ ] **Dashboard por CECO** — Vista específica por cliente/proyecto
- [ ] **Control de combustible por proveedor** — Análisis de grifos
- [ ] **Presupuesto vs ejecutado** — Control de costos mensuales
- [ ] **Integración GPS** — Importar recorridos automáticamente

---

## 📞 Soporte

Sistema desarrollado para **Resiter Perú**  
Supervisor de Monitoreo y Control  
Versión 1.0 — Mayo 2025
