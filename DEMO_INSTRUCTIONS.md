# Demo Recording Instructions

## Quick Demo Flow (30-60 seconds)

### Option 1: Screen Recording (Recommended)

Use **ScreenToGif** (Windows) or **LICEcap** (cross-platform) to record:

1. **Open https://url-shortener-ybpw.onrender.com**

2. **Create a short URL**:
   - Enter: `https://github.com/Rishabh-Baloni/url-shortener`
   - Click "Shorten URL"
   - Show the generated short URL (e.g., `https://url-shortener-ybpw.onrender.com/abc123x`)

3. **Test the redirect**:
   - Copy the short URL
   - Open new tab, paste, press Enter
   - Show redirect to GitHub repo

4. **View statistics**:
   - Click "View Stats" button
   - Show clicks count, timestamps, expiration info

5. **Show dashboard** (optional):
   - Navigate to `/dashboard.html`
   - Show real-time metrics

### Option 2: Animated Screenshots

If you prefer static images, create 3-4 screenshots:

1. **Screenshot 1**: Main page with URL input
2. **Screenshot 2**: Short URL generated with copy button
3. **Screenshot 3**: Stats page showing analytics
4. **Screenshot 4**: Dashboard with metrics

Combine with tools like:
- [Ezgif.com](https://ezgif.com/) (online GIF maker)
- Photoshop (layer animation)

### Tools Recommended

**For GIF Recording**:
- [ScreenToGif](https://www.screentogif.com/) (Windows, free, excellent)
- [LICEcap](https://www.cockos.com/licecap/) (Cross-platform, simple)
- [Kap](https://getkap.co/) (macOS, beautiful)

**For Video → GIF Conversion**:
- [Ezgif Video to GIF](https://ezgif.com/video-to-gif)
- FFmpeg command: 
  ```bash
  ffmpeg -i demo.mp4 -vf "fps=10,scale=800:-1:flags=lanczos" -c:v gif demo.gif
  ```

### Tips for Good Demo GIF

1. **Keep it short**: 10-20 seconds max
2. **High contrast**: Use full-screen browser
3. **Smooth actions**: Don't rush, let viewers see each step
4. **Optimize size**: <5MB for GitHub README embedding
5. **Add subtle border**: Makes GIF stand out in README

### Adding to README

Once you have `demo.gif`:

```bash
# Move to repo root
mv demo.gif url-shortener/

# Update README.md (add after "Live Demo" line)
```

Add this to README:

```markdown
**Live Demo**: [https://url-shortener-ybpw.onrender.com](https://url-shortener-ybpw.onrender.com)

![Demo](./demo.gif)
```

### Example Demo Script

```
[0:00] Open homepage
[0:02] Type: "https://github.com/Rishabh-Baloni/url-shortener"
[0:04] Click "Shorten URL"
[0:06] Show generated URL (highlight with cursor)
[0:08] Click "Copy" button
[0:10] Open new tab, paste short URL
[0:12] Press Enter → redirect to GitHub
[0:14] Go back, click "View Stats"
[0:16] Show analytics (clicks: 1, timestamps)
[0:18] Fade out
```

## Alternative: Static Hero Image

If you prefer a polished static image instead of a GIF:

1. Open https://url-shortener-ybpw.onrender.com
2. Use browser DevTools to set viewport to exactly 1200x630 (Twitter card size)
3. Take screenshot with all UI elements visible
4. Add subtle drop shadow in image editor
5. Name it `hero.png` and add to README

---

**Note**: Demo GIF is optional but highly recommended for recruiter impact. Even a simple 10-second GIF showing "enter URL → get short link → redirect works" adds significant visual appeal to the README.
