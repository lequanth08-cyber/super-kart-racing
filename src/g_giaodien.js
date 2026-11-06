// ===================== GIAO DIỆN: SẢNH, CÁC MÀN HÌNH, HUD, ĐIỀU KHIỂN, CAMERA, VÒNG LẶP =====================
const LOP = ['sanh', 'chonLoai', 'man', 'hud', 'ketQua', 'tamDung', 'huongDan', 'nghiMat'];
function hienLop(ds) { for (const id of LOP) if (id !== 'nghiMat') $(id).classList.toggle('hien', ds.includes(id)); }   // màn nghỉ mắt chỉ tắt bằng nút của nó
if (CAM_UNG) document.body.classList.add('camung');
const hexCss = (m) => '#' + new THREE.Color(m).getHexString();
const sao = (n) => '★'.repeat(n) + '☆'.repeat(3 - n);
const HUY_IC = { vang: '🥇', bac: '🥈', dong: '🥉', thuthach: '🏅' };

// ---------- nhập liệu: bàn phím + nút cảm ứng ----------
const DV = {
  phim: {}, cham: { trai: false, phai: false, ga: false, phanh: false, nitro: false, drift: false }, rung: 0, bao: null, combo: null, hienKetQua: null, vaoSanh: null,
  gaTuDong() { return LUU.gaTuDong == null ? CAM_UNG : LUU.gaTuDong; },
  nhap() {
    const p = this.phim, c = this.cham;
    const trai = p.ArrowLeft || p.KeyA || c.trai, phai = p.ArrowRight || p.KeyD || c.phai, phanh = !!(p.ArrowDown || p.KeyS || c.phanh);
    return { lai: (phai ? 1 : 0) - (trai ? 1 : 0), ga: (p.ArrowUp || p.KeyW || c.ga || this.gaTuDong()) ? 1 : 0, phanh: phanh ? 1 : 0,
      nitro: !!(p.ShiftLeft || p.ShiftRight || p.KeyN || c.nitro), drift: !!(p.Space || c.drift) };
  },
  nhaHet() { this.phim = {}; for (const k in this.cham) this.cham[k] = false; if (typeof LAI !== 'undefined') LAI.clear(); if (typeof NGON_DE !== 'undefined') for (const n of NGON_DE) n.clear(); document.querySelectorAll('.tNut.giu').forEach(e => e.classList.remove('giu')); }
};
const dangDua = () => CUOC.tt === 'dua' || CUOC.tt === 'dem' || CUOC.tt === 'slowmo';
addEventListener('keydown', (e) => {
  moAm();
  if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space'].includes(e.code) && (dangDua() || CUOC.tt === 'tamdung')) e.preventDefault();
  DV.phim[e.code] = true;
  if (e.repeat) return;
  if (e.code === 'Escape' || e.code === 'KeyP') { if (CUOC.tt === 'dua' || CUOC.tt === 'dem') tamDung(); else if (CUOC.tt === 'tamdung') tiepTuc(); else if ($('man').classList.contains('hien') || $('chonLoai').classList.contains('hien')) vaoSanh(); }
  if (e.code === 'KeyR' && CUOC.tt === 'dua' && !XE_DUA[0].xong) datLaiTrenDuong(XE_DUA[0]);
  if (e.code === 'KeyM') doiAm();
  if (e.code === 'KeyC') doiCam();
  if (e.code === 'KeyE' && CUOC.tt === 'dua' && XE_DUA.length) dungKyNang(XE_DUA[0]);
  if (e.code === 'Enter' && CUOC.tt === 'menu' && $('sanh').classList.contains('hien') && !$('nghiMat').classList.contains('hien')) batDauDua({ duong: duongTiep(), cheDo: 'nghiep' });
});
addEventListener('keyup', (e) => { DV.phim[e.code] = false; });
addEventListener('blur', () => { DV.nhaHet(); if (CUOC.tt === 'dua' || CUOC.tt === 'dem') tamDung(); });
document.addEventListener('visibilitychange', () => { if (document.hidden) { DV.nhaHet(); if (CUOC.tt === 'dua' || CUOC.tt === 'dem') tamDung(); } });
addEventListener('pointerdown', moAm, true);
try { matchMedia('(orientation:portrait) and (pointer:coarse)').addEventListener('change', (e) => { if (e.matches) { DV.nhaHet(); if (CUOC.tt === 'dua' || CUOC.tt === 'dem') tamDung(); } }); } catch (e) { }   // xoay dọc giữa trận thì tự tạm dừng
for (const ev of ['touchend', 'pointerup', 'click']) addEventListener(ev, moAm, true);     // iPhone: chỉ cho mở âm thanh khi nhấc ngón tay
let daToanMan = false;
function toanManHinh() {               // điện thoại Android: chạm lần đầu thì vào toàn màn hình và giữ màn hình nằm ngang
  if (daToanMan || !CAM_UNG) return; daToanMan = true;
  const el = document.documentElement, f = el.requestFullscreen || el.webkitRequestFullscreen;
  try { const p = f && f.call(el, { navigationUI: 'hide' }); if (p && p.then) p.then(() => { try { screen.orientation.lock('landscape').catch(() => { }); } catch (e) { } }).catch(() => { }); } catch (e) { }
}
addEventListener('touchend', toanManHinh, true);
addEventListener('contextmenu', (e) => e.preventDefault());
const LAI = new Map();                 // ngón đang lái → 'trai' | 'phai'
function capLai() { let t = false, p = false; for (const v of LAI.values()) { if (v === 'trai') t = true; else p = true; } DV.cham.trai = t; DV.cham.phai = p; $('tTrai').classList.toggle('giu', t); $('tPhai').classList.toggle('giu', p); }
function benLai(x) { const a = $('tTrai').getBoundingClientRect(), b = $('tPhai').getBoundingClientRect(); return x < (a.right + b.left) / 2 ? 'trai' : 'phai'; }
for (const id of ['tTrai', 'tPhai']) {
  const el = $(id);
  el.addEventListener('pointerdown', (e) => { e.preventDefault(); try { el.setPointerCapture(e.pointerId); } catch (x) { } LAI.set(e.pointerId, benLai(e.clientX)); capLai(); });
  el.addEventListener('pointermove', (e) => { if (!LAI.has(e.pointerId)) return; const b = benLai(e.clientX); if (b !== LAI.get(e.pointerId)) { LAI.set(e.pointerId, b); capLai(); } });
  for (const ev of ['pointerup', 'pointercancel', 'lostpointercapture']) el.addEventListener(ev, (e) => { if (LAI.delete(e.pointerId)) capLai(); });
}
const NGON_DE = [];                     // các bộ ngón đang đè của từng nút, để xóa sạch khi tạm dừng
for (const [id, ten] of [['tGa', 'ga'], ['tPhanh', 'phanh'], ['tNitro', 'nitro'], ['tDrift', 'drift']]) {   // mỗi nút nhớ các ngón đang đè, bấm nhiều nút một lúc vẫn được
  const el = $(id), ngon = new Set(), cap = () => { DV.cham[ten] = ngon.size > 0; el.classList.toggle('giu', ngon.size > 0); }; NGON_DE.push(ngon);
  el.addEventListener('pointerdown', (e) => { e.preventDefault(); ngon.add(e.pointerId); try { el.setPointerCapture(e.pointerId); } catch (x) { } cap(); });
  for (const ev of ['pointerup', 'pointercancel', 'lostpointercapture']) el.addEventListener(ev, (e) => { ngon.delete(e.pointerId); cap(); });
}
$('tKyNang').addEventListener('pointerdown', (e) => { e.preventDefault(); if (CUOC.tt === 'dua') dungKyNang(XE_DUA[0]); });
$('oKyNang').addEventListener('pointerdown', (e) => { e.preventDefault(); if (CUOC.tt === 'dua') dungKyNang(XE_DUA[0]); });
$('tDat').addEventListener('pointerdown', (e) => { e.preventDefault(); if (CUOC.tt === 'dua' && !XE_DUA[0].xong) datLaiTrenDuong(XE_DUA[0]); });

// ---------- thông báo ----------
let baoHen = 0, comboHen = 0;
DV.bao = (chu, ms) => { const b = $('bao'); b.textContent = chu; b.classList.add('hien'); clearTimeout(baoHen); baoHen = setTimeout(() => b.classList.remove('hien'), ms || 1500); };
DV.combo = (n, he) => { if (n < 3) return; const c = $('combo'); c.textContent = 'COMBO ×' + he + ' · ' + n; c.classList.add('hien'); clearTimeout(comboHen); comboHen = setTimeout(() => c.classList.remove('hien'), COMBO_GIAY * 1000); };

// ---------- xe trưng bày ở sảnh / garage ----------
let xemMesh = null, xemXe = LUU.xeDang;
function huyXemTruoc() { if (xemMesh) { scene.remove(xemMesh); huyMoHinh(xemMesh); xemMesh = null; } }
function dungXemTruoc(xeId) {
  huyXemTruoc(); xemXe = xeId; const x = xeCua(xeId), nv = nhanVatCua(LUU.nhanVat);
  xemMesh = taoKart(x, mauXeNguoi(x), x.phu, null, { mauMu: nv.mau, nvId: nv.id }); const l = luoiXuatPhat(3); xemMesh.position.set(l.x, l.y, l.z); xemMesh.rotation.y = l.yaw; scene.add(xemMesh);
}
function duongTiep() { let i = 0; for (let k = 0; k < DUONG.length; k++) if (duongMo(k)) { i = k; if ((LUU.duong[DUONG[k].id] || {}).hang !== 1) return k; } return i; }

