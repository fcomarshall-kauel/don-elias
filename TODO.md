# PorterOS — Roadmap de Features

## En progreso
- [ ] Aprobación de templates WhatsApp (6 templates PENDING en Meta)

## Backlog prioritario

### 1. Offline-first (optimistic offline)
- Cache de datos en localStorage como respaldo del DataProvider
- Cola de operaciones pendientes (inserts/updates) que se sincronizan al volver internet
- WhatsApp se encola y envía cuando hay conexión
- Indicador visual "Sin conexión" en la UI
- Referencia: `src/providers/DataProvider.tsx`

### 2. Reserva de espacios comunes
- Tabla `common_spaces` (quincho, sala multiuso, piscina, etc.)
- Tabla `reservations` (espacio, depto, fecha, horario, estado)
- Calendario visual por espacio
- Reglas por espacio (máx horas, anticipación, limpieza entre reservas)
- Notificación WhatsApp de confirmación de reserva
- Vista admin para configurar espacios y reglas

### 3. Estacionamiento y patentes en visitas
- Campo `vehicle_plate` y `parking_spot` en tabla `visits`
- Registro de patente al ingresar visita con auto
- Mapa/lista de estacionamientos de visita disponibles
- Tabla `parking_spots` (número, tipo, estado)
- Alerta si el estacionamiento está ocupado
- Registro de patentes frecuentes por depto

### 4. Planificación de turnos de conserjes
- Tabla `shifts` (conserje, fecha, horario_inicio, horario_fin, tipo)
- Calendario mensual de turnos
- Turnos rotativos configurables (mañana/tarde/noche)
- Intercambio de turnos entre conserjes
- Vista de quién está de turno hoy/mañana
- Integración con el sistema de cambio de turno existente (`/turno`)

### 5. Mantenciones del edificio
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
- [ ] PWA manifest + service worker

## Completado ✅
- [x] WhatsApp Business API integration
- [x] Supabase migration (5 tablas)
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
- [x] DeliveryModal con confirmación animada
- [x] 6 templates WA con Quick Reply buttons
