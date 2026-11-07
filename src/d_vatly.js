// ===================== XE ĐUA: VẬT LÝ (drift, bay, Nitro), VA CHẠM, NHẶT XU =====================
// dk là ý muốn điều khiển của người hoặc máy: ga 0..1, phanh 0..1, lai -1..1 (dương = rẽ phải), nitro, drift (giữ để trượt).
const XE_DUA = [];                    // các xe trong cuộc đua (người chơi luôn là XE_DUA[0])
const _gv = { s: 0, i: 0, d: 0, cx: 0, cz: 0, tx: 0, tz: 1, nx: 1, nz: 0, k: 0, h: 0 };
let suKien = null;                    // luật đua gán hàm nghe sự kiện: (ten, xe, thamSo)

// o: { ten, id, nguoi, nv (nhân vật), boss, xe (mẫu xe), mau, phu, tt: {vmax, ga, bam, nit}, hut, ben, gio, ai }
function taoXeDua(o) {
  const mesh = taoKart(o.xe, o.mau, o.phu, o.nguoi ? null : o.ten, { nguoi: o.nguoi, boss: !!o.boss, mauMu: o.nv ? o.nv.mau : null, nvId: o.nv ? o.nv.id : null }); scene.add(mesh);
  return {
    ten: o.ten, id: o.id, nguoi: !!o.nguoi, nv: o.nv || null, boss: o.boss || null, xe: o.xe, mau: o.mau, mesh, ai: o.ai || null, tt: o.tt,
    hut: o.hut || 0, ben: o.ben || 0, gio: o.gio || 0, gioT: 0,
    x: 0, y: 0, z: 0, yaw: 0, vx: 0, vz: 0, vy: 0, vf: 0, lai: 0, bay: false, tgBay: 0, xBay: 0, zBay: 0, gyCu: 0,
    nitro: NITRO_BAN_DAU, nitDang: false, xungT: 0, chamT: 0, heV: 1, leCo: false,
    drift: false, driftT: 0, driftHuong: 0, driftMoc: 0, driftQuang: 0,
    s: 0, sCu: 0, i: -1, d: 0, tx: 0, tz: 1, tot: 0, xong: false, tgXong: 0, hang: 0,
    phu: o.phu, vetQ: 0, kyNang: null, kyCho: 0, khienT: 0, chamHe: 0.8, xoayT: 0, xu: 0, combo: 0, comboMax: 0, comboT: 0, nhay: 0, nhayXa: 0, chamTuong: 0, dungNitro: false, vMax: 0, vaT: 0, quayBanh: 0,
    dk: { ga: 0, phanh: 0, lai: 0, nitro: false, drift: false }
  };
}
function datXe(k, x, z, yaw, tot) {
  k.x = x; k.z = z; k.yaw = yaw; k.vx = k.vz = k.vf = k.vy = 0; k.lai = 0; k.xungT = 0; k.nitDang = false; k.drift = false; k.bay = false;
  gan(x, z, -1, _gv); k.s = k.sCu = _gv.s; k.i = _gv.i; k.d = _gv.d; k.tx = _gv.tx; k.tz = _gv.tz; k.y = k.gyCu = matDat(_gv.s, _gv.d, _gv.h); k.tot = tot;
}
function datLaiTrenDuong(k) {          // đặt xe lại giữa đường, đúng chiều đua (khi bị kẹt hoặc đi ngược)
  const s0 = k.s, d = diemTai(k.s + 6); k.x = d.x + d.nx * kep(k.d, -6, 6); k.z = d.z + d.nz * kep(k.d, -6, 6); k.yaw = Math.atan2(d.tx, d.tz); k.vx = k.vz = k.vf = k.vy = 0; k.lai = 0; k.drift = false; k.bay = false;
  gan(k.x, k.z, k.i, _gv); k.i = _gv.i; k.d = _gv.d; let dS = _gv.s - s0; if (dS < -DD.L / 2) dS += DD.L; else if (dS > DD.L / 2) dS -= DD.L; k.tot += dS; k.sCu = k.s = _gv.s; k.y = k.gyCu = matDat(_gv.s, _gv.d, _gv.h);
}
// Tốc độ tối đa đi qua khúc cua bán kính R mà xe còn bám được (dùng cho máy tính đường)
function vToiDaCua(R, bam, drift) {
  let a = 4, b = 160; for (let n = 0; n < 16; n++) { const v = (a + b) / 2, quay = TOC_QUAY * bam * (drift ? 1.3 : 1) / (1 + (v / V_QUAY) * (v / V_QUAY)); if (v / quay > R) b = v; else a = v; }
  return a;
}
const heNitro = (k) => 1 + (NITRO_V - 1) * (0.75 + 0.25 * k.tt.nit);
function vMaxXe(k, nit) { return Math.min(V_TRAN, V_GOC * k.tt.vmax * k.heV * (nit ? heNitro(k) : 1)); }

