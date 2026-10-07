from ..pipeline import StageRun
from ..projects import ProjectStatus, StepKind
from .form_shortlist import form_shortlist
from .prepare_pass import StageDependencies, prepare_pass
from .score_windows import score_windows
from .selection_reasons import stating_claude_failures
from .split_windows import split_windows


class ScoreStage:
    step = StepKind.SCORE
    resting_status = ProjectStatus.TRANSCRIBED

    def __init__(self, dependencies: StageDependencies) -> None:
        self._dependencies = dependencies

    def run(self, stage_run: StageRun) -> None:
        dependencies = self._dependencies
        project_id = stage_run.project.id
        model = dependencies.preferences.read().scoring_model
        prepared = prepare_pass(stage_run, model, dependencies)
        windows = split_windows(prepared.sentences)
        dependencies.queue.label_step(project_id, self.step, label_scoring(len(windows)))
        with stating_claude_failures():
            scores = score_windows(windows, prepared.context, stage_run.report_percent)
        shortlist = form_shortlist(windows, scores, prepared.duration_seconds)
        dependencies.store.replace_windows(project_id, shortlist)


def label_scoring(window_count: int) -> str:
    noun = "window" if window_count == 1 else "windows"
    return f"Scoring {window_count} {noun}"
