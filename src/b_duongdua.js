// ===================== ĐƯỜNG ĐUA 10 KM: SINH ĐƯỜNG, ĐỒI, DỐC NHẢY, VẬT PHẨM, DỰNG THEO TỪNG KHÚC =====================
// Đường tâm là một vòng khép kín r(θ) (luôn không tự cắt), kéo giãn cho dài đúng DAI_DUONG (10 km) rồi chia đều mỗi 2 m.
// P = toạ độ, T = hướng, K = độ cong (dương: cua về phía -NR), H = độ cao. NR = (Tz, -Tx) là hướng ngang.
// Cả đường không dựng một lần: chỉ những khúc 400 m quanh người chơi được dựng, đi qua rồi thì dọn (nhẹ máy, tải nhanh).
const DD = { idx: 0, id: '', ten: '', N: 0, L: DAI_DUONG, P: null, T: null, K: null, H: null, rMin: 0, khung: [0, 0, 0, 0], p: null };
const XU = [], VAT = [], XUNG = [], DOC = [], QUA = [], MOC = [], HOP = [];   // xu, chướng ngại vật, ô tăng tốc, dốc nhảy, hộp quà bí mật, cột mốc 5 km
const _o = new THREE.Object3D();
const quanhS = (s) => ((s % DD.L) + DD.L) % DD.L;
const iTai = (s) => Math.floor(quanhS(s) / DS) % DD.N;
// vùng cảnh: mỗi km một vùng [0, 1 km), [1, 2 km)… đường hầm ở 1, 2, …, 9 km; hầm cuối ở 9,75 km đưa về sân nhà (cảnh vùng 0) để về đích
const SO_VUNG = Math.round(DAI_DUONG / DAI_VUNG);
const MOC_HAM = Array.from({ length: SO_VUNG - 1 }, (_, i) => (i + 1) * DAI_VUNG).concat([DAI_DUONG - KHUC]);
const vungTai = (s) => { const q = quanhS(s); return q >= DAI_DUONG - KHUC ? 0 : Math.min(SO_VUNG - 1, Math.floor(q / DAI_VUNG)); };
const chuDeVung = (z) => (DD.idx + z) % DUONG.length;
const ganHam = (s, r) => { const q = quanhS(s); for (const b of MOC_HAM) if (Math.abs(q - b) < r) return true; return false; };
const TAM_CUA = 350;                     // khúc cua của mỗi km nằm ở mét thứ 350 (ra khỏi hầm một đoạn là vào cua, sau cua là đoạn thẳng có dốc nhảy)

// ---------- sinh đường ----------
function diemCuc(hs, f, M) {           // M điểm trên vòng cực với hệ số uốn f
  const pt = new Float64Array(M * 2);
  for (let i = 0; i < M; i++) { const th = i / M * Math.PI * 2; let r = 1; for (const h of hs) r += f * h[1] / (h[0] * h[0]) * Math.cos(h[0] * th + h[2]); pt[2 * i] = r * Math.cos(th); pt[2 * i + 1] = r * Math.sin(th); }
  let L = 0; for (let i = 0; i < M; i++) { const j = (i + 1) % M; L += Math.hypot(pt[2 * j] - pt[2 * i], pt[2 * j + 1] - pt[2 * i + 1]); }
  const sc = DAI_DUONG / L; for (let i = 0; i < 2 * M; i++) pt[i] *= sc;
  return pt;
}
function congMax(pt, M) {               // độ cong lớn nhất (đã làm mượt) trên các điểm
  const ds = DAI_DUONG / M, buoc = Math.max(1, Math.round(12 / ds)); let m = 0;
  for (let i = 0; i < M; i += 2) {
    const a = (i - buoc + M) % M, b = (i + buoc) % M, c = i;
    const ax = pt[2 * c] - pt[2 * a], az = pt[2 * c + 1] - pt[2 * a + 1], bx = pt[2 * b] - pt[2 * c], bz = pt[2 * b + 1] - pt[2 * c + 1];
    const la = Math.hypot(ax, az), lb = Math.hypot(bx, bz); const k = Math.abs(ax * bz - az * bx) / (la * lb) / ((la + lb) / 2); if (k > m) m = k;
  }
  return m;
}
function diemKhucCua(idx, p, M) {      // mỗi km (một khung cảnh) có đúng một khúc cua; góc cua lặp theo cặp [a, b] 5 lần, a + b = 72° nên đường tự khép kín
  const a = [36, 50, 57, 92, 100, 105, 110, 115, 120, 125][idx % 10] * Math.PI / 180, goc = [a, 72 * Math.PI / 180 - a], R = Math.max(90, p.rMin * 0.3), pt = new Float64Array(M * 2), ds = DAI_DUONG / M;
  DD.cua = []; for (let z = 0; z < SO_VUNG; z++) { const g = goc[z % 2], Lc = Math.min(480, 2 * Math.abs(g) * R); DD.cua.push({ s: z * DAI_VUNG + TAM_CUA, Lc, A: 2 * g / Lc, goc: g }); }
  let x = 0, y = 0, h = 0;
  for (let i = 0; i < M; i++) {
    pt[2 * i] = x; pt[2 * i + 1] = y;
    const s = (i + 0.5) * ds; let k = 0; for (const c of DD.cua) { const u = (s - c.s) / c.Lc + 0.5; if (u > 0 && u < 1) k += c.A * (1 - Math.cos(2 * Math.PI * u)) / 2; }   // độ cong hình chuông: vào cua êm, gắt nhất ở giữa
    h += k * ds; x += Math.cos(h) * ds; y += Math.sin(h) * ds;
  }
  for (let i = 0; i < M; i++) { const f = i / M; pt[2 * i] -= x * f; pt[2 * i + 1] -= y * f; }      // khử sai số khép kín rất nhỏ
  return pt;
}
function sinhDuong(idx) {
  const p = DUONG[idx], rnd = mulberry(idx * 7919 + 101);
  const M = 100000, pt = diemKhucCua(idx, p, M), cum = new Float64Array(M + 1);
  for (let i = 1; i <= M; i++) { const j = i % M; cum[i] = cum[i - 1] + Math.hypot(pt[2 * j] - pt[2 * (i - 1)], pt[2 * j + 1] - pt[2 * (i - 1) + 1]); }
  const N = Math.round(DAI_DUONG / DS); DD.N = N; DD.L = N * DS; DD.idx = idx; DD.id = p.id; DD.ten = p.ten; DD.p = p;
  const P = new Float32Array(N * 2), T = new Float32Array(N * 2), K = new Float32Array(N), H = new Float32Array(N), sc = cum[M] / DD.L;
  let j = 0;
  for (let k = 0; k < N; k++) {
    const tg = k * DS * sc; while (cum[j + 1] < tg) j++;
    const u = (tg - cum[j]) / (cum[j + 1] - cum[j]), b2 = (j + 1) % M;
    P[2 * k] = pt[2 * j] + (pt[2 * b2] - pt[2 * j]) * u; P[2 * k + 1] = pt[2 * j + 1] + (pt[2 * b2 + 1] - pt[2 * j + 1]) * u;
  }
  for (let k = 0; k < N; k++) { const a1 = (k + N - 1) % N, b1 = (k + 1) % N, dx = P[2 * b1] - P[2 * a1], dz = P[2 * b1 + 1] - P[2 * a1 + 1], l = Math.hypot(dx, dz) || 1; T[2 * k] = dx / l; T[2 * k + 1] = dz / l; }
  const k0 = new Float32Array(N); for (let k = 0; k < N; k++) { const a1 = (k + N - 3) % N, b1 = (k + 3) % N; k0[k] = (T[2 * a1] * T[2 * b1 + 1] - T[2 * a1 + 1] * T[2 * b1]) / (6 * DS); }
  let kMax = 1e-6; for (let k = 0; k < N; k++) { let s = 0; for (let d = -5; d <= 5; d++) s += k0[(k + d + N) % N]; K[k] = s / 11; kMax = Math.max(kMax, Math.abs(K[k])); }
  DD.rMin = 1 / kMax;
  // đồi: tổng các sóng lặp đúng một vòng, đỉnh cao bằng p.doc (bước sóng giữ như bản 50 km: 0,5–2,5 km); quanh vạch xuất phát phẳng
  const doi = []; for (let i = 0; i < 6; i++) doi.push([Math.max(3, Math.round((20 + rnd() * (25 + idx * 9)) * DAI_DUONG / 50000)), 0.4 + rnd() * 0.6, rnd() * 6.283]);
  let hMax = 0.001; for (let k = 0; k < N; k++) { let h = 0; const t = k / N * Math.PI * 2; for (const d of doi) h += d[1] * Math.sin(d[0] * t + d[2]); H[k] = h; hMax = Math.max(hMax, Math.abs(h)); }
  for (let k = 0; k < N; k++) { const s = k * DS, cach = Math.min(s, DD.L - s), w = kep((cach - 300) / 700, 0, 1); H[k] = H[k] / hMax * p.doc * w * w * (3 - 2 * w); }
  DD.P = P; DD.T = T; DD.K = K; DD.H = H;
  let x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9; for (let k = 0; k < N; k++) { x0 = Math.min(x0, P[2 * k]); x1 = Math.max(x1, P[2 * k]); z0 = Math.min(z0, P[2 * k + 1]); z1 = Math.max(z1, P[2 * k + 1]); }
  DD.khung = [x0, x1, z0, z1];
  datVatPham(rnd, p, idx);
}

