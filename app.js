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
const showUnhybridized = document.querySelector("#show-unhybridized");
const showLonePairs = document.querySelector("#show-lone-pairs");
const selector = document.querySelector("#selector");
const languageSwitch = document.querySelector("#language-switch");
const mixProgress = document.querySelector("#mix-progress");
const processLabel = document.querySelector("#process-label");
const processPercent = document.querySelector("#process-percent");
const playProcess = document.querySelector("#play-process");
const lonePairMinus = document.querySelector("#lone-pair-minus");
const lonePairPlus = document.querySelector("#lone-pair-plus");
const lonePairCount = document.querySelector("#lone-pair-count");
const lonePairBar = document.querySelector("#lone-pair-bar");

let currentLang = "zh";

const i18n = {
  zh: {
    chooseType: "选择类型",
    language: "语言",
    orbitalCount: "轨道数",
    shape: "空间构型",
    angle: "典型键角",
    playProcess: "播放形成过程",
    lonePairs: "孤对电子",
    autoRotate: "自动旋转",
    showLabels: "显示标签",
    cloudMode: "电子云模式",
    showUnhybridized: "显示未杂化轨道",
    showLonePairs: "显示孤对电子轨道",
    atomicOrbitals: "原子轨道",
    hybridOrbitals: "杂化轨道",
    orbital: "轨道",
    lonePairLabel: "孤对电子",
    processAtomic: "原子轨道：s / p / d",
    processMixing: "线性组合：轨道混合",
    processHybrid: "杂化轨道 / 未杂化 p 轨道",
  },
  en: {
    chooseType: "Type",
    language: "Language",
    orbitalCount: "Orbitals",
    shape: "Molecular shape",
    angle: "Bond angle",
    playProcess: "Play formation",
    lonePairs: "Lone pairs",
    autoRotate: "Auto rotate",
    showLabels: "Show labels",
    cloudMode: "Electron cloud",
    showUnhybridized: "Show unhybridized orbitals",
    showLonePairs: "Show lone-pair orbitals",
    atomicOrbitals: "atomic orbitals",
    hybridOrbitals: "hybrid orbitals",
    orbital: "orbital",
    lonePairLabel: "lone pair",
    processAtomic: "Atomic orbitals: s / p / d",
    processMixing: "Linear combination: orbital mixing",
    processHybrid: "Hybrid / unhybridized p orbitals",
  },
};

const shapeText = {
  "线形": { en: "Linear" },
  "平面三角形": { en: "Trigonal planar" },
  "四面体": { en: "Tetrahedral" },
  "三角双锥": { en: "Trigonal bipyramidal" },
  "八面体": { en: "Octahedral" },
  "弯曲形": { en: "Bent" },
  "三角锥": { en: "Trigonal pyramidal" },
  "跷跷板形": { en: "Seesaw" },
  "T 形": { en: "T-shaped" },
  "平方平面": { en: "Square planar" },
  "方锥形": { en: "Square pyramidal" },
  "T 形八面体电子域": { en: "T-shaped" },
  "单键线形电子域": { en: "Linear electron domain" },
  "单键平面三角电子域": { en: "Trigonal-planar electron domain" },
  "单键四面体电子域": { en: "Tetrahedral electron domain" },
};

function text(key) {
  return i18n[currentLang][key] ?? i18n.zh[key] ?? key;
}

function localShape(value) {
  return currentLang === "zh" ? value : (shapeText[value]?.en ?? value);
}

function baseGeometryText(entry, bondingOrbitals) {
  if (currentLang === "zh") {
    return entry.pi.length
      ? `${entry.geometry}；${bondingOrbitals} 个 ${entry.label} 成键轨道 + ${lonePairs} 对孤对电子 + ${entry.pi.length} 个未杂化 p 轨道`
      : `${entry.geometry}；${bondingOrbitals} 个 ${entry.label} 成键轨道 + ${lonePairs} 对孤对电子`;
  }

  const base = {
    sp: "Linear, 180°",
    sp2: "Trigonal planar, 120°",
    sp3: "Tetrahedral, 109.5°",
    sp3d: "Trigonal bipyramidal, 90° / 120°",
    sp3d2: "Octahedral, 90°",
  }[activeKey];
  const piPart = entry.pi.length ? ` + ${entry.pi.length} unhybridized p orbital${entry.pi.length > 1 ? "s" : ""}` : "";
  return `${base}; ${bondingOrbitals} ${entry.label} bonding orbital${bondingOrbitals === 1 ? "" : "s"} + ${lonePairs} lone pair${lonePairs === 1 ? "" : "s"}${piPart}`;
}

