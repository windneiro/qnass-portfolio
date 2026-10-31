import * as THREE from 'three';

export class FoilBackground {
  constructor(canvas) {
    this.canvas = canvas;
    this.mouse = { x: 0.5, y: 0.5, targetX: 0.5, targetY: 0.5 };
    this.init();
    this.animate();
  }

  init() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: false,
      alpha: true,
      powerPreference: 'low-power'
    });

    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

    // Custom GLSL shader generating crumpled dark foil / latex wrinkles
    const foilMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uMouse: { value: new THREE.Vector2(0.5, 0.5) },
        uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform vec2 uMouse;
        uniform vec2 uResolution;
        varying vec2 vUv;

        // Simplex/Perlin noise functions
        vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

        float snoise(vec2 v) {
          const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
          vec2 i  = floor(v + dot(v, C.yy) );
          vec2 x0 = v -   i + dot(i, C.xx);
          vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
          vec4 x12 = x0.xyxy + C.xxzz;
          x12.xy -= i1;
          i = mod289(i);
          vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
          vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
          m = m*m ;
          m = m*m ;
          vec3 x = 2.0 * fract(p * C.www) - 1.0;
          vec3 h = abs(x) - 0.5;
          vec3 ox = floor(x + 0.5);
          vec3 a0 = x - ox;
          m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
          vec3 g;
          g.x  = a0.x  * x0.x  + h.x  * x0.y;
          g.yz = a0.yz * x12.xz + h.yz * x12.yw;
          return 130.0 * dot(m, g);
        }

        // FBM with sharp fold ridges for cellophane/crinkled foil
        float crinkledFoil(vec2 uv) {
          float n = 0.0;
          vec2 p = uv * 3.5;
          float amp = 0.5;
          for (int i = 0; i < 4; i++) {
            float s = snoise(p);
            // Ridge noise for sharp crinkle creases
            s = 1.0 - abs(s);
            s = s * s;
            n += s * amp;
            p *= 2.2;
            amp *= 0.5;
          }
          return n;
        }

        void main() {
          vec2 st = gl_FragCoord.xy / uResolution.xy;
          float aspect = uResolution.x / uResolution.y;
          vec2 uv = vUv;
          uv.x *= aspect;

          // Subtle organic drift
          vec2 drift = vec2(sin(uTime * 0.05), cos(uTime * 0.04)) * 0.05;
          float foil = crinkledFoil(uv + drift);

          // Normal estimation from heightmap
          vec2 eps = vec2(0.003, 0.0);
          float nx = crinkledFoil(uv + eps.xy + drift) - crinkledFoil(uv - eps.xy + drift);
          float ny = crinkledFoil(uv + eps.yx + drift) - crinkledFoil(uv - eps.yx + drift);
          vec3 normal = normalize(vec3(-nx * 8.0, -ny * 8.0, 1.0));

          // Specular light matching mouse
          vec3 lightDir = normalize(vec3((uMouse.x - 0.5) * 2.0, (uMouse.y - 0.5) * 2.0, 1.2));
          float spec = pow(max(dot(reflect(-lightDir, normal), vec3(0.0, 0.0, 1.0)), 0.0), 16.0);
          float diffuse = max(dot(normal, lightDir), 0.0) * 0.15;

          // Deep black foil color with crimson specular edge
          vec3 baseColor = vec3(0.015, 0.015, 0.02);
          vec3 highlight = vec3(0.35, 0.35, 0.38) * spec * 1.5;
          vec3 redReflect = vec3(0.89, 0.08, 0.16) * pow(spec, 4.0) * 0.35; // #E3142A accent

          vec3 color = baseColor + vec3(diffuse) + highlight + redReflect;

          // Vignette around edges
          float vig = 1.0 - length((vUv - 0.5) * 1.3);
          color *= clamp(vig, 0.2, 1.0);

          gl_FragColor = vec4(color, 0.95);
        }
      `
    });

    this.foilMaterial = foilMaterial;
    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), foilMaterial);
    this.scene.add(quad);

    window.addEventListener('mousemove', (e) => {
      this.mouse.targetX = e.clientX / window.innerWidth;
      this.mouse.targetY = 1.0 - (e.clientY / window.innerHeight);
    });

    window.addEventListener('resize', () => {
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      foilMaterial.uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
    });
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    const time = performance.now() * 0.001;

    this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.04;
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.04;

    this.foilMaterial.uniforms.uTime.value = time;
    this.foilMaterial.uniforms.uMouse.value.set(this.mouse.x, this.mouse.y);

    this.renderer.render(this.scene, this.camera);
  }
}
