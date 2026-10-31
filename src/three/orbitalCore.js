import * as THREE from 'three';

export class OrbitalCoreScene {
  constructor(container) {
    this.container = container;
    this.scene = new THREE.Scene();
    this.hoveredRule = null;
    this.init();
    this.createLights();
    this.createCore();
    this.setupEvents();
    this.animate();
  }

  init() {
    this.width = this.container.clientWidth || 400;
    this.height = this.container.clientHeight || 400;

    this.camera = new THREE.PerspectiveCamera(40, this.width / this.height, 0.1, 50);
    this.camera.position.set(0, 0, 6.0);

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.container.appendChild(this.renderer.domElement);
    this.coreGroup = new THREE.Group();
    this.scene.add(this.coreGroup);
  }

  createLights() {
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambient);

    const redLight = new THREE.PointLight(0xe3142a, 3.5, 10);
    redLight.position.set(2, 2, 3);
    this.scene.add(redLight);

    const rimLight = new THREE.DirectionalLight(0xffe1bf, 1.2);
    rimLight.position.set(-3, 3, -2);
    this.scene.add(rimLight);
  }

  createCore() {
    // 1. Central stylized cyber face / geometric gem
    const headGeo = new THREE.IcosahedronGeometry(0.9, 3);
    // Sculpt facets
    this.headMat = new THREE.MeshPhysicalMaterial({
      color: 0x070709,
      roughness: 0.15,
      metalness: 0.85,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1
    });
    this.headMesh = new THREE.Mesh(headGeo, this.headMat);
    this.coreGroup.add(this.headMesh);

    // Inner glowing red wireframe
    const wireGeo = new THREE.IcosahedronGeometry(0.92, 2);
    this.wireMat = new THREE.MeshBasicMaterial({
      color: 0xe3142a,
      wireframe: true,
      transparent: true,
      opacity: 0.4
    });
    this.wireMesh = new THREE.Mesh(wireGeo, this.wireMat);
    this.coreGroup.add(this.wireMesh);

    // 2. Visor bar
    const visorGeo = new THREE.BoxGeometry(1.2, 0.22, 0.6);
    const visorMat = new THREE.MeshPhysicalMaterial({
      color: 0x050505,
      emissive: 0xe3142a,
      emissiveIntensity: 0.4,
      roughness: 0.1,
      metalness: 0.9,
      clearcoat: 1.0
    });
    this.visor = new THREE.Mesh(visorGeo, visorMat);
    this.visor.position.set(0, 0.1, 0.65);
    this.coreGroup.add(this.visor);

    // 3. Orbital Gyroscopic Rings (Balenciaga orbital diagram in 3D)
    this.rings = [];
    const ringRadii = [1.5, 1.85, 2.2];
    const ringColors = [0xe3142a, 0x565656, 0xffe1bf];

    ringRadii.forEach((radius, i) => {
      const ringGeo = new THREE.RingGeometry(radius, radius + 0.02, 64);
      const ringMat = new THREE.MeshBasicMaterial({
        color: ringColors[i],
        side: THREE.DoubleSide,
        transparent: true,
        opacity: i === 0 ? 0.9 : 0.45
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = (Math.PI / 4) * (i + 1);
      ringMesh.rotation.y = (Math.PI / 6) * i;
      this.coreGroup.add(ringMesh);
      this.rings.push({ mesh: ringMesh, speed: (i + 1) * 0.25 * (i % 2 === 0 ? 1 : -1) });

      // Add a laser marker point traveling along the ring
      const dotGeo = new THREE.SphereGeometry(0.04, 16, 16);
      const dotMat = new THREE.MeshBasicMaterial({ color: 0xe3142a });
      const dot = new THREE.Mesh(dotGeo, dotMat);
      dot.position.set(radius, 0, 0);
      ringMesh.add(dot);
    });

    // 4. Korean Glyph Floating Disks (Referencing SYNTH: 사이 혁명)
    const diskGeo = new THREE.RingGeometry(2.5, 2.52, 64);
    const diskMat = new THREE.MeshBasicMaterial({
      color: 0x565656,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide
    });
    this.outerDisk = new THREE.Mesh(diskGeo, diskMat);
    this.coreGroup.add(this.outerDisk);
  }

  setRuleFocus(ruleIndex) {
    this.hoveredRule = ruleIndex;
    if (ruleIndex === 1) {
      // FEARLESS INNOVATION - Red pulse & high speed
      this.targetRot = { x: 0.3, y: -0.4, z: 0 };
      this.wireMat.opacity = 0.9;
      this.headMat.roughness = 0.05;
      this.headMat.metalness = 0.95;
    } else if (ruleIndex === 2) {
      // SCULPTURAL SILHOUETTES - Exaggerated scale
      this.targetRot = { x: -0.3, y: 0.4, z: 0 };
      this.wireMat.opacity = 0.4;
      this.headMesh.scale.set(1.25, 1.4, 1.1);
    } else if (ruleIndex === 3) {
      // URBAN ELEGANCE - Cream tone & sleek finish
      this.targetRot = { x: 0.2, y: -0.5, z: 0.2 };
      this.headMat.color.setHex(0x111114);
      this.headMat.roughness = 0.25;
    } else if (ruleIndex === 4) {
      // CULTURAL COMMENTARY - Cyber wireframe dominant
      this.targetRot = { x: -0.2, y: 0.5, z: -0.2 };
      this.wireMat.opacity = 1.0;
      this.headMat.wireframe = true;
    } else {
      // Reset
      this.targetRot = { x: 0, y: 0, z: 0 };
      this.wireMat.opacity = 0.4;
      this.headMat.wireframe = false;
      this.headMat.color.setHex(0x070709);
      this.headMesh.scale.set(1, 1, 1);
    }
  }

  setupEvents() {
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

    // Spin rings
    this.rings.forEach((r) => {
      r.mesh.rotation.z += r.speed * 0.015;
    });

    if (this.outerDisk) {
      this.outerDisk.rotation.z = -time * 0.1;
    }

    if (this.hoveredRule && this.targetRot) {
      this.coreGroup.rotation.x = THREE.MathUtils.lerp(this.coreGroup.rotation.x, this.targetRot.x, 0.08);
      this.coreGroup.rotation.y = THREE.MathUtils.lerp(this.coreGroup.rotation.y, this.targetRot.y, 0.08);
    } else {
      this.coreGroup.rotation.y = time * 0.4;
      this.coreGroup.rotation.x = Math.sin(time * 0.5) * 0.15;
    }

    this.renderer.render(this.scene, this.camera);
  }
}
