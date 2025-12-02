'use client';

import { useState, Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sky, Environment, Sphere, Box, Cylinder } from '@react-three/drei';
import * as THREE from 'three';

function AnimatedSmog({ aqi }) {
  const ref = useRef();
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y += 0.001;
      ref.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2 + 2;
    }
  });
  
  if (aqi < 50) return null;
  
  const particleCount = Math.floor(aqi / 5);
  const smogColor = aqi < 100 ? '#d4d4d4' : aqi < 150 ? '#a8a8a8' : aqi < 200 ? '#7a7a7a' : '#4a4a4a';
  const smogOpacity = aqi < 100 ? 0.2 : aqi < 150 ? 0.35 : aqi < 200 ? 0.5 : 0.65;
  
  return (
    <group ref={ref}>
      {[...Array(particleCount)].map((_, i) => (
        <Sphere key={i} args={[0.3 + Math.random() * 0.4, 12, 12]} position={[(Math.random() - 0.5) * 20, Math.random() * 4 + 1, (Math.random() - 0.5) * 20]}>
          <meshStandardMaterial color={smogColor} transparent opacity={smogOpacity} emissive={smogColor} emissiveIntensity={aqi > 150 ? 0.1 : 0} />
        </Sphere>
      ))}
    </group>
  );
}

function Tree({ position, aqi, garbage }) {
  const ref = useRef();
  const health = aqi < 50 && garbage < 30 ? 1 : aqi < 100 && garbage < 60 ? 0.7 : aqi < 150 ? 0.4 : 0.1;
  const trunkColor = health > 0.7 ? '#4a3520' : health > 0.4 ? '#3d2817' : '#2d1807';
  const leavesColor = health > 0.7 ? '#228B22' : health > 0.4 ? '#6B8E23' : health > 0.1 ? '#8B7355' : '#4a3520';
  const leavesSize = health > 0.7 ? 0.8 : health > 0.4 ? 0.6 : health > 0.1 ? 0.3 : 0;
  
  useFrame((state) => {
    if (ref.current && health < 0.7) {
      ref.current.rotation.z = Math.sin(state.clock.elapsedTime) * 0.05 * (1 - health);
    }
  });
  
  return (
    <group ref={ref} position={position}>
      <Cylinder args={[0.1, 0.15, 1.5, 8]} position={[0, 0.75, 0]}>
        <meshStandardMaterial color={trunkColor} />
      </Cylinder>
      {leavesSize > 0 && (
        <>
          <Sphere args={[leavesSize, 16, 16]} position={[0, 1.5, 0]}>
            <meshStandardMaterial color={leavesColor} roughness={0.9} />
          </Sphere>
          {health > 0.4 && (
            <>
              <Sphere args={[leavesSize * 0.7, 12, 12]} position={[0.4, 1.3, 0]}>
                <meshStandardMaterial color={leavesColor} roughness={0.9} />
              </Sphere>
              <Sphere args={[leavesSize * 0.7, 12, 12]} position={[-0.4, 1.3, 0]}>
                <meshStandardMaterial color={leavesColor} roughness={0.9} />
              </Sphere>
            </>
          )}
        </>
      )}
      {health < 0.4 && [...Array(3)].map((_, i) => (
        <Cylinder key={i} args={[0.05, 0.05, 0.4, 6]} position={[Math.cos(i * Math.PI / 1.5) * 0.2, 1.2, Math.sin(i * Math.PI / 1.5) * 0.2]} rotation={[0, 0, Math.PI / 3]}>
          <meshStandardMaterial color="#2d1807" />
        </Cylinder>
      ))}
    </group>
  );
}

const buildingHeights = [...Array(100)].map(() => 4 + Math.random() * 6);

function GarbagePile({ position, scale }) {
  const ref = useRef();
  useFrame(() => {
    if (ref.current && ref.current.scale.x < scale) {
      ref.current.scale.x += 0.01;
      ref.current.scale.y += 0.01;
      ref.current.scale.z += 0.01;
    }
  });
  return (
    <group ref={ref} position={position} scale={[0.1, 0.1, 0.1]}>
      <Sphere args={[0.4, 12, 12]} position={[0, 0.2, 0]}>
        <meshStandardMaterial color="#4a3520" roughness={1} />
      </Sphere>
      <Box args={[0.3, 0.3, 0.3]} position={[0.3, 0.15, 0.2]}>
        <meshStandardMaterial color="#2d1f1f" />
      </Box>
    </group>
  );
}

function StreetLight({ position }) {
  return (
    <group position={position}>
      <Cylinder args={[0.05, 0.05, 3, 8]} position={[0, 1.5, 0]}>
        <meshStandardMaterial color="#2a2a2a" metalness={0.8} />
      </Cylinder>
      <Sphere args={[0.15, 16, 16]} position={[0, 3, 0]}>
        <meshStandardMaterial color="#ffff99" emissive="#ffff00" emissiveIntensity={0.8} />
      </Sphere>
      <pointLight position={[0, 3, 0]} intensity={0.5} distance={8} color="#ffff99" />
    </group>
  );
}

function Car({ startZ, lane, color, speed, direction }) {
  const ref = useRef();
  useFrame(() => {
    if (ref.current) {
      ref.current.position.x += speed * direction;
      if (ref.current.position.x > 20) ref.current.position.x = -20;
      if (ref.current.position.x < -20) ref.current.position.x = 20;
    }
  });
  
  return (
    <group ref={ref} position={[startZ, 0.01, lane]} rotation={[0, direction > 0 ? Math.PI / 2 : -Math.PI / 2, 0]}>
      <Box args={[0.8, 0.3, 1.6]} position={[0, 0.15, 0]} castShadow>
        <meshStandardMaterial color={color} metalness={0.7} roughness={0.2} envMapIntensity={1} />
      </Box>
      <Box args={[0.7, 0.25, 0.8]} position={[0, 0.42, 0]} castShadow>
        <meshStandardMaterial color={color} metalness={0.7} roughness={0.2} />
      </Box>
      <Box args={[0.65, 0.2, 0.4]} position={[0, 0.44, 0.2]}>
        <meshStandardMaterial color="#88ccff" transparent opacity={0.4} metalness={0.9} roughness={0.1} />
      </Box>
      <Box args={[0.65, 0.2, 0.4]} position={[0, 0.44, -0.2]}>
        <meshStandardMaterial color="#88ccff" transparent opacity={0.4} metalness={0.9} roughness={0.1} />
      </Box>
      <Cylinder args={[0.15, 0.15, 0.1, 16]} position={[-0.5, 0.15, 0.5]} rotation={[0, 0, Math.PI / 2]}>
        <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
      </Cylinder>
      <Cylinder args={[0.15, 0.15, 0.1, 16]} position={[-0.5, 0.15, -0.5]} rotation={[0, 0, Math.PI / 2]}>
        <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
      </Cylinder>
      <Cylinder args={[0.15, 0.15, 0.1, 16]} position={[0.5, 0.15, 0.5]} rotation={[0, 0, Math.PI / 2]}>
        <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
      </Cylinder>
      <Cylinder args={[0.15, 0.15, 0.1, 16]} position={[0.5, 0.15, -0.5]} rotation={[0, 0, Math.PI / 2]}>
        <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
      </Cylinder>
      <Sphere args={[0.08, 12, 12]} position={[0.35, 0.2, 0.82]}>
        <meshStandardMaterial color="#ffff00" emissive="#ffff00" emissiveIntensity={0.5} />
      </Sphere>
      <Sphere args={[0.08, 12, 12]} position={[-0.35, 0.2, 0.82]}>
        <meshStandardMaterial color="#ffff00" emissive="#ffff00" emissiveIntensity={0.5} />
      </Sphere>
      <Sphere args={[0.06, 12, 12]} position={[0.35, 0.2, -0.82]}>
        <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={0.8} />
      </Sphere>
      <Sphere args={[0.06, 12, 12]} position={[-0.35, 0.2, -0.82]}>
        <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={0.8} />
      </Sphere>
    </group>
  );
}

