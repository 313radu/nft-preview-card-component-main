import * as THREE from 'three';

if (!window.WebGLRenderingContext) {
  alert("Your browser does not support WebGL!");
} else {
  const canvasTest = document.createElement("canvas");
  const context = canvasTest.getContext("webgl") || canvasTest.getContext("experimental-webgl");
  if (!context) {
    alert("WebGL is not working in your browser!");
  }
}


// Set up the scene, camera, renderer, and canvas
const canvas = document.getElementById("canvas");
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(canvas.clientWidth, canvas.clientHeight);
renderer.setClearColor(0x000000, 1); // Black background

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 3.8;

// Handle resizing
window.addEventListener("resize", () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});

// Lights with visible spheres
const createVisibleLight = (color, intensity, position) => {
  const light = new THREE.PointLight(color, intensity, 10);
  light.position.copy(position);

  // Create a small sphere to represent the light source
  const lightSphereGeometry = new THREE.SphereGeometry(0.1, 16, 16);
  const lightSphereMaterial = new THREE.MeshBasicMaterial({ color: color });
  const lightSphere = new THREE.Mesh(lightSphereGeometry, lightSphereMaterial);
  lightSphere.position.copy(position);

  scene.add(light);
  scene.add(lightSphere);

  return { light, lightSphere };
};

// Create multiple visible orange lights
const orangeLights = [
  createVisibleLight(0xff4500, 1.5, new THREE.Vector3(3, 3, 5)),
  createVisibleLight(0xff8c00, 1.2, new THREE.Vector3(-3, 2, 5)),
  createVisibleLight(0xffa500, 1.0, new THREE.Vector3(0, -2, 3)),
  createVisibleLight(0xff6f00, 0.8, new THREE.Vector3(-3, -3, 4))
];

// Additional lights for overall scene illumination
const ambientLight = new THREE.AmbientLight(0x404040, 50);
const directionalLight = new THREE.DirectionalLight(0xffffff, 50);
directionalLight.position.set(5, 5, 8);

scene.add(ambientLight, directionalLight);

// Cube settings with highly reflective material
const cubeSize = 1;
const geometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
const material = new THREE.MeshStandardMaterial({
  color: new THREE.Color(0x1b3d5c),
  metalness: 0.9, // Increased metalness for more reflection
  roughness: 0.1, // Reduced roughness for sharper reflections
  envMapIntensity: 5.5 // Enhance environment map reflection
});

const cubes = [];
const cubeDirections = [];

// Create cubes
for (let i = 0; i < 27; i++) {
  const cube = new THREE.Mesh(geometry, material);
  cube.position.set(Math.random() * 6 - 3, Math.random() * 6 - 3, Math.random() * 6 - 3);
  cubes.push(cube);

  cubeDirections.push({
    x: (Math.random() - 0.5) * 0.04,
    y: (Math.random() - 0.5) * 0.04,
    z: (Math.random() - 0.5) * 0.04,
  });

  scene.add(cube);
}

let stayAligned = false;

// Animate the scene
const animate = function () {
  requestAnimationFrame(animate);

  // Optional: Add some light movement
  orangeLights.forEach((lightObj, index) => {
    const oscillation = Math.sin(Date.now() * 0.001 + index) * 0.5;
    lightObj.light.position.y += oscillation * 0.01;
    lightObj.lightSphere.position.y += oscillation * 0.01;
  });

  if (!stayAligned) {
    for (let i = 0; i < cubes.length; i++) {
      // Move the cubes randomly
      cubes[i].position.x += cubeDirections[i].x;
      cubes[i].position.y += cubeDirections[i].y;
      cubes[i].position.z += cubeDirections[i].z;

      // Reverse direction on boundaries
      if (Math.abs(cubes[i].position.x) > 3) cubeDirections[i].x *= -1;
      if (Math.abs(cubes[i].position.y) > 3) cubeDirections[i].y *= -1;
      if (Math.abs(cubes[i].position.z) > 3) cubeDirections[i].z *= -1;

      // Keep them rotating continuously
      cubes[i].rotation.x += 0.01;
      cubes[i].rotation.y += 0.01;
    }
  }

  renderer.render(scene, camera);
};

animate();

// Function to align cubes into 3x3x3 positions over 5 seconds
function alignCubesTo3x3x3() {
  const targetPositions = [];
  const spacing = 0.0; // No gaps between cubes

  let index = 0;
  for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
      for (let z = -1; z <= 1; z++) {
        targetPositions.push(new THREE.Vector3(x * spacing, y * spacing, z * spacing));
        index++;
      }
    }
  }

  const duration = 5000; // Align over 5 seconds
  const startTime = Date.now();

  const animateMovement = () => {
    const now = Date.now();
    const elapsed = now - startTime;
    const t = Math.min(elapsed / duration, 2);

    for (let i = 0; i < cubes.length; i++) {
      const targetPos = targetPositions[i];
      cubes[i].position.lerp(targetPos, t);
    }

    renderer.render(scene, camera);

    if (t < 1) {
      requestAnimationFrame(animateMovement);
    } else {
      setTimeout(returnToRandomMotion, 5000);
    }
  };

  animateMovement();
}

// Function to return cubes to random motion
function returnToRandomMotion() {
  for (let i = 0; i < cubes.length; i++) {
    cubeDirections[i] = {
      x: (Math.random() - 0.5) * 0.04,
      y: (Math.random() - 0.5) * 0.04,
      z: (Math.random() - 0.5) * 0.04,
    };
  }
}

// Schedule infinite alignments every 8 seconds
setInterval(() => {
  alignCubesTo3x3x3();
}, 8000);