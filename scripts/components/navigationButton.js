class NavigationButtonComponent extends HTMLElement {
    connectedCallback() {
        this.render();
    }

    render() {
        if (this.querySelector('button')) return;
        const button = document.createElement('button');
        button.textContent = this.getAttribute('label');
        button.onclick = () => {
            const target = document.getElementById(this.getAttribute('scroll-to-id'));
            if (target) {
                target.scrollIntoView({ behavior: 'auto' });
                const headerContent = document.querySelector('.header-content');
                if (headerContent?.classList.contains('active')) {
                    document.querySelector('animate#reverse').beginElement();
                    document.body.classList.remove('no-scroll');
                    headerContent.classList.remove('active');
                }
            }
        };
        this.appendChild(button);
    }
}


export const registerNavigationButtonComponent = () => {
    if (!customElements.get('navigation-button')) {
        customElements.define('navigation-button', NavigationButtonComponent);
    }
}