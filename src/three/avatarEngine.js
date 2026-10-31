import * as THREE from 'three';

export class AvatarEngine {
  constructor(container) {
    this.container = container;
    this.w = container.clientWidth || 320;
    this.h = container.clientHeight || 320;

    this.mouseX = 0;
    this.mouseY = 0;
    this.targetPupilX = 0;
    this.targetPupilY = 0;
    this.currentPupilX = 0;
    this.currentPupilY = 0;

    this.jumpProgress = 0;
    this.isJumping = false;
    this.jumpTargetX = 0;
    this.jumpTargetY = 0;
    this.lastBlinkTime = performance.now();
    this.isBlinking = false;
    this.blinkFactor = 1.0;

    this._buildScene();
    this._buildFemaleAvatar();
    this._animate();
    window.addEventListener('resize', this._onResize.bind(this));
  }

  _buildScene() {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(this.w, this.h);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(40, this.w / this.h, 0.1, 50);
    this.camera.position.set(0, 0.2, 5.2);
    this.camera.lookAt(0, 0.1, 0);

    // Soft warm key & ambient lighting
    const ambient = new THREE.AmbientLight(0xfff1e6, 0.9);
    this.scene.add(ambient);

    const keyLight = new THREE.DirectionalLight(0xfff8f0, 1.4);
    keyLight.position.set(2.5, 3.5, 4);
    this.scene.add(keyLight);

    // Red Studio Rim Light (Reference #E3142A)
    const redRim = new THREE.PointLight(0xe3142a, 3.0, 10);
    redRim.position.set(0, 0.5, -2.2);
    this.scene.add(redRim);

    const softFill = new THREE.DirectionalLight(0xffe1bf, 0.6);
    softFill.position.set(-3, -1, 3);
    this.scene.add(softFill);

    // Circular Red Spotlight Halo behind head (from Reference 2)
    const haloGeo = new THREE.CircleGeometry(1.35, 64);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0xe3142a,
      transparent: true,
      opacity: 0.85,
      side: THREE.DoubleSide
    });
    this.haloMesh = new THREE.Mesh(haloGeo, haloMat);
    this.haloMesh.position.set(0, 0.25, -1.2);
    this.scene.add(this.haloMesh);

    // Ground Shadow
    const shadowGeo = new THREE.CircleGeometry(0.75, 32);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.25,
      depthWrite: false
    });
    this.shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    this.shadowMesh.rotation.x = -Math.PI / 2;
    this.shadowMesh.position.y = -1.45;
    this.scene.add(this.shadowMesh);
  }

  _buildFemaleAvatar() {
    this.avatarRoot = new THREE.Group();
    this.scene.add(this.avatarRoot);

    const RED = 0xe3142a;
    const CREAM = 0xffe1bf;
    const SKIN = 0xf3ccb0;
    const HAIR = 0x110f13;
    const DARK = 0x151419;
    const GOLD = 0xe6be8a;
    const WHITE = 0xfcfcfc;

    const standardMat = (color, roughness = 0.5, metalness = 0.0) =>
      new THREE.MeshStandardMaterial({ color, roughness, metalness });

    // ── BODY / SLEEK HIGH TURTLENECK ──────────────────────────────────────────
    this.body = new THREE.Group();
    this.avatarRoot.add(this.body);

    // High neck collar
    const neckCollarGeo = new THREE.CylinderGeometry(0.24, 0.26, 0.45, 32);
    const neckCollar = new THREE.Mesh(neckCollarGeo, standardMat(DARK, 0.35, 0.1));
    neckCollar.position.y = -0.32;
    this.body.add(neckCollar);

    // Shoulders & Chest
    const chestGeo = new THREE.CylinderGeometry(0.32, 0.72, 0.75, 32);
    const chest = new THREE.Mesh(chestGeo, standardMat(DARK, 0.35, 0.1));
    chest.position.y = -0.85;
    this.body.add(chest);

    // ── HEAD GROUP ────────────────────────────────────────────────────────────
    this.head = new THREE.Group();
    this.head.position.y = 0.22;
    this.body.add(this.head);

    // Feminine Sculpted Face
    const faceGeo = new THREE.SphereGeometry(0.55, 36, 36);
    // Sculpt jawline & chin
    const pos = faceGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      let y = pos.getY(i);
      let x = pos.getX(i);
      let z = pos.getZ(i);

      // Taper chin and jaw
      if (y < 0) {
        let taper = 1.0 + y * 0.38;
        pos.setX(i, x * Math.max(0.55, taper));
        pos.setZ(i, z * Math.max(0.7, taper + 0.1));
      }
      // Sculpt cute cheeks
      if (y > -0.15 && y < 0.2 && z > 0.2) {
        pos.setZ(i, z * 1.06);
      }
    }
    faceGeo.computeVertexNormals();

    const faceMat = new THREE.MeshStandardMaterial({
      color: SKIN,
      roughness: 0.65,
      metalness: 0.05
    });
    this.faceMesh = new THREE.Mesh(faceGeo, faceMat);
    this.head.add(this.faceMesh);

    // ── SLEEK DARK HAIR (Reference 2 style) ────────────────────────────────────
    this.hairGroup = new THREE.Group();
    this.head.add(this.hairGroup);

    const hairMat = new THREE.MeshStandardMaterial({
      color: HAIR,
      roughness: 0.25,
      metalness: 0.4
    });

    // Hair Cap Base
    const hairBaseGeo = new THREE.SphereGeometry(0.57, 36, 24, 0, Math.PI * 2, 0, Math.PI * 0.58);
    const hairBase = new THREE.Mesh(hairBaseGeo, hairMat);
    hairBase.position.y = 0.06;
    this.hairGroup.add(hairBase);

    // Chic side-swept bangs across forehead
    const bangGeo = new THREE.TorusGeometry(0.55, 0.08, 16, 32, Math.PI * 0.65);
    const bang = new THREE.Mesh(bangGeo, hairMat);
    bang.rotation.set(0.35, 0.2, -0.4);
    bang.position.set(-0.06, 0.24, 0.22);
    this.hairGroup.add(bang);

    // Side hair volume
    [-1, 1].forEach(side => {
      const sideHair = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.18, 0.7, 16),
        hairMat
      );
      sideHair.position.set(side * 0.54, -0.08, -0.05);
      sideHair.rotation.z = side * 0.15;
      this.hairGroup.add(sideHair);
    });

    // High chic bun / ponytail behind head
    const bunGeo = new THREE.SphereGeometry(0.26, 24, 24);
    const bun = new THREE.Mesh(bunGeo, hairMat);
    bun.position.set(0, 0.35, -0.55);
    bun.scale.set(1.1, 0.9, 0.8);
    this.hairGroup.add(bun);

    // ── EYES (Interactive Tracking + Blinking) ────────────────────────────────
    this.eyesRoot = new THREE.Group();
    this.eyesRoot.position.set(0, 0.08, 0.47);
    this.head.add(this.eyesRoot);

    [-1, 1].forEach(side => {
      const eyeSideGroup = new THREE.Group();
      eyeSideGroup.position.x = side * 0.2;

      // Almond eye sclera (white)
      const eyeWhite = new THREE.Mesh(
        new THREE.SphereGeometry(0.11, 24, 24),
        standardMat(WHITE, 0.2)
      );
      eyeWhite.scale.set(1.2, 0.75, 0.8);
      eyeSideGroup.add(eyeWhite);

      // Deep brown iris
      const iris = new THREE.Mesh(
        new THREE.CircleGeometry(0.062, 24),
        standardMat(0x2a140e, 0.3)
      );
      iris.position.set(0, 0, 0.095);
      eyeSideGroup.add(iris);

      // Pupil with light reflection
      const pupil = new THREE.Mesh(
        new THREE.CircleGeometry(0.034, 20),
        new THREE.MeshBasicMaterial({ color: 0x000000 })
      );
      pupil.position.set(0, 0, 0.098);
      eyeSideGroup.add(pupil);

      // Eye catchlight (cute shine dot)
      const shine = new THREE.Mesh(
        new THREE.CircleGeometry(0.014, 12),
        new THREE.MeshBasicMaterial({ color: 0xffffff })
      );
      shine.position.set(0.02, 0.02, 0.1);
      eyeSideGroup.add(shine);

      // Eyeliner / Eyelash wing
      const linerGeo = new THREE.TorusGeometry(0.12, 0.016, 8, 24, Math.PI * 0.7);
      const liner = new THREE.Mesh(linerGeo, standardMat(0x0a090b, 0.8));
      liner.rotation.x = Math.PI / 2;
      liner.rotation.y = side * 0.2;
      liner.rotation.z = side === 1 ? -0.1 : Math.PI + 0.1;
      liner.position.set(0, 0.05, 0.05);
      eyeSideGroup.add(liner);

      // Arched Eyebrow
      const browGeo = new THREE.BoxGeometry(0.18, 0.024, 0.02);
      const brow = new THREE.Mesh(browGeo, standardMat(0x181514, 0.9));
      brow.position.set(0, 0.15, 0.03);
      brow.rotation.z = side * 0.12;
      eyeSideGroup.add(brow);

      this.eyesRoot.add(eyeSideGroup);

      if (side === -1) {
        this.pupilL = pupil;
        this.irisL = iris;
      } else {
        this.pupilR = pupil;
        this.irisR = iris;
      }
    });

    // ── CUTE SCULPTED NOSE ────────────────────────────────────────────────────
    const nose = new THREE.Mesh(
      new THREE.ConeGeometry(0.05, 0.16, 16),
      standardMat(0xe5bca0, 0.6)
    );
    nose.position.set(0, -0.04, 0.54);
    nose.rotation.x = 0.2;
    this.head.add(nose);

    // ── FULL GLOSSY RED LIPS (#E3142A) ────────────────────────────────────────
    const lipMat = new THREE.MeshStandardMaterial({
      color: RED,
      roughness: 0.15,
      metalness: 0.2,
      emissive: 0x44050a
    });

    // Top lip
    const topLip = new THREE.Mesh(
      new THREE.CylinderGeometry(0.035, 0.04, 0.19, 16),
      lipMat
    );
    topLip.rotation.z = Math.PI / 2;
    topLip.scale.set(0.6, 1.0, 0.8);
    topLip.position.set(0, -0.21, 0.51);
    this.head.add(topLip);

    // Bottom lip (fuller)
    const btmLip = new THREE.Mesh(
      new THREE.CylinderGeometry(0.045, 0.03, 0.17, 16),
      lipMat
    );
    btmLip.rotation.z = Math.PI / 2;
    btmLip.scale.set(0.7, 1.0, 0.9);
    btmLip.position.set(0, -0.27, 0.495);
    this.head.add(btmLip);

    // ── HOOP EARRINGS (Silver & Red) ──────────────────────────────────────────
    [-1, 1].forEach(side => {
      // Big stylish hoop earring
      const hoopGeo = new THREE.TorusGeometry(0.18, 0.022, 16, 32);
      const hoopMat = new THREE.MeshStandardMaterial({
        color: side === -1 ? 0xeeeeee : RED,
        metalness: 0.9,
        roughness: 0.15
      });
      const hoop = new THREE.Mesh(hoopGeo, hoopMat);
      hoop.position.set(side * 0.57, -0.08, 0);
      hoop.rotation.y = Math.PI / 2;
      this.head.add(hoop);
    });
  }

  trackMouse(clientX, clientY) {
    this.mouseX = (clientX / window.innerWidth - 0.5) * 2;
    this.mouseY = -(clientY / window.innerHeight - 0.5) * 2;
  }

  jumpTo(platformIndex, relX, relY) {
    if (this.isJumping) return;
    this.isJumping = true;
    this.jumpProgress = 0;
    this.jumpTargetX = (relX - 0.5) * 1.5;
    this.jumpTargetY = -(relY - 0.5) * 1.2;
  }

  triggerTrickJump() {
    this.isJumping = true;
    this.jumpProgress = 0;
  }

  _animate() {
    requestAnimationFrame(this._animate.bind(this));
    const now = performance.now();
    const t = now * 0.001;

    // ── Smooth Eye & Head Tracking with Lerp ─────────────────────────────────
    const lerpRate = 0.08;
    this.currentPupilX += (this.mouseX - this.currentPupilX) * lerpRate;
    this.currentPupilY += (this.mouseY - this.currentPupilY) * lerpRate;

    const maxEyeOffset = 0.038;
    const px = this.currentPupilX * maxEyeOffset;
    const py = this.currentPupilY * maxEyeOffset * 0.8;

    if (this.pupilL && this.pupilR) {
      this.pupilL.position.x = px;
      this.pupilL.position.y = py;
      this.pupilR.position.x = px;
      this.pupilR.position.y = py;
      this.irisL.position.x = px * 0.7;
      this.irisL.position.y = py * 0.7;
      this.irisR.position.x = px * 0.7;
      this.irisR.position.y = py * 0.7;
    }

    // Natural Blinking every ~3.5 seconds
    if (now - this.lastBlinkTime > 3500) {
      this.isBlinking = true;
      this.lastBlinkTime = now;
    }
    if (this.isBlinking) {
      this.blinkFactor -= 0.18;
      if (this.blinkFactor <= 0.05) {
        this.blinkFactor = 0.05;
        this.isBlinking = false;
      }
    } else if (this.blinkFactor < 1.0) {
      this.blinkFactor = Math.min(1.0, this.blinkFactor + 0.18);
    }
    if (this.eyesRoot) {
      this.eyesRoot.scale.y = this.blinkFactor;
    }

    // Subtle head tilt reacting to mouse
    if (this.head) {
      this.head.rotation.y += (this.currentPupilX * 0.45 - this.head.rotation.y) * 0.06;
      this.head.rotation.x += (-this.currentPupilY * 0.3 - this.head.rotation.x) * 0.06;
      this.head.rotation.z += (-this.currentPupilX * 0.1 - this.head.rotation.z) * 0.06;
    }

    // Halo pulse & slight tilt
    if (this.haloMesh) {
      this.haloMesh.scale.setScalar(1.0 + Math.sin(t * 2.0) * 0.04);
    }

    // ── Natural Idle Breathing ───────────────────────────────────────────────
    const idleY = Math.sin(t * 1.6) * 0.035;
    const idleRotZ = Math.sin(t * 0.8) * 0.012;

    // ── Jump Physics with Squash & Stretch ───────────────────────────────────
    let jumpY = 0;
    let scaleX = 1, scaleY = 1;

    if (this.isJumping) {
      this.jumpProgress += 0.038;
      const arc = Math.sin(this.jumpProgress * Math.PI);
      jumpY = arc * 0.95;

      // Stretch in flight, squash on takeoff & landing
      if (arc > 0.5) {
        scaleY = 1.0 + (arc - 0.5) * 0.35;
        scaleX = 1.0 - (arc - 0.5) * 0.18;
      } else {
        scaleY = 1.0 - (0.5 - arc) * 0.45;
        scaleX = 1.0 + (0.5 - arc) * 0.25;
      }

      if (this.jumpProgress >= 1) {
        this.isJumping = false;
        this.jumpProgress = 0;
      }
    }

    if (this.avatarRoot) {
      this.avatarRoot.position.y = idleY + jumpY;
      this.avatarRoot.rotation.z = idleRotZ;
      this.avatarRoot.scale.set(scaleX, scaleY, 1);
    }

    if (this.shadowMesh) {
      const heightFactor = 1.0 - (idleY + jumpY) * 0.5;
      this.shadowMesh.scale.setScalar(Math.max(0.3, heightFactor));
      this.shadowMesh.material.opacity = Math.max(0.06, 0.25 * heightFactor);
    }

    this.renderer.render(this.scene, this.camera);
  }

  _onResize() {
    this.w = this.container.clientWidth;
    this.h = this.container.clientHeight;
    if (this.w <= 0 || this.h <= 0) return;
    this.camera.aspect = this.w / this.h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.w, this.h);
  }
}