function City({ aqi, garbage }) {
  const buildingColor = garbage < 30 ? '#808080' : garbage < 60 ? '#706050' : '#604030';
  const groundColor = garbage < 30 ? '#90EE90' : garbage < 60 ? '#8B7355' : '#654321';
  const skyColor = aqi < 50 ? '#87CEEB' : aqi < 100 ? '#B0C4DE' : aqi < 150 ? '#9BA8B8' : aqi < 200 ? '#7a8899' : '#5a6a7a';
  const fogColor = aqi < 50 ? '#ffffff' : aqi < 100 ? '#e8e8e8' : aqi < 150 ? '#c8c8c8' : aqi < 200 ? '#a0a0a0' : '#707070';
  const fogDensity = aqi < 50 ? 60 : aqi < 100 ? 45 : aqi < 150 ? 30 : aqi < 200 ? 20 : 12;
  const visibility = aqi < 50 ? 1 : aqi < 100 ? 0.85 : aqi < 150 ? 0.6 : aqi < 200 ? 0.4 : 0.25;
  
  return (
    <>
      <Sky sunPosition={[100, 20, 100]} turbidity={aqi / 20} rayleigh={aqi / 80} />
      <fog attach="fog" args={[fogColor, 5, fogDensity]} />
      <ambientLight intensity={aqi < 50 ? 0.7 : aqi < 100 ? 0.55 : aqi < 150 ? 0.4 : aqi < 200 ? 0.25 : 0.15} color={fogColor} />
      <directionalLight position={[10, 10, 5]} intensity={aqi < 50 ? 1.5 : aqi < 100 ? 1.0 : aqi < 150 ? 0.6 : aqi < 200 ? 0.35 : 0.2} castShadow shadowMapSize={[2048, 2048]} color={fogColor} />
      <hemisphereLight args={[skyColor, groundColor, aqi < 100 ? 0.6 : aqi < 150 ? 0.4 : 0.2]} />
      <Environment preset="city" />
      
      <AnimatedSmog aqi={aqi} />
      
      {/* Realistic buildings with fixed heights */}
      {buildingHeights.map((height, i) => {
        const x = (i % 10 - 5) * 5;
        const z = (Math.floor(i / 10) - 5) * 5;
        if (z > 4 && z < 12) return null;
        if (x > -30 && x < -15 && z > -10 && z < 0) return null;
        return (
          <group key={i} position={[x, height / 2, z]}>
            <Box args={[2.2, height, 2.2]} castShadow receiveShadow>
              <meshStandardMaterial 
                color={buildingColor} 
                roughness={0.6} 
                metalness={0.4}
                envMapIntensity={0.8}
              />
            </Box>
            {/* Building edges */}
            <Box args={[0.05, height, 0.05]} position={[1.1, 0, 1.1]}>
              <meshStandardMaterial color="#3a3a3a" metalness={0.8} />
            </Box>
            <Box args={[0.05, height, 0.05]} position={[-1.1, 0, 1.1]}>
              <meshStandardMaterial color="#3a3a3a" metalness={0.8} />
            </Box>
            <Box args={[0.05, height, 0.05]} position={[1.1, 0, -1.1]}>
              <meshStandardMaterial color="#3a3a3a" metalness={0.8} />
            </Box>
            <Box args={[0.05, height, 0.05]} position={[-1.1, 0, -1.1]}>
              <meshStandardMaterial color="#3a3a3a" metalness={0.8} />
            </Box>
            {/* Windows on all 4 sides */}
            {[...Array(Math.floor(height * 1.5))].map((_, j) => (
              <group key={j}>
                <Box args={[0.25, 0.3, 0.05]} position={[-0.6, j * 0.7 - height / 2 + 0.5, 1.11]}>
                  <meshStandardMaterial color="#ffff99" emissive="#ffff00" emissiveIntensity={aqi < 100 ? 0.6 : 0.3} />
                </Box>
                <Box args={[0.25, 0.3, 0.05]} position={[0.6, j * 0.7 - height / 2 + 0.5, 1.11]}>
                  <meshStandardMaterial color="#ffff99" emissive="#ffff00" emissiveIntensity={aqi < 100 ? 0.6 : 0.3} />
                </Box>
                <Box args={[0.25, 0.3, 0.05]} position={[-0.6, j * 0.7 - height / 2 + 0.5, -1.11]}>
                  <meshStandardMaterial color="#ffff99" emissive="#ffff00" emissiveIntensity={aqi < 100 ? 0.6 : 0.3} />
                </Box>
                <Box args={[0.25, 0.3, 0.05]} position={[0.6, j * 0.7 - height / 2 + 0.5, -1.11]}>
                  <meshStandardMaterial color="#ffff99" emissive="#ffff00" emissiveIntensity={aqi < 100 ? 0.6 : 0.3} />
                </Box>
                <Box args={[0.05, 0.3, 0.25]} position={[1.11, j * 0.7 - height / 2 + 0.5, -0.6]}>
                  <meshStandardMaterial color="#ffff99" emissive="#ffff00" emissiveIntensity={aqi < 100 ? 0.6 : 0.3} />
                </Box>
                <Box args={[0.05, 0.3, 0.25]} position={[1.11, j * 0.7 - height / 2 + 0.5, 0.6]}>
                  <meshStandardMaterial color="#ffff99" emissive="#ffff00" emissiveIntensity={aqi < 100 ? 0.6 : 0.3} />
                </Box>
              </group>
            ))}
            {/* Roof */}
            <Box args={[2.2, 0.3, 2.2]} position={[0, height / 2 + 0.15, 0]}>
              <meshStandardMaterial color="#555555" roughness={0.9} />
            </Box>
            {/* AC units and antennas on roof */}
            {i % 3 === 0 && (
              <>
                <Box args={[0.4, 0.2, 0.3]} position={[0.5, height / 2 + 0.4, 0.5]}>
                  <meshStandardMaterial color="#666666" metalness={0.6} roughness={0.4} />
                </Box>
                <Cylinder args={[0.02, 0.02, 1.5, 8]} position={[-0.5, height / 2 + 1.05, -0.5]}>
                  <meshStandardMaterial color="#888888" metalness={0.9} />
                </Cylinder>
              </>
            )}
            {/* Satellite dishes */}
            {i % 4 === 0 && (
              <group position={[0.7, height / 2 + 0.5, -0.7]}>
                <Cylinder args={[0.05, 0.05, 0.4, 8]} position={[0, 0.2, 0]}>
                  <meshStandardMaterial color="#888888" metalness={0.8} />
                </Cylinder>
                <Sphere args={[0.25, 16, 16]} position={[0, 0.4, 0]} scale={[1, 0.3, 1]}>
                  <meshStandardMaterial color="#cccccc" metalness={0.9} roughness={0.2} />
                </Sphere>
              </group>
            )}
          </group>
        );
      })}
      
      {/* Ground with texture */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[100, 100, 30, 30]} />
        <meshStandardMaterial 
          color={groundColor} 
          roughness={0.95}
          metalness={0.1}
        />
      </mesh>
      
      {/* Grid lines for detail */}
      {garbage < 50 && [...Array(10)].map((_, i) => (
        <mesh key={`grid-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[-20 + i * 4, 0.005, 0]}>
          <planeGeometry args={[0.05, 50]} />
          <meshStandardMaterial color="#7a9a7a" transparent opacity={0.3} />
        </mesh>
      ))}
      
      {/* Road with lane markings - horizontal road */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 8]}>
        <planeGeometry args={[40, 4]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.7} metalness={0.2} />
      </mesh>
      {/* Center line */}
      {[...Array(10)].map((_, i) => (
        <mesh key={`lane-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[-18 + i * 4, 0.02, 8]}>
          <planeGeometry args={[1.5, 0.15]} />
          <meshStandardMaterial color="#ffff00" emissive="#ffff00" emissiveIntensity={0.3} />
        </mesh>
      ))}
      
      {/* Sidewalks with tiles */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 6]}>
        <planeGeometry args={[40, 0.8, 20, 4]} />
        <meshStandardMaterial color="#8B8B8B" roughness={0.85} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 10]}>
        <planeGeometry args={[40, 0.8, 20, 4]} />
        <meshStandardMaterial color="#8B8B8B" roughness={0.85} />
      </mesh>
      {/* Sidewalk edges */}
      <Box args={[40, 0.08, 0.1]} position={[0, 0.09, 5.6]}>
        <meshStandardMaterial color="#6a6a6a" />
      </Box>
      <Box args={[40, 0.08, 0.1]} position={[0, 0.09, 10.4]}>
        <meshStandardMaterial color="#6a6a6a" />
      </Box>
      
      {/* Street lights along the road */}
      <StreetLight position={[-15, 0, 6]} />
      <StreetLight position={[-10, 0, 6]} />
      <StreetLight position={[-5, 0, 6]} />
      <StreetLight position={[0, 0, 6]} />
      <StreetLight position={[5, 0, 6]} />
      <StreetLight position={[10, 0, 6]} />
      <StreetLight position={[15, 0, 6]} />
      <StreetLight position={[-15, 0, 10]} />
      <StreetLight position={[-10, 0, 10]} />
      <StreetLight position={[-5, 0, 10]} />
      <StreetLight position={[0, 0, 10]} />
      <StreetLight position={[5, 0, 10]} />
      <StreetLight position={[10, 0, 10]} />
      <StreetLight position={[15, 0, 10]} />
      
      {/* Moving cars on road - along X axis */}
      {garbage < 70 && (
        <>
          <Car startZ={-8} lane={7} color="#ff0000" speed={0.05} direction={1} />
          <Car startZ={3} lane={9} color="#0000ff" speed={0.04} direction={-1} />
          <Car startZ={-2} lane={7} color="#ffffff" speed={0.06} direction={1} />
          <Car startZ={8} lane={9} color="#00ff00" speed={0.05} direction={-1} />
        </>
      )}
      
      {/* Large Park with grass */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-23, 0.01, -5]}>
        <circleGeometry args={[7, 64]} />
        <meshStandardMaterial 
          color={garbage < 30 ? '#2d5016' : garbage < 60 ? '#4a6b2e' : '#6b5d3f'}
          roughness={0.95}
        />
      </mesh>
      
      {/* Park fence */}
      {[...Array(30)].map((_, i) => {
        const angle = (i / 30) * Math.PI * 2;
        const x = -23 + Math.cos(angle) * 7.3;
        const z = -5 + Math.sin(angle) * 7.3;
        return (
          <Cylinder key={`fence-${i}`} args={[0.03, 0.03, 0.8, 8]} position={[x, 0.4, z]}>
            <meshStandardMaterial color="#8B4513" />
          </Cylinder>
        );
      })}
      
      {/* Park playground */}
      {garbage < 60 && (
        <>
          <group position={[-25, 0, -2]}>
            <Cylinder args={[0.05, 0.05, 1.5, 8]} position={[-0.8, 0.75, 0]}>
              <meshStandardMaterial color="#ff6600" metalness={0.6} />
            </Cylinder>
            <Cylinder args={[0.05, 0.05, 1.5, 8]} position={[0.8, 0.75, 0]}>
              <meshStandardMaterial color="#ff6600" metalness={0.6} />
            </Cylinder>
            <Box args={[2, 0.1, 0.4]} position={[0, 1.5, 0]}>
              <meshStandardMaterial color="#ff6600" metalness={0.6} />
            </Box>
          </group>
          <group position={[-21, 0.5, -8]}>
            <Cylinder args={[0.6, 0.6, 0.3, 16]}>
              <meshStandardMaterial color="#4169E1" metalness={0.5} />
            </Cylinder>
          </group>
        </>
      )}
      
      {/* Park benches */}
      {garbage < 60 && (
        <>
          <group position={[-19, 0.3, -3]}>
            <Box args={[0.8, 0.05, 0.3]}>
              <meshStandardMaterial color="#8B4513" roughness={0.8} />
            </Box>
          </group>
          <group position={[-27, 0.3, -7]}>
            <Box args={[0.8, 0.05, 0.3]}>
              <meshStandardMaterial color="#8B4513" roughness={0.8} />
            </Box>
          </group>
        </>
      )}
      
      {/* Trees around park */}
      <Tree position={[-16, 0, -3]} aqi={aqi} garbage={garbage} />
      <Tree position={[-30, 0, -3]} aqi={aqi} garbage={garbage} />
      <Tree position={[-16, 0, -7]} aqi={aqi} garbage={garbage} />
      <Tree position={[-30, 0, -7]} aqi={aqi} garbage={garbage} />
      <Tree position={[-23, 0, 2]} aqi={aqi} garbage={garbage} />
      <Tree position={[-23, 0, -12]} aqi={aqi} garbage={garbage} />
      
      {/* Trees in other areas */}
      <Tree position={[-8, 0, 5]} aqi={aqi} garbage={garbage} />
      <Tree position={[-7, 0, 2]} aqi={aqi} garbage={garbage} />
      <Tree position={[7, 0, 4]} aqi={aqi} garbage={garbage} />
      <Tree position={[8, 0, 1]} aqi={aqi} garbage={garbage} />
      <Tree position={[6, 0, -3]} aqi={aqi} garbage={garbage} />
      <Tree position={[9, 0, -6]} aqi={aqi} garbage={garbage} />
      
      {/* Grass patches - fixed positions */}
      {[[-7, 0.02, 3], [-8, 0.02, -4], [7, 0.02, 2], [8, 0.02, -4], [-4, 0.02, 11], [3, 0.02, 12], [-2, 0.02, -8], [4, 0.02, -7]].map((pos, i) => {
        const grassHealth = aqi < 50 && garbage < 30 ? 1 : aqi < 100 && garbage < 60 ? 0.6 : 0.2;
        const grassColor = grassHealth > 0.6 ? '#7CFC00' : grassHealth > 0.2 ? '#9ACD32' : '#8B7355';
        return (
          <mesh key={`grass-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={pos}>
            <circleGeometry args={[1.5, 32]} />
            <meshStandardMaterial color={grassColor} roughness={1} opacity={grassHealth} transparent />
          </mesh>
        );
      })}
      
      {/* Flowers - fixed positions */}
      {aqi < 100 && garbage < 60 && [[-7.5, 0.1, 3.5], [-7, 0.1, 3], [-8.5, 0.1, -4], [7.5, 0.1, 2], [7, 0.1, 2.5], [8.5, 0.1, -4], [-4, 0.1, 11.5], [3.5, 0.1, 12], [-5.5, 0.1, 12], [2, 0.1, 11.5], [5.5, 0.1, 12.5], [-2.5, 0.1, -8], [4.5, 0.1, -7]].map((pos, i) => (
        <Sphere key={`flower-${i}`} args={[0.1, 8, 8]} position={pos}>
          <meshStandardMaterial color={['#FF69B4', '#FFD700', '#FF6347'][i % 3]} emissive={['#FF69B4', '#FFD700', '#FF6347'][i % 3]} emissiveIntensity={0.3} />
        </Sphere>
      ))}
      
      {/* Animated garbage piles with variety */}
      {[...Array(Math.floor(garbage / 8))].map((_, i) => (
        <GarbagePile key={`garbage-${i}`} position={[Math.random() * 12 - 6, 0, Math.random() * 12 - 6]} scale={1} />
      ))}
      
      {/* Plastic bottles scattered */}
      {garbage > 40 && [...Array(Math.floor(garbage / 10))].map((_, i) => (
        <Cylinder key={`bottle-${i}`} args={[0.05, 0.05, 0.2, 8]} position={[Math.random() * 14 - 7, 0.1, Math.random() * 14 - 7]} rotation={[Math.random() * Math.PI, 0, Math.random() * Math.PI]}>
          <meshStandardMaterial color="#88ccff" transparent opacity={0.6} roughness={0.2} />
        </Cylinder>
      ))}
      
      {/* Toxic barrels with warning symbols */}
      {garbage > 70 && [...Array(3)].map((_, i) => (
        <group key={`barrel-${i}`} position={[Math.random() * 10 - 5, 0.3, Math.random() * 10 - 5]}>
          <Cylinder args={[0.3, 0.3, 0.6, 16]}>
            <meshStandardMaterial color="#ff6600" roughness={0.4} metalness={0.3} />
          </Cylinder>
          <Cylinder args={[0.31, 0.31, 0.05, 16]} position={[0, 0.15, 0]}>
            <meshStandardMaterial color="#000000" />
          </Cylinder>
        </group>
      ))}
      
      {/* Traffic signals */}
      <group position={[-12, 0, 7]}>
        <Cylinder args={[0.05, 0.05, 2.5, 8]} position={[0, 1.25, 0]}>
          <meshStandardMaterial color="#2a2a2a" metalness={0.8} />
        </Cylinder>
        <Box args={[0.15, 0.5, 0.15]} position={[0, 2.7, 0]}>
          <meshStandardMaterial color="#1a1a1a" />
        </Box>
        <Sphere args={[0.06, 16, 16]} position={[0, 2.85, 0.08]}>
          <meshStandardMaterial color="#00ff00" emissive="#00ff00" emissiveIntensity={0.8} />
        </Sphere>
      </group>
      <group position={[12, 0, 9]}>
        <Cylinder args={[0.05, 0.05, 2.5, 8]} position={[0, 1.25, 0]}>
          <meshStandardMaterial color="#2a2a2a" metalness={0.8} />
        </Cylinder>
        <Box args={[0.15, 0.5, 0.15]} position={[0, 2.7, 0]}>
          <meshStandardMaterial color="#1a1a1a" />
        </Box>
        <Sphere args={[0.06, 16, 16]} position={[0, 2.85, 0.08]}>
          <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={0.8} />
        </Sphere>
      </group>
      
      {/* Bus stops */}
      <group position={[-8, 0, 5.8]}>
        <Box args={[1.5, 2, 0.05]} position={[0, 1, 0]}>
          <meshStandardMaterial color="#cccccc" transparent opacity={0.3} />
        </Box>
        <Box args={[1.5, 0.05, 0.8]} position={[0, 2, 0.4]}>
          <meshStandardMaterial color="#4a4a4a" />
        </Box>
        <Cylinder args={[0.03, 0.03, 2, 8]} position={[-0.7, 1, 0]}>
          <meshStandardMaterial color="#2a2a2a" metalness={0.8} />
        </Cylinder>
        <Cylinder args={[0.03, 0.03, 2, 8]} position={[0.7, 1, 0]}>
          <meshStandardMaterial color="#2a2a2a" metalness={0.8} />
        </Cylinder>
      </group>
      
      {/* Billboards */}
      <group position={[-15, 0, 3]}>
        <Cylinder args={[0.1, 0.1, 4, 8]} position={[0, 2, 0]}>
          <meshStandardMaterial color="#2a2a2a" metalness={0.8} />
        </Cylinder>
        <Box args={[3, 2, 0.1]} position={[0, 5, 0]}>
          <meshStandardMaterial color="#ffffff" emissive="#4169E1" emissiveIntensity={0.3} />
        </Box>
      </group>
      
      {/* Crosswalk markings */}
      {[...Array(8)].map((_, i) => (
        <mesh key={`cross-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[-10 + i * 0.5, 0.02, 8]}>
          <planeGeometry args={[0.3, 3.5]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
      ))}
      
      {/* Fire hydrants */}
      <group position={[-6, 0.2, 5.5]}>
        <Cylinder args={[0.1, 0.12, 0.4, 8]}>
          <meshStandardMaterial color="#ff0000" metalness={0.6} roughness={0.4} />
        </Cylinder>
        <Cylinder args={[0.05, 0.05, 0.1, 8]} position={[-0.12, 0.1, 0]} rotation={[0, 0, Math.PI / 2]}>
          <meshStandardMaterial color="#ff0000" metalness={0.6} />
        </Cylinder>
      </group>
      
      {/* Park benches */}
      {garbage < 60 && (
        <>
          <group position={[6.5, 0.3, 6.8]}>
            <Box args={[0.8, 0.05, 0.3]}>
              <meshStandardMaterial color="#8B4513" roughness={0.8} />
            </Box>
            <Box args={[0.8, 0.3, 0.05]} position={[0, 0.15, -0.125]}>
              <meshStandardMaterial color="#8B4513" roughness={0.8} />
            </Box>
          </group>
        </>
      )}
      
      {/* Industrial smoke stacks if very polluted */}
      {aqi > 150 && (
        <>
          <group position={[-12, 0, -8]}>
            <Box args={[2, 1.5, 2]} position={[0, 0.75, 0]}>
              <meshStandardMaterial color="#5a5a5a" roughness={0.7} metalness={0.3} />
            </Box>
            <Cylinder args={[0.4, 0.5, 4, 16]} position={[0, 3, 0]}>
              <meshStandardMaterial color="#4a4a4a" roughness={0.6} metalness={0.4} />
            </Cylinder>
            <Cylinder args={[0.45, 0.4, 0.3, 16]} position={[0, 5.15, 0]}>
              <meshStandardMaterial color="#3a3a3a" metalness={0.5} />
            </Cylinder>
            {[...Array(8)].map((_, i) => (
              <Sphere key={i} args={[0.3 + i * 0.05, 12, 12]} position={[Math.random() * 0.5 - 0.25, 5.5 + i * 0.4, Math.random() * 0.5 - 0.25]}>
                <meshStandardMaterial color="#666666" transparent opacity={0.3 - i * 0.03} />
              </Sphere>
            ))}
          </group>
        </>
      )}
    </>
  );
}