const _g = { s: 0, i: 0, d: 0, cx: 0, cz: 0, tx: 0, tz: 1, nx: 1, nz: 0, k: 0, h: 0 };
// Tìm điểm gần nhất trên đường tâm quanh chỉ số hint (-1 là tìm cả đường). Trả về s, lệch ngang d (dương về phía NR), hướng, độ cong, độ cao
function gan(x, z, hint, o) {
  o = o || _g; const N = DD.N, P = DD.P;
  let best = 0, bd = 1e18;
  const quet = (a, b, buoc) => { for (let i = a; i <= b; i += buoc) { const j = ((i % N) + N) % N, dx = x - P[2 * j], dz = z - P[2 * j + 1], d = dx * dx + dz * dz; if (d < bd) { bd = d; best = j; } } };
  if (hint >= 0) { quet(hint - 24, hint + 24, 1); if (bd > 2500) { bd = 1e18; quet(0, N - 1, 4); quet(best - 6, best + 6, 1); } } else { quet(0, N - 1, 4); quet(best - 6, best + 6, 1); }
  const nxt = (best + 1) % N, prv = (best + N - 1) % N;
  const tSeg = (a, b) => { const ex = P[2 * b] - P[2 * a], ez = P[2 * b + 1] - P[2 * a + 1]; return ((x - P[2 * a]) * ex + (z - P[2 * a + 1]) * ez) / (ex * ex + ez * ez); };
  let idx, t = tSeg(best, nxt);
  if (t >= 0) { idx = best; t = Math.min(1, t); } else { idx = prv; t = kep(tSeg(prv, best), 0, 1); }
  const j = (idx + 1) % N, T = DD.T;
  o.i = idx; o.s = idx * DS + t * DS;
  o.cx = P[2 * idx] + (P[2 * j] - P[2 * idx]) * t; o.cz = P[2 * idx + 1] + (P[2 * j + 1] - P[2 * idx + 1]) * t;
  let tx = T[2 * idx] + (T[2 * j] - T[2 * idx]) * t, tz = T[2 * idx + 1] + (T[2 * j + 1] - T[2 * idx + 1]) * t; const l = Math.hypot(tx, tz) || 1; tx /= l; tz /= l;
  o.tx = tx; o.tz = tz; o.nx = tz; o.nz = -tx; o.d = (x - o.cx) * o.nx + (z - o.cz) * o.nz; o.k = DD.K[idx]; o.h = DD.H[idx] + (DD.H[j] - DD.H[idx]) * t;
  return o;
}
function diemTai(s, o) {               // điểm trên đường tâm ở quãng đường s
  o = o || {}; const f = quanhS(s) / DS, i = Math.floor(f) % DD.N, j = (i + 1) % DD.N, u = f - Math.floor(f), P = DD.P, T = DD.T;
  o.x = P[2 * i] + (P[2 * j] - P[2 * i]) * u; o.z = P[2 * i + 1] + (P[2 * j + 1] - P[2 * i + 1]) * u; o.h = DD.H[i] + (DD.H[j] - DD.H[i]) * u;
  let tx = T[2 * i] + (T[2 * j] - T[2 * i]) * u, tz = T[2 * i + 1] + (T[2 * j + 1] - T[2 * i + 1]) * u; const l = Math.hypot(tx, tz) || 1; tx /= l; tz /= l;
  o.tx = tx; o.tz = tz; o.nx = tz; o.nz = -tx; o.k = DD.K[i]; return o;
}
const doCong = (s) => DD.K[iTai(s)];
function docNhay(s) {                   // độ cao thêm của dốc nhảy tại s (0 nếu không có dốc)
  for (const r of DOC) { const u = quanhS(s - r.s); if (u <= r.dai) return r.cao * u / r.dai; }
  return 0;
}
function matDat(s, d, h) { return h + (Math.abs(d) < RONG_DUONG + 0.5 ? docNhay(s) : 0); }   // độ cao mặt đất dưới xe
function luoiXuatPhat(i) {            // chỗ đứng xuất phát hạng i = 0..7: hai xe một hàng, hàng cách nhau 11 m
  const hang = Math.floor(i / 2), cot = i % 2, s = -10 - hang * 11 - cot * 4, d = cot ? 6 : -6, p = diemTai(s);
  return { x: p.x + p.nx * d, z: p.z + p.nz * d, y: p.h, yaw: Math.atan2(p.tx, p.tz), tot: s };
}
function timDau(ds, s) { let a = 0, b = ds.length; while (a < b) { const m = (a + b) >> 1; if (ds[m].s < s) a = m + 1; else b = m; } return a; }   // vị trí đầu tiên có .s >= s

// ---------- xu, chướng ngại vật, ô tăng tốc, dốc, quà, cột mốc ----------
function datVatPham(rnd, p, idx) {
  XU.length = VAT.length = XUNG.length = DOC.length = QUA.length = MOC.length = 0;
  const L = DD.L, thang = (s, dai, gh) => { for (let d = 0; d <= dai; d += 20) if (Math.abs(doCong(s + d)) > (gh || 1 / 1000)) return false; return true; };
  const soDoc = Math.min(SO_VUNG - 1, Math.max(2, Math.round(p.nhay * DAI_DUONG / 25000)));
  {                                      // dốc nhảy: ở đoạn thẳng ngay sau khúc cua của một km, có ~250 m thẳng để đáp, không gần hầm
    const xaHam = (s) => { for (let d = -60; d <= 300; d += 20) if (ganHam(s + d, 90)) return false; return true; };
    const thu = []; for (let n = 0; n < SO_VUNG; n++) thu.push(Math.round((n + 0.5) * SO_VUNG / soDoc) % SO_VUNG);
    for (let n = 0; n < SO_VUNG && DOC.length < soDoc; n++) for (const z of (n < soDoc ? [thu[n]] : [n])) {
      if (DOC.some(r => Math.floor(r.s / DAI_VUNG) === z) || DOC.length >= soDoc) continue;
      const c = DD.cua[z]; for (let s = c.s + c.Lc / 2 + 10; s < c.s + c.Lc / 2 + 200; s += 10) if (thang(s - 20, 260, 1 / 900) && xaHam(s)) { DOC.push({ s, dai: 18, cao: 3.6 }); break; }
    }
  }
  DOC.sort((a, b) => a.s - b.s);
  const gan_doc = (s, truoc, sau) => DOC.some(r => { const u = quanhS(s - r.s); return u < sau || u > L - truoc; });
  for (let s = 260; s < L - 200; s += 140 + rnd() * 60) {       // nhóm xu
    if (gan_doc(s, 60, 30)) continue;
    const kieu = rnd(), lane = [-8, -3, 3, 8][Math.floor(rnd() * 4)];
    if (kieu < 0.45) for (let i = 0; i < 6; i++) XU.push({ s: s + i * 4, d: lane, y: 1.3 });
    else if (kieu < 0.8) for (let i = 0; i < 8; i++) XU.push({ s: s + i * 4, d: kep(lane + Math.sin(i * 0.8) * 5, -11, 11), y: 1.3 });
    else for (let i = 0; i < 3; i++) for (const ln of [-7, 0, 7]) XU.push({ s: s + i * 5, d: ln, y: 1.3 });
  }
  for (const r of DOC) for (let i = 1; i <= 8; i++) { const t = i * 0.13, v = 85, vy = v * r.cao / r.dai; XU.push({ s: r.s + r.dai + v * t, d: 0, y: r.cao + vy * t - TRONG_LUC / 2 * t * t + 1.2 }); }   // vòng xu trên không sau dốc
  XU.sort((a, b) => a.s - b.s); XU.forEach(c => { c.on = true; c.khuc = -1; c.inst = -1; const g = diemTai(c.s); c.x = g.x + g.nx * c.d; c.z = g.z + g.nz * c.d; c.h = g.h + c.y; });
  const nVat = Math.round(p.vat * L / 1000);
  for (let n = 0; n < nVat; n++) {
    const s = 900 + rnd() * (L - 1300); if (gan_doc(s, 120, 450)) continue;
    if (rnd() < 0.5) { const d = (rnd() < 0.5 ? -1 : 1) * noi(4, 11, rnd()); VAT.push({ loai: 'thung', s, d, r: 1.7 }); }
    else { const d = noi(-9, 9, rnd()); for (let i = -1; i <= 1; i++) VAT.push({ loai: 'non', s: s + Math.abs(i) * 2, d: kep(d + i * 2.2, -12, 12), r: 0.9 }); }
  }
  VAT.sort((a, b) => a.s - b.s); VAT.forEach(v => { v.da = false; v.hoi = 0; v.oy = 0; v.ang = 0; v.vx = v.vz = 0; v.khuc = -1; v.inst = -1; const g = diemTai(v.s); v.x = g.x + g.nx * v.d; v.z = g.z + g.nz * v.d; v.h = g.h; });
  for (let s = 1500; s < L - 500; s += 1300) if (!gan_doc(s, 80, 400)) XUNG.push({ s, d: noi(-8, 8, rnd()), r: 4.5 });
  // 3 hộp quà bí mật ở chỗ cố định: trên không sau dốc đầu tiên, sát mép lề, và sau dốc giữa đường
  const r0 = DOC[0], r1 = DOC[Math.floor(DOC.length / 2)] || DOC[0];
  if (r0) { const t = 0.55, v = 95; QUA.push({ s: r0.s + r0.dai + v * t, d: 0, y: r0.cao + v * r0.cao / r0.dai * t - TRONG_LUC / 2 * t * t + 1.0, so: 0 }); }
  QUA.push({ s: L * 0.42, d: (RONG_DUONG + RONG_LE - 2.5) * (rnd() < 0.5 ? -1 : 1), y: 1.4, so: 1 });
  if (r1) { const t = 0.75, v = 105; QUA.push({ s: r1.s + r1.dai + v * t, d: -6, y: r1.cao + v * r1.cao / r1.dai * t - TRONG_LUC / 2 * t * t + 1.0, so: 2 }); }
  QUA.sort((a, b) => a.s - b.s); QUA.forEach(q => { q.on = true; q.khuc = -1; q.mesh = null; });
  HOP.length = 0;                         // hộp quà bí ẩn cầu vồng: hàng 4 hộp ngang đường, tránh đường hầm và dốc
  for (let s = 300; s < L - 150; s += 650) { if (ganHam(s, 130) || gan_doc(s, 60, 260)) continue; for (const d of [-9, -3, 3, 9]) { const g = diemTai(s); HOP.push({ s, d, x: g.x + g.nx * d, z: g.z + g.nz * d, h: g.h + 1.7, on: true, hoi: 0, khuc: -1, inst: -1 }); } }
}

