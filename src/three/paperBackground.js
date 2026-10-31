import * as THREE from 'three';

export class PaperBackground {
  constructor(canvas) {
    this.canvas = canvas;
    this.mouse = { x: 0.5, y: 0.5, targetX: 0.5, targetY: 0.5, velX: 0, velY: 0 };
    this.clicks = [
      new THREE.Vector3(0, 0, -1),
      new THREE.Vector3(0, 0, -1),
      new THREE.Vector3(0, 0, -1),
      new THREE.Vector3(0, 0, -1),
      new THREE.Vector3(0, 0, -1),
      new THREE.Vector3(0, 0, -1)
    ];
    this.clickIndex = 0;
    this.scrollY = 0;
    this.targetScrollY = 0;
    this.deskItems = [];
    this.clock = new THREE.Clock();

    this.init();
    this.createDeformingGridBackground();
    this.createScatteredDeskItems();
    this.animate();
  }

  init() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    this.camera.position.set(0, 0, 10);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance'
    });

    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Studio lights for realistic 3D metallic highlights and shadows
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    this.scene.add(ambientLight);

    this.deskLight = new THREE.DirectionalLight(0xffffff, 2.2);
    this.deskLight.position.set(6, 8, 8);
    this.scene.add(this.deskLight);

    // Warm crimson edge rim light
    const rimLight = new THREE.DirectionalLight(0xff2244, 2.4);
    rimLight.position.set(-8, -4, 4);
    this.scene.add(rimLight);

    // Cool specular fill light
    const fillLight = new THREE.DirectionalLight(0x77aaff, 1.2);
    fillLight.position.set(-4, 7, 6);
    this.scene.add(fillLight);

    window.addEventListener('mousemove', (e) => {
      this.mouse.targetX = e.clientX / window.innerWidth;
      this.mouse.targetY = 1.0 - (e.clientY / window.innerHeight);
    }, { passive: true });

    // Use pointerdown with capture so clicks anywhere on the page trigger the shockwave
    window.addEventListener('pointerdown', (e) => {
      const clickX = e.clientX / window.innerWidth;
      const clickY = 1.0 - (e.clientY / window.innerHeight);
      this.triggerClick(clickX, clickY);
    }, { capture: true, passive: true });

    window.addEventListener('scroll', () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      this.targetScrollY = maxScroll > 0 ? window.scrollY / maxScroll : 0;
    }, { passive: true });

    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      if (this.gridMaterial) {
        this.gridMaterial.uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
      }
    });
  }

  triggerClick(x, y) {
    this.clicks[this.clickIndex].set(x, y, 0.0);
    this.clickIndex = (this.clickIndex + 1) % this.clicks.length;
    if (this.gridMaterial) {
      this.gridMaterial.uniforms.uClicks.value = this.clicks;
    }

    // Physical shockwave impulse to 3D desk items
    const aspect = window.innerWidth / window.innerHeight;
    const clickWorldX = (x - 0.5) * (8.28 * aspect);
    const clickWorldY = (y - 0.5) * 8.28;

    this.deskItems.forEach(item => {
      const dx = item.obj.position.x - clickWorldX;
      const dy = item.obj.position.y - clickWorldY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 4.5) {
        const force = (1.0 - dist / 4.5) * 0.4;
        const dirX = dist > 0.001 ? dx / dist : 0.5;
        const dirY = dist > 0.001 ? dy / dist : 0.5;
        item.impulseX += dirX * force;
        item.impulseY += dirY * force;
        item.impulseRotX += (Math.random() - 0.5) * force * 1.5;
        item.impulseRotY += (Math.random() - 0.5) * force * 1.5;
        item.impulseRotZ += (Math.random() - 0.5) * force * 2.0;
      }
    });
  }

  // Deep black background with glowing red aura & interactive deforming grid
  createDeformingGridBackground() {
    this.gridMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
        uMouse: { value: new THREE.Vector2(0.5, 0.5) },
        uMouseVel: { value: new THREE.Vector2(0.0, 0.0) },
        uClicks: { value: this.clicks },
        uTime: { value: 0 },
        uScroll: { value: 0 }
      },
      depthWrite: false,
      depthTest: false,
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          // NDC full-screen quad: guarantees exact 1:1 pixel mapping to viewport
          gl_Position = vec4(position.xy, 0.9999, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec2 uResolution;
        uniform vec2 uMouse;
        uniform vec2 uMouseVel;
        uniform vec3 uClicks[6];
        uniform float uTime;
        uniform float uScroll;
        varying vec2 vUv;

        void main() {
          float aspect = uResolution.x / uResolution.y;
          // Exact screen-space coordinates [0, aspect] x [0, 1]
          vec2 p = vUv;
          p.x *= aspect;

          vec2 mouse = uMouse;
          mouse.x *= aspect;

          // ─── 1. MOUSE CURSOR DEFORMATION ───
          vec2 dMouse = p - mouse;
          float mouseDist = length(dMouse);
          float mouseRadius = 0.28;
          float mouseInfl = exp(-mouseDist * mouseDist / (mouseRadius * mouseRadius * 0.5));
          float mouseRipple = sin(mouseDist * 16.0 - uTime * 2.8) * 0.008 * mouseInfl;
          vec2 velPull = uMouseVel * mouseInfl * 0.32;
          vec2 mouseDisplace = normalize(dMouse + vec2(0.0001)) * (mouseInfl * 0.042 + mouseRipple) - velPull;

          // ─── 2. AUTONOMOUS WANDERING DISTORTION (РАНДОМНОЕ ДВИЖЕНИЕ ИСКАЖЕНИЯ) ───
          // Continuous organic flowing ripples across the whole grid
          float t = uTime * 0.85;
          vec2 fCoord = p * 1.9;
          float waveA = sin(fCoord.y * 2.4 + t) * cos(fCoord.x * 1.8 - t * 0.7);
          float waveB = cos(fCoord.x * 2.2 - t * 0.8) * sin(fCoord.y * 1.9 + t * 0.9);
          float waveC = sin((fCoord.x + fCoord.y) * 1.6 + t * 1.2);
          vec2 flowDisp = vec2(waveA + waveC * 0.5, waveB + waveC * 0.5) * 0.024;

          // Dynamic wandering focal centers moving across the screen
          vec2 node1 = vec2(
            (0.5 + 0.38 * sin(uTime * 0.44)) * aspect,
            0.5 + 0.34 * cos(uTime * 0.32 + 1.2)
          );
          float dN1 = length(p - node1);
          float inflN1 = exp(-dN1 * dN1 / 0.08);
          vec2 dispN1 = normalize(p - node1 + vec2(0.0001)) * sin(dN1 * 16.0 - uTime * 2.4) * 0.036 * inflN1;

          vec2 node2 = vec2(
            (0.5 + 0.36 * cos(uTime * 0.31 + 2.4)) * aspect,
            0.5 + 0.32 * sin(uTime * 0.42 + 0.6)
          );
          float dN2 = length(p - node2);
          float inflN2 = exp(-dN2 * dN2 / 0.09);
          vec2 dispN2 = normalize(p - node2 + vec2(0.0001)) * cos(dN2 * 14.0 - uTime * 2.0) * 0.034 * inflN2;

          vec2 randomDisplace = flowDisp + dispN1 + dispN2;

          // ─── 3. CLICK SHOCKWAVE DISTORTION (ИСКАЖЕНИЕ НА МЕСТЕ НАЖАТИЯ МЫШКОЙ) ───
          vec2 clickDisplace = vec2(0.0);
          float clickGlowTotal = 0.0;
          for (int i = 0; i < 6; i++) {
            vec3 click = uClicks[i];
            if (click.z >= 0.0 && click.z < 1.8) {
              vec2 cPos = vec2(click.x * aspect, click.y);
              float cDist = length(p - cPos);
              float waveFront = click.z * 0.78;
              float ringDist = abs(cDist - waveFront);
              float ringWidth = 0.075 + click.z * 0.05;
              float ringShape = exp(-ringDist * ringDist / (ringWidth * ringWidth * 0.5));
              float ringFade = 1.0 - smoothstep(0.0, 1.8, click.z);

              vec2 ringDir = normalize(p - cPos + vec2(0.0001));
              float shockWave = sin((cDist - waveFront) * 26.0) * 0.056 * ringShape * ringFade;
              clickDisplace += ringDir * shockWave;
              clickGlowTotal += ringShape * ringFade * 0.65;
            }
          }

          // Combined displacement field
          vec2 totalDisplace = mouseDisplace + randomDisplace + clickDisplace;
          vec2 gridUv = p - totalDisplace;

          // ─── 4. CRISP PROPORTIONED GRID ───
          vec2 screenPx = gridUv * uResolution.y;
          float cellSizePx = 46.0;
          vec2 cellFract = fract(screenPx / cellSizePx);
          vec2 distToLinePx = min(cellFract, 1.0 - cellFract) * cellSizePx;
          float lineDistPx = min(distToLinePx.x, distToLinePx.y);

          // Clean antialiased 1.2px line
          float gridMask = 1.0 - smoothstep(0.65, 1.75, lineDistPx);

          // ─── 5. PURE VELVETY BLACK + BALANCED RED GLOW ───
          vec3 baseBlack = vec3(0.002, 0.002, 0.004);
          vec3 mutedRed = vec3(0.68, 0.12, 0.18);

          // Subtle upper-center ambient glow
          vec2 ambientCenter = vec2(0.5 * aspect, 0.75);
          float ambDist = length(p - ambientCenter);
          float ambientTop = exp(-ambDist * ambDist * 3.5) * 0.14;

          // Smooth cursor glow
          float cursorGlow = exp(-mouseDist * mouseDist * 8.0) * 0.32;

          // Wandering hotspot glow
          float wanderGlow = (inflN1 + inflN2) * 0.22;

          // Deep black background with red illumination
          vec3 bgColor = baseBlack + mutedRed * (ambientTop + cursorGlow + clickGlowTotal * 0.5 + wanderGlow);

          // ─── 6. TRANSPARENT GRID LINES ───
          vec3 restingGridCol = vec3(0.22, 0.23, 0.28);
          vec3 activeGridCol = vec3(0.65, 0.18, 0.24);
          float energy = clamp(cursorGlow * 1.4 + mouseInfl * 0.6 + clickGlowTotal * 0.9 + wanderGlow * 0.8, 0.0, 1.0);
          vec3 gridColor = mix(restingGridCol, activeGridCol, energy);

          // Grid alpha: 22% at rest, brightens on interactive distortion
          float gridAlpha = gridMask * (0.22 + energy * 0.36);

          vec3 finalColor = mix(bgColor, gridColor, gridAlpha);

          // Soft edge vignette
          float vignette = 1.0 - length((vUv - 0.5) * 1.08);
          finalColor *= clamp(vignette, 0.35, 1.0);

          gl_FragColor = vec4(finalColor, 1.0);
        }
      `
    });

    const planeGeo = new THREE.PlaneGeometry(2, 2);
    this.planeMesh = new THREE.Mesh(planeGeo, this.gridMaterial);
    this.planeMesh.frustumCulled = false;
    this.planeMesh.renderOrder = -1000;
    this.scene.add(this.planeMesh);
  }

  createScatteredDeskItems() {
    this.stationeryGroup = new THREE.Group();
    this.scene.add(this.stationeryGroup);

    // ─── 1. REALISTIC 3D METALLIC PAPERCLIP (NO FLAT SHADOWS / NO FAKE BACKGROUNDS) ───
    const createPaperclip = (colorHex, scale = 0.65) => {
      const clipGroup = new THREE.Group();
      const path = new THREE.CurvePath();

      const p1 = new THREE.Vector3(0, -0.6, 0);
      const p2 = new THREE.Vector3(0, 0.6, 0);
      const p3 = new THREE.Vector3(0.28, 0.6, 0);
      const p4 = new THREE.Vector3(0.28, -0.4, 0);
      const p5 = new THREE.Vector3(0.12, -0.4, 0);
      const p6 = new THREE.Vector3(0.12, 0.38, 0);

      path.add(new THREE.LineCurve3(p1, p2));
      path.add(new THREE.QuadraticBezierCurve3(p2, new THREE.Vector3(0.14, 0.82, 0), p3));
      path.add(new THREE.LineCurve3(p3, p4));
      path.add(new THREE.QuadraticBezierCurve3(p4, new THREE.Vector3(0.20, -0.62, 0), p5));
      path.add(new THREE.LineCurve3(p5, p6));

      // Thicker wire and smooth tubular segments for real 3D volume
      const tubeGeo = new THREE.TubeGeometry(path, 64, 0.026, 12, false);
      const clipMat = new THREE.MeshPhysicalMaterial({
        color: colorHex,
        metalness: 0.95,
        roughness: 0.16,
        clearcoat: 0.85,
        clearcoatRoughness: 0.12,
        reflectivity: 0.9
      });
      const mesh = new THREE.Mesh(tubeGeo, clipMat);
      clipGroup.add(mesh);
      clipGroup.scale.setScalar(scale);

      return clipGroup;
    };

    // ─── 2. DETAILED 3D BROKEN PENCIL HALVES (ДВЕ РАЗДЕЛЬНЫЕ ПОЛОВИНКИ, ЖИВУЩИЕ СВОЕЙ ЖИЗНЬЮ) ───
    const createBrokenPencilHalves = (bodyColor = 0xe3142a, scale = 0.65) => {
      const bodyMat = new THREE.MeshStandardMaterial({
        color: bodyColor,
        roughness: 0.32,
        metalness: 0.08
      });

      const woodMat = new THREE.MeshStandardMaterial({
        color: 0xd8a36c,
        roughness: 0.60,
        metalness: 0.05
      });

      const rawWoodMat = new THREE.MeshStandardMaterial({
        color: 0xdfb889,
        roughness: 0.85,
        metalness: 0.0
      });

      // Четкий, ярко выраженный серый графит (не сливается с черным фоном)
      const greyLeadMat = new THREE.MeshPhysicalMaterial({
        color: 0x949aa6, // Светло-серый металлический графит
        roughness: 0.28,
        metalness: 0.88,
        clearcoat: 0.80,
        clearcoatRoughness: 0.15,
        reflectivity: 0.95
      });

      const ferruleMat = new THREE.MeshStandardMaterial({
        color: 0xd4d8df,
        metalness: 0.96,
        roughness: 0.14
      });

      const eraserMat = new THREE.MeshStandardMaterial({
        color: 0xee5d70,
        roughness: 0.75,
        metalness: 0.0
      });

      // ─── ПОЛОВИНА 1: Нижняя часть с ластиком и изломом (НЕЗАВИСИМЫЙ 3D ОБЪЕКТ) ───
      const partA = new THREE.Group();
      const lenA = 1.15;

      const bodyA = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, lenA, 6), bodyMat);
      partA.add(bodyA);

      const ferrule = new THREE.Mesh(new THREE.CylinderGeometry(0.115, 0.115, 0.22, 16), ferruleMat);
      ferrule.position.y = -lenA / 2 - 0.11;
      partA.add(ferrule);

      const eraser = new THREE.Mesh(new THREE.CylinderGeometry(0.108, 0.108, 0.22, 16), eraserMat);
      eraser.position.y = -lenA / 2 - 0.30;
      partA.add(eraser);

      const fracturePlateA = new THREE.Mesh(new THREE.CylinderGeometry(0.106, 0.108, 0.04, 6), rawWoodMat);
      fracturePlateA.position.y = lenA / 2;
      partA.add(fracturePlateA);

      const splintersA = [
        { x: 0.045, z: 0.035, h: 0.10, r: 0.022 },
        { x: -0.05, z: 0.04, h: 0.15, r: 0.025 },
        { x: -0.04, z: -0.05, h: 0.09, r: 0.02 },
        { x: 0.055, z: -0.03, h: 0.13, r: 0.024 },
        { x: 0.0, z: 0.06, h: 0.17, r: 0.024 }
      ];
      splintersA.forEach(s => {
        const splinter = new THREE.Mesh(new THREE.ConeGeometry(s.r, s.h, 4), rawWoodMat);
        splinter.position.set(s.x, lenA / 2 + s.h / 2, s.z);
        splinter.rotation.set((Math.random() - 0.5) * 0.3, Math.random() * Math.PI, (Math.random() - 0.5) * 0.3);
        partA.add(splinter);
      });

      const coreA = new THREE.Mesh(new THREE.CylinderGeometry(0.036, 0.036, 0.08, 8), greyLeadMat);
      coreA.position.y = lenA / 2 + 0.02;
      partA.add(coreA);

      partA.scale.setScalar(scale);

      // ─── ПОЛОВИНА 2: Верхняя часть с заточенным конусом и серым острием (НЕЗАВИСИМЫЙ 3D ОБЪЕКТ) ───
      const partB = new THREE.Group();
      const lenB = 1.15;

      const bodyB = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, lenB, 6), bodyMat);
      partB.add(bodyB);

      const woodHeight = 0.32;
      const cone = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.11, woodHeight, 6), woodMat);
      cone.position.y = lenB / 2 + woodHeight / 2;
      partB.add(cone);

      const leadHeight = 0.14;
      const tip = new THREE.Mesh(new THREE.ConeGeometry(0.038, leadHeight, 8), greyLeadMat);
      tip.position.y = lenB / 2 + woodHeight + leadHeight / 2;
      partB.add(tip);

      const fracturePlateB = new THREE.Mesh(new THREE.CylinderGeometry(0.108, 0.106, 0.04, 6), rawWoodMat);
      fracturePlateB.position.y = -lenB / 2;
      partB.add(fracturePlateB);

      const exposedCoreB = new THREE.Mesh(new THREE.CylinderGeometry(0.036, 0.036, 0.16, 8), greyLeadMat);
      exposedCoreB.position.y = -lenB / 2 - 0.06;
      partB.add(exposedCoreB);

      const splintersB = [
        { x: -0.04, z: -0.03, h: 0.13, r: 0.022 },
        { x: 0.03, z: 0.05, h: 0.16, r: 0.025 },
        { x: 0.06, z: -0.04, h: 0.10, r: 0.02 },
        { x: -0.06, z: 0.02, h: 0.14, r: 0.023 }
      ];
      splintersB.forEach(s => {
        const splinter = new THREE.Mesh(new THREE.ConeGeometry(s.r, s.h, 4), rawWoodMat);
        splinter.position.set(s.x, -lenB / 2 - s.h / 2, s.z);
        splinter.rotation.set((Math.random() - 0.5) * 0.3, Math.random() * Math.PI, (Math.random() - 0.5) * 0.3);
        partB.add(splinter);
      });

      partB.scale.setScalar(scale);

      return { partA, partB };
    };

    // ─── 3. 3D METALLIC PUSHPIN (CYBER PIN) ───
    const createPushpin = (colorHex, scale = 0.62) => {
      const pinGroup = new THREE.Group();

      // Steel needle
      const needleGeo = new THREE.CylinderGeometry(0.02, 0.005, 0.45, 12);
      const needleMat = new THREE.MeshStandardMaterial({
        color: 0xeeeeee,
        metalness: 0.98,
        roughness: 0.1
      });
      const needle = new THREE.Mesh(needleGeo, needleMat);
      needle.position.y = -0.22;
      pinGroup.add(needle);

      // Ergonomic hourglass acrylic grip
      const points = [];
      points.push(new THREE.Vector2(0.04, 0.0));
      points.push(new THREE.Vector2(0.12, 0.08));
      points.push(new THREE.Vector2(0.08, 0.20));
      points.push(new THREE.Vector2(0.14, 0.35));
      points.push(new THREE.Vector2(0.15, 0.42));
      points.push(new THREE.Vector2(0.0, 0.42));

      const latheGeo = new THREE.LatheGeometry(points, 24);
      const capMat = new THREE.MeshPhysicalMaterial({
        color: colorHex,
        metalness: 0.3,
        roughness: 0.12,
        clearcoat: 0.9,
        transmission: 0.35,
        thickness: 0.4
      });
      const cap = new THREE.Mesh(latheGeo, capMat);
      pinGroup.add(cap);

      pinGroup.scale.setScalar(scale);
      return pinGroup;
    };

    // ─── 4. 3D ARCHITECTURAL ERASER (ПЕРЕРАБОТАННЫЙ ЛАСТИК: СТЕРТЫЙ И ЗАГРЯЗНЕННЫЙ ГРАФИТОМ УГОЛ) ───
    const createEraser = (scale = 0.58) => {
      const eraserGroup = new THREE.Group();

      const w = 0.54;
      const h = 0.98;
      const d = 0.22;
      const hw = w / 2;
      const hh = h / 2;

      // 1. Форма ластика: рабочий верхний угол стерт и закруглен под углом от трения о бумагу
      const shape = new THREE.Shape();
      shape.moveTo(-hw, -hh);
      shape.lineTo(hw, -hh);
      shape.lineTo(hw, hh - 0.26); // Правая грань
      shape.quadraticCurveTo(hw - 0.03, hh - 0.06, hw - 0.20, hh); // Стертый, закругленный рабочий угол
      shape.lineTo(-hw + 0.02, hh); // Верхняя грань
      shape.quadraticCurveTo(-hw, hh, -hw, hh - 0.02);
      shape.lineTo(-hw, -hh);

      const extrudeSettings = {
        depth: d,
        bevelEnabled: true,
        bevelSegments: 3,
        steps: 1,
        bevelSize: 0.012,
        bevelThickness: 0.012
      };
      const rubberGeo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
      rubberGeo.center();

      // 2. Текстура резины со следами графита и загрязнением на стертом месте
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');

      // Базовый мягкий матовый цвет каучука
      ctx.fillStyle = '#f3f4f7';
      ctx.fillRect(0, 0, 512, 512);

      // Микро-текстура каучука
      const imgData = ctx.getImageData(0, 0, 512, 512);
      const data = imgData.data;
      for (let i = 0; i < data.length; i += 4) {
        const n = (Math.random() - 0.5) * 8;
        data[i] = Math.min(255, Math.max(0, data[i] + n));
        data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + n));
        data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + n));
      }
      ctx.putImageData(imgData, 0, 0);

      // ГРАФИТОВОЕ ЗАГРЯЗНЕНИЕ НА СТЕРТОМ УГЛУ (верхний правый квадрант):
      const graphiteGrad = ctx.createRadialGradient(435, 75, 10, 415, 85, 125);
      graphiteGrad.addColorStop(0, 'rgba(28, 30, 36, 0.95)'); // Плотный угольно-графитовый слой
      graphiteGrad.addColorStop(0.35, 'rgba(45, 48, 56, 0.78)');
      graphiteGrad.addColorStop(0.7, 'rgba(85, 90, 102, 0.38)');
      graphiteGrad.addColorStop(1, 'rgba(243, 244, 247, 0.0)');

      ctx.fillStyle = graphiteGrad;
      ctx.beginPath();
      ctx.ellipse(430, 80, 110, 80, -Math.PI / 4, 0, Math.PI * 2);
      ctx.fill();

      // Направленные штрихи стирания карандаша
      ctx.strokeStyle = 'rgba(32, 34, 40, 0.65)';
      ctx.lineWidth = 2.5;
      for (let s = 0; s < 24; s++) {
        const sx = 365 + Math.random() * 115;
        const sy = 25 + Math.random() * 85;
        const len = 20 + Math.random() * 38;
        const angle = -Math.PI / 4 + (Math.random() - 0.5) * 0.4;
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(sx + Math.cos(angle) * len, sy + Math.sin(angle) * len);
        ctx.stroke();
      }

      // Графитовая пыль и точечные вкрапления
      for (let p = 0; p < 90; p++) {
        const px = 370 + Math.random() * 120;
        const py = 20 + Math.random() * 100;
        const r = 0.8 + Math.random() * 2.0;
        const alpha = 0.3 + Math.random() * 0.5;
        ctx.fillStyle = `rgba(30, 32, 38, ${alpha})`;
        ctx.beginPath();
        ctx.arc(px, py, r, 0, Math.PI * 2);
        ctx.fill();
      }

      const rubberTexture = new THREE.CanvasTexture(canvas);
      rubberTexture.minFilter = THREE.LinearFilter;

      const rubberMat = new THREE.MeshStandardMaterial({
        map: rubberTexture,
        roughness: 0.88,
        metalness: 0.05
      });
      const rubberMesh = new THREE.Mesh(rubberGeo, rubberMat);
      eraserGroup.add(rubberMesh);

      // Картонный защитный чехол (матовый антрацит)
      const sleeveMat = new THREE.MeshStandardMaterial({
        color: 0x14151a,
        roughness: 0.40,
        metalness: 0.08
      });
      const sleeve = new THREE.Mesh(new THREE.BoxGeometry(0.57, 0.56, 0.25), sleeveMat);
      sleeve.position.y = -0.19;
      eraserGroup.add(sleeve);

      // Алая акцентная полоса
      const stripeMat = new THREE.MeshStandardMaterial({
        color: 0xe3142a,
        roughness: 0.35,
        metalness: 0.2
      });
      const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.575, 0.08, 0.255), stripeMat);
      stripe.position.y = 0.05;
      eraserGroup.add(stripe);

      // Фирменная маркировка на чехле
      const labelCanvas = document.createElement('canvas');
      labelCanvas.width = 256;
      labelCanvas.height = 128;
      const lctx = labelCanvas.getContext('2d');
      lctx.fillStyle = '#14151a';
      lctx.fillRect(0, 0, 256, 128);
      lctx.fillStyle = '#ffffff';
      lctx.font = 'bold 26px sans-serif';
      lctx.textAlign = 'center';
      lctx.fillText('QNASSIO', 128, 52);
      lctx.font = '16px monospace';
      lctx.fillStyle = '#a0a5b2';
      lctx.fillText('ARCHITECT // 2B-4B', 128, 85);

      const labelTex = new THREE.CanvasTexture(labelCanvas);
      const labelMat = new THREE.MeshBasicMaterial({ map: labelTex });
      const labelPlane = new THREE.Mesh(new THREE.PlaneGeometry(0.48, 0.24), labelMat);
      labelPlane.position.set(0, -0.22, 0.128);
      eraserGroup.add(labelPlane);

      // Мелкие катышки графитовой резины возле места стирания
      const crumbMat = new THREE.MeshStandardMaterial({
        color: 0x383b44,
        roughness: 0.95
      });
      const crumb1 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.022, 0), crumbMat);
      crumb1.position.set(hw - 0.09, hh - 0.08, d / 2 + 0.01);
      crumb1.rotation.set(0.3, 0.6, 0.2);
      eraserGroup.add(crumb1);

      const crumb2 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.016, 0), crumbMat);
      crumb2.position.set(hw - 0.04, hh - 0.18, -d / 2 - 0.01);
      eraserGroup.add(crumb2);

      eraserGroup.scale.setScalar(scale);
      return eraserGroup;
    };

    // ─── 5. 3D REPAIRED WOODEN DRAFTING RULER (ПОЧИНЕННАЯ ЦЕЛЬНАЯ ДЕРЕВЯННАЯ ЛИНЕЙКА) ───
    const createRepairedWoodRuler = (scale = 0.60) => {
      const rulerGroup = new THREE.Group();

      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 1024;
      const ctx = canvas.getContext('2d');

      // 1. Теплый благородный тон натурального бука
      const baseGrad = ctx.createLinearGradient(0, 0, 256, 0);
      baseGrad.addColorStop(0, '#caa06e');
      baseGrad.addColorStop(0.35, '#e4bf8f');
      baseGrad.addColorStop(0.7, '#d9af7d');
      baseGrad.addColorStop(1, '#c29765');
      ctx.fillStyle = baseGrad;
      ctx.fillRect(0, 0, 256, 1024);

      // 2. Натуральные продольные волокна древесины и годовые кольца
      for (let i = 0; i < 50; i++) {
        const x = Math.random() * 256;
        const alpha = 0.06 + Math.random() * 0.15;
        const isDark = Math.random() > 0.35;
        ctx.strokeStyle = isDark ? `rgba(135, 85, 38, ${alpha})` : `rgba(255, 235, 205, ${alpha * 1.3})`;
        ctx.lineWidth = 1 + Math.random() * 3.5;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.bezierCurveTo(
          x + (Math.random() - 0.5) * 25, 340,
          x + (Math.random() - 0.5) * 25, 680,
          x + (Math.random() - 0.5) * 15, 1024
        );
        ctx.stroke();
      }

      // Тонкие древесные поры
      ctx.fillStyle = 'rgba(120, 75, 30, 0.18)';
      for (let p = 0; p < 400; p++) {
        const px = Math.random() * 256;
        const py = Math.random() * 1024;
        ctx.fillRect(px, py, 1.2, 3 + Math.random() * 4);
      }

      // 3. Фаска шкалы вдоль левого края
      const bevelGrad = ctx.createLinearGradient(0, 0, 80, 0);
      bevelGrad.addColorStop(0, 'rgba(255, 245, 230, 0.45)');
      bevelGrad.addColorStop(1, 'rgba(0, 0, 0, 0.08)');
      ctx.fillStyle = bevelGrad;
      ctx.fillRect(0, 0, 80, 1024);

      // Алая акцентная черта вдоль кромки
      ctx.fillStyle = '#e3142a';
      ctx.fillRect(0, 0, 6, 1024);

      // 4. Миллиметровая и сантиметровая чертежная разметка (0..30 см)
      const totalSteps = 40;
      const paddingY = 40;
      const usableHeight = 1024 - paddingY * 2;

      for (let s = 0; s <= totalSteps; s++) {
        const y = paddingY + (s / totalSteps) * usableHeight;
        const isCm = (s % 2 === 0);
        const isFiveCm = (s % 10 === 0);

        const tickLen = isFiveCm ? 58 : (isCm ? 42 : 24);

        ctx.fillStyle = isCm ? '#18191e' : '#45382b';
        ctx.fillRect(6, y - 1, tickLen, isCm ? 2.5 : 1.5);

        if (isCm && (s % 4 === 0)) {
          ctx.fillStyle = '#18191e';
          ctx.font = 'bold 26px monospace';
          ctx.textAlign = 'left';
          ctx.fillText((s / 2).toString(), 70, y + 8);
        }
      }

      // 5. Маркировка
      ctx.save();
      ctx.translate(190, 512);
      ctx.rotate(Math.PI / 2);
      ctx.fillStyle = '#221a12';
      ctx.font = 'bold 20px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('QNASSIO // ARCHITECT', 0, 0);
      ctx.fillStyle = '#e3142a';
      ctx.font = '14px monospace';
      ctx.fillText('HARDWOOD 30CM • TOKENS', 0, 24);
      ctx.restore();

      const rulerTexture = new THREE.CanvasTexture(canvas);
      rulerTexture.minFilter = THREE.LinearFilter;

      const rulerW = 0.38;
      const len = 3.4;
      const rulerD = 0.042;

      const sideWoodMat = new THREE.MeshStandardMaterial({
        color: 0xc89e68,
        roughness: 0.65,
        metalness: 0.04
      });

      const faceMat = new THREE.MeshStandardMaterial({
        map: rulerTexture,
        roughness: 0.55,
        metalness: 0.04
      });

      const materials = [sideWoodMat, sideWoodMat, sideWoodMat, sideWoodMat, faceMat, sideWoodMat];
      const rulerMesh = new THREE.Mesh(new THREE.BoxGeometry(rulerW, len, rulerD), materials);
      rulerGroup.add(rulerMesh);

      rulerGroup.scale.setScalar(scale);
      return rulerGroup;
    };

    // ─── 6. 3D PRECISION DRAFTING COMPASS (ТОЧНЫЙ ЧЕРТЕЖНЫЙ ЦИРКУЛЬ) ───
    const createCompass = (scale = 0.58) => {
      const compassGroup = new THREE.Group();

      const metalMat = new THREE.MeshPhysicalMaterial({
        color: 0xd8dbe2,
        metalness: 0.96,
        roughness: 0.16,
        clearcoat: 0.85,
        clearcoatRoughness: 0.12
      });

      const needleMat = new THREE.MeshStandardMaterial({
        color: 0xf0f2f8,
        metalness: 0.98,
        roughness: 0.10
      });

      const leadMat = new THREE.MeshPhysicalMaterial({
        color: 0x949aa6,
        metalness: 0.88,
        roughness: 0.28
      });

      const redAccentMat = new THREE.MeshStandardMaterial({
        color: 0xe3142a,
        roughness: 0.35,
        metalness: 0.4
      });

      // Верхняя накатанная рукоятка
      const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.038, 0.45, 12), metalMat);
      handle.position.y = 0.92;
      compassGroup.add(handle);

      // Центральный шарнир
      const joint = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.08, 16), metalMat);
      joint.position.y = 0.68;
      joint.rotation.x = Math.PI / 2;
      compassGroup.add(joint);

      // Ножка 1: с иглой
      const leg1Group = new THREE.Group();
      const leg1Arm = new THREE.Mesh(new THREE.CylinderGeometry(0.036, 0.024, 1.45, 8), metalMat);
      leg1Arm.position.y = -0.725;
      leg1Group.add(leg1Arm);

      const needle = new THREE.Mesh(new THREE.ConeGeometry(0.016, 0.38, 8), needleMat);
      needle.position.y = -1.45 - 0.19;
      leg1Group.add(needle);

      leg1Group.position.set(-0.04, 0.68, 0);
      leg1Group.rotation.z = -0.16;
      compassGroup.add(leg1Group);

      // Ножка 2: с зажимом и грифелем
      const leg2Group = new THREE.Group();
      const leg2Arm = new THREE.Mesh(new THREE.CylinderGeometry(0.036, 0.028, 1.35, 8), metalMat);
      leg2Arm.position.y = -0.675;
      leg2Group.add(leg2Arm);

      const clampCollar = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.14, 12), redAccentMat);
      clampCollar.position.y = -1.35 - 0.07;
      leg2Group.add(clampCollar);

      const leadStick = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.28, 8), leadMat);
      leadStick.position.y = -1.35 - 0.21;
      leg2Group.add(leadStick);

      const leadCone = new THREE.Mesh(new THREE.ConeGeometry(0.022, 0.08, 8), leadMat);
      leadCone.position.y = -1.35 - 0.35 - 0.04;
      leg2Group.add(leadCone);

      leg2Group.position.set(0.04, 0.68, 0);
      leg2Group.rotation.z = 0.16;
      compassGroup.add(leg2Group);

      // Центральный регулировочный винт с колёсиком
      const spindle = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.65, 8), metalMat);
      spindle.rotation.z = Math.PI / 2;
      spindle.position.y = 0.12;
      compassGroup.add(spindle);

      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.04, 16), redAccentMat);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.y = 0.12;
      compassGroup.add(wheel);

      compassGroup.scale.setScalar(scale);
      return compassGroup;
    };

    // Helper to register items with autonomous life properties
    const registerItem = (obj, basePos, baseRot) => {
      obj.position.copy(basePos);
      obj.rotation.copy(baseRot);
      this.stationeryGroup.add(obj);

      this.deskItems.push({
        obj,
        basePos: basePos.clone(),
        baseRot: baseRot.clone(),
        // Autonomous life frequencies & amplitudes
        freqX: 0.6 + Math.random() * 0.5,
        freqY: 0.8 + Math.random() * 0.6,
        freqZ: 0.5 + Math.random() * 0.4,
        freqRotX: 0.4 + Math.random() * 0.4,
        freqRotY: 0.35 + Math.random() * 0.4,
        freqRotZ: 0.5 + Math.random() * 0.5,
        phase: Math.random() * Math.PI * 2,
        ampPos: 0.14 + Math.random() * 0.08,
        ampRot: 0.18 + Math.random() * 0.10,
        // Proximity & impulse physics
        impulseX: 0,
        impulseY: 0,
        impulseRotX: 0,
        impulseRotY: 0,
        impulseRotZ: 0
      });
    };

    // ─── PLACEMENT: ELEGANTLY DISTRIBUTED AT MARGINS & CORNERS ───
    // 1. Top-Left: Anodized Crimson Paperclip
    const clip1 = createPaperclip(0xe3142a, 0.62);
    registerItem(clip1, new THREE.Vector3(-5.6, 3.4, 0.3), new THREE.Euler(0.2, -0.15, 0.5));

    // 2. Top-Right: Polished Chrome Silver Paperclip
    const clip2 = createPaperclip(0xe6e8ee, 0.60);
    registerItem(clip2, new THREE.Vector3(5.7, 3.3, 0.2), new THREE.Euler(0.15, 0.2, -0.65));

    // 3. Right: Architectural Eraser (справа возле скрепок)
    const eraser = createEraser(0.58);
    registerItem(eraser, new THREE.Vector3(5.8, 1.9, 0.28), new THREE.Euler(0.25, -0.20, 0.35));

    // 4. Mid-Right Edge: Small Chrome Paperclip
    const clip4 = createPaperclip(0xcccccc, 0.54);
    registerItem(clip4, new THREE.Vector3(6.3, 0.5, 0.2), new THREE.Euler(-0.2, 0.3, -1.1));

    // 5. Right Margin: Whole Repaired Wooden Drafting Ruler (починенная деревянная линейка)
    const ruler = createRepairedWoodRuler(0.60);
    registerItem(ruler, new THREE.Vector3(6.2, -1.6, 0.24), new THREE.Euler(0.18, -0.22, 0.28));

    // 6. Bottom-Right Corner: Titanium Gunmetal Paperclip
    const clip3 = createPaperclip(0x383944, 0.62);
    registerItem(clip3, new THREE.Vector3(5.4, -3.3, 0.25), new THREE.Euler(0.18, -0.22, 0.4));

    // 7. Left Margin: Precision Drafting Compass (чертёжный циркуль)
    const compass = createCompass(0.58);
    registerItem(compass, new THREE.Vector3(-5.8, 1.3, 0.32), new THREE.Euler(0.20, 0.22, -0.42));

    // 8. Bottom-Left Margin: Two independent broken pencil halves
    const { partA: pencilBottom, partB: pencilTop } = createBrokenPencilHalves(0xe3142a, 0.65);
    registerItem(pencilBottom, new THREE.Vector3(-6.5, -1.35, 0.38), new THREE.Euler(0.22, 0.16, -0.68));
    registerItem(pencilTop, new THREE.Vector3(-5.9, -0.45, 0.42), new THREE.Euler(-0.16, -0.20, 0.35));

    // 9. Bottom-Left Corner: Cyber Pushpin
    const pin1 = createPushpin(0xe3142a, 0.60);
    registerItem(pin1, new THREE.Vector3(-5.5, -3.3, 0.35), new THREE.Euler(0.6, 0.2, 0.8));
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const delta = Math.min(this.clock.getDelta(), 0.1);
    const elapsedTime = this.clock.getElapsedTime();

    // Mouse velocity calculation for inertia & elastic stretch
    const vx = (this.mouse.targetX - this.mouse.x);
    const vy = (this.mouse.targetY - this.mouse.y);
    this.mouse.velX += (vx - this.mouse.velX) * 0.1;
    this.mouse.velY += (vy - this.mouse.velY) * 0.1;

    this.mouse.x += vx * 0.08;
    this.mouse.y += vy * 0.08;
    this.scrollY += (this.targetScrollY - this.scrollY) * 0.08;

    // Update click ripples age
    for (let i = 0; i < this.clicks.length; i++) {
      if (this.clicks[i].z >= 0.0) {
        this.clicks[i].z += delta * 1.35;
        if (this.clicks[i].z > 1.8) {
          this.clicks[i].z = -1.0;
        }
      }
    }

    if (this.gridMaterial) {
      this.gridMaterial.uniforms.uMouse.value.set(this.mouse.x, this.mouse.y);
      this.gridMaterial.uniforms.uMouseVel.value.set(this.mouse.velX, this.mouse.velY);
      this.gridMaterial.uniforms.uScroll.value = this.scrollY;
      this.gridMaterial.uniforms.uTime.value = elapsedTime;
      this.gridMaterial.uniforms.uClicks.value = this.clicks;
    }

    // Screen world space cursor for 3D proximity interactions
    const aspect = window.innerWidth / window.innerHeight;
    const mouseWorldX = (this.mouse.x - 0.5) * (8.28 * aspect);
    const mouseWorldY = (this.mouse.y - 0.5) * 8.28;
    const scrollShiftY = this.scrollY * 1.2;

    // ─── AUTONOMOUS "LIVING THEIR OWN LIFE" PHYSICS & FLOATING ───
    this.deskItems.forEach((item) => {
      // 1. Organic Harmonic Levitation & Wobble
      const floatX = Math.sin(elapsedTime * item.freqX + item.phase) * item.ampPos;
      const floatY = Math.cos(elapsedTime * item.freqY + item.phase * 1.2) * item.ampPos;
      const floatZ = Math.sin(elapsedTime * item.freqZ + item.phase * 0.7) * (item.ampPos * 0.7);

      const rotX = Math.sin(elapsedTime * item.freqRotX + item.phase) * item.ampRot;
      const rotY = Math.cos(elapsedTime * item.freqRotY + item.phase * 1.1) * item.ampRot;
      const rotZ = Math.sin(elapsedTime * item.freqRotZ + item.phase * 0.8) * item.ampRot;

      // 2. Interactive Proximity Repulsion from Cursor
      const dx = item.obj.position.x - mouseWorldX;
      const dy = item.obj.position.y - mouseWorldY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 2.6) {
        const repelForce = (1.0 - dist / 2.6) * 0.08;
        const normX = dist > 0.001 ? dx / dist : 0.5;
        const normY = dist > 0.001 ? dy / dist : 0.5;
        item.impulseX += normX * repelForce;
        item.impulseY += normY * repelForce;
        item.impulseRotX += normY * repelForce * 1.8;
        item.impulseRotY += -normX * repelForce * 1.8;
      }

      // Damping impulses back to resting float
      item.impulseX *= 0.92;
      item.impulseY *= 0.92;
      item.impulseRotX *= 0.90;
      item.impulseRotY *= 0.90;
      item.impulseRotZ *= 0.90;

      // Apply combined transform
      item.obj.position.x = item.basePos.x + floatX + item.impulseX;
      item.obj.position.y = item.basePos.y + floatY + item.impulseY - scrollShiftY * 0.15;
      item.obj.position.z = item.basePos.z + floatZ;

      item.obj.rotation.x = item.baseRot.x + rotX + item.impulseRotX;
      item.obj.rotation.y = item.baseRot.y + rotY + item.impulseRotY;
      item.obj.rotation.z = item.baseRot.z + rotZ + item.impulseRotZ;
    });

    this.renderer.render(this.scene, this.camera);
  }
}
