import * as THREE from 'three';

export class Product3DViewer {
  constructor(container) {
    this.container = container;
    this.scene = new THREE.Scene();
    this.currentProduct = 'exoskeleton';
    this.currentColor = 0x070709;
    this.isWireframe = false;
    this.isDragging = false;
    this.previousMouse = { x: 0, y: 0 };

    this.init();
    this.createLights();
    this.buildProductModels();
    this.setupEvents();
    this.animate();
  }

  init() {
    this.width = this.container.clientWidth || 500;
    this.height = this.container.clientHeight || 500;

    this.camera = new THREE.PerspectiveCamera(40, this.width / this.height, 0.1, 50);
    this.camera.position.set(0, 0, 7.5);

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.container.appendChild(this.renderer.domElement);

    this.productPivot = new THREE.Group();
    this.scene.add(this.productPivot);
  }

  createLights() {
    const ambient = new THREE.AmbientLight(0xffe1bf, 0.5);
    this.scene.add(ambient);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 2.0);
    dirLight1.position.set(4, 5, 4);
    this.scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x565656, 1.0);
    dirLight2.position.set(-4, -2, -2);
    this.scene.add(dirLight2);

    // Red highlight accent
    this.redAccentLight = new THREE.PointLight(0xe3142a, 3.0, 12);
    this.redAccentLight.position.set(0, -1, 3);
    this.scene.add(this.redAccentLight);
  }

  buildProductModels() {
    this.materials = {
      main: new THREE.MeshPhysicalMaterial({
        color: this.currentColor,
        roughness: 0.15,
        metalness: 0.8,
        clearcoat: 1.0,
        clearcoatRoughness: 0.08
      }),
      neon: new THREE.MeshBasicMaterial({
        color: 0xe3142a
      }),
      glass: new THREE.MeshPhysicalMaterial({
        color: 0x050505,
        roughness: 0.05,
        metalness: 0.9,
        transmission: 0.6,
        transparent: true,
        opacity: 0.85
      })
    };

    // --- Product 1: SILENCE EXOSKELETON TRENCH ---
    this.exoModel = new THREE.Group();
    
    // Spine column: 7 vertebrae segments
    for (let i = 0; i < 7; i++) {
      const vertGeo = new THREE.BoxGeometry(0.35 - i * 0.02, 0.22, 0.4);
      const vertMesh = new THREE.Mesh(vertGeo, this.materials.main);
      vertMesh.position.set(0, 1.2 - i * 0.35, -0.2);
      this.exoModel.add(vertMesh);

      // Spine rib cage connectors
      [-1, 1].forEach((side) => {
        const ribCurve = new THREE.QuadraticBezierCurve3(
          new THREE.Vector3(side * 0.18, 1.2 - i * 0.35, -0.2),
          new THREE.Vector3(side * (1.1 - i * 0.05), 1.1 - i * 0.38, 0.2),
          new THREE.Vector3(side * (0.8 - i * 0.08), 1.0 - i * 0.4, 0.7)
        );
        const ribGeo = new THREE.TubeGeometry(ribCurve, 20, 0.035, 8, false);
        const ribMesh = new THREE.Mesh(ribGeo, this.materials.main);
        this.exoModel.add(ribMesh);
      });

      // Neon glowing spinal cord node
      const nodeGeo = new THREE.SphereGeometry(0.06, 12, 12);
      const nodeMesh = new THREE.Mesh(nodeGeo, this.materials.neon);
      nodeMesh.position.set(0, 1.2 - i * 0.35, -0.42);
      this.exoModel.add(nodeMesh);
    }

    // Outer cyber trench silhouette drape
    const drapeGeo = new THREE.ConeGeometry(1.6, 2.6, 32, 1, true);
    drapeGeo.scale(1.0, 1.0, 0.75);
    const drapeMesh = new THREE.Mesh(drapeGeo, this.materials.main);
    drapeMesh.position.set(0, -0.5, 0);
    this.exoModel.add(drapeMesh);

    // Glowing seamlines down the coat
    [-0.5, 0.5].forEach((xPos) => {
      const seamGeo = new THREE.CylinderGeometry(0.015, 0.015, 2.5, 8);
      const seamMesh = new THREE.Mesh(seamGeo, this.materials.neon);
      seamMesh.position.set(xPos, -0.5, 0.78);
      this.exoModel.add(seamMesh);
    });

    this.productPivot.add(this.exoModel);

    // --- Product 2: MK-IV CYBER-VISOR ---
    this.visorModel = new THREE.Group();
    const vArc = new THREE.CylinderGeometry(1.8, 1.8, 0.75, 48, 1, true, -Math.PI * 0.45, Math.PI * 0.9);
    const vShield = new THREE.Mesh(vArc, this.materials.glass);
    this.visorModel.add(vShield);

    // Sleek frame rims
    const topBarGeo = new THREE.BoxGeometry(3.2, 0.12, 0.2);
    const topBar = new THREE.Mesh(topBarGeo, this.materials.main);
    topBar.position.set(0, 0.38, 1.1);
    this.visorModel.add(topBar);

    // Holographic red HUD HUD lines
    const reticleGeo = new THREE.RingGeometry(0.2, 0.22, 32);
    [-0.8, 0.8].forEach((x) => {
      const reticle = new THREE.Mesh(reticleGeo, this.materials.neon);
      reticle.position.set(x, 0.05, 1.55);
      this.visorModel.add(reticle);
    });

    // Side temples with red laser markers
    [-1, 1].forEach((side) => {
      const templeGeo = new THREE.BoxGeometry(0.12, 0.2, 2.0);
      const temple = new THREE.Mesh(templeGeo, this.materials.main);
      temple.position.set(side * 1.55, 0.1, 0.1);
      this.visorModel.add(temple);

      const laserGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.6, 8);
      const laser = new THREE.Mesh(laserGeo, this.materials.neon);
      laser.position.set(side * 1.62, 0.1, 0.3);
      laser.rotation.z = Math.PI / 2;
      this.visorModel.add(laser);
    });

    this.visorModel.visible = false;
    this.productPivot.add(this.visorModel);

    // --- Product 3: NEOSEOUL KINETIC ARMOR HARNESS ---
    this.armorModel = new THREE.Group();
    
    // Chest chestplate cuirass
    const chestGeo = new THREE.BoxGeometry(1.8, 1.4, 0.4);
    const chestMesh = new THREE.Mesh(chestGeo, this.materials.main);
    chestMesh.position.set(0, 0.3, 0);
    this.armorModel.add(chestMesh);

    // Angular shoulder pauldrons
    [-1, 1].forEach((side) => {
      const pauldronGeo = new THREE.ConeGeometry(0.7, 1.0, 4);
      const pauldron = new THREE.Mesh(pauldronGeo, this.materials.main);
      pauldron.position.set(side * 1.6, 0.7, 0);
      pauldron.rotation.z = -side * 0.9;
      this.armorModel.add(pauldron);

      const pauldronNeon = new THREE.BoxGeometry(0.08, 0.6, 0.1);
      const pNeon = new THREE.Mesh(pauldronNeon, this.materials.neon);
      pNeon.position.set(side * 1.7, 0.85, 0.3);
      this.armorModel.add(pNeon);
    });

    // Center circular reactor core
    const reactorGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.15, 32);
    const reactor = new THREE.Mesh(reactorGeo, this.materials.main);
    reactor.rotation.x = Math.PI / 2;
    reactor.position.set(0, 0.3, 0.22);
    this.armorModel.add(reactor);

    const innerCoreGeo = new THREE.RingGeometry(0.18, 0.24, 32);
    const innerCore = new THREE.Mesh(innerCoreGeo, this.materials.neon);
    innerCore.position.set(0, 0.3, 0.31);
    this.armorModel.add(innerCore);

    this.armorModel.visible = false;
    this.productPivot.add(this.armorModel);
  }

  setProduct(productKey) {
    this.currentProduct = productKey;
    this.exoModel.visible = productKey === 'exoskeleton';
    this.visorModel.visible = productKey === 'visor';
    this.armorModel.visible = productKey === 'armor';

    // Reset rotation smoothly
    this.productPivot.rotation.set(0, 0, 0);
  }

  setColor(hexColor) {
    this.currentColor = hexColor;
    this.materials.main.color.setHex(hexColor);
    if (hexColor === 0xffe1bf) {
      this.materials.main.metalness = 0.4;
      this.materials.main.roughness = 0.4;
    } else if (hexColor === 0xe3142a) {
      this.materials.main.metalness = 0.85;
      this.materials.main.roughness = 0.1;
    } else {
      this.materials.main.metalness = 0.85;
      this.materials.main.roughness = 0.15;
    }
  }

  toggleWireframe() {
    this.isWireframe = !this.isWireframe;
    this.materials.main.wireframe = this.isWireframe;
    return this.isWireframe;
  }

  setupEvents() {
    const onMove = (e) => {
      const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
      const clientY = e.clientY || (e.touches && e.touches[0].clientY) || 0;

      if (this.isDragging) {
        const deltaX = clientX - this.previousMouse.x;
        const deltaY = clientY - this.previousMouse.y;
        this.productPivot.rotation.y += deltaX * 0.01;
        this.productPivot.rotation.x += deltaY * 0.01;
        this.previousMouse = { x: clientX, y: clientY };
      }
    };

    this.container.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.previousMouse = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', () => {
      this.isDragging = false;
    });

    window.addEventListener('resize', () => {
      this.width = this.container.clientWidth;
      this.height = this.container.clientHeight;
      this.camera.aspect = this.width / this.height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(this.width, this.height);
    });
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    const time = performance.now() * 0.001;

    if (!this.isDragging) {
      this.productPivot.rotation.y += 0.008;
      this.productPivot.position.y = Math.sin(time * 1.8) * 0.08;
    }

    this.renderer.render(this.scene, this.camera);
  }
}