// ===================== TÀI NGUYÊN DÙNG CHUNG CHO MỘT ĐƯỜNG =====================
let TN = null;                          // vật liệu, hình khối, ảnh dùng chung cho mọi khúc của đường đang chạy
function texDuongNhua(mau) {
  return canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = mau; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 2600; i++) { const v = Math.random() * 40 - 20; g.fillStyle = 'rgba(' + (128 + v) + ',' + (128 + v) + ',' + (132 + v) + ',.10)'; g.fillRect(Math.random() * w, Math.random() * h, 2, 2); }
    g.fillStyle = '#f4f4f4'; g.fillRect(6, 0, 5, h); g.fillRect(w - 11, 0, 5, h); g.fillRect(126, 0, 4, h / 2);
    g.fillStyle = 'rgba(244,244,244,.85)'; g.fillRect(62, 0, 3, h / 2.5); g.fillRect(190, 0, 3, h / 2.5);
    g.strokeStyle = 'rgba(20,20,24,.16)'; g.lineWidth = 3; for (let i = 0; i < 7; i++) { const x = 30 + Math.random() * 196, c = (Math.random() - 0.5) * 70; g.beginPath(); g.moveTo(x, 0); g.quadraticCurveTo(x + c, h / 2, x + c * 0.3, h); g.stroke(); g.beginPath(); g.moveTo(x + 9, 0); g.quadraticCurveTo(x + 9 + c, h / 2, x + 9 + c * 0.3, h); g.stroke(); }   // vệt lốp mờ
  }, true);
}
function texLe() { return canvasTex(32, 32, (g, w, h) => { g.fillStyle = '#e8383d'; g.fillRect(0, 0, w, h); g.fillStyle = '#fff'; g.fillRect(0, 16, w, 16); }, true); }
function texCa() { return canvasTex(64, 32, (g) => { for (let y = 0; y < 4; y++) for (let x = 0; x < 8; x++) { g.fillStyle = (x + y) % 2 ? '#111' : '#fff'; g.fillRect(x * 8, y * 8, 8, 8); } }, true); }
function texChu(chu, mau, nen) { return canvasTex(512, 96, (g, w, h) => { g.fillStyle = nen; g.fillRect(0, 0, w, h); g.fillStyle = mau; let co = 62; g.font = 'italic 900 ' + co + 'px "Segoe UI",Arial,sans-serif'; while (co > 24 && g.measureText(chu).width > w - 24) { co -= 2; g.font = 'italic 900 ' + co + 'px "Segoe UI",Arial,sans-serif'; } g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(chu, w / 2, h / 2 + 3); g.strokeStyle = '#fff'; g.lineWidth = 6; g.strokeRect(3, 3, w - 6, h - 6); }); }
function texMuiTen(nen) { return canvasTex(64, 64, (g, w, h) => { g.fillStyle = nen; g.fillRect(0, 0, w, h); g.fillStyle = '#ffd23a'; for (let k = 0; k < 3; k++) { const y = 8 + k * 18; g.beginPath(); g.moveTo(10, y + 14); g.lineTo(32, y); g.lineTo(54, y + 14); g.lineTo(54, y + 22); g.lineTo(32, y + 8); g.lineTo(10, y + 22); g.closePath(); g.fill(); } }); }
function texSoc() { return canvasTex(64, 64, (g, w, h) => { for (let i = -2; i < 6; i++) { g.fillStyle = i % 2 ? '#1c1c22' : '#ffd23a'; g.beginPath(); g.moveTo(i * 16, 0); g.lineTo(i * 16 + 16, 0); g.lineTo(i * 16 + 32, h); g.lineTo(i * 16 + 16, h); g.closePath(); g.fill(); } }, true); }
function texCuaSo() { return canvasTex(64, 128, (g, w, h) => { g.fillStyle = '#1a1e2e'; g.fillRect(0, 0, w, h); for (let y = 4; y < h; y += 10) for (let x = 4; x < w; x += 12) { g.fillStyle = Math.random() < 0.55 ? (Math.random() < 0.5 ? '#ffe69a' : '#9ad8ff') : '#2a3048'; g.fillRect(x, y, 7, 6); } }, true); }

