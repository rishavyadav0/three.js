import * as THREE from 'https://unpkg.com/three@0.161.0/build/three.module.js';

const sceneRoot = document.getElementById('scene');

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x5d070a, 10, 45);

const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 0.5, 10);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
sceneRoot.appendChild(renderer.domElement);

scene.add(new THREE.AmbientLight(0xffd6d8, 0.85));

const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
keyLight.position.set(4, 5, 8);
scene.add(keyLight);

const rimLight = new THREE.PointLight(0xff616a, 1.1, 25);
rimLight.position.set(-5, 1, -2);
scene.add(rimLight);

const canGroup = new THREE.Group();
scene.add(canGroup);

const bodyGeometry = new THREE.CylinderGeometry(1.2, 1.2, 4.3, 72, 1, true);
const bodyMaterial = new THREE.MeshStandardMaterial({
  color: 0xd91522,
  roughness: 0.28,
  metalness: 0.42
});
const canBody = new THREE.Mesh(bodyGeometry, bodyMaterial);
canGroup.add(canBody);

const topGeometry = new THREE.CylinderGeometry(1.2, 1.2, 0.32, 72);
const topMaterial = new THREE.MeshStandardMaterial({ color: 0xd9d9d9, roughness: 0.15, metalness: 0.85 });
const canTop = new THREE.Mesh(topGeometry, topMaterial);
canTop.position.y = 2.31;
canGroup.add(canTop);

const bottom = canTop.clone();
bottom.position.y = -2.31;
canGroup.add(bottom);

const logoCanvas = document.createElement('canvas');
logoCanvas.width = 1024;
logoCanvas.height = 512;
const ctx = logoCanvas.getContext('2d');
ctx.fillStyle = '#d91522';
ctx.fillRect(0, 0, logoCanvas.width, logoCanvas.height);
ctx.font = 'bold 160px "Brush Script MT", "Segoe Script", cursive';
ctx.fillStyle = '#ffffff';
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';
ctx.fillText('Coca-Cola', logoCanvas.width / 2, logoCanvas.height / 2);

const logoTexture = new THREE.CanvasTexture(logoCanvas);
logoTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();
logoTexture.wrapS = THREE.ClampToEdgeWrapping;
logoTexture.wrapT = THREE.ClampToEdgeWrapping;

const labelGeometry = new THREE.CylinderGeometry(1.205, 1.205, 2.6, 72, 1, true, Math.PI * 0.08, Math.PI * 1.84);
const labelMaterial = new THREE.MeshStandardMaterial({ map: logoTexture, transparent: true, roughness: 0.5, metalness: 0.12 });
const label = new THREE.Mesh(labelGeometry, labelMaterial);
canGroup.add(label);

const bubbleGeometry = new THREE.SphereGeometry(0.06, 16, 16);
const bubbleMaterial = new THREE.MeshStandardMaterial({ color: 0xfff6f6, transparent: true, opacity: 0.65 });

const bubbles = [];
for (let i = 0; i < 80; i++) {
  const bubble = new THREE.Mesh(bubbleGeometry, bubbleMaterial);
  resetBubble(bubble, true);
  scene.add(bubble);
  bubbles.push(bubble);
}

function resetBubble(bubble, randomY = false) {
  bubble.position.x = (Math.random() - 0.5) * 8;
  bubble.position.z = -4 - Math.random() * 6;
  bubble.position.y = randomY ? -3 + Math.random() * 6 : -3.4;
  bubble.userData.speed = 0.008 + Math.random() * 0.02;
  bubble.scale.setScalar(0.65 + Math.random() * 1.3);
}

window.addEventListener('mousemove', (event) => {
  const x = (event.clientX / window.innerWidth) * 2 - 1;
  const y = (event.clientY / window.innerHeight) * 2 - 1;
  canGroup.rotation.y = x * 0.35;
  canGroup.rotation.x = y * 0.15;
});

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const elapsed = clock.getElapsedTime();
  canGroup.position.y = Math.sin(elapsed * 1.2) * 0.16;
  canGroup.rotation.z = Math.sin(elapsed * 0.6) * 0.04;

  for (const bubble of bubbles) {
    bubble.position.y += bubble.userData.speed;
    bubble.position.x += Math.sin(elapsed + bubble.position.z) * 0.002;
    if (bubble.position.y > 3.5) {
      resetBubble(bubble);
    }
  }

  renderer.render(scene, camera);
}

animate();
