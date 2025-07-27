type HTMLElementTagNameMapEx = HTMLElementTagNameMap & { [name: string]: HTMLElement };

export function getById<K extends keyof HTMLElementTagNameMapEx>(qualifiedName?: K): HTMLCollectionOf<HTMLElementTagNameMapEx[K]>;