function HumanDetailed({ aqi, garbage }) {
  const skinColor = aqi < 50 && garbage < 30 ? '#ffdbac' : aqi < 100 && garbage < 60 ? '#e8c4a0' : aqi < 150 ? '#d4a574' : aqi < 200 ? '#b88a5c' : '#8b6f47';
  const lungsColor = aqi < 50 ? '#ff9999' : aqi < 100 ? '#ff6666' : aqi < 150 ? '#cc3333' : aqi < 200 ? '#990000' : '#660000';
  const heartColor = aqi < 50 && garbage < 30 ? '#ff0000' : aqi < 100 ? '#cc0000' : '#990000';
  const stomachColor = garbage < 30 ? '#ffb3ba' : garbage < 60 ? '#ff8080' : '#ff4d4d';
  const liverColor = aqi < 100 ? '#8B4513' : '#654321';
  const kidneyColor = garbage < 50 ? '#DC143C' : '#8B0000';
  
  return (
    <group position={[0, 2, 0]}>
      <Sphere args={[0.5, 32, 32]} position={[0, 2, 0]}>
        <meshStandardMaterial color={skinColor} />
      </Sphere>
      <Sphere args={[0.1, 16, 16]} position={[-0.15, 2.1, 0.45]}>
        <meshStandardMaterial color={aqi > 150 ? '#ff9999' : '#ffffff'} emissive="#ff0000" emissiveIntensity={aqi > 150 ? 0.5 : 0} />
      </Sphere>
      <Sphere args={[0.1, 16, 16]} position={[0.15, 2.1, 0.45]}>
        <meshStandardMaterial color={aqi > 150 ? '#ff9999' : '#ffffff'} emissive="#ff0000" emissiveIntensity={aqi > 150 ? 0.5 : 0} />
      </Sphere>
      <Cylinder args={[0.5, 0.6, 1.5, 32]} position={[0, 1, 0]}>
        <meshStandardMaterial color={skinColor} transparent opacity={0.3} />
      </Cylinder>
      
      {/* Lungs */}
      <Sphere args={[0.25, 16, 16]} position={[-0.2, 1.2, 0.2]}>
        <meshStandardMaterial color={lungsColor} emissive={lungsColor} emissiveIntensity={0.4} />
      </Sphere>
      <Sphere args={[0.25, 16, 16]} position={[0.2, 1.2, 0.2]}>
        <meshStandardMaterial color={lungsColor} emissive={lungsColor} emissiveIntensity={0.4} />
      </Sphere>
      
      {/* Heart */}
      <Sphere args={[0.18, 16, 16]} position={[0, 1.1, 0.25]}>
        <meshStandardMaterial color={heartColor} emissive={heartColor} emissiveIntensity={0.5} />
      </Sphere>
      
      {/* Stomach */}
      <Sphere args={[0.22, 16, 16]} position={[0, 0.6, 0.2]}>
        <meshStandardMaterial color={stomachColor} emissive={stomachColor} emissiveIntensity={0.3} />
      </Sphere>
      
      {/* Liver */}
      <Box args={[0.3, 0.25, 0.2]} position={[0.25, 0.8, 0.15]}>
        <meshStandardMaterial color={liverColor} emissive={liverColor} emissiveIntensity={0.2} />
      </Box>
      
      {/* Kidneys */}
      <Sphere args={[0.12, 12, 12]} position={[-0.3, 0.7, 0]}>
        <meshStandardMaterial color={kidneyColor} emissive={kidneyColor} emissiveIntensity={0.3} />
      </Sphere>
      <Sphere args={[0.12, 12, 12]} position={[0.3, 0.7, 0]}>
        <meshStandardMaterial color={kidneyColor} emissive={kidneyColor} emissiveIntensity={0.3} />
      </Sphere>
      
      {/* Brain */}
      <Sphere args={[0.35, 24, 24]} position={[0, 2.3, 0]}>
        <meshStandardMaterial color={aqi < 100 ? '#ffb3ba' : '#ff4d4d'} emissive="#ff0000" emissiveIntensity={aqi > 100 ? 0.4 : 0.1} />
      </Sphere>
      
      {/* Legs */}
      <Cylinder args={[0.15, 0.12, 1.2, 16]} position={[-0.25, -0.3, 0]}>
        <meshStandardMaterial color={skinColor} transparent opacity={0.5} />
      </Cylinder>
      <Cylinder args={[0.15, 0.12, 1.2, 16]} position={[0.25, -0.3, 0]}>
        <meshStandardMaterial color={skinColor} transparent opacity={0.5} />
      </Cylinder>
      
      {/* Arms */}
      <Cylinder args={[0.12, 0.1, 0.9, 16]} position={[-0.7, 1.1, 0]} rotation={[0, 0, 0.5]}>
        <meshStandardMaterial color={skinColor} transparent opacity={0.5} />
      </Cylinder>
      <Cylinder args={[0.12, 0.1, 0.9, 16]} position={[0.7, 1.1, 0]} rotation={[0, 0, -0.5]}>
        <meshStandardMaterial color={skinColor} transparent opacity={0.5} />
      </Cylinder>
      
      {/* Labels */}
      <Arrow start={new THREE.Vector3(1.5, 1.2, 0)} end={new THREE.Vector3(0.2, 1.2, 0.2)} color={lungsColor} />
      <Arrow start={new THREE.Vector3(1.5, 1.1, 0)} end={new THREE.Vector3(0, 1.1, 0.25)} color={heartColor} />
      <Arrow start={new THREE.Vector3(1.5, 0.6, 0)} end={new THREE.Vector3(0, 0.6, 0.2)} color={stomachColor} />
      <Arrow start={new THREE.Vector3(1.5, 0.8, 0)} end={new THREE.Vector3(0.25, 0.8, 0.15)} color={liverColor} />
      <Arrow start={new THREE.Vector3(1.5, 2.3, 0)} end={new THREE.Vector3(0, 2.3, 0)} color="#ff4d4d" />
    </group>
  );
}

