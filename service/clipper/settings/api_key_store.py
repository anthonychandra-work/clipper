import os
from pathlib import Path

from ..problems import RefusedError

NO_KEY_SENT = "Paste the key first."
KEY_WITH_BLANKS = "An API key has no spaces or line breaks. Paste it again."
ENCODING = "utf-8"
OWNER_ONLY_FOLDER = 0o700
OWNER_ONLY_FILE = 0o600
PARTIAL_SUFFIX = ".partial"
ENDING_LENGTH = 4


class ApiKeyStore:
    def __init__(self, key_file: Path) -> None:
        self._key_file = key_file

    def read(self) -> str | None:
        try:
            stored = self._key_file.read_text(encoding=ENCODING).strip()
        except (OSError, UnicodeError):
            return None
        return stored or None

    def save(self, sent_key: str) -> None:
        key = sent_key.strip()
        refuse_unusable_key(key)
        self._key_file.parent.mkdir(mode=OWNER_ONLY_FOLDER, parents=True, exist_ok=True)
        partial = self._key_file.with_name(self._key_file.name + PARTIAL_SUFFIX)
        try:
            write_for_owner_only(partial, key)
            partial.replace(self._key_file)
        finally:
            partial.unlink(missing_ok=True)

    def remove(self) -> None:
        self._key_file.unlink(missing_ok=True)


def show_ending(key: str | None) -> str | None:
    if key is None or len(key) <= ENDING_LENGTH:
        return None
    return key[-ENDING_LENGTH:]


def refuse_unusable_key(key: str) -> None:
    if not key:
        raise RefusedError(NO_KEY_SENT)
    if len(key.split()) > 1:
        raise RefusedError(KEY_WITH_BLANKS)


def write_for_owner_only(file: Path, content: str) -> None:
    descriptor = os.open(file, os.O_WRONLY | os.O_CREAT | os.O_TRUNC, OWNER_ONLY_FILE)
    with os.fdopen(descriptor, "w", encoding=ENCODING) as opened:
        opened.write(content)
    file.chmod(OWNER_ONLY_FILE)
