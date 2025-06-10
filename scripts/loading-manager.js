export class LoadingManager {
    constructor() {
        this.progress = 0;
        this.tasks = [];
        this.loadingScreen = document.querySelector('.loading-screen');
        this.loadingPercentage = document.querySelector('.loading-percentage');
        this.loadingStatus = document.querySelector('.loading-status');
        this.isHidden = false;
        this.isError = false;
    }

    /**
        Добавляет новую задачу в очередь загрузки
        @param {string} name - Название задачи
        @param {number} weight - Вес задачи (влияет на процент)
    */
    addTask(name, weight = 1) {
        this.tasks.push({
            name,
            weight,
            completed: false,
            startTime: null,
            endTime: null
        });
    }

    completeTask(name) {
        const task = this.tasks.find(t => t.name === name);
        if (task && !task.completed) {
            task.completed = true;
            task.endTime = Date.now();
            this.updateProgress();

            // Логирование для отладки
            if (task.startTime) {
                const duration = task.endTime - task.startTime;
                console.log(`✅ Задача "${name}" выполнена за ${duration}ms`);
            }
        }
    }

    startTask(name) {
        const task = this.tasks.find(t => t.name === name);
        if (task) {
            task.startTime = Date.now();
            console.log(`🚀 Начата задача: ${name}`);
        }
    }

    updateProgress() {
        const totalWeight = this.tasks.reduce((sum, task) => sum + task.weight, 0);
        const completedWeight = this.tasks
            .filter(task => task.completed)
            .reduce((sum, task) => sum + task.weight, 0);

        const newProgress = Math.round((completedWeight / totalWeight) * 100);

        this.animateProgress(newProgress);
    }

    animateProgress(targetProgress) {
        const startProgress = this.progress;
        const duration = 500; // Длительность анимации в мс
        const startTime = Date.now();

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            const easeOutCubic = 1 - Math.pow(1 - progress, 3);

            this.progress = Math.round(startProgress + (targetProgress - startProgress) * easeOutCubic);
            this.updateUI();

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                this.progress = targetProgress;
                this.updateUI();

                if (this.progress === 100) {
                    this.onComplete();
                }
            }
        };

        requestAnimationFrame(animate);
    }

    updateUI() {
        if (this.isHidden || this.isError) return;

        this.loadingPercentage.textContent = this.progress;
    }

    setStatus(status) {
        if (this.isHidden || this.isError) return;

        this.loadingStatus.textContent = status;
        console.log(`📋 Статус: ${status}`);
    }
    
    setError(error) {
        if (this.isHidden) return;
        this.isError = true;

        this.loadingPercentage.textContent = 'ОШИБКА!';
        this.loadingStatus.textContent = 'Пожалуйста, попробуйте позже.';
    }

    onComplete() {
        this.setStatus('Готово!');

        setTimeout(() => {
            this.hide();
        }, 400);
    }

    hide() {
        if (this.isHidden) return;

        this.isHidden = true;
        this.loadingScreen.classList.add('hide');
        document.body.classList.remove('page-loading');
        
        this.loadingPercentage.classList.add('slide-out');
        this.loadingStatus.classList.add('slide-out');

        setTimeout(() => {
            if (this.loadingScreen) {
                this.loadingScreen.remove()
            }
        }, 1000);

        console.log('🎉 Загрузка завершена!');
    }
}