function buocXe(k, dt) {
  const dk = k.dk, T = k.tt, fx = Math.sin(k.yaw), fz = Math.cos(k.yaw), ux = fz, uz = -fx;
  let vf = k.vx * fx + k.vz * fz, vl = k.vx * ux + k.vz * uz;
  for (const b of TK_BUFF) if (k[b] > 0) k[b] -= dt;                 // các trạng thái của kỹ năng độc quyền đếm ngược
  if (k.bNitMien > 0 && !k.xong) { dk.nitro = true; k.nitro = Math.max(k.nitro, 10); }   // Mega Nitro: tự xả và không tốn bình
  const nit = dk.nitro && k.nitro > 0 && vf > 6 && !k.xong;
  if (nit && !k.nitDang && suKien) suKien('nitro', k, 0);
  k.nitDang = nit; if (nit) { if (!(k.bNitMien > 0)) k.nitro = Math.max(0, k.nitro - NITRO_TIEU / T.nit * dt); k.dungNitro = true; }
  if (k.xungT > 0) k.xungT -= dt; if (k.chamT > 0) k.chamT -= dt; if (k.gioT > 0) k.gioT -= dt; if (k.comboT > 0) { k.comboT -= dt; if (k.comboT <= 0) k.combo = 0; }
  const boost = nit || k.xungT > 0;
  const vm = Math.min(V_TRAN, V_GOC * T.vmax * k.heV * (k.leCo && !(k.bTuLai > 0) ? LE_HE : 1) * (nit ? heNitro(k) : 1) * (k.xungT > 0 ? XUNG_V : 1) * (k.chamT > 0 ? k.chamHe : 1) * (k.gioT > 0 ? 1 + k.gio : 1));
  if (!k.bay) {
    const ga = GA_GOC * T.ga * (boost ? NITRO_GA : 1);
    if (dk.phanh > 0.02) { if (vf > 0.5) vf = Math.max(0, vf - PHANH * dk.phanh * dt); else vf = Math.max(-LUI_MAX, vf - 16 * dk.phanh * dt); }
    else if (dk.ga > 0.02) { if (vf < vm) vf = Math.min(vm, vf + ga * dk.ga * dt * Math.max(0.1, 1 - Math.max(0, vf) / vm)); }
    else vf -= Math.sign(vf) * Math.min(Math.abs(vf), MAT_GA * dt);
    if (vf > vm) vf = Math.max(vm, vf - 22 * dt);
    k.lai += (dk.lai - k.lai) * Math.min(1, dt * 12);
    // drift: giữ nút drift khi đang rẽ và đủ nhanh → xe trượt ngang, quay gắt hơn, tích tia lửa; nhả ra được phóng
    if (dk.drift && !k.drift && Math.abs(dk.lai) > 0.2 && vf > DRIFT_V) { k.drift = true; k.driftHuong = Math.sign(dk.lai); k.driftT = 0; k.driftMoc = 0; }
    if (k.drift && (!dk.drift || vf < DRIFT_V * 0.7 || k.xong)) {
      if (k.driftMoc > 0) { const th = DRIFT_THUONG[k.driftMoc - 1]; k.xungT = Math.max(k.xungT, th.giay); k.nitro = Math.min(NITRO_MAX, k.nitro + th.nitro); if (suKien) suKien('phong', k, k.driftMoc); }
      k.drift = false; k.driftMoc = 0;
    }
    let laiHieu = k.lai;
    if (k.drift) {
      laiHieu = kep(k.driftHuong * 0.62 + k.lai * 0.55, -1.15, 1.15); k.driftT += dt * (T.driftNhanh || 1) * (k.bDrift > 0 ? 3 : 1);
      const m = k.driftT > DRIFT_MOC[2] ? 3 : k.driftT > DRIFT_MOC[1] ? 2 : k.driftT > DRIFT_MOC[0] ? 1 : 0;
      if (m > k.driftMoc) { k.driftMoc = m; if (suKien) suKien('moc', k, m); }
      k.nitro = Math.min(NITRO_MAX, k.nitro + NITRO_DRIFT * dt); k.driftQuang += vf * dt; vf -= 3 * dt;
    }
    const bamH = T.bam * (k.bBam > 0 ? 1.7 : 1), quay = TOC_QUAY * bamH * Math.min(1, Math.abs(vf) / 8) / (1 + (vf / V_QUAY) * (vf / V_QUAY)) * (k.drift ? 1.3 : 1);
    k.yaw -= laiHieu * quay * (vf >= 0 ? 1 : -1) * dt;
    vl *= Math.exp(-BAM_GOC * bamH * (k.drift ? 0.3 : 1) * dt);
  } else {                               // đang bay: chỉ chỉnh hướng một chút
    k.lai += (dk.lai - k.lai) * Math.min(1, dt * 6); k.yaw -= k.lai * 0.45 * dt; vf -= 1.2 * dt; vl *= Math.exp(-0.8 * dt); k.tgBay += dt;
    if (k.drift) { k.drift = false; k.driftMoc = 0; }
  }
  k.vx = fx * vf + ux * vl; k.vz = fz * vf + uz * vl; k.vf = vf;
  k.x += k.vx * dt; k.z += k.vz * dt; k.vy -= TRONG_LUC * (k.bTrongLuc > 0 ? 0.3 : 1) * dt; k.y += k.vy * dt;
  // vị trí trên đường, rào chắn
  let o = gan(k.x, k.z, k.i, _gv);
  const lim = RONG_DUONG + RONG_LE - BAN_KINH_XE * 0.5;
  if (Math.abs(o.d) > lim) {
    const sg = o.d > 0 ? 1 : -1, dx = Math.abs(o.d) - lim; k.x -= o.nx * sg * dx; k.z -= o.nz * sg * dx;
    const vn = (k.vx * o.nx + k.vz * o.nz) * sg;
    if (vn > 0) { const mat = 1 - 0.12 * (1 - benCua(k)); k.vx -= o.nx * sg * vn * 1.3; k.vz -= o.nz * sg * vn * 1.3; k.vx *= mat; k.vz *= mat; if (vn > 3 && k.vaT <= 0) { k.vaT = 0.3; k.chamTuong++; if (suKien) suKien('tuong', k, vn); } }
    k.yaw += gocChenh(Math.atan2(o.tx, o.tz), k.yaw) * Math.min(1, 2.5 * dt);    // tự nắn theo đường để không dính rào
    o = gan(k.x, k.z, o.i, _gv);
  }
  if (k.vaT > 0) k.vaT -= dt;
  k.leCo = Math.abs(o.d) > RONG_DUONG; k.d = o.d; k.i = o.i; k.tx = o.tx; k.tz = o.tz;
  // mặt đất: đang bay thì rơi theo trọng lực; chạm đất thì bám theo dốc. Qua đỉnh đồi hay mép dốc quá nhanh là tự bay lên
  const gy = matDat(o.s, o.d, o.h);
  if (k.y <= gy) {
    if (k.bay) {
      k.bay = false; const xa = Math.hypot(k.x - k.xBay, k.z - k.zBay);
      if (k.thuongDap > 0) { k.xungT = Math.max(k.xungT, k.thuongDap); k.thuongDap = 0; }     // đáp xuống được thưởng tăng tốc (Tiger Jump, Bunny Hop)
      if (k.tgBay > 0.45) { k.nhay++; if (xa > k.nhayXa) k.nhayXa = xa; if (k.tgBay > 0.7) k.nitro = Math.min(NITRO_MAX, k.nitro + NITRO_BAY * ((k.nv && k.nv.nitBay) || 1)); if (suKien) suKien('dap', k, xa); }
    }
    k.vy = kep((gy - k.gyCu) / dt, -60, 60); k.y = gy;
  } else if (!k.bay && k.y - gy > 0.45) { k.bay = true; k.tgBay = 0; k.xBay = k.x; k.zBay = k.z; }
  k.gyCu = gy;
  let dS = o.s - k.sCu; if (dS < -DD.L / 2) dS += DD.L; else if (dS > DD.L / 2) dS -= DD.L; k.tot += dS; k.sCu = k.s = o.s;
  const kmh = Math.abs(vf) * 3.6; if (kmh > k.vMax) k.vMax = kmh;
}

