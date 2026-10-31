---
name: sakha-brand
description: Marwan Sakha's (@sakhamarwan) brand kit and editing preferences for reels. Use together with video-ad-editor, motion-video, podcast-video, montage-video or thumbnail-video whenever editing a video, reel, cover or thumbnail for Marwan, and before writing theme.json or fixes.json. Overrides those skills' defaults for colours, captions, music, pace and dialect.
---

# Marwan Sakha: brand kit and editing preferences

Arabic business and AI content, Jordanian dialect, Instagram @sakhamarwan.
This add-on sits on top of the `video-ad-editor` skills (majedphotos/video-ad-editor).
It never edits those skills, so their updates can't undo it.

## How to apply (every video)

0. If `video-ad-editor` isn't installed (fresh cloud session), install it first:
   ```bash
   GIT_LFS_SKIP_SMUDGE=1 git clone --depth 1 https://github.com/majedphotos/video-ad-editor /tmp/vae
   for s in video-ad-editor motion-video podcast-video montage-video thumbnail-video; do
     rm -rf ~/.claude/skills/$s; cp -r /tmp/vae/$s ~/.claude/skills/$s; done
   bash ~/.claude/skills/video-ad-editor/scripts/00_setup.sh --install
   ```
   Skills installed mid-session load on the next turn.

1. Point the skill at this saved profile instead of asking the onboarding questions:
   ```bash
   export VAE_HOME="$CLAUDE_SKILL_DIR/profile"   # holds profile.json
   ```
   With that set, `00_onboard.py show` prints the profile, so skip the onboarding page and
   the colour question. Say one line: "ماشي على هويتك: خلفية فاتحة، كابشن أبيض بحد أسود، بلا موسيقى."
2. Run the skill's normal steps. After `00_onboard.py theme <work>` and after copying
   `compose.REFERENCE.html` to `<work>/compose.html`, run:
   ```bash
   python3 "$CLAUDE_SKILL_DIR/scripts/apply_brand.py" <work>
   ```
   Exit code 3 means the engine changed after a skill update. Captions fall back to `shadow`;
   tell Marwan the add-on needs a small update.
3. When writing `fixes.json`, follow `dialect.md` (Jordanian spelling).

## Brand

| | |
|---|---|
| Background | `#F8F6F1` warm off-white |
| Text | `#0D0D0D` near-black |
| Accent | `#B8842C` amber (brand bright amber `#EFAE3E` for large shapes only; it is too light for text on off-white) |
| Second accent | `#D9603A` coral |
| Muted | `#7A7670` |
| Font | IBM Plex Sans Arabic |
| Handle | @sakhamarwan |
| Logo | none yet |

## Editing preferences

- **Captions:** classic. Medium-size white text with a black outline, no card, no bouncing
  (`capStyle: classic`, `capStill: true`). Short phrases, centred in the lower third, inside
  Instagram's safe zone (clear of the bottom ~250px and the right-side buttons).
- **Pace:** calm (`pace: calm`). Still cut every silence, breath and filler word: no dead air.
  Gentle zooms rather than rapid punch-ins.
- **Hook:** first 2 seconds, with no intro or logo. A slow push-in on his face is fine; no hard punch.
- **Music:** none. Voice only, always clear. Subtle whoosh or click sounds on cuts to the screen
  are fine (`sfx: on`).
- **Colour:** natural. No heavy filters or grading.
- **Ending:** when he says "follow me" or "تابعني", show a small "تابعني" cue and @sakhamarwan.
- **Format:** 1080x1920, 30fps, H.264 MP4, usually 30 seconds or less.
- **Screen visuals:** prefer his real screen recordings and screenshots, with Ken Burns zooms,
  picture-in-picture or split screen, and a subtle highlight on the key line. Blur emails, card
  numbers, amounts and personal names. If real footage is missing, designed illustrative screens
  are OK, but tag them "مشهد توضيحي" and never use real app logos, stock robots or "AI brains".
- **Deliverables:** `reel-final.mp4`, `cover.jpg` from the hook moment with a short bold Arabic
  title, and a short list of which footage went where.
