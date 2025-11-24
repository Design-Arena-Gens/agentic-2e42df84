/* eslint-disable react/no-unknown-property */
"use client";
import React, { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { useImages } from "@/lib/imagesStore";

type Props = {
  durationSec: number;
};

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function Naira(price: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(price);
}

function useDoorMask(width = 6, height = 3.2) {
  const geo = useMemo(() => new THREE.BoxGeometry(width / 2, height, 0.02), [width, height]);
  const mat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#0ea5e9"),
        metalness: 0.8,
        roughness: 0.1,
        transparent: true,
        opacity: 0.25,
        emissive: new THREE.Color("#22d3ee"),
        emissiveIntensity: 0.35
      }),
    []
  );
  return { geo, mat };
}

function ExteriorInteriorPlanes({
  exteriorUrl,
  interiorUrl,
  progress // 0..1 overall
}: {
  exteriorUrl?: string;
  interiorUrl?: string;
  progress: number;
}) {
  const exterior = useTexture(exteriorUrl || "");
  const interior = useTexture(interiorUrl || "");
  const exteriorRef = useRef<THREE.Mesh>(null);
  const interiorRef = useRef<THREE.Mesh>(null);
  const exteriorMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: exterior,
        transparent: true,
        opacity: 1
      }),
    [exterior]
  );
  const interiorMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: interior,
        transparent: true,
        opacity: 0
      }),
    [interior]
  );

  useFrame(() => {
    if (!exteriorRef.current || !interiorRef.current) return;
    // First 60%: approach exterior
    // 55%-75%: doors opening + crossfade
    // after 70%: fully interior
    const fadeStart = 0.55;
    const fadeEnd = 0.75;
    const t = THREE.MathUtils.clamp((progress - fadeStart) / (fadeEnd - fadeStart), 0, 1);
    const f = easeInOutCubic(t);
    (exteriorMat.opacity as number) = 1 - f;
    (interiorMat.opacity as number) = f;
  });

  const planeScale = 8; // meters across for consistency
  const aspect = 16 / 9;

  return (
    <group>
      <mesh ref={exteriorRef} position={[0, 0, 0]} material={exteriorMat}>
        <planeGeometry args={[planeScale, planeScale / aspect]} />
      </mesh>
      <mesh ref={interiorRef} position={[0, 0, -0.2]} material={interiorMat}>
        <planeGeometry args={[planeScale, planeScale / aspect]} />
      </mesh>
    </group>
  );
}

function Doors({ progress }: { progress: number }) {
  const { geo, mat } = useDoorMask(5.6, 3);
  const left = useRef<THREE.Mesh>(null);
  const right = useRef<THREE.Mesh>(null);
  useFrame(() => {
    const start = 0.55;
    const end = 0.75;
    const x = THREE.MathUtils.clamp((progress - start) / (end - start), 0, 1);
    const t = easeInOutCubic(x);
    if (left.current && right.current) {
      left.current.rotation.y = THREE.MathUtils.lerp(0, Math.PI / 1.7, t);
      right.current.rotation.y = THREE.MathUtils.lerp(0, -Math.PI / 1.7, t);
      left.current.position.x = THREE.MathUtils.lerp(-1.4, -1.6, t);
      right.current.position.x = THREE.MathUtils.lerp(1.4, 1.6, t);
    }
  });
  return (
    <group position={[0, 0, 0.05]}>
      <mesh ref={left} geometry={geo} material={mat} position={[-1.4, 0, 0]} />
      <mesh ref={right} geometry={geo} material={mat} position={[1.4, 0, 0]} />
    </group>
  );
}