// ---------- SẢNH ----------
function vaoSanh() {
  huyBucVinh(); CUOC.tt = 'menu'; bacXe(); $('man').classList.remove('hien');
  dungDuong(duongTiep()); capNhatKhuc(quanhS(-40), 99); dungXemTruoc(LUU.xeDang); hienLop(['sanh']); veSanh(); kiemTraNghiMat();
}
DV.vaoSanh = vaoSanh;
function veSanh() {
  const nv = nhanVatCua(LUU.nhanVat), x = xeCua(LUU.xeDang), h = demHuyChuong(), di = duongTiep(), d = DUONG[di];
  $('hsAvatar').textContent = nv.ten[0]; $('hsAvatar').style.background = hexCss(nv.mau); $('hsTen').textContent = nv.ten + ' · ' + nv.hinh; $('hsXe').textContent = '🚗 ' + x.ten + ' · ' + nv.loi; $('hsXu').textContent = dinhDangSo(LUU.xu);
  $('hsHuy').innerHTML = '<span class="huy">🥇 ' + h.vang + '</span><span class="huy">🥈 ' + h.bac + '</span><span class="huy">🥉 ' + h.dong + '</span><span class="huy">🏅 ' + h.thuThach + '</span><span class="huy">📜 ' + h.nhiemVu + '</span>';
  $('mDuong').textContent = 'Đã mở ' + DUONG.filter((_, i) => duongMo(i)).length + '/10 · đường ' + KM_DUONG + ' km'; $('mThuThach').textContent = THU_THACH.filter(t => (LUU.thuThach[t.id] || {}).xong).length + '/10 hoàn thành';
  $('mGarage').textContent = 'Có ' + LUU.xe.length + '/' + XE.length + ' xe'; $('mTayDua').textContent = 'Đang chọn ' + nv.ten; $('mNhiemVu').textContent = h.nhiemVu + '/' + NHIEM_VU.length + ' · huy chương'; $('mCaiDat').textContent = 'Đồ họa: ' + DH().ten;
  $('nutLoaiXe').textContent = laMoto(x) ? '🏍️ Đang đi xe máy · đổi sang ô tô' : '🏎️ Đang đi ô tô · đổi sang xe máy';
  $('tenTiep').textContent = d.icon + ' ' + d.ten + (d.boss ? ' 👑' : '');
}
// ---------- chọn ô tô hay xe máy (hiện mỗi lần mới vào game, và khi bấm nút ở sảnh) ----------
const laMoto = (x) => x.loai === 'moto';
function moChonLoai() {
  const moto = laMoto(xeCua(LUU.xeDang)); hienLop(['chonLoai']);
  $('loaiOto').classList.toggle('dang', !moto); $('loaiMoto').classList.toggle('dang', moto);
}
function chonLoaiXe(moto) {
  let ds = XE.filter(x => laMoto(x) === moto && LUU.xe.includes(x.id)), tang = null;
  if (!ds.length) { tang = XE.find(x => laMoto(x) === moto && !x.mo); LUU.xe.push(tang.id); ds = [tang]; }   // chưa có xe loại này: tặng mẫu đầu tiên
  if (laMoto(xeCua(LUU.xeDang)) !== moto) LUU.xeDang = ds.reduce((a, b) => (b.vmax > a.vmax ? b : a)).id;  // lấy xe mạnh nhất đang có của loại đó
  gChon = LUU.xeDang; luuLai(); tieng('mua'); vaoSanh();
  DV.bao(tang ? '🎁 Tặng bạn ' + tang.ten + '!' : (moto ? '🏍️ ' : '🏎️ ') + xeCua(LUU.xeDang).ten, tang ? 2400 : 1500);
}
$('loaiOto').onclick = () => chonLoaiXe(false); $('loaiMoto').onclick = () => chonLoaiXe(true);
$('nutLoaiXe').onclick = () => { tieng('chuyen'); moChonLoai(); };
document.querySelectorAll('.oMenu').forEach(b => b.onclick = () => { tieng('chuyen'); moMan(b.dataset.m); });
$('nutDuaTiep').onclick = () => batDauDua({ duong: duongTiep(), cheDo: 'nghiep' });

