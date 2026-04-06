# PorterOS — Sistema de Gestión para Conserjes de Edificios

## ¿Qué es?

PorterOS es un sistema digital que reemplaza el libro de conserjería tradicional. Corre en una tablet en la recepción del edificio y le permite al conserje gestionar paquetes, visitas, comunicaciones con residentes y operaciones del edificio desde una sola app.

## ¿Qué problema resuelve?

Hoy los conserjes usan un cuaderno de papel, WhatsApp personal y llamadas por citófono para coordinar todo. Esto genera:
- Paquetes que se pierden o no se notifican
- Sin registro de quién retiró qué
- Sin trazabilidad de visitas
- Comunicación informal y desordenada con residentes
- Sin datos para la administración del edificio

## ¿Cómo funciona?

### Para el conserje (tablet en recepción):

**Paquetes**
- Llega un paquete → el conserje selecciona tipo (paquete, comida, supermercado, encomienda), departamento y proveedor
- El sistema notifica automáticamente al residente por WhatsApp con botones de respuesta rápida ("Ya bajo" / "Más tarde")
- Si el depto prefiere citófono, el sistema le indica al conserje que llame por citófono
- Cuando el residente retira, se registra quién retiró con confirmación visual
- Los paquetes se agrupan por departamento con badges de estado (enviado, avisado, leído, respondió)

**Visitas**
- El conserje registra nombre, departamento, tipo de visita (personal, empleada, mantención)
- Si viene en auto: registra patente y estacionamiento asignado
- Los estacionamientos de visita muestran disponibilidad en tiempo real
- Al retirarse la visita, el estacionamiento se libera automáticamente

**Mensajes WhatsApp**
- Vista tipo WhatsApp Web con todas las conversaciones con residentes
- Mensajes entrantes del residente aparecen en tiempo real
- El conserje ve si el residente respondió algo que requiere atención
- Historial completo de comunicaciones por departamento

**Lobby TV**
- Pantalla para el público que muestra qué departamentos tienen paquetes pendientes
- Se actualiza en tiempo real cuando llegan o se retiran paquetes
- Diseño oscuro, legible a distancia

### Para el administrador del edificio:

**Panel de configuración**
- Gestión de residentes por departamento (nombre, teléfono, preferencias)
- Gestión de conserjes (activos/inactivos)
- Proveedores configurables por tipo
- Estacionamientos de visita configurables
- Configuración del edificio (nombre, dirección, horarios, contacto emergencia)
- Estado de conexión WhatsApp

**QR para residentes**
- Se genera un QR para poner en el lobby
- Los residentes lo escanean y configuran su propio departamento:
  - Nombres de los residentes
  - Teléfono WhatsApp del departamento
  - Preferencia de contacto para paquetes (WhatsApp / citófono / llamada)
  - Preferencia de contacto para visitas
  - Empleada doméstica (nombre, horario)
  - Visitas frecuentes

## Diferenciadores

| Característica | PorterOS | Competencia típica |
|---|---|---|
| Notificación automática WhatsApp | ✅ Con botones de respuesta | ❌ Manual o email |
| Preferencia de contacto por tipo | ✅ Distinto para paquetes vs visitas | ❌ Un solo canal |
| Auto-configuración del residente | ✅ QR en el lobby | ❌ Admin carga todo |
| Estacionamiento de visitas | ✅ Patente + spot en tiempo real | ❌ Cuaderno |
| Lobby TV en tiempo real | ✅ Pantalla pública actualizada | ❌ No existe |
| Funciona sin internet | ✅ Modo offline con sincronización | ❌ Se cae |
| Comando de voz | ✅ Dictado por voz en español | ❌ Solo teclado |

## Tecnología

- **App web progresiva (PWA)** — corre en cualquier tablet con Chrome, sin instalar desde App Store
- **WhatsApp Business API** — mensajes profesionales con templates aprobados por Meta
- **Base de datos en la nube** — Supabase (PostgreSQL) con actualizaciones en tiempo real
- **Actualizaciones instantáneas** — se despliega y todos los edificios reciben la versión nueva sin hacer nada

## Modelo de escalamiento

El sistema está diseñado para servir múltiples edificios desde una sola plataforma:
- Cada edificio tiene su propia configuración, residentes y datos
- Aislamiento completo entre edificios (un conserje solo ve su edificio)
- Un solo número WhatsApp por edificio o compartido
- Costo de infraestructura por edificio: ~$30 USD/mes (WhatsApp) + plan compartido de base de datos

## Costos operativos por edificio

| Concepto | Costo mensual |
|---|---|
| WhatsApp (50 paquetes/día) | ~$30 USD |
| Base de datos (Supabase compartida) | ~$0.50 USD |
| Hosting (Vercel compartido) | ~$0.40 USD |
| **Total infraestructura** | **~$31 USD/mes** |

El costo dominante es WhatsApp ($0.02 por conversación utility). A mayor volumen, se puede negociar con Meta.

## Estado actual

### Funcionando ✅
- Gestión completa de paquetes con notificación WhatsApp
- 6 templates de mensajes aprobados por Meta (con emojis y botones)
- Gestión de visitas con patentes y estacionamientos
- Chat bidireccional con residentes (el residente responde, el conserje lo ve)
- Panel de administración completo
- Auto-configuración del residente via QR
- Lobby TV en tiempo real
- Modo offline básico (funciona si se cae internet temporalmente)
- Comando de voz para registro rápido

### Próximos pasos
- Reserva de espacios comunes (quincho, piscina, sala multiuso)
- Planificación de turnos de conserjes
- Seguimiento de mantenciones del edificio (calderas, ascensores, etc.)
- Multi-edificio con autenticación y roles
