import * as THREE from "https://unpkg.com/three@0.161.0/build/three.module.js";
import { EffectComposer } from "https://unpkg.com/three@0.161.0/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "https://unpkg.com/three@0.161.0/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "https://unpkg.com/three@0.161.0/examples/jsm/postprocessing/UnrealBloomPass.js";

const canvas = document.getElementById("scene");
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x150202, 0.065);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.25;

const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 0.9, 8);
scene.add(camera);

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.9, 0.7, 0.2);
composer.addPass(bloomPass);

const ambient = new THREE.AmbientLight(0xffdddd, 0.5);
scene.add(ambient);

const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
keyLight.position.set(2.8, 3.2, 4.6);
scene.add(keyLight);

const fillLight = new THREE.PointLight(0xff3f3f, 24, 28, 2);
fillLight.position.set(-4, 1, 3);
scene.add(fillLight);

const sweepLight = new THREE.SpotLight(0xff5f5f, 35, 26, Math.PI / 8, 0.32, 1.4);
sweepLight.position.set(0, 3.5, 2);
sweepLight.target.position.set(0, 0, 0);
scene.add(sweepLight, sweepLight.target);

const stage = new THREE.Mesh(
  new THREE.CylinderGeometry(2.55, 3.65, 0.55, 120),
  new THREE.MeshStandardMaterial({
    color: 0x2d0606,
    roughness: 0.28,
    metalness: 0.25,
    emissive: 0x180404,
    emissiveIntensity: 0.5
  })
);
stage.position.y = -2.3;
scene.add(stage);

const glowDisk = new THREE.Mesh(
  new THREE.CircleGeometry(2.1, 72),
  new THREE.MeshBasicMaterial({ color: 0xff2b2b, transparent: true, opacity: 0.42 })
);
glowDisk.rotation.x = -Math.PI / 2;
glowDisk.position.y = -2.01;
scene.add(glowDisk);

const bottleGroup = new THREE.Group();
scene.add(bottleGroup);

const profile = [
  [0.0, -1.95],
  [0.74, -1.95],
  [0.83, -1.66],
  [0.91, -1.28],
  [0.82, -0.8],
  [0.74, -0.3],
  [0.82, 0.2],
  [0.86, 0.68],
  [0.62, 1.2],
  [0.42, 1.5],
  [0.38, 1.8],
  [0.35, 2.06]
].map(([x, y]) => new THREE.Vector2(x, y));

const bottle = new THREE.Mesh(
  new THREE.LatheGeometry(profile, 160),
  new THREE.MeshPhysicalMaterial({
    color: 0xb10202,
    roughness: 0.26,
    metalness: 0.18,
    clearcoat: 1,
    clearcoatRoughness: 0.05,
    transmission: 0.1,
    thickness: 0.35,
    sheen: 1,
    sheenColor: new THREE.Color(0xff7f7f)
  })
);
bottleGroup.add(bottle);

const labelTexture = makeLabelTexture();
const label = new THREE.Mesh(
  new THREE.CylinderGeometry(0.94, 0.94, 1.2, 140, 1, true),
  new THREE.MeshStandardMaterial({
    map: labelTexture,
    roughness: 0.38,
    metalness: 0.15,
    emissive: 0x240000,
    emissiveIntensity: 0.18
  })
);
label.position.y = 0.08;
bottleGroup.add(label);

const cap = new THREE.Mesh(
  new THREE.CylinderGeometry(0.36, 0.37, 0.42, 42),
  new THREE.MeshStandardMaterial({ color: 0xf2f2f2, metalness: 0.95, roughness: 0.18 })
);
cap.position.y = 2.24;
bottleGroup.add(cap);

const logoRing = new THREE.Mesh(
  new THREE.TorusGeometry(1.64, 0.045, 16, 180),
  new THREE.MeshBasicMaterial({ color: 0xff6666 })
);
logoRing.rotation.x = Math.PI / 2;
logoRing.position.y = -0.22;
bottleGroup.add(logoRing);

const ribbons = new THREE.Group();
scene.add(ribbons);

