/* CICLO · configurador. Sin dependencias. */

/* ===== Conexiones (misma idea que en index.html) =====
   urlStock: URL de un flujo de n8n (webhook GET) que devuelva el mismo formato que data/stock.json:
   { "ejemplo": true, "unidades": { "one": 14, "pro": 0, ... } }. Vacía = se usa data/stock.json (datos de ejemplo). */
const CONEXIONES = {
  urlStock: "https://uiemmc.app.n8n.cloud/webhook/ciclo-stock"
};

/* ===== Catálogo real de la marca (precios en €) ===== */
const CATALOGO = {
  modelo: [
    { id: "one",   nombre: "CICLO One",       precio: 149, caja: "#3A3C3A", mano: "#D4F25C", correa: "#262826", nota: "El de todos los días" },
    { id: "sport", nombre: "CICLO One Sport", precio: 169, caja: "#3A3C3A", mano: "#F08A4B", correa: "#F08A4B", nota: "Para entrenar" },
    { id: "pro",   nombre: "CICLO Pro",       precio: 229, caja: "#5F605D", mano: "#7FD3C7", correa: "#262826", nota: "El más completo" },
    { id: "kids",  nombre: "CICLO Kids",      precio: 89,  caja: "#3A3C3A", mano: "#D4F25C", correa: "#7FD3C7", nota: "Para los peques" }
  ],
  bisel: [
    { id: "bisel-serie", nombre: "Bisel de serie", precio: 0, incluida: true },
    { id: "bisel-oceano", nombre: "Océano (plástico marino)", precio: 29, color: "#7FD3C7", corto: "Océano" },
    { id: "bisel-bosque", nombre: "Bosque (madera recuperada)", precio: 32, color: "#98734F", corto: "Bosque" },
    { id: "bisel-duna", nombre: "Duna (corcho)", precio: 30, color: "#C9B48A", corto: "Duna" },
    { id: "bisel-neumatico", nombre: "Neumático (caucho reciclado)", precio: 29, color: "#1F2020", corto: "Neumático" },
    { id: "bisel-cafe", nombre: "Café (posos prensados)", precio: 31, color: "#4B3326", corto: "Café" },
    { id: "bisel-cristal", nombre: "Cristal (vidrio reciclado)", precio: 31, color: "#7FB89A", corto: "Cristal" }
  ],
  trasera: [
    { id: "trasera-serie", nombre: "Trasera de serie", precio: 0, incluida: true },
    { id: "trasera-oceano", nombre: "Océano (plástico marino)", precio: 15, color: "#7FD3C7", corto: "Océano" },
    { id: "trasera-bosque", nombre: "Bosque (madera recuperada)", precio: 15, color: "#98734F", corto: "Bosque" },
    { id: "trasera-duna", nombre: "Duna (corcho)", precio: 15, color: "#C9B48A", corto: "Duna" },
    { id: "trasera-neumatico", nombre: "Neumático (caucho reciclado)", precio: 15, color: "#1F2020", corto: "Neumático" },
    { id: "trasera-cafe", nombre: "Café (posos prensados)", precio: 15, color: "#4B3326", corto: "Café" },
    { id: "trasera-cristal", nombre: "Cristal (vidrio reciclado)", precio: 15, color: "#7FB89A", corto: "Cristal" }
  ],
  correa: [
    { id: "correa-serie",    nombre: "Correa de serie",           precio: 0,  incluida: true },
    { id: "correa-algodon",  nombre: "Algodón reciclado",         precio: 19, color: "#D8CBB3", corto: "algodón reciclado" },
    { id: "correa-neopreno", nombre: "Neopreno reciclado",        precio: 22, color: "#4A5058", corto: "neopreno reciclado" },
    { id: "correa-cuero",    nombre: "Cuero vegano",              precio: 25, color: "#8A5A3C", corto: "cuero vegano" }
  ],
  extra: [
    { id: "bateria",        nombre: "Batería de recambio",   precio: 18 },
    { id: "kit-reparacion", nombre: "Kit de reparación",     precio: 15 }
  ]
};

const eur = n => n.toLocaleString("es-ES") + " €";
const $ = id => document.getElementById(id);
const POCO = 5; // por debajo de este número de unidades se avisa de "Quedan pocas"

let stock = {};           // { id: unidades } ; lo que no aparece se considera disponible (p. ej. las piezas de serie)
let stockEsEjemplo = true;
const sel = { modelo: "one", bisel: "bisel-serie", trasera: "trasera-serie", correa: "correa-serie", extra: new Set() };

