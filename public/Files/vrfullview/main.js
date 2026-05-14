// Main application variables and initialization
let scene, camera, renderer, tank, water, railing, cover, ladder, safetyCage, ground;
let tankMaterial, waterMaterial, coverMaterial;
let isSafetyCageVisible = true;
let isWireframe = false;
let waterLevelGauge, waterLevelPointer;
let motorGroup, rotorGroup, statorGroup;
let gltfLoader, motorModel;
let tankStand; 
let sump, sumpWater, sumpContainer;
let sumpWaterLevel = 80;
let sumpCapacity = 5000;
let sumpLength = 6;
let sumpWidth = 5;  
let sumpDepth = 3;
let sumpPositionX = 18;
let sumpPositionY = 0;    
let sumpPositionZ = 0;

// Neural Network Motor Controller
let motorController;
let currentWaterLevel = 80;
let fillRate = 300;
let outflowRate = 1000;
let tankCapacity = 1000;
let isMotorRunning = false;
let isWaterPipeOpen = false;
let lastUpdateTime = Date.now();
let waterSupplyPipe = null;
let pipeValve = null;

// VR Controller instance
let vrController;

// Desktop Mouse controls
let mouseX = 0, mouseY = 0;
let targetRotationX = 0, targetRotationY = 0;
let targetRotationOnMouseDownX = 0, targetRotationOnMouseDownY = 0;
let mouseXOnMouseDown = 0, mouseYOnMouseDown = 0;
let isMouseDown = false;
let cameraDistance = 25;

// DC Motor Physics
const dcMotorParams = {
    Ra: 1.0,
    La: 0.01,
    Kt: 0.5,
    Ke: 0.5,
    J: 0.02,
    B: 0.1,
    omega: 0,
    current: 0,
    voltage: 12,
    loadTorque: 1.0,
    timeStep: 0.01
};

// ELEVATION CONSTANT
const TANK_ELEVATION = 8;

function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    setTimeout(() => errorDiv.style.display = 'none', 5000);
}

function checkWebGLSupport() {
    try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (!gl) {
            throw new Error('WebGL not supported');
        }
        return true;
    } catch (error) {
        console.error('WebGL Support Check Failed:', error);
        return false;
    }
}

function init() {
    if (!checkWebGLSupport()) {
        showError('WebGL is not supported in your browser. Please use a modern browser with WebGL enabled.');
        return;
    }

    // Initialize Neural Network Motor Controller
    motorController = new MotorController();
    motorController.setAutoMode(true);
    
    isMotorRunning = false;
    dcMotorParams.voltage = 0;
    
    console.log('Neural Network Motor Controller initialized with auto mode enabled');
    console.log('🔴 Motor initially OFF - will turn ON when water < 20%');
    console.log('🏗️ Tank now elevated on industrial stand structure');
    
    // Create scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    
    // Create camera
    camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(25.98, 5.06, 16.65);
    camera.lookAt(0, TANK_ELEVATION, 0);
    
    // Create renderer with VR support
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.xr.enabled = true;
    document.getElementById('container').appendChild(renderer.domElement);
    
    // Add lights
    setupLights();
    
    // Create sky
    setupSky();
    
    // Create tank system
    createTankStand();
    createTank();
    createWater();
    createRailing();
    createLadder();
    createPowerhouse();
    createWaterLevelGauge();
    createWaterPipe();
    createSump();
    
    // Create pipe elbows
    createPipeElbows();
    
    // Create ground
    createGround();
    
    // Initialize VR Controller
    vrController = new VRController();
    vrController.init(scene, camera, renderer, {
        ground: ground,
        motorGroup: motorGroup,
        pipeValve: pipeValve,
        tank: tank,
        water: water,
        dcMotorParams: dcMotorParams,
        toggleWaterPipe: toggleWaterPipe
    });
    
    // Add event listeners
    setupEventListeners();
    
    // Update initial neural network status display
    setTimeout(() => {
        updateNeuralStatusDisplay();
        updateMotorUI();
        console.log('🧠 Neural Network AUTO MOTOR CONTROL is active!');
        console.log('⚡ Motor Control: AUTO (ON < 20%, OFF > 80%)');
        console.log('💧 Pipe Control: MANUAL (always user controlled)');
        console.log('📊 Watch the green status panel for learning progress');
        console.log('🚰 Water supply pipe: Use button or VR valve to control drainage');
        console.log('⚡ Motor starts OFF - will activate when needed');
        console.log('🎮 VR: Point and click the valve to control water drainage');
    }, 100);
    
    // Start animation loop
    startAnimationLoop();
}

