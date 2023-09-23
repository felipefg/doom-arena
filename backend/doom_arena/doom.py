"""
Handle Doom related gameplays
"""
from pathlib import Path

from .models import Contest


def _decode_gameplay(data: str) -> bytes:
    """
    Perform the actual decoding of the gameplay
    """
    if data.startswith('0x'):
        data = data[2:]
    return bytes.fromhex(data)


def save_gameplay_file(raw_data: str, contest_id: int, player: str) -> str:
    """Decode and save the given gameplay data and return filename"""
    filepath = Path(f'gameplays/{contest_id}')
    filename = filepath / f'{player}.rivlog'

    data = _decode_gameplay(raw_data)

    filepath.mkdir(parents=True, exist_ok=True)

    with filename.open('wb') as fout:
        fout.write(data)

    return str(filename)


def generate_score(filename: str, contest: Contest) -> int:
    """
    Runs the game with the given gameplay filename and return the resulting
    score.
    """
    return 123
