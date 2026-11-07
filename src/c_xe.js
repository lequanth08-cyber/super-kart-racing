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

function dauChibi(nvId, yD, zD, them, hop) {     // đầu của 30 nhân vật (bạn nhỏ, thú, người máy, phi hành gia…) + 2 Boss: mỗi người một kiểu tóc, mũ, phụ kiện riêng
  const R = 0.74, den = nhua(0x15151c), trang = nhua(0xffffff), phat = (r, g, b) => new THREE.MeshBasicMaterial({ color: new THREE.Color(r, g, b) });
  const MAU = { bangvuong: 0x1c1c26, vuatocdo: 0xffc24a, fox: 0xff7a2a, panda: 0xffffff, tiger: 0xff9a2a, bunny: 0xfff0f6, bobo: 0xa8703a, ducky: 0xffe14a, rainbow: 0xffffff, monkey: 0x8a5a3a, dragon: 0xe83a2a, shark: 0x5a8ad8, cosmo: 0xf4f6ff, dino: 0x4ac84a, alien: 0x6ae04a, skelly: 0xf4f0e0, shadow: 0xe8dcf0, icequeen: 0xffe8f0 };   // màu đầu (không có trong bảng = da người)
  const mDa = nvId === 'robo' ? kimLoai(0xf0f4ff) : nhua(MAU[nvId] != null ? MAU[nvId] : 0xffd8b0);
  const dau = them(new THREE.SphereGeometry(R, 24, 18), mDa, 0, yD, zD); if (nvId === 'robo') dau.scale.set(1.08, 0.92, 0.98);
  const mat = (mauTrong, mauCon, to) => { for (const sx of [-1, 1]) { const tr = them(new THREE.SphereGeometry(to || 0.2, 14, 12), nhua(mauTrong), sx * 0.27, yD + 0.08, zD + R * 0.84); tr.scale.set(1, 1.15, 0.6); const c = them(new THREE.SphereGeometry((to || 0.2) * 0.62, 12, 10), nhua(mauCon), sx * 0.27, yD + 0.06, zD + R * 0.84 + 0.09); c.scale.set(1, 1.2, 0.6); them(new THREE.SphereGeometry(0.045, 6, 4), trang, sx * 0.27 + 0.04, yD + 0.13, zD + R * 0.84 + 0.15); } };
  const mom = (mau, w, y) => { const m = them(new THREE.SphereGeometry(0.3, 14, 10), nhua(mau), 0, yD + (y || -0.22), zD + 0.6); m.scale.set(w || 1.2, 0.8, 0.85); return m; };
  const mui = (y, z) => them(new THREE.SphereGeometry(0.09, 10, 8), den, 0, yD + y, zD + z);
  const cuoi = (y, z) => { const m = them(new THREE.TorusGeometry(0.12, 0.03, 6, 12, Math.PI), nhua(0x8a2a2a), 0, yD + y, zD + z, 0, 0, Math.PI); m.castShadow = false; };
  const tai = (r, h, x, y, mau, trong, nghieng) => { for (const sx of [-1, 1]) { const t = them(new THREE.ConeGeometry(r, h, 10), nhua(mau), sx * x, yD + y, zD - 0.05, 0, 0, -sx * (nghieng || 0.35)); if (trong != null) { const ti = them(new THREE.ConeGeometry(r * 0.55, h * 0.7, 8), nhua(trong), sx * x, yD + y - 0.04, zD + 0.06, 0, 0, -sx * (nghieng || 0.35)); ti.castShadow = false; } } };
  const mat3 = (iris) => { mat(0xffffff, iris, 0.2); cuoi(-0.3, 0.72); for (const sx of [-1, 1]) { const m = them(new THREE.SphereGeometry(0.1, 10, 8), nhua(0xff9a9a), sx * 0.46, yD - 0.16, zD + 0.55); m.scale.z = 0.4; m.castShadow = false; } them(new THREE.SphereGeometry(0.05, 8, 6), nhua(0xe8a888), 0, yD - 0.1, zD + 0.8); };   // mắt to long lanh, miệng cười, má hồng, mũi nhỏ
  const toc = (mau) => them(new THREE.SphereGeometry(R + 0.05, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2.1), nhua(mau), 0, yD + 0.12, zD);
  const sau = (mau, k) => { const s = them(new THREE.SphereGeometry(R + 0.09, 20, 14), nhua(mau), 0, yD - 0.06, zD - 0.17); s.scale.set(1, k || 1.02, 0.95); return s; };      // tóc phía sau và hai bên đầu
  const mai = (mau, n) => { n = n || 5; for (let i = 0; i < n; i++) { const x = (i - (n - 1) / 2) * 0.21, y = 0.4 - Math.abs(x) * 0.22; them(new THREE.SphereGeometry(0.17, 10, 8), nhua(mau), x, yD + y, zD + Math.sqrt(Math.max(0.05, (R + 0.02) * (R + 0.02) - x * x - y * y)) - 0.04); } };   // tóc mái
  const gai = (mau, n, cao, ng) => { const m = nhua(mau); for (let i = 0; i < n; i++) { const a = i / n * 6.283 + 0.4, r = i === 0 ? 0 : 0.36, t = i === 0 ? 0 : (ng || 0.5); them(new THREE.ConeGeometry(0.17, cao, 8), m, Math.cos(a) * r, yD + 0.78, zD + Math.sin(a) * r - 0.05, Math.sin(a) * t, 0, -Math.cos(a) * t); } };   // tóc dựng gai
  const vong = (mau, y, d) => them(new THREE.TorusGeometry(Math.sqrt(R * R - y * y) + 0.03, d || 0.07, 8, 28), nhua(mau), 0, yD + y, zD, Math.PI / 2, 0, 0);
  const canh = (mau, x, y) => { for (const sx of [-1, 1]) { const m = them(new THREE.SphereGeometry(0.24, 12, 10), nhua(mau), sx * x, yD + y, zD - 0.05); m.scale.set(0.7, 1.5, 0.8); } };   // tóc dài rủ hai bên
  if (nvId === 'speedy') {         // cậu bé băng đô đỏ: tóc nâu dựng gai, băng đô đỏ có nút thắt và đuôi bay
    sau(0x4a2a1a, 0.95); toc(0x4a2a1a); gai(0x4a2a1a, 7, 0.46, 0.5); mai(0x4a2a1a, 5); mat3(0x4a2a1a);
    vong(0xe83a3a, 0.34, 0.085); hop(0.22, 0.22, 0.12, nhua(0xe83a3a), 0, yD + 0.34, zD - 0.74); for (const sx of [-1, 1]) hop(0.13, 0.07, 0.6, nhua(0xe83a3a), sx * 0.17, yD + 0.3, zD - 1.0, 0.5, 0, sx * 0.3);
  } else if (nvId === 'luna') {         // cô bé tai nghe hồng: tóc đen dài, mái bằng, tai nghe hồng có nơ
    sau(0x15151c, 1.12); toc(0x15151c); mai(0x15151c, 7); canh(0x15151c, 0.62, -0.4); mat3(0x6a3a8a);
    them(new THREE.TorusGeometry(R + 0.1, 0.07, 8, 24, Math.PI), nhua(0xff7ab8), 0, yD, zD);
    for (const sx of [-1, 1]) { const c = them(new THREE.SphereGeometry(0.22, 14, 10), nhua(0xff7ab8), sx * (R + 0.12), yD, zD); c.scale.set(0.55, 1, 1); const d = them(new THREE.SphereGeometry(0.15, 12, 10), nhua(0xffc8e0), sx * (R + 0.2), yD, zD); d.scale.set(0.4, 1, 1); }
    for (const sx of [-1, 1]) them(new THREE.ConeGeometry(0.13, 0.3, 4), nhua(0xff3a8a), -0.5 + sx * 0.17, yD + 0.6, zD + 0.18, 0, 0, sx * Math.PI / 2); them(new THREE.SphereGeometry(0.07, 8, 6), nhua(0xff1a6a), -0.5, yD + 0.6, zD + 0.18);
  } else if (nvId === 'turbo') {         // cậu bé tóc xanh: tóc xanh dương dựng gai, mắt sáng, quyết tâm
    sau(0x2a5ae8, 0.95); toc(0x2a5ae8); gai(0x2a5ae8, 9, 0.54, 0.75); mai(0x2a5ae8, 5); mat3(0x1a2a6a);
    for (const sx of [-1, 1]) hop(0.05, 0.28, 0.05, phat(0.4, 1.6, 3), sx * 0.34, yD + 0.78, zD + 0.1, 0.4, 0, -sx * 0.4);
  } else if (nvId === 'flash') {         // cậu bé đeo kính bay: tóc nâu, kính bay vàng cam đội trên trán
    sau(0x6a3a1a, 1.0); toc(0x6a3a1a); mai(0x6a3a1a, 5); mat3(0x3a2a1a); vong(0x2a2a30, 0.42, 0.055);
    for (const sx of [-1, 1]) { them(new THREE.TorusGeometry(0.2, 0.06, 8, 20), nhua(0xffa81a), sx * 0.26, yD + 0.52, zD + 0.58, -0.5, 0, 0); them(new THREE.CircleGeometry(0.17, 18), phat(0.5, 1.7, 2.3), sx * 0.26, yD + 0.52, zD + 0.62, -0.5, 0, 0); }
  } else if (nvId === 'robo') {         // người máy trắng: mặt kính đen, mắt đèn xanh, ăng-ten đỏ, bu-lông xanh hai bên
    hop(1.0, 0.36, 0.2, nhua(0x10141e), 0, yD + 0.06, zD + R * 0.84); for (const sx of [-1, 1]) them(new THREE.SphereGeometry(0.11, 10, 8), phat(0.4, 3, 3.2), sx * 0.24, yD + 0.06, zD + R * 0.84 + 0.11);
    them(new THREE.CylinderGeometry(0.04, 0.04, 0.5, 6), kimLoai(0xd8dce6), 0, yD + 0.9, zD); them(new THREE.SphereGeometry(0.12, 10, 8), phat(3, 0.6, 0.4), 0, yD + 1.18, zD);
    for (const sx of [-1, 1]) them(new THREE.CylinderGeometry(0.16, 0.16, 0.2, 12), kimLoai(0xff8a2a), sx * 0.8, yD, zD, 0, 0, Math.PI / 2); hop(0.3, 0.05, 0.05, phat(0.4, 3, 3.2), 0, yD - 0.3, zD + 0.68);
  } else if (nvId === 'fox') {         // cáo: tai nhọn lòng trắng, mõm trắng, mắt đen to, đuôi mắt cười
    tai(0.24, 0.55, 0.44, 0.66, 0xff7a2a, 0xffffff); mom(0xffffff, 1.3, -0.24); mui(-0.14, 0.86); mat(0xffffff, 0x2a1a0a); cuoi(-0.36, 0.78);
  } else if (nvId === 'ninja') {         // cậu bé ninja: mũ trùm đen bịt kín mặt chỉ hở mắt, băng đô kim loại, đuôi băng bay phía sau
    them(new THREE.SphereGeometry(R + 0.04, 24, 18), nhua(0x15151c), 0, yD, zD);
    const bd = them(new THREE.SphereGeometry(0.6, 20, 12), mDa, 0, yD + 0.1, zD + 0.26); bd.scale.set(1.0, 0.3, 0.8); mat(0xffffff, 0x15151c, 0.17);
    hop(0.55, 0.2, 0.07, kimLoai(0xc8ccd8), 0, yD + 0.44, zD + 0.64, -0.35); them(new THREE.SphereGeometry(0.06, 8, 6), nhua(0xff3a3a), 0, yD + 0.44, zD + 0.69);
    for (const sx of [-1, 1]) hop(0.12, 0.06, 0.62, nhua(0x2a2a8a), sx * 0.16, yD + 0.36, zD - 0.98, 0.5, 0, sx * 0.3);
  } else if (nvId === 'panda') {         // gấu trúc: tai đen tròn, mảng đen quanh mắt, kính đua trên trán
    for (const sx of [-1, 1]) them(new THREE.SphereGeometry(0.24, 14, 10), den, sx * 0.5, yD + 0.56, zD - 0.05);
    for (const sx of [-1, 1]) { const v = them(new THREE.SphereGeometry(0.25, 14, 10), den, sx * 0.28, yD + 0.05, zD + R * 0.72, 0, 0, sx * 0.5); v.scale.set(1, 1.3, 0.55); }
    mat(0xffffff, 0x15151c, 0.17); mom(0xffffff, 1.2, -0.24); mui(-0.12, 0.84); cuoi(-0.36, 0.74);
    them(new THREE.TorusGeometry(R * 0.99, 0.06, 8, 28), nhua(0x2a9a4a), 0, yD + 0.4, zD, Math.PI / 2 - 0.2, 0, 0); for (const sx of [-1, 1]) them(new THREE.SphereGeometry(0.15, 12, 8), phat(0.4, 2.2, 3), sx * 0.22, yD + 0.52, zD + 0.6);
  } else if (nvId === 'tiger') {         // hổ vằn: tai tròn, vằn đen trên trán và má, mắt xanh lá
    for (const sx of [-1, 1]) { them(new THREE.SphereGeometry(0.22, 12, 10), mDa, sx * 0.5, yD + 0.56, zD - 0.05); them(new THREE.SphereGeometry(0.11, 10, 8), trang, sx * 0.5, yD + 0.56, zD + 0.08); }
    for (const i of [-1, 0, 1]) { const v = hop(0.07, 0.32, 0.05, den, i * 0.17, yD + 0.52, zD + 0.52, -0.75, 0, i * 0.25); v.castShadow = false; }
    for (const sx of [-1, 1]) for (const j of [0, 1]) { const v = hop(0.28, 0.05, 0.05, den, sx * 0.62, yD + 0.02 - j * 0.14, zD + 0.36, 0, -sx * 0.9, sx * 0.25); v.castShadow = false; }
    mom(0xffffff, 1.35, -0.22); them(new THREE.SphereGeometry(0.09, 10, 8), nhua(0xff7a9a), 0, yD - 0.12, zD + 0.86); mat(0xffffff, 0x2a8a3a); cuoi(-0.36, 0.74);
  } else if (nvId === 'cosmo') {         // phi hành gia nhí: mũ bảo hiểm trắng với kính chắn tối, ăng-ten đỏ, vòng cổ bạc
    const vz = kimLoai(0x1a2a6a); const v = them(new THREE.SphereGeometry(0.58, 22, 16), vz, 0, yD + 0.03, zD + 0.3); v.scale.set(1.08, 0.88, 0.85);
    for (const sx of [-1, 1]) { const e = them(new THREE.SphereGeometry(0.09, 10, 8), phat(0.4, 2.2, 3.2), sx * 0.24, yD + 0.06, zD + 0.76); e.scale.z = 0.5; }
    them(new THREE.TorusGeometry(0.13, 0.03, 6, 12, Math.PI), phat(0.4, 2.2, 3.2), 0, yD - 0.1, zD + 0.8, 0, 0, Math.PI); them(new THREE.SphereGeometry(0.06, 8, 6), trang, -0.3, yD + 0.28, zD + 0.78);
    for (const sx of [-1, 1]) them(new THREE.CylinderGeometry(0.18, 0.18, 0.22, 14), nhua(0x2a7aff), sx * (R + 0.02), yD, zD, 0, 0, Math.PI / 2);
    them(new THREE.CylinderGeometry(0.04, 0.04, 0.38, 6), kimLoai(0xd8dce6), 0.38, yD + 0.82, zD); them(new THREE.SphereGeometry(0.09, 10, 8), phat(3, 0.5, 0.4), 0.38, yD + 1.04, zD); them(new THREE.TorusGeometry(0.64, 0.09, 8, 24), kimLoai(0xd8dce6), 0, yD - 0.62, zD, Math.PI / 2, 0, 0);
  } else if (nvId === 'captain') {         // thuyền trưởng hải tặc: mũ ba góc đen có đầu lâu, râu và ria nâu, ánh mắt tinh quái
    sau(0x5a3a1a, 0.9); mai(0x5a3a1a, 5); mat3(0x3a2a1a);
    const rau = them(new THREE.SphereGeometry(0.5, 16, 12), nhua(0x5a3a1a), 0, yD - 0.5, zD + 0.3); rau.scale.set(1.15, 0.85, 0.95);
    for (const sx of [-1, 1]) { const r = them(new THREE.SphereGeometry(0.13, 10, 8), nhua(0x5a3a1a), sx * 0.15, yD - 0.19, zD + 0.8, 0, 0, -sx * 0.3); r.scale.set(1.7, 0.6, 0.8); }
    them(new THREE.CylinderGeometry(0.92, 0.98, 0.1, 24), nhua(0x15151c), 0, yD + 0.6, zD - 0.02); them(new THREE.CylinderGeometry(0.5, 0.66, 0.45, 20), nhua(0x15151c), 0, yD + 0.86, zD - 0.02); them(new THREE.TorusGeometry(0.64, 0.04, 6, 24), sonXe(0xffc83a), 0, yD + 0.68, zD - 0.02, Math.PI / 2, 0, 0);
    them(new THREE.SphereGeometry(0.1, 10, 8), trang, 0, yD + 0.9, zD + 0.64); hop(0.3, 0.05, 0.04, trang, 0, yD + 0.72, zD + 0.68, 0, 0, 0.5); hop(0.3, 0.05, 0.04, trang, 0, yD + 0.72, zD + 0.68, 0, 0, -0.5);
  } else if (nvId === 'dino') {         // khủng long xanh: mõm dài có hàm răng, mắt vàng, gờ lông mày, hàng gai cam sau gáy
    const sn = them(new THREE.SphereGeometry(0.42, 16, 12), nhua(0x7ae07a), 0, yD - 0.1, zD + 0.7); sn.scale.set(0.95, 0.6, 1.9); const hm = them(new THREE.SphereGeometry(0.36, 14, 10), nhua(0x5ad05a), 0, yD - 0.4, zD + 0.68); hm.scale.set(0.9, 0.34, 1.7); const mg = them(new THREE.SphereGeometry(0.3, 12, 8), nhua(0x5a1a2a), 0, yD - 0.3, zD + 0.7); mg.scale.set(0.95, 0.12, 1.75);
    for (const sx of [-1, 1]) {
      them(new THREE.SphereGeometry(0.05, 6, 4), den, sx * 0.13, yD - 0.03, zD + 1.38); const e = them(new THREE.SphereGeometry(0.17, 12, 10), nhua(0xffe14a), sx * 0.4, yD + 0.25, zD + 0.5); e.scale.z = 0.7; hop(0.04, 0.2, 0.04, den, sx * 0.4, yD + 0.25, zD + 0.64);
      const b = them(new THREE.SphereGeometry(0.17, 10, 8), mDa, sx * 0.4, yD + 0.44, zD + 0.5); b.scale.set(1, 0.6, 1); const m = them(new THREE.SphereGeometry(0.1, 10, 8), nhua(0xff9a9a), sx * 0.5, yD - 0.16, zD + 0.5); m.scale.z = 0.4; m.castShadow = false;
    }
    for (let i = -3; i <= 3; i++) { them(new THREE.ConeGeometry(0.05, 0.15, 4), trang, i * 0.11, yD - 0.27, zD + 1.12 - Math.abs(i) * 0.08, Math.PI, 0, 0); them(new THREE.ConeGeometry(0.04, 0.11, 4), trang, i * 0.1, yD - 0.34, zD + 1.08 - Math.abs(i) * 0.08, 0, 0, 0); }
    for (let i = 0; i < 5; i++) them(new THREE.ConeGeometry(0.11, 0.32, 6), nhua(0xff8a2a), 0, yD + 0.68 - i * 0.12, zD + 0.25 - i * 0.28, -0.4, 0, 0);
  } else if (nvId === 'bunny') {         // thỏ bông: hai tai dài dựng đứng, má hồng, răng thỏ, nơ đỏ
    for (const sx of [-1, 1]) { const t = them(new THREE.SphereGeometry(0.2, 14, 10), mDa, sx * 0.26, yD + 1.08, zD - 0.05, 0, 0, -sx * 0.18); t.scale.set(1, 3.0, 0.7); const ti = them(new THREE.SphereGeometry(0.1, 10, 8), nhua(0xffa8d0), sx * 0.27, yD + 1.08, zD + 0.08, 0, 0, -sx * 0.18); ti.scale.set(1, 4.6, 0.5); ti.castShadow = false; }
    mom(0xffffff, 1.2, -0.22); them(new THREE.SphereGeometry(0.08, 10, 8), nhua(0xff6aa8), 0, yD - 0.12, zD + 0.86); mat(0xffffff, 0x8a2a5a); for (const sx of [-1, 1]) hop(0.08, 0.12, 0.04, trang, sx * 0.045, yD - 0.4, zD + 0.78);
    for (const sx of [-1, 1]) { const m = them(new THREE.SphereGeometry(0.1, 10, 8), nhua(0xff9ac8), sx * 0.46, yD - 0.14, zD + 0.55); m.scale.z = 0.4; m.castShadow = false; }
    for (const sx of [-1, 1]) them(new THREE.ConeGeometry(0.14, 0.26, 8), nhua(0xff3a5a), sx * 0.16, yD + 0.62, zD + 0.3, 0, 0, sx * Math.PI / 2);
  } else if (nvId === 'mimi') {         // cô bé tai mèo: tóc nâu ngắn, hai tai mèo hồng, cỏ ba lá may mắn
    sau(0x6a3a2a, 1.05); toc(0x6a3a2a); mai(0x6a3a2a, 7); canh(0x6a3a2a, 0.62, -0.25); mat3(0x3a8a4a);
    for (const sx of [-1, 1]) { const t = them(new THREE.ConeGeometry(0.21, 0.42, 4), nhua(0xff7ab8), sx * 0.42, yD + 0.82, zD - 0.02, 0, Math.PI / 4, -sx * 0.3); t.scale.z = 0.6; const ti = them(new THREE.ConeGeometry(0.11, 0.26, 4), nhua(0xffc8e0), sx * 0.42, yD + 0.8, zD + 0.06, 0, Math.PI / 4, -sx * 0.3); ti.scale.z = 0.5; ti.castShadow = false; }
    for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2; them(new THREE.SphereGeometry(0.06, 8, 6), nhua(0x3acb5a), 0.52 + Math.cos(a) * 0.07, yD + 0.5 + Math.sin(a) * 0.07, zD + 0.42); }
  } else if (nvId === 'bobo') {         // gấu nâu: tai tròn, mõm sáng, mắt đen to
    for (const sx of [-1, 1]) { them(new THREE.SphereGeometry(0.26, 14, 10), mDa, sx * 0.52, yD + 0.55, zD - 0.05); them(new THREE.SphereGeometry(0.14, 10, 8), nhua(0xffc8a0), sx * 0.52, yD + 0.55, zD + 0.08); }
    mom(0xf0d0a8, 1.2, -0.2); mui(-0.1, 0.86); mat(0xffffff, 0x15151c); cuoi(-0.36, 0.72);
  } else if (nvId === 'ducky') {         // vịt vàng: mỏ dẹt cam rộng, chỏm lông trên đầu
    const mo = them(new THREE.SphereGeometry(0.3, 16, 10), nhua(0xff9a2a), 0, yD - 0.12, zD + 0.78); mo.scale.set(1.15, 0.35, 0.95);
    mat(0xffffff, 0x15151c, 0.2);
    for (let i = -1; i <= 1; i++) them(new THREE.ConeGeometry(0.07, 0.3, 6), mDa, i * 0.1, yD + 0.8, zD + 0.05, -0.2, 0, -i * 0.4);
  } else if (nvId === 'rainbow') {         // kỳ lân: sừng vàng xoắn, bờm cầu vồng, tai nhọn, mắt tím
    them(new THREE.ConeGeometry(0.12, 0.7, 12), sonXe(0xffd23a), 0, yD + 0.85, zD + 0.35, 0.5, 0, 0);
    for (let i = 0; i < 3; i++) { const t = -0.2 + i * 0.15; them(new THREE.TorusGeometry(0.1 - i * 0.025, 0.018, 6, 14), sonXe(0xffe9a0), 0, yD + 0.85 + t * 0.88, zD + 0.35 + t * 0.48, -(Math.PI / 2 - 0.5), 0, 0); }
    const cv = [0xff3a3a, 0xff9a2a, 0xffe14a, 0x3acb5a, 0x3a8aff, 0xa05aff];
    for (let i = 0; i < 6; i++) { const a = 0.5 + i * 0.36; them(new THREE.SphereGeometry(0.19, 10, 8), nhua(cv[i]), (i % 2 ? 0.08 : -0.08), yD + Math.cos(a) * 0.8, zD - Math.sin(a) * 0.8); }
    tai(0.13, 0.32, 0.4, 0.62, 0xffffff, 0xffb8e0, 0.3); mat(0xffffff, 0x8a3ad8, 0.2); cuoi(-0.36, 0.72);
    for (const sx of [-1, 1]) { const m = them(new THREE.SphereGeometry(0.1, 10, 8), nhua(0xff9ad0), sx * 0.46, yD - 0.14, zD + 0.55); m.scale.z = 0.4; m.castShadow = false; }
  } else if (nvId === 'monkey') {         // khỉ: mặt sáng, tai tròn hai bên, mắt to
    const m = them(new THREE.SphereGeometry(0.55, 18, 14), nhua(0xf0c8a0), 0, yD - 0.05, zD + 0.28); m.scale.set(1.05, 0.9, 0.75);
    for (const sx of [-1, 1]) { them(new THREE.SphereGeometry(0.24, 12, 10), mDa, sx * 0.76, yD + 0.08, zD - 0.05); them(new THREE.SphereGeometry(0.14, 10, 8), nhua(0xf0c8a0), sx * 0.8, yD + 0.08, zD + 0.06); them(new THREE.SphereGeometry(0.03, 6, 4), den, sx * 0.05, yD - 0.12, zD + 0.82); }
    mat(0xffffff, 0x2a1a0a, 0.18); cuoi(-0.32, 0.76);
  } else if (nvId === 'kinggold') {         // vị vua râu trắng: vương miện vàng có ngọc đỏ, râu và ria trắng, tóc bạc hai bên
    mat3(0x3a6ac8); for (const sx of [-1, 1]) { them(new THREE.SphereGeometry(0.27, 12, 10), nhua(0xf4f4f4), sx * 0.62, yD - 0.02, zD - 0.05); const b = hop(0.2, 0.05, 0.06, nhua(0xf4f4f4), sx * 0.26, yD + 0.26, zD + 0.68, 0, 0, sx * 0.25); b.castShadow = false; }
    const rau = them(new THREE.SphereGeometry(0.5, 16, 12), nhua(0xf4f4f4), 0, yD - 0.62, zD + 0.2); rau.scale.set(1.1, 0.9, 0.9);
    for (const sx of [-1, 1]) { const r = them(new THREE.SphereGeometry(0.13, 10, 8), nhua(0xf4f4f4), sx * 0.15, yD - 0.17, zD + 0.8, 0, 0, -sx * 0.35); r.scale.set(1.7, 0.6, 0.8); }
    const vang = sonXe(0xffc83a); them(new THREE.CylinderGeometry(0.5, 0.54, 0.24, 18), vang, 0, yD + 0.8, zD); for (let i = 0; i < 5; i++) { const a = i / 5 * 6.283; them(new THREE.ConeGeometry(0.1, 0.34, 6), vang, Math.cos(a) * 0.46, yD + 1.09, zD + Math.sin(a) * 0.46); }
    them(new THREE.SphereGeometry(0.09, 10, 8), phat(3, 0.3, 0.3), 0, yD + 0.82, zD + 0.52);
  } else if (nvId === 'icequeen') {         // nữ hoàng băng giá: tóc xanh băng dài, hai bím rủ, vương miện bạc có ngọc xanh
    sau(0x6ad0ff, 1.15); toc(0x6ad0ff); mai(0x6ad0ff, 7); mat3(0x2a8ad8);
    for (const sx of [-1, 1]) for (let i = 0; i < 3; i++) them(new THREE.SphereGeometry(0.2 - i * 0.04, 10, 8), nhua(0x6ad0ff), sx * 0.7, yD - 0.15 - i * 0.28, zD - 0.1);
    them(new THREE.TorusGeometry(0.55, 0.045, 8, 20, Math.PI), kimLoai(0xdde8ff), 0, yD + 0.5, zD, Math.PI / 2, 0, 0); for (const sx of [-1, 0, 1]) them(new THREE.ConeGeometry(0.08, sx ? 0.2 : 0.32, 4), kimLoai(0xdde8ff), sx * 0.28, yD + 0.6, zD + 0.46 - Math.abs(sx) * 0.06);
    them(new THREE.OctahedronGeometry(0.09), phat(0.5, 2, 3), 0, yD + 0.58, zD + 0.6);
  } else if (nvId === 'dragon') {         // rồng lửa con: hai sừng, gai vàng trên đầu, mõm dài đỏ cam
    for (const sx of [-1, 1]) them(new THREE.ConeGeometry(0.1, 0.5, 8), nhua(0xfff2d8), sx * 0.3, yD + 0.78, zD - 0.25, -0.7, 0, -sx * 0.2);
    for (let i = 0; i < 5; i++) { const z = 0.3 - i * 0.28; them(new THREE.ConeGeometry(0.09, 0.28, 6), nhua(0xffd23a), 0, yD + Math.sqrt(Math.max(0.05, R * R - z * z)) + 0.08, zD + z, -0.3, 0, 0); }
    const mm = mom(0xffb84a, 1.2, -0.22); mm.scale.set(1.1, 0.8, 1.35); for (const sx of [-1, 1]) { them(new THREE.SphereGeometry(0.04, 6, 4), nhua(0x7a1a1a), sx * 0.1, yD - 0.1, zD + 1.0); them(new THREE.ConeGeometry(0.035, 0.1, 6), trang, sx * 0.14, yD - 0.36, zD + 0.82, Math.PI, 0, 0); }
    mat(0xffe14a, 0x15151c, 0.19); cuoi(-0.32, 0.86);
  } else if (nvId === 'shadow') {         // cậu bé bóng đêm: da nhợt nhạt, tóc đen rối xõa che mắt, mắt tím phát sáng, răng nanh
    sau(0x1a0a2a, 1.08); toc(0x1a0a2a); gai(0x1a0a2a, 6, 0.5, 0.95); mai(0x1a0a2a, 4); mat(0xffffff, 0xc05aff, 0.2); cuoi(-0.3, 0.72);
    for (const sx of [-1, 1]) { them(new THREE.SphereGeometry(0.06, 8, 6), phat(2.4, 0.5, 3.2), sx * 0.27, yD + 0.08, zD + R * 0.92); them(new THREE.ConeGeometry(0.04, 0.13, 6), trang, sx * 0.1, yD - 0.37, zD + 0.7, Math.PI, 0, 0); }
    hop(0.12, 0.32, 0.06, nhua(0x1a0a2a), 0.34, yD + 0.18, zD + 0.68, 0, 0, -0.2);
  } else if (nvId === 'alien') {         // người ngoài hành tinh: đầu xanh lá to, mắt đen to xếch, hai ăng-ten phát sáng
    dau.scale.set(1, 1.1, 1);
    for (const sx of [-1, 1]) { const e = them(new THREE.SphereGeometry(0.24, 16, 12), nhua(0x0a0a14), sx * 0.3, yD + 0.02, zD + 0.6, 0, 0, -sx * 0.45); e.scale.set(0.9, 1.45, 0.5); them(new THREE.SphereGeometry(0.05, 6, 4), trang, sx * 0.3 + 0.07, yD + 0.12, zD + 0.74); them(new THREE.SphereGeometry(0.025, 6, 4), den, sx * 0.05, yD - 0.25, zD + 0.78); }
    cuoi(-0.4, 0.68); for (const sx of [-1, 1]) { them(new THREE.CylinderGeometry(0.03, 0.03, 0.4, 6), mDa, sx * 0.25, yD + 0.95, zD, 0, 0, -sx * 0.25); them(new THREE.SphereGeometry(0.1, 10, 8), phat(3, 2.4, 0.4), sx * 0.34, yD + 1.17, zD); }
  } else if (nvId === 'cyber') {         // chiến binh mạng: tóc xanh dương chải ngược, kính ngắm xanh phát sáng, tai nghe bạc
    sau(0x2a8aff, 1.0); toc(0x2a8aff); gai(0x2a8aff, 7, 0.55, 1.0); mat(0xffffff, 0x1a2a6a, 0.2); cuoi(-0.3, 0.72);
    const kinh = new THREE.MeshStandardMaterial({ color: 0x3af0ff, emissive: 0x1a6aff, emissiveIntensity: 0.9, transparent: true, opacity: 0.5, roughness: 0.1, side: THREE.DoubleSide }); them(new THREE.SphereGeometry(R + 0.07, 28, 6, Math.PI * 0.5 - 0.95, 1.9, Math.PI / 2 - 0.22, 0.46), kinh, 0, yD, zD).castShadow = false;
    for (const sx of [-1, 1]) { const c = them(new THREE.SphereGeometry(0.2, 12, 10), kimLoai(0xb8c0d0), sx * (R + 0.04), yD - 0.02, zD); c.scale.set(0.55, 1, 1); hop(0.05, 0.3, 0.05, phat(0.4, 2, 3), sx * 0.34, yD + 0.8, zD + 0.06, 0.5, 0, -sx * 0.5); }
  } else if (nvId === 'chef') {         // đầu bếp nhí: mũ đầu bếp trắng phồng cao, khăn đỏ quanh cổ
    sau(0x6a3a1a, 0.9); mai(0x6a3a1a, 5); mat3(0x4a2a1a);
    const trangB = nhua(0xffffff); them(new THREE.CylinderGeometry(0.5, 0.54, 0.16, 20), trangB, 0, yD + 0.6, zD); them(new THREE.CylinderGeometry(0.6, 0.5, 0.36, 20), trangB, 0, yD + 0.86, zD);
    for (let i = 0; i < 6; i++) { const a = i / 6 * 6.283; them(new THREE.SphereGeometry(0.3, 12, 10), trangB, Math.cos(a) * 0.4, yD + 1.18, zD + Math.sin(a) * 0.4); } them(new THREE.SphereGeometry(0.34, 12, 10), trangB, 0, yD + 1.3, zD);
    them(new THREE.TorusGeometry(0.52, 0.09, 8, 24), nhua(0xe83a3a), 0, yD - 0.62, zD, Math.PI / 2, 0, 0);
  } else if (nvId === 'police') {         // chú cảnh sát: mũ cảnh sát xanh đậm có phù hiệu vàng, lưỡi trai đen
    sau(0x15151c, 0.9); mai(0x15151c, 3); mat3(0x2a2a3a);
    const xanhS = nhua(0x1a2a6a); them(new THREE.CylinderGeometry(0.62, 0.76, 0.42, 24), xanhS, 0, yD + 0.66, zD - 0.02); them(new THREE.CylinderGeometry(0.82, 0.7, 0.1, 24), xanhS, 0, yD + 0.9, zD - 0.02); them(new THREE.CylinderGeometry(0.77, 0.78, 0.09, 24), sonXe(0xffc83a), 0, yD + 0.56, zD - 0.02);
    hop(0.92, 0.05, 0.5, nhua(0x0a0a10), 0, yD + 0.5, zD + 0.8, 0.25); them(new THREE.SphereGeometry(0.1, 10, 8), sonXe(0xffc83a), 0, yD + 0.74, zD + 0.68);
  } else if (nvId === 'builder') {         // anh thợ xây: mũ bảo hộ vàng có sống mũ, đèn nhỏ phía trước
    sau(0x6a3a1a, 0.9); mai(0x6a3a1a, 3); mat3(0x4a2a1a);
    const vangB = sonXe(0xffc83a); them(new THREE.SphereGeometry(R + 0.08, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2.2), vangB, 0, yD + 0.16, zD); hop(0.98, 0.07, 0.55, vangB, 0, yD + 0.32, zD + 0.6, 0.12); hop(0.14, 0.1, 1.25, vangB, 0, yD + 0.9, zD - 0.02);
    them(new THREE.CylinderGeometry(0.1, 0.1, 0.08, 12), phat(2.4, 2.4, 2.0), 0, yD + 0.62, zD + 0.72, Math.PI / 2, 0, 0);
  } else if (nvId === 'magic') {         // cô phù thủy nhỏ: mũ phù thủy tím có dải vàng và ngôi sao, tóc dài tím than
    sau(0x4a1a5a, 1.15); mai(0x4a1a5a, 5); canh(0x4a1a5a, 0.65, -0.4); mat3(0xa05aff);
    them(new THREE.CylinderGeometry(1.0, 1.0, 0.07, 28), nhua(0x6a22c0), 0, yD + 0.52, zD); them(new THREE.ConeGeometry(0.56, 1.15, 20), nhua(0x7a2ad8), 0, yD + 1.1, zD - 0.05, -0.18, 0, 0);
    them(new THREE.CylinderGeometry(0.58, 0.62, 0.14, 20), sonXe(0xffc83a), 0, yD + 0.64, zD - 0.01); them(new THREE.OctahedronGeometry(0.13), phat(3, 2.4, 0.4), 0, yD + 0.66, zD + 0.62); them(new THREE.SphereGeometry(0.12, 10, 8), nhua(0x7a2ad8), 0, yD + 1.66, zD - 0.17);
  } else if (nvId === 'shark') {         // cá mập nhỏ: vây lưng trên đầu, bụng trắng, hàm răng tam giác, kính lặn
    const v = them(new THREE.ConeGeometry(0.34, 0.8, 4), mDa, 0, yD + 0.9, zD - 0.2, -0.45, Math.PI / 4, 0); v.scale.set(0.35, 1, 1);
    mom(0xffffff, 1.6, -0.3); mat(0xffffff, 0x15151c, 0.18);
    for (let i = -3; i <= 3; i++) them(new THREE.ConeGeometry(0.04, 0.1, 4), trang, i * 0.07, yD - 0.38, zD + 0.83 - Math.abs(i) * 0.015, Math.PI, 0, 0);
    hop(0.04, 0.02, 0.4, nhua(0x15151c), 0, yD - 0.34, zD + 0.74); for (const sx of [-1, 1]) { const g = them(new THREE.ConeGeometry(0.12, 0.3, 4), mDa, sx * 0.76, yD - 0.1, zD, 0, 0, -sx * 1.4); g.scale.z = 0.3; }
    them(new THREE.TorusGeometry(R * 0.99, 0.05, 8, 28), nhua(0xffd23a), 0, yD + 0.12, zD, Math.PI / 2 - 0.05, 0, 0);
  } else if (nvId === 'skelly') {         // bộ xương vui tính: sọ trắng, hốc mắt đen có đốm sáng, mũi trống, hàm răng cười
    for (const sx of [-1, 1]) { const s = them(new THREE.SphereGeometry(0.22, 14, 10), den, sx * 0.27, yD + 0.1, zD + 0.62); s.scale.set(1, 1.15, 0.5); them(new THREE.SphereGeometry(0.06, 8, 6), phat(0.4, 2, 2.4), sx * 0.27, yD + 0.1, zD + 0.72); them(new THREE.SphereGeometry(0.04, 6, 4), den, sx * 0.05, yD - 0.12, zD + 0.8); them(new THREE.SphereGeometry(0.16, 10, 8), mDa, sx * 0.5, yD - 0.14, zD + 0.45); }
    hop(0.64, 0.2, 0.08, den, 0, yD - 0.38, zD + 0.68); for (let i = -3; i <= 3; i++) hop(0.075, 0.17, 0.05, trang, i * 0.085, yD - 0.38, zD + 0.73);
    hop(0.05, 0.3, 0.04, den, 0.22, yD + 0.5, zD + 0.55, 0.5, 0, 0.3);
  } else if (nvId === 'bangvuong') {         // vua chim cánh cụt: mặt trắng, mỏ cam, vương miện băng
    const m = them(new THREE.SphereGeometry(0.58, 18, 14), trang, 0, yD - 0.08, zD + 0.22); m.scale.set(1.05, 1, 0.9); mat(0xffffff, 0x15151c, 0.18);
    them(new THREE.ConeGeometry(0.16, 0.42, 10), nhua(0xff9a2a), 0, yD - 0.2, zD + 0.84, Math.PI / 2, 0, 0);
    const mv = phat(0.8, 2.6, 3.2); them(new THREE.CylinderGeometry(0.56, 0.56, 0.2, 16), mv, 0, yD + 0.7, zD); for (let i = 0; i < 6; i++) { const a = i / 6 * 6.283; them(new THREE.ConeGeometry(0.11, 0.45, 6), mv, Math.cos(a) * 0.47, yD + 0.98, zD + Math.sin(a) * 0.47); }
  } else if (nvId === 'vuatocdo') {         // vua sư tử vàng: bờm tròn quanh mặt, tai tròn, vương miện vàng
    for (let i = 0; i < 14; i++) { const a = i / 14 * 6.283; them(new THREE.SphereGeometry(0.3, 10, 8), nhua(0xd86a1a), Math.cos(a) * 0.78, yD + Math.sin(a) * 0.78, zD - 0.12); }
    mom(0xffe2a8, 1.3, -0.22); mui(-0.12, 0.84); mat(0xffffff, 0x3a1a0a); cuoi(-0.36, 0.76);
    const mv = phat(3.2, 2.4, 0.4); them(new THREE.CylinderGeometry(0.5, 0.5, 0.2, 16), mv, 0, yD + 0.74, zD); for (let i = 0; i < 6; i++) { const a = i / 6 * 6.283; them(new THREE.ConeGeometry(0.11, 0.45, 6), mv, Math.cos(a) * 0.42, yD + 1.0, zD + Math.sin(a) * 0.42); }
  } else { mat(0xffffff, 0x15151c); cuoi(-0.24, 0.66); them(new THREE.SphereGeometry(R + 0.05, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2.1), sonXe(0x2e3a5a), 0, yD + 0.12, zD); }
}
function nhomDau(g, y, z, tl) {            // nhóm chứa đầu nhân vật: dựng quanh gốc rồi phóng to (đầu to dễ thương)
  const hg = new THREE.Group(); hg.position.set(0, y, z); hg.scale.setScalar(tl); g.add(hg);
  const them = (geo, mat, px, py, pz, rx, ry, rz) => { const m = new THREE.Mesh(geo, mat); m.position.set(px, py, pz); m.rotation.set(rx || 0, ry || 0, rz || 0); m.castShadow = true; hg.add(m); return m; };
  return { them, hop: (w, h, d, mat, px, py, pz, rx, ry, rz) => them(new THREE.BoxGeometry(w, h, d), mat, px, py, pz, rx, ry, rz) };
}
function taoTayDua(g, nvId, mauAo, yN, them, hop) {   // người lái ngồi trong xe: thân, hai tay cầm lái, đầu to
  const mAo = nhua(mauAo), trang = nhua(0xffffff);
  them(new THREE.CylinderGeometry(0.4, 0.46, 0.8, 14), mAo, 0, 1.2 + yN, -0.4);
  for (const sx of [-1, 1]) { const tay = them(new THREE.CylinderGeometry(0.12, 0.12, 0.75, 8), mAo, sx * 0.34, 1.32 + yN, -0.05, 1.1, 0, -sx * 0.35); tay.castShadow = false; them(new THREE.SphereGeometry(0.15, 8, 6), trang, sx * 0.27, 1.25 + yN, 0.3); }
  const hg = nhomDau(g, 2.2 + yN, -0.35, 1.22); dauChibi(nvId, 0, 0, hg.them, hg.hop);
}
function taoNguoiDung(nvId, mauAo) {           // nhân vật đứng (trên bục vinh quang): chân, giày, áo đua, hai tay giơ cao
  const g = new THREE.Group(), them = (geo, mat, px, py, pz, rx, ry, rz) => { const m = new THREE.Mesh(geo, mat); m.position.set(px, py, pz); m.rotation.set(rx || 0, ry || 0, rz || 0); m.castShadow = true; g.add(m); return m; };
  const hop = (w, h, d, mat, px, py, pz, rx, ry, rz) => them(new THREE.BoxGeometry(w, h, d), mat, px, py, pz, rx, ry, rz);
  const mAo = sonXe(mauAo), quan = nhua(0x22283a), giay = nhua(0xffffff), gang = nhua(0xffffff);
  for (const sx of [-1, 1]) { them(new THREE.CylinderGeometry(0.17, 0.19, 0.75, 10), quan, sx * 0.22, 0.45, 0); const gi = them(new THREE.SphereGeometry(0.24, 12, 8), giay, sx * 0.22, 0.1, 0.08); gi.scale.set(1, 0.6, 1.4); }
  them(new THREE.CylinderGeometry(0.42, 0.5, 0.95, 16), mAo, 0, 1.25, 0); hop(0.5, 0.08, 0.04, nhua(0xffffff), 0, 1.4, 0.45);
  const tay = []; for (const sx of [-1, 1]) { const vai = new THREE.Group(); vai.position.set(sx * 0.48, 1.6, 0); g.add(vai); const t = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.13, 1.0, 8), mAo); t.position.y = 0.48; vai.add(t); const n = new THREE.Mesh(new THREE.SphereGeometry(0.19, 10, 8), gang); n.position.y = 1.02; vai.add(n); vai.rotation.z = -sx * 0.55; tay.push(vai); }
  { const hg = nhomDau(g, 2.52, 0, 1.22); dauChibi(nvId, 0, 0, hg.them, hg.hop); }
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
