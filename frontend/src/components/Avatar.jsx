import React from "react";
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { Canvas } from "@react-three/fiber";
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
<<<<<<< HEAD
                {/* <OrbitControls /> */}
=======
                <OrbitControls />
>>>>>>> 4166ee4ae0465d0b97d003c8d64faf01934fad08
                <directionalLight position={[0, 5, 5]} intensity={3} />
                <Model />
            </Canvas>
        </>
    )
}

export default Avatar;