class ProjectModalComponent extends HTMLElement {
    constructor() {
        super();
        this.isOpen = false;
    }

    connectedCallback() {
        this.createModalStructure();
        this.setupEventListeners();
    }

    createModalStructure() {
        this.innerHTML = `
            <div class="project-modal-container">
                <div class="project-modal-content" style="display: none;">
                    <button class="project-modal-close" aria-label="Закрыть модальное окно">
                        <svg width="1.5rem" height="1.5rem" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                    <slide-animate animation="slide-in" style="justify-self: center;">
                        <h2 class="project-modal-title"></h2>
                    </slide-animate>

                    <slide-animate animation="slide-in-pseudo" pseudo="in">
                        <p class="project-modal-description"></p>
                    </slide-animate>
                    
                    <div class="project-modal-details">
                        <slide-animate animation="slide-in">
                            <div class="project-modal-detail-item">
                                <span class="detail-label">Стек:</span>
                                <span class="detail-value project-modal-stack"></span>
                            </div>
                        </slide-animate>
                        
                        <slide-animate animation="slide-in">
                            <div class="project-modal-detail-item">
                                <span class="detail-label">Год:</span>
                                <span class="detail-value project-modal-year"></span>
                            </div>
                        </slide-animate>
                    </div>
                        
                    <div class="project-modal-links">
                        <slide-animate animation="slide-in">
                            <a href="#" class="project-modal-link project-modal-github" target="_blank" rel="noopener">
                                GitHub
                                <svg width="1.5rem" height="1.5rem" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                                </svg>
                            </a>
                        </slide-animate>
                        <slide-animate animation="slide-in">
                            <a href="#" class="project-modal-link project-modal-demo" target="_blank" rel="noopener">
                                Демо
                                <svg width="1.5rem" height="1.5rem" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                                    <polyline points="15,3 21,3 21,9"></polyline>
                                    <line x1="10" y1="14" x2="21" y2="3"></line>
                                </svg>
                            </a>
                        </slide-animate>
                    </div>

                    <div class="project-modal-images"></div>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        const container = this.querySelector('.project-modal-container');
        const closeButton = this.querySelector('.project-modal-close');

        if (!container || !closeButton) return;

        this.onclick = (e) => {
            if (e.target === this) {
                this.close();
            }
        };

        closeButton.onclick = () => {
            this.close();
        };

        // Предотвращение закрытия при клике на контент
        container.onclick = (e) => {
            e.stopPropagation();
        };

        this.handleKeydown = (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        };

        document.addEventListener('keydown', this.handleKeydown);
    }

    disconnectedCallback() {
        if (this.handleKeydown) {
            document.removeEventListener('keydown', this.handleKeydown);
        }
    }

    open(projectData) {
        if (this.isOpen) return;
        const content = this.querySelector('.project-modal-content');
        this.updateContent(projectData);
        this.style.display = null;
        document.body.classList.add('no-scroll');

        setTimeout(() => {
            content.style.display = null;
        }, 600);

        requestAnimationFrame(() => {
            this.setAttribute('is-open', true);
            this.isOpen = true;
        });
    }

    close() {
        if (!this.isOpen) return;
        const content = this.querySelector('.project-modal-content');
        this.setAttribute('is-open', false);

        setTimeout(() => {
            this.style.display = 'none';
            document.body.classList.remove('no-scroll');
            content.style.display = 'none';
            this.isOpen = false;
        }, 600);
    }

    updateContent(projectData) {
        if (!projectData) return;

        const {
            name = '',
            description = '',
            images = [],
            stack = '',
            year = '',
            github = '',
            demo = '',
            path = ''
        } = projectData;

        const projectImages = this.querySelector('.project-modal-images');
        if (projectImages) {
            projectImages.innerHTML = '';
            images.map((img, index) => {
                const slideAnimate = document.createElement('slide-animate');
                slideAnimate.setAttribute('animation', 'slide-in-pseudo');
                slideAnimate.setAttribute('show-on-intersect', '');
                slideAnimate.setAttribute('pseudo', 'in');

                const skeletonImage = document.createElement('skeleton-image');
                const projectImage = document.createElement('img');

                projectImage.classList.add('project-modal-image');
                projectImage.src = path + img;
                projectImage.alt = `${name} #${index + 1}`;
                projectImage.loading = 'lazy';

                skeletonImage.appendChild(projectImage);
                slideAnimate.appendChild(skeletonImage);
                projectImages.appendChild(slideAnimate);
            })
        }

        // Обновляем заголовок
        const titleElement = this.querySelector('.project-modal-title');
        if (titleElement) {
            titleElement.textContent = name;
        }

        // Обновляем описание
        const descriptionElement = this.querySelector('.project-modal-description');
        if (descriptionElement) {
            descriptionElement.textContent = description;
        }

        // Обновляем детали
        const stackElement = this.querySelector('.project-modal-stack');
        if (stackElement) {
            stackElement.textContent = stack;
        }

        const dateElement = this.querySelector('.project-modal-year');
        if (dateElement) {
            dateElement.textContent = year;
        }

        // Обновляем ссылки
        const demoLink = this.querySelector('.project-modal-demo');
        const githubLink = this.querySelector('.project-modal-github');

        if (demoLink) {
            if (demo) {
                demoLink.href = demo;
                demoLink.style.display = 'flex';
            } else {
                demoLink.style.display = 'none';
            }
        }

        if (githubLink) {
            if (github) {
                githubLink.href = github;
                githubLink.style.display = 'flex';
            } else {
                githubLink.style.display = 'none';
            }
        }
    }
}

export const registerProjectModalComponent = () => {
    if (!customElements.get('project-modal')) {
        customElements.define('project-modal', ProjectModalComponent);
    }
}