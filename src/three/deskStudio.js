import * as THREE from 'three';
import { cyberAudio } from '../audio.js';

export class DeskStudio {
  constructor(canvas) {
    this.canvas = canvas;
    this.stage = canvas.parentElement;
    this.promptBadge = document.getElementById('desk-prompt-badge');

    // States: 'box' -> 'transforming' -> 'workspace'
    this.state = 'box';
    this.progress = 0; // 0 = closed box, 1 = full open workspace
    this.targetProgress = 0;
    this.isLampOn = false;

    this.clock = new THREE.Clock();
    this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();

    // Falling stationery items physics data
    this.fallingItems = [];
    this.isDroppingItems = false;
    this.dropStartTime = 0;

    this.init();
  }

  init() {
    // Determine canvas dimensions reliably
    const rect = this.stage ? this.stage.getBoundingClientRect() : null;
    const width = (rect && rect.width > 100) ? rect.width : (this.canvas.clientWidth || 1100);
    const height = (rect && rect.height > 100) ? rect.height : 620;

    // 1. Scene, Camera, Renderer
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 100);
    this.camera.position.set(0, 3.4, 7.6);
    this.cameraTarget = new THREE.Vector3(0, 0.35, 0);
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

    // 2. Lighting (Rich, warm, clearly illuminating the box)
    this.setupLighting();

    // 3. Shadow Floor Plane
    this.setupFloor();

    // 4. Build 3D Box & Table
    this.buildBoxAndDesk();

    // 5. Build Designer Studio Chair
    this.buildStudioChair();

    // 6. Build Designer Laptop
    this.buildLaptop();

    // 7. Build Architectural Drafting Lamp
    this.buildDeskLamp();

    // 8. Build Falling Stationery Items (Paper, Ruler, Pencils)
    this.buildFallingItems();

    // 9. Event Listeners
    this.setupEvents();

