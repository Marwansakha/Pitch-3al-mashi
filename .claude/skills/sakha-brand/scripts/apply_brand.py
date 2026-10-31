#!/usr/bin/env python3
"""Apply Marwan Sakha's brand to a video-ad-editor work folder.

Usage: python3 apply_brand.py <work>

Run AFTER video-ad-editor has created <work>/theme.json (00_onboard.py theme <work>)
and copied compose.REFERENCE.html to <work>/compose.html.

It never touches the video-ad-editor skill itself, so skill updates can't undo it.
- theme.json: classic captions, still captions, brand font, light colours, handle.
- compose.html: adds the "classic" caption style (medium white text, black outline).
"""
import json, sys
from pathlib import Path

HERE = Path(__file__).resolve().parent.parent
MARK = "/* sakha-brand: classic */"


def main():
    if len(sys.argv) < 2:
        sys.exit("usage: apply_brand.py <work>")
    work = Path(sys.argv[1])
    prof = json.loads((HERE / "profile" / "profile.json").read_text(encoding="utf-8"))

    # ---- theme.json ----
    tp = work / "theme.json"
    t = json.loads(tp.read_text(encoding="utf-8")) if tp.exists() else {}
    for k, v in prof["identity"]["colors"].items():
        t.setdefault(k, v)
    t["font"] = prof["font"]
    t["handle"] = prof["endCard"]["handle"]
    t["capStyle"] = "classic"
    t["capStill"] = True
    t["pace"] = "calm"
    t["grade"] = False
    t.setdefault("hookZoom", 0)
    tp.write_text(json.dumps(t, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"theme.json: capStyle=classic, capStill, font={t['font']}, pace=calm")

    # ---- compose.html: classic caption style ----
    cp = work / "compose.html"
    if not cp.exists():
        print("compose.html not found yet: copy scripts/compose.REFERENCE.html first, then re-run")
        return 2
    s = cp.read_text(encoding="utf-8")
    if MARK in s:
        print("compose.html: classic style already applied")
        return 0
    size_old = "let FS2=84,"
    draw_old = ("X.fillStyle=(CAPSTYLE==='bar'&&act)?onACC():((i.hot&&sp)?ACC:'#FFFFFF');\n"
                "      X.fillText(i.t,x,cy+lift);")
    if size_old not in s or draw_old not in s:
        print("compose.html: engine code changed (skill update?). The classic style was NOT applied; "
              "fall back to capStyle 'shadow' and tell the user the add-on needs updating.")
        t["capStyle"] = "shadow"
        tp.write_text(json.dumps(t, ensure_ascii=False, indent=2), encoding="utf-8")
        return 3
    s = s.replace(size_old, f"{MARK} let FS2=(CAPSTYLE==='classic'?62:84),", 1)
    s = s.replace(draw_old,
        "if(CAPSTYLE==='classic'){ X.shadowColor='transparent';X.shadowBlur=0;X.shadowOffsetY=0;"
        "X.lineJoin='round';X.miterLimit=2;X.lineWidth=Math.max(6,Math.round(fs*0.15));"
        "X.strokeStyle='#000000';X.strokeText(i.t,x,cy+lift);X.fillStyle='#FFFFFF';X.fillText(i.t,x,cy+lift); }\n"
        "      else { " + draw_old.replace("\n      ", " ") + " }", 1)
    cp.write_text(s, encoding="utf-8")
    print("compose.html: classic caption style added")
    return 0


if __name__ == "__main__":
    sys.exit(main())
