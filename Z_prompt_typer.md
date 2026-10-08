# Prompt: animate the Napoli sticker into a "bow and kiss" GIF

## Source
- Character: `public/gifs/examples/napoli.png` (135 × 138, transparent PNG). A Facebook "Napolitan" sticker.
- Style references, for motion and feel only: `public/gifs/bugcat-capoo.gif`, `public/gifs/mentori.gif`, `public/gifs/Sinister.gif`.
- Output: `public/gifs/napoli-kiss.gif`.

## The character (keep it exactly like this)
- A round, soft pink dome body, like a scoop of strawberry ice cream. Pastel bubblegum pink (#F7A8D0 to #EE8CC0), with a lighter highlight at the top.
- A thin, soft darker-pink outline. Do not use thick black outlines; this sticker is softer than Capoo.
- Eyes: two happy closed eyes drawn as small sideways chevrons, `>` on the left and `<` on the right, in dark brown/plum.
- Cheeks: a small blush mark under each eye, made of three short diagonal pink strokes.
- Mouth: a small kissy "3"-shaped pucker, slightly right of centre.
- Base: a wavy, golden-brown cookie or waffle-cone skirt around the bottom half. It has scalloped edges and a darker brown outline, with tiny feet just peeking out underneath.
- Same proportions, colours and line weight in every frame. It must still read as the original sticker.

## The animation
One short, loopable action: **stand upright → bow forward → kiss → a heart pops out → stand back up.**

| # | Frames | Duration | What happens |
|---|--------|----------|--------------|
| 1 | 1–2 | 160 ms | **Idle, upright.** Exactly the original sticker pose. Optional tiny breathing (body 1–2% taller in frame 2). |
| 2 | 3 | 80 ms | **Anticipation.** A slight squash: the body gets 4% shorter and 4% wider, and the cookie skirt flares out a little. |
| 3 | 4–5 | 160 ms | **Bend down.** The pink dome tips forward and down toward the viewer, about 20–25°, pivoting where the dome meets the cookie base. The face moves lower and closer, so it looks slightly larger. The base stays planted. |
| 4 | 6 | 80 ms | **Kiss.** The lowest point of the bow. The "3" lips push forward and grow about 20%. The eyes squeeze tighter and the blush gets brighter. |
| 5 | 7–8 | 160 ms | **Heart pops out of the kiss.** A small solid red-pink heart (#FF5C8A, with a darker #E23B6A outline and a white highlight dot top-left) appears right at the lips. Frame 7: tiny, about 15% of the body width. Frame 8: it pops past its final size (about 45% of body width) with a soft overshoot. |
| 6 | 9–10 | 160 ms | **Heart floats.** The heart settles to about 40% of body width, drifts up and slightly to the right, and fades to about 60% opacity. As it rises, the body starts lifting back up. |
| 7 | 11 | 80 ms | **Back upright with a happy bounce.** The body stretches 3% taller, then settles. The heart is mostly faded (about 25% opacity) near the top of the canvas. Optionally, 1–2 tiny sparkles near where the heart was. |
| 8 | 12 | 160 ms | **Rest.** Back to exactly the idle pose of frame 1, with the heart gone, so the loop is seamless. |

Total: 12 frames, about 1.3 s per loop.

## Motion rules
- Squash and stretch on the body only. The cookie base stays solid and planted, and its scallops may wiggle by a pixel or two.
- Ease in when bending down (slow start, fast end) and ease out when coming back up.
- The heart scales from the centre of the lips with a playful overshoot, like Capoo's heart pop.
- Keep the character centred, with the same base position in every frame (no drifting), so it can sit on top of other content.
- No camera movement, no background, no text.

## Output specs
- Format: animated GIF, **looping forever**.
- Canvas: **240 × 240 px**, with the character centred and about 16 px of empty space around it. Leave extra room at the top for the heart to rise.
- Background: **transparent**. Make the edges clean, with no white or grey halo around the outline (no partial-transparency fringe).
- Frame timing: as in the table, where 80 ms is one beat and 160 ms holds a frame for two beats. Use 12 fps if the tool can't vary timing per frame.
- Colour: at most 128 colours; keep the pinks smooth and avoid visible dithering.
- File size: aim for under 150 KB.

## Short version (for a single prompt box)
> Animate this cute pink ice-cream-dome sticker (closed `> <` happy eyes, pink blush lines, "3" kissy lips, wavy golden-brown cookie skirt base) as a 12-frame looping transparent GIF, 240×240. It starts standing upright, squashes slightly, then bows forward about 20° toward the viewer and puckers its lips into a kiss. A red-pink heart pops out of the lips with a bouncy overshoot, floats up and to the right while fading, and the character bounces back upright to the idle pose so the loop is seamless. Keep the exact character design, soft thin outlines and pastel colours; cookie base stays planted; no background, no text; cute LINE/Facebook-sticker style like Capoo.
