import { Emitter } from "./emitter.mjs";

export const DEBUG = "http://127.0.0.1:8787";
export const PRODUCTION = "https://birdhouse.why474474.workers.dev";

export class ApiError extends Error {}

export class BirdhouseAPI {
    constructor() {
        this.urlBase = PRODUCTION;
        this._apiKey = undefined;
        /**@type {Emitter<ApiError>}*/
        this.onError = new Emitter();
    }

    /**
     * @param {API.YYYYMMDD} start 
     * @param {API.YYYYMMDD} end 
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
     * @param {API.YYYYMMDD} start
     * @param {API.YYYYMMDD} end
     * @returns {Promise<API.Date[]>}
     */
    async getDates(start, end) {
        const resp = await this._fetch(`dates?start=${start}&end=${end}`);
        return await resp.json();
    }
    
    /**
     * @param {string} [apiKey] 
     * @returns {Promise<boolean>}
     */
    async tryAuth(apiKey) {
        this._apiKey = apiKey ?? this._apiKey;
        return !!this._apiKey && (await this._fetch("auth", true)).ok;
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
        
        if (!ignoreNotOk && !resp.ok)
            throw new ApiError(`Request failed: ${await resp.text()}`);
        return resp;
    }

    /**
     * @param {API.YYYYMMDD} ymd 
     * @returns {API.NewGame}
     */
    static createDefaultGame(ymd) {
        return {
            id: null,
            date: ymd,
            time: 1200,
            tz: 0,
            storyteller: "No storyteller",
            script_name: "Trouble Brewing",
            script_link: "https://botc-scripts.azurewebsites.net/script/133/1.0.0",
            hidden: true
        }
    }
}