import React from "react";
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { Canvas } from "@react-three/fiber";
import Model from "./Model";
import Model2 from "./Model2";

function Avatar() {
    return (
        <Canvas>
            <PerspectiveCamera
                makeDefault
                position={[0, 0, 10]}
                fov={50}
            />
            {/* <OrbitControls /> */}
            <directionalLight position={[0, 10, 10]} intensity={5} />
            <Model2 />
        </Canvas>
    )
}

export default Avatar;