from dataclasses import replace

import pytest

from ..review import ClipPoint, Decision, RejectReason, StandingClip
from .conftest import ExportedTalk, keep_part
from .list_exported_clips import list_exported_clips


def list_exported(talk: ExportedTalk) -> list[StandingClip]:
    return list_exported_clips(talk.read_project(), talk.sources)


def test_a_talk_with_a_kept_clip_waiting_and_no_finished_file_has_no_exported_clip(
    exported_talk: ExportedTalk,
) -> None:
    exported_talk.store("c01", keep_part("c01"))
    exported_talk.sources.renders.queue_clips(exported_talk.project_id, ["c01"])

    assert list_exported(exported_talk) == []


def test_only_the_clips_with_a_finished_file_are_given_in_the_order_of_their_ranks(
    exported_talk: ExportedTalk,
) -> None:
    exported_talk.export_kept(5, "c05")
    exported_talk.export_kept(2, "c02")
    exported_talk.store("c01", keep_part("c01"))
    exported_talk.store("c03", keep_part("c03"))
    exported_talk.sources.renders.queue_clips(exported_talk.project_id, ["c03"])

    exported = list_exported(exported_talk)

    assert [(clip.candidate.id, clip.candidate.rank) for clip in exported] == [
        ("c02", 2),
        ("c05", 5),
    ]
    assert [clip.decision for clip in exported] == [Decision.KEEP, Decision.KEEP]


def test_a_clip_rejected_or_set_back_to_undecided_after_its_export_is_still_given(
    exported_talk: ExportedTalk,
) -> None:
    for rank, clip_id in ((1, "c01"), (2, "c02"), (3, "c03")):
        exported_talk.export_kept(rank, clip_id)
    rejected = replace(
        keep_part("c03"), decision=Decision.REJECT, reject_reason=RejectReason.REPEAT
    )

    exported_talk.store("c02", replace(keep_part("c02"), decision=Decision.UNDECIDED))
    exported_talk.store("c03", rejected)

    assert [(clip.candidate.id, clip.decision) for clip in list_exported(exported_talk)] == [
        ("c01", Decision.KEEP),
        ("c02", Decision.UNDECIDED),
        ("c03", Decision.REJECT),
    ]


def test_an_exported_clip_is_given_with_the_title_and_the_length_it_stands_with(
    exported_talk: ExportedTalk,
) -> None:
    exported_talk.export_kept(1, "c01")

    exported_talk.store("c01", replace(keep_part("c01"), title="Mine / theirs", end=ClipPoint(8)))

    (clip,) = list_exported(exported_talk)
    assert clip.title == "Mine / theirs"
    assert clip.candidate.title == "The worst day my bakery ever had"
    assert clip.seconds == pytest.approx(30.84 - 11.94)


def test_a_render_marked_done_whose_file_is_missing_is_not_given(
    exported_talk: ExportedTalk,
) -> None:
    exported_talk.export_kept(1, "c01")
    exported_talk.export_kept(2, "c02")
    data_folder = exported_talk.sources.review.data_folder

    data_folder.export_file(exported_talk.project_id, 1, "c01").unlink()

    assert [clip.candidate.id for clip in list_exported(exported_talk)] == ["c02"]


def test_a_file_on_the_mac_without_a_finished_render_is_not_given(
    exported_talk: ExportedTalk,
) -> None:
    exported_talk.store("c01", keep_part("c01"))

    exported_talk.write_export(1, "c01")

    assert list_exported(exported_talk) == []


def test_a_talk_without_its_transcript_and_without_exports_is_given_no_clip(
    exported_talk: ExportedTalk,
) -> None:
    data_folder = exported_talk.sources.review.data_folder
    (data_folder.project_dir(exported_talk.project_id) / "transcript.json").unlink()

    assert list_exported(exported_talk) == []
