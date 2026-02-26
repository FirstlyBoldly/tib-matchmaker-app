import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Text, Environment, Grid, Html } from '@react-three/drei';
import * as THREE from 'three';




const Floor = ({ level, position }) => {
    return (
        <group position={position}>
            {/* Floor Base */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                <planeGeometry args={[100, 100]} />
                <meshStandardMaterial color="#f0f0f0" transparent opacity={0.8} />
            </mesh>
            {/* Grid for tech feel */}
            <Grid position={[0, 0.05, 0]} args={[100, 100]} cellColor="#e0e0e0" sectionColor="#cccccc" />

            {/* Rooms/Structures */}
            {ROOMS.filter(r => r.floor === level).map((room, idx) => (
                <group key={idx} position={room.position}>
                    <mesh>
                        <boxGeometry args={room.size} />
                        <meshStandardMaterial color={ROOM_TYPES[room.type].color} transparent opacity={0.6} />
                    </mesh>
                    <Text
                        position={[0, room.size[1] / 2 + 0.1, 0]}
                        rotation={[-Math.PI / 2, 0, 0]}
                        fontSize={2}
                        color="black" // Darker text for better contrast on colors
                        fontWeight="bold"
                    >
                        {room.name}
                    </Text>

                    {/* Entrance Gate/Wedge */}
                    {room.entrance && (
                        <group position={[
                            room.entrance.x - room.position[0], // Local X
                            -room.size[1] / 2, // Bottom of room
                            room.entrance.z - room.position[2]  // Local Z
                        ]}>
                            {/* Visual Marker for Entrance */}
                            <mesh position={[0, 0.1, 0]}>
                                <boxGeometry args={[
                                    room.entrance.orientation === 'horizontal' ? room.entrance.width : 2,
                                    0.2,
                                    room.entrance.orientation === 'vertical' ? room.entrance.width : 2
                                ]} />
                                <meshStandardMaterial color="#888888" emissive="#888888" emissiveIntensity={0.2} />
                            </mesh>
                            {/* Wedge/Arrow pointing in - optional, just a door frame for now */}
                            <mesh position={[0, 1.5, 0]}>
                                <boxGeometry args={[
                                    room.entrance.orientation === 'horizontal' ? room.entrance.width : 0.5,
                                    3,
                                    room.entrance.orientation === 'vertical' ? room.entrance.width : 0.5
                                ]} />
                                <meshStandardMaterial color={ROOM_TYPES[room.type].color} transparent opacity={0.3} />
                            </mesh>
                        </group>
                    )}
                </group>
            ))}

            {/* Floor Label */}
            <Text position={[-45, 1, 45]} fontSize={4} color="#000" rotation={[-Math.PI / 2, 0, 0]}>
                Floor {level}
            </Text>
        </group>
    );
};

const UserMarker = ({ user, isSelected, onClick }) => {
    const ref = useRef();

    useFrame((state) => {
        if (ref.current) {
            // Floating animation (local position relative to group)
            ref.current.position.y = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.2;
        }
    });

    return (
        <group position={user.position} onClick={onClick}>
            <mesh ref={ref}>
                <sphereGeometry args={[0.6, 32, 32]} />
                <meshStandardMaterial
                    color={isSelected ? "#ff0000" : "#ff4444"}
                    emissive={isSelected ? "#ff0000" : "#000000"}
                    emissiveIntensity={isSelected ? 1 : 0}
                />
            </mesh>

            {/* Profile Picture Overlay */}
            <Html position={[0, 2.5, 0]} center distanceFactor={15}>
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        transform: 'translate3d(-50%, -50%, 0)', // Centering
                        cursor: 'pointer',
                        pointerEvents: 'auto',
                    }}
                    onClick={(e) => {
                        e.stopPropagation();
                        onClick(e);
                    }}
                >
                    {/* Avatar Box */}
                    <div style={{
                        width: '100px',
                        height: '100px',
                        borderRadius: '24px',
                        overflow: 'hidden',
                        border: '4px solid white',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                        background: '#fff',
                        marginBottom: '8px'
                    }}>
                        <img
                            src={user.imageUrl}
                            alt={user.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    </div>

                    {/* Name Badge */}
                    <div style={{
                        background: 'rgba(0,0,0,0.7)',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        whiteSpace: 'nowrap',
                        backdropFilter: 'blur(4px)'
                    }}>
                        {user.name}
                    </div>
                </div>
            </Html>

            {/* Pulse effect ring */}
            <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.8, 1, 32]} />
                <meshBasicMaterial color="#ff0000" transparent opacity={0.3} side={THREE.DoubleSide} />
            </mesh>
        </group>
    );
};

