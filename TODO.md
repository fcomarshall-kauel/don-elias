# PorterOS — Roadmap de Features

## En progreso
- [ ] Aprobación de templates WhatsApp (6 templates PENDING en Meta)

## En pruebas (implementado, pendiente testing completo)

### Offline-first
- [x] Cache localStorage como respaldo del DataProvider
- [x] Cola de operaciones pendientes (sync queue)
- [x] WhatsApp se encola offline y envía al reconectar
- [x] Indicador visual "Sin conexión" en todas las páginas
- [x] Service Worker con pre-cache de todas las rutas
- [x] PWA manifest para instalación como app
- [ ] **Probar**: refresh offline muestra datos del cache en todas las páginas
- [ ] **Probar**: lobby TV muestra paquetes en modo offline
- [ ] **Probar**: registrar paquete offline → reconectar → sincroniza a Supabase
- [ ] **Probar**: enviar WhatsApp offline → reconectar → WhatsApp se envía
- [ ] **Probar**: navegación entre páginas funciona offline (SW cache)
- [ ] **Probar**: banner "Sin conexión" aparece/desaparece correctamente
- [ ] **Probar**: instalar como PWA en tablet Android

### Estacionamiento y patentes
- [x] Campos `vehicle_plate` y `parking_spot` en tabla `visits`
- [x] Tabla `parking_spots` configurable
- [x] Toggle "¿Viene en auto?" en VisitDetailModal
- [x] Spots ocupados/disponibles en tiempo real
- [x] Patente visible en VisitCard
- [x] Admin `/admin/estacionamientos` con CRUD + ocupación live
- [ ] **Probar**: registrar visita con auto → patente + spot se guardan
- [ ] **Probar**: spot ocupado aparece rojo/deshabilitado
- [ ] **Probar**: checkout de visita → spot se libera
- [ ] **Probar**: admin: agregar/editar/eliminar spots

## Backlog prioritario

### 1. Reserva de espacios comunes
- Tabla `common_spaces` (quincho, sala multiuso, piscina, etc.)
- Tabla `reservations` (espacio, depto, fecha, horario, estado)
- Calendario visual por espacio
- Reglas por espacio (máx horas, anticipación, limpieza entre reservas)
- Notificación WhatsApp de confirmación de reserva
- Vista admin para configurar espacios y reglas

### 2. Planificación de turnos de conserjes
- Tabla `shifts` (conserje, fecha, horario_inicio, horario_fin, tipo)
- Calendario mensual de turnos
- Turnos rotativos configurables (mañana/tarde/noche)
- Intercambio de turnos entre conserjes
- Vista de quién está de turno hoy/mañana
- Integración con el sistema de cambio de turno existente (`/turno`)

### 3. Mantenciones del edificio
- Tabla `maintenance_items` (equipo, ubicación, tipo)
- Tabla `maintenance_logs` (item, fecha, tipo_servicio, proveedor, costo, próxima_fecha)
- Equipos: calderas, bombas, ascensores, extintores, generadores
- Calendario de mantenciones programadas
- Alertas de mantención próxima/vencida
- Historial por equipo con costos acumulados
- Adjuntar fotos/documentos de cada mantención
- Proveedor y contacto por mantención

## Infraestructura pendiente
- [ ] Multi-tenancy (ver `plans/scaleup.md`)
- [ ] Autenticación (Supabase Auth + roles admin/conserje/residente)
- [ ] Vinculación de dispositivo al edificio
- [ ] Subdominios por edificio (futuro)
- [ ] Recordatorio automático de paquetes (cron job)

## Completado ✅
- [x] WhatsApp Business API integration
- [x] Supabase migration (5 tablas + residents + concierges + providers + parking_spots)
- [x] Realtime (packages + messages)
- [x] Auto-notify post-registro con preferencia de contacto
- [x] Página /mensajes estilo WhatsApp Web
- [x] Mensajes entrantes (webhook → Supabase → Realtime → UI)
- [x] Tarjetas agrupadas por depto con badges WA
- [x] Panel admin (/admin) con CRUD completo
- [x] Auto-config residente via QR (/mi-depto)
- [x] Preferencias de contacto separadas (paquetes vs visitas)
- [x] Empleada doméstica + visitas frecuentes
- [x] DataProvider global (fetch once, navigate instant)
- [x] Lobby TV con Realtime
- [x] DeliveryModal con confirmación animada + timer auto-close
- [x] 6 templates WA con Quick Reply buttons
- [x] Estacionamiento y patentes en visitas
- [x] Offline-first (cache + sync queue + Service Worker + PWA)
