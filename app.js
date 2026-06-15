import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const canvas = document.querySelector("#orbital-canvas");
const title = document.querySelector("#title");
const geometry = document.querySelector("#geometry");
const count = document.querySelector("#count");
const shape = document.querySelector("#shape");
const angle = document.querySelector("#angle");
const autoRotate = document.querySelector("#auto-rotate");
const showLabels = document.querySelector("#show-labels");
const cloudMode = document.querySelector("#cloud-mode");
const selector = document.querySelector("#selector");
const mixProgress = document.querySelector("#mix-progress");
const processLabel = document.querySelector("#process-label");
const processPercent = document.querySelector("#process-percent");
const playProcess = document.querySelector("#play-process");
const languageSwitch = document.querySelector(".language-switch");
const cloudDensity = document.querySelector("#cloud-density");
const densityValue = document.querySelector("#density-value");
const orbitalList = document.querySelector("#orbital-list");

const translations = {
  zh: {
    appTitle: "杂化轨道 3D 演示",
    stageLabel: "3D 杂化轨道演示",
    loadError: "3D 模块未加载。请用 http://127.0.0.1:5173/ 打开，而不是直接双击 HTML 文件。",
    chooseType: "选择类型",
    hybridType: "杂化类型",
    orbitalCount: "轨道数",
    shape: "空间构型",
    angle: "典型键角",
    playProcess: "播放形成过程",
    autoRotate: "自动旋转",
    showLabels: "显示标签",
    cloudMode: "电子云模式",
    cloudDensity: "电子云密度",
    orbitalVisibility: "轨道显示与颜色",
    atomicOrbitals: "原子轨道",
    hybridOrbitals: "杂化轨道",
    orbital: "轨道",
    atomicOrbitalsProcess: "原子轨道：s / p / d",
    mixingProcess: "线性组合：轨道混合",
    hybridProcess: "杂化轨道 / 未杂化 p 轨道",
    geometryWithPi: (entry) => `${entry.geometry.zh}；${entry.directions.length} 个 ${entry.label} 轨道 + ${entry.pi.length} 个未杂化 p 轨道`,
    geometryWithoutPi: (entry) => `${entry.geometry.zh}；${entry.directions.length} 个 ${entry.label} 杂化轨道`,
  },
  en: {
    appTitle: "Hybrid Atomic Orbitals 3D Demo",
    stageLabel: "3D hybrid atomic orbitals demo",
    loadError: "The 3D module did not load. Open with http://127.0.0.1:5173/ instead of double-clicking the HTML file.",
    chooseType: "Choose type",
    hybridType: "Hybridization type",
    orbitalCount: "Orbitals",
    shape: "Geometry",
    angle: "Typical angle",
    playProcess: "Play formation",
    autoRotate: "Auto rotate",
    showLabels: "Show labels",
    cloudMode: "Electron cloud",
    cloudDensity: "Cloud density",
    orbitalVisibility: "Orbital display & colors",
    atomicOrbitals: "Atomic orbitals",
    hybridOrbitals: "Hybrid orbitals",
    orbital: "orbital",
    atomicOrbitalsProcess: "Atomic orbitals: s / p / d",
    mixingProcess: "Linear combination: orbital mixing",
    hybridProcess: "Hybrid orbitals / unhybridized p orbitals",
    geometryWithPi: (entry) => `${entry.geometry.en}; ${entry.directions.length} ${entry.label} orbitals + ${entry.pi.length} unhybridized p orbital${entry.pi.length > 1 ? "s" : ""}`,
    geometryWithoutPi: (entry) => `${entry.geometry.en}; ${entry.directions.length} ${entry.label} hybrid orbitals`,
  },
};

let currentLanguage = localStorage.getItem("orbital-language") || "zh";

