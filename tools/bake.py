# Bakes raw ChatGPT art into game-ready webp under lumiria-prototype/assets
import sys,numpy as np
from pathlib import Path
from PIL import Image,ImageFilter
ROOT=Path(__file__).resolve().parents[1];A=ROOT/'_src'/'art';O=ROOT/'assets';(O/'world').mkdir(parents=True,exist_ok=True)
S=4 # art px per game px
def trim(i):
    b=i.getchannel('A').point(lambda v:255 if v>16 else 0).getbbox();return i.crop(b)
def clean(i):
    a=np.array(i);m=a[...,3]<12;a[m]=0;return Image.fromarray(a)
def save(i,n):
    i.save(O/'world'/f'{n}.webp',quality=88,method=6,exact=False);print(n,i.size)
def bld(src,n,w_tiles):
    i=clean(trim(Image.open(A/f'{src}.png').convert('RGBA')));W=int(w_tiles*16*S);H=round(i.height*W/i.width);save(i.resize((W,H),Image.LANCZOS),n)
def props(src,n,boxes):
    i=Image.open(A/f'{src}.png').convert('RGBA');a=np.array(i)[...,3]>16
    from scipy import ndimage as ndi
    l,c=ndi.label(ndi.binary_dilation(a,iterations=6));objs=ndi.find_objects(l)
    objs=[o for o in objs if (o[0].stop-o[0].start)*(o[1].stop-o[1].start)>2000]
    # sort rows then cols
    objs.sort(key=lambda o:(round(o[0].start/ (i.height/ (2 if len(objs)>3 else 1))),o[1].start))
    assert len(objs)==len(boxes),len(objs)
    for o,(name,wpx) in zip(objs,boxes):
        c=clean(trim(i.crop((o[1].start,o[0].start,o[1].stop,o[0].stop))));W=int(wpx*S);H=round(c.height*W/c.width);save(c.resize((W,H),Image.LANCZOS),name)
def tex(src,n,sat=1.0,hue=None,val=1.0,size=512):
    i=Image.open(A/f'{src}.png').convert('RGB');s=i.width
    # force seamless: crossfade border
    a=np.array(i).astype(float);m=s//8;r=np.roll(np.roll(a,s//2,0),s//2,1)
    w=np.minimum(np.minimum(np.arange(s),np.arange(s)[::-1]),m)/m
    W=np.minimum.outer(w,w)[...,None];a=a*W+r*(1-W)
    img=Image.fromarray(a.astype('uint8')).resize((size,size),Image.LANCZOS)
    if sat!=1 or val!=1:
        h=np.array(img.convert('HSV')).astype(float);h[...,1]*=sat;h[...,2]=np.clip(h[...,2]*val,0,255)
        if hue is not None:h[...,0]=h[...,0]*.25+hue*.75
        img=Image.fromarray(h.astype('uint8'),'HSV').convert('RGB')
    img.save(O/'world'/f'{n}.webp',quality=86,method=6);print(n,img.size)
bld('b_guild','guild',9);bld('b_kuil','kuil',12);bld('b_smith','smith',7);bld('b_cook','cook',7);bld('b_house1','house1',4.6)
bld('p_fountain','fountain',5.2)
props('p_sheet1','_',[('tree',48),('cypress',22),('rose',28),('lamp',8),('bench',26),('board',32)])
props('p_stalls','_',[('stall1',52),('stall2',52),('stall3',52)])
tex('t_grass','grass',sat=.62,hue=62,val=.97);tex('t_path','path');tex('t_plaza','plaza',sat=.5,val=1.03);tex('t_water','water',sat=.8);tex('t_dirt','dirt',sat=.55,val=1.02)
# rooms: stretched exactly to the logical room size
(O/'rooms').mkdir(exist_ok=True)
for f in sorted((A.parent/'rooms').glob('*.png')):
    src=A/f'r_{f.stem}.png'
    if not src.exists(): print('missing',f.stem); continue
    p=Image.open(f);w,h=p.size
    Image.open(src).convert('RGB').resize((w,h),Image.LANCZOS).save(O/'rooms'/f'{f.stem}.webp',quality=84,method=6)
