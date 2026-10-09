"""End-to-end: student signs in with the mock ledger, answers questions of every input type (right, wrong, hints,
format nudges, ladder, tree, reveal), leaves the page (new numbers), then the teacher dashboard is checked.
Needs: python3 -m http.server 8811 (repo root) and node backend/mock_server.js 8765."""
import asyncio, os, json, urllib.request
from playwright.async_api import async_playwright
OUT = os.environ.get('SHOTS', '/tmp/shots'); os.makedirs(OUT, exist_ok=True)
BASE = 'http://localhost:8811/'; MOCK = 'http://localhost:8765/'
CONFIG = "var HW_CONFIG = { siteName: 'Math 10C Practice', backend: '%s' };" % MOCK

def stats(): return json.loads(urllib.request.urlopen(MOCK + '__stats').read())

async def setup(page, errs):
    page.on('pageerror', lambda e: errs.append('pageerror: ' + str(e)))
    page.on('console', lambda m: errs.append('console: ' + m.text) if m.type == 'error' and 'jsdelivr' not in m.text and 'ERR_FAILED' not in m.text else None)
    await page.route('**/cdn.jsdelivr.net/**', lambda r: r.abort())
    await page.route('**/cdnjs.cloudflare.com/**', lambda r: r.abort())
    await page.route('**/js/config.js', lambda r: r.fulfill(status=200, content_type='application/javascript', body=CONFIG))

async def inst(page): return await page.evaluate("HW.App.cur().inst ? {key: HW.App.cur().inst.key, type: HW.App.cur().inst.input.type, n: HW.App.cur().inst.input.n, opts: HW.App.cur().inst.input.options} : null")
async def goto_item(page, id): await page.evaluate("location.hash = '#/lesson/u1l1/%s'" % id); await page.wait_for_timeout(250)
async def fb(page): return await page.evaluate("(document.querySelector('.qcard .feedback')||{}).className + ' | ' + ((document.querySelector('.qcard .feedback')||{}).innerText||'')")

async def answer(page, i, right=True):
    t = i['type']; key = i['key']
    if t == 'list':
        vals = key if right else key[:-1] + [9999]
        for v in vals: await page.fill('.chip-input', str(v)); await page.keyboard.press(',')
    elif t == 'number':
        await page.fill('.w-number input', key if right else str(int(float(key)) + 1))
    elif t == 'math':
        await page.fill('.w-math input', key.replace('\\times ', '*').replace('^{', '^').replace('}', '') if right else '2*3')
    elif t == 'mc':
        k = key if right else [o['key'] for o in i['opts'] if o['key'] != key][0]
        await page.click('.mc-opt:has(.mc-key:text-is("%s"))' % k)
    elif t == 'classify':
        if right and key['choice'] == 'prime': await page.click('.cls-btn:has-text("Prime")')
        elif right: await page.click('.cls-btn:has-text("Composite")'); ins = page.locator('.cls-proof input'); await ins.nth(0).fill(key['a']); await ins.nth(1).fill(key['b'])
        else: await page.click('.cls-btn:has-text("%s")' % ('Composite' if key['choice'] == 'prime' else 'Prime'))
        if not right and key['choice'] == 'prime': ins = page.locator('.cls-proof input'); await ins.nth(0).fill('3'); await ins.nth(1).fill('7')
    elif t == 'select':
        for v in key: await page.click('.sel-chip >> text="%s"' % v)
    elif t == 'pairs':
        for j, p in enumerate(key if right else key[1:]):
            rows = page.locator('.pair-row')
            if await rows.count() <= j: await page.click('text=+ Add another pair')
            r = page.locator('.pair-row').nth(j); ins = r.locator('input'); await ins.nth(0).fill(p[0]); await ins.nth(1).fill(p[1])
    await page.click('.btn-check')
    await page.wait_for_timeout(200)