function layoutGeometryText(layout, entry, bondingOrbitals) {
  if (currentLang === "zh") return layout.geometry ?? baseGeometryText(entry, bondingOrbitals);
  if (!layout.geometry) return baseGeometryText(entry, bondingOrbitals);

  const byShape = {
    "sp²：典型 SO₂ 弯曲形，O-S-O ≈ 119.5°": "sp²: typical SO₂ bent shape, O-S-O ≈ 119.5°",
    "sp³：典型 NH₃ 三角锥，H-N-H ≈ 107.3°": "sp³: typical NH₃ trigonal pyramidal shape, H-N-H ≈ 107.3°",
    "sp³：典型 H₂O 弯曲形，H-O-H = 104.5°": "sp³: typical H₂O bent shape, H-O-H = 104.5°",
    "sp³d：典型 SF₄ 跷跷板形，实际角约 87° / 102° / 173°": "sp³d: typical SF₄ seesaw shape, angles ≈ 87° / 102° / 173°",
    "sp³d：典型 ClF₃ T 形，实际角约 87.5° / 175°": "sp³d: typical ClF₃ T-shaped geometry, angles ≈ 87.5° / 175°",
    "sp³d：3 对孤对电子占据赤道位置，剩余两个轴向成键轨道": "sp³d: 3 lone pairs occupy equatorial positions; two axial bonding orbitals remain",
    "sp³d²：典型 BrF₅ 方锥形，实际角约 84.8° / 89.529°": "sp³d²: typical BrF₅ square pyramidal shape, angles ≈ 84.8° / 89.529°",
    "sp³d²：2 对相对孤对电子形成平方平面": "sp³d²: two opposite lone pairs form a square planar shape",
    "sp³d²：3 对孤对电子留下 T 形成键轨道": "sp³d²: three lone pairs leave T-shaped bonding orbitals",
    "sp³d²：4 对孤对电子留下两个相对成键轨道": "sp³d²: four lone pairs leave two opposite bonding orbitals",
    "sp 电子域：1 个成键轨道 + 1 对孤对电子": "sp electron domain: 1 bonding orbital + 1 lone pair",
    "sp²：2 对孤对电子占据平面电子域": "sp²: 2 lone pairs occupy the planar electron domain",
    "sp³：3 对孤对电子只留下 1 个成键轨道": "sp³: 3 lone pairs leave only 1 bonding orbital",
  };
  return byShape[layout.geometry] ?? layout.geometry;
}

const data = {
  sp: {
    label: "sp",
    geometry: "线形，180°",
    shape: "线形",
    angle: "180°",
    atomic: ["s", "px"],
    pi: ["py", "pz"],
    directions: [
      [1, 0, 0],
      [-1, 0, 0],
    ],
    loneOrder: [0, 1],
  },
  sp2: {
    label: "sp²",
    geometry: "平面三角形，120°",
    shape: "平面三角形",
    angle: "120°",
    atomic: ["s", "px", "pz"],
    pi: ["py"],
    directions: [
      [1, 0, 0],
      [-0.5, 0, Math.sqrt(3) / 2],
      [-0.5, 0, -Math.sqrt(3) / 2],
    ],
    loneOrder: [0, 1, 2],
  },
  sp3: {
    label: "sp³",
    geometry: "四面体，109.5°",
    shape: "四面体",
    angle: "109.5°",
    atomic: ["s", "px", "py", "pz"],
    pi: [],
    directions: [
      [1, 1, 1],
      [1, -1, -1],
      [-1, 1, -1],
      [-1, -1, 1],
    ],
    loneOrder: [0, 1, 2, 3],
  },
  sp3d: {
    label: "sp³d",
    geometry: "三角双锥，90° / 120°",
    shape: "三角双锥",
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
    loneOrder: [0, 1, 2],
  },
  sp3d2: {
    label: "sp³d²",
    geometry: "八面体，90°",
    shape: "八面体",
    angle: "90°",
    atomic: ["s", "px", "py", "pz", "d₁", "d₂"],
    pi: [],
    directions: [
      [0, 1, 0],
      [0, -1, 0],
      [1, 0, 0],
      [-1, 0, 0],
      [0, 0, 1],
      [0, 0, -1],
    ],
    loneOrder: [0, 1, 2, 3],
  },
};

