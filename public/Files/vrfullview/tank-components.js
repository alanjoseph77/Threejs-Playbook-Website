// VR Controller Module
// This file handles all VR-related functionality

class VRController {
    constructor(scene, camera, renderer, dolly) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        this.dolly = dolly;
        this.instructionPanel = null;
        this.instructionTimeout = null;
        this.spokenOnce = false;
        // VR Variables
        this.controllers = [];
        this.controllerGrips = [];
        this.isVRActive = false;
        this.vrSession = null;
        this.rightController = null;
        this.leftController = null;
        this.rightGamepad = null;
        this.leftGamepad = null;
        
        // Teleport system
        this.teleportMarker = null;
        this.teleportRay = null;
        this.isAiming = false;
        this.validTeleportTarget = false;
        this.snapTurnCooldown = false;
        this.snapTurnAngle = Math.PI / 6;
        
        // Motor control panel
        this.motorControlPanel = null;
        this.isMotorControlActive = false;
        this.voltageSlider = null;
        this.loadSlider = null;
        
        // Initialize VR system
        this.init();
    }
    
    init() {
        this.setupVRControllers();
        this.createTeleportSystem();
        this.createVRButton();
        this.createVRMotorControlPanel();
        this.checkWebXRSupport();
        this.createInstructionPanel();
    }
    
    setupVRControllers() {
        for (let i = 0; i < 2; i++) {
            const controller = this.renderer.xr.getController(i);
            const controllerGrip = this.renderer.xr.getControllerGrip(i);
            
            controller.addEventListener('selectstart', (event) => this.onSelectStart(event, i));
            controller.addEventListener('selectend', (event) => this.onSelectEnd(event, i));
            controller.addEventListener('squeezestart', (event) => this.onSqueezeStart(event, i));
            controller.addEventListener('squeezeend', (event) => this.onSqueezeEnd(event, i));
            
            controller.addEventListener('connected', (event) => {
                if (i === 0) this.leftController = controller;
                else this.rightController = controller;
            });
            
            controller.addEventListener('disconnected', () => {
                if (i === 0) this.leftController = null;
                if (i === 1) this.rightController = null;
            });

            this.dolly.add(controller);
            this.dolly.add(controllerGrip);
            this.controllers.push(controller);
            this.controllerGrips.push(controllerGrip);

            // Add controller ray
            const geometry = new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(0, 0, 0),
                new THREE.Vector3(0, 0, -1)
            ]);
            const line = new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: 0xffffff }));
            line.name = 'line';
            line.scale.z = 5;
            controller.add(line.clone());
        }
    }

