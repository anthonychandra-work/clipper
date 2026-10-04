---
type: research
context: Signals other than the transcript that tools use to find highlights — audience behaviour, audio, picture — and the academic work behind them.
updated: 2026-10-3
sources:
  - https://rainnews.com/54195-2/
  - https://www.opus.pro/mcp/inspiration/clip-the-exact-moments-your-viewers-rewatch-most
  - https://apify.com/karamelo/youtube-most-replayed-scraper-heatmap-extractor
  - https://npmjs.com/package/yt_most_replayed
  - https://proceedings.neurips.cc/paper_files/paper/2023/hash/7f880e3a325b06e3601af1384a653038-Abstract.html
  - https://arxiv.org/abs/2603.01169
  - https://arxiv.org/abs/2507.02790
  - https://www.opus.pro/blog/viral-moment-detection-api
  - https://github.com/xixihhhh/hotclip
  - https://github.com/VadlapatiKarthik/autoclipper
  - https://github.com/LuisSotelo/vod-to-viral
  - https://github.com/divyaprakash0426/autoshorts
  - https://github.com/timerring/bilive
  - https://github.com/ColinGPT9/clips-studio
  - https://github.com/zhouxiaoka/autoclip
  - https://github.com/mutonby/openshorts
  - https://github.com/line/lighthouse
  - https://eklipse.gg/compare/eklipse-vs-streamladder/
---

# Signals beyond the transcript

A transcript tells the selector what was said. It misses what the audience did, how it sounded and what was on screen. Tools that handle streams, gameplay or silent footage add the signals below.

## What the audience already did

**YouTube's most-replayed graph.** YouTube draws a replay heatmap on the progress bar of videos with enough views; one source puts the threshold near 50,000 views. The graph gives a normalised intensity for each segment of the video. Headliner sells clipping from it, OpusClip publishes an agent recipe for it, clips-studio uses the top of the curve to nudge its ranking, and scrapers for it exist on Apify and npm. It works only for videos already published and already popular.

**Live chat velocity.** A burst of chat messages marks a moment the live audience reacted to. The autoclipper sketch counts messages in a rolling 30-second window and fires when the count exceeds 2.5 times the baseline, then clips from 15 seconds before to 15 seconds after. bilive slices Bilibili streams by chat density. HotClip refines it: paid events such as gifts, memberships and super chats count for more than plain messages, each sender's contribution per window is capped so one spammer cannot fake a peak, and a sudden jump over the previous window scores extra. vod-to-viral weights messages from moderators, VIPs and the streamer above ordinary viewers.

**Timestamps in comments.** Viewers write times such as 12:34 in comments to point at a moment. The autoclipper sketch counts these mentions, takes the three most cited, and clips from 5 seconds before to 10 seconds after each.

**Retention curves.** A channel owner can read audience retention for their own videos from YouTube Analytics. The autoclipper sketch plans to clip where retention exceeds 1.5 times the video's average; the repo leaves this unimplemented. It is unavailable for other people's videos.

## Audio

Loudness peaks, laughter, applause, pitch range and changes in speaking pace all mark emphasis. OpusClip lists these among its inputs. vod-to-viral downloads only the audio track and the chat log of a stream, scores loudness, keywords and chat activity together, and then downloads only the 30–45 second video sections around the peaks. That avoids fetching a four-hour recording to cut two minutes from it.

autoshorts ranks gameplay scenes by an action score weighted 60% audio (loudness and spectral change) and 40% video motion, then has a vision model label each scene as one of seven kinds: action, funny, clutch, unexpected, fail, hype or skill.

## Picture

**Shot changes and motion.** HotClip measures shot-change density and motion peaks locally and draws them as curves on its timeline. It also snaps cut points to real shot boundaries.

**Facial expression.** HotClip runs a small local face and emotion model to find laughter, surprise and excitement peaks. OpusClip lists gesture intensity and facial animation among its inputs.

**Vision models.** For silent video, OpenShorts hands the whole file to a multimodal model and asks for the most engaging visual moments: action, reveals, transformations, payoffs. HotClip samples one frame every 30 seconds across a stream, tiles nine frames into a contact sheet, and asks a vision model what is on screen; it runs the same check on top candidates and demotes ones whose visuals are lifeless. AutoClip published a design in September 2026 for finding highlights in gameplay without subtitles using 20–30 second windows with 3–5 seconds of overlap; that design had not been built or tested at the time.

**Game awareness.** Eklipse says its engine recognises events across 3,000+ game titles.

## Combining signals

HotClip's rule is that one signal alone is weak evidence: loudness alone could be background music, chat alone could be spam. A moment is trusted when several fire together — loudness, chat and laughter at once. It also keeps a uniform sampling reserve so that an early loud stretch cannot hide a later quiet moment that matters.

HotClip closes the loop with outcomes. The user's keep-or-reject decisions are stored locally and steer the next run, and platform-exported performance data can be imported so that the selector learns which topics, hooks and durations performed for that account.

## Academic work

| Work | Venue | Relevance |
|---|---|---|
| Mr. HiSum | NeurIPS 2023, Datasets and Benchmarks | 31,892 YouTube videos labelled with most-replayed statistics aggregated over 50,000+ viewers per video. The standard training set for predicting which parts get rewatched |
| TripleSumm | ICLR 2026 | Fuses audio, visual and text for video summarisation; introduces a 50,000+ video dataset |
| HIVE | EMNLP 2025, Industry Track | Splits automatic editing into three tasks: highlight detection, choosing the opening and ending separately, and pruning irrelevant content. Benchmarked on 2,500+ short-drama episodes and 500 professionally edited ad clips |
| Lighthouse | EMNLP 2024 demo | Open library that runs published moment-retrieval and highlight-detection models reproducibly |

HIVE's split matches what the commercial rubrics do informally: the opening line is chosen as its own problem, separate from finding the highlight.

HotClip's research notes also list AHA (NeurIPS 2025, streaming highlight detection), DAViHD (ICASSP 2026, audio features for engagement) and SVHighlights (KDD 2026, long-video highlights). Those three were not checked against the original papers.