function gopHinh(ds) {                 // ghép nhiều hình (đã đặt vị trí) thành một hình để vẽ nhiều bản một lượt
  let n = 0; const ga = ds.map(([g, m]) => { const h = g.index ? g.toNonIndexed() : g.clone(); h.applyMatrix4(m); n += h.attributes.position.count; return h; });
  const pos = new Float32Array(n * 3), nm = new Float32Array(n * 3); let o = 0;
  for (const h of ga) { pos.set(h.attributes.position.array, o * 3); nm.set(h.attributes.normal.array, o * 3); o += h.attributes.position.count; h.dispose(); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.BufferAttribute(nm, 3)); return g;
}
const mt4 = (x, y, z, rx, ry, rz, sx, sy, sz) => new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx || 0, ry || 0, rz || 0)), new THREE.Vector3(sx || 1, sy || 1, sz || 1));
function thanDua() { const ds = []; for (let i = 0; i < 4; i++) ds.push([new THREE.CylinderGeometry(0.42 - i * 0.05, 0.5 - i * 0.05, 3.2, 7), mt4(i * i * 0.18, 1.6 + i * 3, 0, 0, 0, -0.08 - i * 0.06)]); return gopHinh(ds); }
function laDua() { const ds = []; for (let i = 0; i < 7; i++) { const a = i / 7 * 6.283; ds.push([new THREE.SphereGeometry(1, 8, 5), mt4(1.6 + Math.cos(a) * 2.2, 12.6 + 0.0, Math.sin(a) * 2.2, 0, -a, -0.45, 2.6, 0.18, 0.7)]); } for (let i = 0; i < 3; i++) ds.push([new THREE.SphereGeometry(0.4, 8, 6), mt4(1.6 + Math.cos(i * 2.1) * 0.5, 12.0, Math.sin(i * 2.1) * 0.5)]); return gopHinh(ds); }
function tuongDung(G, i0, i1, off, cao, tiLe, mat) {     // tường đứng chạy dọc theo đường
  const n = i1 - i0 + 1, N = DD.N, P = DD.P, T = DD.T, pos = new Float32Array(n * 6), uv = new Float32Array(n * 4), idx = [];
  for (let q = 0; q < n; q++) { const i = (i0 + q) % N, nx = T[2 * i + 1], nz = -T[2 * i], o = chanTrong(i, off), x = P[2 * i] + nx * o, z = P[2 * i + 1] + nz * o, h = DD.H[i] - 0.5, s = (i0 + q) * DS; pos.set([x, h, z, x, h + cao, z], q * 6); uv.set([s / tiLe, 0, s / tiLe, 1], q * 4); if (q < n - 1) { const v = q * 2; idx.push(v, v + 2, v + 1, v + 1, v + 2, v + 3); } }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals(); g.computeBoundingSphere();
  G.userData.rieng.push(g); const m = new THREE.Mesh(g, mat); m.receiveShadow = true; G.add(m);
}
const DEN_XP = [];                       // 5 bóng đèn xuất phát trên cổng
const TN_DS = new Map();                 // tài nguyên của từng khung cảnh (dựng khi cần)
function layTN(th) { if (!TN_DS.has(th)) TN_DS.set(th, chuanBiTaiNguyen(DUONG[th])); return TN_DS.get(th); }
function chuanBiTaiNguyen(p) {
  const dem = !!p.dem, t = {};
  if (p.id === 'nganha' || p.id === 'thanhpho') {
    const tg = canvasTex(256, 256, (g, w, h) => { g.fillStyle = p.id === 'nganha' ? '#1a0e3a' : '#1c2030'; g.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 32) for (let x = 0; x < w; x += 32) { g.fillStyle = (x + y) % 64 ? (p.id === 'nganha' ? '#24124e' : '#232838') : (p.id === 'nganha' ? '#2e1660' : '#283044'); g.fillRect(x + 2, y + 2, 28, 28); }
      g.fillStyle = p.id === 'nganha' ? '#ff5ad8' : '#3af0ff'; for (let x = 0; x <= w; x += 32) g.fillRect(x - 1, 0, 2, h); for (let y = 0; y <= h; y += 32) g.fillRect(0, y - 1, w, 2); g.fillStyle = '#ffffff'; g.fillRect(6, 0, 5, h); g.fillRect(w - 11, 0, 5, h); g.fillRect(126, 0, 4, h / 2); }, true);
    t.duong = new THREE.MeshToonMaterial({ map: tg, gradientMap: bacSang, emissive: new THREE.Color(1, 1, 1), emissiveMap: tg });
  } else t.duong = new THREE.MeshToonMaterial({ map: texDuongNhua(p.duong), gradientMap: bacSang });
  t.le = new THREE.MeshToonMaterial({ map: texLe(), gradientMap: bacSang });
  t.vai = matHH(p.le); t.dat = matHH(p.dat);
  t.xa = p.nuoc === 2 ? new THREE.MeshBasicMaterial({ color: new THREE.Color(p.xa).multiplyScalar(1.6) }) : p.nuoc === 1 ? matHH(p.xa, 0.25) : matHH(p.xa);
  if (dem) { const tl = canvasTex(64, 64, (g, w, h) => { g.fillStyle = '#0a0620'; g.fillRect(0, 0, w, h); g.fillStyle = p.id === 'nganha' ? '#c05aff' : '#3af0ff'; g.fillRect(0, 0, w, 3); g.fillRect(0, 0, 3, h); }, true); tl.repeat.set(26, 1); t.xa = new THREE.MeshBasicMaterial({ map: tl, color: new THREE.Color(1.9, 1.9, 1.9) }); t.luoi = true; }
  t.vachDem = new THREE.MeshBasicMaterial({ color: new THREE.Color(0.4, 2.6, 3.2) });   // vạch phát sáng hai mép đường ban đêm
  const capRao = { dongco: [0xe8383d, 0xffffff], bien: [0x2a8aff, 0xffffff], samac: [0xff8a2a, 0xffffff], rung: [0x3acb5a, 0xffd23a], tuyet: [0x4ab4ff, 0xffffff], thanhpho: [[0.3, 2.4, 3], [3, 0.3, 2.4]], nuilua: [0xff6a1a, 0x2a2020], hemnui: [0xe8383d, 0xffffff], may: [0xff8ad8, 0xffffff], nganha: [[1.6, 0.5, 3.2], [0.3, 2.6, 3.0]] }[p.id];
  const mauRao = (v) => Array.isArray(v) ? new THREE.Color(v[0], v[1], v[2]) : new THREE.Color(v);
  t.raoG = new THREE.CylinderGeometry(0.72, 0.72, 4.7, 14); t.raoG.rotateX(Math.PI / 2);              // rào ống đệm bo tròn, ban đêm là ống neon
  t.rao = dem ? new THREE.MeshBasicMaterial({ color: 0xffffff }) : matHH(0xffffff, 0.15); t.raoA = mauRao(capRao[0]); t.raoB = mauRao(capRao[1]);
  if (dem) { t.vongG = new THREE.TorusGeometry(RONG_DUONG + RONG_LE + 2, 0.55, 8, 56, Math.PI); t.vongM = [[3, 0.4, 2.6], [0.3, 2.6, 3.2], [3.2, 2.4, 0.4], [1.4, 0.5, 3.4]].map(c => new THREE.MeshBasicMaterial({ color: new THREE.Color(c[0], c[1], c[2]) })); }
  if (['dongco', 'bien', 'may', 'rung'].includes(p.id)) { t.cvG = []; t.cvM = []; [0xff3a3a, 0xff9a2a, 0xffe03a, 0x4acb5a, 0x3aa8ff, 0x5a5aff, 0xa05aff].forEach((c, i) => { t.cvG.push(new THREE.TorusGeometry(RONG_DUONG + RONG_LE + 12 - i * 1.25, 0.66, 6, 48, Math.PI)); t.cvM.push(new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(1.25) })); }); }
  if (['rung', 'hemnui', 'bien'].includes(p.id)) {               // thác nước: vách đá + dòng nước chảy (ảnh trôi xuống)
    t.nuocTex = canvasTex(64, 128, (g, w, h) => { const gr = g.createLinearGradient(0, 0, w, 0); gr.addColorStop(0, '#7ad8ff'); gr.addColorStop(0.5, '#e8fbff'); gr.addColorStop(1, '#7ad8ff'); g.fillStyle = gr; g.fillRect(0, 0, w, h); for (let i = 0; i < 40; i++) { g.fillStyle = 'rgba(255,255,255,' + (0.3 + Math.random() * 0.5) + ')'; g.fillRect(Math.random() * w, Math.random() * h, 2, 10 + Math.random() * 24); } }, true);
    t.nuocM = new THREE.MeshBasicMaterial({ map: t.nuocTex, color: new THREE.Color(1.15, 1.15, 1.15) }); t.nuocG = new THREE.PlaneGeometry(36, 70); t.vachG = new THREE.BoxGeometry(80, 76, 40); t.vachM = matHH(p.id === 'bien' ? 0xb8864a : 0x7a6a5a); t.hoG = new THREE.CircleGeometry(26, 24); t.hoM = matHH(0x3ab8ff, 0.3);
  }
  if (p.cay === 'nha') {                                          // tường graffiti hai bên phố
    t.grafTex = canvasTex(512, 128, (g, w, h) => { g.fillStyle = '#2a2e48'; g.fillRect(0, 0, w, h); const cs = ['#ff3ad8', '#3af0ff', '#ffe14a', '#7aff5a', '#ff8a2a', '#b07aff'];
      for (let i = 0; i < 26; i++) { g.fillStyle = cs[i % cs.length]; g.beginPath(); g.ellipse(Math.random() * w, Math.random() * h, 14 + Math.random() * 40, 10 + Math.random() * 30, Math.random() * 3, 0, 7); g.fill(); }
      g.font = 'italic 900 64px "Segoe UI",Arial'; g.lineWidth = 8; for (const [chu, x] of [['KART', 60], ['5A1.4', 300]]) { g.strokeStyle = '#111'; g.strokeText(chu, x, 92); g.fillStyle = cs[(x / 60) % cs.length | 0]; g.fillText(chu, x, 92); }
      for (let i = 0; i < 6; i++) { const x = 30 + i * 85, y = 30 + Math.random() * 40; g.fillStyle = '#fff'; g.beginPath(); g.arc(x, y, 9, 0, 7); g.arc(x + 20, y, 9, 0, 7); g.fill(); g.fillStyle = '#111'; g.beginPath(); g.arc(x + 2, y + 1, 4, 0, 7); g.arc(x + 22, y + 1, 4, 0, 7); g.fill(); } }, true);
    t.grafM = new THREE.MeshToonMaterial({ map: t.grafTex, gradientMap: bacSang, emissive: new THREE.Color(0.9, 0.9, 0.9), emissiveMap: t.grafTex, side: THREE.DoubleSide });
  }
  if (p.id === 'nganha' || p.id === 'thanhpho') {                // sao 5 cánh dày (đùn khối) phát sáng
    const hinh = new THREE.Shape(); for (let k = 0; k < 10; k++) { const a = k * Math.PI / 5 + Math.PI / 2, r = k % 2 ? 0.8 : 2; k ? hinh.lineTo(Math.cos(a) * r, Math.sin(a) * r) : hinh.moveTo(Math.cos(a) * r, Math.sin(a) * r); }
    t.saoG = new THREE.ExtrudeGeometry(hinh, { depth: 0.6, bevelEnabled: true, bevelSize: 0.15, bevelThickness: 0.15, bevelSegments: 1 }); t.saoG.center();
    t.saoM = new THREE.MeshBasicMaterial({ color: new THREE.Color(3, 2.5, 0.6) });
  }
  if (p.id === 'nganha') {                                         // tường LED chạy sọc màu hai bên sân khấu
    t.ledTex = canvasTex(256, 64, (g, w, h) => { const cs = ['#ff3ad8', '#3af0ff', '#ffe14a', '#b07aff']; for (let x = 0; x < w; x += 32) { g.fillStyle = cs[(x / 32) % 4]; g.fillRect(x, 0, 32, h); } g.fillStyle = 'rgba(0,0,0,.55)'; for (let y = 0; y < h; y += 8) g.fillRect(0, y, w, 3); for (let x = 0; x < w; x += 8) g.fillRect(x, 0, 3, h); }, true);
    t.ledM = new THREE.MeshBasicMaterial({ map: t.ledTex, color: new THREE.Color(1.5, 1.5, 1.5), side: THREE.DoubleSide });
  }
  // biển mũi tên ở phía ngoài khúc cua (như đường đua thật): nền xanh, mũi tên vàng chỉ hướng cua
  const texMui = (trai) => canvasTex(256, 96, (g, w, h) => { g.fillStyle = '#1a3ab8'; g.fillRect(0, 0, w, h); g.fillStyle = '#ffd23a'; for (let k = 0; k < 4; k++) { const x = 30 + k * 60; g.beginPath(); if (trai) { g.moveTo(x + 30, 12); g.lineTo(x, h / 2); g.lineTo(x + 30, h - 12); g.lineTo(x + 46, h - 12); g.lineTo(x + 16, h / 2); g.lineTo(x + 46, 12); } else { g.moveTo(x, 12); g.lineTo(x + 30, h / 2); g.lineTo(x, h - 12); g.lineTo(x + 16, h - 12); g.lineTo(x + 46, h / 2); g.lineTo(x + 16, 12); } g.fill(); } g.strokeStyle = '#fff'; g.lineWidth = 8; g.strokeRect(4, 4, w - 8, h - 8); });
  t.bienG = new THREE.PlaneGeometry(7.5, 2.8); t.bienTrai = new THREE.MeshBasicMaterial({ map: texMui(true), side: THREE.DoubleSide }); t.bienPhai = new THREE.MeshBasicMaterial({ map: texMui(false), side: THREE.DoubleSide }); t.chanBienG = new THREE.BoxGeometry(0.3, 2.4, 0.3);
  if (['bien', 'rung', 'hemnui', 'samac'].includes(p.id)) {        // vách đá nâu có lớp cỏ phía trên chạy dọc hai bên
    t.daTex = canvasTex(128, 128, (g, w, h) => { g.fillStyle = p.id === 'samac' ? '#c88a4a' : '#9a6a3a'; g.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 16) { g.fillStyle = 'rgba(0,0,0,.12)'; g.fillRect(0, y, w, 5); } for (let i = 0; i < 40; i++) { g.fillStyle = 'rgba(255,230,190,.12)'; g.fillRect(Math.random() * w, Math.random() * h, 10 + Math.random() * 20, 4); } if (p.id !== 'samac') { g.fillStyle = '#4ab84a'; g.fillRect(0, 0, w, 14); for (let x = 0; x < w; x += 8) { g.beginPath(); g.arc(x + 4, 14, 5, 0, Math.PI); g.fill(); } } }, true);
    t.daM = new THREE.MeshToonMaterial({ map: t.daTex, gradientMap: bacSang, side: THREE.DoubleSide });
  }
  t.xuG = new THREE.CylinderGeometry(0.95, 0.95, 0.2, 14); t.xuM = new THREE.MeshToonMaterial({ color: 0xffc81e, gradientMap: bacSang, emissive: new THREE.Color(1.1, 0.75, 0.1) });
  t.thungG = new THREE.BoxGeometry(2.8, 2.8, 2.8); t.thungM = matHH(0xc8863a); t.nonG = new THREE.ConeGeometry(0.85, 1.8, 10); t.nonM = matHH(0xff7a1a, 0.15);
  t.xungM = new THREE.MeshBasicMaterial({ map: texMuiTen(dem ? '#08142a' : '#12305a'), color: new THREE.Color(2.4, 2.4, 2.4) }); t.xungG = new THREE.PlaneGeometry(8, 12);
  t.docM = new THREE.MeshToonMaterial({ map: texSoc(), gradientMap: bacSang, emissive: new THREE.Color(0.25, 0.2, 0.05) }); t.docBen = matHH(0x5a6478);
  t.quaM = new THREE.MeshToonMaterial({ color: 0xff3ab0, gradientMap: bacSang, emissive: new THREE.Color(1.6, 0.25, 0.9) }); t.quaNo = new THREE.MeshBasicMaterial({ color: new THREE.Color(3, 2.6, 0.6) });
  t.cotG = new THREE.CylinderGeometry(0.2, 0.26, 10, 6); t.cotM = matHH(0x5a6478); t.denG = new THREE.SphereGeometry(0.6, 10, 8); t.denM = new THREE.MeshBasicMaterial({ color: dem ? new THREE.Color(3.4, 2.4, 3.6) : new THREE.Color(3.6, 3.3, 2.5) });
  t.coG = new THREE.ConeGeometry(0.3, 1.2, 4); t.coG.translate(0, 0.6, 0); t.coM = matHH(0xffffff);
  // cây/cảnh theo chủ đề: A là thân/khối chính, B là tán/phần trên
  const c = p.cay;
  if (c === 'tron') { t.aG = new THREE.CylinderGeometry(0.6, 0.9, 5, 7); t.aM = matHH(0x7a4a2a); t.bG = new THREE.IcosahedronGeometry(4.2, 0); t.bM = matHH(p.mauCay); t.aY = 2.5; t.bY = 7; }
  else if (c === 'co') { t.aG = thanDua(); t.aM = matHH(0x9a6a3a); t.bG = laDua(); t.bM = matHH(p.mauCay); t.aY = 0; t.bY = 0; }
  else if (c === 'xuongrong') { t.aG = new THREE.CylinderGeometry(0.9, 1.0, 7, 8); t.aM = matHH(p.mauCay); t.bG = new THREE.SphereGeometry(1.2, 8, 6); t.bM = matHH(0xff7ab0, 0.2); t.aY = 3.5; t.bY = 7.3; }
  else if (c === 'thong') { t.aG = new THREE.CylinderGeometry(0.5, 0.8, 4, 6); t.aM = matHH(0x5a3a22); t.bG = new THREE.ConeGeometry(4, 13, 8); t.bM = matHH(p.mauCay); t.aY = 2; t.bY = 10; }
  else if (c === 'nha') { t.aG = new THREE.BoxGeometry(18, 1, 18); t.aG.translate(0, 0.5, 0); { const tx = texCuaSo(); t.aM = new THREE.MeshToonMaterial({ map: tx, gradientMap: bacSang, emissive: new THREE.Color(1.6, 1.5, 1.3), emissiveMap: tx }); } t.bG = new THREE.BoxGeometry(2, 4, 2); t.bM = new THREE.MeshBasicMaterial({ color: new THREE.Color(3, 0.4, 0.4) }); t.aY = 0; t.bY = 0; t.nha = true; }
  else if (c === 'da') { t.aG = new THREE.DodecahedronGeometry(5, 0); t.aM = matHH(p.mauCay); t.bG = new THREE.DodecahedronGeometry(2.5, 0); t.bM = matHH(new THREE.Color(p.mauCay).offsetHSL(0, 0, 0.1).getHex()); t.aY = 2; t.bY = 5; }
  else if (c === 'may') { t.aG = new THREE.SphereGeometry(5, 10, 6); t.aM = matHH(0xffffff, 0.3); t.bG = new THREE.SphereGeometry(3.5, 8, 6); t.bM = matHH(0xffd8f0, 0.3); t.aY = 0; t.bY = 3; }
  else { t.aG = new THREE.OctahedronGeometry(3, 0); t.aG.scale(0.6, 2.2, 0.6); t.aM = new THREE.MeshBasicMaterial({ color: new THREE.Color(p.mauCay).multiplyScalar(2.6) }); t.bG = new THREE.OctahedronGeometry(1.4, 0); t.bM = new THREE.MeshBasicMaterial({ color: new THREE.Color(2.4, 1.2, 3) }); t.aY = 6; t.bY = 1.5; }
  t.mauCo = new THREE.Color(p.dem ? 0x3a5a8a : p.cay === 'tuyet' ? 0xffffff : p.le);
  return t;
}
function huyTaiNguyen() {
  for (const t of TN_DS.values()) for (const k in t) for (const v of (Array.isArray(t[k]) ? t[k] : [t[k]])) if (v && v.dispose) { if (v.map) v.map.dispose(); v.dispose(); }
  TN_DS.clear(); TN = null; xoaKhoIM();
}

