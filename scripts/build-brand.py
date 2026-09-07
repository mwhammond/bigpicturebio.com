"""Rebuild deterministic brand assets. Requires fonttools, uharfbuzz, Pillow, rsvg-convert."""
from pathlib import Path
import io, subprocess, zipfile, json
import uharfbuzz as hb
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.svgPathPen import SVGPathPen
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'assets/brand'
INK, PAPER, DARK = '#3D1830', '#F3EDE2', '#29121F'
COLORS = ['#EB83AC', '#ED906F', '#A86693']
PATHS = ['M0 0C43 0 63 22 89 69C119 124 139 178 200 200H0Z',
         'M0 59C43 55 67 80 96 121C126 164 153 192 200 200H0Z',
         'M0 122C39 118 67 135 100 160C135 187 160 198 200 200H0Z']

def mark(x=0, y=0, size=200, mono=None):
    return f'<g transform="translate({x} {y}) scale({size/200})">' + ''.join(f'<path fill="{mono or c}" d="{p}"/>' for c,p in zip(COLORS,PATHS)) + '</g>'

def shape(text, italic=False):
    font = instantiateVariableFont(TTFont(OUT/'fonts'/f'SourceSerif4-{"Italic" if italic else "Regular"}.ttf'), {'wght':400,'opsz':32}, inplace=False)
    data=io.BytesIO(); font.save(data)
    hf=hb.Font(hb.Face(data.getvalue())); hf.scale=(1000,1000)
    buf=hb.Buffer(); buf.add_str(text); buf.guess_segment_properties(); hb.shape(hf,buf)
    gs=font.getGlyphSet(); order=font.getGlyphOrder(); x=0; pieces=[]
    for info,pos in zip(buf.glyph_infos,buf.glyph_positions):
        pen=SVGPathPen(gs); gs[order[info.codepoint]].draw(pen)
        pieces.append(f'<path transform="translate({x+pos.x_offset} {pos.y_offset})" d="{pen.getCommands()}"/>')
        x+=pos.x_advance
    return ''.join(pieces),x,font['OS/2'].sCapHeight

regular, rw, cap = shape('Big Picture ')
italic, iw, _ = shape('Bio',True)
S=100/cap; W=100+38+(rw+iw)*S; H=170
def logo(x=0,y=0,width=W,light=False,mono=False,large=False):
    color=PAPER if light else INK
    factor=width/W
    return f'<g transform="translate({x} {y}) scale({factor})">'+mark(0,10,100, color if mono else None)+f'<g fill="{color}" transform="translate(138 110) scale({S} {-S})">{regular}<g transform="translate({rw} 0)">{italic}</g></g></g>'

def svg(w,h,content,bg=None):
    return f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}" role="img" aria-label="Big Picture Bio"><title>Big Picture Bio</title>'+ (f'<path fill="{bg}" d="M0 0H{w}V{h}H0Z"/>' if bg else '')+content+'</svg>'

def save(name,w,h,content,bg=None,png=None,pdf=False):
    p=OUT/name; p.parent.mkdir(parents=True,exist_ok=True); p.write_text(svg(w,h,content,bg))
    if png:
        subprocess.run(['rsvg-convert','-w',str(png),'-o',str(p.with_suffix('.png')),str(p)],check=True)
    if pdf:
        subprocess.run(['rsvg-convert','-f','pdf','-o',str(p.with_suffix('.pdf')),str(p)],check=True)
    return p

for theme in ['plum','ivory','mono-plum','mono-ivory']:
    save(f'logos/logo-{theme}.svg',W,H,logo(light='ivory' in theme,mono='mono' in theme),png=3200)
for theme,color in [('colour',None),('plum',INK),('ivory',PAPER)]:
    save(f'marks/mark-{theme}.svg',200,200,mark(mono=color),png=1600)

save('web/favicon.svg',200,200,mark())
for size in [16,32,48,180,192,512]:
    p=save(f'web/icon-{size}.svg',200,200,mark(22,22,156),PAPER,png=size)
    if size not in [180,512]: p.unlink()
im=Image.open(OUT/'web/icon-512.png')
im.save(OUT/'web/favicon.ico',sizes=[(16,16),(32,32),(48,48)])

for theme,bg in [('light',PAPER),('dark',DARK)]:
    save(f'social/profile-{theme}.svg',1024,1024,mark(232,232,560),bg,png=1024)
    for name,w,h,lx,lw in [('linkedin-personal',1584,396,510,850),('linkedin-company',1128,191,370,600),('x-header',1500,500,470,850)]:
        # Keep the lower-left clear for profile overlays; all information sits centrally/right.
        ly=(h-H*lw/W)/2
        save(f'social/{name}-{theme}.svg',w,h,logo(lx,ly,lw,light=theme=='dark'),bg,png=w)

def text(x,y,s,size=11,color=INK):
    return f'<text x="{x}" y="{y}" font-family="Helvetica,Arial,sans-serif" font-size="{size}" fill="{color}">{s}</text>'

