from pydantic import BaseModel


class Player(BaseModel):
    wallet: str
    score: int = None


class Contest(BaseModel):
    contest_id: int
    host_wallet: str
    name: str
    ticket_price: int
    level: int
    difficulty: int
    play_time: int = 3600
    submission_time: int = 3600
    creation_timestamp: int = int
    prize_pool: int = 0

    players: list[Player] = []


class CreateContestInput(BaseModel):
    action: str = "create_contest"
    name: str
    ticket_price: str
    level: int
    difficulty: int
    play_time: int
    submission_time: int