function vaChamXe() {
  const n = XE_DUA.length, tong = BAN_KINH_XE * 2;
  for (let a = 0; a < n; a++) for (let b = a + 1; b < n; b++) {
    const A = XE_DUA[a], B = XE_DUA[b], dx = B.x - A.x, dz = B.z - A.z; if (Math.abs(dx) > tong || Math.abs(dz) > tong || Math.abs(A.y - B.y) > 2) continue;
    if (A.bMa > 0 || B.bMa > 0) continue;          // chế độ ma: xuyên qua xe khác
    let d = Math.hypot(dx, dz); if (d >= tong) continue; if (d < 0.001) { A.x -= 0.05; d = 0.05; }
    const nx = dx / d, nz = dz / d, ov = tong - d;
    A.x -= nx * ov / 2; A.z -= nz * ov / 2; B.x += nx * ov / 2; B.z += nz * ov / 2;
    const rv = (B.vx - A.vx) * nx + (B.vz - A.vz) * nz;
    if (rv < 0) {
      const j = Math.min(14, -(1 + 0.3) * rv / 2), ma = 1 - Math.min(0.05, -rv * 0.004) * (1 - benCua(A)), mb = 1 - Math.min(0.05, -rv * 0.004) * (1 - benCua(B));
      A.vx -= nx * j; A.vz -= nz * j; B.vx += nx * j; B.vz += nz * j; A.vx *= ma; A.vz *= ma; B.vx *= mb; B.vz *= mb;
      if (-rv > 4 && A.vaT <= 0 && B.vaT <= 0) { A.vaT = B.vaT = 0.3; if (suKien) suKien('va', A.nguoi ? A : B, -rv); }
    }
  }
}
function heXu(combo) { for (const [tu, nhan] of COMBO_BAC) if (combo >= tu) return nhan; return 1; }
function xuLyVatPham(k, dt) {
  if (k.xong) return;                    // đã về đích: không nhặt gì nữa (máy vẫn chạy tiếp sau màn kết quả)
  const rX = 3.4 + (k.hut || 0) + (k.bXu > 0 ? 14 : 0), ra = timDau(XU, k.s - rX - 2), rb = timDau(XU, k.s + rX + 2);
  for (let i = ra; i < rb; i++) {
    const c = XU[i]; if (!c.on) continue; const dx = k.x - c.x, dz = k.z - c.z, dy = k.y + 1 - c.h;
    if (dx * dx + dz * dz + dy * dy < rX * rX) {
      c.on = false; k.combo = k.comboT > 0 ? k.combo + 1 : 1; k.comboT = COMBO_GIAY; if (k.combo > k.comboMax) k.comboMax = k.combo;
      const n = Math.round(heXu(k.combo) * ((k.nv && k.nv.xuX) || 1) * (k.bXuX > 0 ? 3 : 1)); k.xu += n; k.nitro = Math.min(NITRO_MAX, k.nitro + NITRO_XU); if (suKien) suKien('xu', k, n);
    }
  }
  const va = timDau(VAT, k.s - 6), vb = timDau(VAT, k.s + 6);
  for (let i = va; i < vb; i++) {
    const v = VAT[i]; if (v.da || k.bMa > 0 || k.y > v.h + 3.5) continue; const dx = k.x - v.x, dz = k.z - v.z, r = v.r + BAN_KINH_XE * 0.7, d2 = dx * dx + dz * dz;
    if (d2 >= r * r) continue; const d = Math.sqrt(d2) || 0.01;
    if (v.loai === 'thung') {
      const nx = dx / d, nz = dz / d; k.x += nx * (r - d); k.z += nz * (r - d);
      const vn = k.vx * nx + k.vz * nz; if (vn < 0) { const m = 1 - 0.45 * (1 - benCua(k)); k.vx -= nx * vn * 1.4; k.vz -= nz * vn * 1.4; k.vx *= m; k.vz *= m; if (-vn > 3 && k.vaT <= 0) { k.vaT = 0.3; if (suKien) suKien('va', k, -vn); } }
    } else { v.da = true; v.hoi = 5.5; v.oy = 0; v.vx = -dx / d * (8 + Math.abs(k.vf) * 0.25); v.vz = -dz / d * (8 + Math.abs(k.vf) * 0.25); const m = 1 - 0.08 * (1 - benCua(k)); k.vx *= m; k.vz *= m; if (suKien) suKien('non', k, 0); }
  }
  for (const p of XUNG) { const ds = quanhS(p.s - k.s); if ((ds < 5 || ds > DD.L - 5) && Math.abs(p.d - k.d) < p.r && !k.bay && k.xungT < XUNG_GIAY * 0.6) { k.xungT = XUNG_GIAY; if (suKien) suKien('xung', k, 0); } }
  { const ha = timDau(HOP, k.s - 5), hb = timDau(HOP, k.s + 5); for (let i = ha; i < hb; i++) { const h = HOP[i]; if (!h.on) continue; const dx = k.x - h.x, dz = k.z - h.z, dy = k.y + 1 - h.h; if (dx * dx + dz * dz + dy * dy < 9) { h.on = false; h.hoi = HOP_HOI; nhatHop(k); } } }
  if (k.nguoi) for (const q of QUA) { if (!q.on) continue; const ds = quanhS(q.s - k.s); if (ds > 8 && ds < DD.L - 8) continue; const g = diemTai(q.s), dx = k.x - (g.x + g.nx * q.d), dz = k.z - (g.z + g.nz * q.d), dy = k.y + 1 - (g.h + q.y); if (dx * dx + dz * dz + dy * dy < 16) { q.on = false; if (q.mesh) { q.mesh.visible = false; } if (suKien) suKien('qua', k, q.so); } }
}