function WalkingPerson({ startX, startZ, aqi, garbage, speed, isChild, direction }) {
  const ref = useRef();
  const limbRef = useRef(0);
  
  useFrame((state) => {
    if (ref.current) {
      ref.current.position.x += speed * direction;
      if (ref.current.position.x > 18) ref.current.position.x = -18;
      if (ref.current.position.x < -18) ref.current.position.x = 18;
      limbRef.current = Math.sin(state.clock.elapsedTime * 5) * 0.3;
    }
  });
  
  const skinColor = aqi < 50 && garbage < 30 ? '#ffdbac' : aqi < 100 && garbage < 60 ? '#e8c4a0' : '#d4a574';
  const scale = isChild ? 0.6 : 0.8;
  const shirtColor = isChild ? '#FF69B4' : '#4169E1';
  
  return (
    <group ref={ref} position={[startX, isChild ? 0.5 : 0.7, startZ]} rotation={[0, direction > 0 ? Math.PI / 2 : -Math.PI / 2, 0]} scale={scale}>
      <Sphere args={[0.35, 24, 24]} position={[0, 1.6, 0]}>
        <meshStandardMaterial color={skinColor} roughness={0.3} />
      </Sphere>
      <Cylinder args={[0.16, 0.19, 0.28, 20]} position={[0, 1.3, 0]}>
        <meshStandardMaterial color={skinColor} />
      </Cylinder>
      <Box args={[0.6, 0.8, 0.35]} position={[0, 0.85, 0]}>
        <meshStandardMaterial color={shirtColor} roughness={0.6} />
      </Box>
      <Cylinder args={[0.11, 0.1, 0.5, 20]} position={[-0.52, 1, 0]} rotation={[limbRef.current, 0, 0.3]}>
        <meshStandardMaterial color={shirtColor} />
      </Cylinder>
      <Cylinder args={[0.11, 0.1, 0.5, 20]} position={[0.52, 1, 0]} rotation={[-limbRef.current, 0, -0.3]}>
        <meshStandardMaterial color={shirtColor} />
      </Cylinder>
      <Cylinder args={[0.13, 0.11, 0.5, 20]} position={[-0.18, 0.4, 0]} rotation={[limbRef.current * 1.5, 0, 0]}>
        <meshStandardMaterial color="#2F4F4F" />
      </Cylinder>
      <Cylinder args={[0.13, 0.11, 0.5, 20]} position={[0.18, 0.4, 0]} rotation={[-limbRef.current * 1.5, 0, 0]}>
        <meshStandardMaterial color="#2F4F4F" />
      </Cylinder>
      {aqi > 100 && (
        <Sphere args={[0.5, 16, 16]} position={[0, 1.6, 0]}>
          <meshStandardMaterial color="#ff0000" transparent opacity={0.15} emissive="#ff0000" emissiveIntensity={0.3} />
        </Sphere>
      )}
    </group>
  );
}

