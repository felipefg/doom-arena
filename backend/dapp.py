import logging
import json

from cartesi import DApp, Rollup, RollupData, JSONRouter, URLRouter
from doom_arena.models import Contest, CreateContestInput
from doom_arena.contest_db import contests

LOGGER = logging.getLogger(__name__)
logging.basicConfig(level=logging.DEBUG)
dapp = DApp()
json_router = JSONRouter()
url_router = URLRouter()
dapp.add_router(json_router)
dapp.add_router(url_router)


def str2hex(str):
    """Encodes a string as a hex string"""
    return "0x" + str.encode("utf-8").hex()


@json_router.advance({"action": "create_contest"})
def create_contest(rollup: Rollup, data: RollupData) -> bool:
    payload = CreateContestInput.parse_obj(data.json_payload())
    contest = contests.create_contest(
        input=payload,
        timestamp=data.metadata.timestamp,
        host_wallet=data.metadata.msg_sender
    )

    LOGGER.debug("Created contest '%s'", repr(contest))
    return True


def _format_contest_output(contest: Contest) -> dict:
    return {
        "contest_id": 1,
        "players": [],
        "prize_pool": 100,
    }


@url_router.inspect("/active_contest")
def get_active_contest(rollup: Rollup, data: RollupData) -> bool:
    contest = contests.get_latest_contest()
    output = _format_contest_output(contest)
    rollup.report(str2hex(json.dumps(output)))
    return True


if __name__ == '__main__':
    dapp.run()