// ===================== DỰNG MỘT KHÚC 400 M =====================
// Mô hình nhiều bản (cây, rào, xu...) được mượn từ "kho" và trả lại khi dọn khúc, để không phải tạo/giải phóng liên tục.
const KHUC_DA = new Map();              // chỉ số khúc → nhóm mô hình
const SAM = KHUC / DS;                  // số điểm mỗi khúc
const KHO_IM = new Map();               // tên → danh sách mô hình nhiều bản đang rảnh
function muonIM(ten, geo, mat, cap, G) {
  ten = ten + geo.uuid + mat.uuid; const ds = KHO_IM.get(ten) || []; KHO_IM.set(ten, ds);
  let m = ds.findIndex(x => x.userData.cap >= cap); m = m >= 0 ? ds.splice(m, 1)[0] : null;
  if (!m) { m = new THREE.InstancedMesh(geo, mat, cap); m.userData.cap = cap; m.userData.ten = ten; }
  m.count = cap; m.castShadow = false; m.frustumCulled = false; G.userData.im.push(m); G.add(m); return m;
}
function xoaKhoIM() { KHO_IM.clear(); }   // tài nguyên dùng chung bị bỏ khi đổi đường; các mô hình rảnh bị bỏ theo
function chanTrong(i, off) {            // phía trong khúc cua không vẽ dải rộng quá bán kính (tránh mặt đất gập lên nhau)
  const k = DD.K[i]; if (Math.abs(k) < 1e-5) return off; const trong = k > 0 ? -1 : 1;
  if (Math.sign(off) === trong) { const m = 0.8 / Math.abs(k); if (Math.abs(off) > m) return Math.sign(off) * m; }
  return off;
}
function dai(G, i0, i1, offA, offB, y, tiLeV, mat, kepTrong) {
  const n = i1 - i0 + 1, N = DD.N, P = DD.P, T = DD.T, pos = new Float32Array(n * 6), uv = new Float32Array(n * 4), nm = new Float32Array(n * 6), idx = [];
  for (let q = 0; q < n; q++) {
    const i = (i0 + q) % N, nx = T[2 * i + 1], nz = -T[2 * i], a = kepTrong ? chanTrong(i, offA) : offA, b = kepTrong ? chanTrong(i, offB) : offB, h = DD.H[i] + y, s = (i0 + q) * DS;
    pos.set([P[2 * i] + nx * a, h, P[2 * i + 1] + nz * a, P[2 * i] + nx * b, h, P[2 * i + 1] + nz * b], q * 6);
    uv.set([0, s / tiLeV, 1, s / tiLeV], q * 4); nm.set([0, 1, 0, 0, 1, 0], q * 6);
    if (q < n - 1) { const v = q * 2; idx.push(v, v + 2, v + 1, v + 1, v + 2, v + 3); }
  }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.BufferAttribute(nm, 3)); g.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); g.setIndex(idx);
  g.computeBoundingSphere(); const m = new THREE.Mesh(g, mat); m.receiveShadow = true; G.userData.rieng.push(g); G.add(m); return m;
}
function taoKhuc(c) {
  const th = chuDeVung(vungTai(c * KHUC + 1)), p = DUONG[th], TN = layTN(th), D = DH(), G = new THREE.Group(), N = DD.N, i0 = c * SAM, i1 = Math.min(N, i0 + SAM), rnd = mulberry(DD.idx * 100003 + c * 31 + 7);
  G.userData.rieng = []; G.userData.im = [];
  const W = RONG_DUONG, WL = RONG_DUONG + RONG_LE;
  dai(G, i0, i1, -(WL + 70), WL + 70, -0.12, 20, TN.dat, true);
  const tlXa = TN.luoi ? 10 : 40; dai(G, i0, i1, WL + 70, WL + 330, p.nuoc ? -1.6 : -0.3, tlXa, TN.xa, true); dai(G, i0, i1, -(WL + 330), -(WL + 70), p.nuoc ? -1.6 : -0.3, tlXa, TN.xa, true);
  dai(G, i0, i1, -WL, WL, -0.04, 10, TN.vai);
  dai(G, i0, i1, -W, W, 0.02, 16, TN.duong);
  dai(G, i0, i1, W, W + 1.6, 0.05, 6, TN.le); dai(G, i0, i1, -W - 1.6, -W, 0.05, 6, TN.le);
  if (p.dem) { dai(G, i0, i1, W - 0.9, W - 0.4, 0.06, 6, TN.vachDem); dai(G, i0, i1, -W + 0.4, -W + 0.9, 0.06, 6, TN.vachDem); }
  // rào chắn hai bên
  const nR = Math.floor(KHUC / 5) * 2, rao = muonIM('rao', TN.raoG, TN.rao, nR, G), ca = TN.raoA, cb = TN.raoB; let q = 0;
  for (const sg of [-1, 1]) for (let m = 0; m < nR / 2; m++) {
    const g = diemTai(i0 * DS + m * 5 + 2.5), off = sg * (WL + 0.6);
    _o.position.set(g.x + g.nx * off, g.h + 0.72, g.z + g.nz * off); _o.rotation.set(0, Math.atan2(g.tx, g.tz), 0); _o.scale.set(1, 1, 1); _o.updateMatrix(); rao.setMatrixAt(q, _o.matrix); rao.setColorAt(q, (m + c) % 2 ? ca : cb); q++;
  }
  rao.instanceMatrix.needsUpdate = true; if (rao.instanceColor) rao.instanceColor.needsUpdate = true; rao.castShadow = true;
  // cây và cảnh hai bên
  const tl = KHUC / 500, c5 = Math.floor(c * KHUC / 500), dau5 = (c * KHUC) % 500 === 0;   // c5: chỉ số đoạn 500 m (đồ trang trí lớn đặt ở nửa đầu mỗi 500 m)
  const nC = Math.max(1, Math.round(D.cay * tl)), a = muonIM('a', TN.aG, TN.aM, nC, G), b = muonIM('b', TN.bG, TN.bM, nC, G);
  for (let k = 0; k < nC; k++) {
    const s = i0 * DS + rnd() * KHUC, g = diemTai(s), sg = rnd() < 0.5 ? -1 : 1; let off = sg * (WL + 10 + Math.pow(rnd(), 1.6) * (TN.nha ? 120 : 260)); off = chanTrong(iTai(s), off);
    if (Math.abs(off) < WL + 8) off = sg * (WL + 8);
    const x = g.x + g.nx * off, z = g.z + g.nz * off, kk = noi(0.75, 1.6, rnd()), yaw = rnd() * 6.28;
    if (TN.nha) { const cao = noi(18, 90, rnd()); _o.position.set(x, g.h - 1, z); _o.rotation.set(0, Math.atan2(g.tx, g.tz), 0); _o.scale.set(noi(0.7, 1.3, rnd()), cao, noi(0.7, 1.3, rnd())); _o.updateMatrix(); a.setMatrixAt(k, _o.matrix); _o.position.set(x, g.h + cao + 1, z); _o.scale.set(1, 1, 1); _o.updateMatrix(); b.setMatrixAt(k, _o.matrix); }
    else { _o.position.set(x, g.h + TN.aY * kk, z); _o.rotation.set(0, yaw, 0); _o.scale.set(kk, kk, kk); _o.updateMatrix(); a.setMatrixAt(k, _o.matrix); _o.position.set(x, g.h + TN.bY * kk, z); _o.updateMatrix(); b.setMatrixAt(k, _o.matrix); }
  }
  a.instanceMatrix.needsUpdate = b.instanceMatrix.needsUpdate = true; a.castShadow = b.castShadow = true;
  if (D.co > 0 && !p.dem) {               // khóm cỏ sát hai bên lề
    const nCo = Math.max(1, Math.round(D.co * tl)), co = muonIM('co', TN.coG, TN.coM, nCo, G), mc = new THREE.Color();
    for (let k = 0; k < nCo; k++) {
      const s = i0 * DS + rnd() * KHUC, g = diemTai(s), sg = rnd() < 0.5 ? -1 : 1, off = chanTrong(iTai(s), sg * (WL + 1.5 + Math.pow(rnd(), 1.8) * 60)), kk = noi(0.6, 1.6, rnd());
      _o.position.set(g.x + g.nx * off, g.h - 0.1, g.z + g.nz * off); _o.rotation.set(noi(-0.3, 0.3, rnd()), rnd() * 6.28, noi(-0.3, 0.3, rnd())); _o.scale.set(kk, kk * noi(0.7, 1.4, rnd()), kk); _o.updateMatrix(); co.setMatrixAt(k, _o.matrix);
      mc.copy(TN.mauCo).offsetHSL(noi(-0.03, 0.03, rnd()), noi(-0.1, 0.05, rnd()), noi(-0.14, 0.06, rnd())); co.setColorAt(k, mc);
    }
    co.instanceMatrix.needsUpdate = true; if (co.instanceColor) co.instanceColor.needsUpdate = true;
  }
  if (D.trangTri || p.dem) {               // đèn đường: đêm dày, ngày thưa
    const cach = p.dem ? 50 : 200, nD = Math.max(1, Math.floor(KHUC / cach)) * 2, cot = muonIM('cot' + cach, TN.cotG, TN.cotM, nD, G), den = muonIM('den' + cach, TN.denG, TN.denM, nD, G);
    for (let k = 0; k < nD; k++) {
      const sD = i0 * DS + Math.floor(k / 2) * cach + cach / 2, g = diemTai(sD), sg = k % 2 ? 1 : -1, off = sg * (WL + 2.4), an = ganHam(sD, 90) ? 0 : 1;
      _o.position.set(g.x + g.nx * off, g.h + 5, g.z + g.nz * off); _o.rotation.set(0, 0, 0); _o.scale.set(an, an, an); _o.updateMatrix(); cot.setMatrixAt(k, _o.matrix);
      _o.position.set(g.x + g.nx * (off - sg * 1.6), g.h + 10.2, g.z + g.nz * (off - sg * 1.6)); _o.updateMatrix(); den.setMatrixAt(k, _o.matrix);
    }
    cot.instanceMatrix.needsUpdate = den.instanceMatrix.needsUpdate = true;
  }
  // xu trong khúc
  const s0 = i0 * DS, s1 = i1 * DS, xa = timDau(XU, s0), xb = timDau(XU, s1);
  if (xb > xa) {
    const xm = muonIM('xu', TN.xuG, TN.xuM, 64, G); xm.count = Math.min(64, xb - xa); xm.userData.xu = [xa, Math.min(xb, xa + 64)]; G.userData.xu = xm;
    for (let k = xa; k < xm.userData.xu[1]; k++) { const cx = XU[k]; cx.khuc = c; cx.inst = k - xa; const g = diemTai(cx.s); cx.x = g.x + g.nx * cx.d; cx.z = g.z + g.nz * cx.d; cx.h = g.h + cx.y; datMaTranXu(xm, cx, 0); }
    xm.instanceMatrix.needsUpdate = true;
  }
  // chướng ngại vật
  const va = timDau(VAT, s0), vb = timDau(VAT, s1);
  if (vb > va) {
    const ds = VAT.slice(va, vb), th = muonIM('thung', TN.thungG, TN.thungM, 32, G), no = muonIM('non', TN.nonG, TN.nonM, 48, G); let it = 0, in_ = 0;
    for (const v of ds) { if (v.loai === 'thung' && it < 32) { v.khuc = c; v.inst = it++; datMaTranVat(th, v); } else if (v.loai === 'non' && in_ < 48) { v.khuc = c; v.inst = in_++; datMaTranVat(no, v); } }
    th.count = it; no.count = in_; th.castShadow = no.castShadow = true; G.userData.thung = th; G.userData.non = no;
  }
  // vòm neon (đường đêm), cầu vồng (đường ngày), thác nước, tường graffiti, sao lấp lánh
  if (TN.vongG && dau5) { const g = diemTai(i0 * DS + 200), v = new THREE.Mesh(TN.vongG, TN.vongM[c5 % TN.vongM.length]); v.position.set(g.x, g.h, g.z); v.rotation.y = Math.atan2(g.tx, g.tz); G.add(v); }
  if (TN.cvG && dau5 && c5 % 6 === 3) G.add(cauVong(i0 * DS + 200, TN));
  if (TN.nuocG && dau5 && c5 % 2 === 1) {
    const s = i0 * DS + 100 + rnd() * 100, g = diemTai(s), sg = rnd() < 0.5 ? -1 : 1, off = chanTrong(iTai(s), sg * (WL + 75)), x = g.x + g.nx * off, z = g.z + g.nz * off, huong = Math.atan2(-g.nx * sg, -g.nz * sg);
    const vach = new THREE.Mesh(TN.vachG, TN.daM || TN.vachM); vach.position.set(x - g.nx * sg * 22, g.h + 36, z - g.nz * sg * 22); vach.position.x += g.nx * sg * 44; vach.position.z += g.nz * sg * 44; vach.rotation.y = huong; vach.castShadow = true; G.add(vach);
    const nuoc = new THREE.Mesh(TN.nuocG, TN.nuocM); nuoc.position.set(x + g.nx * sg * 1.2, g.h + 37, z + g.nz * sg * 1.2); nuoc.rotation.y = huong; G.add(nuoc);
    const ho = new THREE.Mesh(TN.hoG, TN.hoM); ho.rotation.x = -Math.PI / 2; ho.position.set(x - g.nx * sg * 8, g.h + 0.05, z - g.nz * sg * 8); G.add(ho);
  }
  if (TN.grafM) { tuongDung(G, i0, i1, WL + 6, 8, 24, TN.grafM); tuongDung(G, i0, i1, -(WL + 6), 8, 24, TN.grafM); }
  if (TN.ledM) { tuongDung(G, i0, i1, WL + 7, 6, 16, TN.ledM); tuongDung(G, i0, i1, -(WL + 7), 6, 16, TN.ledM); }
  if (TN.daM && c5 % 3 !== 0) { const sg = c5 % 2 ? 1 : -1; tuongDung(G, i0, i1, sg * (WL + 38), 26, 30, TN.daM); }
  for (let q = 0; q < SAM; q += 20) {                // biển mũi tên ở khúc cua
    const i = (i0 + q) % N, k = DD.K[i]; if (Math.abs(k) < 1 / 700 || ganHam(i * DS, 100)) continue;
    const g = diemTai(i * DS), sg = k > 0 ? 1 : -1, off = sg * (WL + 3), x = g.x + g.nx * off, z = g.z + g.nz * off;
    const b = new THREE.Mesh(TN.bienG, k > 0 ? TN.bienPhai : TN.bienTrai); b.position.set(x, g.h + 2.9, z); b.rotation.y = Math.atan2(-g.tx, -g.tz); G.add(b);   // độ cong dương là cua phải
    for (const dx of [-3, 3]) { const ch = new THREE.Mesh(TN.chanBienG, TN.cotM); ch.position.set(x + Math.cos(b.rotation.y) * dx, g.h + 1.2, z - Math.sin(b.rotation.y) * dx); G.add(ch); }
  }
  if (p.cay === 'nha' && dau5 && c5 % 2 === 0) {           // cổng khung sắt bắc ngang phố, treo bảng ô cờ
    const g = diemTai(i0 * DS + 100), C = new THREE.Group(); C.position.set(g.x, g.h, g.z); C.rotation.y = Math.atan2(g.tx, g.tz);
    for (const sx of [-1, 1]) { const tr = new THREE.Mesh(TN.cotG, TN.cotM); tr.scale.set(2.5, 1.5, 2.5); tr.position.set(sx * (WL + 1), 7.5, 0); C.add(tr); }
    const dam = new THREE.Mesh(TN.bienG, TN.bienPhai); dam.scale.set((WL * 2 + 2) / 7.5, 1, 1); dam.position.set(0, 13.5, 0); C.add(dam); G.add(C);
  }
  if (TN.saoG) { const sm = muonIM('sao', TN.saoG, TN.saoM, 7, G); for (let k = 0; k < 7; k++) { const g = diemTai(i0 * DS + rnd() * KHUC), off = (rnd() < 0.5 ? -1 : 1) * noi(15, 160, rnd()); _o.position.set(g.x + g.nx * off, g.h + noi(25, 110, rnd()), g.z + g.nz * off); _o.rotation.set(rnd() * 3, rnd() * 3, 0); const kk = noi(0.6, 2.2, rnd()); _o.scale.set(kk, kk, kk); _o.updateMatrix(); sm.setMatrixAt(k, _o.matrix); } sm.instanceMatrix.needsUpdate = true; }
  // ô tăng tốc, dốc nhảy, quà bí mật, cột mốc, vạch đích
  for (const x of XUNG) if (x.s >= s0 && x.s < s1) { const g = diemTai(x.s), m = new THREE.Mesh(TN.xungG, TN.xungM); m.rotation.order = 'YXZ'; m.rotation.set(-Math.PI / 2 + Math.atan2(DD.H[iTai(x.s + 6)] - DD.H[iTai(x.s - 6)], 12), Math.atan2(g.tx, g.tz), 0); m.position.set(g.x + g.nx * x.d, g.h + 0.1, g.z + g.nz * x.d); G.add(m); }
  for (const r of DOC) if (r.s >= s0 && r.s < s1) G.add(moHinhDoc(r, G, TN));
  for (const qa of QUA) if (qa.s >= s0 && qa.s < s1 && qa.on) { const m = moHinhQua(G, TN); const g = diemTai(qa.s); m.position.set(g.x + g.nx * qa.d, g.h + qa.y, g.z + g.nz * qa.d); qa.mesh = m; qa.khuc = c; G.add(m); }
  for (const mo of MOC) if (mo.s >= s0 && mo.s < s1) G.add(congChao(mo.s, mo.km + ' KM', '#2ee6a6', false, G));
  if (c === 0) G.add(congChao(0, 'SUPER KART · ' + KM_DUONG + ' KM', '#ffd23a', true, G));
  for (const b of MOC_HAM) if (b === c * KHUC) G.add(duongHam(b, G));      // đường hầm sang khung cảnh kế tiếp (mỗi 1 km, và hầm về đích)
  const ha = timDau(HOP, s0), hb = timDau(HOP, s1);                      // hộp quà bí ẩn cầu vồng
  if (hb > ha) { const hm = muonIM('hop', HOP_G, HOP_M, 16, G); hm.count = Math.min(16, hb - ha); hm.userData.hop = [ha, ha + hm.count]; G.userData.hop = hm; for (let k = ha; k < ha + hm.count; k++) { HOP[k].khuc = c; HOP[k].inst = k - ha; datMaTranHop(hm, HOP[k], 0); } hm.instanceMatrix.needsUpdate = true; }
  KHUC_DA.set(c, G); scene.add(G);
}
// hộp quà bí ẩn: khối vuông màu cầu vồng có dấu hỏi, phát sáng, xoay lơ lửng
const HOP_TEX = canvasTex(128, 128, (g, w, h) => { const gr = g.createLinearGradient(0, 0, w, h); ['#ff3a3a', '#ff9a2a', '#ffe03a', '#4acb5a', '#3aa8ff', '#8a5aff', '#ff5ad8'].forEach((c, i, a) => gr.addColorStop(i / (a.length - 1), c)); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.strokeStyle = '#fff'; g.lineWidth = 10; g.strokeRect(5, 5, w - 10, h - 10); g.font = '900 86px "Segoe UI",Arial'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineWidth = 8; g.strokeStyle = '#3a1a6a'; g.strokeText('?', w / 2, h / 2 + 4); g.fillStyle = '#fff'; g.fillText('?', w / 2, h / 2 + 4); });
const HOP_G = new THREE.BoxGeometry(2.2, 2.2, 2.2), HOP_M = new THREE.MeshToonMaterial({ map: HOP_TEX, gradientMap: bacSang, emissive: new THREE.Color(0.45, 0.45, 0.45), emissiveMap: HOP_TEX });
function datMaTranHop(m, h, t) { const k = h.on ? 1 : 0; _o.position.set(h.x, h.h + Math.sin(t * 2.5 + h.d) * 0.3, h.z); _o.rotation.set(t * 0.7 + h.d, t * 1.4, t * 0.5); _o.scale.set(k, k, k); _o.updateMatrix(); m.setMatrixAt(h.inst, _o.matrix); }
// đường hầm: vòm bán nguyệt bằng bê tông, dải đèn trên trần, cổng hai đầu và bảng báo khung cảnh phía trước
const HAM_TEX = canvasTex(64, 64, (g, w, h) => { g.fillStyle = '#5a5e6a'; g.fillRect(0, 0, w, h); g.fillStyle = '#4a4e5a'; for (let y = 0; y < h; y += 16) g.fillRect(0, y, w, 2); for (let x = 0; x < w; x += 32) g.fillRect(x, 0, 2, h); }, true);
const HAM_M = new THREE.MeshToonMaterial({ map: HAM_TEX, gradientMap: bacSang, side: THREE.DoubleSide }), HAM_DEN = new THREE.MeshBasicMaterial({ color: new THREE.Color(3.2, 3.0, 2.4) });
function duongHam(sTam, G) {
  const C = new THREE.Group(), n0 = Math.round((sTam - HAM_DAI / 2) / DS), n = Math.round(HAM_DAI / DS), K = 14, pos = [], uv = [], idx = [], den = [], idxD = [];
  for (let q = 0; q <= n; q++) {
    const i = ((n0 + q) % DD.N + DD.N) % DD.N, cx = DD.P[2 * i], cz = DD.P[2 * i + 1], nx = DD.T[2 * i + 1], nz = -DD.T[2 * i], h = DD.H[i];
    for (let a = 0; a <= K; a++) { const th = a / K * Math.PI, x = Math.cos(th) * HAM_R, y = Math.sin(th) * HAM_R * 0.75; pos.push(cx + nx * x, h - 0.5 + y, cz + nz * x); uv.push(a / K * 6, q * DS / 8); }
    for (const sx of [-1, 1]) den.push(cx + nx * sx * 4, h + HAM_R * 0.75 - 0.4, cz + nz * sx * 4);
    if (q < n) { for (let a = 0; a < K; a++) { const v = q * (K + 1) + a, w = v + K + 1; idx.push(v, w, v + 1, v + 1, w, w + 1); } const v = q * 2; idxD.push(v, v + 2, v + 1, v + 1, v + 2, v + 3); }
  }
  const gV = new THREE.BufferGeometry(); gV.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); gV.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); gV.setIndex(idx); gV.computeVertexNormals(); gV.computeBoundingSphere();
  const gD = new THREE.BufferGeometry(); gD.setAttribute('position', new THREE.Float32BufferAttribute(den, 3)); gD.setIndex(idxD); gD.computeBoundingSphere();
  G.userData.rieng.push(gV, gD); C.add(new THREE.Mesh(gV, HAM_M)); C.add(new THREE.Mesh(gD, HAM_DEN));
  const z = vungTai(sTam + 1), p = DUONG[chuDeVung(z)], cong = new THREE.TorusGeometry(HAM_R, 1.6, 8, 40, Math.PI), mc = new THREE.MeshBasicMaterial({ color: new THREE.Color(p.dem ? 0x8a5aff : p.troi).multiplyScalar(1.6) });
  const tb = texChu((sTam >= DAI_DUONG - KHUC - 1 ? 'VỀ ĐÍCH · ' : 'KM ' + Math.round(sTam / 1000) + ' · ') + p.ten.toUpperCase(), '#ffd23a', '#12305a'), mb = new THREE.MeshBasicMaterial({ map: tb }), gb = new THREE.PlaneGeometry(26, 4.6);
  G.userData.rieng.push(cong, mc, tb, mb, gb);
  for (const dau of [-1, 1]) {
    const g = diemTai(sTam + dau * HAM_DAI / 2), v = new THREE.Mesh(cong, mc); v.position.set(g.x, g.h - 0.5, g.z); v.rotation.y = Math.atan2(g.tx, g.tz); v.scale.y = 0.75; C.add(v);
    if (dau < 0) { const b = new THREE.Mesh(gb, mb); b.position.set(g.x - g.tx * 0.5, g.h + HAM_R * 0.75 + 3.5, g.z - g.tz * 0.5); b.rotation.y = Math.atan2(-g.tx, -g.tz); C.add(b); }
  }
  return C;
}
function datMaTranXu(xm, cx, t) { const k = cx.on ? 1 : 0; _o.position.set(cx.x, cx.h + Math.sin(t * 3 + cx.s) * 0.2, cx.z); _o.rotation.set(0, t * 3 + cx.s, Math.PI / 2); _o.scale.set(k, k, k); _o.updateMatrix(); xm.setMatrixAt(cx.inst, _o.matrix); }
function datMaTranVat(m, v) { _o.position.set(v.x, v.h + (v.loai === 'thung' ? 1.4 : 0.9) + v.oy, v.z); _o.rotation.set(v.da ? v.ang : 0, v.loai === 'thung' ? v.s : 0, v.da ? v.ang * 0.7 : 0); _o.scale.set(1, 1, 1); _o.updateMatrix(); m.setMatrixAt(v.inst, _o.matrix); m.instanceMatrix.needsUpdate = true; }
function moHinhDoc(r, G, tn) {             // dốc nhảy: mặt nghiêng sọc vàng đen, bung lên cao cuối dốc
  const a = diemTai(r.s), b = diemTai(r.s + r.dai), W = RONG_DUONG, pos = [], idx = [];
  const dinh = [[a, -W, 0], [a, W, 0], [b, -W, r.cao], [b, W, r.cao], [b, -W, 0], [b, W, 0]];
  for (const [g, d, h] of dinh) pos.push(g.x + g.nx * d, g.h + h + 0.03, g.z + g.nz * d);
  idx.push(0, 2, 1, 1, 2, 3, 2, 4, 3, 3, 4, 5, 0, 4, 2, 1, 3, 5);
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 4, 0, 0, 1.5, 4, 1.5, 0, 0, 4, 0], 2)); geo.setIndex(idx); geo.computeVertexNormals();
  G.userData.rieng.push(geo); const m = new THREE.Mesh(geo, tn.docM); m.castShadow = m.receiveShadow = true; return m;
}
function moHinhQua(G, tn) {                // hộp quà bí mật: hộp hồng phát sáng, nơ vàng
  const g = new THREE.Group(), h = new THREE.BoxGeometry(2.4, 2.4, 2.4), n1 = new THREE.BoxGeometry(2.5, 2.5, 0.5), n2 = new THREE.BoxGeometry(0.5, 2.5, 2.5);
  G.userData.rieng.push(h, n1, n2); g.add(new THREE.Mesh(h, tn.quaM)); g.add(new THREE.Mesh(n1, tn.quaNo)); g.add(new THREE.Mesh(n2, tn.quaNo)); return g;
}
function congChao(s, chu, mau, dich, G) {   // cổng chào: hai cột và bảng chữ; vạch đích có dải ô vuông
  const g = diemTai(s), C = new THREE.Group(); C.position.set(g.x, g.h, g.z); C.rotation.y = Math.atan2(g.tx, g.tz);
  const cot = new THREE.CylinderGeometry(0.6, 0.7, 12, 10), mc = matHH(dich ? 0xe8383d : 0x2a3a6a), t1 = texChu(chu, mau, '#12305a'), t2 = texChu(dich ? 'ĐÍCH' : chu, mau, '#12305a');
  const m1 = new THREE.MeshBasicMaterial({ map: t1 }), m2 = new THREE.MeshBasicMaterial({ map: t2 }), bg = new THREE.BoxGeometry((RONG_DUONG + RONG_LE) * 2 + 6, 3.6, 0.8);
  G.userData.rieng.push(cot, mc, t1, t2, m1, m2, bg);
  for (const sg of [-1, 1]) { const c = new THREE.Mesh(cot, mc); c.position.set(sg * (RONG_DUONG + RONG_LE + 2), 6, 0); c.castShadow = true; C.add(c); }
  const bang = new THREE.Mesh(bg, [mc, mc, mc, mc, m1, m2]); bang.position.y = 12; bang.castShadow = true; C.add(bang);
  if (dich) { DEN_XP.length = 0; const vo = new THREE.BoxGeometry(14, 2.6, 1.2), mv = matHH(0x14141c); G.userData.rieng.push(vo, mv); const hv = new THREE.Mesh(vo, mv); hv.position.set(0, 9.4, -0.3); C.add(hv); for (let i = 0; i < 5; i++) { const sg = new THREE.SphereGeometry(0.9, 16, 12), m = new THREE.MeshBasicMaterial({ color: new THREE.Color(0.15, 0.15, 0.18) }); G.userData.rieng.push(sg, m); const b = new THREE.Mesh(sg, m); b.position.set(-5.2 + i * 2.6, 9.4, -1.0); C.add(b); DEN_XP.push(m); } }
  if (dich) { const tc = texCa(), mv = new THREE.MeshToonMaterial({ map: tc, gradientMap: bacSang }), pg = new THREE.PlaneGeometry(RONG_DUONG * 2, 4); tc.repeat.set(RONG_DUONG * 2 / 4, 1); G.userData.rieng.push(tc, mv, pg); const v = new THREE.Mesh(pg, mv); v.rotation.x = -Math.PI / 2; v.position.y = 0.08; C.add(v); }
  return C;
}
function cauVong(s, tn) {                 // cầu vồng 7 sắc bắc ngang qua đường
  const g = diemTai(s), C = new THREE.Group(); C.position.set(g.x, g.h, g.z); C.rotation.y = Math.atan2(g.tx, g.tz);
  tn.cvG.forEach((geo, i) => C.add(new THREE.Mesh(geo, tn.cvM[i]))); return C;
}
function huyKhuc(c) {
  const G = KHUC_DA.get(c); if (!G) return; scene.remove(G); KHUC_DA.delete(c);
  for (const o of G.userData.rieng) o.dispose();
  for (const m of G.userData.im) { G.remove(m); const ds = KHO_IM.get(m.userData.ten); if (ds) ds.push(m); }
  for (const x of XU) if (x.khuc === c) x.khuc = -1; for (const h of HOP) if (h.khuc === c) h.khuc = -1; for (const v of VAT) if (v.khuc === c) v.khuc = -1; for (const q of QUA) if (q.khuc === c) { q.khuc = -1; q.mesh = null; }
}
function huyHetKhuc() { for (const c of Array.from(KHUC_DA.keys())) huyKhuc(c); }
// Dựng các khúc còn thiếu quanh vị trí s (gần trước, xa sau) và dọn khúc đã đi qua. toiDa = số khúc được dựng trong một lần gọi
function capNhatKhuc(s, toiDa) {
  const NC = Math.ceil(DD.N / SAM), c0 = Math.floor((s - 500) / KHUC), c1 = Math.floor((s + DH().xa + 300) / KHUC), can = new Set();
  for (let c = c0; c <= c1; c++) can.add(((c % NC) + NC) % NC);
  for (const c of Array.from(KHUC_DA.keys())) if (!can.has(c)) huyKhuc(c);
  let n = 0; const cg = Math.floor(s / KHUC);
  for (let r = 0; r <= c1 - c0 && n < toiDa; r++) for (const c of r === 0 ? [cg] : [cg + r, cg - r]) {
    if (c < c0 || c > c1) continue; const cc = ((c % NC) + NC) % NC;
    if (!KHUC_DA.has(cc)) { taoKhuc(cc); if (++n >= toiDa) break; }
  }
}
function capNhatVatPham(dt, t) {        // xu xoay, chướng ngại bị tông văng, hộp quà xoay
  for (const G of KHUC_DA.values()) { const xm = G.userData.xu; if (!xm) continue; const [xa, xb] = xm.userData.xu; for (let k = xa; k < xb; k++) datMaTranXu(xm, XU[k], t); xm.instanceMatrix.needsUpdate = true; }
  for (const v of VAT) {
    if (!v.da) continue; v.hoi -= dt; v.oy += (v.hoi > 4.4 ? 4 : -4) * dt; v.oy = Math.max(v.oy, 0); v.x += v.vx * dt; v.z += v.vz * dt; v.vx *= 0.97; v.vz *= 0.97; v.ang += dt * 7;
    if (v.hoi <= 0) { v.da = false; v.oy = 0; v.ang = 0; }
    const G = v.khuc >= 0 && KHUC_DA.get(v.khuc); if (G) datMaTranVat(v.loai === 'thung' ? G.userData.thung : G.userData.non, v);
  }
  for (const q of QUA) if (q.mesh) { q.mesh.rotation.y = t * 1.6; q.mesh.position.y += Math.sin(t * 3) * 0.01; }
  for (const tt of TN_DS.values()) if (tt.nuocTex) tt.nuocTex.offset.y = (t * 0.9) % 1;
  for (let i = 0; i < HOP.length; i++) { const h = HOP[i]; if (!h.on) { h.hoi -= dt; if (h.hoi <= 0) h.on = true; } }
  for (const G of KHUC_DA.values()) { const hm = G.userData.hop; if (!hm) continue; const [a, b] = hm.userData.hop; for (let k = a; k < b; k++) datMaTranHop(hm, HOP[k], t); hm.instanceMatrix.needsUpdate = true; }
}

