from dataclasses import replace

from .create_project import plan_project
from .project import Platform, Project, SourceKind, Step, StepKind, StepState
from .project_schemas import CreateProjectRequest

DOWNLOAD_LABEL = "Downloading Whisper small"


def plan_fetched_project() -> Project:
    draft = CreateProjectRequest(
        source_kind=SourceKind.LINK, link="https://video.example/talk", platforms=[Platform.REELS]
    )
    project = plan_project(draft)
    fetched = replace(project.steps[0], state=StepState.DONE, percent=100.0)
    return replace(project, steps=(fetched, *project.steps[1:]))


def add_download(project: Project, percent: float) -> Project:
    state = StepState.DONE if percent == 100 else StepState.PENDING
    download = Step(StepKind.MODEL, state, percent, DOWNLOAD_LABEL)
    return replace(project, steps=(project.steps[0], download, *project.steps[1:]))


def set_transcribe_percent(project: Project, percent: float) -> Project:
    steps = [
        replace(step, percent=percent) if step.kind is StepKind.TRANSCRIBE else step
        for step in project.steps
    ]
    return replace(project, steps=tuple(steps))


def test_the_bar_of_a_project_is_four_quarters_one_for_each_step_it_was_created_with() -> None:
    fetched = plan_fetched_project()

    assert fetched.percent() == 25
    assert set_transcribe_percent(fetched, 50).percent() == 37.5


def test_a_step_added_ahead_of_another_shares_its_quarter_so_the_bar_does_not_fall() -> None:
    with_download = add_download(plan_fetched_project(), percent=0)

    assert len(with_download.steps) == 5
    assert with_download.percent() == 25


def test_the_added_step_and_the_step_behind_it_fill_their_quarter_between_them() -> None:
    downloading = add_download(plan_fetched_project(), percent=50)
    downloaded = add_download(plan_fetched_project(), percent=100)

    assert downloading.percent() == 31.25
    assert downloaded.percent() == 37.5
    assert set_transcribe_percent(downloaded, 100).percent() == 50


def test_a_step_with_a_label_of_its_own_is_shown_under_it() -> None:
    project = add_download(plan_fetched_project(), percent=0)

    assert project.label_of_kind(StepKind.MODEL) == DOWNLOAD_LABEL
    assert project.label_of_kind(StepKind.TRANSCRIBE) == "Transcribing on this Mac"


def test_a_download_step_without_a_label_has_one_worked_out_from_its_kind() -> None:
    unlabelled = Step(StepKind.MODEL, StepState.PENDING, 0.0)

    assert plan_fetched_project().label_of(unlabelled) == "Downloading the transcription model"


def test_the_first_unfinished_step_is_the_added_one_until_it_is_done() -> None:
    waiting = add_download(plan_fetched_project(), percent=0).first_unfinished_step()
    downloaded = add_download(plan_fetched_project(), percent=100).first_unfinished_step()

    assert waiting is not None and waiting.kind is StepKind.MODEL
    assert downloaded is not None and downloaded.kind is StepKind.TRANSCRIBE
