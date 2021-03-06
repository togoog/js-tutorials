import {render} from "lit-html";
import {html} from "lit-element";
import {EventEmitter} from "./events.js";

const scopes = new WeakMap();

/**
 * @emitEvent decorator
 * @param event
 */
export function emitEvent(event: string = '') {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;
        descriptor.value = function (...args: any) {
            const scope = scopes.get((<any>this).parentElement);
            if (scope != null) {
                scope.events.emit(event || propertyKey, originalMethod.call(scope, ...args));
            }
        };
        return descriptor;
    }
}

/**
 * withoutShadowDOM decorator - disable shadowDOM for the component
 * @param constructor
 */
export function withoutShadowDOM(constructor: Function) {
    // override createRenderRoot
    constructor.prototype.createRenderRoot = function () {
        return this;
    }
}

export class DynamicTemplate {
    public parent: string | Element;
    public id: string;
    public events = new EventEmitter();
    protected el: HTMLDivElement | null = null;

    constructor(parent: string | Element, id: string = '') {
        this.id = id;
        this.parent = (typeof parent === 'string' ? document.querySelector(parent) : parent) || document.body;
    }

    attach() {
        if (this.el == null) {
            this.el = document.body.appendChild(document.createElement('div'));
            if (this.id != '') {
                this.el.setAttribute('id', this.id);
            }
            scopes.set(this.el, this);
        }
        render(this.html(), this.el);
    }

    get visible() {
        return this.el != null;
    }

    detach() {
        this.el?.remove();
        this.el = null;
    }

    html() {
        return html``;
    }
}
