import { getById } from "../utils.mjs";

export function run() {
    getById("not-found-url").textContent = history.state;
}