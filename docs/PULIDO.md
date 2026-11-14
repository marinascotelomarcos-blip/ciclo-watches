# Pulido final (rama feat/pulido)

## Qué se ha cambiado
- **Imagen para compartir** `img/og-ciclo.png` (1200x630, 235 KB): foto de portada, logo, lema y el anillo lima. Montada con HTML y captura de Chrome. La tipografía es la de sistema (Arial Black), no Unbounded, porque no está instalada en el Mac y no quise bajarla.
- **Metadatos** en `index.html` y `privacidad.html`: canonical, theme-color, og:* (locale es_ES, imagen con alt y tamaño), twitter:card summary_large_image. La privacidad también lleva apple-touch-icon. URL: https://marinascotelomarcos-blip.github.io/ciclo-watches/
- **Botón del asistente**: en tablet y móvil (hasta 900 px) el pie de página tiene 104 px de margen inferior, así el botón flotante (80 px) no tapa el texto final.
- **Marco dentro de marco**: ya estaba resuelto por CSS (las fotos de las piezas van a sangre en la tarjeta; medido: tocan los bordes). Queda un matiz: algunos originales traen fondo muy oscuro propio; solo se arregla con foto nueva.
- **Calidad**: contraste del número de cada paso (de #5F605D a #A3A39E sobre la tarjeta), enlace «Saltar al contenido» (solo visible con teclado), enlace a Privacidad en el pie, `prefers-reduced-motion` ampliado (popup, asistente, fotos). `lang="es"`, `alt` en todas las imágenes, jerarquía h1 > h2 > h3 y `rel="noopener"` en el único enlace externo ya estaban bien.
- `robots.txt` y `sitemap.xml` (index y privacidad).

## Pesos de imagen
Todas las fotos de `img/fotos/` pesan menos de 80 KB (la mayor, la portada, 78 KB). Pero la portada solo mide 480x565 px: se ve blanda en pantallas grandes y en la imagen para compartir.

## Pendiente
- Fotos propias definitivas (portada en alta resolución, una por modelo, materiales de plástico y madera, según `marca/RECURSOS_VISUALES_CICLO.md`). Cuando lleguen, rehacer `og-ciclo.png`.
- Opcional: rehacer la og con la tipografía Unbounded.
- Revisar en un móvil real y con el enlace ya publicado (los previews de WhatsApp/LinkedIn cachean la imagen).

---

# Arreglos finales (rama web-arreglos, 2026-11-14)

## Hecho
- **Ilustración B4** (`trazabilidad.html`): el .webp traía el recorte pintado en la propia imagen (los círculos de Mar y Tierra ya salían cortados), no se arreglaba con CSS. Rehecha como SVG (`img/recursos/B4-ciclo-material.svg`): fondo oscuro, acento lima, los cuatro pasos (Mar, Tierra, Materiales, Tu muñeca) con flechas en ciclo. Comprobado completa. El .webp antiguo queda en la carpeta sin uso.
- **Festivos del selector** (`cita.js`): los de A Coruña ciudad son 8 dic, 25 dic, 1 ene y 6 ene (nacionales y de Galicia; fuentes en el comentario: DOG 20-06-2025 y DOG 02-07-2026). El 1 nov y el 6 dic de 2026 caen en domingo y Galicia no los pasa a lunes. Los locales de A Coruña (2026: 17 feb y 7 oct; 2027: 9 feb y 24 jun) caen fuera de nov-ene. La lista queda igual que la de ejemplo, ahora confirmada. Ojo: los locales de 2026 los saqué de un resumen de la nota de la Xunta, no del anexo del DOG; no afectan al rango.
- **Menú con los 6 enlaces**: `configurador.html` no tenía «Trazabilidad» y `trazabilidad.html` no tenía «Diseña el tuyo». Arreglado; las dos tienen ya los 6 en escritorio y en el menú móvil.

## Revisión visual (index, configurador, trazabilidad, privacidad × 1440/1280/1024/768/430/360)
- Sin desborde horizontal, sin imágenes rotas, sin 404 ni errores en consola; el menú móvil abre y muestra los 6 enlaces dentro de la pantalla.
- `:focus-visible` definido en las 4 páginas (anillo lima).
- No probado: móvil real, lector de pantalla y recorrido completo con Tab en cada página.
- `privacidad.html` no tiene menú propio (solo enlace de vuelta); no lo he cambiado.

## Sin decidir (propuestas, no cambiadas)
- En móvil el resumen del configurador va encima de las opciones; podría ir debajo o fijo abajo.
- Las correas de algodón y cuero comparten foto; hace falta foto propia de cada una.
