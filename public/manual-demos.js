// Live 3D Previews for Three.js Manual Documentation Sections
// This file contains initialization functions for interactive canvas demos

// Hello Cube Demo
function initHelloCubeCanvas() {
    const canvas = document.getElementById('hello-cube-canvas');
    if (!canvas || typeof THREE === 'undefined') return null;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, canvas });
    renderer.setPixelRatio(window.devicePixelRatio || 1);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);

    // Create simple cube
    const cube = new THREE.Mesh(
        new THREE.BoxGeometry(1.5, 1.5, 1.5),
        new THREE.MeshStandardMaterial({ color: 0x00ff88, metalness: 0.2, roughness: 0.5 })
    );
    scene.add(cube);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    camera.position.set(3, 3, 5);
    camera.lookAt(0, 0, 0);

    function handleResize() {
        const rect = canvas.getBoundingClientRect();
        const width = rect.width || 480;
        const height = rect.height || 320;
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
    }

    handleResize();
    window.addEventListener('resize', handleResize);

    let animationId = null;
    function animate() {
        animationId = requestAnimationFrame(animate);
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.015;
        renderer.render(scene, camera);
    }
    animate();

    return () => {
        cancelAnimationFrame(animationId);
        window.removeEventListener('resize', handleResize);
        renderer.dispose();
        cube.geometry.dispose();
        cube.material.dispose();
    };
}

// Lighting Demo
function initLightingCanvas() {
    const canvas = document.getElementById('lighting-manual-canvas');
    if (!canvas || typeof THREE === 'undefined') return null;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, canvas });
    renderer.setPixelRatio(window.devicePixelRatio || 1);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);

    // Create objects to show lighting
    const sphere = new THREE.Mesh(
        new THREE.SphereGeometry(1, 32, 32),
        new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.3, roughness: 0.4 })
    );
    scene.add(sphere);

    // Multiple colored lights
    const lights = [];
    const lightColors = [0xff0000, 0x00ff00, 0x0000ff];

    lightColors.forEach((color, i) => {
        const light = new THREE.PointLight(color, 1, 10);
        lights.push(light);
        scene.add(light);
    });

    const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
    scene.add(ambientLight);

    camera.position.set(0, 2, 5);
    camera.lookAt(0, 0, 0);

    function handleResize() {
        const rect = canvas.getBoundingClientRect();
        const width = rect.width || 480;
        const height = rect.height || 320;
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
    }

    handleResize();
    window.addEventListener('resize', handleResize);

    let time = 0;
    let animationId = null;

    function animate() {
        animationId = requestAnimationFrame(animate);
        time += 0.02;

        // Animate lights in circular pattern
        lights.forEach((light, index) => {
            const angle = time + (index * Math.PI * 2) / lights.length;
            light.position.x = Math.cos(angle) * 3;
            light.position.y = Math.sin(angle * 1.5) * 1.5;
            light.position.z = Math.sin(angle) * 3;
        });

        sphere.rotation.y += 0.005;
        renderer.render(scene, camera);
    }
    animate();

    return () => {
        cancelAnimationFrame(animationId);
        window.removeEventListener('resize', handleResize);
        renderer.dispose();
        sphere.geometry.dispose();
        sphere.material.dispose();
    };
}

