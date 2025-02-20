import React, { useRef, useState, useEffect } from "react";
import { useGLTF, useAnimations, OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { AnimationMixer, LoopRepeat } from 'three';
import Model from "./Model";

function Avatar() {
    return (
        <>
            <Canvas>
                <PerspectiveCamera
                    makeDefault
                    position={[0, 0, 10]}
                    fov={50}
                />
                <OrbitControls />
                <directionalLight position={[1, 5, 5]} intensity={3} />
                <Model />
            </Canvas>
        </>
    )
}

export default Avatar;