const sp2Bent = Math.PI * 58 / 180;
const so2HalfAngle = Math.PI * 59.75 / 180;
const waterHalfAngle = Math.PI * 52.25 / 180;
const tetraRadius = Math.sqrt(8 / 9);
const trigonalPyramidBondAngle = Math.PI * 107.3 / 180;
const trigonalPyramidY = -Math.sqrt((Math.cos(trigonalPyramidBondAngle) + 0.5) / 1.5);
const trigonalPyramidRadius = Math.sqrt(1 - trigonalPyramidY * trigonalPyramidY);
const tbp = {
  eqA: [1, 0, 0],
  eqB: [-0.5, 0, Math.sqrt(3) / 2],
  eqC: [-0.5, 0, -Math.sqrt(3) / 2],
  axUp: [0, 1, 0],
  axDown: [0, -1, 0],
};
const oct = {
  axUp: [0, 1, 0],
  axDown: [0, -1, 0],
  planeX: [1, 0, 0],
  planeNegX: [-1, 0, 0],
  planeZ: [0, 0, 1],
  planeNegZ: [0, 0, -1],
};

const lonePairLayouts = {
  sp: {
    1: {
      shape: "单键线形电子域",
      angle: "—",
      geometry: "sp 电子域：1 个成键轨道 + 1 对孤对电子",
      loneIndices: [1],
      directions: [
        [1, 0, 0],
        [-1, 0, 0],
      ],
    },
  },
  sp2: {
    1: {
      shape: "弯曲形",
      angle: "119.5°",
      geometry: "sp²：典型 SO₂ 弯曲形，O-S-O ≈ 119.5°",
      loneIndices: [0],
      angleOverrides: { default: 119.5 },
      directions: [
        [0, 0, 1],
        [Math.sin(so2HalfAngle), 0, -Math.cos(so2HalfAngle)],
        [-Math.sin(so2HalfAngle), 0, -Math.cos(so2HalfAngle)],
      ],
    },
    2: {
      shape: "单键平面三角电子域",
      angle: "—",
      geometry: "sp²：2 对孤对电子占据平面电子域",
      loneIndices: [0, 1],
      directions: [
        [Math.sqrt(3) / 2, 0, 0.5],
        [-Math.sqrt(3) / 2, 0, 0.5],
        [0, 0, -1],
      ],
    },
  },
  sp3: {
    1: {
      shape: "三角锥",
      angle: "107.3°",
      geometry: "sp³：典型 NH₃ 三角锥，H-N-H ≈ 107.3°",
      loneIndices: [0],
      angleOverrides: { default: 107.3 },
      directions: [
        [0, 1, 0],
        [trigonalPyramidRadius, trigonalPyramidY, 0],
        [trigonalPyramidRadius * Math.cos((2 * Math.PI) / 3), trigonalPyramidY, trigonalPyramidRadius * Math.sin((2 * Math.PI) / 3)],
        [trigonalPyramidRadius * Math.cos((4 * Math.PI) / 3), trigonalPyramidY, trigonalPyramidRadius * Math.sin((4 * Math.PI) / 3)],
      ],
    },
    2: {
      shape: "弯曲形",
      angle: "104.5°",
      geometry: "sp³：典型 H₂O 弯曲形，H-O-H = 104.5°",
      loneIndices: [0, 1],
      angleOverrides: { default: 104.5 },
      directions: [
        [0.72, 0.68, 0.22],
        [-0.72, 0.68, -0.22],
        [Math.sin(waterHalfAngle), -Math.cos(waterHalfAngle), 0],
        [-Math.sin(waterHalfAngle), -Math.cos(waterHalfAngle), 0],
      ],
    },
    3: {
      shape: "单键四面体电子域",
      angle: "—",
      geometry: "sp³：3 对孤对电子只留下 1 个成键轨道",
      loneIndices: [0, 1, 2],
      directions: [
        [1, 1, 1],
        [1, -1, -1],
        [-1, 1, -1],
        [-1, -1, 1],
      ],
    },
  },
  sp3d: {
    1: {
      shape: "跷跷板形",
      angle: "87° / 102° / 173°",
      geometry: "sp³d：典型 SF₄ 跷跷板形，实际角约 87° / 102° / 173°",
      loneIndices: [0],
      angleOverrides: { "90": 87, "120": 102, "180": 173 },
      directions: [
        tbp.eqA,
        tbp.eqB,
        tbp.eqC,
        tbp.axUp,
        tbp.axDown,
      ],
    },
    2: {
      shape: "T 形",
      angle: "87.5° / 175°",
      geometry: "sp³d：典型 ClF₃ T 形，实际角约 87.5° / 175°",
      loneIndices: [0, 1],
      angleOverrides: { "90": 87.5, "180": 175 },
      directions: [
        tbp.eqA,
        tbp.eqB,
        tbp.eqC,
        tbp.axUp,
        tbp.axDown,
      ],
    },
    3: {
      shape: "线形",
      angle: "180°",
      geometry: "sp³d：3 对孤对电子占据赤道位置，剩余两个轴向成键轨道",
      loneIndices: [0, 1, 2],
      directions: [
        tbp.eqA,
        tbp.eqB,
        tbp.eqC,
        tbp.axUp,
        tbp.axDown,
      ],
    },
  },
  sp3d2: {
    1: {
      shape: "方锥形",
      angle: "84.8° / 89.529°",
      geometry: "sp³d²：典型 BrF₅ 方锥形，实际角约 84.8° / 89.529°",
      loneIndices: [0],
      angleOverrides: { "90": 84.8, planar90: 89.529 },
      directions: [
        oct.axUp,
        oct.axDown,
        oct.planeX,
        oct.planeNegX,
        oct.planeZ,
        oct.planeNegZ,
      ],
    },
    2: {
      shape: "平方平面",
      angle: "90° / 180°",
      geometry: "sp³d²：2 对相对孤对电子形成平方平面",
      loneIndices: [0, 1],
      directions: [
        oct.axUp,
        oct.axDown,
        oct.planeX,
        oct.planeNegX,
        oct.planeZ,
        oct.planeNegZ,
      ],
    },
    3: {
      shape: "T 形八面体电子域",
      angle: "90°",
      geometry: "sp³d²：3 对孤对电子留下 T 形成键轨道",
      loneIndices: [0, 1, 2],
      directions: [
        oct.axUp,
        oct.axDown,
        oct.planeX,
        oct.planeNegX,
        oct.planeZ,
        oct.planeNegZ,
      ],
    },
    4: {
      shape: "线形",
      angle: "180°",
      geometry: "sp³d²：4 对孤对电子留下两个相对成键轨道",
      loneIndices: [2, 3, 4, 5],
      directions: [
        oct.axUp,
        oct.axDown,
        oct.planeX,
        oct.planeNegX,
        oct.planeZ,
        oct.planeNegZ,
      ],
    },
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

const lonePairMaterial = new THREE.MeshPhysicalMaterial({
  color: 0xff8fd7,
  emissive: 0x4a1038,
  roughness: 0.34,
  clearcoat: 0.4,
  transparent: true,
  opacity: 0.9,
});

let activeKey = "sp";
let lonePairs = 0;
let playFrame = 0;
let randomSeed = 12;

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

function makeLobe(direction, index, orbitalLabel, isLonePair) {
  const group = new THREE.Group();
  group.userData.isLonePairOrbital = isLonePair;
  const dir = new THREE.Vector3(...direction).normalize();
  const colorMaterial = isLonePair ? lonePairMaterial : lobeMaterials[index % lobeMaterials.length];
  const minorMaterial = isLonePair ? lonePairMaterial : lobeMaterials[(index + 1) % lobeMaterials.length];

  const main = new THREE.Mesh(new THREE.SphereGeometry(0.48, 48, 24), colorMaterial.clone());
  main.scale.set(isLonePair ? 0.82 : 0.72, isLonePair ? 1.75 : 2.05, isLonePair ? 0.82 : 0.72);
  main.position.copy(dir.clone().multiplyScalar(1.24));
  orientAlong(main, dir);
  main.userData.isSurface = true;
  group.add(main);

  const minor = new THREE.Mesh(
    new THREE.SphereGeometry(0.34, 36, 18),
    minorMaterial.clone(),
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
          color: minorMaterial.color.getHex(),
        },
      ],
      900,
    ),
  );

  if (!isLonePair) {
    const bond = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 2.95, 18), bondMaterial.clone());
    bond.position.copy(dir.clone().multiplyScalar(0.92));
    orientAlong(bond, dir);
    group.add(bond);
  }

  const label = isLonePair
    ? makeLabel(text("lonePairLabel"), "#ffffff", "#ff8fd7")
    : makeLabel(`${orbitalLabel} ${text("orbital")}`, "#eef7f7", "#39d7cc");
  label.position.copy(dir.clone().multiplyScalar(2.55));
  group.add(label);

  return group;
}