function Products({ progress }: { progress: number }) {
  // Products rise between 0.75..1.0
  function rise(t0: number, t1: number) {
    const x = THREE.MathUtils.clamp((progress - t0) / (t1 - t0), 0, 1);
    return easeInOutCubic(x);
  }

  return (
    <group position={[0, -0.8, -0.6]}>
      {/* Smartphone */}
      <group position={[-2.2, rise(0.76, 0.9) * 1.2, -1]}>
        <mesh rotation={[0, performance.now() * 0.0002, 0]}>
          <boxGeometry args={[0.5, 1, 0.05]} />
          <meshStandardMaterial color="#1f2937" metalness={0.5} roughness={0.2} />
        </mesh>
        <PriceLabel position={[0, 1, 0]} title="Smartphone" price={Naira(385000)} specs={["8GB RAM", "256GB", "5G"]} />
      </group>
      {/* Smartwatch */}
      <group position={[-0.8, rise(0.78, 0.92) * 1.1, -1.2]}>
        <mesh>
          <torusGeometry args={[0.25, 0.07, 16, 32]} />
          <meshStandardMaterial color="#334155" metalness={0.6} roughness={0.25} />
        </mesh>
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.22, 0.22, 0.1, 32]} />
          <meshStandardMaterial color="#0f172a" metalness={0.4} roughness={0.3} />
        </mesh>
        <PriceLabel position={[0, 0.9, 0]} title="Smartwatch" price={Naira(155000)} specs={["AMOLED", "GPS", "NFC"]} />
      </group>
      {/* Earbuds */}
      <group position={[0.8, rise(0.8, 0.95) * 0.9, -1.1]}>
        <mesh position={[-0.12, 0, 0]}>
          <capsuleGeometry args={[0.08, 0.18, 8, 16]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.2} roughness={0.7} />
        </mesh>
        <mesh position={[0.12, 0, 0]}>
          <capsuleGeometry args={[0.08, 0.18, 8, 16]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.2} roughness={0.7} />
        </mesh>
        <PriceLabel position={[0, 0.8, 0]} title="Earbuds" price={Naira(45000)} specs={["ANC", "24h Battery"]} />
      </group>
      {/* Charger */}
      <group position={[2.0, rise(0.82, 0.97) * 0.8, -1]}>
        <mesh>
          <boxGeometry args={[0.35, 0.35, 0.35]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.1} roughness={0.8} />
        </mesh>
        <PriceLabel position={[0, 0.7, 0]} title="Fast Charger" price={Naira(18000)} specs={["65W", "USB-C PD"]} />
      </group>
      {/* Power Bank */}
      <group position={[-1.6, rise(0.84, 0.99) * 0.9, -1.3]}>
        <mesh>
          <boxGeometry args={[0.45, 0.9, 0.25]} />
          <meshStandardMaterial color="#0b1220" metalness={0.5} roughness={0.25} />
        </mesh>
        <PriceLabel position={[0, 1.0, 0]} title="Power Bank" price={Naira(32000)} specs={["20,000mAh", "PD 30W"]} />
      </group>
      {/* Protective Cases */}
      <group position={[1.6, rise(0.86, 1.0) * 0.7, -1.4]}>
        <mesh>
          <boxGeometry args={[0.5, 0.8, 0.05]} />
          <meshStandardMaterial color="#16a34a" metalness={0.2} roughness={0.6} />
        </mesh>
        <PriceLabel position={[0, 0.9, 0]} title="Case" price={Naira(9000)} specs={["Shock-proof"]} />
      </group>
      {/* Speaker */}
      <group position={[0, rise(0.86, 1.0) * 1.0, -1.6]}>
        <mesh>
          <boxGeometry args={[0.9, 0.5, 0.4]} />
          <meshStandardMaterial color="#111827" metalness={0.5} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.06, 0.201]}>
          <torusGeometry args={[0.16, 0.04, 16, 32]} />
          <meshStandardMaterial color="#374151" metalness={0.5} roughness={0.5} />
        </mesh>
        <PriceLabel position={[0, 0.9, 0]} title="Speaker" price={Naira(78000)} specs={["Bluetooth 5.3", "IPX6"]} />
      </group>
    </group>
  );
}

