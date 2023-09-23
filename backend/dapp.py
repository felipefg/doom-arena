import logging
import json

from pydantic import BaseSettings

from cartesi import DApp, Rollup, RollupData, JSONRouter, URLRouter
from cartesi.models import _hex2str
from doom_arena.models import Contest, Player, CreateContestInput, JoinContestInput
from doom_arena.contest_db import contests

LOGGER = logging.getLogger(__name__)
logging.basicConfig(level=logging.DEBUG)
dapp = DApp()
json_router = JSONRouter()
url_router = URLRouter()
dapp.add_router(json_router)
dapp.add_router(url_router)


class Settings(BaseSettings):
    PORTAL_ERC20_ADDRESS: str = '0x9C21AEb2093C32DDbC53eEF24B873BDCd1aDa1DB'
    TOKEN_ERC20_ADDRESS: str = '0xc6e7DF5E7b4f2A278906862b61205850344D4e7d'


settings = Settings()


def str2hex(str):
    """Encodes a string as a hex string"""
    return "0x" + str.encode("utf-8").hex()


def _json_dump_hex(input):
    out_str = json.dumps(input)
    return str2hex(out_str)


@dapp.advance()
def default_handler(rollup: Rollup, data: RollupData) -> bool:
    print("Default Handler")
    print(f"{data.metadata.msg_sender=}")
    print(f"{settings.PORTAL_ERC20_ADDRESS=}")
    if data.metadata.msg_sender.lower() == settings.PORTAL_ERC20_ADDRESS.lower():
        return handle_erc20_deposit(rollup, data)


def _decode_erc20_payload(payload):
    if payload.startswith('0x'):
        payload = payload[2:]

    success = int(payload[0:2])
    erc20_contract = payload[2:42]
    depositor = payload[42:82]
    value = payload[82:146]
    value_int = int("0x" + value, 0)
    other = payload[146:]

    return success, erc20_contract, depositor, value_int, "0x" + other


def handle_erc20_deposit(rollup: Rollup, data: RollupData) -> bool:
    success, erc20_contract, depositor, value_int, payload_hex = _decode_erc20_payload(data.payload)

    payload = json.loads(_hex2str(payload_hex))

    if payload.get('action') == 'create_contest':
        return handle_create_contest(rollup, data, payload, erc20_contract, depositor, value_int)
    if payload.get('action') == 'join_contest':
        return handle_join_contest(rollup, data, payload, erc20_contract, depositor, value_int)


def handle_create_contest(rollup, data, payload, erc20_contract, depositor, value):
    payload = CreateContestInput.parse_obj(payload)
    contest = contests.create_contest(
        input=payload,
        timestamp=data.metadata.timestamp,
        host_wallet=depositor,
        initial_prize_pool=value,
    )
    print(contests.contests)
    LOGGER.debug("Created contest '%s'", repr(contest))
    return True


def handle_join_contest(rollup, data, payload, erc20_contract, depositor, value):
    payload = JoinContestInput.parse_obj(payload)
    contest = contests.contests.get(payload.contest_id)

    # Contest must exist
    if contest is None:
        return False

    # Contest must be in the right state
    if contest.state != 'ready_to_play':
        return False

    # Value must be enough to join
    if value < contest.ticket_price:
        return False

    # Player must be unique
    for player in contest.players:
        if player.wallet.lower() == depositor.lower():
            return False

    new_player = Player(
        wallet=depositor,
        gameplay_hash=payload.gameplay_hash
    )

    contest.players.append(new_player)
    return True


def _format_contest_output(contest: Contest) -> dict:
    # TODO: sort by score, if available
    players = [
        {
            "wallet": player.wallet,
        }
        for player in contest.players
    ]
    return {
        "contest_id": contest.contest_id,
        "players": players,
        "prize_pool": contest.prize_pool,
    }


@url_router.inspect("/active_contest")
def get_active_contest(rollup: Rollup, data: RollupData) -> bool:

    print(contests.contests)
    contest = contests.get_latest_contest()
    output = _format_contest_output(contest)
    print(f"{output=}")
    rollup.report(_json_dump_hex(output))
    return True


if __name__ == '__main__':
    dapp.run()