function makePiBond(axisName, index) {
  const group = new THREE.Group();
  group.userData.isUnhybridized = true;
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

  const label = makeLabel(`${axisName} ${text("orbital")}`, "#ffffff", "#b587ff");
  label.position.copy(axis.clone().multiplyScalar(2.15));
  group.add(label);
  return group;
}

function addAngleMarkers(directions, lonePairSet, angleOverrides = null) {
  const bonding = directions
    .map((direction, index) => ({ direction: new THREE.Vector3(...direction).normalize(), index }))
    .filter((item) => !lonePairSet.has(item.index));

  if (bonding.length < 2) return;

  const pairs = [];
  for (let i = 0; i < bonding.length; i += 1) {
    for (let j = i + 1; j < bonding.length; j += 1) {
      const theta = bonding[i].direction.angleTo(bonding[j].direction);
      const degrees = THREE.MathUtils.radToDeg(theta);
      if (degrees < 170 || bonding.length === 2) {
        pairs.push({ a: bonding[i].direction, b: bonding[j].direction, degrees });
      }
    }
  }

  pairs.forEach((pair, index) => {
    hybridRoot.add(
      makeAngleMarker(
        pair.a,
        pair.b,
        pair.degrees,
        1.12 + (index % 4) * 0.18,
        getAngleLabel(pair.a, pair.b, pair.degrees, angleOverrides),
      ),
    );
  });
}

