import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// ─── Procedural Car (Audi R8 style) ────────────────────────────────────────
function buildCar(scene) {
  const car = new THREE.Group();

  const bodyMat = new THREE.MeshStandardMaterial({ color: 0xdcdce0, metalness: 0.85, roughness: 0.12, envMapIntensity: 1.0 });
  const glassMat = new THREE.MeshStandardMaterial({ color: 0x1a2a3a, metalness: 0.1, roughness: 0.0, transparent: true, opacity: 0.45 });
  const darkMat  = new THREE.MeshStandardMaterial({ color: 0x0a0a0a, metalness: 0.3, roughness: 0.6 });
  const rimMat   = new THREE.MeshStandardMaterial({ color: 0x888898, metalness: 1.0, roughness: 0.05 });
  const tireMat  = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.0, roughness: 0.9 });
  const lightMat = new THREE.MeshStandardMaterial({ color: 0xfff0aa, emissive: 0xfff0aa, emissiveIntensity: 2.0, metalness: 0, roughness: 0.2 });
  const tailMat  = new THREE.MeshStandardMaterial({ color: 0xff2200, emissive: 0xff1100, emissiveIntensity: 1.2, metalness: 0, roughness: 0.2 });

  // ── Main body (low-slung sports car) ──
  const bodyGeo = new THREE.BoxGeometry(2.0, 0.38, 4.5);
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.y = 0.42;
  car.add(body);

  // Curved roof cabin
  const cabinGeo = new THREE.BoxGeometry(1.6, 0.42, 1.9);
  const cabin = new THREE.Mesh(cabinGeo, bodyMat);
  cabin.position.set(0, 0.81, -0.1);
  car.add(cabin);

  // Roof glass
  const roofGlassGeo = new THREE.BoxGeometry(1.38, 0.06, 1.7);
  const roofGlass = new THREE.Mesh(roofGlassGeo, glassMat);
  roofGlass.position.set(0, 1.04, -0.1);
  car.add(roofGlass);

  // Windscreen
  const windGeo = new THREE.BoxGeometry(1.5, 0.42, 0.08);
  const wind = new THREE.Mesh(windGeo, glassMat);
  wind.position.set(0, 0.82, 0.88);
  wind.rotation.x = -0.28;
  car.add(wind);

  // Rear windscreen
  const rearWindGeo = new THREE.BoxGeometry(1.38, 0.38, 0.08);
  const rearWind = new THREE.Mesh(rearWindGeo, glassMat);
  rearWind.position.set(0, 0.82, -1.07);
  rearWind.rotation.x = 0.28;
  car.add(rearWind);

  // Side sills
  [-1.05, 1.05].forEach(x => {
    const sillGeo = new THREE.BoxGeometry(0.1, 0.12, 3.8);
    const sill = new THREE.Mesh(sillGeo, darkMat);
    sill.position.set(x, 0.26, -0.1);
    car.add(sill);
  });

  // Front splitter
  const splitterGeo = new THREE.BoxGeometry(1.9, 0.06, 0.4);
  const splitter = new THREE.Mesh(splitterGeo, darkMat);
  splitter.position.set(0, 0.24, 2.25);
  car.add(splitter);

  // Front bumper
  const bumperGeo = new THREE.BoxGeometry(2.0, 0.28, 0.22);
  const bumper = new THREE.Mesh(bumperGeo, bodyMat);
  bumper.position.set(0, 0.38, 2.35);
  car.add(bumper);

  // Rear bumper
  const rearBumperGeo = new THREE.BoxGeometry(2.0, 0.28, 0.22);
  const rearBumper = new THREE.Mesh(rearBumperGeo, bodyMat);
  rearBumper.position.set(0, 0.38, -2.35);
  car.add(rearBumper);

  // Rear diffuser
  const diffuserGeo = new THREE.BoxGeometry(1.7, 0.1, 0.35);
  const diffuser = new THREE.Mesh(diffuserGeo, darkMat);
  diffuser.position.set(0, 0.22, -2.4);
  car.add(diffuser);

  // Headlights (pair)
  [[-0.7, 2.3], [0.7, 2.3]].forEach(([x, z]) => {
    const hlGeo = new THREE.BoxGeometry(0.38, 0.1, 0.06);
    const hl = new THREE.Mesh(hlGeo, lightMat);
    hl.position.set(x, 0.52, z);
    car.add(hl);
    // DRL strip
    const drlGeo = new THREE.BoxGeometry(0.28, 0.04, 0.04);
    const drl = new THREE.Mesh(drlGeo, lightMat);
    drl.position.set(x, 0.44, z + 0.05);
    car.add(drl);
  });

  // Tail lights (pair)
  [[-0.7, -2.3], [0.7, -2.3]].forEach(([x, z]) => {
    const tlGeo = new THREE.BoxGeometry(0.42, 0.08, 0.06);
    const tl = new THREE.Mesh(tlGeo, tailMat);
    tl.position.set(x, 0.52, z);
    car.add(tl);
  });

  // Wheels (4)
  const wheelPositions = [[-1.05, 0.32, 1.4], [1.05, 0.32, 1.4], [-1.05, 0.32, -1.5], [1.05, 0.32, -1.5]];
  wheelPositions.forEach(([x, y, z]) => {
    const tireGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.22, 20);
    const tire = new THREE.Mesh(tireGeo, tireMat);
    tire.rotation.z = Math.PI / 2;
    tire.position.set(x, y, z);
    car.add(tire);

    const rimGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.24, 8);
    const rim = new THREE.Mesh(rimGeo, rimMat);
    rim.rotation.z = Math.PI / 2;
    rim.position.set(x, y, z);
    car.add(rim);

    // Spoke effect (5 box spokes)
    for (let s = 0; s < 5; s++) {
      const spokeGeo = new THREE.BoxGeometry(0.04, 0.18, 0.22);
      const spoke = new THREE.Mesh(spokeGeo, rimMat);
      spoke.rotation.z = (s / 5) * Math.PI * 2;
      spoke.position.set(x, y, z);
      car.add(spoke);
    }
  });

  // Rear spoiler
  const spoilerGeo = new THREE.BoxGeometry(1.8, 0.06, 0.25);
  const spoiler = new THREE.Mesh(spoilerGeo, bodyMat);
  spoiler.position.set(0, 1.06, -1.95);
  car.add(spoiler);
  const spoilerLGeo = new THREE.BoxGeometry(0.06, 0.22, 0.2);
  [-0.8, 0.8].forEach(x => {
    const leg = new THREE.Mesh(spoilerLGeo, darkMat);
    leg.position.set(x, 0.96, -1.95);
    car.add(leg);
  });

  // Side air intakes
  [-1.02, 1.02].forEach(x => {
    const intakeGeo = new THREE.BoxGeometry(0.06, 0.14, 0.4);
    const intake = new THREE.Mesh(intakeGeo, darkMat);
    intake.position.set(x, 0.46, -0.5);
    car.add(intake);
  });

  car.traverse(c => { if (c.isMesh) c.castShadow = c.receiveShadow = true; });
  scene.add(car);
  return { car, bodyMat };
}

