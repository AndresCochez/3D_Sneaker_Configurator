import { useRef, useState, useEffect, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  useGLTF,
  ContactShadows,
  Environment,
  OrbitControls,
} from "@react-three/drei";
import { proxy, useSnapshot } from "valtio";
import { HexColorPicker } from "react-colorful";

const state = proxy({
  current: null,
  items: {
    inside: "#ffffff",
    mat_laces: "#ffffff",
    mat_outside_1: "#ffffff",
    mat_outside_2: "#ffffff",
    mat_outside_3: "#ffffff",
  },
}); // Valtio State Management

function Shoe(props) {
  const snap = useSnapshot(state);
  const ref = useRef();

  const [hovered, setHovered] = useState(null);

  const { nodes, materials } = useGLTF("/Shoe_compressed.glb");

  useEffect(() => {
    const cursor = `<svg width="64" height="64" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0)"><path fill="rgba(255, 255, 255, 0.5)" d="M29.5 54C43.031 54 54 43.031 54 29.5S43.031 5 29.5 5 5 15.969 5 29.5 15.969 54 29.5 54z" stroke="#000"/><g filter="url(#filter0_d)"><path d="M29.5 47C39.165 47 47 39.165 47 29.5S39.165 12 29.5 12 12 19.835 12 29.5 19.835 47 29.5 47z" fill="${snap.items[hovered]}"/></g><path d="M2 2l11 2.947L4.947 13 2 2z" fill="#000"/><text fill="#000" style="#fff-space:pre" font-family="Inter var, sans-serif" font-size="10" letter-spacing="-.01em"><tspan x="35" y="63">${hovered}</tspan></text></g><defs><clipPath id="clip0"><path fill="#fff" d="M0 0h64v64H0z"/></clipPath><filter id="filter0_d" x="6" y="8" width="47" height="47" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feColorMatrix in="SourceAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"/><feOffset dy="2"/><feGaussianBlur stdDeviation="3"/><feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.15 0"/><feBlend in2="BackgroundImageFix" result="effect1_dropShadow"/><feBlend in="SourceGraphic" in2="effect1_dropShadow" result="shape"/></filter></defs></svg>`;
    const auto = `<svg width="64" height="64" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill="rgba(255, 255, 255, 0.5)" d="M29.5 54C43.031 54 54 43.031 54 29.5S43.031 5 29.5 5 5 15.969 5 29.5 15.969 54 29.5 54z" stroke="#000"/><path d="M2 2l11 2.947L4.947 13 2 2z" fill="#000"/></svg>`;
    if (hovered) {
      document.body.style.cursor = `url('data:image/svg+xml;base64,${btoa(
        cursor
      )}'), auto`;
      return () =>
        (document.body.style.cursor = `url('data:image/svg+xml;base64,${btoa(
          auto
        )}'), auto`);
    }
  }, [hovered]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    ref.current.rotation.set(
      Math.cos(t / 4) / 8,
      Math.sin(t / 4) / 8,
      -0.2 - (1 + Math.sin(t / 1.5)) / 20
    );
    ref.current.position.y = (1 + Math.sin(t / 1.5)) / 10;
  });

  return (
    <group
      ref={ref}
      {...props}
      dispose={null}
      scale={0.2}
      onPointerOver={(e) => {
        e.stopPropagation(), setHovered(e.object.material.name);
      }}
      onPointerOut={(e) => {
        e.intersections.length === 0 && setHovered(null);
      }}
      onPointerDown={(e) => {
        e.stopPropagation();
        state.current = e.object.material.name;
      }}
      onPointerMissed={(e) => {
        state.current = null;
      }}
    >
      <mesh
        receiveShadow
        castShadow
        geometry={nodes.inside.geometry}
        material={materials.inside}
        material-color={snap.items.inside}
      />
      <mesh
        receiveShadow
        castShadow
        geometry={nodes.laces.geometry}
        material={materials.mat_laces}
        material-color={snap.items.mat_laces}
      />
      <mesh
        receiveShadow
        castShadow
        geometry={nodes.outside_1.geometry}
        material={materials.mat_outside_1}
        material-color={snap.items.mat_outside_1}
      />
      <mesh
        receiveShadow
        castShadow
        geometry={nodes.outside_2.geometry}
        material={materials.mat_outside_2}
        material-color={snap.items.mat_outside_2}
      />
      <mesh
        receiveShadow
        castShadow
        geometry={nodes.outside_3.geometry}
        material={materials.mat_outside_3}
        material-color={snap.items.mat_outside_3}
      />
    </group>
  );
}

