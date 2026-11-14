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