const data = {
  sp: {
    label: "sp",
    geometry: { zh: "线形，180°", en: "Linear, 180°" },
    shape: { zh: "线形", en: "Linear" },
    angle: "180°",
    atomic: ["s", "px"],
    pi: ["py", "pz"],
    directions: [
      [1, 0, 0],
      [-1, 0, 0],
    ],
  },
  sp2: {
    label: "sp²",
    geometry: { zh: "平面三角形，120°", en: "Trigonal planar, 120°" },
    shape: { zh: "平面三角形", en: "Trigonal planar" },
    angle: "120°",
    atomic: ["s", "px", "pz"],
    pi: ["py"],
    directions: [
      [1, 0, 0],
      [-0.5, 0, Math.sqrt(3) / 2],
      [-0.5, 0, -Math.sqrt(3) / 2],
    ],
  },
  sp3: {
    label: "sp³",
    geometry: { zh: "四面体，109.5°", en: "Tetrahedral, 109.5°" },
    shape: { zh: "四面体", en: "Tetrahedral" },
    angle: "109.5°",
    atomic: ["s", "px", "py", "pz"],
    pi: [],
    directions: [
      [1, 1, 1],
      [1, -1, -1],
      [-1, 1, -1],
      [-1, -1, 1],
    ],
  },
  sp3d: {
    label: "sp³d",
    geometry: { zh: "三角双锥，90° / 120°", en: "Trigonal bipyramidal, 90° / 120°" },
    shape: { zh: "三角双锥", en: "Trigonal bipyramidal" },
    angle: "90° / 120°",
    atomic: ["s", "px", "py", "pz", "d"],
    pi: [],
    directions: [
      [1, 0, 0],
      [-0.5, 0, Math.sqrt(3) / 2],
      [-0.5, 0, -Math.sqrt(3) / 2],
      [0, 1, 0],
      [0, -1, 0],
    ],
  },
  sp3d2: {
    label: "sp³d²",
    geometry: { zh: "八面体，90°", en: "Octahedral, 90°" },
    shape: { zh: "八面体", en: "Octahedral" },
    angle: "90°",
    atomic: ["s", "px", "py", "pz", "d₁", "d₂"],
    pi: [],
    directions: [
      [1, 0, 0],
      [-1, 0, 0],
      [0, 1, 0],
      [0, -1, 0],
      [0, 0, 1],
      [0, 0, -1],
    ],
  },
};

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x071013, 9, 20);

const camera = new THREE.PerspectiveCamera(44, 1, 0.1, 80);
camera.position.set(5.8, 4.4, 7.2);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.85;
controls.minDistance = 4;
controls.maxDistance = 15;

const root = new THREE.Group();
const atomicRoot = new THREE.Group();
const hybridRoot = new THREE.Group();
root.add(atomicRoot, hybridRoot);
scene.add(root);

const ambient = new THREE.HemisphereLight(0xbffafa, 0x20200f, 2.2);
scene.add(ambient);

const key = new THREE.DirectionalLight(0xffffff, 3.4);
key.position.set(3.5, 5, 4);
scene.add(key);

const rim = new THREE.PointLight(0x39d7cc, 20, 16);
rim.position.set(-4, 2.5, -3);
scene.add(rim);

const grid = new THREE.GridHelper(9, 18, 0x2c5857, 0x18302f);
grid.material.transparent = true;
grid.material.opacity = 0.32;
scene.add(grid);

const centerMaterial = new THREE.MeshStandardMaterial({
  color: 0xf7f2e7,
  metalness: 0.12,
  roughness: 0.38,
});

const atomMaterials = {
  s: new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    emissive: 0x203232,
    transparent: true,
    opacity: 0.72,
    roughness: 0.25,
  }),
  pA: new THREE.MeshPhysicalMaterial({
    color: 0x7fe7ff,
    emissive: 0x0a3c4a,
    transparent: true,
    opacity: 0.72,
    roughness: 0.34,
  }),
  pB: new THREE.MeshPhysicalMaterial({
    color: 0xff8b8b,
    emissive: 0x421111,
    transparent: true,
    opacity: 0.72,
    roughness: 0.38,
  }),
  d: new THREE.MeshPhysicalMaterial({
    color: 0xd7a8ff,
    emissive: 0x27123a,
    transparent: true,
    opacity: 0.68,
    roughness: 0.42,
  }),
};

const lobeMaterials = [
  new THREE.MeshPhysicalMaterial({
    color: 0x39d7cc,
    emissive: 0x0c5753,
    roughness: 0.35,
    clearcoat: 0.5,
    transparent: true,
    opacity: 0.92,
  }),
  new THREE.MeshPhysicalMaterial({
    color: 0xf0b84c,
    emissive: 0x4c2a05,
    roughness: 0.4,
    clearcoat: 0.35,
    transparent: true,
    opacity: 0.88,
  }),
  new THREE.MeshPhysicalMaterial({
    color: 0xf26d6d,
    emissive: 0x4a0c10,
    roughness: 0.42,
    clearcoat: 0.25,
    transparent: true,
    opacity: 0.84,
  }),
];

