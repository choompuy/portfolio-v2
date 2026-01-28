export class EventManager {
    constructor() {
        this.events = new WeakMap();
    }

    add(element, event, handler, options = {}) {
        if (!this.events.has(element)) {
            this.events.set(element, new Map());
        }

        const elementEvents = this.events.get(element);

        if (!elementEvents.has(event)) {
            elementEvents.set(event, new Set());
        }

        element.addEventListener(event, handler, options);
        elementEvents.get(event).add({ handler, options });
    }

    remove(element, event) {
        const elementEvents = this.events.get(element);
        if (!elementEvents) return;

        const handlers = elementEvents.get(event);
        if (!handlers) return;

        for (const item of handlers) {
            if (item.handler === handler) {
                element.removeEventListener(event, handler, item.options);
                handlers.delete(item);
            }
        }

        if (handlers.size === 0) elementEvents.delete(event);
        if (elementEvents.size === 0) this.events.delete(element);
    }

    removeAll() {
        const elementEvents = this.events.get(element);
        if (!elementEvents) return;

        for (const [event, handlers] of elementEvents.entries()) {
            for (const { handler, options } of handlers) {
                element.removeEventListener(event, handler, options);
            }
        }

        this.events.delete(element);
    }

    dispose() {
        this.removeAll();
    }
}