function PlayingChild({ position, aqi, garbage, action }) {
  const ref = useRef();
  
  useFrame((state) => {
    if (ref.current && action === 'jump') {
      ref.current.position.y = 0.3 + Math.abs(Math.sin(state.clock.elapsedTime * 2)) * 0.3;
    } else if (action === 'run') {
      ref.current.rotation.y = state.clock.elapsedTime * 2;
    }
  });
  
  const skinColor = aqi < 50 && garbage < 30 ? '#ffdbac' : aqi < 100 && garbage < 60 ? '#e8c4a0' : '#d4a574';
  const energy = aqi < 50 && garbage < 30 ? 1 : aqi < 100 && garbage < 60 ? 0.8 : 0.5;
  
  return (
    <group ref={ref} position={position} scale={0.5}>
      <Sphere args={[0.35, 24, 24]} position={[0, 1.6, 0]}>
        <meshStandardMaterial color={skinColor} roughness={0.3} />
      </Sphere>
      <Cylinder args={[0.16, 0.19, 0.28, 20]} position={[0, 1.3, 0]}>
        <meshStandardMaterial color={skinColor} />
      </Cylinder>
      <Box args={[0.6, 0.8, 0.35]} position={[0, 0.85, 0]}>
        <meshStandardMaterial color="#FFD700" roughness={0.6} />
      </Box>
      <Cylinder args={[0.11, 0.1, 0.5, 20]} position={[-0.52, 1, 0]} rotation={[action === 'jump' ? -0.5 : 0.3, 0, 0.3]}>
        <meshStandardMaterial color="#FFD700" />
      </Cylinder>
      <Cylinder args={[0.11, 0.1, 0.5, 20]} position={[0.52, 1, 0]} rotation={[action === 'jump' ? -0.5 : -0.3, 0, -0.3]}>
        <meshStandardMaterial color="#FFD700" />
      </Cylinder>
      <Cylinder args={[0.13, 0.11, 0.5, 20]} position={[-0.18, 0.4, 0]}>
        <meshStandardMaterial color="#FF6347" />
      </Cylinder>
      <Cylinder args={[0.13, 0.11, 0.5, 20]} position={[0.18, 0.4, 0]}>
        <meshStandardMaterial color="#FF6347" />
      </Cylinder>
      {aqi > 100 && (
        <>
          <Sphere args={[0.5, 16, 16]} position={[0, 1.6, 0]}>
            <meshStandardMaterial color="#ff0000" transparent opacity={0.2} emissive="#ff0000" emissiveIntensity={0.4} />
          </Sphere>
          <points position={[0, 1.5, 0.4]}>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                count={15}
                array={new Float32Array([...Array(45)].map(() => (Math.random() - 0.5) * 0.3))}
                itemSize={3}
              />
            </bufferGeometry>
            <pointsMaterial size={0.04} color="#ff0000" opacity={0.6} transparent />
          </points>
        </>
      )}
      {energy < 0.8 && (
        <mesh position={[0, 2.2, 0]}>
          <boxGeometry args={[0.6 * energy, 0.1, 0.05]} />
          <meshStandardMaterial color={energy > 0.6 ? '#00ff00' : '#ff0000'} emissive={energy > 0.6 ? '#00ff00' : '#ff0000'} emissiveIntensity={0.5} />
        </mesh>
      )}
    </group>
  );
}