/* ===== Lectura del stock: aislada para poder cambiarla por n8n ===== */
async function pedirJSON(url, ms = 6000) {
  const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), ms);
  try {
    const r = await fetch(url, { signal: ctl.signal, cache: "no-store" });
    if (!r.ok) throw new Error(r.status);
    return await r.json();
  } finally { clearTimeout(t); }
}
const stockValido = d => d && typeof d.unidades === "object" && d.unidades !== null && Object.keys(d.unidades).length > 0;

async function cargarStock() {
  if (CONEXIONES.urlStock) {
    try {
      const d = await pedirJSON(CONEXIONES.urlStock);
      if (stockValido(d)) return { unidades: d.unidades, ejemplo: d.ejemplo === true, origen: "red" };
    } catch (e) { /* si falla o viene vacío, caemos al JSON local */ }
  }
  try {
    const d = await pedirJSON("data/stock.json");
    if (stockValido(d)) return { unidades: d.unidades, ejemplo: d.ejemplo !== false, origen: "local" };
  } catch (e) { /* sin JSON local */ }
  return { unidades: {}, ejemplo: true, origen: "ninguno" };
}

/* ===== Utilidades de estado ===== */
const unidades = id => (id in stock ? Number(stock[id]) : Infinity);
const hay = id => unidades(id) > 0;
const buscar = (grupo, id) => CATALOGO[grupo].find(x => x.id === id);

function colorCorrea() {
  const c = buscar("correa", sel.correa);
  return c.color || buscar("modelo", sel.modelo).correa;
}

/* ===== Pintado de opciones ===== */
function etiquetaStock(id) {
  const u = unidades(id);
  if (u <= 0) return '<span class="etq sin">Sin stock</span>';
  if (u <= POCO && u !== Infinity) return '<span class="etq poco">Quedan ' + u + '</span>';
  return "";
}

function pintaGrupo(grupo, tipo) {
  const host = $("g-" + grupo);
  host.innerHTML = "";
  CATALOGO[grupo].forEach(it => {
    const u = unidades(it.id), off = u <= 0;
    const lab = document.createElement("label");
    lab.className = "op" + (tipo === "checkbox" ? " check" : "");
    const inp = document.createElement("input");
    inp.type = tipo; inp.name = grupo; inp.value = it.id; inp.disabled = off;
    inp.checked = tipo === "checkbox" ? sel.extra.has(it.id) : sel[grupo] === it.id;
    if (off) inp.setAttribute("aria-label", it.nombre + ", sin stock");
    inp.addEventListener("change", () => {
      if (tipo === "checkbox") { inp.checked ? sel.extra.add(it.id) : sel.extra.delete(it.id); }
      else sel[grupo] = it.id;
      actualiza();
      if (grupo === "modelo") { pintaGrupo("correa", "radio"); } // la correa de serie cambia de color con el modelo
    });
    const tarj = document.createElement("span");
    tarj.className = "tarj";
    let muestra;
    if (tipo === "checkbox") muestra = '<span class="marca" aria-hidden="true">✓</span>';
    else {
      let c = it.color || it.correa;
      if (grupo === "correa" && it.incluida) c = buscar("modelo", sel.modelo).correa;
      const fondo = it.img ? "background-image:url('" + it.img + "')" : "";
      muestra = '<span class="sw" aria-hidden="true" style="--c:' + c + ';' + fondo + '"></span>';
    }
    const extra = it.nota ? it.nota : "";
    const precio = it.incluida ? "Incluida" : eur(it.precio);
    tarj.innerHTML = muestra + '<span class="txt"><span class="nombre"></span><span class="precio"></span>' + etiquetaStock(it.id) + "</span>";
    tarj.querySelector(".nombre").textContent = it.nombre;
    tarj.querySelector(".precio").textContent = extra && grupo === "modelo" ? precio + " · " + extra : precio;
    lab.append(inp, tarj);
    host.appendChild(lab);
  });
}

/* Si lo elegido se ha quedado sin stock, pasamos a la primera opción disponible */
function corrigeSeleccion() {
  ["modelo", "bisel", "trasera", "correa"].forEach(g => {
    if (!hay(sel[g])) { const alt = CATALOGO[g].find(x => hay(x.id)); if (alt) sel[g] = alt.id; }
  });
  sel.extra.forEach(id => { if (!hay(id)) sel.extra.delete(id); });
}

