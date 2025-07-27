import { AbortControllerEx, AbortError, DebounceSignal, getById, isAbort, Mutex, noop, ResponseError } from "./utils.mjs";

const navMutex = new Mutex();

/**@type {HTMLLinkElement[]}*/
const appliedStyles = [];

/**@type {Router.PageModule[]}*/
const appliedModules = [];


const main = getById("main-content");
const debounce = new DebounceSignal();

window.addEventListener("hashchange", async ev => {
    const url = new URL(ev.newURL);
    await navTo(url.hash.slice(1));
});

if (location.hash.length > 0) {
    await navTo(location.hash.slice(1))
}
else {
    await navTo();
}

/**
* 
* @param {string} [pageName] 
*/
function resolveRoute(pageName) {
    switch (pageName) {
        case "landing":
        switch (window.Birdhouse.role) {
            case "none":
            return "./html/about.html";
            
            case "player":
            case "staff":
            return "./html/dates.html";
        }
        
        default:
        return `./html/${pageName}.html`;
    }
}

console.log(navTo);

/**
* @param {string} [pageName]
* @param {Router.NavInit} [init]
* @returns {Promise<Router.NavigationResult>} 0 when navigation was cancelled; HTTP status code otherwise
*/
export async function navTo(pageName, init) {
    const controller = debounce.next();
    
    try {
        await navMutex.acquire(controller.signal);
    }
    catch (err) {
        if (!isAbort(err)) throw err;
        return 0;
    }
    
    try {
        document.body.dataset.loading = "";
        
        if (pageName === undefined) {
            pageName = "landing";
        }
        else if (pageName.startsWith("_")) {
            pageName = pageName.slice(1);
        }
        
        const url = new URL(resolveRoute(pageName), location.toString());
        
        if (init?.params) {
            url.search = new URLSearchParams(init.params).toString();
        }
        else {
            url.search = "";
        }
        
        console.log(url, `${url.search}${url.hash}`);
        history.replaceState(url.toString(), "", `./${url.search}#${pageName}`);
        
        const resp = await navToCore(url, pageName, controller);
        
        delete document.body.dataset.loading;
        document.body.dataset.page = location.hash.slice(1);
        return resp.status;
    } catch (err) {
        if (!isAbort(err)) {
            delete document.body.dataset.loading;
            throw err;
        }
        console.log("Loading cancelled");
        return 0;
    }
    finally {
        navMutex.release();
    }
}

/**
* 
* @param {URL} url 
* @param {string} originFragment 
* @param {AbortControllerEx} controller
* @param {URL} [prevRecurseUrl]
* @returns {Promise<Response>}
* @throws An {@link AbortError} when a navigation call has been issued and this operation has been aborted
*/
async function navToCore(url, originFragment, controller, prevRecurseUrl) {
    // === Fetch data ===
    console.log("Navigating to", url.toString());
    if (url === prevRecurseUrl) {
        throw new RangeError("Tried to recursively navigate to the same page");
    }
    if (url.origin !== location.origin) {
        throw new DOMException("Cross-origin request blocked", "SecurityError");
    }
    const resp = await fetch(url, { signal: controller.signal, mode: "same-origin", credentials: "omit", priority: "high"});
    
    controller.throwIfAborted();
    
    // === Check response and parse data ===
    switch (resp.status) {
        case 200:
        break;
        
        case 404:
        await navToCore(new URL(resolveRoute("notfound"), location.toString()), originFragment, controller);
        return resp;
        
        default:
        throw new ResponseError("Unexpected statusCode", resp);
    }
    
    const text = await resp.text();
    
    controller.throwIfAborted();
    
    // === Parse DOM ===
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, "text/html");
    
    controller.throwIfAborted();
    
    // === Delete non-visible elements ===
    const roleElements = doc.querySelectorAll(`[data-role]:not([data-role="${window.Birdhouse.role}"])`);
    for (let i = 0; i < roleElements.length; i++) {
        roleElements[i].remove();
    }
    
    controller.throwIfAborted();

    // === Collect modules ===
    /**@type {Promise<Router.PageModule>[]}*/
    const modulePromises = [];
    const scripts = doc.head.getElementsByTagName("script");
    for (let i = 0; i < scripts.length; i++) {
        const script = scripts[i];
        if (script.type === "module") {
            modulePromises.push(import(script.src));
        }
    }
    
    controller.throwIfAborted();
    
    // === Add elements to fragment ===
    const frag = document.createDocumentFragment();
    while (doc.body.firstChild) {
        frag.append(doc.body.firstChild);
    }
    
    controller.throwIfAborted();
    
    // === Modify user visible dom, no stopping now ===
    // Apply styles
    while (appliedStyles.length) {
        appliedStyles.pop()?.remove();
    }
    
    /**@type {NodeListOf<HTMLLinkElement>}*/
    const styles = doc.querySelectorAll(`head > link[rel='stylesheet']`);
    for (let i = 0; i < styles.length; i++) {
        const style = styles[i];
        document.head.append(style);
        appliedStyles.push(style);
    }
    
    // Replace #main-content attributes
    while (main.attributes.length) {
        main.removeAttributeNode(main.attributes[0]);
    }
    for (let i = 0; i < doc.body.attributes.length; i++) {
        const attr = doc.body.attributes[i];
        main.setAttribute(attr.name, attr.value);
    }
    main.id = "main-content";
    
    main.replaceChildren(frag);

    // Free previous scripts
    const freePromises = [];
    while (appliedModules.length) {
        freePromises.push(appliedModules.pop()?.free());
    }
    for (const result of await Promise.allSettled(freePromises)) {
        if (result.status === "rejected") {
            console.error("Failed to run a loaded module", result.reason);
        }
    }
    
    // Run scripts
    /**@type {(void | Promise<void>)[]}*/
    const runs = [];
    for (const module of await Promise.allSettled(modulePromises)) {
        if (module.status === "fulfilled") {
            const val = module.value;
            if (typeof val.run === "function") {
                appliedModules.push({ run: val.run, free: typeof val.free === "function" ? val.free : noop });
                runs.push(val.run());
            }
        }
        else {
            console.error("Failed to load module", module.reason);
        }
    }

    for (const result of await Promise.allSettled(runs)) {
        if (result.status === "rejected") {
            console.error("Failed to run a loaded module", result.reason);
        }
    }
    
    return resp;
}