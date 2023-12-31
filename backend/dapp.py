import logging
import json
from math import floor
import re

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
from doom_arena import doom, prizes

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
    LOGGER.info("Running Default Handler")
    LOGGER.debug(f"{data.metadata.msg_sender=}")
    LOGGER.debug(f"{settings.PORTAL_ERC20_ADDRESS=}")
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
    LOGGER.info("Handlong ERC20 Event")
    success, erc20_contract, depositor, value_int, payload_hex = _decode_erc20_payload(data.payload)

    payload = json.loads(_hex2str(payload_hex))

    if payload.get('action') == 'create_contest':
        return handle_create_contest(rollup, data, payload, erc20_contract, depositor, value_int)
    if payload.get('action') == 'join_contest':
        return handle_join_contest(rollup, data, payload, erc20_contract, depositor, value_int)


def handle_create_contest(rollup, data, payload, erc20_contract, depositor, value):
    LOGGER.debug("Handling Create Contest")
    payload = CreateContestInput.parse_obj(payload)
    contest = contests.create_contest(
        input=payload,
        timestamp=data.metadata.timestamp,
        host_wallet=depositor,
        initial_prize_pool=value,
    )
    LOGGER.debug("Created contest '%s'", repr(contest))
    return True


def handle_join_contest(rollup, data, payload, erc20_contract, depositor, value):
    LOGGER.debug("Handling Join Contest")
    payload = JoinContestInput.parse_obj(payload)
    contest = contests.get_contest(payload.contest_id)

    # Contest must exist
    if contest is None:
        LOGGER.warning("Join Contest Failed. Unable to find contest")
        return False

    # Contest must be in the right state
    if contest.state != 'ready_to_play':
        LOGGER.warning("Join Contest Failed. Contest is not ready_to_play")
        return False

    # Value must be enough to join
    if value < contest.ticket_price:
        LOGGER.warning("Join Contest Failed. Value is not enough")
        return False

    # Player must be unique
    existing_player = contests.get_player(payload.contest_id, depositor)
    if existing_player is not None:
        LOGGER.warning("Join Contest Failed. Player is already enrolled")
        return False

    new_player = Player(
        wallet=depositor,
        gameplay_hash=payload.gameplay_hash
    )

    contest.players.append(new_player)

    prize_amount = int(floor(value * 0.9))
    host_amount = value - prize_amount
    contest.prize_pool += prize_amount
    contest.host_reward += host_amount

    LOGGER.info("Player joined successfully")
    return True


def _int_to_hex(value):
    if value is None:
        return None
    return f'0x{value:064x}'


def _format_contest_output(contest: Contest) -> dict:

    players = []

    for player in contest.players:
        player_descr = {
            "wallet": player.wallet,
            "score": player.score,
            "reward": _int_to_hex(player.reward),
        }
        players.append(player_descr)

    return {
        "contest_id": contest.contest_id,
        "name": contest.name,
        "host": contest.host_wallet,
        "ticket_price": _int_to_hex(contest.ticket_price),
        "level": contest.level,
        "difficulty": contest.difficulty,
        "play_time": contest.play_time,
        "submission_time": contest.submission_time,
        "creation_timestamp": contest.creation_timestamp,
        "state": contest.state,
        "players": players,
        "prize_pool": _int_to_hex(contest.prize_pool),
        "host_reward": _int_to_hex(contest.host_reward),
    }


@json_router.advance({'action': 'end_contest'})
def end_contest(rollup: Rollup, data: RollupData) -> bool:
    """
    Move contest from "ready_to_play" to "gameplay_submission" state.
    """
    LOGGER.debug("Handling end_contest")
    payload = EndContestInput.parse_obj(data.json_payload())
    contest = contests.get_contest(payload.contest_id)

    if contest is None:
        LOGGER.warning("End contest failed. Contest not found")
        return False

    if contest.state != "ready_to_play":
        LOGGER.warning("End contest failed. Contest not ready_to_play")
        return False

    contest.state = 'gameplay_submission'
    LOGGER.info("Contest playing phase ended successfully")
    return True


