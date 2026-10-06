import math
from collections.abc import Sequence
from dataclasses import dataclass

from .find_faces import Face
from .render_plan import FRAMES_PER_SECOND

MOMENTS_PER_SECOND = 5
FRAMES_PER_MOMENT = FRAMES_PER_SECOND // MOMENTS_PER_SECOND
TAKES_OVER_WHEN_LARGER_BY = 1.25
AVERAGED_EACH_WAY = 2


@dataclass(frozen=True)
class Middle:
    across: float
    down: float

    def towards(self, other: "Middle", share: float) -> "Middle":
        return Middle(
            across=self.across + (other.across - self.across) * share,
            down=self.down + (other.down - self.down) * share,
        )


PICTURE_MIDDLE = Middle(0.5, 0.5)

type Moments = Sequence[Sequence[Face]]
type SeenPath = list[Middle | None]


def follow_largest_face(moments: Moments) -> SeenPath:
    path: SeenPath = []
    followed: Face | None = None
    for faces in moments:
        if not faces:
            path.append(None)
            continue
        followed = choose_face(faces, followed)
        path.append(find_middle(followed))
    return path


def choose_face(faces: Sequence[Face], followed: Face | None) -> Face:
    largest = max(faces, key=lambda face: face.area)
    if followed is None:
        return largest
    nearest = min(faces, key=lambda face: measure_distance(face, followed))
    return largest if largest.area >= TAKES_OVER_WHEN_LARGER_BY * nearest.area else nearest


def measure_distance(face: Face, other: Face) -> float:
    return math.hypot(
        face.middle_across - other.middle_across, face.middle_down - other.middle_down
    )


def follow_two_faces(moments: Moments) -> tuple[SeenPath, SeenPath]:
    left_path: SeenPath = []
    right_path: SeenPath = []
    for faces in moments:
        two_largest = sorted(faces, key=lambda face: face.area, reverse=True)[:2]
        pair = sorted(two_largest, key=lambda face: face.middle_across)
        left_path.append(find_middle(pair[0]) if len(pair) == 2 else None)
        right_path.append(find_middle(pair[1]) if len(pair) == 2 else None)
    return left_path, right_path


def find_middle(face: Face) -> Middle:
    return Middle(face.middle_across, face.middle_down)


def glide(seen: Sequence[Middle | None]) -> list[Middle]:
    if not seen:
        return [PICTURE_MIDDLE]
    return spread_over_frames(average_around(fill_gaps(seen)))


def fill_gaps(seen: Sequence[Middle | None]) -> list[Middle]:
    known = {moment: middle for moment, middle in enumerate(seen) if middle is not None}
    if not known:
        return [PICTURE_MIDDLE] * len(seen)
    return [known[min(known, key=lambda other: abs(other - moment))] for moment in range(len(seen))]


def average_around(path: Sequence[Middle]) -> list[Middle]:
    averaged: list[Middle] = []
    for moment in range(len(path)):
        around = path[max(0, moment - AVERAGED_EACH_WAY) : moment + AVERAGED_EACH_WAY + 1]
        across = sum(middle.across for middle in around) / len(around)
        averaged.append(Middle(across, sum(middle.down for middle in around) / len(around)))
    return averaged


def spread_over_frames(path: Sequence[Middle]) -> list[Middle]:
    spread: list[Middle] = []
    for frame in range(len(path) * FRAMES_PER_MOMENT):
        moment, step = divmod(frame, FRAMES_PER_MOMENT)
        ahead = path[min(moment + 1, len(path) - 1)]
        spread.append(path[moment].towards(ahead, step / FRAMES_PER_MOMENT))
    return spread
