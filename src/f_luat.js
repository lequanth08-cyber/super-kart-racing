// ===================== LUẬT ĐUA: XUẤT PHÁT, VỀ ĐÍCH, SỰ NGHIỆP, THỬ THÁCH, NHIỆM VỤ, HUY CHƯƠNG, QUÀ =====================
// CUOC.tt: 'menu' | 'dem' (đếm ngược) | 'dua' | 'slowmo' (vừa về đích, chạy chậm 3 giây) | 'ketqua' | 'tamdung'
const CUOC = { tt: 'menu', duong: 0, cheDo: 'nghiep', thuThach: null, kho: LUU.kho, heAI: 1, soLo: false, giay: 0, chay: false, demT: 0, dem: 4,
  nguoiXong: false, slowT: 0, xepHang: [], ketQua: null, tamTruoc: 'dua', gioChoi: 0, thu: false, hangCu: 0, mocDaQua: 0, quaMoi: [], chayM: 0 };
let tichLuy = 0;
const SO_DOI_THU = 6;                  // mỗi cuộc đua: bạn + 6 máy
const nhanVatCua = (id) => NHAN_VAT.find(n => n.id === id) || NHAN_VAT[0];
const xeCua = (id) => XE.find(x => x.id === id) || XE[0];
const mauXeNguoi = (x) => MAU_XE[(LUU.mau[x.id] != null ? LUU.mau[x.id] : x.mau) % MAU_XE.length];

function bacXe() { for (const k of XE_DUA) { scene.remove(k.mesh); huyMoHinh(k.mesh); } XE_DUA.length = 0; }
function demHuyChuong() {
  let vang = 0, bac = 0, dong = 0;
  for (const d of DUONG) { const h = (LUU.duong[d.id] || {}).hang; if (h === 1) vang++; else if (h === 2) bac++; else if (h === 3) dong++; }
  const tt = THU_THACH.filter(t => (LUU.thuThach[t.id] || {}).xong).length, nv = NHIEM_VU.filter(n => LUU.nhiemVu[n.id]).length;
  return { vang, bac, dong, thuThach: tt, nhiemVu: nv, tongVang: vang + tt };
}
function duongMo(i) { return i === 0 || !!(LUU.duong[DUONG[i].id] || {}).mo; }
function thuThachMo(t) { return !!(LUU.thuThach[t.id] || {}).mo; }
function xeMoDuoc(x) {                 // xe đặc biệt mở bằng thành tích (không mua bằng xu)
  if (!x.mo) return true;
  if (x.mo.huyVang) return demHuyChuong().tongVang >= x.mo.huyVang;
  if (x.mo.boss) return !!LUU.kyTich['thang_' + x.mo.boss];
  return false;
}