// ---------- MÀN HÌNH CON ----------
let manDang = '';
const TEN_MAN = { duong: '🏁 Đường đua', thuthach: '🎯 Thử thách', garage: '🔧 Garage', taydua: '👤 Tay đua', nhiemvu: '📜 Nhiệm vụ & Huy chương', thanhtich: '🏆 Thành tích', caidat: '⚙️ Cài đặt' };
function moMan(ten) {
  manDang = ten; hienLop(['man']); $('man').classList.toggle('hep', ten === 'garage' || ten === 'taydua');
  $('manTieuDe').textContent = TEN_MAN[ten]; $('manXu').textContent = dinhDangSo(LUU.xu); $('manND').scrollTop = 0;
  if (ten !== 'garage') dungXemTruoc(LUU.xeDang);
  ({ duong: veManDuong, thuthach: veManThuThach, garage: veManGarage, taydua: veManTayDua, nhiemvu: veManNhiemVu, thanhtich: veManThanhTich, caidat: veManCaiDat })[ten]();
}
$('manVe').onclick = () => { tieng('chuyen'); vaoSanh(); };
function hangKho() { return '<div class="nhan" style="margin-top:0">Mức khó của máy</div><div class="hangNut" id="chonKho">' + Object.keys(DO_KHO).map(k => '<button class="chon' + (LUU.kho === k ? ' dang' : '') + '" data-v="' + k + '">' + DO_KHO[k].ten + '</button>').join('') + '</div><div class="moTa">' + DO_KHO[LUU.kho].mt + '</div>'; }
function ganKho(veLai) { document.querySelectorAll('#chonKho .chon').forEach(b => b.onclick = () => { LUU.kho = b.dataset.v; luuLai(); tieng('chuyen'); veLai(); }); }
function veManDuong() {
  const nd = $('manND');
  nd.innerHTML = hangKho() + '<div class="nhan">10 chặng · 1 vòng ' + KM_DUONG + ' km, mỗi km một khung cảnh có một khúc cua, đi hết 1 km chui hầm sang cảnh mới · thắng chặng này để mở chặng sau</div><div class="luoiThe">' + DUONG.map((d, i) => {
    const mo = duongMo(i), t = LUU.duong[d.id] || {}, huy = t.hang === 1 ? '🥇' : t.hang === 2 ? '🥈' : t.hang === 3 ? '🥉' : '', qua = (t.qua || []).filter(Boolean).length;
    return '<div class="the' + (mo ? '' : ' khoa') + (t.hang === 1 ? ' xong' : '') + '"><span class="goc">' + (huy || (mo ? '' : '🔒')) + '</span><div class="dau"><span class="ic">' + d.icon + '</span><div><b>' + (i + 1) + '. ' + d.ten + '</b>' + (d.boss ? '<small> 👑 Boss ' + BOSS[d.boss].ten + '</small>' : '') + '</div></div>' +
      '<small>' + KM_DUONG + ' km · 10 khung cảnh · 10 khúc cua · ' + Math.max(2, Math.round(d.nhay * DAI_DUONG / 25000)) + ' dốc nhảy · đồi cao ' + d.doc + ' m' + (d.dem ? ' · đua đêm' : '') + '</small>' +
      '<small>' + (t.tot ? '⏱ Kỷ lục ' + dinhDangGio(t.tot) + ' · ' : '') + '🎁 Quà bí mật ' + qua + '/3' + (t.dua ? ' · đã đua ' + t.dua + ' lần' : '') + '</small>' +
      '<div class="chan"><small>' + (mo ? 'Thưởng hạng 1: ' + XU_HANG[0] + ' xu' : 'Thắng chặng ' + i + ' để mở') + '</small>' + (mo ? '<button class="nutNho dang" data-i="' + i + '">▶ Đua</button>' : '') + '</div></div>';
  }).join('') + '</div>';
  ganKho(veManDuong); nd.querySelectorAll('[data-i]').forEach(b => b.onclick = () => batDauDua({ duong: +b.dataset.i, cheDo: 'nghiep' }));
}
function gioiHan(t) { return DAI_DUONG / t.muc; }
function veManThuThach() {
  const nd = $('manND');
  nd.innerHTML = '<div class="moTa" style="margin-top:0">Mỗi lần thắng một chặng đua sẽ mở một thử thách mới. Hoàn thành thử thách được huy chương 🏅 và xu.</div><div class="luoiThe" style="margin-top:calc(var(--u)*.8)">' + THU_THACH.map((t, i) => {
    const s = LUU.thuThach[t.id] || {}, d = DUONG[t.duong], mo = !!s.mo;
    const mt = t.mt + (t.loai === 'gio' ? ' (dưới ' + dinhDangGio(gioiHan(t)) + ')' : '');
    return '<div class="the' + (mo ? '' : ' khoa') + (s.xong ? ' xong' : '') + '"><span class="goc">' + (s.xong ? '🏅' : mo ? '' : '🔒') + '</span><div class="dau"><span class="ic">' + d.icon + '</span><b>' + t.ten + '</b></div><small>' + mt + '</small><small>Đường: ' + d.ten + ' · Thưởng ' + t.thuong + ' xu</small>' +
      '<div class="chan"><small>' + (s.xong ? '✔ Đã hoàn thành (chơi lại được 20% thưởng)' : mo ? 'Đã mở' : 'Thắng chặng ' + (t.duong + 1) + ' để mở') + '</small>' + (mo ? '<button class="nutNho dang" data-i="' + i + '">▶ Bắt đầu</button>' : '') + '</div></div>';
  }).join('') + '</div>';
  nd.querySelectorAll('[data-i]').forEach(b => b.onclick = () => batDauDua({ thuThach: THU_THACH[+b.dataset.i], cheDo: 'thuthach' }));
}
let gChon = LUU.xeDang;
let xnMua = null;
function veManGarage() {
  const nd = $('manND'), x = xeCua(gChon), co = LUU.xe.includes(x.id), dang = LUU.xeDang === x.id, moDb = xeMoDuoc(x);
  if (!xemMesh || xemXe !== gChon) dungXemTruoc(gChon);
  const vach = (ten, v, lo, hi, hien) => '<span>' + ten + '</span><div class="thanh"><i style="width:' + Math.round(kep((v - lo) / (hi - lo), 0.06, 1) * 100) + '%"></i></div><em>' + hien + '</em>';
  const kmh = Math.round(V_GOC * x.vmax * 3.6), kmhN = Math.round(Math.min(V_TRAN, V_GOC * x.vmax * (1 + (NITRO_V - 1) * (0.75 + 0.25 * x.nit))) * 3.6);
  let nut = '', ghiChu = '';
  if (dang) nut = '<button class="nutLon xam" disabled>✔ Đang dùng</button>';
  else if (co) nut = '<button class="nutLon vang" id="gNut">Dùng xe này</button>';
  else if (x.mo) { if (moDb) nut = '<button class="nutLon luc" id="gNut">🎁 Nhận miễn phí</button>'; else { nut = '<button class="nutLon xam" disabled>🔒 Chưa mở</button>'; ghiChu = x.mo.huyVang ? 'Cần ' + x.mo.huyVang + ' huy chương vàng (🥇 chặng + 🏅 thử thách). Bạn có ' + demHuyChuong().tongVang + '.' : 'Về đích trước Boss ' + BOSS[x.mo.boss].ten + ' một lần.'; } }
  else nut = xnMua === x.id ? '<button class="nutLon luc" id="gNut">✔ Bấm lần nữa để mua (−' + dinhDangSo(x.gia) + ' xu)</button>' : '<button class="nutLon vang" id="gNut">🛒 Mua · 💰 ' + dinhDangSo(x.gia) + '</button>';
  const mauI = LUU.mau[x.id] != null ? LUU.mau[x.id] : x.mau;
  nd.innerHTML = '<div class="garage"><div class="ds">' + XE.map(z => { const c = LUU.xe.includes(z.id); return '<button class="oXe' + (c ? ' co' : '') + (LUU.xeDang === z.id ? ' dang' : '') + (gChon === z.id ? ' chon' : '') + '" data-x="' + z.id + '"><b><i style="background:' + hexCss(mauXeNguoi(z)) + '"></i>' + z.ten + '</b>' + (c ? (LUU.xeDang === z.id ? '✔ Đang dùng' : '✔ Đã có') : z.mo ? (xeMoDuoc(z) ? '🎁 Nhận được' : '🔒 Đặc biệt') : '💰 ' + dinhDangSo(z.gia)) + '</button>'; }).join('') + '</div>' +
    '<div class="ct"><h2 class="chu3d" style="margin:0;font-size:max(18px,calc(var(--u)*2.6))">' + x.ten + '</h2><div class="chiSo">' +
    vach('Tốc độ', x.vmax, 0.95, 1.25, kmh + ' km/h') + vach('Có Nitro', x.vmax * x.nit, 0.95, 1.9, kmhN + ' km/h') + vach('Tăng tốc', x.ga, 0.95, 1.35, '×' + x.ga.toFixed(2)) + vach('Ôm cua', x.bam, 0.95, 1.35, '×' + x.bam.toFixed(2)) + vach('Nitro bền', x.nit, 0.95, 1.5, '×' + x.nit.toFixed(2)) +
    '</div><div class="nhan">Màu xe ' + (co ? '(miễn phí)' : '(có xe mới đổi được)') + '</div><div id="gMau">' + (co ? MAU_XE.map((m, i) => '<button data-i="' + i + '" title="' + TEN_MAU[i] + '" class="' + (i === mauI ? 'dang' : '') + '" style="background:' + hexCss(m) + '"></button>').join('') : '<span class="moTa">—</span>') + '</div>' +
    (ghiChu ? '<div class="moTa">' + ghiChu + '</div>' : '') + '<div style="margin-top:calc(var(--u)*.6)">' + nut + '</div></div></div>';
  nd.querySelectorAll('.oXe').forEach(b => b.onclick = () => { gChon = b.dataset.x; tieng('chuyen'); veManGarage(); });
  nd.querySelectorAll('#gMau button').forEach(b => b.onclick = () => { LUU.mau[x.id] = +b.dataset.i; luuLai(); tieng('chuyen'); dungXemTruoc(gChon); veManGarage(); });
  const n = $('gNut'); if (n) n.onclick = () => {
    if (co) { LUU.xeDang = x.id; luuLai(); tieng('mua'); DV.bao('Đã chọn ' + x.ten, 1200); }
    else if (x.mo) { LUU.xe.push(x.id); LUU.xeDang = x.id; luuLai(); tieng('thang'); DV.bao('🎁 Nhận ' + x.ten + '!', 1800); }
    else if (LUU.xu < x.gia) { tieng('nay'); DV.bao('Chưa đủ xu! Thiếu ' + dinhDangSo(x.gia - LUU.xu) + ' xu', 1800); return; }
    else if (xnMua !== x.id) { xnMua = x.id; tieng('chuyen'); veManGarage(); setTimeout(() => { if (xnMua === x.id) { xnMua = null; if (manDang === 'garage' && $('man').classList.contains('hien')) veManGarage(); } }, 4000); return; }   // mua phải bấm 2 lần để khỏi lỡ tay
    else { xnMua = null; LUU.xu -= x.gia; LUU.xe.push(x.id); LUU.xeDang = x.id; luuLai(); tieng('thang'); DV.bao('Đã mua ' + x.ten + '!', 1800); }
    $('manXu').textContent = dinhDangSo(LUU.xu); veManGarage();
  };
}
function veManTayDua() {
  const nd = $('manND');
  nd.innerHTML = '<div class="moTa" style="margin-top:0">Chọn tay đua của bạn. Năm bạn còn lại sẽ là đối thủ máy, mỗi người một tính cách.</div><div class="luoiThe" style="grid-template-columns:1fr;margin-top:calc(var(--u)*.8)">' + NHAN_VAT.map(n => {
    const dang = LUU.nhanVat === n.id;
    return '<div class="the' + (dang ? ' dang' : '') + '"><div class="dau"><span class="avatar" style="background:' + hexCss(n.mau) + '">' + n.ten[0] + '</span><div><b>' + n.ten + ' — ' + n.hinh + '</b><small> · ' + n.mt + '</small></div></div><small>Khi bạn chọn: <b style="font-size:inherit;color:#ffe9a0">' + n.loi + '</b> · Xe riêng khi làm đối thủ: ' + XE[n.xe].ten + '</small><div class="chan"><small></small><button class="nutNho' + (dang ? '' : ' dang') + '" data-n="' + n.id + '">' + (dang ? '✔ Đang chọn' : 'Chọn') + '</button></div></div>';
  }).join('') + '</div>';
  nd.querySelectorAll('[data-n]').forEach(b => b.onclick = () => { LUU.nhanVat = b.dataset.n; luuLai(); tieng('mua'); dungXemTruoc(LUU.xeDang); veManTayDua(); });
}
function veManNhiemVu() {
  const h = demHuyChuong();
  $('manND').innerHTML = '<div class="tongHuy"><div>🥇 ' + h.vang + '<small>Vàng (hạng 1)</small></div><div>🥈 ' + h.bac + '<small>Bạc (hạng 2)</small></div><div>🥉 ' + h.dong + '<small>Đồng (hạng 3)</small></div><div>🏅 ' + h.thuThach + '<small>Thử thách</small></div><div>📜 ' + h.nhiemVu + '<small>Nhiệm vụ</small></div></div>' +
    '<div class="moTa" style="margin-bottom:calc(var(--u)*.6)">Nhiệm vụ không có hạn, không cần đăng nhập mỗi ngày. Làm xong là tự nhận thưởng khi kết thúc cuộc đua.</div>' +
    NHIEM_VU.map(n => { const xong = !!LUU.nhiemVu[n.id], [a, b] = n.dk(LUU.tk, LUU), pt = kep(a / b, 0, 1); return '<div class="nhiemVu' + (xong ? ' xong' : '') + '"><div><b>' + (xong ? '✔ ' : '') + n.ten + '</b><div class="moTa" style="margin:0">' + n.mt + '</div></div><span class="xu">💰 ' + dinhDangSo(n.thuong) + '</span><div class="thanh"><i style="width:' + Math.round(pt * 100) + '%"></i></div><small class="moTa" style="margin:0;grid-column:1/-1">' + (xong ? 'Đã hoàn thành' : (Math.round(a * 10) / 10).toLocaleString('vi-VN') + ' / ' + b.toLocaleString('vi-VN')) + '</small></div>'; }).join('');
}
function veManThanhTich() {
  const t = LUU.tk, h = demHuyChuong(), gio = Math.floor(t.giay / 3600), phut = Math.floor(t.giay % 3600 / 60), qua = DUONG.reduce((a, d) => a + ((LUU.duong[d.id] || {}).qua || []).filter(Boolean).length, 0);
  const dong = (a, b) => '<tr><td>' + a + '</td><td>' + b + '</td></tr>';
  $('manND').innerHTML = '<table class="bangTK"><tr><th>Thành tích cá nhân</th><th></th></tr>' +
    dong('🛣️ Tổng quãng đường', (Math.round(t.km * 10) / 10).toLocaleString('vi-VN') + ' km') + dong('⏱ Thời gian lái', gio + ' giờ ' + phut + ' phút') + dong('🏁 Số cuộc đua', t.dua) + dong('🥇 Về nhất', t.thang) + dong('🏆 Lên bục (top 3)', t.bucVinh) + dong('👑 Thắng Boss', t.boss) +
    dong('⚡ Tốc độ cao nhất', t.vMax + ' km/h') + dong('🚀 Cú bay xa nhất', t.nhayXa + ' m') + dong('🛫 Số lần bay', t.nhay) + dong('🌀 Tổng drift', (Math.round(t.drift / 100) / 10).toLocaleString('vi-VN') + ' km') + dong('🔗 Combo cao nhất', t.combo) +
    dong('💰 Tổng xu nhặt', dinhDangSo(t.xuTong)) + dong('🏎️ Lượt vượt đối thủ', t.vuot) + dong('🎁 Hộp quà bí mật', qua + ' / 30') + dong('🏅 Thử thách hoàn thành', h.thuThach + ' / 10') + dong('🧱 Lần chạm rào', t.tuong) + '</table>' +
    '<table class="bangTK" style="margin-top:calc(var(--u)*1)"><tr><th>Chặng</th><th>Hạng tốt nhất</th><th>Kỷ lục</th><th>Quà</th></tr>' + DUONG.map((d, i) => { const s = LUU.duong[d.id] || {}; return '<tr><td>' + d.icon + ' ' + d.ten + (duongMo(i) ? '' : ' 🔒') + '</td><td>' + (s.hang ? (s.hang <= 3 ? ['🥇', '🥈', '🥉'][s.hang - 1] + ' ' : '') + 'Hạng ' + s.hang : '—') + '</td><td>' + (s.tot ? dinhDangGio(s.tot) : '—') + '</td><td>' + (s.qua || []).filter(Boolean).length + '/3</td></tr>'; }).join('') + '</table>';
}
let xacNhanXoa = false;
function veManCaiDat() {
  const nd = $('manND'), bt = (id, chu, bat) => '<button class="nutNho' + (bat ? ' bat' : '') + '" id="' + id + '">' + chu + '</button>';
  nd.innerHTML = '<div class="dongCaiDat"><span>🎨 Đồ họa<br><small class="moTa">' + DH().mt + '</small></span><div class="hangNut">' + Object.keys(DO_HOA).map(k => '<button class="nutNho' + (LUU.doHoa === k ? ' bat' : '') + '" data-dh="' + k + '">' + DO_HOA[k].ten + '</button>').join('') + '</div></div>' +
    '<div class="dongCaiDat"><span>🔊 Âm thanh</span>' + bt('cdAm', tatAm ? 'Tắt' : 'Bật', !tatAm) + '</div>' +
    '<div class="dongCaiDat"><span>🦶 Ga tự động<br><small class="moTa">Xe tự chạy tới, chỉ cần lái (hợp với điện thoại)</small></span>' + bt('cdGa', DV.gaTuDong() ? 'Bật' : 'Tắt', DV.gaTuDong()) + '</div>' +
    '<div class="dongCaiDat"><span>🎥 Camera</span>' + bt('cdCam', LUU.camXa ? 'Xa' : 'Gần', LUU.camXa) + '</div>' +
    '<div class="dongCaiDat"><span>🤖 Mức khó của máy</span><div class="hangNut">' + Object.keys(DO_KHO).map(k => '<button class="nutNho' + (LUU.kho === k ? ' bat' : '') + '" data-kho="' + k + '">' + DO_KHO[k].ten + '</button>').join('') + '</div></div>' +
    '<div class="dongCaiDat chiPhim"><span>⌨️ Phím</span><small class="moTa">← → lái · ↑ ga · ↓ phanh/lùi · Cách: drift · Shift/N: Nitro · E: dùng kỹ năng · R: đặt lại · C: camera · M: âm thanh · Esc: tạm dừng</small></div>' +
    '<div class="dongCaiDat"><span>🗑️ Xóa toàn bộ tiến trình</span>' + bt('cdXoa', xacNhanXoa ? 'Bấm lần nữa để xóa thật' : 'Xóa dữ liệu', false) + '</div>' +
    '<div class="moTa">Game không có quảng cáo, không bán vật phẩm bằng tiền thật, không bắt đăng nhập mỗi ngày. Dữ liệu chỉ lưu trên máy này.</div>';
  nd.querySelectorAll('[data-dh]').forEach(b => b.onclick = () => { LUU.doHoa = b.dataset.dh; luuLai(); apDoHoa(); lamMoiKhuc(); capNhatKhuc(quanhS(-40), 99); tieng('chuyen'); veManCaiDat(); });
  nd.querySelectorAll('[data-kho]').forEach(b => b.onclick = () => { LUU.kho = b.dataset.kho; luuLai(); tieng('chuyen'); veManCaiDat(); });
  $('cdAm').onclick = () => { doiAm(); tieng('chuyen'); veManCaiDat(); };
  $('cdGa').onclick = () => { LUU.gaTuDong = !DV.gaTuDong(); luuLai(); tieng('chuyen'); veManCaiDat(); };
  $('cdCam').onclick = () => { doiCam(); tieng('chuyen'); veManCaiDat(); };
  $('cdXoa').onclick = () => {
    if (!xacNhanXoa) { xacNhanXoa = true; tieng('nay'); veManCaiDat(); setTimeout(() => { xacNhanXoa = false; if (manDang === 'caidat' && $('man').classList.contains('hien')) veManCaiDat(); }, 4000); return; }
    const giu = { doHoa: LUU.doHoa, tat: LUU.tat }; const moi = JSON.parse(JSON.stringify(LUU_MAC_DINH)); for (const k in LUU) delete LUU[k]; Object.assign(LUU, moi, giu); luuLai(); xacNhanXoa = false; tieng('chuyen'); DV.bao('Đã xóa tiến trình', 1500); vaoSanh();
  };
}
function doiAm() { tatAm = !tatAm; LUU.tat = tatAm; luuLai(); $('tdAm').textContent = '🔊 Âm thanh: ' + (tatAm ? 'Tắt' : 'Bật'); }
function doiCam() { LUU.camXa = !LUU.camXa; luuLai(); $('tdCam').textContent = '🎥 Camera: ' + (LUU.camXa ? 'Xa' : 'Gần'); if (dangDua() && DV.bao) DV.bao('Camera ' + (LUU.camXa ? 'xa' : 'gần'), 900); }
function apDoHoa() {
  const D = DH(); renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, D.pr));
  renderer.shadowMap.enabled = D.bong > 0; anhMat.castShadow = D.bong > 0;
  if (D.bong > 0) { const n = Math.min(D.bong, renderer.capabilities.maxTextureSize), c = anhMat.shadow.camera, v = D.vungBong; anhMat.shadow.mapSize.set(n, n); c.left = -v; c.right = v; c.top = v; c.bottom = -v; c.updateProjectionMatrix(); if (anhMat.shadow.map) { anhMat.shadow.map.dispose(); anhMat.shadow.map = null; } }
  scene.traverse(o => { if (o.material) { const ms = Array.isArray(o.material) ? o.material : [o.material]; ms.forEach(m => m.needsUpdate = true); } });
  datTamNhin(); doiCo();
}

