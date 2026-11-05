import sys
from PIL import Image
import numpy as np
n=sys.argv[1]
im=Image.open(f'art/c_{n}.png').convert('RGBA');a=np.array(im)[...,3]
cols=np.where(a.max(0)>20)[0];g=np.split(cols,np.where(np.diff(cols)>10)[0]+1);assert len(g)==4,len(g)
for k,x in zip(['front','back','left','right'],g):
    x0,x1=int(x[0]),int(x[-1])+1;r=np.where(a[:,x0:x1].max(1)>20)[0];y0,y1=int(r[0]),int(r[-1])+1
    c=im.crop((x0,y0,x1,y1));s=max(c.size);S=int(s*1.16);o=Image.new('RGBA',(S,S),(0,0,0,0));o.paste(c,((S-c.width)//2,(S-c.height)//2),c);o.save(f'art/{n}_{k}.png')
print('cropped',n)
