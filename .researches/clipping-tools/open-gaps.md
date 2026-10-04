---
type: research
context: Weak spots in existing clipping tools — my conclusions from the landscape, virality, duration and business-model research, as input for deciding what a new tool should do differently.
updated: 2026-10-3
sources:
  - https://help.opus.pro/docs/article/virality-score.md
  - https://www.opus.pro/blog/viral-moment-detection-api
  - https://www.opus.pro/mcp/inspiration/clip-the-exact-moments-your-viewers-rewatch-most
  - https://reap.video/reports/state-of-top-ai-video-clipping-tools-2026
  - https://bigvu.tv/blog/opus-clip-tested-2026-where-ai-wins-40-percent-discard/
  - https://rainnews.com/54195-2/
  - https://arxiv.org/abs/2507.02790
  - https://creatordb.app/creator-news/the-rise-of-the-clip-economy/
  - https://github.com/mutonby/openshorts
  - https://github.com/xixihhhh/hotclip
  - https://github.com/zhouxiaoka/autoclip
---

# Gaps in existing clipping tools

These are my conclusions from the research, not findings stated by any single source.

**Selection reads the transcript and little else.** Most products and most open-source repos choose clips from text. Speech-free content — gameplay, music, dance, product demos — is served by OpusClip's paid multimodal mode, by Eklipse for games, and by a handful of small repos. AutoClip, the most-starred open-source clipper, was still designing its picture-based selection in September 2026.

**Scores are not checked against outcomes.** Open-source scores are a language model's opinion. OpusClip says its model is trained on real performance and publishes no audit. Among the tools examined, only HotClip lets a user import their own platform metrics so that selection learns from what performed on that account.

**Audience evidence is underused.** YouTube's most-replayed graph, live-chat bursts and timestamped comments record what real viewers reacted to. Headliner sells clipping from the first, and OpusClip offers it as an agent recipe outside its core product. The second and third appear only in small stream-focused repos.

**Review is where the time goes.** By the published figures, about four in ten generated clips are discarded and about one in five beats the account's median. Tools that show why a clip was chosen, let the user nudge a boundary and remember what was rejected shorten that step; HotClip is built around it and the SaaS products treat it as secondary.

**Clip boundaries are a recurring cause of rejection.** Incomplete thoughts are the complaint that repeats in tests, and the open-source prompts spend more words on where to start and stop than on any other rule. The HIVE paper treats choosing the opening and the ending as tasks separate from finding the highlight. The tools examined handle them as rules inside the selection prompt.

**Too few clips loses users.** OpenShorts found that users who received one to three clips almost never returned. A selector tuned only for precision produces that outcome.

**Expiring credits are a reported source of complaints.** Source-minute credits charge for long videos that yield few good clips. Klap's per-clip billing and the free local desktop apps are the two existing responses. The complaint data comes from one project's competitor notes and is unverified.

**Paid clippers are a distinct customer.** They need volume across many accounts, compliance with each campaign's brief, and view tracking per campaign. The large clipping products are built for creators repurposing their own content. Several smaller tools target clippers; this research did not evaluate them.

**The opening seconds are rarely edited.** Tools select a strong moment and add a text title. HotClip's notes cite an OpusClip figure that 0.04% of clips carry a visual hook in the opening. That figure was not found in OpusClip's published write-ups and is unverified.
