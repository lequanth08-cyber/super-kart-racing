// ===================== MÔ HÌNH 20 MẪU XE KART, TAY ĐUA CHIBI VÀ BOSS =====================
// Gốc ở mặt đất, mũi xe hướng +z. Sơn xe bóng (có lớp phủ trong và phản chiếu bầu trời), bánh to có gai lốp,
// tay đua đầu to kiểu hoạt hình: mỗi nhân vật một kiểu mũ/khăn/kính riêng.
const texLop = canvasTex(64, 32, (g, w, h) => { g.fillStyle = '#1a1a20'; g.fillRect(0, 0, w, h); g.fillStyle = '#2c2c34'; for (let x = 0; x < w; x += 8) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x + 5, h / 2); g.lineTo(x, h); g.lineTo(x + 3, h); g.lineTo(x + 8, h / 2); g.lineTo(x + 3, 0); g.fill(); } }, true);
texLop.repeat.set(4, 1);
function nhanTen(ten, mau, boss) {      // bảng tên cỡ cố định trên màn hình, nổi phía trên xe đối thủ
  const tx = canvasTex(256, 64, (g, w, h) => {
    g.fillStyle = boss ? 'rgba(90,10,30,.85)' : 'rgba(10,20,50,.7)'; g.beginPath(); g.roundRect ? g.roundRect(4, 8, w - 8, h - 16, 18) : g.rect(4, 8, w - 8, h - 16); g.fill();
    g.fillStyle = '#' + new THREE.Color(mau).getHexString(); g.fillRect(14, 8, 6, h - 16); g.fillStyle = '#fff'; g.font = '800 30px "Segoe UI",Arial,sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText((boss ? '👑 ' : '') + ten, w / 2 + 6, h / 2 + 1);
  });
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tx, transparent: true, depthWrite: false, sizeAttenuation: false })); s.scale.set(0.13, 0.0325, 1); s.position.y = 3.9; return s;
}
const sonXe = (mau) => new THREE.MeshPhysicalMaterial({ color: mau, metalness: 0.25, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.08 });
const nhua = (mau) => new THREE.MeshStandardMaterial({ color: mau, metalness: 0.05, roughness: 0.55 });
const kimLoai = (mau) => new THREE.MeshStandardMaterial({ color: mau, metalness: 0.9, roughness: 0.25 });