const bondMaterial = new THREE.MeshStandardMaterial({
  color: 0xd5ffff,
  emissive: 0x173b3b,
  roughness: 0.36,
});

const piMaterial = new THREE.MeshPhysicalMaterial({
  color: 0xb587ff,
  emissive: 0x251250,
  transparent: true,
  opacity: 0.62,
  roughness: 0.32,
  clearcoat: 0.25,
});

let activeKey = "sp";
let playFrame = 0;
let randomSeed = 12;
let orbitalControls = [];
const orbitalState = new Map();

function orientAlong(mesh, direction) {
  const axis = new THREE.Vector3(0, 1, 0);
  mesh.quaternion.setFromUnitVectors(axis, direction.clone().normalize());
}

function cloneVector(name) {
  const map = {
    px: [1, 0, 0],
    py: [0, 1, 0],
    pz: [0, 0, 1],
  };
  return new THREE.Vector3(...map[name]);
}

function makeSphere(radius, material) {
  const sphere = new THREE.Mesh(new THREE.SphereGeometry(radius, 48, 24), material.clone());
  sphere.userData.isSurface = true;
  return sphere;
}

function makeDumbbell(direction, materialA, materialB = materialA, scale = 1) {
  const group = new THREE.Group();
  const dir = direction.clone().normalize();
  const positive = new THREE.Mesh(new THREE.SphereGeometry(0.38 * scale, 40, 20), materialA.clone());
  positive.scale.set(0.66, 1.55, 0.66);
  positive.position.copy(dir.clone().multiplyScalar(0.82 * scale));
  orientAlong(positive, dir);
  positive.userData.isSurface = true;
  group.add(positive);

  const negative = new THREE.Mesh(new THREE.SphereGeometry(0.38 * scale, 40, 20), materialB.clone());
  negative.scale.set(0.66, 1.55, 0.66);
  negative.position.copy(dir.clone().multiplyScalar(-0.82 * scale));
  orientAlong(negative, dir.clone().multiplyScalar(-1));
  negative.userData.isSurface = true;
  group.add(negative);
  return group;
}

function makeAtomicOrbital(name, index) {
  const group = new THREE.Group();
  const offset = new THREE.Vector3((index - 1.5) * 1.15, 0, 0);

  if (name === "s") {
    const s = makeSphere(0.62, atomMaterials.s);
    s.position.copy(offset);
    group.add(s);
    const cloud = makeSCloud(offset, 0xffffff, 520, 0.72);
    group.add(cloud);
    const label = makeLabel("s AO", "#eef7f7", "#39d7cc");
    label.position.copy(offset.clone().add(new THREE.Vector3(0, 1.15, 0)));
    group.add(label);
    return group;
  }

  if (name.startsWith("p")) {
    const dumbbell = makeDumbbell(cloneVector(name), atomMaterials.pA, atomMaterials.pB, 0.92);
    dumbbell.position.copy(offset);
    group.add(dumbbell);
    const cloud = makeOrbitalCloud(
      [
        { direction: cloneVector(name), center: 0.75, length: 0.7, radius: 0.26, color: 0x7fe7ff },
        { direction: cloneVector(name).multiplyScalar(-1), center: 0.75, length: 0.7, radius: 0.26, color: 0xff8b8b },
      ],
      760,
    );
    cloud.position.copy(offset);
    group.add(cloud);
    const label = makeLabel(`${name} AO`, "#eef7f7", "#39d7cc");
    label.position.copy(offset.clone().add(new THREE.Vector3(0, 1.55, 0)));
    group.add(label);
    return group;
  }

  const dGroup = new THREE.Group();
  const first = makeDumbbell(new THREE.Vector3(1, 0, 1), atomMaterials.d, atomMaterials.d, 0.78);
  const second = makeDumbbell(new THREE.Vector3(-1, 0, 1), atomMaterials.d, atomMaterials.d, 0.78);
  dGroup.add(first, second);
  const dCloud = makeOrbitalCloud(
    [
      { direction: new THREE.Vector3(1, 0, 1), center: 0.58, length: 0.55, radius: 0.2, color: 0xd7a8ff },
      { direction: new THREE.Vector3(-1, 0, -1), center: 0.58, length: 0.55, radius: 0.2, color: 0xd7a8ff },
      { direction: new THREE.Vector3(-1, 0, 1), center: 0.58, length: 0.55, radius: 0.2, color: 0xd7a8ff },
      { direction: new THREE.Vector3(1, 0, -1), center: 0.58, length: 0.55, radius: 0.2, color: 0xd7a8ff },
    ],
    980,
  );
  dGroup.add(dCloud);
  dGroup.position.copy(offset);
  group.add(dGroup);
  const label = makeLabel(`${name} AO`, "#eef7f7", "#b587ff");
  label.position.copy(offset.clone().add(new THREE.Vector3(0, 1.55, 0)));
  group.add(label);
  return group;
}

