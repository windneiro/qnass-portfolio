import{i as e,r as t}from"./math.js";import{n,r,t as i}from"./timeline.js";import{a,i as o,n as s,o as c,r as l,t as u}from"./Mesh.js";import{n as d}from"./palette.js";function f(e,t){return e[0]=t[0],e[1]=t[1],e}function p(e,t,n){return e[0]=t,e[1]=n,e}function m(e,t,n){return e[0]=t[0]+n[0],e[1]=t[1]+n[1],e}function h(e,t,n){return e[0]=t[0]-n[0],e[1]=t[1]-n[1],e}function g(e,t,n){return e[0]=t[0]*n[0],e[1]=t[1]*n[1],e}function _(e,t,n){return e[0]=t[0]/n[0],e[1]=t[1]/n[1],e}function v(e,t,n){return e[0]=t[0]*n,e[1]=t[1]*n,e}function y(e,t){var n=t[0]-e[0],r=t[1]-e[1];return Math.sqrt(n*n+r*r)}function b(e,t){var n=t[0]-e[0],r=t[1]-e[1];return n*n+r*r}function x(e){var t=e[0],n=e[1];return Math.sqrt(t*t+n*n)}function S(e){var t=e[0],n=e[1];return t*t+n*n}function C(e,t){return e[0]=-t[0],e[1]=-t[1],e}function w(e,t){return e[0]=1/t[0],e[1]=1/t[1],e}function T(e,t){var n=t[0],r=t[1],i=n*n+r*r;return i>0&&(i=1/Math.sqrt(i)),e[0]=t[0]*i,e[1]=t[1]*i,e}function E(e,t){return e[0]*t[0]+e[1]*t[1]}function D(e,t){return e[0]*t[1]-e[1]*t[0]}function O(e,t,n,r){var i=t[0],a=t[1];return e[0]=i+r*(n[0]-i),e[1]=a+r*(n[1]-a),e}function k(e,t,n,r,i){let a=Math.exp(-r*i),o=t[0],s=t[1];return e[0]=n[0]+(o-n[0])*a,e[1]=n[1]+(s-n[1])*a,e}function A(e,t,n){var r=t[0],i=t[1];return e[0]=n[0]*r+n[3]*i+n[6],e[1]=n[1]*r+n[4]*i+n[7],e}function j(e,t,n){let r=t[0],i=t[1];return e[0]=n[0]*r+n[4]*i+n[12],e[1]=n[1]*r+n[5]*i+n[13],e}function ee(e,t){return e[0]===t[0]&&e[1]===t[1]}var M=class e extends Array{constructor(e=0,t=e){return super(e,t),this}get x(){return this[0]}get y(){return this[1]}set x(e){this[0]=e}set y(e){this[1]=e}set(e,t=e){return e.length?this.copy(e):(p(this,e,t),this)}copy(e){return f(this,e),this}add(e,t){return t?m(this,e,t):m(this,this,e),this}sub(e,t){return t?h(this,e,t):h(this,this,e),this}multiply(e){return e.length?g(this,this,e):v(this,this,e),this}divide(e){return e.length?_(this,this,e):v(this,this,1/e),this}inverse(e=this){return w(this,e),this}len(){return x(this)}distance(e){return e?y(this,e):x(this)}squaredLen(){return this.squaredDistance()}squaredDistance(e){return e?b(this,e):S(this)}negate(e=this){return C(this,e),this}cross(e,t){return t?D(e,t):D(this,e)}scale(e){return v(this,this,e),this}normalize(){return T(this,this),this}dot(e){return E(this,e)}equals(e){return ee(this,e)}applyMatrix3(e){return A(this,this,e),this}applyMatrix4(e){return j(this,this,e),this}lerp(e,t){return O(this,this,e,t),this}smoothLerp(e,t,n){return k(this,this,e,t,n),this}clone(){return new e(this[0],this[1])}fromArray(e,t=0){return this[0]=e[t],this[1]=e[t+1],this}toArray(e=[],t=0){return e[t]=this[0],e[t+1]=this[1],e}},te=new M,ne=new M,re=new M,N=new c,P=new c,F=new c,ie=new c,ae=new c,oe=new c,I=new c,L=new c,R=new c,z=new c,se=new c,B=new l,ce=class{constructor(){this.origin=new c,this.direction=new c}castMouse(e,t=[0,0]){if(e.type===`orthographic`){let{left:n,right:r,bottom:i,top:a,zoom:o}=e,s=n/o+(r-n)/o*(t[0]*.5+.5),c=i/o+(a-i)/o*(t[1]*.5+.5);this.origin.set(s,c,0),this.origin.applyMatrix4(e.worldMatrix),this.direction.x=-e.worldMatrix[8],this.direction.y=-e.worldMatrix[9],this.direction.z=-e.worldMatrix[10]}else e.worldMatrix.getTranslation(this.origin),this.direction.set(t[0],t[1],.5),e.unproject(this.direction),this.direction.sub(this.origin).normalize()}intersectBounds(e,{maxDistance:t,output:n=[]}={}){Array.isArray(e)||(e=[e]);let r=B,i=N,a=P,o=n;return o.length=0,e.forEach(e=>{(!e.geometry.bounds||e.geometry.bounds.radius===1/0)&&e.geometry.computeBoundingSphere();let n=e.geometry.bounds;r.inverse(e.worldMatrix);let s;if(t&&(a.copy(this.direction).scaleRotateMatrix4(r),s=t*a.len()),i.copy(this.origin).applyMatrix4(r),a.copy(this.direction).transformDirection(r),t&&i.distance(n.center)-n.radius>s)return;let l=0;if(e.geometry.raycast===`sphere`){if(i.distance(n.center)>n.radius&&(l=this.intersectSphere(n,i,a),!l))return}else if((i.x<n.min.x||i.x>n.max.x||i.y<n.min.y||i.y>n.max.y||i.z<n.min.z||i.z>n.max.z)&&(l=this.intersectBox(n,i,a),!l))return;t&&l>s||(e.hit||={localPoint:new c,point:new c},e.hit.localPoint.copy(a).multiply(l).add(i),e.hit.point.copy(e.hit.localPoint).applyMatrix4(e.worldMatrix),e.hit.distance=e.hit.point.distance(this.origin),o.push(e))}),o.sort((e,t)=>e.hit.distance-t.hit.distance),o}intersectMeshes(e,{cullFace:t=!0,maxDistance:n,includeUV:r=!0,includeNormal:i=!0,output:a=[]}={}){let o=this.intersectBounds(e,{maxDistance:n,output:a});if(!o.length)return o;let s=B,l=N,u=P,d=F,f=ie,p=ae,m=oe,h=I,g=L,_=te,v=ne,y=re;for(let e=o.length-1;e>=0;e--){let a=o[e];s.inverse(a.worldMatrix);let b;n&&(u.copy(this.direction).scaleRotateMatrix4(s),b=n*u.len()),l.copy(this.origin).applyMatrix4(s),u.copy(this.direction).transformDirection(s);let x=0,S,C,w,T=a.geometry,E=T.attributes,D=E.index,O=E.position,k=Math.max(0,T.drawRange.start),A=Math.min(D?D.count:O.count,T.drawRange.start+T.drawRange.count),j=O.size;for(let e=k;e<A;e+=3){let r=D?D.data[e]:e,i=D?D.data[e+1]:e+1,a=D?D.data[e+2]:e+2;d.fromArray(O.data,r*j),f.fromArray(O.data,i*j),p.fromArray(O.data,a*j);let o=this.intersectTriangle(d,f,p,t,l,u,h);o&&(n&&o>b||(!x||o<x)&&(x=o,S=r,C=i,w=a,m.copy(h)))}x||o.splice(e,1),a.hit.localPoint.copy(u).multiply(x).add(l),a.hit.point.copy(a.hit.localPoint).applyMatrix4(a.worldMatrix),a.hit.distance=a.hit.point.distance(this.origin),a.hit.faceNormal||(a.hit.localFaceNormal=new c,a.hit.faceNormal=new c,a.hit.uv=new M,a.hit.localNormal=new c,a.hit.normal=new c),a.hit.localFaceNormal.copy(m),a.hit.faceNormal.copy(a.hit.localFaceNormal).transformDirection(a.worldMatrix),(r||i)&&(d.fromArray(O.data,S*3),f.fromArray(O.data,C*3),p.fromArray(O.data,w*3),this.getBarycoord(a.hit.localPoint,d,f,p,g)),r&&E.uv&&(_.fromArray(E.uv.data,S*2),v.fromArray(E.uv.data,C*2),y.fromArray(E.uv.data,w*2),a.hit.uv.set(_.x*g.x+v.x*g.y+y.x*g.z,_.y*g.x+v.y*g.y+y.y*g.z)),i&&E.normal&&(d.fromArray(E.normal.data,S*3),f.fromArray(E.normal.data,C*3),p.fromArray(E.normal.data,w*3),a.hit.localNormal.set(d.x*g.x+f.x*g.y+p.x*g.z,d.y*g.x+f.y*g.y+p.y*g.z,d.z*g.x+f.z*g.y+p.z*g.z),a.hit.normal.copy(a.hit.localNormal).transformDirection(a.worldMatrix))}return o.sort((e,t)=>e.hit.distance-t.hit.distance),o}intersectPlane(e,t=this.origin,n=this.direction){let r=N;r.sub(e.origin,t);let i=r.dot(e.normal),a=n.dot(e.normal);if(a==0)return 0;let o=i/a;return o<=0?0:t.add(n.scale(o))}intersectSphere(e,t=this.origin,n=this.direction){let r=F;r.sub(e.center,t);let i=r.dot(n),a=r.dot(r)-i*i,o=e.radius*e.radius;if(a>o)return 0;let s=Math.sqrt(o-a),c=i-s,l=i+s;return c<0&&l<0?0:c<0?l:c}intersectBox(e,t=this.origin,n=this.direction){let r,i,a,o,s,c,l=1/n.x,u=1/n.y,d=1/n.z,f=e.min,p=e.max;return r=((l>=0?f.x:p.x)-t.x)*l,i=((l>=0?p.x:f.x)-t.x)*l,a=((u>=0?f.y:p.y)-t.y)*u,o=((u>=0?p.y:f.y)-t.y)*u,r>o||a>i||(a>r&&(r=a),o<i&&(i=o),s=((d>=0?f.z:p.z)-t.z)*d,c=((d>=0?p.z:f.z)-t.z)*d,r>c||s>i)||(s>r&&(r=s),c<i&&(i=c),i<0)?0:r>=0?r:i}intersectTriangle(e,t,n,r=!0,i=this.origin,a=this.direction,o=I){let s=L,c=R,l=z;s.sub(t,e),c.sub(n,e),o.cross(s,c);let u=a.dot(o);if(!u)return 0;let d;if(u>0){if(r)return 0;d=1}else d=-1,u=-u;l.sub(i,e);let f=d*a.dot(c.cross(l,c));if(f<0)return 0;let p=d*a.dot(s.cross(l));if(p<0||f+p>u)return 0;let m=-d*l.dot(o);return m<0?0:m/u}getBarycoord(e,t,n,r,i=L){let a=R,o=z,s=se;a.sub(r,t),o.sub(n,t),s.sub(e,t);let c=a.dot(a),l=a.dot(o),u=a.dot(s),d=o.dot(o),f=o.dot(s),p=c*d-l*l;if(p===0)return i.set(-2,-1,-1);let m=1/p,h=(d*u-l*f)*m,g=(c*f-l*u)*m;return i.set(1-h-g,g,h)}},le=`
	const float PI = 3.14159265359;
	const float TAU = 6.28318530718;

	struct Identity {
		vec3  cell;     // stratified buffer identity
		vec4  random;   // four stable per-particle randoms
		float baseT;    // longitudinal identity, 0…1
		float travelU;  // baseT advanced by the shared flow phase
		float time;     // seconds, frozen under reduced motion
		float side;     // -1 or 1
		float phaseY;   // random.y * TAU
		float phaseW;   // random.w * TAU
	};

	struct Sample {
		vec3  position;
		vec3  normal;      // only surface shapes set this; drives fresnel
		vec2  identity;    // this shape's own parameterization, for handoffs
		vec2  viewData;    // scratch consumed by the optional view pass
		float energy;
		float ink;         // alternate energy channel, gated by viewResponse
		float viewResponse;
		float alphaScale;
		float sizeBase;    // point size before the depth term
		vec3  depthScale;  // numerator, min, max for clamp(n / -viewZ, min, max)
		vec4  sprite;      // haloFalloff, haloWeight, coreEdge0, coreEdge1
		float coreWeight;
		float alphaFloor;
		float inkStrength;
	};

	// Base particulate material; orb, clarity, musical and DNA override geometry only
	Sample defaultSample() {
		Sample result;
		result.position = vec3(0.0);
		result.normal = vec3(0.0, 0.0, 1.0);
		result.identity = vec2(0.0);
		result.viewData = vec2(0.0);
		result.energy = 0.0;
		result.ink = 0.0;
		result.viewResponse = 0.0;
		result.alphaScale = 1.0;
		result.sizeBase = 1.0;
		result.depthScale = vec3(1.0, 1.0, 1.0);
		result.sprite = vec4(3.4, 0.2, 0.12, 0.64);
		result.coreWeight = 0.62;
		result.alphaFloor = 0.72;
		result.inkStrength = 1.35;
		return result;
	}

	// One stable angular identity, shared by every shape that fills a disk
	float plateAngleIdentity(Identity id) {
		return fract(id.cell.y + id.random.y * 0.618 + id.cell.z * 0.21);
	}

	// Angle plus radial seed: the parameterization every plate shape reports
	vec2 plateIdentity(Identity id) {
		return vec2(plateAngleIdentity(id), id.baseT);
	}

	vec3 particleInk(vec3 baseColor, float energy, float exponent) {
		vec3 highlight = vec3(0.86, 0.85, 0.83);
		return mix(baseColor * 0.68, highlight, pow(energy, exponent));
	}
`;function V(e,t,n){let r=e.flatMap((e,n)=>{let r=t(e);return r?`if (shape == ${n}) { ${r} }`:[]});return r.length?`${r.join(` else `)} else { ${n} }`:n}function ue(e,t){return{vertex:`
		precision highp float;

		attribute vec3 position;
		attribute vec4 aRandom;

		uniform mat4 modelViewMatrix;
		uniform mat4 projectionMatrix;
		uniform mat3 normalMatrix;
		uniform int uFromShape;
		uniform int uToShape;
		uniform float uBlend;
		uniform float uStagger;
		uniform float uMorphDrift;
		uniform float uTime;
		uniform float uMotion;
		// Visual beat, signed -1…1, already depth- and presence-scaled
		uniform float uBreath;
		// Slight state grow + breath pulse, a signed uniform scale around 0
		uniform float uPulse;
		uniform float uPixelRatio;
		uniform float uVisibility;
		// Shared longitudinal flow phase, driven by Clarity flow
		uniform float uFlowPhase;
		uniform vec3 uColor;

		varying vec4 vColorAlpha;
		varying vec4 vSprite;
		varying float vCoreWeight;

		${le}
		${Object.keys(t).map(e=>`uniform float ${e};`).join(`
`)}
		
		${[...new Set(e.map(e=>e.glsl.source))].join(`
`)}

		void sampleShape(int shape, Identity id, vec2 uv, float arrival, out Sample result) {
			${V(e,e=>`${e.glsl.sample}(id, uv, arrival, result);`,`result = defaultSample();`)}
		}

		vec2 shapeIdentity(int shape, Identity id) {
			${V(e,e=>e.glsl.identity?`return ${e.glsl.identity}(id);`:``,`return vec2(id.baseT, 0.0);`)}
		}

		vec2 inheritIdentity(int shape, vec2 incoming, vec2 natural, float blend) {
			${V(e,e=>e.glsl.inherit?`return ${e.glsl.inherit}(incoming, natural, blend);`:``,`return natural;`)}
		}

		void shapeDeparture(
			int shape,
			Identity id,
			float blend,
			vec3 fromPoint,
			vec3 toPoint,
			inout vec3 point
		) {
			${V(e,e=>e.glsl.departure?`${e.glsl.departure}(id, blend, fromPoint, toPoint, point);`:``,``)}
		}

		void shapeView(int shape, Identity id, float fresnel, inout Sample result) {
			${V(e,e=>e.glsl.view?`${e.glsl.view}(id, fresnel, result);`:``,``)}
		}

		// Staggers departures; cubic keeps straight-line travel from reading as a beam
		float chapterBlend(float progress, float delay) {
			float p = clamp(progress * (1.0 + uStagger) - delay * uStagger, 0.0, 1.0);
			return p * p * (3.0 - 2.0 * p);
		}

		void main() {
			Identity id;
			id.cell = position;
			id.random = aRandom;
			id.baseT = clamp(position.x, 0.0, 0.9999);
			id.travelU = fract(id.baseT + uFlowPhase);
			id.time = uTime * uMotion;
			id.side = step(0.5, aRandom.x) * 2.0 - 1.0;
			id.phaseY = aRandom.y * TAU;
			id.phaseW = aRandom.w * TAU;

			// The uniform is linear progress; the delay makes it this particle's own
			float blend = chapterBlend(uBlend, aRandom.z);

			Sample from;
			sampleShape(uFromShape, id, shapeIdentity(uFromShape, id), 1.0, from);

			// Settled chapters resolve to blend 0, so this costs nothing at rest
			Sample to = from;
			if (blend > 0.0) {
				vec2 natural = shapeIdentity(uToShape, id);
				sampleShape(
					uToShape,
					id,
					inheritIdentity(uToShape, from.identity, natural, blend),
					blend,
					to
				);
			}

			vec3 point = mix(from.position, to.position, blend);
			if (blend > 0.0 && blend < 1.0) {
				shapeDeparture(uFromShape, id, blend, from.position, to.position, point);
			}

			// Mid-morph wander, gone by arrival: the crowd exhales instead of beaming
			float release = blend * (1.0 - blend) * 4.0;
			if (release > 0.0) {
				point += vec3(
					sin(id.time * 0.43 + id.phaseY),
					cos(id.time * 0.37 + id.phaseW),
					sin(id.time * 0.29 + id.phaseY + id.phaseW)
				) * (release * uMorphDrift * (0.35 + 0.65 * aRandom.z));
			}

			// Uniform scale only: the formation grows and pulses without deforming
			point *= 1.0 + uPulse;

			vec4 viewPosition = modelViewMatrix * vec4(point, 1.0);
			gl_Position = projectionMatrix * viewPosition;

			// Only surface shapes answer to view angle; blended normals keep edges continuous
			float viewResponse = mix(from.viewResponse, to.viewResponse, blend);
			if (viewResponse > 0.0) {
				vec3 viewNormal = normalize(normalMatrix * mix(from.normal, to.normal, blend));
				float fresnel = pow(
					clamp(1.0 - abs(dot(viewNormal, normalize(-viewPosition.xyz))), 0.0, 1.0),
					1.15
				);
				shapeView(uFromShape, id, fresnel, from);
				if (blend > 0.0) shapeView(uToShape, id, fresnel, to);
			}

			float invDepth = 1.0 / max(1.0, -viewPosition.z);
			float sizeFrom =
				from.sizeBase *
				clamp(from.depthScale.x * invDepth, from.depthScale.y, from.depthScale.z);
			float sizeTo =
				to.sizeBase * clamp(to.depthScale.x * invDepth, to.depthScale.y, to.depthScale.z);
			gl_PointSize = clamp(
				mix(sizeFrom, sizeTo, blend) * (1.0 + uBreath * (0.07 + 0.12 * aRandom.w)),
				1.0,
				14.0 * uPixelRatio
			);

			// Resolved here so the fragment stage stays one exponential and one edge
			float energy = mix(from.energy, to.energy, blend);
			float ink = max(energy, mix(from.ink, to.ink, blend) * viewResponse);
			vColorAlpha = vec4(
				particleInk(uColor, ink, mix(from.inkStrength, to.inkStrength, blend)),
				mix(mix(from.alphaFloor, to.alphaFloor, blend), 1.0, energy) *
					mix(from.alphaScale, to.alphaScale, blend) *
					(1.0 + uBreath * 0.12) *
					uVisibility
			);
			vSprite = mix(from.sprite, to.sprite, blend);
			vCoreWeight = mix(from.coreWeight, to.coreWeight, blend);
		}
	`,fragment:`
		precision highp float;

		varying vec4 vColorAlpha;
		varying vec4 vSprite;
		varying float vCoreWeight;

		void main() {
			vec2 centered = gl_PointCoord - 0.5;
			float radiusSquared = dot(centered, centered) * 4.0;
			if (radiusSquared > 1.0) discard;

			float coverage =
				exp(-radiusSquared * vSprite.x) * vSprite.y +
				(1.0 - smoothstep(vSprite.z, vSprite.w, sqrt(radiusSquared))) * vCoreWeight;
			gl_FragColor = vec4(vColorAlpha.rgb, coverage * vColorAlpha.a);
		}
	`}}var de=`
	uniform vec2 uClarityMagnet;
	uniform float uClarityMagnetStrength;
	uniform float uClarityPullPhase;

	float clarityTravelPosition(float travelU) {
		if (abs(uClarityLogSpeedRatio) < 0.0001) return travelU;
		return (1.0 - exp(-uClarityLogSpeedRatio * travelU)) * uClarityTravelScale;
	}

	// The funnel's profile: how far the calm has taken over, where its middle sits, how wide
	float clarityAmount(float flowPosition) {
		return smoothstep(0.12, 0.86, flowPosition);
	}
	float clarityCenter(float clarity) {
		return mix(0.04, 0.0, clarity);
	}
	float clarityWidth(float clarity) {
		return mix(uClarityChaosHeight, uClarityCalmWidth, clarity);
	}

	float clarityFalloff(float distance, float radius) {
		return exp(-(distance * distance) / (radius * radius));
	}

	vec2 identityClarityFlow(Identity id) {
		return vec2(id.travelU, 0.0);
	}

	// Settle into the stream first, then ride it to the final slot; ends in [0,1), never wraps
	vec2 inheritClarityFlow(vec2 incoming, vec2 natural, float blend) {
		return vec2(mix(fract(incoming.x), natural.x, smoothstep(0.35, 1.0, blend)), natural.y);
	}

	void sampleClarityFlow(Identity id, vec2 uv, float arrival, out Sample result) {
		result = defaultSample();

		float travelU = fract(uv.x);
		float flowU = clarityTravelPosition(travelU);
		float clarity = clarityAmount(flowU);
		float centerLine = clarityCenter(clarity);
		float fieldWidth = clarityWidth(clarity);
		float verticalIdentity = (id.random.y - 0.5) * 2.0;
		float pointX = (flowU - 0.5) * uClarityWidth;

		// Two drifting waves, fading out as the flow settles: the chaos of the left side
		float chaosTime = id.time * uClarityChaosSpeed * 6.2831853;
		float chaos =
			sin(chaosTime * (0.34 + id.random.x * 0.28) + id.random.z * 6.28) * 0.72 +
			sin(chaosTime * (0.15 + id.random.y * 0.1) + id.random.w * 4.0) * 0.28;
		float freeOffset =
			verticalIdentity * fieldWidth * mix(0.42, 1.0, id.random.x) +
			chaos * uClarityChaosHeight * 0.34 * (1.0 - smoothstep(0.38, 0.7, flowU));

		float pointY = centerLine + freeOffset;

		// Pointer magnet: a band at the cursor's height drinks nearby streams into the calm line
		float chaosGather = 0.0;
		float ingested = 1.0;
		if (uClarityMouseEffect > 0.0001 && uClarityMagnetStrength > 0.001) {
			// The band is the streamline the cursor sits on, riding the funnel's envelope
			float magnetClarity = clarityAmount(
				clarityTravelPosition(clamp(uClarityMagnet.x / uClarityWidth + 0.5, 0.0, 1.0))
			);
			float rawBand = (uClarityMagnet.y - clarityCenter(magnetClarity)) / max(clarityWidth(magnetClarity), 0.3);
			// One-to-one through the heart, easing into the skin near the edge, never past it
			float bandExcess = max(abs(rawBand) - 0.55, 0.0);
			float bandStream = sign(rawBand) * (abs(rawBand) - bandExcess + 0.35 * bandExcess / (0.35 + bandExcess));

			float particleStream = freeOffset / max(fieldWidth, 0.05);
			// Reach: strongest at the heart, alive at the edges; only the skin is spared, so the silhouette holds
			float gather =
				clarityFalloff(particleStream - bandStream, 0.55 * mix(0.85, 1.3, id.random.w)) *
				clarityFalloff(rawBand, 1.73) *
				(1.0 - smoothstep(0.85, 1.05, abs(particleStream))) *
				(1.0 - clarity * clarity) *
				uClarityMagnetStrength;
			gather = min(gather * uClarityMouseEffect, 1.0);
			chaosGather = gather * (1.0 - clarity);

			// Like the hero orb: a mote leans onto the band, rides down, dissolves, repeats. No gate, nothing dams up
			float cycle = fract(uClarityPullPhase * (0.35 + id.random.x * 0.45) + id.random.w * 7.13);
			float capture = gather * min(cycle * 2.4, 1.0) * uClarityBandConcentration;
			float bandLane = bandStream + verticalIdentity * uClarityBandThickness;
			pointY = centerLine + mix(particleStream, bandLane, capture) * fieldWidth;
			pointX += chaosGather * smoothstep(0.1, 1.0, cycle) * 1.2;
			// The rebirth flicker belongs to the chaos side; in the calm line it just glows
			ingested = mix(
				1.0,
				smoothstep(0.0, 0.08, cycle) * (1.0 - smoothstep(0.72, 0.98, cycle)),
				chaosGather
			);
		}

		float rarity = pow(id.random.w, 2.2);

		result.position = vec3(pointX, pointY, (id.random.z - 0.5) * 0.08);
		result.identity = vec2(travelU, id.baseT);
		// Concentration reads as energy: the band glows, dimming back in the calm
		result.energy = mix(0.666, 0.74, rarity) * (1.0 + chaosGather * 0.6) * ingested;
		result.ink = result.energy;
		result.sizeBase = uClarityPointScale * uPixelRatio * mix(0.783, 3.054, rarity * rarity);
		result.inkStrength = 1.35;
	}
`;function H(){return{rootPosition:new c,rootRotation:new c,cameraPosition:new c,cameraTarget:new c}}function U(e){return e}function fe(e){return e}var W={type:`point2d`,key:`position`,label:`position`,x:{min:-2,max:2,step:.01},y:{min:-1.5,max:1.5,step:.01}},G={follow:20,easeIn:3.5,easeOut:1.4};function K(e,t){let n=Math.log(e/t);return Math.abs(n)<1e-4?(e+t)*.5:(e-t)/n}function pe(){let e={width:8.6,chaosHeight:3.1,calmWidth:.15,chaosSpeed:.4,calmSpeed:.32,mouseEffect:1,bandThickness:.16,bandConcentration:.9,pointScale:1.82,cameraDistance:5.4,position:{x:0,y:0}},n={x:.35,y:.25},r=new Float32Array(2),i={uFlowPhase:{value:0},uClarityMagnet:{value:r},uClarityMagnetStrength:{value:0},uClarityPullPhase:{value:0}},a=K(e.chaosSpeed,e.calmSpeed),o=0,s=0,c=0;function l({delta:e,pointerPlane:n}){n.active&&(s<.001?(r[0]=n.x,r[1]=n.y):(r[0]=t(r[0],n.x,G.follow,e),r[1]=t(r[1],n.y,G.follow,e)));let a=+!!n.active,o=a>s?G.easeIn:G.easeOut;s=t(s,a,o,e),s<.001&&a===0&&(s=0),c=(c+e*s*.6)%64,i.uClarityMagnetStrength.value=s,i.uClarityPullPhase.value=c}return U({title:`Clarity flow`,uniformPrefix:`Clarity`,settings:e,usesPointerPlane:!0,runtimeUniforms:i,uniformKeys:[`width`,`chaosHeight`,`calmWidth`,`chaosSpeed`,`mouseEffect`,`bandThickness`,`bandConcentration`,`pointScale`],derived:()=>{let t=Math.log(e.chaosSpeed/e.calmSpeed);return{uClarityLogSpeedRatio:t,uClarityTravelScale:Math.abs(t)<1e-4?1:1/(1-Math.exp(-t))}},refresh(){a=K(e.chaosSpeed,e.calmSpeed)},glsl:{source:de,sample:`sampleClarityFlow`,identity:`identityClarityFlow`,inherit:`inheritClarityFlow`},bindings:[{key:`width`,label:`width`,min:6.5,max:10.5,step:.01},{key:`chaosHeight`,label:`chaos height`,min:1.2,max:3.8,step:.01},{key:`calmWidth`,label:`calm width`,min:.04,max:.5,step:.01},{key:`chaosSpeed`,label:`chaos speed`,min:.05,max:1.5,step:.01},{key:`calmSpeed`,label:`calm speed`,min:.05,max:1.5,step:.01},{key:`mouseEffect`,label:`mouse effect`,min:0,max:3,step:.01},{key:`bandThickness`,label:`band thickness`,min:.05,max:.45,step:.01},{key:`bandConcentration`,label:`band concentration`,min:.3,max:1,step:.01},{key:`pointScale`,label:`point scale`,min:.7,max:2.6,step:.01},{key:`cameraDistance`,label:`zoom`,min:3.8,max:7.5,step:.01},W],advance(e){if(e.reducedMotion||e.presence<=.001){s=0,i.uClarityMagnetStrength.value=0;return}o=(o+e.delta*e.tempo*a*.075*e.presence*e.presence)%1,i.uFlowPhase.value=o,l(e)},pose(t,{time:r,pointer:i,motion:a}){t.rootPosition.set(e.position.x,e.position.y,0),t.rootRotation.set(0,0,0),t.cameraPosition.set(i.x*.08*n.x,e.position.y+i.y*.06*n.y,e.cameraDistance+Math.sin(r*.05)*.035*a),t.cameraTarget.set(e.position.x*.2,e.position.y*.18,0)}})}var me=`
	uniform float uCymaticsNoteMorph;
	uniform float uCymaticsFrequencyFrom;
	uniform float uCymaticsFrequencyTo;
	uniform vec4 uCymaticsModeFrom;
	uniform vec4 uCymaticsModeTo;

	// Polar standing-wave basis (radial x angular nodes); derivatives drive the slope highlights
	vec3 cymaticFieldData(float radius, float angle, vec4 mode) {
		float primaryAngular = mix(1.0, cos(mode.x * angle), step(0.5, mode.x));
		float primaryRadialPhase = mode.y * PI * radius + mode.x * 0.11;
		float primaryRadial = sin(primaryRadialPhase);
		float primary = primaryRadial * primaryAngular;
		float primaryDr = mode.y * PI * cos(primaryRadialPhase) * primaryAngular;
		float primaryDa =
			-primaryRadial * mode.x * sin(mode.x * angle) * step(0.5, mode.x);

		float secondaryRadialPhase = (mode.w + 0.5) * PI * radius - mode.z * 0.07;
		float secondaryAngularPhase = mode.z * angle + PI * 0.25;
		float secondaryRadial = cos(secondaryRadialPhase);
		float secondaryAngular = cos(secondaryAngularPhase);
		float secondary = secondaryRadial * secondaryAngular * 0.52;
		float secondaryDr =
			-(mode.w + 0.5) * PI * sin(secondaryRadialPhase) * secondaryAngular * 0.52;
		float secondaryDa =
			-secondaryRadial * mode.z * sin(secondaryAngularPhase) * 0.52;

		return vec3(
			primary + secondary,
			primaryDr + secondaryDr,
			primaryDa + secondaryDa
		);
	}

	float cymaticPatternEnergy(vec3 fieldData, float radius) {
		float fieldMagnitude = abs(fieldData.x);
		float slope = length(vec2(fieldData.y, fieldData.z / max(radius, 0.12)));
		float nodeEdge = exp(-fieldMagnitude * 10.5);
		float contour = pow(0.5 + 0.5 * cos(fieldMagnitude * PI * 5.0), 14.0);
		float slopeHighlight = pow(smoothstep(6.0, 20.0, slope), 2.0);
		float cavity =
			smoothstep(0.58, 1.12, fieldMagnitude) * (1.0 - smoothstep(5.0, 13.0, slope));
		float surface = mix(uCymaticsSurfaceFill, uCymaticsSurfaceFill * 0.34, cavity);
		float caustic = max(nodeEdge, max(contour * 0.52, slopeHighlight * 0.38));
		caustic *= mix(1.0, 0.18, cavity);
		return max(surface, min(1.0, caustic * uCymaticsEdgeBoost));
	}

	void sampleCymatics(Identity id, vec2 uv, float arrival, out Sample result) {
		result = defaultSample();

		float radius = sqrt(uv.y);
		float angle = uv.x * TAU;
		vec3 fieldFrom = cymaticFieldData(radius, angle, uCymaticsModeFrom);
		float patternFrom = cymaticPatternEnergy(fieldFrom, radius);
		float field = fieldFrom.x;
		float fieldTo = fieldFrom.x;
		float patternEnergy = patternFrom;
		float noteHandoff = 0.0;
		if (uCymaticsNoteMorph > 0.0) {
			vec3 fieldToData = cymaticFieldData(radius, angle, uCymaticsModeTo);
			fieldTo = fieldToData.x;
			field = mix(fieldFrom.x, fieldTo, uCymaticsNoteMorph);
			patternEnergy = mix(
				patternFrom,
				cymaticPatternEnergy(fieldToData, radius),
				uCymaticsNoteMorph
			);
			noteHandoff = sin(uCymaticsNoteMorph * PI);
		}
		field *= 1.0 - noteHandoff * 0.18;
		float centerRings =
			(1.0 - smoothstep(0.08, 0.34, radius)) *
			pow(0.5 + 0.5 * cos(radius * PI * 18.0), 8.0);
		float outerRim = max(
			exp(-abs(radius - 0.96) * 48.0),
			exp(-abs(radius - 0.865) * 42.0) * 0.58
		);
		float energy = max(patternEnergy, max(centerRings * 0.92, outerRim));

		// Pitch ratios in a slow envelope: literal 65-117 Hz would alias
		float pitchRatioFrom = uCymaticsFrequencyFrom / 65.4063913;
		float breathingSpatialPhase = radius * TAU * 1.35 + angle * 0.16;
		float breathingPhaseFrom =
			id.time * uCymaticsBreathSpeed * (0.52 + pitchRatioFrom * 0.075) +
			breathingSpatialPhase;
		float individualSpatialPhase = id.phaseW + angle * 0.72;
		float individualDrift = sin(
			id.time * uCymaticsBreathSpeed * (0.7 + pitchRatioFrom * 0.11) +
				individualSpatialPhase
		);
		float coherentBreath = sin(breathingPhaseFrom + fieldFrom.x * 0.52);
		if (uCymaticsNoteMorph > 0.0) {
			float pitchRatioTo = uCymaticsFrequencyTo / 65.4063913;
			float breathingPhaseTo =
				id.time * uCymaticsBreathSpeed * (0.52 + pitchRatioTo * 0.075) +
				breathingSpatialPhase;
			coherentBreath = mix(
				coherentBreath,
				sin(breathingPhaseTo + fieldTo * 0.52),
				uCymaticsNoteMorph
			);
			individualDrift = mix(
				individualDrift,
				sin(
					id.time * uCymaticsBreathSpeed * (0.7 + pitchRatioTo * 0.11) +
						individualSpatialPhase
				),
				uCymaticsNoteMorph
			);
		}
		coherentBreath *= mix(0.045, 0.11, energy) * (1.0 - noteHandoff * 0.12);
		individualDrift *= mix(0.015, 0.035, energy);
		float particleFloat = (coherentBreath + individualDrift) * uCymaticsBreath * uMotion;
		float diskRadius = radius * uCymaticsRadius;

		result.position = vec3(
			cos(angle) * diskRadius,
			sin(angle) * diskRadius,
			field * uCymaticsDepth + particleFloat + (id.random.z - 0.5) * 0.05
		);
		result.identity = uv;
		result.energy = energy;
		result.ink = energy;
		result.sizeBase =
			uSharedPointScale *
			uCymaticsPointScale *
			uPixelRatio *
			mix(0.75, 4.45, pow(energy, 1.05)) *
			mix(0.94, 1.08, id.random.w) *
			0.58;
		result.depthScale = vec3(5.0, 0.72, 1.8);
		result.sprite = vec4(5.6, 0.08, 0.08, 0.48);
		result.coreWeight = 0.88;
		result.alphaFloor = uCymaticsSurfaceFill;
		result.inkStrength = 1.58;
	}

	// Tipped onto its edge rather than crushed: a disk seen edge on already is a band
	void departCymatics(
		Identity id,
		float blend,
		vec3 fromPoint,
		vec3 toPoint,
		inout vec3 point
	) {
		float radius = sqrt(id.baseT);
		float delay = radius * 0.22;
		float tipProgress = clamp((blend - delay) / (1.0 - delay), 0.0, 1.0);
		tipProgress = tipProgress * tipProgress * (3.0 - 2.0 * tipProgress);
		float tip = tipProgress * PI * 0.5;
		float sinTip = sin(tip);
		float cosTip = cos(tip);

		// Foreshortened: a full turn throws the near rings at the camera
		vec3 tipped = vec3(
			fromPoint.x,
			fromPoint.y * cosTip - fromPoint.z * sinTip,
			fromPoint.y * sinTip * 0.42 + fromPoint.z * cosTip
		);
		point = mix(tipped, toPoint, smoothstep(0.34, 1.0, blend));
	}
`,q=[{label:`F♯2`,frequency:92.4986056779086,mode:[8,2,4,3]},{label:`A♯2`,frequency:116.54094037952248,mode:[0,5,6,2]},{label:`C2`,frequency:65.40639132514966,mode:[4,2,8,1]},{label:`D♯2`,frequency:77.78174593052023,mode:[6,2,3,4]}],J=5;function he(e,t,n){if(n){e.fromIndex=0,e.toIndex=0,e.morph=0;return}let r=q.length,i=Math.max(0,t),a=Math.floor(i/J)%r,o=i%J/J,s=Math.min(1,Math.max(0,(o-.75)/.25)),c=s*s*s*(s*(s*6-15)+10);e.fromIndex=a,e.toIndex=(a+1)%r,e.morph=c}function ge(){let e={cameraDistance:5.5,position:{x:0,y:0},radius:3.6,depth:.34,breath:1,breathSpeed:1.25,pointScale:1.5,surfaceFill:.25,edgeBoost:1.5,perspectiveAngle:-.68},t=new Float32Array(q[0].mode),n=new Float32Array(q[1].mode),r={uCymaticsNoteMorph:{value:0},uCymaticsFrequencyFrom:{value:q[0].frequency},uCymaticsFrequencyTo:{value:q[1].frequency},uCymaticsModeFrom:{value:t},uCymaticsModeTo:{value:n}},i={fromIndex:0,toIndex:1,morph:0},a=0,o=0,s=1;return U({title:`Cymatics`,uniformPrefix:`Cymatics`,settings:e,runtimeUniforms:r,uniformKeys:[`radius`,`depth`,`breath`,`breathSpeed`,`pointScale`,`surfaceFill`,`edgeBoost`],glsl:{source:me,sample:`sampleCymatics`,identity:`plateIdentity`,departure:`departCymatics`},bindings:[{key:`radius`,label:`radius`,min:2,max:4,step:.01},{key:`depth`,label:`surface depth`,min:.05,max:.8,step:.01},{key:`breath`,label:`breathing`,min:0,max:2,step:.01},{key:`breathSpeed`,label:`breathing speed`,min:.5,max:2.5,step:.01},{key:`pointScale`,label:`point scale`,min:.7,max:2.5,step:.01},{key:`surfaceFill`,label:`surface fill`,min:.08,max:.55,step:.01},{key:`edgeBoost`,label:`edge boost`,min:.8,max:2.2,step:.01},{key:`perspectiveAngle`,label:`perspective angle`,min:-1,max:.2,step:.01},{key:`cameraDistance`,label:`zoom`,min:3.5,max:7,step:.01},W],advance({delta:e,motion:c,weight:l,arrival:u,reducedMotion:d,tempo:f}){l>=.999?a+=e/f*c:u<1&&(a=0),he(i,a,d);let{fromIndex:p,toIndex:m,morph:h}=i;(p!==o||m!==s)&&(t.set(q[p].mode),n.set(q[m].mode),r.uCymaticsFrequencyFrom.value=q[p].frequency,r.uCymaticsFrequencyTo.value=q[m].frequency,o=p,s=m),r.uCymaticsNoteMorph.value=h},pose(t,{time:n,centeredPointer:r,motion:i}){let a=r.y*.14*i,o=r.x*.2*i;t.rootPosition.set(e.position.x,e.position.y,0),t.rootRotation.set(e.perspectiveAngle+a,-e.perspectiveAngle*.24+o,0),t.cameraPosition.set(r.x*.12,r.y*.1,e.cameraDistance+Math.sin(n*.06)*.045*i),t.cameraTarget.set(0,0,0)}})}var _e=`
	uniform float uOrbPullPhase;
	uniform float uOrbPullBoost;
	uniform float uOrbSpinPhase;
	uniform float uOrbWakeClock;
	uniform float uOrbAwake;
	uniform float uOrbGrow;
	uniform float uOrbEntry;

	// Spin axis tilt: X then Z rotation, folded into one matrix
	const mat3 ORB_TILT = mat3(
		0.984, 0.179, 0.0,
		-0.163427, 0.898392, 0.408,
		0.073032, -0.401472, 0.913
	);
	const float ORB_SHELL_SHARE = 0.3;
	// Formation opens a third of the way out, not from a point
	const float ORB_FORM_START = 0.33;
	const float ORB_REACH = 3.6;

	void sampleEnergyOrb(Identity id, vec2 uv, float arrival, out Sample result) {
		result = defaultSample();

		// Formation: staggered launches easing out along an unwinding spiral. Monotonic, or it reads as a bounce
		float flight = clamp((uOrbGrow - id.random.w * 0.5) / (0.3 + id.random.y * 0.4), 0.0, 1.0);
		float rest = 1.0 - flight;
		float bloom = 1.0 - rest * rest * rest;
		float form = mix(ORB_FORM_START, 1.0, bloom);
		float unwind = rest * rest * (0.35 + id.random.x * 0.55);

		// Radius eases between its preloader and settled sizes with the wake
		float radius = mix(uOrbDormantRadius, uOrbRadius, uOrbAwake);
		float haze = id.random.x * id.random.x;
		haze *= haze * 0.45;
		float sizeIdentity = id.random.z * id.random.z;
		float size =
			uOrbPointScale *
			uPixelRatio *
			mix(1.06, 1.0, uOrbAwake) *
			mix(0.7, uOrbSizeContrast, sizeIdentity * sizeIdentity);

		float cosT;
		float phi;
		float reach;

		// Row split, not a random one: whole warps take one side of the branch
		if (id.baseT < ORB_SHELL_SHARE) {
			// Shell: one accumulated rotation, haze off the surface for the rim, untwisted by the wake
			cosT = id.baseT / ORB_SHELL_SHARE * 2.0 - 1.0;
			phi =
				fract(id.cell.y + id.random.y * 0.618) * TAU +
				uOrbSpinPhase * (1.0 + (id.random.w - 0.5) * 0.05) +
				(id.random.x - 0.5) * (1.0 - uOrbAwake) * 2.4;
			reach = 1.0 + haze + (id.random.w - 0.5) * 0.09;

			result.viewResponse = 1.0;
			result.alphaScale = mix(0.85, 1.0, uOrbAwake) * bloom;
			// Haze tapers finer further off the surface
			result.sizeBase = size * (1.0 - haze * 0.8);
			result.alphaFloor = 0.38;
		} else {
			// Streams from the first breath: each grain fades on its own clock
			float depth = fract(id.random.z * 7.13 + id.random.w * 3.71);
			float wake = clamp((uOrbWakeClock - depth * 0.5) / 0.5, 0.0, 1.0);
			wake = wake * wake * (3.0 - 2.0 * wake);
			// Own share of the entry surge: some grains race, others amble — no common front
			float surge = fract(id.random.y * 9.7 + id.random.x * 4.3);

			// Infall: walked in from its own depth on its own loop, orbiting once caught
			float fall =
				fract(id.random.z + (uOrbPullPhase + uOrbPullBoost * surge) * (0.55 + id.random.w * 0.9));
			float travel = smoothstep(0.0, 0.76, fall);
			float dive = travel * travel;
			float caught = smoothstep(0.76, 1.0, fall);
			cosT = id.random.x * 2.0 - 1.0;
			// The fall bends, never rotates; capture tunes it into the shell's spin
			phi =
				id.phaseY +
				uOrbSwirl * dive * travel * 0.3 +
				uOrbSpinSpeed * caught * (1.5 + id.random.y);

			float approach = smoothstep(0.15, 0.9, dive);
			float born = smoothstep(0.0, 0.16, fall) * (1.0 - smoothstep(0.87, 1.0, fall)) * wake;
			float flicker = 0.75 + 0.25 * sin(id.time * (1.2 + id.random.w * 2.4) + id.phaseY);
			reach = mix(mix(1.25, ORB_REACH, sqrt(depth)), 1.05, dive);

			result.energy =
				mix(0.06 + uOrbEntry * 0.35 * (0.3 + 0.7 * surge), 0.85, max(approach * approach, caught)) *
				flicker * wake;
			// Particles fade in as they launch, damped near the view axis to keep the pull at the edges
			result.alphaScale = mix(0.35 + uOrbEntry * 0.3, 1.0, approach) * born * bloom;
			result.sizeBase = size * mix(0.72, 1.2, approach) * (1.0 + uOrbEntry * 0.5 * surge);
			result.alphaFloor = 0.5;
		}

		cosT = clamp(cosT, -0.999, 0.999);
		phi += unwind;
		float sinT = sqrt(1.0 - cosT * cosT);
		vec3 direction = vec3(sinT * cos(phi), cosT, sinT * sin(phi));
		vec3 tilted = ORB_TILT * direction;

		// Only the shell tilts; streams near the view axis stay damped
		result.position = mix(direction, tilted, result.viewResponse) * (radius * reach * form);
		result.alphaScale *=
			mix(mix(0.25, 1.0, 1.0 - smoothstep(0.45, 0.85, abs(direction.z))), 1.0, result.viewResponse);
		result.ink = result.energy;
		result.normal = direction;
		// Far hemisphere dimmer and finer: the sphere continues behind itself
		result.viewData = vec2(smoothstep(0.15, -0.55, tilted.z), smoothstep(0.26, 0.05, haze));
		// Handoff near its own longitude: short crossing
		float handoffX = result.position.x / (radius * 2.0) + 0.5;
		result.identity = vec2(clamp(handoffX + (id.random.z - 0.5) * 0.12, 0.0, 0.9999), id.baseT);
		result.depthScale = vec3(5.4, 0.4, 2.4);
		// Tight core, thin halo: each grain prints as a dot, not a blot
		result.sprite = vec4(5.2, 0.09, 0.1, 0.5);
		result.coreWeight = 0.85;
		result.inkStrength = 1.55;
	}

	// The rim is a gradient: both hemispheres keep dust, or the sphere reads as a circle
	void applyEnergyOrbView(Identity id, float fresnel, inout Sample result) {
		float back = result.viewData.x;
		float rim = fresnel * mix(0.3, 1.0, result.viewData.y);
		result.energy = mix(0.18, 1.0, rim) * mix(0.8, 1.0, id.random.w) * mix(1.0, 0.55, back);
		result.ink = rim * mix(1.0, 0.5, back);
		result.alphaScale *= mix(0.32, 1.1, rim) * mix(1.0, 0.6, back);
		result.sizeBase *= mix(0.78, 1.7, rim * rim) * mix(1.0, 0.8, back);
	}

	// The circle must dissolve, not travel: a signed radial smear fogs the shell mid-blend
	void departEnergyOrb(
		Identity id,
		float blend,
		vec3 fromPoint,
		vec3 toPoint,
		inout vec3 point
	) {
		float breath = blend * (1.0 - blend) * 4.0;
		float reach = uOrbRadius / max(length(fromPoint), uOrbRadius);
		// Half in, half out: the crisp rim thickens into a cloud instead of holding its ring
		float scatter = 0.06 + (id.random.w - 0.5) * 0.55;
		point += fromPoint * reach * (breath * breath * scatter);
	}
`;function ve(){let e={radius:1.45,dormantRadius:1.6,pullSpeed:.037,swirl:1.83,spinSpeed:.24,sizeContrast:3.4,pointScale:1.75},t={uOrbPullPhase:{value:0},uOrbPullBoost:{value:0},uOrbSpinPhase:{value:0},uOrbWakeClock:{value:0},uOrbAwake:{value:1},uOrbGrow:{value:1},uOrbEntry:{value:0}},n=0,r=0;return U({title:`Energy orb`,uniformPrefix:`Orb`,settings:e,runtimeUniforms:t,uniformKeys:[`radius`,`dormantRadius`,`swirl`,`spinSpeed`,`sizeContrast`,`pointScale`],glsl:{source:_e,sample:`sampleEnergyOrb`,view:`applyEnergyOrbView`,departure:`departEnergyOrb`},advance({delta:i,motion:a,weight:o,awake:s,reducedMotion:c}){if(o<=.001)return;n+=i;let l=i*a,u=c?1:Math.min(n/4,1);t.uOrbGrow.value=u,s>.001&&(r+=i),t.uOrbWakeClock.value=c?99:r,t.uOrbAwake.value=s;let d=Math.max(0,r-.8);t.uOrbEntry.value=c?0:Math.exp(-d*.25),r>0&&(t.uOrbPullPhase.value+=l*e.pullSpeed,t.uOrbPullBoost.value+=l*e.pullSpeed*7*Math.exp(-d/1.5)),t.uOrbSpinPhase.value+=l*e.spinSpeed*(1+(1-u)*2)},bindings:[{key:`radius`,label:`radius`,min:.9,max:2.6,step:.01},{key:`dormantRadius`,label:`radius (preloader)`,min:.9,max:2.6,step:.01},{key:`pullSpeed`,label:`pull`,min:.01,max:.2,step:.001},{key:`swirl`,label:`swirl`,min:0,max:4,step:.01},{key:`spinSpeed`,label:`spin`,min:0,max:.6,step:.01},{key:`sizeContrast`,label:`size contrast`,min:1.2,max:5,step:.05},{key:`pointScale`,label:`point scale`,min:.7,max:2.2,step:.01}],pose(e,{time:t,centeredPointer:n,reducedMotion:r,awake:i,aspect:a}){let o=r?1:i,s=r?0:t*.04,c=1-.34*Math.min(Math.max((1.2-a)/.75,0),1),l=c+(1-c)*i;e.rootPosition.set(0,0,0),e.rootRotation.set(-.06+Math.sin(s*.9)*.03,0,0),e.cameraPosition.set(Math.sin(s)*.6*o+n.x*.18,Math.sin(s*.7)*.34*o+n.y*.11,(5.6-o*1.55)*l),e.cameraTarget.set(n.x*.08,n.y*.05,0)}})}var ye=`
	uniform float uFreeFlowTime;
	uniform float uFreeFlowParticleTime;
	uniform float uFreeFlowSeed;
	uniform vec2 uFreeFlowPointer;
	uniform float uFreeFlowPointerStrength;

	vec2 rotateFreeFlow(vec2 point, vec2 rotation) {
		return vec2(
			point.x * rotation.x - point.y * rotation.y,
			point.x * rotation.y + point.y * rotation.x
		);
	}

	vec3 sampleFreeFlowField(vec2 point, vec4 temporal) {
		float flowTime = uFreeFlowTime;
		float seed = uFreeFlowSeed;
		vec2 movingPoint = rotateFreeFlow(point, temporal.xy);
		vec2 warp = vec2(
			sin(movingPoint.y * 0.68 + flowTime * 0.16 + seed),
			sin(movingPoint.x * 0.43 - flowTime * 0.11 + seed * 1.7)
		);
		vec2 warpedPoint = movingPoint + warp * vec2(1.25, 0.95);
		float broad =
			sin(warpedPoint.y * 1.35 + flowTime * 0.23 + seed * 2.3) * mix(0.78, 1.18, temporal.z);
		float crossing =
			sin((warpedPoint.x - warpedPoint.y) * 1.1 - flowTime * 0.19 + seed * 3.1);
		float detail =
			sin(warpedPoint.x * 0.72 + warpedPoint.y * 1.85 + flowTime * 0.27 + seed) *
			mix(0.68, 1.22, temporal.w);
		float twirl = sin(dot(warpedPoint, warpedPoint) * 0.11 - flowTime * 0.21 + seed * 1.7);
		vec2 direction = vec2(
			0.42 + broad * 0.72 + crossing * 0.46 + detail * 0.3,
			broad * 0.18 - crossing * 0.34 + detail * 0.22
		);
		direction += vec2(-warpedPoint.y, warpedPoint.x) * twirl * 0.024;
		if (uFreeFlowPointerStrength > 0.0) {
			vec2 pointerOffset = point - uFreeFlowPointer;
			float pointerDistanceSquared = dot(pointerOffset, pointerOffset);
			float pointerDistance = sqrt(pointerDistanceSquared);
			float pointerFalloff =
				exp(-pointerDistanceSquared / 3.2) * uFreeFlowPointerStrength;
			direction +=
				vec2(-pointerOffset.y, pointerOffset.x) *
				pointerFalloff *
				0.34 /
				(pointerDistance + 0.55);
		}
		float fieldMagnitudeSquared = dot(direction, direction);
		float inverseMagnitude = inversesqrt(max(fieldMagnitudeSquared, 0.0001));
		float fieldMagnitude = fieldMagnitudeSquared * inverseMagnitude;
		float localSpeed = mix(0.13, 0.49, smoothstep(0.06, 1.12, fieldMagnitude));
		return vec3(direction * inverseMagnitude * localSpeed, fieldMagnitude);
	}

	void sampleFreeFlow(Identity id, vec2 uv, float arrival, out Sample result) {
		result = defaultSample();

		float flowTime = uFreeFlowTime;
		float broadRotation = flowTime * 0.085 + sin(flowTime * 0.17) * 0.28;
		vec4 temporal = vec4(
			cos(broadRotation),
			sin(broadRotation),
			0.5 + 0.5 * sin(flowTime * 0.23 + 0.7),
			0.5 + 0.5 * cos(flowTime * 0.31 - 1.2)
		);
		vec2 point = vec2(
			(id.random.x - 0.5) * uFreeFlowWidth,
			(id.random.y - 0.5) * uFreeFlowHeight
		);
		float particlePace = mix(0.88, 1.12, id.random.w);
		float age = fract(id.random.z + uFreeFlowParticleTime * 0.19 * particlePace) * 4.6;
		float travelStep = age * 0.333333 * uFreeFlowCollisionStrength;
		vec3 flowSample = sampleFreeFlowField(point, temporal);
		point += flowSample.xy * travelStep;
		flowSample = sampleFreeFlowField(point, temporal);
		point += flowSample.xy * travelStep;
		vec2 previousVelocity = flowSample.xy;
		flowSample = sampleFreeFlowField(point, temporal);
		point += flowSample.xy * travelStep;
		float curvatureProduct =
			dot(previousVelocity, previousVelocity) * dot(flowSample.xy, flowSample.xy);
		float curvature =
			abs(previousVelocity.x * flowSample.y - previousVelocity.y * flowSample.x) *
			inversesqrt(max(curvatureProduct, 0.000001));
		vec2 lensCoordinate = point / vec2(uFreeFlowWidth * 0.5, uFreeFlowHeight * 0.5);
		float lensRadiusSquared = dot(lensCoordinate, lensCoordinate);
		float lensScale = 1.0 + lensRadiusSquared * uFreeFlowWideAngle;

		float sizeIdentity = fract(id.baseT * 9.17);
		sizeIdentity *= sizeIdentity;
		sizeIdentity *= sizeIdentity;
		float compression = 1.0 - smoothstep(0.12, 0.78, flowSample.z);
		float energy = clamp(
			0.28 + compression * 0.58 + curvature * 0.38 + sizeIdentity * 0.08,
			0.0,
			1.0
		);
		float sizeVariationIdentity = id.random.w * id.random.w;
		sizeVariationIdentity *= sizeVariationIdentity;

		result.position = vec3(
			point * lensScale,
			-uFreeFlowWideAngle * 1.2 + lensRadiusSquared * uFreeFlowWideAngle * 3.8
		);
		// Ripples inherits this, so the plate gathers the flow instead of starting a fresh disk
		float fieldRadius = clamp(
			length(result.position.xy) / (min(uFreeFlowWidth, uFreeFlowHeight) * 0.5),
			0.0,
			1.0
		);
		result.identity = vec2(
			fract(atan(result.position.y, result.position.x) / TAU + 1.0),
			fieldRadius * fieldRadius
		);
		result.energy = energy;
		result.ink = energy;
		result.sizeBase =
			uSharedPointScale *
			uFreeFlowPointScale *
			uPixelRatio *
			mix(0.78, 1.2, sizeVariationIdentity) *
			mix(0.82, 3.05, smoothstep(0.28, 0.9, energy)) *
			0.78;
		result.depthScale = vec3(5.4, 0.9, 1.15);
		// exp(-6.6r^2) stands in for (1-r^2)^6; error stays under one dither step
		result.sprite = vec4(6.6, 0.025, 0.07, 0.42);
		result.coreWeight = 0.86;
		result.alphaFloor = 0.64;
		result.inkStrength = 0.42;
	}
`;function be(){let e={cameraDistance:7.4,position:{x:0,y:0},width:12,height:9.3,flowSpeed:.5,particleSpeed:.12,collisionStrength:.65,mouseEffect:1.1,wideAngle:.08,pointScale:1.8},t=new Float32Array(2),n={uFreeFlowTime:{value:0},uFreeFlowParticleTime:{value:0},uFreeFlowSeed:{value:Math.random()*Math.PI*2},uFreeFlowPointer:{value:t},uFreeFlowPointerStrength:{value:0}},r=0,i=0;return U({title:`Free flow`,uniformPrefix:`FreeFlow`,settings:e,usesPointerPlane:!0,runtimeUniforms:n,uniformKeys:[`width`,`height`,`collisionStrength`,`wideAngle`,`pointScale`],glsl:{source:ye,sample:`sampleFreeFlow`},bindings:[{key:`width`,label:`width`,min:8,max:16,step:.01},{key:`height`,label:`height`,min:5,max:11,step:.01},{key:`flowSpeed`,label:`field speed`,min:.05,max:1,step:.01},{key:`particleSpeed`,label:`particle speed`,min:0,max:1,step:.01},{key:`collisionStrength`,label:`collision`,min:0,max:1.5,step:.01},{key:`mouseEffect`,label:`mouse intensity`,min:0,max:1.5,step:.01},{key:`wideAngle`,label:`wide angle`,min:0,max:.3,step:.01},{key:`pointScale`,label:`point scale`,min:.8,max:2.8,step:.01},{key:`cameraDistance`,label:`zoom`,min:4,max:9,step:.01},W],advance({delta:a,reducedMotion:o,presence:s,pointerPlane:c,tempo:l}){let u=!o&&s>.001;u&&(r+=a*l*e.flowSpeed,i+=a*l*e.particleSpeed,n.uFreeFlowTime.value=r,n.uFreeFlowParticleTime.value=i),u&&c.active?(t[0]=c.x,t[1]=c.y,n.uFreeFlowPointerStrength.value=e.mouseEffect):n.uFreeFlowPointerStrength.value=0},pose(t,{centeredPointer:n}){let r=n.x*e.mouseEffect,i=n.y*e.mouseEffect;t.rootPosition.set(e.position.x,e.position.y,0),t.rootRotation.set(0,0,0),t.cameraPosition.set(r*.44,i*.22,e.cameraDistance),t.cameraTarget.set(e.position.x*.22-r*.12,e.position.y*.2-i*.06,0)}})}var xe=`
	uniform float uVoidPull;
	uniform float uVoidTime;
	uniform float uVoidSeed;
	uniform vec2 uVoidCenter;

	// Settled by eye, not worth a slider
	const float VOID_WARP = 0.38;
	const float VOID_SWIRL = 0.55;
	const float VOID_STRETCH = 0.5;
	const float VOID_SIDES = 0.95;
	const float VOID_WANDER = 0.18;
	const float VOID_WANDER_SPEED = 0.05;
	const float VOID_CENTER_PULL = 0.35;

	void sampleVoid(Identity id, vec2 uv, float arrival, out Sample result) {
		result = defaultSample();

		// Whole rates only: uVoidPull wraps at 1
		float rate = 1.0 + floor(id.random.w * 4.0);
		float life = fract(id.random.z + uVoidPull * rate);
		float rest = 1.0 - life;
		// Rushes the first half, brakes into the horizon
		float fall = 1.0 - pow(rest, uVoidPlunge);
		// Speed: full in the rush, zero at the hole
		float speed = pow(rest, uVoidPlunge - 1.0);

		// Arcs tighten as they fall
		float base = id.phaseY + uVoidSeed;
		float theta = base + VOID_SWIRL * pow(fall, 1.6) * (0.75 + id.random.w * 0.5);
		vec2 dir = vec2(cos(theta), sin(theta));

		// Mass lives far out, thinning toward the frame
		float birth = 1.0 + pow(id.random.x, 0.6) * uVoidReach;
		float far = exp(-(birth - 1.0) * 0.16);
		// Decorrelated from phaseY: random.y IS the angle
		float rag = fract(id.random.y * 13.73 + id.random.x * 5.31);
		// One continuous plunge: no hover ring, no wall
		float radNorm = mix(birth, uVoidCore * 0.12, fall);

		// Far field only: the circle stays a circle
		float warp =
			1.0 +
			VOID_WARP * smoothstep(0.85, 1.6, radNorm) * (
				0.6 * sin(theta * 2.0 + uVoidTime * 0.31) +
				0.4 * sin(theta * 5.0 - uVoidTime * 0.23)
			);
		float radius = radNorm * uVoidRadius * warp;

		// Deeper dust obeys the pointer more
		vec2 point = dir * radius + uVoidCenter * VOID_CENTER_PULL * fall * fall;

		// Speed smear: the rush streaks
		point += dir * (fract(id.random.w * 7.13) - 0.5) * VOID_STRETCH * speed * uVoidRadius * 0.35;

		// Own clock per particle, stilled as gravity takes over
		float wanderTime = id.time * VOID_WANDER_SPEED * TAU;
		point += vec2(
			sin(wanderTime * (0.21 + id.random.z * 0.34) + id.phaseY),
			sin(wanderTime * (0.16 + id.random.w * 0.27) + id.phaseW)
		) * VOID_WANDER * (1.0 - fall * 0.8);

		// Edges ride close to the camera; the throat has no floor
		float depth =
			(birth - 1.0) * uVoidNear * (1.0 - fall) -
			uVoidFunnel * fall * fall * (1.0 + fall * 1.2) +
			(id.random.z - 0.5) * 0.5 * (1.0 - fall);

		float born = smoothstep(0.0, 0.08, life) * far;
		// The hole is a fade, not a wall
		born *= smoothstep(uVoidCore * (0.45 + rag * 0.5), uVoidCore * (1.25 + rag * 0.6), radNorm);
		// Side bias outside the circle only
		float side = pow(abs(cos(base)), 1.5);
		born *= mix(1.0, mix(0.12, 1.0, smoothstep(0.12, 0.72, side)), VOID_SIDES * smoothstep(0.85, 1.5, radNorm));

		float flicker = 0.8 + 0.2 * sin(id.time * (1.2 + id.random.w * 2.4) + id.phaseY);
		float grain = id.random.w * id.random.w;
		// Energy is speed
		float energy = clamp((0.32 + speed * 0.52 + grain * 0.14) * born * flicker, 0.0, 1.0);

		result.position = vec3(point, depth);
		result.identity = vec2(life, fract(theta / TAU));
		result.energy = energy;
		result.ink = energy;
		result.alphaScale = born;
		result.sizeBase =
			uSharedPointScale *
			uVoidPointScale *
			uPixelRatio *
			mix(0.7, 1.7, grain) *
			mix(1.6, 3.0, smoothstep(0.2, 0.9, energy)) *
			mix(1.0, 2.0, smoothstep(0.0, 1.8, birth - 1.0)) *
			mix(1.0, 0.65, fall);
		// Open clamp: near projects big, far shrinks
		result.depthScale = vec3(6.5, 0.3, 2.1);
		// exp(-6.6r^2) stands in for (1-r^2)^6
		result.sprite = vec4(6.6, 0.025, 0.07, 0.42);
		result.coreWeight = 0.92;
		result.alphaFloor = 0.82;
		result.inkStrength = 0.55;
	}
`,Se=.06;function Ce(){let n={cameraDistance:7,position:{x:0,y:0},radius:7.2,core:.32,reach:2.6,plunge:2.2,funnel:4.6,near:1.6,fallSpeed:1,pointScale:2.6},r=new Float32Array(2),i={uVoidPull:{value:0},uVoidTime:{value:0},uVoidSeed:{value:Math.random()*Math.PI*2},uVoidCenter:{value:r}},a=0,o=0;return U({title:`Void`,uniformPrefix:`Void`,settings:n,usesPointerPlane:!0,runtimeUniforms:i,uniformKeys:[`radius`,`core`,`reach`,`plunge`,`funnel`,`near`,`pointScale`],glsl:{source:xe,sample:`sampleVoid`},bindings:[{key:`radius`,label:`radius`,min:5,max:14,step:.1},{key:`core`,label:`core`,min:0,max:.6,step:.005},{key:`reach`,label:`reach`,min:0,max:5,step:.05},{key:`plunge`,label:`plunge`,min:1,max:5,step:.05},{key:`funnel`,label:`funnel depth`,min:0,max:8,step:.05},{key:`near`,label:`edge closeness`,min:0,max:3,step:.05},{key:`fallSpeed`,label:`fall speed`,min:.05,max:2,step:.01},{key:`pointScale`,label:`point scale`,min:.7,max:3.2,step:.01},{key:`cameraDistance`,label:`zoom`,min:4,max:12,step:.01},W],advance({delta:e,reducedMotion:s,presence:c,tempo:l,pointerPlane:u}){if(s||c<=.001)return;let d=e*l;a=(a+d*n.fallSpeed*.016)%1,o+=d,i.uVoidPull.value=a,i.uVoidTime.value=o,r[0]=t(r[0],u.active?u.x:0,1.1,e),r[1]=t(r[1],u.active?u.y:0,1.1,e)},pose(t,{time:r,centeredPointer:i,motion:a,aspect:o}){let s=1+.34*e(o,1.2,.45);t.rootPosition.set(n.position.x,n.position.y,0),t.rootRotation.set(Se+Math.sin(r*.023)*.03*a,Math.sin(r*.017)*.04*a,0),t.cameraPosition.set(i.x*.3,i.y*.2,n.cameraDistance*s),t.cameraTarget.set(0,0,0)}})}var Y=`
	uniform float uMusicalDnaScroll;
	uniform float uMusicalDnaArrival;

	// Spacing, not a rung count: a longer helix gains rungs instead of stretching them
	const float DNA_RUNG_SPACING = 0.4;

	// Both states read this drifting parameter, so the morph shears along the strand
	float musicalDnaTravel(Identity id) {
		float flow = sin(
			id.time * uSharedFlowSpeed * (0.62 + id.random.z * 0.2) +
			id.travelU * TAU * 5.0 +
			id.phaseW
		);
		return clamp(
			id.travelU + flow * 0.006 * uMotion * min(1.0, id.time * 0.5) * uMusicalDnaArrival,
			0.0,
			1.0
		);
	}

	void sampleMusical(Identity id, vec2 uv, float arrival, out Sample result) {
		result = defaultSample();

		float band = floor(id.cell.y * 12.0);
		float harmonic = band + 1.0;
		float bandRatio = band / 11.0;
		float t = musicalDnaTravel(id);
		float phase = t * TAU;

		// Harmonic family f_n(x) = sin(n x) / n, n = 1 … 12, each in its own plane
		float wave = sin(harmonic * phase) / harmonic;
		float breathe = 1.0 + sin(id.time * 0.42 + harmonic * 0.61) * 0.075 * uMotion;
		float planeAngle =
			bandRatio * PI * 0.94 +
			id.time * uSharedRotationSpeed * 0.72 +
			uMusicalDnaScroll * 0.38 +
			sin(id.time * 0.19 + harmonic) * 0.08 * uMotion;
		float scaleRadius = wave * uMusicalWidth * breathe;

		result.position = vec3(
			(t - 0.5) * 7.2,
			cos(planeAngle) * scaleRadius,
			sin(planeAngle) * scaleRadius
		);
		// Granular thickness belongs to the woven field; DNA resolves to clean rails
		result.position += vec3(
			(id.random.z - 0.5) * 0.04,
			(id.random.w - 0.5) * 0.032,
			(id.random.x - 0.5) * 0.04
		);
		result.identity = vec2(id.travelU, id.baseT);

		float flowEnergy =
			0.5 + 0.5 * sin(id.baseT * TAU * 4.0 - id.time * uSharedFlowSpeed * 1.4 + band * 0.27);
		result.energy = 0.76 + bandRatio * 0.16 + flowEnergy * 0.08;
		result.ink = result.energy;
		result.sizeBase =
			uSharedPointScale * uPixelRatio * mix(0.68, 2.75, pow(id.random.w, 3.6)) * 0.58;
		result.depthScale = vec3(5.2, 0.68, 1.9);
		result.inkStrength = 1.38;
	}

	// Bows out of screen while winding into the helix
	void departMusical(
		Identity id,
		float blend,
		vec3 fromPoint,
		vec3 toPoint,
		inout vec3 point
	) {
		point.z += sin(id.baseT * TAU) * sin(blend * PI) * 0.34;
	}

	void sampleDna(Identity id, vec2 uv, float arrival, out Sample result) {
		result = defaultSample();

		float isEndpoint = step(0.92, id.cell.z);
		float isBackbone = step(0.47, id.cell.z) * (1.0 - isEndpoint);
		float isBar = 1.0 - isBackbone - isEndpoint;
		float rungs = max(1.0, floor(uDnaLength / DNA_RUNG_SPACING));
		float rungT = (floor(id.travelU * rungs) + 0.5) / rungs;
		float dnaT = mix(rungT, musicalDnaTravel(id), isBackbone);
		// The twist is a period along the axis, so length and turn count move together
		float dnaTurns = uDnaLength / max(uDnaTwistPitch, 0.001);
		float dnaAngle =
			dnaT * TAU * dnaTurns + id.time * uSharedRotationSpeed + uMusicalDnaScroll * 0.7;
		float lineAcross = id.random.y * 1.84 - 0.92;
		float dnaAcross = mix(lineAcross, id.side, isBackbone + isEndpoint);
		float sinDna = sin(dnaAngle);
		float cosDna = cos(dnaAngle);
		vec3 radialDirection = vec3(0.0, cosDna, sinDna);
		vec3 aroundDirection = vec3(0.0, -sinDna, cosDna);

		vec3 point = vec3(
			(dnaT - 0.5) * uDnaLength,
			radialDirection.y * uDnaWidth * dnaAcross,
			radialDirection.z * uDnaWidth * dnaAcross
		);
		vec3 barHalo = vec3((id.random.z - 0.5) * 0.055, 0.0, 0.0);
		barHalo += aroundDirection * (id.random.w - 0.5) * 0.105;
		point += barHalo * isBar;
		vec3 backboneHalo = vec3((id.random.z - 0.5) * 0.045, 0.0, 0.0);
		backboneHalo += radialDirection * (id.random.w - 0.5) * 0.13;
		backboneHalo += aroundDirection * (id.random.y - 0.5) * 0.115;
		point += backboneHalo * isBackbone;
		point += vec3(
			(id.random.z - 0.5) * 0.018,
			(id.random.w - 0.5) * 0.025,
			(id.random.y - 0.5) * 0.025
		) * isEndpoint;

		// Endpoints size inversely with depth so the rails read as a helix
		float endpointDepth = 0.5 + 0.5 * sinDna * id.side;
		float lineSize = mix(0.92, 1.55, pow(id.random.w, 2.4));
		float backboneSize = mix(1.42, 2.72, pow(id.random.w, 2.1));
		float endpointSize = mix(1.05, 3.4, pow(endpointDepth, 0.72));
		float sizeVariation = mix(lineSize, backboneSize, isBackbone);
		sizeVariation = mix(sizeVariation, endpointSize, isEndpoint);
		float energy = mix(0.76, 0.94, isBackbone);

		result.position = point;
		result.identity = vec2(id.travelU, id.baseT);
		result.energy = mix(energy, 0.88 + endpointDepth * 0.12, isEndpoint);
		result.ink = result.energy;
		result.sizeBase = uSharedPointScale * uPixelRatio * sizeVariation * 0.58;
		result.depthScale = vec3(5.2, 0.68, 1.9);
		result.inkStrength = 1.16;
	}

	// Unwinds through screen depth on the way to the cymatic plate
	void departDna(Identity id, float blend, vec3 fromPoint, vec3 toPoint, inout vec3 point) {
		float arc = sin(blend * PI);
		vec2 tangent = normalize(vec2(-toPoint.y, toPoint.x) + vec2(0.0001));
		float transitionFlow =
			sin(id.baseT * TAU * 3.0 + id.cell.y * TAU + id.time * 0.24) * 0.2 * uMotion;
		point.xy += tangent * transitionFlow * arc;
		point.z += (0.3 + sin(id.baseT * TAU * 2.0 + id.cell.y * TAU) * 0.11) * arc;
	}
`,X={yaw:.16,tilt:.09,orbitX:.2,orbitY:.14};function we(e){let t=t=>(n,{time:r,centeredPointer:i,motion:a})=>{let o=i.x*a,s=i.y*a;n.rootPosition.set(t.position.x,t.position.y,0),n.rootRotation.set(0,e.settings.depthAngle+Math.sin(r*.08)*.025*a+o*X.yaw,e.settings.screenAngle+Math.sin(r*.11)*.012*a-s*X.tilt),n.cameraPosition.set(o*X.orbitX,s*X.orbitY,t.cameraDistance+Math.sin(r*.07)*.07*a),n.cameraTarget.set(t.position.x*.35,t.position.y*.35,0)},n={uMusicalDnaScroll:{value:0},uMusicalDnaArrival:{value:0}},r={width:1.48,cameraDistance:2.67,position:{x:0,y:.25}},a={width:.9,length:10.8,twistPitch:2.88,cameraDistance:4.85,position:{x:1,y:.5}};return{musical:U({title:`Musical`,uniformPrefix:`Musical`,settings:r,uniformKeys:[`width`],runtimeUniforms:n,glsl:{source:Y,sample:`sampleMusical`,departure:`departMusical`},advance({stage:e,arrival:t}){n.uMusicalDnaArrival.value=t,n.uMusicalDnaScroll.value=i([2.6,3.8],e)*.75+i([3.8,5.4],e)*1.15},bindings:[{key:`width`,label:`scale width`,min:.9,max:2.4,step:.01},{key:`cameraDistance`,label:`zoom`,min:2.2,max:6,step:.01},W],pose:t(r)}),dna:U({title:`DNA`,uniformPrefix:`Dna`,settings:a,uniformKeys:[`width`,`length`,`twistPitch`],glsl:{source:Y,sample:`sampleDna`,departure:`departDna`},bindings:[{key:`width`,label:`width`,min:.6,max:1.8,step:.01},{key:`length`,label:`length`,min:6,max:18,step:.05},{key:`twistPitch`,label:`twist pitch`,min:1.4,max:5,step:.01},{key:`cameraDistance`,label:`zoom`,min:2.6,max:6,step:.01},W],pose:t(a)})}}var Te=`
	uniform float uRipplesAges[3];
	uniform vec2 uRipplesCenters[3];

	vec2 getRipple(vec2 point, vec2 center, float age) {
		if (age <= 0.0 || age >= 2.0) return vec2(0.0);

		float impactDistance = distance(point, center);
		float rippleAttack = smoothstep(0.0, 0.22, age);
		float impactAttack = smoothstep(0.0, 0.14, age);
		float fadeOut = 1.0 - smoothstep(1.1, 2.0, age);
		float rippleTravel = age * 0.65;
		float rippleOffset = impactDistance - rippleTravel;
		float rippleEnvelope =
			exp(-abs(rippleOffset) * 11.0) * exp(-age * 0.26) * rippleAttack * fadeOut;
		float rippleWave =
			cos(rippleOffset * PI * 5.0) * rippleEnvelope * uRipplesClickStrength;
		float impactDrop =
			exp(-impactDistance * impactDistance * 72.0) *
			exp(-age * 3.0) *
			impactAttack *
			fadeOut *
			uRipplesClickStrength;

		return vec2(
			rippleWave * 0.28 - impactDrop * 0.32,
			max(rippleEnvelope * uRipplesClickStrength, impactDrop)
		);
	}

	// Short way round to the plate's angle, taken early: corrected later it spirals
	vec2 inheritRipples(vec2 incoming, vec2 natural, float blend) {
		float angleDelta = fract(natural.x - incoming.x + 0.5) - 0.5;
		float swing = smoothstep(0.0, 0.4, blend);
		return vec2(fract(incoming.x + angleDelta * swing), mix(incoming.y, natural.y, blend));
	}

	void sampleRipples(Identity id, vec2 uv, float arrival, out Sample result) {
		result = defaultSample();

		float radius = sqrt(uv.y);
		float angle = uv.x * TAU;
		float pace = id.time * uRipplesBreathSpeed;
		float particleTime = id.time * uRipplesParticleSpeed;
		float ringPhase = radius * TAU * uRipplesRingCount;
		float particlePhase = id.random.x * TAU + id.random.w * 2.7;
		float driftMask =
			smoothstep(0.08, 0.24, radius) * mix(1.0, 0.35, smoothstep(0.86, 1.0, radius));
		float freeAngle =
			angle +
			(
				sin(particleTime * 0.28 + particlePhase) * 0.014 +
				sin(particleTime * 0.11 + particlePhase * 1.7) * 0.006
			) * driftMask;
		float freeRadius = clamp(
			radius +
				(
					sin(particleTime * 0.34 + particlePhase * 1.3) * 0.006 +
					cos(particleTime * 0.19 + particlePhase * 0.7) * 0.003
				) * driftMask,
			0.0,
			1.0
		);
		float particleFloat =
			(
				sin(particleTime * 0.42 + particlePhase) +
				sin(particleTime * 0.18 + particlePhase * 1.6) * 0.45
			) * 0.006 * driftMask;

		// Phase delay per ring, not a full sine cycle, so bands stay coherent as the lift travels
		float circleCoordinate = radius * uRipplesRingCount;
		float delayedWavePhase = pace * 0.55 - circleCoordinate * 0.52;
		float primaryWave = sin(delayedWavePhase);
		float secondaryWave = sin(delayedWavePhase * 0.52 - circleCoordinate * 0.13 + 1.2);
		float radialDepth = mix(1.0, 0.62, smoothstep(0.3, 1.0, radius));
		float ringAmplitude = clamp(sqrt(24.0 / max(uRipplesRingCount, 1.0)), 0.85, 1.35);
		float waveHeight =
			(primaryWave * 0.82 + secondaryWave * 0.18) *
			uRipplesWaveDepth *
			uRipplesBreath *
			0.48 *
			ringAmplitude *
			radialDepth;

		vec2 normalizedPoint = vec2(cos(freeAngle), sin(freeAngle)) * freeRadius;
		float combinedRipple = 0.0;
		float impactEnergy = 0.0;
		for (int index = 0; index < 3; index += 1) {
			vec2 ripple = getRipple(
				normalizedPoint,
				uRipplesCenters[index],
				uRipplesAges[index]
			);
			combinedRipple += ripple.x;
			impactEnergy = max(impactEnergy, ripple.y);
		}
		combinedRipple = clamp(combinedRipple, -1.0, 1.0);
		float boundedImpactEnergy = clamp(impactEnergy, 0.0, 1.0);
		float ripplePresence = smoothstep(0.0, 1.0, boundedImpactEnergy);
		waveHeight *= 1.0 - ripplePresence * 0.22;

		float radialRingFade = mix(1.0, 0.58, smoothstep(0.18, 1.0, radius));
		float primaryRing = pow(0.5 + 0.5 * cos(ringPhase), 9.0) * radialRingFade;
		float secondaryRing =
			pow(0.5 + 0.5 * cos(ringPhase * 0.61 + 0.8), 11.0) * 0.38 * radialRingFade;
		float centerQuiet = smoothstep(0.06, 0.24, radius);
		primaryRing *= mix(0.42, 1.0, centerQuiet);
		secondaryRing *= mix(0.42, 1.0, centerQuiet);

		// No rim: rings lose contrast outward so the surface reads as continuing
		float outerFade = 1.0 - smoothstep(1.0 - uRipplesEdgeFade, 1.0, radius);
		primaryRing *= outerFade;
		secondaryRing *= outerFade;
		float surfaceEnergy = uRipplesSurfaceFill * mix(0.45, 1.0, centerQuiet);
		float energy = max(
			surfaceEnergy,
			max(max(primaryRing, secondaryRing), boundedImpactEnergy)
		);

		float diskRadius = freeRadius * uRipplesRadius;
		result.position = vec3(
			cos(freeAngle) * diskRadius,
			sin(freeAngle) * diskRadius,
			waveHeight + combinedRipple * 0.12 + particleFloat + (id.random.z - 0.5) * 0.018
		);
		result.identity = uv;
		result.energy = energy;
		result.ink = energy;
		// surfaceFill floors energy, so the dissolve has to ride alpha
		result.alphaScale = outerFade;
		result.sizeBase =
			uSharedPointScale *
			uRipplesPointScale *
			uPixelRatio *
			mix(0.72, 4.0, pow(energy, 1.12)) *
			mix(0.95, 1.06, id.random.w) *
			0.58;
		result.depthScale = vec3(5.1, 0.72, 1.85);
		result.sprite = vec4(6.2, 0.07, 0.07, 0.45);
		result.coreWeight = 0.9;
		result.alphaFloor = uRipplesSurfaceFill;
		result.inkStrength = 1.62;
	}
`,Ee=280;function De(){let e={cameraDistance:6.6,position:{x:-.15,y:.12},radius:5.2,waveDepth:.13,breath:2,breathSpeed:1.71,particleSpeed:2,ringCount:16,clickStrength:1.15,pointScale:2.1,surfaceFill:.27,edgeFade:.15,perspectiveAngle:-1},t={x:1.25,y:1.25},n=Array.from({length:3},()=>2),r=Array.from({length:6},()=>0);return U({title:`Ripples`,uniformPrefix:`Ripples`,settings:e,runtimeUniforms:{uRipplesAges:{value:n},uRipplesCenters:{value:r}},uniformKeys:[`radius`,`waveDepth`,`breath`,`breathSpeed`,`particleSpeed`,`ringCount`,`clickStrength`,`pointScale`,`surfaceFill`,`edgeFade`],glsl:{source:Te,sample:`sampleRipples`,identity:`plateIdentity`,inherit:`inheritRipples`},bindings:[{key:`radius`,label:`radius`,min:3,max:5.5,step:.01},{key:`waveDepth`,label:`wave depth`,min:.04,max:.5,step:.01},{key:`breath`,label:`breathing`,min:0,max:2,step:.01},{key:`breathSpeed`,label:`breathing speed`,min:.2,max:2,step:.01},{key:`particleSpeed`,label:`particle speed`,min:0,max:2,step:.01},{key:`ringCount`,label:`rings`,min:8,max:40,step:1},{key:`clickStrength`,label:`click ripple`,min:.2,max:2,step:.01},{key:`pointScale`,label:`point scale`,min:.7,max:2.5,step:.01},{key:`surfaceFill`,label:`surface fill`,min:.05,max:.45,step:.01},{key:`edgeFade`,label:`edge fade`,min:.02,max:.6,step:.01},{key:`perspectiveAngle`,label:`perspective angle`,min:-1.25,max:-.25,step:.01},{key:`cameraDistance`,label:`zoom`,min:4,max:8,step:.01},W],advance({delta:e,motion:t,reducedMotion:r,weight:i}){if(r||i<=.001){n.fill(2);return}for(let r=0;r<3;r+=1)n[r]<2&&(n[r]=Math.min(2,n[r]+e*t))},spawnRipples(e){for(let t=0;t<e;t+=1)setTimeout(()=>{let e=n.indexOf(2);e<0||(n[e]=0,r[e*2]=0,r[e*2+1]=0)},t*Ee)},pose(n,{time:r,centeredPointer:i,motion:a}){let o=i.y*.07*t.y*a,s=i.x*.09*t.x*a;n.rootPosition.set(e.position.x,e.position.y,0),n.rootRotation.set(e.perspectiveAngle+o,-e.perspectiveAngle*.1+s,0),n.cameraPosition.set(i.x*.06*t.x,.08+i.y*.05*t.y,e.cameraDistance+Math.sin(r*.045)*.035*a),n.cameraTarget.set(e.position.x*.25,e.position.y*.18,0)}})}var Z=()=>fe({title:`Shared motion`,uniformPrefix:`Shared`,settings:{pointScale:1.82,rotationSpeed:.3,flowSpeed:1.5,depthAngle:.4,screenAngle:.18},uniformKeys:[`pointScale`,`rotationSpeed`,`flowSpeed`],bindings:[{key:`pointScale`,label:`point scale`,min:1,max:2.8,step:.01},{key:`rotationSpeed`,label:`rotation speed`,min:0,max:.6,step:.01},{key:`flowSpeed`,label:`particle flow`,min:0,max:1.8,step:.01},{key:`depthAngle`,label:`perspective angle`,min:-.8,max:.8,step:.01},{key:`screenAngle`,label:`screen angle`,min:-.4,max:.4,step:.01}]}),Oe=`
	uniform float uWaveformTime;
	uniform float uWaveformFlow;
	uniform vec3 uWaveformPhrase;
	uniform vec3 uWaveformPacketCenters;
	uniform float uWaveformActivity;

	float waveformLobe(float value, float center, float width) {
		float distanceFromCenter = (value - center) / width;
		return exp(-distanceFromCenter * distanceFromCenter);
	}

	// The plate pressed flat, measure preserving: nobody crosses a neighbour
	vec2 identityWaveform(Identity id) {
		float radius = sqrt(id.baseT);
		float angle = plateAngleIdentity(id) * TAU;
		float plateX = clamp(cos(angle) * radius, -1.0, 1.0);
		float plateY = sin(angle) * radius;
		float chord = max(sqrt(1.0 - plateX * plateX), 0.001);
		return vec2(
			clamp(0.5 + (plateX * chord + asin(plateX)) / PI, 0.0, 1.0),
			clamp(plateY / chord, -1.0, 1.0)
		);
	}

	void sampleWaveform(Identity id, vec2 uv, float arrival, out Sample result) {
		result = defaultSample();

		float activity = uWaveformActivity * smoothstep(0.82, 1.0, arrival);
		float flowTime = uWaveformTime;
		// One belt would seam and cut the morph source, so each grain runs its own reach
		float grainReach = 0.16;
		float pace = mix(0.94, 1.06, id.random.x);
		float lifePhase = fract(id.random.z + uWaveformFlow * pace / grainReach);
		float lifeFade =
			smoothstep(0.0, 0.13, lifePhase) * (1.0 - smoothstep(0.87, 1.0, lifePhase));
		float baseFlowU =
			uv.x * (1.0 - grainReach) + grainReach * 0.5 + (lifePhase - 0.5) * grainReach;
		float densityWarp =
			sin(baseFlowU * TAU * 1.37 - flowTime * 0.11) * 0.014 +
			sin(baseFlowU * TAU * 4.73 + flowTime * 0.075 + 1.2) * 0.004;
		float flowedU = clamp(baseFlowU + densityWarp, 0.0, 1.0);
		float horizontal = flowedU * 2.0 - 1.0;

		// Not Musical's twelve-row Y allocation: it produces visible level strips
		float verticalSample = uv.y;
		float verticalSide = sign(verticalSample);
		float verticalMagnitude = abs(verticalSample);
		float centeredRandomZ = id.random.z - 0.5;
		float slowWarp =
			sin(horizontal * PI * 0.63 - flowTime * 0.13) * 0.065 +
			sin(horizontal * PI * 1.31 + flowTime * 0.09 + 1.7) * 0.025;
		float flowCoordinate = horizontal + slowWarp;
		float crowdField =
			0.5 +
			0.5 * sin(
				flowCoordinate * PI * 1.83 -
				flowTime * 0.25 +
				sin(flowCoordinate * PI * 3.71 + flowTime * 0.12) * 0.68
			);
		float crowdPocket = smoothstep(0.1, 0.9, crowdField);

		// One field drives both states; vertical identity shifts the phase so streamlines shear
		float phraseWarp =
			sin(horizontal * PI * 0.57 - flowTime * 0.19 + verticalSample * 0.34) * 0.075 +
			sin(horizontal * PI * 1.29 + flowTime * 0.11 + 1.7 - verticalSample * 0.21) * 0.032;
		float voiceCoordinate = horizontal + phraseWarp;
		float phraseLow = uWaveformPhrase.x;
		float phraseHigh = uWaveformPhrase.y;
		float phraseEmotion = uWaveformPhrase.z;
		float packetA = waveformLobe(
			voiceCoordinate,
			uWaveformPacketCenters.x,
			mix(0.22, 0.3, phraseLow)
		);
		float packetB = waveformLobe(
			voiceCoordinate,
			uWaveformPacketCenters.y,
			mix(0.2, 0.28, phraseEmotion)
		);
		float packetC = waveformLobe(
			voiceCoordinate,
			uWaveformPacketCenters.z,
			mix(0.18, 0.25, phraseHigh)
		);
		float phraseIntensity = mix(0.58, 0.92, phraseEmotion);
		float speechEnvelope =
			0.13 + max(packetA * 0.7, max(packetB, packetC * 0.84)) * 0.87 * phraseIntensity;
		float phaseWarp =
			sin(voiceCoordinate * PI * 0.83 - flowTime * 0.27 + verticalSample * 1.13) * 0.74 +
			sin(voiceCoordinate * PI * 1.67 + flowTime * 0.16 + 2.4 - verticalSample * 1.82) * 0.3;
		float lowFlow = sin(
			voiceCoordinate * PI * mix(1.15, 1.78, phraseLow) -
			flowTime * 0.43 +
			verticalSample * mix(1.05, 1.65, phraseEmotion) +
			phaseWarp * 0.62
		);
		float midFlow = sin(
			voiceCoordinate * PI * mix(2.75, 4.35, phraseEmotion) +
			flowTime * 0.67 -
			verticalSample * mix(1.7, 2.55, phraseHigh) +
			lowFlow * 0.58 +
			1.1
		);
		float highFlow = sin(
			voiceCoordinate * PI * mix(6.8, 9.7, phraseHigh) -
			flowTime * 0.96 +
			verticalSample * 3.4 +
			midFlow * 0.47 +
			2.3
		);
		float voiceFlow =
			lowFlow * mix(0.48, 0.6, phraseLow) +
			midFlow * mix(0.2, 0.3, phraseEmotion) +
			highFlow * mix(0.05, 0.11, phraseHigh);
		float turnWave = sin(
			voiceCoordinate * PI * 0.71 -
			flowTime * 0.33 +
			verticalSample * 2.45 +
			lowFlow * 0.37 +
			midFlow * 0.22
		);
		float turnResponse = 1.0 - verticalMagnitude * 0.3;
		float pulseField = clamp(0.5 + voiceFlow * 0.42, 0.0, 1.0);
		float compression =
			0.5 +
			0.5 * sin(
				voiceCoordinate * PI * 1.47 -
				flowTime * 0.41 +
				midFlow * 0.63 +
				verticalSample * 0.72
			);
		float flowHalfWidth =
			uWaveformHeight * (0.09 + compression * 0.035 + crowdPocket * 0.018);
		float activeHalfWidth = flowHalfWidth + uWaveformHeight * speechEnvelope * 0.075;

		float activeEdge = step(0.88, id.random.w);
		float activeHalo = step(0.97, id.random.z);
		float edgeBand = verticalSide * mix(0.58, 1.05, pow(verticalMagnitude, 0.72));
		float interiorBand = verticalSide * pow(verticalMagnitude, 1.08) * 0.96;
		float activeAcross = mix(interiorBand, edgeBand, activeEdge * 0.28);
		activeAcross *= mix(0.82, 1.18, compression);
		float contourScatter = centeredRandomZ * 0.16;
		float activeFiber =
			verticalSide *
			activeHalo *
			uWaveformHeight *
			(0.014 + id.random.x * 0.028) *
			(0.65 + speechEnvelope * 0.35);
		float activeDrift =
			sin(
				flowTime * (0.31 + id.random.x * 0.17) +
				voiceCoordinate * PI * 0.74 +
				id.random.z * TAU
			) *
			uWaveformHeight *
			mix(0.006, 0.009, activeEdge);
		float horizontalShear =
			sin(
				voiceCoordinate * PI * 1.37 +
				flowTime * 0.29 +
				verticalSample * 2.1 +
				phaseWarp * 0.32
			) * 0.018 +
			sin(voiceCoordinate * PI * 3.23 - flowTime * 0.41 - verticalSample * 1.45) * 0.007;
		float activeHorizontal =
			horizontal +
			horizontalShear * (0.55 + speechEnvelope * 0.45) +
			turnWave * turnResponse * 0.008;
		float activeY =
			(activeAcross + contourScatter) * activeHalfWidth +
			voiceFlow * uWaveformHeight * uWaveformActiveAmount * speechEnvelope * 0.16 +
			turnWave *
				turnResponse *
				uWaveformHeight *
				uWaveformActiveAmount *
				speechEnvelope *
				0.025 +
			activeFiber +
			activeDrift;
		float idleIntensity = mix(0.36, 0.72, uWaveformIdleAmount);
		float idleHalfWidth =
			flowHalfWidth * uWaveformIdleHeight + uWaveformHeight * speechEnvelope * 0.045;
		float idleHorizontal =
			horizontal +
			horizontalShear * (0.35 + speechEnvelope * 0.25) +
			turnWave * turnResponse * 0.008 * idleIntensity;
		float idleY =
			(activeAcross + contourScatter * 0.78) * idleHalfWidth +
			voiceFlow * uWaveformHeight * idleIntensity * speechEnvelope * 0.16 +
			turnWave * turnResponse * uWaveformHeight * idleIntensity * speechEnvelope * 0.025 +
			activeFiber * 0.65 +
			activeDrift * 0.75;
		// The ends only fade once it is a band, not while it is still a plate
		float edgeFade = mix(
			1.0,
			smoothstep(0.0, 0.035, flowedU) * (1.0 - smoothstep(0.965, 1.0, flowedU)),
			arrival
		);
		float xJitter =
			centeredRandomZ * 0.012 + sin(flowTime * 0.12 + id.random.w * TAU) * 0.006;

		float idleEnergy =
			mix(0.44, 0.84, crowdPocket) *
			mix(0.62, 1.0, id.random.z) *
			mix(1.0, 0.82, activeHalo);
		float interiorEnergy =
			mix(0.56, 0.9, crowdPocket) * mix(0.84, 1.0, 1.0 - abs(interiorBand));
		float edgeEnergy = mix(0.7, 1.0, crowdPocket) * mix(0.78, 1.0, pulseField);
		float activeEnergy =
			mix(interiorEnergy, edgeEnergy, activeEdge) * mix(1.0, 0.7, activeHalo);
		// Even field until the geometry lands, or the contours print as a ribbon
		float structure = smoothstep(0.2, 0.96, arrival);
		float energy = clamp(mix(idleEnergy, activeEnergy, activity) * edgeFade, 0.0, 1.0);
		energy = mix(0.6, energy, structure);

		float idleGrainSize = mix(1.15, 4.4, pow(id.random.w, 4.0));
		float activeGrainSize = mix(0.9, 3.55, pow(id.random.w, 2.55));
		float grainSize = mix(idleGrainSize, activeGrainSize, activity);
		float idleCoreScale = mix(0.82, 1.06, pow(energy, 0.8));
		float activeCoreScale = mix(0.86, 1.18, pow(energy, 0.68));
		float coreScale = mix(idleCoreScale, activeCoreScale, activity);

		// Shallow orbit skewed forward, locked to the travelling crests so neighbours swing together
		float driftPhase = horizontal * PI * 0.92 - flowTime * 0.66 + verticalSample * 0.24;
		float driftSwing = sin(driftPhase) * 0.74 + sin(driftPhase * 2.0 + 0.6) * 0.26;
		float driftAmount = driftSwing * 0.04 * mix(0.8, 1.15, crowdPocket) * structure;
		float driftLift =
			cos(driftPhase) * uWaveformHeight * 0.016 * mix(0.7, 1.0, crowdPocket) * structure;

		result.position = vec3(
			(mix(idleHorizontal, activeHorizontal, activity) + driftAmount) *
				uWaveformWidth *
				0.5 +
				xJitter,
			mix(idleY, activeY, activity) + driftLift,
			0.0
		);
		result.identity = vec2(uv.x, id.baseT);
		result.energy = energy;
		result.ink = energy;
		result.sizeBase =
			uSharedPointScale *
			uWaveformPointScale *
			uPixelRatio *
			grainSize *
			coreScale *
			0.58;
		result.depthScale = vec3(5.2, 0.72, 1.85);
		result.sprite = vec4(7.5, 0.035, 0.07, 0.43);
		result.coreWeight = 0.84;
		// Leaving and rejoining the river unseen
		result.alphaScale = lifeFade;
		result.alphaFloor = mix(0.14, 0.21, uWaveformActivity);
		result.inkStrength = mix(1.3, 1.5, uWaveformActivity);
	}
`;function ke(){let e={cameraDistance:5.5,position:{x:0,y:.55},width:8.2,height:3.3,idleHeight:.55,idleAmount:.85,activeAmount:1.5,idleSpeed:.25,activeSpeed:.95,pointScale:2},r=new Float32Array(3),i=new Float32Array(3),a={uWaveformTime:{value:0},uWaveformFlow:{value:0},uWaveformPhrase:{value:r},uWaveformPacketCenters:{value:i},uWaveformActivity:{value:0}},o=0,s=0,c=0,l=0;function u(e){o=Math.min(1,Math.max(0,e))}return U({title:`Waveform`,uniformPrefix:`Waveform`,settings:e,runtimeUniforms:a,uniformKeys:[`width`,`height`,`idleHeight`,`idleAmount`,`activeAmount`,`pointScale`],glsl:{source:Oe,sample:`sampleWaveform`,identity:`identityWaveform`},bindings:[{key:`width`,label:`width`,min:5,max:10,step:.01},{key:`height`,label:`height`,min:.8,max:4,step:.01},{key:`idleHeight`,label:`idle height`,min:.45,max:1,step:.01},{key:`idleAmount`,label:`idle movement`,min:.05,max:1,step:.01},{key:`activeAmount`,label:`active movement`,min:.4,max:1.6,step:.01},{key:`idleSpeed`,label:`idle speed`,min:.05,max:1,step:.01},{key:`activeSpeed`,label:`active speed`,min:.2,max:2,step:.01},{key:`pointScale`,label:`point scale`,min:.7,max:2.5,step:.01},{key:`cameraDistance`,label:`zoom`,min:3.5,max:7,step:.01},W],actions:[{label:`play / pause simulation`,onClick:()=>u(o>=.5?0:1)}],advance({delta:u,reducedMotion:d,presence:f,arrival:p}){d?s=0:s!==o&&(s=t(s,o,o>s?4.2:2.4,u));let m=n(p),h=e.idleSpeed+(e.activeSpeed-e.idleSpeed)*s;if(c+=u*h*m*+!d,l+=u*h*.055*m*!d,a.uWaveformFlow.value=l,a.uWaveformTime.value=c,f<=0)return;let g=.5+.5*Math.sin(c*.24+Math.sin(c*.071)*1.15),_=.5+.5*Math.sin(c*.37+1.9+Math.sin(c*.11)*.72),v=.5+.5*Math.sin(c*.17+4.1+g*.9);r[0]=g,r[1]=_,r[2]=v,i[0]=-.58+Math.sin(c*.17+g)*.09,i[1]=.01+Math.sin(c*.13+v*1.7)*.1,i[2]=.57+Math.sin(c*.21+3.1+_)*.085,a.uWaveformActivity.value=n(s)},pose(t){t.rootPosition.set(e.position.x,e.position.y,0),t.rootRotation.set(0,0,0),t.cameraPosition.set(0,0,e.cameraDistance),t.cameraTarget.set(e.position.x*.22,e.position.y*.2,0)},setActivity:u})}function Ae(){let e=Z(),t=we(e);return{shared:e,shapes:{orb:ve(),clarity:pe(),musical:t.musical,dna:t.dna,cymatics:ge(),waveform:ke(),freeFlow:be(),ripples:De(),void:Ce()}}}function Q(e,t={}){let n=(e,n)=>{t[e]?t[e].value=n:t[e]={value:n}};for(let t of e){t.refresh?.();for(let e of t.uniformKeys){let r=t.settings[e];if(typeof r!=`number`)throw Error(`${t.title}: uniform setting "${e}" must be a number`);n(`u${t.uniformPrefix}${e[0].toUpperCase()}${e.slice(1)}`,r)}for(let[e,r]of Object.entries(t.derived?.()??{}))n(e,r)}return t}var je={full:62500,constrained:3e4},$=(e,t)=>({title:e,values:t,bindings:[{key:`transition`,label:`transition (s)`,min:.4,max:4,step:.05},{key:`stagger`,label:`particle stagger`,min:0,max:1,step:.01},{key:`drift`,label:`morph drift`,min:0,max:1,step:.01}],apply:()=>void 0}),Me=class{cameraPose={position:new c(0,0,5.4),target:new c};root=new s;camera;geometry;mesh;program;registry=Ae();order;groups;settingUniforms;spring={value:0,velocity:0};target=0;progress=0;landed=!1;awake=1;waking=!1;audioLevel=0;audioTarget=0;breathPhase=0;agitation=0;agitationTarget=0;pace={transition:1.4,stagger:.18,drift:.22};returnPace={transition:2.8,stagger:.45,drift:.38};orbPace={transition:2.4,stagger:.4,drift:.34};paceNow=this.pace;timeline={fromIndex:0,toIndex:0,blend:0};blendRaw=0;poseFrom=H();poseTo=H();rootPosition=new c;rootRotation=new c;pointerPlane={active:!1,x:0,y:0};pointerRaycast=new ce;pointerNdc=[0,0];pointerInverseWorld=new l;pointerPlaneGeometry={origin:new c,normal:new c(0,0,1)};shapeFrame;constructor({gl:e,camera:t,root:n,quality:r},i){this.camera=t,this.root.setParent(n),this.order=i.flat().map(e=>{let t=this.registry.shapes[e];if(!t)throw Error(`scene: no shape named "${e}"`);return t}),this.groups=[...this.order.flatMap(e=>[e,...e.extraGroups??[]]),this.registry.shared];let s=je[r],c=new Float32Array(s*3),l=new Float32Array(s*4),f=1831565813,p=()=>(f=Math.imul(f,1664525)+1013904223,(f>>>0)/4294967296),m=Math.ceil(s/12);for(let e=0;e<s;e+=1){let t=e*3,n=e*4;c[t]=(Math.floor(e/12)+p())/m,c[t+1]=(e%12+p())/12,c[t+2]=p(),l[n]=p(),l[n+1]=p(),l[n+2]=p(),l[n+3]=p()}this.geometry=new a(e,{position:{size:3,data:c},aRandom:{size:4,data:l}}),this.settingUniforms=Q(this.groups);let{vertex:h,fragment:g}=ue(this.order,this.settingUniforms);this.program=new o(e,{vertex:h,fragment:g,transparent:!0,depthTest:!1,depthWrite:!1,cullFace:null,uniforms:{uFromShape:{value:0},uToShape:{value:0},uBlend:{value:0},uStagger:{value:0},uMorphDrift:{value:0},uTime:{value:0},uMotion:{value:1},uBreath:{value:0},uPulse:{value:0},uPixelRatio:{value:1},uVisibility:{value:1},uFlowPhase:{value:0},uColor:{value:d},...this.settingUniforms,...Object.assign({},...this.order.map(e=>e.runtimeUniforms??{}))}}),this.program.setBlendFunc(e.SRC_ALPHA,e.ONE),this.mesh=new u(e,{geometry:this.geometry,program:this.program,mode:e.POINTS,frustumCulled:!1}),this.mesh.setParent(this.root),this.shapeFrame={time:0,delta:0,pointer:{x:0,y:0},centeredPointer:{x:0,y:0},pointerActive:!1,reducedMotion:!1,aspect:1,tempo:1,motion:1,weight:0,presence:0,arrival:0,stage:0,awake:1,pointerPlane:this.pointerPlane}}resize({pixelRatio:e}){this.program.uniforms.uPixelRatio.value=e}fold(e){let t=this.order.length;return(e%t+t)%t}setProgress(e){this.progress=this.fold(e)}snapProgress(e){this.progress=this.fold(e),this.spring.value=this.progress,this.spring.velocity=0}setAudioLevel(e){this.audioTarget=Math.min(1,Math.max(0,e))}setAgitation(e){this.agitationTarget=Math.min(1,Math.max(0,e))}holdIntro(){this.awake=0}enter(){this.waking=!0}update(e){let t=+!e.reducedMotion;this.program.uniforms.uTime.value=e.time,this.program.uniforms.uMotion.value=t;let i=this.order.length,a=this.spring;if(this.target=this.progress+i*Math.round((a.value-this.progress)/i),this.landed||(this.landed=!0,a.value=this.target),i>1&&this.blendRaw===0){let e=this.fold(this.target);this.paceNow=e>=i-1?this.returnPace:e<=1?this.orbPace:this.pace}let o=this.paceNow;if(e.reducedMotion)a.value=this.target,a.velocity=0;else{let t=this.target-a.value,n=Math.abs(t)>1.25?a.value+Math.sign(t)*1.25:this.target;r(a,n,o.transition,e.delta),Math.abs(this.target-a.value)<.001&&Math.abs(a.velocity)<.01&&(a.value=this.target,a.velocity=0)}let s=this.fold(a.value),c=Math.floor(s),l=s-c;this.timeline.fromIndex=c,this.timeline.toIndex=l>0?(c+1)%i:c,this.shapeFrame.stage=s,this.blendRaw=l;let u=Math.min(1,Math.max(0,l*(1+o.stagger)-o.stagger*.5));this.timeline.blend=l>0?n(u):0,this.waking&&this.awake<1&&(this.awake=e.reducedMotion?1:Math.min(1,this.awake+e.delta/2.5));let d=this.awake,f=d<.5?4*d**3:1-4*(1-d)**3;this.shapeFrame.awake=f+(d*(2-d)-f)*.12,this.program.uniforms.uFromShape.value=this.timeline.fromIndex,this.program.uniforms.uToShape.value=this.timeline.toIndex,this.program.uniforms.uBlend.value=l,this.program.uniforms.uStagger.value=o.stagger,this.program.uniforms.uMorphDrift.value=o.drift;let p=this.audioTarget>this.audioLevel?2:1.2;this.audioLevel+=(this.audioTarget-this.audioLevel)*(1-Math.exp(-e.delta*p)),this.agitation+=(this.agitationTarget-this.agitation)*(1-Math.exp(-e.delta*3));let m=.12+this.agitation*.8;this.breathPhase=(this.breathPhase+e.delta*m)%1;let h=.6+this.agitation*.4,g=Math.sin(this.breathPhase*Math.PI*2)*h*this.audioLevel*t;this.program.uniforms.uBreath.value=g,this.program.uniforms.uPulse.value=((this.agitation-.5)*.05+g*.02)*t;let _=this.shapeFrame;_.time=e.time,_.delta=e.delta*e.tempo,_.tempo=e.tempo,_.pointer=e.pointer,_.centeredPointer=e.centeredPointer,_.pointerActive=e.pointerActive,_.reducedMotion=e.reducedMotion,_.aspect=e.aspect,_.motion=t,this.updatePointerPlane(e);for(let e=0;e<this.order.length;e+=1){let t=this.order[e];t.advance&&(this.applyStage(e),t.advance(_))}this.applyPoses(_)}updatePointerPlane(e){let{fromIndex:t,toIndex:n,blend:r}=this.timeline;if(!(this.order[t].usesPointerPlane||r>0&&this.order[n].usesPointerPlane)||!e.pointerActive||e.reducedMotion){this.pointerPlane.active=!1;return}this.projectPointer(e.centeredPointer)}projectPointer(e){this.pointerNdc[0]=e.x,this.pointerNdc[1]=e.y,this.pointerRaycast.castMouse(this.camera,this.pointerNdc),this.pointerPlaneGeometry.origin.set(0,0,0).applyMatrix4(this.root.worldMatrix),this.pointerPlaneGeometry.normal.set(0,0,1).transformDirection(this.root.worldMatrix);let t=this.pointerRaycast.intersectPlane(this.pointerPlaneGeometry);if(!t){this.pointerPlane.active=!1;return}this.pointerInverseWorld.inverse(this.root.worldMatrix),t.applyMatrix4(this.pointerInverseWorld),this.pointerPlane.active=!0,this.pointerPlane.x=t.x,this.pointerPlane.y=t.y}applyStage(e){let{fromIndex:t,toIndex:n,blend:r}=this.timeline,i=e===t?1-r:e===n?r:0;this.shapeFrame.weight=i,this.shapeFrame.presence=e===n&&e!==t?1:i,this.shapeFrame.arrival=e===n&&e!==t?r:+(e<=t)}applyPoses(e){let{fromIndex:t,toIndex:n,blend:r}=this.timeline;this.applyStage(t),this.order[t].pose(this.poseFrom,e),r>0?(this.applyStage(n),this.order[n].pose(this.poseTo,e),this.rootPosition.copy(this.poseFrom.rootPosition).lerp(this.poseTo.rootPosition,r),this.rootRotation.copy(this.poseFrom.rootRotation).lerp(this.poseTo.rootRotation,r),this.cameraPose.position.copy(this.poseFrom.cameraPosition).lerp(this.poseTo.cameraPosition,r),this.cameraPose.target.copy(this.poseFrom.cameraTarget).lerp(this.poseTo.cameraTarget,r)):(this.rootPosition.copy(this.poseFrom.rootPosition),this.rootRotation.copy(this.poseFrom.rootRotation),this.cameraPose.position.copy(this.poseFrom.cameraPosition),this.cameraPose.target.copy(this.poseFrom.cameraTarget)),this.root.position.x=this.rootPosition.x,this.root.position.y=this.rootPosition.y,this.root.rotation.x=this.rootRotation.x,this.root.rotation.y=this.rootRotation.y,this.root.rotation.z=this.rootRotation.z}setVisibility(e){let t=Math.min(1,Math.max(0,e));this.program.uniforms.uVisibility.value=t,this.mesh.visible=t>.001}setWaveformActivity(e){this.registry.shapes.waveform.setActivity?.(e)}spawnRipples(e){this.registry.shapes.ripples.spawnRipples?.(e)}getDebugGroups(){return[$(`Timeline`,this.pace),$(`Timeline (return)`,this.returnPace),...this.groups.map(e=>({title:e.title,values:e.settings,bindings:e.bindings,actions:e.actions,apply:this.applySettings}))]}applySettings=()=>{Q(this.groups,this.settingUniforms)};destroy(){this.root.setParent(null),this.geometry.remove(),this.program.remove()}},Ne=e=>t=>new Me(t,e);export{Ne as createScene};