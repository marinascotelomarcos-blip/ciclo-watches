// CICLO Watches · trazabilidad. Lee data/lotes.json (datos de ejemplo) y pinta fichas y consulta.
(function () {
  "use strict";
  var datos = null;
  var $ = function (id) { return document.getElementById(id); };

  // Menú móvil
  var btn = document.querySelector(".menu-btn"), menu = $("menu-secciones");
  function abrirMenu(si) {
    menu.classList.toggle("open", si);
    btn.setAttribute("aria-expanded", si ? "true" : "false");
    btn.setAttribute("aria-label", si ? "Cerrar el menú" : "Abrir el menú");
  }
  btn.addEventListener("click", function () { abrirMenu(!menu.classList.contains("open")); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") abrirMenu(false); });

  function el(tag, cls, txt) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (txt != null) n.textContent = txt;
    return n;
  }
  function par(dl, titulo, valor) {
    var d = el("div");
    d.appendChild(el("dt", null, titulo));
    d.appendChild(el("dd", null, valor));
    dl.appendChild(d);
  }
  function medidor(pct) {
    var m = el("div", "meter");
    m.appendChild(el("span", "pct", pct + " %"));
    var b = el("div", "bar"); b.setAttribute("aria-hidden", "true");
    var i = el("i"); i.style.width = Math.max(0, Math.min(100, pct)) + "%";
    b.appendChild(i); m.appendChild(b);
    return m;
  }
  function nota() {
    var p = el("p", "demo-note");
    p.setAttribute("role", "note");
    p.appendChild(el("b", null, "Datos de ejemplo del proyecto. "));
    p.appendChild(document.createTextNode("Empresa ficticia: este lote no existe de verdad."));
    return p;
  }

  function pintarFichas() {
    var cont = $("fichas");
    cont.textContent = "";
    Object.keys(datos.piezas).forEach(function (k) {
      var p = datos.piezas[k];
      var a = el("article", "ficha");
      if (p.foto) { var img = el("img"); img.src = p.foto; img.alt = ""; img.width = 460; img.height = 345; img.loading = "lazy"; img.decoding = "async"; a.appendChild(img); } else if (p.color) { var m = el("div", "ficha-color"); m.style.background = p.color; m.setAttribute("aria-hidden", "true"); a.appendChild(m); }
      var b = el("div", "ficha-body");
      b.appendChild(el("h3", null, p.nombre));
      b.appendChild(el("p", "mat", p.material + (p.usos ? " · " + p.usos : "")));
      var dl = el("dl");
      par(dl, "De dónde sale", p.origen);
      var d = el("div"); d.appendChild(el("dt", null, "Contenido reciclado"));
      var dd = el("dd"); dd.appendChild(medidor(p.reciclado)); d.appendChild(dd); dl.appendChild(d);
      par(dl, "Al final de su vida", p.finDeVida);
      b.appendChild(dl); a.appendChild(b); cont.appendChild(a);
    });
  }

  function ejemplos() {
    var c = $("ejemplos"); c.textContent = "";
    datos.lotes.slice(0, 3).forEach(function (l) {
      var b = el("button", null, l.codigo); b.type = "button";
      b.addEventListener("click", function () { $("codigo").value = l.codigo; consultar(l.codigo); });
      c.appendChild(b);
    });
  }

  // Quita espacios y guiones, pasa a mayúsculas y devuelve en formato CW-XXXX-YYYY (o null si no encaja)
  function normalizar(txt) {
    var s = String(txt).toUpperCase().replace(/[\s\-_–—]/g, "");
    var m = /^CW([A-Z0-9]{4})([A-Z0-9]{4})$/.exec(s);
    return m ? "CW-" + m[1] + "-" + m[2] : null;
  }

  function mostrar(nodos) {
    var r = $("resultado"); r.textContent = "";
    nodos.forEach(function (n) { r.appendChild(n); });
  }

  function consultar(txt) {
    if (!datos) { mostrar([el("p", "nada", "Los datos aún no han cargado. Prueba otra vez en un momento.")]); return; }
    if (!String(txt).trim()) {
      var v = el("p", "nada"); v.appendChild(el("b", null, "Escribe un código"));
      v.appendChild(el("span", null, "Lo encontrarás grabado en la pieza, con la forma CW-XXXX-YYYY."));
      mostrar([v]); return;
    }
    var cod = normalizar(txt), lote = null;
    if (cod) datos.lotes.forEach(function (l) { if (l.codigo === cod) lote = l; });
    if (!lote) {
      var n = el("p", "nada");
      n.appendChild(el("b", null, "No encuentro ese lote"));
      n.appendChild(el("span", null, cod
        ? "No tenemos ningún lote con el código " + cod + ". Revisa que esté bien copiado; si sigue sin salir, escríbenos y lo miramos juntos."
        : "Ese código no tiene el formato que esperamos (CW-XXXX-YYYY, por ejemplo CW-ALU1-0001). Revisa que esté bien copiado y vuelve a probar."));
      mostrar([n]); return;
    }
    var p = datos.piezas[lote.pieza];
    var head = el("div", "res-head");
    var t = el("div"); t.appendChild(el("h3", null, p.nombre)); t.appendChild(el("p", "mat", p.material));
    head.appendChild(t); head.appendChild(el("span", "tag", lote.codigo));
    var dl = el("dl");
    par(dl, "De dónde sale", p.origen);
    par(dl, "Zona y fecha de recogida", lote.zona + ", " + lote.recogida);
    var d = el("div"); d.appendChild(el("dt", null, "Contenido reciclado de este lote"));
    var dd = el("dd"); dd.appendChild(medidor(lote.reciclado)); d.appendChild(dd); dl.appendChild(d);
    par(dl, "Al final de su vida", p.finDeVida);
    if (lote.nota) par(dl, "Nota del lote", lote.nota);
    mostrar([head, dl, nota()]);
    $("resultado").focus({ preventScroll: true });
    if (window.matchMedia("(max-width:900px)").matches) $("resultado").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  $("form-lote").addEventListener("submit", function (e) { e.preventDefault(); consultar($("codigo").value); });

  fetch("data/lotes.json").then(function (r) {
    if (!r.ok) throw new Error(r.status);
    return r.json();
  }).then(function (j) { datos = j; pintarFichas(); ejemplos(); })
    .catch(function () {
      var c = $("fichas"); c.textContent = "";
      c.appendChild(el("p", "error", "No he podido cargar las fichas. Si abres el archivo directamente desde el disco, el navegador lo bloquea: sírvelo con un servidor local (python3 -m http.server)."));
    });
})();