function setupLights() {
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(15, 20, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 100;
    directionalLight.shadow.camera.left = -30;
    directionalLight.shadow.camera.right = 30;
    directionalLight.shadow.camera.top = 30;
    directionalLight.shadow.camera.bottom = -30;
    scene.add(directionalLight);
    
    const pointLight = new THREE.PointLight(0xffffff, 0.5, 100);
    pointLight.position.set(-15, 15, -15);
    scene.add(pointLight);
}

function setupSky() {
    const sky = new THREE.Sky();
    sky.scale.setScalar(450000);
    scene.add(sky);

    const sun = new THREE.Vector3();
    const inclination = 0.49;
    const azimuth = 0.25;

    const theta = Math.PI * (inclination - 0.5);
    const phi = 2 * Math.PI * (azimuth - 0.5);

    sun.x = Math.cos(phi);
    sun.y = Math.sin(phi) * Math.sin(theta);
    sun.z = Math.sin(phi) * Math.cos(theta);

    sky.material.uniforms['sunPosition'].value.copy(sun);
    scene.background = new THREE.Color(0x87CEEB);
}

function createGround() {
    const textureLoader = new THREE.TextureLoader();
    const grassTexture = textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/terrain/grasslight-big.jpg');
    grassTexture.wrapS = THREE.RepeatWrapping;
    grassTexture.wrapT = THREE.RepeatWrapping;
    grassTexture.repeat.set(50, 50);

    const groundGeometry = new THREE.PlaneGeometry(100, 100);
    const groundMaterial = new THREE.MeshLambertMaterial({ map: grassTexture });
    ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.5;
    ground.receiveShadow = true;
    scene.add(ground);
}

function createPipeElbows() {
    const pipeElbow = createPipeElbow();
    scene.add(pipeElbow);
    pipeElbow.position.set(10.579, 0.28, -0.034);
    pipeElbow.rotation.x = 0; 
    pipeElbow.rotation.y = Math.PI/2;          
    pipeElbow.rotation.z = 0; 

    const pipeElbow1 = createPipeElbow();
    scene.add(pipeElbow1);
    pipeElbow1.position.set(10.58, 1.6, -0.035);
    pipeElbow1.rotation.x = Math.PI; 
    pipeElbow1.rotation.y = Math.PI;          
    pipeElbow1.rotation.z = 0; 

    const pipeElbow2 = createPipeElbow();
    scene.add(pipeElbow2);
    pipeElbow2.position.set(8.71,1.6, -0.035);
    pipeElbow2.rotation.x = 0; 
    pipeElbow2.rotation.y = Math.PI;          
    pipeElbow2.rotation.z = Math.PI; 

    const pipeElbow3 = createPipeElbow();
    scene.add(pipeElbow3);
    pipeElbow3.position.set(10.532,0.23, -2.560);
    pipeElbow3.rotation.x = Math.PI/2; 
    pipeElbow3.rotation.y = 0;          
    pipeElbow3.rotation.z = Math.PI/2; 

    const pipeElbow5 = createPipeElbow();
    scene.add(pipeElbow5);
    pipeElbow5.position.set(-5, 9.28, 2);
    pipeElbow5.rotation.x =  0; 
    pipeElbow5.rotation.y =  Math.PI;          
    pipeElbow5.rotation.z =  Math.PI; 

    pipeElbow5.traverse((child) => {
        if (child.isMesh) {
            child.material.color.set(0x228B22); 
        }
    });

    const pipeElbowsump = createPipeElbow();
    scene.add(pipeElbowsump);
    pipeElbowsump.position.set(10.20, 0.99, -0.035);
    pipeElbowsump.rotation.x = Math.PI; 
    pipeElbowsump.rotation.y = Math.PI;          
    pipeElbowsump.rotation.z = 0;
    pipeElbowsump.traverse((child) => {
        if (child.isMesh) {
            child.material.color.set(0x2A3439); 
        }
    });
}

function startAnimationLoop() {
    const clock = new THREE.Clock();
    renderer.setAnimationLoop(() => {
        const delta = Math.min(clock.getDelta(), 0.1);
        
        // Update camera position display
        const pos = camera.position;
        document.getElementById('camPos').textContent =
            `x: ${pos.x.toFixed(2)}, y: ${pos.y.toFixed(2)}, z: ${pos.z.toFixed(2)}`;

        // Update VR controller
        vrController.update(delta);
        
        // Update neural network control system
        updateNeuralMotorControl();
        
        // Animate water surface
        water.rotation.y += 0.005;
        animateSumpWater();
        
        // Update motor dynamics and rotate rotor
        updateMotorDynamics();
        if (rotorGroup) {
            rotorGroup.rotation.z += dcMotorParams.omega * delta;
        }

        // Update sump water level display
        document.getElementById('sumpLevelValue').textContent = sumpWaterLevel.toFixed(1) + '%';
        const sumpStatus = sumpWaterLevel > 20 ? 'Adequate Supply' : sumpWaterLevel > 5 ? 'Low Water' : 'Empty - No Supply';
        document.getElementById('sumpStatus').textContent = sumpStatus;

        if (sumpWaterLevel < 85) {
            sumpWaterLevel = Math.min(100, sumpWaterLevel + 0.1 * delta);
            updateSumpWaterLevel(sumpWaterLevel);
        }
        
        // Update water level display
        document.getElementById('waterLevelValue').textContent = currentWaterLevel.toFixed(1) + '%';
        document.getElementById('waterLevel').value = currentWaterLevel;
        
        // Render
        renderer.render(scene, camera);
    });
}

// Neural Network Motor Control Functions
function updateNeuralMotorControl() {
    const currentTime = Date.now();
    const deltaTime = (currentTime - lastUpdateTime) / 1000;
    lastUpdateTime = currentTime;
    
    const shouldRunMotor = motorController.makeDecision(currentWaterLevel);
    
    if (shouldRunMotor !== isMotorRunning) {
        isMotorRunning = shouldRunMotor;
        
        if (isMotorRunning) {
            dcMotorParams.voltage = parseFloat(document.getElementById('voltage').value);
        } else {
            dcMotorParams.voltage = 0;
        }
        
        updateMotorUI();
    }
    
    // Motor pumps water FROM sump TO tank when motor is running
    if (isMotorRunning && currentWaterLevel < 100 && sumpWaterLevel > 0) {
        const pumpLitersPerSecond = fillRate / 60;
        const tankIncreasePerSecond = (pumpLitersPerSecond / tankCapacity) * 100;
        
        const waterPumped = Math.min(
            tankIncreasePerSecond * deltaTime,
            sumpWaterLevel,
            (100 - currentWaterLevel)
        );
        
        if (waterPumped > 0) {
            currentWaterLevel = Math.min(100, currentWaterLevel + waterPumped);
            const sumpReduction = (waterPumped * tankCapacity / sumpCapacity);
            sumpWaterLevel = Math.max(0, sumpWaterLevel - sumpReduction);
            updateSumpWaterLevel(sumpWaterLevel);
        }
    }

    // Tank drain pipe (water goes to waste when open)
    if (isWaterPipeOpen && currentWaterLevel > 0) {
        const outflowLitersPerSecond = outflowRate / 60;
        const outflowPercentagePerSecond = (outflowLitersPerSecond / tankCapacity) * 100;
        currentWaterLevel = Math.max(0, currentWaterLevel - outflowPercentagePerSecond * deltaTime);
    }

    updateWaterLevel(currentWaterLevel / 100);
    updateNeuralStatusDisplay();
}

function updateNeuralStatusDisplay() {
    const stats = motorController.getPerformanceStats();
    
    document.getElementById('nn-mode').textContent = stats.autoMode ? 'AUTO' : 'MANUAL';
    document.getElementById('nn-motor-state').textContent = stats.motorState ? 'ON' : 'OFF';
    document.getElementById('nn-pipe-state').textContent = isWaterPipeOpen ? 'OPEN' : 'CLOSED';
    document.getElementById('nn-cycles').textContent = stats.cycleCount;
    document.getElementById('nn-efficiency').textContent = stats.efficiencyScore + '%';
    document.getElementById('nn-training').textContent = stats.totalTrainingSamples;
    document.getElementById('nn-reward').textContent = stats.averageReward;
    document.getElementById('nn-error').textContent = stats.recentError;
    
    const autoIndicator = document.getElementById('auto-indicator');
    if (stats.autoMode) {
        autoIndicator.className = 'status-indicator status-green';
    } else {
        autoIndicator.className = 'status-indicator status-red';
    }
}

function toggleWaterPipe() {
    isWaterPipeOpen = !isWaterPipeOpen;
    updatePipeUI();
    console.log('💧 Manual Pipe Control:', isWaterPipeOpen ? 'OPEN (water draining)' : 'CLOSED (no drainage)');
}

function updatePipeUI() {
    const pipeToggleBtn = document.getElementById('pipeToggle');
    
    if (isWaterPipeOpen) {
        pipeToggleBtn.textContent = 'Pipe: OPEN';
        pipeToggleBtn.className = 'pipe-open';
    } else {
        pipeToggleBtn.textContent = 'Pipe: CLOSED';
        pipeToggleBtn.className = '';
    }
    
    if (pipeValve) {
        const valveHandle = pipeValve.children[1];
        const valveIndicator = pipeValve.children[2];
        
        if (valveHandle) {
            valveHandle.rotation.z = isWaterPipeOpen ? Math.PI / 2 : 0;
            valveHandle.material.color.setHex(isWaterPipeOpen ? 0x00ff00 : 0xff0000);
        }
        
        if (valveIndicator) {
            valveIndicator.material.color.setHex(isWaterPipeOpen ? 0x00ff00 : 0xff0000);
        }
    }
}

function updateMotorUI() {
    const motorToggleBtn = document.getElementById('motorToggle');
    
    if (motorController.autoMode) {
        motorToggleBtn.disabled = true;
        if (isMotorRunning) {
            motorToggleBtn.textContent = 'Motor: ON (Pumping from sump) - AUTO';
            motorToggleBtn.className = 'motor-on';
        } else {
            motorToggleBtn.textContent = 'Motor: OFF - AUTO';
            motorToggleBtn.className = '';
        }
    } else {
        motorToggleBtn.disabled = false;
        if (isMotorRunning) {
            motorToggleBtn.textContent = 'Motor: ON (Pumping from sump)';
            motorToggleBtn.className = 'motor-on';
        } else {
            motorToggleBtn.textContent = 'Motor: OFF';
            motorToggleBtn.className = '';
        }
    }
}

function refillSump() {
    sumpWaterLevel = 90;
    updateSumpWaterLevel(sumpWaterLevel);
    console.log('💧 Sump refilled - Water source restored');
}

function toggleMotor() {
    if (!motorController.autoMode) {
        isMotorRunning = !isMotorRunning;
        motorController.setManualMotorState(isMotorRunning);
        
        if (isMotorRunning) {
            dcMotorParams.voltage = parseFloat(document.getElementById('voltage').value);
        } else {
            dcMotorParams.voltage = 0;
        }
        
        updateMotorUI();
        console.log('Manual motor toggle:', isMotorRunning ? 'ON' : 'OFF');
    } else {
        showError('Motor is under neural network control. Disable auto mode for manual control.');
    }
}

function resetNeuralNetwork() {
    motorController.reset();
    isMotorRunning = false;
    dcMotorParams.voltage = 0;
    updateMotorUI();
    console.log('Neural network reset');
}

function exportNeuralData() {
    const data = motorController.exportNeuralNetwork();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'neural-motor-control-data.json';
    a.click();
    URL.revokeObjectURL(url);
    console.log('Neural network data exported');
}

// Event Listeners Setup
function setupEventListeners() {
    // Auto mode toggle
    const autoModeToggle = document.getElementById('autoMode');
    autoModeToggle.addEventListener('change', function() {
        motorController.setAutoMode(this.checked);
        
        const motorToggleBtn = document.getElementById('motorToggle');
        if (this.checked) {
            motorToggleBtn.disabled = true;
            motorToggleBtn.textContent = `Motor: ${isMotorRunning ? 'ON' : 'OFF'} (AUTO)`;
        } else {
            motorToggleBtn.disabled = false;
            motorToggleBtn.textContent = `Motor: ${isMotorRunning ? 'ON' : 'OFF'}`;
        }
        
        console.log('Auto mode:', this.checked ? 'ENABLED (Motor: AUTO, Pipe: MANUAL)' : 'DISABLED (Motor: MANUAL, Pipe: MANUAL)');
    });

    // Cover transparency control
    const coverOpacitySlider = document.getElementById('coverOpacity');
    const coverOpacityValue = document.getElementById('coverOpacityValue');
    
    coverOpacitySlider.addEventListener('input', function() {
        const opacity = this.value;
        coverOpacityValue.textContent = opacity + '%';
        coverMaterial.opacity = opacity / 100;
    });
    
    // Fill rate control
    const fillRateSlider = document.getElementById('fillRate');
    const fillRateValue = document.getElementById('fillRateValue');
    
    fillRateSlider.addEventListener('input', function() {
        fillRate = parseInt(this.value);
        fillRateValue.textContent = fillRate + ' L/min';
    });
    
    // Outflow rate control
    const outflowRateSlider = document.getElementById('outflowRate');
    const outflowRateValue = document.getElementById('outflowRateValue');
    
    outflowRateSlider.addEventListener('input', function() {
        outflowRate = parseInt(this.value);
        outflowRateValue.textContent = outflowRate + ' L/min';
        document.getElementById('outflowValue').textContent = outflowRate + ' L/min';
    });
    
    // Water level control (manual override)
    const waterLevelSlider = document.getElementById('waterLevel');
    
    waterLevelSlider.addEventListener('input', function() {
        if (!motorController.autoMode) {
            currentWaterLevel = parseFloat(this.value);
            updateWaterLevel(currentWaterLevel / 100);
        } else {
            this.value = currentWaterLevel;
            showError('Water level is controlled by neural network in auto mode');
        }
    });
    
    // Motor controls
    const voltageControl = document.getElementById('voltage');
    const loadControl = document.getElementById('load');
    const voltageDisplay = document.getElementById('voltage-value');
    const loadDisplay = document.getElementById('load-value');

    voltageControl.addEventListener('input', function() {
        dcMotorParams.voltage = parseFloat(this.value);
        voltageDisplay.textContent = dcMotorParams.voltage.toFixed(1) + 'V';
    });

    loadControl.addEventListener('input', function() {
        dcMotorParams.loadTorque = parseFloat(this.value);
        loadDisplay.textContent = dcMotorParams.loadTorque.toFixed(1) + ' N·m';
    });
    
    // Desktop mouse controls (only when not in VR)
    renderer.domElement.addEventListener('mousedown', onMouseDown, false);
    renderer.domElement.addEventListener('mousemove', onMouseMove, false);
    renderer.domElement.addEventListener('mouseup', onMouseUp, false);
    renderer.domElement.addEventListener('wheel', onWheel, false);
    
    // Prevent context menu
    renderer.domElement.addEventListener('contextmenu', function(e) {
        e.preventDefault();
    });
    
    // Window resize
    window.addEventListener('resize', onWindowResize, false);
}

// Desktop Mouse Control Functions
function onMouseDown(event) {
    if (vrController.isVRActive) return;
    event.preventDefault();
    isMouseDown = true;
    mouseXOnMouseDown = event.clientX;
    mouseYOnMouseDown = event.clientY;
    targetRotationOnMouseDownX = targetRotationX;
    targetRotationOnMouseDownY = targetRotationY;
}

function onMouseMove(event) {
    if (vrController.isVRActive || !isMouseDown) return;
    mouseX = (event.clientX - mouseXOnMouseDown) * 0.005;
    mouseY = (event.clientY - mouseYOnMouseDown) * 0.005;
    targetRotationX = targetRotationOnMouseDownX + mouseX;
    targetRotationY = targetRotationOnMouseDownY + mouseY;
    updateCamera();
}

function onMouseUp(event) {
    if (vrController.isVRActive) return;
    isMouseDown = false;
}

function onWheel(event) {
    if (vrController.isVRActive) return;
    event.preventDefault();
    cameraDistance += event.deltaY * 0.01;
    cameraDistance = Math.max(8, Math.min(60, cameraDistance));
    updateCamera();
}

function updateCamera() {
    if (vrController.isVRActive) return;
    camera.position.x = Math.cos(targetRotationX) * Math.cos(targetRotationY) * cameraDistance;
    camera.position.y = Math.sin(targetRotationY) * cameraDistance + TANK_ELEVATION;
    camera.position.z = Math.sin(targetRotationX) * Math.cos(targetRotationY) * cameraDistance;
    camera.lookAt(0, TANK_ELEVATION, 0);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Utility Functions
function updateWaterLevel(level) {
    const maxHeight = 4.5;
    const newHeight = maxHeight * level;
    water.scale.y = level;
    water.position.y = TANK_ELEVATION + (newHeight / 2) + 0.25 + 0.3;
    
    if (waterLevelPointer) {
        const gaugePosition = 0.2 + (level * 4.0);
        waterLevelPointer.position.y = gaugePosition;
    }
}

function changeMaterial(type) {
    switch(type) {
        case 'metal':
            tankMaterial.color.setHex(0x666666);
            tankMaterial.shininess = 80;
            break;
        case 'plastic':
            tankMaterial.color.setHex(0x2d5a2d);
            tankMaterial.shininess = 30;
            break;
        case 'concrete':
            tankMaterial.color.setHex(0x888888);
            tankMaterial.shininess = 10;
            break;
    }
}

function toggleSafetyCage() {
    isSafetyCageVisible = !isSafetyCageVisible;
    safetyCage.visible = isSafetyCageVisible;
}

function toggleWireframe() {
    isWireframe = !isWireframe;
    tankMaterial.wireframe = isWireframe;
    waterMaterial.wireframe = isWireframe;
}

function resetCamera() {
    if (vrController.isVRActive) {
        vrController.dolly.position.set(0, 0, 12);
        vrController.dolly.rotation.set(0, 0, 0);
    } else {
        targetRotationX = 0;
        targetRotationY = 0;
        cameraDistance = 25;
        updateCamera();
    }
}

function updateMotorDynamics() {
    const {Ra, La, Kt, Ke, J, B, omega, current, voltage, loadTorque, timeStep} = dcMotorParams;
    const backEMF = Ke * omega;
    const currentDerivative = (voltage - backEMF - Ra * current) / La;
    dcMotorParams.current += currentDerivative * timeStep;
    const motorTorque = Kt * dcMotorParams.current;
    const netTorque = motorTorque - loadTorque - B * omega;
    const angularAcceleration = netTorque / J;
    dcMotorParams.omega += angularAcceleration * timeStep;

    if (dcMotorParams.omega < 0) {
        dcMotorParams.omega = 0;
        dcMotorParams.current = 0;
    }

    const rpm = dcMotorParams.omega * (60 / (2 * Math.PI));
    const power = dcMotorParams.voltage * dcMotorParams.current;
    
    document.getElementById('rpm-display').textContent = rpm.toFixed(0) + ' RPM';
    document.getElementById('current-display').textContent = dcMotorParams.current.toFixed(2) + ' A';
    document.getElementById('power-display').textContent = power.toFixed(1) + ' W';

    return dcMotorParams.omega * timeStep;
}