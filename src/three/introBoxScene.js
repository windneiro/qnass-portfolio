import * as THREE from 'three';
import { cyberAudio } from '../audio.js';

export class IntroBoxScene {
  constructor(options = {}) {
    this.overlay = document.getElementById('site-intro-overlay');
    this.canvas = document.getElementById('intro-box-canvas');
    this.hintBadge = document.getElementById('intro-hint-badge');
    this.onComplete = options.onComplete || (() => {});

    if (!this.canvas || !this.overlay) return;

    this.state = 'idle'; // 'idle' | 'bursting' | 'completed'
    this.clock = new THREE.Clock();
    this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();

    this.flyingItems = [];
    this.particles = [];
    this.burstStartTime = 0;

    this.init();
  }

  init() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    // 1. Scene, Camera, Renderer
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    this.camera.position.set(0, 0.2, 6.8);
    this.cameraTarget = new THREE.Vector3(0, 0, 0);
    this.camera.lookAt(this.cameraTarget);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // 2. Lighting (Void Mystery Spotlight)
    this.setupLighting();

    // 3. 3D Cardboard Mystery Box
    this.buildBox();

    // 4. Flying Items (Ruler, Pencils, Paper, Eraser, Clips, Pins, Sparks)
    this.buildFlyingItems();

    // 5. Burst Particles
    this.buildParticles();

    // 6. Events
    this.setupEvents();