// ---------- bắt đầu một cuộc đua ----------
function batDauCuoc(o) {               // o: { duong, cheDo: 'nghiep'|'tudo'|'thuthach', thuThach }
  const t = o.thuThach || null, idx = t ? t.duong : o.duong, p = DUONG[idx];
  CUOC.duong = idx; CUOC.cheDo = o.cheDo; CUOC.thuThach = t; CUOC.kho = t && t.loai === 'doi' ? 'kho' : LUU.kho; CUOC.heAI = p.ai; CUOC.soLo = !!(t && t.loai === 'gio');
  dungDuong(idx); bacXe();
  const nv = nhanVatCua(o.nvId || LUU.nhanVat), x = xeCua(o.xeId || LUU.xeDang), m = mauXeNguoi(x);
  XE_DUA.push(taoXeDua({ ten: 'BẠN', id: 'nguoi', nguoi: true, nv, xe: x, mau: m, phu: x.phu, tt: { vmax: x.vmax * (nv.vm || 1), ga: x.ga * nv.ga, bam: x.bam * nv.bam, nit: x.nit * nv.nit, driftNhanh: nv.driftNhanh || 1 }, hut: nv.hut, ben: nv.ben, gio: nv.gio }));
  const doiThu = [];
  if (t && t.loai === 'doi') { let c = BOSS[t.muc] ? Object.assign({ laBoss: true }, BOSS[t.muc]) : nhanVatCua(t.muc); if (c.id === nv.id) c = Object.assign({}, c, { ten: c.ten + ' Bóng Tối', mau: 0x15151c }); doiThu.push(c); }
  else if (!CUOC.soLo) {                 // 6 đối thủ máy rút ngẫu nhiên từ 30 nhân vật, không ai trùng nhau, không trùng bạn; đường có Boss thì Boss là 1 trong 6
    const bossId = p.boss && !t && p.boss !== nv.id ? p.boss : null, kho = NHAN_VAT.filter(n => n.id !== nv.id && n.id !== bossId);
    for (let i = kho.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [kho[i], kho[j]] = [kho[j], kho[i]]; }
    if (bossId) doiThu.push(Object.assign({ laBoss: true }, BOSS[bossId]));
    for (const n of kho) { if (doiThu.length >= SO_DOI_THU) break; doiThu.push(n); }
  }
  for (const c of doiThu) XE_DUA.push(taoXeDua({ ten: c.ten, id: c.id, nv: c, boss: c.laBoss ? c : null, xe: XE[c.xe], mau: c.mau, phu: c.phu, tt: { vmax: 1.12, ga: c.aga, bam: c.abam, nit: 1.1, driftNhanh: c.driftNhanh || 1 }, hut: c.hut || 0, ben: c.ben || 0, gio: c.gio || 0, ai: taoAI(c) }));
  const choNguoi = XE_DUA.length > 3 ? 3 : XE_DUA.length - 1, conLai = [];     // người chơi xuất phát thứ 4 (tay đôi: thứ 2), máy chia các chỗ còn lại
  for (let n = 0; n < XE_DUA.length; n++) if (n !== choNguoi) conLai.push(n);
  for (let i = conLai.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [conLai[i], conLai[j]] = [conLai[j], conLai[i]]; }
  const slot = [choNguoi].concat(conLai);
  XE_DUA.forEach((k, i) => { const l = luoiXuatPhat(slot[i]); datXe(k, l.x, l.z, l.yaw, l.tot); k.hang = slot[i] + 1; k.tkCho = k.nv && k.nv.ky ? k.nv.ky.cd * 0.35 : 0; });
  for (const qa of QUA) qa.on = !ttDuong(p.id).qua[qa.so];
  for (const c of XU) { c.on = true; c.hoi = 0; }                                  // đua lại cùng đường: xu mọc đủ, chướng ngại về chỗ cũ
  for (const v of VAT) { v.da = false; v.hoi = 0; v.oy = 0; v.ang = 0; v.vx = v.vz = 0; const g = diemTai(v.s); v.x = g.x + g.nx * v.d; v.z = g.z + g.nz * v.d; v.h = g.h; }
  CUOC.giay = 0; CUOC.chay = false; CUOC.nguoiXong = false; CUOC.ketQua = null; CUOC.slowT = 0; CUOC.mocDaQua = 0; CUOC.quaMoi = []; CUOC.chayM = 0; tichLuy = 0;
  huyHetKhuc(); vungDang = -1; datVung(vungTai(XE_DUA[0].s)); capNhatKhuc(XE_DUA[0].s, 99); xoaVet(); xoaKyNang();
  tinhXepHang(); CUOC.hangCu = XE_DUA[0].hang;
  CUOC.tt = 'dem'; CUOC.demT = GIAY_DEM; CUOC.dem = 4;
}
function tinhXepHang() {
  CUOC.xepHang = XE_DUA.slice().sort((a, b) => a.xong && b.xong ? a.tgXong - b.tgXong : a.xong ? -1 : b.xong ? 1 : b.tot - a.tot);
  CUOC.xepHang.forEach((k, i) => { k.hang = i + 1; });
}
function dieuKhienNguoi(k) { const d = k.dk, I = DV.nhap(); d.lai = I.lai; d.nitro = I.nitro; d.drift = I.drift; d.phanh = I.phanh; d.ga = I.phanh ? 0 : I.ga; if (k.bTuLai > 0) d.lai = kep(d.lai * 0.3 + laiTuDong(k) * 0.7, -1, 1); }   // Auto Balance: xe tự giữ đường
function capNhatMotBuoc(dt) {
  const chay = CUOC.chay;
  for (const k of XE_DUA) {
    if (!chay) { k.dk.ga = k.dk.phanh = k.dk.lai = 0; k.dk.nitro = k.dk.drift = false; }
    else if (k.nguoi && !k.xong) dieuKhienNguoi(k);
    else { if (!k.ai) k.ai = taoAI(NHAN_VAT[4]); dieuKhienAI(k, dt); }
    const sCu = k.tot; buocXe(k, dt);
    if (k.nguoi && chay && !k.xong) CUOC.chayM += Math.max(0, k.tot - sCu);
  }
  vaChamXe(); capNhatKyNang(dt); capNhatTuyetKy(dt);
  for (const k of XE_DUA) {
    xuLyVatPham(k, dt);
    if (k.gio > 0) for (const j of XE_DUA) { if (j === k) continue; const dT = j.tot - k.tot; if (dT > 4 && dT < 30 && Math.abs(j.d - k.d) < 3) { k.gioT = 0.25; break; } }
    if (!k.xong && k.tot >= DD.L && chay) veDich(k);
  }
}
function veDich(k) {
  k.xong = true; k.tgXong = CUOC.giay - Math.max(0, k.tot - DD.L) / Math.max(8, Math.abs(k.vf)); k.dk.nitro = false; k.dk.drift = false;
  tinhXepHang();
  if (k.nguoi) { CUOC.nguoiXong = true; CUOC.tt = 'slowmo'; CUOC.slowT = SLOWMO_GIAY; if (!k.ai) k.ai = taoAI(NHAN_VAT[4]); tieng('dich'); if (DV.bao) DV.bao('VỀ ĐÍCH! HẠNG ' + k.hang, 2800); }
}
function suKienDua(ten, k, tham) {
  if (k.xong && k.nguoi) return;          // về đích rồi thì không còn tiếng va chạm, rung, thông báo
  const nguoi = k.nguoi;
  if (ten === 'xu') { if (nguoi) { tieng('xu', k.combo); DV.combo && DV.combo(k.combo, tham); } }
  else if (ten === 'qua') {
    const id = DD.id, tt = ttDuong(id);
    if (!tt.qua[tham]) { tt.qua[tham] = true; const n = QUA_BI_MAT[tham]; LUU.xu += n; LUU.tk.qua++; CUOC.quaMoi.push('Hộp quà bí mật số ' + (tham + 1) + ': +' + n + ' xu'); luuLai(); tieng('qua'); if (DV.bao) DV.bao('🎁 QUÀ BÍ MẬT +' + n + ' XU', 2400); for (let i = 0; i < 30; i++) hat(k.x, k.y + 2, k.z, ngauNhien(-8, 8), ngauNhien(2, 10), ngauNhien(-8, 8), 0xff6ab8, 0.8, 1.2, 0.1, true, 1); }
  }
  else if (ten === 'va') { if (nguoi || XE_DUA[0] === k) { tieng('va'); rung(40); for (let i = 0; i < 10; i++) hat(k.x, k.y + 1, k.z, ngauNhien(-6, 6), ngauNhien(1, 5), ngauNhien(-6, 6), 0xffe08a, 0.35, 0.8, 0.05, true, 1); if (nguoi) DV.rung = 0.35; } }
  else if (ten === 'tuong') { if (nguoi) { tieng('tuong'); rung(60); DV.rung = Math.min(0.6, 0.15 + tham * 0.02); for (let i = 0; i < 10; i++) hat(k.x, k.y + 0.8, k.z, ngauNhien(-5, 5), ngauNhien(1, 4), ngauNhien(-5, 5), 0xffffff, 0.4, 0.8, 0.05, true, 1); } }
  else if (ten === 'non') { if (nguoi) tieng('non'); }
  else if (ten === 'xung') { if (nguoi) { tieng('xung'); DV.rung = 0.2; } }
  else if (ten === 'nitro') { if (nguoi) tieng('nitro'); }
  else if (ten === 'hop') { if (nguoi) { tieng('qua'); if (DV.bao) DV.bao(KY_NANG[k.kyNang].icon + ' ' + KY_NANG[k.kyNang].ten + (CAM_UNG ? ' — bấm nút kỹ năng' : ' — bấm E'), 1600); } for (let i = 0; i < 14; i++) hat(k.x, k.y + 2, k.z, ngauNhien(-6, 6), ngauNhien(2, 7), ngauNhien(-6, 6), [0xff3a3a, 0xffe03a, 0x3aa8ff, 0x4acb5a, 0xb05aff][i % 5], 0.6, 0.9, 0.1, true, 1); }
  else if (ten === 'trung') { if (nguoi) { tieng('va'); rung(120); DV.rung = 0.4; if (DV.bao) DV.bao(TEN_TRUNG[tham] || '⚡ Bị sét đánh!', 1200); } }
  else if (ten === 'tuyetky') { if (nguoi) { tieng('xung'); setTimeout(() => tieng('huy'), 160); DV.bao(tham.ic + ' ' + tham.ten + '!', 1300); DV.rung = Math.max(DV.rung || 0, 0.25); } }
  else if (ten === 'phanxa') { if (nguoi) { tieng('huy'); if (DV.bao) DV.bao('💠 Phản xạ! Chiêu bật ngược về đối thủ', 1300); } }
  else if (ten === 'khienVo') { if (nguoi) { tieng('non'); if (DV.bao) DV.bao('🛡️ Khiên đã đỡ đòn!', 1000); } }
  else if (ten === 'sam2') { tieng('sam'); for (const j of XE_DUA) if (j.chamT > 1.9) for (let i = 0; i < 12; i++) hat(j.x, j.y + 8 - i * 0.6, j.z, ngauNhien(-1, 1), -4, ngauNhien(-1, 1), 0xbfe8ff, 0.35, 1.4, 0.4, true, 1); }
  else if (ten === 'dung') { if (nguoi) tieng(tham === 'khien' ? 'huy' : 'xung'); }
  else if (ten === 'moc') { if (nguoi) tieng('drift', tham); }
  else if (ten === 'phong') { if (nguoi) { tieng('xung'); if (DV.bao) DV.bao(['', 'PHÓNG!', 'SIÊU PHÓNG!', 'CỰC PHÓNG!'][tham], 900); } }
  else if (ten === 'dap') { if (nguoi) { tieng('dap'); DV.rung = 0.3; if (tham > 60 && DV.bao) DV.bao('BAY ' + Math.round(tham) + ' M!', 1200); } }
  else if (ten === 'canh') { if (XE_DUA[0].tot < k.tot && k.tot - XE_DUA[0].tot < 90) { tieng('canh'); if (DV.bao) DV.bao('⚠️ ' + k.ten + ' sắp tung Sóng Sấm!', 1100); } }
  else if (ten === 'sam') { tieng('sam'); for (let i = 0; i < 40; i++) { const a = i / 40 * 6.283; hat(k.x, k.y + 1, k.z, Math.cos(a) * 30, 2, Math.sin(a) * 30, 0x7ad8ff, 0.8, 2, 0.2, true, 1); } if (XE_DUA[0].chamT > 0) { DV.rung = 0.5; rung(120); } }
}
suKien = suKienDua;

