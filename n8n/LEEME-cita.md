# Cita de reparación: cómo activarla

Flujo: `CICLO_cita_web.json` («CICLO · Cita web»). La web manda la cita, n8n comprueba que el hueco esté libre, la apunta en una hoja de Google y envía el correo de confirmación.

## Pasos
1. **Crear la hoja.** En Google Sheets, un archivo nuevo con una pestaña llamada exactamente `Citas` y esta primera fila (en minúsculas, en este orden):
   `fecha | hora | nombre | correo | modelo | problema | fase | creado`
   Consejo: selecciona las columnas A y B, Formato > Número > **Texto sin formato**, para que Sheets no convierta `10:00` ni la fecha en otro formato (el flujo las compara como texto).
2. **Importar el flujo.** En n8n: Workflows > Import from file > `CICLO_cita_web.json`.
3. **Conectar cuentas.** Los nodos «Leer citas» y «Apuntar en la hoja» piden una cuenta de Google Sheets; «Confirmar por correo», una de Gmail. El archivo no lleva credenciales.
4. **Elegir la hoja.** En esos dos nodos de Sheets, cambia `PEGA_AQUÍ_LA_URL_DE_LA_HOJA_DE_CITAS` por la URL de tu hoja (o elígela de la lista).
5. **Activar** el flujo (interruptor Active). La URL de producción será `https://uiemmc.app.n8n.cloud/webhook/ciclo-cita`.
6. **Pegar la URL en la web.** En `index.html`, `CONEXIONES.webhookCita`. Mientras esté vacía, la web avisa de que las citas aún no están activas y no envía nada.

## Cómo responde
- `200 { ok: true }`: cita apuntada y correo enviado.
- `409`: ese hueco ya estaba cogido (la web pide elegir otra hora).
- `400`: faltan datos, el correo no es válido, el hueco no existe o no hay consentimiento.

## Fases del CRM
Toda cita entra con `fase = Agendado`. Las fases «Propuesta enviada» y «Aceptado» se cambian a mano en la hoja (menú desplegable: Datos > Validación de datos).

## Ajustes
- Días con cita, horario y festivos: constantes al principio de `cita.js` (`DIAS_LABORABLES`, `FRANJAS`, `FESTIVOS`). Si cambias el horario, cambia también la expresión regular de la hora en el nodo «¿Datos válidos…?».
- Límite: dos peticiones a la vez para el mismo hueco podrían colarse las dos; para un proyecto con poco tráfico es aceptable.
