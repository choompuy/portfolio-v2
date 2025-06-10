class SlideAnimateComponent extends HTMLElement {
    constructor() {
        super();
        this.observer = null;
    }

    connectedCallback() {
        if (!this.hasAttribute('animation')) return;

        this.style.opacity = 0;

        if (!this.hasAttribute('show-on-intersect')) {
            this.render()
        } else {
            this.observer = new IntersectionObserver(
                entries => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            this.render();
                            this.observer.disconnect();
                        }
                    });
                },
                {
                    threshold: 0.5
                }
            );

            this.observer.observe(this);
        }
    }

    render() {
        this.style.opacity = 1;
        const animationType = this.getAttribute('animation');

        if (this.hasAttribute('pseudo')) {
            this.removeAttribute('animation');
            this.classList.add(animationType);
            return;
        }
        
        const firstChild = this.firstElementChild;
        const slideContent = document.createElement('div');
        
        slideContent.classList.add('slide-content');

        if (this.hasAttribute('delay')) {
            this.removeAttribute('delay');
            slideContent.setAttribute('delay', '');
        }
        
        slideContent.classList.add(animationType);
        this.replaceChild(slideContent, firstChild);
        slideContent.appendChild(firstChild);
        this.appendChild(slideContent);
    }
}


export const registerSlideAnimateComponent = () => {
    if (!customElements.get('slide-animate')) {
        customElements.define('slide-animate', SlideAnimateComponent);
    }
};
