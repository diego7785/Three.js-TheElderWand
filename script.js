import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";

document.addEventListener("DOMContentLoaded", () => {
    gsap.registerPlugin(ScrollTrigger, SplitText);

    const lenis = new Lenis();
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    // Removed text animations so everything is visible and smooth

    let model,
        currentRotation = 0,
        modelSize;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

    renderer.setClearColor(0x000000, 0);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    document.querySelector(".model-container").appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 2));

    const mainLight = new THREE.DirectionalLight(0xffffff, 3);
    mainLight.position.set(1, 1, 1);
    scene.add(mainLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 3.5);
    fillLight.position.set(-2, 0, -2);
    scene.add(fillLight);

    function setupModel() {
        if (!model || !modelSize) return;

        const isMobile = window.innerWidth < 1000;
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());

        model.position.set(
            isMobile ? center.x + modelSize.x * 1 : -center.x - modelSize.x * 0.01,
            -center.y + modelSize.y * 0.085,
            -center.z
        );

        model.rotation.z = isMobile ? 0 : THREE.MathUtils.degToRad(50);

        const cameraDistance = isMobile ? 2 : 1.25;
        camera.position.set(
            0,
            0,
            Math.max(modelSize.x, modelSize.y, modelSize.z) * cameraDistance
        );
        camera.lookAt(0, 0, 0);
    }

    new GLTFLoader().load("/wand.glb", (gltf) => {
        model = gltf.scene;

        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        modelSize = size;

        scene.add(model);
        setupModel();
    });

    function animate() {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
    }
    animate();

    window.addEventListener("resize", () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        setupModel();
    });

    ScrollTrigger.create({
        trigger: ".product-overview",
        start: "top top",
        end: `+=${window.innerHeight * 2}px`,
        pin: true,
        pinSpacing: true,
        scrub: 1,
        onUpdate: ({ progress }) => {
            // Move all content vertically based on scroll
            const translateY = -progress * 100; // From 0% to -100%
            
            gsap.set(".header-1", { y: `${translateY}vh` });
            gsap.set(".header-2", { y: `${translateY + 60}vh` });
            gsap.set(".circular-mask", { y: `${translateY}vh` });
            gsap.set(".tooltips", { y: `${translateY}vh` });

            // Only the wand rotation animation
            if (model && progress >= 0.1) {
                const rotationProgress = progress;
                const targetRotation = Math.PI * 2 * rotationProgress;
                const rotationDiff = targetRotation - currentRotation;
                if (Math.abs(rotationDiff) > 0.001) {
                    model.rotateOnAxis(new THREE.Vector3(1, 0.2, 0.2), rotationDiff);
                    currentRotation = targetRotation;
                }
            }
        },
    });
});
