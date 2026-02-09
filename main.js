// Simple 3D‑ish sparkling heart made of particles using Three.js

const canvas = document.getElementById("heart-canvas");
const scene = new THREE.Scene();

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true,
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 0, 18);

const group = new THREE.Group();
scene.add(group);

// Heart parametric function (2D) mapped into 3D with slight depth
function heartPoint(t) {
  const x = 16 * Math.pow(Math.sin(t), 3);
  const y =
    13 * Math.cos(t) -
    5 * Math.cos(2 * t) -
    2 * Math.cos(3 * t) -
    Math.cos(4 * t);
  return new THREE.Vector3(x, y, 0);
}

// Create particles along many heart curves with depth and randomness
const particlesCount = 2600;
const positions = new Float32Array(particlesCount * 3);
const colors = new Float32Array(particlesCount * 3);

const colorInside = new THREE.Color("#ff4b8b");
const colorOutside = new THREE.Color("#ffe6f5");

for (let i = 0; i < particlesCount; i++) {
  const t = (Math.random() * Math.PI * 2);

  const base = heartPoint(t);
  base.multiplyScalar(0.1); // scale down

  const depth = (Math.random() - 0.5) * 1.6;

  const jitter = 0.3;
  const jx = (Math.random() - 0.5) * jitter;
  const jy = (Math.random() - 0.5) * jitter;
  const jz = (Math.random() - 0.5) * jitter;

  const i3 = i * 3;
  positions[i3] = base.x + jx;
  positions[i3 + 1] = base.y + jy;
  positions[i3 + 2] = depth + jz;

  const mixFactor = Math.random();
  const c = colorInside.clone().lerp(colorOutside, mixFactor);
  colors[i3] = c.r;
  colors[i3 + 1] = c.g;
  colors[i3 + 2] = c.b;
}

const geometry = new THREE.BufferGeometry();
geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

const material = new THREE.PointsMaterial({
  size: 0.16,
  vertexColors: true,
  transparent: true,
  opacity: 0.9,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
});

const points = new THREE.Points(geometry, material);
group.add(points);

// Soft ambient bloom using light fog
scene.fog = new THREE.FogExp2(0x050510, 0.09);

function handleResize() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  renderer.setSize(width, height);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

window.addEventListener("resize", handleResize);
handleResize();

// Animate: gentle heartbeat + sparkle
let time = 0;
function animate() {
  requestAnimationFrame(animate);
  time += 0.012;

  const positions = geometry.attributes.position.array;

  for (let i = 0; i < particlesCount; i++) {
    const i3 = i * 3;

    const baseX = positions[i3];
    const baseY = positions[i3 + 1];
    const baseZ = positions[i3 + 2];

    const dist = Math.sqrt(baseX * baseX + baseY * baseY);
    const heartbeat = 1 + 0.05 * Math.sin(time * 2.1 + dist * 3.0);

    const sparkle = (Math.sin(time * 8 + i * 0.37) + 1) * 0.06;

    positions[i3] = baseX * heartbeat * (1 + sparkle);
    positions[i3 + 1] = baseY * heartbeat * (1 + sparkle);
    positions[i3 + 2] = baseZ * (1 + sparkle * 1.6);
  }

  geometry.attributes.position.needsUpdate = true;

  group.rotation.y = 0.32 * Math.sin(time * 0.5);
  group.rotation.x = 0.18 * Math.sin(time * 0.7);

  renderer.render(scene, camera);
}

animate();

// Yes button interaction
const yesButton = document.getElementById("yes-button");
const yesMessage = document.getElementById("yes-message");

if (yesButton && yesMessage) {
  yesButton.addEventListener("click", () => {
    yesMessage.classList.remove("hidden");
    requestAnimationFrame(() => {
      yesMessage.classList.add("visible");
    });
  });

  yesMessage.addEventListener("click", () => {
    yesMessage.classList.remove("visible");
    setTimeout(() => {
      yesMessage.classList.add("hidden");
    }, 500);
  });
}