@json_router.advance({'action': 'submit_contest'})
def submit_gameplay(rollup: Rollup, data: RollupData) -> bool:
    LOGGER.debug("Handling submit gameplay")
    payload = SubmitGameplayInput.parse_obj(data.json_payload())
    contest = contests.get_contest(payload.contest_id)

    if contest.state != "gameplay_submission":
        LOGGER.warning("Submit gameplay failed. Contest not gameplay_submission")
        return False

    player = contests.get_player(payload.contest_id, data.metadata.msg_sender)

    if player is None:
        LOGGER.warning("Submit gameplay failed. Player not enrolled")
        return False

    gameplay_data = doom.decode_gameplay(payload.gameplay)
    gameplay_data_hash = doom.hash_gameplay(gameplay_data)

    if player.gameplay_hash.lower() != gameplay_data_hash.lower():
        LOGGER.warning("Submit gameplay failed. Rejecting gameplay based on hash")
        return False

    gameplay_filename = doom.save_gameplay_file(
        raw_data=gameplay_data,
        contest_id=payload.contest_id,
        player=player.wallet,
    )

    player.gameplay_filename = gameplay_filename

    score = doom.generate_score(gameplay_filename, contest)

    player.score = score
    LOGGER.info("Submit gameplay successful")
    return True


def _get_report_for_contest(contest: Contest, rollup: Rollup) -> bool:
    if contest is None:
        rollup.report(_json_dump_hex({}))
        return True

    output = _format_contest_output(contest)
    print(f"{output=}")
    rollup.report(_json_dump_hex(output))
    return True


@url_router.inspect("active_contest")
def get_active_contest(rollup: Rollup, data: RollupData) -> bool:
    contest = contests.get_active_contest()
    return _get_report_for_contest(contest, rollup)


@url_router.inspect("contest/([0-9]+)")
def get_contest(rollup: Rollup, data: RollupData) -> bool:
    path = data.str_payload()
    _, _, contest_id = path.rpartition('/')
    contest_id = int(contest_id)
    contest = contests.get_contest(contest_id)
    return _get_report_for_contest(contest, rollup)


@json_router.advance({'action': 'finalize_contest'})
def finalize_contest(rollup: Rollup, data: RollupData) -> bool:
    LOGGER.debug("Handling Finalize Contest")
    payload = EndContestInput.parse_obj(data.json_payload())
    contest = contests.get_contest(payload.contest_id)

    if contest is None:
        LOGGER.warning("Finalize Contest failed. Contest not found")
        return False

    if contest.state != "gameplay_submission":
        LOGGER.warning("Finalize Contest failed. Contest not gameplay_submission")
        return False

    prizes.allocate_prizes(contest)
    contests.finalize_contest(payload.contest_id)
    vouchers = prizes.generate_vouchers(contest, settings.TOKEN_ERC20_ADDRESS)
    for voucher in vouchers:
        rollup.voucher(voucher)
    LOGGER.info("Contest successfully finalized")
    return True


GAMEPLAY_RE = r'gameplay/(?P<contest_id>[0-9]+)/(?P<wallet>0x[0-9a-fA-F]+)'


@url_router.inspect(GAMEPLAY_RE)
def get_gameplay(rollup: Rollup, data: RollupData) -> bool:
    path = data.str_payload()
    result = re.match(GAMEPLAY_RE, path)
    if result is None:
        return False
    result = result.groupdict()
    contest_id = int(result['contest_id'])
    wallet = result['wallet']

    player = contests.get_player(contest_id, wallet)
    filename = player.gameplay_filename

    if filename is None:
        return False

    with open(filename, 'rb') as fin:
        data = fin.read()

    rollup.report('0x' + data.hex())
    return True


if __name__ == '__main__':
    dapp.run()