// ---------- BẮT ĐẦU / TẠM DỪNG / KẾT QUẢ ----------
let cauHinhCuoi = null;
function batDauDua(o) {
  huyBucVinh(); moAm(); tieng('mua'); cauHinhCuoi = o; hienLop(['hud']); huyXemTruoc(); batDauCuoc(o); dungBanDo(); veBangXH(); camGoc = 0;
  const t = CUOC.thuThach; $('hMucTieu').style.display = t ? 'block' : 'none';
  if (!LUU.daXemHD && !CUOC.thu) { CUOC.tamTruoc = 'dem'; CUOC.tt = 'tamdung'; hienLop(['hud', 'huongDan']); }   // cuộc đua đầu tiên: chỉ cách chơi trước khi đếm ngược
}
$('hdXong').onclick = () => { LUU.daXemHD = true; luuLai(); tieng('chuyen'); CUOC.tt = 'dem'; hienLop(['hud']); };
function tamDung() { if (CUOC.tt !== 'dua' && CUOC.tt !== 'dem') return; CUOC.tamTruoc = CUOC.tt; CUOC.tt = 'tamdung'; DV.nhaHet(); hienLop(['hud', 'tamDung']); }
function tiepTuc() { if (CUOC.tt !== 'tamdung') return; CUOC.tt = CUOC.tamTruoc; hienLop(['hud']); }
$('nutDung').onclick = () => tamDung(); $('tdTiep').onclick = () => tiepTuc(); $('tdLai').onclick = () => batDauDua(cauHinhCuoi); $('tdSanh').onclick = () => thoatCuoc();
$('tdAm').onclick = () => { doiAm(); }; $('tdCam').onclick = () => { doiCam(); };
DV.hienKetQua = () => {
  const q = CUOC.ketQua, t = CUOC.thuThach; hienLop(['ketQua']); dungBucVinh();
  $('kqTieuDe').textContent = t ? (q.thuThachOK ? '🏅 Thử thách hoàn thành!' : 'Chưa đạt thử thách') : q.hang === 1 ? '🏆 Vô địch!' : q.hang <= 3 ? '🎉 Lên bục hạng ' + q.hang + '!' : 'Về đích hạng ' + q.hang;
  $('kqHuy').textContent = (q.huy ? HUY_IC[q.huy] + ' ' : '') + (t ? '' : sao(q.hang === 1 ? 3 : q.hang <= 3 ? 2 : q.hang <= 5 ? 1 : 0));
  $('kqBang').innerHTML = CUOC.xepHang.map((k, i) => '<tr class="' + (k.nguoi ? 'toi' : '') + '"><td>' + (i + 1) + '</td><td><i style="background:' + hexCss(k.mau) + '"></i>' + (k.nguoi ? 'BẠN (' + nhanVatCua(LUU.nhanVat).ten + ')' : (k.boss ? '👑 ' : '') + k.ten) + '</td><td>' + (k.xong ? dinhDangGio(k.tgXong) : 'Còn ' + (Math.max(0, DD.L - k.tot) / 1000).toFixed(1) + ' km') + '</td><td>💰 ' + k.xu + '</td></tr>').join('');
  const k = XE_DUA[0];
  $('kqThuong').innerHTML = 'Xu nhặt: <b>' + q.xuNhat + '</b> (combo cao nhất ' + k.comboMax + ') · Thưởng: <b>' + dinhDangSo(q.thuong) + '</b> · Đang có <b>' + dinhDangSo(LUU.xu) + '</b> xu<br><small class="moTa">⚡ ' + Math.round(k.vMax) + ' km/h · 🛫 ' + k.nhay + ' lần bay · 🌀 drift ' + (k.driftQuang / 1000).toFixed(1) + ' km' + (q.kyLuc ? ' · 🏅 Kỷ lục mới!' : '') + '</small>';
  $('kqMoi').innerHTML = q.moi.map(m => '<div>' + m + '</div>').join('') + q.nhiemVu.map(n => '<div>📜 Hoàn thành nhiệm vụ: ' + n + '</div>').join('');
  const sau = DUONG[CUOC.duong + 1], coTiep = !t && sau && duongMo(CUOC.duong + 1);
  $('kqTiep').style.display = coTiep ? '' : 'none'; if (coTiep) $('kqTiep').textContent = '▶ ' + sau.ten;
  kiemTraNghiMat();
};
$('kqLai').onclick = () => batDauDua(cauHinhCuoi); $('kqSanh').onclick = () => thoatCuoc(); $('kqTiep').onclick = () => batDauDua({ duong: CUOC.duong + 1, cheDo: 'nghiep' });

