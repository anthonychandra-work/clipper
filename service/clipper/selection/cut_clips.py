from typing import Literal

from .ask_claude import ClaudeQuestion, Effort, ask_claude
from .clip_proposal import ProposedClip, ProposedClips
from .selection_task import ClipSeconds, PassContext, TaskModel, TaskWindow, describe_task_window
from .split_windows import Window

CUTTING_EFFORT: Effort = "high"

CUT_INSTRUCTIONS = """\
You cut short vertical clips from a long spoken video. You receive its transcript as numbered
sentences. Each line holds the number of a sentence, the second it starts at in square brackets,
and its text. After the transcript comes one task as a JSON object.

The task names one window of the transcript by the numbers of its first and last sentence. Find
the clips whose first sentence lies in that window. A clip may end after the window does. A clip:
- opens on its hook, the line that makes a viewer stay;
- makes sense to someone who has seen nothing else of this video;
- completes its setup and its payoff;
- starts on the first word of a sentence and ends on the last word of a sentence.

Leave out intros, outros, sponsor reads and housekeeping.

clipSeconds gives the shortest and the longest a clip may last, and a clip outside these limits
is thrown away. When the limits are 25 and 60 seconds, a clip of 25 to 50 seconds is preferred.
Inside the limits the clip's own arc decides its length. Never pad a clip with sentences it does
not need in order to reach a length.

clipCount is how many clips the whole video should yield at least, when it holds that many. This
window is one of several, so do not reach for the number here. Return the clips this window
really holds, the best first, and an empty list when it holds none. language is the language of
the transcript. A brief that is not empty says what the user is looking for.

For each clip give:
- openingWords and closingWords: the first and the last five to ten words of the clip, quoted
  exactly as the transcript has them. Give no time and no sentence number. The tool finds the
  words in the transcript and takes the times from there, and it drops a clip whose words it
  cannot find.
- scores: hook, arc, value and share, each a whole number from 0 to 25. hook is how well the
  first line holds a viewer who has no context, arc how complete the setup and the payoff are,
  value what the viewer takes away, and share how likely a viewer is to send it to someone. The
  scores rank the clips of this one video against each other.
- reason: one sentence that says why this clip was picked.
- title: a working title for the clip.
- hookTitle: at most ten words to show on screen over the first seconds. It names something the
  clip really holds.
- hookType: number, story, list, hot-take, confession, contrarian, or none when the clip has no
  hook of these kinds.
- flag: null for most clips. needs-context when the clip leans on something said before it.
  not-recommended when it is weak and still the best this window has. With a flag, note is one
  sentence that says why.
- platforms: a title and a description for each of tiktok, reels and shorts.

Write every title, hook title and description in the language of the transcript.
"""


class CutTask(TaskModel):
    task: Literal["cut"] = "cut"
    window: TaskWindow
    clip_count: int
    clip_seconds: ClipSeconds
    language: str
    brief: str


def cut_clips(window: Window, clip_count: int, context: PassContext) -> list[ProposedClip]:
    question = write_cut_question(window, clip_count, context)
    return ask_claude(question, context.access, context.stop).clips


def write_cut_question(
    window: Window, clip_count: int, context: PassContext
) -> ClaudeQuestion[ProposedClips]:
    task = CutTask(
        window=describe_task_window(window),
        clip_count=clip_count,
        clip_seconds=context.clip_seconds,
        language=context.language,
        brief=context.brief,
    )
    return ClaudeQuestion(
        model=context.model,
        effort=CUTTING_EFFORT,
        system=CUT_INSTRUCTIONS,
        transcript_part=context.transcript_part,
        task=task.write(),
        reply_model=ProposedClips,
    )