function capNhatCuoc(dt) {
  if (CUOC.tt === 'dem') {
    CUOC.demT -= dt; const so = Math.ceil(CUOC.demT - (GIAY_DEM - 3));
    if (so !== CUOC.dem && so >= 1 && so <= 3) { CUOC.dem = so; tieng('bip'); }
    if (CUOC.demT <= 0) { CUOC.tt = 'dua'; CUOC.chay = true; CUOC.dem = 0; tieng('di'); if (DV.bao) DV.bao('XUẤT PHÁT!', 1200); }
    tichLuy += dt; let n = 0; while (tichLuy >= FB && n++ < 12) { tichLuy -= FB; capNhatMotBuoc(FB); }
    return;
  }
  if (CUOC.tt !== 'dua' && CUOC.tt !== 'slowmo' && CUOC.tt !== 'ketqua') return;
  const heT = CUOC.tt === 'slowmo' ? SLOWMO_HE : 1;
  tichLuy += Math.min(dt, 0.1) * heT; let n = 0;
  while (tichLuy >= FB && n++ < 14) { tichLuy -= FB; if (CUOC.tt !== 'ketqua') CUOC.giay += FB; capNhatMotBuoc(FB); }
  if (tichLuy > FB * 4) tichLuy = 0;                 // máy quá chậm thì bỏ bớt, không để dồn
  tinhXepHang();
  const k = XE_DUA[0];
  if (CUOC.tt === 'dua') {
    if (k.hang < CUOC.hangCu) LUU.tk.vuot += CUOC.hangCu - k.hang; CUOC.hangCu = k.hang;
    const moc = MOC_HAM.filter(b => k.tot >= b + 40).length; if (moc > CUOC.mocDaQua) { CUOC.mocDaQua = moc; tieng('moc'); const p = DUONG[chuDeVung(vungTai(k.s))]; if (DV.bao) DV.bao(p.icon + ' ' + p.ten.toUpperCase() + ' · ' + (moc < MOC_HAM.length ? moc + ' KM' : 'SẮP VỀ ĐÍCH!') + ' · ' + dinhDangGio(CUOC.giay) + ' · HẠNG ' + k.hang, 1800); }
  }
  if (CUOC.tt === 'slowmo') { CUOC.slowT -= dt; if (CUOC.slowT <= 0) ketThucCuoc(); }
}