// Scene Graph Demo
function initSceneGraphCanvas() {
    const canvas = document.getElementById('scenegraph-manual-canvas');
    if (!canvas || typeof THREE === 'undefined') return null;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, canvas });
    renderer.setPixelRatio(window.devicePixelRatio || 1);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);

    // Solar system hierarchy
    const solarSystem = new THREE.Object3D();
    scene.add(solarSystem);

    // Sun
    const sun = new THREE.Mesh(
        new THREE.SphereGeometry(1, 32, 32),
        new THREE.MeshBasicMaterial({ color: 0xffff00 })
    );
    solarSystem.add(sun);

    // Earth orbit
    const earthOrbit = new THREE.Object3D();
    earthOrbit.position.x = 5;
    solarSystem.add(earthOrbit);

    // Earth
    const earth = new THREE.Mesh(
        new THREE.SphereGeometry(0.5, 32, 32),
        new THREE.MeshStandardMaterial({ color: 0x2233ff })
    );
    earthOrbit.add(earth);

    // Moon orbit
    const moonOrbit = new THREE.Object3D();
    moonOrbit.position.x = 1.5;
    earth.add(moonOrbit);

    // Moon
    const moon = new THREE.Mesh(
        new THREE.SphereGeometry(0.2, 32, 32),
        new THREE.MeshStandardMaterial({ color: 0x888888 })
    );
    moonOrbit.add(moon);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffffff, 1);
    scene.add(pointLight);

    camera.position.set(0, 8, 12);
    camera.lookAt(0, 0, 0);

    function handleResize() {
        const rect = canvas.getBoundingClientRect();
        const width = rect.width || 480;
        const height = rect.height || 320;
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
    }

    handleResize();
    window.addEventListener('resize', handleResize);

    let animationId = null;
    function animate() {
        animationId = requestAnimationFrame(animate);

        solarSystem.rotation.y += 0.001;
        earthOrbit.rotation.y += 0.01;
        earth.rotation.y += 0.02;
        moonOrbit.rotation.y += 0.05;

        renderer.render(scene, camera);
    }
    animate();

    return () => {
        cancelAnimationFrame(animationId);
        window.removeEventListener('resize', handleResize);
        renderer.dispose();
        sun.geometry.dispose();
        sun.material.dispose();
        earth.geometry.dispose();
        earth.material.dispose();
        moon.geometry.dispose();
        moon.material.dispose();
    };
}

// Textures Demo
function initTexturesCanvas() {
    const canvas = document.getElementById('textures-manual-canvas');
    if (!canvas || typeof THREE === 'undefined') return null;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, canvas });
    renderer.setPixelRatio(window.devicePixelRatio || 1);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);

    // Create procedural texture
    const canvasTexture = document.createElement('canvas');
    canvasTexture.width = 256;
    canvasTexture.height = 256;
    const ctx = canvasTexture.getContext('2d');

    // Checkerboard pattern
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            ctx.fillStyle = (i + j) % 2 ? '#D5D973' : '#3D7363';
            ctx.fillRect(i * 32, j * 32, 32, 32);
        }
    }

    const texture = new THREE.CanvasTexture(canvasTexture);

    // Create cubes with different materials
    const cubes = [];
    const materials = [
        new THREE.MeshStandardMaterial({ map: texture }),
        new THREE.MeshStandardMaterial({ color: 0xff6347, roughness: 0.2, metalness: 0.8 }),
        new THREE.MeshStandardMaterial({ color: 0x4169e1, roughness: 0.8, metalness: 0.2 })
    ];

    materials.forEach((mat, i) => {
        const cube = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.2, 1.2), mat);
        cube.position.x = (i - 1) * 2.5;
        cubes.push(cube);
        scene.add(cube);
    });

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    camera.position.set(0, 2, 6);
    camera.lookAt(0, 0, 0);

    function handleResize() {
        const rect = canvas.getBoundingClientRect();
        const width = rect.width || 480;
        const height = rect.height || 320;
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
    }

    handleResize();
    window.addEventListener('resize', handleResize);

    let animationId = null;
    function animate() {
        animationId = requestAnimationFrame(animate);
        cubes.forEach((cube, i) => {
            cube.rotation.x += 0.01;
            cube.rotation.y += 0.015 * (i + 1);
        });
        renderer.render(scene, camera);
    }
    animate();

    return () => {
        cancelAnimationFrame(animationId);
        window.removeEventListener('resize', handleResize);
        renderer.dispose();
        texture.dispose();
        cubes.forEach(cube => {
            cube.geometry.dispose();
            cube.material.dispose();
        });
    };
}

