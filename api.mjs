/// <reference path="./api.d.ts" />
//@ts-check

import { Emitter } from "./emitter.mjs";
import { isLocalhost } from "./utils.mjs";

export const DEBUG = "http://127.0.0.1:8787";
export const PRODUCTION = "https://birdhouse.why474474.workers.dev";

const FORCE_PROD = false;

export class ApiError extends Error {}

export class BirdhouseAPI {
    constructor() {
        this.urlBase = isLocalhost(location.hostname) && !FORCE_PROD ? DEBUG : PRODUCTION;
        this._apiKey = undefined;
        /**@type {Emitter<ApiError>}*/
        this.onError = new Emitter();
    }

    /**
     * @param {API.UnixTime} start 
     * @param {API.UnixTime} end 
     * @returns {Promise<API.Game[]>}
     */
    async getGames(start, end) {
        const resp = await this._fetch(`games?start=${start}&end=${end}`);
        return await resp.json();
    }

    /**
     * @param {number} id 
     * @returns {Promise<API.Game>}
     */
    async getGame(id) {
        const resp = await this._fetch(`game?gameid=${id}`);
        return await resp.json();
    }

    /**
     * @param {API.Game} game 
     * @returns {Promise<number>}
     */
    async editGame(game) {
        this._assertAuth();
        const result = await this._fetch(`game`, false, {
            body: JSON.stringify(game),
            method: "PUT"
        });
        return Number(await result.json());
    }

    /**
     * @param {API.NewGame} game 
     * @returns {Promise<number>}
     */
    async newGame(game) {
        // This feels dirty, but is valid
        //@ts-expect-error
        return await this.editGame(game);
    }

    /**
     * @param {number} signupId 
     * @param {boolean} state 
     */
    async setSignupMainState(signupId, state) {
        this._assertAuth();
        await this._fetch(`signupmain`, false, {
            body: JSON.stringify({ id: signupId, state: state }),
            method: "PUT"
        });
    }

    /**
     * @param {number} signupId 
     * @param {boolean} state 
     */
    async setSignupSubState(signupId, state) {
        this._assertAuth();
        await this._fetch(`signupsub`, false, {
            body: JSON.stringify({ id: signupId, state: state }),
            method: "PUT"
        });
    }

    /**
     * @param {number} id 
     * @returns {Promise<void>}
     */
    async deleteGame(id) {
        this._assertAuth();
        await this._fetch(`game?gameid=${id}`, false, {
            method: "DELETE"
        });
    }

    /**
     * @param {number} id 
     * @returns {Promise<void>}
     */
    async deleteSignup(id) {
        this._assertAuth();
        await this._fetch(`signup?signupid=${id}`, false, {
            method: "DELETE"
        });
    }

    /**
     * @param {number} gameId 
     * @param {string} name 
     * @param {string} notes 
     */
    async signup(gameId, name, notes) {
        await this._fetch(`signup`, false, {
            method: "POST",
            body: JSON.stringify({
                game_id: gameId,
                name: name,
                notes: notes,
            })
        });
    }

    /**
     * 
     * @param {number} gameId
     * @returns {Promise<API.Signup[]>} 
     */
    async getSignups(gameId) {
        this._assertAuth();
        const result = await this._fetch(`signups?gameid=${gameId}`);
        return await result.json();
    }
    
    /**
     * @param {string} [apiKey] 
     * @returns {Promise<boolean>}
     */
    async tryAuth(apiKey) {
        this._apiKey = apiKey ?? this._apiKey;
        return !!this._apiKey && (await this._fetch("auth", true)).ok;
    }

    
    /**
     * @returns {Promise<boolean>}
     */
    async ping() {
        return (await fetch(this.urlBase, { method: "GET" })).status !== 503
    }

    _assertAuth() {
        if (!this._apiKey)
            throw new ApiError("This method requires an apiKey");
    }

    /**
     * @param {string} input 
     * @param {RequestInit} [init] 
     * @param {boolean} [ignoreNotOk] 
     * @returns {Promise<Response>}
     * @throws an {@link ApiError}
     * @private
     */
    async _fetch(input, ignoreNotOk, init) {
        if (this._apiKey) {
            init = init || {};
            init.headers = new Headers(init.headers);
            init.headers.append("X-API-Token", this._apiKey);
        }
        
        const url = `${this.urlBase}/v1/${input}`;
        console.debug("Fetching specified url", url, init);
        
        let resp;
        try {
            resp = await fetch(url, init);
        }
        catch (e) {
            throw new ApiError(`Fetch failed: ${(await resp?.text()) ?? "<no message>"}`);
        }

        if (resp.status === 503) {
            alert("The site is down for maintenence");
            throw new ApiError("503 - Service unavailable");
        }
        
        if (!ignoreNotOk && !resp.ok)
            throw new ApiError(`Request failed with ${resp.status}: ${await resp.text()}`);
        return resp;
    }

    /**
     * @returns {API.NewGame}
     */
    static createDefaultGame() {
        return {
            id: null,
            time: Math.trunc(Date.now() / 1000) + 31536000,
            storyteller: "No storyteller",
            script_name: "No script",
            script_link: "https://example.org",
            category: 3,
            hidden: true
        }
    }
}