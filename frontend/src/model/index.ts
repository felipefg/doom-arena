export interface Player {
    wallet: string;
    score: number;
    reward: string;
}

export interface Contest {
    contest_id: number;
    name: string;
    host: string;
    ticket_price: string;
    prize_pool: string;
    level: number;
    difficulty: number;
    creation_timestamp: number;
    play_time: number;
    submission_time: number;
    state: "ready_to_play" | "gameplay_submission" | "finalized";
    players: Player[];
}
