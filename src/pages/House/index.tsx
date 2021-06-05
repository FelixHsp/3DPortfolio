import { createElement, useRef, useEffect } from 'rax';
import * as THREE from 'three';
import GLTFLoader from 'three-gltf-loader';
import { OrbitControls } from '@kibou/three-orbitcontrols-ts';

import View from 'rax-view';

import './index.less';

function House() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | undefined>(undefined);
  const houseRef = useRef<THREE.Object3D | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);

  const clock = new THREE.Clock();

  const animate = () => {
    if (
      !houseRef.current
      || !rendererRef.current
      || !sceneRef.current
      || !cameraRef.current
    ) {
      return;
    }
    requestAnimationFrame(animate);

    const delta = clock.getDelta();

		mixerRef.current?.update( delta );
    controlsRef.current?.update();

    rendererRef.current.render(sceneRef.current, cameraRef.current);
  };

  window.onresize = function () {
    if (!cameraRef.current || !rendererRef.current) {
      return;
    }

    cameraRef.current.aspect = window.innerWidth / window.innerHeight;
    cameraRef.current.updateProjectionMatrix();

    rendererRef.current.setSize( window.innerWidth, window.innerHeight );
  };

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    sceneRef.current = new THREE.Scene();

    const fov = 45;
    const aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
    const near = 0.1;
    const far = 500;

    cameraRef.current = new THREE.PerspectiveCamera(fov, aspect, near, far);
    cameraRef.current.position.set(0, 1.6, 8);

    const ambient = new THREE.AmbientLight(0x404040, 2);
    sceneRef.current.add(ambient);

    const light = new THREE.PointLight(0xffffff, 2);
    light.position.set(50, 50, 100);

    sceneRef.current.add(light);
    rendererRef.current = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    rendererRef.current.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    rendererRef.current.setPixelRatio(window.devicePixelRatio);

    containerRef.current.appendChild(rendererRef.current.domElement);

    controlsRef.current = new OrbitControls( cameraRef.current, rendererRef.current.domElement );
    controlsRef.current.enablePan = false;
    controlsRef.current.enableDamping = true;
    controlsRef.current.enableZoom = true;

    const loader = new GLTFLoader();
    loader.load("https://felixhsp.oss-cn-beijing.aliyuncs.com/3d/baba_yagas_hut/scene.gltf", (gltf: any) => {
      if (!sceneRef.current) return;
      sceneRef.current?.add(gltf.scene);
      houseRef.current = gltf.scene.children[0];
      houseRef.current && (houseRef.current.rotation.z += 15);

      mixerRef.current = new THREE.AnimationMixer( sceneRef.current );
			mixerRef.current.clipAction( gltf.animations[ 0 ] ).play();

      animate();
    });
  }, []);

  return (
    <View
      ref={containerRef}
      className="house-container"
    />
  );
}

export default House;
