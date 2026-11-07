// ===================== 30 KỸ NĂNG ĐỘC QUYỀN CỦA 30 NHÂN VẬT =====================
// Mỗi nhân vật có đúng một kỹ năng riêng (nv.ky): bấm Q (hoặc nút trên điện thoại), có hồi chiêu ky.cd giây. Máy tự dùng theo ky.dung.
// Trạng thái kéo dài lưu trên xe dưới dạng bộ đếm giây (TK_BUFF), vật lý đọc các bộ đếm này (d_vatly.js, d2_vatpham.js).
const TK_BUFF = ['bDrift', 'bNitMien', 'bMa', 'bPhanXa', 'bBam', 'bTuLai', 'bTrongLuc', 'bXu', 'bXuX', 'bSat', 'bMord'];
const benCua = (k) => (k.bTuLai > 0 || k.bBam > 0 || k.bSat > 0) ? 1 : k.ben;      // xe đang tự cân bằng / bám chặt / giáp sắt: va chạm không mất tốc
const TEN_TRUNG = { mat: '🍯 Dính mật ong!', loc: '🌀 Trúng lốc xoáy!', sam: '⚡ Bị sét đánh!', khoi: '💨 Dính bom khói!', cv: '🌈 Dính vệt cầu vồng!', chuoi: '🍌 Trượt vỏ chuối!', lua: '🔥 Bị lửa táp!', keo: '🍭 Dính kẹo!',
  dino: '🦖 Bị dậm chân!', bang: '❄️ Bị đóng băng!', ufo: '🛸 Bị đĩa bay nhấc!', coi: '🚨 Bị còi hú chặn!', cap: '🦈 Bị cá mập đớp!', xuong: '💀 Trúng khúc xương!', boss: '⚡ Bị sóng sấm!' };
