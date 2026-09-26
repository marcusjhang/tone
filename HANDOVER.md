# Tone — Handover Doc

**Product:** A free, no-login web app that reproduces a Korean personal color consultation from one selfie and returns a full result sheet in English.
**One-liner:** *One selfie. Your color type, your palette, and everything to do with it.*
**Objective:** Viral first (mass user acquisition), monetize second.
**Repo:** https://github.com/marcusjhang/tone
**Status:** Concept + research complete. No code yet.

---

## 1. What we're building

You open a link (no signup, no download). You take one guided selfie. The app measures your skin, hair, eyes and contrast, digitally drapes colors on your face, and hands you a complete color profile: your type, your best and worst colors, and what to wear across makeup, hair, jewelry, glasses and nails — plus a shareable card.

It is the digital version of walking into a Korean personal color studio, minus the ₩130,000 and the flight.

**The core insight:** the classifier is a commodity — the *reveal* is the product. What makes this spread is a face shown under the right colors vs the wrong colors, not an accurate label. Proof: a single customer's two TikToks of their in-person drape did 20M+ views; one creator's drape video did 30M+. Nobody shared it because it was accurate.

---

## 2. Background — what Korean personal color analysis is

- Inherited from Itten → Caygill → *Color Me Beautiful* (same root as Western seasonal analysis), but operationalized more granularly and applied aggressively to K-beauty consumption.
- Built on four axes: **warm/cool (undertone)**, **light/dark (value)**, **bright/muted (chroma)**, **low/high contrast**.
- The 4 seasons are the invariant backbone; subtypes extend to 8 / 10 / 12 / 16 depending on provider. **12 is the consumer convention** (3 subtypes per season).
- An in-person session: bare face, no colored contacts, natural daylight (~3hrs after sunrise to ~3hrs before sunset), white cloth + fabric draping, optional spectrophotometer reading reported as **L\*a\*b\***, gold-vs-silver test, then a result sheet (결과지).
- **No government license.** Certifications are private; each institute defines its own subtype names. Names drift: Bright = Clear = Vivid = Strong; Mute = Soft; Deep = Dark.
- The science is a convention, not a validated instrument: peer-reviewed work shows national season systems disagree on the axes, and no test–retest / inter-rater reliability study exists.

Full detail: `docs/research-domain.md`.

---

## 3. The Korean way, mapped to the app

| In-person Korean session | The app |
|---|---|
| Arrive bare-faced, no colored contacts | Prompt: bare face, no filter, no lenses |
| White head-wrap + cape to neutralize clothing/hair | Guide to neutral background, hair tied back |
| Natural daylight, ~3hrs after sunrise to ~3hrs before | Lighting check: reject artificial/mixed light, target 5000–6500K |
| Consultant assesses veins, iris, hair, skin redness/yellowness | CV reads skin, iris color, hair color, contrast |
| Spectrophotometer pressed to skin → L\*a\*b\* | Estimate skin L\*a\*b\* under guided capture |
| **Draping**: 4 seasons → 12 types → subtype | **Digital drape reveal** on the selfie |
| Gold vs silver test | Metal recommendation |
| Consultant resolves value/chroma/contrast and edge cases | Compute warmth, value, chroma, contrast → subtype |
| Wrap-up: makeup, hair, jewelry, wardrobe coaching | Result sheet + color card |
| Give 결과지 + color card + mobile card | On-screen result + share card + PDF |

---

## 4. End-to-end user flow

**Screen 0 — Landing.** "Find your color type in 60 seconds. Free. No signup." One button: **Start**.

**Screen 1 — Prep guidance.** Checklist: bare face; no colored contacts or glasses; hair pulled back; face a window or even light (no lamps, no shade); turn off beauty mode / filters.

**Screen 2 — Camera.** Live camera with a face outline. On-screen checks: face detected, lighting neutral, no filter. Shutter enabled only when conditions pass.

