class ProjectThumbnailComponent extends HTMLElement {
    connectedCallback() {
        this.render();
    }

    render() {
        const props = this.props || {};
        const index = props.index + 1

        if (props.isLast) this.classList.add('last-item');
        
        const button = document.createElement('button');
        button.classList.add('project-thumbnail-button');
        button.innerHTML = `
            <slide-animate animation="slide-in" show-on-intersect>
                <h3 class="project-thumbnail-title">${index < 10 ? '0' : ''}${index}//&nbsp;&nbsp;${props.name}</h3>
            </slide-animate>

            <slide-animate animation="slide-in-pseudo" show-on-intersect pseudo="in">
                <skeleton-image>
                    <img class="project-thumbnail-image" src="${props.path + props.thumbnailImg}" alt="Пет-проект #${index}" loading="lazy"/>
                </skeleton-image>
            </slide-animate>

            <slide-animate animation="slide-in-pseudo" show-on-intersect pseudo="in">
                <p class="project-thumbnail-description">${props.description}</p>
            </slide-animate>
        `;
        
        button.onclick = () => window.openProjectModal(props);
        this.append(button);
    }
}


export const registerProjectThumbnailComponent = () => {
    if (!customElements.get('project-thumbnail')) {
        customElements.define('project-thumbnail', ProjectThumbnailComponent);
    }
};