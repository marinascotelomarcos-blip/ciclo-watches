/* Cita de reparación: selector de día y hueco + envío al flujo de n8n «CICLO · Cita web».
   Necesita CONEXIONES.webhookCita (definido en index.html). Vacío = aviso amable y no se envía nada. */
(() => {
  // ---- Ajustes (se pueden tocar sin miedo) ----
  const DIAS_LABORABLES = 21;                                   // cuántos días laborables se ofrecen
  const FRANJAS = [["10:00", "14:00"], ["16:00", "19:00"]];     // horario: [desde, hasta); huecos de 30 min
  const MIN_HUECO = 30;
  // Festivos laborales de A Coruña ciudad, nov 2026 - ene 2027 (AAAA-MM-DD). Comprobados el 14-11-2026:
  //  - Nacionales y de Galicia 2026 (Decreto de la Xunta, DOG 20-06-2025): 8 dic y 25 dic. El 1 nov y el 6 dic 2026
  //    caen en domingo y Galicia los sustituye por otras fechas (19 mar y 24 jun), así que no hay lunes festivo.
  //    https://www.xunta.gal/dog/Publicados/2025/20250620/AnuncioG0767-120625-0002_gl.html
  //  - Galicia 2027 (Decreto 68/2026, DOG 02-07-2026): 1 ene y 6 ene.
  //    https://www.xunta.gal/dog/Publicados/2026/20260702/AnuncioG0767-250626-0001_gl.html
  //  - Locales de A Coruña: 2026 = 17 feb y 7 oct; 2027 = 9 feb y 24 jun (resolución DOG 26-10-2026, anexo I).
  //    Ninguno cae entre nov 2026 y ene 2027, por eso no aparece ninguno local.
  const FESTIVOS = [
    "2026-12-08", "2026-12-25", "2027-01-01", "2027-01-06"
  ];

  const pad = n => String(n).padStart(2, "0");
  const iso = d => d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  const hm = min => pad(Math.floor(min / 60)) + ":" + pad(min % 60);
  const aMin = t => +t.slice(0, 2) * 60 + +t.slice(3);
  const dia = d => d.toLocaleDateString("es-ES", { weekday: "short" }).replace(".", "");
  const largo = d => d.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" });

  const laborables = () => {
    const out = [], d = new Date(); d.setHours(12, 0, 0, 0);
    while (out.length < DIAS_LABORABLES) {
      d.setDate(d.getDate() + 1);
      if (d.getDay() === 0 || d.getDay() === 6 || FESTIVOS.includes(iso(d))) continue;
      out.push(new Date(d));
    }
    return out;
  };
  const huecos = () => {
    const out = [];
    FRANJAS.forEach(([a, b]) => { for (let m = aMin(a); m + MIN_HUECO <= aMin(b); m += MIN_HUECO) out.push(hm(m)); });
    return out;
  };

  // ---- Estructura (se inyecta una vez) ----
  const dlg = document.createElement("dialog");
  dlg.className = "cita"; dlg.id = "cita"; dlg.setAttribute("aria-labelledby", "cita-titulo");
  dlg.innerHTML = `
    <form class="cita-form" id="form-cita" novalidate>
      <button class="cita-x" type="button" data-cerrar aria-label="Cerrar">×</button>
      <div><span class="eyebrow">Reparaciones</span>
      <h2 id="cita-titulo">Pide tu cita,<br><em>sin esperas.</em></h2></div>
      <p class="dlg-texto">Elige un día y una hora, cuéntanos qué le pasa al reloj y te lo confirmamos por correo.</p>
      <fieldset><legend>1. Elige el día</legend><div class="cita-dias" id="cita-dias"></div></fieldset>
      <fieldset><legend>2. Elige la hora</legend><div class="cita-huecos" id="cita-huecos"></div></fieldset>
      <p class="cita-elegida" id="cita-elegida" role="status" aria-live="polite"></p>
      <fieldset><legend>3. Tus datos</legend>
        <div class="row2">
          <label class="campo">Nombre<input name="nombre" autocomplete="name" placeholder="Tu nombre" required></label>
          <label class="campo">Correo<input name="correo" type="email" autocomplete="email" placeholder="tu@correo.com" required></label>
        </div>
        <label class="campo">Modelo de reloj<select name="modelo" required>
          <option value="">Elige tu modelo</option><option>CICLO One</option><option>One Sport</option><option>CICLO Pro</option><option>CICLO Kids</option><option>No lo sé</option>
        </select></label>
        <label class="campo">¿Qué le pasa?<textarea name="problema" rows="3" required placeholder="Por ejemplo: la batería dura poco o la correa se ha roto"></textarea></label>
        <label class="ok-legal"><input type="checkbox" name="consentimiento" required> <span>Acepto que CICLO use estos datos para gestionar mi cita y la <a href="privacidad.html" target="_blank" rel="noopener">política de privacidad</a>.</span></label>
      </fieldset>
      <button class="btn" type="submit" id="btn-cita">Pedir cita <span class="arrow">→</span></button>
      <p class="cita-nota" id="cita-nota" role="status" aria-live="polite"></p>
    </form>
    <div class="cita-hecho" id="cita-hecho" hidden>
      <button class="cita-x" type="button" data-cerrar aria-label="Cerrar">×</button>
      <h2 id="cita-ok-titulo">¡Cita pedida!</h2><p id="cita-ok-texto"></p>
      <button class="btn" type="button" data-cerrar>Cerrar</button>
    </div>`;
  document.body.appendChild(dlg);

  const $ = id => dlg.querySelector("#" + id);
  const form = $("form-cita"), nota = $("cita-nota"), boton = $("btn-cita"), elegida = $("cita-elegida");
  const hecho = $("cita-hecho");
  let fecha = null, hora = null, enviando = false;

  const pintaDias = () => {
    const cont = $("cita-dias"); cont.innerHTML = "";
    let semana = null;
    laborables().forEach(d => {
      const lunes = new Date(d); lunes.setDate(d.getDate() - ((d.getDay() + 6) % 7));
      if (iso(lunes) !== semana) {
        semana = iso(lunes);
        const p = document.createElement("p"); p.className = "cita-semana";
        p.textContent = "Semana del " + lunes.toLocaleDateString("es-ES", { day: "numeric", month: "long" });
        cont.appendChild(p);
      }
      const b = document.createElement("button");
      b.type = "button"; b.className = "cita-dia"; b.dataset.fecha = iso(d); b.setAttribute("aria-pressed", "false");
      b.setAttribute("aria-label", largo(d)); b.style.gridColumnStart = d.getDay();   // lun=1 … vie=5: cada semana en su fila
      b.innerHTML = `<small>${dia(d)}</small><b>${d.getDate()}</b>`;
      b.addEventListener("click", () => { fecha = b.dataset.fecha; marca(cont, b); resumen(); });
      cont.appendChild(b);
    });
  };
  const pintaHuecos = () => {
    const cont = $("cita-huecos"); cont.innerHTML = "";
    huecos().forEach((h, i, todos) => {
      if (i === 0 || (aMin(h) - aMin(todos[i - 1])) > MIN_HUECO) {
        const p = document.createElement("p"); p.className = "cita-franja"; p.textContent = aMin(h) < 14 * 60 ? "Mañana" : "Tarde"; cont.appendChild(p);
      }
      const b = document.createElement("button");
      b.type = "button"; b.className = "cita-hueco"; b.dataset.hora = h; b.textContent = h; b.setAttribute("aria-pressed", "false");
      b.addEventListener("click", () => { hora = h; marca(cont, b); resumen(); });
      cont.appendChild(b);
    });
  };
  const marca = (cont, b) => { cont.querySelectorAll("button").forEach(x => x.setAttribute("aria-pressed", String(x === b))); nota.textContent = ""; nota.classList.remove("error"); };
  const resumen = () => {
    if (!fecha && !hora) { elegida.textContent = ""; return; }
    const d = fecha ? new Date(fecha + "T12:00:00") : null;
    elegida.textContent = (d && hora) ? "Tu cita: " + largo(d) + " a las " + hora + "."
      : d ? "Día elegido: " + largo(d) + ". Ahora elige la hora." : "Hora elegida: " + hora + ". Ahora elige el día.";
  };
  const avisa = (txt, error) => { nota.textContent = txt; nota.classList.toggle("error", !!error); };

  const abre = () => {
    if (typeof dlg.showModal !== "function") { location.hash = "#contacto"; return; }
    fecha = hora = null; form.reset(); hecho.hidden = true; form.hidden = false;
    pintaDias(); pintaHuecos(); resumen(); avisa("");
    dlg.showModal();
  };
  dlg.addEventListener("click", e => { if (e.target.closest("[data-cerrar]") || e.target === dlg) dlg.close(); });

  // Cualquier elemento con data-abrir-cita abre el selector
  document.addEventListener("click", e => { const a = e.target.closest("[data-abrir-cita]"); if (a) { e.preventDefault(); abre(); } });

  form.addEventListener("submit", async e => {
    e.preventDefault();
    if (enviando) return;
    const f = form.elements, v = n => f[n].value.trim();
    if (!fecha || !hora) return avisa("Elige un día y una hora para tu cita.", true);
    if (!v("nombre")) { f.nombre.focus(); return avisa("Escribe tu nombre.", true); }
    if (!f.correo.checkValidity() || !v("correo")) { f.correo.focus(); return avisa("Escribe un correo válido.", true); }
    if (!f.modelo.value) { f.modelo.focus(); return avisa("Elige el modelo de tu reloj.", true); }
    if (!v("problema")) { f.problema.focus(); return avisa("Cuéntanos qué le pasa al reloj.", true); }
    if (!f.consentimiento.checked) { f.consentimiento.focus(); return avisa("Para pedir la cita, marca la casilla de privacidad.", true); }
    if (!CONEXIONES.webhookCita) return avisa("Las citas todavía no están activas. Vuelve a probar en unos días o escríbenos desde «Contáctanos».", true);

    enviando = true; boton.disabled = true; avisa("Enviando…");
    const datos = { fecha, hora, nombre: v("nombre"), correo: v("correo"), modelo: f.modelo.value, problema: v("problema"),
                    consentimiento: true, origen: "web", enviado: new Date().toISOString() };
    try {
      const r = await fetch(CONEXIONES.webhookCita, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(datos) });
      if (r.status === 409) { hora = null; pintaHuecos(); resumen(); avisa("Ese hueco ya está cogido. Elige otra hora y lo intentamos.", true); }
      else if (!r.ok) throw new Error(String(r.status));
      else {
        $("cita-ok-texto").textContent = "Gracias, " + datos.nombre + ". Te esperamos el " + largo(new Date(fecha + "T12:00:00")) + " a las " + hora + ". Te hemos enviado la confirmación a " + datos.correo + ".";
        form.hidden = true; hecho.hidden = false;
      }
    } catch { avisa("No se ha podido pedir la cita. Prueba de nuevo en un momento.", true); }
    enviando = false; boton.disabled = false;
  });
})();