// ---------- NGHỈ MẮT ----------
let nghiHen = 0;
function kiemTraNghiMat() {
  if (CUOC.gioChoi < NGHI_MAT_GIAY) return; CUOC.gioChoi = 0;
  let con = 20; $('nmDem').textContent = con; $('nmXong').disabled = true; $('nghiMat').classList.add('hien');
  clearInterval(nghiHen); nghiHen = setInterval(() => { con--; $('nmDem').textContent = Math.max(0, con); if (con <= 0) { clearInterval(nghiHen); $('nmXong').disabled = false; } }, 1000);
}
$('nmXong').onclick = () => $('nghiMat').classList.remove('hien');

// ---------- HUD ----------
let banDoNen = null, bdTL = 1, bdX = 0, bdZ = 0;
function dungBanDo() {
  const W = 220, [x0, x1, z0, z1] = DD.khung, tl = 196 / Math.max(x1 - x0, z1 - z0); bdTL = tl; bdX = (x0 + x1) / 2; bdZ = (z0 + z1) / 2;
  banDoNen = document.createElement('canvas'); banDoNen.width = banDoNen.height = W; const g = banDoNen.getContext('2d');
  g.lineJoin = 'round'; g.beginPath(); for (let i = 0; i < DD.N; i += 20) { const u = W / 2 + (DD.P[2 * i] - bdX) * tl, v = W / 2 - (DD.P[2 * i + 1] - bdZ) * tl; i ? g.lineTo(u, v) : g.moveTo(u, v); } g.closePath();
  g.strokeStyle = 'rgba(255,255,255,.95)'; g.lineWidth = 8; g.stroke(); g.strokeStyle = '#4d525e'; g.lineWidth = 4; g.stroke();
  const d = diemTai(0); g.fillStyle = '#ffd23a'; g.fillRect(W / 2 + (d.x - bdX) * tl - 4, W / 2 - (d.z - bdZ) * tl - 4, 8, 8);
}
function veBanDo() {                  // bản đồ tròn quay theo xe: phía trước luôn ở trên, thấy 1,4 km quanh mình
  const g = $('banDo').getContext('2d'), R = 120, k = XE_DUA[0], sc = R / 1400, fx = Math.sin(k.yaw), fz = Math.cos(k.yaw), rx = -fz, rz = fx;
  const chieu = (x, z) => { const dx = x - k.x, dz = z - k.z; return [R + (dx * rx + dz * rz) * sc, R - (dx * fx + dz * fz) * sc]; };
  g.clearRect(0, 0, 240, 240); g.save(); g.beginPath(); g.arc(R, R, R - 2, 0, 7); g.clip();
  g.fillStyle = 'rgba(30,40,80,.35)'; g.fillRect(0, 0, 240, 240);
  g.lineJoin = 'round'; g.lineCap = 'round'; g.beginPath(); let dau = true;
  for (let d = -760; d <= 760; d += 6) { const i = ((k.i + d) % DD.N + DD.N) % DD.N, [u, v] = chieu(DD.P[2 * i], DD.P[2 * i + 1]); dau ? g.moveTo(u, v) : g.lineTo(u, v); dau = false; }
  g.strokeStyle = 'rgba(255,255,255,.95)'; g.lineWidth = 13; g.stroke(); g.strokeStyle = '#5a6278'; g.lineWidth = 8; g.stroke();
  for (let i = XE_DUA.length - 1; i >= 1; i--) { const j = XE_DUA[i], [u, v] = chieu(j.x, j.z); if (Math.hypot(u - R, v - R) > R) continue; g.beginPath(); g.arc(u, v, 6, 0, 7); g.fillStyle = hexCss(j.mau); g.fill(); g.lineWidth = 2; g.strokeStyle = j.boss ? '#ff5a7a' : '#fff'; g.stroke(); }
  g.translate(R, R); g.beginPath(); g.moveTo(0, -11); g.lineTo(8, 8); g.lineTo(0, 4); g.lineTo(-8, 8); g.closePath(); g.fillStyle = '#ffd23a'; g.fill(); g.strokeStyle = '#2a1a00'; g.lineWidth = 2; g.stroke();
  g.restore();
}
function denXuatPhat() {             // 5 đèn đỏ sáng dần trong lúc đếm ngược, rồi cùng chuyển xanh khi xuất phát
  const p = $('denXP'), dang = CUOC.tt === 'dem' || (CUOC.tt === 'tamdung' && CUOC.tamTruoc === 'dem'), xanh = CUOC.tt === 'dua' && CUOC.giay < 1.6;
  const so = dang ? kep(Math.floor((GIAY_DEM - CUOC.demT) / (GIAY_DEM / 5.3)) + 1, 0, 5) : 0, khoa = (dang ? 'd' + so : xanh ? 'x' : 'o');
  if (chuCu.den === khoa) return; chuCu.den = khoa; p.classList.toggle('hien', dang || xanh);
  [...p.querySelectorAll('i')].forEach((e, i) => e.className = xanh ? 'xanh' : i < so ? 'do' : '');
  DEN_XP.forEach((m, i) => m.color.setRGB(xanh ? 0.3 : i < so ? 3.2 : 0.15, xanh ? 3 : i < so ? 0.25 : 0.15, xanh ? 0.6 : i < so ? 0.2 : 0.18));
}
let xhT = 0;
function veBangXH() {
  xhT = 0; const dau = CUOC.xepHang[0];
  $('bangXH').innerHTML = CUOC.xepHang.map((k, i) => { const kc = k.xong ? '🏁' : i === 0 ? '' : '-' + (Math.max(0, dau.tot - k.tot) >= 1000 ? (Math.max(0, dau.tot - k.tot) / 1000).toFixed(1) + 'km' : Math.round(Math.max(0, dau.tot - k.tot)) + 'm');
    return '<div class="hXH' + (k.nguoi ? ' toi' : '') + (k.boss ? ' boss' : '') + '"><b>' + (i + 1) + '</b><i style="background:' + hexCss(k.mau) + '"></i><span>' + (k.nguoi ? 'BẠN' : (k.boss ? '👑 ' : '') + k.ten) + '</span><em>' + kc + '</em></div>'; }).join('');
  $('tdCham').innerHTML = XE_DUA.map(k => '<i class="' + (k.nguoi ? 'toi' : '') + '" style="left:' + (kep(k.tot / DD.L, 0, 1) * 100).toFixed(2) + '%;background:' + hexCss(k.mau) + '"></i>').join('');
}
let chuCu = {};
function datChu(id, chu) { if (chuCu[id] !== chu) { chuCu[id] = chu; $(id).innerHTML = chu; } }
function capNhatHUD(dt) {
  if (!XE_DUA.length) return; const k = XE_DUA[0], t = CUOC.thuThach;
  datChu('hHang', k.hang + '<small>/' + XE_DUA.length + '</small>'); datChu('hGio', '⏱ ' + dinhDangGio(k.xong ? k.tgXong : CUOC.giay)); datChu('hXu', '💰 ' + k.xu);
  if (t) datChu('hMucTieu', '🎯 ' + (t.loai === 'xu' ? 'Xu: ' + k.xu + '/' + t.muc : t.loai === 'nhay' ? 'Lần bay: ' + k.nhay + '/' + t.muc : t.loai === 'gio' ? 'Giới hạn: ' + dinhDangGio(gioiHan(t)) : t.loai === 'drift' ? 'Drift: ' + (k.driftQuang / 1000).toFixed(2) + '/' + (t.muc / 1000) + ' km' : t.loai === 'combo' ? 'Combo cao nhất: ' + k.comboMax + '/' + t.muc : t.loai === 'sach' ? 'Chạm rào: ' + k.chamTuong + ' (phải là 0) · top 3' : 'Về trước ' + XE_DUA[1].ten));
  const da = kep(k.tot / DD.L, 0, 1); $('tdDa').style.width = (da * 100).toFixed(2) + '%'; datChu('kmSo', (Math.max(0, Math.min(DD.L, k.tot)) / 1000).toFixed(1).replace('.', ','));
  const kmh = Math.round(Math.abs(k.vf) * 3.6); datChu('hTocDo', kmh + '<small>km/h</small>'); $('hTocDo').classList.toggle('nhanh', kmh >= 400);
  const pn = (k.nitro / NITRO_MAX * 100).toFixed(0), mauN = k.nitDang ? '#ffb02a' : '#3af0ff'; if (chuCu.pn !== pn + mauN) { chuCu.pn = pn + mauN; $('nitroVong').style.background = 'conic-gradient(' + mauN + ' ' + pn + '%,rgba(255,255,255,.12) ' + pn + '%)'; $('tNitro').style.background = 'conic-gradient(rgba(58,168,255,.85) ' + pn + '%,rgba(13,27,69,.55) ' + pn + '%)'; }
  $('nitroTron').classList.toggle('dang', k.nitDang); denXuatPhat();
  const ic = k.khienT > 0 ? '🛡️' : k.kyNang ? KY_NANG[k.kyNang].icon : '?'; datChu('knIcon', ic); datChu('tKyNang', k.kyNang ? KY_NANG[k.kyNang].icon : '❔'); $('oKyNang').classList.toggle('co', !!k.kyNang);
  const dk = $('driftKhung').children; for (let i = 0; i < 3; i++) dk[i].className = k.drift && k.driftMoc > i ? 'c' + (i + 1) : '';
  const hg = Math.cos(gocChenh(Math.atan2(k.tx, k.tz), k.yaw)); CUOC.nguocT = CUOC.tt === 'dua' && hg < -0.3 && k.vf > 3 ? (CUOC.nguocT || 0) + dt : 0; $('nguoc').style.display = CUOC.nguocT > 1.5 ? 'block' : 'none';
  $('dem').style.display = 'none';
  xhT += dt; if (xhT > 0.25 || chuCu.hangXH !== k.hang) { chuCu.hangXH = k.hang; veBangXH(); }
  veBanDo();
}

