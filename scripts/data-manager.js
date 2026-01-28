export class DataManager {
    constructor() {
        this.projectsData = [];
    }

    async loadProjectData(loadingManager) {
        loadingManager.setStatus('Загрузка данных проектов...');

        this.projectsData = await fetch("data.json")
            .then(response => response.json())
            .then(({ data }) => data)
            .catch(error => console.error("Ошибка загрузки данных:", error));

        loadingManager.completeTask('data-loading');
        return this.projectsData;
    }
}