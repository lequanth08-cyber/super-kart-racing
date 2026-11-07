// ===================== MÁY ĐIỀU KHIỂN (AI) VÀ BOSS =====================
// Mỗi xe máy tự lái, không chạy theo kịch bản: (1) chọn làn (ôm cua trong, né vật, vượt xe, nhặt xu, chèn ép),
// (2) nhắm một điểm phía trước trên làn đó rồi đánh lái, (3) nhìn trước khúc cua để biết phanh hay ga (có tính cả drift),
// (4) drift ở cua gắt để tích cú phóng, dùng Nitro ở đoạn thẳng, (5) tự lùi ra khi bị kẹt. Bay qua dốc theo đúng vật lý như người chơi.
const GIA_TOC_PHANH = 36;            // máy phanh dè dặt: chỉ tính xe giảm được chừng này m/s mỗi giây
const LAN_TOI_DA = RONG_DUONG - 2.6;
const KHOANG_NE = 5.2;
const _ap = { x: 0, z: 0, h: 0, tx: 0, tz: 0, nx: 0, nz: 0, k: 0 };

function taoAI(ca) {
  return { p: ca, lane: ngauNhien(-6, 6), off: 0, muon: 0, tPU: 0, lech: 0, lechT: 0, lechHen: ngauNhien(0.5, 1.5), nitT: 0, nitCho: ngauNhien(3, 8),
    ketT: 0, nguocT: 0, luiT: 0, daLui: false, passT: 0, passDich: 0, hungT: 0, hungMuc: 0, chieuT: ca.chieu || 0, canhT: 0 };
}
function tranhVat(k, muon, tamNhin) {
  const a = timDau(VAT, k.s), b = timDau(VAT, k.s + tamNhin);
  for (let lan = 0; lan < 2; lan++) for (let i = a; i < b; i++) {
    const o = VAT[i]; if (o.da) continue; const ds = o.s - k.s;
    if (Math.abs(o.d - muon) < KHOANG_NE) {
      const ben0 = ds < 8 + Math.max(0, k.vf) * 0.35 ? k.d - o.d : muon - o.d;
      let ben = ben0 >= 0 ? 1 : -1, moi = o.d + ben * KHOANG_NE;
      if (Math.abs(moi) > LAN_TOI_DA) { ben = -ben; moi = o.d + ben * KHOANG_NE; }
      muon = kep(moi, -LAN_TOI_DA, LAN_TOI_DA);
    }
  }
  return muon;
}
function dieuKhienAI(k, dt) {
  const A = k.ai, P = A.p, kh = DO_KHO[CUOC.kho], dk = k.dk, v = Math.max(0, k.vf), nguoi = XE_DUA[0], sai = kh.sai * (P.sai || 1);
  // ---- hệ số tốc độ: đường, mức khó, tính cách, và kéo nhẹ cho sát nút ----
  let keo = 1;
  if (!k.nguoi && !CUOC.soLo) { const hon = k.tot - nguoi.tot; if (hon > 400) keo = 1 - kh.keo * Math.min(1, (hon - 400) / 800) * 1.3; else if (hon < -250) keo = 1 + kh.keo * Math.min(1, (-hon - 250) / 800); }
  k.heV = k.nguoi ? 0.9 : CUOC.heAI * kh.v * (P.v || 1) * keo;
  if (k.bay) { dk.ga = 0.6; dk.phanh = 0; dk.drift = false; dk.nitro = false; const d = diemTai(k.s + 40, _ap); dk.lai = kep(-gocChenh(Math.atan2(d.x - k.x, d.z - k.z), k.yaw) * 2, -1, 1); return; }
  // ---- (1) chọn làn ----
  A.tPU -= dt;
  if (A.tPU <= 0) {
    A.tPU = kh.phanUng * (0.6 + Math.random() * 0.8);
    const cong = doCong(k.s + 25 + v * 0.8);
    let muon = A.lane * (1 - Math.min(1, Math.abs(cong) * 300)) - Math.sign(cong) * Math.min(1, Math.abs(cong) * 350) * (RONG_DUONG - 5) * (P.om != null ? P.om : 1);   // vào cua thì ôm phía trong
    if ((P.axu || 0) > 0.5) {             // thích nhặt xu: đi theo đồng xu gần nhất phía trước
      const a = timDau(XU, k.s + 6), b = timDau(XU, k.s + 70); for (let i = a; i < b; i++) if (XU[i].on && XU[i].y < 3) { muon = XU[i].d; break; }
    }
    A.muon = muon;
  }
  let muon = A.muon, truoc = null, truocDs = 1e9;
  for (const j of XE_DUA) {
    if (j === k) continue; const dT = j.tot - k.tot, dd = j.d - k.d;
    if (dT > 1 && dT < 20 + v * 0.4 && Math.abs(dd) < 4.4 && dT < truocDs) { truoc = j; truocDs = dT; }
    const hung = (P.hung || 0) * kh.hung;
    if (hung > 0.45 && Math.abs(dT) < 8 && Math.abs(dd) > 1.8 && Math.abs(dd) < 8 && Math.random() < dt * 2 * hung) { A.hungT = 0.7; A.hungMuc = j.d; }
    if (hung > 0.45 && j.nguoi && dT < -3 && dT > -25 && Math.abs(dd) < 10 && Math.random() < dt * 1.4 * hung) { A.hungT = 0.9; A.hungMuc = j.d * 0.85; }
  }
  if (A.hungT > 0) { A.hungT -= dt; muon = noi(muon, A.hungMuc, 0.75); }
  if (truoc) {
    if (A.passT <= 0) { A.passT = 1.6; const phai = truoc.d < 0 ? 1 : -1; A.passDich = kep(truoc.d + phai * 5, -LAN_TOI_DA, LAN_TOI_DA); if (Math.abs(A.passDich - truoc.d) < 3.5) A.passDich = truoc.d - phai * 5; }
    muon = A.passDich;
  }
  if (A.passT > 0) A.passT -= dt;
  muon = tranhVat(k, kep(muon, -LAN_TOI_DA, LAN_TOI_DA), 30 + v * 1.5);
  A.off += (muon - A.off) * Math.min(1, dt * 3);
  // ---- (2) đánh lái ----
  A.lechT += dt; if (A.lechT > A.lechHen) { A.lechT = 0; A.lechHen = ngauNhien(0.7, 1.8); A.lech = (Math.random() - 0.5) * 2 * 0.25 * sai; }
  const nhin = kep(14 + v * 0.45, 16, 80), d = diemTai(k.s + nhin, _ap), tx = d.x + d.nx * A.off, tz = d.z + d.nz * A.off;
  const dy = gocChenh(Math.atan2(tx - k.x, tz - k.z), k.yaw);
  dk.lai = kep(-dy * 2.6 + A.lech, -1, 1);
  // ---- (3) ga/phanh theo cua phía trước; (4) drift ở cua gắt ----
  const bam = k.tt.bam * (k.bBam > 0 ? 1.7 : 1), congNay = Math.abs(doCong(k.s + 10)), duocDrift = v > DRIFT_V + 4 && (P.abam || 1) * (1.2 - sai * 0.4) > 0.9;
  const thich = P.drift != null ? P.drift : 0.4;   // tính cách drift: thích drift thì đánh lái nhẹ cũng drift và giữ tới hết cua; ít drift thì chỉ drift ở cua gắt
  dk.drift = duocDrift && congNay > 1 / (90 + 330 * thich) && (Math.abs(dk.lai) > 0.6 - 0.5 * thich || (k.drift && thich >= 0.6 && congNay > 1 / 700));   // nhân vật thích drift thì drift cả cua nhẹ
  let vT = vMaxXe(k, k.nitDang);
  const tamPhanh = Math.min(420, v * v / (2 * GIA_TOC_PHANH) + 60);
  for (let dd = 8; dd <= tamPhanh; dd += 12) {
    const c = Math.abs(doCong(k.s + dd)); if (c < 1 / 2500) continue;
    const vc = vToiDaCua(1 / c, bam, k.drift || dk.drift) * (0.95 + 0.04 * (1 - sai)) * (P.lieu || 1), cho = Math.sqrt(vc * vc + 2 * GIA_TOC_PHANH * dd);
    if (cho < vT) vT = cho;
  }
  if (Math.abs(A.off - k.d) > 9) vT = Math.min(vT, 62);       // đang đổi làn rất xa thì bớt ga cho kịp lái
  if (truoc && truocDs < 12 && Math.abs(truoc.d - k.d) < 2.8) vT = Math.min(vT, Math.max(6, truoc.vf * 0.96));
  { const a = timDau(VAT, k.s), b = timDau(VAT, k.s + 30); for (let i = a; i < b; i++) { const o = VAT[i]; if (!o.da && o.loai === 'thung' && Math.abs(o.d - k.d) < 3.3) vT = Math.min(vT, 6 + (o.s - k.s) * 1.4); } }
  if (k.leCo) vT = Math.min(vT, V_GOC * 0.5);
  if (v > vT * 1.03) { dk.ga = 0; dk.phanh = kep((v - vT) / 12, 0.3, 1); } else { dk.phanh = 0; dk.ga = v < vT ? 1 : 0.4; }
  // ---- Nitro ở đoạn thẳng ----
  k.nitro = Math.min(NITRO_MAX, k.nitro + 1.6 * (P.anitro || 0.5) * (0.5 + kh.nitro) * dt);
  if (A.nitT > 0) { A.nitT -= dt; dk.nitro = true; }
  else {
    dk.nitro = false; A.nitCho -= dt;
    const cuoi = P.nitroKieu === 'cuoi', choCuoi = cuoi && k.tot < DD.L * 0.7;   // 'cuoi': để dành Nitro cho 3 km nước rút
    if (A.nitCho <= 0 && !choCuoi && k.nitro > ((P.anitro || 0) > 1.2 || cuoi ? 15 : 32) && v > 30) {
      let thang = true; if (P.nitroKieu !== 'luc') for (let dd = 20; dd <= 300; dd += 20) if (Math.abs(doCong(k.s + dd)) > 1 / 1500) { thang = false; break; }
      if (thang && Math.random() < 0.6 * (P.anitro || 0.5) * (0.4 + kh.nitro)) A.nitT = 1.2 + Math.random() * 1.6;
      A.nitCho = ngauNhien(2, 5) / Math.max(0.3, (P.anitro || 0.5) * kh.nitro + 0.2);
    }
  }
  // ---- (5) bị kẹt hoặc đi ngược: lùi ra, không được thì đặt lại ----
  const hg = Math.cos(gocChenh(Math.atan2(k.tx, k.tz), k.yaw));
  if (v < 2 && CUOC.chay) A.ketT += dt; else A.ketT = Math.max(0, A.ketT - dt * 2);
  if (hg < -0.2 && CUOC.chay) A.nguocT += dt; else A.nguocT = 0;
  if (A.ketT > 0.7 && !(A.luiT > 0) && !A.daLui) { A.luiT = 1.0; A.daLui = true; }
  if (A.luiT > 0) { A.luiT -= dt; dk.ga = 0; dk.phanh = 1; dk.nitro = false; dk.drift = false; dk.lai = -kep(-dy * 2.4, -1, 1); if (A.luiT <= 0) A.ketT = 0; }
  if (v > 8) A.daLui = false;
  if (A.ketT > 3.2 || A.nguocT > 2.2) { datLaiTrenDuong(k); A.ketT = A.nguocT = A.luiT = 0; A.daLui = false; }
  if (k.boss) tuyetChieuBoss(k, dt);
}
// Boss: "Sóng Sấm" — khi có xe bám sát phía sau, Boss báo trước 1 giây (vòng đỏ + tiếng còi) rồi phát sóng làm các xe phía sau gần nó chậm 20% trong 1,5 giây
function tuyetChieuBoss(k, dt) {
  const A = k.ai; A.chieuT -= dt;
  if (A.canhT > 0) {
    A.canhT -= dt;
    if (A.canhT <= 0) { for (const j of XE_DUA) { if (j === k) continue; const dT = k.tot - j.tot; if (dT > 0 && dT < 70 && Math.abs(j.d - k.d) < 18 && !j.bay) trungChieu(j, 1.5, 0.8, 'boss', k); } if (suKien) suKien('sam', k, 0); }
    return;
  }
  if (A.chieuT <= 0) { const sau = XE_DUA.some(j => j !== k && k.tot - j.tot > 5 && k.tot - j.tot < 60); if (sau) { A.canhT = 1.0; A.chieuT = A.p.chieu + Math.random() * 6; if (suKien) suKien('canh', k, 0); } else A.chieuT = 2; }
}