function makeAngleMarker(a, b, degrees, radius, labelText = formatAngle(degrees)) {
  const theta = a.angleTo(b);
  const points = [];
  const steps = 40;

  if (Math.abs(Math.PI - theta) < 0.001) {
    const axis = Math.abs(a.y) < 0.9
      ? new THREE.Vector3().crossVectors(a, new THREE.Vector3(0, 1, 0)).normalize()
      : new THREE.Vector3().crossVectors(a, new THREE.Vector3(1, 0, 0)).normalize();
    for (let step = 0; step <= steps; step += 1) {
      const q = new THREE.Quaternion().setFromAxisAngle(axis, (Math.PI * step) / steps);
      points.push(a.clone().applyQuaternion(q).multiplyScalar(radius));
    }
  } else {
    const sinTheta = Math.sin(theta);
    for (let step = 0; step <= steps; step += 1) {
      const t = step / steps;
      const point = a
        .clone()
        .multiplyScalar(Math.sin((1 - t) * theta) / sinTheta)
        .add(b.clone().multiplyScalar(Math.sin(t * theta) / sinTheta))
        .normalize()
        .multiplyScalar(radius);
      points.push(point);
    }
  }

  const group = new THREE.Group();
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const line = new THREE.Line(
    geometry,
    new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8, depthTest: false }),
  );
  line.renderOrder = 12;
  group.add(line);

  const label = makeAngleLabel(labelText);
  const labelPoint = points[Math.floor(points.length / 2)].clone().normalize().multiplyScalar(radius + 0.48);
  label.position.copy(labelPoint);
  group.add(label);
  return group;
}

function formatAngle(degrees) {
  const rounded = Number(degrees.toFixed(3));
  return `${rounded}°`;
}