// ===================== CẢNH XA: NÚI, MÂY, SAO (đi theo camera) =====================
const canhXa = new THREE.Group(); scene.add(canhXa);
function dungCanhXa(p) {
  while (canhXa.children.length) { const o = canhXa.children.pop(); o.traverse(m => { if (m.geometry) m.geometry.dispose(); if (m.material) m.material.dispose(); }); }
  const rnd = mulberry(p.id.length * 977 + 3), mauNui = new THREE.Color(p.xa).lerp(new THREE.Color(p.suong), 0.55);
  if (p.dem) mauNui.set(p.troi).lerp(new THREE.Color(0x3a3a6a), 0.5);
  for (let i = 0; i < 26; i++) {
    const a = i / 26 * 6.283 + rnd() * 0.2, r = noi(3000, 3500, rnd()), cao = noi(260, 700, rnd()), rong = noi(400, 800, rnd());
    const m = new THREE.Mesh(new THREE.ConeGeometry(rong, cao, 6), new THREE.MeshBasicMaterial({ color: mauNui.clone().offsetHSL(0, 0, noi(-0.06, 0.04, rnd())), fog: false })); m.position.set(Math.cos(a) * r, cao / 2 - 120, Math.sin(a) * r); canhXa.add(m);
  }
  if (p.dem) {
    const n = 1500, pos = new Float32Array(n * 3); for (let i = 0; i < n; i++) { const u = rnd() * 2 - 1, th = rnd() * 6.283, r = 3400, q = Math.sqrt(1 - u * u); pos.set([Math.cos(th) * q * r, Math.abs(u) * r * 0.9 + 80, Math.sin(th) * q * r], i * 3); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    canhXa.add(new THREE.Points(g, new THREE.PointsMaterial({ color: new THREE.Color(2.2, 2.2, 2.6), size: 2.2, sizeAttenuation: false, fog: false })));
  } else {
    const matMay = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.85, fog: false });
    for (let i = 0; i < 18; i++) { const c = new THREE.Group(); for (let k = 0; k < 4; k++) { const b = new THREE.Mesh(new THREE.SphereGeometry(noi(40, 80, rnd()), 8, 6), matMay); b.position.set(k * 60 - 90, rnd() * 20, rnd() * 30); b.scale.y = 0.5; c.add(b); } const a = rnd() * 6.28, r = noi(1200, 3000, rnd()); c.position.set(Math.cos(a) * r, noi(380, 650, rnd()), Math.sin(a) * r); canhXa.add(c); }
  }
}

