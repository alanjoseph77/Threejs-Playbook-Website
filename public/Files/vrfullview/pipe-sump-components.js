import * as THREE from 'three';

class VRController {
    constructor(scene, camera, renderer, dolly) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        this.dolly = dolly;
        
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
        
        // Instructions panel
        this.instructionsPanel = null;
        this.buttonCooldown = false;
        
        // Initialize VR system
        this.init();
    }
    
    init() {
        this.setupVRControllers();
        this.createTeleportSystem();
        this.createVRButton();
        this.createVRMotorControlPanel();
        this.createVRInstructionsPanel();
        this.checkWebXRSupport();
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
    
    createVRInstructionsPanel() {
        this.instructionsPanel = new THREE.Group();
        this.instructionsPanel.visible = false;
        this.scene.add(this.instructionsPanel);

        // Main panel background
        const panelGeometry = new THREE.PlaneGeometry(2.0, 1.5);
        const panelMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x000033, 
            transparent: true, 
            opacity: 0.8,
            side: THREE.DoubleSide 
        });
        const panel = new THREE.Mesh(panelGeometry, panelMaterial);
        panel.position.set(0, 0, -0.01);
        this.instructionsPanel.add(panel);

        // Create canvas with instructions
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 768;
        const context = canvas.getContext('2d');
        
        // Background
        context.fillStyle = 'rgba(0, 0, 50, 0.9)';
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        // Border
        context.strokeStyle = '#00ff00';
        context.lineWidth = 4;
        context.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
        
        // Title
        context.fillStyle = '#00ff00';
        context.font = 'bold 48px Arial';
        context.textAlign = 'center';
        context.fillText('🎮 VR CONTROLS', canvas.width / 2, 80);
        
        // Instructions
        context.fillStyle = 'white';
        context.font = '32px Arial';
        context.textAlign = 'left';
        
        const instructions = [
            '🎯 MOVEMENT:',
            '  • Right thumbstick: Walk around',
            '  • Left thumbstick: Snap turn left/right',
            '',
            '🚁 TELEPORT:',
            '  • Squeeze left trigger: Aim teleport',
            '  • Release trigger: Teleport to green circle',
            '',
            '🔧 INTERACTIONS:',
            '  • Point and pull trigger: Interact with objects',
            '  • Green valve: Point + trigger to open/close pipe',
            '  • Motor: Right hand trigger for control panel',
            '',
            '💡 TIPS:',
            '  • Green valve = water flowing',
            '  • Red valve = no water flow',
            '  • Motor runs automatically when needed',
            '',
            '📱 Press A or X button to hide these instructions'
        ];
        
        let yPos = 150;
        instructions.forEach(line => {
            if (line.startsWith('🎯') || line.startsWith('🚁') || line.startsWith('🔧') || line.startsWith('💡')) {
                context.fillStyle = '#ffff00';
                context.font = 'bold 32px Arial';
            } else if (line.startsWith('  •')) {
                context.fillStyle = '#cccccc';
                context.font = '28px Arial';
            } else {
                context.fillStyle = 'white';
                context.font = '32px Arial';
            }
            context.fillText(line, 50, yPos);
            yPos += 40;
        });

        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;
        const instructionsMaterial = new THREE.MeshBasicMaterial({ 
            map: texture, 
            transparent: true,
            side: THREE.DoubleSide 
        });
        const instructionsPlane = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 1.5), instructionsMaterial);
        instructionsPlane.position.set(0, 0, 0);
        this.instructionsPanel.add(instructionsPlane);
    }
    
    showVRInstructions() {
        if (this.instructionsPanel) {
            this.instructionsPanel.visible = true;
            this.positionInstructionsPanel();
        } else {
            console.error('Instructions panel not initialized');
        }
    }
    
    positionInstructionsPanel() {
        if (this.instructionsPanel && this.camera) {
            const cameraWorldPos = new THREE.Vector3();
            this.camera.getWorldPosition(cameraWorldPos);
            const direction = new THREE.Vector3();
            this.camera.getWorldDirection(direction);
            this.instructionsPanel.position.copy(cameraWorldPos).add(direction.multiplyScalar(-2.5));
            this.instructionsPanel.lookAt(cameraWorldPos);
            this.instructionsPanel.position.y = cameraWorldPos.y;
        }
    }
    
    createVRButton() {
        const vrButton = document.getElementById('vrButton');
        
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
                this.isVRActive = true;
                vrButton.style.display = 'none';
                
                setTimeout(() => {
                    this.showVRInstructions();
                }, 1000);
                
                this.vrSession.addEventListener('end', () => {
                    this.isVRActive = false;
                    this.vrSession = null;
                    vrButton.style.display = 'block';
                    this.teleportRay.visible = false;
                    this.teleportMarker.visible = false;
                    this.isAiming = false;
                    if (this.motorControlPanel) this.motorControlPanel.visible = false;
                    if (this.instructionsPanel) this.instructionsPanel.visible = false;
                    this.isMotorControlActive = false;
                });
            } catch (error) {
                console.error('VR Error:', error);
                this.showError(`VR Error: ${error.message}`);
            }
        };
    }
    
    handleControllerButtons() {
        if (!this.rightGamepad && !this.leftGamepad) return;
        
        const rightButtons = this.rightGamepad ? this.rightGamepad.buttons : [];
        const leftButtons = this.leftGamepad ? this.leftGamepad.buttons : [];
        
        if ((rightButtons[4] && rightButtons[4].pressed) || 
            (rightButtons[5] && rightButtons[5].pressed) ||
            (leftButtons[4] && leftButtons[4].pressed) || 
            (leftButtons[5] && leftButtons[5].pressed)) {
            
            if (!this.buttonCooldown) {
                this.instructionsPanel.visible = !this.instructionsPanel.visible;
                if (this.instructionsPanel.visible) {
                    this.positionInstructionsPanel();
                }
                this.buttonCooldown = true;
                setTimeout(() => { this.buttonCooldown = false; }, 500);
            }
        }
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
        texture.needsUpdate = true;
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
    
    update(delta) {
        if (this.isVRActive) {
            this.updateVRControllers();
            this.handleVRMovement(delta);
            this.handleVRTeleport();
            this.handleSnapTurn();
            this.handleControllerButtons();
            this.updateVRMotorControlPanel();
        }
    }
    
    updateVRControllers() {
        if (!this.vrSession) return;
        const inputSources = this.vrSession.inputSources;
        this.rightGamepad = null;
        this.leftGamepad = null;

        for (let inputSource of inputSources) {
            if (inputSource.handedness === 'right' && inputSource.gamepad) this.rightGamepad = inputSource.gamepad;
            else if (inputSource.handedness === 'left' && inputSource.gamepad) this.leftGamepad = inputSource

.gamepad;
        }

        if (this.motorControlPanel && this.motorControlPanel.visible && this.camera) {
            const cameraWorldPos = new THREE.Vector3();
            this.camera.getWorldPosition(cameraWorldPos);
            this.motorControlPanel.position.copy(cameraWorldPos).add(this.camera.getWorldDirection(new THREE.Vector3()).multiplyScalar(-2));
            this.motorControlPanel.lookAt(cameraWorldPos);
            this.motorControlPanel.position.y = cameraWorldPos.y - 0.2;
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

            const ground = this.scene.getObjectByName('ground');
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
    
    onSelectStart(event, controllerIndex) {
        const controller = event.target;
        const tempMatrix = new THREE.Matrix4();
        tempMatrix.identity().extractRotation(controller.matrixWorld);
        const raycaster = new THREE.Raycaster();
        raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
        raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);

        const interactables = [];
        if (typeof motorGroup !== 'undefined') interactables.push(motorGroup);
        if (typeof tank !== 'undefined') interactables.push(tank);
        if (typeof water !== 'undefined') interactables.push(water);
        if (typeof pipeValve !== 'undefined') interactables.push(pipeValve);
        
        const intersects = raycaster.intersectObjects(interactables, true);
        
        if (intersects.length > 0) {
            const obj = intersects[0].object;
            let target = obj;
            
            while (target && target !== motorGroup && target !== pipeValve && !interactables.includes(target)) {
                target = target.parent;
            }
            
            if (target === motorGroup && controllerIndex === 1) {
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
    
    showError(message) {
        if (typeof showError === 'function') {
            showError(message);
        } else {
            console.error(message);
        }
    }
    
    getIsVRActive() {
        return this.isVRActive;
    }
    
    getVRSession() {
        return this.vrSession;
    }
    
    setInteractableObjects(objects) {
        this.interactableObjects = objects;
    }
    
    setGroundReference(ground) {
        this.ground = ground;
        if (ground) {
            ground.name = 'ground';
        }
    }
}

export { VRController };