    // 7. Animation Loop
    this.animate();
  }

  setupLighting() {
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
    this.scene.add(this.ambientLight);

    // Warm overhead key spotlight
    this.keyLight = new THREE.SpotLight(0xfff2e0, 8.5, 18, Math.PI / 3.0, 0.6, 1.0);
    this.keyLight.position.set(2.5, 6.5, 4.5);
    this.keyLight.castShadow = true;
    this.keyLight.shadow.mapSize.width = 1024;
    this.keyLight.shadow.mapSize.height = 1024;
    this.scene.add(this.keyLight);

    // Subtle crimson rim backlight
    this.rimLight = new THREE.DirectionalLight(0xe3142a, 0.65);
    this.rimLight.position.set(-3.5, -2, -3);
    this.scene.add(this.rimLight);

    // Core explosion burst point light inside the box
    this.coreLight = new THREE.PointLight(0xffeed4, 0, 16, 1.5);
    this.coreLight.position.set(0, 0.1, 0);
    this.scene.add(this.coreLight);

    // Shadow Floor
    const floorGeo = new THREE.PlaneGeometry(16, 16);
    const floorMat = new THREE.ShadowMaterial({ opacity: 0.45 });
    this.floor = new THREE.Mesh(floorGeo, floorMat);
    this.floor.rotation.x = -Math.PI / 2;
    this.floor.position.y = -1.25;
    this.floor.receiveShadow = true;
    this.scene.add(this.floor);
  }

  // ─── PROCEDURAL TEXTURES ───
  createCardboardTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Kraft cardboard
    ctx.fillStyle = '#c79359';
    ctx.fillRect(0, 0, 512, 512);

    for (let y = 0; y < 512; y += 4) {
      ctx.fillStyle = (y % 8 === 0) ? 'rgba(150, 105, 60, 0.18)' : 'rgba(235, 190, 135, 0.14)';
      ctx.fillRect(0, y, 512, 2);
    }

    ctx.fillStyle = 'rgba(80, 50, 20, 0.15)';
    for (let i = 0; i < 500; i++) {
      ctx.fillRect(Math.random() * 512, Math.random() * 512, 1.5, 2);
    }

    // Packaging tape
    ctx.fillStyle = '#dba766';
    ctx.fillRect(185, 0, 142, 512);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
    ctx.fillRect(188, 0, 6, 512);
    ctx.fillRect(320, 0, 4, 512);

    // Shipping label
    ctx.fillStyle = '#f8f8fb';
    ctx.fillRect(36, 120, 230, 160);
    ctx.strokeStyle = '#18181f';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(36, 120, 230, 160);

    ctx.fillStyle = '#18181f';
    ctx.font = 'bold 22px monospace';
    ctx.fillText('QNASSIO // 01', 50, 156);

    ctx.fillStyle = '#e3142a';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText('PARCEL • PORTFOLIO 2026', 50, 180);

    // Barcode
    ctx.fillStyle = '#18181f';
    for (let b = 50; b < 250; b += Math.random() > 0.4 ? 6 : 10) {
      ctx.fillRect(b, 196, Math.random() > 0.5 ? 4 : 2, 52);
    }

    // Stamp
    ctx.fillStyle = '#3a2612';
    ctx.font = 'bold 36px monospace';
    ctx.fillText('↑↑ 📦', 350, 170);
    ctx.font = 'bold 14px monospace';
    ctx.fillText('CLICK TO UNPACK', 340, 200);

    const tex = new THREE.CanvasTexture(canvas);
    tex.minFilter = THREE.LinearFilter;
    return tex;
  }

  createPaperSketchTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 724;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#f8f8fb';
    ctx.fillRect(0, 0, 512, 724);

    // Grid dots
    ctx.fillStyle = 'rgba(150, 155, 170, 0.4)';
    for (let x = 24; x < 512; x += 24) {
      for (let y = 24; y < 724; y += 24) {
        ctx.fillRect(x, y, 1.5, 1.5);
      }
    }

    // UX diagrams
    ctx.strokeStyle = '#2b2d38';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(60, 80, 170, 320);

    ctx.beginPath();
    ctx.arc(95, 120, 16, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#4a4d5c';
    ctx.fillRect(125, 112, 80, 8);
    ctx.fillRect(125, 126, 50, 6);

    ctx.strokeStyle = '#e3142a';
    ctx.lineWidth = 2;
    ctx.strokeRect(80, 160, 130, 70);
    ctx.strokeRect(80, 245, 130, 50);

    ctx.fillStyle = '#e3142a';
    ctx.font = 'italic 16px sans-serif';
    ctx.fillText('«QNASSIO: PORTFOLIO UNPACKED»', 240, 130);

    ctx.strokeStyle = '#2b2d38';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(250, 145);
    ctx.lineTo(440, 145);
    ctx.lineTo(420, 240);
    ctx.lineTo(250, 240);
    ctx.closePath();
    ctx.stroke();

    const tex = new THREE.CanvasTexture(canvas);
    tex.minFilter = THREE.LinearFilter;
    return tex;
  }

  // ─── 3D BOX ───
  buildBox() {
    this.boxGroup = new THREE.Group();
    this.scene.add(this.boxGroup);

    this.cardboardMat = new THREE.MeshStandardMaterial({
      map: this.createCardboardTexture(),
      roughness: 0.82,
      metalness: 0.05
    });

    const boxW = 2.2;
    const boxH = 1.6;
    const boxD = 1.7;

    // Box main body
    this.boxBodyMesh = new THREE.Mesh(
      new THREE.BoxGeometry(boxW, boxH, boxD),
      this.cardboardMat
    );
    this.boxBodyMesh.castShadow = true;
    this.boxBodyMesh.receiveShadow = true;
    this.boxGroup.add(this.boxBodyMesh);

    // 4 Articulated Top Flaps
    this.boxFlaps = [];

    // Left flap
    this.flapLeftPivot = new THREE.Group();
    this.flapLeftPivot.position.set(-boxW / 2, boxH / 2, 0);
    this.boxGroup.add(this.flapLeftPivot);
    const flapLeft = new THREE.Mesh(new THREE.BoxGeometry(boxW / 2, 0.03, boxD), this.cardboardMat);
    flapLeft.position.set(boxW / 4, 0, 0);
    flapLeft.castShadow = true;
    this.flapLeftPivot.add(flapLeft);
    this.boxFlaps.push({ pivot: this.flapLeftPivot, axis: 'z', maxAngle: Math.PI * 0.85 });

    // Right flap
    this.flapRightPivot = new THREE.Group();
    this.flapRightPivot.position.set(boxW / 2, boxH / 2, 0);
    this.boxGroup.add(this.flapRightPivot);
    const flapRight = new THREE.Mesh(new THREE.BoxGeometry(boxW / 2, 0.03, boxD), this.cardboardMat);
    flapRight.position.set(-boxW / 4, 0, 0);
    flapRight.castShadow = true;
    this.flapRightPivot.add(flapRight);
    this.boxFlaps.push({ pivot: this.flapRightPivot, axis: 'z', maxAngle: -Math.PI * 0.85 });

    // Front flap
    this.flapFrontPivot = new THREE.Group();
    this.flapFrontPivot.position.set(0, boxH / 2, boxD / 2);
    this.boxGroup.add(this.flapFrontPivot);
    const flapFront = new THREE.Mesh(new THREE.BoxGeometry(boxW, 0.03, boxD / 2), this.cardboardMat);
    flapFront.position.set(0, 0, -boxD / 4);
    flapFront.castShadow = true;
    this.flapFrontPivot.add(flapFront);
    this.boxFlaps.push({ pivot: this.flapFrontPivot, axis: 'x', maxAngle: -Math.PI * 0.85 });

    // Back flap
    this.flapBackPivot = new THREE.Group();
    this.flapBackPivot.position.set(0, boxH / 2, -boxD / 2);
    this.boxGroup.add(this.flapBackPivot);
    const flapBack = new THREE.Mesh(new THREE.BoxGeometry(boxW, 0.03, boxD / 2), this.cardboardMat);
    flapBack.position.set(0, 0, boxD / 4);
    flapBack.castShadow = true;
    this.flapBackPivot.add(flapBack);
    this.boxFlaps.push({ pivot: this.flapBackPivot, axis: 'x', maxAngle: Math.PI * 0.85 });

    this.boxGroup.position.set(0, 0, 0);
    this.boxGroup.rotation.set(0.18, 0.38, 0);
  }

  // ─── 3D FLYING ITEMS (FLYING OUT OF THE BOX) ───
  buildFlyingItems() {
    this.flyingGroup = new THREE.Group();
    this.scene.add(this.flyingGroup);
    this.flyingItemsData = [];

    // Helper: create pencil
    const createPencil = (color) => {
      const g = new THREE.Group();
      const body = new THREE.Mesh(
        new THREE.CylinderGeometry(0.03, 0.03, 1.1, 6),
        new THREE.MeshStandardMaterial({ color, roughness: 0.35 })
      );
      g.add(body);

      const cone = new THREE.Mesh(
        new THREE.CylinderGeometry(0.008, 0.03, 0.16, 6),
        new THREE.MeshStandardMaterial({ color: 0xd8a36c, roughness: 0.6 })
      );
      cone.position.y = 0.55 + 0.08;
      g.add(cone);

      const tip = new THREE.Mesh(
        new THREE.ConeGeometry(0.008, 0.05, 6),
        new THREE.MeshStandardMaterial({ color: 0x22242c, roughness: 0.3, metalness: 0.8 })
      );
      tip.position.y = 0.55 + 0.16 + 0.025;
      g.add(tip);
      return g;
    };

    // Helper: create paperclip
    const createClip = (color = 0xd8dae2) => {
      const g = new THREE.Group();
      const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.25, metalness: 0.95 });
      const bar1 = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.35), mat);
      bar1.position.x = -0.06;
      g.add(bar1);
      const bar2 = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.45), mat);
      bar2.position.x = 0.06;
      g.add(bar2);
      const loop = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.008, 8, 16, Math.PI), mat);
      loop.position.y = 0.20;
      g.add(loop);
      return g;
    };

    // Helper: create pushpin
    const createPin = () => {
      const g = new THREE.Group();
      const pinMat = new THREE.MeshStandardMaterial({ color: 0xe3142a, roughness: 0.3 });
      const needleMat = new THREE.MeshStandardMaterial({ color: 0xeeeeee, roughness: 0.1, metalness: 0.98 });
      const head = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.06, 0.12, 16), pinMat);
      g.add(head);
      const needle = new THREE.Mesh(new THREE.ConeGeometry(0.008, 0.18, 12), needleMat);
      needle.rotation.x = Math.PI;
      needle.position.y = -0.12;
      g.add(needle);
      return g;
    };

    // Helper: create wooden ruler
    const createRuler = () => {
      const rCanvas = document.createElement('canvas');
      rCanvas.width = 128;
      rCanvas.height = 512;
      const ctx = rCanvas.getContext('2d');
      ctx.fillStyle = '#caa16e';
      ctx.fillRect(0, 0, 128, 512);
      ctx.fillStyle = '#e3142a';
      ctx.fillRect(0, 0, 8, 512);
      ctx.fillStyle = '#18191e';
      for (let i = 0; i <= 30; i++) {
        const y = 20 + (i / 30) * 472;
        ctx.fillRect(8, y, i % 5 === 0 ? 35 : 18, 2);
      }
      const tex = new THREE.CanvasTexture(rCanvas);
      const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.55 });
      return new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.018, 1.8), mat);
    };

    // Helper: create paper sheet
    const createPaper = () => {
      const pMat = new THREE.MeshStandardMaterial({
        map: this.createPaperSketchTexture(),
        roughness: 0.88,
        metalness: 0.0,
        side: THREE.DoubleSide
      });
      return new THREE.Mesh(new THREE.PlaneGeometry(0.95, 1.35), pMat);
    };

    // Helper: create eraser
    const createEraser = () => {
      const g = new THREE.Group();
      const rubMat = new THREE.MeshStandardMaterial({ color: 0xf0edf2, roughness: 0.9 });
      const rub = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.18, 0.65), rubMat);
      g.add(rub);
      const sleeveMat = new THREE.MeshStandardMaterial({ color: 0x181920, roughness: 0.4 });
      const sleeve = new THREE.Mesh(new THREE.BoxGeometry(0.39, 0.185, 0.40), sleeveMat);
      sleeve.position.z = -0.12;
      g.add(sleeve);
      return g;
    };

    // Register all items
    const items = [
      { obj: createPaper(), targetMargin: 'left', vx: -2.6, vy: 7.8, vz: 1.8, spin: [1.2, 2.5, 0.8] },
      { obj: createPaper(), targetMargin: 'right', vx: 2.8, vy: 8.2, vz: 1.5, spin: [-1.4, -2.0, 1.1] },
      { obj: createRuler(), targetMargin: 'right', vx: 3.6, vy: 8.5, vz: 2.0, spin: [0.5, 3.5, 2.2] },
      { obj: createPencil(0xe3142a), targetMargin: 'left', vx: -3.2, vy: 9.0, vz: 2.2, spin: [3.5, 1.2, -4.0] },
      { obj: createPencil(0x181920), targetMargin: 'left', vx: -1.8, vy: 8.0, vz: 1.8, spin: [-2.8, 3.2, 1.5] },
      { obj: createPencil(0xdfa62a), targetMargin: 'right', vx: 2.2, vy: 8.6, vz: 1.6, spin: [1.8, -3.5, -2.4] },
      { obj: createEraser(), targetMargin: 'right', vx: 3.8, vy: 7.2, vz: 2.4, spin: [2.0, -1.8, 3.0] },
      { obj: createClip(0xd8dae2), targetMargin: 'left', vx: -4.0, vy: 7.5, vz: 2.5, spin: [5.0, 4.0, -3.0] },
      { obj: createClip(0xe3142a), targetMargin: 'right', vx: 4.2, vy: 7.6, vz: 2.4, spin: [-4.0, 5.0, 2.5] },
      { obj: createPin(), targetMargin: 'left', vx: -3.2, vy: 6.8, vz: 2.6, spin: [4.0, 6.0, 1.2] },
      { obj: createPin(), targetMargin: 'right', vx: 1.8, vy: 6.5, vz: 2.2, spin: [-3.0, 4.0, -2.0] }
    ];

    items.forEach((item) => {
      item.obj.position.set(0, -1.2, 0);
      item.obj.scale.setScalar(0.001);
      item.obj.visible = false;
      this.flyingGroup.add(item.obj);
      this.flyingItemsData.push(item);
    });

    // Upward beam of light out of the box
    const beamGeo = new THREE.CylinderGeometry(1.6, 0.45, 6.5, 24, 1, true);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0xffedd0,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    this.lightBeam = new THREE.Mesh(beamGeo, beamMat);
    this.lightBeam.position.set(0, 1.5, 0);
    this.scene.add(this.lightBeam);
  }

  // ─── 3D BURST SPARKS / PARTICLES ───
  buildParticles() {
    const count = 80;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    this.particleVelocities = [];

    const colRed = new THREE.Color(0xe3142a);
    const colGold = new THREE.Color(0xffe6a8);
    const colWhite = new THREE.Color(0xffffff);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = 0;
      positions[i * 3 + 1] = -1.2;
      positions[i * 3 + 2] = 0;

      const pick = Math.random();
      const c = pick < 0.45 ? colRed : (pick < 0.85 ? colGold : colWhite);
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;

      // Upward fountain velocities
      const phi = Math.random() * Math.PI * 2;
      const speedH = 1.5 + Math.random() * 3.5;
      const speedY = 5.0 + Math.random() * 6.0;

      this.particleVelocities.push(new THREE.Vector3(
        Math.cos(phi) * speedH,
        speedY,
        Math.sin(phi) * speedH
      ));
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const mat = new THREE.PointsMaterial({
      size: 0.12,
      vertexColors: true,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending
    });

    this.particlePoints = new THREE.Points(geo, mat);
    this.scene.add(this.particlePoints);
  }

  // ─── EVENTS ───
  setupEvents() {
    this.canvas.addEventListener('mousemove', (e) => {
      const rawX = (e.clientX / window.innerWidth) * 2 - 1;
      const rawY = -(e.clientY / window.innerHeight) * 2 + 1;
      this.pointer.x = rawX;
      this.pointer.y = rawY;
      this.mouse.targetX = rawX * 0.5;
      this.mouse.targetY = rawY * 0.35;
    });

    this.canvas.addEventListener('pointermove', () => {
      if (this.state !== 'idle') return;
      this.raycaster.setFromCamera(this.pointer, this.camera);
      const intersects = this.raycaster.intersectObject(this.boxGroup, true);
      this.canvas.style.cursor = intersects.length > 0 ? 'pointer' : 'default';
    });

    this.canvas.addEventListener('click', () => {
      this.triggerBurst();
    });

    window.addEventListener('resize', () => this.onResize());
  }

  onResize() {
    if (!this.canvas) return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  // ─── BURST SEQUENCE (РАСПАКОВКА САЙТА ИЗ КОРОБКИ) ───
  triggerBurst() {
    if (this.state !== 'idle') return;
    this.state = 'bursting';
    this.burstStartTime = this.clock.getElapsedTime();

    // Tactile opening pop & whoosh sound
    cyberAudio.playBoxBurst();

    if (this.hintBadge) {
      this.hintBadge.style.opacity = '0';
      this.hintBadge.style.transform = 'translate(-50%, 20px) scale(0.9)';
    }

    // Prepare items at mouth of lowered box
    this.flyingItemsData.forEach(item => {
      item.obj.visible = true;
      item.obj.position.set(0, -1.2, 0);
      item.obj.scale.setScalar(0.001);
    });
    this.particlePoints.material.opacity = 1.0;

    // Trigger website reveal as items fountain upward!
    setTimeout(() => {
      const mainContent = document.querySelector('.main-content');
      const nav = document.querySelector('.cyber-nav');
      const paperCanvas = document.getElementById('paper-canvas');

      if (mainContent) {
        mainContent.classList.add('site-revealed');
      }
      if (nav) {
        nav.classList.add('nav-revealed');
      }
      if (paperCanvas) {
        paperCanvas.classList.add('canvas-revealed');
      }
    }, 400);

    // Fade out black intro overlay and unlock full site
    setTimeout(() => {
      if (this.overlay) {
        this.overlay.classList.add('overlay-hidden');
      }
      document.body.classList.remove('intro-locked');
      this.onComplete();
    }, 1800);

    setTimeout(() => {
      if (this.overlay) {
        this.overlay.style.display = 'none';
      }
      this.state = 'completed';
    }, 2600);
  }

  animate() {
    if (this.state === 'completed') return;

    requestAnimationFrame(() => this.animate());

    const delta = Math.min(this.clock.getDelta(), 0.1);
    const elapsedTime = this.clock.getElapsedTime();

    // 1. Mouse tilt
    this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.08;
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.08;

    this.camera.position.x = this.mouse.x * 1.2;
    this.camera.position.y = 0.2 + this.mouse.y * 0.8;
    this.camera.lookAt(this.cameraTarget);

    if (this.state === 'idle') {
      // Gentle breathing idle float in the void
      const float = Math.sin(elapsedTime * 2.0) * 0.08;
      this.boxGroup.position.y = float;
      this.boxGroup.rotation.y = 0.38 + Math.cos(elapsedTime * 1.2) * 0.04;
      this.boxGroup.rotation.x = 0.18 + Math.sin(elapsedTime * 0.9) * 0.03;
    } else if (this.state === 'bursting') {
      const t = elapsedTime - this.burstStartTime;

      // 1. Box Lowers down slightly to bottom-center in first 0.45s and tilts back slightly
      // Staying clearly visible at the bottom of the screen!
      const dropP = Math.min(1.0, t / 0.45);
      const dropEase = 1 - Math.pow(1 - dropP, 3);
      const currentBoxY = -1.45 * dropEase;
      this.boxGroup.position.y = currentBoxY;
      this.boxGroup.rotation.x = 0.18 + 0.24 * dropEase;
      this.boxGroup.rotation.y = 0.38 - 0.12 * dropEase;

      // Later, when site has fully emerged (t > 1.6s), box gracefully exits below
      if (t > 1.6) {
        const exitP = Math.min(1.0, (t - 1.6) / 0.7);
        const exitEase = exitP * exitP;
        this.boxGroup.position.y = -1.45 - exitEase * 2.5;
        if (this.cardboardMat) {
          this.cardboardMat.transparent = true;
          this.cardboardMat.opacity = Math.max(0, 1.0 - exitP);
        }
      }

      // 2. Flaps burst open fast (0.08s -> 0.40s)
      const flapP = Math.min(1.0, Math.max(0, (t - 0.08) / 0.32));
      this.boxFlaps.forEach(f => {
        if (f.pivot) f.pivot.rotation[f.axis] = f.maxAngle * flapP;
      });

      // 3. Core light flare inside box + upward beam
      if (t > 0.10 && t < 1.6) {
        const lightPulse = Math.sin(((t - 0.10) / 1.5) * Math.PI);
        this.coreLight.position.set(0, currentBoxY + 0.25, 0);
        this.coreLight.intensity = lightPulse * 32.0;

        if (this.lightBeam) {
          this.lightBeam.position.y = currentBoxY + 3.2;
          this.lightBeam.material.opacity = lightPulse * 0.38;
        }
      } else {
        this.coreLight.intensity = 0;
        if (this.lightBeam) this.lightBeam.material.opacity = 0;
      }

      // 4. Flying items erupt UPWARDS out of the lowered box
      const spawnY = -1.2;
      this.flyingItemsData.forEach(item => {
        if (t < 0.12) {
          item.obj.position.set(0, spawnY, 0);
          item.obj.scale.setScalar(0.001);
          return;
        }

        const itemT = t - 0.12;
        const itemScale = Math.min(1.0, itemT * 3.2);
        item.obj.scale.setScalar(itemScale);

        // Fountain physics trajectory: upward fountain velocity with air drag
        const drag = Math.exp(-itemT * 0.85);
        const gravity = 4.2;

        item.obj.position.x = item.vx * itemT * drag;
        item.obj.position.y = spawnY + (item.vy * itemT - 0.5 * gravity * itemT * itemT) * drag + (1 - drag) * 0.6;
        item.obj.position.z = item.vz * itemT * drag;

        item.obj.rotation.x += item.spin[0] * delta * 2.2;
        item.obj.rotation.y += item.spin[1] * delta * 2.2;
        item.obj.rotation.z += item.spin[2] * delta * 2.2;
      });

      // 5. Particles explosion fountain
      if (this.particlePoints) {
        const posAttr = this.particlePoints.geometry.attributes.position;
        const positions = posAttr.array;
        for (let i = 0; i < this.particleVelocities.length; i++) {
          const v = this.particleVelocities[i];
          positions[i * 3] += v.x * delta * 1.1;
          positions[i * 3 + 1] += v.y * delta * 1.1 - 2.8 * delta * delta;
          positions[i * 3 + 2] += v.z * delta * 1.1;
        }
        posAttr.needsUpdate = true;
        this.particlePoints.material.opacity = Math.max(0, 1.0 - t * 0.8);
      }
    }

    this.renderer.render(this.scene, this.camera);
  }
}
