class SkeletonImageComponent extends HTMLElement {
    connectedCallback() {
        this.render();
    }

    render() {
        const img = this.querySelector('img');
        if (!img) return;
        this.classList.add('active');
        
        img.onload = () => {
            this.classList.remove('active');
            img.classList.add('loaded');
        }
    }
}


export const registerSkeletonImageComponent = () => {
    if (!customElements.get('skeleton-image')) {
        customElements.define('skeleton-image', SkeletonImageComponent);
    }
}