'use client'
// 3D-Klangwelle für den Hero: ein Punktfeld, über das Signalringe laufen wie von einem Sendeturm,
// dazu eine sanfte Grundwelle. Die Maus erzeugt eine eigene kleine Welle an ihrer Position.
// Alles läuft im Shader (eine Zeichnung für alle Punkte) — günstig auch auf schwachen Geräten.
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useMemo, useRef, type RefObject } from 'react'
import * as THREE from 'three'

const FARBE_A = new THREE.Color('#00c8ff')
const FARBE_B = new THREE.Color('#8b5cf6')
const FARBE_C = new THREE.Color('#ec4899')

const BREITE = 18
const TIEFE = 9
const QUELLE = new THREE.Vector2(5.2, -1.8) // „Sendeturm" im Feld

const vertex = /* glsl */ `
  uniform float uZeit;
  uniform vec2 uMaus;
  uniform float uMausStaerke;
  uniform vec2 uQuelle;
  uniform float uGroesse;
  uniform vec3 uFarbeA;
  uniform vec3 uFarbeB;
  uniform vec3 uFarbeC;
  attribute float aZufall;
  varying vec3 vFarbe;
  varying float vAlpha;

  void main() {
    vec3 p = position;
    float d = length(p.xz - uQuelle);
    // Signalringe vom Sendeturm, nach außen schwächer
    float ringe = sin(d * 1.55 - uZeit * 1.9) * exp(-d * 0.16) * 0.55;
    // ruhige Grundwelle quer über das Feld
    float welle = sin(p.x * 0.42 + uZeit * 0.55) * 0.32 + sin(p.z * 0.85 + p.x * 0.25 - uZeit * 0.75) * 0.16;
    // Mauswelle
    float dm = length(p.xz - uMaus);
    float maus = exp(-dm * 0.75) * (0.55 + 0.25 * sin(uZeit * 3.2 - dm * 2.6)) * uMausStaerke;
    p.y += ringe + welle + maus;

    float x = clamp((position.x / ${BREITE.toFixed(1)}) + 0.5, 0.0, 1.0);
    vec3 farbe = x < 0.55 ? mix(uFarbeA, uFarbeB, x / 0.55) : mix(uFarbeB, uFarbeC, (x - 0.55) / 0.45);
    float hoehe = clamp((p.y + 0.6) / 1.6, 0.0, 1.0);
    vFarbe = mix(farbe * 0.92, farbe, hoehe);
    // hinten leiser, vorne kräftiger; höhere Punkte leuchten stärker
    float vorne = clamp((position.z / ${TIEFE.toFixed(1)}) + 0.5, 0.0, 1.0);
    vAlpha = (0.28 + 0.55 * vorne) * (0.55 + 0.45 * hoehe) * (0.8 + 0.2 * aZufall);

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uGroesse * (0.75 + 0.5 * hoehe) * (7.0 / -mv.z);
  }
`

const fragment = /* glsl */ `
  varying vec3 vFarbe;
  varying float vAlpha;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float r = length(c);
    if (r > 0.5) discard;
    float weich = smoothstep(0.5, 0.18, r);
    gl_FragColor = vec4(vFarbe, vAlpha * weich);
  }
`