const curveA = new THREE.CatmullRomCurve3([
  new THREE.Vector3(-2.6, -1.8, 0),
  new THREE.Vector3(-0.9, -0.7, 1.25),
  new THREE.Vector3(0.5, 0.6, -0.95),
  new THREE.Vector3(2.8, 1.85, 0.1)
]);
const curveB = new THREE.CatmullRomCurve3([
  new THREE.Vector3(2.8, -1.5, 0),
  new THREE.Vector3(1.1, -0.15, -1.2),
  new THREE.Vector3(-0.4, 1.15, 1.05),
  new THREE.Vector3(-2.7, 1.95, -0.2)
]);

const ribbonMatA = new THREE.MeshBasicMaterial({ color: 0xff3f3f, transparent: true, opacity: 0.4 });
const ribbonMatB = new THREE.MeshBasicMaterial({ color: 0xffb8b8, transparent: true, opacity: 0.25 });

const ribbonA = new THREE.Mesh(new THREE.TubeGeometry(curveA, 240, 0.07, 20, false), ribbonMatA);
const ribbonB = new THREE.Mesh(new THREE.TubeGeometry(curveB, 240, 0.05, 20, false), ribbonMatB);
ribbons.add(ribbonA, ribbonB);

const haloGeo = new THREE.BufferGeometry();
const haloCount = 2200;
const haloPositions = new Float32Array(haloCount * 3);
for (let i = 0; i < haloCount; i++) {
  const i3 = i * 3;
  const a = Math.random() * Math.PI * 2;
  const r = 1.7 + Math.random() * 6.4;
  const y = (Math.random() - 0.5) * 7;
  haloPositions[i3] = Math.cos(a) * r;
  haloPositions[i3 + 1] = y;
  haloPositions[i3 + 2] = Math.sin(a) * r;
}
haloGeo.setAttribute("position", new THREE.BufferAttribute(haloPositions, 3));
const halo = new THREE.Points(
  haloGeo,
  new THREE.PointsMaterial({
    color: 0xffd5d5,
    size: 0.02,
    transparent: true,
    opacity: 0.65,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  })
);
scene.add(halo);

const bubbleCount = 180;
const bubbleData = [];
const bubbleMesh = new THREE.InstancedMesh(
  new THREE.SphereGeometry(0.045, 12, 12),
  new THREE.MeshPhysicalMaterial({
    color: 0xfff0f0,
    metalness: 0,
    roughness: 0.1,
    transparent: true,
    transmission: 1,
    opacity: 0.9
  }),
  bubbleCount
);
scene.add(bubbleMesh);

const matrix = new THREE.Matrix4();
for (let i = 0; i < bubbleCount; i++) {
  bubbleData.push({
    x: (Math.random() - 0.5) * 1.3,
    y: -1.55 + Math.random() * 3.1,
    z: (Math.random() - 0.5) * 1.3,
    speed: 0.003 + Math.random() * 0.014,
    scale: 0.55 + Math.random() * 0.9
  });
}

const shockwaves = [];
for (let i = 0; i < 4; i++) {
  const wave = new THREE.Mesh(
    new THREE.RingGeometry(1.4, 1.48, 100),
    new THREE.MeshBasicMaterial({ color: 0xff6f6f, transparent: true, opacity: 0 })
  );
  wave.rotation.x = -Math.PI / 2;
  wave.position.y = -1.98;
  scene.add(wave);
  shockwaves.push({ mesh: wave, progress: 2, delay: i * 0.18 });
}

const mouse = new THREE.Vector2();
window.addEventListener("pointermove", (e) => {
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
});

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
});

let burst = 0;
const cta = document.getElementById("cta");
const secondary = document.getElementById("secondary");
cta.addEventListener("click", () => triggerBurst(1.2));
secondary.addEventListener("click", () => triggerBurst(1.8));

function triggerBurst(amount) {
  burst = Math.max(burst, amount);
  shockwaves.forEach((w, index) => {
    w.progress = -w.delay;
    w.mesh.material.opacity = 0.85 - index * 0.14;
    w.mesh.scale.setScalar(1);
  });
}