// Mô hình xe bám theo trạng thái: bánh quay, bánh trước đánh lái, thân nghiêng khi vào cua và ngóc lên khi bay
function capNhatXeMesh(k, dt, t) {
  const m = k.mesh, u = m.userData, v01 = kep(Math.abs(k.vf) / V_GOC, 0, 1.8);
  m.position.set(k.x, k.y, k.z); m.rotation.order = 'YXZ'; m.rotation.y = k.yaw + (k.drift ? k.driftHuong * -0.28 : 0);
  const doc = k.bay ? Math.atan2(k.vy, Math.max(10, Math.abs(k.vf))) * 0.6 : Math.atan2(k.vy, Math.max(10, Math.abs(k.vf)));
  m.rotation.x = -doc + (k.nitDang ? -0.04 : 0); m.rotation.z = u.moto ? kep(k.lai * v01 * 0.42 + (k.drift ? k.driftHuong * 0.22 : 0), -0.6, 0.6) : kep(-k.lai * v01 * 0.06 + (k.drift ? -k.driftHuong * 0.06 : 0), -0.14, 0.14);   // xe máy nghiêng mình vào cua
  k.quayBanh += k.vf / u.rB * dt;
  for (const b of u.banh) { b.spin.rotation.x = k.quayBanh; if (b.truoc) b.piv.rotation.y = -k.lai * 0.5; }
  if (u.matPhanh) { const sang = k.dk.phanh > 0.1 && k.vf > 0.5 ? 4 : 0.7; u.matPhanh.color.setRGB(sang, sang * 0.08, sang * 0.06); }
  if (u.muiTen) { u.muiTen.position.y = (u.moto ? 4.3 : 3.4) + Math.sin(t * 5) * 0.2; u.muiTen.rotation.y = t * 3; }
  if (u.haoQuang) u.haoQuang.rotation.z = t * 1.5;
  if (k.xoayT > 0) { k.xoayT = Math.max(0, k.xoayT - dt); m.rotation.y += (1 - k.xoayT / 0.9) * Math.PI * 2; }      // trúng chiêu: xoay một vòng
  if ((k.khienT > 0 || k.bPhanXa > 0) && !u.khien) { u.khien = new THREE.Mesh(new THREE.SphereGeometry(3.2, 20, 14), new THREE.MeshBasicMaterial({ color: new THREE.Color(0.6, 1.6, 2.4), transparent: true, opacity: 0.28, blending: THREE.AdditiveBlending, depthWrite: false })); u.khien.position.y = 1.4; m.add(u.khien); }
  capNhatMa(k);
  if (u.khien) { u.khien.visible = k.khienT > 0 || k.bPhanXa > 0; u.khien.scale.setScalar(1 + Math.sin(t * 6) * 0.04); }
  if (k.chamT > 0 && Math.random() < dt * 20) hat(k.x + ngauNhien(-1.5, 1.5), k.y + 2.6, k.z + ngauNhien(-1.5, 1.5), 0, 1.5, 0, 0xffe14a, 0.5, 0.6, 0.2, true, 1);   // sao chóng mặt
}
const VET = { mesh: null, n: 900, i: 0 };       // vệt lốp in trên đường khi drift, phanh gấp, đáp đất
function veVet(x, y, z, yaw) {
  if (!VET.mesh) { const g = new THREE.PlaneGeometry(0.55, 1.7); g.rotateX(-Math.PI / 2); VET.mesh = new THREE.InstancedMesh(g, new THREE.MeshBasicMaterial({ color: 0x0c0c10, transparent: true, opacity: 0.42, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4 }), VET.n); VET.mesh.frustumCulled = false; _o.scale.set(0, 0, 0); _o.updateMatrix(); for (let i = 0; i < VET.n; i++) VET.mesh.setMatrixAt(i, _o.matrix); scene.add(VET.mesh); }
  _o.position.set(x, y + 0.09, z); _o.rotation.set(0, yaw, 0); _o.scale.set(1, 1, 1); _o.updateMatrix(); VET.mesh.setMatrixAt(VET.i, _o.matrix); VET.i = (VET.i + 1) % VET.n; VET.mesh.instanceMatrix.needsUpdate = true;
}
function xoaVet() { if (!VET.mesh) return; _o.scale.set(0, 0, 0); _o.updateMatrix(); for (let i = 0; i < VET.n; i++) VET.mesh.setMatrixAt(i, _o.matrix); VET.mesh.instanceMatrix.needsUpdate = true; }
function hieuUngXe(k, dt) {            // lửa Nitro, tia lửa drift, khói, bụi lề
  const c = Math.cos(k.yaw), s = Math.sin(k.yaw), loc = (lx, lz) => [k.x + lx * c + lz * s, k.z - lx * s + lz * c], sc = k.boss ? 1.3 : 1;
  if (k.nitDang || k.xungT > 0) for (const xa of k.mesh.userData.ongXa) {
    if (Math.random() > dt * 34) continue; const [px, pz] = loc(xa[0] * sc, xa[2] * sc);
    hat(px, k.y + xa[1] * sc, pz, k.vx - s * 16 + ngauNhien(-1, 1), ngauNhien(-0.5, 1), k.vz - c * 16 + ngauNhien(-1, 1), k.xungT > 0 && !k.nitDang ? 0xc05aff : Math.random() < 0.5 ? 0x5ab4ff : 0xffa030, 0.2, 0.9, 0.15, true, 0.8);
  }
  if (k.drift && Math.random() < dt * 50) {
    const mau = k.driftMoc > 0 ? DRIFT_THUONG[k.driftMoc - 1].mau : 0xfff0c0;
    for (const sx of [-1.15, 1.15]) { const [px, pz] = loc(sx, -1.3); hat(px, k.y + 0.3, pz, ngauNhien(-3, 3), ngauNhien(1, 4), ngauNhien(-3, 3), mau, 0.3, 0.7, 0.1, true, 1); }
    const [qx, qz] = loc(0, -1.6); hat(qx, k.y + 0.4, qz, ngauNhien(-1, 1), ngauNhien(0.5, 1.5), ngauNhien(-1, 1), 0xf4f4f4, 0.7, 1.2, 3, false, 0.45);
  }
  if (!k.bay && !k.leCo && (k.drift || (k.dk.phanh > 0.5 && k.vf > 15))) { k.vetQ += Math.abs(k.vf) * dt; if (k.vetQ > 1.5) { k.vetQ = 0; const huong = Math.atan2(k.vx, k.vz); for (const sx of [-1.2, 1.2]) { const [px, pz] = loc(sx, -1.3); veVet(px, k.y, pz, huong); } } }
  if (k.leCo && !k.bay && Math.abs(k.vf) > 10 && Math.random() < dt * 30) { const [px, pz] = loc(ngauNhien(-1, 1), -1.5); hat(px, k.y + 0.4, pz, ngauNhien(-1.5, 1.5), ngauNhien(0.5, 2), ngauNhien(-1.5, 1.5), DD.p ? DD.p.le : 0xaa9966, 0.8, 1.2, 3.5, false, 0.6); }
}
