"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const MESSAGES = [
  "Hello! Welcome to Thuan Naga 👋",
  "Craving something bold? 🌶️",
  "Order & track live! 🛵",
];

function Robot() {
  const group = useRef<THREE.Group>(null);
  const waveArm = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const eyes = useRef<THREE.Group>(null);
  const chestLight = useRef<THREE.MeshStandardMaterial>(null);
  const antennaLight = useRef<THREE.MeshStandardMaterial>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    // gentle float + sway
    if (group.current) {
      group.current.position.y = Math.sin(t * 1.5) * 0.16;
      group.current.rotation.y = Math.sin(t * 0.6) * 0.28;
      group.current.rotation.z = Math.sin(t * 0.9) * 0.03;
    }

    // head bob
    if (head.current) {
      head.current.position.y = Math.sin(t * 2.2 + 0.5) * 0.03;
      head.current.rotation.z = Math.sin(t * 1.3) * 0.06;
    }

    // waving arm
    if (waveArm.current) {
      waveArm.current.rotation.z = 0.45 + Math.sin(t * 3.2) * 0.55;
    }

    // blink every ~3.4s
    if (eyes.current) {
      const cycle = t % 3.4;
      const blink = cycle > 3.15 ? Math.abs(Math.sin((cycle - 3.15) * 18)) : 1;
      eyes.current.scale.y = 0.15 + 0.85 * blink;
    }

    // pulsing neon lights
    if (chestLight.current) {
      chestLight.current.emissiveIntensity = 0.8 + Math.sin(t * 3.2) * 0.5;
    }
    if (antennaLight.current) {
      antennaLight.current.emissiveIntensity = 1.4 + Math.sin(t * 5) * 0.7;
    }
  });

  return (
    <group ref={group}>
      {/* antenna */}
      <mesh position={[0, 1.42, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 0.22, 8]} />
        <meshStandardMaterial color="#64748b" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[0, 1.56, 0]}>
        <sphereGeometry args={[0.085, 16, 16]} />
        <meshStandardMaterial
          ref={antennaLight}
          color="#FFD700"
          emissive="#FFD700"
          emissiveIntensity={1.6}
        />
      </mesh>

      {/* head */}
      <group ref={head} position={[0, 1.05, 0]}>
        <mesh>
          <boxGeometry args={[0.72, 0.58, 0.6]} />
          <meshStandardMaterial color="#FF6B35" metalness={0.35} roughness={0.35} />
        </mesh>
        {/* face plate */}
        <mesh position={[0, 0.02, 0.31]}>
          <boxGeometry args={[0.5, 0.34, 0.04]} />
          <meshStandardMaterial color="#0f172a" metalness={0.5} roughness={0.4} />
        </mesh>
        {/* eyes + glints */}
        <group ref={eyes} position={[0, 0.08, 0.335]}>
          <mesh position={[-0.13, 0, 0]}>
            <sphereGeometry args={[0.085, 16, 16]} />
            <meshStandardMaterial color="#f8fafc" emissive="#e2e8f0" emissiveIntensity={0.35} />
          </mesh>
          <mesh position={[0.13, 0, 0]}>
            <sphereGeometry args={[0.085, 16, 16]} />
            <meshStandardMaterial color="#f8fafc" emissive="#e2e8f0" emissiveIntensity={0.35} />
          </mesh>
          <mesh position={[-0.115, 0.03, 0.03]}>
            <sphereGeometry args={[0.028, 12, 12]} />
            <meshStandardMaterial color="#0f172a" />
          </mesh>
          <mesh position={[0.145, 0.03, 0.03]}>
            <sphereGeometry args={[0.028, 12, 12]} />
            <meshStandardMaterial color="#0f172a" />
          </mesh>
        </group>
        {/* mouth */}
        <mesh position={[0, -0.12, 0.335]}>
          <boxGeometry args={[0.16, 0.03, 0.02]} />
          <meshStandardMaterial color="#7c2d12" />
        </mesh>
        {/* side ears */}
        <mesh position={[-0.39, 0.02, 0]}>
          <cylinderGeometry args={[0.07, 0.07, 0.08, 16]} />
          <meshStandardMaterial color="#2ECE76" metalness={0.4} roughness={0.3} />
        </mesh>
        <mesh position={[0.39, 0.02, 0]}>
          <cylinderGeometry args={[0.07, 0.07, 0.08, 16]} />
          <meshStandardMaterial color="#2ECE76" metalness={0.4} roughness={0.3} />
        </mesh>
      </group>

      {/* neck */}
      <mesh position={[0, 0.66, 0]}>
        <cylinderGeometry args={[0.08, 0.1, 0.12, 12]} />
        <meshStandardMaterial color="#475569" metalness={0.5} roughness={0.3} />
      </mesh>

      {/* body */}
      <mesh position={[0, 0.28, 0]}>
        <boxGeometry args={[0.82, 0.68, 0.55]} />
        <meshStandardMaterial color="#2ECE76" metalness={0.3} roughness={0.4} />
      </mesh>
      {/* chest neon light */}
      <mesh position={[0, 0.32, 0.28]}>
        <circleGeometry args={[0.13, 24]} />
        <meshStandardMaterial
          ref={chestLight}
          color="#FFD700"
          emissive="#FFD700"
          emissiveIntensity={1.1}
        />
      </mesh>

      {/* left arm (at side) */}
      <group position={[-0.55, 0.42, 0]}>
        <mesh position={[0, -0.24, 0]}>
          <boxGeometry args={[0.15, 0.52, 0.16]} />
          <meshStandardMaterial color="#FF6B35" metalness={0.3} roughness={0.4} />
        </mesh>
        <mesh position={[0, -0.52, 0]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial color="#f8fafc" metalness={0.5} roughness={0.3} />
        </mesh>
      </group>

      {/* right arm (waving hello) */}
      <group ref={waveArm} position={[0.55, 0.5, 0]}>
        <mesh position={[0, 0.26, 0]}>
          <boxGeometry args={[0.15, 0.52, 0.16]} />
          <meshStandardMaterial color="#FF6B35" metalness={0.3} roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.54, 0]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial color="#f8fafc" metalness={0.5} roughness={0.3} />
        </mesh>
      </group>

      {/* legs + feet */}
      <mesh position={[-0.2, -0.32, 0]}>
        <boxGeometry args={[0.22, 0.28, 0.22]} />
        <meshStandardMaterial color="#1e293b" metalness={0.4} roughness={0.4} />
      </mesh>
      <mesh position={[0.2, -0.32, 0]}>
        <boxGeometry args={[0.22, 0.28, 0.22]} />
        <meshStandardMaterial color="#1e293b" metalness={0.4} roughness={0.4} />
      </mesh>
      <mesh position={[-0.2, -0.5, 0.04]}>
        <boxGeometry args={[0.26, 0.08, 0.34]} />
        <meshStandardMaterial color="#0f172a" metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh position={[0.2, -0.5, 0.04]}>
        <boxGeometry args={[0.26, 0.08, 0.34]} />
        <meshStandardMaterial color="#0f172a" metalness={0.5} roughness={0.4} />
      </mesh>
    </group>
  );
}