for name,w,h in [('a4',793.7,1122.52),('us-letter',816,1056)]:
    content=logo(76,64,270)
    content+=f'<path d="M76 {h-86}H{w-76}" stroke="#DAD1D5" stroke-width="0.7"/>'
    content+=text(76,h-61,'bigpicturebio.com',10)+text(w-305,h-61,'partnerships@bigpicturebio.com',10)
    save(f'letterheads/letterhead-{name}.svg',w,h,content,'#FFFFFF',pdf=True)

content=logo(64,58,480)+text(64,194,'IDENTITY / MASTER ASSET GUIDE',12)
lines=[('The idea', 'Evolving disease populations diminish to zero. The background is the recovered space.'),
('Primary lockup', 'Source Serif 4, Regular 400 / optical size 32. Bio is italic. Shared baseline.'),
('Clear space', 'Leave at least half the mark height around the complete logo.'),
('Minimum sizes', 'Full lockup: 180 px on screen or 45 mm in print. Below this, use the mark.'),
('Backgrounds', 'Plum lettering on white or warm ivory; ivory lettering on dark backgrounds.'),
('Do not', 'Do not rotate, stretch, outline, recolour the bands or reverse their direction.'),
('Print', 'Letterheads are blank vector PDFs and editable SVGs. Exports use RGB colour.'),
('Production', 'Ask your printer for a proof and an ICC-profile conversion for their paper stock.'),
('Press', 'Use the outlined SVG masters or the 3200 px transparent PNG logos.'),
('Social', 'Upload PNGs. Preview the platform crop before saving; avatar crops vary by device.')]
y=242
for title,body in lines:
    content+=text(64,y,title,14)+text(64,y+23,body,11); y+=64
for i,(name,color) in enumerate([('Rose',COLORS[0]),('Coral',COLORS[1]),('Mauve',COLORS[2]),('Plum',INK),('Ivory',PAPER)]):
    x=64+i*138
    content+=f'<rect x="{x}" y="914" width="108" height="52" fill="{color}"/>'+text(x,986,name,11)+text(x,1005,color,10)
save('guidelines/brand-guide.svg',793.7,1122.52,content,'#FFFFFF',pdf=True)

readme='''# Big Picture Bio - brand assets

Primary logo: logos/logo-plum.svg (light backgrounds) or logo-ivory.svg (dark).
The typography is outlined: no font installation is required to reproduce the logo.
Colour mark: descending Muller bands; transparent negative space represents restoration.

CONTENTS
- logos: four outlined SVG masters and 3200-pixel transparent PNGs, including mono.
- marks: standalone colour and mono SVG/PNG marks.
- web: SVG favicon, multi-resolution ICO, PNG icons including 180px Apple touch icon.
- social: light/dark 1024px avatars; LinkedIn personal 1584x396 and company 1128x191;
  X headers 1500x500. SVG originals plus ready-to-upload PNGs.
- letterheads: blank A4 and US Letter vector PDFs and editable SVGs. White paper.
- guidelines: colour references, spacing and production notes.
- fonts: official Source Serif 4 variable regular/italic fonts and OFL licence.

The 100%-capital-height mark is the default lockup. Bio remains italic.
Use PNG for social uploads; preview cropping before applying. No social accounts changed.
RGB colour masters are not press-specific CMYK separations: request a printer proof.
Letterheads deliberately omit unverified postal address and company registration details.
Fonts: https://github.com/google/fonts/tree/main/ofl/sourceserif4
Rebuild: scripts/build-brand.py (fonttools, uharfbuzz, Pillow and rsvg-convert required).
'''
(OUT/'README.md').write_text(readme)
# A single visual overview, not a replacement for the individual production assets.
sheet=Image.new('RGB',(1600,1250),PAPER); d=ImageDraw.Draw(sheet)
for label,path,box in [
    ('PRIMARY / LIGHT','logos/logo-plum.png',(60,70,1480,160)),
    ('PRIMARY / DARK','logos/logo-ivory.png',(60,305,1480,160)),
    ('PROFILE','social/profile-light.png',(60,560,280,280)),
    ('X HEADER','social/x-header-dark.png',(420,560,1120,373)),
    ('LINKEDIN COMPANY','social/linkedin-company-light.png',(420,1020,1120,190))]:
    x,y,w,h=box; d.text((x,y-25),label,fill=INK)
    if 'ivory' in path: d.rectangle((x,y,x+w,y+h),fill=DARK)
    img=Image.open(OUT/path).convert('RGBA'); img.thumbnail((w,h),Image.Resampling.LANCZOS)
    sheet.paste(img,(x+(w-img.width)//2,y+(h-img.height)//2),img)
sheet.save(OUT/'brand-preview.png')
archive=OUT/'big-picture-bio-brand-kit.zip'
with zipfile.ZipFile(archive,'w',zipfile.ZIP_DEFLATED) as z:
    for p in sorted(OUT.rglob('*')):
        if p.is_file() and p!=archive: z.write(p,Path('big-picture-bio-brand-kit')/p.relative_to(OUT))
print(f'Created {len(list(OUT.rglob("*")))} assets; logo ratio {W/H:.3f}; {archive}')
