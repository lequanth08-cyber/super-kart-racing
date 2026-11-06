// ===================== KHỞI TẠO THREE, VẬT LIỆU, ÂM THANH, HẠT, LƯU TRỮ =====================
const $ = (id) => document.getElementById(id);
const canvas = $('c');
const CAM_UNG = (window.matchMedia && matchMedia('(pointer:coarse)').matches);
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x7fd0ff);
scene.fog = new THREE.Fog(0xdff4ff, 400, 2400);
const camera = new THREE.PerspectiveCamera(64, 1, 0.5, 4000);

function canvasTex(w, h, ve, lap) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  ve(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.anisotropy = Math.min(16, renderer.capabilities.getMaxAnisotropy());
  if (lap) t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}
const ngauNhien = (a, b) => a + Math.random() * (b - a);
const kep = (v, a, b) => v < a ? a : v > b ? b : v;
const noi = (a, b, t) => a + (b - a) * t;
function gocChenh(a, b) { let d = a - b; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; return d; }
const dinhDangGio = (s) => { if (!(s >= 0)) return '--:--.--'; const m = Math.floor(s / 60), g = s - m * 60; return m + ':' + (g < 10 ? '0' : '') + g.toFixed(2); };
const dinhDangSo = (n) => Math.round(n).toLocaleString('vi-VN');
function mulberry(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function rung(ms) { try { if (navigator.vibrate) navigator.vibrate(ms); } catch (e) { } }    // rung điện thoại khi va chạm (máy hỗ trợ)

// Vật liệu hoạt hình: tô theo 3 bậc sáng
const bacSang = (() => {
  const t = new THREE.DataTexture(new Uint8Array([120, 190, 255]), 3, 1, THREE.LuminanceFormat);
  t.minFilter = t.magFilter = THREE.NearestFilter; t.generateMipmaps = false; t.needsUpdate = true; return t;
})();
function matHH(mau, tuSang) {
  const m = new THREE.MeshToonMaterial({ color: mau, gradientMap: bacSang });
  if (tuSang) m.emissive = new THREE.Color(mau).multiplyScalar(tuSang);
  return m;
}

// ===================== MÔI TRƯỜNG PHẢN CHIẾU (cho sơn xe bóng) =====================
const pmrem = new THREE.PMREMGenerator(renderer); let moiTruong = null;
function datMoiTruong(troi, dat, sang) {        // dựng một bầu trời nhỏ rồi lọc thành ảnh phản chiếu cho vật liệu bóng
  const sangToi = (c) => { const h = {}; c.getHSL(h); if (h.l < 0.5) c.setHSL(h.h, h.s, 0.5); return c; };   // three r128: ảnh phản chiếu từ màu quá tối bị tràn số (xe trắng xóa), nên nâng màu tối lên
  const s = new THREE.Scene(), m = new THREE.ShaderMaterial({ side: THREE.BackSide, uniforms: { a: { value: sangToi(new THREE.Color(troi)) }, b: { value: sangToi(new THREE.Color(dat)) }, k: { value: sang } },
    vertexShader: 'varying vec3 p; void main(){ p = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: 'uniform vec3 a, b; uniform float k; varying vec3 p; void main(){ float h = normalize(p).y; vec3 c = mix(b, a, smoothstep(-0.25, 0.5, h)) + vec3(1.0) * smoothstep(0.75, 1.0, h) * k; gl_FragColor = vec4(c, 1.0); }' });
  s.add(new THREE.Mesh(new THREE.SphereGeometry(10, 24, 12), m));
  const rt = pmrem.fromScene(s, 0.02); if (moiTruong) moiTruong.dispose(); moiTruong = rt; scene.environment = rt.texture; m.dispose();
}

// ===================== ÁNH SÁNG =====================
const anhTroi = new THREE.HemisphereLight(0xcfe4ff, 0x8a7a5a, 0.8); scene.add(anhTroi);
const anhMat = new THREE.DirectionalLight(0xfff0d0, 1.0);
anhMat.castShadow = true;
anhMat.shadow.mapSize.set(2048, 2048);
anhMat.shadow.camera.left = -60; anhMat.shadow.camera.right = 60; anhMat.shadow.camera.top = 60; anhMat.shadow.camera.bottom = -60;
anhMat.shadow.camera.near = 10; anhMat.shadow.camera.far = 260; anhMat.shadow.bias = -0.0006; anhMat.shadow.normalBias = 0.04;
scene.add(anhMat); scene.add(anhMat.target);
const HUONG_NANG = new THREE.Vector3(-40, 90, 30);
function theoNang(x, y, z) { anhMat.position.set(x + HUONG_NANG.x, y + HUONG_NANG.y, z + HUONG_NANG.z); anhMat.target.position.set(x, y, z); }

// ===================== ÂM THANH (Web Audio, không dùng tệp ngoài) =====================
let AC = null, tatAm = false, dongCo = null;
function moAm() {
  if (!AC) { try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { AC = null; } }
  if (AC && AC.state === 'suspended') AC.resume();
  if (AC && !dongCo) khoiDongCo();
}
function song(f0, f1, dai, vol, loai, tre) {
  if (!AC || tatAm) return; const t = AC.currentTime + (tre || 0), o = AC.createOscillator(), g = AC.createGain();
  o.type = loai || 'sine'; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dai);
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dai); o.connect(g); g.connect(AC.destination); o.start(t); o.stop(t + dai + 0.02);
}
function nhieu(dai, f0, f1, vol, loai, q, tre) {
  if (!AC || tatAm) return; const t = AC.currentTime + (tre || 0), n = Math.floor(AC.sampleRate * dai), b = AC.createBuffer(1, n, AC.sampleRate), d = b.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
  const s = AC.createBufferSource(); s.buffer = b; const f = AC.createBiquadFilter(); f.type = loai || 'bandpass'; f.Q.value = q || 1; f.frequency.setValueAtTime(f0, t); f.frequency.exponentialRampToValueAtTime(Math.max(30, f1), t + dai);
  const g = AC.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dai); s.connect(f); f.connect(g); g.connect(AC.destination); s.start(t);
}
function tieng(ten, tham) {
  switch (ten) {
    case 'xu': { const f = 1180 * Math.pow(1.05, Math.min(14, tham || 0)); song(f, f, 0.06, 0.12, 'square'); song(f * 1.5, f * 1.5, 0.1, 0.12, 'square', 0.05); break; }
    case 'qua': [784, 988, 1175, 1568].forEach((f, i) => song(f, f, 0.2, 0.2, 'triangle', i * 0.08)); break;
    case 'nitro': nhieu(0.7, 900, 3200, 0.5, 'bandpass', 0.8); song(160, 520, 0.6, 0.18, 'sawtooth'); break;
    case 'xung': song(300, 900, 0.35, 0.2, 'square'); nhieu(0.3, 1500, 4000, 0.25, 'bandpass', 1); break;
    case 'drift': song(500 + (tham || 0) * 200, 800 + (tham || 0) * 300, 0.12, 0.14, 'triangle'); break;
    case 'bay': nhieu(0.5, 400, 1600, 0.2, 'bandpass', 1); break;
    case 'dap': nhieu(0.25, 500, 90, 0.5, 'lowpass', 1); song(90, 40, 0.2, 0.3, 'sine'); break;
    case 'va': nhieu(0.18, 500, 120, 0.55, 'lowpass', 1); song(120, 50, 0.16, 0.3, 'sine'); break;
    case 'tuong': nhieu(0.25, 900, 150, 0.5, 'lowpass', 1); song(95, 45, 0.22, 0.3, 'triangle'); break;
    case 'non': nhieu(0.12, 2500, 800, 0.3, 'bandpass', 2); song(420, 160, 0.12, 0.14, 'square'); break;
    case 'sam': nhieu(0.8, 3000, 200, 0.5, 'lowpass', 1); song(60, 30, 0.8, 0.4, 'sawtooth'); break;
    case 'canh': song(880, 440, 0.25, 0.2, 'square'); song(880, 440, 0.25, 0.2, 'square', 0.3); break;
    case 'bip': song(520, 520, 0.2, 0.25, 'square'); break;
    case 'di': song(1040, 1040, 0.55, 0.28, 'square'); song(1560, 1560, 0.55, 0.14, 'square'); break;
    case 'moc': song(700, 1400, 0.22, 0.2, 'triangle'); break;
    case 'chuyen': song(660, 880, 0.06, 0.1, 'triangle'); break;
    case 'mua': song(520, 1040, 0.16, 0.2, 'triangle'); song(780, 1560, 0.2, 0.2, 'triangle', 0.1); break;
    case 'nay': song(200, 120, 0.2, 0.2, 'square'); break;
    case 'huy': [659, 784, 988, 1319].forEach((f, i) => song(f, f, 0.3, 0.2, 'triangle', i * 0.1)); break;
    case 'thang': [523, 659, 784, 1047, 1319].forEach((f, i) => song(f, f, 0.28, 0.22, 'triangle', i * 0.12)); break;
    case 'dich': [523, 659, 784].forEach((f, i) => song(f, f, 0.22, 0.2, 'triangle', i * 0.1)); break;
  }
}
function khoiDongCo() {       // tiếng động cơ: hai âm răng cưa qua bộ lọc, cao dần theo tốc độ
  if (!AC) return; const o = AC.createOscillator(), o2 = AC.createOscillator(), f = AC.createBiquadFilter(), g = AC.createGain();
  o.type = 'sawtooth'; o2.type = 'square'; f.type = 'lowpass'; f.frequency.value = 600; g.gain.value = 0;
  o.connect(f); o2.connect(f); f.connect(g); g.connect(AC.destination); o.start(); o2.start(); dongCo = { o, o2, f, g };
}
function capNhatDongCo(v01, nitro, chay) {
  if (!dongCo || !AC) return; const t = AC.currentTime, f = 55 + v01 * 170 + (nitro ? 45 : 0);
  dongCo.o.frequency.setTargetAtTime(f, t, 0.06); dongCo.o2.frequency.setTargetAtTime(f * 1.5, t, 0.06); dongCo.f.frequency.setTargetAtTime(500 + v01 * 1600, t, 0.08);
  dongCo.g.gain.setTargetAtTime(tatAm || !chay ? 0 : 0.03 + v01 * 0.03, t, 0.08);
}

