---
type: research
context: How long a clip should be — platform limits, performance data by duration, and the length bands clipping tools enforce.
updated: 2026-10-3
sources:
  - https://www.opus.pro/blog/anatomy-of-a-viral-tiktok-2026
  - https://www.opus.pro/research/how-to-go-viral-youtube-shorts
  - https://www.socialinsider.io/social-media-benchmarks/social-media-video-statistics
  - https://scrollscript.ai/blog/how-long-should-a-tiktok-reel-youtube-short-be
  - https://joyspace.ai/ideal-video-length-social-platform-2026
  - https://www.socialmediatoday.com/news/youtube-expands-3-minute-shorts-to-all-users/736967/
  - https://www.inro.social/blog/instagram-reels-can-now-be-20-minutes-long-new-time-limit-explained-2025
  - https://www.socialcal.app/blog/how-long-can-an-instagram-video-be
  - https://www.argil.ai/blog/how-long-can-youtube-shorts-be
  - https://github.com/mutonby/openshorts
  - https://github.com/FujiwaraChoki/supoclip
  - https://github.com/Anil-matcha/AI-Youtube-Shorts-Generator
  - https://github.com/linzzzzzz/openclip
  - https://github.com/zhouxiaoka/autoclip
  - https://github.com/xixihhhh/hotclip
  - https://github.com/ayush-that/jiang-clips
  - https://github.com/LuisSotelo/vod-to-viral
  - https://github.com/ClipsAI/clipsai
---

# Clip duration

## Platform limits

| Platform | Maximum length | Monetisation rule tied to length |
|---|---|---|
| YouTube Shorts | 3 minutes, for vertical or square uploads since 15 October 2024 | Shorts share ad revenue through the Partner Program |
| TikTok | 10 minutes recorded in-app; uploads up to 60 minutes | The creator payout programme pays only on videos of 1 minute or longer |
| Instagram Reels | 3 minutes since early 2025; some sources report a 20-minute limit, others still report 3 | Income comes mainly from brand deals |

The Reels sources contradict each other, which points to a staged rollout. Check the limit in the app before relying on it.

## Performance by duration

**OpusClip, 13.5 million clips, January–March 2026, 7-day views on TikTok and Shorts.** The median clip runs 50 seconds. The median in the top 10% by views runs 41 seconds. The 15–30 and 30–60 second bands are over-represented in the top tier and the 60–90 second band is under-represented. The 90th percentile of the top tier is 179 seconds, so long clips do reach the top tier. The sample is OpusClip's own users, which skews toward talking-head content.

**Socialinsider, 111,000 videos, January–June 2026.**

| Duration | TikTok engagement | TikTok avg views | Reels engagement | Reels avg views |
|---|---|---|---|---|
| 0–30 s | 6.00% | 1,200 | 0.28% | 4,700 |
| 30–45 s | 4.20% | 2,000 | 0.30% | 8,564 |
| 45–60 s | 4.30% | 3,300 | 0.35% | 10,374 |
| 60–90 s | 4.80% | 8,000 | 0.30% | 9,790 |
| 90–120 s | 5.20% | 9,800 | 0.30% | 8,000 |
| 120–180 s | 5.50% | 12,000 | 0.33% | 9,000 |
| over 180 s | 5.80% | 11,700 | 0.15% | 4,428 |

TikTok engagement is measured against views and Reels engagement against followers, so the two engagement columns cannot be compared with each other.

On TikTok, views rise with length: clips of 120–180 seconds average ten times the views of clips under 30 seconds. Engagement rate is highest under 30 seconds, dips between 30 and 60, and climbs again past a minute. On Reels, views and engagement both peak at 45–60 seconds and fall sharply past 3 minutes.

**Tool-vendor guidance without disclosed data.** ScrollScript, from 1,400+ scripts written in its own tool, recommends 21–34 seconds for TikTok, 7–15 seconds for Reels reach or 25–45 for saves, and 30–45 seconds for Shorts. Joyspace recommends 24–38 seconds for TikTok and 50–58 for Shorts and discloses no sample.

## Why the data disagrees

This section is my reading of the figures above, not a finding from any one source.

The studies measure different things. Engagement rate is highest on the shortest clips. Total views on TikTok rise past one minute, the same threshold at which the payout programme starts paying. OpusClip's top tier leans shorter, and its sample is clips cut from long talking-head sources, where one point with its setup fits in well under a minute.

The outcome being optimised decides the band:

- Completion rate and loops: 15–35 seconds.
- A single point with setup and payoff, the standard talking-head clip: 30–60 seconds.
- TikTok payout eligibility: at least 60 seconds.
- A full story or argument: 60–180 seconds, where the Shorts limit ends.

## Length bands the tools enforce

| Tool | Hard limits | Preferred |
|---|---|---|
| OpenShorts | 15–60 s by default; user-settable from 5 to 180 s | Inside the limits |
| SupoClip | 15–60 s | 25–50 s |
| Anil-matcha generator | None enforced; the prompt allows 20–180 s | 45–90 s; 20–44 only for a standalone one-liner; 91–180 only when a story needs the context |
| OpenClip | 30–180 s on auto | 45–180 s; presets for 30–60, 60–90, 90–180 and 180–300 s |
| jiang-clips | 15–120 s | 30–90 s |
| HotClip | Presets: 10–30, 8–40, 40–90 s | Its notes put live-stream clips at 20–40 s |
| vod-to-viral | 30–45 s around each peak | — |
| AutoClip, topic pipeline | 90 s minimum, 8 min maximum | 3–6 min |
| ClipsAI | 15 s – 15 min | — |

AutoClip's long band comes from its original purpose: cutting a long talk into topic segments for Bilibili-style viewing. The sample clips in its current README run from 0:50 to 2:02.

Two rules appear in every tool. The length band is a constraint, and the clip's natural arc decides the length inside it. A clip is never padded with weak material to reach a target, and when a moment runs longer than the band it is split or trimmed to its strongest complete arc.
