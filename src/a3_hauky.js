// ===================== BẦU TRỜI VÀ HẬU KỲ (phát sáng, mờ tốc độ khi Nitro, tô màu, viền tối) =====================
// Ảnh được vẽ vào một tấm đệm số thực (giá trị > 1 vẫn giữ được), rồi:
// (1) lọc riêng phần SÁNG HƠN NGƯỠNG (đèn pha, lửa Nitro, xu, mặt trời) → (2) làm nhòe ở 2 cỡ → (3) cộng lại lên ảnh,
// thêm mờ theo hướng tâm khi chạy Nitro, tăng nhẹ độ tươi, tối dần ở 4 góc. Mặt đường, rào trắng... không vượt ngưỡng nên không bị lóa.
const DH = () => DO_HOA[LUU.doHoa] || DO_HOA.dep;

// ---- bầu trời: quả cầu lớn tô chuyển màu từ chân trời lên đỉnh, có đĩa mặt trời rất sáng (để phát sáng) ----
const bauTroi = new THREE.Mesh(new THREE.SphereGeometry(1450, 32, 16), new THREE.ShaderMaterial({
  side: THREE.BackSide, depthWrite: false, fog: false,
  uniforms: { tren: { value: new THREE.Color(0x3a8ae0) }, chan: { value: new THREE.Color(0xdff4ff) }, mat: { value: HUONG_NANG.clone().normalize() }, mauMat: { value: new THREE.Color(1, 0.94, 0.8) } },
  vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
  fragmentShader: 'uniform vec3 tren, chan, mat, mauMat; varying vec3 vP;\n' +
    'void main(){ float h = max(vP.y, 0.0); vec3 c = mix(chan, tren, pow(h, 0.5)); float s = max(dot(vP, mat), 0.0);\n' +
    '  c += mauMat * (pow(s, 900.0) * 6.0 + pow(s, 40.0) * 0.45 + pow(s, 6.0) * 0.12); if (vP.y < 0.0) c = chan; gl_FragColor = vec4(c, 1.0); }'
}));
bauTroi.frustumCulled = false; bauTroi.renderOrder = -10; scene.add(bauTroi);
function doiMauTroi(troi, suong) { bauTroi.material.uniforms.tren.value.set(troi).multiplyScalar(0.72); bauTroi.material.uniforms.chan.value.set(suong); scene.background = new THREE.Color(suong); }

// ---- hậu kỳ ----
const HK = { bat: false, rt: null, a: null, b: null, c: null, d: null, w: 1, h: 1, nitro: 0, nguong: 2.2 };
const hkCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1), hkScene = new THREE.Scene();
const hkQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), null); hkQuad.frustumCulled = false; hkScene.add(hkQuad);
const VS_HK = 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }';
const matLoc = new THREE.ShaderMaterial({ depthTest: false, depthWrite: false, uniforms: { t: { value: null }, nguong: { value: 2.2 }, mem: { value: 0.5 } }, vertexShader: VS_HK,
  fragmentShader: 'uniform sampler2D t; uniform float nguong, mem; varying vec2 vUv;\n' +
    'void main(){ vec3 c = texture2D(t, vUv).rgb; float l = max(c.r, max(c.g, c.b)); float w = smoothstep(nguong - mem, nguong + mem, l); gl_FragColor = vec4(min(c * w, vec3(12.0)), 1.0); }' });
const matNhoe = new THREE.ShaderMaterial({ depthTest: false, depthWrite: false, uniforms: { t: { value: null }, huong: { value: new THREE.Vector2() } }, vertexShader: VS_HK,
  fragmentShader: 'uniform sampler2D t; uniform vec2 huong; varying vec2 vUv;\n' +
    'void main(){ vec3 s = texture2D(t, vUv).rgb * 0.227027;\n' +
    '  s += (texture2D(t, vUv + huong * 1.384615).rgb + texture2D(t, vUv - huong * 1.384615).rgb) * 0.316216;\n' +
    '  s += (texture2D(t, vUv + huong * 3.230769).rgb + texture2D(t, vUv - huong * 3.230769).rgb) * 0.070270; gl_FragColor = vec4(s, 1.0); }' });
