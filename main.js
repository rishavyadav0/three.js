import * as THREE from "https://unpkg.com/three@0.161.0/build/three.module.js";

const canvas = document.getElementById("scene");
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x160000, 0.12);

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;

const camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 0.8, 6);
scene.add(camera);

const ambient = new THREE.AmbientLight(0xffe5e5, 0.8);
scene.add(ambient);

const key = new THREE.DirectionalLight(0xffffff, 1.8);
key.position.set(2.5, 2, 4);
scene.add(key);

const redRim = new THREE.PointLight(0xff1e1e, 15, 20, 2);
redRim.position.set(-3, 1.2, 2);
scene.add(redRim);

const backGlow = new THREE.PointLight(0xff5555, 10, 18, 2);
backGlow.position.set(2, -1, -3);
scene.add(backGlow);

const pedestal = new THREE.Mesh(
  new THREE.CylinderGeometry(2.5, 3.2, 0.5, 80),
  new THREE.MeshStandardMaterial({
    color: 0x310303,
    metalness: 0.15,
    roughness: 0.3,
    emissive: 0x140000,
    emissiveIntensity: 0.4
  })
);
pedestal.position.y = -1.8;
scene.add(pedestal);

const ring = new THREE.Mesh(
  new THREE.TorusGeometry(2.15, 0.04, 24, 200),
  new THREE.MeshBasicMaterial({ color: 0xff2a2a })
);
ring.rotation.x = Math.PI / 2;
ring.position.y = -1.54;
scene.add(ring);

const productGroup = new THREE.Group();
scene.add(productGroup);

const canBodyMat = new THREE.MeshPhysicalMaterial({
  color: 0xb60000,
  roughness: 0.33,
  metalness: 0.25,
  clearcoat: 1,
  clearcoatRoughness: 0.15,
  sheen: 1,
  sheenColor: new THREE.Color(0xff4444)
});

const canBody = new THREE.Mesh(new THREE.CylinderGeometry(0.78, 0.78, 2.6, 64, 1, false), canBodyMat);
productGroup.add(canBody);

const capMat = new THREE.MeshStandardMaterial({
  color: 0xe5e5e5,
  roughness: 0.25,
  metalness: 0.95
});

const topCap = new THREE.Mesh(new THREE.CylinderGeometry(0.78, 0.78, 0.12, 64), capMat);
topCap.position.y = 1.36;
productGroup.add(topCap);

const bottomCap = new THREE.Mesh(new THREE.CylinderGeometry(0.78, 0.78, 0.12, 64), capMat);
bottomCap.position.y = -1.36;
productGroup.add(bottomCap);

function makeLabelTexture() {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 512;
  const ctx = c.getContext("2d");

  const grad = ctx.createLinearGradient(0, 0, c.width, c.height);
  grad.addColorStop(0, "#ff3b3b");
  grad.addColorStop(0.35, "#d90000");
  grad.addColorStop(1, "#860000");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, c.width, c.height);

  ctx.strokeStyle = "rgba(255,255,255,0.45)";
  ctx.lineWidth = 12;
  ctx.beginPath();
  ctx.moveTo(-30, c.height * 0.75);
  ctx.bezierCurveTo(c.width * 0.18, c.height * 0.25, c.width * 0.5, c.height * 1.1, c.width + 30, c.height * 0.3);
  ctx.stroke();

  ctx.fillStyle = "#fff";
  ctx.font = "italic 900 125px Montserrat";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("Coca-Cola", c.width * 0.5, c.height * 0.52);

  ctx.font = "600 42px Montserrat";
  ctx.fillText("Original Taste", c.width * 0.5, c.height * 0.72);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
  return tex;
}

const label = new THREE.Mesh(
  new THREE.CylinderGeometry(0.79, 0.79, 1.72, 96, 1, true),
  new THREE.MeshStandardMaterial({ map: makeLabelTexture(), metalness: 0.2, roughness: 0.45 })
);
productGroup.add(label);

const sparkleGeo = new THREE.BufferGeometry();
const sparkleCount = 1400;
const positions = new Float32Array(sparkleCount * 3);
const sizes = new Float32Array(sparkleCount);

for (let i = 0; i < sparkleCount; i++) {
  const i3 = i * 3;
  const radius = 2 + Math.random() * 7;
  const theta = Math.random() * Math.PI * 2;
  const y = (Math.random() - 0.5) * 6;

  positions[i3] = Math.cos(theta) * radius;
  positions[i3 + 1] = y;
  positions[i3 + 2] = Math.sin(theta) * radius;

  sizes[i] = Math.random() * 1.2 + 0.2;
}

sparkleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
sparkleGeo.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

const sparkleMat = new THREE.PointsMaterial({
  color: 0xffdede,
  size: 0.025,
  transparent: true,
  opacity: 0.82,
  blending: THREE.AdditiveBlending,
  depthWrite: false
});

const sparkles = new THREE.Points(sparkleGeo, sparkleMat);
scene.add(sparkles);

const mouse = new THREE.Vector2(0, 0);
window.addEventListener("pointermove", (e) => {
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
});

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

const cta = document.getElementById("cta");
cta.addEventListener("click", () => {
  cta.textContent = "Refreshing...";
  cta.disabled = true;
  gsapPulse();
  setTimeout(() => {
    cta.textContent = "Open Happiness";
    cta.disabled = false;
  }, 1200);
});

function gsapPulse() {
  const pulse = { v: 0 };
  const start = performance.now();

  function step(now) {
    const t = Math.min((now - start) / 800, 1);
    pulse.v = Math.sin(t * Math.PI);
    productGroup.scale.setScalar(1 + pulse.v * 0.08);
    ring.scale.setScalar(1 + pulse.v * 0.22);
    ring.material.color.setHSL(0.01, 1, 0.5 + pulse.v * 0.2);

    if (t < 1) {
      requestAnimationFrame(step);
    } else {
      productGroup.scale.setScalar(1);
      ring.scale.setScalar(1);
      ring.material.color.set(0xff2a2a);
    }
  }

  requestAnimationFrame(step);
}

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const t = clock.getElapsedTime();

  productGroup.rotation.y = t * 0.55 + mouse.x * 0.5;
  productGroup.rotation.x = Math.sin(t * 0.6) * 0.08 + mouse.y * 0.18;
  productGroup.position.y = Math.sin(t * 1.4) * 0.08;

  ring.rotation.z = t * 0.7;

  sparkles.rotation.y = t * 0.03;
  sparkles.rotation.x = Math.sin(t * 0.2) * 0.08;

  camera.position.x += ((mouse.x * 0.75) - camera.position.x) * 0.035;
  camera.position.y += ((0.85 + mouse.y * 0.35) - camera.position.y) * 0.035;
  camera.lookAt(0, 0, 0);

  renderer.render(scene, camera);
}

animate();