createInstructionPanel() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.font = 'bold 36px Arial';
    ctx.fillText('👓 VR Instructions', 30, 60);
    ctx.font = '28px Arial';
    ctx.fillText('• Right Thumbstick → Move Forward/Back', 30, 120);
    ctx.fillText('• Left Thumbstick → Snap Turn', 30, 170);
    ctx.fillText('• A / X Button → Teleport', 30, 220);
    ctx.fillText('• Trigger → Interact (e.g., Pipe Valve)', 30, 270);
    ctx.fillText('• Grab Motor to Open Controls Panel', 30, 320);

    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
    const panel = new THREE.Mesh(new THREE.PlaneGeometry(2.5, 1.25), material);

    this.instructionPanel = panel;
    this.instructionPanel.visible = false;
    this.scene.add(this.instructionPanel);
    
}

    
    createTeleportSystem() {
        const markerGeometry = new THREE.RingGeometry(0.1, 0.3, 32);
        const markerMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, transparent: true, opacity: 0.8 });
        this.teleportMarker = new THREE.Mesh(markerGeometry, markerMaterial);
        this.teleportMarker.rotation.x = -Math.PI / 2;
        this.teleportMarker.visible = false;
        this.scene.add(this.teleportMarker);

        const rayGeometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0, 0, -10)
        ]);
        const rayMaterial = new THREE.LineBasicMaterial({ color: 0x00ff00, transparent: true, opacity: 0.6 });
        this.teleportRay = new THREE.Line(rayGeometry, rayMaterial);
        this.teleportRay.visible = false;
    }
    
    createVRButton() {
        const vrButton = document.getElementById('vrButton');
        
        // Only enable VR if WebGL is working
        if (!this.renderer || !this.renderer.getContext()) {
            vrButton.style.display = 'none';
            return;
        }
        
        vrButton.onclick = async () => {
            try {
                if (!navigator.xr) throw new Error('WebXR not available');
                
                this.vrSession = await navigator.xr.requestSession('immersive-vr', {
                    optionalFeatures: ['local-floor', 'bounded-floor']
                });
                
                await this.renderer.xr.setSession(this.vrSession);
                this.instructionPanel.visible = true;
                clearTimeout(this.instructionTimeout);
                this.instructionTimeout = setTimeout(() => {
                    if (this.instructionPanel) this.instructionPanel.visible = false;
                }, 10000); // Hide after 10 seconds
                if (!this.spokenOnce && 'speechSynthesis' in window) {
                    const msg = new SpeechSynthesisUtterance(
                        'Welcome to VR. Use right thumbstick to move. Left thumbstick to turn. A or X to teleport. Trigger to interact.'
                    );
                    msg.rate = 1;
                    msg.pitch = 1;
                    window.speechSynthesis.speak(msg);
                    this.spokenOnce = true;
                }
                this.isVRActive = true;
                vrButton.style.display = 'none';
                
                this.vrSession.addEventListener('end', () => {
                    this.isVRActive = false;
                    this.vrSession = null;
                    vrButton.style.display = 'block';
                    this.teleportRay.visible = false;
                    this.teleportMarker.visible = false;
                    this.isAiming = false;
                    if (this.motorControlPanel) this.motorControlPanel.visible = false;
                    this.isMotorControlActive = false;
                });
            } catch (error) {
                console.error('VR Error:', error);
                this.showError(`VR Error: ${error.message}`);
            }
        };
    }
    
    createVRMotorControlPanel() {
        this.motorControlPanel = new THREE.Group();
        this.motorControlPanel.visible = false;
        this.scene.add(this.motorControlPanel);

        const panelGeometry = new THREE.PlaneGeometry(1.2, 0.8);
        const panelMaterial = new THREE.MeshBasicMaterial({ color: 0x333333, side: THREE.DoubleSide });
        const panel = new THREE.Mesh(panelGeometry, panelMaterial);
        panel.position.set(0, 0, -0.01);
        this.motorControlPanel.add(panel);

        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 256;
        const context = canvas.getContext('2d');
        context.fillStyle = 'rgba(0, 0, 0, 0.7)';
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = 'white';
        context.font = '24px Arial';
        context.fillText('Motor Controls', 20, 30);
        context.font = '20px Arial';
        context.fillText('Voltage (V): 12.0', 20, 80);
        context.fillText('Load (N·m): 1.0', 20, 140);
        context.fillText('RPM: 0', 20, 200);
        context.fillText('Current: 0 A', 20, 230);

        const texture = new THREE.CanvasTexture(canvas);
        const uiMaterial = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
        const uiPlane = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.6), uiMaterial);
        uiPlane.position.set(0, 0, 0);
        this.motorControlPanel.add(uiPlane);

        this.voltageSlider = this.createSlider(1.0, 0.1, 0.04, 0.02);
        this.voltageSlider.position.set(0, 0.15, 0.02);
        this.motorControlPanel.add(this.voltageSlider);

        this.loadSlider = this.createSlider(1.0, 0.1, 0.04, 0.02);
        this.loadSlider.position.set(0, 0.05, 0.02);
        this.motorControlPanel.add(this.loadSlider);
    }
    
    createSlider(width, height, handleSize, zOffset) {
        const sliderGroup = new THREE.Group();
        const trackGeometry = new THREE.PlaneGeometry(width, height);
        const trackMaterial = new THREE.MeshBasicMaterial({ color: 0x555555 });
        const track = new THREE.Mesh(trackGeometry, trackMaterial);
        sliderGroup.add(track);

        const handleGeometry = new THREE.PlaneGeometry(handleSize, height * 2);
        const handleMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const handle = new THREE.Mesh(handleGeometry, handleMaterial);
        handle.position.set(0, 0, zOffset);
        handle.userData = { isHandle: true, minX: -width / 2, maxX: width / 2 };
        sliderGroup.add(handle);

        return sliderGroup;
    }
    
    checkWebXRSupport() {
        // Only check VR if WebGL is working
        if (!this.renderer || !this.renderer.getContext()) {
            console.log('WebGL not available - VR disabled');
            document.getElementById('vrButton').style.display = 'none';
            return;
        }
        
        if (navigator.xr) {
            navigator.xr.isSessionSupported('immersive-vr').then(supported => {
                if (!supported) {
                    console.log('Immersive VR not supported');
                    document.getElementById('vrButton').style.display = 'none';
                } else {
                    console.log('VR supported and available');
                }
            }).catch(err => {
                console.warn('WebXR check failed:', err.message);
                document.getElementById('vrButton').style.display = 'none';
            });
        } else {
            console.log('WebXR not supported in this browser');
            document.getElementById('vrButton').style.display = 'none';
        }
    }
    
    // Update methods that need to be called in the main animation loop
