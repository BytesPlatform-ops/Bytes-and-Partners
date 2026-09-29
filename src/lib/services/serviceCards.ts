import * as THREE from "three";

const ROTATIONS = [-8, 9, 7, -6].map(THREE.MathUtils.degToRad);

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main(){ vUv=uv; gl_Position=vec4(position.xy,0.,1.); }
`;

const fragmentShader = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform vec2 uViewport;
  uniform vec2 uCenter;
  uniform vec2 uSize;
  uniform vec2 uPointer;
  uniform float uRotation;
  uniform float uTime;
  uniform float uSeed;
  uniform float uHover;
  uniform sampler2D uLabel;

  float hash(vec2 p){
    p=fract(p*vec2(123.34,456.21));
    p+=dot(p,p+45.32);
    return fract(p.x*p.y);
  }
  float noise(vec2 p){
    vec2 i=floor(p),f=fract(p); f=f*f*(3.-2.*f);
    return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1)),f.x),f.y);
  }
  float fbm(vec2 p){
    float v=0.,a=.5;
    for(int i=0;i<5;i++){v+=a*noise(p);p=mat2(1.62,1.18,-1.18,1.62)*p+.21;a*=.5;}
    return v;
  }
  mat2 rotate2d(float a){float c=cos(a),s=sin(a);return mat2(c,-s,s,c);}

  void main(){
    vec2 screen=vec2(vUv.x*uViewport.x,(1.-vUv.y)*uViewport.y);
    vec2 local=rotate2d(-uRotation)*(screen-uCenter);
    vec2 pointerPx=rotate2d(-uRotation)*(uPointer-uCenter);
    vec2 halfSize=uSize*.5;
    float radius=min(22.,min(uSize.x,uSize.y)*.16);
    vec2 q=abs(local)-(halfSize-radius);
    float cardSdf=length(max(q,0.))+min(max(q.x,q.y),0.)-radius;
    vec2 fromPointer=local-pointerPx;
    float magnetic=exp(-dot(fromPointer,fromPointer)/15000.)*uHover;
    cardSdf-=magnetic*24.;
    float edge=1.-smoothstep(-1.25,1.25,cardSdf);
    if(edge<.002) discard;

    vec2 stretched=local-normalize(fromPointer+vec2(.001))*magnetic*17.;
    vec2 uv=stretched/uSize+.5;
    vec2 p=(uv-.5)*vec2(uSize.x/uSize.y,1.);
    float t=uTime*.16+uSeed*3.17;
    vec2 drift=vec2(t,-t*.7);
    vec2 circulation=vec2(sin(p.y*2.4+t),cos(p.x*2.1-t*.8));
    vec2 domain=vec2(
      fbm(p*1.8+drift+circulation*.5),
      fbm(p*1.8-drift+9.2-circulation*.4)
    );
    float clouds=fbm(p*3.2+domain*4.5+circulation*.65+magnetic*.18);
    float caustic=pow(1.-abs(2.*fbm(p*4.+domain*5.-drift)-1.),12.);
    float veins=1.-smoothstep(.018,.095,abs(clouds-.48));

    float breathing=.5+.5*sin(t*1.7+uSeed);
    vec3 stone=vec3(.81,.82,.86);
    vec3 cloud=vec3(.925,.93,.955);
    vec3 shade=vec3(.66,.68,.74);
    vec3 color=mix(stone,cloud,smoothstep(.24,.73,clouds));
    color=mix(color,shade,veins*(.11+breathing*.035));
    color+=vec3(.07,.075,.09)*caustic*(.45+breathing*.2);
    color=mix(color,color*vec3(.95,.97,1.035),uHover*.16);
    vec4 label=texture2D(uLabel,vec2(clamp(uv.x,0.,1.),1.-clamp(uv.y,0.,1.)));
    color=mix(color,label.rgb,label.a*edge);
    gl_FragColor=vec4(color,edge);
  }
`;

const TITLES = ["WEB\nDEVELOPMENT", "SEO", "APP\nDEVELOPMENT", "MARKETING"];