// ---------- BỤC VINH QUANG: 3 xe dẫn đầu đứng trên bục, pháo giấy rơi ----------
const BUC = { sc: null, cam: new THREE.PerspectiveCamera(40, 1, 0.5, 400), giay: 0, phao: null, ds: [], nguoi: [], den: [] };
function huyBucVinh() { if (!BUC.sc) return; BUC.sc.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.material) { const ms = Array.isArray(o.material) ? o.material : [o.material]; ms.forEach(m => { if (m.map && m.map !== texLop) m.map.dispose(); m.dispose(); }); } }); BUC.sc = null; BUC.nguoi = []; BUC.den = []; }
function dungBucVinh() {
  huyBucVinh(); const sc = new THREE.Scene(), rnd = mulberry(7);
  sc.background = canvasTex(16, 256, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#12062e'); gr.addColorStop(0.5, '#4a148c'); gr.addColorStop(1, '#a02ac8'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  if (moiTruong) sc.environment = moiTruong.texture;
  sc.add(new THREE.HemisphereLight(0xffffff, 0x7a3ac8, 1.0)); const dl = new THREE.DirectionalLight(0xffffff, 1.1); dl.position.set(4, 14, 14); sc.add(dl);
  // sàn sân khấu: ô vuông tím bóng, đường ghép phát sáng hồng
  const tSan = canvasTex(128, 128, (g, w, h) => { g.fillStyle = '#3a1478'; g.fillRect(0, 0, w, h); g.fillStyle = '#5a24a8'; g.fillRect(4, 4, 56, 56); g.fillRect(68, 68, 56, 56); g.fillStyle = '#ff5ad8'; g.fillRect(0, 0, w, 3); g.fillRect(0, 0, 3, h); g.fillRect(0, 63, w, 2); g.fillRect(63, 0, 2, h); }, true); tSan.repeat.set(14, 10);
  const san = new THREE.Mesh(new THREE.PlaneGeometry(90, 64), new THREE.MeshStandardMaterial({ map: tSan, emissiveMap: tSan, emissive: new THREE.Color(0.55, 0.45, 0.6), roughness: 0.25, metalness: 0.2 })); san.rotation.x = -Math.PI / 2; sc.add(san);
  // màn hình LED lớn phía sau: cúp vàng, chữ, sao
  const tMan = canvasTex(1024, 440, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#1a0a4a'); gr.addColorStop(1, '#5a1aa8'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 90; i++) { const x = Math.random() * w, y = Math.random() * h, r = 3 + Math.random() * 12; g.fillStyle = ['#ffd23a', '#3af0ff', '#ff5ad8', '#ffffff'][i % 4]; g.globalAlpha = 0.5 + Math.random() * 0.5; g.beginPath(); for (let k = 0; k < 10; k++) { const a = k * Math.PI / 5 - Math.PI / 2, rr = k % 2 ? r * 0.45 : r; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.fill(); }
    g.globalAlpha = 1; const cx = w / 2; g.fillStyle = '#ffd23a'; g.beginPath(); g.moveTo(cx - 90, 70); g.lineTo(cx + 90, 70); g.quadraticCurveTo(cx + 85, 210, cx, 230); g.quadraticCurveTo(cx - 85, 210, cx - 90, 70); g.fill();
    g.lineWidth = 16; g.strokeStyle = '#ffd23a'; g.beginPath(); g.arc(cx - 95, 125, 42, Math.PI * 0.5, Math.PI * 1.5); g.stroke(); g.beginPath(); g.arc(cx + 95, 125, 42, -Math.PI * 0.5, Math.PI * 0.5); g.stroke();
    g.fillRect(cx - 18, 225, 36, 60); g.fillRect(cx - 70, 280, 140, 30); g.fillStyle = '#c8901a'; g.font = 'italic 900 90px "Segoe UI",Arial'; g.textAlign = 'center'; g.fillText('1', cx, 190);
    g.font = 'italic 900 72px "Segoe UI",Arial'; g.lineWidth = 10; g.strokeStyle = '#2a0a4a'; const chu = XE_DUA[0] && XE_DUA[0].hang === 1 ? 'CHIẾN THẮNG!' : 'TOP 3'; g.strokeText(chu, cx, 395); g.fillStyle = '#fff'; g.fillText(chu, cx, 395);
    g.strokeStyle = '#3af0ff'; g.lineWidth = 12; g.strokeRect(6, 6, w - 12, h - 12);
  });
  const man = new THREE.Mesh(new THREE.PlaneGeometry(36, 15.5), new THREE.MeshBasicMaterial({ map: tMan, color: new THREE.Color(1.35, 1.35, 1.35) })); man.position.set(0, 12, -14); sc.add(man);
  const khung = new THREE.MeshStandardMaterial({ color: 0x2a2a3a, metalness: 0.8, roughness: 0.3 });
  for (const sx of [-1, 1]) { const tru = new THREE.Mesh(new THREE.BoxGeometry(1.2, 22, 1.2), khung); tru.position.set(sx * 20, 11, -13); sc.add(tru); }
  const xa = new THREE.Mesh(new THREE.BoxGeometry(41, 1.2, 1.2), khung); xa.position.set(0, 21.5, -13); sc.add(xa);
  BUC.den = []; [[3, 0.4, 2.6], [0.3, 2.6, 3.2], [3.2, 2.4, 0.4], [3, 0.4, 2.6], [0.3, 2.6, 3.2]].forEach((c, i) => { const g = new THREE.Group(); g.position.set(-16 + i * 8, 21, -12); const non = new THREE.Mesh(new THREE.ConeGeometry(5, 26, 24, 1, true), new THREE.MeshBasicMaterial({ color: new THREE.Color(c[0], c[1], c[2]).multiplyScalar(0.25), transparent: true, opacity: 0.22, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })); non.position.y = -13; g.add(non); g.add(new THREE.Mesh(new THREE.SphereGeometry(0.8, 12, 8), new THREE.MeshBasicMaterial({ color: new THREE.Color(c[0], c[1], c[2]) }))); sc.add(g); BUC.den.push(g); });
  // bục 1-2-3 hình bát giác: số 1 ở giữa cao nhất, viền vàng/bạc/đồng, huy chương phía trước
  const BUC3 = [{ h: 3.4, x: 0, n: 1, m: 0xffd23a }, { h: 2.4, x: -5.6, n: 2, m: 0xcfd8e8 }, { h: 1.6, x: 5.6, n: 3, m: 0xe0955a }];
  BUC.nguoi = [];
  BUC3.forEach((b, i) => {
    const kh = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 2.8, b.h, 8), new THREE.MeshStandardMaterial({ color: 0x6a2ad8, roughness: 0.3, metalness: 0.3 })); kh.position.set(b.x, b.h / 2, 0); kh.rotation.y = Math.PI / 8; sc.add(kh);
    const vien = new THREE.Mesh(new THREE.CylinderGeometry(2.66, 2.66, 0.35, 8), new THREE.MeshStandardMaterial({ color: b.m, roughness: 0.3, metalness: 0.5, emissive: new THREE.Color(b.m).multiplyScalar(0.35) })); vien.position.set(b.x, b.h, 0); vien.rotation.y = Math.PI / 8; sc.add(vien);
    const hc = new THREE.Sprite(new THREE.SpriteMaterial({ map: canvasTex(128, 160, (g) => { g.fillStyle = '#e8383d'; g.beginPath(); g.moveTo(34, 0); g.lineTo(64, 60); g.lineTo(94, 0); g.lineTo(78, 0); g.lineTo(64, 34); g.lineTo(50, 0); g.fill(); const mc = '#' + new THREE.Color(b.m).getHexString(); g.fillStyle = mc; g.beginPath(); g.arc(64, 100, 52, 0, 7); g.fill(); g.lineWidth = 8; g.strokeStyle = '#fff'; g.stroke(); g.font = 'italic 900 74px "Segoe UI",Arial'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#3a1a00'; g.fillText(b.n, 64, 104); }) })); hc.scale.set(1.7, 2.1, 1); hc.position.set(b.x, Math.max(1.3, b.h - 1.0), 2.95); sc.add(hc);
    const k = CUOC.xepHang[i]; if (!k) return;
    const nv = taoNguoiDung(k.nv ? k.nv.id : null, k.nv ? k.nv.mau : k.mau); nv.scale.setScalar(k.boss ? 1.35 : 1.15); nv.position.set(b.x, b.h + 0.18, 0.2); nv.rotation.y = -b.x * 0.05; sc.add(nv); BUC.nguoi.push({ g: nv, y: b.h + 0.18, hang: i });
    const xe = taoKart(k.xe, k.mau, k.phu, null, { khongNguoi: true });   // xe đỗ phía trước bục, người lái đã lên bục
    xe.position.set(b.x * 1.9, 0, 9.5); xe.rotation.y = -b.x * 0.07 + Math.PI * 0.02; sc.add(xe);
    const ten = new THREE.Sprite(new THREE.SpriteMaterial({ map: canvasTex(256, 64, (g, w, h) => { g.fillStyle = 'rgba(10,10,30,.82)'; g.beginPath(); g.roundRect ? g.roundRect(4, 8, w - 8, h - 16, 18) : g.rect(4, 8, w - 8, h - 16); g.fill(); g.fillStyle = '#fff'; g.font = '900 32px "Segoe UI",Arial'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(k.nguoi ? 'BẠN' : k.ten, w / 2, h / 2 + 1); }), depthTest: false })); ten.scale.set(3.8, 0.95, 1); ten.position.set(b.x, b.h + (k.boss ? 6.6 : 5.4), 0); sc.add(ten);
  });
  const n = 600, phao = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.22, 0.38), new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }), n), mc = new THREE.Color(); phao.frustumCulled = false; BUC.ds = [];
  for (let i = 0; i < n; i++) { mc.set([0xff3a6a, 0xffd23a, 0x3af0ff, 0x7aff5a, 0xff8a2a, 0xc05aff, 0xffffff][i % 7]).multiplyScalar(1.4); phao.setColorAt(i, mc); BUC.ds.push({ x: noi(-18, 18, rnd()), y: noi(2, 26, rnd()), z: noi(-8, 12, rnd()), v: noi(1.5, 3.5, rnd()), q: rnd() * 6, w: noi(2, 7, rnd()) }); }
  sc.add(phao); BUC.phao = phao; BUC.sc = sc; BUC.giay = 0; doiCo();
}
function capNhatBucVinh(dt) {
  BUC.giay += dt; const t = BUC.giay;
  for (let i = 0; i < BUC.ds.length; i++) { const p = BUC.ds[i]; p.y -= p.v * dt; p.q += p.w * dt; if (p.y < 0) p.y += 26; _o.position.set(p.x + Math.sin(p.q) * 0.5, p.y, p.z); _o.rotation.set(p.q, p.q * 0.7, 0); _o.scale.set(1, 1, 1); _o.updateMatrix(); BUC.phao.setMatrixAt(i, _o.matrix); }
  BUC.phao.instanceMatrix.needsUpdate = true;
  for (const n of BUC.nguoi) {            // hạng 1 nhảy cẫng lên, cả ba vẫy tay ăn mừng
    n.g.position.y = n.y + (n.hang === 0 ? Math.max(0, Math.sin(t * 5)) * 0.45 : Math.max(0, Math.sin(t * 3 + n.hang)) * 0.12);
    n.g.userData.tay.forEach((v, j) => { v.rotation.z = (j ? -1 : 1) * (0.5 + Math.sin(t * 6 + j * 1.5 + n.hang) * 0.25); });
  }
  BUC.den.forEach((d, i) => { d.rotation.z = Math.sin(t * 0.8 + i * 1.3) * 0.45; d.rotation.x = Math.cos(t * 0.6 + i) * 0.25; });
  const a = Math.sin(t * 0.3) * 0.1, lech = innerWidth > innerHeight * 1.2 ? 7.8 : 0; BUC.cam.position.set(lech + Math.sin(a) * 5, 6.2, 25); BUC.cam.lookAt(lech, 3.6, 1);
}

