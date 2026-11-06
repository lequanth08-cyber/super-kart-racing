// ===================== HỘP QUÀ BÍ ẨN CẦU VỒNG VÀ KỸ NĂNG LÀM CHẬM ĐỐI THỦ =====================
// Chạy qua hộp cầu vồng → nhận 1 kỹ năng (người đi sau thường nhận kỹ năng mạnh hơn để cuộc đua sát nút).
// Bấm E (hoặc nút KỸ NĂNG) để dùng. Máy cũng tự nhặt và tự dùng. Bị trúng chiêu thì xe chậm lại và xoay tròn một vòng.
const KY_NANG = {
  mat:   { ten: 'Vũng Mật Ong', icon: '🍯', mt: 'Thả vũng mật dính sau xe; ai chạy vào sẽ bị chậm 1,6 giây' },
  loc:   { ten: 'Lốc Xoáy',     icon: '🌀', mt: 'Bắn lốc xoáy đuổi theo xe ngay phía trước, trúng là chậm hẳn 1,4 giây' },
  sam:   { ten: 'Sấm Cầu Vồng', icon: '⚡', mt: 'Sét đánh mọi đối thủ đang chạy trước bạn, chậm 2 giây' },
  khien: { ten: 'Khiên Bong Bóng', icon: '🛡️', mt: 'Bong bóng che chắn 10 giây, đỡ được một lần trúng chiêu' }
};
const BAY = [];                          // vũng mật và lốc xoáy đang ở trên đường
const HOP_HOI = 4;                       // hộp quà mọc lại sau 4 giây
function chonKyNang(k) {                 // người dẫn đầu nhận chiêu phòng thủ, người đi sau nhận chiêu mạnh
  const n = XE_DUA.length, vt = n > 1 ? (k.hang - 1) / (n - 1) : 0, r = Math.random();
  const bang = vt < 0.2 ? [['mat', 0.55], ['khien', 0.35], ['loc', 0.1]] : vt < 0.65 ? [['loc', 0.45], ['mat', 0.3], ['khien', 0.2], ['sam', 0.05]] : [['loc', 0.45], ['sam', 0.3], ['mat', 0.15], ['khien', 0.1]];
  let c = 0; for (const [id, w] of bang) { c += w; if (r < c) return id; } return 'mat';
}
function nhatHop(k) {                    // gọi khi xe chạm hộp
  if (k.kyNang) return; k.kyNang = chonKyNang(k); k.kyCho = ngauNhien(0.8, 3.5);
  if (suKien) suKien('hop', k, 0);
}
function trungChieu(j, giay, he, tu) {   // xe j bị làm chậm (có khiên thì khiên vỡ thay)
  if (j.xong) return false;
  if (j.khienT > 0) { j.khienT = 0; if (suKien) suKien('khienVo', j, 0); return false; }
  j.chamT = Math.max(j.chamT, giay); j.chamHe = he; j.xoayT = 0.9; j.dk.nitro = false; if (j.drift) { j.drift = false; j.driftMoc = 0; }
  if (suKien) suKien('trung', j, tu); return true;
}
function dungKyNang(k) {
  const id = k.kyNang; if (!id || !CUOC.chay || k.xong) return; k.kyNang = null;
  if (id === 'mat') { const c = Math.cos(k.yaw), s = Math.sin(k.yaw); BAY.push({ loai: 'mat', chu: k, x: k.x - s * 4, z: k.z - c * 4, h: k.y, song: 25, mesh: null }); }
  else if (id === 'loc') { let muc = null, kc = 1e9; for (const j of XE_DUA) { const d = j.tot - k.tot; if (j !== k && !j.xong && d > 0 && d < 450 && d < kc) { kc = d; muc = j; } } BAY.push({ loai: 'loc', chu: k, muc, tot: k.tot + 3, d: k.d, v: Math.max(70, k.vf + 30), song: 9, mesh: null }); }
  else if (id === 'sam') { let n = 0; for (const j of XE_DUA) if (j !== k && j.tot > k.tot && trungChieu(j, 2.0, 0.6, 'sam')) n++; if (suKien) suKien('sam2', k, n); }
  else if (id === 'khien') k.khienT = 10;
  if (suKien) suKien('dung', k, id);
}
const _vp = { x: 0, z: 0, h: 0, tx: 0, tz: 0, nx: 0, nz: 0, k: 0 };
let matMatOng = null, matLocXoay = null, geoMat = null, geoLoc = null;
function capNhatKyNang(dt) {             // máy tự dùng kỹ năng; vũng mật và lốc xoáy bay, chạm xe thì làm chậm
  for (const k of XE_DUA) {
    if (k.khienT > 0) k.khienT -= dt;
    if (k.kyNang && !k.nguoi && CUOC.chay) {
      k.kyCho -= dt; if (k.kyCho > 0) continue;
      const sau = XE_DUA.some(j => j !== k && k.tot - j.tot > 2 && k.tot - j.tot < 60), truoc = XE_DUA.some(j => j !== k && j.tot - k.tot > 2 && j.tot - k.tot < 400);
      if ((k.kyNang === 'mat' && sau) || (k.kyNang === 'loc' && truoc) || (k.kyNang === 'khien' && sau) || k.kyNang === 'sam' || k.kyCho < -6) dungKyNang(k);
    }
  }
  for (let i = BAY.length - 1; i >= 0; i--) {
    const b = BAY[i]; b.song -= dt; let xoa = b.song <= 0;
    if (b.loai === 'mat') {
      for (const j of XE_DUA) { if (j === b.chu && b.song > 23.5) continue; if (!j.bay && Math.hypot(j.x - b.x, j.z - b.z) < 3.4 && Math.abs(j.y - b.h) < 2) { trungChieu(j, 1.6, 0.5, 'mat'); xoa = true; break; } }
    } else {
      b.tot += b.v * dt; const s = quanhS(b.tot);
      if (b.muc && !b.muc.xong) { b.d += (b.muc.d - b.d) * Math.min(1, dt * 4); if (b.tot >= b.muc.tot - 1.5) { trungChieu(b.muc, 1.4, 0.4, 'loc'); xoa = true; } }
      diemTai(s, _vp); b.x = _vp.x + _vp.nx * b.d; b.z = _vp.z + _vp.nz * b.d; b.h = _vp.h;
    }
    if (xoa) { if (b.mesh) scene.remove(b.mesh); BAY.splice(i, 1); }
  }
}
function veKyNang(t) {                   // mô hình vũng mật (đĩa vàng bóng) và lốc xoáy (phễu cầu vồng xoay)
  if (!matMatOng) { matMatOng = new THREE.MeshStandardMaterial({ color: 0xffb21e, roughness: 0.15, metalness: 0.1, emissive: new THREE.Color(0.5, 0.3, 0) }); geoMat = new THREE.CircleGeometry(3, 24); geoMat.rotateX(-Math.PI / 2); matLocXoay = new THREE.MeshBasicMaterial({ map: HOP_TEX, color: new THREE.Color(1.6, 1.6, 1.6), transparent: true, opacity: 0.85, side: THREE.DoubleSide, depthWrite: false }); geoLoc = new THREE.ConeGeometry(2.2, 4.5, 16, 1, true); geoLoc.rotateX(Math.PI); }
  for (const b of BAY) {
    if (!b.mesh) { b.mesh = new THREE.Mesh(b.loai === 'mat' ? geoMat : geoLoc, b.loai === 'mat' ? matMatOng : matLocXoay); scene.add(b.mesh); }
    b.mesh.position.set(b.x, b.h + (b.loai === 'mat' ? 0.1 : 2.4), b.z); if (b.loai === 'loc') { b.mesh.rotation.y = t * 14; if (Math.random() < 0.5) hat(b.x, b.h + 1, b.z, ngauNhien(-3, 3), ngauNhien(1, 4), ngauNhien(-3, 3), [0xff5ad8, 0x3af0ff, 0xffe14a][Math.floor(Math.random() * 3)], 0.4, 0.8, 0.1, true, 1); }
  }
}
function xoaKyNang() { for (const b of BAY) if (b.mesh) scene.remove(b.mesh); BAY.length = 0; for (const h of HOP) { h.on = true; h.hoi = 0; } }
