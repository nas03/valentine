// --- 1. THREE.JS HEART BACKGROUND ---
let scene, camera, renderer, heartSystem;

function init3D() {
	const container = document.getElementById('canvas-container');

	scene = new THREE.Scene();
	scene.fog = new THREE.FogExp2(0xffeff5, 0.002);

	camera = new THREE.PerspectiveCamera(
		75,
		window.innerWidth / window.innerHeight,
		0.1,
		1000,
	);
	camera.position.z = 4;
	camera.lookAt(0, 0.3, 0);

	renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.setPixelRatio(window.devicePixelRatio);
	container.appendChild(renderer.domElement);

	createHeart();
	animate();
}

function createHeart() {
	const geometry = new THREE.BufferGeometry();
	const positions = [];
	const colors = [];

	const particleCount = 14000;
	const color1 = new THREE.Color(0xff0055);
	const color2 = new THREE.Color(0xff99bb);

	let count = 0;
	while (count < particleCount) {
		const x = (Math.random() - 0.5) * 3;
		const y = (Math.random() - 0.5) * 3;
		const z = (Math.random() - 0.5) * 3;

		const a = x * x + (9 / 4) * y * y + z * z - 1;
		const value = a * a * a - x * x * z * z * z - (9 / 80) * y * y * z * z * z;

		if (value <= 0 && value > -0.5) {
			const fuzz = 0.05;
			positions.push(
				x + (Math.random() - 0.5) * fuzz,
				z + (Math.random() - 0.5) * fuzz,
				-y + (Math.random() - 0.5) * fuzz,
			);

			const mixedColor = color1.clone().lerp(color2, Math.random());
			colors.push(mixedColor.r, mixedColor.g, mixedColor.b);
			count++;
		}
	}

	geometry.setAttribute(
		'position',
		new THREE.Float32BufferAttribute(positions, 3),
	);
	geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

	const canvas = document.createElement('canvas');
	canvas.width = 32;
	canvas.height = 32;
	const ctx = canvas.getContext('2d');
	ctx.beginPath();
	ctx.arc(16, 16, 15, 0, Math.PI * 2);
	ctx.fillStyle = 'white';
	ctx.fill();
	const texture = new THREE.Texture(canvas);
	texture.needsUpdate = true;

	const material = new THREE.PointsMaterial({
		size: 0.07,
		vertexColors: true,
		map: texture,
		transparent: true,
		opacity: 0.9,
		alphaTest: 0.1,
	});

	heartSystem = new THREE.Points(geometry, material);
	heartSystem.position.y = 0.6;
	scene.add(heartSystem);
}

function animate() {
	requestAnimationFrame(animate);

	const time = Date.now() * 0.0015;
	const beat =
		Math.pow(Math.sin(time * 3), 16) * 0.15 +
		Math.pow(Math.sin(time * 3 + 0.3), 6) * 0.05;

	const scale = 1 + beat;
	heartSystem.scale.set(scale, scale, scale);

	renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
});

// --- 2. INTERACTION LOGIC ---

function startJourney() {
	const audio = document.getElementById('bgm');
	audio.play().catch((error) => {
		console.log('Audio play failed:', error);
	});
	document.getElementById('timeline').scrollIntoView({ behavior: 'smooth' });
}

// Timeline Animation
const observer = new IntersectionObserver((entries) => {
	entries.forEach((entry) => {
		if (entry.isIntersecting) {
			entry.target.classList.add('show');
		}
	});
});

const hiddenElements = document.querySelectorAll('.timeline-item');
hiddenElements.forEach((el) => observer.observe(el));

// Open Letter
function openEnvelope() {
	const overlay = document.getElementById('letter-overlay');
	overlay.style.display = 'flex';

	setTimeout(() => {
		document.getElementById('lid').classList.add('open');
		setTimeout(() => {
			document.getElementById('paper').classList.add('visible');
			setTimeout(() => {
				document.getElementById('paper').classList.add('expanded');
			}, 600);
		}, 500);
	}, 100);
}

// NEW: Close Letter
function closeEnvelope() {
	const overlay = document.getElementById('letter-overlay');
	const paper = document.getElementById('paper');
	const lid = document.getElementById('lid');

	// Remove classes to reset animation state
	paper.classList.remove('expanded', 'visible');
	lid.classList.remove('open');

	// Hide overlay after a short delay to allow transition if desired
	setTimeout(() => {
		overlay.style.display = 'none';
	}, 500);
}

// --- VIDEO GIFT LOGIC ---

function openGift() {
	const overlay = document.getElementById('video-overlay');
	const guide = document.getElementById('gift-guide'); // Get the guide element

	overlay.style.display = 'flex';

	// Hide the guide text permanently after opening
	if (guide) {
		guide.style.display = 'none';
	}
}

function closeGift() {
	const overlay = document.getElementById('video-overlay');
	const video = document.getElementById('gift-video');

	overlay.style.display = 'none';

	// Stop the video when closed
	video.pause();
	video.currentTime = 0;
}
init3D();