const datBuff = (k, ten, giay) => { k[ten] = Math.max(k[ten] || 0, giay); };
const tangToc = (k, giay) => { k.xungT = Math.max(k.xungT, giay); };
function lucTien(k, dv) {                // thêm vận tốc về phía trước (không vượt trần)
  const v = Math.max(0, k.vf), moi = Math.min(V_TRAN, v + dv) - v, f = Math.sin(k.yaw), z = Math.cos(k.yaw); k.vx += f * moi; k.vz += z * moi; k.vf += moi;
}
function bung(k, mau, n, tam, cao) {     // chùm hạt màu quanh xe
  for (let i = 0; i < n; i++) hat(k.x, k.y + (cao || 1), k.z, ngauNhien(-tam, tam), ngauNhien(1, tam), ngauNhien(-tam, tam), Array.isArray(mau) ? mau[i % mau.length] : mau, 0.7, 1.0, 0.1, true, 1);
}
const xeTruoc = (k, tam) => XE_DUA.filter(j => j !== k && !j.xong && j.tot - k.tot > 1 && j.tot - k.tot < tam).sort((a, b) => a.tot - b.tot);    // xe phía trước trong tầm, gần nhất trước
const xeSau = (k, tam) => XE_DUA.filter(j => j !== k && !j.xong && k.tot - j.tot > 1 && k.tot - j.tot < tam);
function datBay(k, lui, d, o) {          // đặt một bẫy trên đường: lui > 0 phía sau xe, lui < 0 phía trước (mét); d: lệch ngang. Chủ bẫy không bao giờ dính
  const g = diemTai(k.s - lui, {});
  BAY.push(Object.assign({ loai: 'mat', chu: k, x: g.x + g.nx * d, z: g.z + g.nz * d, h: g.h, song: 22, mesh: null, chuMien: true, giay: 1.2, he: 0.5, mau: 0xffb21e, tu: 'mat' }, o || {}));
}
function nhayLen(k, vy) { k.vy = vy; k.y += 0.6; k.bay = true; k.tgBay = 0; k.xBay = k.x; k.zBay = k.z; k.drift = false; k.driftMoc = 0; }
function nhayTien(k, m) {                // vọt thẳng lên trước m mét dọc đường (cùng làn), giữ nguyên tốc độ
  const s0 = k.s, g = diemTai(s0 + m, {}), d = kep(k.d, -8, 8), yaw = Math.atan2(g.tx, g.tz), v = Math.max(25, k.vf);
  k.x = g.x + g.nx * d; k.z = g.z + g.nz * d; k.yaw = yaw; k.vx = Math.sin(yaw) * v; k.vz = Math.cos(yaw) * v; k.vf = v; k.vy = 0; k.bay = false; k.drift = false; k.driftMoc = 0;
  gan(k.x, k.z, -1, _gv); k.i = _gv.i; k.d = _gv.d; k.tx = _gv.tx; k.tz = _gv.tz;
  let dS = _gv.s - s0; if (dS < -DD.L / 2) dS += DD.L; else if (dS > DD.L / 2) dS -= DD.L; k.tot += dS; k.sCu = k.s = _gv.s; k.y = k.gyCu = matDat(_gv.s, _gv.d, _gv.h);
}
const _SW = ['x', 'z', 'y', 'yaw', 's', 'i', 'd', 'tot', 'sCu', 'gyCu'];
function doiCho(k, j) {                  // đổi chỗ hai xe (mỗi xe giữ tốc độ của mình)
  const A = {}, B = {}; for (const f of _SW) { A[f] = k[f]; B[f] = j[f]; }
  bung(k, 0xc05aff, 20, 7); bung(j, 0xc05aff, 20, 7);
  for (const f of _SW) { k[f] = B[f]; j[f] = A[f]; }
  for (const x of [k, j]) { const v = Math.max(25, x.vf); x.vx = Math.sin(x.yaw) * v; x.vz = Math.cos(x.yaw) * v; x.vf = v; x.vy = 0; x.bay = false; x.drift = false; x.driftMoc = 0; }
  bung(k, [0xc05aff, 0xffd23a], 20, 7); bung(j, [0xc05aff, 0xffd23a], 20, 7);
}
const _ta = {};
function laiTuDong(k) {                  // lái theo đường như máy (dùng cho Auto Balance của người chơi)
  const nhin = kep(14 + Math.max(0, k.vf) * 0.45, 16, 80), g = diemTai(k.s + nhin, _ta), d = kep(k.d, -8, 8);
  return kep(-gocChenh(Math.atan2(g.x + g.nx * d - k.x, g.z + g.nz * d - k.z), k.yaw) * 2.6, -1, 1);
}
const MAU_CV = [0xff3a3a, 0xff9a2a, 0xffe14a, 0x3acb5a, 0x3a8aff, 0xa05aff];
const TK_HAM = {
  speedy(k) { tangToc(k, 3.2); lucTien(k, 12); bung(k, [0xffe14a, 0xffffff], 26, 9); },
  luna(k) { datBuff(k, 'bDrift', 7); k.nitro = Math.min(NITRO_MAX, k.nitro + 35); bung(k, [0xc8a8ff, 0xfff0a0, 0xffffff], 22, 7, 2); },
  turbo(k) { k.nitro = NITRO_MAX; datBuff(k, 'bNitMien', 5); bung(k, [0x3af0ff, 0xffffff], 26, 9); },
  flash(k) { lucTien(k, 45); tangToc(k, 1.5); datBuff(k, 'bMa', 1.5); bung(k, [0xffe14a, 0xffffff], 30, 10); },
  robo(k) { datBuff(k, 'bTuLai', 7); bung(k, [0x7ad8ff, 0xffffff], 20, 6, 2); },
  fox(k) { k.chamT = 0; k.xoayT = 0; k.khienT = Math.max(k.khienT, 4); tangToc(k, 1.8); bung(k, [0xffa84a, 0xffffff], 24, 8); },
  ninja(k) { datBuff(k, 'bDrift', 5); datBay(k, 8, k.d, { tu: 'khoi', mau: 0x2a2a3a, giay: 1.3, he: 0.55 }); datBay(k, 22, kep(k.d + 2, -9, 9), { tu: 'khoi', mau: 0x2a2a3a, giay: 1.3, he: 0.55 }); bung(k, [0x3a3a4a, 0x8a5aff], 26, 8); },
  panda(k) { k.khienT = Math.max(k.khienT, 12); datBuff(k, 'bSat', 12); bung(k, [0xc8d0e0, 0x3acb5a], 22, 7); },
  tiger(k) { nhayLen(k, 24); k.thuongDap = 2.0; bung(k, [0xff9a2a, 0x15151c], 24, 8); },
  cosmo(k) { datBuff(k, 'bTrongLuc', 7); tangToc(k, 1.5); bung(k, [0xc8d8ff, 0xffe14a, 0xffffff], 26, 8, 2); },
  captain(k) { bung(k, [0xffd23a, 0xffffff], 20, 7); nhayTien(k, 120); bung(k, [0xffd23a, 0xff3a3a], 20, 7); },
  dino(k) {
    for (const j of XE_DUA) if (j !== k && !j.xong && Math.hypot(j.x - k.x, j.z - k.z) < 60) { trungChieu(j, 1.3, 0.45, 'dino', k); bung(j, [0x7ae07a, 0xffe14a], 10, 6); }
    bung(k, [0x7ae07a, 0xff9a2a, 0xffffff], 36, 12, 0.3); const P = XE_DUA[0]; if (Math.hypot(P.x - k.x, P.z - k.z) < 90) DV.rung = Math.max(DV.rung || 0, 0.5);
  },
  bunny(k) { k.bHop = 3; k.hopCho = 0; bung(k, [0xffffff, 0xff8ac8], 16, 6); },
  mimi(k) { k.xu += 25; if (suKien) suKien('xu', k, 25); k.nitro = Math.min(NITRO_MAX, k.nitro + 40); datBuff(k, 'bXu', 10); bung(k, [0xffd23a, 0x3acb5a, 0xffffff], 30, 9, 2); },
  bobo(k) { datBuff(k, 'bBam', 8); bung(k, [0xff7ab8, 0xffffff], 20, 6); },
  ducky(k) { k.khienT = Math.max(k.khienT, 10); bung(k, [0x6ad8ff, 0xffffff], 22, 7, 2); },
  rainbow(k) { tangToc(k, 3.5); for (let i = 1; i <= 6; i++) datBay(k, i * 7, k.d, { tu: 'cv', mau: MAU_CV[i - 1], giay: 0.9, he: 0.5, song: 18 }); bung(k, MAU_CV, 30, 9); },
  monkey(k) { for (let i = 0; i < 3; i++) datBay(k, 10 + i * 12, kep(k.d + (i - 1) * 3.5, -9, 9), { tu: 'chuoi', mau: 0xffe14a, giay: 1.0, he: 0.55, song: 20 }); bung(k, 0xffe14a, 14, 6); },
  kinggold(k) { datBuff(k, 'bXu', 8); datBuff(k, 'bXuX', 8); tangToc(k, 2.5); bung(k, [0xffd23a, 0xffffff, 0xffa81a], 34, 10, 2); },
  icequeen(k) { for (const j of xeTruoc(k, 300).slice(0, 2)) { trungChieu(j, 1.8, 0.15, 'bang', k); bung(j, [0x9ae8ff, 0xffffff], 22, 7); } tangToc(k, 2.0); bung(k, [0x9ae8ff, 0xffffff], 26, 8); },
  dragon(k) { tangToc(k, 3.5); for (let i = 1; i <= 3; i++) datBay(k, i * 10, k.d, { tu: 'lua', mau: 0xff6a1a, giay: 1.0, he: 0.55, song: 16 }); bung(k, [0xff6a1a, 0xffd23a, 0xff3a2a], 30, 10); },
  shadow(k) { datBuff(k, 'bMa', 5); tangToc(k, 1.5); bung(k, [0xc05aff, 0x3a1a5a], 26, 8); },
  alien(k) {
    const j = xeTruoc(k, 400)[0];
    if (j) { if (trungChieu(j, 2.2, 0.25, 'ufo', k)) { j.vy = Math.max(j.vy, 16); j.y += 0.6; j.bay = true; j.tgBay = 0; j.xBay = j.x; j.zBay = j.z; } bung(j, [0x7aff7a, 0xffffff], 30, 6, 4); } else tangToc(k, 1.2);
    bung(k, [0x7aff7a, 0xc05aff], 16, 6);
  },
  cyber(k) { datBuff(k, 'bPhanXa', 8); k.nitro = Math.min(NITRO_MAX, k.nitro + 35); bung(k, [0x3af0ff, 0x2a8aff], 24, 8); },
  chef(k) { tangToc(k, 1.5); for (let i = 0; i < 3; i++) datBay(k, -(40 + i * 28), kep((i - 1) * 4, -9, 9), { tu: 'keo', mau: [0xff5ab0, 0x5ad8ff, 0xffe14a][i], giay: 1.4, he: 0.5, song: 25 }); bung(k, [0xff5ab0, 0xffe14a, 0xffffff], 24, 8); },
  police(k) { for (const j of xeTruoc(k, 250)) { trungChieu(j, 1.6, 0.45, 'coi', k); bung(j, [0xff3a3a, 0x3a8aff], 10, 5); } tangToc(k, 1.5); bung(k, [0xff3a3a, 0x3a8aff], 26, 8); },
  builder(k) { for (const o of VAT) if (!o.da && o.s > k.s && o.s < k.s + 400) { o.da = true; o.hoi = 40; o.vx = o.vz = 0; } k.chamT = 0; k.xoayT = 0; tangToc(k, 1.5); bung(k, [0xffc83a, 0xffffff], 26, 8); },
  magic(k) { const j = xeTruoc(k, 500)[0]; if (j) doiCho(k, j); else { bung(k, 0xc05aff, 16, 6); nhayTien(k, 80); bung(k, 0xffd23a, 16, 6); } },
  shark(k) { lucTien(k, 30); tangToc(k, 1.6); datBuff(k, 'bMord', 2.5); bung(k, [0x6ad8ff, 0xffffff], 28, 9); },
  skelly(k) {
    const ds = xeTruoc(k, 450).slice(0, 3);
    ds.forEach((j, i) => BAY.push({ loai: 'xuong', chu: k, muc: j, tot: k.tot + 3, d: kep(k.d + (i - 1) * 3, -9, 9), v: Math.max(70, k.vf + 30), song: 9, mesh: null, giay: 1.1, he: 0.5 }));
    if (!ds.length) tangToc(k, 1.2); bung(k, [0xffffff, 0xe83a3a], 20, 7);
  }
};
function dungTuyetKy(k) {
  const ky = k.nv && k.nv.ky; if (!ky || !CUOC.chay || k.xong || k.tkCho > 0 || !TK_HAM[k.nv.id]) return false;
  k.tkCho = ky.cd; k.tkSo = (k.tkSo || 0) + 1; TK_HAM[k.nv.id](k); if (suKien) suKien('tuyetky', k, ky); return true;
}
function aiNenDung(k, ky) {              // máy chọn lúc xài kỹ năng theo kiểu của nhân vật (ky.dung)
  const v = Math.max(0, k.vf), thang = Math.abs(doCong(k.s + 40)) < 1 / 1200 && Math.abs(doCong(k.s + 120)) < 1 / 900;
  switch (ky.dung) {
    case 'tang': return v > 25 && thang;
    case 'cua': return v > 25 && Math.abs(doCong(k.s + 40)) > 1 / 500;
    case 'cham': return k.chamT > 0.3;
    case 'thu': return xeSau(k, 90).length > 0 || k.chamT > 0.3;
    case 'gap': return k.hang > 1 && thang;
    case 'gan': return XE_DUA.some(j => j !== k && !j.xong && Math.hypot(j.x - k.x, j.z - k.z) < 40);
    case 'tan': return xeTruoc(k, 280).length > 0;
    case 'vat': { const a = timDau(VAT, k.s), b = timDau(VAT, k.s + 250); for (let i = a; i < b; i++) if (!VAT[i].da) return true; return false; }
    default: return true;
  }
}
function capNhatTuyetKy(dt) {            // mỗi bước vật lý: hồi chiêu, các hiệu ứng kéo dài, máy tự xài
  for (const k of XE_DUA) {
    if (k.xong) continue;
    if (CUOC.chay && k.tkCho > 0) k.tkCho -= dt;
    if (k.bHop > 0 && !k.bay) { k.hopCho -= dt; if (k.hopCho <= 0) { nhayLen(k, 12); k.thuongDap = 0.7; k.bHop--; k.hopCho = 0.35; } }
    if (k.bMord > 0) for (const j of XE_DUA) if (j !== k && !j.xong && Math.hypot(j.x - k.x, j.z - k.z) < 7 && j.tot > k.tot - 4) { trungChieu(j, 2.0, 0.4, 'cap', k); bung(j, [0xffffff, 0x6ad8ff], 18, 7); k.bMord = 0; tangToc(k, 0.8); break; }
    if (Math.random() < dt * 24) {
      if (k.bMa > 0) hat(k.x + ngauNhien(-1, 1), k.y + 1.5, k.z + ngauNhien(-1, 1), 0, 1.5, 0, 0xc8a8ff, 0.6, 0.9, 0.1, true, 1);
      else if (k.bXu > 0) hat(k.x + ngauNhien(-2, 2), k.y + 2, k.z + ngauNhien(-2, 2), 0, 1.5, 0, 0xffd23a, 0.5, 0.8, 0.1, true, 1);
      else if (k.bTrongLuc > 0) hat(k.x + ngauNhien(-1, 1), k.y + 0.5, k.z + ngauNhien(-1, 1), 0, 3, 0, 0xc8d8ff, 0.6, 0.8, 0.1, true, 1);
      else if (k.bBam > 0 || k.bTuLai > 0) hat(k.x + ngauNhien(-1, 1), k.y + 0.3, k.z + ngauNhien(-1, 1), ngauNhien(-1, 1), 1, ngauNhien(-1, 1), k.bTuLai > 0 ? 0x7ad8ff : 0xff7ab8, 0.4, 0.6, 0.1, true, 1);
    }
    if (!k.nguoi && CUOC.chay) {
      const ky = k.nv && k.nv.ky;
      if (ky && k.tkCho <= 0) { if (k.tkDoi == null) k.tkDoi = ngauNhien(0.2, 2.5); k.tkDoi -= dt; if (k.tkDoi <= 0 && (aiNenDung(k, ky) || k.tkDoi < -9) && dungTuyetKy(k)) k.tkDoi = null; }
    }
  }
}
function capNhatMa(k) {                  // chế độ ma: xe trong mờ
  const ma = k.bMa > 0; if (ma === !!k._ma) return; k._ma = ma;
  k.mesh.traverse(o => { const m = o.material; if (!m || o.isSprite) return; if (m.userData.op0 == null) { m.userData.op0 = m.opacity; m.userData.tr0 = m.transparent; } m.transparent = ma || m.userData.tr0; m.opacity = ma ? 0.38 : m.userData.op0; m.needsUpdate = true; });
}
