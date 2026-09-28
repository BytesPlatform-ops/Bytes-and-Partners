import * as THREE from "three";

// Independent studio fluid state. All passes use the intro's renderer and tick.
export function createPearlTrail(renderer: THREE.WebGLRenderer, backdrop: THREE.Texture) {
  const vertexShader = `varying vec2 vUv; void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}`;
  const geometry = new THREE.PlaneGeometry(2, 2);
  const scene = new THREE.Scene();
  const camera = new THREE.Camera();
  const materials: THREE.ShaderMaterial[] = [];
  const targets: THREE.WebGLRenderTarget[] = [];
  const material = (fragmentShader: string, uniforms: Record<string, THREE.IUniform>) => {
    const m = new THREE.ShaderMaterial({ vertexShader, fragmentShader, uniforms, depthTest: false, depthWrite: false, blending: THREE.NoBlending });
    materials.push(m); return m;
  };
  const quad = new THREE.Mesh(geometry, material(`void main(){gl_FragColor=vec4(0.);}`, {}));
  quad.frustumCulled = false;
  scene.add(quad);
  const supported = renderer.extensions.has("EXT_color_buffer_float");
  const target = (size: number) => {
    const t = new THREE.WebGLRenderTarget(size, size, { type: THREE.HalfFloatType, depthBuffer: false, stencilBuffer: false });
    targets.push(t); return t;
  };
  const pair = (size: number) => ({ read: target(size), write: target(size), swap() { [this.read, this.write] = [this.write, this.read]; } });
  const velocity = pair(192), density = pair(768), pressure = pair(192), divergence = target(192);
  const tex = () => ({ value: null as THREE.Texture | null });
  const advect = material(`varying vec2 vUv; uniform sampler2D uSource,uVelocity; uniform float uDecay,uDt;
    void main(){vec2 v=texture2D(uVelocity,vUv).xy;gl_FragColor=texture2D(uSource,clamp(vUv-v*uDt,0.001,0.999))*uDecay;}`,
    { uSource: tex(), uVelocity: tex(), uDecay: { value: 1 }, uDt: { value: 1.45 / 60 } });
  const splat = material(`varying vec2 vUv; uniform sampler2D uSource; uniform vec2 uPoint,uDelta; uniform float uAspect,uDensity,uAmount;
    void main(){vec2 p=vUv-uPoint;p.x*=uAspect;
      float g=exp(-dot(p,p)/0.00065);
      vec4 base=texture2D(uSource,vUv);
      if(uDensity>.5){base.r=min(base.r+g*uAmount,1.2);}
      else {base.xy+=uDelta*g*30.;}
      gl_FragColor=base;}`,
    { uSource: tex(), uPoint: { value: new THREE.Vector2() }, uDelta: { value: new THREE.Vector2() }, uAspect: { value: 1 }, uDensity: { value: 0 }, uAmount: { value: 0 } });
  const neighbors = `varying vec2 vUv; uniform sampler2D uSource; const vec2 e=vec2(1./192.,0.);
    vec4 L(){return texture2D(uSource,vUv-e.xy);} vec4 R(){return texture2D(uSource,vUv+e.xy);}
    vec4 B(){return texture2D(uSource,vUv-e.yx);} vec4 T(){return texture2D(uSource,vUv+e.yx);}`;
  const div = material(neighbors+`void main(){gl_FragColor=vec4((R().x-L().x+T().y-B().y)*.5,0.,0.,1.);}`, { uSource: tex() });
  const solve = material(neighbors+`uniform sampler2D uDiv; void main(){gl_FragColor=vec4((L().x+R().x+B().x+T().x-texture2D(uDiv,vUv).x)*.25,0.,0.,1.);}`, { uSource: tex(), uDiv: tex() });
  const project = material(neighbors+`uniform sampler2D uVelocity; void main(){vec2 v=texture2D(uVelocity,vUv).xy-.5*vec2(R().x-L().x,T().x-B().x);gl_FragColor=vec4(v,0.,1.);}`, { uSource: tex(), uVelocity: tex() });
  const display = material(`
    varying vec2 vUv;
    uniform sampler2D uDensity,uBackdrop;
    float heightAt(vec2 p){return texture2D(uDensity,p).r;}
    void main(){
      float h=heightAt(vUv);
      float wet=smoothstep(.025,.10,h);
      if(wet<.001){gl_FragColor=vec4(0.);return;}
      vec2 e=vec2(1./768.,0.);
      vec2 slope=vec2(heightAt(vUv+e.xy)-heightAt(vUv-e.xy),heightAt(vUv+e.yx)-heightAt(vUv-e.yx));
      // Density is the height of the liquid sheet; its folds drive the reflections.
      vec3 n=normalize(vec3(-slope*60.,1.));
      float bend=1.-n.z;
      float light=dot(n,normalize(vec3(-.4,.6,1.)));
      float spec=pow(max(light,0.),14.);
      float band=n.x*.7+n.y*.5;
      vec3 film=mix(vec3(.64,.79,.98),vec3(.76,.87,1.),smoothstep(-.3,.65,band));
      film=mix(film,vec3(.70,.81,.98),smoothstep(.1,.7,-n.y)*.5);
      float crest=pow(max(0.,1.-abs(light-.78)*8.),3.);
      film=mix(film,vec3(.80,.90,1.),clamp(spec*.5+crest*.55,0.,.65));
      vec4 behind=texture2D(uBackdrop,clamp(vUv+slope*.018,0.001,.999));
      // Mostly clear between folds, with restrained blue-tinted crests.
      float reflection=clamp(.015+bend*.28+crest*.36+spec*.10,0.,.46)*wet;
      float alpha=reflection+behind.a*wet*(1.-reflection);
      vec3 rgb=film*reflection+behind.rgb*behind.a*wet*(1.-reflection);
      gl_FragColor=vec4(rgb/max(alpha,.001),alpha);
    }`, { uDensity: tex(), uBackdrop: { value: backdrop } });
  display.transparent = true;
  display.blending = THREE.NormalBlending;
  let initialized = false, lastX = -1, lastY = -1, accumulator = 0, idle = 10;
  function pass(m: THREE.ShaderMaterial, t: THREE.WebGLRenderTarget) {
    quad.material = m; renderer.setRenderTarget(t); renderer.render(scene, camera);
  }
  function clear() {
    for (const t of targets) { renderer.setRenderTarget(t); renderer.clear(); }
    initialized = true;
  }
  return {
    update(dt: number, px: number, py: number, active: boolean, width: number, height: number) {
      if (!supported) return;
      const oldTarget = renderer.getRenderTarget();
      const oldAutoClear = renderer.autoClear;
      renderer.autoClear = false;
      if (!initialized) clear();
      if (!active) {
        if (idle < 1.8) clear();
        idle = 10; lastX = lastY = -1;
      } else {
        const x = px / width, y = 1 - py / height;
        if (lastX >= 0) {
          const dx = x - lastX, dy = y - lastY;
          const distance = Math.hypot(dx * width, dy * height);
          if (distance > .5) {
            idle = 0;
            const steps = Math.min(12, Math.max(1, Math.ceil(distance / 18)));
            splat.uniforms.uAspect.value = width / height;
            // Divide the dose across interpolated splats so fast motion cannot flood the field.
            splat.uniforms.uAmount.value = Math.min(.26, distance * .017) / steps;
            splat.uniforms.uDelta.value.set(THREE.MathUtils.clamp(dx,-.08,.08)/steps, THREE.MathUtils.clamp(dy,-.08,.08)/steps);
            for(let i=1;i<=steps;i++) {
              splat.uniforms.uPoint.value.set(lastX+dx*i/steps,lastY+dy*i/steps);
              splat.uniforms.uSource.value=velocity.read.texture;splat.uniforms.uDensity.value=0;
              pass(splat,velocity.write);velocity.swap();
              splat.uniforms.uSource.value=density.read.texture;splat.uniforms.uDensity.value=1;
              pass(splat,density.write);density.swap();
            }
          }
        }
        lastX = x; lastY = y;
        idle += dt;
        if(idle < 1.8) {
          accumulator += Math.min(dt, .05);
          while(accumulator >= 1/60) {
            advect.uniforms.uSource.value=velocity.read.texture;advect.uniforms.uVelocity.value=velocity.read.texture;advect.uniforms.uDecay.value=.95;
            pass(advect,velocity.write);velocity.swap();
            div.uniforms.uSource.value=velocity.read.texture;pass(div,divergence);
            solve.uniforms.uDiv.value=divergence.texture;
            for(let i=0;i<12;i++){solve.uniforms.uSource.value=pressure.read.texture;pass(solve,pressure.write);pressure.swap();}
            project.uniforms.uSource.value=pressure.read.texture;project.uniforms.uVelocity.value=velocity.read.texture;pass(project,velocity.write);velocity.swap();
            advect.uniforms.uSource.value=density.read.texture;advect.uniforms.uVelocity.value=velocity.read.texture;advect.uniforms.uDecay.value=.90;
            pass(advect,density.write);density.swap();
            accumulator-=1/60;
          }
        }
      }
      display.uniforms.uDensity.value=density.read.texture;
      renderer.setRenderTarget(oldTarget);renderer.autoClear=oldAutoClear;
    },
    render() { if(supported && idle<1.8){quad.material=display;renderer.render(scene,camera);} },
    dispose() { targets.forEach(t=>t.dispose());materials.forEach(m=>m.dispose());geometry.dispose(); },
  };
}
