import logging

from cartesi import DApp, Rollup, RollupData, JSONRouter
from doom_arena.models import CreateContestInput
from doom_arena.contest_db import contests

LOGGER = logging.getLogger(__name__)
logging.basicConfig(level=logging.DEBUG)
dapp = DApp()
json_router = JSONRouter()
dapp.add_router(json_router)


def str2hex(str):
    """Encodes a string as a hex string"""
    return "0x" + str.encode("utf-8").hex()


@json_router.advance({"action": "create_contest"})
def handle_advance(rollup: Rollup, data: RollupData) -> bool:
    payload = CreateContestInput.parse_obj(data.json_payload())
    contest = contests.create_contest(
        input=payload,
        timestamp=data.metadata.timestamp,
        host_wallet=data.metadata.msg_sender
    )

    LOGGER.debug("Created contest '%s'", repr(contest))
    return True


@dapp.inspect()
def handle_inspect(rollup: Rollup, data: RollupData) -> bool:
    payload = data.str_payload()
    LOGGER.debug("Echoing '%s'", payload)
    rollup.report(str2hex(payload))
    return True


if __name__ == '__main__':
    dapp.run()
