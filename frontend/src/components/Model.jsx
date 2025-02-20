import React, { useRef, useEffect, useState } from 'react'
import { useGLTF, useAnimations } from '@react-three/drei'

function Model(props) {
    const { nodes, materials, animations } = useGLTF('/models/nodding_anim.glb');
    const group = useRef();
    const [animation, setAnimation] = useState(animations[0].name);
    const { actions, mixer } = useAnimations(animations, group);
    
    useEffect(() => {
        actions[animation]
        .reset()
        .fadeIn(mixer.stats.actions.inUse === 0 ? 0 : 0.5)
        .play();
        return () => actions[animation].fadeOut(0.5);
    }, [animation]);

    return (
        <group scale={100} position={[0, -4, 0]} ref={group} {...props} dispose={null}>
        <group name="Scene">
            <group name="reference_images001" rotation={[Math.PI / 2, 0, 0]} scale={0.01}>
            <group name="imagePlane1" position={[2.734, -11.926, -2.071]} scale={2.293} />
            <group
                name="pasted__imagePlane1"
                position={[-7.64, 2.063, -1.543]}
                rotation={[0, 0, -Math.PI / 2]}
                scale={2.293}
            />
            </group>
            <group name="group2" rotation={[Math.PI / 2, 0, 0]} scale={0.01} />
            <group name="group1" rotation={[Math.PI / 2, 0, 0]} scale={0.01} />
            <group name="front_wheels" rotation={[Math.PI / 2, 0, 0]} scale={0.01}>
            <mesh
                name="Mesh014"
                castShadow
                receiveShadow
                geometry={nodes.Mesh014.geometry}
                material={materials['wheelsBlack.001']}
            />
            <mesh
                name="Mesh014_1"
                castShadow
                receiveShadow
                geometry={nodes.Mesh014_1.geometry}
                material={materials['wheelsRim.001']}
            />
            </group>
            <group name="back_wheel" rotation={[Math.PI / 2, 0, 0]} scale={0.01}>
            <mesh
                name="Mesh015"
                castShadow
                receiveShadow
                geometry={nodes.Mesh015.geometry}
                material={materials['wheelsBlack.001']}
            />
            <mesh
                name="Mesh015_1"
                castShadow
                receiveShadow
                geometry={nodes.Mesh015_1.geometry}
                material={materials['wheelsRim.001']}
            />
            </group>
            <mesh
            name="avatarModel_shoulderL"
            castShadow
            receiveShadow
            geometry={nodes.avatarModel_shoulderL.geometry}
            material={materials['bodyWhite_blinn.001']}
            rotation={[Math.PI / 2, 0, 0]}
            scale={0.01}
            />
            <group name="avatarModel_shell" rotation={[Math.PI / 2, 0, 0]} scale={0.01}>
            <mesh
                name="Mesh008"
                castShadow
                receiveShadow
                geometry={nodes.Mesh008.geometry}
                material={materials['bodyWhite_blinn.001']}
            />
            <mesh
                name="Mesh008_1"
                castShadow
                receiveShadow
                geometry={nodes.Mesh008_1.geometry}
                material={materials['bodyCyan_emissive.001']}
            />
            </group>
            <mesh
            name="avatarModel_neck"
            castShadow
            receiveShadow
            geometry={nodes.avatarModel_neck.geometry}
            material={materials['bodyWhite_blinn.001']}
            rotation={[Math.PI / 2, 0, 0]}
            scale={0.01}
            />
            <group name="avatarModel_head" rotation={[Math.PI / 2, 0, 0]} scale={0.01}>
            <mesh
                name="Mesh011"
                castShadow
                receiveShadow
                geometry={nodes.Mesh011.geometry}
                material={materials['bodyWhite_blinn.001']}
            />
            <mesh
                name="Mesh011_1"
                castShadow
                receiveShadow
                geometry={nodes.Mesh011_1.geometry}
                material={materials['bodyBlack_blinn.001']}
            />
            <group name="face" position={[0, 0.181, -6.763]} scale={[0.216, 1.031, 0.216]} />
            </group>
            <group name="avatarModel_core" rotation={[Math.PI / 2, 0, 0]} scale={0.01}>
            <mesh
                name="Mesh009"
                castShadow
                receiveShadow
                geometry={nodes.Mesh009.geometry}
                material={materials['bodyWhite_blinn.001']}
            />
            <mesh
                name="Mesh009_1"
                castShadow
                receiveShadow
                geometry={nodes.Mesh009_1.geometry}
                material={materials['bodyCyan_emissive.001']}
            />
            </group>
        </group>
        </group>
    )
}

useGLTF.preload('/Noding.glb')

export default Model;