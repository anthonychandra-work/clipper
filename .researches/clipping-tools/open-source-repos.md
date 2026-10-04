---
type: research
context: Open-source clipping projects on GitHub in October 2026 — popularity, licence, architecture, how each earns money.
updated: 2026-10-3
sources:
  - https://github.com/zhouxiaoka/autoclip
  - https://github.com/mutonby/openshorts
  - https://github.com/Anil-matcha/AI-Youtube-Shorts-Generator
  - https://github.com/FujiwaraChoki/supoclip
  - https://github.com/linzzzzzz/openclip
  - https://github.com/ClipsAI/clipsai
  - https://github.com/ayush-that/jiang-clips
  - https://github.com/xixihhhh/hotclip
  - https://github.com/Shaarav4795/ClippedAI
  - https://github.com/divyaprakash0426/autoshorts
  - https://github.com/shreesha345/AI-short-creator
  - https://github.com/openclaw-easy/ViralMint
  - https://github.com/SamurAIGPT/ai-clipping-generator
  - https://github.com/ColinGPT9/clips-studio
  - https://github.com/VadlapatiKarthik/autoclipper
  - https://github.com/LuisSotelo/vod-to-viral
  - https://github.com/modelscope/FunClip
  - https://github.com/timerring/bilive
  - https://github.com/mli/autocut
  - https://github.com/WyattBlue/auto-editor
  - https://github.com/harry0703/MoneyPrinterTurbo
  - https://github.com/FujiwaraChoki/MoneyPrinterV2
  - https://github.com/RayVentura/ShortGPT
  - https://github.com/SYSTRAN/faster-whisper
  - https://github.com/m-bain/whisperX
  - https://github.com/Breakthrough/PySceneDetect
  - https://github.com/remotion-dev/remotion
  - https://github.com/line/lighthouse
  - https://github.com/showlab/UniVTG
---

# Open-source clipping repos

Star counts come from the GitHub API on 2026-10-03.

## Long-video-to-clips projects

| Repo | Stars | Licence | Created | Form | Selection method |
|---|---|---|---|---|---|
| zhouxiaoka/autoclip | 9,128 | MIT | 2025-07 | Desktop app, CLI, MCP server | Four chained LLM steps: outline topics, locate timestamps, score, title |
| mutonby/openshorts | 5,922 | MIT | 2025-12 | Docker self-host, hosted plan, MCP server | Two LLM passes: score transcript windows, then cut inside the best ones |
| Anil-matcha/AI-Youtube-Shorts-Generator | 5,220 | MIT | 2024-06 | CLI | One LLM pass with an eight-signal rubric; chunks long videos |
| FujiwaraChoki/supoclip | 1,275 | AGPL-3.0 | 2025-07 | Hosted web app, iOS app, Docker self-host, MCP server | One LLM pass returning four subscores per clip |
| linzzzzzz/openclip | 568 | MIT | 2026-01 | Web UI, agent skill | Per-part analysis by content type, then a ranking pass |
| ClipsAI/clipsai | 544 | MIT | 2023-12 | Python library, dormant since 2024-01 | Topic segmentation by embedding similarity; no ranking |
| ayush-that/jiang-clips | 332 | none | 2026-03 | CLI, built in one day | One LLM pass tuned for history lectures |
| xixihhhh/hotclip | 277 | AGPL-3.0 | 2026-07 | Desktop app, CLI, MCP server | LLM picks quotes; nine local evidence channels adjust the ranking |
| Shaarav4795/ClippedAI | 215 | custom | 2025-06 | CLI | Not inspected |
| divyaprakash0426/autoshorts | 204 | MIT | 2026-01 | CLI and dashboard, gameplay only | Audio and motion heuristics plus a vision model |
| shreesha345/AI-short-creator | 185 | MIT | 2023-11 | CLI | Not inspected |
| openclaw-easy/ViralMint | 120 | AGPL-3.0 | 2026-05 | Local pipeline with trend scouting | Not inspected |
| SamurAIGPT/ai-clipping-generator | 92 | MIT | 2026-04 | SaaS starter with billing | Not inspected |
| ColinGPT9/clips-studio | 81 | AGPL-3.0 | 2026-06 | Local app for Twitch, Kick, YouTube streams | LLM plus YouTube's most-replayed graph where available |
| VadlapatiKarthik/autoclipper | 36 | none | 2025-05 | Service sketch, incomplete | Chat spikes, comment timestamps, retention peaks |
| LuisSotelo/vod-to-viral | 12 | none | 2026-03 | Twitch worker | Audio loudness, chat activity and keywords |

