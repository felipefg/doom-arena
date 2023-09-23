"""
Handle Doom related gameplays
"""
from pathlib import Path
from hashlib import sha256

from .models import Contest
import json
import os
from pathlib import Path

def decode_gameplay(data: str) -> bytes:
    """
    Perform the actual decoding of the gameplay
    """
    if data.startswith('0x'):
        data = data[2:]
    return bytes.fromhex(data)


def hash_gameplay(data: bytes) -> str:
    """
    Calculates the hash for the gameplay and return it as a string
    """
    hasher = sha256(data)
    return hasher.hexdigest()


def save_gameplay_file(raw_data: bytes, contest_id: int, player: str) -> str:
    """Decode and save the given gameplay data and return filename"""
    filepath = Path(f'gameplays/{contest_id}')
    filename = filepath / f'{player}.rivlog'

    filepath.mkdir(parents=True, exist_ok=True)

    with filename.open('wb') as fout:
        fout.write(raw_data)

    return str(filename)


def generate_score(filename: str, contest: Contest) -> int:
    """
    Runs the game with the given gameplay filename and return the resulting
    score.
    """
    params = "-iwad doom1.wad" + " -skill " + str(contest.difficulty) + " -warp 1 " + str(contest.level) + " -levelquit " + str(contest.level) + " -deathquit" + " -nowipe " + " -nomenu"

    os.system("rm -f /run/outcard")
    os.system("rm -f /run/rivlog")
    os.system("cp "+ filename + " /run/rivlog")
    os.system(
        "riv-chroot /rivos " +
        "--setenv RIV_CARTRIDGE /cartridges/doom.sqfs " +
        "--setenv RIV_OUTCARD /run/outcard " +
        "--setenv RIV_REPLAYLOG /run/rivlog " +
        "--setenv RIV_NO_YIELD y " +
        "riv-run " + params)
    data = Path("/run/outcard").read_text()
    scores = json.loads(data[4:])

    os.system("rm -f /run/outcard")
    os.system("rm -f /run/rivlog")
    print(scores)
    return scores["score"]