// ---------- kết thúc: thưởng, thành tích, mở khóa ----------
function ketThucCuoc() {
  CUOC.tt = 'ketqua'; tinhXepHang();
  const k = XE_DUA[0], p = DD.p, hang = k.hang, tk = LUU.tk, tt = ttDuong(p.id), t = CUOC.thuThach, kq = { hang, tg: k.tgXong, xuNhat: k.xu, thuong: 0, moi: [], nhiemVu: [], thuThachOK: null, huy: null, kyLuc: false };
  // thống kê cá nhân
  tk.km += CUOC.chayM / 1000; tk.giay += CUOC.giay; tk.dua++; tk.nhay += k.nhay; tk.drift += k.driftQuang; tk.xuTong += k.xu; tk.tuong += k.chamTuong;
  tk.vMax = Math.max(tk.vMax, Math.round(k.vMax)); tk.nhayXa = Math.max(tk.nhayXa, Math.round(k.nhayXa)); tk.combo = Math.max(tk.combo, k.comboMax);
  const nhieuXe = XE_DUA.length > 1;
  if (nhieuXe && hang === 1) { tk.thang++; if (!k.dungNitro) tk.thangKhongNitro++; }
  if (nhieuXe && hang <= 3) tk.bucVinh++;
  const coBoss = XE_DUA.find(j => j.boss);
  if (coBoss && hang < coBoss.hang) { tk.boss++; if (!LUU.kyTich['thang_' + coBoss.boss.id]) { LUU.kyTich['thang_' + coBoss.boss.id] = true; kq.moi.push('👑 Đánh bại Boss ' + coBoss.boss.ten + '!'); } }
  // kết quả theo chế độ
  if (CUOC.cheDo !== 'thuthach') {
    kq.thuong = XU_HANG[hang - 1] || 0; tt.dua++;
    if (tt.tot == null || k.tgXong < tt.tot) { kq.kyLuc = tt.tot != null; tt.tot = k.tgXong; }
    if (tt.hang == null || hang < tt.hang) tt.hang = hang;
    kq.huy = hang === 1 ? 'vang' : hang === 2 ? 'bac' : hang === 3 ? 'dong' : null;
    if (hang === 1) {                    // thắng: mở đường kế tiếp và mở thử thách của đường này
      const sau = DUONG[CUOC.duong + 1]; if (sau && !ttDuong(sau.id).mo) { ttDuong(sau.id).mo = true; kq.moi.push('🔓 Mở đường mới: ' + sau.icon + ' ' + sau.ten); }
      const th = THU_THACH.find(x => x.duong === CUOC.duong); if (th) { const s = LUU.thuThach[th.id] || (LUU.thuThach[th.id] = {}); if (!s.mo) { s.mo = true; kq.moi.push('🏁 Mở thử thách mới: ' + th.ten); } }
    }
  } else {
    const xong = k.xong, L = DD.L;
    const ok = t.loai === 'xu' ? xong && k.xu >= t.muc : t.loai === 'nhay' ? xong && k.nhay >= t.muc : t.loai === 'gio' ? xong && k.tgXong <= L / t.muc
      : t.loai === 'drift' ? xong && k.driftQuang >= t.muc : t.loai === 'doi' ? hang === 1 : t.loai === 'combo' ? k.comboMax >= t.muc : t.loai === 'sach' ? xong && hang <= 3 && k.chamTuong === 0 : false;
    kq.thuThachOK = ok; const s = LUU.thuThach[t.id] || (LUU.thuThach[t.id] = { mo: true });
    if (ok && !s.xong) { s.xong = true; tk.thuThach++; kq.thuong = t.thuong; kq.huy = 'thuthach'; kq.moi.push('🏅 Hoàn thành thử thách: ' + t.ten); }
    else if (ok) kq.thuong = Math.round(t.thuong * 0.2);
    s.lan = (s.lan || 0) + 1;
  }
  // quà cột mốc mỗi 100 km và quà kỳ tích lần đầu (luôn theo điều kiện rõ ràng, không may rủi)
  while (tk.km >= (LUU.mocKm + 1) * QUA_MOC_KM) { LUU.mocKm++; kq.thuong += QUA_MOC_XU; kq.moi.push('🎁 Quà cột mốc ' + LUU.mocKm * QUA_MOC_KM + ' km: +' + QUA_MOC_XU + ' xu'); }
  const kyTich = [['v500', tk.vMax >= 500, 1000, 'Lần đầu đạt 500 km/h'], ['bay200', tk.nhayXa >= 200, 600, 'Lần đầu bay xa 200 m'], ['combo30', tk.combo >= 30, 500, 'Lần đầu combo 30 xu'], ['thang1', tk.thang >= 1, 400, 'Chiến thắng đầu tiên']];
  for (const [id, dat, xu, ten] of kyTich) if (dat && !LUU.kyTich[id]) { LUU.kyTich[id] = true; kq.thuong += xu; kq.moi.push('🎁 Quà kỳ tích — ' + ten + ': +' + xu + ' xu'); }
  for (const q of CUOC.quaMoi) kq.moi.push('🎁 ' + q);
  LUU.xu += k.xu + kq.thuong;
  // nhiệm vụ dài hạn
  for (const n of NHIEM_VU) { if (LUU.nhiemVu[n.id]) continue; const [a, b] = n.dk(tk, LUU); if (a >= b) { LUU.nhiemVu[n.id] = true; LUU.xu += n.thuong; kq.nhiemVu.push(n.ten + ' (+' + n.thuong + ' xu)'); } }
  kq.nvMoi = kiemTraMoNhanVat(); for (const n of kq.nvMoi) kq.moi.push('🔓 Mở khóa nhân vật mới: ' + n.ic + ' ' + n.ten + ' (' + n.hinh + ')');
  for (const x of XE) if (x.mo && !LUU.xe.includes(x.id) && xeMoDuoc(x) && !LUU.kyTich['bao_' + x.id]) { LUU.kyTich['bao_' + x.id] = true; kq.moi.push('🚗 Xe đặc biệt ' + x.ten + ' đã mở! Vào Garage để nhận miễn phí'); }
  luuLai(); CUOC.ketQua = kq;
  tieng(hang === 1 || kq.thuThachOK ? 'thang' : 'dich'); if (kq.nhiemVu.length || kq.huy) setTimeout(() => tieng('huy'), 900);
  if (DV.hienKetQua) DV.hienKetQua();
}
function thoatCuoc() { xoaKyNang(); xoaVet(); bacXe(); CUOC.tt = 'menu'; CUOC.chay = false; if (DV.vaoSanh) DV.vaoSanh(); }
