from math import floor

from .models import Contest

PRECISION = 1e17

# Transfer function selector is the first 4 bytes for the Keccak of the string
# "transfer(address,uint256)"
ERC20_TRANSFER_FUNCTION_SELECTOR = "a9059cbb"


def calculate_rewards(prize_pool: int, n_players: int) -> list[int]:
    proportions = [
        (2**(n_players - 1 - idx)) / ((2**n_players) - 1)
        for idx in range(n_players)
    ]

    rewards = [
        int(PRECISION * floor(prop * prize_pool / PRECISION))
        for prop in proportions
    ]
    remainder = prize_pool - sum(rewards)

    rewards[0] += remainder
    return rewards


def allocate_prizes(contest: Contest):
    elligible_players = [x for x in contest.players if x.score is not None]
    elligible_players.sort(key=lambda x: -1 * x.score)

    rewards = calculate_rewards(
        prize_pool=contest.prize_pool,
        n_players=len(elligible_players)
    )

    for player, reward in zip(elligible_players, rewards):
        player.reward = reward


def generate_vouchers(contest: Contest, token_address: str):
    """Generate vouchers for all rewards"""
    vouchers = []

    for player in contest.players:
        if (player.reward is not None) and (player.reward > 0):
            vouchers.append(
                create_erc20_transfer_voucher(
                    token_address=token_address,
                    receiver=player.wallet,
                    amount=player.reward,
                )
            )

    if contest.host_reward > 0:
        vouchers.append(
            create_erc20_transfer_voucher(
                token_address=token_address,
                receiver=contest.host_wallet,
                amount=contest.host_reward,
            )
        )
    return vouchers


def create_erc20_transfer_voucher(
        token_address: str,
        receiver: str,
        amount: int
) -> str:
    """
    Return the payload for a voucher for ERC20 token transfer.

    The payload of the voucher is comprised by the following bytes:
    - 4 bytes of the function selector
    - 20 bytes for the receiver address
    - 32 bytes for the transfer amount
    """
    if receiver.startswith('0x'):
        receiver = receiver[2:]

    selector = ERC20_TRANSFER_FUNCTION_SELECTOR + "00" * 12
    payload = f'{selector}{receiver}{amount:064x}'

    return {
        "destination": token_address,
        "payload": "0x" + payload
    }
