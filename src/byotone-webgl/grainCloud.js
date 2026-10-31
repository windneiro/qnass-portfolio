import{a as e,i as t,o as n}from"./Mesh.js";var r=new n,i=1,a=class{constructor({canvas:e=document.createElement(`canvas`),width:t=300,height:n=150,dpr:r=1,alpha:a=!1,depth:o=!0,stencil:s=!1,antialias:c=!1,premultipliedAlpha:l=!1,preserveDrawingBuffer:u=!1,powerPreference:d=`default`,autoClear:f=!0,webgl:p=2}={}){let m={alpha:a,depth:o,stencil:s,antialias:c,premultipliedAlpha:l,preserveDrawingBuffer:u,powerPreference:d};this.dpr=r,this.alpha=a,this.color=!0,this.depth=o,this.stencil=s,this.premultipliedAlpha=l,this.autoClear=f,this.id=i++,p===2&&(this.gl=e.getContext(`webgl2`,m)),this.isWebgl2=!!this.gl,this.gl||=e.getContext(`webgl`,m),this.gl||console.error(`unable to create webgl context`),this.gl.renderer=this,this.setSize(t,n),this.state={},this.state.blendFunc={src:this.gl.ONE,dst:this.gl.ZERO},this.state.blendEquation={modeRGB:this.gl.FUNC_ADD},this.state.cullFace=!1,this.state.frontFace=this.gl.CCW,this.state.depthMask=!0,this.state.depthFunc=this.gl.LEQUAL,this.state.premultiplyAlpha=!1,this.state.flipY=!1,this.state.unpackAlignment=4,this.state.framebuffer=null,this.state.viewport={x:0,y:0,width:null,height:null},this.state.textureUnits=[],this.state.activeTextureUnit=0,this.state.boundBuffer=null,this.state.uniformLocations=new Map,this.state.currentProgram=null,this.extensions={},this.isWebgl2?(this.getExtension(`EXT_color_buffer_float`),this.getExtension(`OES_texture_float_linear`)):(this.getExtension(`OES_texture_float`),this.getExtension(`OES_texture_float_linear`),this.getExtension(`OES_texture_half_float`),this.getExtension(`OES_texture_half_float_linear`),this.getExtension(`OES_element_index_uint`),this.getExtension(`OES_standard_derivatives`),this.getExtension(`EXT_sRGB`),this.getExtension(`WEBGL_depth_texture`),this.getExtension(`WEBGL_draw_buffers`)),this.getExtension(`WEBGL_compressed_texture_astc`),this.getExtension(`EXT_texture_compression_bptc`),this.getExtension(`WEBGL_compressed_texture_s3tc`),this.getExtension(`WEBGL_compressed_texture_etc1`),this.getExtension(`WEBGL_compressed_texture_pvrtc`),this.getExtension(`WEBKIT_WEBGL_compressed_texture_pvrtc`),this.vertexAttribDivisor=this.getExtension(`ANGLE_instanced_arrays`,`vertexAttribDivisor`,`vertexAttribDivisorANGLE`),this.drawArraysInstanced=this.getExtension(`ANGLE_instanced_arrays`,`drawArraysInstanced`,`drawArraysInstancedANGLE`),this.drawElementsInstanced=this.getExtension(`ANGLE_instanced_arrays`,`drawElementsInstanced`,`drawElementsInstancedANGLE`),this.createVertexArray=this.getExtension(`OES_vertex_array_object`,`createVertexArray`,`createVertexArrayOES`),this.bindVertexArray=this.getExtension(`OES_vertex_array_object`,`bindVertexArray`,`bindVertexArrayOES`),this.deleteVertexArray=this.getExtension(`OES_vertex_array_object`,`deleteVertexArray`,`deleteVertexArrayOES`),this.drawBuffers=this.getExtension(`WEBGL_draw_buffers`,`drawBuffers`,`drawBuffersWEBGL`),this.parameters={},this.parameters.maxTextureUnits=this.gl.getParameter(this.gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS),this.parameters.maxAnisotropy=this.getExtension(`EXT_texture_filter_anisotropic`)?this.gl.getParameter(this.getExtension(`EXT_texture_filter_anisotropic`).MAX_TEXTURE_MAX_ANISOTROPY_EXT):0}setSize(e,t){this.width=e,this.height=t,this.gl.canvas.width=e*this.dpr,this.gl.canvas.height=t*this.dpr,this.gl.canvas.style&&Object.assign(this.gl.canvas.style,{width:e+`px`,height:t+`px`})}setViewport(e,t,n=0,r=0){(this.state.viewport.width!==e||this.state.viewport.height!==t)&&(this.state.viewport.width=e,this.state.viewport.height=t,this.state.viewport.x=n,this.state.viewport.y=r,this.gl.viewport(n,r,e,t))}setScissor(e,t,n=0,r=0){this.gl.scissor(n,r,e,t)}enable(e){this.state[e]!==!0&&(this.gl.enable(e),this.state[e]=!0)}disable(e){this.state[e]!==!1&&(this.gl.disable(e),this.state[e]=!1)}setBlendFunc(e,t,n,r){(this.state.blendFunc.src!==e||this.state.blendFunc.dst!==t||this.state.blendFunc.srcAlpha!==n||this.state.blendFunc.dstAlpha!==r)&&(this.state.blendFunc.src=e,this.state.blendFunc.dst=t,this.state.blendFunc.srcAlpha=n,this.state.blendFunc.dstAlpha=r,n===void 0?this.gl.blendFunc(e,t):this.gl.blendFuncSeparate(e,t,n,r))}setBlendEquation(e,t){e||=this.gl.FUNC_ADD,(this.state.blendEquation.modeRGB!==e||this.state.blendEquation.modeAlpha!==t)&&(this.state.blendEquation.modeRGB=e,this.state.blendEquation.modeAlpha=t,t===void 0?this.gl.blendEquation(e):this.gl.blendEquationSeparate(e,t))}setCullFace(e){this.state.cullFace!==e&&(this.state.cullFace=e,this.gl.cullFace(e))}setFrontFace(e){this.state.frontFace!==e&&(this.state.frontFace=e,this.gl.frontFace(e))}setDepthMask(e){this.state.depthMask!==e&&(this.state.depthMask=e,this.gl.depthMask(e))}setDepthFunc(e){this.state.depthFunc!==e&&(this.state.depthFunc=e,this.gl.depthFunc(e))}setStencilMask(e){this.state.stencilMask!==e&&(this.state.stencilMask=e,this.gl.stencilMask(e))}setStencilFunc(e,t,n){(this.state.stencilFunc!==e||this.state.stencilRef!==t||this.state.stencilFuncMask!==n)&&(this.state.stencilFunc=e||this.gl.ALWAYS,this.state.stencilRef=t||0,this.state.stencilFuncMask=n||0,this.gl.stencilFunc(e||this.gl.ALWAYS,t||0,n||0))}setStencilOp(e,t,n){(this.state.stencilFail!==e||this.state.stencilDepthFail!==t||this.state.stencilDepthPass!==n)&&(this.state.stencilFail=e,this.state.stencilDepthFail=t,this.state.stencilDepthPass=n,this.gl.stencilOp(e,t,n))}activeTexture(e){this.state.activeTextureUnit!==e&&(this.state.activeTextureUnit=e,this.gl.activeTexture(this.gl.TEXTURE0+e))}bindFramebuffer({target:e=this.gl.FRAMEBUFFER,buffer:t=null}={}){this.state.framebuffer!==t&&(this.state.framebuffer=t,this.gl.bindFramebuffer(e,t))}getExtension(e,t,n){return t&&this.gl[t]?this.gl[t].bind(this.gl):(this.extensions[e]||(this.extensions[e]=this.gl.getExtension(e)),t?this.extensions[e]?this.extensions[e][n].bind(this.extensions[e]):null:this.extensions[e])}sortOpaque(e,t){return e.renderOrder===t.renderOrder?e.program.id===t.program.id?e.zDepth===t.zDepth?t.id-e.id:e.zDepth-t.zDepth:e.program.id-t.program.id:e.renderOrder-t.renderOrder}sortTransparent(e,t){return e.renderOrder===t.renderOrder?e.zDepth===t.zDepth?t.id-e.id:t.zDepth-e.zDepth:e.renderOrder-t.renderOrder}sortUI(e,t){return e.renderOrder===t.renderOrder?e.program.id===t.program.id?t.id-e.id:e.program.id-t.program.id:e.renderOrder-t.renderOrder}getRenderList({scene:e,camera:t,frustumCull:n,sort:i}){let a=[];if(t&&n&&t.updateFrustum(),e.traverse(e=>{if(!e.visible)return!0;e.draw&&(n&&e.frustumCulled&&t&&!t.frustumIntersectsMesh(e)||a.push(e))}),i){let e=[],n=[],i=[];a.forEach(a=>{a.program.transparent?a.program.depthTest?n.push(a):i.push(a):e.push(a),a.zDepth=0,a.renderOrder===0&&a.program.depthTest&&t&&(a.worldMatrix.getTranslation(r),r.applyMatrix4(t.projectionViewMatrix),a.zDepth=r.z)}),e.sort(this.sortOpaque),n.sort(this.sortTransparent),i.sort(this.sortUI),a=e.concat(n,i)}return a}render({scene:e,camera:t,target:n=null,update:r=!0,sort:i=!0,frustumCull:a=!0,clear:o}){n===null?(this.bindFramebuffer(),this.setViewport(this.width*this.dpr,this.height*this.dpr)):(this.bindFramebuffer(n),this.setViewport(n.width,n.height)),(o||this.autoClear&&o!==!1)&&(this.depth&&(!n||n.depth)&&(this.enable(this.gl.DEPTH_TEST),this.setDepthMask(!0)),(this.stencil||!n||n.stencil)&&(this.enable(this.gl.STENCIL_TEST),this.setStencilMask(255)),this.gl.clear((this.color?this.gl.COLOR_BUFFER_BIT:0)|(this.depth?this.gl.DEPTH_BUFFER_BIT:0)|(this.stencil?this.gl.STENCIL_BUFFER_BIT:0))),r&&e.updateMatrixWorld(),t&&t.updateMatrixWorld(),this.getRenderList({scene:e,camera:t,frustumCull:a,sort:i}).forEach(e=>{e.draw({camera:t})})}},o=new Uint8Array(4);function s(e){return!(e&e-1)}var c=1,l=class{constructor(e,{image:t,target:n=e.TEXTURE_2D,type:r=e.UNSIGNED_BYTE,format:i=e.RGBA,internalFormat:a=i,wrapS:o=e.CLAMP_TO_EDGE,wrapT:s=e.CLAMP_TO_EDGE,wrapR:l=e.CLAMP_TO_EDGE,generateMipmaps:u=n===(e.TEXTURE_2D||e.TEXTURE_CUBE_MAP),minFilter:d=u?e.NEAREST_MIPMAP_LINEAR:e.LINEAR,magFilter:f=e.LINEAR,premultiplyAlpha:p=!1,unpackAlignment:m=4,flipY:h=n==(e.TEXTURE_2D||e.TEXTURE_3D),anisotropy:g=0,level:_=0,width:v,height:y=v,length:b=1}={}){this.gl=e,this.id=c++,this.image=t,this.target=n,this.type=r,this.format=i,this.internalFormat=a,this.minFilter=d,this.magFilter=f,this.wrapS=o,this.wrapT=s,this.wrapR=l,this.generateMipmaps=u,this.premultiplyAlpha=p,this.unpackAlignment=m,this.flipY=h,this.anisotropy=Math.min(g,this.gl.renderer.parameters.maxAnisotropy),this.level=_,this.width=v,this.height=y,this.length=b,this.texture=this.gl.createTexture(),this.store={image:null},this.glState=this.gl.renderer.state,this.state={},this.state.minFilter=this.gl.NEAREST_MIPMAP_LINEAR,this.state.magFilter=this.gl.LINEAR,this.state.wrapS=this.gl.REPEAT,this.state.wrapT=this.gl.REPEAT,this.state.anisotropy=0}bind(){this.glState.textureUnits[this.glState.activeTextureUnit]!==this.id&&(this.gl.bindTexture(this.target,this.texture),this.glState.textureUnits[this.glState.activeTextureUnit]=this.id)}update(e=0){let t=!(this.image===this.store.image&&!this.needsUpdate);if((t||this.glState.textureUnits[e]!==this.id)&&(this.gl.renderer.activeTexture(e),this.bind()),t){if(this.needsUpdate=!1,this.flipY!==this.glState.flipY&&(this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL,this.flipY),this.glState.flipY=this.flipY),this.premultiplyAlpha!==this.glState.premultiplyAlpha&&(this.gl.pixelStorei(this.gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,this.premultiplyAlpha),this.glState.premultiplyAlpha=this.premultiplyAlpha),this.unpackAlignment!==this.glState.unpackAlignment&&(this.gl.pixelStorei(this.gl.UNPACK_ALIGNMENT,this.unpackAlignment),this.glState.unpackAlignment=this.unpackAlignment),this.minFilter!==this.state.minFilter&&(this.gl.texParameteri(this.target,this.gl.TEXTURE_MIN_FILTER,this.minFilter),this.state.minFilter=this.minFilter),this.magFilter!==this.state.magFilter&&(this.gl.texParameteri(this.target,this.gl.TEXTURE_MAG_FILTER,this.magFilter),this.state.magFilter=this.magFilter),this.wrapS!==this.state.wrapS&&(this.gl.texParameteri(this.target,this.gl.TEXTURE_WRAP_S,this.wrapS),this.state.wrapS=this.wrapS),this.wrapT!==this.state.wrapT&&(this.gl.texParameteri(this.target,this.gl.TEXTURE_WRAP_T,this.wrapT),this.state.wrapT=this.wrapT),this.wrapR!==this.state.wrapR&&(this.gl.texParameteri(this.target,this.gl.TEXTURE_WRAP_R,this.wrapR),this.state.wrapR=this.wrapR),this.anisotropy&&this.anisotropy!==this.state.anisotropy&&(this.gl.texParameterf(this.target,this.gl.renderer.getExtension(`EXT_texture_filter_anisotropic`).TEXTURE_MAX_ANISOTROPY_EXT,this.anisotropy),this.state.anisotropy=this.anisotropy),this.image){if(this.image.width&&(this.width=this.image.width,this.height=this.image.height),this.target===this.gl.TEXTURE_CUBE_MAP)for(let e=0;e<6;e++)this.gl.texImage2D(this.gl.TEXTURE_CUBE_MAP_POSITIVE_X+e,this.level,this.internalFormat,this.format,this.type,this.image[e]);else if(ArrayBuffer.isView(this.image))this.target===this.gl.TEXTURE_2D?this.gl.texImage2D(this.target,this.level,this.internalFormat,this.width,this.height,0,this.format,this.type,this.image):(this.target===this.gl.TEXTURE_2D_ARRAY||this.target===this.gl.TEXTURE_3D)&&this.gl.texImage3D(this.target,this.level,this.internalFormat,this.width,this.height,this.length,0,this.format,this.type,this.image);else if(this.image.isCompressedTexture)for(let e=0;e<this.image.length;e++)this.gl.compressedTexImage2D(this.target,e,this.internalFormat,this.image[e].width,this.image[e].height,0,this.image[e].data);else this.target===this.gl.TEXTURE_2D?this.gl.texImage2D(this.target,this.level,this.internalFormat,this.format,this.type,this.image):this.gl.texImage3D(this.target,this.level,this.internalFormat,this.width,this.height,this.length,0,this.format,this.type,this.image);this.generateMipmaps&&(!this.gl.renderer.isWebgl2&&(!s(this.image.width)||!s(this.image.height))?(this.generateMipmaps=!1,this.wrapS=this.wrapT=this.gl.CLAMP_TO_EDGE,this.minFilter=this.gl.LINEAR):this.gl.generateMipmap(this.target)),this.onUpdate&&this.onUpdate()}else if(this.target===this.gl.TEXTURE_CUBE_MAP)for(let e=0;e<6;e++)this.gl.texImage2D(this.gl.TEXTURE_CUBE_MAP_POSITIVE_X+e,0,this.gl.RGBA,1,1,0,this.gl.RGBA,this.gl.UNSIGNED_BYTE,o);else this.width?this.target===this.gl.TEXTURE_2D?this.gl.texImage2D(this.target,this.level,this.internalFormat,this.width,this.height,0,this.format,this.type,null):this.gl.texImage3D(this.target,this.level,this.internalFormat,this.width,this.height,this.length,0,this.format,this.type,null):this.gl.texImage2D(this.target,0,this.gl.RGBA,1,1,0,this.gl.RGBA,this.gl.UNSIGNED_BYTE,o);this.store.image=this.image}}},u=`
	precision highp float;

	// Grid cell, 0…1 across the frame
	attribute vec2 position;
	// Four random 0…1 per grain
	attribute vec4 seed;

	uniform sampler2D uMap;
	// Cover crop of the video, cloud size taking its slack
	uniform vec2 uCover;
	// Pan of the crop within the cover slack
	uniform vec2 uOffset;
	uniform vec2 uFrame;
	uniform vec2 uCell;
	uniform vec2 uPointer;
	uniform vec3 uShadow;
	uniform vec3 uLight;
	uniform float uReveal;
	uniform float uGather;
	uniform float uSide;
	uniform float uShift;
	// 1 dissolves the base into the ground, 0 keeps the full picture
	uniform float uGround;
	uniform float uTime;
	// Exposure on the ink, tones untouched
	uniform float uBrightness;
	// Soft knee above the mids: 0 raw, 1 flattened to the knee
	uniform float uHighlights;
	// Bias on the per-grain threshold
	uniform float uDensity;
	uniform float uScale;
	// 0 freezes drift, parallax and shimmer
	uniform float uMotion;
	// Device pixels per grid cell
	uniform float uPointSpan;

	varying vec3 vColor;
	varying float vAlpha;

	float lumaAt(vec2 cell) {
		return dot(texture2D(uMap, (cell - 0.5) * uCover + 0.5 + uOffset).rgb, vec3(0.299, 0.587, 0.114));
	}

	void main() {
		// Scattered off-grid, drifting slowly
		vec2 drift = vec2(sin(uTime * 0.35 + seed.x * 6.2831), cos(uTime * 0.3 + seed.y * 6.2831));
		vec2 cell = position + (seed.xy - 0.5) * uCell * 1.3 + drift * uCell * 0.08 * uMotion;

		// Midtones lifted hard: the footage is dark
		float level = pow(smoothstep(0.03, 0.6, lumaAt(cell)), 0.85);

		// Brightness is depth, parallaxed around the mid
		float depth = level * 0.4 - 0.2;
		float push = 1.0 - depth * 0.3;
		vec2 eye = vec2(sin(uTime * 0.13), cos(uTime * 0.11)) * 0.02 * uMotion + uPointer * 0.035;
		vec2 point = (cell * 2.0 - 1.0 - eye * depth) / push;

		// Grains settle in on their own beat, along the scroll's direction
		float gather = smoothstep(0.0, 1.0, uGather * 1.7 - seed.z * 0.7);
		point.y += uSide * (1.0 - gather) * (0.1 + seed.z * 0.14);
		point.x += sin(seed.w * 6.2831 + uTime * 0.3) * (1.0 - gather) * 0.04;

		// The base dissolves into the ground so the copy reads
		float ground = (1.0 - smoothstep(-0.9, 0.05, point.y + seed.z * 0.2)) * uGround;
		float settle = 1.0 - ground * 0.92;

		// Density and size follow a knee'd level: highlights sit closer to the mids
		float lit = level - max(level - 0.55, 0.0) * uHighlights;

		// Per-grain threshold: shadow stays sparse dust
		float grain = smoothstep(seed.y - 0.08, seed.y + 0.08, lit * 0.9 + uDensity - ground * 0.4);

		// Scatter can push a grain off the picture, where the texture smears its edge pixel
		vec2 inside = smoothstep(0.0, 0.03, cell) * smoothstep(0.0, 0.03, 1.0 - cell);

		gl_Position = vec4(point * uFrame + vec2(0.0, uShift), 0.0, 1.0);
		gl_PointSize = uPointSpan * uScale
			* mix(0.6, 1.75, lit) * mix(0.6, 1.3, seed.w)
			* (0.5 + 0.5 * gather) * mix(1.0, 0.7, ground) / push;

		// Same ink ramp as the morphing field
		vColor = mix(uShadow, uLight, pow(level, 1.1) * settle) * uBrightness;
		float shimmer = 1.0 - 0.06 * uMotion * (0.5 + 0.5 * sin(uTime * 1.2 + seed.z * 6.2831));
		vAlpha = uReveal * (0.16 + level) * shimmer * mix(0.35, 1.0, gather) * grain * settle
			* inside.x * inside.y;
	}
`,d=`
	precision highp float;

	varying vec3 vColor;
	varying float vAlpha;

	void main() {
		vec2 centered = gl_PointCoord - 0.5;
		float radiusSquared = dot(centered, centered) * 4.0;
		if (radiusSquared > 1.0) discard;

		// Soft halo + small core, the field's sprite language
		float coverage = exp(-radiusSquared * 3.2) * 0.5
			+ (1.0 - smoothstep(0.18, 0.62, sqrt(radiusSquared))) * 0.5;
		gl_FragColor = vec4(vColor, coverage * vAlpha);
	}
`,f={brightness:.75,highlights:.6,density:.12,scale:1,motion:1},p=[.86,.85,.83];function m(t,n,r){let i=n*r,a=new Float32Array(i*2),o=new Float32Array(i*4);for(let e=0;e<i;e++)a[e*2]=(e%n+.5)/n,a[e*2+1]=(Math.floor(e/n)+.5)/r;for(let e=0;e<o.length;e++)o[e]=Math.random();return new e(t,{position:{size:2,data:a},seed:{size:4,data:o}})}function h(e){let n=new l(e,{generateMipmaps:!1,minFilter:e.LINEAR,magFilter:e.LINEAR});return{texture:n,program:new t(e,{vertex:u,fragment:d,transparent:!0,depthTest:!1,depthWrite:!1,cullFace:null,uniforms:{uMap:{value:n},uCover:{value:new Float32Array([1,1])},uOffset:{value:new Float32Array([0,0])},uFrame:{value:new Float32Array([1,1])},uCell:{value:new Float32Array([0,0])},uPointer:{value:new Float32Array([0,0])},uShadow:{value:new Float32Array(3)},uLight:{value:new Float32Array(p)},uReveal:{value:1},uGather:{value:1},uSide:{value:1},uShift:{value:0},uGround:{value:0},uTime:{value:0},uBrightness:{value:f.brightness},uHighlights:{value:f.highlights},uDensity:{value:f.density},uScale:{value:f.scale},uMotion:{value:f.motion},uPointSpan:{value:6}}})}}function g(e,t){e.uniforms.uBrightness.value=t.brightness,e.uniforms.uHighlights.value=t.highlights,e.uniforms.uDensity.value=t.density,e.uniforms.uScale.value=t.scale,e.uniforms.uMotion.value=t.motion}export{l as a,m as i,g as n,a as o,h as r,f as t};