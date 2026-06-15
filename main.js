import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const copy = {
  sigma: {
    title: "Sigma 键形成",
    body: "两个原子轨道沿核间轴端对端重叠，电子密度集中在两个原子核之间。",
    a: "核间轴上的重叠越强，σ 键越稳定。",
    b: "σ 键可绕核间轴旋转，空间对称性较高。"
  },
  pi: {
    title: "Pi 键形成",
    body: "两个平行 p 轨道从侧面重叠，电子密度出现在核间轴的上方和下方。",
    a: "π 键需要轨道保持平行，因此会限制旋转。",
    b: "核间轴上有节面，电子密度不直接穿过两核连线。"
  },
  double: {
    title: "双键：σ + π",
    body: "双键由一个 σ 键和一个 π 键组成：σ 键在中心连接原子，π 键在上下两侧加强结合。",
    a: "先形成 σ 框架，再由未杂化 p 轨道侧向重叠形成 π 键。",
    b: "这就是双键平面构型和旋转受限的来源。"
  }
};

const canvas = document.querySelector("#scene");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x101416, 8, 18);

const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
camera.position.set(4.8, 3.2, 6.3);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.35;
controls.minDistance = 4.8;
controls.maxDistance = 11;
controls.target.set(0, 0.15, 0);

scene.add(new THREE.HemisphereLight(0xd9fff6, 0x221b13, 1.75));
const key = new THREE.DirectionalLight(0xffffff, 2.8);
key.position.set(4, 6, 5);
scene.add(key);

const root = new THREE.Group();
scene.add(root);

const atomMaterialA = new THREE.MeshStandardMaterial({
  color: 0x2f8f83,
  roughness: 0.44,
  metalness: 0.08
});
const atomMaterialB = new THREE.MeshStandardMaterial({
  color: 0xb54a38,
  roughness: 0.44,
  metalness: 0.08
});
const atomGeo = new THREE.SphereGeometry(0.44, 48, 48);
const leftAtom = new THREE.Mesh(atomGeo, atomMaterialA);
const rightAtom = new THREE.Mesh(atomGeo, atomMaterialB);
root.add(leftAtom, rightAtom);

const positiveMaterial = new THREE.MeshPhysicalMaterial({
  color: 0x4cc7b6,
  transparent: true,
  opacity: 0.7,
  roughness: 0.25,
  metalness: 0,
  transmission: 0.12,
  side: THREE.DoubleSide,
  depthWrite: false
});
const negativeMaterial = new THREE.MeshPhysicalMaterial({
  color: 0xf06449,
  transparent: true,
  opacity: 0.66,
  roughness: 0.3,
  side: THREE.DoubleSide,
  depthWrite: false
});
const densityMaterial = new THREE.MeshPhysicalMaterial({
  color: 0xf3cc62,
  emissive: 0x3d2d08,
  transparent: true,
  opacity: 0.54,
  roughness: 0.2,
  side: THREE.DoubleSide,
  depthWrite: false
});
const axisMaterial = new THREE.LineBasicMaterial({ color: 0xe7ece7, transparent: true, opacity: 0.38 });
const sigmaBondMaterial = new THREE.MeshPhysicalMaterial({
  color: 0xffd86b,
  emissive: 0x6a4a05,
  transparent: true,
  opacity: 0.78,
  roughness: 0.18,
  side: THREE.DoubleSide,
  depthWrite: false
});

function materialCopy(material) {
  return material.clone();
}

const sigmaGroup = new THREE.Group();
const piGroup = new THREE.Group();
const densityGroup = new THREE.Group();
root.add(sigmaGroup, piGroup, densityGroup);

const sigmaGeo = new THREE.SphereGeometry(0.76, 48, 48);
const sigmaLeft = new THREE.Mesh(sigmaGeo, materialCopy(positiveMaterial));
const sigmaRight = new THREE.Mesh(sigmaGeo, materialCopy(positiveMaterial));
sigmaLeft.scale.set(1.15, 0.74, 0.74);
sigmaRight.scale.set(1.15, 0.74, 0.74);
const sigmaBond = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 1, 36), materialCopy(sigmaBondMaterial));
sigmaBond.rotation.z = Math.PI / 2;
sigmaGroup.add(sigmaLeft, sigmaRight, sigmaBond);

const lobeGeo = new THREE.SphereGeometry(0.58, 40, 40);
const piLobes = [];
for (const side of [-1, 1]) {
  for (const phase of [-1, 1]) {
    const lobe = new THREE.Mesh(lobeGeo, materialCopy(phase > 0 ? positiveMaterial : negativeMaterial));
    lobe.scale.set(0.76, 1.42, 0.76);
    lobe.userData = { side, phase };
    piLobes.push(lobe);
    piGroup.add(lobe);
  }
}

const densitySigma = new THREE.Mesh(new THREE.SphereGeometry(0.54, 48, 48), materialCopy(densityMaterial));
densitySigma.scale.set(2.15, 0.5, 0.5);
densityGroup.add(densitySigma);