// ─── Procedural Bike (Ducati Streetfighter style) ──────────────────────────
function buildBike(scene) {
  const bike = new THREE.Group();

  const bodyMat = new THREE.MeshStandardMaterial({ color: 0xcc0000, metalness: 0.82, roughness: 0.12, envMapIntensity: 1.4 });
  const frameMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, metalness: 0.7, roughness: 0.3 });
  const engineMat = new THREE.MeshStandardMaterial({ color: 0x2a2a2a, metalness: 0.6, roughness: 0.4 });
  const rimMat   = new THREE.MeshStandardMaterial({ color: 0xd4aa30, metalness: 1.0, roughness: 0.05 });
  const tireMat  = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.0, roughness: 0.95 });
  const glassMat = new THREE.MeshStandardMaterial({ color: 0x0a1520, metalness: 0.0, roughness: 0.0, transparent: true, opacity: 0.4 });
  const chromeMat= new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 1.0, roughness: 0.02 });
  const lightMat = new THREE.MeshStandardMaterial({ color: 0xfff0aa, emissive: 0xfff088, emissiveIntensity: 2.5 });
  const tailMat  = new THREE.MeshStandardMaterial({ color: 0xff2200, emissive: 0xff1100, emissiveIntensity: 1.5 });

  // ── Frame / trellis ──
  const frameGeo = new THREE.BoxGeometry(0.1, 0.55, 1.3);
  const frame = new THREE.Mesh(frameGeo, frameMat);
  frame.position.set(0, 0.72, 0);
  bike.add(frame);

  // Sub-frame (rear)
  const subGeo = new THREE.BoxGeometry(0.08, 0.3, 0.7);
  const sub = new THREE.Mesh(subGeo, frameMat);
  sub.position.set(0, 0.92, -0.7);
  sub.rotation.x = -0.2;
  bike.add(sub);

  // ── Fuel tank ──
  const tankGeo = new THREE.BoxGeometry(0.52, 0.28, 0.75);
  const tank = new THREE.Mesh(tankGeo, bodyMat);
  tank.position.set(0, 1.04, 0.12);
  bike.add(tank);

  // Tank side fairings
  [-0.27, 0.27].forEach(x => {
    const fairingGeo = new THREE.BoxGeometry(0.06, 0.26, 0.65);
    const fairing = new THREE.Mesh(fairingGeo, bodyMat);
    fairing.position.set(x, 1.0, 0.1);
    bike.add(fairing);
  });

  // ── Seat ──
  const seatGeo = new THREE.BoxGeometry(0.34, 0.09, 0.6);
  const seat = new THREE.Mesh(seatGeo, new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0, roughness: 0.9 }));
  seat.position.set(0, 1.0, -0.5);
  bike.add(seat);

  // ── Headlight / nose fairing ──
  const noseGeo = new THREE.BoxGeometry(0.46, 0.3, 0.24);
  const nose = new THREE.Mesh(noseGeo, bodyMat);
  nose.position.set(0, 0.92, 0.74);
  bike.add(nose);

  // Headlight lens
  const hlGeo = new THREE.BoxGeometry(0.28, 0.12, 0.06);
  const hl = new THREE.Mesh(hlGeo, lightMat);
  hl.position.set(0, 0.9, 0.87);
  bike.add(hl);

  // ── Tail cowl ──
  const tailCowlGeo = new THREE.BoxGeometry(0.3, 0.14, 0.35);
  const tailCowl = new THREE.Mesh(tailCowlGeo, bodyMat);
  tailCowl.position.set(0, 1.04, -0.95);
  bike.add(tailCowl);

  // Tail light
  const tlGeo = new THREE.BoxGeometry(0.24, 0.06, 0.04);
  const tl = new THREE.Mesh(tlGeo, tailMat);
  tl.position.set(0, 0.98, -1.14);
  bike.add(tl);

  // ── Exhaust pipes ──
  [[-0.18, 0.3], [0.18, 0.3]].forEach(([x, y]) => {
    const exGeo = new THREE.CylinderGeometry(0.038, 0.044, 0.9, 10);
    const ex = new THREE.Mesh(exGeo, chromeMat);
    ex.rotation.z = Math.PI / 2;
    ex.position.set(x, y, -0.5);
    bike.add(ex);
  });

  // ── Engine block ──
  const engGeo = new THREE.BoxGeometry(0.38, 0.35, 0.55);
  const eng = new THREE.Mesh(engGeo, engineMat);
  eng.position.set(0, 0.45, 0.0);
  bike.add(eng);

  // Engine fins
  for (let i = 0; i < 5; i++) {
    const finGeo = new THREE.BoxGeometry(0.42, 0.025, 0.06);
    const fin = new THREE.Mesh(finGeo, engineMat);
    fin.position.set(0, 0.33 + i * 0.06, 0.05);
    bike.add(fin);
  }

  // ── Front forks ──
  [[-0.08, 0.08]].forEach(() => {
    [-0.08, 0.08].forEach(x => {
      const forkGeo = new THREE.CylinderGeometry(0.022, 0.022, 0.75, 8);
      const fork = new THREE.Mesh(forkGeo, rimMat);
      fork.position.set(x, 0.52, 0.78);
      fork.rotation.x = -0.1;
      bike.add(fork);
    });
  });

  // ── Triple clamp ──
  const clampGeo = new THREE.BoxGeometry(0.22, 0.06, 0.12);
  const clamp = new THREE.Mesh(clampGeo, frameMat);
  clamp.position.set(0, 0.9, 0.76);
  bike.add(clamp);

  // ── Handlebar ──
  const hbarGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.65, 8);
  const hbar = new THREE.Mesh(hbarGeo, chromeMat);
  hbar.rotation.z = Math.PI / 2;
  hbar.position.set(0, 1.08, 0.55);
  bike.add(hbar);

  // Mirrors
  [-0.35, 0.35].forEach(x => {
    const mirrorStemGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.14, 6);
    const stem = new THREE.Mesh(mirrorStemGeo, chromeMat);
    stem.rotation.z = 0.4;
    stem.position.set(x, 1.14, 0.55);
    bike.add(stem);
    const mirrorGeo = new THREE.BoxGeometry(0.1, 0.07, 0.02);
    const mirror = new THREE.Mesh(mirrorGeo, glassMat);
    mirror.position.set(x > 0 ? x + 0.04 : x - 0.04, 1.2, 0.52);
    bike.add(mirror);
  });

  // ── Swing arm ──
  const swingGeo = new THREE.BoxGeometry(0.06, 0.06, 0.7);
  const swing = new THREE.Mesh(swingGeo, frameMat);
  swing.position.set(0, 0.44, -0.65);
  swing.rotation.x = 0.1;
  bike.add(swing);

  // ── Wheels ──
  const wheelData = [
    { pos: [0, 0.34, 0.85], front: true },
    { pos: [0, 0.34, -1.05], front: false },
  ];
  wheelData.forEach(({ pos: [x, y, z], front }) => {
    const radius = front ? 0.32 : 0.32;

    // Tire
    const tireGeo = new THREE.CylinderGeometry(radius, radius, 0.18, 24);
    const tire = new THREE.Mesh(tireGeo, tireMat);
    tire.rotation.z = Math.PI / 2;
    tire.position.set(x, y, z);
    bike.add(tire);

    // Rim
    const rimGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.19, 7);
    const rim = new THREE.Mesh(rimGeo, rimMat);
    rim.rotation.z = Math.PI / 2;
    rim.position.set(x, y, z);
    bike.add(rim);

    // Hub
    const hubGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.2, 8);
    const hub = new THREE.Mesh(hubGeo, chromeMat);
    hub.rotation.z = Math.PI / 2;
    hub.position.set(x, y, z);
    bike.add(hub);

    // Spokes (7)
    for (let s = 0; s < 7; s++) {
      const spokeGeo = new THREE.BoxGeometry(0.02, 0.17, 0.18);
      const spoke = new THREE.Mesh(spokeGeo, rimMat);
      spoke.rotation.z = (s / 7) * Math.PI * 2;
      spoke.position.set(x, y, z);
      bike.add(spoke);
    }

    // Brake disc
    const discGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.02, 16);
    const disc = new THREE.Mesh(discGeo, new THREE.MeshStandardMaterial({ color: 0x444455, metalness: 0.9, roughness: 0.2 }));
    disc.rotation.z = Math.PI / 2;
    disc.position.set(x + (front ? -0.12 : 0.12), y, z);
    bike.add(disc);
  });

  // ── Footpegs ──
  [-0.22, 0.22].forEach(x => {
    const pegGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.18, 6);
    const peg = new THREE.Mesh(pegGeo, chromeMat);
    peg.rotation.z = Math.PI / 2;
    peg.position.set(x, 0.28, -0.3);
    bike.add(peg);
  });

  // ── Front fender ──
  const fenderGeo = new THREE.BoxGeometry(0.24, 0.1, 0.38);
  const fender = new THREE.Mesh(fenderGeo, bodyMat);
  fender.position.set(0, 0.58, 0.85);
  bike.add(fender);

  // ── Rear fender ──
  const rearFenderGeo = new THREE.BoxGeometry(0.22, 0.08, 0.3);
  const rearFender = new THREE.Mesh(rearFenderGeo, bodyMat);
  rearFender.position.set(0, 0.58, -0.95);
  bike.add(rearFender);

  bike.traverse(c => { if (c.isMesh) { c.castShadow = true; c.receiveShadow = true; } });
  scene.add(bike);
  return { bike, bodyMat };
}

