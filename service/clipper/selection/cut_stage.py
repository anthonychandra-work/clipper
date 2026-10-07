from collections.abc import Callable, Sequence

from ..pipeline import StageFailedError, StageRun
from ..projects import ProjectStatus, StepKind
from .choose_candidates import PlacedClip, choose_candidates
from .clip_limits import count_clips
from .clip_proposal import ProposedClip
from .cut_clips import cut_clips
from .place_quote import place_quote
from .prepare_pass import ChosenClips, PreparedPass, StageDependencies, prepare_pass
from .replay_peaks import read_replay_peaks
from .selection_reasons import NO_CANDIDATE, stating_claude_failures
from .selection_records import Candidate
from .split_windows import Window

ALL_CUT_PERCENT = 100.0
CUTS_PERCENT_BEFORE_WORK = 90.0


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
                shortlisted, counts.asked_for, prepared, self._report_cuts(stage_run)
            )
        peaks = read_replay_peaks(dependencies.data_folder.replay_graph_file(project_id))
        candidates = choose_candidates(placed, prepared.context.clip_seconds, counts.kept, peaks)
        if not candidates:
            raise StageFailedError(NO_CANDIDATE)
        self._work_on_chosen_clips(stage_run, candidates, prepared)
        dependencies.store.replace_candidates(project_id, candidates, peaks)

    def _report_cuts(self, stage_run: StageRun) -> Callable[[float], None]:
        if self._dependencies.work_on_chosen_clips is None:
            return stage_run.report_percent
        return report_within(stage_run.report_percent, 0.0, CUTS_PERCENT_BEFORE_WORK)

    def _work_on_chosen_clips(
        self, stage_run: StageRun, candidates: Sequence[Candidate], prepared: PreparedPass
    ) -> None:
        work = self._dependencies.work_on_chosen_clips
        if work is None:
            return
        report = report_within(stage_run.report_percent, CUTS_PERCENT_BEFORE_WORK, ALL_CUT_PERCENT)
        work(
            ChosenClips(
                project_id=stage_run.project.id,
                candidates=candidates,
                sentences=prepared.sentences,
                stop=stage_run.stop,
                report_percent=report,
            )
        )


def report_within(
    report_percent: Callable[[float], None], first_percent: float, last_percent: float
) -> Callable[[float], None]:
    span = last_percent - first_percent
    return lambda percent: report_percent(first_percent + percent * span / ALL_CUT_PERCENT)


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
