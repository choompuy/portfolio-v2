export class EventManager {
    constructor() {
        this.handlers = new Map();
    }

    addHandler(element, event, handler, options = {}) {
        const key = `${element.constructor.name}-${event}`;

        element.addEventListener(event, handler, options);

        this.handlers.set(key, {
            element,
            event,
            handler,
            options
        });
    }

    removeHandler(element, event) {
        const key = `${element.constructor.name}-${event}`;
        const handlerData = this.handlers.get(key);

        if (handlerData) {
            element.removeEventListener(event, handlerData.handler, handlerData.options);
            this.handlers.delete(key);
        }
    }

    removeAllHandlers() {
        for (const [key, handlerData] of this.handlers) {
            const { element, event, handler, options } = handlerData;
            element.removeEventListener(event, handler, options);
        }
        this.handlers.clear();
    }

    dispose() {
        this.removeAllHandlers();
    }
}