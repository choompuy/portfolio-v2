import * as THREE from 'three';


export class WaterScene {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.points = null;
        this.mouse = new THREE.Vector2(0, 0);
        this.clock = new THREE.Clock();
        this.animationId = null;
        this.isInitialized = false;

        // Кэшированные значения для оптимизации
        this.containerCache = {
            width: 0,
            height: 0,
            aspect: 0
        };

        this.gridCache = {
            width: 0,
            height: 0,
            sceneWidth: 0,
            sceneHeight: 0
        };

        this.POINTS_PER_PIXEL = 0.05;
        this.MAX_GRID_WIDTH = 200;
        this.MAX_GRID_HEIGHT = 150;
        this.MIN_GRID_WIDTH = 20;
        this.MIN_GRID_HEIGHT = 15;

        this.needsResize = false;
        this.lastResizeTime = 0;
        this.resizeDebounceDelay = 250;

        // Привязываем методы к контексту
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleResize = this.handleResize.bind(this);
        this.handleScroll = this.handleScroll.bind(this);
    }

    async init(loadingManager) {
        loadingManager.startTask('threejs-init');
        loadingManager.setStatus('Инициализация Three.js...');

        this.calculateGridSizes();
        this.initScene();
        this.initCamera();
        await this.initRenderer();
        loadingManager.completeTask('threejs-init');

        loadingManager.startTask('geometry');
        loadingManager.setStatus('Создание геометрии...');
        const geometry = this.createWaterGeometry();
        loadingManager.completeTask('geometry');

        loadingManager.startTask('shaders');
        loadingManager.setStatus('Компиляция шейдеров...');
        const material = this.createWaterMaterial();
        loadingManager.completeTask('shaders');

        // Создание точек
        this.points = new THREE.Points(geometry, material);
        this.scene.add(this.points);

        loadingManager.startTask('scene-setup');
        loadingManager.setStatus('Настройка сцены...');
        this.isInitialized = true;
        loadingManager.completeTask('scene-setup');

        return true;
    }

    calculateGridSizes() {
        const canvasContainer = document.querySelector('.canvas-container');
        if (!canvasContainer) return;

        const newWidth = canvasContainer.clientWidth;
        const newHeight = canvasContainer.clientHeight;

        // Избегаем пересчетов если размеры не изменились
        if (this.containerCache.width === newWidth && this.containerCache.height === newHeight) {
            return;
        }

        this.containerCache.width = newWidth;
        this.containerCache.height = newHeight;
        this.containerCache.aspect = newWidth / newHeight;

        this.gridCache.width = Math.max(
            this.MIN_GRID_WIDTH,
            Math.min(Math.floor(newWidth * this.POINTS_PER_PIXEL), this.MAX_GRID_WIDTH)
        );

        this.gridCache.height = Math.max(
            this.MIN_GRID_HEIGHT,
            Math.min(Math.floor(newHeight * this.POINTS_PER_PIXEL), this.MAX_GRID_HEIGHT)
        );

        this.gridCache.sceneWidth = 20 * this.containerCache.aspect;
        this.gridCache.sceneHeight = 18;
    }

    initScene() {
        this.scene = new THREE.Scene();
    }

    initCamera() {
        this.camera = new THREE.PerspectiveCamera(50, this.containerCache.aspect, 0.1, 100);
        this.camera.position.z = 20;
    }

    async initRenderer() {
        return new Promise((resolve, reject) => {
            try {
                const canvasContainer = document.querySelector('.canvas-container');
                if (!canvasContainer) {
                    throw new Error('Canvas container не найден');
                }

                this.renderer = new THREE.WebGLRenderer({
                    antialias: true,
                    alpha: true,
                    powerPreference: "high-performance"
                });

                this.renderer.setSize(this.containerCache.width, this.containerCache.height);
                this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
                canvasContainer.appendChild(this.renderer.domElement);

                // Даем время на инициализацию WebGL контекста
                setTimeout(resolve, 100);
            } catch (error) {
                reject(error);
            }
        });
    }

    createWaterGeometry() {
        const pointCount = this.gridCache.width * this.gridCache.height;
        const positions = new Float32Array(pointCount * 3);
        const uvs = new Float32Array(pointCount * 2);

        let i = 0;
        for (let y = 0; y < this.gridCache.height; y++) {
            for (let x = 0; x < this.gridCache.width; x++) {
                const u = x / (this.gridCache.width - 1);
                const v = y / (this.gridCache.height - 1);

                positions[i * 3] = (u - 0.5) * this.gridCache.sceneWidth;
                positions[i * 3 + 1] = (v - 0.5) * this.gridCache.sceneHeight;
                positions[i * 3 + 2] = 0;

                uvs[i * 2] = u;
                uvs[i * 2 + 1] = v;
                i++;
            }
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));

        return geometry;
    }

    createWaterMaterial() {
        return new THREE.ShaderMaterial({
            vertexShader: `
                uniform float uTime;
                uniform vec2 uMouse;
                varying float vAlpha;

                vec3 gerstnerWave(vec2 pos, vec2 direction, float amplitude, float frequency, float phase, float steepness) {
                    float c = cos(dot(direction, pos) * frequency + phase);
                    float s = sin(dot(direction, pos) * frequency + phase);
                    
                    return vec3(
                        steepness * amplitude * direction.x * c,
                        steepness * amplitude * direction.y * c,
                        amplitude * s
                    );
                }

                void main() {
                    vec3 pos = position;
                    vec2 worldPos = pos.xy * 0.1;
                    
                    vec3 wave1 = gerstnerWave(worldPos, normalize(vec2(1.0, 0.3)), 0.3, 2.5, uTime * 0.5, 0.2);
                    vec3 wave2 = gerstnerWave(worldPos, normalize(vec2(-0.7, 1.0)), 0.25, 3.2, uTime * 1.2 + 1.0, 0.15);
                    vec3 wave3 = gerstnerWave(worldPos, normalize(vec2(0.5, -0.8)), 0.4, 1.8, uTime * 0.9 + 2.0, 0.25);
                    vec3 wave4 = gerstnerWave(worldPos, normalize(vec2(-0.2, 0.9)), 0.2, 4.1, uTime * 1.1 + 3.0, 0.1);
                    
                    float longWave = sin(worldPos.x * 0.3 + uTime * 0.4) * cos(worldPos.y * 0.2 + uTime * 0.3) * 0.6;
                    
                    pos += wave1 + wave2 + wave3 + wave4;
                    pos.z += longWave;
                    
                    vec2 mousePos = uMouse * 1.0;
                    float mouseDist = length(worldPos - mousePos);
                    float mouseWave = sin(mouseDist * 8.0 - uTime * 2.0) * exp(-mouseDist * 2.0) * 1.5;
                    pos.z += mouseWave;
                    
                    vAlpha = smoothstep(-1.5, 1.5, pos.z);

                    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                    
                    float pointSize = (vAlpha * 2.5) + abs(sin(uTime + pos.x * 0.1));
                    gl_PointSize = pointSize;
                }
            `,
            fragmentShader: `
                uniform float uTime;
                varying float vAlpha;
                
                void main() {
                    vec2 coord = gl_PointCoord - 0.5;
                    float mask = 1.0 - smoothstep(0.2, 0.5, length(coord));
                    
                    vec3 deepColor = vec3(0.1, 0.3, 0.8);
                    vec3 surfaceColor = vec3(0.8, 0.9, 1.0);
                    vec3 color = mix(deepColor, surfaceColor, vAlpha);
                    
                    gl_FragColor = vec4(color, vAlpha * mask * 0.8);
                }
            `,
            uniforms: {
                uTime: { value: 0 },
                uMouse: { value: new THREE.Vector2() }
            },
            transparent: true,
            depthTest: false
        });
    }

    handleMouseMove(e) {
        const canvasContainer = document.querySelector('.canvas-container');
        if (!canvasContainer) return;

        const rect = canvasContainer.getBoundingClientRect();
        this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    }

    handleResize() {
        if (!this.isInitialized) return;

        this.calculateGridSizes();

        if (this.camera) {
            this.camera.aspect = this.containerCache.aspect;
            this.camera.updateProjectionMatrix();
        }

        if (this.renderer) {
            this.renderer.setSize(this.containerCache.width, this.containerCache.height);
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        }

        if (this.points) {
            const newGeometry = this.createWaterGeometry();
            this.points.geometry.dispose();
            this.points.geometry = newGeometry;
        }
    }

    handleScroll(scrolled) {
        if (!this.camera) return;

        if (scrolled < 1000) {
            this.camera.position.z = 20 - scrolled * 0.01;
        }
    }

    animate() {
        if (!this.isInitialized) return;

        this.animationId = requestAnimationFrame(() => this.animate());

        const t = this.clock.getElapsedTime();

        if (this.points && this.points.material) {
            this.points.material.uniforms.uTime.value = t;
            this.points.material.uniforms.uMouse.value.lerp(this.mouse, 0.1);
        }

        if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
    }

    start() {
        if (!this.isInitialized) {
            console.warn('Сцена не инициализирована');
            return;
        }
        this.animate();
    }

    stop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
            console.log('⏹️ Анимация остановлена');
        }
    }

    dispose() {
        console.log('🧹 Освобождение ресурсов...');

        this.stop();

        if (window.eventManager) {
            window.eventManager.dispose();
        }

        if (this.points) {
            if (this.points.geometry) {
                this.points.geometry.dispose();
            }
            if (this.points.material) {
                this.points.material.dispose();
            }
        }

        if (this.renderer) {
            this.renderer.dispose();

            // Удаляем canvas из DOM
            const canvas = this.renderer.domElement;
            if (canvas && canvas.parentNode) {
                canvas.parentNode.removeChild(canvas);
            }
        }

        this.isInitialized = false;
    }
}