// ─── Sticker geometry (flat plane on bike surface) ─────────────────────────
function buildStickers(scene, bike) {
  const stickers = new THREE.Group();
  const stickerConfigs = [
    { pos: [0.27, 1.0, 0.12], rot: [0, 0, -Math.PI / 2], scale: [0.22, 0.1, 1], color: 0xffffff, label: 'DUCATI' },
    { pos: [0, 1.08, 0.7], rot: [0, 0, 0], scale: [0.3, 0.1, 1], color: 0xffc000, label: 'RACING' },
    { pos: [-0.27, 0.96, -0.1], rot: [0, 0, Math.PI / 2], scale: [0.18, 0.08, 1], color: 0xffffff, label: 'FLAG' },
  ];

  stickerConfigs.forEach(({ pos, rot, scale, color }) => {
    const geo = new THREE.PlaneGeometry(scale[0], scale[1]);
    const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(...pos);
    mesh.rotation.set(...rot);
    stickers.add(mesh);
  });

  bike.add(stickers);
  scene.add(bike);
  return stickers;
}

// ─── Ground plane + grid ───────────────────────────────────────────────────
function buildGround(scene) {
  const groundGeo = new THREE.PlaneGeometry(30, 60);
  const groundMat = new THREE.MeshStandardMaterial({ color: 0x0f1115, roughness: 0.9, metalness: 0.0 });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = 0;
  ground.receiveShadow = true;
  scene.add(ground);

  // Glowing grid lines
  const gridHelper = new THREE.GridHelper(30, 30, 0x1a2030, 0x1a2030);
  gridHelper.position.y = 0.001;
  scene.add(gridHelper);

  // Gradient ground glow disc
  const discGeo = new THREE.CircleGeometry(3.5, 32);
  const discMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.04 });
  const disc = new THREE.Mesh(discGeo, discMat);
  disc.rotation.x = -Math.PI / 2;
  disc.position.y = 0.002;
  scene.add(disc);
}