import { ROOM_TYPES, ROOMS, ESCALATORS } from '../data/mapData';

const Escalator = ({ data, showLabel }) => {
    // Calculate mid-point and length for the ramp
    const start = new THREE.Vector3(...data.bottom);
    const end = new THREE.Vector3(...data.top);
    const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
    const distance = start.distanceTo(end);

    // Look at logic for rotation
    const dummy = new THREE.Object3D();
    dummy.position.copy(mid);
    dummy.lookAt(end);

    return (
        <group>
            {/* Visual Ramp */}
            <mesh position={mid} rotation={dummy.rotation}>
                <boxGeometry args={[1.5, 1, distance]} />
                <meshStandardMaterial color="#666" transparent opacity={0.6} />
            </mesh>
            {/* Visual Steps/Details (Simplified as stripes) */}
            <group position={mid} rotation={dummy.rotation}>
                <Grid args={[1.6, distance]} sectionColor="#444" cellColor="#666" position={[0, 0.51, 0]} rotation={[-Math.PI / 2, 0, 0]} />
            </group>
            {/* Indicators - Only show if floor logic permits */}
            {showLabel && (
                <Html position={[mid.x, mid.y + 2, mid.z]}>
                    <div style={{ background: 'rgba(0,0,0,0.6)', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '10px' }}>
                        Escalator
                    </div>
                </Html>
            )}
        </group>
    );
};

import { findPath } from '../utils/pathfinding';

const NavigationPath = ({ start, end }) => {
    const startVec = new THREE.Vector3(...start);
    const endVec = new THREE.Vector3(...end);

    // Simple logic to detect floors based on Y height (0, 10, 20)
    const startFloor = Math.round(startVec.y / 10) + 1;
    const endFloor = Math.round(endVec.y / 10) + 1;

    let points = [];

    if (startFloor === endFloor) {
        // Same Floor: Use A* Pathfinding to avoid rooms
        points = findPath(startVec, endVec, ROOMS, startFloor);
    } else {
        // Different Floors: Find path via escalators
        let currentPos = startVec.clone();
        let currentFloor = startFloor;
        points.push(currentPos);

        const goingUp = endFloor > startFloor;

        while (currentFloor !== endFloor) {
            const nextFloor = goingUp ? currentFloor + 1 : currentFloor - 1;
            const escalator = ESCALATORS.find(e =>
                e.levels.includes(currentFloor) && e.levels.includes(nextFloor)
            );

            if (escalator) {
                const entry = goingUp ? new THREE.Vector3(...escalator.bottom) : new THREE.Vector3(...escalator.top);
                const exit = goingUp ? new THREE.Vector3(...escalator.top) : new THREE.Vector3(...escalator.bottom);

                // Pathfind to escalator entry
                const legPoints = findPath(currentPos, entry, ROOMS, currentFloor);
                // legPoints includes start and end, so ignore start to avoid dupes if we pushed
                points.push(...legPoints.slice(1));

                // Add Escalator Ride
                points.push(exit);

                currentPos = exit;
                currentFloor = nextFloor;
            } else {
                break;
            }
        }

        // Final leg to destination (on new floor)
        const finalLeg = findPath(currentPos, endVec, ROOMS, endFloor);
        points.push(...finalLeg.slice(1));
    }

    // VALIDATION: Filter undefined/null points
    const validPoints = points.filter(p => p && typeof p.x === 'number' && typeof p.y === 'number' && typeof p.z === 'number');

    // DEDUPLICATION: Remove consecutive identical points
    const uniquePoints = [];
    if (validPoints.length > 0) {
        uniquePoints.push(validPoints[0]);
        for (let i = 1; i < validPoints.length; i++) {
            if (validPoints[i].distanceTo(uniquePoints[uniquePoints.length - 1]) > 0.1) {
                uniquePoints.push(validPoints[i]);
            }
        }
    }

    if (uniquePoints.length < 2) {
        // Fallback or Don't render
        return null;
    }

    // Generate Curve from points
    // A* returns many points, CatmullRom smooths them
    // Use smaller tension for smoother path around corners
    const curve = new THREE.CatmullRomCurve3(uniquePoints, false, 'catmullrom', 0.2);

    const tubeGeometry = new THREE.TubeGeometry(curve, 128, 0.4, 8, false);

    // Arrow Head Logic - Place at end
    const tangent = curve.getTangent(1).normalize();
    const arrowPos = endVec.clone();
    const up = new THREE.Vector3(0, 1, 0);
    const quaternion = new THREE.Quaternion().setFromUnitVectors(up, tangent);

    return (
        <group>
            {/* Path Line */}
            <mesh geometry={tubeGeometry}>
                <meshStandardMaterial
                    color="#ff0000"
                    emissive="#ff0000"
                    emissiveIntensity={0.8}
                    transparent
                    opacity={0.6}
                />
            </mesh>

            {/* Arrow Head */}
            <mesh position={arrowPos} quaternion={quaternion}>
                <coneGeometry args={[0.8, 2, 32]} />
                <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={1} />
            </mesh>

            {/* Waypoints for debugging/tech feel (optional) */}
            {validPoints.map((p, i) => (
                <mesh key={i} position={p}>
                    <sphereGeometry args={[0.5]} />
                    <meshBasicMaterial color={i === 0 ? "blue" : i === validPoints.length - 1 ? "green" : "yellow"} />
                </mesh>
            ))}
        </group>
    );
};