function getAngleLabel(a, b, degrees, angleOverrides) {
  if (!angleOverrides) return formatAngle(degrees);
  if (typeof angleOverrides.default === "number") return formatAngle(angleOverrides.default);

  const bothPlanar = Math.abs(a.y) < 0.05 && Math.abs(b.y) < 0.05;
  if (bothPlanar && typeof angleOverrides.planar90 === "number" && Math.abs(degrees - 90) < 8) {
    return formatAngle(angleOverrides.planar90);
  }

  const nearest = Math.round(degrees / 30) * 30;
  const exactKey = String(Math.round(degrees));
  const nearestKey = String(nearest);
  if (typeof angleOverrides[exactKey] === "number") return formatAngle(angleOverrides[exactKey]);
  if (typeof angleOverrides[nearestKey] === "number") return formatAngle(angleOverrides[nearestKey]);
  return formatAngle(degrees);
}

function makeAngleLabel(text) {
  const labelCanvas = document.createElement("canvas");
  labelCanvas.width = 160;
  labelCanvas.height = 92;
  const ctx = labelCanvas.getContext("2d");
  ctx.clearRect(0, 0, labelCanvas.width, labelCanvas.height);
  ctx.fillStyle = "rgba(7, 16, 19, 0.86)";
  roundRect(ctx, 18, 18, 124, 56, 28);
  ctx.fill();
  ctx.strokeStyle = "#f0b84c";
  ctx.lineWidth = 5;
  ctx.stroke();
  ctx.fillStyle = "#ffffff";
  ctx.font = "800 32px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, 80, 47);

  const texture = new THREE.CanvasTexture(labelCanvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false, depthTest: false }),
  );
  sprite.scale.set(0.72, 0.42, 0.42);
  sprite.renderOrder = 14;
  sprite.userData.isLabel = true;
  return sprite;
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

function getMaxLonePairs(entry) {
  return Math.max(0, entry.directions.length - 2);
}

function getLayout(keyName, entry) {
  const variant = lonePairLayouts[keyName]?.[lonePairs];
  const directions = variant?.directions ?? entry.directions;
  const loneIndices = variant?.loneIndices ?? entry.loneOrder.slice(0, lonePairs);
  return {
    directions,
    lonePairSet: new Set(loneIndices),
    shape: variant?.shape ?? entry.shape,
    angle: variant?.angle ?? entry.angle,
    geometry: variant?.geometry,
    angleOverrides: variant?.angleOverrides,
  };
}

function renderHybrid(keyName) {
  activeKey = keyName;
  const entry = data[keyName];
  lonePairs = Math.min(lonePairs, getMaxLonePairs(entry));
  const layout = getLayout(keyName, entry);
  clearGroup(atomicRoot);
  clearGroup(hybridRoot);

  const atomicCenter = new THREE.Mesh(new THREE.SphereGeometry(0.24, 48, 24), centerMaterial.clone());
  atomicRoot.add(atomicCenter);
  const atomicTitle = makeLabel(text("atomicOrbitals"), "#eef7f7", "#f0b84c");
  atomicTitle.position.set(0, 2.5, 0);
  atomicRoot.add(atomicTitle);
  entry.atomic.forEach((orbital, index) => atomicRoot.add(makeAtomicOrbital(orbital, index)));

  const center = new THREE.Mesh(new THREE.SphereGeometry(0.34, 48, 24), centerMaterial.clone());
  hybridRoot.add(center);
  const hybridTitle = makeLabel(text("hybridOrbitals"), "#eef7f7", "#39d7cc");
  hybridTitle.position.set(0, 2.75, 0);
  hybridRoot.add(hybridTitle);

  layout.directions.forEach((direction, index) => {
    hybridRoot.add(makeLobe(direction, index, entry.label, layout.lonePairSet.has(index)));
  });
  addAngleMarkers(layout.directions, layout.lonePairSet, layout.angleOverrides);
  entry.pi.forEach((axisName, index) => hybridRoot.add(makePiBond(axisName, index)));

  title.textContent = entry.label;
  const bondingOrbitals = layout.directions.length - lonePairs;
  geometry.textContent = layoutGeometryText(layout, entry, bondingOrbitals);
  count.textContent = layout.directions.length;
  shape.textContent = localShape(layout.shape);
  angle.textContent = layout.angle;
  lonePairCount.textContent = lonePairs;
  lonePairMinus.disabled = lonePairs === 0;
  lonePairPlus.disabled = lonePairs === getMaxLonePairs(entry);
  updateLonePairBar(getMaxLonePairs(entry));

  selector.querySelectorAll("button").forEach((button) => {
    button.classList.toggle("active", button.dataset.key === keyName);
  });

  applyProgress(Number(mixProgress.value) / 100);
}