// ─── Main component ────────────────────────────────────────────────────────
const HeroScene3D = forwardRef(function HeroScene3D({ onPhaseChange, selectedColor, activeStickers }, ref) {
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);

  // Expose a method to update bike color externally
  useImperativeHandle(ref, () => ({
    setBikeColor: (hexColor) => {
      if (sceneRef.current?.bikeMat) {
        sceneRef.current.bikeMat.color.set(hexColor);
      }
    },
    showStickers: (indices) => {
      if (sceneRef.current?.stickers) {
        sceneRef.current.stickers.children.forEach((s, i) => {
          gsap.to(s.material, { opacity: indices.includes(i) ? 0.92 : 0, duration: 0.5 });
        });
      }
    },
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // ── Renderer ──
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    // ── Scene ──
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f1115);
    scene.fog = new THREE.FogExp2(0x0f1115, 0.055);

    // ── Camera ──
    const camera = new THREE.PerspectiveCamera(42, canvas.clientWidth / canvas.clientHeight, 0.1, 200);
    camera.position.set(4.0, 1.8, 7.5);
    camera.lookAt(-0.3, 0.5, 0);

    // ── Lighting ──
    const ambient = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambient);

    // Key light (top-left warm)
    const keyLight = new THREE.DirectionalLight(0xfff5e0, 4.5);
    keyLight.position.set(-5, 9, 8);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(2048, 2048);
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 50;
    keyLight.shadow.camera.left = -8;
    keyLight.shadow.camera.right = 8;
    keyLight.shadow.camera.top = 8;
    keyLight.shadow.camera.bottom = -8;
    scene.add(keyLight);

    // Fill light (right cool)
    const fillLight = new THREE.DirectionalLight(0x8090ff, 1.8);
    fillLight.position.set(8, 5, -3);
    scene.add(fillLight);

    // Rim / backlight (orange — brand color)
    const rimLight = new THREE.DirectionalLight(0xf59e0b, 2.5);
    rimLight.position.set(0, 3, -10);
    scene.add(rimLight);

    // Front fill so model faces aren't black
    const frontFill = new THREE.DirectionalLight(0xffffff, 1.5);
    frontFill.position.set(2, 4, 14);
    scene.add(frontFill);

    // Ground bounce
    const groundLight = new THREE.HemisphereLight(0x4060a0, 0x202428, 1.2);
    scene.add(groundLight);

    // Spot accent for bike
    const spot = new THREE.SpotLight(0xffffff, 4.5, 15, Math.PI / 6, 0.5, 1.5);
    spot.position.set(0, 8, 0);
    spot.target.position.set(0, 0, 0);
    spot.castShadow = true;
    scene.add(spot);
    scene.add(spot.target);

    // ── Build world ──
    buildGround(scene);
    const { car, bodyMat: carBodyMat } = buildCar(scene);
    car.position.set(-0.4, 0, 0);
    car.rotation.y = -0.18;
    car.scale.set(1.25, 1.25, 1.25);

    const { bike, bodyMat: bikeBodyMat } = buildBike(scene);
    bike.position.set(0, 0, -80);   // far back, off-screen initially
    bike.rotation.y = Math.PI * 0.15;
    bike.scale.set(0.01, 0.01, 0.01);

    const stickers = buildStickers(scene, bike);

    // ── Particle field (ambient depth) ──
    const particlesGeo = new THREE.BufferGeometry();
    const count = 600;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * 40;
      positions[i * 3 + 1] = Math.random() * 8;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 60;
    }
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particlesMat = new THREE.PointsMaterial({ color: 0xf59e0b, size: 0.04, transparent: true, opacity: 0.35 });
    const particles = new THREE.Points(particlesGeo, particlesMat);
    scene.add(particles);

    // Store refs for external color/sticker updates
    sceneRef.current = { bikeMat: bikeBodyMat, stickers };

    // ── GSAP ScrollTrigger timeline ──
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: '#cinematic-hero',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1.2,
        onUpdate: (self) => {
          const p = self.progress;
          let phase = 'hero';
          if (p < 0.20) phase = 'hero';
          else if (p < 0.45) phase = 'drive';
          else if (p < 0.55) phase = 'transition';
          else if (p < 0.70) phase = 'spin';
          else if (p < 0.82) phase = 'paint';
          else if (p < 0.90) phase = 'stickers';
          else phase = 'preview';
          onPhaseChange?.(phase, p);
        },
      },
    });

    // Phase 1 (0→20%): Car hero — gentle rock
    tl.to(car.rotation, { y: 0.12, duration: 0.2 }, 0);

    // Phase 2 (20→45%): Car drives forward + camera follows
    tl.to(car.position, { z: 28, duration: 0.25, ease: 'power2.in' }, 0.2);
    tl.to(car.rotation, { y: -0.3, duration: 0.25 }, 0.2);
    tl.to(camera.position, { z: 6, x: 4, y: 2.8, duration: 0.25, ease: 'power1.inOut' }, 0.2);

    // Phase 3 (45→55%): Bike enters — fade in from depth
    tl.to(bike.position, { z: 0, duration: 0.1, ease: 'power2.out' }, 0.45);
    tl.to(bike.scale, { x: 1, y: 1, z: 1, duration: 0.1, ease: 'back.out(1.2)' }, 0.45);
    tl.to(camera.position, { x: 5.5, y: 3.2, z: 11, duration: 0.1 }, 0.45);

    // Phase 4 (55→70%): Bike slow 360° rotation
    tl.to(bike.rotation, { y: Math.PI * 2.15, duration: 0.15, ease: 'none' }, 0.55);

    // Phase 5 (70→82%): Camera moves to close-side beauty shot
    tl.to(camera.position, { x: 4.5, y: 2.5, z: 7, duration: 0.12 }, 0.70);
    tl.to(bike.rotation, { y: Math.PI * 2.45, duration: 0.12 }, 0.70);

    // Phase 7 (88→95%): Final beauty orbit angle
    tl.to(camera.position, { x: 6, y: 3.8, z: 9.5, duration: 0.07 }, 0.88);
    tl.to(spot, { intensity: 6, duration: 0.07 }, 0.88);
    tl.to(bike.rotation, { y: Math.PI * 2.62, duration: 0.07 }, 0.88);

    // ── Animation loop ──
    let animId;
    let t = 0;
    function animate() {
      animId = requestAnimationFrame(animate);
      t += 0.006;

      // Idle car rock (phase 0)
      if (car.position.z < 5) {
        car.position.y = Math.sin(t * 0.8) * 0.02;
      }

      // Bike idle sway (once visible)
      if (bike.scale.x > 0.5) {
        bike.position.y = Math.sin(t * 0.7) * 0.018;
      }

      // Particle drift
      particles.rotation.y = t * 0.01;

      camera.lookAt(-0.5 * (1 - Math.min(bike.scale.x, 1)), 0.65, 0);
      renderer.render(scene, camera);
    }
    animate();

    // ── Resize handler ──
    function onResize() {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    }
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
      ScrollTrigger.getAll().forEach(t => t.kill());
      renderer.dispose();
      scene.traverse(obj => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
          else obj.material.dispose();
        }
      });
    };
  }, []);

  // ── React to external color changes ──
  useEffect(() => {
    if (sceneRef.current?.bikeMat && selectedColor) {
      gsap.to(sceneRef.current.bikeMat.color, {
        r: parseInt(selectedColor.slice(1, 3), 16) / 255,
        g: parseInt(selectedColor.slice(3, 5), 16) / 255,
        b: parseInt(selectedColor.slice(5, 7), 16) / 255,
        duration: 0.8,
        ease: 'power2.out',
      });
    }
  }, [selectedColor]);

  // ── React to sticker toggles ──
  useEffect(() => {
    if (sceneRef.current?.stickers && activeStickers) {
      sceneRef.current.stickers.children.forEach((s, i) => {
        gsap.to(s.material, { opacity: activeStickers.includes(i) ? 0.92 : 0, duration: 0.5 });
      });
    }
  }, [activeStickers]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: '100%', height: '100%', display: 'block', outline: 'none' }}
      aria-label="3D Vehicle Customization Scene"
    />
  );
});

export default HeroScene3D;
