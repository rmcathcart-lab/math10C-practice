"""The lesson sidebar's "Go to the lesson" link: uses the block set for the class (beats the letter in the code),
points at the right lesson page, and is absent for lessons the teaching site doesn't have yet.
Needs python3 -m http.server 8811 and a fresh mock (tests/restart_mock.sh)."""
import asyncio, urllib.request
from playwright.async_api import async_playwright
BASE = 'http://localhost:8811/'; MOCK = 'http://localhost:8765/'
CONFIG = "var HW_CONFIG = { siteName: 'Math 10C Practice', backend: '%s' };" % MOCK
async def main():
    urllib.request.urlopen(MOCK + '?action=setblock&key=testkey&class=10c-b&block=C').read()
    errs = []
    async with async_playwright() as p:
        b = await p.chromium.launch(); page = await (await b.new_context(viewport={'width': 1300, 'height': 950})).new_page()
        page.on('pageerror', lambda e: errs.append(str(e)))
        await page.route('**/cdn.jsdelivr.net/**', lambda r: r.abort())
        await page.route('**/js/config.js', lambda r: r.fulfill(status=200, content_type='application/javascript', body=CONFIG))
        await page.goto(BASE + '?class=10c-b'); await page.wait_for_selector('.name-btn', timeout=10000)
        await page.click('.name-btn:has-text("Ben Lee")')
        pins = page.locator('.field.pin'); await pins.nth(0).fill('4321'); await pins.nth(1).fill('4321')
        await page.click('.btn-primary'); await page.wait_for_selector('.lesson-row')
        out = {}
        for lid in ['u1l1', 'u1l6a', 'u2l1']:
            await page.evaluate("location.hash = '#/lesson/%s'" % lid); await page.wait_for_selector('.qcard'); await page.wait_for_timeout(300)
            out[lid] = await page.evaluate("(document.querySelector('.qnav a.teach-link')||{}).href || null")
        print(out)
        await page.evaluate("location.hash = '#/lesson/u1l1'"); await page.wait_for_timeout(400)
        await page.screenshot(path='/tmp/teach_link.png', clip={'x': 0, 'y': 0, 'width': 1300, 'height': 600})
        await page.set_viewport_size({'width': 390, 'height': 800}); await page.evaluate("location.hash = '#/lesson/u1l2'"); await page.wait_for_timeout(500)
        await page.screenshot(path='/tmp/teach_link_phone.png')
        ok = out == {'u1l1': 'https://rmcathcart-lab.github.io/math10c-teaching/u1/l1/?class=C',
                     'u1l6a': 'https://rmcathcart-lab.github.io/math10c-teaching/u1/l6a/?class=C', 'u2l1': None}
        print('errors:', errs); print('PASS' if ok and not errs else 'FAIL')
        await b.close()
asyncio.run(main())
