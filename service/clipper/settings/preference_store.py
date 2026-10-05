from ..storage import Database
from .preferences import PreferenceChanges, Preferences

READ_CHOICES = "SELECT name, choice FROM preferences"
STORE_CHOICE = """
INSERT INTO preferences (name, choice) VALUES (?, ?)
ON CONFLICT (name) DO UPDATE SET choice = excluded.choice
"""


class PreferenceStore:
    def __init__(self, database: Database) -> None:
        self._database = database

    def read(self) -> Preferences:
        with self._database.transaction() as connection:
            stored = {row["name"]: row["choice"] for row in connection.execute(READ_CHOICES)}
        known = {
            name: choice for name, choice in stored.items() if name in Preferences.model_fields
        }
        return Preferences.model_validate(known)

    def save(self, changes: PreferenceChanges) -> Preferences:
        chosen = changes.model_dump(exclude_none=True, mode="json")
        with self._database.transaction() as connection:
            connection.executemany(STORE_CHOICE, list(chosen.items()))
        return self.read()
