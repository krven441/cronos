"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial, Torus, RoundedBox } from "@react-three/drei";
import * as THREE from "three";

const GOLD = "#E6C16A";
const SILVER = "#D5D7DD";

function VaultDoor({ progress }: { progress: number }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.08;
  });
  return (
    <group ref={ref}>
      <RoundedBox args={[2.6, 2.6, 0.3]} radius={0.12} smoothness={4}>
        <meshStandardMaterial
          color="#16161A"
          metalness={0.85}
          roughness={0.25}
        />
      </RoundedBox>
      <mesh position={[0, 0, 0.16]}>
        <circleGeometry args={[1.1, 64]} />
        <meshStandardMaterial
          color={GOLD}
          metalness={0.9}
          roughness={0.2}
          emissive={GOLD}
          emissiveIntensity={0.08 + progress * 0.25}
        />
      </mesh>
      <mesh position={[0, 0, 0.2]}>
        <ringGeometry args={[0.5, 0.55, 48]} />
        <meshStandardMaterial color={SILVER} metalness={0.7} roughness={0.3} />
      </mesh>
    </group>
  );
}

function OrbitRings() {
  const r1 = useRef<THREE.Mesh>(null);
  const r2 = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (r1.current) r1.current.rotation.z += delta * 0.15;
    if (r2.current) r2.current.rotation.z -= delta * 0.1;
  });
  return (
    <>
      <Torus ref={r1} args={[1.8, 0.015, 16, 100]} rotation={[Math.PI / 2.3, 0, 0]}>
        <meshStandardMaterial color={GOLD} metalness={0.8} roughness={0.3} transparent opacity={0.5} />
      </Torus>
      <Torus ref={r2} args={[2.15, 0.01, 16, 100]} rotation={[Math.PI / 2.6, 0.3, 0]}>
        <meshStandardMaterial color={SILVER} metalness={0.6} roughness={0.4} transparent opacity={0.35} />
      </Torus>
    </>
  );
}

function Particles() {
  const positions = useMemo(() => {
    const count = 220;
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const radius = 2.4 + Math.random() * 1.4;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      arr[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      arr[i * 3 + 2] = radius * Math.cos(phi);
    }
    return arr;
  }, []);
  const ref = useRef<THREE.Points>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.02;
  });
  return (
    <Points ref={ref} positions={positions} stride={3}>
      <PointMaterial
        color={GOLD}
        size={0.02}
        sizeAttenuation
        transparent
        opacity={0.5}
        depthWrite={false}
      />
    </Points>
  );
}

export default function VaultScene({
  progress = 0,
  reduced = false,
}: {
  progress?: number;
  reduced?: boolean;
}) {
  const [tabVisible, setTabVisible] = useState(true);
  useEffect(() => {
    const onVis = () => setTabVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  return (
    <Canvas
      dpr={[1, reduced ? 1 : 2]}
      frameloop={tabVisible ? "always" : "never"}
      camera={{ position: [0, 0, 6], fov: 45 }}
      gl={{ antialias: !reduced, powerPreference: "high-performance" }}
    >
      <ambientLight intensity={0.4} />
      <pointLight position={[4, 4, 4]} intensity={1.2} color={GOLD} />
      <pointLight position={[-4, -2, -4]} intensity={0.5} color={SILVER} />
      <VaultDoor progress={progress} />
      <OrbitRings />
      {!reduced && <Particles />}
    </Canvas>
  );
}