const Scene = ({ mode, users, currentUser, selectedUser, onUserSelect }) => {
    // Determine target position for user 1 (You)
    const myPos = currentUser ? currentUser.position : [0, 0, 0];
    const currentFloor = currentUser ? currentUser.floor : 1;

    // Determine if we should be in 2D or 3D mode
    // 2D Mode: Dashboard OR Navigation on same floor
    // 3D Mode: Navigation on different floor
    const is3DMode = mode === 'navigation' && selectedUser && selectedUser.floor !== currentFloor;

    // Visibility Logic
    // Render everything up to the MAX relevant floor.
    // If I am on F1, see F1.
    // If I am on F1 looking at F2, see F1 and F2.
    // If I am on F3, see F1, F2, F3.
    const targetFloor = selectedUser ? selectedUser.floor : currentFloor;
    const maxVisibleFloor = Math.max(currentFloor, targetFloor);

    return (
        <>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 20, 10]} intensity={1} />

            {/* Floor Visibility */}
            <group visible={maxVisibleFloor >= 1}>
                <Floor level={1} position={[0, 0, 0]} />
            </group>

            <group visible={maxVisibleFloor >= 2}>
                <Floor level={2} position={[0, 10, 0]} />
            </group>

            <group visible={maxVisibleFloor >= 3}>
                <Floor level={3} position={[0, 20, 0]} />
            </group>

            {/* Escalators */}
            {/* F1->F2 connections (Visible on F1, always show label to indicate upward path) */}
            <group visible={maxVisibleFloor >= 1}>
                <Escalator data={ESCALATORS[0]} showLabel={maxVisibleFloor >= 1} />
            </group>
            {/* F2->F3 connection (Visible on F2, always show label) */}
            <group visible={maxVisibleFloor >= 2}>
                <Escalator data={ESCALATORS[1]} showLabel={maxVisibleFloor >= 2} />
            </group>

            {/* You - Enhanced Marker */}
            <group position={myPos}>
                <mesh>
                    <sphereGeometry args={[1, 32, 32]} />
                    <meshStandardMaterial color="#00ffff" emissive="#00aaaa" emissiveIntensity={0.5} />
                </mesh>

                {/* Floating Label */}
                <Html position={[0, 2.5, 0]} center distanceFactor={15}>
                    <div style={{
                        background: 'rgba(0, 255, 255, 0.8)',
                        color: 'black',
                        padding: '4px 8px',
                        borderRadius: '8px',
                        fontWeight: 'bold',
                        fontSize: '12px',
                        whiteSpace: 'nowrap',
                        boxShadow: '0 0 10px rgba(0, 255, 255, 0.5)'
                    }}>
                        You
                    </div>
                </Html>

                {/* Pulse Effect */}
                <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[1.2, 1.5, 32]} />
                    <meshBasicMaterial color="#00ffff" transparent opacity={0.4} side={THREE.DoubleSide} />
                </mesh>
            </group>

            {/* Other Users */}
            {users.map(user => {
                // Visibility Logic: Only show users on visible floors
                const isVisible = user.floor <= maxVisibleFloor;

                return isVisible && (
                    <UserMarker
                        key={user.id}
                        user={user}
                        isSelected={selectedUser && selectedUser.id === user.id}
                        onClick={(e) => {
                            e.stopPropagation();
                            onUserSelect(user);
                        }}
                    />
                );
            })}

            {/* Navigation Path */}
            {mode === 'navigation' && selectedUser && (
                <NavigationPath start={myPos} end={selectedUser.position} />
            )}

            <Environment preset="city" />
        </>
    );
};