async def ladder(page, n, mistakes=True):
    import math
    def spf(x):
        p = 2
        while p * p <= x:
            if x % p == 0: return p
            p += 1
        return x
    cur = n; first = True
    while cur > 1:
        d = spf(cur)
        if mistakes and first:
            await page.fill('.ldiv input', '4'); await page.fill('.lnum input', str(cur // 4 if cur % 4 == 0 else 1)); await page.click('.lgo'); await page.wait_for_timeout(150)
            print('   ladder step hint:', (await fb(page))[:120])
            first = False
        await page.fill('.ldiv input', str(d)); await page.fill('.lnum input', str(cur // d)); await page.click('.lgo'); await page.wait_for_timeout(120)
        cur //= d

async def tree(page, n):
    def spf(x):
        p = 2
        while p * p <= x:
            if x % p == 0: return p
            p += 1
        return x
    for _ in range(40):
        opens = page.locator('.tlabel.open')
        if await opens.count() == 0: break
        lab = opens.first; v = int(await lab.get_attribute('data-v'))
        await lab.click(); await page.wait_for_timeout(80)
        p = spf(v)
        if p == v: await page.click('.tcircle')
        else:
            ins = page.locator('.tsplit input'); await ins.nth(0).fill(str(p)); await ins.nth(1).fill(str(v // p)); await page.click('.tsplit .btn')
        await page.wait_for_timeout(80)

async def main():
    errs = []
    async with async_playwright() as p:
        b = await p.chromium.launch()
        ctx = await b.new_context(viewport={'width': 1300, 'height': 950})
        page = await ctx.new_page(); await setup(page, errs)
        await page.goto(BASE + '?class=10c-b')
        await page.wait_for_selector('.name-btn', timeout=10000)
        await page.screenshot(path=OUT + '/e2e_names.png')
        await page.click('.name-btn:has-text("Ava Brown")')
        pins = page.locator('.field.pin'); await pins.nth(0).fill('1234'); await pins.nth(1).fill('1234')
        await page.click('.btn-primary'); await page.wait_for_selector('.lesson-row')
        await page.click('a.lesson-row'); await page.wait_for_selector('.qcard')

        # 1a right first try
        await answer(page, await inst(page)); print('1a', (await fb(page))[:60])
        # 1b wrong, then right
        await goto_item(page, '1b'); i = await inst(page); await answer(page, i, False); print('1b wrong ->', (await fb(page))[:160])
        await page.click('.chip >> nth=-1'); await page.fill('.chip-input', str(i['key'][-1])); await page.keyboard.press(','); await page.click('.btn-check'); await page.wait_for_timeout(200); print('1b fixed ->', (await fb(page))[:60])
        # 2e number: wrong (count-2) then right
        await goto_item(page, '2e'); i = await inst(page); await page.fill('.w-number input', str(int(i['key']) - 2)); await page.click('.btn-check'); await page.wait_for_timeout(150); print('2e wrong ->', (await fb(page))[:160])
        await page.fill('.w-number input', i['key']); await page.click('.btn-check'); await page.wait_for_timeout(150)
        # 3a select
        await goto_item(page, '3a'); await answer(page, await inst(page)); print('3a', (await fb(page))[:40])
        # 4h classify: say prime (wrong), then composite without proof (form), then right
        await goto_item(page, '4h'); i = await inst(page); await page.click('.cls-btn:has-text("Prime")'); await page.click('.btn-check'); await page.wait_for_timeout(150); print('4h wrong ->', (await fb(page))[:160])
        await page.click('.cls-btn:has-text("Composite")'); await page.click('.btn-check'); await page.wait_for_timeout(150); print('4h no proof ->', (await fb(page))[:120])
        ins = page.locator('.cls-proof input'); await ins.nth(0).fill(i['key']['a']); await ins.nth(1).fill(i['key']['b']); await page.click('.btn-check'); await page.wait_for_timeout(150); print('4h ->', (await fb(page))[:40])
        await page.screenshot(path=OUT + '/e2e_4h.png', full_page=True)
        # 5 pairs
        await goto_item(page, '5'); await answer(page, await inst(page)); print('5', (await fb(page))[:40])
        # 6c product with a format problem (commas) then wrong composite then right
        await goto_item(page, '6c'); i = await inst(page)
        await page.fill('.w-math input', '2, 5, 5'); await page.click('.btn-check'); await page.wait_for_timeout(150); print('6c commas ->', (await fb(page))[:140])
        await answer(page, i); print('6c', (await fb(page))[:40])
        # 8a mc wrong twice -> reveal
        await goto_item(page, '8a'); i = await inst(page)
        wrongs = [o['key'] for o in i['opts'] if o['key'] != i['key']]
        await page.click('.mc-opt:has(.mc-key:text-is("%s"))' % wrongs[0]); await page.click('.btn-check'); await page.wait_for_timeout(150); print('8a wrong ->', (await fb(page))[:140])
        await page.click('.mc-opt:has(.mc-key:text-is("%s"))' % wrongs[1]); await page.click('.btn-check'); await page.wait_for_timeout(250); print('8a reveal ->', (await fb(page))[:80])
        await page.screenshot(path=OUT + '/e2e_reveal.png', full_page=True)
        await page.click('text=Try a new version'); await page.wait_for_timeout(200); await answer(page, await inst(page)); print('8a after new version', (await fb(page))[:40])
        # 9a ladder with a mistake
        await goto_item(page, '9a'); i = await inst(page); await ladder(page, i['n']); await page.screenshot(path=OUT + '/e2e_ladder.png', full_page=True)
        await page.fill('.ladder-final input', i['key']['final'].replace('\\times ', '*').replace('^{', '^').replace('}', '')); await page.click('.btn-check'); await page.wait_for_timeout(200); print('9a', (await fb(page))[:40])
        # 10d factor tree
        await goto_item(page, '10d'); i = await inst(page); await tree(page, i['n']); await page.screenshot(path=OUT + '/e2e_tree.png', full_page=True)
        await page.fill('.ladder-final input', i['key']['final'].replace('\\times ', '*').replace('^{', '^').replace('}', '')); await page.click('.btn-check'); await page.wait_for_timeout(200); print('10d', (await fb(page))[:40])
        # 16 NR wrong (p+q) then right
        await goto_item(page, '16'); i = await inst(page); await answer(page, i, False); print('16 wrong ->', (await fb(page))[:140]); await page.fill('.w-number input', i['key']); await page.click('.btn-check'); await page.wait_for_timeout(150)
        # leave the page during 11c
        await goto_item(page, '11c'); before = await page.evaluate("HW.App.cur().inst.prompt")
        await page.evaluate("Object.defineProperty(document,'hasFocus',{value:()=>false,configurable:true}); window.dispatchEvent(new Event('blur'))"); await page.wait_for_timeout(1700)
        await page.evaluate("Object.defineProperty(document,'hasFocus',{value:()=>true,configurable:true}); window.dispatchEvent(new Event('focus'))"); await page.wait_for_timeout(300)
        after = await page.evaluate("HW.App.cur().inst.prompt"); notice = await page.evaluate("(document.querySelector('.notice.warn')||{}).innerText")
        print('leave: before', before, 'after', after, '| notice:', (notice or '')[:80])
        await page.screenshot(path=OUT + '/e2e_leave.png', full_page=True)
        # an extra practice item
        await goto_item(page, 'e9a'); await answer(page, await inst(page)); print('e9a', (await fb(page))[:40])
        # calculator
        await page.click('.top-calc'); await page.wait_for_selector('.calc:not(.hidden)')
        for k in ['7', '6', '5', '0', 'div', '2', 'enter']:
            await page.click('.ck[data-a="%s"]' % k)
        print('calc:', await page.inner_text('.calc-l1'), '=', await page.inner_text('.calc-l2'))
        await page.screenshot(path=OUT + '/e2e_calc.png')
        await page.click('.calc-close')
        # flush and home
        await page.evaluate("HW.Ledger.flush()"); await page.wait_for_timeout(800)
        await page.click('.crumb a'); await page.wait_for_selector('.lesson-row'); await page.screenshot(path=OUT + '/e2e_home.png')

        # second device: sign in with the PIN and see progress
        p2 = await ctx.browser.new_page(); await setup(p2, errs)
        await p2.goto(BASE + '?class=10c-b'); await p2.wait_for_selector('.name-btn'); await p2.click('.name-btn:has-text("Ava Brown")')
        await p2.fill('.field.pin', '9999'); await p2.click('.btn-primary'); await p2.wait_for_timeout(300); print('bad pin ->', await p2.inner_text('.form-err'))
        await p2.fill('.field.pin', '1234'); await p2.click('.btn-primary'); await p2.wait_for_selector('.lesson-row'); await p2.wait_for_timeout(800)
        print('device 2 counts:', await p2.inner_text('.lr-counts'))

        s = stats()['sheets']
        print('sheets rows:', {k: len(v) for k, v in s.items()})
        print('verdicts:', sorted(set(r[11] for r in s['Attempts'][1:])))
        print('events:', [r[5] for r in s['Events'][1:]])

        # teacher dashboard
        t = await ctx.browser.new_page(viewport={'width': 1400, 'height': 1000}); await setup(t, errs)
        await t.goto(BASE + 'teacher/'); await t.evaluate("localStorage.setItem('hw:tkey','testkey'); localStorage.setItem('hw:ttab','live')"); await t.goto(BASE + 'teacher/')
        await t.wait_for_selector('.tbl.live', timeout=10000); await t.screenshot(path=OUT + '/dash_live.png', full_page=True)
        for tab in ['Progress', 'Outcomes', 'Questions', 'Settings']:
            await t.click('.tab:text-is("%s")' % tab); await t.wait_for_timeout(300)
            if tab == 'Questions':
                await t.click('.irow >> nth=1'); await t.wait_for_timeout(200)
            await t.screenshot(path=OUT + '/dash_%s.png' % tab.lower(), full_page=True)
        await t.click('.tab:text-is("Progress")'); await t.click('.slink:has-text("Ava Brown")'); await t.wait_for_selector('.tbl.att', timeout=8000); await t.screenshot(path=OUT + '/dash_student.png', full_page=True)
        print('ERRORS:', errs)
        await b.close()
asyncio.run(main())