// Cameras/Interactive Demo
function initCamerasCanvas() {
    const canvas = document.getElementById('cameras-manual-canvas');
    if (!canvas || typeof THREE === 'undefined') return null;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, canvas });
    renderer.setPixelRatio(window.devicePixelRatio || 1);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);

    // Create interactive spheres
    const spheres = [];
    const colors = [0xff6b6b, 0x4ecdc4, 0xffe66d, 0xa8e6cf];

    colors.forEach((color, i) => {
        const sphere = new THREE.Mesh(
            new THREE.SphereGeometry(0.5, 32, 32),
            new THREE.MeshStandardMaterial({ color, roughness: 0.3, metalness: 0.5 })
        );
        sphere.position.set(
            Math.cos(i * Math.PI / 2) * 3,
            0,
            Math.sin(i * Math.PI / 2) * 3
        );
        spheres.push(sphere);
        scene.add(sphere);
    });

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    camera.position.set(5, 5, 5);
    camera.lookAt(0, 0, 0);

    const pointer = { x: 0, y: 0 };

    function handlePointerMove(event) {
        const rect = canvas.getBoundingClientRect();
        pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = ((event.clientY - rect.top) / rect.height) * 2 - 1;
    }

    canvas.addEventListener('pointermove', handlePointerMove);

    function handleResize() {
        const rect = canvas.getBoundingClientRect();
        const width = rect.width || 480;
        const height = rect.height || 320;
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
    }

    handleResize();
    window.addEventListener('resize', handleResize);

    let time = 0;
    let animationId = null;

    function animate() {
        animationId = requestAnimationFrame(animate);
        time += 0.01;

        // Orbit camera based on pointer
        const radius = 7;
        const angle = time * 0.2 + pointer.x * 0.5;
        camera.position.x = Math.cos(angle) * radius;
        camera.position.z = Math.sin(angle) * radius;
        camera.position.y = 5 + pointer.y * 2;
        camera.lookAt(0, 0, 0);

        // Rotate spheres
        spheres.forEach((sphere, i) => {
            sphere.rotation.y += 0.01 * (i + 1);
            sphere.position.y = Math.sin(time + i) * 0.5;
        });

        renderer.render(scene, camera);
    }
    animate();

    return () => {
        cancelAnimationFrame(animationId);
        window.removeEventListener('resize', handleResize);
        canvas.removeEventListener('pointermove', handlePointerMove);
        renderer.dispose();
        spheres.forEach(sphere => {
            sphere.geometry.dispose();
            sphere.material.dispose();
        });
    };
}

