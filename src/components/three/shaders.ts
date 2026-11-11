/* Ashima simplex noise (MIT) — compact 3D variant */
export const noise3D = /* glsl */ `
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0);
  const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy));
  vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);
  vec3 l=1.0-g;
  vec3 i1=min(g.xyz,l.zxy);
  vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;
  vec3 x2=x0-i2+C.yyy;
  vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857;
  vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z);
  vec4 x_=floor(j*ns.z);
  vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy;
  vec4 y=y_*ns.x+ns.yyyy;
  vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);
  vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0;
  vec4 s1=floor(b1)*2.0+1.0;
  vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;
  vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);
  vec3 p1=vec3(a0.zw,h.y);
  vec3 p2=vec3(a1.xy,h.z);
  vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);
  m=m*m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}
`;

export const blobVertex = /* glsl */ `
uniform float uTime;
uniform float uAmp;
uniform float uFreq;
varying vec3 vNormalW;
varying vec3 vViewDir;
varying vec3 vPosW;
varying float vNoise;
${noise3D}
float field(vec3 p){
  float n = snoise(p * uFreq + vec3(0.0, uTime * 0.22, uTime * 0.12));
  n += 0.35 * snoise(p * uFreq * 2.3 - vec3(uTime * 0.18));
  return n;
}
vec3 displace(vec3 p){
  return p + normalize(p) * field(p) * uAmp;
}
void main(){
  vec3 n = normalize(normal);
  vec3 t = normalize(cross(n, abs(n.y) > 0.99 ? vec3(1.0,0.0,0.0) : vec3(0.0,1.0,0.0)));
  vec3 b = normalize(cross(n, t));
  float eps = 0.008;
  vec3 p0 = displace(position);
  vec3 p1 = displace(position + t * eps);
  vec3 p2 = displace(position + b * eps);
  vec3 dn = normalize(cross(p1 - p0, p2 - p0));
  vNoise = field(position);
  vec4 world = modelMatrix * vec4(p0, 1.0);
  vPosW = world.xyz;
  vNormalW = normalize(mat3(modelMatrix) * dn);
  vViewDir = normalize(cameraPosition - world.xyz);
  gl_Position = projectionMatrix * viewMatrix * world;
}
`;

export const blobFragment = /* glsl */ `
uniform vec3 uLight;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
varying vec3 vNormalW;
varying vec3 vViewDir;
varying vec3 vPosW;
varying float vNoise;
void main(){
  vec3 N = normalize(vNormalW);
  vec3 V = normalize(vViewDir);
  float ndv = max(dot(N, V), 0.0);
  float fres = pow(1.0 - ndv, 2.2);
  vec3 L = normalize(uLight - vPosW);
  float diff = max(dot(N, L), 0.0);
  vec3 H = normalize(L + V);
  float spec = pow(max(dot(N, H), 0.0), 80.0);
  float k = smoothstep(-0.7, 0.9, vNoise + N.y * 0.6);
  vec3 irid = mix(uColorA, uColorB, k);
  irid = mix(irid, uColorC, smoothstep(0.55, 1.0, fres) * 0.6);
  vec3 base = mix(vec3(0.012, 0.012, 0.03), vec3(0.05, 0.045, 0.12), diff);
  vec3 col = base;
  col += irid * (fres * 1.5 + diff * 0.22);
  col += irid * 0.22 * smoothstep(0.25, 0.9, vNoise);
  col += spec * vec3(0.85, 0.97, 1.0) * 1.4;
  gl_FragColor = vec4(col, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

export const particlesVertex = /* glsl */ `
attribute float aScale;
attribute float aSeed;
uniform float uTime;
uniform vec2 uMouse;
uniform float uAspect;
uniform float uPixelRatio;
uniform float uSize;
varying float vAlpha;
varying float vSeed;
void main(){
  vec3 p = position;
  p.y += sin(uTime * 0.25 + aSeed * 6.2831) * 0.18;
  p.x += cos(uTime * 0.18 + aSeed * 12.0) * 0.18;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  vec4 clip = projectionMatrix * mv;
  vec2 ndc = clip.xy / clip.w;
  vec2 d = ndc - uMouse;
  d.x *= uAspect;
  float dist = length(d);
  float infl = smoothstep(0.32, 0.0, dist);
  vec2 dir = d / max(dist, 0.0001);
  dir.x /= uAspect;
  clip.xy += dir * infl * 0.07 * clip.w;
  gl_Position = clip;
  float tw = 0.55 + 0.45 * sin(uTime * 1.3 + aSeed * 40.0);
  gl_PointSize = uSize * aScale * uPixelRatio * (1.0 / -mv.z) * (1.0 + infl * 1.6);
  vAlpha = tw * (0.35 + infl * 0.65);
  vSeed = aSeed;
}
`;

export const particlesFragment = /* glsl */ `
uniform vec3 uColorA;
uniform vec3 uColorB;
varying float vAlpha;
varying float vSeed;
void main(){
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c);
  float a = smoothstep(0.5, 0.0, d);
  a *= a;
  vec3 col = mix(uColorA, uColorB, step(0.6, vSeed));
  col = mix(col, vec3(1.0), step(0.92, vSeed) * 0.7);
  gl_FragColor = vec4(col, a * vAlpha);
  #include <colorspace_fragment>
}
`;