function PriceLabel({
  position,
  title,
  price,
  specs
}: {
  position: [number, number, number];
  title: string;
  price: string;
  specs: string[];
}) {
  return (
    <group position={position}>
      <mesh>
        <planeGeometry args={[1.6, 0.7]} />
        <meshBasicMaterial color="#0ea5e9" transparent opacity={0.12} />
      </mesh>
      <Html transform position={[0, 0, 0.01]} distanceFactor={6}>
        <div
          style={{
            padding: "8px 12px",
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.25)",
            background: "linear-gradient(180deg, rgba(14,165,233,0.10), rgba(2,132,199,0.08))",
            boxShadow: "0 10px 40px rgba(56,189,248,0.25)",
            color: "white",
            minWidth: 200
          }}
        >
          <div style={{ fontWeight: 700, letterSpacing: 0.2 }}>{title}</div>
          <div style={{ color: "#a5f3fc", fontWeight: 700, marginTop: 2 }}>{price}</div>
          <div style={{ fontSize: 12, color: "#cffafe" }}>{specs.join(" ? ")}</div>
        </div>
      </Html>
    </group>
  );
}

function Rig({ durationSec }: { durationSec: number }) {
  const { camera } = useThree();
  const startTime = useRef<number | null>(null);
  const progressRef = useRef(0);

  // Camera path: start z=4, move to z=-0.8
  useFrame(() => {
    if (startTime.current === null) startTime.current = performance.now();
    const elapsed = (performance.now() - startTime.current) / 1000;
    const raw = Math.min(1, elapsed / durationSec);
    const t = easeInOutCubic(raw);
    progressRef.current = t;
    const z = THREE.MathUtils.lerp(4, -0.8, t);
    const y = THREE.MathUtils.lerp(0.1, 0.25, t);
    camera.position.set(0, y, z);
    camera.lookAt(0, 0, -0.5);
  });

  return (
    // Provide progress to children via context if needed
    <group userData={{ getProgress: () => progressRef.current }} />
  );
}

function SceneContent({ durationSec }: { durationSec: number }) {
  const { exteriorDataUrl, interiorDataUrl } = useImages();
  const groupRef = useRef<THREE.Group>(null);
  const progressRef = useRef(0);

  // Track overall progress via time
  const startTime = useRef<number | null>(null);
  useFrame(() => {
    if (startTime.current === null) startTime.current = performance.now();
    const elapsed = (performance.now() - startTime.current) / 1000;
    const raw = Math.min(1, elapsed / durationSec);
    progressRef.current = easeInOutCubic(raw);
  });

  const progress = progressRef.current;

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[2, 4, 3]} intensity={1.1} />
      <directionalLight position={[-2, 2, 1]} intensity={0.5} color={"#60a5fa"} />
      <ExteriorInteriorPlanes exteriorUrl={exteriorDataUrl} interiorUrl={interiorDataUrl} progress={progress} />
      <Doors progress={progress} />
      <Products progress={progress} />
      {/* Subtle street plane for reflections */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.95, 0]}>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#0b1220" roughness={0.9} metalness={0.1} />
      </mesh>
      {/* Cinematic vignette */}
      <Html position={[0, 0, 0]}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            boxShadow: "inset 0 0 200px 100px rgba(0,0,0,0.6), inset 0 0 40px 4px rgba(2,132,199,0.2)"
          }}
        />
      </Html>
    </group>
  );
}

export default function HeroScene({ durationSec }: Props) {
  return (
    <Canvas
      id="hero-canvas"
      gl={{ antialias: true, preserveDrawingBuffer: true }}
      camera={{ fov: 45, near: 0.1, far: 100, position: [0, 0.1, 4] }}
      style={{ width: "100%", height: "min(70vh, 720px)", borderRadius: 12 }}
    >
      <SceneContent durationSec={durationSec} />
      <Rig durationSec={durationSec} />
    </Canvas>
  );
}