**Screen 3 — Analysis.** 2–3s spinner. Detect face → segment skin/hair/iris/lips → estimate color values → compute four axes → place the type.

**Screen 4 — The Reveal (the core moment).** Split screen of the user's own face: left under their *best* colors, right under their *worst*. A slider to drag between them. Caption: "See the difference?"

**Screen 5 — Your Result.** The full result sheet (Section 5), scrollable.

**Screen 6 — Your Card.** One tap → branded, screenshot-ready image: face, type, palette. Sized for Instagram Story and messaging apps. Download / share.

**Screen 7 — Save (optional).** Email me my result (PDF). Add to home screen. No account required to get the result.

**Screen 8 — Shop (later phase).** "Shop your palette" — products in the user's colors. Affiliate / commerce. Never blocks the result.

---

## 5. The result, end to end

**Headline**
- Type, e.g. **"Summer Cool Mute"**
- One-line meaning, e.g. "Cool, soft, muted colors. Low saturation, medium lightness."
- **Confidence** (% or bar)
- **Secondary matches:** "You're close to: Summer Cool Light, Winter Cool Mute"
- **Your axes:** Warm↔Cool, Light↔Deep, Bright↔Muted, Low↔High contrast

**Palettes**
- **Best colors** — swatches with English names + hex
- **Worst colors** — plus a safer substitute for each
- **Neutral / basics**

**Fashion** — best colors for tops/bottoms/outerwear; fabrics and textures; patterns (scale/type); contrast level; the 60/30/10 area rule.

**Makeup** — foundation undertone (warm/neutral/pink/cool) + shade direction; lip colors; eyeshadow; blush; liner/brows.

**Hair** — dye colors that suit; which to avoid; hair "level" (how light/dark to go).

**Jewelry** — primary metal (Gold / Silver / Rose Gold) + runner-up.

**Glasses** — frame color; frame thickness/style; lens tint.

**Nails** — colors; art/design direction.

**Products (later phase)** — specific brand + product + shade.

**Takeaway** — shareable card (image); downloadable PDF; saved profile link.

---

## 6. Type system (12-type, English)

| Season | Subtypes |
|---|---|
| Spring | Spring Warm, Spring Light, Spring Bright |
| Summer | Summer Cool, Summer Light, Summer Mute |
| Autumn | Autumn Warm, Autumn Deep, Autumn Mute |
| Winter | Winter Cool, Winter Deep, Winter Bright |

Each subtype = a point on four axes: **warm/cool · light/deep · bright/muted · low/high contrast**. The label is the readable name for that point. Keep an alias layer so Bright↔Clear↔Vivid↔Strong and Mute↔Soft display correctly.

**Model the type as a normalized object, not a flat enum:** `{season, dominant_axis, label, confidence, secondary_types[]}` with display aliases.

---

## 7. Growth strategy (viral-first)