// Advanced Textures & 3D Models Demo
function initAdvancedTexturesCanvas() {
    const canvas = document.getElementById('advanced-textures-canvas');
    if (!canvas || typeof THREE === 'undefined') return null;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, canvas });
    renderer.setPixelRatio(window.devicePixelRatio || 1);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);

    // Create multiple procedural textures
    const createProceduralTexture = (type) => {
        const canvasEl = document.createElement('canvas');
        canvasEl.width = 512;
        canvasEl.height = 512;
        const ctx = canvasEl.getContext('2d');

        if (type === 'checkerboard') {
            for (let i = 0; i < 16; i++) {
                for (let j = 0; j < 16; j++) {
                    ctx.fillStyle = (i + j) % 2 ? '#D5D973' : '#3D7363';
                    ctx.fillRect(i * 32, j * 32, 32, 32);
                }
            }
        } else if (type === 'gradient') {
            const gradient = ctx.createLinearGradient(0, 0, 512, 512);
            gradient.addColorStop(0, '#BF532C');
            gradient.addColorStop(0.5, '#D5D973');
            gradient.addColorStop(1, '#3D7363');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, 512, 512);
        } else if (type === 'dots') {
            ctx.fillStyle = '#F2E8DC';
            ctx.fillRect(0, 0, 512, 512);
            ctx.fillStyle = '#3D7363';
            for (let i = 0; i < 8; i++) {
                for (let j = 0; j < 8; j++) {
                    ctx.beginPath();
                    ctx.arc(i * 64 + 32, j * 64 + 32, 20, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }

        return new THREE.CanvasTexture(canvasEl);
    };

    // Create sphere with different texture maps
    const geometry = new THREE.SphereGeometry(1.2, 64, 64);

    // Main sphere with diffuse texture
    const diffuseTexture = createProceduralTexture('checkerboard');
    const mainSphere = new THREE.Mesh(
        geometry,
        new THREE.MeshStandardMaterial({
            map: diffuseTexture,
            roughness: 0.5,
            metalness: 0.2
        })
    );
    scene.add(mainSphere);

    // Torus knot with gradient texture
    const torusGeometry = new THREE.TorusKnotGeometry(0.6, 0.2, 100, 16);
    const gradientTexture = createProceduralTexture('gradient');
    const torusKnot = new THREE.Mesh(
        torusGeometry,
        new THREE.MeshStandardMaterial({
            map: gradientTexture,
            roughness: 0.3,
            metalness: 0.6
        })
    );
    torusKnot.position.set(3, 0, 0);
    scene.add(torusKnot);

    // Plane with dots texture
    const planeGeometry = new THREE.PlaneGeometry(1.5, 1.5);
    const dotsTexture = createProceduralTexture('dots');
    const plane = new THREE.Mesh(
        planeGeometry,
        new THREE.MeshStandardMaterial({
            map: dotsTexture,
            side: THREE.DoubleSide
        })
    );
    plane.position.set(-3, 0, 0);
    scene.add(plane);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    camera.position.set(0, 2, 6);
    camera.lookAt(0, 0, 0);

    function handleResize() {
        const rect = canvas.getBoundingClientRect();
        const width = rect.width || 480;
        const height = rect.height || 320;
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
    }

    handleResize();
    window.addEventListener('resize', handleResize);

    let animationId = null;
    function animate() {
        animationId = requestAnimationFrame(animate);

        mainSphere.rotation.y += 0.005;
        torusKnot.rotation.x += 0.01;
        torusKnot.rotation.y += 0.015;
        plane.rotation.y = Math.sin(Date.now() * 0.001) * 0.3;

        renderer.render(scene, camera);
    }
    animate();

    return () => {
        cancelAnimationFrame(animationId);
        window.removeEventListener('resize', handleResize);
        renderer.dispose();
        geometry.dispose();
        torusGeometry.dispose();
        planeGeometry.dispose();
        diffuseTexture.dispose();
        gradientTexture.dispose();
        dotsTexture.dispose();
        mainSphere.material.dispose();
        torusKnot.material.dispose();
        plane.material.dispose();
    };
}

// Interactive Scenes Demo (with raycasting)
function initInteractiveScenesCanvas() {
    const canvas = document.getElementById('interactive-scenes-canvas');
    if (!canvas || typeof THREE === 'undefined') return null;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, canvas });
    renderer.setPixelRatio(window.devicePixelRatio || 1);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);

    // Create interactive objects
    const objects = [];
    const geometries = [
        new THREE.BoxGeometry(1, 1, 1),
        new THREE.SphereGeometry(0.6, 32, 32),
        new THREE.ConeGeometry(0.5, 1.2, 32),
        new THREE.TorusGeometry(0.5, 0.2, 16, 100)
    ];

    const colors = [0xff6b6b, 0x4ecdc4, 0xffe66d, 0xa8e6cf];

    geometries.forEach((geometry, i) => {
        const mesh = new THREE.Mesh(
            geometry,
            new THREE.MeshStandardMaterial({
                color: colors[i],
                roughness: 0.4,
                metalness: 0.3
            })
        );
        mesh.position.set(
            (i - 1.5) * 2,
            0,
            0
        );
        mesh.userData.originalColor = colors[i];
        mesh.userData.hovered = false;
        objects.push(mesh);
        scene.add(mesh);
    });

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    camera.position.set(0, 2, 7);
    camera.lookAt(0, 0, 0);

    // Raycaster for interaction
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let hoveredObject = null;

    function onPointerMove(event) {
        const rect = canvas.getBoundingClientRect();
        pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    }

    function onClick(event) {
        const rect = canvas.getBoundingClientRect();
        pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(pointer, camera);
        const intersects = raycaster.intersectObjects(objects);

        if (intersects.length > 0) {
            const clickedObject = intersects[0].object;
            // Change to random color on click
            clickedObject.material.color.setHex(Math.random() * 0xffffff);
            clickedObject.userData.originalColor = clickedObject.material.color.getHex();
        }
    }

    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('click', onClick);

    function handleResize() {
        const rect = canvas.getBoundingClientRect();
        const width = rect.width || 480;
        const height = rect.height || 320;
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
    }

    handleResize();
    window.addEventListener('resize', handleResize);

    let animationId = null;
    function animate() {
        animationId = requestAnimationFrame(animate);

        // Raycasting for hover effect
        raycaster.setFromCamera(pointer, camera);
        const intersects = raycaster.intersectObjects(objects);

        // Reset previous hovered object
        if (hoveredObject && !intersects.find(i => i.object === hoveredObject)) {
            hoveredObject.scale.set(1, 1, 1);
            hoveredObject = null;
        }

        // Highlight hovered object
        if (intersects.length > 0) {
            const object = intersects[0].object;
            if (object !== hoveredObject) {
                if (hoveredObject) hoveredObject.scale.set(1, 1, 1);
                hoveredObject = object;
                hoveredObject.scale.set(1.2, 1.2, 1.2);
            }
        }

        // Rotate objects
        objects.forEach((obj, i) => {
            obj.rotation.x += 0.005 * (i + 1);
            obj.rotation.y += 0.01 * (i + 1);
        });

        renderer.render(scene, camera);
    }
    animate();

    return () => {
        cancelAnimationFrame(animationId);
        window.removeEventListener('resize', handleResize);
        canvas.removeEventListener('pointermove', onPointerMove);
        canvas.removeEventListener('click', onClick);
        renderer.dispose();
        geometries.forEach(geo => geo.dispose());
        objects.forEach(obj => obj.material.dispose());
    };
}