const densityPiTop = new THREE.Mesh(new THREE.SphereGeometry(0.48, 48, 48), materialCopy(densityMaterial));
const densityPiBottom = new THREE.Mesh(new THREE.SphereGeometry(0.48, 48, 48), materialCopy(densityMaterial));
densityPiTop.scale.set(1.55, 0.5, 0.54);
densityPiBottom.scale.copy(densityPiTop.scale);
densityPiTop.position.y = 1.02;
densityPiBottom.position.y = -1.02;
densityGroup.add(densityPiTop, densityPiBottom);

const axisPoints = [new THREE.Vector3(-3.1, 0, 0), new THREE.Vector3(3.1, 0, 0)];
const axis = new THREE.Line(new THREE.BufferGeometry().setFromPoints(axisPoints), axisMaterial);
root.add(axis);

const grid = new THREE.GridHelper(8, 12, 0xffffff, 0xffffff);
grid.position.y = -1.5;
grid.material.transparent = true;
grid.material.opacity = 0.12;
scene.add(grid);

let mode = "sigma";
let progress = 0.46;
let speed = 0.38;
let showPhase = true;

const modeButtons = [...document.querySelectorAll(".mode")];
const title = document.querySelector("#mode-title");
const body = document.querySelector("#mode-copy");
const calloutA = document.querySelector("#callout-a");
const calloutB = document.querySelector("#callout-b");
const progressInput = document.querySelector("#progress");
const speedInput = document.querySelector("#speed");
const phaseInput = document.querySelector("#phase-toggle");

function setMode(nextMode) {
  mode = nextMode;
  const selected = copy[mode];
  title.textContent = selected.title;
  body.textContent = selected.body;
  calloutA.textContent = selected.a;
  calloutB.textContent = selected.b;
  modeButtons.forEach((button) => {
    const active = button.dataset.mode === mode;
    button.classList.toggle("active", active);
    button.setAttribute("aria-selected", String(active));
  });
}

modeButtons.forEach((button) => {
  button.addEventListener("click", () => setMode(button.dataset.mode));
});
progressInput.addEventListener("input", (event) => {
  progress = Number(event.target.value) / 100;
});
speedInput.addEventListener("input", (event) => {
  speed = Number(event.target.value) / 100;
});
phaseInput.addEventListener("change", (event) => {
  showPhase = event.target.checked;
});

function resize() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height, false);
}
window.addEventListener("resize", resize);
resize();

const clock = new THREE.Clock();

function fade(object, value) {
  object.traverse((child) => {
    if (child.material) {
      child.visible = value > 0.02;
    }
  });
}

function setMaterialAlpha(mesh, alpha) {
  mesh.material.opacity = alpha;
  mesh.visible = alpha > 0.02;
}

function animate() {
  const elapsed = clock.getElapsedTime();
  const pulse = 0.5 + Math.sin(elapsed * (1.3 + speed * 3.2)) * 0.5;
  const bondDistance = THREE.MathUtils.lerp(3.65, 2.04, progress);
  const half = bondDistance / 2;

  leftAtom.position.x = -half;
  rightAtom.position.x = half;
  sigmaLeft.position.x = -half + 0.34 * progress;
  sigmaRight.position.x = half - 0.34 * progress;
  sigmaBond.scale.y = Math.max(0.18, bondDistance - 0.74);

  for (const lobe of piLobes) {
    lobe.position.x = lobe.userData.side * half;
    lobe.position.y = lobe.userData.phase * 1.02;
    lobe.position.x -= lobe.userData.side * 0.2 * progress;
  }

  const sigmaVisible = mode === "sigma" || mode === "double";
  const piVisible = mode === "pi" || mode === "double";
  sigmaGroup.visible = sigmaVisible;
  piGroup.visible = piVisible;

  const sigmaDensity = sigmaVisible ? THREE.MathUtils.smoothstep(progress, 0.18, 0.86) : 0;
  const piDensity = piVisible ? THREE.MathUtils.smoothstep(progress, 0.26, 0.92) : 0;
  setMaterialAlpha(sigmaBond, sigmaDensity * (0.68 + pulse * 0.2));
  setMaterialAlpha(densitySigma, sigmaDensity * (0.56 + pulse * 0.26));
  setMaterialAlpha(densityPiTop, piDensity * (0.3 + pulse * 0.22));
  setMaterialAlpha(densityPiBottom, piDensity * (0.3 + pulse * 0.22));

  const phaseAlpha = showPhase ? 0.72 : 0.22;
  sigmaLeft.material.opacity = phaseAlpha;
  sigmaRight.material.opacity = phaseAlpha;
  piLobes.forEach((lobe) => {
    lobe.material.opacity = phaseAlpha;
  });

  sigmaGroup.rotation.x = Math.sin(elapsed * 0.6) * 0.035;
  piGroup.rotation.z = Math.sin(elapsed * 0.7) * 0.035;
  densityGroup.rotation.z = Math.sin(elapsed * 0.55) * 0.018;
  root.rotation.y = Math.sin(elapsed * 0.18) * 0.08;

  fade(sigmaGroup, sigmaVisible ? 1 : 0);
  fade(piGroup, piVisible ? 1 : 0);

  controls.autoRotateSpeed = speed * 0.8;
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

setMode("sigma");
animate();
