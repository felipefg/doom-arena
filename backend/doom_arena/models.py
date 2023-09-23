from pydantic import BaseModel


class Player(BaseModel):
    wallet: str
    gameplay_hash: str
    score: int | None = None
    gameplay_filename: str | None = None
    reward: int | None = None


class Contest(BaseModel):
    contest_id: int
    host_wallet: str
    name: str
    ticket_price: int
    level: int
    difficulty: int
    play_time: int = 3600
    submission_time: int = 3600
    creation_timestamp: int
    prize_pool: int = 0
    host_reward: int = 0
    state: str = 'ready_to_play'

    players: list[Player] = []


class CreateContestInput(BaseModel):
    action: str = "create_contest"
    name: str
    ticket_price: str
    level: int
    difficulty: int
    play_time: int
    submission_time: int


class JoinContestInput(BaseModel):
    action: str = "join_contest"
    contest_id: int
    gameplay_hash: str


class EndContestInput(BaseModel):
    action: str = 'end_contest'
    contest_id: int


class SubmitGameplayInput(BaseModel):
    action: str = 'submit_contest'
    contest_id: int
    gameplay: str


class FinalizeContestInput(BaseModel):
    action: str = 'finalize_contest'
    contest_id: int