const MapView = ({ mode, users, currentUser, selectedUser, onUserSelect }) => {
    // Default to center if no current user, or current user pos
    const target = currentUser ? currentUser.position : [0, 0, 0];
    const currentFloor = currentUser ? currentUser.floor : 1;

    // Determine View Mode
    const is3DMode = mode === 'navigation' && selectedUser && selectedUser.floor !== currentFloor;

    // Camera settings based on mode
    // 2D: Top down, fixed rotation
    // 3D: Perspective, free rotation (limited)

    // We can use a reference to animate the controls or camera properties
    // For simplicity in this PoC without extra animation libs, we'll pass props to OrbitControls
    // standard Three.js interpolation could be added in a useFrame hook within a wrapper if needed for smoothness.
    // OrbitControls interpolates `target` automatically if damping is on.
    // For camera position, we might need a distinct component to animate it.

    return (
        <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 40, 0], fov: 50 }} gl={{ alpha: true }} style={{ background: 'transparent' }}>
            <CameraController is3DMode={is3DMode} target={target} />
            <Scene mode={mode} users={users} currentUser={currentUser} selectedUser={selectedUser} onUserSelect={onUserSelect} />
        </Canvas>
    );
};

// Component to handle smooth camera transitions
const CameraController = ({ is3DMode, target }) => {
    const { camera, gl } = useThree();
    const controlsRef = useRef();
    const animationRef = useRef({ active: false, startTime: 0, startPos: null, startTarget: null, endPos: null, endTarget: null });

    // Handle prop changes to trigger animation
    useEffect(() => {
        if (!controlsRef.current) return;

        // Unlock angles to allow full control
        controlsRef.current.minPolarAngle = 0;
        controlsRef.current.maxPolarAngle = Math.PI; // Allow full rotation

        const startPos = camera.position.clone();
        const startTarget = controlsRef.current.target.clone();
        const endTarget = new THREE.Vector3(target[0], target[1], target[2]);

        // Calculate desired end camera position
        let endCamPos;
        if (is3DMode) {
            endCamPos = new THREE.Vector3(target[0], target[1] + 15, target[2] + 25);
        } else {
            // 2D: High above
            endCamPos = new THREE.Vector3(target[0], target[1] + 40, target[2]);
        }

        animationRef.current = {
            active: true,
            startTime: performance.now(),
            startPos,
            startTarget,
            endPos: endCamPos,
            endTarget,
            duration: 1000 // 1 second transition
        };

    }, [is3DMode, target[0], target[1], target[2]]);

    useFrame(() => {
        if (!controlsRef.current || !animationRef.current.active) return;

        const now = performance.now();
        const progress = Math.min((now - animationRef.current.startTime) / animationRef.current.duration, 1);

        // Easing (SmoothStep)
        const t = progress * progress * (3 - 2 * progress);

        if (animationRef.current.startPos && animationRef.current.endPos) {
            camera.position.lerpVectors(animationRef.current.startPos, animationRef.current.endPos, t);
        }

        if (animationRef.current.startTarget && animationRef.current.endTarget) {
            controlsRef.current.target.lerpVectors(animationRef.current.startTarget, animationRef.current.endTarget, t);
        }

        controlsRef.current.update();

        if (progress >= 1) {
            animationRef.current.active = false;
        }
    });

    return (
        <OrbitControls
            ref={controlsRef}
            args={[camera, gl.domElement]}
            enableDamping={true}
            dampingFactor={0.05}
            enableZoom={true}
            enablePan={true}
            enableRotate={true}
        />
    );
};

export default MapView;
