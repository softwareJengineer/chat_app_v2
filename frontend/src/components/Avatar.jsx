import React from "react";
import { useGLTF, OrbitControls, Environment } from '@react-three/drei';
import { Canvas, useLoader } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

export function Model(props) {
    const { nodes, materials } = useGLTF('/models/robot_model.glb');

    console.log(nodes, materials);

    return (
        <group {...props} dispose={null}>
        <primitive object={nodes.avatarModel_shell} />
        <skinnedMesh
            name="avatarModel_shell"
            geometry={nodes.avatarModel_shell.geometry}
            material={materials.lambert1}
            skeleton={nodes.avatarModel_shell.skeleton}
            morphTargetDictionary={nodes.avatarModel_shell.morphTargetDictionary}
            morphTargetInfluences={nodes.avatarModel_shell.morphTargetInfluences}
        />
        <skinnedMesh
            name="avatarModel_core"
            geometry={nodes.avatarModel_core.geometry}
            material={materials.lambert1}
            skeleton={nodes.avatarModel_core.skeleton}
            morphTargetDictionary={nodes.avatarModel_core.morphTargetDictionary}
            morphTargetInfluences={nodes.avatarModel_core.morphTargetInfluences}
        />
        <skinnedMesh
            name="avatarModel_neck"
            geometry={nodes.avatarModel_neck.geometry}
            material={materials.lambert1}
            skeleton={nodes.avatarModel_neck.skeleton}
            morphTargetDictionary={nodes.avatarModel_neck.morphTargetDictionary}
            morphTargetInfluences={nodes.avatarModel_neck.morphTargetInfluences}
        />
        <skinnedMesh
            name="avatarModel_head"
            geometry={nodes.avatarModel_head.geometry}
            material={materials.lambert1}
            skeleton={nodes.avatarModel_head.skeleton}
            morphTargetDictionary={nodes.avatarModel_head.morphTargetDictionary}
            morphTargetInfluences={nodes.avatarModel_head.morphTargetInfluences}
        />
        <skinnedMesh
            name="avatarModel_shoulderL"
            geometry={nodes.avatarModel_shoulderL.geometry}
            material={materials.lambert1}
            skeleton={nodes.avatarModel_shoulderL.skeleton}
            morphTargetDictionary={nodes.avatarModel_shoulderL.morphTargetDictionary}
            morphTargetInfluences={nodes.avatarModel_shoulderL.morphTargetInfluences}
        />
        <skinnedMesh
            name="pasted__avatarModel_shoulderL"
            geometry={nodes.pasted__avatarModel_shoulderL.geometry}
            material={materials.lambert1}
            skeleton={nodes.pasted__avatarModel_shoulderL.skeleton}
            morphTargetDictionary={nodes.pasted__avatarModel_shoulderL.morphTargetDictionary}
            morphTargetInfluences={nodes.pasted__avatarModel_shoulderL.morphTargetInfluences}
        />
        </group>
  );
}

useGLTF.preload('/models/robot_model.glb');


function Avatar() {
    const gltf = useLoader(GLTFLoader, 'models/robot_model.glb');

    return (
        <>
            <div className="w-[50vw]">
                <Canvas camera={{ position: [0, 0, 0.12] }}>
                    {/* <Environment files="images/background.jpg" background backgroundBlurriness={0.5}/> */}
                    <primitive object={gltf.scene} position={[0,-0.05,0]}/>
                    <directionalLight position={[1, 2, 2]} intensity={3} />
                    <OrbitControls target={[0, 0, 0]} />
                    {/* <Model /> */}
                </Canvas>
            </div>
        </>
    )
}

export default Avatar;