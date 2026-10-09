# ChatGPT prompt (attempt 2): fix the baby on dad's shoulders in the family silhouette

## What went wrong last time
I asked ChatGPT to (A) show the baby's body outline over dad's head and (B) hide the baby's feet. The result was wrong in two ways:
1. **The baby's legs were deleted** (not only the feet). They must stay.
2. **The line on dad's head was just a flat curved line.** It must be the **baby's back and bottom**: a U-shaped outline, narrower than dad's head, so it is clear her bottom sits in front of his head.

## How to use
1. Open a **new ChatGPT chat** (a model with image generation).
2. **Attach these 3 images** from `chatgpt-references/` (in this order):
   - `reference-8-base-silhouette.png`: **IMAGE 1 = the picture to edit.** It still has the baby's legs and feet.
   - `reference-9-fix-guide.png`: **IMAGE 2 = a guide.** The same picture with coloured marks: green = line to ADD, red X = feet to REMOVE, blue = legs to KEEP, yellow = hair to KEEP. Do not copy the marks, text or dark background.
   - `reference-10-wrong-attempt.png`: **IMAGE 3 = the WRONG result from last time.** Shown only so ChatGPT knows what NOT to do.
3. Paste everything between PROMPT STARTS HERE and PROMPT ENDS HERE.
4. If it still fails, don't argue in one big message: use **Plan B** (two separate small edits) below.

---

## PROMPT STARTS HERE

I attached 3 images:
- **Image 1:** my family silhouette. **Edit this one.** Output must be this same picture with only the small edits below.
- **Image 2:** the same picture with coloured marks showing the edits (green, red, blue, yellow). Guide only. Do not copy the marks, labels or the dark background.
- **Image 3:** a WRONG attempt from before. Do not do what it does (explained at the end).

**Important:** do NOT redraw or regenerate the picture. Keep every pixel outside the edited area exactly as in Image 1. The edit happens only in the small area where the baby sits on dad's shoulders, roughly between 37% and 60% of the image width and 19% to 42% of the image height.

### The scene (seen from behind)
Dad stands in the middle with both arms raised, holding the hands of a baby girl who sits on his shoulders. Mum hugs him on the right. The baby sits **behind dad's head** (closer to us). Her bottom rests on top of his head and shoulders, and her legs go down on both sides of his neck.

### Edit 1 (green in Image 2): draw the baby's BACK and BOTTOM outline over dad's head
- Dad's head is the round shape with spiky hair just below the baby's body. The baby's bottom overlaps the upper middle of it.
- Draw the baby's back and bottom as a **U-shaped glowing outline**:
  - **Two side lines** that continue straight down from the two sides of the baby's back (starting exactly where her back meets dad's hair), running down over dad's head,
  - then a **smooth round curve underneath** that goes around her bottom. The lowest point of the curve is near the bottom of dad's head.
- The U is **narrower than dad's head** (about 80% of its width). So **dad's spiky hair stays visible on both sides of the baby's bottom** (yellow in Image 2) and a little below it.
- The top ends of the U connect smoothly to the baby's existing outline, with no gaps and no loose line ends.
- Use **exactly the same line style as the other outlines** in the picture: thin bright white-pink line with the same soft pink glow, same thickness, same brightness.

### Edit 2 (red X in Image 2): remove the baby's FEET only
- Delete the **two small foot shapes** at the bottom of the baby's legs, together with their glowing outline rings (the two small rounded shapes marked with red X).
- The legs must **end by disappearing behind dad's shoulders**: the leg outline simply merges into dad's shoulder outline. No foot, no ankle, no toes, no separate ring, no little gap, no extra outline line.
- Fill the freed spot with dad's solid shoulder colour (the same dark plum as the rest of his body).

### Keep exactly as in Image 1 (blue and yellow in Image 2, and everything else)
- **Both baby legs** (the chubby thighs and lower legs hanging on either side of dad's neck, with their outlines and the thin gaps between legs and neck). **Do not remove, shrink or change them.** They are marked in blue.
- Dad's spiky hair at the sides of the baby's bottom (yellow).
- The baby's head, her ahoge (the hooked strand of hair), her arms and hands.
- The transparent holes between dad's raised arms and the baby (they must stay see-through).
- Mum, her hair bun, her dress, her arm around dad's waist.
- Dad's arms, legs and shoes.
- The glow style, the colours, and the thickness of all other outlines (do not make the glow thicker or pinker).
- Image size and the position of every figure.

### What the WRONG attempt (Image 3) did. Do NOT repeat it:
- It **deleted the baby's legs** as well as the feet.
- It drew only a **flat curved line** across dad's head instead of the baby's back and bottom outline.
- It made the **glow thicker and more blotchy**, with stray pink/magenta speckles at the edges.

### Output
- **PNG**, same size as Image 1 (1024 x 1024), **transparent background**.
- No marks, labels, circles, text or watermark.

## PROMPT ENDS HERE

---

## Plan B: two small edits, one at a time
Models follow small edits much better than one long list. If the big prompt fails, start again from Image 1 and send these as two separate messages (attach Image 1 and Image 2 again each time):

**Message 1 (feet only):**
> Edit Image 1. Only remove the baby's two small FEET and their outline rings (red X in Image 2). Keep both baby legs exactly as they are; they should simply end by disappearing behind dad's shoulders, merging into the shoulder outline. Fill the spot with dad's solid dark plum. Change nothing else. Do not regenerate the picture. PNG, same size, transparent background.

**Message 2 (back and bottom outline), sent after message 1 worked:**
> Now, on this result, add one thing: a U-shaped glowing outline for the baby's back and bottom, over dad's head (green in Image 2). Two lines continue straight down from the sides of her back over dad's head, then a smooth round curve goes under her bottom. It is about 80% as wide as dad's head, so his spiky hair stays visible on both sides. Same thin bright white-pink line and soft glow as the other outlines. Change nothing else: keep the legs, the hair, the holes between the arms, and the glow style. PNG, same size, transparent background.

## Quick checklist to judge a result
1. **Both baby legs are still there**, running down over dad's shoulders.
2. **No foot shapes or foot rings**: the legs vanish behind the shoulders.
3. **A U-shaped outline** (two sides plus a round bottom) over dad's head. It is **not** a flat arc and **not** a dome.
4. Dad's spiky hair is visible **on both sides** of the baby's bottom.
5. The two holes between dad's arms and the baby are still **see-through**.
6. The glow looks the same as before: **thin white line, soft pink halo, no speckles**.

## After you get a result
Save it as `public/images/family-fireworks-chatgpt.png` (so nothing is overwritten) and tell me. I'll show it in the app next to my own version, so you can compare them.