function Human({ aqi, garbage, onClick }) {
  const ref = useRef();
  const leftLegRef = useRef();
  const rightLegRef = useRef();
  const leftArmRef = useRef();
  const rightArmRef = useRef();
  const skinColor = aqi < 50 && garbage < 30 ? '#ffdbac' : aqi < 100 && garbage < 60 ? '#e8c4a0' : aqi < 150 ? '#d4a574' : aqi < 200 ? '#b88a5c' : '#8b6f47';
  const lungsColor = aqi < 50 ? '#ff9999' : aqi < 100 ? '#ff6666' : aqi < 150 ? '#cc3333' : aqi < 200 ? '#990000' : '#660000';
  const heartColor = aqi < 50 && garbage < 30 ? '#ff0000' : aqi < 100 ? '#cc0000' : '#990000';
  const eyeColor = aqi < 100 ? '#ffffff' : aqi < 150 ? '#ffcccc' : '#ff9999';
  const hairColor = '#3d2817';
  const shirtColor = '#4169E1';
  const pantsColor = '#2F4F4F';
  const scale = aqi < 50 && garbage < 30 ? 1 : aqi < 100 && garbage < 60 ? 0.98 : aqi < 150 ? 0.92 : aqi < 200 ? 0.85 : 0.75;
  
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const walkSpeed = 2.5;
    const walkCycle = Math.sin(t * walkSpeed);
    
    if (ref.current) {
      // Walk in straight line along sidewalk
      ref.current.position.x = -15 + (t * 0.3) % 30;
      // Slight vertical bob while walking
      ref.current.position.y = 0.5 + Math.abs(Math.sin(t * walkSpeed * 2)) * 0.03;
      // Face forward
      ref.current.rotation.y = Math.PI / 2;
    }
    
    if (leftLegRef.current) {
      leftLegRef.current.rotation.x = walkCycle * 0.5;
    }
    if (rightLegRef.current) {
      rightLegRef.current.rotation.x = -walkCycle * 0.5;
    }
    if (leftArmRef.current) {
      leftArmRef.current.rotation.x = -walkCycle * 0.35;
    }
    if (rightArmRef.current) {
      rightArmRef.current.rotation.x = walkCycle * 0.35;
    }
  });
  
  return (
    <group ref={ref} position={[0, 0.5, 6.3]} rotation={[0, Math.PI * 0.5, 0]} scale={scale * 0.5}>
      {/* Head - more realistic shape */}
      <group position={[0, 1.6, 0]}>
        <Sphere args={[0.38, 32, 32]} scale={[0.95, 1.1, 1]}>
          <meshStandardMaterial color={skinColor} roughness={0.3} metalness={0.05} />
        </Sphere>
        
        {/* Hair - better style */}
        <Sphere args={[0.39, 32, 32]} position={[0, 0.12, -0.08]} scale={[0.95, 0.75, 0.95]}>
          <meshStandardMaterial color={hairColor} roughness={0.95} />
        </Sphere>
        <Sphere args={[0.25, 24, 24]} position={[0, 0.25, 0.1]} scale={[1.1, 0.6, 0.8]}>
          <meshStandardMaterial color={hairColor} roughness={0.95} />
        </Sphere>
        
        {/* Ears */}
        <group position={[-0.37, 0, 0]}>
          <Sphere args={[0.09, 16, 16]} scale={[0.5, 1, 0.8]}>
            <meshStandardMaterial color={skinColor} />
          </Sphere>
        </group>
        <group position={[0.37, 0, 0]}>
          <Sphere args={[0.09, 16, 16]} scale={[0.5, 1, 0.8]}>
            <meshStandardMaterial color={skinColor} />
          </Sphere>
        </group>
        
        {/* Eyebrows */}
        <Box args={[0.15, 0.03, 0.02]} position={[-0.13, 0.12, 0.35]}>
          <meshStandardMaterial color={hairColor} />
        </Box>
        <Box args={[0.15, 0.03, 0.02]} position={[0.13, 0.12, 0.35]}>
          <meshStandardMaterial color={hairColor} />
        </Box>
        
        {/* Eyes - more realistic */}
        <group position={[-0.13, 0.05, 0.3]}>
          <Sphere args={[0.1, 20, 20]} scale={[1, 0.8, 0.6]}>
            <meshStandardMaterial color="#ffffff" roughness={0.1} />
          </Sphere>
          <Sphere args={[0.06, 20, 20]} position={[0, 0, 0.05]}>
            <meshStandardMaterial color={aqi > 150 ? '#cc4444' : '#2a4d69'} />
          </Sphere>
          <Sphere args={[0.03, 16, 16]} position={[0.01, 0.01, 0.08]}>
            <meshStandardMaterial color="#000000" />
          </Sphere>
          {aqi > 150 && (
            <Sphere args={[0.11, 20, 20]} scale={[1, 0.8, 0.6]}>
              <meshStandardMaterial color="#ff0000" transparent opacity={0.2} emissive="#ff0000" emissiveIntensity={0.3} />
            </Sphere>
          )}
        </group>
        <group position={[0.13, 0.05, 0.3]}>
          <Sphere args={[0.1, 20, 20]} scale={[1, 0.8, 0.6]}>
            <meshStandardMaterial color="#ffffff" roughness={0.1} />
          </Sphere>
          <Sphere args={[0.06, 20, 20]} position={[0, 0, 0.05]}>
            <meshStandardMaterial color={aqi > 150 ? '#cc4444' : '#2a4d69'} />
          </Sphere>
          <Sphere args={[0.03, 16, 16]} position={[-0.01, 0.01, 0.08]}>
            <meshStandardMaterial color="#000000" />
          </Sphere>
          {aqi > 150 && (
            <Sphere args={[0.11, 20, 20]} scale={[1, 0.8, 0.6]}>
              <meshStandardMaterial color="#ff0000" transparent opacity={0.2} emissive="#ff0000" emissiveIntensity={0.3} />
            </Sphere>
          )}
        </group>
        
        {/* Nose - more realistic */}
        <group position={[0, -0.05, 0.35]}>
          <Box args={[0.08, 0.18, 0.15]} rotation={[0.2, 0, 0]}>
            <meshStandardMaterial color={skinColor} roughness={0.4} />
          </Box>
          <Sphere args={[0.05, 16, 16]} position={[-0.05, -0.08, 0.05]}>
            <meshStandardMaterial color={skinColor} roughness={0.4} />
          </Sphere>
          <Sphere args={[0.05, 16, 16]} position={[0.05, -0.08, 0.05]}>
            <meshStandardMaterial color={skinColor} roughness={0.4} />
          </Sphere>
        </group>
        
        {/* Mouth - more realistic */}
        <group position={[0, -0.18, 0.32]}>
          <Sphere args={[0.12, 20, 20]} scale={[1.3, 0.4, 0.7]}>
            <meshStandardMaterial color="#d4756f" roughness={0.6} />
          </Sphere>
          {aqi > 100 && (
            <Sphere args={[0.04, 12, 12]} position={[0, -0.02, 0.08]}>
              <meshStandardMaterial color="#8B4513" roughness={0.8} />
            </Sphere>
          )}
        </group>
      </group>
      
      {/* Neck - more realistic */}
      <Cylinder args={[0.16, 0.19, 0.28, 20]} position={[0, 1.3, 0]}>
        <meshStandardMaterial color={skinColor} roughness={0.3} />
      </Cylinder>
      
      {/* Torso with shirt - better shape */}
      <group position={[0, 0.85, 0]}>
        <Box args={[0.65, 0.95, 0.38]} castShadow>
          <meshStandardMaterial color={shirtColor} roughness={0.6} />
        </Box>
        {/* Shirt collar */}
        <Box args={[0.2, 0.08, 0.05]} position={[0, 0.45, 0.19]}>
          <meshStandardMaterial color={shirtColor} />
        </Box>
      </group>
      
      {/* Shoulders - more realistic */}
      <Sphere args={[0.2, 20, 20]} position={[-0.42, 1.25, 0]}>
        <meshStandardMaterial color={shirtColor} roughness={0.6} />
      </Sphere>
      <Sphere args={[0.2, 20, 20]} position={[0.42, 1.25, 0]}>
        <meshStandardMaterial color={shirtColor} roughness={0.6} />
      </Sphere>
      
      {/* Visible organs through transparent chest */}
      <group position={[0, 0.95, 0.2]}>
        <Sphere args={[0.13, 16, 16]} position={[-0.12, 0.1, 0]}>
          <meshStandardMaterial color={lungsColor} transparent opacity={0.5} emissive={lungsColor} emissiveIntensity={aqi > 100 ? 0.4 : 0} />
        </Sphere>
        <Sphere args={[0.13, 16, 16]} position={[0.12, 0.1, 0]}>
          <meshStandardMaterial color={lungsColor} transparent opacity={0.5} emissive={lungsColor} emissiveIntensity={aqi > 100 ? 0.4 : 0} />
        </Sphere>
        <Sphere args={[0.09, 16, 16]} position={[0, 0, 0.05]}>
          <meshStandardMaterial color={heartColor} emissive={heartColor} emissiveIntensity={aqi > 150 ? 0.6 : 0.2} />
        </Sphere>
      </group>
      
      {/* Pelvis - better shape */}
      <Box args={[0.6, 0.32, 0.35]} position={[0, 0.3, 0]}>
        <meshStandardMaterial color={pantsColor} roughness={0.75} />
      </Box>
      
      {/* Legs with pants - more realistic */}
      <group>
        {/* Left leg */}
        <group ref={leftLegRef} position={[-0.19, 0.4, 0]}>
          <Cylinder args={[0.14, 0.12, 0.52, 20]} position={[0, 0.26, 0]}>
            <meshStandardMaterial color={pantsColor} roughness={0.75} />
          </Cylinder>
          <Sphere args={[0.13, 16, 16]} position={[0, 0, 0]}>
            <meshStandardMaterial color={pantsColor} />
          </Sphere>
          <Cylinder args={[0.12, 0.1, 0.52, 20]} position={[0, -0.26, 0]}>
            <meshStandardMaterial color={pantsColor} roughness={0.75} />
          </Cylinder>
          {/* Left foot */}
          <group position={[0, -0.48, 0]}>
            <Box args={[0.14, 0.1, 0.26]} position={[0, 0, 0.06]}>
              <meshStandardMaterial color="#1a1a1a" roughness={0.4} />
            </Box>
            <Sphere args={[0.08, 16, 16]} position={[0, 0, 0.15]} scale={[1, 0.8, 1.2]}>
              <meshStandardMaterial color="#1a1a1a" roughness={0.4} />
            </Sphere>
          </group>
        </group>
        
        {/* Right leg */}
        <group ref={rightLegRef} position={[0.19, 0.4, 0]}>
          <Cylinder args={[0.14, 0.12, 0.52, 20]} position={[0, 0.26, 0]}>
            <meshStandardMaterial color={pantsColor} roughness={0.75} />
          </Cylinder>
          <Sphere args={[0.13, 16, 16]} position={[0, 0, 0]}>
            <meshStandardMaterial color={pantsColor} />
          </Sphere>
          <Cylinder args={[0.12, 0.1, 0.52, 20]} position={[0, -0.26, 0]}>
            <meshStandardMaterial color={pantsColor} roughness={0.75} />
          </Cylinder>
          {/* Right foot */}
          <group position={[0, -0.48, 0]}>
            <Box args={[0.14, 0.1, 0.26]} position={[0, 0, 0.06]}>
              <meshStandardMaterial color="#1a1a1a" roughness={0.4} />
            </Box>
            <Sphere args={[0.08, 16, 16]} position={[0, 0, 0.15]} scale={[1, 0.8, 1.2]}>
              <meshStandardMaterial color="#1a1a1a" roughness={0.4} />
            </Sphere>
          </group>
        </group>
      </group>
      
      {/* Arms - more realistic */}
      <group>
        {/* Left arm */}
        <group ref={leftArmRef} position={[-0.52, 1.02, 0]}>
          <Cylinder args={[0.11, 0.1, 0.48, 20]} position={[0, 0, 0]} rotation={[0, 0, 0.35]}>
            <meshStandardMaterial color={shirtColor} roughness={0.6} />
          </Cylinder>
          <Sphere args={[0.11, 16, 16]} position={[-0.1, -0.22, 0]}>
            <meshStandardMaterial color={shirtColor} />
          </Sphere>
          <Cylinder args={[0.1, 0.09, 0.42, 20]} position={[-0.2, -0.44, 0]} rotation={[0, 0, 0.25]}>
            <meshStandardMaterial color={skinColor} roughness={0.3} />
          </Cylinder>
          <Sphere args={[0.09, 16, 16]} position={[-0.3, -0.64, 0]}>
            <meshStandardMaterial color={skinColor} />
          </Sphere>
          {/* Left hand */}
          <Box args={[0.08, 0.12, 0.06]} position={[-0.36, -0.74, 0]}>
            <meshStandardMaterial color={skinColor} roughness={0.3} />
          </Box>
          <Cylinder args={[0.015, 0.015, 0.08, 8]} position={[-0.36, -0.84, 0.02]} rotation={[0.3, 0, 0]}>
            <meshStandardMaterial color={skinColor} />
          </Cylinder>
          <Cylinder args={[0.015, 0.015, 0.08, 8]} position={[-0.36, -0.84, 0.01]} rotation={[0.2, 0, 0]}>
            <meshStandardMaterial color={skinColor} />
          </Cylinder>
          <Cylinder args={[0.015, 0.015, 0.08, 8]} position={[-0.36, -0.84, 0]} rotation={[0.1, 0, 0]}>
            <meshStandardMaterial color={skinColor} />
          </Cylinder>
          <Cylinder args={[0.015, 0.015, 0.08, 8]} position={[-0.36, -0.84, -0.01]} rotation={[0, 0, 0]}>
            <meshStandardMaterial color={skinColor} />
          </Cylinder>
          <Cylinder args={[0.012, 0.012, 0.05, 8]} position={[-0.36, -0.8, 0.03]} rotation={[1, 0, 0]}>
            <meshStandardMaterial color={skinColor} />
          </Cylinder>
        </group>
        
        {/* Right arm */}
        <group ref={rightArmRef} position={[0.52, 1.02, 0]}>
          <Cylinder args={[0.11, 0.1, 0.48, 20]} position={[0, 0, 0]} rotation={[0, 0, -0.35]}>
            <meshStandardMaterial color={shirtColor} roughness={0.6} />
          </Cylinder>
          <Sphere args={[0.11, 16, 16]} position={[0.1, -0.22, 0]}>
            <meshStandardMaterial color={shirtColor} />
          </Sphere>
          <Cylinder args={[0.1, 0.09, 0.42, 20]} position={[0.2, -0.44, 0]} rotation={[0, 0, -0.25]}>
            <meshStandardMaterial color={skinColor} roughness={0.3} />
          </Cylinder>
          <Sphere args={[0.09, 16, 16]} position={[0.3, -0.64, 0]}>
            <meshStandardMaterial color={skinColor} />
          </Sphere>
          {/* Right hand */}
          <Box args={[0.08, 0.12, 0.06]} position={[0.36, -0.74, 0]}>
            <meshStandardMaterial color={skinColor} roughness={0.3} />
          </Box>
          <Cylinder args={[0.015, 0.015, 0.08, 8]} position={[0.36, -0.84, 0.02]} rotation={[0.3, 0, 0]}>
            <meshStandardMaterial color={skinColor} />
          </Cylinder>
          <Cylinder args={[0.015, 0.015, 0.08, 8]} position={[0.36, -0.84, 0.01]} rotation={[0.2, 0, 0]}>
            <meshStandardMaterial color={skinColor} />
          </Cylinder>
          <Cylinder args={[0.015, 0.015, 0.08, 8]} position={[0.36, -0.84, 0]} rotation={[0.1, 0, 0]}>
            <meshStandardMaterial color={skinColor} />
          </Cylinder>
          <Cylinder args={[0.015, 0.015, 0.08, 8]} position={[0.36, -0.84, -0.01]} rotation={[0, 0, 0]}>
            <meshStandardMaterial color={skinColor} />
          </Cylinder>
          <Cylinder args={[0.012, 0.012, 0.05, 8]} position={[0.36, -0.8, 0.03]} rotation={[1, 0, 0]}>
            <meshStandardMaterial color={skinColor} />
          </Cylinder>
        </group>
      </group>
      
      {/* Coughing particles */}
      {aqi > 100 && (
        <points position={[0, 1.42, 0.45]}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={25}
              array={new Float32Array([...Array(75)].map((_, i) => i % 3 === 2 ? Math.random() * 0.6 : (Math.random() - 0.5) * 0.35))}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial size={0.06} color="#ff0000" opacity={0.7} transparent />
        </points>
      )}
      
      {/* 3D Health effect visualization */}
      {aqi > 50 && (
        <>
          {/* Pollution cloud around person */}
          <Sphere args={[1.2, 24, 24]} position={[0, 1, 0]}>
            <meshStandardMaterial 
              color={aqi < 100 ? '#cccccc' : aqi < 150 ? '#999999' : '#666666'} 
              transparent 
              opacity={aqi > 100 ? 0.15 : 0.08} 
              emissive="#666666" 
              emissiveIntensity={aqi > 150 ? 0.3 : 0.1}
            />
          </Sphere>
          
          {/* Toxic particles */}
          {aqi > 100 && (
            <points position={[0, 1, 0]}>
              <bufferGeometry>
                <bufferAttribute
                  attach="attributes-position"
                  count={50}
                  array={new Float32Array([...Array(150)].map(() => (Math.random() - 0.5) * 2))}
                  itemSize={3}
                />
              </bufferGeometry>
              <pointsMaterial size={0.08} color="#ff6600" opacity={0.6} transparent />
            </points>
          )}
        </>
      )}
      
      {/* Click area */}
      <mesh position={[0, 1, 0]} onClick={onClick}>
        <boxGeometry args={[1.2, 2.5, 0.8]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </group>
  );
}