// ===================== CHUẨN BỊ ĐƯỜNG (gọi khi chọn đường) =====================
let duongDangDung = -1;
let vungDang = -1;
function datVung(z) {                   // đổi bầu trời, sương, ánh sáng, cảnh xa theo khung cảnh của vùng z
  if (z === vungDang) return; vungDang = z; const th = chuDeVung(z), p = DUONG[th]; TN = layTN(th); DD.pVung = p;
  doiMauTroi(p.troi, p.suong); scene.fog.color.set(p.suong); datMoiTruong(p.dem ? 0x8a7aff : p.troi, p.dem ? 0x6a6a9a : p.dat, p.dem ? 0.4 : 1.2);
  anhTroi.intensity = p.dem ? 0.45 : 0.8; anhMat.intensity = p.dem ? 0.35 : 1.0; anhTroi.color.set(p.dem ? 0x8aa0ff : 0xcfe4ff); dungCanhXa(p);
}
function dungDuong(idx) {
  if (duongDangDung === idx && TN) return;
  huyHetKhuc(); huyTaiNguyen(); sinhDuong(idx); duongDangDung = idx; vungDang = -1; datVung(0); datTamNhin();
}
function datTamNhin() { const D = DH(); scene.fog.near = D.xa * 0.25; scene.fog.far = D.xa; camera.far = 4000; camera.updateProjectionMatrix(); }
function lamMoiKhuc() { const sGiu = XE_DUA.length ? XE_DUA[0].s : quanhS(-40); huyHetKhuc(); xoaKhoIM(); capNhatKhuc(sGiu, 99); }   // đổi mức đồ họa: dựng lại các khúc với số cây/cỏ mới
