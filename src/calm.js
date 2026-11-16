// Paradas jugables de Retorno (los descansos). Entre enfrentamiento y enfrentamiento, a veces el camino pasa por un
// sitio tranquilo: sin enemigos, con buena luz y algo que resolver sin prisa. Se llega desde el mapa del refugio («Ir
// a la parada») y se sale por donde se entró («Seguir el camino»): nada obliga a resolverlo todo.
// Cada sitio (un mapa con «calm» en maps.js) junta tres acertijos de estos, con sus datos en calm.puzzles:
//  · ladder: la casa atrancada por dentro; hay que buscar la escalera de mano, apoyarla bajo la ventana abierta de
//    arriba, subir y quitar la tranca desde dentro. Arriba, un arcón.
//  · keyhunt: algo cerrado con llave (una trampilla o una puerta); la llave está en uno de cuatro escondites y una
//    nota dice en cuál.
//  · rope: un fardo colgado muy alto; se baja de un disparo (o un flechazo) a la cuerda.
//  · pick: un edificio cerrado con llave; la cerradura se fuerza con una horquilla (la ganzúa). Dentro, un arcón.
//  · combo: un baúl (o una caja) con candado de combinación; las tres cifras están repartidas por el sitio.
//  · power: gasolina para el generador (arrancarlo es un minijuego: tirar de la cuerda a tiempo) y, con corriente,
//    lo que estaba parado: un cabrestante o una puerta automática.
// En todos, un fuego para descansar (cura una vez) y notas sueltas que se guardan en la mochila (pestaña Notas). Lo
// que te llevas sale en el mismo cartel que las recompensas del refugio. Lo que se busca lleva el contorno amarillo
// cuando estás cerca (y, si hay que averiguarlo, cuando ya lo sabes).
(function (G) {
  'use strict';
  const U = G.Util, TAU = Math.PI * 2;
  const YEL = 0xf2c230;

  // ================= Notas sueltas (se guardan: la colección de la pestaña Notas) =================
  const NKEY = 'ceniza.notas';
  const LORE = {
    granja_1: { title: 'Diario de Ruth', where: 'La granja del manzano', text: '12 de abril.\nHan vuelto los del escorpión. Esta vez no han preguntado: se han llevado las dos cabras y la mitad de las conservas, y el más joven se ha reído cuando Luna se ha puesto a llorar.\nCelso dice que el año que viene plantamos el doble. Yo digo que el año que viene no estamos aquí.\nEl manzano ha florecido igual. A él le da lo mismo quién mande.' },
    granja_2: { title: 'Lista del abuelo Celso', where: 'La granja del manzano', text: 'Antes de irnos:\n— Engrasar la bomba del pozo.\n— Dejar la bodega cerrada (que no la encuentren).\n— Soltar a las gallinas. Que se apañen, como todos.\n— Decirle a Luna que el perro se queda a cuidar la casa. (Mentira. Ya se lo diré.)\n— Escalera: guardada. Nada de dejarla apoyada en la pared, que luego entra cualquiera.' },
    pesc_1: { title: 'Cuaderno de Anselmo', where: 'La casa del pescador', text: 'Día 340 (o por ahí).\nCorvinas pequeñas y una lubina que no me la creo ni yo. El mar está más limpio que nunca: es lo único bueno que ha traído el fin del mundo.\nDesde hace dos semanas el faro vuelve a encenderse de noche. Inés dice que son los del escorpión, que lo han tomado. Yo no lo he visto encendido en treinta años; ahora me da miedo mirarlo.' },
    pesc_2: { title: 'Una nota sin firma', where: 'La casa del pescador', text: 'Si lees esto: el agua del pozo de la cabaña es buena, hiérvela igual. Los del escorpión pasan los jueves por el camino de la costa.\nEn el puerto dicen que la Trece existe. Que una chica pelirroja con el brazo quemado limpió ella sola un campamento entero de Escorpiones, cerca de aquí.\nYo digo que la gente necesita cuentos. Pero, si existe, ojalá pase por aquí.' },
    lago_1: { title: 'Registro del camping', where: 'El camping del embalse', text: 'Parcela 4: familia Soler. Pagado hasta el domingo.\nParcela 7: dos chicos en bici. No han pagado. No volverán a pagar nunca, supongo.\nParcela 9: nadie. Desde el martes, nadie en ninguna.\nEl embalse sigue igual de bonito. Cierro la caseta y me quedo un día más. Si alguien necesita algo, que toque la campana del socorrista.\n— Germán, guarda' },
    lago_2: { title: 'Postal sin enviar', where: 'El camping del embalse', text: 'Mamá:\nAquí no ha llegado nada. Por la radio dicen que en la ciudad está todo perdido, pero aquí solo se oyen ranas.\nMarga, la socorrista, dice que nos quedemos. Que el agua aguanta, que los enfermos no nadan.\nNo sé si esto llegará. Te dejo la postal en la mesa por si vienes a buscarnos.\nTe quiero. Pablo' },
    gas_1: { title: 'Libreta de turnos', where: 'La gasolinera de la nacional', text: 'Lunes: Paco. Martes: Paco. Miércoles: Paco (Rober no ha venido).\nJueves: ha pasado un convoy con la pintura del escorpión. Han llenado seis bidones y no han pagado. El jefe dice que lo apunte como «pérdidas».\nViernes: ya no hay jefe.\nSábado: he apagado el generador para que no lo oigan. La puerta de la tienda es automática; sin corriente no se abre ni a patadas. Mejor.' },
    gas_2: { title: 'Un mapa de carreteras', where: 'La gasolinera de la nacional', text: 'Garabateado sobre el mapa, a bolígrafo:\n«Capitolio: NO. Lo tienen los Escorpiones. Dicen que es una cárcel.»\n«Oceanside: el faro funciona otra vez.»\n«Salón recreativo de la avenida: algo grande dentro. No entrar.»\nY al margen, con otra letra: «El refugio de la Trece está al este. Si es verdad, que alguien me lo diga.»' },
    ermita_1: { title: 'Sermón sin terminar', where: 'La ermita del cerro', text: 'Queridos hermanos:\nNos preguntamos dónde estaba Dios cuando empezó todo esto. Yo también me lo pregunto, y no tengo la respuesta.\nLo que sí sé es que esta semana Tomás ha subido agua a los Herrero y que las hermanas Ruiz han cosido mantas para los que llegan del valle.\nQuizá Dios estaba ahí. Quizá\n\n(No sigue. La tinta está corrida.)' },
    ermita_2: { title: 'Libro de visitas', where: 'La ermita del cerro', text: '«Gracias por el agua y por el techo. Seguimos hacia la costa.» — familia Lozano\n«Pasamos tres noches. Nadie nos echó. Dios se lo pague a quien sea.» — sin firma\n«Han estado aquí los del escorpión. Se han llevado los candelabros. No han tocado el cepillo: el candado de don Julián aguanta.»\n«Si alguien lee esto: ha vuelto la luz al faro.»' },
    est_1: { title: 'Parte del jefe de estación', where: 'El apeadero de Valdecina', text: 'Último tren: el regional de las 7:42. Pasó sin parar, con las ventanas tapadas con cartones y gente en el techo.\nDespués, ninguno más.\nHe apagado el generador y cerrado la consigna con todo lo que la gente se dejó. Las maletas no se las lleva nadie.\nSi vuelve el servicio, que conste: este apeadero no ha cerrado. Solo está esperando.\n— R. Valdés' },
    est_2: { title: 'Un billete con algo escrito detrás', where: 'El apeadero de Valdecina', text: 'Valdecina — Capital. Ida. Sin validar.\nDetrás, a lápiz:\n«Me bajo aquí. En la capital ya no queda nada y aquí, al menos, hay manzanas en la granja del camino.\nSi me buscas, sigue la vía hacia el este. Llevo la chaqueta roja.»' }
  };
  const Notes = {
    list() { try { const a = JSON.parse(localStorage.getItem(NKEY) || '[]'); return Array.isArray(a) ? a.filter((id) => LORE[id]) : []; } catch (e) { return []; } },
    add(id) {
      const a = this.list();
      if (!LORE[id] || a.indexOf(id) >= 0) return false;
      a.push(id);
      try { localStorage.setItem(NKEY, JSON.stringify(a)); } catch (e) { /* sin guardado */ }
      return true;
    },
    has(id) { return this.list().indexOf(id) >= 0; },
    LORE
  };

  // ================= Los sitios =================
  const SCENES = {
    granja: { map: 'calma_granja', name: 'La granja del manzano', tag: 'DESCANSO · NO HAY NADIE', face: Math.PI,
      teaser: 'Una granja al caer la tarde: la casa atrancada por dentro, el granero, la huerta y un manzanar. Quien vivía aquí se marchó con prisa y escondió lo que pudo.' },
    pescador: { map: 'calma_pescador', name: 'La casa del pescador', tag: 'DESCANSO · EL MAR EN CALMA', face: 0,
      teaser: 'Una cabaña de pescador en la costa de Oceanside, al amanecer, con la caseta de la barca y un muelle de tablas. El faro se ve al otro lado de la bahía.' },
    lago: { map: 'calma_lago', name: 'El camping del embalse', tag: 'DESCANSO · EL AGUA QUIETA', face: 0,
      teaser: 'Un camping a la orilla del embalse, a media mañana: tiendas abandonadas, la caseta del guarda cerrada y la torre del socorrista. Solo se oyen las ranas.' },
    gasolinera: { map: 'calma_gasolinera', name: 'La gasolinera de la nacional', tag: 'DESCANSO · LA CARRETERA VACÍA', face: Math.PI / 2,
      teaser: 'Una gasolinera en una carretera por la que ya no pasa nadie, a mediodía. La tienda tiene la puerta automática y el taller, el cierre echado.' },
    ermita: { map: 'calma_ermita', name: 'La ermita del cerro', tag: 'DESCANSO · SUENAN LAS CIGARRAS', face: Math.PI,
      teaser: 'Una ermita blanca en lo alto de un cerro, con su cementerio pequeño y la casa del ermitaño. La tarde cae despacio sobre el valle.' },
    estacion: { map: 'calma_estacion', name: 'El apeadero de Valdecina', tag: 'DESCANSO · NO PASA NINGÚN TREN', face: -Math.PI / 2,
      teaser: 'Un apeadero de pueblo por la mañana: el andén, un vagón de mercancías olvidado en la vía muerta, el almacén y la casa del jefe de estación.' }
  };

  let S = null;          // la parada en curso
  let scene = null;

  // ================= Utilidades =================
  const say = (t, k) => { if (S && S.msg) S.msg(t, k || ''); };
  const snd = (n, o) => { if (G.Audio) G.Audio.play(n, o || {}); };
  const dist = (a, x, z) => Math.hypot(a.pos.x - x, a.pos.z - z);
  const gy = (x, z, lv) => G.World.groundY(x, z, lv || 0);
  const fill = (t, o) => String(t).replace(/\{(\w+)\}/g, (m, k) => (o[k] != null ? o[k] : m));

  // ---------- mallas: el cuerpo (colores por vértice) y su contorno amarillo (la misma forma, algo más gorda) ----------
  let matBody = null, matHull = null, matGlow = null, matDark = null, matFlame = null;
  function mats() {
    if (matBody) return;
    matBody = new THREE.MeshLambertMaterial({ vertexColors: true });
    matHull = new THREE.MeshBasicMaterial({ color: YEL, side: THREE.BackSide, fog: false }); matHull.toneMapped = false;
    matGlow = new THREE.MeshBasicMaterial({ color: 0xffd890 }); matGlow.toneMapped = false;
    matDark = new THREE.MeshLambertMaterial({ color: 0x3a3632 });
    matFlame = new THREE.MeshBasicMaterial({ color: 0xff9a3a, transparent: true, opacity: 0.85, depthWrite: false, blending: THREE.AdditiveBlending }); matFlame.toneMapped = false;
  }
  // draw(p): p.box(x, y, z, w, h, d, col, ry, rx, rz) · p.cyl(x, y, z, r0, r1, h, col, seg, rx, ry, rz) · p.sph(x, y, z, sx, sy, sz, col)
  function geo(draw, k) {
    const M = new G.Mesher();
    draw({
      box: (x, y, z, w, h, d, c, ry, rx, rz) => M.box(x, y, z, w + 2 * k, h + 2 * k, d + 2 * k, c, ry || 0, undefined, rx || 0, rz || 0),
      cyl: (x, y, z, r0, r1, h, c, seg, rx, ry, rz) => M.cyl(x, y, z, r0 + k, r1 + k, h + 2 * k, c, seg || 8, undefined, rx || 0, ry || 0, rz || 0),
      sph: (x, y, z, sx, sy, sz, c) => M.sphere(x, y, z, sx + k, sy + k, sz + k, c, 1)
    });
    return M.build();
  }
  // Un objeto: { g (grupo: posición y giro), body, hull (escondido) }. o: { k (grosor del contorno), noHull, hullOnly, lv }
  function thing(draw, x, y, z, ry, o) {
    mats(); o = o || {};
    const g = new THREE.Group();
    g.position.set(x, y, z); g.rotation.y = ry || 0;
    let body = null, hull = null;
    if (!o.hullOnly) { body = new THREE.Mesh(geo(draw, 0), matBody); body.castShadow = o.shadow !== false; body.receiveShadow = true; g.add(body); }
    if (!o.noHull) { hull = new THREE.Mesh(geo(draw, o.k || 0.035), matHull); hull.visible = false; g.add(hull); }
    S.group.add(g);
    return { g, body, hull, lv: o.lv || 0 };
  }
  // contorno: se ve si on() y estás a menos de r (y en la misma planta)
  function hint(t, r, on) { if (t && t.hull) S.hints.push({ t, r: r || 4.5, on: on || (() => true) }); }
  // un objeto con el que se interactúa (con el botón de Recoger)
  // (lab: el texto cambia según cómo esté: una función)
  function prop(p) {
    const q = Object.assign({ kind: 'calm', reach: 1.7 }, p);
    if (p.lab) Object.defineProperty(q, 'label', { get: p.lab, enumerable: true });
    G.Props.add(q); S.props.push(q);
    return q;
  }
  // algo que se mueve solo: fn(dt) devuelve false al terminar
  function anim(fn) { S.anims.push(fn); }
  // una acción con la animación de registrar (dur s): al acabar, fn()
  function act(p, dur, x, z, fn, low) {
    if (p.busy() || p.dead) return false;
    p.action = { kind: 'search', t: 0, dur, impact: 0.92, face: Math.atan2(x - p.pos.x, z - p.pos.z), low: low !== false, done: false, onDone: fn };
    return true;
  }
  // lo que te llevas (monedas, piezas, suplementos, vida, objetos, balas): al momento, y el cartel de lo que es
  // (lo que se cuenta, algo más de lo que pone: los descansos ocupan el sitio de enfrentamientos, que pagan bien)
  const PAY = 1.5;
  function give(out, head, text) {
    const o = Object.assign({}, out);
    for (const k of ['monedas', 'piezas', 'suplementos']) if (o[k]) o[k] = Math.round(o[k] * PAY);
    const lines = G.Run && G.Run.calmGive ? G.Run.calmGive(o, S.player) : [];
    for (const l of lines) S.gains.push(l);
    snd('pickup');
    rewardUI(head || 'Hallazgo', text || '', lines);
    return lines;
  }
  function found() {
    S.found++; hud();
    if (S.found >= S.total) S.allDone = true;
  }
  // ¿lleva algo con lo que disparar a distancia?
  function canShoot(p) { return p.weapons.some((w) => { const d = G.Weapons.get(w.id); return d && G.Weapons.isGun(d); }); }
  // ---------- encima de qué está algo (las notas sobre un banco, una mesa, un tocón...) ----------
  // (la altura de la superficie de cada mueble: los asientos no son lo más alto del banco)
  const SURF = { banco_parque: 0.47, mesa_campo: 0.8, banco: 0.92, tocon: 0.45, mesita: 0.5, comoda: 0.86, escritorio: 0.76, mostrador: 1.0, mesa_mapa: 0.95, tablas: 0.45, palets: 0.72, bidones: 0.92, cajas: 0.62, surtidor: 1.7, tumba: 0.35, nasas: 1.35, cubos: 1.12 };
  function furnUnder(x, z, lv) {
    const W = G.World, list = W.furnAt(Math.floor(x), Math.floor(z), lv || 0);
    if (!list) return null;
    const c = W.chunkAt(Math.floor(x) >> 5, Math.floor(z) >> 5);
    for (const k of list) { const f = c.furn[k]; if (!f.gone && x > f.x0 && x < f.x1 && z > f.z0 && z < f.z1) return f; }
    return null;
  }
  function surfY(x, z, lv) {
    const f = furnUnder(x, z, lv);
    if (!f) return gy(x, z, lv) + 0.005;
    const top = SURF[f.type] != null ? SURF[f.type] : f.h;
    return (f.y || 0) + 0.04 + top + 0.006;
  }
  // un trozo de papel (las notas)
  function paper(x, y, z, ry) {
    return thing((p) => { p.box(0, 0.006, 0, 0.21, 0.012, 0.28, 0xe8e0cc); p.box(0.02, 0.014, -0.02, 0.16, 0.004, 0.003, 0x6a6458); p.box(0.01, 0.014, 0.04, 0.17, 0.004, 0.003, 0x6a6458); }, x, y, z, ry, { k: 0.03, shadow: false });
  }
  // una textura con letras (los números pintados o grabados)
  function textTex(lines, o) {
    o = o || {};
    const cv = document.createElement('canvas'); cv.width = o.w || 256; cv.height = o.h || 128;
    const x = cv.getContext('2d');
    x.clearRect(0, 0, cv.width, cv.height);
    if (o.bg) { x.fillStyle = o.bg; x.fillRect(0, 0, cv.width, cv.height); }
    if (o.band) { x.fillStyle = o.band; x.fillRect(0, 0, cv.width, cv.height * 0.22); x.fillRect(0, cv.height * 0.78, cv.width, cv.height * 0.22); }
    x.fillStyle = o.col || '#efe8d8'; x.textAlign = 'center'; x.textBaseline = 'middle';
    const fs = o.size || 54;
    lines.forEach((l, i) => { x.font = (o.bold === false ? '' : '700 ') + (i && o.size2 ? o.size2 : fs) + 'px ' + (o.font || 'Georgia, serif'); x.fillText(l, cv.width / 2, cv.height / 2 + (i - (lines.length - 1) / 2) * fs * 1.05); });
    const t = new THREE.CanvasTexture(cv); t.anisotropy = 2;
    return t;
  }
  function decal(tex, w, h, x, y, z, ry, opa) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshLambertMaterial({ map: tex, transparent: true, opacity: opa || 0.92, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 }));
    m.position.set(x, y, z); m.rotation.y = ry || 0; m.renderOrder = 2;
    S.group.add(m);
    return m;
  }
  // un estorbo invisible (para que no se atraviese lo que dibujamos aquí): un mueble sin dibujo
  function blocker(x0, z0, x1, z1, h) {
    const W = G.World, cx = Math.floor((x0 + x1) / 2) >> 5, cz = Math.floor((z0 + z1) / 2) >> 5, c = W.chunkAt(cx, cz);
    const f = { type: 'bloques', lv: 0, x0, x1, z0, z1, y: gy((x0 + x1) / 2, (z0 + z1) / 2), h: h || 1, fx: 0, fz: 1, solid: true, cont: null, calmBlock: true };
    c.furn.push(f);
    if (G.Furniture.indexChunk) G.Furniture.indexChunk(c, 32);
    S.blocks.push({ c, f });
    return f;
  }

  // ---------- edificios: las aristas de fuera (puertas y ventanas) de una planta ----------
  function bldNear(x, z, lv) {
    const W = G.World;
    for (let r = 0; r <= 2; r++) for (let dz = -r; dz <= r; dz++) for (let dx = -r; dx <= r; dx++) { const b = W.bldAt(Math.floor(x) + dx, Math.floor(z) + dz, lv || 0); if (b) return b; }
    return null;
  }
  const bldOf = (R) => (R ? bldNear((R.x0 + R.x1) / 2, (R.z0 + R.z1) / 2, 0) : null);
  const sameB = (a, b) => !!a && !!b && a.x0 === b.x0 && a.z0 === b.z0;
  function inB(B, x, z, lv) { return sameB(G.World.bldAt(Math.floor(x), Math.floor(z), lv || 0), B); }
  // cada arista que separa una casilla del edificio de una de fuera: { ref, mx, mz, nx, nz } (n: hacia fuera)
  function outerEdges(B, lv) {
    const out = [];
    for (let z = B.z0 - 1; z <= B.z0 + B.h; z++) for (let x = B.x0 - 1; x <= B.x0 + B.w; x++) {
      if (!inB(B, x + 0.5, z + 0.5, lv)) continue;
      if (!inB(B, x + 0.5, z - 0.5, lv)) out.push({ ref: { o: 'N', x, z, lv }, mx: x + 0.5, mz: z, nx: 0, nz: -1 });
      if (!inB(B, x + 0.5, z + 1.5, lv)) out.push({ ref: { o: 'N', x, z: z + 1, lv }, mx: x + 0.5, mz: z + 1, nx: 0, nz: 1 });
      if (!inB(B, x - 0.5, z + 0.5, lv)) out.push({ ref: { o: 'W', x, z, lv }, mx: x, mz: z + 0.5, nx: -1, nz: 0 });
      if (!inB(B, x + 1.5, z + 0.5, lv)) out.push({ ref: { o: 'W', x: x + 1, z, lv }, mx: x + 1, mz: z + 0.5, nx: 1, nz: 0 });
    }
    return out;
  }
  const isDoor = (e, E) => e === E.DOOR || e === E.DOOR_OPEN || e === E.DOOR_BROKEN;
  const isWin = (e, E) => e === E.WIN || e === E.WIN_OPEN || e === E.WIN_BROKEN;
  // se rehace el dibujo de los trozos del mundo de un edificio (las puertas nuevas: los huecos de entrada pasan a
  // tener hoja, que se tiene que ver)
  function redraw(B) {
    const W = G.World, seen = new Set();
    for (let z = B.z0 - 1; z <= B.z0 + B.h + 1; z += 1) for (let x = B.x0 - 1; x <= B.x0 + B.w + 1; x += 1) {
      const cx = x >> 5, cz = z >> 5, k = cx + ',' + cz;
      if (seen.has(k)) continue;
      seen.add(k);
      const c = W.chunkAt(cx, cz);
      if (!c || !c.view) continue;
      const old = c.view; c.view = null;
      G.WorldView.build(c); G.WorldView.dispose({ view: old });
    }
  }
  // cierra la planta baja de un edificio: las puertas (y los huecos de entrada), cerradas y bloqueadas; las ventanas,
  // cerradas y que no se rompan (y claveteadas, si boards). pz: el acertijo que decide qué pasa con cada puerta
  // ({ kind, label(d, p), use(d, p) }). Devuelve las puertas
  function shut(B, pz, boards) {
    const W = G.World, E = W.E, doors = [];
    let arch = false;
    for (const q of outerEdges(B, 0)) {
      const e = W.edgeGet(q.ref);
      // (en los mapas, las entradas suelen ser huecos sin hoja: aquí, puerta cerrada)
      if (isDoor(e, E) || e === E.ARCH) {
        if (e === E.ARCH) arch = true;
        W.unlockEdge(q.ref); W.setEdge(q.ref, E.DOOR); W.lockEdge(q.ref);
        const d = Object.assign({ kind: pz.kind, B, open: false, pz }, q);
        S.doors[W.edgeKey(q.ref)] = d; doors.push(d);
      } else if (isWin(e, E)) {
        if (e !== E.WIN) { W.setEdge(q.ref, E.WIN); if (W.clearGlass) W.clearGlass(q.ref); }
        W.lockEdge(q.ref);
        if (boards) plank(q);
      } else if (e === E.NONE) { W.setEdge(q.ref, E.WALL); W.lockEdge(q.ref); arch = true; }
    }
    if (arch) redraw(B);
    for (const d of doors) doorDeco(d);
    return doors;
  }
  // tablones clavados en cruz sobre una ventana de la planta baja
  function plank(q) {
    const y = gy(q.mx + q.nx * 0.3, q.mz + q.nz * 0.3) + 1.45, ry = Math.atan2(q.nx, q.nz);
    thing((p) => {
      p.box(0, 0, 0, 1.15, 0.13, 0.035, 0x7a6248, 0, 0, 0.42);
      p.box(0, 0.02, 0.01, 1.15, 0.13, 0.035, 0x6a5440, 0, 0, -0.38);
      p.box(0, -0.3, 0.005, 1.05, 0.12, 0.035, 0x84694c);
    }, q.mx + q.nx * 0.09, y, q.mz + q.nz * 0.09, ry, { noHull: true });
  }
  // lo que se ve en una puerta cerrada: el contorno de la hoja (cuando estás cerca) y, según cómo esté cerrada, la
  // tranca por dentro, el candado por fuera o la luz roja de la puerta automática
  function doorDeco(d) {
    const ry = Math.atan2(d.nx, d.nz), y = gy(d.mx + d.nx * 0.4, d.mz + d.nz * 0.4);
    const leaf = thing((p) => p.box(0, 1.02, 0, 0.9, 2.04, 0.1, 0), d.mx, y, d.mz, ry, { hullOnly: true, k: 0.035 });
    hint(leaf, 4.2, () => !d.open && !S.carry);
    const parts = [];
    if (d.kind === 'tranca') {
      // por dentro: una tabla gruesa atravesada en sus dos soportes
      parts.push(thing((p) => {
        p.box(0, 1.05, 0, 1.1, 0.14, 0.08, 0x6a5038);
        for (const s2 of [-1, 1]) p.box(s2 * 0.5, 1.05, 0.03, 0.08, 0.24, 0.1, 0x3a3632);
      }, d.mx - d.nx * 0.12, y, d.mz - d.nz * 0.12, ry, { noHull: true }));
      // por fuera: la hoja, con tablas clavadas de arriba abajo (se ve que no cede)
      parts.push(thing((p) => {
        p.box(0, 1.3, 0, 0.95, 0.12, 0.04, 0x7a6248, 0, 0, 0.12);
        p.box(0, 0.72, 0, 0.95, 0.12, 0.04, 0x6e583e, 0, 0, -0.1);
      }, d.mx + d.nx * 0.08, y, d.mz + d.nz * 0.08, ry, { noHull: true }));
    } else if (d.kind === 'ganzua' || d.kind === 'llave') {
      // por fuera: el pasador con su candado (el de la ganzúa, viejo y oxidado)
      const rust = d.kind === 'ganzua' ? 0x7a5a3a : 0x9a8a4a;
      parts.push(thing((p) => {
        p.box(0.3, 1.05, 0, 0.26, 0.08, 0.03, 0x4a4a46);
        p.box(0.38, 0.95, 0.04, 0.1, 0.12, 0.05, rust);
        p.box(0.38, 1.02, 0.04, 0.07, 0.05, 0.02, 0x9a9a9a);
      }, d.mx + d.nx * 0.07, y, d.mz + d.nz * 0.07, ry, { noHull: true }));
    } else if (d.kind === 'electrica') {
      // la cajita del motor sobre la puerta y su piloto (rojo sin corriente)
      const box = thing((p) => { p.box(0, 2.18, 0, 0.9, 0.18, 0.12, 0x6a6e70); p.box(0.52, 1.3, 0, 0.12, 0.2, 0.05, 0x3a3e40); }, d.mx + d.nx * 0.08, y, d.mz + d.nz * 0.08, ry, { noHull: true });
      mats();
      const led = new THREE.Mesh(new THREE.SphereGeometry(0.03, 6, 4), new THREE.MeshBasicMaterial({ color: 0xd8301e }));
      led.material.toneMapped = false; led.position.set(0.52, 1.35, 0.03); box.g.add(led);
      d.led = led;
      parts.push(box);
      parts.keep = true;
    }
    d.parts = parts;
  }
  // abre una puerta cerrada (la tranca que se quita, la cerradura forzada, la llave, la corriente)
  function unlock(d, quiet) {
    const W = G.World;
    if (d.open) return;
    W.unlockEdge(d.ref); W.setEdge(d.ref, W.E.DOOR_OPEN);
    d.open = true;
    if (d.kind === 'electrica') { if (d.led) d.led.material.color.setHex(0x4ad83a); }
    else for (const t of d.parts || []) t.g.visible = false;
    if (!quiet) snd('doorOpen', { x: d.mx, z: d.mz, lv: 0 });
  }
  const unlockAll = (B) => { let n = 0; for (const k in S.doors) { const d = S.doors[k]; if (sameB(d.B, B) && !d.open) { unlock(d, n++ > 0); } } };
  // casillas libres dentro de un edificio (planta lv), sin muebles ni escalera: [{ x, z, d (lejos de from), walls }]
  function spotsIn(B, lv, from, reach) {
    const W = G.World, out = [];
    for (let z = B.z0; z < B.z0 + B.h; z++) for (let x = B.x0; x < B.x0 + B.w; x++) {
      const cx = x + 0.5, cz = z + 0.5;
      if (!inB(B, cx, cz, lv) || W.stairAt(cx, cz) || W.circleBlocked(cx, cz, 0.42, lv)) continue;
      if (reach && !reach.has(x + ',' + z)) continue;
      // (pegada a algo: a una pared o a un mueble; no en medio del paso)
      let walls = 0;
      for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (W.circleBlocked(cx + dx * 0.6, cz + dz * 0.6, 0.2, lv)) walls++;
      out.push({ x: cx, z: cz, d: from ? Math.hypot(cx - from.x, cz - from.z) : 0, walls });
    }
    return out;
  }

  // ---------- que se pueda andar: de un punto a otro dentro de un edificio ----------
  // Los muebles los coloca el mundo al azar; a veces un armario o una cama tapan el paso (la ventana por la que se
  // entra, la escalera, la puerta atrancada). Se busca el camino por casillas y, si no lo hay, se quitan los muebles
  // que estorban en el camino más corto. Devuelve las casillas a las que se llega (para poner las cosas ahí)
  function furnHit(x, z, r, lv) {
    const W = G.World, out = [];
    for (let tz = Math.floor(z - r); tz <= Math.floor(z + r); tz++) for (let tx = Math.floor(x - r); tx <= Math.floor(x + r); tx++) {
      const list = W.furnAt(tx, tz, lv);
      if (!list) continue;
      const c = W.chunkAt(tx >> 5, tz >> 5);
      for (const k of list) {
        const f = c.furn[k];
        if (!f.solid || f.gone || f.calmBlock) continue;
        const px = U.clamp(x, f.x0, f.x1), pz = U.clamp(z, f.z0, f.z1);
        if ((px - x) * (px - x) + (pz - z) * (pz - z) < r * r && !out.some((o) => o.f === f)) out.push({ c, f });
      }
    }
    return out;
  }
  function clearWay(B, lv, from, goal) {
    const W = G.World, E = W.E, R = 0.3;
    const key = (x, z) => x + ',' + z;
    const inside = (x, z) => inB(B, x + 0.5, z + 0.5, lv);
    const cellOk = (x, z, nf) => nf || !furnHit(x + 0.5, z + 0.5, R, lv).length;
    const stepOk = (ax, az, bx, bz, nf) => {
      const e = W.edgeBetween(ax, az, bx, bz, lv);
      if (e !== E.NONE && e !== E.ARCH && e !== E.DOOR_OPEN && e !== E.DOOR_BROKEN && e !== E.DOOR) return false;
      if (e === E.DOOR && W.isLocked(W.edgeRefBetween(ax, az, bx, bz, lv))) return false;
      return nf || !furnHit((ax + bx) / 2 + 0.5, (az + bz) / 2 + 0.5, R, lv).length;
    };
    const sx = Math.floor(from.x), sz = Math.floor(from.z);
    const bfs = (nf) => {
      const prev = new Map([[key(sx, sz), null]]), q = [[sx, sz]];
      let hit = null;
      while (q.length) {
        const [x, z] = q.shift();
        if (goal(x, z) && !hit) hit = [x, z];
        for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const nx = x + dx, nz = z + dz, k = key(nx, nz);
          if (prev.has(k) || !inside(nx, nz) || !cellOk(nx, nz, nf) || !stepOk(x, z, nx, nz, nf)) continue;
          prev.set(k, key(x, z)); q.push([nx, nz]);
        }
      }
      return { prev, hit };
    };
    // el sitio de partida, libre siempre
    for (const o of furnHit(from.x, from.z, 0.45, lv)) { W.removeFurn(o.c, o.f); S.removed.push(o.f.type); }
    for (let it = 0; it < 4; it++) {
      const r = bfs(false);
      if (r.hit) return new Set(r.prev.keys());
      const r2 = bfs(true);
      if (!r2.hit) return new Set(r.prev.keys());
      // lo que estorba en el camino más corto (sin contar los muebles): fuera
      let k = key(r2.hit[0], r2.hit[1]), n = 0;
      const path = [];
      while (k) { path.push(k.split(',').map(Number)); k = r2.prev.get(k); }
      for (let i = 0; i < path.length; i++) {
        const [x, z] = path[i], pts = [[x + 0.5, z + 0.5]];
        if (i + 1 < path.length) pts.push([(x + path[i + 1][0]) / 2 + 0.5, (z + path[i + 1][1]) / 2 + 0.5]);
        for (const [px, pz] of pts) for (const o of furnHit(px, pz, R + 0.04, lv)) { if (!o.f.gone) { W.removeFurn(o.c, o.f); S.removed.push(o.f.type); n++; } }
      }
      if (!n) return new Set(r.prev.keys());
    }
    return new Set(bfs(false).prev.keys());
  }

  // un arcón con su tapa (se abre al usarlo): lo que da, la primera vez. o: { label, head, out, text, style }
  function chest(x, z, lv, ry, o) {
    const y = gy(x, z, lv);
    const blue = o.style === 'baul';
    const c = thing((p) => {
      p.box(0, 0.24, 0, 1.0, 0.46, 0.52, blue ? 0x3e5a6a : 0x6e4a32);
      for (const s2 of [-1, 1]) p.box(s2 * 0.42, 0.24, 0, 0.06, 0.47, 0.53, blue ? 0x2a3a44 : 0x4a3a2a);
      p.box(0, 0.06, 0, 1.02, 0.06, 0.54, blue ? 0x2a3a44 : 0x4a3a2a);
    }, x, y, z, ry, { k: 0.035, lv });
    const lid = new THREE.Group(); lid.position.set(0, 0.47, -0.26); c.g.add(lid);
    const lm = new THREE.Mesh(geo((p) => { p.box(0, 0.05, 0.26, 1.02, 0.1, 0.54, blue ? 0x44627a : 0x7a5238); p.box(0, 0.05, 0.53, 0.12, 0.12, 0.03, 0x8a7a3a); }, 0), matBody);
    lm.castShadow = true; lid.add(lm);
    const st = { open: false, lid, c };
    hint(c, 5, () => !st.open && (!o.on || o.on()));
    if (!o.noProp) prop({ x, z, lv, reach: 1.6, label: o.label, off: () => st.open || (o.on && !o.on()),
      use: () => { openLid(st, o); return null; } });
    st.openIt = () => openLid(st, o);
    return st;
  }
  function openLid(st, o) {
    if (st.open) return;
    st.open = true;
    snd('doorOpen', { x: st.c.g.position.x, z: st.c.g.position.z, vol: 0.6 });
    let t = 0;
    anim((dt) => { t = Math.min(1, t + dt * 1.6); st.lid.rotation.x = -1.7 * U.smooth(t); return t < 1; });
    setTimeout(() => { if (!S) return; give(o.out, o.head, o.text); found(); }, 700);
  }
  // un arcón dentro de un edificio, en la planta lv, lejos de from y a donde se llega
  function chestIn(B, lv, from, o, reach) {
    const sp = spotsIn(B, lv, from, reach);
    const s = sp.filter((q) => q.walls > 0 && q.d > 1.6).sort((a, b) => b.d - a.d)[0] || sp.sort((a, b) => b.d - a.d)[0];
    if (!s) return null;
    return chest(s.x, s.z, lv, Math.atan2(from.x - s.x, from.z - s.z), o);
  }

  // ================= Los acertijos =================
  const PZ = {};

  // ---------------- ladder: la casa atrancada; se entra por la ventana de arriba con la escalera ----------------
  const LAD_L = 4.3;
  function ladderDraw(p) {
    const wd = 0x8a7050, wd2 = 0x6e583e;
    for (const s2 of [-1, 1]) p.box(s2 * 0.22, LAD_L / 2, 0, 0.06, LAD_L, 0.07, wd);
    for (let y = 0.3; y < LAD_L - 0.1; y += 0.32) p.box(0, y, 0, 0.44, 0.045, 0.045, wd2);
  }
  PZ.ladder = (C) => {
    const W = G.World, E = W.E, rng = S.rng;
    const H = C.house, B = bldOf(H);
    const casa = { state: 'lying', B, doors: [], win: null };
    S.casa = casa;
    if (!B) return 0;
    const pz = {
      kind: 'tranca',
      label: (d, p) => (inB(d.B, p.pos.x, p.pos.z, 0) ? 'Quitar la tranca' : 'Puerta atrancada'),
      use: (d, p) => {
        if (inB(d.B, p.pos.x, p.pos.z, 0)) { unlock(d); return 'Quitas la tranca: la puerta ya se abre'; }
        snd('bang', { x: d.mx, z: d.mz, vol: 0.4 });
        return casa.win ? 'Atrancada por dentro. Arriba hay una ventana abierta...' : 'Atrancada por dentro';
      }
    };
    casa.doors = shut(B, pz, true);
    // la ventana de arriba: la más cercana al sitio pensado, con sitio fuera para la escalera
    let best = null, bd = Infinity;
    for (const q of outerEdges(B, 1)) {
      const e = W.edgeGet(q.ref);
      if (!isWin(e, E)) continue;
      const fx = q.mx + q.nx * 1.7, fz = q.mz + q.nz * 1.7;
      if (W.circleBlocked(fx, fz, 0.45, 0) || W.circleBlocked(q.mx + q.nx * 0.8, q.mz + q.nz * 0.8, 0.35, 0)) continue;
      const d = H.win ? Math.hypot(q.mx - H.win.x, q.mz - H.win.z) : 0;
      if (d < bd) { bd = d; best = q; }
    }
    if (best) {
      W.setEdge(best.ref, E.WIN_OPEN); if (W.clearGlass) W.clearGlass(best.ref);
      casa.win = best;
      const g0 = gy(best.mx + best.nx * 1.6, best.mz + best.nz * 1.6), ins = { x: best.mx - best.nx * 0.62, z: best.mz - best.nz * 0.62 };
      const hUp = gy(ins.x, ins.z, 1) - g0, top = hUp + 1.0;
      if (isFinite(hUp) && hUp > 1) {
      const th = Math.acos(Math.min(0.99, top / LAD_L)), hor = Math.sqrt(Math.max(0, LAD_L * LAD_L - top * top));
      casa.lean = { th, hor, hUp, g0, ins, foot: { x: best.mx + best.nx * (hor + 0.06), z: best.mz + best.nz * (hor + 0.06) }, face: Math.atan2(-best.nx, -best.nz) };
      }
    }
    // que se pueda andar: arriba, de la ventana a la escalera; abajo, de cada puerta atrancada a la escalera
    let reachUp = null;
    const isStair = (x, z) => !!W.stairAt(x + 0.5, z + 0.5);
    if (casa.lean) reachUp = clearWay(B, 1, casa.lean.ins, isStair);
    for (const d of casa.doors) clearWay(B, 0, { x: d.mx - d.nx * 0.5, z: d.mz - d.nz * 0.5 }, isStair);
    // la escalera: tirada en uno de sus sitios (al azar)
    const L0 = C.ladders[Math.floor(rng() * C.ladders.length)];
    const lyaw = Math.atan2(L0[2], L0[3]);
    const lad = thing(ladderDraw, L0[0] - Math.sin(lyaw) * LAD_L / 2, gy(L0[0], L0[1]) + 0.05, L0[1] - Math.cos(lyaw) * LAD_L / 2, lyaw, { k: 0.04 });
    lad.inner = new THREE.Group(); lad.g.add(lad.inner);
    lad.inner.add(lad.body); lad.inner.add(lad.hull);
    lad.inner.rotation.set(Math.PI / 2, 0, 0);
    lad.cx = L0[0]; lad.cz = L0[1];
    casa.lad = lad;
    hint(lad, 7, () => casa.state === 'lying');
    // dónde va (un contorno de la escalera apoyada), mientras la llevas
    if (casa.lean) {
      const ghost = thing(ladderDraw, casa.lean.foot.x, casa.lean.g0, casa.lean.foot.z, casa.lean.face, { hullOnly: true, k: 0.03 });
      ghost.hull.rotation.x = casa.lean.th;
      hint(ghost, 16, () => casa.state === 'carried');
    }
    casa.take = prop({ x: lad.cx, z: lad.cz, reach: 2.0, label: 'Coger la escalera',
      off: () => casa.state !== 'lying' || !!S.carry,
      use: (p) => { carryStart(p, 'escalera', lad, 0.74); casa.state = 'carried'; snd('drag', { vol: 0.5 }); return casa.lean ? 'Llevas la escalera: búscale una pared con la ventana abierta' : null; } });
    prop({ x: 0, z: 0, reach: 1.2, label: 'Dejar la escalera en el suelo', id: 'drop',
      off: () => casa.state !== 'carried' || (casa.lean && dist(S.player, casa.lean.foot.x, casa.lean.foot.z) < 2.6),
      use: (p) => { ladderLay(p); return null; } });
    let n = 0;
    if (casa.lean) {
      const Ln = casa.lean;
      prop({ x: Ln.foot.x, z: Ln.foot.z, reach: 2.4, label: 'Apoyar la escalera',
        off: () => casa.state !== 'carried',
        use: () => { ladderLean(); return 'Apoyada bajo la ventana de arriba'; } });
      prop({ x: Ln.foot.x + casa.win.nx * 0.35, z: Ln.foot.z + casa.win.nz * 0.35, reach: 1.6, label: 'Subir por la escalera',
        off: () => casa.state !== 'placed',
        use: (p) => (p.startLadder && p.startLadder(ladderParams(false)) ? null : 'Ahora no puedes') });
      prop({ x: Ln.ins.x, z: Ln.ins.z, lv: 1, reach: 1.5, label: 'Bajar por la escalera',
        off: () => casa.state !== 'placed',
        use: (p) => (p.startLadder && p.startLadder(ladderParams(true)) ? null : 'Ahora no puedes') });
      // arriba: el arcón del dormitorio (lo mejor de la casa)
      if (chestIn(B, 1, Ln.ins, C.chest, reachUp)) n++;
    }
    // al acercarte a la casa: lo que pasa con las puertas
    if (casa.doors.length) {
      const d0 = casa.doors[0];
      S.near.push({ x: d0.mx + d0.nx, z: d0.mz + d0.nz, r: 3.2, once: true, fn: () => say(C.near || 'La casa está atrancada por dentro y las ventanas de abajo, claveteadas. Arriba, una se quedó abierta...') });
    }
    return n;
  };
  // la escalera, al hombro (la llevas tú)
  function carryStart(p, kind, t, slow) {
    S.carry = { kind, t, slow };
    p.carry = kind; p.carrySlow = slow;
    if (p.cur !== -1 && p.equip) p.equip(-1);
    p.aiming = false;
  }
  function carryEnd(p) { S.carry = null; p.carry = null; p.carrySlow = 1; }
  function ladderLay(p) {
    const casa = S.casa, lad = casa.lad;
    carryEnd(p);
    const yaw = p.facing, fx = Math.sin(yaw), fz = Math.cos(yaw);
    // en el suelo, a tu lado (a lo largo de hacia donde miras)
    const cx = p.pos.x + Math.cos(yaw) * 0.6, cz = p.pos.z - Math.sin(yaw) * 0.6;
    lad.g.position.set(cx - fx * LAD_L / 2, gy(cx, cz) + 0.05, cz - fz * LAD_L / 2);
    lad.g.rotation.set(0, yaw, 0);
    lad.inner.rotation.set(Math.PI / 2, 0, 0); lad.inner.position.set(0, 0, 0);
    lad.cx = cx; lad.cz = cz;
    if (casa.take) { casa.take.x = cx; casa.take.z = cz; }
    casa.state = 'lying';
    snd('drag', { vol: 0.4 });
  }
  function ladderLean() {
    const casa = S.casa, lad = casa.lad, Ln = casa.lean;
    carryEnd(S.player);
    lad.g.position.set(Ln.foot.x, Ln.g0, Ln.foot.z);
    lad.g.rotation.set(0, Ln.face, 0);
    lad.inner.position.set(0, 0, 0);
    lad.inner.rotation.set(Ln.th, 0, 0);
    casa.state = 'placed';
    snd('hitBlunt', { vol: 0.35 });
  }
  function ladderParams(down) {
    const casa = S.casa, Ln = casa.lean, w = casa.win;
    return {
      down, face: Ln.face, h: Ln.hUp,
      foot: { x: Ln.foot.x + w.nx * 0.42, z: Ln.foot.z + w.nz * 0.42 },
      top: { x: w.mx + w.nx * 0.42, z: w.mz + w.nz * 0.42 },
      ins: Ln.ins
    };
  }

  // ---------------- keyhunt: la llave está en uno de cuatro escondites; una nota dice cuál ----------------
  // Los escondites: lo que pone al buscar (vacío / con la llave), cómo lo dice la nota y su contorno. Si draw, el
  // escondite lo dibujamos aquí (no es un mueble del mapa); si no hay hull, el contorno es la caja del mueble
  const HIDES = {
    caseta: { label: 'Buscar en la caseta del perro', empty: 'Una manta vieja con pelos de perro. Nada más.', found: 'Bajo la manta de la caseta, envuelta en un trapo: {key}.',
      where: 'la guarda Canelo. Está en su caseta, debajo de la manta (a él no se la quita nadie).',
      hull: (p) => { p.box(0, 0.33, 0, 0.8, 0.62, 1.0, 0); p.box(0, 0.8, 0, 0.62, 0.3, 1.12, 0); } },
    pozo: { label: 'Mirar en el pozo', empty: 'Solo el cubo, vacío, y el agua muy abajo.', found: 'Colgada de un clavo por dentro del brocal, debajo del cubo: {key}.', reach: 1.9,
      where: 'está colgada de un clavo por dentro del pozo, debajo del cubo. No se te caiga al agua.',
      hull: (p) => { p.cyl(0, 0.43, 0, 0.84, 0.84, 0.86, 0, 14); p.box(0, 2.0, 0, 1.2, 0.32, 1.8, 0); for (const s2 of [-1, 1]) p.box(0, 1.36, s2 * 0.7, 0.11, 1.1, 0.11, 0); } },
    espantapajaros: { label: 'Registrar el espantapájaros', empty: 'Paja y un pañuelo. En los bolsillos, nada.', found: 'En el bolsillo del abrigo del espantapájaros: {key}.',
      where: 'va en el bolsillo del espantapájaros, que para algo le puse mi abrigo viejo.',
      hull: (p) => { p.cyl(0, 0.9, 0, 0.05, 0.05, 1.8, 0, 6); p.box(0, 1.25, 0, 0.5, 0.62, 0.26, 0); p.box(0, 1.43, 0, 1.4, 0.15, 0.17, 0); p.sph(0, 1.72, 0, 0.16, 0.18, 0.15, 0); p.cyl(0, 1.9, 0, 0.27, 0.15, 0.12, 0, 10); } },
    buzon: { label: 'Abrir el buzón', empty: 'Telarañas. Hace años que nadie deja nada aquí.', found: 'Al fondo del buzón, entre cartas viejas: {key}.', high: true,
      where: 'está en el buzón de la cancela. Ya nadie trae cartas.',
      hull: (p) => { p.box(0, 0.55, 0, 0.1, 1.1, 0.1, 0); p.box(0, 1.12, 0, 0.3, 0.26, 0.42, 0); } },
    nevera: { label: 'Abrir la nevera portátil', empty: 'Latas vacías y el agua del hielo, que se derritió hace mucho.', found: 'En el fondo de la nevera, en una bolsa de plástico: {key}.',
      where: 'la he metido en la nevera azul, la de la mesa grande. Nadie roba una nevera vacía.',
      draw: (p) => { p.box(0, 0.2, 0, 0.62, 0.38, 0.4, 0x2a6a9a); p.box(0, 0.41, 0, 0.64, 0.06, 0.42, 0xe8e4dc); p.box(0, 0.47, 0, 0.36, 0.04, 0.06, 0xe8e4dc); }, size: [0.64, 0.42, 0.45] },
    tienda: { label: 'Mirar en la tienda de campaña', reach: 2.0, empty: 'Un saco de dormir enrollado y una linterna sin pilas.', found: 'Dentro del saco de dormir, en el fondo: {key}.',
      where: 'está en la tienda grande, la que está sola junto al pino, dentro del saco de dormir.',
      hull: (p) => { for (const s2 of [-1, 1]) p.box(s2 * 0.6, 0.75, 0, 0.06, 1.75, 2.5, 0, 0, 0, s2 * 0.62); } },
    lena: { label: 'Mirar en la leñera', empty: 'Troncos y bichos. Mejor no meter más la mano.', found: 'Entre los troncos de arriba, envuelta en un trapo: {key}.',
      where: 'la he escondido en la leñera, entre los troncos de arriba.' },
    mesa: { label: 'Mirar debajo de la mesa', empty: 'Chicles pegados de hace años.', found: 'Pegada con cinta debajo del tablero: {key}.',
      where: 'está pegada con cinta debajo de la mesa de pícnic de la orilla.' },
    jarron: { label: 'Mirar en el jarrón de la tumba', empty: 'Flores secas y agua verde.', found: 'En el fondo del jarrón, entre las flores secas: {key}.',
      where: 'está en el jarrón de la tumba de doña Remedios, la del ciprés. Ella la guardará bien.',
      draw: (p) => { p.cyl(0, 0.16, 0, 0.1, 0.13, 0.32, 0x8a8e88, 10); p.cyl(0, 0.36, 0, 0.13, 0.1, 0.1, 0x8a8e88, 10); for (let k = 0; k < 5; k++) p.box((k - 2) * 0.04, 0.5, (k % 2) * 0.04 - 0.02, 0.02, 0.24, 0.02, 0x7a6a3a); }, size: [0.3, 0.3, 0.6] },
    fuente: { label: 'Mirar en la fuente', reach: 2.7, empty: 'Agua estancada y hojas. Nada en el fondo.', found: 'En el plato de arriba de la fuente, debajo del musgo: {key}.',
      where: 'la he dejado en el plato de arriba de la fuente, debajo del musgo.',
      hull: (p) => { p.cyl(0, 0.33, 0, 1.75, 1.75, 0.66, 0, 12); p.cyl(0, 1.05, 0, 0.8, 0.8, 0.14, 0, 12); p.cyl(0, 0.9, 0, 0.24, 0.24, 1.4, 0, 8); } },
    maceta: { label: 'Mirar en la maceta', empty: 'Tierra seca y un geranio muerto.', found: 'Enterrada en la maceta, a dos dedos: {key}.',
      where: 'está enterrada en la maceta grande, la del geranio.',
      draw: (p) => { p.cyl(0, 0.26, 0, 0.32, 0.24, 0.52, 0xa85a3a, 12); p.cyl(0, 0.5, 0, 0.3, 0.3, 0.04, 0x4a3a2a, 12); p.sph(0, 0.66, 0, 0.22, 0.18, 0.22, 0x5a5a3a); }, size: [0.7, 0.7, 0.8] },
    banco: { label: 'Mirar debajo del banco', empty: 'Hojas secas y una lagartija que sale corriendo.', found: 'Encajada debajo del asiento del banco: {key}.',
      where: 'está encajada debajo del banco que mira al valle.' },
    neumaticos: { label: 'Mirar entre los neumáticos', empty: 'Agua de lluvia y mosquitos.', found: 'Dentro del neumático de abajo, en una bolsa: {key}.',
      where: 'la he metido en el montón de neumáticos, en el de abajo.' }
  };
  // contorno de la caja de un mueble del mapa (el que haya en x, z): { x, z, draw }
  function furnHull(x, z) {
    const f = furnUnder(x, z, 0);
    if (!f) return null;
    const w = f.x1 - f.x0, d = f.z1 - f.z0;
    return { x: (f.x0 + f.x1) / 2, z: (f.z0 + f.z1) / 2, y: (f.y || 0) + 0.04, draw: (p) => p.box(0, f.h / 2, 0, w, f.h, d, 0) };
  }
  PZ.keyhunt = (C) => {
    const rng = S.rng, ids = Object.keys(C.hides);
    const key = { at: ids[Math.floor(rng() * ids.length)], clue: false, have: false, open: false };
    S.key = key;
    const KEY = C.keyName || 'la llave';
    for (const id of ids) {
      const h = HIDES[id], k = C.hides[id];
      if (!h) continue;
      let hl = null;
      if (h.draw) {
        // el escondite, dibujado aquí (con su estorbo para no atravesarlo)
        const y = surfY(k[0], k[1]);
        hl = thing(h.draw, k[0], y, k[1], k[2] || 0, { k: 0.035 });
        if (y - gy(k[0], k[1]) < 0.1 && h.size) blocker(k[0] - h.size[0] / 2, k[1] - h.size[1] / 2, k[0] + h.size[0] / 2, k[1] + h.size[1] / 2, h.size[2]);
      } else if (h.hull) hl = thing(h.hull, k[0], gy(k[0], k[1]), k[1], k[2] || 0, { hullOnly: true, k: 0.035 });
      else { const fh = furnHull(k[0], k[1]); if (fh) hl = thing(fh.draw, fh.x, fh.y, fh.z, 0, { hullOnly: true, k: 0.035 }); }
      hint(hl, 9, () => key.clue && !key.have && key.at === id);
      prop({ x: k[0], z: k[1], reach: h.reach || 1.6, label: h.label,
        off: () => key.open || !!S.carry,
        use: (p) => {
          act(p, 1.1, k[0], k[1], () => {
            if (id === key.at && !key.have) { key.have = true; snd('pickup'); say(fill(h.found, { key: KEY }), 'good'); }
            else if (id === key.at) say('Aquí estaba ' + KEY + '. Ya la llevas.');
            else { snd('rustle', { vol: 0.5 }); say(h.empty); }
          }, !h.high);
          return null;
        } });
    }
    // la nota que dice dónde está
    const N = C.clue, ny = N.y != null ? gy(N.x, N.z) + N.y : surfY(N.x, N.z);
    const cl = paper(N.x, ny, N.z, N.ry != null ? N.ry : 0.4);
    if (N.wall) { cl.g.rotation.set(Math.PI / 2, N.ry || 0, 0, 'YXZ'); }
    hint(cl, 4, () => !key.clue);
    prop({ x: N.fx != null ? N.fx : N.x, z: N.fz != null ? N.fz : N.z, reach: 1.6, label: N.label || 'Leer la nota',
      use: () => {
        key.clue = true;
        noteUI({ title: N.title, text: fill(N.text, { where: HIDES[key.at].where }) }, true);
        return null;
      } });
    // lo que abre la llave: una trampilla en el suelo, o la puerta de un edificio (con un arcón dentro)
    const T = C.target;
    if (T.kind === 'cellar') {
      const cy = gy(T.x, T.z);
      const cel = thing((p) => {
        p.box(0, 0.06, 0, 1.7, 0.12, 1.5, 0x8a8478);
        p.box(0, 0.13, 0, 1.46, 0.02, 1.28, 0x1c1a18);
      }, T.x, cy, T.z, T.face, { k: 0.04 });
      const leaves = [];
      for (const s2 of [-1, 1]) {
        const hg = new THREE.Group(); hg.position.set(s2 * 0.72, 0.15, 0); cel.g.add(hg);
        mats();
        const lf = new THREE.Mesh(geo((p) => {
          p.box(-s2 * 0.36, 0.03, 0, 0.7, 0.05, 1.24, 0x6a5038);
          for (let k = 0; k < 4; k++) p.box(-s2 * 0.36, 0.06, -0.45 + k * 0.3, 0.68, 0.012, 0.02, 0x4a3828);
          p.box(-s2 * 0.6, 0.075, 0, 0.12, 0.04, 0.3, 0x3a3a3a);
        }, 0), matBody);
        lf.castShadow = true; hg.add(lf); leaves.push({ hg, s2 });
      }
      const lock = thing((p) => { p.box(0, 0, 0, 0.12, 0.13, 0.05, 0x8a7a3a); p.box(0, 0.09, 0, 0.08, 0.06, 0.02, 0x9a9a9a); }, 0, 0.27, 0, 0, { noHull: true });
      S.group.remove(lock.g); cel.g.add(lock.g);
      hint(cel, 7, () => !key.open);
      prop({ x: T.x, z: T.z, reach: 1.9, lab: () => (key.have ? 'Abrir ' + (T.name || 'la trampilla') + ' con la llave' : (T.look || 'La trampilla')),
        off: () => key.open,
        use: () => {
          if (!key.have) { snd('clang', { vol: 0.4 }); return 'Un candado grueso la cierra. Hace falta ' + KEY + (key.clue ? '' : ': igual hay alguna nota por aquí'); }
          key.open = true; lock.g.visible = false;
          snd('doorOpen', { x: T.x, z: T.z });
          let t = 0;
          anim((dt) => { t = Math.min(1, t + dt * 1.2); for (const L of leaves) L.hg.rotation.z = -L.s2 * 1.9 * U.smooth(t); return t < 1; });
          setTimeout(() => { if (!S) return; give(C.reward.out, C.reward.head, C.reward.text); found(); }, 900);
          return null;
        } });
      return 1;
    }
    // la puerta de un edificio, cerrada con llave
    const B = bldOf(T.bld);
    if (!B) return 0;
    const doors = shut(B, {
      kind: 'llave',
      label: () => (key.have ? 'Abrir con la llave' : 'Cerrada con llave'),
      use: () => {
        if (!key.have) { snd('clang', { vol: 0.35 }); return 'Cerrada con llave. ' + (key.clue ? 'La nota decía dónde está' : 'Tiene que estar por aquí: busca alguna nota'); }
        unlockAll(B); key.open = true;
        return 'La llave entra a la primera. Abierto';
      }
    }, !!T.boards);
    const d0 = doors[0] || { mx: B.x0 + B.w / 2, mz: B.z0 + B.h, nx: 0, nz: 1 };
    const from = { x: d0.mx - d0.nx * 0.5, z: d0.mz - d0.nz * 0.5 };
    const reach = clearWay(B, 0, from, () => false);
    S.blds[T.id || 'key'] = { B, from, reach };
    if (T.near && doors.length) S.near.push({ x: d0.mx + d0.nx, z: d0.mz + d0.nz, r: 3.0, once: true, fn: () => say(T.near) });
    return chestIn(B, 0, from, Object.assign({ on: () => key.open }, C.reward), reach) ? 1 : 0;
  };

  // ---------------- rope: un fardo colgado muy alto; un disparo a la cuerda ----------------
  PZ.rope = (C) => {
    const T = C, top = T.y + (T.rope || 2.4);
    const fardo = { state: 'hang', y: T.y, vy: 0 };
    S.fardo = fardo;
    const gT = gy(T.hx, T.hz);
    const rope = thing((p) => p.cyl(0, 0, 0, 0.018, 0.018, 1, 0xb8a888, 5), T.hx, 0, T.hz, 0, { noHull: true });
    const ropeSet = (y0, y1) => { rope.g.position.y = (y0 + y1) / 2; rope.g.scale.y = Math.max(0.01, y1 - y0); };
    ropeSet(gT + T.y + 0.38, gT + top);
    const bag = T.bag;
    const bun = thing(bag ? (p) => {
      // una mochila (o una saca) colgada
      p.box(0, -0.05, 0, 0.42, 0.56, 0.26, bag === 'saca' ? 0x8a7a5a : 0x3a5a7a);
      p.box(0, 0.05, 0.15, 0.32, 0.26, 0.08, bag === 'saca' ? 0x6a5a3e : 0x2a4a6a);
      p.box(0, 0.29, 0, 0.3, 0.05, 0.2, 0x2a2a2a);
      p.box(0, 0.36, 0, 0.06, 0.12, 0.06, 0xb8a888);
    } : (p) => {
      p.sph(0, 0, 0, 0.32, 0.4, 0.28, 0x6a5a3e);
      p.box(0, 0.05, 0.2, 0.3, 0.3, 0.12, 0x5a4a30);
      p.cyl(0, -0.28, 0, 0.16, 0.16, 0.62, 0x4a5a3a, 8, 0, 0, Math.PI / 2);
      p.box(0, 0.36, 0, 0.06, 0.12, 0.06, 0xb8a888);
    }, T.hx, gT + T.y, T.hz, 0.6, { k: 0.04 });
    hint(bun, 18, () => fardo.state === 'hang' || fardo.state === 'down');
    const drop = () => {
      if (fardo.state !== 'hang') return;
      fardo.state = 'fall'; fardo.vy = 0;
      snd('rip', { x: T.hx, z: T.hz, vol: 0.5 });
      ropeSet(gT + T.y + 1.4, gT + top);
      anim((dt) => {
        fardo.vy -= 9.8 * dt; fardo.y += fardo.vy * dt;
        bun.g.rotation.z += dt * 2.5;
        if (fardo.y <= 0.32) { fardo.y = 0.32; fardo.state = 'down'; bun.g.rotation.z = 1.2; snd('land', { x: T.hx, z: T.hz }); say(T.fell || 'Ha caído'); }
        bun.g.position.y = gT + fardo.y;
        return fardo.state === 'fall';
      });
    };
    S.targets.push({ seg: [[T.hx, gT + T.y + 0.35, T.hz], [T.hx, gT + top, T.hz]], r: 0.13, on: () => fardo.state === 'hang', hit: drop });
    S.targets.push({ sph: [T.hx, gT + T.y, T.hz], r: 0.46, on: () => fardo.state === 'hang', hit: drop });
    S.near.push({ x: T.x, z: T.z, r: 9, once: true, fn: () => say(T.near + (canShoot(S.player) ? '' : ' (pero no llevas nada con lo que disparar)')) });
    prop({ x: T.hx, z: T.hz, reach: 1.8, label: T.openLabel || 'Abrir el fardo',
      off: () => fardo.state !== 'down',
      use: () => { fardo.state = 'open'; bun.g.visible = false; give(C.reward.out, C.reward.head, C.reward.text); found(); return null; } });
    prop({ x: T.hx, z: T.hz, reach: 2.2, label: T.lookLabel || 'Mirar el fardo colgado',
      off: () => fardo.state !== 'hang',
      use: () => (canShoot(S.player) ? 'No llegas ni subiéndote a algo. La cuerda, en cambio, tiene mala pinta: un disparo' : 'No llegas. Con un arma de fuego o un arco se podría cortar la cuerda') });
    return 1;
  };

  // ---------------- pick: un edificio cerrado con llave; se fuerza la cerradura ----------------
  PZ.pick = (C) => {
    const B = bldOf(C.bld);
    if (!B) return 0;
    const doors = shut(B, {
      kind: 'ganzua',
      label: () => (S.lock || S.carry ? 'Cerrada con llave' : 'Forzar la cerradura'),
      use: (d, p) => (S.carry ? 'Primero suelta lo que llevas' : crackStart(p, 'pick', d.mx, d.mz, () => { unlock(d); say(C.opened || 'Clic. La cerradura cede: está abierto', 'good'); }, 'Mueve la horquilla con el joystick y toca Girar. Para dejarlo, salta o esquiva'))
    }, !!C.boards);
    const d0 = doors[0] || { mx: B.x0 + B.w / 2, mz: B.z0 + B.h, nx: 0, nz: 1 };
    const from = { x: d0.mx - d0.nx * 0.5, z: d0.mz - d0.nz * 0.5 };
    const reach = clearWay(B, 0, from, () => false);
    S.blds[C.id || 'pick'] = { B, from, reach };
    if (doors.length) S.near.push({ x: d0.mx + d0.nx, z: d0.mz + d0.nz, r: 3.0, once: true, fn: () => say(C.near || 'Cerrado con llave. La cerradura es vieja: con una horquilla se podría forzar') });
    return chestIn(B, 0, from, C.chest, reach) ? 1 : 0;
  };

  // ---------------- combo: un baúl con candado de combinación; las tres cifras, repartidas ----------------
  PZ.combo = (C) => {
    const rng = S.rng, dg = () => 1 + Math.floor(rng() * 9);
    const code = [dg(), dg(), dg()];
    S.code = code;
    const locker = { read: false, open: false, seen: [false, false, false], dial: [0, 0, 0], names: C.names || ['?', '?', '?'], code };
    S.locker = locker;
    const Lk = C.box, inside = Lk.inside && S.blds[Lk.inside];
    let lx = Lk.x, lz = Lk.z, lf = Lk.face || 0;
    // (dentro de un edificio que se abre con otro acertijo: en una casilla libre de dentro)
    if (inside) {
      const sp = spotsIn(inside.B, 0, inside.from, inside.reach).filter((q) => q.walls > 0 && q.d > 1.4).sort((a, b) => b.d - a.d);
      const used = S.props.filter((q) => !q.lv).map((q) => [q.x, q.z]);
      const s = sp.find((q) => !used.some((u) => Math.hypot(u[0] - q.x, u[1] - q.z) < 1.3)) || sp[0];
      if (s) { lx = s.x; lz = s.z; lf = Math.atan2(inside.from.x - s.x, inside.from.z - s.z); }
    }
    const ly = gy(lx, lz);
    const st = chest(lx, lz, 0, lf, Object.assign({ noProp: true, style: Lk.style }, C.reward));
    st.c.g.rotation.y = lf;
    const pad = new THREE.Mesh(geo((p) => { p.box(0, -0.09, 0.56, 0.11, 0.13, 0.05, 0x8a7a3a); p.box(0, -0.02, 0.56, 0.07, 0.06, 0.02, 0x9a9a9a); }, 0), matBody); st.lid.add(pad);
    const note = paper(0, 0.11, 0.28, 0.2); S.group.remove(note.g); st.lid.add(note.g); note.g.position.set(0.1, 0.105, 0.3);
    prop({ x: lx, z: lz, reach: 1.7, label: C.readLabel || 'Leer la nota del candado',
      off: () => locker.read,
      use: () => { locker.read = true; noteUI({ title: C.note.title, text: C.note.text }, true); return null; } });
    prop({ x: lx, z: lz, reach: 1.7, label: C.openLabel || 'Abrir el candado',
      off: () => !locker.read || locker.open,
      use: () => { codeUI(); return null; } });
    locker.openIt = () => { locker.open = true; pad.visible = false; note.g.visible = false; st.openIt(); };
    // las pistas: pintadas o grabadas (se leen al mirarlas) o en un papel dentro de un edificio
    C.clues.forEach((K, i) => {
      const d = code[i];
      if (K.kind === 'in') {
        const ib = S.blds[K.inside];
        if (!ib) return;
        const sp = spotsIn(ib.B, 0, ib.from, ib.reach).filter((q) => q.walls > 0).sort((a, b) => b.d - a.d);
        const used = S.props.filter((q) => !q.lv).map((q) => [q.x, q.z]);
        const s = sp.find((q) => !used.some((u) => Math.hypot(u[0] - q.x, u[1] - q.z) < 1.5)) || sp[1] || sp[0];
        if (!s) return;
        const box = thing((p) => { p.box(0, 0.06, 0, 0.32, 0.12, 0.22, 0x8a8e6a); p.box(0, 0.125, 0, 0.26, 0.01, 0.17, 0xe6dcc4); }, s.x, gy(s.x, s.z), s.z, rng() * 3, { k: 0.03 });
        hint(box, 5, () => locker.read && !locker.open);
        prop({ x: s.x, z: s.z, reach: 1.5, label: K.label,
          use: () => { locker.seen[i] = true; noteUI({ title: K.title, text: fill(K.text, { d }) }); return null; } });
        return;
      }
      const g0 = gy(K.x, K.z);
      // (lo que lleva la cifra, si no es un mueble del mapa: el poste del muelle, una lápida)
      if (K.post) { const t = thing((p) => { p.cyl(0, 0.65, 0, 0.13, 0.11, 1.3, 0x5a4a38, 8); p.box(0, 1.32, 0, 0.3, 0.04, 0.3, 0x4a3a2a); }, K.x, g0, K.z, 0, { k: 0.035 }); hint(t, 6, () => locker.read && !locker.open); blocker(K.x - 0.14, K.z - 0.14, K.x + 0.14, K.z + 0.14, 1.3); }
      if (K.stone) {
        const ry = K.ry || 0, sx = Math.sin(ry), sz = Math.cos(ry);
        const t = thing((p) => { p.box(0, 0.06, 0.35, 0.95, 0.12, 1.6, 0x8a867e); p.box(0, 0.5, 0, 0.72, 0.84, 0.15, 0x9a968c); p.cyl(0, 0.92, 0, 0.36, 0.36, 0.15, 0x9a968c, 14, Math.PI / 2); p.box(0, 0.16, 0.6, 0.6, 0.06, 1.0, 0x5e5a46); }, K.x, g0, K.z, ry, { k: 0.035 });
        hint(t, 6, () => locker.read && !locker.open);
        blocker(K.x - 0.45, K.z - 0.45, K.x + 0.45, K.z + 0.45, 1.0);
        decal(textTex(K.stone.map((l) => fill(l, { d })), { size: 30, size2: 26, col: '#2a2824', w: 256, h: 192, font: 'Georgia, serif' }), 0.62, 0.46, K.x + sx * 0.08, g0 + 0.58, K.z + sz * 0.08, ry, 0.85);
        if (K.px == null) { K.px = K.x + sx * 0.9; K.pz = K.z + sz * 0.9; K.fx = K.x; K.fz = K.z; }
      }
      if (K.hull) { const hl = thing((p) => p.box(0, K.hull[1] / 2, 0, K.hull[0], K.hull[1], K.hull[2], 0), K.hx != null ? K.hx : K.x, g0 + (K.hy || 0), K.hz != null ? K.hz : K.z, K.hry || 0, { hullOnly: true, k: 0.04 }); hint(hl, 7, () => locker.read && !locker.open); }
      if (K.decal) {
        const D = K.decal;
        decal(textTex(D.lines.map((l) => fill(l, { d })), { size: D.size || 46, col: D.col || '#f2ece0', font: D.font, w: D.tw, h: D.th, bg: D.bg, band: D.band }), D.w, D.h, D.x, g0 + D.y, D.z, D.ry || 0, D.opa);
      }
      prop({ x: K.px != null ? K.px : K.x, z: K.pz != null ? K.pz : K.z, reach: K.reach || 2.0, label: K.label, fx: K.fx, fz: K.fz,
        use: () => { locker.seen[i] = true; return fill(K.say, { d }); } });
    });
    S.near.push({ x: lx, z: lz, r: 3.0, once: true, fn: () => say(C.near || 'Un candado de combinación y una nota') });
    return 1;
  };

  // ---------------- power: gasolina, el generador (minijuego) y lo que mueve la corriente ----------------
  PZ.power = (C) => {
    const rng = S.rng;
    const jaula = { can: false, fuel: false, power: false, state: 'sunk', t: 0 };
    S.jaula = jaula;
    const cs = C.cans[Math.floor(rng() * C.cans.length)];
    const can = thing((p) => {
      p.box(0, 0.24, 0, 0.18, 0.46, 0.34, 0xa8321e);
      p.box(0, 0.5, -0.06, 0.06, 0.07, 0.16, 0x7a2416);
      p.cyl(0, 0.52, 0.12, 0.03, 0.03, 0.08, 0x2a2a2a, 6);
    }, cs[0], surfY(cs[0], cs[1]), cs[1], rng() * 3, { k: 0.03 });
    hint(can, 6, () => !jaula.can && !jaula.fuel);
    prop({ x: cs[0], z: cs[1], reach: 1.5, label: 'Coger el bidón de gasolina',
      off: () => jaula.can || jaula.fuel || !!S.carry,
      use: (p) => { jaula.can = true; carryStart(p, 'bidon', can, 0.9); snd('pickup', { vol: 0.6 }); return 'Pesa: aún le queda gasolina'; } });
    const Gn = C.gen, gf = Gn.face || 0, gfx = Math.sin(gf), gfz = Math.cos(gf);
    const genH = thing((p) => p.box(0, 0.62, 0, 1.75, 1.26, 0.95, 0), Gn.x, gy(Gn.x, Gn.z), Gn.z, gf, { hullOnly: true, k: 0.035 });
    hint(genH, 7, () => jaula.can || (jaula.fuel && !jaula.power));
    const T = C.target;
    let after = null;
    prop({ x: Gn.x + gfx * 0.75, z: Gn.z + gfz * 0.75, reach: 1.7, lab: () => (jaula.can ? 'Llenar el depósito' : (jaula.fuel ? 'Arrancar el generador' : 'Mirar el generador')), fx: Gn.x + gfx * 0.5, fz: Gn.z + gfz * 0.5,
      off: () => jaula.power || !!S.lock,
      use: (p) => {
        if (jaula.can) {
          act(p, 1.8, Gn.x, Gn.z, () => {
            jaula.can = false; jaula.fuel = true; carryEnd(p);
            can.g.position.set(Gn.x + gfz * 1.1, gy(Gn.x + gfz * 1.1, Gn.z - gfx * 1.1), Gn.z - gfx * 1.1);
            snd('slide', { vol: 0.4 });
            say('Depósito lleno. Ahora, a arrancarlo');
          }, true);
          return null;
        }
        if (!jaula.fuel) return 'El depósito está seco. Hace falta gasolina';
        return crackStart(p, 'pull', Gn.x, Gn.z, () => {
          jaula.power = true;
          snd('crackle', { x: Gn.x, z: Gn.z, vol: 0.5 });
          if (after) after();
        }, 'Tira de la cuerda cuando la marca pase por la franja (tres tirones buenos). Para dejarlo, salta o esquiva');
      } });
    // el ruido del motor en marcha (de vez en cuando, cerca)
    let hum = 0;
    anim((dt) => { if (jaula.power && (hum -= dt) <= 0) { hum = 1.6 + Math.random(); if (dist(S.player, Gn.x, Gn.z) < 14) snd('slide', { x: Gn.x, z: Gn.z, vol: 0.12 }); } return true; });
    // bombillas colgadas entre dos puntos (se encienden con la corriente)
    S.bulbs = [];
    if (C.bulbs) {
      // cada extremo: [x, z, alto, base (si no, el suelo)]
      const end = (q) => { const b = q[3] != null ? q[3] : gy(q[0], q[1]); return { x: q[0], z: q[1], b, y: b + q[2] }; };
      const A = end(C.bulbs[0]), Bq = end(C.bulbs[1]);
      mats();
      for (let k = 0; k <= 9; k++) {
        const u = k / 9, x = U.lerp(A.x, Bq.x, u), z = U.lerp(A.z, Bq.z, u), y = U.lerp(A.y, Bq.y, u) - Math.sin(u * Math.PI) * 0.5;
        const b = new THREE.Mesh(new THREE.SphereGeometry(0.07, 6, 4), matDark); b.position.set(x, y, z); S.group.add(b); S.bulbs.push(b);
      }
      for (const q of [A, Bq]) { const h = q.y - q.b + 0.25; thing((p) => p.cyl(0, h / 2, 0, 0.05, 0.05, h, 0x4a4038, 6), q.x, q.b, q.z, 0, { noHull: true }); }
      const pts = [new THREE.Vector3(A.x, A.y + 0.1, A.z)].concat(S.bulbs.map((b) => b.position.clone().add(new THREE.Vector3(0, 0.07, 0))), [new THREE.Vector3(Bq.x, Bq.y + 0.1, Bq.z)]);
      for (let k = 0; k < pts.length - 1; k++) {
        const a = pts[k], b = pts[k + 1], L = a.distanceTo(b);
        const w = thing((p) => p.box(0, 0, 0.5, 0.018, 0.018, 1, 0x2a2622), a.x, a.y, a.z, 0, { noHull: true });
        w.g.scale.set(1, 1, L); w.g.lookAt(b);
      }
    }
    const lightsOn = () => { mats(); for (const b of S.bulbs) b.material = matGlow; if (S.winLamp) S.winLamp.material = matGlow; };
    if (T.kind === 'door') {
      // una puerta automática: sin corriente no se abre
      const B = bldOf(T.bld);
      if (!B) return 0;
      const doors = shut(B, {
        kind: 'electrica',
        label: () => 'Puerta automática',
        use: () => { snd('clang', { vol: 0.3 }); return T.locked || 'Es automática y sin corriente no se mueve. Tiene que haber un generador'; }
      }, false);
      const d0 = doors[0] || { mx: B.x0 + B.w / 2, mz: B.z0 + B.h, nx: 0, nz: 1 };
      const from = { x: d0.mx - d0.nx * 0.5, z: d0.mz - d0.nz * 0.5 };
      const reach = clearWay(B, 0, from, () => false);
      S.blds[T.id || 'power'] = { B, from, reach };
      after = () => {
        lightsOn();
        setTimeout(() => { if (!S) return; unlockAll(B); snd('slide', { x: d0.mx, z: d0.mz, vol: 0.5 }); say(T.opened || 'Con un zumbido, la puerta automática se abre', 'good'); }, 700);
      };
      if (doors.length) S.near.push({ x: d0.mx + d0.nx, z: d0.mz + d0.nz, r: 3.0, once: true, fn: () => say(T.near || 'La puerta es automática y no hay corriente') });
      return chestIn(B, 0, from, Object.assign({ on: () => jaula.power }, C.reward), reach) ? 1 : 0;
    }
    // el cabrestante (junto al muelle) y la jaula en el fondo, atada al cabo
    const Wn = T.winch;
    const win = thing((p) => {
      p.box(0, 0.12, 0, 0.9, 0.24, 0.7, 0x5a5a56);
      for (const s2 of [-1, 1]) p.box(s2 * 0.36, 0.5, 0, 0.08, 0.6, 0.5, 0x4a4a46);
      p.cyl(0, 0.62, 0, 0.18, 0.18, 0.64, 0x8a6a3a, 10, 0, 0, Math.PI / 2);
      p.box(-0.55, 0.45, 0, 0.3, 0.32, 0.36, 0x2e5a3a);
      p.box(0.2, 0.35, 0.36, 0.2, 0.2, 0.04, 0x3a3a36);
    }, Wn.x, gy(Wn.x, Wn.z), Wn.z, 0, { k: 0.035 });
    blocker(Wn.x - 0.5, Wn.z - 0.4, Wn.x + 0.5, Wn.z + 0.4, 0.9);
    const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 4), matDark); lamp.position.set(0.2, 0.47, 0.39); win.g.add(lamp);
    S.winLamp = lamp;
    hint(win, 7, () => jaula.power && jaula.state === 'sunk');
    after = () => { lightsOn(); say('El generador arranca. Se encienden las bombillas del muelle', 'good'); };
    const Cg = T.cage;
    const cage = thing((p) => {
      const c = 0x6a6e70;
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) p.box(sx * 0.45, 0, sz * 0.35, 0.05, 0.9, 0.05, c);
      for (const y of [-0.43, 0.43]) { p.box(0, y, 0.35, 0.95, 0.05, 0.05, c); p.box(0, y, -0.35, 0.95, 0.05, 0.05, c); p.box(0.45, y, 0, 0.05, 0.05, 0.75, c); p.box(-0.45, y, 0, 0.05, 0.05, 0.75, c); }
      for (let k = -2; k <= 2; k++) { p.box(k * 0.18, 0, 0.35, 0.015, 0.86, 0.015, c); p.box(k * 0.18, 0, -0.35, 0.015, 0.86, 0.015, c); }
      p.box(0, -0.2, 0, 0.7, 0.4, 0.5, 0x4a5a5e);
      p.box(0.1, 0.1, 0.05, 0.4, 0.22, 0.3, 0x8a5a3a);
    }, Cg.x0, cageY(Cg.x0, Cg.z0), Cg.z0, 0.3, { k: 0.04 });
    const cable = thing((p) => p.box(0, 0, 0.5, 0.025, 0.025, 1, 0xc8bca0), 0, 0, 0, 0, { noHull: true });
    const cableSet = () => {
      const ax = Wn.x, ay = gy(Wn.x, Wn.z) + 0.62, az = Wn.z, b = cage.g.position;
      const dx = b.x - ax, dy = (b.y + 0.4) - ay, dz = b.z - az, L = Math.hypot(dx, dy, dz);
      cable.g.position.set(ax, ay, az); cable.g.scale.set(1, 1, L);
      cable.g.rotation.set(0, 0, 0); cable.g.lookAt(ax + dx, ay + dy, az + dz);
    };
    cableSet();
    hint(cage, 6, () => jaula.state === 'up');
    prop({ x: Wn.x, z: Wn.z + 0.7, reach: 1.7, lab: () => (jaula.power ? 'Poner en marcha el cabrestante' : 'Mirar el cabrestante'), fx: Wn.x, fz: Wn.z,
      off: () => jaula.state !== 'sunk',
      use: (p) => {
        if (!jaula.power) return 'Es eléctrico: sin corriente no se mueve. ' + (T.cableTo || 'El cable va al generador');
        jaula.state = 'pull'; jaula.t = 0;
        act(p, 3.8, Wn.x, Wn.z, () => {}, false);
        snd('drag', { x: Wn.x, z: Wn.z });
        say('El cabo se tensa y algo grande sale del agua, arrastrándose por la arena');
        anim((dt) => {
          jaula.t = Math.min(1, jaula.t + dt / 3.8);
          const u = U.smooth(jaula.t), x = U.lerp(Cg.x0, Cg.x1, u), z = U.lerp(Cg.z0, Cg.z1, u);
          cage.g.position.set(x, cageY(x, z), z); cage.g.rotation.y = 0.3 + u * 0.4;
          cableSet();
          if (Math.random() < dt * 2.5) snd('drag', { x, z, vol: 0.35 });
          if (jaula.t >= 1) { jaula.state = 'up'; snd('hitBlunt', { x, z, vol: 0.5 }); }
          return jaula.t < 1;
        });
        return null;
      } });
    prop({ x: Cg.x1, z: Cg.z1 - 0.7, reach: 1.7, label: 'Abrir la jaula', fx: Cg.x1, fz: Cg.z1,
      off: () => jaula.state !== 'up',
      use: () => { jaula.state = 'open'; snd('clang', { x: Cg.x1, z: Cg.z1, vol: 0.5 }); give(C.reward.out, C.reward.head, C.reward.text); found(); return null; } });
    S.near.push({ x: Wn.x, z: Wn.z, r: 4.0, once: true, fn: () => say('Un cabrestante, y el cabo se pierde en el agua: algo hay atado al fondo') });
    return 1;
  };
  // la jaula sigue el fondo (bajo el agua) y luego la arena
  function cageY(x, z) { const t = G.World.terrainAt(x, z); return t + 0.46 - (t < 0 ? 0.4 : 0); }

  // ================= Lo que adorna (sin acertijo) =================
  const DECO = {
    // el muelle: tablas sobre postes, desde la arena mar adentro
    dock(D) {
      thing((p) => {
        const wd = 0x7a6650, dk = 0x4e4234, L = D.z1 - D.z0;
        for (let z = 0; z <= L; z += 2.4) for (const s2 of [-1, 1]) p.cyl(s2 * 1.05, -1.4 - D.y / 2, z, 0.13, 0.12, 2.8 + D.y, dk, 7);
        for (const s2 of [-0.6, 0.6]) p.box(s2, -0.18, L / 2, 0.16, 0.2, L, dk);
        for (let z = 0.2; z < L; z += 0.48) p.box(0, 0, z, 2.4, 0.07, 0.42, U.shade(wd, 0.86 + ((z * 7.3) % 1) * 0.28));
        for (let z = 2; z < L; z += 4.8) p.box(1.1, 0.2, z, 0.14, 0.3, 0.14, dk);
      }, D.x, D.y, D.z0, 0, { noHull: true });
    },
    // la espadaña de la ermita: el muro de la campana sobre el tejado
    bell(D) {
      const y = gy(D.x, D.z);
      const g = thing((p) => {
        p.box(0, D.h / 2, 0, 1.6, D.h, 0.36, 0xece6da);
        p.box(0, D.h + 0.5, 0, 1.2, 1.0, 0.36, 0xece6da);
        p.box(0, D.h + 1.1, 0, 0.5, 0.2, 0.36, 0xe2dccf);
        p.box(0, D.h + 0.45, 0, 0.62, 0.72, 0.4, 0x2a2622);
        p.cyl(0, D.h + 0.42, 0, 0.12, 0.24, 0.42, 0x8a6a2a, 10);
        p.box(0, D.h + 1.4, 0, 0.05, 0.5, 0.05, 0x3a3632); p.box(0, D.h + 1.5, 0, 0.3, 0.05, 0.05, 0x3a3632);
      }, D.x, y, D.z, D.ry || 0, { noHull: true });
      return g;
    },
    // la grúa de agua del andén (para las locomotoras de vapor, de cuando las había)
    crane(D) {
      thing((p) => {
        p.cyl(0, 1.6, 0, 0.16, 0.2, 3.2, 0x3a4a44, 10);
        p.cyl(0, 0.12, 0, 0.36, 0.4, 0.24, 0x2e3a36, 10);
        p.box(0, 3.15, 1.2, 0.18, 0.18, 2.6, 0x3a4a44);
        p.cyl(0, 2.85, 2.4, 0.1, 0.12, 0.5, 0x3a4a44, 8);
        p.box(0, 3.3, 0, 0.3, 0.16, 0.3, 0x2e3a36);
      }, D.x, gy(D.x, D.z), D.z, D.ry || 0, { noHull: true });
      blocker(D.x - 0.4, D.z - 0.4, D.x + 0.4, D.z + 0.4, 3);
    },
    // el reloj del andén (parado), sobre un poste
    clock(D) {
      const y = gy(D.x, D.z);
      thing((p) => { p.cyl(0, 1.4, 0, 0.06, 0.06, 2.8, 0x3a3632, 6); p.cyl(0, 2.95, 0, 0.36, 0.36, 0.14, 0x2a2a28, 16, Math.PI / 2); }, D.x, y, D.z, D.ry || 0, { noHull: true });
    }
  };

  // ================= Lo de todos: el fuego, las notas y la salida =================
  function common() {
    const C = S.cfg;
    // el fuego (encendido: las llamas y las brasas, sin luz propia para no recompilar nada)
    const R = C.rest, ry = gy(R.x, R.z);
    mats();
    const fl = new THREE.Group(); fl.position.set(R.x, ry, R.z); S.group.add(fl);
    const flames = [];
    for (let k = 0; k < 5; k++) {
      const m = new THREE.Mesh(new THREE.ConeGeometry(0.16 - k * 0.015, 0.6 - k * 0.05, 6), matFlame);
      const a = k / 5 * TAU;
      m.position.set(Math.sin(a) * (k ? 0.14 : 0), 0.3, Math.cos(a) * (k ? 0.14 : 0)); fl.add(m);
      flames.push({ m, ph: k * 1.7, b: 0.6 - k * 0.05 });
    }
    const embers = new THREE.Mesh(new THREE.CircleGeometry(0.42, 10), new THREE.MeshBasicMaterial({ color: 0xc84a1a, transparent: true, opacity: 0.55, depthWrite: false }));
    embers.material.toneMapped = false; embers.rotation.x = -Math.PI / 2; embers.position.y = 0.05; fl.add(embers);
    let crk = 1;
    anim((dt) => {
      for (const f of flames) { const s = 0.75 + 0.3 * Math.sin(S.t * 7 + f.ph) + 0.15 * Math.sin(S.t * 13 + f.ph * 2); f.m.scale.set(1, s, 1); f.m.position.y = f.b * s / 2 + 0.06; }
      // (cerca, el fuego crepita)
      if ((crk -= dt) <= 0) { crk = 1.8 + Math.random() * 2.2; if (dist(S.player, R.x, R.z) < 9) snd('crackle', { x: R.x, z: R.z, vol: 0.35 }); }
      return true;
    });
    S.near.push({ x: R.x, z: R.z, r: 3.5, once: true, fn: () => { if (S.player.health < 95) say('Un fuego encendido hace poco. Puedes sentarte un rato a descansar'); } });
    prop({ x: R.x, z: R.z, reach: 2.4, label: 'Descansar junto al fuego',
      off: () => S.restUsed || !!S.carry,
      use: (p) => {
        if (p.health >= 99) return 'Ahora no te hace falta: guárdalo para cuando estés tocado';
        S.restUsed = true;
        rest(() => { give({ vida: 60 }, 'Descansas junto al fuego', 'Te sientas un rato. El fuego calienta, nadie viene y, por una vez, no pasa nada.'); });
        return null;
      } });
    // las notas sueltas (se guardan en la mochila)
    for (const [x, z, id] of C.lore || []) {
      const t = paper(x, surfY(x, z), z, (x * 7) % 3);
      const st = { read: false };
      hint(t, 3.5, () => !st.read);
      prop({ x, z, reach: 1.5, label: 'Leer la nota',
        use: () => {
          const N = LORE[id];
          noteUI({ title: N.title, text: N.text }, false, () => {
            if (st.read) return;
            st.read = true; found();
            if (Notes.add(id)) say('Nota guardada en la mochila (pestaña Notas)', 'good');
          });
          return null;
        } });
    }
    // la salida: por donde se llegó
    const X = C.exit;
    prop({ x: X.x, z: X.z, reach: 2.6, label: 'Seguir el camino',
      off: () => !!S.carry,
      use: () => {
        const left = S.total - S.found;
        if (left > 0 && S.exitAsk <= 0) { S.exitAsk = 5; return 'Aún quedan cosas por descubrir aquí (' + left + '). Vuelve a pulsar para seguir el camino'; }
        endUI();
        return null;
      } });
  }

  // ================= Minijuegos (la ganzúa, el arranque del generador) =================
  function crackStart(p, kind, x, z, onDone, msg) {
    if (p.busy() || p.dead || S.lock) return null;
    p.aiming = false;
    p.action = { kind: 'pack', t: 0, dur: 1e9, impact: 2, face: Math.atan2(x - p.pos.x, z - p.pos.z), done: false, calmLock: true };
    S.lock = { a: p.action, onDone };
    if (G.SafeCrack) G.SafeCrack.start({ kind, tier: 0.35 });
    return msg;
  }
  function crackStop(msg) {
    const L = S.lock; if (!L) return;
    S.lock = null;
    if (G.SafeCrack) G.SafeCrack.stop();
    if (S.player.action === L.a) S.player.action = null;
    if (msg) say(msg);
  }
  function crackUpdate(dt) {
    const L = S.lock, p = S.player;
    if (!L) return;
    if (p.dead || p.action !== L.a) { crackStop('Lo dejas'); return; }
    const I = G.Input;
    if (I && (I.jump || I.dodge || I.crouch || I.pack)) { crackStop('Lo dejas'); return; }
    const r = G.SafeCrack ? G.SafeCrack.update(dt) : 'done';
    if (r === 'done') { crackStop(null); L.onDone(); }
  }

  // ================= Pantallas: notas, el candado, lo que encuentras y el final =================
  let uiRoot = null, hudEl = null, fadeEl = null, keyBound = false;
  function ensureUI() {
    if (uiRoot) return;
    uiRoot = document.createElement('div'); uiRoot.id = 'calm-ui'; uiRoot.className = 'hidden';
    document.body.appendChild(uiRoot);
    uiRoot.addEventListener('pointerdown', (e) => e.stopPropagation());
    uiRoot.addEventListener('click', (e) => {
      const b = e.target.closest('[data-k]');
      if (!b || !S || !S.ui) return;
      e.preventDefault();
      uiKey(b.dataset.k, b.dataset.d != null ? +b.dataset.d : null);
    });
    hudEl = document.createElement('div'); hudEl.id = 'calm-hud'; hudEl.className = 'hidden';
    document.body.appendChild(hudEl);
    fadeEl = document.createElement('div'); fadeEl.id = 'calm-fade';
    document.body.appendChild(fadeEl);
    if (!keyBound) {
      keyBound = true;
      document.addEventListener('keydown', (e) => {
        if (!S || !S.ui) return;
        const K = { ArrowUp: 'up', KeyW: 'up', ArrowDown: 'down', KeyS: 'down', ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right',
          Enter: 'ok', Space: 'ok', KeyE: 'ok', KeyT: 'ok', KeyF: 'ok', Escape: 'back', Backspace: 'back', KeyQ: 'back', KeyB: 'back' }[e.code];
        e.preventDefault(); e.stopPropagation();
        if (!K || e.repeat || performance.now() - S.ui.t0 < 250) return;
        uiKey(K);
      }, true);
    }
  }
  // (si ya hay una pantalla abierta, la nueva espera su turno: p. ej. lo que encuentras al cerrar una nota)
  function openUI(o) {
    ensureUI();
    if (S.ui) { S.uiQueue.push(o); return; }
    o.t0 = performance.now();
    S.ui = o;
    uiRoot.className = 'cu-' + o.kind;
    o.render();
    if (G.Audio && G.Audio.ui) G.Audio.ui('uiOk');
    if (!G.Input.isTouch && G.Input.pointerLocked && document.exitPointerLock) document.exitPointerLock();
  }
  function closeUI() {
    if (!S || !S.ui) return;
    const o = S.ui; S.ui = null;
    uiRoot.className = 'hidden'; uiRoot.innerHTML = '';
    if (G.Audio && G.Audio.ui) G.Audio.ui('uiBack');
    if (o.onClose) o.onClose();
    if (S && !S.ui && S.uiQueue.length) { openUI(S.uiQueue.shift()); return; }
    if (S && !S.ui && S.allDone && !S.allSaid) { S.allSaid = true; setTimeout(() => say('No queda nada por descubrir aquí. Cuando quieras, sigue el camino', 'good'), 900); }
    if (!G.Input.isTouch && G.Input.enabled && G.Input.requestLock && !(S && S.ui)) G.Input.requestLock();
  }
  function uiKey(k, d) { if (S && S.ui && S.ui.key) S.ui.key(k, d); }
  const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const para = (t) => esc(t).split('\n').map((l) => '<p>' + l + '</p>').join('');
  const hintKeys = () => (G.Input.isTouch ? '' : ' <small>(Esc)</small>');
  // una nota: here = es de esta parada (se ve en la mochila mientras sigas aquí). after: al cerrarla
  function noteUI(n, here, after) {
    if (here && !S.notes.some((x) => x.title === n.title)) S.notes.push({ title: n.title, text: n.text });
    snd('rustle', { vol: 0.35 });
    openUI({ kind: 'note', onClose: after,
      render() { uiRoot.innerHTML = '<div class="cu-card cu-paper"><h3>' + esc(n.title) + '</h3><div class="cu-txt">' + para(n.text) + '</div><div class="cu-ft"><button type="button" data-k="back">Cerrar' + hintKeys() + '</button></div></div>'; },
      key(k) { if (k === 'back' || k === 'ok') closeUI(); } });
  }
  // el candado: tres ruedas (0 a 9); ← → elige la rueda, ↑ ↓ cambia el número
  function codeUI() {
    const L = S.locker, o = { kind: 'code', sel: 0, msg: '', shake: 0 };
    o.render = () => {
      uiRoot.innerHTML = '<div class="cu-card cu-lock"><small>CANDADO DE COMBINACIÓN</small><div class="cu-dials' + (o.shake ? ' shake' : '') + '">' +
        L.dial.map((v, i) => '<div class="cu-dial' + (i === o.sel ? ' sel' : '') + '"><button type="button" data-k="inc" data-d="' + i + '">▲</button><b>' + v + '</b><button type="button" data-k="dec" data-d="' + i + '">▼</button><em>' + (L.seen[i] ? esc(L.names[i]) : '?') + '</em></div>').join('') +
        '</div><p class="cu-msg">' + (o.msg || (G.Input.isTouch ? 'Toca las flechas para girar cada rueda' : '← → elige la rueda · ↑ ↓ cambia el número')) + '</p>' +
        '<div class="cu-ft"><button type="button" data-k="ok">Abrir</button><button type="button" data-k="back">Dejarlo' + hintKeys() + '</button></div></div>';
    };
    o.key = (k, d) => {
      if (d != null && d !== undefined && !isNaN(d)) o.sel = d;
      if (k === 'left') o.sel = (o.sel + 2) % 3;
      else if (k === 'right') o.sel = (o.sel + 1) % 3;
      else if (k === 'up' || k === 'inc') { L.dial[o.sel] = (L.dial[o.sel] + 1) % 10; snd('slide', { vol: 0.18 }); }
      else if (k === 'down' || k === 'dec') { L.dial[o.sel] = (L.dial[o.sel] + 9) % 10; snd('slide', { vol: 0.18 }); }
      else if (k === 'back') { closeUI(); return; }
      else if (k === 'ok') {
        if (L.dial.every((v, i) => v === L.code[i])) { closeUI(); L.openIt(); return; }
        o.msg = 'No abre.'; o.shake = 1; snd('clang', { vol: 0.35 });
        setTimeout(() => { if (S && S.ui === o) { o.shake = 0; o.render(); } }, 420);
      }
      o.render();
    };
    openUI(o);
  }
  // lo que encuentras: el mismo cartel que las recompensas del cofre del refugio (una fila por cosa, con su icono)
  const IC = {
    coin: '<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="7.5"/><path d="M10 5.5 V14.5 M7.6 7.6 Q10 6 12.2 7.4 Q8 10 12.4 12.4 Q10 14 7.6 12.4"/></svg>',
    wrench: '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M13.6 3.2 A4 4 0 0 0 9.2 8.4 L3.6 14 A1.6 1.6 0 0 0 6 16.4 L11.6 10.8 A4 4 0 0 0 16.8 6.4 L14.4 8.8 L12 8 L11.2 5.6 Z"/></svg>',
    pill: '<svg viewBox="0 0 20 20" aria-hidden="true"><g transform="rotate(-45 10 10)"><rect x="4" y="7" width="12" height="6" rx="3"/><path d="M10 7 V13"/></g></svg>',
    heart: '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 16 L4 10 A3.4 3.4 0 0 1 10 5.6 A3.4 3.4 0 0 1 16 10 Z"/></svg>',
    ammo: '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5 16 V8 Q5 4 6.5 3 Q8 4 8 8 V16 Z M12 16 V8 Q12 4 13.5 3 Q15 4 15 8 V16 Z"/></svg>',
    box: '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 7 L10 3.5 L17 7 L17 14 L10 17.5 L3 14 Z M3 7 L10 10.5 L17 7 M10 10.5 V17.5"/></svg>',
    x: '<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="8.5"/><path d="M6.8 6.8 L13.2 13.2 M13.2 6.8 L6.8 13.2"/></svg>'
  };
  function lineIcon(l) {
    if (/moneda/.test(l)) return IC.coin;
    if (/pieza/.test(l)) return IC.wrench;
    if (/suplemento/.test(l)) return IC.pill;
    if (/vida/.test(l)) return IC.heart;
    if (/munici|bala|cartucho|flecha|combustible|virote/.test(l)) return IC.ammo;
    return IC.box;
  }
  function rewardUI(head, text, lines) {
    const o = { kind: 'rew' };
    o.render = () => {
      const row = (i, l) => '<li class="' + (/^No |^Ya /.test(l) ? 'z' : '') + '" style="animation-delay:' + (0.25 + i * 0.3).toFixed(2) + 's"><i>' + lineIcon(l) + '</i>' + esc(l.replace(/^\+/, '')) + '</li>';
      uiRoot.innerHTML = '<div class="rf-rewp cu-rewp"><b class="t">' + esc(head) + '</b><span class="sub">' + esc(S.def.name) + ' &nbsp;- Hallazgo ' + Math.min(S.total, S.found + (o.counted ? 0 : 0)) + ' de ' + S.total + '</span>' +
        (text ? '<p class="cu-rtx">' + esc(text) + '</p>' : '') +
        '<ul>' + (lines.length ? lines.map((l, i) => row(i, l)).join('') : '<li class="z" style="animation-delay:0.25s"><i>' + IC.box + '</i>Nada que te sirva</li>') + '</ul>' +
        '<div class="ln"></div><button type="button" data-k="ok" style="animation-delay:' + (0.4 + lines.length * 0.3).toFixed(2) + 's">' + IC.x + 'Tomar</button></div>';
    };
    o.key = (k) => { if (k === 'ok' || k === 'back') closeUI(); };
    // (el número del hallazgo: se pinta al abrirse, que found() va justo detrás)
    setTimeout(() => { if (S) openUI(o); }, 0);
  }
  // el final: lo que te llevas, y seguir (o quedarte un rato más)
  function endUI() {
    const o = { kind: 'end' };
    o.render = () => {
      const D = S.def, rows = S.gains.length ? S.gains.map((l) => '<li' + (l.charAt(0) === '−' ? ' class="m"' : '') + '>' + esc(l) + '</li>').join('') : '<li class="z">Nada que llevarse</li>';
      uiRoot.innerHTML = '<div class="cu-card cu-end"><small>DESCANSO' + (S.step ? ' · TRAMO ' + S.step : '') + '</small><h3>' + esc(D.name) + '</h3>' +
        '<p class="cu-f">Hallazgos: ' + S.found + ' de ' + S.total + (S.restUsed ? ' · has descansado' : '') + '</p><ul class="cu-got">' + rows + '</ul>' +
        '<div class="cu-ft"><button type="button" data-k="ok">Seguir el camino</button><button type="button" data-k="back">Quedarme un rato' + hintKeys() + '</button></div></div>';
    };
    o.key = (k) => {
      if (k === 'back') { closeUI(); return; }
      if (k === 'ok') { const fn = S.done; closeUI(); if (fn) fn(); }
    };
    openUI(o);
  }
  // descansar: fundido a negro, lo que cura y vuelta
  function rest(fn) {
    ensureUI();
    const p = S.player;
    p.action = { kind: 'pack', t: 0, dur: 1e9, impact: 2, face: p.facing, done: false, calmRest: true };
    fadeEl.classList.add('on');
    setTimeout(() => {
      if (!S) return;
      setTimeout(() => { fadeEl.classList.remove('on'); if (S && S.player.action && S.player.action.calmRest) S.player.action = null; if (S) fn(); }, 1300);
    }, 1100);
  }
  function hud() {
    if (!hudEl || !S) return;
    const D = S.def;
    hudEl.innerHTML = '<b>' + esc(D.name) + '</b><span>' + D.tag + '</span><em>Hallazgos ' + S.found + ' / ' + S.total + '</em>';
  }

  // mando: ↑ ↓ ← → (cruceta o joystick), A acepta, B vuelve
  function padUI() {
    const ps = navigator.getGamepads ? navigator.getGamepads() : [];
    let pd = null; for (let i = 0; i < ps.length; i++) if (ps[i] && ps[i].connected) { pd = ps[i]; break; }
    if (!pd) return;
    const ax = pd.axes || [], bt = (i) => !!(pd.buttons[i] && pd.buttons[i].pressed);
    const now = { up: bt(12) || ax[1] < -0.6, down: bt(13) || ax[1] > 0.6, left: bt(14) || ax[0] < -0.6, right: bt(15) || ax[0] > 0.6, ok: bt(0), back: bt(1) };
    const prev = S.padPrev || {};
    S.padPrev = now;
    if (performance.now() - S.ui.t0 < 250) return;
    for (const k in now) if (now[k] && !prev[k]) { uiKey(k); return; }
  }

  // ================= Lo que lleva el juego =================
  const Calm = {
    SCENES, Notes, HIDES,
    // empieza la parada (el mapa ya está cargado): info { scene, seed, step }; o { msg, done }
    begin(sc, player, info, o) {
      this.stop();
      const def = SCENES[info && info.scene];
      const mp = def && G.Maps.get(def.map);
      if (!def || !mp || !mp.calm || G.World.layout !== def.map) return false;
      scene = sc;
      ensureUI();
      S = {
        id: info.scene, def, mp, cfg: mp.calm, player, msg: o && o.msg, done: o && o.done, step: info.step || 0,
        rng: U.mulberry32((info.seed || 1) * 7919 + 13),
        group: new THREE.Group(), hints: [], props: [], anims: [], targets: [], near: [], doors: {}, notes: [], blds: {}, blocks: [], removed: [],
        gains: [], found: 0, total: 0, carry: null, ui: null, uiQueue: [], lock: null, restUsed: false, exitAsk: 0, t: 0, padPrev: {}
      };
      scene.add(S.group);
      player.carry = null; player.carrySlow = 1;
      // lo que adorna y los acertijos (en orden: alguno usa lo que deja otro, como el edificio que abre)
      for (const d of S.cfg.deco || []) if (DECO[d.kind]) DECO[d.kind](d);
      let n = 0;
      for (const P of S.cfg.puzzles || []) {
        try { n += PZ[P.type] ? PZ[P.type](P) || 0 : 0; } catch (e) { if (window.console) console.error('calm ' + P.type, e); }
      }
      common();
      S.total = n + (S.cfg.lore || []).length;
      player.facing = def.face; if (G.Camera) { G.Camera.yaw = def.face; G.Camera.pitch = 0.06; }
      hud();
      hudEl.className = '';
      setTimeout(() => { if (S && hudEl) hudEl.className = 'compact'; }, 7500);
      document.body.classList.add('calma');
      return true;
    },
    stop() {
      if (!S) return;
      if (S.lock) crackStop(null);
      if (S.ui) { S.ui = null; if (uiRoot) { uiRoot.className = 'hidden'; uiRoot.innerHTML = ''; } }
      S.uiQueue = [];
      for (const q of S.props) { const i = G.Props.list.indexOf(q); if (i >= 0) G.Props.list.splice(i, 1); }
      for (const b of S.blocks) { const i = b.c.furn.indexOf(b.f); if (i >= 0) { b.f.gone = true; b.f.solid = false; } }
      if (S.blocks.length && G.Furniture.indexChunk) { const cs = new Set(S.blocks.map((b) => b.c)); for (const c of cs) { c.furn = c.furn.filter((f) => !f.calmBlock); G.Furniture.indexChunk(c, 32); } }
      if (S.player) { S.player.carry = null; S.player.carrySlow = 1; }
      if (scene && S.group) {
        scene.remove(S.group);
        const shared = [matBody, matHull, matGlow, matDark, matFlame];
        S.group.traverse((o) => { if (o.isMesh) { o.geometry.dispose(); if (o.material && shared.indexOf(o.material) < 0) { if (o.material.map) o.material.map.dispose(); o.material.dispose(); } } });
      }
      if (hudEl) hudEl.className = 'hidden';
      if (fadeEl) fadeEl.classList.remove('on');
      document.body.classList.remove('calma');
      S = null;
    },
    get active() { return !!S; },
    // una pantalla abierta (la nota, el candado, el final): el personaje se queda quieto
    get busy() { return !!(S && S.ui); },
    get carrying() { return S && S.carry ? S.carry.kind : null; },
    get info() { return S ? { scene: S.id, found: S.found, total: S.total, gains: S.gains.slice() } : null; },
    update(dt, player) {
      if (!S) return;
      S.player = player;
      S.t += dt;
      if (S.exitAsk > 0) S.exitAsk -= dt;
      if (S.ui) padUI();
      // los contornos
      for (const h of S.hints) {
        const t = h.t, p = t.g.position, lvOk = (t.lv || 0) === (player.lv || 0);
        const hx = t.cx != null ? t.cx : p.x, hz = t.cz != null ? t.cz : p.z;
        t.hull.visible = lvOk && h.on() && Math.hypot(hx - player.pos.x, hz - player.pos.z) < h.r;
      }
      // lo que llevas encima
      const C = S.carry;
      if (C) {
        const f = player.facing, fx = Math.sin(f), fz = Math.cos(f), rx = Math.cos(f), rz = -Math.sin(f);
        const y = player.y != null ? player.y : gy(player.pos.x, player.pos.z, player.lv);
        if (C.kind === 'escalera') {
          const t = C.t;
          // al hombro derecho, a lo largo: un poco más por delante que por detrás
          t.g.position.set(player.pos.x - rx * 0.28 - fx * (LAD_L * 0.42), y + 1.38, player.pos.z - rz * 0.28 - fz * (LAD_L * 0.42));
          t.g.rotation.set(0, f, 0);
          t.inner.rotation.set(Math.PI / 2 - 0.08, 0, 0); t.inner.position.set(0, 0, 0);
        } else {
          C.t.g.position.set(player.pos.x - rx * 0.3 + fx * 0.05, y + 0.32, player.pos.z - rz * 0.3 + fz * 0.05);
          C.t.g.rotation.set(0, f + Math.PI / 2, 0);
        }
        // (dejarla en el suelo: el objeto delante de ti)
        const dq = S.props.find((q) => q.id === 'drop');
        if (dq) { dq.x = player.pos.x + fx * 0.5; dq.z = player.pos.z + fz * 0.5; }
      }
      // lo que se mueve
      for (let i = S.anims.length - 1; i >= 0; i--) if (!S.anims[i](dt)) S.anims.splice(i, 1);
      // avisos al acercarte
      for (const n of S.near) {
        if (n.done || (player.lv || 0) || S.ui) continue;
        if (Math.hypot(n.x - player.pos.x, n.z - player.pos.z) < n.r) { n.done = true; n.fn(); }
      }
      crackUpdate(dt);
    },
    // los disparos (y las flechas): ¿le dan a algo de la parada (la cuerda del fardo)? t o -1
    rayT(o, d, t0, t1, lv) {
      if (!S || (lv || 0)) return -1;
      let best = -1;
      S.lastHit = null;
      for (const T of S.targets) {
        if (T.on && !T.on()) continue;
        const t = T.seg ? raySeg(o, d, T.seg[0], T.seg[1], T.r, t0, t1) : raySph(o, d, T.sph, T.r, t0, t1);
        if (t >= 0 && (best < 0 || t < best)) { best = t; S.lastHit = T; }
      }
      return best;
    },
    hit() { if (S && S.lastHit) { const T = S.lastHit; S.lastHit = null; if (!T.on || T.on()) T.hit(); } },
    // puertas cerradas de los acertijos (el botón de la puerta)
    doorLabel(ref, p) {
      const d = S && S.doors[G.World.edgeKey(ref)];
      if (!d || d.open) return null;
      return d.pz.label(d, p);
    },
    doorUse(ref, p) {
      const d = S && S.doors[G.World.edgeKey(ref)];
      if (!d || d.open) return null;
      return d.pz.use(d, p);
    },
    // las notas de esta parada y las guardadas (para la mochila)
    notes() {
      const here = S ? S.notes.map((n) => ({ title: n.title, text: n.text, where: 'Esta parada', here: true })) : [];
      return here.concat(Notes.list().map((id) => ({ title: LORE[id].title, text: LORE[id].text, where: LORE[id].where })));
    },
    // (pruebas)
    get dbg() { return S; }
  };

  // ---------- rayos ----------
  function raySeg(o, d, a, b, r, t0, t1) {
    const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2];
    const wx = o.x - a[0], wy = o.y - a[1], wz = o.z - a[2];
    const B = d.x * ux + d.y * uy + d.z * uz, Cc = ux * ux + uy * uy + uz * uz, D = d.x * wx + d.y * wy + d.z * wz, E = ux * wx + uy * wy + uz * wz;
    const den = Cc - B * B;
    let s = den > 1e-8 ? (E - B * D) / den : 0;
    s = U.clamp(s, 0, 1);
    const t = B * s - D;
    if (t < t0 || t > t1) return -1;
    const px = o.x + d.x * t - (a[0] + ux * s), py = o.y + d.y * t - (a[1] + uy * s), pz = o.z + d.z * t - (a[2] + uz * s);
    return px * px + py * py + pz * pz <= r * r ? t : -1;
  }
  function raySph(o, d, c, r, t0, t1) {
    const wx = o.x - c[0], wy = o.y - c[1], wz = o.z - c[2];
    const b = wx * d.x + wy * d.y + wz * d.z, cc = wx * wx + wy * wy + wz * wz - r * r, h = b * b - cc;
    if (h < 0) return -1;
    const t = -b - Math.sqrt(h);
    return t >= t0 && t <= t1 ? t : -1;
  }

  G.Calm = Calm;
})(window.Game = window.Game || {});