export default function SimulationPage() {
  const [aqi, setAqi] = useState(50);
  const [garbage, setGarbage] = useState(20);
  const [showHumanDetail, setShowHumanDetail] = useState(false);

  const getHealthStatus = () => {
    if (aqi < 50 && garbage < 30) return {
      status: 'Healthy',
      color: 'text-green-400',
      bodyParts: [
        { part: '🫁 Lungs', effect: 'Normal function, clean air intake', severity: 'good' },
        { part: '❤️ Heart', effect: 'Regular heartbeat, good circulation', severity: 'good' },
        { part: '👁️ Eyes', effect: 'Clear vision, no irritation', severity: 'good' },
        { part: '🧠 Brain', effect: 'Sharp focus, good cognitive function', severity: 'good' }
      ],
      environment: ['Clean air', 'Green vegetation', 'Healthy ecosystem']
    };
    if (aqi < 100 && garbage < 60) return {
      status: 'Moderate',
      color: 'text-yellow-400',
      bodyParts: [
        { part: '🫁 Lungs', effect: 'Slight irritation, mild coughing', severity: 'moderate' },
        { part: '❤️ Heart', effect: 'Slightly elevated heart rate', severity: 'moderate' },
        { part: '👁️ Eyes', effect: 'Minor watering, mild discomfort', severity: 'moderate' },
        { part: '🧠 Brain', effect: 'Reduced concentration', severity: 'moderate' }
      ],
      environment: ['Visible smog', 'Reduced plant health', 'Water contamination begins']
    };
    if (aqi < 150) return {
      status: 'Unhealthy',
      color: 'text-orange-400',
      bodyParts: [
        { part: '🫁 Lungs', effect: 'Difficulty breathing, persistent cough', severity: 'bad' },
        { part: '❤️ Heart', effect: 'Irregular heartbeat, chest pain', severity: 'bad' },
        { part: '👁️ Eyes', effect: 'Burning sensation, redness', severity: 'bad' },
        { part: '🧠 Brain', effect: 'Headaches, dizziness', severity: 'bad' },
        { part: '🤧 Throat', effect: 'Sore throat, inflammation', severity: 'bad' }
      ],
      environment: ['Heavy smog layer', 'Dead vegetation', 'Toxic waste accumulation', 'Wildlife decline']
    };
    if (aqi < 200) return {
      status: 'Very Unhealthy',
      color: 'text-red-400',
      bodyParts: [
        { part: '🫁 Lungs', effect: 'Severe respiratory distress, wheezing', severity: 'critical' },
        { part: '❤️ Heart', effect: 'Heart palpitations, risk of attack', severity: 'critical' },
        { part: '👁️ Eyes', effect: 'Severe irritation, vision problems', severity: 'critical' },
        { part: '🧠 Brain', effect: 'Severe headaches, cognitive impairment', severity: 'critical' },
        { part: '🩸 Blood', effect: 'Reduced oxygen levels', severity: 'critical' },
        { part: '🦴 Bones', effect: 'Weakening due to toxins', severity: 'critical' }
      ],
      environment: ['Toxic air quality', 'Complete vegetation death', 'Contaminated water sources', 'Mass wildlife extinction']
    };
    return {
      status: 'Hazardous',
      color: 'text-red-600',
      bodyParts: [
        { part: '🫁 Lungs', effect: 'Critical failure, permanent damage', severity: 'critical' },
        { part: '❤️ Heart', effect: 'Heart failure risk, stroke danger', severity: 'critical' },
        { part: '👁️ Eyes', effect: 'Permanent damage, blindness risk', severity: 'critical' },
        { part: '🧠 Brain', effect: 'Neurological damage, memory loss', severity: 'critical' },
        { part: '🩸 Blood', effect: 'Blood poisoning, organ failure', severity: 'critical' },
        { part: '🦴 Bones', effect: 'Severe weakening, fracture risk', severity: 'critical' },
        { part: '🧬 DNA', effect: 'Genetic mutations, cancer risk', severity: 'critical' }
      ],
      environment: ['Uninhabitable conditions', 'Total ecosystem collapse', 'Acid rain', 'Soil degradation', 'No life support']
    };
  };

  const health = getHealthStatus();

  return (
    <div className="space-y-3">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-3">
        <h2 className="text-xl font-bold text-white">🏙️ City Health Simulation</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-lg overflow-hidden relative" style={{ height: '70vh' }}>
          {showHumanDetail && (
            <button onClick={() => setShowHumanDetail(false)} className="absolute top-4 left-4 z-10 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-semibold shadow-lg">
              ← Back to City
            </button>
          )}
          <Canvas camera={{ position: showHumanDetail ? [0, 2, 5] : [12, 6, 14], fov: 60 }} shadows>
            <Suspense fallback={null}>
              {!showHumanDetail ? (
                <>
                  <City aqi={aqi} garbage={garbage} />
                  <Human aqi={aqi} garbage={garbage} onClick={() => setShowHumanDetail(true)} />
                  
                  {/* Walking people on sidewalks along the road */}
                  <WalkingPerson startX={-10} startZ={6.3} aqi={aqi} garbage={garbage} speed={0.02} isChild={false} direction={1} />
                  <WalkingPerson startX={5} startZ={10.3} aqi={aqi} garbage={garbage} speed={0.025} isChild={false} direction={-1} />
                  <WalkingPerson startX={-5} startZ={6.3} aqi={aqi} garbage={garbage} speed={0.018} isChild={true} direction={1} />
                  <WalkingPerson startX={8} startZ={10.3} aqi={aqi} garbage={garbage} speed={0.015} isChild={true} direction={-1} />
                  
                  {/* Playing children in park */}
                  {garbage < 60 && (
                    <>
                      <PlayingChild position={[-23, 0.3, -5]} aqi={aqi} garbage={garbage} action="jump" />
                      <PlayingChild position={[-21, 0.3, -3]} aqi={aqi} garbage={garbage} action="run" />
                      <PlayingChild position={[-25, 0.3, -4]} aqi={aqi} garbage={garbage} action="stand" />
                      <PlayingChild position={[-22, 0.3, -7]} aqi={aqi} garbage={garbage} action="jump" />
                      <PlayingChild position={[-24, 0.3, -6]} aqi={aqi} garbage={garbage} action="run" />
                    </>
                  )}
                </>
              ) : (
                <>
                  <ambientLight intensity={0.5} />
                  <directionalLight position={[5, 5, 5]} intensity={1} />
                  <HumanDetailed aqi={aqi} garbage={garbage} />
                </>
              )}
              <OrbitControls enablePan={false} minDistance={3} maxDistance={20} />
            </Suspense>
          </Canvas>
        </div>

        <div className="space-y-3">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-3">
            <h3 className="text-base font-bold text-white mb-2">Controls</h3>
            
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-gray-300 text-sm font-semibold">Air Quality Index</label>
                  <div className={`px-3 py-1 rounded-full text-sm font-bold ${
                    aqi < 50 ? 'bg-green-500 text-white' :
                    aqi < 100 ? 'bg-yellow-500 text-black' :
                    aqi < 150 ? 'bg-orange-500 text-white' :
                    aqi < 200 ? 'bg-red-500 text-white' :
                    aqi < 300 ? 'bg-purple-600 text-white' :
                    'bg-red-900 text-white'
                  }`}>
                    {aqi}
                  </div>
                </div>
                <input
                  type="range"
                  min="0"
                  max="300"
                  value={aqi}
                  onChange={(e) => setAqi(parseInt(e.target.value))}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, 
                      #22c55e 0%, #22c55e 16.67%, 
                      #eab308 16.67%, #eab308 33.33%, 
                      #f97316 33.33%, #f97316 50%, 
                      #ef4444 50%, #ef4444 66.67%, 
                      #9333ea 66.67%, #9333ea 83.33%, 
                      #7f1d1d 83.33%, #7f1d1d 100%)`
                  }}
                />
                <div className="grid grid-cols-6 gap-1 text-xs mt-2">
                  <div className="text-center">
                    <div className="w-full h-1 bg-green-500 rounded mb-1"></div>
                    <div className="text-gray-400">0-50<br/>Good</div>
                  </div>
                  <div className="text-center">
                    <div className="w-full h-1 bg-yellow-500 rounded mb-1"></div>
                    <div className="text-gray-400">51-100<br/>Moderate</div>
                  </div>
                  <div className="text-center">
                    <div className="w-full h-1 bg-orange-500 rounded mb-1"></div>
                    <div className="text-gray-400">101-150<br/>Unhealthy</div>
                  </div>
                  <div className="text-center">
                    <div className="w-full h-1 bg-red-500 rounded mb-1"></div>
                    <div className="text-gray-400">151-200<br/>Very Bad</div>
                  </div>
                  <div className="text-center">
                    <div className="w-full h-1 bg-purple-600 rounded mb-1"></div>
                    <div className="text-gray-400">201-300<br/>Severe</div>
                  </div>
                  <div className="text-center">
                    <div className="w-full h-1 bg-red-900 rounded mb-1"></div>
                    <div className="text-gray-400">300+<br/>Hazardous</div>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-gray-300 text-sm mb-2 block">Garbage Level: {garbage}%</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={garbage}
                  onChange={(e) => setGarbage(parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Clean</span>
                  <span>Polluted</span>
                </div>
              </div>
            </div>
          </div>

          <div className={`bg-gray-900 border border-gray-800 rounded-lg p-3`}>
            <h3 className="text-base font-bold text-white mb-2">Health Status</h3>
            <div className={`text-lg font-bold ${health.color} mb-2`}>{health.status}</div>
            
            <h4 className="text-xs font-bold text-gray-400 mb-1">Body Parts Affected:</h4>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {health.bodyParts.map((item, i) => (
                <div key={i} className={`p-2 rounded ${
                  item.severity === 'good' ? 'bg-green-500/10' :
                  item.severity === 'moderate' ? 'bg-yellow-500/10' :
                  item.severity === 'bad' ? 'bg-orange-500/10' : 'bg-red-500/10'
                }`}>
                  <div className="font-bold text-white text-xs">{item.part}</div>
                  <div className="text-gray-400 text-xs">{item.effect}</div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-3">
            <h3 className="text-base font-bold text-white mb-2">Environment Impact</h3>
            <div className="space-y-1">
              {health.environment.map((effect, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-red-400 text-xs">•</span>
                  <span className="text-gray-300 text-xs">{effect}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-2">
            <h4 className="font-bold text-blue-400 mb-1 text-xs">💡 Tip</h4>
            <p className="text-xs text-gray-300">{showHumanDetail ? 'Viewing detailed anatomy. ' : 'Click human for details. '}Drag to rotate!</p>
          </div>
        </div>
      </div>
    </div>
  );
}