function updateLonePairBar(maxLonePairs) {
  lonePairBar.innerHTML = "";
  lonePairBar.style.setProperty("--lp-max", Math.max(1, maxLonePairs));

  if (maxLonePairs === 0) {
    const segment = document.createElement("span");
    segment.className = "lone-pair-segment disabled";
    lonePairBar.append(segment);
    return;
  }

  for (let index = 0; index < maxLonePairs; index += 1) {
    const segment = document.createElement("span");
    segment.className = `lone-pair-segment${index < lonePairs ? " active" : ""}`;
    lonePairBar.append(segment);
  }
}

function applyLanguage() {
  document.documentElement.lang = currentLang === "zh" ? "zh-CN" : "en";
  document.querySelectorAll("[data-i18n]").forEach((node) => {
    node.textContent = text(node.dataset.i18n);
  });
  languageSwitch.querySelectorAll("button").forEach((button) => {
    button.classList.toggle("active", button.dataset.lang === currentLang);
  });
  renderHybrid(activeKey);
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
    if (object.userData.isLabel) {
      const unhybridizedParent = findUserDataInParents(object, "isUnhybridized");
      const lonePairParent = findUserDataInParents(object, "isLonePairOrbital");
      object.visible =
        showLabels.checked &&
        !(unhybridizedParent && !showUnhybridized.checked) &&
        !(lonePairParent && !showLonePairs.checked);
    }
  });
}

function setVisualMode() {
  const cloud = cloudMode.checked;
  root.traverse((object) => {
    const hideUnhybridized = findUserDataInParents(object, "isUnhybridized") && !showUnhybridized.checked;
    const hideLonePair = findUserDataInParents(object, "isLonePairOrbital") && !showLonePairs.checked;
    if (object.userData.isUnhybridized) object.visible = !hideUnhybridized;
    if (object.userData.isLonePairOrbital) object.visible = !hideLonePair;
    if (object.userData.isSurface) object.visible = !cloud && !hideUnhybridized && !hideLonePair;
    if (object.userData.isCloud) object.visible = cloud && !hideUnhybridized && !hideLonePair;
  });
  setLabelsVisible();
}

function findUserDataInParents(object, key) {
  let current = object;
  while (current) {
    if (current.userData?.[key]) return true;
    current = current.parent;
  }
  return false;
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
  if (progress < 0.34) processLabel.textContent = text("processAtomic");
  else if (progress < 0.78) processLabel.textContent = text("processMixing");
  else processLabel.textContent = text("processHybrid");
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

selector.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-key]");
  if (!button) return;
  renderHybrid(button.dataset.key);
});

languageSwitch.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-lang]");
  if (!button || button.dataset.lang === currentLang) return;
  currentLang = button.dataset.lang;
  applyLanguage();
});

lonePairMinus.addEventListener("click", () => {
  lonePairs = Math.max(0, lonePairs - 1);
  renderHybrid(activeKey);
});

lonePairPlus.addEventListener("click", () => {
  lonePairs = Math.min(getMaxLonePairs(data[activeKey]), lonePairs + 1);
  renderHybrid(activeKey);
});

autoRotate.addEventListener("change", () => {
  controls.autoRotate = autoRotate.checked;
});

showLabels.addEventListener("change", setLabelsVisible);
cloudMode.addEventListener("change", setVisualMode);
showUnhybridized.addEventListener("change", setVisualMode);
showLonePairs.addEventListener("change", setVisualMode);

mixProgress.addEventListener("input", () => {
  cancelAnimationFrame(playFrame);
  applyProgress(Number(mixProgress.value) / 100);
});

playProcess.addEventListener("click", playFormation);

window.addEventListener("resize", resize);

function tick() {
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}

resize();
applyLanguage();
document.body.classList.add("ready");
tick();
