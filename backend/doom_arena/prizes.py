from math import floor

from .models import Contest

PRECISION = 1e17


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