update(delta) {
    if (this.isVRActive) {
        this.updateVRControllers();
        this.handleVRMovement(delta);
        this.handleVRTeleport();
        this.handleSnapTurn();
        this.updateVRMotorControlPanel();

        // ✅ Speak instructions on first VR frame
        if (!this.spokenOnce && typeof speechSynthesis !== 'undefined') {
            const msg = new SpeechSynthesisUtterance(
                'Welcome to VR mode. Use right thumbstick to move, left to turn, and trigger to interact.'
            );
            msg.rate = 1;
            msg.pitch = 1;
            window.speechSynthesis.speak(msg);
            this.spokenOnce = true;
        }
    }
}
    
    updateVRControllers() {
        if (!this.vrSession) return;
        const inputSources = this.vrSession.inputSources;
        this.rightGamepad = null;
        this.leftGamepad = null;

        for (let inputSource of inputSources) {
            if (inputSource.handedness === 'right' && inputSource.gamepad) this.rightGamepad = inputSource.gamepad;
            else if (inputSource.handedness === 'left' && inputSource.gamepad) this.leftGamepad = inputSource.gamepad;
        }

        if (this.motorControlPanel && this.motorControlPanel.visible && this.camera) {
            const cameraWorldPos = new THREE.Vector3();
            this.camera.getWorldPosition(cameraWorldPos);
            this.motorControlPanel.position.copy(cameraWorldPos).add(this.camera.getWorldDirection(new THREE.Vector3()).multiplyScalar(-2));
            this.motorControlPanel.lookAt(cameraWorldPos);
            this.motorControlPanel.position.y = cameraWorldPos.y - 0.2;
        }
        if (this.instructionPanel && this.instructionPanel.visible && this.camera) {
            const camPos = new THREE.Vector3();
            this.camera.getWorldPosition(camPos);
            const camDir = this.camera.getWorldDirection(new THREE.Vector3());
            this.instructionPanel.position.copy(camPos).add(camDir.multiplyScalar(2));
            this.instructionPanel.lookAt(camPos);
            this.instructionPanel.position.y = camPos.y - 0.2;
        }
        // Toggle instruction panel with 'Y' button (usually button[3] on left controller)
        if (this.leftGamepad && this.leftGamepad.buttons.length >= 4) {
            const yPressed = this.leftGamepad.buttons[3].pressed;

            if (yPressed && !this._prevYPressed) {
                this.instructionPanel.visible = !this.instructionPanel.visible;
                console.log('🎮 Y button pressed - toggling instructions:', this.instructionPanel.visible);
            }
            this._prevYPressed = yPressed;
        }



    }
    
    handleVRMovement(delta) {
        if (!this.rightGamepad || !this.rightGamepad.axes || this.rightGamepad.axes.length < 4) return;
        const speed = 4.0;
        const deadzone = 0.2;
        let xAxis = this.rightGamepad.axes[2] || 0;
        let yAxis = this.rightGamepad.axes[3] || 0;

        if (Math.abs(xAxis) < deadzone) xAxis = 0;
        if (Math.abs(yAxis) < deadzone) yAxis = 0;

        if (Math.abs(xAxis) > 0 || Math.abs(yAxis) > 0) {
            const cameraDirection = new THREE.Vector3();
            this.camera.getWorldDirection(cameraDirection);
            cameraDirection.y = 0;
            cameraDirection.normalize();

            const rightVector = new THREE.Vector3();
            rightVector.crossVectors(cameraDirection, this.camera.up).normalize();

            const moveVector = new THREE.Vector3();
            moveVector.addScaledVector(cameraDirection, -yAxis * speed * delta);
            moveVector.addScaledVector(rightVector, xAxis * speed * delta);

            this.dolly.position.add(moveVector);
        }
    }
    
    handleSnapTurn() {
        if (!this.leftGamepad || !this.leftGamepad.axes || this.leftGamepad.axes.length < 2 || this.snapTurnCooldown) return;
        const xAxis = this.leftGamepad.axes[0] || 0;
        const threshold = 0.7;

        if (Math.abs(xAxis) > threshold) {
            const turnDirection = xAxis > 0 ? -1 : 1;
            this.dolly.rotateY(this.snapTurnAngle * turnDirection);
            this.snapTurnCooldown = true;
            setTimeout(() => { this.snapTurnCooldown = false; }, 300);
        }
    }
    
    handleVRTeleport() {
        if (!this.leftController) return;

        if (this.isAiming) {
            this.teleportRay.position.copy(this.leftController.position);
            this.teleportRay.rotation.copy(this.leftController.rotation);
            const tempMatrix = new THREE.Matrix4();
            tempMatrix.identity().extractRotation(this.leftController.matrixWorld);
            const raycaster = new THREE.Raycaster();
            raycaster.ray.origin.setFromMatrixPosition(this.leftController.matrixWorld);
            raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);

            // Note: You'll need to pass the ground object reference to this class
            const ground = this.scene.getObjectByName('ground'); // Assuming you name your ground object
            if (ground) {
                const intersects = raycaster.intersectObjects([ground]);
                if (intersects.length > 0) {
                    const intersection = intersects[0];
                    this.teleportMarker.position.copy(intersection.point);
                    this.teleportMarker.position.y += 0.01;
                    this.teleportMarker.visible = true;
                    this.teleportMarker.material.color.setHex(0x00ff00);
                    this.validTeleportTarget = true;
                } else {
                    this.teleportMarker.visible = false;
                    this.validTeleportTarget = false;
                }
            }
        }
    }
    
    updateVRMotorControlPanel() {
        if (!this.motorControlPanel || !this.motorControlPanel.visible) return;

        const canvas = this.motorControlPanel.children[1].material.map.image;
        const context = canvas.getContext('2d');
        context.fillStyle = 'rgba(0, 0, 0, 0.7)';
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = 'white';
        context.font = '24px Arial';
        context.fillText('Motor Controls', 20, 30);
        context.font = '20px Arial';
        
        // You'll need to access dcMotorParams from the main scope
        if (typeof dcMotorParams !== 'undefined') {
            context.fillText(`Voltage (V): ${dcMotorParams.voltage.toFixed(1)}`, 20, 80);
            context.fillText(`Load (N·m): ${dcMotorParams.loadTorque.toFixed(1)}`, 20, 140);
            const rpm = dcMotorParams.omega * (60 / (2 * Math.PI));
            context.fillText(`RPM: ${rpm.toFixed(0)}`, 20, 200);
            context.fillText(`Current: ${dcMotorParams.current.toFixed(2)} A`, 20, 230);
        }
        this.motorControlPanel.children[1].material.map.needsUpdate = true;

        if (this.rightController) {
            const raycaster = new THREE.Raycaster();
            const tempMatrix = new THREE.Matrix4();
            tempMatrix.identity().extractRotation(this.rightController.matrixWorld);
            raycaster.ray.origin.setFromMatrixPosition(this.rightController.matrixWorld);
            raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);

            const intersects = raycaster.intersectObjects([this.voltageSlider, this.loadSlider], true);
            if (intersects.length > 0 && intersects[0].object.userData.isHandle) {
                const handle = intersects[0].object;
                const point = intersects[0].point;
                const localPoint = handle.parent.worldToLocal(point.clone());
                let newX = Math.max(handle.userData.minX, Math.min(handle.userData.maxX, localPoint.x));
                handle.position.x = newX;

                const t = (newX - handle.userData.minX) / (handle.userData.maxX - handle.userData.minX);
                if (handle.parent === this.voltageSlider && typeof dcMotorParams !== 'undefined') {
                    dcMotorParams.voltage = t * 24;
                    const voltageControl = document.getElementById('voltage');
                    const voltageDisplay = document.getElementById('voltage-value');
                    if (voltageControl) voltageControl.value = dcMotorParams.voltage;
                    if (voltageDisplay) voltageDisplay.textContent = dcMotorParams.voltage.toFixed(1) + 'V';
                } else if (handle.parent === this.loadSlider && typeof dcMotorParams !== 'undefined') {
                    dcMotorParams.loadTorque = t * 5;
                    const loadControl = document.getElementById('load');
                    const loadDisplay = document.getElementById('load-value');
                    if (loadControl) loadControl.value = dcMotorParams.loadTorque;
                    if (loadDisplay) loadDisplay.textContent = dcMotorParams.loadTorque.toFixed(1) + ' N·m';
                }
            }
        }
    }
    
    // Event handlers
    onSelectStart(event, controllerIndex) {
        const controller = event.target;
        const tempMatrix = new THREE.Matrix4();
        tempMatrix.identity().extractRotation(controller.matrixWorld);
        const raycaster = new THREE.Raycaster();
        raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
        raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);

        // You'll need to pass these objects to the VR controller
        const interactables = [];
        if (typeof motorGroup !== 'undefined') interactables.push(motorGroup);
        if (typeof tank !== 'undefined') interactables.push(tank);
        if (typeof water !== 'undefined') interactables.push(water);
        if (typeof pipeValve !== 'undefined') interactables.push(pipeValve);
        
        const intersects = raycaster.intersectObjects(interactables, true);
        
        if (intersects.length > 0) {
            const obj = intersects[0].object;
            let target = obj;
            
            // Find the parent object we care about
            while (target && target !== motorGroup && target !== pipeValve && !interactables.includes(target)) {
                target = target.parent;
            }
            
            if (target === motorGroup && controllerIndex === 1) {
                // Right controller interacts with motor control panel
                this.isMotorControlActive = !this.isMotorControlActive;
                this.motorControlPanel.visible = this.isMotorControlActive;
                if (this.isMotorControlActive) {
                    const cameraWorldPos = new THREE.Vector3();
                    this.camera.getWorldPosition(cameraWorldPos);
                    this.motorControlPanel.position.copy(cameraWorldPos).add(this.camera.getWorldDirection(new THREE.Vector3()).multiplyScalar(-2));
                    this.motorControlPanel.lookAt(cameraWorldPos);
                    this.motorControlPanel.position.y = cameraWorldPos.y - 0.2;
                }
            } else if (target === pipeValve) {
                // Any controller can interact with the valve
                if (typeof toggleWaterPipe === 'function') {
                    toggleWaterPipe();
                    console.log('VR: Water valve toggled by controller', controllerIndex);
                }
            }
        }
    }

    onSelectEnd(event, controllerIndex) {}

    onSqueezeStart(event, controllerIndex) {
        if (controllerIndex === 0 && this.leftController) {
            this.isAiming = true;
            this.teleportRay.visible = true;
            if (this.leftController.children.length > 0) this.leftController.add(this.teleportRay);
        }
    }

    onSqueezeEnd(event, controllerIndex) {
        if (controllerIndex === 0 && this.isAiming) {
            if (this.validTeleportTarget && this.teleportMarker.visible) {
                const targetPosition = this.teleportMarker.position.clone();
                targetPosition.y = 0;
                this.dolly.position.copy(targetPosition);
            }
            this.isAiming = false;
            this.teleportRay.visible = false;
            this.teleportMarker.visible = false;
            this.validTeleportTarget = false;
        }
    }
    
    // Utility methods
    showError(message) {
        if (typeof showError === 'function') {
            showError(message);
        } else {
            console.error(message);
        }
    }
    
    // Getter methods for main code to access VR state
    getIsVRActive() {
        return this.isVRActive;
    }
    
    getVRSession() {
        return this.vrSession;
    }
    
    // Method to set references to objects that VR needs to interact with
    setInteractableObjects(objects) {
        this.interactableObjects = objects;
    }
    
    // Method to set ground reference for teleportation
    setGroundReference(ground) {
        this.ground = ground;
        if (ground) {
            ground.name = 'ground'; // Name it for easy finding
        }
    }
}