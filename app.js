import * as THREE from 'https://unpkg.com/three@0.161.0/build/three.module.js';

const mount = document.getElementById('scene');

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x7f080d, 10, 55);

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 0.2, 11);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
mount.appendChild(renderer.domElement);

scene.add(new THREE.AmbientLight(0xffdede, 0.9));

const keyLight = new THREE.DirectionalLight(0xffffff, 1.1);
keyLight.position.set(4, 6, 7);
scene.add(keyLight);

const backLight = new THREE.PointLight(0xff5360, 1.2, 30);
backLight.position.set(-6, 2, -4);
scene.add(backLight);

const can = new THREE.Group();
scene.add(can);

const canBody = new THREE.Mesh(
  new THREE.CylinderGeometry(1.25, 1.25, 4.4, 72, 1, true),
  new THREE.MeshStandardMaterial({ color: 0xd91822, roughness: 0.3, metalness: 0.45 })
);
can.add(canBody);

const capMat = new THREE.MeshStandardMaterial({ color: 0xd8d8d8, roughness: 0.2, metalness: 0.9 });
const topCap = new THREE.Mesh(new THREE.CylinderGeometry(1.25, 1.25, 0.32, 72), capMat);
topCap.position.y = 2.36;
can.add(topCap);

const bottomCap = topCap.clone();
bottomCap.position.y = -2.36;
can.add(bottomCap);

const logoCanvas = document.createElement('canvas');
logoCanvas.width = 1024;
logoCanvas.height = 512;
const ctx = logoCanvas.getContext('2d');
ctx.fillStyle = '#d91822';
ctx.fillRect(0, 0, logoCanvas.width, logoCanvas.height);
ctx.fillStyle = '#ffffff';
ctx.font = 'bold 170px "Brush Script MT", "Segoe Script", cursive';
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';
ctx.fillText('Coca-Cola', logoCanvas.width / 2, logoCanvas.height / 2);

const labelTexture = new THREE.CanvasTexture(logoCanvas);
labelTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();

const label = new THREE.Mesh(
  new THREE.CylinderGeometry(1.255, 1.255, 2.65, 72, 1, true, Math.PI * 0.08, Math.PI * 1.84),
  new THREE.MeshStandardMaterial({ map: labelTexture, roughness: 0.48, metalness: 0.15, transparent: true })
);
can.add(label);

const bubbleGeometry = new THREE.SphereGeometry(0.06, 14, 14);
const bubbleMaterial = new THREE.MeshStandardMaterial({
  color: 0xfff7f7,
  transparent: true,
  opacity: 0.68,
  roughness: 0.15,
  metalness: 0.1
});

const bubbles = [];
for (let i = 0; i < 90; i++) {
  const b = new THREE.Mesh(bubbleGeometry, bubbleMaterial);
  respawnBubble(b, true);
  scene.add(b);
  bubbles.push(b);
}

function respawnBubble(bubble, randomY = false) {
  bubble.position.x = (Math.random() - 0.5) * 8.5;
  bubble.position.z = -2 - Math.random() * 9;
  bubble.position.y = randomY ? -3.5 + Math.random() * 7 : -3.7;
  bubble.userData.speed = 0.008 + Math.random() * 0.022;
  bubble.scale.setScalar(0.5 + Math.random() * 1.4);
}

window.addEventListener('mousemove', (event) => {
  const x = (event.clientX / window.innerWidth) * 2 - 1;
  const y = (event.clientY / window.innerHeight) * 2 - 1;
  can.rotation.y = x * 0.45;
  can.rotation.x = y * 0.18;
});

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const t = clock.getElapsedTime();

  can.position.y = Math.sin(t * 1.2) * 0.17;
  can.rotation.z = Math.sin(t * 0.6) * 0.03;

  for (const bubble of bubbles) {
    bubble.position.y += bubble.userData.speed;
    bubble.position.x += Math.sin(t + bubble.position.z) * 0.002;
    if (bubble.position.y > 3.8) {
      respawnBubble(bubble);
    }
  }

  renderer.render(scene, camera);
}

animate();
