---
type: research
context: How AI clipping software makes money — billing units, price bands, cost per video, growth channels, revenue at the known companies.
updated: 2026-10-3
sources:
  - https://www.opus.pro/pricing
  - https://vizard.ai/pricing
  - https://klap.app/pricing
  - https://www.submagic.co/pricing
  - https://quickreel.io/blog/business-of-ai-clipping-tools
  - https://getlatka.com/companies/submagic.co
  - https://getlatka.com/blog/submagic-revenue-bootstrap-ceo
  - https://superframeworks.com/case-study/submagic
  - https://getlatka.com/companies/getklap.com
  - https://klap.app/affiliate
  - https://getlatka.com/companies/vizard.ai
  - https://getlatka.com/companies/opus.pro/team
  - https://pulse2.com/opusclip-20-million-raised-for-ai-based-video-editing-platform
  - https://reap.video/reports/state-of-top-ai-video-clipping-tools-2026
  - https://github.com/mutonby/openshorts
  - https://github.com/FujiwaraChoki/supoclip
  - https://github.com/xixihhhh/hotclip
---

# Clipping software economics

## Billing units

Clipping tools charge a monthly subscription that buys a quota. Four quota units are in use:

| Unit | Who uses it | Effect |
|---|---|---|
| Source minutes processed | OpusClip, Vizard (1 credit = 1 minute), OpenShorts hosted | Cost tracks the vendor's compute; a long podcast drains the quota whether or not its clips are good |
| Clips generated | Klap (100, 300 or 1,000 a month) | The customer pays for output |
| Videos, with a length cap per video | Submagic (15, 40 or 100 a month; caps of 2, 5 or 30 minutes) | Suits short uploads and caption work |
| Generations | SupoClip hosted | One run of the pipeline per unit |

Seats and API access are sold on top. OpusClip includes 2–4 seats and API access from its $29 plan. Submagic sells API minutes at $0.10–$0.23 each.

## Price bands

Entry plans run $10–$20 a month: Reap $9.99, OpenShorts $12, Klap $14 on annual billing, OpusClip $15, Submagic $19, Vizard about $20. Top self-serve plans run $29–$94. Annual billing takes 41–50% off. Above that, vendors sell a custom plan with invoicing and a dedicated queue.

Free tiers are small and marked: a watermark, 20–60 minutes a month, and projects that expire in three days.

## Cost per video

The moment-selection step is cheap. OpenShorts reports under $0.01 in model fees for a 10-minute video using a Gemini Flash model. Transcription and rendering compute carry the rest. On OpenShorts' hosted GPU an 8-minute video takes about 50 seconds end to end; the same job takes 5–8 minutes on a typical CPU.

QuickReel's analysis puts gross margin for AI-native products near 52–65%, against 80–90% for conventional software, because every processed video consumes compute. Those are general AI-industry figures quoted by a vendor in this category, not measurements from clipping companies.

HotClip cuts model cost with a funnel: a small local model shortlists transcript chunks and only the shortlist goes to a paid model.

## Revenue at the known companies

| Company | Annual revenue | Team | Funding |
|---|---|---|---|
| OpusClip | $10.3M (GetLatka estimate, 2025) to "nearing $20M" (round coverage) | ~94 | ~$50M |
| Submagic | $8M ARR in 2025 | 13 | None |
| Vizard | $1M ARR by December 2024 | — | Disputed |
| Klap | ~$440K (estimate, 2025) | — | None disclosed |

Submagic earns about $615,000 per employee ($8M across 13 people) and reached that in two years without outside money. OpusClip raised about $50M and employs seven times as many people for revenue estimated at 1.3 to 2.5 times Submagic's.

## Growth channels

**Affiliates.** Submagic launched its affiliate programme within 30 days of its first customer. Klap pays affiliates 30% of revenue for the life of the subscription.

**Comparison pages.** A search for any clipping tool returns "alternatives" pages written by its competitors. Pictory, Castmagic, Vizard, HeyGen, BIGVU, Reap and Eklipse all publish them, and several of the benchmarks cited in this research are that kind of page.

**Free self-serve tier.** QuickReel describes the category as product-led: vendors cannot fund both a sales team and inference bills, so the product sells itself through a capped free tier.

**Published data.** OpusClip and Reap publish research from their own usage data, which earns links and gives them benchmark numbers no competitor can check.

## What customers complain about

HotClip's competitor research, compiled from review sites in August 2026, reports that credit-based billing is the main source of one-star reviews for OpusClip: credits that expire monthly, and projects deleted when a subscription ends. That finding was read from HotClip's notes and not checked against the review sites.

## How open-source projects charge

The code is free and the convenience is sold. OpenShorts and SupoClip host the same software they publish. OpenShorts states that its paid plans cover hardware and model keys and unlock no extra features. AutoClip and HotClip charge nothing; the user supplies a model key or runs a local model.