function makeLobe(direction, index, orbitalLabel, orbitalId) {
  const group = new THREE.Group();
  group.userData.orbitalId = orbitalId;
  group.userData.orbitalName = `${orbitalLabel}-${index + 1}`;
  const dir = new THREE.Vector3(...direction).normalize();
  const colorMaterial = lobeMaterials[index % lobeMaterials.length];

  const main = new THREE.Mesh(new THREE.SphereGeometry(0.48, 48, 24), colorMaterial.clone());
  main.scale.set(0.72, 2.05, 0.72);
  main.position.copy(dir.clone().multiplyScalar(1.24));
  orientAlong(main, dir);
  main.userData.isSurface = true;
  group.add(main);

  const minor = new THREE.Mesh(
    new THREE.SphereGeometry(0.34, 36, 18),
    lobeMaterials[(index + 1) % lobeMaterials.length].clone(),
  );
  minor.scale.set(0.55, 0.92, 0.55);
  minor.position.copy(dir.clone().multiplyScalar(-0.55));
  orientAlong(minor, dir.clone().multiplyScalar(-1));
  minor.userData.isSurface = true;
  group.add(minor);

  group.add(
    makeOrbitalCloud(
      [
        { direction: dir, center: 1.22, length: 1.05, radius: 0.36, color: colorMaterial.color.getHex() },
        {
          direction: dir.clone().multiplyScalar(-1),
          center: 0.55,
          length: 0.44,
          radius: 0.22,
          color: lobeMaterials[(index + 1) % lobeMaterials.length].color.getHex(),
        },
      ],
      900,
    ),
  );

  const bond = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 2.95, 18), bondMaterial.clone());
  bond.position.copy(dir.clone().multiplyScalar(0.92));
  orientAlong(bond, dir);
  group.add(bond);

  const label = makeLabel(`${orbitalLabel} ${translations[currentLanguage].orbital}`, "#eef7f7", "#39d7cc");
  label.position.copy(dir.clone().multiplyScalar(2.55));
  group.add(label);

  return group;
}

function makePiBond(axisName, index) {
  const group = new THREE.Group();
  group.userData.orbitalId = `pi-${axisName}`;
  group.userData.orbitalName = `${axisName} π`;
  const axis = cloneVector(axisName);
  const dumbbell = makeDumbbell(axis, piMaterial, piMaterial, 1.15);
  group.add(dumbbell);
  group.add(
    makeOrbitalCloud(
      [
        { direction: axis, center: 0.95, length: 0.8, radius: 0.3, color: 0xb587ff },
        { direction: axis.clone().multiplyScalar(-1), center: 0.95, length: 0.8, radius: 0.3, color: 0xb587ff },
      ],
      840,
    ),
  );

  const label = makeLabel(`${axisName} ${translations[currentLanguage].orbital}`, "#ffffff", "#b587ff");
  label.position.copy(axis.clone().multiplyScalar(2.15));
  group.add(label);
  return group;
}

function makeSCloud(center, color, count, radius) {
  const positions = [];
  const colors = [];
  const colorValue = new THREE.Color(color);
  for (let i = 0; i < count; i += 1) {
    const direction = randomUnitVector();
    const distance = Math.pow(nextRandom(), 0.42) * radius;
    const point = center.clone().add(direction.multiplyScalar(distance));
    positions.push(point.x, point.y, point.z);
    colors.push(colorValue.r, colorValue.g, colorValue.b);
  }
  return makePointCloud(positions, colors, 0.034, 0.82);
}

