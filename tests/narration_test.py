"""Recorded narration: steps with a clip play it (and advance when it ends), steps without one fall back to the
browser voice. Needs the e2e servers (tests/restart_mock.sh) and recorded clips for u1l1 (step 2's is hidden to test the fallback)."""
import asyncio
BASE = 'http://localhost:8811/'
CONFIG = "var HW_CONFIG = { siteName: 'Math 10C Practice', backend: 'http://localhost:8765/' };"
async def setup(page, errs):
    page.on('pageerror', lambda e: errs.append('pageerror: ' + str(e)))
    await page.route('**/cdn.jsdelivr.net/**', lambda r: r.abort())
    await page.route('**/cdnjs.cloudflare.com/**', lambda r: r.abort())
    await page.route('**/js/config.js', lambda r: r.fulfill(status=200, content_type='application/javascript', body=CONFIG))
from playwright.async_api import async_playwright
HOOK = """
window.__log = [];
const P = HTMLMediaElement.prototype.play;
HTMLMediaElement.prototype.play = function () { if (this.src) window.__log.push('clip ' + this.src.split('/').pop()); return P.call(this); };
if (window.speechSynthesis) { const S = speechSynthesis.speak.bind(speechSynthesis); speechSynthesis.speak = u => { window.__log.push('tts ' + u.text.slice(0, 30)); return S(u); }; }
"""
async def main():
    errs = []
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required'])
        page = await (await b.new_context(viewport={'width': 1300, 'height': 950})).new_page(); await setup(page, errs)
        await page.add_init_script(HOOK)
        print('AAC support in this browser:', await page.evaluate('''new Audio().canPlayType('audio/mp4; codecs="mp4a.40.2"')''') or 'none')
        # headless Chromium has no AAC decoder, so serve the clips as WAV here (real browsers play the .m4a)
        import os
        wav = open(os.environ.get('TONE', 'tone.wav'), 'rb').read()
        await page.route('**/audio/narration/**', lambda r: r.fulfill(status=200, content_type='audio/wav', body=wav))
        await page.goto(BASE + '?class=10c-b'); await page.wait_for_selector('.name-btn', timeout=10000)
        await page.click('.name-btn:has-text("Ava Brown")')
        pins = page.locator('.field.pin'); await pins.nth(0).fill('1234'); await pins.nth(1).fill('1234')
        await page.click('.btn-primary'); await page.wait_for_selector('.lesson-row')
        await page.click('a.lesson-row'); await page.wait_for_selector('.xcard')
        print('voice button:', await page.inner_text('.xvoice'))
        # pretend step 2 has no recording, to check the fallback to the browser voice
        await page.evaluate("delete HW.narrationClips.u1l1['c39afa38']")
        await page.click('.xplay')
        for _ in range(80):
            await page.wait_for_timeout(500)
            st = await page.inner_text('.xstepno')
            if st.startswith('Step 4'): break
        log = await page.evaluate('window.__log')
        print('reached:', st); print('\n'.join(log))
        await page.click('.xplay')  # pause
        ok = st.startswith('Step 4') and log[0] == 'clip f1681a9d.m4a' and any(x.startswith('tts') for x in log[1:2]) and 'clip 65e7a578.m4a' in log
        print('errors:', errs); print('PASS' if ok and not errs else 'FAIL')
        await b.close()
asyncio.run(main())