function Punktfeld({ spalten, reihen, ruhig }: { spalten: number; reihen: number; ruhig: boolean }) {
  const material = useRef<THREE.ShaderMaterial>(null)
  const gl = useThree(s => s.gl)
  const mausZiel = useRef(new THREE.Vector2(99, 99))
  const ebene = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), 0.6), [])
  const strahl = useMemo(() => new THREE.Raycaster(), [])
  const treffer = useMemo(() => new THREE.Vector3(), [])

  const [positionen, zufall] = useMemo(() => {
    const pos = new Float32Array(spalten * reihen * 3)
    const zuf = new Float32Array(spalten * reihen)
    let i = 0
    for (let r = 0; r < reihen; r++) {
      for (let s = 0; s < spalten; s++) {
        // leicht versetzte Reihen wirken organischer als ein starres Raster
        const versatz = (r % 2) * 0.5
        pos[i * 3] = ((s + versatz) / (spalten - 1) - 0.5) * BREITE
        pos[i * 3 + 1] = 0
        pos[i * 3 + 2] = (r / (reihen - 1) - 0.5) * TIEFE
        zuf[i] = ((s * 7919 + r * 104729) % 1000) / 1000
        i++
      }
    }
    return [pos, zuf]
  }, [spalten, reihen])

  const uniforms = useMemo(() => ({
    uZeit: { value: ruhig ? 2.4 : 0 },
    uMaus: { value: new THREE.Vector2(99, 99) },
    uMausStaerke: { value: 0 },
    uQuelle: { value: QUELLE },
    uGroesse: { value: 3.4 * Math.min(gl.getPixelRatio(), 2) },
    uFarbeA: { value: FARBE_A },
    uFarbeB: { value: FARBE_B },
    uFarbeC: { value: FARBE_C },
  }), [ruhig, gl])

  useFrame((state, delta) => {
    const m = material.current
    if (!m || ruhig) return
    const u = m.uniforms
    u.uZeit.value += Math.min(delta, 0.05)
    // Mausposition auf die Ebene des Feldes projizieren
    strahl.setFromCamera(state.pointer, state.camera)
    const aufEbene = strahl.ray.intersectPlane(ebene, treffer)
    const aktiv = aufEbene && Math.abs(state.pointer.x) < 1 && Math.abs(state.pointer.y) < 1
    if (aktiv) mausZiel.current.set(treffer.x, treffer.z)
    u.uMaus.value.lerp(mausZiel.current, 0.08)
    u.uMausStaerke.value += ((aktiv ? 1 : 0) - u.uMausStaerke.value) * 0.05
    // leichte Kamerabewegung mit der Maus (Tiefenwirkung)
    state.camera.position.x += (state.pointer.x * 0.6 - state.camera.position.x) * 0.03
    state.camera.lookAt(0, -0.4, 0)
  })

  return (
    <points position={[0, -0.6, 0]} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positionen, 3]} />
        <bufferAttribute attach="attributes-aZufall" args={[zufall, 1]} />
      </bufferGeometry>
      <shaderMaterial ref={material} vertexShader={vertex} fragmentShader={fragment} uniforms={uniforms} transparent depthWrite={false} />
    </points>
  )
}

/** Sendeturm mit Signalringen, die sich ausbreiten und verblassen. */
function Sendeturm({ ruhig }: { ruhig: boolean }) {
  const ringe = useRef<(THREE.Mesh | null)[]>([])
  const kopf = useRef<THREE.Mesh>(null)
  const farben = [FARBE_A, FARBE_B, FARBE_C]

  useFrame(({ clock }) => {
    const t = ruhig ? 1.1 : clock.getElapsedTime()
    ringe.current.forEach((r, i) => {
      if (!r) return
      const phase = ((t * 0.32 + i / 3) % 1 + 1) % 1
      const s = 0.3 + phase * 4.2
      r.scale.set(s, s, s)
      ;(r.material as THREE.MeshBasicMaterial).opacity = (1 - phase) * 0.55
    })
    if (kopf.current) {
      const p = 1 + Math.sin(t * 3) * 0.12
      kopf.current.scale.set(p, p, p)
    }
  })

  return (
    <group position={[QUELLE.x, -0.35, QUELLE.y]}>
      <mesh position={[0, 0.55, 0]}>
        <cylinderGeometry args={[0.012, 0.035, 1.1, 8]} />
        <meshBasicMaterial color="#181a32" transparent opacity={0.35} />
      </mesh>
      <mesh ref={kopf} position={[0, 1.15, 0]}>
        <sphereGeometry args={[0.085, 20, 20]} />
        <meshBasicMaterial color="#8b5cf6" />
      </mesh>
      {farben.map((f, i) => (
        <mesh key={i} ref={el => { ringe.current[i] = el }} position={[0, 1.15, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.2, 0.225, 96]} />
          <meshBasicMaterial color={f} transparent opacity={0.4} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
      ))}
    </group>
  )
}

export default function HeroSzene({ ruhig, klein, sichtbar, quelle }: { ruhig: boolean; klein: boolean; sichtbar: boolean; quelle: RefObject<HTMLElement | null> }) {
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 2.6, 7.2], fov: 42 }}
      frameloop={ruhig ? 'demand' : sichtbar ? 'always' : 'never'}
      gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
      onCreated={({ camera }) => camera.lookAt(0, -0.4, 0)}
      fallback={null}
      eventSource={quelle}
      eventPrefix="client"
      aria-hidden="true"
    >
      <Punktfeld spalten={klein ? 84 : 150} reihen={klein ? 38 : 64} ruhig={ruhig} />
      <Sendeturm ruhig={ruhig} />
    </Canvas>
  )
}
