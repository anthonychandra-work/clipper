---
type: research
context: How clipping tools decide which part of a long video becomes a clip — OpusClip's published criteria and the selection logic read from seven open-source repos.
updated: 2026-10-3
sources:
  - https://help.opus.pro/docs/article/virality-score.md
  - https://www.opus.pro/blog/viral-moment-detection-api
  - https://www.opus.pro/blog/anatomy-of-a-viral-tiktok-2026
  - https://www.opus.pro/research/how-to-go-viral-youtube-shorts
  - https://github.com/mutonby/openshorts
  - https://github.com/Anil-matcha/AI-Youtube-Shorts-Generator
  - https://github.com/FujiwaraChoki/supoclip
  - https://github.com/linzzzzzz/openclip
  - https://github.com/zhouxiaoka/autoclip
  - https://github.com/xixihhhh/hotclip
  - https://github.com/ayush-that/jiang-clips
  - https://github.com/ClipsAI/clipsai
---

# How tools pick the viral part

No tool computes virality from a mathematical formula. Every product and repo examined does the same thing: a language model reads a timestamped transcript and rates spans against a written rubric. The rubrics agree closely with each other. OpusClip adds a ranking model it says was trained on real clip performance; the open-source projects rely on the prompt alone.

## OpusClip's published criteria

The help centre defines the Virality Score as a single number from 0 to 99 built from four questions:

- **Hook** — does the opening grab attention and relate to the main topic?
- **Flow** — does the clip move logically to a satisfying conclusion?
- **Value** — does it give value, resonate emotionally, create a personal connection?
- **Trend** — does it align with current trends and audience interests?

Users see only the composite. Clips sort by it by default.

OpusClip's API write-up lists the underlying signals in three groups:

| Group | Signals |
|---|---|
| Transcript | Hook strength in the first 3 seconds; whether the arc completes (setup, payoff, conclusion); information density; emotional valence; quotability |
| Audio | Speaker pace speeding up near key moments; pitch range; laughter and applause; pauses used for emphasis |
| Visual | Gesture intensity; facial expression; edit dynamics in pre-edited footage |

The same write-up makes these claims, all unaudited:

- The model was trained on "hundreds of thousands" of clip-and-performance pairs from TikTok, Reels and Shorts.
- A score of 70 or higher predicts above-median performance about 75% of the time on talking-head content.
- Music and animation score conservatively; lower the cut-off by 10–15 points for them.
- Thresholds go stale as platform algorithms shift; review them every 60–90 days.
- Scores need calibrating per show, and multi-speaker content biases toward one speaker.

## Open-source rubrics

| Project | What the model is asked to rate | Scale | Structure |
|---|---|---|---|
| Anil-matcha generator | Eight signals in priority order: curiosity hooks, emotional peaks, polarising opinions, revelations, conflict, quotable one-liners, story climaxes, practical tips | 0–100 | Classifies content type and density first; one pass, or 20-minute chunks with 60 s overlap for videos over 30 minutes |
| SupoClip | Four subscores: hook strength, engagement, value, shareability | 0–25 each, summed to 100 | One pass; also labels the hook as question, statement, statistic, story or contrast |
| OpenShorts | Whether the first 2 seconds would hold a viewer who has no context | 0–100 | Two passes: score every window, then cut clips inside the top windows |
| OpenClip | Emotional impact, information value, interactivity, memorability, relatability, plus criteria specific to one of seven content types | High, medium, low | Per-part analysis, then a pass that ranks the top N across parts |
| AutoClip | Information value, emotional resonance, spread potential, structural completeness | 0.0–1.0, default cut-off 0.7 | Four chained steps: outline, timestamps, score, title; separate prompts for each of seven content types |
| HotClip | Hook, structure, value, trend | Rank within the batch, displayed as 76–99 | First pass picks quotes; a second blind reviewer scores them; local audio, visual and chat evidence adjusts the ranking |
| jiang-clips | Surprise, drama, controversy, quotability | 0–100 | One pass, tuned for one niche |
| ClipsAI | Nothing — it finds topic boundaries and returns every segment | — | Embedding similarity between adjacent transcript windows |

