declare namespace API {
    const enum Category {
        Sceadeau = 0,
        Crow = 1,
        Friendly = 2,
        Guest = 3
    }

    type UnixTime = number;

    /** Represents a game session. */
    interface Game {
        /** Unique identifier for the game. */
        id: number;
        /** The time the game takes place (formatted as a unix timestamp). */
        time: UnixTime;
        /** Name of the game script used. */
        script_name: string;
        /** Link to the game script. */
        script_link: string;
        /** Name of the storyteller running the game. */
        storyteller: string;

        category: Category;
        
        /** Whether the game is hidden. */
        hidden: boolean;
    }

    type NewGame = Omit<Game, "id"> & { id: null };

    /** Represents a signup entry for a game. */
    interface Signup {
        /** Unique identifier for the signup. */
        id: number;
        /** UNIX timestamp of when the signup was created. */
        added_timestamp: number;
        /** UNIX timestamp of when the signup was cancelled. Use 0 if not cancelled. */
        cancelled_timestamp: number;
        /** ID of the game this signup is for. */
        game_id: number;
        /** Name of the person signing up. */
        name: string;
        /** Optional notes provided with the signup. */
        notes: string;
        
        main_state: boolean;
        
        sub_state: boolean;
    }
}