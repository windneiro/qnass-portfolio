import * as THREE from 'three';

export class Hero3DScene {
  constructor(container) {
    this.container = container;
    this.scene = new THREE.Scene();
    this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    this.isDragging = false;
    this.previousMousePosition = { x: 0, y: 0 };
    this.currentMode = 'obsidian'; // 'obsidian', 'chrome', 'wireframe', 'pulse'
    this.exploded = false;
    this.explodeFactor = 0;
    this.targetExplodeFactor = 0;
    this.scrollProgress = 0;
    this.targetScrollProgress = 0;

    this.init();
    this.createLights();
    this.createBust();
    this.createBackgroundHalo();
    this.setupEvents();
    this.animate();
  }

  init() {
    this.width = this.container.clientWidth || window.innerWidth;
    this.height = this.container.clientHeight || window.innerHeight;

    this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 0.1, 100);
    this.camera.position.set(0, 0, 8.5);

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.35;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.container.appendChild(this.renderer.domElement);

    this.bustGroup = new THREE.Group();
    this.scene.add(this.bustGroup);
  }

  createLights() {
    // Ambient light with soft warm cream tone from reference palette
    this.ambientLight = new THREE.AmbientLight(0xffe1bf, 0.4);
    this.scene.add(this.ambientLight);

    // Key front light (soft ivory)
    this.keyLight = new THREE.DirectionalLight(0xffffff, 1.8);
    this.keyLight.position.set(4, 5, 5);
    this.scene.add(this.keyLight);

    // Intense Red Rim / Backlight (Reference #E3142A)
    this.redBackLight = new THREE.PointLight(0xe3142a, 4.5, 15);
    this.redBackLight.position.set(0, 0, -3.2);
    this.scene.add(this.redBackLight);

    // Red SpotLight from behind creating dramatic rim silhouette
    this.redSpot = new THREE.SpotLight(0xe3142a, 8.0, 20, Math.PI / 3, 0.8, 1);
    this.redSpot.position.set(0, 0, -4.5);
    this.redSpot.target = this.bustGroup;
    this.scene.add(this.redSpot);

    // Interactive mouse tracking red light
    this.mouseLight = new THREE.PointLight(0xe3142a, 2.0, 10);
    this.mouseLight.position.set(0, 0, 4);
    this.scene.add(this.mouseLight);

    // Cool secondary rim light
    this.fillLight = new THREE.DirectionalLight(0x565656, 1.0);
    this.fillLight.position.set(-5, -2, -2);
    this.scene.add(this.fillLight);
  }

  createMaterials() {
    // 1. Obsidian Gloss (Balenciaga high-gloss latex / vinyl)
    this.obsidianMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x070709,
      emissive: 0x050508,
      roughness: 0.12,
      metalness: 0.82,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      reflectivity: 1.0
    });

    // 2. Liquid Chrome (Glossy cyber-metallic armor)
    this.chromeMaterial = new THREE.MeshStandardMaterial({
      color: 0xdddddd,
      roughness: 0.04,
      metalness: 0.98
    });

    // 3. Neon Red Glowing Conduit (#E3142A)
    this.neonRedMaterial = new THREE.MeshBasicMaterial({
      color: 0xe3142a,
      wireframe: false
    });

    // 4. Tinted Visor Glass
    this.visorMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x0a0a0f,
      emissive: 0x220508,
      roughness: 0.05,
      metalness: 0.9,
      transmission: 0.5,
      ior: 1.6,
      transparent: true,
      opacity: 0.92,
      clearcoat: 1.0
    });

    // 5. Wireframe Hologram
    this.wireframeMaterial = new THREE.MeshBasicMaterial({
      color: 0xe3142a,
      wireframe: true,
      transparent: true,
      opacity: 0.85
    });

    // 6. Accent Gold/Cream Material (#FFE1BF)
    this.creamMaterial = new THREE.MeshStandardMaterial({
      color: 0xffe1bf,
      roughness: 0.3,
      metalness: 0.4
    });

    this.allMaterials = [
      this.obsidianMaterial,
      this.chromeMaterial,
      this.neonRedMaterial,
      this.visorMaterial,
      this.wireframeMaterial,
      this.creamMaterial
    ];
  }

  createBust() {
    this.createMaterials();
    this.parts = [];

    // --- 1. Stylized Head Form ---
    const headGeo = new THREE.SphereGeometry(1.2, 64, 64);
    // Sculpt the head: elongate slightly and taper chin
    const pos = headGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      let y = pos.getY(i);
      let x = pos.getX(i);
      let z = pos.getZ(i);

      // Elongate and refine jawline
      if (y < 0) {
        let taper = 1.0 + y * 0.35;
        pos.setX(i, x * Math.max(0.4, taper));
        pos.setZ(i, z * Math.max(0.6, taper + 0.1));
      }
      // Sculpt high cheekbones
      if (y > -0.2 && y < 0.4 && z > 0) {
        pos.setZ(i, z * 1.08);
      }
      // Flatten back of skull slightly
      if (z < -0.4) {
        pos.setZ(i, z * 0.95);
      }
    }
    headGeo.computeVertexNormals();
    this.headMesh = new THREE.Mesh(headGeo, this.obsidianMaterial);
    this.headMesh.position.set(0, 0.4, 0);
    this.bustGroup.add(this.headMesh);
    this.parts.push({ mesh: this.headMesh, dir: new THREE.Vector3(0, 0, 0), origPos: this.headMesh.position.clone() });

    // --- 2. Sleek Wraparound Cyber-Visor / Sunglasses (Balenciaga / Synth Hybrid) ---
    const visorShape = new THREE.CylinderGeometry(1.28, 1.25, 0.52, 64, 8, true, -Math.PI * 0.48, Math.PI * 0.96);
    this.visorMesh = new THREE.Mesh(visorShape, this.visorMaterial);
    this.visorMesh.position.set(0, 0.45, 0.08);
    this.visorMesh.rotation.x = 0.08;
    this.bustGroup.add(this.visorMesh);
    this.parts.push({ mesh: this.visorMesh, dir: new THREE.Vector3(0, 0, 1.4), origPos: this.visorMesh.position.clone() });

    // Visor Red Top & Bottom Glowing Trim
    const visorRimTop = new THREE.TorusGeometry(1.28, 0.025, 16, 64, Math.PI * 0.96);
    const rimMeshTop = new THREE.Mesh(visorRimTop, this.neonRedMaterial);
    rimMeshTop.position.set(0, 0.71, 0.08);
    rimMeshTop.rotation.x = Math.PI / 2 + 0.08;
    rimMeshTop.rotation.z = Math.PI * 0.02;
    this.bustGroup.add(rimMeshTop);
    this.parts.push({ mesh: rimMeshTop, dir: new THREE.Vector3(0, 0.3, 1.4), origPos: rimMeshTop.position.clone() });

    // --- 3. Cybernetic Ear Turbines & Audio Horns (SYNTH ref) ---
    [-1, 1].forEach((side) => {
      // Outer ear housing
      const earGroup = new THREE.Group();
      earGroup.position.set(side * 1.35, 0.4, -0.05);

      // Turbine outer rim
      const turbineGeo = new THREE.CylinderGeometry(0.36, 0.36, 0.22, 32);
      const turbineMesh = new THREE.Mesh(turbineGeo, this.obsidianMaterial);
      turbineMesh.rotation.z = Math.PI / 2;
      earGroup.add(turbineMesh);

      // Inner glowing neon red core
      const innerCoreGeo = new THREE.TorusGeometry(0.24, 0.04, 16, 32);
      const innerCore = new THREE.Mesh(innerCoreGeo, this.neonRedMaterial);
      innerCore.rotation.y = Math.PI / 2;
      earGroup.add(innerCore);

      // Center red glowing point
      const centerPointGeo = new THREE.SphereGeometry(0.08, 16, 16);
      const centerPoint = new THREE.Mesh(centerPointGeo, this.neonRedMaterial);
      earGroup.add(centerPoint);

      // Angular Cyber Horn / Antenna Fin (SYNTH helmet horns)
      const hornGeo = new THREE.ConeGeometry(0.12, 1.1, 4);
      const hornMesh = new THREE.Mesh(hornGeo, this.obsidianMaterial);
      hornMesh.position.set(side * 0.1, 0.8, -0.3);
      hornMesh.rotation.z = -side * 0.55;
      hornMesh.rotation.x = -0.4;
      earGroup.add(hornMesh);

      // Glowing tip on the horn
      const hornTipGeo = new THREE.ConeGeometry(0.05, 0.3, 4);
      const hornTipMesh = new THREE.Mesh(hornTipGeo, this.neonRedMaterial);
      hornTipMesh.position.set(side * 0.18, 1.3, -0.45);
      hornTipMesh.rotation.z = -side * 0.55;
      hornTipMesh.rotation.x = -0.4;
      earGroup.add(hornTipMesh);

      this.bustGroup.add(earGroup);
      this.parts.push({ mesh: earGroup, dir: new THREE.Vector3(side * 1.5, 0, 0), origPos: earGroup.position.clone() });
    });

    // --- 4. Neck & Collar Anatomical Armor ---
    // Neck cylinder
    const neckGeo = new THREE.CylinderGeometry(0.65, 0.78, 1.2, 32);
    this.neckMesh = new THREE.Mesh(neckGeo, this.obsidianMaterial);
    this.neckMesh.position.set(0, -0.65, -0.1);
    this.bustGroup.add(this.neckMesh);
    this.parts.push({ mesh: this.neckMesh, dir: new THREE.Vector3(0, -0.5, 0), origPos: this.neckMesh.position.clone() });

    // Segmented glowing neck rings (conduits)
    for (let r = 0; r < 3; r++) {
      const ringGeo = new THREE.TorusGeometry(0.68 + r * 0.04, 0.025, 16, 48);
      const ringMesh = new THREE.Mesh(ringGeo, this.neonRedMaterial);
      ringMesh.position.set(0, -0.45 - r * 0.22, -0.1);
      ringMesh.rotation.x = Math.PI / 2;
      this.bustGroup.add(ringMesh);
      this.parts.push({ mesh: ringMesh, dir: new THREE.Vector3(0, -0.4, 0.3), origPos: ringMesh.position.clone() });
    }

    // --- 5. Haute Couture Shoulders & Collarbone Armor Mantle ---
    const mantleGeo = new THREE.CylinderGeometry(0.85, 2.2, 1.3, 48, 8, true);
    mantleGeo.scale(1.4, 1.0, 0.85); // Exaggerated sculptural Balenciaga proportions
    this.mantleMesh = new THREE.Mesh(mantleGeo, this.obsidianMaterial);
    this.mantleMesh.position.set(0, -1.6, -0.1);
    this.bustGroup.add(this.mantleMesh);
    this.parts.push({ mesh: this.mantleMesh, dir: new THREE.Vector3(0, -1.5, 0), origPos: this.mantleMesh.position.clone() });

    // Armor chest spine & glowing breastplate contour (Synth red lines on chest)
    const contourCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, -0.9, 0.7),
      new THREE.Vector3(-0.6, -1.2, 0.85),
      new THREE.Vector3(0, -1.6, 0.95),
      new THREE.Vector3(0.6, -1.2, 0.85),
      new THREE.Vector3(0, -0.9, 0.7),
    ]);
    const contourGeo = new THREE.TubeGeometry(contourCurve, 64, 0.03, 12, true);
    this.contourMesh = new THREE.Mesh(contourGeo, this.neonRedMaterial);
    this.bustGroup.add(this.contourMesh);
    this.parts.push({ mesh: this.contourMesh, dir: new THREE.Vector3(0, -1.2, 0.8), origPos: this.contourMesh.position.clone() });

    // Center chest neon core emblem
    const corePlateGeo = new THREE.BoxGeometry(0.25, 0.6, 0.08);
    const corePlateMesh = new THREE.Mesh(corePlateGeo, this.neonRedMaterial);
    corePlateMesh.position.set(0, -1.25, 0.88);
    this.bustGroup.add(corePlateMesh);
    this.parts.push({ mesh: corePlateMesh, dir: new THREE.Vector3(0, -1.2, 1.0), origPos: corePlateMesh.position.clone() });

    // --- 6. Floating Holographic Cyber Ring (HUD Halo) ---
    const haloGeo = new THREE.TorusGeometry(2.3, 0.015, 16, 80);
    this.haloMesh = new THREE.Mesh(haloGeo, this.neonRedMaterial);
    this.haloMesh.position.set(0, 0.3, -0.8);
    this.haloMesh.rotation.x = Math.PI / 3;
    this.scene.add(this.haloMesh);

    // Subtle floating dust/cyber data particles around the bust
    const particleCount = 180;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 8;
      particlePositions[i + 1] = (Math.random() - 0.5) * 8;
      particlePositions[i + 2] = (Math.random() - 0.5) * 6;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xe3142a,
      size: 0.035,
      transparent: true,
      opacity: 0.65
    });
    this.particles = new THREE.Points(particleGeo, particleMat);
    this.scene.add(this.particles);

    // Default orientation & position
    this.bustGroup.position.y = -0.2;
  }

  createBackgroundHalo() {
    // Exact Balenciaga Reference: Glowing red circular backlight behind the character head
    const circleGeo = new THREE.CircleGeometry(2.8, 64);
    
    // Shader or Gradient Material for the intense red spotlight disk
    const haloMat = new THREE.ShaderMaterial({
      uniforms: {
        color: { value: new THREE.Color(0xe3142a) },
        time: { value: 0 }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 color;
        uniform float time;
        varying vec2 vUv;
        void main() {
          vec2 center = vec2(0.5, 0.5);
          float dist = distance(vUv, center) * 2.0;
          if (dist > 1.0) discard;
          
          // Soft radial falloff
          float alpha = smoothstep(1.0, 0.1, dist);
          // Subtle pulse
          float pulse = 0.9 + 0.1 * sin(time * 2.0);
          vec3 finalColor = mix(color * 1.5, vec3(0.0), dist * 0.8);
          
          gl_FragColor = vec4(finalColor * pulse, alpha * 0.88);
        }
      `,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide
    });

    this.haloDisc = new THREE.Mesh(circleGeo, haloMat);
    this.haloDisc.position.set(0, 0.4, -2.5);
    this.scene.add(this.haloDisc);
  }

  setMaterialMode(mode) {
    this.currentMode = mode;
    const targetMat = mode === 'chrome' ? this.chromeMaterial
      : mode === 'wireframe' ? this.wireframeMaterial
      : mode === 'pulse' ? this.neonRedMaterial
      : this.obsidianMaterial;

    this.headMesh.material = targetMat;
    this.neckMesh.material = targetMat;
    this.mantleMesh.material = targetMat;

    if (mode === 'wireframe') {
      this.visorMesh.material = this.wireframeMaterial;
      this.haloMesh.material = this.wireframeMaterial;
    } else {
      this.visorMesh.material = this.visorMaterial;
      this.haloMesh.material = this.neonRedMaterial;
    }
  }

  toggleExplode() {
    this.exploded = !this.exploded;
    this.targetExplodeFactor = this.exploded ? 1.0 : 0.0;
    return this.exploded;
  }

  setupEvents() {
    const onMove = (e) => {
      const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
      const clientY = e.clientY || (e.touches && e.touches[0].clientY) || 0;
      const rect = this.container.getBoundingClientRect();
      const x = ((clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((clientY - rect.top) / rect.height) * 2 - 1);

      this.mouse.targetX = x;
      this.mouse.targetY = y;

      if (this.isDragging) {
        const deltaX = clientX - this.previousMousePosition.x;
        const deltaY = clientY - this.previousMousePosition.y;
        this.bustGroup.rotation.y += deltaX * 0.008;
        this.bustGroup.rotation.x += deltaY * 0.008;
        this.previousMousePosition = { x: clientX, y: clientY };
      }
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('touchmove', onMove, { passive: true });

    this.container.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.previousMousePosition = { x: e.clientX, y: e.clientY };
    });

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

  setScrollProgress(progress) {
    this.targetScrollProgress = Math.max(0, Math.min(1, progress));
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const time = performance.now() * 0.001;

    // Smooth lerp mouse tracking
    this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.05;
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.05;

    // Smooth lerp scroll progress
    this.scrollProgress += (this.targetScrollProgress - this.scrollProgress) * 0.06;

    // Move interactive red point light with mouse and scroll
    this.mouseLight.position.x = this.mouse.x * 4;
    this.mouseLight.position.y = this.mouse.y * 3 - this.scrollProgress * 2.0;

    if (!this.isDragging) {
      // Dynamic scroll-driven rotation: spins organically through 3D profile as user scrolls down
      const scrollRotY = this.scrollProgress * Math.PI * 1.8;
      const scrollTilt = Math.sin(this.scrollProgress * Math.PI * 2) * 0.25;
      const scrollPosY = -0.2 - this.scrollProgress * 3.2;
      const scrollPosX = Math.sin(this.scrollProgress * Math.PI) * 1.2;

      this.bustGroup.rotation.y = THREE.MathUtils.lerp(
        this.bustGroup.rotation.y,
        this.mouse.x * 0.45 + scrollRotY,
        0.05
      );
      this.bustGroup.rotation.x = THREE.MathUtils.lerp(
        this.bustGroup.rotation.x,
        -this.mouse.y * 0.3 + scrollTilt,
        0.05
      );
      this.bustGroup.position.x = THREE.MathUtils.lerp(this.bustGroup.position.x, scrollPosX, 0.05);
      this.bustGroup.position.y = THREE.MathUtils.lerp(
        this.bustGroup.position.y,
        scrollPosY + Math.sin(time * 1.5) * 0.08,
        0.05
      );
    }

    // Halo disc update and scroll breathing
    if (this.haloDisc) {
      this.haloDisc.material.uniforms.time.value = time;
      const haloScale = 1.0 + Math.sin(this.scrollProgress * Math.PI) * 0.5;
      this.haloDisc.scale.set(haloScale, haloScale, 1.0);
      this.haloDisc.position.y = 0.4 - this.scrollProgress * 2.8;
    }

    // Halo ring subtle rotation
    if (this.haloMesh) {
      this.haloMesh.rotation.z = time * 0.3 + this.scrollProgress * Math.PI;
      this.haloMesh.rotation.y = Math.sin(time * 0.5) * 0.2;
      this.haloMesh.position.y = 0.3 - this.scrollProgress * 2.8;
    }

    // Explode factor smooth interpolation (interactive toggle + subtle scroll dispersion)
    const scrollDispersion = Math.sin(this.scrollProgress * Math.PI * 2.0) * 0.25;
    const effectiveTargetExplode = Math.max(this.targetExplodeFactor, Math.max(0, scrollDispersion));
    this.explodeFactor += (effectiveTargetExplode - this.explodeFactor) * 0.08;
    this.parts.forEach((p) => {
      p.mesh.position.copy(p.origPos).addScaledVector(p.dir, this.explodeFactor);
    });

    // Particle swirl
    if (this.particles) {
      this.particles.rotation.y = time * 0.05 + this.scrollProgress * 2.0;
    }

    // Neon pulse effect in pulse mode
    if (this.currentMode === 'pulse') {
      const pulseVal = Math.sin(time * 6.0) * 0.5 + 0.5;
      this.neonRedMaterial.color.setRGB(1.0, 0.08 * pulseVal, 0.16 * pulseVal);
      this.redBackLight.intensity = 4.0 + pulseVal * 4.0;
    }

    this.renderer.render(this.scene, this.camera);
  }
}