**The growth loop** (MBTI playbook, which Korea is the world's most obsessive market for — personal color is already branded the "beauty MBTI"):
free no-login diagnosis → instant branded, screenshot-ready card → posted to messaging apps and Instagram Stories → friends ask "what am I?" → new diagnoses.

- **The card is the growth artifact.** The type label + palettes + share card must stay free. Paywalling the result kills the loop (documented in refund-heavy reviews of competing apps).
- **Friction ladder:** web link (opens in any messenger) < mini-app (no signup/download) < native download. Default to **web first**; native only when there's a retention reason.
- **No friend/social features in v1** — explicitly dropped. Growth leans on the card being shared unprompted, plus creator seeding. (A compatibility/"color chemistry" layer was researched as the highest-leverage *optional* add-on; it is out of v1.)
- **Seeding:** recruit 10–30 personal-color creators; replicate the proven format (a person under changing fabrics, an authority narrating, viewers judging) and the travel hook ("the Seoul result without the flight").
- **Global spillover:** identical web link with localized cards. The spread was a simultaneous 2023–2024 explosion in the West (TikTok/tourism) and China (K-pop), now in a localization phase — not a linear relay.

**Business rules:** do not build retention/commerce before the loop demonstrably spins; do not pay for installs at the top of the funnel (the whole Korean boom was word-of-mouth-led).

Full detail: `docs/research-growth.md`.

---

## 8. Monetization (after scale, never at the reveal)

Pattern across every scaled player: free diagnosis → free result → type-labeled product catalog → commerce attached.

| Option | How it works | When |
|---|---|---|
| Cosmetics affiliate / commerce | Recommend shades in the user's palette; affiliate links; matching discounts | Phase 3 (primary) |
| Retail / B2B embedding | License the diagnosis into stores/kiosks/apps; retailer pays, consumer free | Phase 3 |
| Paid human review | Expert verifies/refines the AI result | Phase 3 |
| Premium diagnostics | Adjacent paid tests (skin type, face shape, wardrobe audit) | Phase 3 |
| Ads | In-feed / reward-based once at scale | Phase 3, never interrupting the reveal |

**Paywall rule:** free the reveal; paywall the depth. The type, best/worst palettes, and share card must stay unlocked.

---

## 9. Risks & honesty rules (design around these now)

The science is fragile and selfie measurement is error-prone:
- "Season" is a convention; national systems disagree; no reliability study exists.
- Smartphone color error is large enough to flip a type (consumer colorimeter apps measured ΔE ≈ 7 vs a spectrophotometer; ΔE 3–5 is already visible).
- Fixed-threshold ITA on uncontrolled images scored 22.9% vs a 51.3% baseline and failed on the darkest skin type.
- A competing app reviewer reported getting six different results back-to-back and called it a scam.

**Rules:**
- Always show **confidence** and a **secondary type** — never one authoritative verdict.
- **Deterministic** output: same photo → same result (prevents the "I got 6 different answers" backlash).
- Frame the reveal as **"less flattering on you"** — blame the color pairing, never the person.
- Worst colors **optional**, shown second.
- No color-psychology claims; use "styling suggestion" language.
- State clearly it is **not a medical diagnosis**.
- **Deep-skin accuracy is a launch gate**, not an afterthought — report error stratified by skin tone.
- Minimize retention of facial images.

**Kill criteria (what must be true):** the card fans out (organic share = majority of new users within a quarter, no paid UA); one result is stable across repeat scans; accuracy holds across skin tones; day-30 retention clears a viable bar.

---

## 10. Scope

**V1 (in):** prep guidance; guided camera with lighting/filter checks; the reveal; type + confidence + secondary types; best/worst/neutral palettes; fashion, makeup, hair, jewelry, glasses, nails; the shareable card; PDF export.

**V1 (out):** product shopping/affiliate; accounts, saved history, profiles; native apps; wardrobe scanning; virtual try-on of own clothes; men's-specific and wedding packages; any social/friend feature.

---

## 11. Platform & tech shape

- **Web app first** (opens as a link, works in any messenger browser) — zero install.
- Later: a **mini-app** inside messenger/super-app rails for even less friction.
- Native apps only once there's a retention reason (history, purchases).
- One codebase, English-first, with type labels and lighting guidance localized per market.
- Face detection/segmentation approach is an implementation detail; constraints are: on-device preferred, low latency, deterministic output, no reliance on a hardware calibration target for the free tier.

---

## 12. Open questions / research gaps

- No public K-factor, CAC, or channel breakdown exists for any personal-color app; all user counts are cumulative, not active.
- 2026 platform hashtag volumes are unknown.
- No validated accuracy benchmark exists for any AI color-analysis tool — judge this on loop mechanics the team can instrument itself.
- The core ML idea (image → nearest model color → season) is **already patented in Korea** (KR20100074412A, KR102289628B1). A freedom-to-operate review is required before building the classifier.

---

## 13. References

- Research report — domain: `docs/research-domain.md`
- Research report — growth: `docs/research-growth.md`
