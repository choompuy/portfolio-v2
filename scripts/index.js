// Импорт Three.js из node_modules
import * as THREE from 'three';

import { registerNavigationButtonComponent } from './components/navigationButton.js';
import { registerProjectThumbnailComponent } from './components/projectThumbnail.js';
import { registerProjectModalComponent } from './components/projectModal.js';
import { registerSlideAnimateComponent } from './components/slideAnimate.js';
import { registerSkeletonImageComponent } from './components/skeletonImage.js';

import { LoadingManager } from "./loading-manager.js";
import { WaterScene } from "./water-scene.js";
import { DataManager } from "./data-manager.js";
import { EventManager } from './event-manager.js';

let waterSceneInstance = null;
let eventManager = null;
let projectModalInstance = null;

async function initApp() {
    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }

    registerNavigationButtonComponent();
    registerProjectThumbnailComponent();
    registerProjectModalComponent();
    registerSlideAnimateComponent();
    registerSkeletonImageComponent();

    const loadingManager = new LoadingManager();

    loadingManager.addTask('threejs-init', 2);
    loadingManager.addTask('geometry', 1);
    loadingManager.addTask('shaders', 1);
    loadingManager.addTask('scene-setup', 1);
    loadingManager.addTask('data-loading', 2);
    loadingManager.addTask('dom-setup', 1);

    try {
        // Убираем динамическую загрузку Three.js, так как теперь импортируем напрямую
        console.log('Three.js загружен из node_modules');
        loadingManager.completeTask('threejs-init');

        const waterScene = new WaterScene();
        const dataManager = new DataManager();

        waterSceneInstance = waterScene;

        const [sceneReady, projectsData] = await Promise.all([
            waterSceneInstance.init(loadingManager),
            dataManager.loadProjectData(loadingManager)
        ]);

        if (sceneReady) {
            loadingManager.setStatus('Запуск анимации...');
            waterScene.start();
        }

        loadingManager.setStatus('Настройка интерфейса...');
        setupUI(projectsData);
        loadingManager.completeTask('dom-setup');
    } catch (error) {
        console.error(error);
        loadingManager.setError(error);
        return;
    }
}

function setupUI(projectsData) {
    setupProjectModal();
    setupProjectThumbnails(projectsData);
    setupEventListeners();
}

function setupProjectModal() {
    projectModalInstance = document.createElement('project-modal');
    projectModalInstance.style.display = 'none';
    projectModalInstance.setAttribute('is-open', false);
    document.body.appendChild(projectModalInstance);
}

function setupProjectThumbnails(projectsData) {
    const projectPrimary = document.querySelector(".project-primary");
    const projectsWrapper = document.querySelector(".projects-wrapper");
    const lastProjectItem = (projectsData.length - 1) % 2 === 1 ? projectsData.length - 1 : -1;

    projectsWrapper.innerHTML = null;
    projectsData.forEach((item, index) => {
        const projectThumbnail = document.createElement('project-thumbnail');
        projectThumbnail.props = {
            index: index,
            isLast: lastProjectItem === index,
            ...item
        };

        if (index == 0) {
            projectPrimary.appendChild(projectThumbnail)
            return;
        }
        projectsWrapper.appendChild(projectThumbnail);
    });
}

function setupEventListeners() {
    const headerContent = document.querySelector('.header-content');
    const burgerButton = document.querySelector('.header-burger-button');
    const burgerReverseAnim = document.querySelector('animate#reverse');
    const canvasContainer = document.querySelector('.canvas-container');

    eventManager = new EventManager();

    let needsResize = false;
    let lastResizeTime = 0;
    const resizeDebounceDelay = 250;

    const mouseHandler = (() => {
        let mouseThrottle = false;
        return (e) => {
            if (mouseThrottle) return;
            mouseThrottle = true;

            requestAnimationFrame(() => {
                waterSceneInstance.handleMouseMove(e);
                mouseThrottle = false;
            });
        };
    })();

    const resizeHandler = () => {
        needsResize = true;
        lastResizeTime = Date.now();

        setTimeout(() => {
            if (needsResize && Date.now() - lastResizeTime >= resizeDebounceDelay) {
                waterSceneInstance.handleResize();
                needsResize = false;
            }
        }, resizeDebounceDelay);

        if (window.innerWidth >= 960) {
            if (headerContent.classList.contains('active')) {
                headerContent.classList.remove('active');
                document.body.classList.remove('no-scroll')
                burgerReverseAnim.beginElement();
            }
        }
    };

    const scrollHandler = () => {
        const scrolled = window.pageYOffset;
        const canvasContainerBottom = canvasContainer.clientHeight - (headerContent.clientHeight / 2);
        let isInverseHeaderContent = headerContent.classList.contains('inverse-color');

        waterSceneInstance.handleScroll(scrolled);

        if (scrolled < canvasContainerBottom) {
            if (!isInverseHeaderContent) {
                setClassListInverseColor(headerContent, true);
            }
            isInverseHeaderContent = true;
        } else {
            if (isInverseHeaderContent) {
                setClassListInverseColor(headerContent, false);
            }
            isInverseHeaderContent = false;
        }
    };

    const handleBurgerButton = () => {
        headerContent.classList.toggle('active');
        document.body.classList.toggle('no-scroll')
    };

    eventManager.addHandler(window, 'mousemove', mouseHandler);
    eventManager.addHandler(window, 'resize', resizeHandler);
    eventManager.addHandler(window, 'scroll', scrollHandler, { passive: true });
    eventManager.addHandler(burgerButton, 'click', handleBurgerButton);
}

function setClassListInverseColor(element, isAdd) {
    if (isAdd) {
        if (!element.classList.contains('inverse-color')) element.classList.add('inverse-color');
    }
    else element.classList.remove('inverse-color');
}

// Запуск приложения
document.addEventListener('DOMContentLoaded', initApp);

// Глобальные функции для совместимости

window.openProjectModal = function (props) {
    if (!projectModalInstance && !props) return;

    projectModalInstance.open(props);
}

window.closeProjectModal = function () {
    if (!projectModalInstance) return;

    projectModalInstance.close()
};

window.eventManager = eventManager;