function createLabel(title: string, index: number) {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 720;
  const context = canvas.getContext("2d")!;
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.globalAlpha = 0.46;
  context.fillStyle = "#111111";
  context.font = "500 27px ui-monospace, SFMono-Regular, Menlo, monospace";
  context.fillText(String(index + 1).padStart(2, "0"), 76, 82);
  context.save();
  context.globalAlpha = 0.5;
  context.strokeStyle = "#111111";
  context.fillStyle = "#111111";
  context.lineWidth = 4;
  context.lineCap = "round";
  context.lineJoin = "round";
  const x = 920;
  const y = 74;
  if (index === 0) {
    context.font = "500 34px ui-monospace, SFMono-Regular, Menlo, monospace";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText("</>", x, y);
  } else if (index === 1) {
    context.beginPath();
    context.arc(x - 4, y - 4, 15, 0, Math.PI * 2);
    context.moveTo(x + 7, y + 7);
    context.lineTo(x + 21, y + 21);
    context.stroke();
  } else if (index === 2) {
    context.strokeRect(x - 16, y - 25, 32, 50);
    context.beginPath();
    context.moveTo(x - 5, y + 17);
    context.lineTo(x + 5, y + 17);
    context.stroke();
  } else {
    context.beginPath();
    context.moveTo(x - 22, y - 6);
    context.lineTo(x + 6, y - 18);
    context.lineTo(x + 6, y + 18);
    context.lineTo(x - 22, y + 6);
    context.closePath();
    context.stroke();
    context.beginPath();
    context.moveTo(x + 15, y - 11);
    context.lineTo(x + 26, y - 19);
    context.moveTo(x + 17, y);
    context.lineTo(x + 30, y);
    context.moveTo(x + 15, y + 11);
    context.lineTo(x + 26, y + 19);
    context.stroke();
  }
  context.restore();
  const lines = title.split("\n");
  context.globalAlpha = 1;
  context.fillStyle = "#111111";
  context.font = "600 86px Inter, Arial, sans-serif";
  context.textBaseline = "bottom";
  lines.forEach((line, lineIndex) => context.fillText(line, 76, 642 - (lines.length - 1 - lineIndex) * 78));
  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = true;
  return texture;
}

export function createServiceCards() {
  const uniforms = {
    uViewport: { value: new THREE.Vector2(1, 1) }, uCenter: { value: new THREE.Vector2() },
    uSize: { value: new THREE.Vector2(1, 1) }, uPointer: { value: new THREE.Vector2(-1000, -1000) },
    uRotation: { value: 0 }, uTime: { value: 0 }, uSeed: { value: 0 }, uHover: { value: 0 },
    uLabel: { value: null as THREE.Texture | null },
  };
  const material = new THREE.ShaderMaterial({ vertexShader, fragmentShader, uniforms, transparent: true, depthTest: false, depthWrite: false });
  const geometry = new THREE.PlaneGeometry(2, 2);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.frustumCulled = false;
  const scene = new THREE.Scene();
  const camera = new THREE.Camera();
  scene.add(mesh);
  const hover = [0, 0, 0, 0];
  const labels = TITLES.map(createLabel);

  return {
    render(renderer: THREE.WebGLRenderer, cards: HTMLElement[], stage: DOMRect, pointer: { x: number; y: number; has: boolean }, time: number, dt: number) {
      uniforms.uViewport.value.set(stage.width, stage.height);
      uniforms.uPointer.value.set(pointer.x - stage.left, pointer.y - stage.top);
      uniforms.uTime.value = time;
      cards.forEach((card, index) => {
        const rect = card.getBoundingClientRect();
        if (rect.bottom < stage.top || rect.top > stage.bottom) return;
        const inside = pointer.has && pointer.x >= rect.left && pointer.x <= rect.right && pointer.y >= rect.top && pointer.y <= rect.bottom;
        hover[index] += ((inside ? 1 : 0) - hover[index]) * Math.min(1, dt * 8);
        uniforms.uCenter.value.set(rect.left - stage.left + rect.width / 2, rect.top - stage.top + rect.height / 2);
        uniforms.uSize.value.set(rect.width, rect.height);
        uniforms.uRotation.value = ROTATIONS[index] ?? 0;
        uniforms.uSeed.value = index + 1;
        uniforms.uHover.value = hover[index];
        uniforms.uLabel.value = labels[index];
        renderer.render(scene, camera);
      });
    },
    dispose() { labels.forEach(label => label.dispose()); geometry.dispose(); material.dispose(); },
  };
}