// ---------- CAMERA ----------
let camYaw = 0, camFov = 64, camGoc = 0;
const _nhin = new THREE.Vector3(), _gc = { s: 0, i: 0, d: 0, cx: 0, cz: 0, tx: 0, tz: 1, nx: 1, nz: 0, k: 0, h: 0 };
function datCamera(dt, t) {
  let fovMuon = 64;
  if (XE_DUA.length && CUOC.tt !== 'menu') {
    const k = XE_DUA[0], v01 = kep(Math.abs(k.vf) / V_TRAN, 0, 1);
    let yaw, xa, cao;
    if (CUOC.tt === 'slowmo' || CUOC.tt === 'ketqua') { camGoc += dt * (CUOC.tt === 'slowmo' ? 0.7 : 0.25); yaw = k.yaw + 2.2 + camGoc; xa = 10; cao = 2.6; }
    else if (CUOC.tt === 'dem' || (CUOC.tt === 'tamdung' && CUOC.tamTruoc === 'dem')) { const u = kep(CUOC.demT / GIAY_DEM, 0, 1); yaw = k.yaw + Math.PI * u * u; xa = 9 + 5 * u; cao = 3.8 + 2 * u; camYaw = k.yaw; }
    else {
      let muc = k.yaw; if (Math.abs(k.vf) > 4) { const hv = Math.atan2(k.vx, k.vz); muc = k.vf > 0 ? k.yaw + gocChenh(hv, k.yaw) * 0.6 : k.yaw; }
      camYaw += gocChenh(muc, camYaw) * Math.min(1, dt * 6); yaw = camYaw; xa = (LUU.camXa ? 11.5 : 8.5) + v01 * 3.5; cao = (LUU.camXa ? 4.8 : 3.7) + v01 * 0.8;
    }
    const cx = k.x - Math.sin(yaw) * xa, cz = k.z - Math.cos(yaw) * xa, dat = gan(cx, cz, k.i, _gc).h;
    camera.position.set(cx, Math.max(k.y + cao, dat + 1.6), cz); _nhin.set(k.x + Math.sin(k.yaw) * 8, k.y + 1.4, k.z + Math.cos(k.yaw) * 8);
    if (CUOC.tt === 'slowmo' || CUOC.tt === 'ketqua') _nhin.set(k.x, k.y + 1.2, k.z);
    fovMuon = 64 + v01 * 12 + (k.nitDang || k.xungT > 0 ? 8 : 0);
    if (DV.rung > 0) { camera.position.x += ngauNhien(-1, 1) * DV.rung * 0.6; camera.position.y += ngauNhien(-1, 1) * DV.rung * 0.4; DV.rung = Math.max(0, DV.rung - dt * 1.8); }
    camera.lookAt(_nhin); theoNang(k.x, k.y, k.z);
  } else if (xemMesh) {
    const p = xemMesh.position, ben = $('man').classList.contains('hep');
    if (ben) { const a = xemMesh.rotation.y + 0.9; camera.position.set(p.x + Math.sin(a) * 7.5, p.y + 2.6, p.z + Math.cos(a) * 7.5); const r = new THREE.Vector3().subVectors(p, camera.position).cross(new THREE.Vector3(0, 1, 0)).normalize(); _nhin.copy(p).addScaledVector(r, 2.8); _nhin.y += 0.9; xemMesh.rotation.y += dt * 0.35; }
    else { const a = t * 0.25; camera.position.set(p.x + Math.sin(a) * 9.5, p.y + 3.4, p.z + Math.cos(a) * 9.5); _nhin.set(p.x, p.y + 1, p.z); }
    camera.lookAt(_nhin); theoNang(p.x, p.y, p.z);
  }
  camFov += (fovMuon - camFov) * Math.min(1, dt * 4); if (Math.abs(camera.fov - camFov) > 0.01) { camera.fov = camFov; camera.updateProjectionMatrix(); }
  canhXa.position.set(camera.position.x, camera.position.y - 80, camera.position.z);
}

