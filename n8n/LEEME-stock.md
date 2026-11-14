# Stock del configurador desde Google Sheets

Flujo: `CICLO_stock_web.json` («CICLO · Stock web»). El configurador pide el stock a n8n, n8n lee la hoja «CICLO · Stock» y devuelve `{ ejemplo, actualizado, unidades: { id: n } }`.

## Hoja
Pestaña `Stock`, columnas `id | unidades | nota`, una fila por id (`one`, `bisel-oceano`, `trasera-cafe`, `bateria`…). Cambia el número de `unidades` y recarga el configurador: se refleja al momento (el flujo no guarda caché).

## Activar
1. n8n > Import from file > `CICLO_stock_web.json`; elige tu cuenta de Google Sheets en «Leer stock».
2. Pulsa **Publish**. URL: `https://uiemmc.app.n8n.cloud/webhook/ciclo-stock`.
3. Esa URL ya está en `CONEXIONES.urlStock` de `configurador.js`.

## Respaldo
Si el flujo falla, tarda más de 6 s o devuelve algo vacío, el configurador usa `data/stock.json`.

## CORS
Solo responde a `https://marinascotelomarcos-blip.github.io` y a `localhost`/`127.0.0.1` (cualquier puerto).