function Background() {
  const { scene } = useGLTF("/scene.gltf");
  const ref = useRef();
  return <primitive ref={ref} object={scene} position={[10, 11, 0]} scale={[10, 10, 10]} />;
}

function Picker() {
  const snap = useSnapshot(state);
  return (
    <div className="flex flex-col gap-4 justify-center items-center bg-gray-100 rounded-xl">
      <h1>Sneaker</h1>
      <HexColorPicker
        style={{ width: "150px", height: "150px" }}
        color={snap.items[snap.current]}
        onChange={(color) => (state.items[snap.current] = color)}
      />
    </div>
  );
}

function OrderButton() {
  const handleOrder = async () => {
    const orderData = {
      product: "Sneaker",
      quantity: 1,
      price: 100.0,
    };

    try {
      const response = await fetch(
        "https://nodejsapi-tau.vercel.app/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orderData),
        }
      );
      if (response.ok) {
        alert("Bestelling succesvol geplaatst!");
      } else {
        alert("Er ging iets mis. Probeer het opnieuw.");
      }
    } catch (error) {
      console.error("Fout bij het plaatsen van de bestelling:", error);
    }
  };

  return (
    <button
      className="m-2 p-2 px-4 shadow-lg rounded-full border text-sm bg-blue-500 text-white"
      onClick={handleOrder}
    >
      Bestel Nu
    </button>
  );
}

export default function App() {
  const ref = useRef();
  const orbitref = useRef();

  function downloadScreenshot() {
    const image = ref.current.toDataURL("image/png");
    const a = document.createElement("a");
    a.setAttribute("download", "screenshot.png");
    a.setAttribute("href", image);
    a.click();
  }

  let initialPosition = window.innerWidth < 500 ? [0, 0, 4.25] : [0, 0, 3.25];

  return (
    <div className="flex flex-col md:flex-row justify-center items-center w-screen h-screen bg-gray-100 overflow-x-hidden">
      <Canvas
        className="bg-gray-200"
        shadows
        camera={{ position: initialPosition, fov: 45 }}
        ref={ref}
        gl={{ preserveDrawingBuffer: true }}
      >
        <ambientLight intensity={0.7} />
        <spotLight
          intensity={0.5}
          angle={0.1}
          penumbra={1}
          position={[10, 15, 10]}
          castShadow
        />
        <Suspense fallback={null}>
          <Background />
          <Shoe />
        </Suspense>
        <Environment preset="city" />
        <ContactShadows
          position={[0, -0.75, 0]}
          opacity={0.5}
          scale={10}
          blur={2}
          far={2}
        />
        <OrbitControls
          ref={orbitref}
          maxPolarAngle={Math.PI / 2}
          enableZoom={false}
        />
      </Canvas>
      <div className="flex flex-col justify-evenly items-center w-screen md:w-[380px] h-[50vh] md:h-screen p-2 px-8 gap-2 md:gap-0 md:p-8 bg-gray-100">
        <Picker />
        <button
          className="m-2 p-2 px-4 shadow-lg rounded-full border text-sm"
          onClick={() => {
            setTimeout(() => {
              downloadScreenshot();
            }, 1500);
          }}
        >
          Download Screenshot
        </button>
        <OrderButton />
        <h1 className="text-[10px] font-light select-none">
          Made By Andres and Jonas
        </h1>
      </div>
    </div>
  );
}
