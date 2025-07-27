import { BirdhouseAPI } from "./api.mjs";
import { getById } from "./utils.mjs";

if (window.Birdhouse) {
    throw new Error("Tried to set global state twice. Something is wrong");
}

window.Birdhouse = {
    api: new BirdhouseAPI(),
    role: "none",
    content: getById("main-content")
};

// Setup SPA routing
await import("./router.mjs");