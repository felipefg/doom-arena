from .models import Contest, CreateContestInput


# Dictionary mapping contest IDs to its object

class ContestDatabase:

    def __init__(self):
        self.contests: dict[int, Contest] = {}
        self.latest_id: int = 0

    def create_contest(self, input: CreateContestInput, timestamp: int,
                       host_wallet: str) -> Contest:
        new_id = self.latest_id + 1

        contest = Contest(
            contest_id=new_id,
            creation_timestamp=timestamp,
            host_wallet=host_wallet,
            name=input.name,
            ticket_price=_decode_int256(input.ticket_price),
            level=input.level,
            difficulty=input.difficulty,
            play_time=input.play_time,
            submission_time=input.submission_time,
        )

        self.contests[new_id] = contest
        self.latest_id = new_id

        return contest


contests = ContestDatabase() # noqa


def _decode_int256(input: str) -> int:
    return int(input, 0)