function makeOrbitalCloud(lobes, totalCount) {
  const positions = [];
  const colors = [];
  lobes.forEach((lobe) => {
    const dir = lobe.direction.clone().normalize();
    const side = Math.abs(dir.y) < 0.88 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0);
    const u = new THREE.Vector3().crossVectors(dir, side).normalize();
    const v = new THREE.Vector3().crossVectors(dir, u).normalize();
    const color = new THREE.Color(lobe.color);
    const count = Math.floor(totalCount / lobes.length);
    for (let i = 0; i < count; i += 1) {
      const axial = lobe.center + gaussian() * lobe.length * 0.34;
      const spread = (0.18 + nextRandom() * 0.82) * lobe.radius * (0.55 + axial / Math.max(lobe.center, 0.1));
      const spin = nextRandom() * Math.PI * 2;
      const radial = Math.abs(gaussian()) * spread;
      const point = dir
        .clone()
        .multiplyScalar(Math.max(0.06, axial))
        .add(u.clone().multiplyScalar(Math.cos(spin) * radial))
        .add(v.clone().multiplyScalar(Math.sin(spin) * radial));
      positions.push(point.x, point.y, point.z);
      colors.push(color.r, color.g, color.b);
    }
  });
  return makePointCloud(positions, colors, 0.032, 0.78);
}

function makePointCloud(positions, colors, size, opacity) {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  const material = new THREE.PointsMaterial({
    size,
    vertexColors: true,
    transparent: true,
    opacity,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const points = new THREE.Points(geometry, material);
  points.userData.isCloud = true;
  points.userData.baseCloudOpacity = opacity;
  return points;
}

function nextRandom() {
  randomSeed = (randomSeed * 1664525 + 1013904223) % 4294967296;
  return randomSeed / 4294967296;
}

function gaussian() {
  const u = Math.max(nextRandom(), 0.0001);
  const v = Math.max(nextRandom(), 0.0001);
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function randomUnitVector() {
  const z = nextRandom() * 2 - 1;
  const theta = nextRandom() * Math.PI * 2;
  const r = Math.sqrt(1 - z * z);
  return new THREE.Vector3(r * Math.cos(theta), z, r * Math.sin(theta));
}

function makeLabel(text, textColor = "#eef7f7", strokeColor = "#39d7cc") {
  const size = 256;
  const labelCanvas = document.createElement("canvas");
  labelCanvas.width = size;
  labelCanvas.height = size;
  const ctx = labelCanvas.getContext("2d");
  ctx.clearRect(0, 0, size, size);
  ctx.fillStyle = "rgba(7, 16, 19, 0.78)";
  roundRect(ctx, 16, 82, 224, 92, 46);
  ctx.fill();
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 5;
  ctx.stroke();
  ctx.fillStyle = textColor;
  let fontSize = 34;
  ctx.font = `700 ${fontSize}px Arial`;
  while (ctx.measureText(text).width > 190 && fontSize > 22) {
    fontSize -= 2;
    ctx.font = `700 ${fontSize}px Arial`;
  }
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, size / 2, size / 2 + 1);

  const texture = new THREE.CanvasTexture(labelCanvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false }),
  );
  sprite.scale.set(1.08, 1.08, 1.08);
  sprite.userData.isLabel = true;
  return sprite;
}

function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
}

function clearGroup(group) {
  while (group.children.length) group.remove(group.children[0]);
}

