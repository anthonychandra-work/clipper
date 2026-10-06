from collections.abc import Sequence
from dataclasses import dataclass
from pathlib import Path

import cv2
from cv2.typing import MatLike

MODEL_FILE = Path(__file__).parent / "yunet" / "face_detection_yunet_2026may.onnx"
SEARCHED_LONGER_SIDE = 640
LOWEST_SCORE = 0.6
SAME_FACE_OVERLAP = 0.3
BOXES_COMPARED = 5000


@dataclass(frozen=True)
class Face:
    left: float
    top: float
    width: float
    height: float
    score: float

    @property
    def area(self) -> float:
        return self.width * self.height

    @property
    def middle_across(self) -> float:
        return self.left + self.width / 2

    @property
    def middle_down(self) -> float:
        return self.top + self.height / 2


class UnreadablePictureError(Exception):
    def __init__(self, picture: Path) -> None:
        super().__init__(f"{picture.name} could not be read as a picture.")
        self.picture = picture


class FaceFinder:
    def __init__(self) -> None:
        # OpenCV warns about every detector it makes, so it logs errors only from here on.
        cv2.utils.logging.setLogLevel(cv2.utils.logging.LOG_LEVEL_ERROR)
        starting_size = (SEARCHED_LONGER_SIDE, SEARCHED_LONGER_SIDE)
        self._detector = cv2.FaceDetectorYN.create(
            str(MODEL_FILE), "", starting_size, LOWEST_SCORE, SAME_FACE_OVERLAP, BOXES_COMPARED
        )

    def find_faces(self, picture: Path) -> list[Face]:
        searched = reduce_picture(read_picture(picture))
        height, width = searched.shape[:2]
        self._detector.setInputSize((width, height))
        found = self._detector.detect(searched)[1]
        boxes: list[list[float]] = [] if found is None else found.tolist()
        faces = [describe_face(box, width, height) for box in boxes]
        return sorted(faces, key=lambda face: face.area, reverse=True)


def read_picture(picture: Path) -> MatLike:
    pixels = cv2.imread(str(picture))
    if pixels is None:
        raise UnreadablePictureError(picture)
    return pixels


def reduce_picture(pixels: MatLike) -> MatLike:
    height, width = pixels.shape[:2]
    reduction = SEARCHED_LONGER_SIDE / max(width, height)
    if reduction >= 1:
        return pixels
    reduced_size = (round(width * reduction), round(height * reduction))
    return cv2.resize(pixels, reduced_size, interpolation=cv2.INTER_AREA)


def describe_face(box: Sequence[float], picture_width: int, picture_height: int) -> Face:
    left, top, width, height = box[:4]
    return Face(
        left=left / picture_width,
        top=top / picture_height,
        width=width / picture_width,
        height=height / picture_height,
        score=box[-1],
    )
