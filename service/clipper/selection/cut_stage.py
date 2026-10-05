from collections.abc import Callable, Sequence

from ..pipeline import StageFailedError, StageRun
from ..projects import ProjectStatus, StepKind
from .choose_candidates import PlacedClip, choose_candidates
from .clip_limits import count_clips
from .clip_proposal import ProposedClip
from .cut_clips import cut_clips
from .place_quote import place_quote
from .prepare_pass import PreparedPass, StageDependencies, prepare_pass
from .replay_peaks import read_replay_peaks
from .selection_reasons import NO_CANDIDATE, stating_claude_failures
from .split_windows import Window

ALL_CUT_PERCENT = 100.0


class CutStage:
    step = StepKind.CUT
    resting_status = ProjectStatus.READY

    def __init__(self, dependencies: StageDependencies) -> None:
        self._dependencies = dependencies

    def run(self, stage_run: StageRun) -> None:
        dependencies = self._dependencies
        project_id = stage_run.project.id
        preferences = dependencies.preferences.read()
        prepared = prepare_pass(stage_run, preferences.cutting_model, dependencies)
        counts = count_clips(preferences.clips_per_video, prepared.duration_seconds)
        stored = dependencies.store.list_windows(project_id)
        shortlisted = [record.window for record in stored if record.is_shortlisted]
        with stating_claude_failures():
            placed = cut_each_window(
                shortlisted, counts.asked_for, prepared, stage_run.report_percent
            )
        peaks = read_replay_peaks(dependencies.data_folder.replay_graph_file(project_id))
        candidates = choose_candidates(placed, prepared.context.clip_seconds, counts.kept, peaks)
        if not candidates:
            raise StageFailedError(NO_CANDIDATE)
        dependencies.store.replace_candidates(project_id, candidates, peaks)


def cut_each_window(
    windows: Sequence[Window],
    clip_count: int,
    prepared: PreparedPass,
    report_percent: Callable[[float], None],
) -> list[PlacedClip]:
    placed: list[PlacedClip] = []
    for cut_count, window in enumerate(windows, start=1):
        proposals = cut_clips(window, clip_count, prepared.context)
        placed += place_clips(proposals, window, prepared)
        report_percent(ALL_CUT_PERCENT * cut_count / len(windows))
    return placed


def place_clips(
    proposals: Sequence[ProposedClip], window: Window, prepared: PreparedPass
) -> list[PlacedClip]:
    placed: list[PlacedClip] = []
    for clip in proposals:
        placement = place_quote(clip.opening_words, clip.closing_words, window, prepared.sentences)
        if placement is not None:
            placed.append(PlacedClip(clip, placement))
    return placed