function applyLanguage(language) {
  currentLanguage = translations[language] ? language : "zh";
  localStorage.setItem("orbital-language", currentLanguage);
  document.documentElement.lang = currentLanguage === "zh" ? "zh-CN" : "en";
  document.title = translations[currentLanguage].appTitle;
  document.querySelector(".stage").setAttribute("aria-label", translations[currentLanguage].stageLabel);

  document.querySelectorAll("[data-i18n]").forEach((element) => {
    element.textContent = translations[currentLanguage][element.dataset.i18n];
  });
  document.querySelectorAll("[data-i18n-aria-label]").forEach((element) => {
    element.setAttribute("aria-label", translations[currentLanguage][element.dataset.i18nAriaLabel]);
  });
  languageSwitch.querySelectorAll("button[data-lang]").forEach((button) => {
    const isActive = button.dataset.lang === currentLanguage;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
  renderHybrid(activeKey);
}

function renderHybrid(keyName) {
  activeKey = keyName;
  const entry = data[keyName];
  clearGroup(atomicRoot);
  clearGroup(hybridRoot);

  const atomicCenter = new THREE.Mesh(new THREE.SphereGeometry(0.24, 48, 24), centerMaterial.clone());
  atomicRoot.add(atomicCenter);
  const atomicTitle = makeLabel(translations[currentLanguage].atomicOrbitals, "#eef7f7", "#f0b84c");
  atomicTitle.position.set(0, 2.5, 0);
  atomicRoot.add(atomicTitle);
  entry.atomic.forEach((orbital, index) => atomicRoot.add(makeAtomicOrbital(orbital, index)));

  const center = new THREE.Mesh(new THREE.SphereGeometry(0.34, 48, 24), centerMaterial.clone());
  hybridRoot.add(center);
  const hybridTitle = makeLabel(translations[currentLanguage].hybridOrbitals, "#eef7f7", "#39d7cc");
  hybridTitle.position.set(0, 2.75, 0);
  hybridRoot.add(hybridTitle);

  entry.directions.forEach((direction, index) => {
    hybridRoot.add(makeLobe(direction, index, entry.label, `hybrid-${index}`));
  });
  entry.pi.forEach((axisName, index) => hybridRoot.add(makePiBond(axisName, index)));
  buildOrbitalControls();

  title.textContent = entry.label;
  geometry.textContent = entry.pi.length
    ? translations[currentLanguage].geometryWithPi(entry)
    : translations[currentLanguage].geometryWithoutPi(entry);
  count.textContent = entry.directions.length;
  shape.textContent = entry.shape[currentLanguage];
  angle.textContent = entry.angle;

  selector.querySelectorAll("button").forEach((button) => {
    button.classList.toggle("active", button.dataset.key === keyName);
  });

  applyProgress(Number(mixProgress.value) / 100);
}

function getDefaultOrbitalColor(index) {
  return `#${lobeMaterials[index % lobeMaterials.length].color.getHexString()}`;
}

function ensureOrbitalState(group, index) {
  const id = group.userData.orbitalId;
  if (!orbitalState.has(id)) {
    orbitalState.set(id, { visible: true, color: getDefaultOrbitalColor(index) });
  }
  return orbitalState.get(id);
}

function buildOrbitalControls() {
  orbitalControls = hybridRoot.children.filter((child) => child.userData.orbitalId);
  orbitalList.innerHTML = "";

  orbitalControls.forEach((group, index) => {
    const state = ensureOrbitalState(group, index);
    const row = document.createElement("label");
    row.className = "orbital-row";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = state.visible;
    checkbox.dataset.orbitalId = group.userData.orbitalId;

    const name = document.createElement("span");
    name.textContent = group.userData.orbitalName;

    const color = document.createElement("input");
    color.type = "color";
    color.value = state.color;
    color.dataset.orbitalId = group.userData.orbitalId;
    color.setAttribute("aria-label", group.userData.orbitalName);

    row.append(checkbox, name, color);
    orbitalList.append(row);
  });

  applyOrbitalControls();
}

function applyOrbitalControls() {
  orbitalControls.forEach((group, index) => {
    const state = ensureOrbitalState(group, index);
    group.visible = state.visible;
    applyOrbitalColor(group, state.color);
  });
  applyCloudDensity();
}

function applyOrbitalColor(group, color) {
  const colorValue = new THREE.Color(color);
  group.traverse((object) => {
    if (object.isPoints && object.geometry?.attributes?.color) {
      const colors = object.geometry.attributes.color;
      for (let i = 0; i < colors.count; i += 1) {
        colors.setXYZ(i, colorValue.r, colorValue.g, colorValue.b);
      }
      colors.needsUpdate = true;
    }
    if (object.material?.color) {
      object.material.color.copy(colorValue);
      if (object.material.emissive) object.material.emissive.copy(colorValue).multiplyScalar(0.28);
    }
  });
}

function applyCloudDensity() {
  const density = Number(cloudDensity.value) / 100;
  densityValue.textContent = `${Math.round(density * 100)}%`;
  root.traverse((object) => {
    if (!object.userData.isCloud || !object.material) return;
    object.material.size = 0.032 * Math.sqrt(density);
    object.material.opacity = (object.userData.baseCloudOpacity ?? 0.78) * Math.min(1.6, density);
  });
}

function setGroupOpacity(group, opacity) {
  group.traverse((object) => {
    if (object.material) {
      object.material.transparent = true;
      object.material.opacity = object.userData.baseOpacity ?? object.material.opacity;
      object.userData.baseOpacity ??= object.material.opacity;
      object.material.opacity = object.userData.baseOpacity * opacity;
    }
  });
}

function setLabelsVisible() {
  root.traverse((object) => {
    if (object.userData.isLabel) object.visible = showLabels.checked;
  });
}

function setVisualMode() {
  const cloud = cloudMode.checked;
  root.traverse((object) => {
    if (object.userData.isSurface) object.visible = !cloud;
    if (object.userData.isCloud) object.visible = cloud;
  });
  setLabelsVisible();
  applyCloudDensity();
}

function applyProgress(value) {
  const progress = Math.max(0, Math.min(1, value));
  const atomicOpacity = 1 - smoothstep(0.18, 0.82, progress);
  const hybridOpacity = smoothstep(0.18, 0.82, progress);

  atomicRoot.visible = atomicOpacity > 0.02;
  hybridRoot.visible = hybridOpacity > 0.02;
  atomicRoot.scale.setScalar(1 - progress * 0.2);
  hybridRoot.scale.setScalar(0.72 + progress * 0.28);
  atomicRoot.position.x = -progress * 0.6;
  hybridRoot.position.x = (1 - progress) * 0.6;

  setGroupOpacity(atomicRoot, atomicOpacity);
  setGroupOpacity(hybridRoot, hybridOpacity);
  setVisualMode();

  processPercent.textContent = `${Math.round(progress * 100)}%`;
  if (progress < 0.34) processLabel.textContent = translations[currentLanguage].atomicOrbitalsProcess;
  else if (progress < 0.78) processLabel.textContent = translations[currentLanguage].mixingProcess;
  else processLabel.textContent = translations[currentLanguage].hybridProcess;
}

function smoothstep(edge0, edge1, value) {
  const x = Math.max(0, Math.min(1, (value - edge0) / (edge1 - edge0)));
  return x * x * (3 - 2 * x);
}

function playFormation() {
  cancelAnimationFrame(playFrame);
  const start = performance.now();
  const duration = 2600;
  mixProgress.value = 0;

  function animate(now) {
    const progress = Math.min(1, (now - start) / duration);
    const eased = smoothstep(0, 1, progress);
    mixProgress.value = Math.round(eased * 100);
    applyProgress(eased);
    if (progress < 1) playFrame = requestAnimationFrame(animate);
  }

  playFrame = requestAnimationFrame(animate);
}

function resize() {
  const rect = canvas.parentElement.getBoundingClientRect();
  renderer.setSize(rect.width, rect.height, false);
  camera.aspect = rect.width / rect.height;
  camera.updateProjectionMatrix();
}

languageSwitch.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-lang]");
  if (!button) return;
  applyLanguage(button.dataset.lang);
});

selector.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-key]");
  if (!button) return;
  renderHybrid(button.dataset.key);
});

autoRotate.addEventListener("change", () => {
  controls.autoRotate = autoRotate.checked;
});

showLabels.addEventListener("change", setLabelsVisible);
cloudMode.addEventListener("change", setVisualMode);

mixProgress.addEventListener("input", () => {
  cancelAnimationFrame(playFrame);
  applyProgress(Number(mixProgress.value) / 100);
});

playProcess.addEventListener("click", playFormation);

cloudDensity.addEventListener("input", applyCloudDensity);

orbitalList.addEventListener("input", (event) => {
  const input = event.target;
  const state = orbitalState.get(input.dataset.orbitalId);
  if (!state) return;
  if (input.type === "checkbox") state.visible = input.checked;
  if (input.type === "color") state.color = input.value;
  applyOrbitalControls();
});

window.addEventListener("resize", resize);

function tick() {
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}

resize();
applyLanguage(currentLanguage);
document.body.classList.add("ready");
tick();