function dauChibi(nvId, yD, zD, them, hop) {     // đầu thú hoạt hình (bộ nhân vật tự thiết kế): mỗi nhân vật một con vật, một phụ kiện riêng
  const R = 0.74, den = nhua(0x15151c), trang = nhua(0xffffff), phat = (r, g, b) => new THREE.MeshBasicMaterial({ color: new THREE.Color(r, g, b) });
  const MAU = { speedy: 0xff7a2a, ninja: 0x2e2e3a, turbo: 0x4a8aff, lucky: 0xa8703a, rocky: 0x9a9aaa, shadow: 0x4a3a5e, bangvuong: 0x1c1c26, vuatocdo: 0xffc24a };
  const mDa = nvId === 'turbo' ? kimLoai(0x4a8aff) : nhua(MAU[nvId] != null ? MAU[nvId] : 0xffd8b0);
  const dau = them(new THREE.SphereGeometry(R, 24, 18), mDa, 0, yD, zD); if (nvId === 'turbo') dau.scale.set(1.08, 0.92, 0.98);
  const mat = (mauTrong, mauCon, to) => { for (const sx of [-1, 1]) { const tr = them(new THREE.SphereGeometry(to || 0.2, 14, 12), nhua(mauTrong), sx * 0.27, yD + 0.08, zD + R * 0.84); tr.scale.set(1, 1.15, 0.6); const c = them(new THREE.SphereGeometry((to || 0.2) * 0.62, 12, 10), nhua(mauCon), sx * 0.27, yD + 0.06, zD + R * 0.84 + 0.09); c.scale.set(1, 1.2, 0.6); them(new THREE.SphereGeometry(0.045, 6, 4), trang, sx * 0.27 + 0.04, yD + 0.13, zD + R * 0.84 + 0.15); } };
  const mom = (mau, w, y) => { const m = them(new THREE.SphereGeometry(0.3, 14, 10), nhua(mau), 0, yD + (y || -0.22), zD + 0.6); m.scale.set(w || 1.2, 0.8, 0.85); return m; };
  const mui = (y, z) => them(new THREE.SphereGeometry(0.09, 10, 8), den, 0, yD + y, zD + z);
  const cuoi = (y, z) => { const m = them(new THREE.TorusGeometry(0.12, 0.03, 6, 12, Math.PI), nhua(0x8a2a2a), 0, yD + y, zD + z, 0, 0, Math.PI); m.castShadow = false; };
  const tai = (r, h, x, y, mau, trong, nghieng) => { for (const sx of [-1, 1]) { const t = them(new THREE.ConeGeometry(r, h, 10), nhua(mau), sx * x, yD + y, zD - 0.05, 0, 0, -sx * (nghieng || 0.35)); if (trong != null) { const ti = them(new THREE.ConeGeometry(r * 0.55, h * 0.7, 8), nhua(trong), sx * x, yD + y - 0.04, zD + 0.06, 0, 0, -sx * (nghieng || 0.35)); ti.castShadow = false; } } };
  if (nvId === 'speedy') {               // cáo đỏ: tai nhọn, mõm trắng, băng đô đua vàng
    tai(0.24, 0.55, 0.44, 0.66, 0xff7a2a, 0xffffff); mom(0xffffff, 1.3, -0.24); mui(-0.14, 0.86); mat(0xffffff, 0x2a1a0a); cuoi(-0.36, 0.78);
    them(new THREE.TorusGeometry(R * 0.98, 0.08, 8, 28), nhua(0xffd23a), 0, yD + 0.3, zD, Math.PI / 2 - 0.15, 0, 0);
  } else if (nvId === 'ninja') {         // mèo đen ninja: tai mèo, khăn bịt mắt tím có đuôi bay, ria
    tai(0.22, 0.4, 0.42, 0.62, 0x2e2e3a, 0xff9ab0, 0.25); mat(0xd8ff7a, 0x15151c, 0.19); mom(0x4a4a58, 1.1, -0.24); mui(-0.13, 0.82);
    them(new THREE.TorusGeometry(R * 1.0, 0.1, 8, 28), nhua(0x6a2ad8), 0, yD + 0.1, zD, Math.PI / 2, 0, 0); for (const sx of [-1, 1]) hop(0.12, 0.06, 0.95, nhua(0x6a2ad8), sx * 0.16, yD + 0.1, zD - 1.0, 0.3, sx * 0.25);
    for (const sx of [-1, 1]) for (const dy of [-0.05, 0.05]) { const r = hop(0.5, 0.02, 0.02, trang, sx * 0.45, yD - 0.2 + dy, zD + 0.62, 0, 0, sx * dy * 2); r.castShadow = false; }
  } else if (nvId === 'turbo') {         // rô-bốt: tấm kính đen, mắt đèn xanh, ăng-ten có bóng sáng, bu-lông hai bên
    hop(1.0, 0.36, 0.2, nhua(0x10141e), 0, yD + 0.06, zD + R * 0.84); for (const sx of [-1, 1]) them(new THREE.SphereGeometry(0.11, 10, 8), phat(0.4, 3, 3.2), sx * 0.24, yD + 0.06, zD + R * 0.84 + 0.11);
    them(new THREE.CylinderGeometry(0.04, 0.04, 0.5, 6), kimLoai(0xd8dce6), 0, yD + 0.9, zD); them(new THREE.SphereGeometry(0.12, 10, 8), phat(3, 0.6, 0.4), 0, yD + 1.18, zD);
    for (const sx of [-1, 1]) them(new THREE.CylinderGeometry(0.16, 0.16, 0.2, 12), kimLoai(0xff8a2a), sx * 0.8, yD, zD, 0, 0, Math.PI / 2); hop(0.3, 0.05, 0.05, phat(0.4, 3, 3.2), 0, yD - 0.3, zD + 0.68);
  } else if (nvId === 'lucky') {         // gấu nâu: tai tròn, mõm sáng, mũ chóp xanh có cỏ ba lá
    for (const sx of [-1, 1]) { them(new THREE.SphereGeometry(0.26, 14, 10), mDa, sx * 0.52, yD + 0.55, zD - 0.05); them(new THREE.SphereGeometry(0.14, 10, 8), nhua(0xffc8a0), sx * 0.52, yD + 0.55, zD + 0.08); }
    mom(0xf0d0a8, 1.2, -0.2); mui(-0.1, 0.86); mat(0xffffff, 0x15151c); cuoi(-0.36, 0.72);
    them(new THREE.CylinderGeometry(0.52, 0.56, 0.12, 20), nhua(0x2a9a4a), 0, yD + 0.7, zD); them(new THREE.CylinderGeometry(0.36, 0.4, 0.42, 18), nhua(0x2a9a4a), 0, yD + 0.95, zD);
    for (let i = 0; i < 3; i++) { const a = i * 2.1; them(new THREE.SphereGeometry(0.08, 8, 6), nhua(0x7aff7a), Math.cos(a) * 0.08, yD + 0.98 + Math.sin(a) * 0.08, zD + 0.38); }
  } else if (nvId === 'rocky') {         // tê giác xám: sừng ngà trên mõm, tai nhỏ, mũ bảo hộ vàng
    tai(0.16, 0.3, 0.5, 0.5, 0x9a9aaa, 0xd8a8b0, 0.6); mom(0xb8b8c6, 1.4, -0.26); mat(0xffffff, 0x15151c, 0.17);
    them(new THREE.ConeGeometry(0.15, 0.55, 10), nhua(0xfff2d8), 0, yD + 0.0, zD + 0.98, 1.1, 0, 0); them(new THREE.ConeGeometry(0.09, 0.28, 8), nhua(0xfff2d8), 0, yD + 0.22, zD + 0.8, 0.9, 0, 0);
    them(new THREE.SphereGeometry(R + 0.06, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2.4), sonXe(0xffc83a), 0, yD + 0.16, zD); hop(0.9, 0.08, 0.4, sonXe(0xffc83a), 0, yD + 0.3, zD + 0.62, -0.1);
  } else if (nvId === 'shadow') {        // dơi đêm: tai dơi to, mắt đỏ phát sáng, răng nanh
    for (const sx of [-1, 1]) { const t = them(new THREE.ConeGeometry(0.34, 0.8, 4), nhua(0x4a3a5e), sx * 0.5, yD + 0.75, zD - 0.05, 0, Math.PI / 4, -sx * 0.45); t.scale.z = 0.35; }
    for (const sx of [-1, 1]) { them(new THREE.SphereGeometry(0.13, 10, 8), phat(3.2, 0.4, 0.4), sx * 0.26, yD + 0.08, zD + R * 0.86); them(new THREE.ConeGeometry(0.05, 0.16, 6), trang, sx * 0.09, yD - 0.33, zD + 0.68, Math.PI, 0, 0); }
    mom(0x5a4a6e, 1.1, -0.22); mui(-0.12, 0.84);
  } else if (nvId === 'bangvuong') {     // vua chim cánh cụt: mặt trắng, mỏ cam, vương miện băng
    const m = them(new THREE.SphereGeometry(0.58, 18, 14), trang, 0, yD - 0.08, zD + 0.22); m.scale.set(1.05, 1, 0.9); mat(0xffffff, 0x15151c, 0.18);
    them(new THREE.ConeGeometry(0.16, 0.42, 10), nhua(0xff9a2a), 0, yD - 0.2, zD + 0.84, Math.PI / 2, 0, 0);
    const mv = phat(0.8, 2.6, 3.2); them(new THREE.CylinderGeometry(0.56, 0.56, 0.2, 16), mv, 0, yD + 0.7, zD); for (let i = 0; i < 6; i++) { const a = i / 6 * 6.283; them(new THREE.ConeGeometry(0.11, 0.45, 6), mv, Math.cos(a) * 0.47, yD + 0.98, zD + Math.sin(a) * 0.47); }
  } else if (nvId === 'vuatocdo') {      // vua sư tử vàng: bờm tròn quanh mặt, tai tròn, vương miện vàng
    for (let i = 0; i < 14; i++) { const a = i / 14 * 6.283; them(new THREE.SphereGeometry(0.3, 10, 8), nhua(0xd86a1a), Math.cos(a) * 0.78, yD + Math.sin(a) * 0.78, zD - 0.12); }
    mom(0xffe2a8, 1.3, -0.22); mui(-0.12, 0.84); mat(0xffffff, 0x3a1a0a); cuoi(-0.36, 0.76);
    const mv = phat(3.2, 2.4, 0.4); them(new THREE.CylinderGeometry(0.5, 0.5, 0.2, 16), mv, 0, yD + 0.74, zD); for (let i = 0; i < 6; i++) { const a = i / 6 * 6.283; them(new THREE.ConeGeometry(0.11, 0.45, 6), mv, Math.cos(a) * 0.42, yD + 1.0, zD + Math.sin(a) * 0.42); }
  } else { mat(0xffffff, 0x15151c); cuoi(-0.24, 0.66); them(new THREE.SphereGeometry(R + 0.05, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2.1), sonXe(0x2e3a5a), 0, yD + 0.12, zD); }
}
function taoTayDua(g, nvId, mauAo, yN, them, hop) {   // người lái ngồi trong xe: thân, hai tay cầm lái, đầu to
  const mAo = nhua(mauAo), trang = nhua(0xffffff);
  them(new THREE.CylinderGeometry(0.4, 0.46, 0.8, 14), mAo, 0, 1.2 + yN, -0.4);
  for (const sx of [-1, 1]) { const tay = them(new THREE.CylinderGeometry(0.12, 0.12, 0.75, 8), mAo, sx * 0.34, 1.32 + yN, -0.05, 1.1, 0, -sx * 0.35); tay.castShadow = false; them(new THREE.SphereGeometry(0.15, 8, 6), trang, sx * 0.27, 1.25 + yN, 0.3); }
  dauChibi(nvId, 2.15 + yN, -0.35, them, hop);
}
function taoNguoiDung(nvId, mauAo) {           // nhân vật đứng (trên bục vinh quang): chân, giày, áo đua, hai tay giơ cao
  const g = new THREE.Group(), them = (geo, mat, px, py, pz, rx, ry, rz) => { const m = new THREE.Mesh(geo, mat); m.position.set(px, py, pz); m.rotation.set(rx || 0, ry || 0, rz || 0); m.castShadow = true; g.add(m); return m; };
  const hop = (w, h, d, mat, px, py, pz, rx, ry, rz) => them(new THREE.BoxGeometry(w, h, d), mat, px, py, pz, rx, ry, rz);
  const mAo = sonXe(mauAo), quan = nhua(0x22283a), giay = nhua(0xffffff), gang = nhua(0xffffff);
  for (const sx of [-1, 1]) { them(new THREE.CylinderGeometry(0.17, 0.19, 0.75, 10), quan, sx * 0.22, 0.45, 0); const gi = them(new THREE.SphereGeometry(0.24, 12, 8), giay, sx * 0.22, 0.1, 0.08); gi.scale.set(1, 0.6, 1.4); }
  them(new THREE.CylinderGeometry(0.42, 0.5, 0.95, 16), mAo, 0, 1.25, 0); hop(0.5, 0.08, 0.04, nhua(0xffffff), 0, 1.4, 0.45);
  const tay = []; for (const sx of [-1, 1]) { const vai = new THREE.Group(); vai.position.set(sx * 0.48, 1.6, 0); g.add(vai); const t = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.13, 1.0, 8), mAo); t.position.y = 0.48; vai.add(t); const n = new THREE.Mesh(new THREE.SphereGeometry(0.19, 10, 8), gang); n.position.y = 1.02; vai.add(n); vai.rotation.z = -sx * 0.55; tay.push(vai); }
  dauChibi(nvId, 2.45, 0, them, hop);
  g.userData.tay = tay; return g;
}
function taoKart(x, mau, phu, ten, o) {
  if (x.loai === 'moto') return taoXeMay(x, mau, phu, ten, o);
  o = o || {};
  const g = new THREE.Group(), than = sonXe(mau), mp = sonXe(phu), den = nhua(0x1c1c22), kim = kimLoai(0xd8dce6);
  const them = (geo, mat, px, py, pz, rx, ry, rz) => { const m = new THREE.Mesh(geo, mat); m.position.set(px, py, pz); m.rotation.set(rx || 0, ry || 0, rz || 0); m.castShadow = true; g.add(m); return m; };
  const hop = (w, h, d, mat, px, py, pz, rx, ry, rz) => them(new THREE.BoxGeometry(w, h, d), mat, px, py, pz, rx, ry, rz);
  const tron = (r, sx, sy, sz, mat, px, py, pz) => { const m = them(new THREE.SphereGeometry(r, 18, 12), mat, px, py, pz); m.scale.set(sx, sy, sz); return m; };
  const k = x.than, rB = (x.banh || 0.6) * 1.12, rongBanh = k === 'cao' ? 1.4 : k === 'f1' ? 1.35 : 1.22, zT = k === 'f1' ? 1.55 : 1.35, zS = -1.3;
  let muiZ = 2.6;
  // thân: các khối bo tròn
  if (k === 'tron') { tron(1.25, 1, 0.62, 1.6, than, 0, 0.95, -0.05); tron(0.6, 1.4, 0.5, 0.8, mp, 0, 0.7, 1.9); muiZ = 2.6; }
  else if (k === 'cao') { hop(2.3, 0.9, 3.4, than, 0, 1.0, 0); tron(0.9, 1.2, 0.6, 0.9, mp, 0, 1.0, 1.8); muiZ = 2.55; }
  else if (k === 'det') { hop(2.0, 0.42, 3.8, than, 0, 0.72, 0); tron(0.75, 1.0, 0.45, 1.6, than, 0, 0.75, 2.1); muiZ = 3.15; }
  else if (k === 'nhon') { hop(1.8, 0.55, 2.8, than, 0, 0.8, -0.2); const mui = them(new THREE.ConeGeometry(0.88, 2.4, 4), than, 0, 0.78, 2.15, Math.PI / 2, Math.PI / 4, 0); mui.scale.set(1, 1, 0.62); muiZ = 3.3; }
  else if (k === 'f1') { tron(0.6, 1, 0.75, 3.6, than, 0, 0.8, 0.3); them(new THREE.ConeGeometry(0.5, 1.4, 12), than, 0, 0.78, 2.95, Math.PI / 2, 0, 0); for (const sx of [-0.85, 0.85]) tron(0.45, 1, 0.9, 2.1, than, sx, 0.75, -0.4); muiZ = 3.6; }
  else { hop(2.0, 0.55, 3.4, than, 0, 0.8, -0.1); tron(0.8, 1.0, 0.55, 1.1, than, 0, 0.78, 1.8); muiZ = 2.65; }
  for (const sx of [-1, 1]) tron(0.38, 0.7, 0.6, 1.5, mp, sx * 1.02, 0.65, -0.2);     // ốp hông bo tròn
  them(new THREE.CylinderGeometry(0.2, 0.2, 2.2, 12), den, 0, 0.45, muiZ - 0.25, 0, 0, Math.PI / 2);   // cản trước
  hop(1.1, 0.75, 0.2, den, 0, 1.2 + (k === 'cao' ? 0.25 : 0), -0.82, -0.25);                         // tựa lưng ghế
  if (x.soc) hop(0.45, 0.06, 3.0, mp, 0, k === 'cao' ? 1.47 : k === 'tron' ? 1.72 : 1.1, 0.1);
  if (x.vay) for (const sx of [-1, 1]) hop(0.14, 0.6, 2.2, mp, sx * 1.12, 0.95, -0.1, 0, 0, sx * 0.25);
  if (x.long) { for (const sx of [-0.95, 0.95]) for (const sz of [-0.9, 0.9]) them(new THREE.CylinderGeometry(0.07, 0.07, 1.4, 8), kim, sx, 2.05, sz); them(new THREE.CylinderGeometry(0.07, 0.07, 1.9, 8), kim, 0, 2.75, -0.9, 0, 0, Math.PI / 2); }
  if (x.canh) { const w = [0, 2.2, 2.9, 3.6][x.canh], cao = [0, 1.55, 1.85, 2.15][x.canh]; hop(w, 0.12, 0.75, mp, 0, cao, -2.0, 0.1); for (const sx of [-0.6, 0.6]) hop(0.12, cao - 0.75, 0.12, kim, sx, (cao + 0.75) / 2, -1.9); for (const sx of [-1, 1]) hop(0.1, 0.55, 0.85, than, sx * w / 2, cao + 0.1, -2.0); }
  if (x.truoc) { hop(3.0, 0.1, 0.6, mp, 0, 0.4, muiZ - 0.1); for (const sx of [-1.5, 1.5]) hop(0.1, 0.32, 0.65, than, sx, 0.5, muiZ - 0.1); }
  if (x.sang) { const lo = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 4.6), new THREE.MeshBasicMaterial({ color: new THREE.Color(phu).multiplyScalar(2.2), transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false })); lo.rotation.x = -Math.PI / 2; lo.position.y = 0.12; g.add(lo); }
  // bánh to: lốp có gai, mâm kim loại màu phụ
  const banh = [], lop = new THREE.CylinderGeometry(rB, rB, 0.78, 22), mayo = new THREE.CylinderGeometry(rB * 0.58, rB * 0.58, 0.82, 14), matLop = new THREE.MeshStandardMaterial({ map: texLop, roughness: 0.9, metalness: 0 }), matMam = kimLoai(phu);
  for (const [sx, sz, truoc] of [[-rongBanh, zT, 1], [rongBanh, zT, 1], [-rongBanh, zS, 0], [rongBanh, zS, 0]]) {
    const piv = new THREE.Group(), spin = new THREE.Group(); piv.position.set(sx, rB, sz); piv.add(spin);
    const bx = new THREE.Mesh(lop, matLop); bx.rotation.z = Math.PI / 2; bx.castShadow = true; spin.add(bx);
    const mx = new THREE.Mesh(mayo, matMam); mx.rotation.z = Math.PI / 2; spin.add(mx);
    for (let i = 0; i < 3; i++) { const v = new THREE.Mesh(new THREE.BoxGeometry(0.84, 0.12, rB * 1.05), den); v.rotation.x = i * Math.PI / 3; spin.add(v); }
    g.add(piv); banh.push({ piv, spin, truoc: !!truoc });
  }
  them(new THREE.TorusGeometry(0.3, 0.06, 8, 18), den, 0, 1.32 + (k === 'cao' ? 0.25 : 0), 0.32, -0.9, 0, 0);     // vô lăng
  if (!o.khongNguoi) taoTayDua(g, o.nvId, o.mauMu != null ? o.mauMu : phu, k === 'cao' ? 0.25 : 0, them, hop);
  // đèn pha, đèn phanh (màu > 1 để phát quầng sáng), ống xả mạ crôm
  const matPhanh = new THREE.MeshBasicMaterial({ color: new THREE.Color(0.7, 0.06, 0.05) }), matPha = new THREE.MeshBasicMaterial({ color: new THREE.Color(3.4, 3.2, 2.5) });
  for (const sx of [-0.6, 0.6]) { const dp = hop(0.42, 0.2, 0.1, matPhanh, sx, 1.0, -1.75); dp.castShadow = false; }
  for (const sx of [-0.55, 0.55]) { const dp = them(new THREE.CylinderGeometry(0.17, 0.17, 0.12, 14), matPha, sx, 0.95, muiZ - 0.02, Math.PI / 2, 0, 0); dp.castShadow = false; }
  const xa = [], soXa = x.xa || 2, ong = new THREE.CylinderGeometry(0.18, 0.24, 0.6, 12);
  for (let i = 0; i < soXa; i++) { const sx = soXa === 1 ? 0 : -0.7 + 1.4 * i / (soXa - 1); them(ong, kim, sx, 0.75, -2.05, Math.PI / 2, 0, 0); xa.push([sx, 0.75, -2.4]); }
  g.userData = { banh, ongXa: xa, rB, matPhanh, muiZ };
  if (o.boss) {
    const hq = new THREE.Mesh(new THREE.RingGeometry(2.6, 3.4, 40), new THREE.MeshBasicMaterial({ color: new THREE.Color(mau).multiplyScalar(2.4), transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
    hq.rotation.x = -Math.PI / 2; hq.position.y = 0.15; g.add(hq); g.userData.haoQuang = hq; g.scale.setScalar(1.3);
  }
  if (ten) g.add(nhanTen(ten, mau, o.boss));
  if (o.nguoi) { const mt = new THREE.Mesh(new THREE.ConeGeometry(0.5, 0.9, 4), new THREE.MeshBasicMaterial({ color: new THREE.Color(2.2, 1.8, 0.4) })); mt.rotation.x = Math.PI; mt.position.y = 3.6; g.add(mt); g.userData.muiTen = mt; }
  return g;
}
function taoXeMay(x, mau, phu, ten, o) {     // xe máy: hai bánh, bình xăng, yên, càng trước, tay lái; người lái ngồi chồm trên yên
  o = o || {};
  const g = new THREE.Group(), than = sonXe(mau), mp = sonXe(phu), den = nhua(0x1c1c22), kim = kimLoai(0xd8dce6), xam = kimLoai(0x5a5e68);
  const them = (geo, mat, px, py, pz, rx, ry, rz) => { const m = new THREE.Mesh(geo, mat); m.position.set(px, py, pz); m.rotation.set(rx || 0, ry || 0, rz || 0); m.castShadow = true; g.add(m); return m; };
  const hop = (w, h, d, mat, px, py, pz, rx, ry, rz) => them(new THREE.BoxGeometry(w, h, d), mat, px, py, pz, rx, ry, rz);
  const tron = (r, sx, sy, sz, mat, px, py, pz) => { const m = them(new THREE.SphereGeometry(r, 18, 12), mat, px, py, pz); m.scale.set(sx, sy, sz); return m; };
  const kieu = x.kieu || 'dua', rB = (x.banh || 0.62) * 1.25, zT = 1.55, zS = -1.35, cao = kieu === 'cao' ? 0.25 : 0, y0 = rB + cao;
  hop(0.5, 0.6, 1.1, xam, 0, y0 + 0.2, -0.05);                                              // khối máy
  for (const sx of [-1, 1]) them(new THREE.CylinderGeometry(0.06, 0.06, 2.0, 8), kim, sx * 0.2, y0 + 0.55, 0.05, Math.PI / 2 - 0.3, 0, 0);   // khung ống
  them(new THREE.CylinderGeometry(0.11, 0.15, 1.4, 10), kim, 0.34, y0 + 0.05, -0.95, Math.PI / 2 - 0.12, 0, 0);   // ống xả
  tron(0.42, 0.95, 0.72, 1.35, than, 0, y0 + 0.92, 0.42);                                    // bình xăng
  hop(0.52, 0.16, 1.1, den, 0, y0 + 0.82, -0.58);                                          // yên
  const duoi = them(new THREE.ConeGeometry(0.34, 1.0, 4), than, 0, y0 + 0.92, -1.3, -Math.PI / 2, Math.PI / 4, 0); duoi.scale.set(1, 1, 0.6);   // đuôi xe
  for (const sx of [-1, 1]) tron(0.3, 0.45, 0.8, 1.5, mp, sx * 0.3, y0 + 0.5, 0.25);       // ốp hông màu phụ
  if (kieu === 'dua') {                   // xe đua: mũi bọc kín, kính chắn gió
    tron(0.5, 0.9, 0.8, 1.3, than, 0, y0 + 0.95, 1.2);
    const kinh = them(new THREE.PlaneGeometry(0.7, 0.6), new THREE.MeshStandardMaterial({ color: 0x9ad8ff, transparent: true, opacity: 0.55, roughness: 0.05, metalness: 0.3, side: THREE.DoubleSide }), 0, y0 + 1.5, 1.3, -0.6, 0, 0); kinh.castShadow = false;
  } else if (kieu === 'cao') {            // xe địa hình: chắn bùn trước cao, bảng số trắng
    hop(0.34, 0.06, 1.1, mp, 0, rB * 2 + 0.12, zT - 0.05, -0.15); hop(0.55, 0.42, 0.06, nhua(0xffffff), 0, y0 + 1.3, 1.15, -0.3);
  } else {                                // xe phượt: chắn bùn tròn ôm bánh trước
    them(new THREE.TorusGeometry(rB + 0.08, 0.1, 6, 16, Math.PI * 0.8), mp, 0, rB, zT, 0, Math.PI / 2, Math.PI * 0.1);
  }
  for (const sx of [-1, 1]) them(new THREE.CylinderGeometry(0.07, 0.07, 1.65, 8), kim, sx * 0.21, rB + 0.75 + cao / 2, zT - 0.3, -0.38, 0, 0);   // càng trước
  them(new THREE.CylinderGeometry(0.05, 0.05, 1.25, 8), den, 0, y0 + 1.45, 0.7, 0, 0, Math.PI / 2);                // tay lái
  for (const sx of [-1, 1]) them(new THREE.CylinderGeometry(0.08, 0.08, 0.26, 8), nhua(0x2a2a30), sx * 0.6, y0 + 1.45, 0.7, 0, 0, Math.PI / 2);
  const banh = [], lop = new THREE.CylinderGeometry(rB, rB, 0.36, 22), mayo = new THREE.CylinderGeometry(rB * 0.55, rB * 0.55, 0.4, 14), matLop = new THREE.MeshStandardMaterial({ map: texLop, roughness: 0.9, metalness: 0 }), matMam = kimLoai(phu);
  for (const [sz, truoc] of [[zT, 1], [zS, 0]]) {
    const piv = new THREE.Group(), spin = new THREE.Group(); piv.position.set(0, rB, sz); piv.add(spin);
    const bx = new THREE.Mesh(lop, matLop); bx.rotation.z = Math.PI / 2; bx.castShadow = true; spin.add(bx);
    const mx = new THREE.Mesh(mayo, matMam); mx.rotation.z = Math.PI / 2; spin.add(mx);
    for (let i = 0; i < 3; i++) { const v = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.1, rB * 1.05), den); v.rotation.x = i * Math.PI / 3; spin.add(v); }
    g.add(piv); banh.push({ piv, spin, truoc: !!truoc });
  }
  if (!o.khongNguoi) {                   // người lái ngồi trên yên, hai chân gác lên chỗ để chân
    taoTayDua(g, o.nvId, o.mauMu != null ? o.mauMu : phu, y0 + 0.05, them, hop);
    for (const sx of [-1, 1]) { const ch = them(new THREE.CylinderGeometry(0.13, 0.11, 1.15, 8), nhua(0x2a2a3a), sx * 0.32, y0 + 0.45, -0.2, -0.46, 0, 0); ch.castShadow = false; them(new THREE.SphereGeometry(0.14, 8, 6), den, sx * 0.36, y0 - 0.05, 0.05); }
  }
  const matPhanh = new THREE.MeshBasicMaterial({ color: new THREE.Color(0.7, 0.06, 0.05) }), matPha = new THREE.MeshBasicMaterial({ color: new THREE.Color(3.4, 3.2, 2.5) });
  { const dp = hop(0.32, 0.16, 0.08, matPhanh, 0, y0 + 1.0, -1.78); dp.castShadow = false; }
  { const r = kieu === 'phuot' ? 0.24 : 0.16, dp = them(new THREE.CylinderGeometry(r, r, 0.1, 14), matPha, 0, y0 + (kieu === 'dua' ? 0.95 : 1.2), kieu === 'dua' ? 1.84 : 1.3, Math.PI / 2, 0, 0); dp.castShadow = false; }
  if (x.sang) { const lo = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 4.2), new THREE.MeshBasicMaterial({ color: new THREE.Color(phu).multiplyScalar(2.2), transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false })); lo.rotation.x = -Math.PI / 2; lo.position.y = 0.12; g.add(lo); }
  g.userData = { banh, ongXa: [[0.34, y0 + 0.05, -1.7]], rB, matPhanh, muiZ: 2.0, moto: true };
  if (o.boss) {
    const hq = new THREE.Mesh(new THREE.RingGeometry(2.6, 3.4, 40), new THREE.MeshBasicMaterial({ color: new THREE.Color(mau).multiplyScalar(2.4), transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
    hq.rotation.x = -Math.PI / 2; hq.position.y = 0.15; g.add(hq); g.userData.haoQuang = hq; g.scale.setScalar(1.3);
  }
  if (ten) g.add(nhanTen(ten, mau, o.boss));
  if (o.nguoi) { const mt = new THREE.Mesh(new THREE.ConeGeometry(0.5, 0.9, 4), new THREE.MeshBasicMaterial({ color: new THREE.Color(2.2, 1.8, 0.4) })); mt.rotation.x = Math.PI; mt.position.y = 4.3; g.add(mt); g.userData.muiTen = mt; }
  return g;
}
function huyMoHinh(g) { g.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.material) { const ms = Array.isArray(o.material) ? o.material : [o.material]; ms.forEach(m => { if (m.map && m.map !== texLop) m.map.dispose(); m.dispose(); }); } }); }
