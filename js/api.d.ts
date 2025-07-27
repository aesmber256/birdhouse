declare namespace API {
    type GameType = "botc";

    namespace Tables {
        type Signup = {
            id: number;
            game_id: number;
            added_timestamp: number;
            cancelled_timestamp: number;
            name: string;
            notes: string;
            cancel_notes: string;
        };
        
        type SignupInsert = {
            id?: number;
            game_id: number;
            name: string;
            added_timestamp?: number;
            cancelled_timestamp?: number;
            notes?: string;
            cancel_notes?: string;
        };
        
        type Game = {
            id: number;
            game_type: number;
            game_data: number;
            timestamp: number;
            hidden: boolean;
        };
        
        type GameInsert = {
            id?: number;
            game_type: number;
            game_data: number;
            timestamp: number;
            hidden?: boolean;
        };
        
        type GameType = {
            id: number;
            name: string;
        };
        
        type GameTypeInsert = {
            id: number;
            name?: string;
        };
        
        type BotcGameData = {
            id: number;
            script_name: string;
            script_link: string;
            storyteller: string;
        };
        
        type BotcGameDataInsert = {
            id?: number;
            script_name: string;
            script_link: string;
            storyteller: string;
        };
    }
}