// Instanced Grid Demo
function initInstancedGridCanvas() {
    const canvas = document.getElementById('instanced-grid-canvas');
    if (!canvas || typeof THREE === 'undefined') return null;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, canvas });
    renderer.setPixelRatio(window.devicePixelRatio || 1);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);

    // Create instanced mesh
    const gridSize = 12;
    const spacing = 1.2;
    const count = gridSize * gridSize;

    const geometry = new THREE.BoxGeometry(0.4, 0.4, 0.4);
    const material = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.5,
        metalness: 0.3
    });

    const instancedMesh = new THREE.InstancedMesh(geometry, material, count);

    // Setup grid positions and colors
    const matrix = new THREE.Matrix4();
    const position = new THREE.Vector3();
    const color = new THREE.Color();

    let instanceIndex = 0;
    for (let x = 0; x < gridSize; x++) {
        for (let z = 0; z < gridSize; z++) {
            position.set(
                (x - gridSize / 2) * spacing,
                0,
                (z - gridSize / 2) * spacing
            );

            matrix.setPosition(position);
            instancedMesh.setMatrixAt(instanceIndex, matrix);

            // Color gradient across grid
            const hue = (x / gridSize + z / gridSize) * 0.5;
            color.setHSL(hue, 0.8, 0.6);
            instancedMesh.setColorAt(instanceIndex, color);

            instanceIndex++;
        }
    }

    instancedMesh.instanceMatrix.needsUpdate = true;
    instancedMesh.instanceColor.needsUpdate = true;
    scene.add(instancedMesh);

    // Add ground plane
    const groundGeometry = new THREE.PlaneGeometry(gridSize * spacing + 2, gridSize * spacing + 2);
    const groundMaterial = new THREE.MeshStandardMaterial({
        color: 0x3D7363,
        roughness: 0.9,
        metalness: 0.1
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.5;
    scene.add(ground);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 15, 10);
    scene.add(directionalLight);

    camera.position.set(10, 10, 10);
    camera.lookAt(0, 0, 0);

    function handleResize() {
        const rect = canvas.getBoundingClientRect();
        const width = rect.width || 480;
        const height = rect.height || 320;
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
    }

    handleResize();
    window.addEventListener('resize', handleResize);

    let time = 0;
    let animationId = null;

    function animate() {
        animationId = requestAnimationFrame(animate);
        time += 0.01;

        // Animate each instance with wave effect
        let index = 0;
        for (let x = 0; x < gridSize; x++) {
            for (let z = 0; z < gridSize; z++) {
                instancedMesh.getMatrixAt(index, matrix);

                position.setFromMatrixPosition(matrix);

                // Wave effect
                const waveX = Math.sin(x * 0.3 + time);
                const waveZ = Math.sin(z * 0.3 + time);
                position.y = (waveX + waveZ) * 0.8;

                matrix.setPosition(position);
                instancedMesh.setMatrixAt(index, matrix);

                index++;
            }
        }

        instancedMesh.instanceMatrix.needsUpdate = true;

        // Rotate camera
        const radius = 15;
        camera.position.x = Math.cos(time * 0.1) * radius;
        camera.position.z = Math.sin(time * 0.1) * radius;
        camera.lookAt(0, 0, 0);

        renderer.render(scene, camera);
    }
    animate();

    return () => {
        cancelAnimationFrame(animationId);
        window.removeEventListener('resize', handleResize);
        renderer.dispose();
        geometry.dispose();
        material.dispose();
        groundGeometry.dispose();
        groundMaterial.dispose();
    };
}