export default function GreetingRobot() {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setMsgIndex((i) => (i + 1) % MESSAGES.length), 3500);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex items-end gap-3">
      <div className="h-36 w-32 shrink-0 sm:h-40 sm:w-36">
        <Canvas camera={{ position: [0, 0.35, 3.1], fov: 42 }} dpr={[1, 2]} gl={{ antialias: true, alpha: true }}>
          <ambientLight intensity={0.75} />
          <directionalLight position={[3, 4, 5]} intensity={1.4} />
          <pointLight position={[-3, 1, 2]} intensity={0.6} color="#FF6B35" />
          <pointLight position={[2, -1, 3]} intensity={0.35} color="#2ECE76" />
          <Robot />
        </Canvas>
      </div>

      {/* speech bubble */}
      <div className="relative mb-4 max-w-[15rem] sm:max-w-[17rem]">
        <span
          aria-hidden
          className="absolute -left-1.5 bottom-5 h-3 w-3 rotate-45 rounded-[2px] border-b border-l border-white/20 bg-white/10 backdrop-blur"
        />
        <div
          key={msgIndex}
          className="animate-bubble-pop relative rounded-2xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-medium leading-5 text-slate-100 shadow-lg backdrop-blur"
        >
          {MESSAGES[msgIndex]}
        </div>
        {/* typing dots */}
        <div className="mt-1.5 flex items-center justify-end gap-1 pr-1">
          <span className="h-1 w-1 animate-pulse rounded-full bg-primary-400" />
          <span className="h-1 w-1 animate-pulse rounded-full bg-accent-400 [animation-delay:150ms]" />
          <span className="h-1 w-1 animate-pulse rounded-full bg-gold [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );
}
