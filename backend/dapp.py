import logging
import json

from pydantic import BaseSettings

from cartesi import DApp, Rollup, RollupData, JSONRouter, URLRouter
from cartesi.models import _hex2str
from doom_arena.models import (
    Contest,
    Player,
    CreateContestInput,
    JoinContestInput,
    EndContestInput,
    SubmitGameplayInput,
)

from doom_arena.contest_db import contests
from doom_arena import doom

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

    success = int('0x' + payload[0:2], 0)
    erc20_contract = '0x' + payload[2:42]
    depositor = '0x' + payload[42:82]
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
    existing_player = contests.get_player(payload.contest_id, depositor)
    if existing_player is not None:
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


@json_router.advance({'action': 'end_contest'})
def end_contest(rollup: Rollup, data: RollupData) -> bool:
    """
    Move contest from "ready_to_play" to "gameplay_submission" state.
    """
    payload = EndContestInput.parse_obj(data.json_payload())
    contest = contests.contests.get(payload.contest_id)

    if contest is None:
        return False

    if contest.state != "ready_to_play":
        return False

    contest.state = 'gameplay_submission'
    return True


@json_router.advance({'action': 'submit_contest'})
def submit_gameplay(rollup: Rollup, data: RollupData) -> bool:
    payload = SubmitGameplayInput.parse_obj(data.json_payload())
    print(f'{payload=}')
    player = contests.get_player(payload.contest_id, data.metadata.msg_sender)
    print(f'{player=}')
    if player is None:
        print(f'{contests.contests=}')
        return False

    gameplay_filename = doom.save_gameplay_file(
        raw_data=payload.gameplay,
        contest_id=payload.contest_id,
        player=player.wallet,
    )

    player.gameplay_filename = gameplay_filename

    score = doom.generate_score(gameplay_filename)

    player.score = score

    return True


@url_router.inspect("/active_contest")
def get_active_contest(rollup: Rollup, data: RollupData) -> bool:

    print(contests.contests)
    contest = contests.get_latest_contest()
    output = _format_contest_output(contest)
    print(f"{output=}")
    rollup.report(_json_dump_hex(output))
    return True


@json_router.advance({'action': 'finalize_contest'})
def finalize_contest(rollup: Rollup, data: RollupData) -> bool:

    payload = EndContestInput.parse_obj(data.json_payload())
    contest = contests.contests.get(payload.contest_id)

    if contest is None:
        return False

    if contest.state != "gameplay_submission":
        return False

    contest.state = 'finalized'
    return True


if __name__ == '__main__':
    dapp.run()