// ===================== HẠT SÁNG VÀ KHÓI BỤI =====================
const texTron = canvasTex(64, 64, (g) => {
  const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(.35, 'rgba(255,255,255,.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
});
const hatSang = [], hatKhoi = [];
function taoHo(so, sang) {
  const ds = sang ? hatSang : hatKhoi;
  for (let i = 0; i < so; i++) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: texTron, transparent: true, depthWrite: false, blending: sang ? THREE.AdditiveBlending : THREE.NormalBlending }));
    s.visible = false; s.frustumCulled = false; scene.add(s); ds.push({ s, song: 0, tong: 1, vx: 0, vy: 0, vz: 0, k0: 1, k1: 0, a: 1 });
  }
}
taoHo(320, true); taoHo(200, false);
let conSang = 0, conKhoi = 0;
function hat(x, y, z, vx, vy, vz, mau, song, k0, k1, sang, a) {    // bắn một hạt: sang = cộng sáng (lửa, tia), ngược lại là khói bụi
  const ds = sang ? hatSang : hatKhoi;
  for (let t = 0; t < 8; t++) {
    const h = ds[sang ? (conSang = (conSang + 1) % ds.length) : (conKhoi = (conKhoi + 1) % ds.length)];
    if (h.song > 0) continue;
    h.song = h.tong = song; h.vx = vx; h.vy = vy; h.vz = vz; h.k0 = k0; h.k1 = k1; h.a = a == null ? 1 : a;
    h.s.position.set(x, y, z); h.s.material.color.set(mau); if (sang) h.s.material.color.multiplyScalar(1.8); h.s.material.opacity = h.a; h.s.visible = true; h.s.scale.set(k0, k0, 1);
    return;
  }
}
function capNhatHat(dt) {
  for (const ds of [hatSang, hatKhoi]) for (const h of ds) {
    if (h.song <= 0) continue;
    h.song -= dt; if (h.song <= 0) { h.s.visible = false; continue; }
    const u = 1 - h.song / h.tong; h.s.position.x += h.vx * dt; h.s.position.y += h.vy * dt; h.s.position.z += h.vz * dt;
    const k = noi(h.k0, h.k1, u); h.s.scale.set(k, k, 1); h.s.material.opacity = h.a * (1 - u);
  }
}

