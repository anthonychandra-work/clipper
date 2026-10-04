---
type: research
context: How often AI-selected clips are usable or perform, and where selection fails. Every figure comes from a vendor or a competitor; none is independently audited.
updated: 2026-10-3
sources:
  - https://reap.video/reports/state-of-top-ai-video-clipping-tools-2026
  - https://bigvu.tv/blog/opus-clip-tested-2026-where-ai-wins-40-percent-discard/
  - https://www.opus.pro/blog/viral-moment-detection-api
  - https://marcandrews.com/opus-clip-review-2026-ai-video-shorts-tool-tested/
  - https://github.com/mutonby/openshorts
  - https://github.com/xixihhhh/hotclip
---

# Accuracy and limits of AI clip selection

## Reported hit rates

| Claim | Who says it | Basis |
|---|---|---|
| About 1 in 5 generated clips beats the posting account's median views for that format within seven days | Reap, April 2026 | Reap's own user data; Reap notes no other vendor publishes a comparable figure |
| About 40% of OpusClip's clips get discarded | BIGVU, July 2026 | 50+ clips over 14 days; BIGVU competes with OpusClip |
| A score of 70+ predicts above-median performance about 75% of the time on talking-head content | OpusClip | Unaudited claim in its API write-up |
| About 64% of OpusClip's talking-head clips are usable, against 55% for Vidyo | One independent reviewer | Seen only in a search summary of the review; the test size is unknown |

"Usable" and "performs" are different bars. The 60–70% figures measure whether an editor would publish the clip. The 20% figure measures whether the published clip beat the account's own median.

HotClip's research notes cite a hit-rate comparison by content type — 85–92% for single-speaker talk, 52–74% for multi-speaker conversation, under 35% for comedy and emotion-driven content. The original comparison could not be located, so treat those ranges as unverified.

## Where selection fails

**Content without speech.** Transcript-based selection has nothing to read in music, dance, animation or gameplay. OpusClip states its model performs best on talking-head content and scores music and animation conservatively.

**Conversation.** A clip from a multi-speaker conversation often depends on a question asked earlier. OpusClip acknowledges same-speaker bias and recommends filtering with speaker labels.

**Comedy.** OpenClip's criteria require a joke to keep its setup, punchline and reaction together. HotClip's notes forbid silence removal within one second of laughter or another emotional event, because the pause before a punchline looks like dead air to a silence remover.

**Incomplete thoughts.** BIGVU's test found clips that started or ended mid-idea. The open-source prompts spend more words on boundaries and standing alone than on any other rule.

**Absolute scores.** A score is a ranking within one video, not a forecast of views. OpusClip says to treat scores as ranking signals, and HotClip labels its own score "a ranker, not a view-count oracle".

**Drift.** OpusClip recommends reviewing score thresholds every 60–90 days because platform algorithms change.

## Human review is part of the workflow

OpusClip describes the practice of its best customers: the tool surfaces about 20 candidates per episode and a person picks 5–8 to publish.

## Clip count affects whether users come back

OpenShorts' maintainer measured 429 production jobs in August 2026. 95% of them delivered three clips or fewer, and one clip was the most common result. Users who received 1–3 clips returned a second day 0.4% of the time; users who received 4–9 clips returned 16.1% of the time. Two causes: the prompt let the model drop weak clips with no lower limit, and selecting the best three windows per batch kept the shortlist below its target on videos under about 30 minutes. The fix set a minimum clip count that grows with the amount of material and a maximum of twice the shortlisted windows, capped at 12.