/* ===== Vista previa, resumen y total ===== */
function lineas() {
  const m = buscar("modelo", sel.modelo), e = buscar("bisel", sel.bisel), r = buscar("trasera", sel.trasera), c = buscar("correa", sel.correa);
  const l = [{ t: m.nombre, p: m.precio }];
  l.push({ t: e.incluida ? "Bisel de serie" : "Bisel " + e.corto, p: e.precio });
  l.push({ t: r.incluida ? "Trasera de serie" : "Trasera " + r.corto, p: r.precio });
  l.push({ t: c.incluida ? "Correa de serie" : "Correa de " + c.corto, p: c.precio });
  CATALOGO.extra.filter(x => sel.extra.has(x.id)).forEach(x => l.push({ t: x.nombre, p: x.precio }));
  return l;
}

function actualiza() {
  const m = buscar("modelo", sel.modelo), e = buscar("bisel", sel.bisel), r = buscar("trasera", sel.trasera);
  const reloj = $("reloj");
  reloj.style.setProperty("--strap", colorCorrea());
  reloj.style.setProperty("--case", m.caja);
  reloj.style.setProperty("--hand", m.mano);
  reloj.style.setProperty("--bisel", e.color || m.caja);
  $("trasera-sw").style.background = r.color || "#2B2C2C";
  $("trasera-nombre").textContent = r.incluida ? "Trasera de serie" : "Trasera " + r.corto;
  const ls = lineas();
  const ul = $("lista-resumen"); ul.innerHTML = "";
  ls.forEach(x => {
    const li = document.createElement("li");
    const a = document.createElement("span"), b = document.createElement("span");
    a.textContent = x.t; b.textContent = x.p ? eur(x.p) : "Incluida";
    li.append(a, b); ul.appendChild(li);
  });
  const total = ls.reduce((s, x) => s + x.p, 0);
  $("total").textContent = eur(total);
  const desc = ls.map(x => x.t).join(", ");
  reloj.setAttribute("aria-label", "Vista previa de tu reloj: " + desc);
}

/* ===== Pedir el diseño: lleva al formulario de contacto de la portada ===== */
function pedido() {
  const ls = lineas(), total = ls.reduce((s, x) => s + x.p, 0);
  const detalle = ls.map(x => "- " + x.t + (x.p ? " (" + eur(x.p) + ")" : " (incluida)")).join("\n");
  const mensaje = "Hola, me gustaría pedir este diseño de CICLO:\n" + detalle + "\nTotal: " + eur(total) + "\n\n¿Me confirmáis disponibilidad y plazo de entrega?";
  return { motivo: "Pedir un diseño", mensaje };
}
$("pedir").addEventListener("click", () => {
  const p = pedido();
  let guardado = false;
  try { sessionStorage.setItem("ciclo-pedido", JSON.stringify(p)); guardado = true; } catch (e) { /* sin sessionStorage */ }
  // Si el navegador no deja guardar, el mensaje viaja en la dirección
  location.href = "index.html" + (guardado ? "" : "?pedido=" + encodeURIComponent(p.mensaje)) + "#contacto";
});

/* ===== Menú en móvil ===== */
const navEl = document.querySelector("nav"), menuBtn = document.querySelector(".menu-btn");
const menu = abrir => { navEl.classList.toggle("abierto", abrir); menuBtn.setAttribute("aria-expanded", String(abrir)); menuBtn.setAttribute("aria-label", abrir ? "Cerrar el menú" : "Abrir el menú"); };
menuBtn.addEventListener("click", () => menu(!navEl.classList.contains("abierto")));
document.querySelectorAll("#menu-secciones a").forEach(a => a.addEventListener("click", () => menu(false)));
document.addEventListener("keydown", e => { if (e.key === "Escape") menu(false); });

/* ===== Arranque ===== */
function pintaTodo() {
  corrigeSeleccion();
  pintaGrupo("modelo", "radio"); pintaGrupo("bisel", "radio"); pintaGrupo("trasera", "radio"); pintaGrupo("correa", "radio"); pintaGrupo("extra", "checkbox");
  actualiza();
}
pintaTodo(); // primero con todo disponible, para que no salte la pantalla
cargarStock().then(r => {
  stock = r.unidades; stockEsEjemplo = r.ejemplo;
  pintaTodo();
  const nota = $("nota-stock"), aviso = $("aviso-demo");
  if (r.origen === "ninguno") {
    nota.textContent = "No hemos podido cargar el stock, así que ahora mismo todo aparece disponible.";
    nota.classList.add("err");
  } else if (r.ejemplo) {
    nota.textContent = "Stock de ejemplo (data/stock.json). En la versión final saldrá del almacén.";
  } else {
    nota.textContent = "Stock al día.";
    aviso.hidden = true;
  }
});