// ===================== LƯU TRỮ =====================
const LUU = (() => {
  let k = null; try { k = JSON.parse(localStorage.getItem(KHOA_LUU) || 'null'); } catch (e) { }
  const o = JSON.parse(JSON.stringify(LUU_MAC_DINH)); if (k && typeof k === 'object') for (const t in k) if (t in o) o[t] = k[t];
  o.tk = Object.assign({}, LUU_MAC_DINH.tk, k && k.tk && typeof k.tk === 'object' ? k.tk : {});
  if (!(o.xu >= 0)) o.xu = 0;
  if (!Array.isArray(o.xe)) o.xe = []; o.xe = o.xe.filter(id => XE.some(x => x.id === id)); if (!o.xe.includes('x01')) o.xe.unshift('x01');
  if (!o.xe.includes(o.xeDang)) o.xeDang = 'x01';
  for (const t of ['mau', 'duong', 'thuThach', 'nhiemVu', 'kyTich']) if (!o[t] || typeof o[t] !== 'object') o[t] = {};
  if (!NHAN_VAT.some(n => n.id === o.nhanVat)) o.nhanVat = 'speedy';
  if (!DO_KHO[o.kho]) o.kho = 'vua';
  if (!DO_HOA[o.doHoa]) o.doHoa = CAM_UNG ? 'dep' : 'toida';
  return o;
})();
function luuLai() { if (typeof CUOC !== 'undefined' && CUOC.thu) return; try { localStorage.setItem(KHOA_LUU, JSON.stringify(LUU)); } catch (e) { } }
const ttDuong = (id) => LUU.duong[id] || (LUU.duong[id] = { mo: false, tot: null, hang: null, qua: [false, false, false], dua: 0 });