Below these sits a long tail of 30-plus repos under 50 stars, most created in 2026 and most describing themselves as an "open-source Opus Clip alternative".

The first repo listed under SamurAIGPT in older articles now redirects to Anil-matcha.

## Adjacent projects

| Repo | Stars | What it does |
|---|---|---|
| modelscope/FunClip | 6,361 | Alibaba's transcript-driven clipper built on its own Chinese speech recognition; a person or an LLM picks text and the tool cuts the video |
| timerring/bilive | 3,292 | Records Bilibili live streams, slices them by live-chat density, uploads automatically |
| mli/autocut | 7,816 | Cut a video by editing its transcript in a text editor; dormant since 2024-10 |
| WyattBlue/auto-editor | 5,410 | Removes silence and dead air |
| line/lighthouse | 272 | Research library for moment retrieval and highlight detection models |
| showlab/UniVTG | 380 | Research model for video-language temporal grounding |

Three high-star repos appear in "shorts generator" searches but create videos from a topic or script instead of cutting existing footage: harry0703/MoneyPrinterTurbo (128,195), FujiwaraChoki/MoneyPrinterV2 (32,033) and RayVentura/ShortGPT (7,997).

## The shared pipeline

Every clipper above runs the same stages:

1. Fetch the video, usually with yt-dlp.
2. Transcribe with word-level timestamps. faster-whisper (25,681 stars) and WhisperX (24,347) are the common local choices; SupoClip uses AssemblyAI; the Chinese projects use Paraformer or SenseVoice.
3. Send the timestamped transcript to an LLM and get back clip spans. Gemini Flash models are the most common default; most projects also accept OpenAI, Claude or a local model through Ollama.
4. Cut the spans with FFmpeg.
5. Reframe to 9:16. Face detection keeps the speaker centred; newer projects add active-speaker switching, stacked two-person layouts and screen-recording layouts.
6. Burn in word-synced captions and a hook title.
7. Optionally publish through a posting API.

PySceneDetect (5,217 stars) is the usual shot-boundary detector. Remotion (61,660 stars) is used for caption rendering in several projects; its licence requires a paid company licence for teams of four or more.

## How the open-source projects earn money

OpenShorts sells a hosted version of the same code: free for 20 minutes a month with a watermark, from $12 a month for 100 minutes. SupoClip runs a hosted web app and an iOS app with a monthly generation limit per plan. The Anil-matcha repo defaults to a paid API gateway for transcription and LLM calls and offers a local mode as the alternative. AutoClip and HotClip are free desktop apps where the user pays their own model provider.

MCP servers and agent skills are standard in the 2025–2026 projects: AutoClip, OpenShorts, SupoClip, OpenClip and HotClip all ship one.

## Licence constraints

SupoClip, HotClip, ViralMint and clips-studio are AGPL-3.0, which requires publishing the source of any network service built on them. AutoClip, OpenShorts, the Anil-matcha repo, OpenClip and ClipsAI are MIT. jiang-clips, autoclipper and vod-to-viral have no licence file, so their code cannot be reused as it stands; vod-to-viral's README shows an MIT badge without the licence text.

The selection method column was read from source for every row except those marked "Not inspected".
