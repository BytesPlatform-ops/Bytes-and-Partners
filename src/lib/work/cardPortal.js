import * as THREE from 'three';

/** Bend the complete live camera view around an opening. The second capture
 * contains the destination backdrop and hero image. The foreground bends before
 * dissolving, revealing the hero image through the expanding opening. */
export function createCardPortal(renderer) {
  const options = { type: THREE.HalfFloatType };
  const target = new THREE.WebGLRenderTarget(1, 1, options);
  const behind = new THREE.WebGLRenderTarget(1, 1, options);
  const uniforms = {
    uScene: { value: target.texture },
    uBehind: { value: behind.texture },
    uProgress: { value: 0 },
    uImage: { value: null },
    uPanel: { value: new THREE.Vector4() },
    uImageAspect: { value: 16 / 9 },
    uReady: { value: 0 },
    uAspect: { value: 1 },
  };
  const geometry = new THREE.PlaneGeometry(2, 2);
  const material = new THREE.ShaderMaterial({
    uniforms, depthTest: false, depthWrite: false,
    vertexShader: `varying vec2 vUv;
      void main() { vUv=uv; gl_Position=vec4(position.xy,0.,1.); }`,
    fragmentShader: /* glsl */ `
      varying vec2 vUv;
      uniform sampler2D uScene, uBehind, uImage;
      uniform vec4 uPanel;
      uniform float uImageAspect, uReady;
      uniform float uProgress, uAspect;

      void main() {
        // The circular bend starts just after the camera begins moving;
        // both advance together rather than forming separate stages.
        float opening=smoothstep(.08,.8,uProgress);
        vec2 aspect=vec2(uAspect,1.);
        vec2 p=(vUv-.5)*2.*aspect;
        // Measure distance in screen-height units: equal pixel distances
        // along X and Y produce a circle on every viewport aspect ratio.
        float radius=length(p);
        float hole=smoothstep(.16,.94,uProgress)*max(2.65,length(aspect)*1.12);
        float distanceToRim=radius-hole;
        float feather=mix(.025,.12,opening);
        float foreground=mix(1.,smoothstep(-feather,feather,distanceToRim),smoothstep(.14,.24,uProgress));
        // Radial displacement bends the surface uniformly around the
        // circular throat before the foreground clears.
        float sourceRadius=radius/(1.+opening*1.8*exp(-radius*radius*.45));
        sourceRadius=mix(sourceRadius,max(radius-hole*.72*exp(-max(distanceToRim,0.)*.6),0.),smoothstep(.16,.56,uProgress));
        vec2 source=p*(sourceRadius/max(radius,.00001));
        vec2 sourceUv=source/aspect*.5+.5;
        float curvature=opening*exp(-max(distanceToRim,0.)*2.8);
        vec2 fringe=normalize(p+vec2(.00001))*curvature*.0016;
        vec3 surface=vec3(
          texture2D(uScene,sourceUv+fringe).r,
          texture2D(uScene,sourceUv).g,
          texture2D(uScene,sourceUv-fringe).b);
        // Shade the turning surface to give the aperture an inward bend.
        surface*=1.-curvature*.48;
        vec3 background=texture2D(uBehind,vUv).rgb;
        gl_FragColor=vec4(background,1.);
        #include <tonemapping_fragment>
        background=gl_FragColor.rgb;
        // The destination is already behind the bending foreground. Its
        // dimensions match the DOM hero image for a seamless handoff.
        vec2 panelUv=(vUv-uPanel.xy)/uPanel.zw;
        vec2 panelLocal=abs(panelUv-.5)*2.;
        float panelRadius=pow(pow(panelLocal.x,12.)+pow(panelLocal.y,12.),1./12.);
        float panelMask=1.-smoothstep(.985,1.,panelRadius);
        float panelAspect=uPanel.z*uAspect/uPanel.w;
        vec2 fit=panelAspect>uImageAspect ? vec2(1.,uImageAspect/panelAspect) : vec2(panelAspect/uImageAspect,1.);
        vec3 image=texture2D(uImage,clamp((panelUv-.5)*fit+.5,0.,1.)).rgb;
        background=mix(background,image,panelMask*uReady);
        gl_FragColor=vec4(surface,1.);
        #include <tonemapping_fragment>
        gl_FragColor=vec4(mix(background,gl_FragColor.rgb,foreground),1.);
        #include <colorspace_fragment>
      }`,
  });
  const scene = new THREE.Scene();
  scene.add(new THREE.Mesh(geometry, material));
  const camera = new THREE.Camera();
  let allocated = false;
  function allocate() {
    if (allocated) return;
    const size = renderer.getDrawingBufferSize(new THREE.Vector2());
    target.setSize(size.x, size.y);
    behind.setSize(size.x, size.y);
    uniforms.uAspect.value = size.x / size.y;
    allocated = true;
  }
  return {
    captureTarget() { allocate(); return target; },
    behindTarget() { allocate(); return behind; },
    render(progress, texture, media, panel, viewport) {
      uniforms.uProgress.value = progress;
      uniforms.uImage.value = texture;
      uniforms.uReady.value = media.ready ? 1 : 0;
      uniforms.uImageAspect.value = media.aspect;
      uniforms.uPanel.value.set((panel.left-viewport.left)/viewport.width, 1-(panel.bottom-viewport.top)/viewport.height, panel.width/viewport.width, panel.height/viewport.height);
      renderer.render(scene, camera);
    },
    resize() { allocated = false; },
    release() { target.setSize(1, 1); behind.setSize(1, 1); allocated = false; },
    dispose() { target.dispose(); behind.dispose(); geometry.dispose(); material.dispose(); },
  };
}