const matGhep = new THREE.ShaderMaterial({ depthTest: false, depthWrite: false,
  uniforms: { tCanh: { value: null }, tB1: { value: null }, tB2: { value: null }, doSang: { value: 0.75 }, nitro: { value: 0 }, tuoi: { value: 1.1 } }, vertexShader: VS_HK,
  fragmentShader: 'uniform sampler2D tCanh, tB1, tB2; uniform float doSang, nitro, tuoi; varying vec2 vUv;\n' +
    'void main(){ vec2 uv = vUv; vec3 c = texture2D(tCanh, uv).rgb;\n' +
    '  if (nitro > 0.01) { vec2 d = uv - 0.5; float m = smoothstep(0.12, 0.62, length(d)) * nitro; vec3 a = c;\n' +
    '    for (int i = 1; i < 8; i++) a += texture2D(tCanh, uv - d * float(i) * 0.014 * m).rgb; c = a / 8.0; }\n' +
    '  c = min(c, vec3(1.0)) + (texture2D(tB1, uv).rgb * 0.8 + texture2D(tB2, uv).rgb * 1.2) * doSang;\n' +
    '  float l = dot(c, vec3(0.299, 0.587, 0.114)); c = mix(vec3(l), c, tuoi); c = (c - 0.5) * 1.04 + 0.5;\n' +
    '  float v = smoothstep(0.98, 0.32, length(vUv - 0.5)); c *= mix(0.74, 1.0, v); gl_FragColor = vec4(clamp(c, 0.0, 1.0), 1.0); }' });

function huyHK() { for (const k of ['rt', 'a', 'b', 'c', 'd']) if (HK[k]) { HK[k].dispose(); HK[k] = null; } }
function dungHK() {
  huyHK(); const D = DH(); HK.bat = D.phatSang; if (!HK.bat) return;
  const v = renderer.getDrawingBufferSize(new THREE.Vector2()), w = Math.max(2, v.x), h = Math.max(2, v.y), gl2 = renderer.capabilities.isWebGL2;
  const kieu = gl2 ? THREE.HalfFloatType : THREE.UnsignedByteType; HK.nguong = gl2 ? 2.2 : 0.92;
  const tc = { type: kieu, format: THREE.RGBAFormat, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter };
  if (gl2 && D.msaa > 0) { HK.rt = new THREE.WebGLMultisampleRenderTarget(w, h, tc); HK.rt.samples = Math.min(D.msaa, renderer.capabilities.maxSamples || 4); }
  else HK.rt = new THREE.WebGLRenderTarget(w, h, tc);
  const w2 = Math.max(1, w >> 1), h2 = Math.max(1, h >> 1), w4 = Math.max(1, w >> 2), h4 = Math.max(1, h >> 2);
  HK.a = new THREE.WebGLRenderTarget(w2, h2, Object.assign({ depthBuffer: false }, tc)); HK.b = new THREE.WebGLRenderTarget(w2, h2, Object.assign({ depthBuffer: false }, tc));
  HK.c = new THREE.WebGLRenderTarget(w4, h4, Object.assign({ depthBuffer: false }, tc)); HK.d = new THREE.WebGLRenderTarget(w4, h4, Object.assign({ depthBuffer: false }, tc));
  HK.w = w; HK.h = h; HK.w2 = w2; HK.h2 = h2; HK.w4 = w4; HK.h4 = h4;
}
function buocHK(mat, vao, ra) { hkQuad.material = mat; if (mat.uniforms.t) mat.uniforms.t.value = vao ? vao.texture : null; renderer.setRenderTarget(ra); renderer.render(hkScene, hkCam); }
function nhoe(vao, ra, w, h, x, y) { matNhoe.uniforms.huong.value.set(x / w, y / h); buocHK(matNhoe, vao, ra); }
function veKhung(dt, nitroMuon, sc, cam) {
  sc = sc || scene; cam = cam || camera; bauTroi.position.copy(camera.position);
  if (!HK.bat || !HK.rt) { renderer.setRenderTarget(null); renderer.render(sc, cam); return; }
  HK.nitro += ((nitroMuon ? 1 : 0) - HK.nitro) * Math.min(1, dt * 5);
  renderer.setRenderTarget(HK.rt); renderer.render(sc, cam);
  matLoc.uniforms.nguong.value = HK.nguong; buocHK(matLoc, HK.rt, HK.a);                       // lọc phần rất sáng, thu nhỏ một nửa
  nhoe(HK.a, HK.b, HK.w2, HK.h2, 1, 0); nhoe(HK.b, HK.a, HK.w2, HK.h2, 0, 1);                    // nhòe gần
  nhoe(HK.a, HK.c, HK.w2, HK.h2, 2, 0); nhoe(HK.c, HK.d, HK.w4, HK.h4, 0, 2);                    // thu nhỏ còn một phần tư rồi nhòe rộng
  nhoe(HK.d, HK.c, HK.w4, HK.h4, 3, 0); nhoe(HK.c, HK.d, HK.w4, HK.h4, 0, 3);
  hkQuad.material = matGhep; matGhep.uniforms.tCanh.value = HK.rt.texture; matGhep.uniforms.tB1.value = HK.a.texture; matGhep.uniforms.tB2.value = HK.d.texture; matGhep.uniforms.nitro.value = HK.nitro;
  renderer.setRenderTarget(null); renderer.render(hkScene, hkCam);
}