    // 10. Start Animation Loop
    this.animate();
  }

  setupLighting() {
    // Ambient light - bright enough so the box is clear and vivid
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
    this.scene.add(this.ambientLight);

    // Key directional light with rich soft shadows
    this.keyLight = new THREE.DirectionalLight(0xfffaed, 0.95);
    this.keyLight.position.set(4.5, 9.0, 5.5);
    this.keyLight.castShadow = true;
    this.keyLight.shadow.mapSize.width = 1024;
    this.keyLight.shadow.mapSize.height = 1024;
    this.keyLight.shadow.camera.near = 1.0;
    this.keyLight.shadow.camera.far = 20;
    this.keyLight.shadow.camera.left = -5;
    this.keyLight.shadow.camera.right = 5;
    this.keyLight.shadow.camera.top = 5;
    this.keyLight.shadow.camera.bottom = -5;
    this.keyLight.shadow.bias = -0.001;
    this.scene.add(this.keyLight);

    // Warm fill light
    this.fillLight = new THREE.DirectionalLight(0xffe2bf, 0.45);
    this.fillLight.position.set(-5, 4, 3);
    this.scene.add(this.fillLight);

    // Editorial red backlight accent
    this.rimLight = new THREE.DirectionalLight(0xe3142a, 0.35);
    this.rimLight.position.set(0, -2, -4);
    this.scene.add(this.rimLight);

    // Desk Lamp SpotLight (Warm, rich architectural cone illuminating the desk surface)
    this.lampSpot = new THREE.SpotLight(0xffeed4, 0, 14, Math.PI / 2.7, 0.65, 1.0);
    this.lampSpot.position.set(-1.18, 1.35, -0.28);
    this.lampSpotTarget = new THREE.Object3D();
    this.lampSpotTarget.position.set(0.20, 0.05, 0.15);
    this.scene.add(this.lampSpotTarget);
    this.lampSpot.target = this.lampSpotTarget;
    this.lampSpot.castShadow = true;
    this.lampSpot.shadow.mapSize.width = 1024;
    this.lampSpot.shadow.mapSize.height = 1024;
    this.lampSpot.shadow.bias = -0.0008;
    this.scene.add(this.lampSpot);

    // Desk Lamp localized bulb point light (fills the area with warm incandescent glow)
    this.lampBulbPoint = new THREE.PointLight(0xffdf98, 0, 6.0, 1.8);
    this.lampBulbPoint.position.set(-1.18, 1.35, -0.28);
    this.scene.add(this.lampBulbPoint);
  }

  setupFloor() {
    const floorGeo = new THREE.PlaneGeometry(24, 24);
    const floorMat = new THREE.ShadowMaterial({ opacity: 0.38 });
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

    // Warm, saturated kraft cardboard
    ctx.fillStyle = '#c79359';
    ctx.fillRect(0, 0, 512, 512);

    // Corrugation fibers
    for (let y = 0; y < 512; y += 4) {
      ctx.fillStyle = (y % 8 === 0) ? 'rgba(150, 105, 60, 0.18)' : 'rgba(235, 190, 135, 0.14)';
      ctx.fillRect(0, y, 512, 2);
    }

    // Kraft paper speckles
    ctx.fillStyle = 'rgba(80, 50, 20, 0.15)';
    for (let i = 0; i < 500; i++) {
      ctx.fillRect(Math.random() * 512, Math.random() * 512, 1.5, 2);
    }

    // Broad packaging tape strip down center
    ctx.fillStyle = '#dba766';
    ctx.fillRect(185, 0, 142, 512);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
    ctx.fillRect(188, 0, 6, 512);
    ctx.fillRect(320, 0, 4, 512);

    // Large high-contrast shipping label
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
    ctx.fillText('FRAGILE • STUDIO WORKSPACE', 50, 180);

    // Barcode
    ctx.fillStyle = '#18181f';
    for (let b = 50; b < 250; b += Math.random() > 0.4 ? 6 : 10) {
      ctx.fillRect(b, 196, Math.random() > 0.5 ? 4 : 2, 52);
    }

    // Arrows & symbols on right side
    ctx.fillStyle = '#3a2612';
    ctx.font = 'bold 36px monospace';
    ctx.fillText('↑↑ 📦', 350, 170);
    ctx.font = 'bold 14px monospace';
    ctx.fillText('HANDLE WITH CARE', 350, 200);

    const tex = new THREE.CanvasTexture(canvas);
    tex.minFilter = THREE.LinearFilter;
    return tex;
  }

  createDeskWoodTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // 1. Теплый благородный бежевый массив дуба/бука (Beige Scandinavian Wood)
    const baseGrad = ctx.createLinearGradient(0, 0, 1024, 0);
    baseGrad.addColorStop(0, '#e8d4ba');
    baseGrad.addColorStop(0.25, '#f2e2cc');
    baseGrad.addColorStop(0.50, '#ecd7bd');
    baseGrad.addColorStop(0.75, '#f4e6d2');
    baseGrad.addColorStop(1, '#e5d1b5');
    ctx.fillStyle = baseGrad;
    ctx.fillRect(0, 0, 1024, 1024);

    // 2. Натуральные продольные волокна древесины и годовые кольца (Wood Grain)
    for (let i = 0; i < 90; i++) {
      const y = Math.random() * 1024;
      const isDark = Math.random() > 0.4;
      const alpha = isDark ? 0.08 + Math.random() * 0.12 : 0.20 + Math.random() * 0.25;
      ctx.strokeStyle = isDark ? `rgba(145, 95, 48, ${alpha})` : `rgba(255, 250, 240, ${alpha})`;
      ctx.lineWidth = 1 + Math.random() * 3.5;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.bezierCurveTo(
        280, y + (Math.random() - 0.5) * 35,
        640, y + (Math.random() - 0.5) * 35,
        1024, y + (Math.random() - 0.5) * 15
      );
      ctx.stroke();
    }

    // 3. Микро-поры и текстура шлифованной древесины
    ctx.fillStyle = 'rgba(120, 80, 35, 0.10)';
    for (let p = 0; p < 800; p++) {
      const px = Math.random() * 1024;
      const py = Math.random() * 1024;
      ctx.fillRect(px, py, 2 + Math.random() * 6, 1.2);
    }

    // 4. Тонкая фаска и контурные рейки столешницы
    ctx.strokeStyle = 'rgba(175, 125, 75, 0.45)';
    ctx.lineWidth = 3;
    ctx.strokeRect(8, 8, 1008, 1008);

    // 5. Дизайнерская маркировка в правом дальнем углу столешницы
    ctx.save();
    ctx.fillStyle = 'rgba(110, 75, 35, 0.35)';
    ctx.font = 'bold 15px monospace';
    ctx.textAlign = 'right';
    ctx.fillText('QNASSIO // STUDIO WORKBENCH • SOLID OAK', 980, 50);
    ctx.restore();

    const tex = new THREE.CanvasTexture(canvas);
    tex.minFilter = THREE.LinearFilter;
    return tex;
  }

  createLampGlowTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    grad.addColorStop(0, 'rgba(255, 250, 220, 1.0)');
    grad.addColorStop(0.2, 'rgba(255, 220, 150, 0.7)');
    grad.addColorStop(0.5, 'rgba(255, 180, 80, 0.25)');
    grad.addColorStop(0.8, 'rgba(255, 140, 40, 0.06)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);

    const tex = new THREE.CanvasTexture(canvas);
    return tex;
  }

  createLaptopScreenTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 640;
    const ctx = canvas.getContext('2d');

    // Figma dark theme UI
    ctx.fillStyle = '#111216';
    ctx.fillRect(0, 0, 1024, 640);

    // Left sidebar (Layers & Pages)
    ctx.fillStyle = '#1a1b22';
    ctx.fillRect(0, 0, 220, 640);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px monospace';
    ctx.fillText('QNASSIO // FIGMA', 24, 38);

    ctx.fillStyle = '#8b90a0';
    ctx.font = '14px sans-serif';
    ctx.fillText('# Components', 24, 80);
    ctx.fillText('# Design Tokens', 24, 110);
    ctx.fillText('# Flow // Banking', 24, 140);
    ctx.fillText('# Mobile App v2', 24, 170);

    // Top toolbar
    ctx.fillStyle = '#1e2028';
    ctx.fillRect(220, 0, 804, 50);

    // Mobile UI artboard
    ctx.fillStyle = '#0a0a0d';
    ctx.fillRect(270, 90, 200, 400);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.strokeRect(270, 90, 200, 400);

    ctx.fillStyle = '#e3142a';
    ctx.fillRect(290, 120, 160, 40);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('54,280.00 $', 305, 145);

    // Web analytics artboard
    ctx.fillStyle = '#16171f';
    ctx.fillRect(520, 90, 320, 220);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.strokeRect(520, 90, 320, 220);

    // Red analytics curve
    ctx.strokeStyle = '#e3142a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(540, 260);
    ctx.bezierCurveTo(600, 240, 660, 160, 720, 190);
    ctx.bezierCurveTo(750, 200, 780, 130, 820, 140);
    ctx.stroke();

    // Right inspector
    ctx.fillStyle = '#1a1b22';
    ctx.fillRect(880, 0, 144, 640);
    ctx.fillStyle = '#8b90a0';
    ctx.font = '12px monospace';
    ctx.fillText('FRAME: 390x844', 895, 80);
    ctx.fillText('LAYOUT: AUTO', 895, 110);
    ctx.fillText('RADIUS: 24px', 895, 140);

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

    // Dot grid
    ctx.fillStyle = 'rgba(150, 155, 170, 0.4)';
    for (let x = 24; x < 512; x += 24) {
      for (let y = 24; y < 724; y += 24) {
        ctx.fillRect(x, y, 1.5, 1.5);
      }
    }

    // Hand-drawn UX wireframe sketch
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
    ctx.fillText('«CJM v2: Micro-flow»', 270, 130);

    ctx.strokeStyle = '#2b2d38';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(270, 145);
    ctx.lineTo(440, 145);
    ctx.lineTo(420, 220);
    ctx.lineTo(270, 220);
    ctx.closePath();
    ctx.stroke();

    const tex = new THREE.CanvasTexture(canvas);
    tex.minFilter = THREE.LinearFilter;
    return tex;
  }

  // ─── 3D BUILDERS ───
  buildBoxAndDesk() {
    this.mainGroup = new THREE.Group();
    this.scene.add(this.mainGroup);

    this.cardboardMat = new THREE.MeshStandardMaterial({
      map: this.createCardboardTexture(),
      roughness: 0.82,
      metalness: 0.05
    });

    this.deskTopMat = new THREE.MeshStandardMaterial({
      map: this.createDeskWoodTexture(),
      roughness: 0.38,
      metalness: 0.08
    });

    this.steelLegMat = new THREE.MeshStandardMaterial({
      color: 0x1a1b22,
      roughness: 0.28,
      metalness: 0.85
    });

    // ─── A. THE PROMINENT INITIAL 3D BOX (КОРОБКА) ───
    this.boxGroup = new THREE.Group();
    this.mainGroup.add(this.boxGroup);

    // Box Main Body
    const boxW = 2.4;
    const boxH = 1.7;
    const boxD = 1.8;

    this.boxBodyMesh = new THREE.Mesh(
      new THREE.BoxGeometry(boxW, boxH, boxD),
      this.cardboardMat
    );
    this.boxBodyMesh.castShadow = true;
    this.boxBodyMesh.receiveShadow = true;
    this.boxGroup.add(this.boxBodyMesh);

    // Articulated 4 Top Flaps on the box (left, right, front, back)
    this.boxFlaps = [];

    // Left Top Flap
    this.flapLeftPivot = new THREE.Group();
    this.flapLeftPivot.position.set(-boxW / 2, boxH / 2, 0);
    this.boxGroup.add(this.flapLeftPivot);
    const flapLeft = new THREE.Mesh(new THREE.BoxGeometry(boxW / 2, 0.03, boxD), this.cardboardMat);
    flapLeft.position.set(boxW / 4, 0, 0);
    flapLeft.castShadow = true;
    this.flapLeftPivot.add(flapLeft);
    this.boxFlaps.push({ pivot: this.flapLeftPivot, axis: 'z', maxAngle: Math.PI * 0.82 });

    // Right Top Flap
    this.flapRightPivot = new THREE.Group();
    this.flapRightPivot.position.set(boxW / 2, boxH / 2, 0);
    this.boxGroup.add(this.flapRightPivot);
    const flapRight = new THREE.Mesh(new THREE.BoxGeometry(boxW / 2, 0.03, boxD), this.cardboardMat);
    flapRight.position.set(-boxW / 4, 0, 0);
    flapRight.castShadow = true;
    this.flapRightPivot.add(flapRight);
    this.boxFlaps.push({ pivot: this.flapRightPivot, axis: 'z', maxAngle: -Math.PI * 0.82 });

    // Front Top Flap
    this.flapFrontPivot = new THREE.Group();
    this.flapFrontPivot.position.set(0, boxH / 2, boxD / 2);
    this.boxGroup.add(this.flapFrontPivot);
    const flapFront = new THREE.Mesh(new THREE.BoxGeometry(boxW, 0.03, boxD / 2), this.cardboardMat);
    flapFront.position.set(0, 0, -boxD / 4);
    flapFront.castShadow = true;
    this.flapFrontPivot.add(flapFront);
    this.boxFlaps.push({ pivot: this.flapFrontPivot, axis: 'x', maxAngle: -Math.PI * 0.80 });

    // Back Top Flap
    this.flapBackPivot = new THREE.Group();
    this.flapBackPivot.position.set(0, boxH / 2, -boxD / 2);
    this.boxGroup.add(this.flapBackPivot);
    const flapBack = new THREE.Mesh(new THREE.BoxGeometry(boxW, 0.03, boxD / 2), this.cardboardMat);
    flapBack.position.set(0, 0, boxD / 4);
    flapBack.castShadow = true;
    this.flapBackPivot.add(flapBack);
    this.boxFlaps.push({ pivot: this.flapBackPivot, axis: 'x', maxAngle: Math.PI * 0.80 });

    // Position box proudly in center
    this.boxGroup.position.set(0, 0.1, 0);
    this.boxGroup.rotation.set(0.18, 0.42, 0);

    // ─── B. THE EXPANSIVE WORKSPACE DESK (СТОЛ) ───
    this.deskGroup = new THREE.Group();
    this.mainGroup.add(this.deskGroup);

    // Main Tabletop
    const deskW = 3.8;
    const deskD = 2.0;
    const deskH = 0.09;
    this.tableTopMesh = new THREE.Mesh(
      new THREE.BoxGeometry(deskW, deskH, deskD),
      this.deskTopMat
    );
    this.tableTopMesh.castShadow = true;
    this.tableTopMesh.receiveShadow = true;
    this.deskGroup.add(this.tableTopMesh);

    // Table Apron / Bevel underframe
    const apron = new THREE.Mesh(
      new THREE.BoxGeometry(deskW * 0.94, 0.08, deskD * 0.92),
      this.steelLegMat
    );
    apron.position.y = -deskH;
    this.deskGroup.add(apron);

    // 4 Architectural Steel Trestle Legs
    const legH = 1.22;
    const legGeo = new THREE.CylinderGeometry(0.038, 0.038, legH, 16);
    const legPositions = [
      { x: -deskW / 2 + 0.35, z: deskD / 2 - 0.22 },
      { x: deskW / 2 - 0.35, z: deskD / 2 - 0.22 },
      { x: -deskW / 2 + 0.35, z: -deskD / 2 + 0.22 },
      { x: deskW / 2 - 0.35, z: -deskD / 2 + 0.22 }
    ];

    this.tableLegs = [];
    legPositions.forEach((pos) => {
      const leg = new THREE.Mesh(legGeo, this.steelLegMat);
      leg.position.set(pos.x, -legH / 2 - deskH / 2, pos.z);
      leg.castShadow = true;
      this.deskGroup.add(leg);
      this.tableLegs.push(leg);
    });

    // Crossbar stretchers
    const crossGeo = new THREE.CylinderGeometry(0.022, 0.022, deskD - 0.44, 12);
    const leftCross = new THREE.Mesh(crossGeo, this.steelLegMat);
    leftCross.rotation.x = Math.PI / 2;
    leftCross.position.set(legPositions[0].x, -legH * 0.65, 0);
    this.deskGroup.add(leftCross);

    const rightCross = new THREE.Mesh(crossGeo, this.steelLegMat);
    rightCross.rotation.x = Math.PI / 2;
    rightCross.position.set(legPositions[1].x, -legH * 0.65, 0);
    this.deskGroup.add(rightCross);

    // Default desk state: hidden (scale = 0)
    this.deskGroup.scale.setScalar(0.001);
    this.deskGroup.position.set(0, 0, 0);
    this.deskGroup.rotation.set(0.10, -0.22, 0);
  }

  buildStudioChair() {
    this.chairRoot = new THREE.Group();
    this.scene.add(this.chairRoot);

    const seatMat = new THREE.MeshStandardMaterial({
      color: 0x1d1e26, // Premium matte dark leather/graphite
      roughness: 0.48,
      metalness: 0.12
    });

    const frameMat = new THREE.MeshStandardMaterial({
      color: 0x2a2c36, // Gunmetal architectural steel
      roughness: 0.22,
      metalness: 0.90
    });

    // 1. Contoured seat cushion
    const seatMesh = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.08, 0.72), seatMat);
    seatMesh.position.set(0, -0.38, 0);
    seatMesh.castShadow = true;
    seatMesh.receiveShadow = true;
    this.chairRoot.add(seatMesh);

    // Red accent seam on seat edge
    const seamMat = new THREE.MeshStandardMaterial({ color: 0xe3142a, roughness: 0.35 });
    const seatSeam = new THREE.Mesh(new THREE.BoxGeometry(0.785, 0.012, 0.725), seamMat);
    seatSeam.position.set(0, -0.38, 0);
    this.chairRoot.add(seatSeam);

    // 2. Ergonomic curved backrest (in chair's local space at -Z)
    const backMesh = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.56, 0.06), seatMat);
    backMesh.position.set(0, -0.06, -0.34);
    backMesh.rotation.x = -0.10;
    backMesh.castShadow = true;
    this.chairRoot.add(backMesh);

    // 3. Ergonomic armrests
    const armGeo = new THREE.BoxGeometry(0.08, 0.03, 0.40);
    const armPostGeo = new THREE.CylinderGeometry(0.016, 0.016, 0.20, 12);

    const leftArm = new THREE.Mesh(armGeo, seatMat);
    leftArm.position.set(-0.43, -0.19, -0.05);
    leftArm.castShadow = true;
    this.chairRoot.add(leftArm);
    const leftPost = new THREE.Mesh(armPostGeo, frameMat);
    leftPost.position.set(-0.43, -0.29, -0.05);
    this.chairRoot.add(leftPost);

    const rightArm = new THREE.Mesh(armGeo, seatMat);
    rightArm.position.set(0.43, -0.19, -0.05);
    rightArm.castShadow = true;
    this.chairRoot.add(rightArm);
    const rightPost = new THREE.Mesh(armPostGeo, frameMat);
    rightPost.position.set(0.43, -0.29, -0.05);
    this.chairRoot.add(rightPost);

    // 4. Back support spine
    const spineMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.024, 0.44, 12), frameMat);
    spineMesh.position.set(0, -0.22, -0.34);
    this.chairRoot.add(spineMesh);

    // 5. Pneumatic gas lift stem
    const stemMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.48, 16), frameMat);
    stemMesh.position.set(0, -0.66, 0);
    stemMesh.castShadow = true;
    this.chairRoot.add(stemMesh);

    // 6. 5-star chrome caster base
    for (let i = 0; i < 5; i++) {
      const angle = (i * Math.PI * 2) / 5;
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.03, 0.38), frameMat);
      leg.position.set(Math.cos(angle) * 0.19, -0.90, Math.sin(angle) * 0.19);
      leg.rotation.y = -angle;
      leg.castShadow = true;
      this.chairRoot.add(leg);

      const wheel = new THREE.Mesh(new THREE.SphereGeometry(0.032, 8, 8), frameMat);
      wheel.position.set(Math.cos(angle) * 0.36, -0.92, Math.sin(angle) * 0.36);
      this.chairRoot.add(wheel);
    }

    // Chair is placed in FRONT of the desk (facing towards the desk and laptop screen)
    // Rotating around Y by Math.PI - 0.22 makes the seat face the desk, and back face towards the camera
    this.chairRoot.rotation.y = Math.PI - 0.22;
    this.chairRoot.position.set(0.18, 0, 2.60);
    this.chairRoot.scale.setScalar(0.001);
  }

  buildLaptop() {
    this.laptopRoot = new THREE.Group();
    this.scene.add(this.laptopRoot);

    const metalMat = new THREE.MeshStandardMaterial({
      color: 0x2c2e36, // Space Gray anodized aluminum
      roughness: 0.30,
      metalness: 0.88
    });

    const keyMat = new THREE.MeshStandardMaterial({
      color: 0x121317,
      roughness: 0.65,
      metalness: 0.05
    });

    // Base unibody
    const baseW = 0.88;
    const baseD = 0.60;
    const baseH = 0.024;
    const baseMesh = new THREE.Mesh(new THREE.BoxGeometry(baseW, baseH, baseD), metalMat);
    baseMesh.position.y = baseH / 2;
    baseMesh.castShadow = true;
    baseMesh.receiveShadow = true;
    this.laptopRoot.add(baseMesh);

    // Keyboard well
    const keyWell = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.004, 0.32), keyMat);
    keyWell.position.set(0, baseH + 0.002, -0.06);
    this.laptopRoot.add(keyWell);

    // Trackpad
    const trackpad = new THREE.Mesh(
      new THREE.BoxGeometry(0.32, 0.002, 0.19),
      new THREE.MeshStandardMaterial({ color: 0x383b48, roughness: 0.22, metalness: 0.65 })
    );
    trackpad.position.set(0, baseH + 0.002, 0.16);
    this.laptopRoot.add(trackpad);

    // Laptop Lid (Hinged at rear of base: z = -baseD / 2)
    this.laptopLidPivot = new THREE.Group();
    this.laptopLidPivot.position.set(0, baseH, -baseD / 2);
    this.laptopRoot.add(this.laptopLidPivot);

    const lidH = 0.58;
    const lidMesh = new THREE.Mesh(new THREE.BoxGeometry(baseW, lidH, 0.016), metalMat);
    lidMesh.position.set(0, lidH / 2, 0);
    lidMesh.castShadow = true;
    this.laptopLidPivot.add(lidMesh);

    // Display screen with emissive Figma UI (facing +Z in lid local space)
    this.screenTexture = this.createLaptopScreenTexture();
    this.screenMat = new THREE.MeshStandardMaterial({
      map: this.screenTexture,
      roughness: 0.25,
      metalness: 0.05,
      emissive: 0xffffff,
      emissiveMap: this.screenTexture,
      emissiveIntensity: 0.50
    });
    const screenMesh = new THREE.Mesh(new THREE.PlaneGeometry(baseW * 0.94, lidH * 0.92), this.screenMat);
    screenMesh.position.set(0, lidH / 2, 0.009);
    this.laptopLidPivot.add(screenMesh);

    // Initially closed flat against keyboard (+Math.PI / 2)
    this.laptopLidPivot.rotation.x = Math.PI / 2;
    this.laptopRoot.position.set(0, 0.046, -0.05);
    this.laptopRoot.rotation.y = -0.06;
    this.laptopRoot.scale.setScalar(0.001);
  }

  buildDeskLamp() {
    this.lampRoot = new THREE.Group();
    this.scene.add(this.lampRoot);

    const lampMetal = new THREE.MeshStandardMaterial({
      color: 0x22242c, // Matte architectural graphite
      roughness: 0.38,
      metalness: 0.75
    });

    const chromeJoint = new THREE.MeshStandardMaterial({
      color: 0xdde0ea,
      roughness: 0.18,
      metalness: 0.95
    });

    const innerShadeMat = new THREE.MeshStandardMaterial({
      color: 0xfff6ea,
      roughness: 0.25,
      metalness: 0.15
    });

    // 1. Heavy stepped circular base
    const baseBottom = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.26, 0.04, 32), lampMetal);
    baseBottom.position.y = 0.02;
    baseBottom.castShadow = true;
    baseBottom.receiveShadow = true;
    this.lampRoot.add(baseBottom);

    const baseTop = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.24, 0.03, 32), lampMetal);
    baseTop.position.y = 0.045;
    baseTop.castShadow = true;
    this.lampRoot.add(baseTop);

    // Mechanical red toggle switch on base
    const switchBezel = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.02, 16), chromeJoint);
    switchBezel.position.set(0.12, 0.06, 0.08);
    this.lampRoot.add(switchBezel);

    const switchBtn = new THREE.Mesh(
      new THREE.CylinderGeometry(0.014, 0.014, 0.03, 12),
      new THREE.MeshStandardMaterial({ color: 0xe3142a, roughness: 0.3 })
    );
    switchBtn.position.set(0.12, 0.075, 0.08);
    this.lampRoot.add(switchBtn);

    // Swivel stem bracket
    const stemBracket = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.08, 16), chromeJoint);
    stemBracket.position.set(0, 0.08, 0);
    this.lampRoot.add(stemBracket);

    // 2. Lower Twin-Rod Armature (Dual Parallel Rods)
    this.lowerArm = new THREE.Group();
    this.lowerArm.position.set(0, 0.11, 0);
    this.lampRoot.add(this.lowerArm);

    const rodGeo = new THREE.CylinderGeometry(0.009, 0.009, 0.85, 12);
    const rod1 = new THREE.Mesh(rodGeo, lampMetal);
    rod1.position.set(-0.028, 0.42, 0);
    rod1.castShadow = true;
    this.lowerArm.add(rod1);

    const rod2 = new THREE.Mesh(rodGeo, lampMetal);
    rod2.position.set(0.028, 0.42, 0);
    rod2.castShadow = true;
    this.lowerArm.add(rod2);

    // Cross braces
    const braceGeo = new THREE.BoxGeometry(0.07, 0.016, 0.02);
    const brace1 = new THREE.Mesh(braceGeo, chromeJoint);
    brace1.position.set(0, 0.22, 0);
    this.lowerArm.add(brace1);
    const brace2 = new THREE.Mesh(braceGeo, chromeJoint);
    brace2.position.set(0, 0.65, 0);
    this.lowerArm.add(brace2);

    // Tension spring at base pivot
    const springGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.18, 12);
    const spring = new THREE.Mesh(springGeo, chromeJoint);
    spring.position.set(0.045, 0.18, 0.02);
    spring.rotation.z = -0.15;
    this.lowerArm.add(spring);

    // 3. Articulated Elbow Joint with knurled thumb screws
    const elbowDisc = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.05, 20), chromeJoint);
    elbowDisc.position.set(0, 0.85, 0);
    elbowDisc.rotation.z = Math.PI / 2;
    this.lowerArm.add(elbowDisc);

    const thumbScrew = new THREE.Mesh(new THREE.CylinderGeometry(0.030, 0.030, 0.025, 16), chromeJoint);
    thumbScrew.position.set(0.04, 0.85, 0);
    thumbScrew.rotation.z = Math.PI / 2;
    this.lowerArm.add(thumbScrew);

    // 4. Upper Twin-Rod Armature
    this.upperArm = new THREE.Group();
    this.upperArm.position.set(0, 0.85, 0);
    this.lowerArm.add(this.upperArm);

    const upperRodGeo = new THREE.CylinderGeometry(0.009, 0.009, 0.75, 12);
    const uRod1 = new THREE.Mesh(upperRodGeo, lampMetal);
    uRod1.position.set(-0.025, 0.37, 0);
    uRod1.castShadow = true;
    this.upperArm.add(uRod1);

    const uRod2 = new THREE.Mesh(upperRodGeo, lampMetal);
    uRod2.position.set(0.025, 0.37, 0);
    uRod2.castShadow = true;
    this.upperArm.add(uRod2);

    // 5. Lamp Shade Head (Classic flared drafting bell)
    this.lampHead = new THREE.Group();
    this.lampHead.position.set(0, 0.75, 0);
    this.upperArm.add(this.lampHead);

    // Rear shade socket
    const shadeSocket = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.08, 0.10, 20), chromeJoint);
    shadeSocket.position.y = 0.05;
    shadeSocket.castShadow = true;
    this.lampHead.add(shadeSocket);

    // Handle pin for repositioning shade
    const handleWand = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.14, 8), chromeJoint);
    handleWand.position.set(0, 0.16, 0);
    this.lampHead.add(handleWand);

    // Flared Bell Shade Outer
    const shadeGeo = new THREE.ConeGeometry(0.26, 0.32, 28, 1, true);
    const shadeMesh = new THREE.Mesh(shadeGeo, lampMetal);
    shadeMesh.rotation.x = Math.PI;
    shadeMesh.position.y = -0.12;
    shadeMesh.castShadow = true;
    this.lampHead.add(shadeMesh);

    // Shade Inner Reflective Cone
    const innerShadeGeo = new THREE.ConeGeometry(0.255, 0.315, 28, 1, true);
    this.innerShadeMesh = new THREE.Mesh(innerShadeGeo, innerShadeMat);
    this.innerShadeMesh.rotation.x = Math.PI;
    this.innerShadeMesh.position.y = -0.12;
    this.lampHead.add(this.innerShadeMesh);

    // 6. Pear-shaped Light Bulb
    this.bulbMat = new THREE.MeshStandardMaterial({
      color: 0xd6d8e2,
      emissive: 0x000000,
      roughness: 0.15,
      metalness: 0.05
    });
    this.bulbMesh = new THREE.Mesh(new THREE.SphereGeometry(0.08, 24, 24), this.bulbMat);
    this.bulbMesh.position.y = -0.10;
    this.lampHead.add(this.bulbMesh);

    // 7. Radiant Light Halo Sprite
    const glowTex = this.createLampGlowTexture();
    const glowMat = new THREE.SpriteMaterial({
      map: glowTex,
      color: 0xffe8a0,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    this.glowSprite = new THREE.Sprite(glowMat);
    this.glowSprite.position.set(0, -0.14, 0);
    this.glowSprite.scale.set(1.5, 1.5, 1.5);
    this.lampHead.add(this.glowSprite);

    // Natural drafting lamp angles (reaches over the desk towards center)
    this.lowerArm.rotation.z = -0.32;
    this.lowerArm.rotation.x = 0.22;
    this.upperArm.rotation.z = 0.68;
    this.upperArm.rotation.x = -0.20;
    this.lampHead.rotation.x = 1.45;
    this.lampHead.rotation.y = 0.30;
    this.lampHead.rotation.z = -0.15;

    // Placed on left back corner of desk
    this.lampRoot.position.set(-1.42, 0.045, -0.55);
    this.lampRoot.scale.setScalar(0.001);
  }

  buildFallingItems() {
    this.itemsRoot = new THREE.Group();
    this.scene.add(this.itemsRoot);

    // 1. Sheet of Paper (BoxGeometry with depth offset so it NEVER sinks into table)
    const paperMat = new THREE.MeshStandardMaterial({
      map: this.createPaperSketchTexture(),
      roughness: 0.88,
      metalness: 0.0,
      side: THREE.DoubleSide,
      polygonOffset: true,
      polygonOffsetFactor: -2,
      polygonOffsetUnits: -4,
      depthWrite: true
    });
    const paperMesh = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.003, 1.20), paperMat);
    paperMesh.castShadow = true;
    paperMesh.receiveShadow = true;
    this.itemsRoot.add(paperMesh);

    // 2. Wooden Drafting Ruler
    const rulerCanvas = document.createElement('canvas');
    rulerCanvas.width = 128;
    rulerCanvas.height = 512;
    const rctx = rulerCanvas.getContext('2d');
    rctx.fillStyle = '#caa16e';
    rctx.fillRect(0, 0, 128, 512);
    rctx.fillStyle = '#e3142a';
    rctx.fillRect(0, 0, 8, 512);
    rctx.fillStyle = '#18191e';
    for (let i = 0; i <= 30; i++) {
      const y = 20 + (i / 30) * 472;
      rctx.fillRect(8, y, i % 5 === 0 ? 35 : 18, 2);
    }
    const rulerTex = new THREE.CanvasTexture(rulerCanvas);
    const rulerMat = new THREE.MeshStandardMaterial({ map: rulerTex, roughness: 0.55 });
    const rulerMesh = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.015, 1.5), rulerMat);
    rulerMesh.castShadow = true;
    rulerMesh.receiveShadow = true;
    this.itemsRoot.add(rulerMesh);

    // 3. Pencils (Red 2B, Black Liner, Yellow Drawing)
    const createPencilMesh = (bodyColor) => {
      const pGroup = new THREE.Group();
      const pMat = new THREE.MeshStandardMaterial({ color: bodyColor, roughness: 0.35 });
      const pBody = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.024, 0.85, 6), pMat);
      pBody.castShadow = true;
      pGroup.add(pBody);

      const woodCone = new THREE.Mesh(
        new THREE.CylinderGeometry(0.008, 0.024, 0.12, 6),
        new THREE.MeshStandardMaterial({ color: 0xd8a36c, roughness: 0.6 })
      );
      woodCone.position.y = 0.42 + 0.06;
      pGroup.add(woodCone);

      const leadTip = new THREE.Mesh(
        new THREE.ConeGeometry(0.008, 0.04, 6),
        new THREE.MeshStandardMaterial({ color: 0x333640, roughness: 0.25, metalness: 0.8 })
      );
      leadTip.position.y = 0.42 + 0.12 + 0.02;
      pGroup.add(leadTip);

      pGroup.rotation.x = Math.PI / 2;
      return pGroup;
    };

    const pencilRed = createPencilMesh(0xe3142a);
    const pencilBlack = createPencilMesh(0x18191f);
    const pencilYellow = createPencilMesh(0xdfa62a);

    this.itemsRoot.add(pencilRed);
    this.itemsRoot.add(pencilBlack);
    this.itemsRoot.add(pencilYellow);

    this.fallingItemMeshes = [
      { mesh: paperMesh, type: 'paper', restY: 0.048 },
      { mesh: rulerMesh, type: 'ruler', restY: 0.056 },
      { mesh: pencilRed, type: 'pencil', restY: 0.070 },
      { mesh: pencilBlack, type: 'pencil', restY: 0.070 },
      { mesh: pencilYellow, type: 'pencil', restY: 0.070 }
    ];

    this.itemsRoot.visible = false;
  }

  // ─── TRANSFORMATION ANIMATION ───
  applyTransformProgress(p) {
    // p: 0.0 = box mode, 1.0 = desk workspace mode
    if (!this.boxGroup || !this.deskGroup) return;

    // 1. Box Flaps Unfold (Phase 0 -> 0.35)
    if (this.boxFlaps && this.boxFlaps.length) {
      const flapP = Math.min(1.0, p / 0.32);
      this.boxFlaps.forEach((f) => {
        if (f.pivot && f.pivot.rotation) {
          f.pivot.rotation[f.axis] = f.maxAngle * flapP;
        }
      });
    }

    // 2. Box Morphs Out (Phase 0.2 -> 0.65)
    const boxMorphP = Math.min(1.0, Math.max(0, (p - 0.20) / 0.40));
    const boxScale = 1.0 - boxMorphP;
    this.boxGroup.scale.setScalar(Math.max(0.001, boxScale));
    this.boxGroup.position.y = 0.1 + boxMorphP * 0.4;
    this.boxGroup.rotation.y = 0.42 + boxMorphP * Math.PI;

    // 3. Desk Morphs In & Flips into position (Phase 0.25 -> 0.75)
    const deskP = Math.min(1.0, Math.max(0, (p - 0.25) / 0.45));
    // Ease out back
    const deskEase = Math.sin((deskP * Math.PI) / 2);
    this.deskGroup.scale.setScalar(Math.max(0.001, deskEase));
    this.deskGroup.rotation.y = THREE.MathUtils.lerp(0.85, -0.22, deskEase);
    this.deskGroup.rotation.x = THREE.MathUtils.lerp(0.40, 0.10, deskEase);

    // 4. Chair slides in from front user-side
    if (this.chairRoot) {
      const chairP = Math.min(1.0, Math.max(0, (p - 0.50) / 0.35));
      this.chairRoot.scale.setScalar(chairP);
      this.chairRoot.position.z = THREE.MathUtils.lerp(2.60, 1.45, chairP);
    }

    // 5. Laptop emerges & opens lid completely
    if (this.laptopRoot) {
      const laptopP = Math.min(1.0, Math.max(0, (p - 0.55) / 0.35));
      this.laptopRoot.scale.setScalar(laptopP);
    }
    if (this.laptopLidPivot) {
      const lidP = Math.min(1.0, Math.max(0, (p - 0.65) / 0.30));
      // Opens from closed (+Math.PI / 2 = 90° flat) back to -0.38 rad (112° open towards user)
      this.laptopLidPivot.rotation.x = THREE.MathUtils.lerp(Math.PI / 2, -0.38, lidP);
    }

    // 6. Lamp emerges & lights up
    if (this.lampRoot) {
      const lampP = Math.min(1.0, Math.max(0, (p - 0.60) / 0.30));
      this.lampRoot.scale.setScalar(lampP);
    }

    if (p >= 0.90 && !this.isLampOn) {
      this.turnLampOn();
    } else if (p < 0.90 && this.isLampOn) {
      this.turnLampOff();
    }
  }

  turnLampOn() {
    this.isLampOn = true;
    cyberAudio.playLampClick();

    // High intensity SpotLight illuminating desk with soft shadow pool
    this.lampSpot.intensity = 26.0;
    this.lampBulbPoint.intensity = 6.5;

    // Glowing incandescent bulb
    this.bulbMat.emissive.setHex(0xfff6d0);
    this.bulbMat.emissiveIntensity = 2.8;

    // Inner shade catches the bright light
    if (this.innerShadeMesh) {
      this.innerShadeMesh.material.emissive.setHex(0xffecd0);
      this.innerShadeMesh.material.emissiveIntensity = 0.85;
    }

    // Radiant halo sprite
    if (this.glowSprite) {
      this.glowSprite.material.opacity = 0.85;
    }

    // Warm ambient lift
    if (this.ambientLight) {
      this.ambientLight.intensity = 0.85;
    }
  }

  turnLampOff() {
    this.isLampOn = false;
    this.lampSpot.intensity = 0;
    this.lampBulbPoint.intensity = 0;

    this.bulbMat.emissive.setHex(0x000000);
    this.bulbMat.emissiveIntensity = 0;

    if (this.innerShadeMesh) {
      this.innerShadeMesh.material.emissive.setHex(0x000000);
      this.innerShadeMesh.material.emissiveIntensity = 0;
    }

    if (this.glowSprite) {
      this.glowSprite.material.opacity = 0;
    }

    if (this.ambientLight) {
      this.ambientLight.intensity = 0.65;
    }
  }

  toggleLamp() {
    if (this.isLampOn) {
      this.turnLampOff();
      cyberAudio.playLampClick();
    } else {
      this.turnLampOn();
    }
  }

  // ─── DYNAMIC SCATTER / FALLING STATIONERY ITEMS ───
  triggerStationeryDrop() {
    this.itemsRoot.visible = true;
    this.isDroppingItems = true;
    this.dropStartTime = this.clock.getElapsedTime();

    cyberAudio.playItemDrop();

    // Fresh random organic targets for each drop
    this.fallingItems = this.fallingItemMeshes.map((entry, idx) => {
      let targetX = 0;
      let targetZ = 0;
      let targetRotY = 0;
      let targetRotZ = 0;

      if (entry.type === 'paper') {
        targetX = 0.75 + (Math.random() - 0.5) * 0.28;
        targetZ = 0.08 + (Math.random() - 0.5) * 0.20;
        targetRotY = (Math.random() - 0.5) * 0.45;
        targetRotZ = 0;
      } else if (entry.type === 'ruler') {
        targetX = 1.18 + (Math.random() - 0.5) * 0.24;
        targetZ = 0.16 + (Math.random() - 0.5) * 0.32;
        targetRotY = (Math.random() - 0.5) * 0.65;
        targetRotZ = 0;
      } else {
        const spreadX = [-0.95, 0.68, 0.90][idx - 2] || 0;
        targetX = spreadX + (Math.random() - 0.5) * 0.38;
        targetZ = 0.25 + (Math.random() - 0.5) * 0.45;
        targetRotY = Math.random() * Math.PI * 2;
        targetRotZ = (Math.random() - 0.5) * 0.25;
      }

      return {
        mesh: entry.mesh,
        type: entry.type,
        startY: 3.5 + Math.random() * 2.0 + idx * 0.3,
        restY: entry.restY,
        targetX,
        targetZ,
        targetRotY,
        targetRotZ,
        spinSpeed: (Math.random() - 0.5) * 8.0,
        bounceAmp: 0.28 + Math.random() * 0.15,
        delay: idx * 0.12,
        duration: 0.95 + Math.random() * 0.3
      };
    });
  }

  updateFallingItems(time) {
    if (!this.isDroppingItems || !this.fallingItems.length) return;

    const elapsedSinceDrop = time - this.dropStartTime;

    this.fallingItems.forEach((item) => {
      const t = (elapsedSinceDrop - item.delay) / item.duration;
      if (t < 0) {
        item.mesh.position.y = item.startY;
        item.mesh.position.x = item.targetX;
        item.mesh.position.z = item.targetZ;
        return;
      }

      if (t >= 1.0) {
        item.mesh.position.set(item.targetX, item.restY, item.targetZ);
        item.mesh.rotation.y = item.targetRotY;
        if (item.type === 'paper') {
          item.mesh.rotation.x = 0;
          item.mesh.rotation.z = 0;
        } else {
          item.mesh.rotation.z = item.targetRotZ;
        }
        return;
      }

      if (item.type === 'paper') {
        const descentP = Math.sin((t * Math.PI) / 2);
        const y = THREE.MathUtils.lerp(item.startY, item.restY, descentP);
        const flutter = Math.sin(t * 12) * 0.12 * Math.max(0, 1 - t * 1.15);
        item.mesh.position.set(item.targetX + Math.sin(t * 8) * 0.05 * (1 - t), y, item.targetZ);
        item.mesh.rotation.x = 0;
        item.mesh.rotation.y = item.targetRotY + Math.sin(t * 6) * 0.12 * (1 - t);
        item.mesh.rotation.z = flutter;
      } else {
        const bounceCount = 2;
        const decay = Math.exp(-t * 4);
        const bounce = Math.abs(Math.sin(t * Math.PI * (bounceCount + 0.5))) * item.bounceAmp * decay;

        const baseFall = THREE.MathUtils.lerp(item.startY, item.restY, Math.min(1.0, t * 1.5));
        item.mesh.position.y = (t < 0.66 ? baseFall : item.restY) + bounce;
        item.mesh.position.x = item.targetX;
        item.mesh.position.z = item.targetZ;

        item.mesh.rotation.y = THREE.MathUtils.lerp(item.spinSpeed, item.targetRotY, t);
        item.mesh.rotation.z = THREE.MathUtils.lerp(item.spinSpeed * 0.5, item.targetRotZ, t);
      }
    });
  }

  // ─── INTERACTION HANDLING ───
  setupEvents() {
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const rawX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const rawY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

      this.pointer.x = rawX;
      this.pointer.y = rawY;

      this.mouse.targetX = rawX * 0.6;
      this.mouse.targetY = rawY * 0.4;
    });

    this.canvas.addEventListener('pointermove', () => {
      this.raycaster.setFromCamera(this.pointer, this.camera);
      const objectsToCheck = (this.state === 'box') ? [this.boxGroup] : [this.deskGroup, this.lampRoot];
      const intersects = this.raycaster.intersectObjects(objectsToCheck, true);
      this.canvas.style.cursor = intersects.length > 0 ? 'pointer' : 'default';
    });

    this.canvas.addEventListener('click', () => {
      this.handleClick();
    });

    // ResizeObserver on stage container
    if (window.ResizeObserver && this.stage) {
      const ro = new ResizeObserver(() => this.onResize());
      ro.observe(this.stage);
    }
    window.addEventListener('resize', () => this.onResize());
  }

  handleClick() {
    if (this.state === 'box') {
      this.state = 'transforming';
      this.targetProgress = 1.0;

      if (this.promptBadge) {
        this.promptBadge.style.opacity = '0';
        this.promptBadge.style.pointerEvents = 'none';
      }

      cyberAudio.playDeskTransform();

      setTimeout(() => {
        cyberAudio.playLaptopOpen();
      }, 700);

      setTimeout(() => {
        this.triggerStationeryDrop();
      }, 1050);

      setTimeout(() => {
        this.state = 'workspace';
      }, 1600);
    } else if (this.state === 'workspace') {
      this.raycaster.setFromCamera(this.pointer, this.camera);
      const lampIntersects = this.raycaster.intersectObject(this.lampRoot, true);

      if (lampIntersects.length > 0) {
        this.toggleLamp();
      } else {
        this.triggerStationeryDrop();
      }
    }
  }

  onResize() {
    if (!this.canvas || !this.stage) return;
    const rect = this.stage.getBoundingClientRect();
    const width = (rect && rect.width > 100) ? rect.width : (this.canvas.clientWidth || 1100);
    const height = (rect && rect.height > 100) ? rect.height : 620;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const delta = Math.min(this.clock.getDelta(), 0.1);
    const elapsedTime = this.clock.getElapsedTime();

    // 1. Mouse Parallax
    this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.06;
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.06;

    this.camera.position.x = this.mouse.x * 1.8;
    this.camera.position.y = 3.4 + this.mouse.y * 1.2;
    this.camera.lookAt(this.cameraTarget);

    // 2. Interpolate transformation progress
    if (this.state === 'transforming') {
      this.progress += (this.targetProgress - this.progress) * 0.045;
      if (Math.abs(this.targetProgress - this.progress) < 0.002) {
        this.progress = this.targetProgress;
      }
      this.applyTransformProgress(this.progress);
    } else if (this.state === 'box') {
      // Gentle breathing idle wobble in box mode
      const breath = Math.sin(elapsedTime * 1.8) * 0.05;
      this.boxGroup.position.y = 0.1 + breath;
      this.boxGroup.rotation.y = 0.42 + Math.cos(elapsedTime * 1.2) * 0.04;
      this.boxGroup.rotation.x = 0.18 + Math.sin(elapsedTime * 1.0) * 0.02;
    }

    // 3. Falling Items Animation
    this.updateFallingItems(elapsedTime);

    // 4. Subtle Screen Blink / Glow Pulse
    if (this.state === 'workspace' && this.screenMat) {
      this.screenMat.emissiveIntensity = 0.40 + Math.sin(elapsedTime * 2.5) * 0.06;
    }

    // 5. Render
    this.renderer.render(this.scene, this.camera);
  }
}
