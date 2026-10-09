import asyncio, sys, os
from playwright.async_api import async_playwright
OUT=os.environ.get('SHOTS','/tmp/shots'); os.makedirs(OUT,exist_ok=True)
BASE=os.environ.get('BASE','http://localhost:8811/')
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch()
        pg=await b.new_page(viewport={'width':1300,'height':900})
        errs=[]
        pg.on('pageerror',lambda e: errs.append(str(e)))
        pg.on('console',lambda m: errs.append('console:'+m.text) if m.type=='error' else None)
        await pg.route('**/cdn.jsdelivr.net/**', lambda r: r.abort())
        await pg.goto(BASE)
        await pg.wait_for_selector('#nm',timeout=8000)
        await pg.fill('#nm','Test Student'); await pg.keyboard.press('Enter')
        await pg.wait_for_selector('.lesson-row')
        await pg.screenshot(path=OUT+'/home.png',full_page=True)
        await pg.click('a.lesson-row')
        await pg.wait_for_selector('.qcard')
        await pg.screenshot(path=OUT+'/q1a.png',full_page=True)
        # answer 1a correctly from instance key
        key=await pg.evaluate("(()=>{var c=HW.App.cur();return c.inst.key})()")
        for v in key:
            await pg.fill('.chip-input',str(v)); await pg.keyboard.press(',')
        await pg.click('.btn-check')
        await pg.wait_for_selector('.feedback.good')
        await pg.screenshot(path=OUT+'/q1a_done.png',full_page=True)
        print('errors',errs)
        await b.close()
asyncio.run(main())
