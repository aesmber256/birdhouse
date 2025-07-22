declare namespace API {
    /** Represents a calendar date in YYYYMMDD format (e.g., 20250713). */
    type YYYYMMDD = number;

    /** Represents an absolute time in 24-hour HHMM format (e.g., 1345 for 1:45 PM). */
    type HHMM = number;

    /** Represents a signed time offset in HHMM format (e.g., -0300 for UTC-3). */
    type SHHMM = number;

    /** Represents a game session. */
    interface Game {
        /** Unique identifier for the game. */
        id: number;
        /** The date the game takes place (formatted as YYYYMMDD). */
        date: YYYYMMDD;
        /** The time the game starts (in HHMM format). */
        time: HHMM;
        /** Time zone offset from UTC (signed HHMM). */
        tz: SHHMM;
        /** Name of the game script used. */
        script_name: string;
        /** Link to the game script. */
        script_link: string;
        /** Name of the storyteller running the game. */
        storyteller: string;
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

    interface Date {
        date: YYYYMMDD,
        hidden: boolean
    }
}