// ---------- KÍCH THƯỚC ----------
function doiCo() { const w = innerWidth, h = innerHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); BUC.cam.aspect = w / h; BUC.cam.updateProjectionMatrix(); dungHK(); }
addEventListener('resize', doiCo);

// ---------- VÒNG LẶP ----------
let tCu = performance.now(), tg = 0, daNhacCham = false; const demCham = { t: 0, n: 0 };
function vongLap(now) {
  requestAnimationFrame(vongLap);
  const dt = Math.min(0.05, Math.max(0, (now - tCu) / 1000)); tCu = now; tg += dt;
  renderer.info.reset();
  if (CUOC.tt === 'dua' && LUU.doHoa !== 'nhe' && !CUOC.thu && !daNhacCham && document.visibilityState === 'visible') {   // máy chạy không nổi: điện thoại tự hạ đồ họa một bậc, máy tính thì gợi ý
    demCham.t += (now - (demCham.cu || now)) / 1000; demCham.cu = now; demCham.n++;
    if (demCham.t > 6) {
      const fps = demCham.n / demCham.t;
      if (fps < 30) {
        if (CAM_UNG) { LUU.doHoa = LUU.doHoa === 'toida' ? 'dep' : 'nhe'; luuLai(); apDoHoa(); lamMoiKhuc(); capNhatKhuc(XE_DUA[0].s, 99); DV.bao('Đã giảm đồ họa xuống "' + DH().ten + '" cho mượt hơn', 2500); if (LUU.doHoa === 'nhe') daNhacCham = true; }
        else if (LUU.doHoa === 'toida') { daNhacCham = true; DV.bao('Máy hơi chậm? Vào Cài đặt chọn Đồ họa "Đẹp" nhé', 4000); }
      }
      demCham.t = 0; demCham.n = 0;
    }
  } else demCham.cu = 0;
  if (CUOC.tt !== 'tamdung') {
    capNhatCuoc(dt);
    if (document.visibilityState === 'visible') CUOC.gioChoi += dt;
    const dtH = CUOC.tt === 'slowmo' ? dt * SLOWMO_HE : dt, xaNhin = DH().xa + 100, cp = camera.position;
    for (const k of XE_DUA) { const xa = Math.hypot(k.x - cp.x, k.z - cp.z); k.mesh.visible = xa < xaNhin; if (k.mesh.visible) { capNhatXeMesh(k, dtH, tg); if (xa < 260) hieuUngXe(k, dtH); } }
    capNhatVatPham(dtH, tg); capNhatHat(dtH);
  }
  if (XE_DUA.length && CUOC.tt !== 'menu') { datVung(vungTai(XE_DUA[0].s)); capNhatKhuc(XE_DUA[0].s, 2); }
  veKyNang(tg);
  if (CUOC.tt !== 'menu') capNhatHUD(dt);
  const k = XE_DUA[0]; capNhatDongCo(k ? kep(Math.abs(k.vf) / V_TRAN, 0, 1) : 0, k && k.nitDang, !!k && dangDua());
  datCamera(dt, tg);
  if (CUOC.tt === 'ketqua' && BUC.sc) { capNhatBucVinh(dt); veKhung(dt, false, BUC.sc, BUC.cam); }
  else veKhung(dt, !!k && (k.nitDang || k.xungT > 0) && CUOC.tt === 'dua');
}
renderer.info.autoReset = false;
tatAm = !!LUU.tat; $('tdAm').textContent = '🔊 Âm thanh: ' + (tatAm ? 'Tắt' : 'Bật'); $('tdCam').textContent = '🎥 Camera: ' + (LUU.camXa ? 'Xa' : 'Gần');
apDoHoa(); vaoSanh();
if (!/[?&](xem|man)=/.test(location.search)) moChonLoai();      // mới vào game: hỏi chọn ô tô hay xe máy
setTimeout(() => { $('dangTai').style.opacity = 0; setTimeout(() => $('dangTai').remove(), 450); }, 50);
requestAnimationFrame(vongLap);
if (/[?&]xem=dua/.test(location.search)) {          // chế độ xem thử (?xem=dua&d=chặng&tua=giây&fps): xe của bạn tự chạy, không lưu dữ liệu
  CUOC.thu = true; window.dieuKhienNguoi = (k) => { if (!k.ai) k.ai = taoAI(NHAN_VAT[4]); dieuKhienAI(k, FB); };
  { const xm = location.search.match(/[?&]xe=(x[0-9]+)/); if (xm) LUU.xeDang = xm[1]; }   // xem thử với xe khác (?xe=x26)
  batDauDua({ duong: +((location.search.match(/[?&]d=(\d+)/) || [])[1] || 0), cheDo: 'nghiep' });
  const tua = +((location.search.match(/[?&]tua=(\d+)/) || [])[1] || 0); for (let i = 0; i < tua * 30; i++) { capNhatCuoc(1 / 30); if (i % 30 === 0) capNhatKhuc(XE_DUA[0].s, 99); } capNhatKhuc(XE_DUA[0].s, 99);
  if (/[?&]fps/.test(location.search)) {
    const o = document.createElement('div'); o.style.cssText = 'position:fixed;left:50%;bottom:8px;transform:translateX(-50%);background:#000a;color:#0f0;font:700 16px monospace;padding:4px 10px;z-index:50'; document.body.appendChild(o);
    let n = 0, t0 = performance.now(); (function dem() { n++; const t = performance.now(); if (t - t0 > 1000) { o.textContent = (n * 1000 / (t - t0)).toFixed(1) + ' khung/giây · ' + renderer.domElement.width + '×' + renderer.domElement.height + ' · ' + DH().ten + ' · ' + renderer.info.render.calls + ' lệnh vẽ'; n = 0; t0 = t; } requestAnimationFrame(dem); })();
  }
}
{ const xm = location.search.match(/[?&]xe=(x[0-9]+)/); if (xm) gChon = xm[1]; }
{ const m = location.search.match(/[?&]man=(\w+)/); if (m && TEN_MAN[m[1]] && !CUOC.thu) moMan(m[1]); }   // mở thẳng một màn hình (?man=garage) để xem nhanh
window.__kart = { CUOC, XE_DUA, DD, LUU, DV, XU, VAT, DOC, QUA, KHUC_DA, batDauCuoc, batDauDua, capNhatCuoc, capNhatMotBuoc, tinhXepHang, ketThucCuoc, vaoSanh, moMan, datLaiTrenDuong, dungDuong, capNhatKhuc };