## The rules every rubric shares

1. **The hook comes first.** The opening 2–3 seconds decide the score. OpenShorts makes this its main test and tells the model to move the clip's start to the strongest moment or drop the clip.
2. **The clip stands alone.** A viewer with no context must follow it. A clip that opens on a pronoun, or on an answer whose question came earlier, gets its start moved back; the ending is never shortened to compensate.
3. **The arc completes.** Setup, tension or claim, payoff. Cuts land on sentence boundaries, with 0.2–0.4 s of padding before the hook and after the payoff.
4. **Strong content beats neutral content.** Surprise, conflict, strong opinion, big numbers, confession and humour rank above general discussion.
5. **One quotable line.** A sentence that works as a caption or title on its own.
6. **Filler is excluded.** Intros, outros, sponsor reads, greetings and housekeeping are dropped unless they contain the hook.
7. **Clips differ from each other.** Overlapping or same-point clips are collapsed to the stronger one. The Anil-matcha generator drops a clip when more than half of it overlaps a higher-scoring one.

## Content type changes the criteria

OpenClip and AutoClip classify the video before selecting and swap criteria by type:

| Type | What the selector looks for |
|---|---|
| Entertainment | Complete jokes with setup, punchline and reaction; game climaxes |
| Knowledge | The moment an idea clicks; a tip the viewer can use; the question that prompted it |
| Speech | Emotional peaks, memorable lines, applause |
| Opinion | Strong or contrarian positions, disagreement |
| Experience | Personal stories with a revelation |
| Business | Expert advice, concrete strategy |
| Review | Unexpected verdicts, bold predictions |

HotClip adds a live-selling mode where product demonstrations outrank pitches, and pitches outrank price talk.

## Engineering patterns behind the prompts

**Windowing prevents picks clustering at the start.** OpenShorts found that a single call over a whole transcript concentrates picks near the beginning. It splits the transcript into windows of about 90 seconds with 30 seconds of overlap, aligned to sentence boundaries, and scores each one.

**Score everything, then take the global top N.** OpenShorts originally asked for the best three windows per batch. Batches of filler still contributed three, and batches with five strong moments could contribute only three. It now scores every window and shortlists globally; the shortlist grows with video length, from 3 to 10 windows.

**Force the model to use the full range.** Language models cluster their scores in a narrow band. OpenShorts instructs that most windows are not clippable, reserves 70+ for windows that pass the hook test and puts filler under 30. HotClip discards the absolute number and shows rank within the batch.

**Never let the model invent timestamps.** HotClip has the model quote the transcript and derives timestamps by aligning the quote back to the word-level transcript. OpenClip and SupoClip instruct the model to return only timestamps that appear in the supplied transcript, and to return nothing when no span qualifies. Several projects snap cut points to word or shot boundaries after selection.

**Ask for more than needed.** The Anil-matcha generator requests about twice the wanted clip count so that deduplication has room.

**Hook titles must be grounded.** SupoClip and OpenShorts both require the on-screen headline to name something that happens inside the clip — a number, a claim, a name — and forbid promising what the clip does not deliver.

## Hook patterns the tools generate

OpenShorts and SupoClip between them name six patterns for the opening line or on-screen title: an open question, a hot take, a shocking number, an unresolved story, a point-of-view framing, and a before-and-after contrast.

OpusClip's analysis of its own clips (13.5 million, January–March 2026, 7-day views on TikTok and Shorts) ranks hook types by average views:

- In the TikTok write-up, "project and product showcase" hooks led with 6,037 average views, about twice the lowest type. Story-setup openers ranked last.
- In the Shorts write-up, "expertise and credibility" hooks led with 6,706 average views, but that group held only 77 clips.

The same dataset reports that 80.2% of clips carry captions and 78.6% animate them, 77.8% use third-person perspective, 59.4% use a conversational delivery, and 6.0% use B-roll. One write-up attributes the caption figure to the top-10% tier and the other to all clips.