function makeLabelTexture() {
  const c = document.createElement("canvas");
  c.width = 2048;
  c.height = 512;
  const ctx = c.getContext("2d");

  const grd = ctx.createLinearGradient(0, 0, c.width, 0);
  grd.addColorStop(0, "#ff2f2f");
  grd.addColorStop(0.4, "#d30000");
  grd.addColorStop(1, "#960000");
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, c.width, c.height);

  ctx.strokeStyle = "rgba(255,255,255,0.6)";
  ctx.lineWidth = 16;
  ctx.beginPath();
  ctx.moveTo(-30, c.height * 0.63);
  ctx.bezierCurveTo(c.width * 0.18, c.height * 0.05, c.width * 0.5, c.height * 0.98, c.width + 50, c.height * 0.34);
  ctx.stroke();

  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.font = "italic 900 180px Montserrat";
  ctx.fillText("Coca-Cola", c.width / 2, c.height * 0.53);

  ctx.font = "600 58px Montserrat";
  ctx.fillText("Original Taste", c.width / 2, c.height * 0.76);

  const texture = new THREE.CanvasTexture(c);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  return texture;
}

const metricEls = [
  document.getElementById("metric1"),
  document.getElementById("metric2"),
  document.getElementById("metric3")
];

function setMetrics() {
  metricEls[0].textContent = String(bubbleCount);
  metricEls[1].textContent = "02";
  metricEls[2].textContent = "60fps";
}
setMetrics();

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const t = clock.getElapsedTime();

  bottleGroup.rotation.y = t * 0.35 + mouse.x * 0.48;
  bottleGroup.rotation.x = Math.sin(t * 0.8) * 0.05 + mouse.y * 0.14;
  bottleGroup.position.y = Math.sin(t * 1.2) * 0.08;

  cap.rotation.y = -t * 0.9;
  logoRing.rotation.z = t * 0.92;

  ribbons.rotation.y = -t * 0.23;
  ribbonA.material.opacity = 0.33 + Math.sin(t * 1.4) * 0.15;
  ribbonB.material.opacity = 0.22 + Math.sin(t * 1.2 + 1.5) * 0.12;

  halo.rotation.y = t * 0.035;
  halo.rotation.x = Math.sin(t * 0.22) * 0.08;

  sweepLight.position.x = Math.sin(t * 0.9) * 3.2;
  sweepLight.position.z = 2 + Math.cos(t * 0.7) * 1.2;

  for (let i = 0; i < bubbleCount; i++) {
    const b = bubbleData[i];
    b.y += b.speed + burst * 0.002;
    b.x += Math.sin(t * 1.3 + i) * 0.0007;
    if (b.y > 2.2) {
      b.y = -1.55;
      b.x = (Math.random() - 0.5) * 1.2;
      b.z = (Math.random() - 0.5) * 1.2;
    }
    matrix.compose(
      new THREE.Vector3(b.x, b.y, b.z),
      new THREE.Quaternion(),
      new THREE.Vector3(b.scale, b.scale, b.scale)
    );
    bubbleMesh.setMatrixAt(i, matrix);
  }
  bubbleMesh.instanceMatrix.needsUpdate = true;

  shockwaves.forEach((w) => {
    w.progress += 0.028 + burst * 0.005;
    if (w.progress <= 1) {
      const s = 1 + w.progress * 2.4;
      w.mesh.scale.setScalar(s);
      w.mesh.material.opacity = Math.max(0, 0.8 * (1 - w.progress));
    }
  });

  burst *= 0.93;
  bloomPass.strength = 0.9 + burst * 0.55;
  glowDisk.material.opacity = 0.34 + Math.sin(t * 2.2) * 0.11 + burst * 0.18;

  camera.position.x += (mouse.x * 0.9 - camera.position.x) * 0.03;
  camera.position.y += (1 + mouse.y * 0.45 - camera.position.y) * 0.03;
  camera.lookAt(0, 0.15, 0);

  composer.render();
}

animate();
