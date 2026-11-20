import sys,glob,os,asyncio
from playwright.async_api import async_playwright
from PIL import Image
async def main(src,dst,quality=86):
    os.makedirs(dst,exist_ok=True)
    files=sorted(glob.glob(f'{src}/*.svg'))
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
        pg=await b.new_page(device_scale_factor=1)
        for f in files:
            name=os.path.basename(f)[:-4]
            svg=open(f).read()
            w=512 if name.endswith('-thumb') else 960; h=512 if name.endswith('-thumb') else 540
            await pg.set_viewport_size({'width':w,'height':h})
            await pg.set_content(f'<html><body style="margin:0;background:#000">{svg}</body></html>')
            await pg.wait_for_timeout(60)
            png=f'/tmp/{name}.png'
            await pg.screenshot(path=png,clip={'x':0,'y':0,'width':w,'height':h})
            im=Image.open(png).convert('RGB')
            if name.endswith('-thumb'): im=im.resize((256,256),Image.LANCZOS)
            im.save(f'{dst}/{name}.webp','WEBP',quality=quality,method=6)
        await b.close()
    print('rendered',len(files))
asyncio.run(main(sys.argv[1],sys.argv[2]))
