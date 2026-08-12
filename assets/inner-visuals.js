/* ==========================================================================
   Big Picture Bio — biological line-art system for inner pages
   Each page turns one real disease phenomenon into a living model view.
   ========================================================================== */
(function(){
  "use strict";

  var body=document.body;
  if(!body || !body.classList.contains("inner-page")) return;

  var reduced=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var visuals=[];
  var raf=0;
  var PAL={
    bg:"#08090c",ink:"#F2EFEA",muted:"#8D8991",pink:"#EC7EA6",
    rose:"#CE6BA0",purple:"#96509A",plum:"#52223F",amber:"#F6C982",
    orange:"#F19A6C",blue:"#83B9FF",risk:"#FF6568",green:"#7BC7A3"
  };
  var META={
    "immune-exclusion":["BIOLOGY / IMMUNE EXCLUSION","CD8+ cells · reactive stroma · tumour"],
    "resistance-map":["GLOBAL RESISTANCE ATLAS","Observed single-cell states · generated routes"],
    "antigen-escape":["BIOLOGY / ANTIGEN ESCAPE","Target-positive · antigen-null · immune recognition"],
    "bone-reseeding":["BIOLOGY / DISTANT RESEEDING","Primary tumour · bone reservoir · return route"],
    "multi-site":["BIOLOGY / MULTI-SITE DELIVERY","Payload · access · disease-site context"],
    "combination-space":["DESIGN SPACE / COMBINATIONS","16B+ possible · 12,308 explored · 10 programmes"],
    "world-model":["WORLD MODEL / LIVING SYSTEM","Observe · reason · design · predict"]
  };

  function clamp(v,a,b){ return Math.max(a,Math.min(b,v)); }
  function lerp(a,b,t){ return a+(b-a)*t; }
  function hash(n){
    var x=Math.sin(n*127.1+311.7)*43758.5453123;
    return x-Math.floor(x);
  }
  function rgba(hex,a){
    var n=parseInt(hex.slice(1),16);
    return "rgba("+((n>>16)&255)+","+((n>>8)&255)+","+(n&255)+","+a+")";
  }
  function line(ctx,x1,y1,x2,y2,color,width,dash){
    ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);
    ctx.strokeStyle=color;ctx.lineWidth=width||1;ctx.setLineDash(dash||[]);
    ctx.stroke();ctx.setLineDash([]);
  }
  function label(ctx,str,x,y,size,color,align,weight){
    ctx.fillStyle=color||PAL.ink;
    ctx.font=(weight||"500")+" "+size+"px \"Geist Mono\", monospace";
    ctx.textAlign=align||"left";ctx.textBaseline="alphabetic";
    ctx.fillText(str,x,y);
  }
  function roundRect(ctx,x,y,w,h,r){
    r=Math.max(0,Math.min(r,w/2,h/2));ctx.beginPath();ctx.moveTo(x+r,y);
    ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);
    ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();
  }
  function curve(ctx,x1,y1,cx,cy,x2,y2,color,width,dash){
    ctx.beginPath();ctx.moveTo(x1,y1);ctx.quadraticCurveTo(cx,cy,x2,y2);
    ctx.strokeStyle=color;ctx.lineWidth=width||1;ctx.setLineDash(dash||[]);
    ctx.stroke();ctx.setLineDash([]);
  }
  function cell(ctx,x,y,r,color,fill,seed){
    ctx.save();ctx.translate(x,y);
    ctx.beginPath();
    for(var i=0;i<=24;i++){
      var a=i/24*Math.PI*2;
      var rr=r*(.86+hash(seed*41+i)*.22);
      var px=Math.cos(a)*rr,py=Math.sin(a)*rr;
      if(i===0)ctx.moveTo(px,py);else ctx.lineTo(px,py);
    }
    ctx.closePath();
    ctx.fillStyle=rgba(color,fill==null?.08:fill);ctx.fill();
    ctx.strokeStyle=rgba(color,.78);ctx.lineWidth=1.1;ctx.stroke();
    ctx.beginPath();ctx.arc(0,0,r*.32,0,Math.PI*2);
    ctx.fillStyle=rgba(color,.16);ctx.fill();
    ctx.strokeStyle=rgba(color,.42);ctx.stroke();
    ctx.restore();
  }
  function glow(ctx,x,y,r,color,a){
    var g=ctx.createRadialGradient(x,y,0,x,y,r);
    g.addColorStop(0,rgba(color,a));g.addColorStop(1,rgba(color,0));
    ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();
  }
  function setupFrame(v){
    var ctx=v.ctx,W=v.w,H=v.h;
    ctx.setTransform(v.dpr,0,0,v.dpr,0,0);
    ctx.clearRect(0,0,W,H);
    ctx.fillStyle=PAL.bg;ctx.fillRect(0,0,W,H);
    var g=ctx.createRadialGradient(W*.75,H*.48,0,W*.75,H*.48,Math.max(W,H)*.72);
    g.addColorStop(0,"rgba(82,34,63,.28)");g.addColorStop(.48,"rgba(30,18,30,.11)");g.addColorStop(1,"rgba(8,9,12,0)");
    ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
    ctx.strokeStyle="rgba(255,255,255,.026)";ctx.lineWidth=1;
    var step=v.hero?72:54;
    for(var x=0;x<W;x+=step)line(ctx,x,0,x,H,"rgba(255,255,255,.025)",1);
    for(var y=0;y<H;y+=step)line(ctx,0,y,W,y,"rgba(255,255,255,.025)",1);
  }
  function region(v){
    var W=v.w,H=v.h;
    return v.hero ? {x:W*.43,y:80,w:W*.57-36,h:H-142} : {x:18,y:18,w:W-36,h:H-36};
  }

  function drawImmune(v,t){
    var c=v.ctx,b=region(v),barrier=b.x+b.w*.54;
    glow(c,barrier+b.w*.24,b.y+b.h*.5,b.w*.43,PAL.plum,.22);
    for(var i=0;i<20;i++){
      var tx=barrier+b.w*.10+hash(i*5)*b.w*.31;
      var ty=b.y+34+hash(i*7+2)*(b.h-68);
      cell(c,tx,ty,10+hash(i)*10,i%4===0?PAL.purple:PAL.rose,.06,i);
    }
    c.beginPath();
    for(var k=0;k<=36;k++){
      var yy=b.y+k/36*b.h;
      var xx=barrier+Math.sin(k*.62+t*.00055)*12+Math.sin(k*.21)*7;
      if(k===0)c.moveTo(xx,yy);else c.lineTo(xx,yy);
    }
    c.strokeStyle=rgba(PAL.amber,.78);c.lineWidth=4;c.stroke();
    c.strokeStyle=rgba(PAL.orange,.28);c.lineWidth=18;c.stroke();
    for(i=0;i<8;i++){
      var ix=b.x+28+hash(i*9)*b.w*.27;
      var iy=b.y+42+hash(i*11+3)*(b.h-84);
      var drift=Math.sin(t*.0012+i)*5;
      cell(c,ix+drift,iy,8,PAL.blue,.05,80+i);
      curve(c,ix+10,iy,barrier-40,iy+Math.sin(i)*22,barrier-8,iy+Math.cos(i)*8,rgba(PAL.blue,.24),1,[4,5]);
    }
    var gateY=b.y+b.h*.44;
    glow(c,barrier,gateY,36,PAL.pink,.28);
    curve(c,barrier-80,gateY+18,barrier-25,gateY-8,barrier+112,gateY+5,rgba(PAL.pink,.9),2);
    label(c,"CD8+ EFFECTORS",b.x+22,b.y+25,8,rgba(PAL.blue,.8));
    label(c,"REACTIVE STROMA",barrier-12,b.y+25,8,rgba(PAL.amber,.8),"right");
    label(c,"IMMUNE-EXCLUDED TUMOUR",b.x+b.w-10,b.y+25,8,rgba(PAL.pink,.8),"right");
    label(c,"COMBINATION OPENS INGRESS",barrier+18,gateY-18,7.5,rgba(PAL.pink,.9));
  }

  function drawResistance(v,t){
    var c=v.ctx,b=region(v);
    var routes=["FERROPTOSIS","AUTOPHAGY","ANTIGEN LOSS","STROMAL LOCKOUT","DNA REPAIR","DORMANCY"];
    var tumours=["NSCLC","BRST","HGSOC","MEL","PDAC","CRC","GBM","PCa"];
    var left=b.x+Math.min(150,b.w*.28),top=b.y+46,right=b.x+b.w-8,bottom=b.y+b.h-28;
    var cw=(right-left)/tumours.length,rh=(bottom-top)/routes.length;
    tumours.forEach(function(name,i){ label(c,name,left+(i+.5)*cw,top-14,7,rgba(PAL.ink,.44),"center"); });
    routes.forEach(function(name,r){
      label(c,name,left-12,top+(r+.5)*rh+3,7,rgba(r===0?PAL.orange:PAL.ink,r===0?.85:.48),"right");
      for(var col=0;col<tumours.length;col++){
        var score=hash((r+2)*73+(col+5)*41);
        if(r===0)score=.62+.36*hash(col*23+4);
        if(r===3&&(col===4||col===6))score=.93;
        if(r===5&&(col===0||col===7))score=.86;
        var x=left+col*cw+2,y=top+r*rh+2;
        roundRect(c,x,y,cw-4,rh-4,6);
        c.fillStyle=rgba(score>.78?PAL.orange:score>.52?PAL.rose:PAL.plum,.12+score*.5);c.fill();
        if(score>.72){
          c.beginPath();c.arc(x+cw-13,y+10,2,0,Math.PI*2);
          c.fillStyle=score>.88?PAL.amber:PAL.blue;c.fill();
        }
      }
    });
    var sweep=(t*.00006)%1,sx=lerp(left,right,sweep);
    var scan=c.createLinearGradient(sx-44,0,sx+44,0);
    scan.addColorStop(0,rgba(PAL.blue,0));scan.addColorStop(.5,rgba(PAL.blue,.14));scan.addColorStop(1,rgba(PAL.blue,0));
    c.fillStyle=scan;c.fillRect(sx-44,top,88,bottom-top);
    line(c,sx,top,sx,bottom,rgba(PAL.blue,.48),1);
    label(c,"● OBSERVED",left,bottom+20,7,rgba(PAL.amber,.76));
    label(c,"○ GENERATED",left+92,bottom+20,7,rgba(PAL.blue,.76));
    label(c,"RECURRENT ROUTES",right,bottom+20,7,rgba(PAL.ink,.42),"right");
  }

  function drawAntigen(v,t){
    var c=v.ctx,b=region(v),cx=b.x+b.w*.66,cy=b.y+b.h*.52,rad=Math.min(b.w,b.h)*.30;
    glow(c,cx,cy,rad*1.7,PAL.purple,.16);

    // Tumour cells: mostly antigen-POSITIVE (recognised), a clear minority antigen-NULL (escape).
    var cells=[],i;
    for(i=0;i<20;i++){
      var a=hash(i*4)*Math.PI*2,r=rad*Math.sqrt(hash(i*7+4));
      cells.push({
        x:cx+Math.cos(a)*r, y:cy+Math.sin(a)*r*.80,
        r:8+hash(i)*4, isNull:(i%6===2), seed:130+i, killed:false
      });
    }

    // Blue CD8 effectors stream in from the left, dock onto antigen-POSITIVE cells and
    // kill them. Antigen-null cells are never engaged — recognition depends on the antigen.
    var targets=cells.filter(function(o){return !o.isNull;});
    var effN=Math.min(6,targets.length);
    for(i=0;i<effN;i++){
      var tgt=targets[(i*2)%targets.length];
      var sx=b.x+b.w*.11, sy=b.y+b.h*(.22+i*.12);
      var q=clamp(((t*.00020)+i*.17)%1.4,0,1);           // migrate 0..1, then hold docked
      var ex=lerp(sx,tgt.x-tgt.r-5,q), ey=lerp(sy,tgt.y,q);
      curve(c,sx+8,sy,(sx+tgt.x)*.5,sy+(tgt.y-sy)*.3,ex,ey,rgba(PAL.blue,.22),1,[4,5]);
      cell(c,ex,ey,8,PAL.blue,.06,80+i);
      if(q>=.97){ tgt.killed=true; glow(c,tgt.x,tgt.y,tgt.r*1.6,PAL.pink,.22); }
    }

    // Tumour cells drawn on top of the effectors.
    cells.forEach(function(o,idx){
      if(o.isNull){
        // antigen-null: clearly visible — muted body, dashed red "no-receptor" ring, escaping outward.
        cell(c,o.x,o.y,o.r+1,PAL.muted,.16,o.seed);
        c.strokeStyle=rgba(PAL.risk,.85);c.lineWidth=1.4;c.setLineDash([3,3]);
        c.beginPath();c.arc(o.x,o.y,o.r+7+Math.sin(t*.004+idx),0,Math.PI*2);c.stroke();c.setLineDash([]);
        var ang=Math.atan2(o.y-cy,o.x-cx);
        line(c,o.x+Math.cos(ang)*(o.r+7),o.y+Math.sin(ang)*(o.r+7),o.x+Math.cos(ang)*(o.r+18),o.y+Math.sin(ang)*(o.r+18),rgba(PAL.risk,.72),1.4);
      }else if(o.killed){
        // recognised & killed: faded body with an apoptotic cross.
        cell(c,o.x,o.y,o.r*.9,PAL.pink,.03,o.seed);
        line(c,o.x-5,o.y-5,o.x+5,o.y+5,rgba(PAL.pink,.92),1.6);
        line(c,o.x+5,o.y-5,o.x-5,o.y+5,rgba(PAL.pink,.92),1.6);
      }else{
        // antigen-positive, awaiting kill: pink body with amber antigen receptors.
        cell(c,o.x,o.y,o.r,PAL.pink,.07,o.seed);
        for(var s=-1;s<=1;s++){ var aa=-Math.PI/2+s*.5;
          line(c,o.x+Math.cos(aa)*10,o.y+Math.sin(aa)*10,o.x+Math.cos(aa)*16,o.y+Math.sin(aa)*16,rgba(PAL.amber,.82),1); }
      }
    });

    label(c,"CD8+ RECOGNITION-DEPENDENT KILL",b.x+16,b.y+24,8,rgba(PAL.blue,.80));
    label(c,"ANTIGEN-POSITIVE · KILLED",cx+rad*.70,b.y+24,8,rgba(PAL.amber,.78),"right");
    label(c,"ANTIGEN-NULL · ESCAPES",cx+rad*.92,cy+rad*.86,7.5,rgba(PAL.risk,.9),"right");
  }

  function drawBone(v,t){
    var c=v.ctx,b=region(v),boneX=b.x+b.w*.63,boneY=b.y+b.h*.68;
    c.beginPath();
    c.moveTo(boneX-b.w*.14,b.y+b.h*.20);
    c.bezierCurveTo(boneX-b.w*.04,b.y+b.h*.30,boneX-b.w*.04,b.y+b.h*.55,boneX-b.w*.14,boneY);
    c.bezierCurveTo(boneX-b.w*.22,boneY+b.h*.12,boneX-b.w*.05,boneY+b.h*.18,boneX+b.w*.05,boneY+b.h*.10);
    c.bezierCurveTo(boneX+b.w*.16,boneY+b.h*.19,boneX+b.w*.31,boneY+b.h*.10,boneX+b.w*.22,boneY);
    c.bezierCurveTo(boneX+b.w*.12,b.y+b.h*.55,boneX+b.w*.12,b.y+b.h*.30,boneX+b.w*.22,b.y+b.h*.20);
    c.strokeStyle=rgba(PAL.amber,.72);c.lineWidth=3;c.stroke();
    c.strokeStyle=rgba(PAL.orange,.17);c.lineWidth=16;c.stroke();
    for(var i=0;i<9;i++){
      var bx=boneX-b.w*.08+hash(i*11)*b.w*.21;
      var by=b.y+b.h*.34+hash(i*13)*b.h*.42;
      cell(c,bx,by,6,PAL.risk,.06,300+i);
    }
    var pcx=b.x+b.w*.18,pcy=b.y+b.h*.31;
    for(i=0;i<14;i++){
      var a=hash(i*3)*Math.PI*2,r=18+hash(i*7)*54;
      cell(c,pcx+Math.cos(a)*r,pcy+Math.sin(a)*r*.65,7+hash(i)*4,PAL.rose,.06,340+i);
    }
    curve(c,boneX-20,boneY-20,b.x+b.w*.42,b.y+b.h*.45,pcx+55,pcy+30,rgba(PAL.risk,.48),1.4,[6,5]);
    var q=(t*.00007)%1;
    var px=(1-q)*(boneX-20)+q*(pcx+55);
    var py=(1-q)*(boneY-20)+q*(pcy+30)-Math.sin(q*Math.PI)*b.h*.14;
    glow(c,px,py,18,PAL.risk,.26);c.fillStyle=PAL.risk;c.beginPath();c.arc(px,py,3,0,Math.PI*2);c.fill();
    var gx=b.x+b.w*.42,gy=b.y+b.h*.43;
    line(c,gx-12,gy-12,gx+12,gy+12,rgba(PAL.pink,.9),2);
    line(c,gx+12,gy-12,gx-12,gy+12,rgba(PAL.pink,.9),2);
    label(c,"PRIMARY LESION",pcx,b.y+22,8,rgba(PAL.pink,.78),"center");
    label(c,"BONE RESERVOIR",boneX,b.y+22,8,rgba(PAL.amber,.78),"center");
    label(c,"RESEEDING ROUTE CLOSED",gx,gy-19,7.5,rgba(PAL.pink,.9),"center");
  }

  function drawMultiSite(v,t){
    var c=v.ctx,b=region(v);
    var sites=[
      [b.x+b.w*.25,b.y+b.h*.30,"PRIMARY",PAL.rose],
      [b.x+b.w*.72,b.y+b.h*.27,"LIVER",PAL.orange],
      [b.x+b.w*.59,b.y+b.h*.72,"MARROW",PAL.purple]
    ];
    var hub=[b.x+b.w*.40,b.y+b.h*.56];
    sites.forEach(function(s,i){
      glow(c,s[0],s[1],58,s[3],.17);
      for(var k=0;k<8;k++){
        var a=hash(i*40+k)*Math.PI*2,r=12+hash(i*70+k)*32;
        cell(c,s[0]+Math.cos(a)*r,s[1]+Math.sin(a)*r*.66,6+hash(k)*3,s[3],.05,400+i*20+k);
      }
      curve(c,hub[0],hub[1],(hub[0]+s[0])*.5,Math.min(hub[1],s[1])-28,s[0],s[1],rgba(PAL.blue,.34),1,[5,5]);
      var q=(t*.00005+i*.22)%1;
      var x=lerp(hub[0],s[0],q),y=lerp(hub[1],s[1],q)-Math.sin(q*Math.PI)*24;
      c.fillStyle=i===1?PAL.orange:PAL.blue;c.beginPath();c.arc(x,y,2.6,0,Math.PI*2);c.fill();
      label(c,s[2],s[0],s[1]+58,7.5,rgba(PAL.ink,.6),"center");
    });
    glow(c,hub[0],hub[1],40,PAL.pink,.24);
    roundRect(c,hub[0]-24,hub[1]-10,48,20,10);
    c.fillStyle=rgba(PAL.pink,.22);c.fill();c.strokeStyle=rgba(PAL.pink,.85);c.stroke();
    label(c,"PAYLOAD",hub[0],hub[1]+3,7,rgba(PAL.ink,.8),"center");
    label(c,"SITE-SPECIFIC ACCESS",b.x+12,b.y+22,8,rgba(PAL.blue,.76));
  }

  function drawCombinationSpace(v,t){
    var c=v.ctx,b=region(v);
    var left=b.x+10,right=b.x+b.w-16,mid=lerp(left,right,.65);
    for(var i=0;i<620;i++){
      var x=left+hash(i*3)*b.w*.61;
      var spread=(1-(x-left)/(b.w*.61))*.46+.09;
      var y=b.y+b.h*.5+(hash(i*5+2)-.5)*b.h*spread*2;
      var q=hash(i*7+9);
      c.fillStyle=rgba(q>.94?PAL.pink:q>.82?PAL.purple:"#77717D",q>.94?.8:.24);
      c.beginPath();c.arc(x,y,q>.94?2.2:1.1,0,Math.PI*2);c.fill();
    }
    line(c,left,b.y+18,mid,b.y+b.h*.36,rgba(PAL.ink,.16),1);
    line(c,left,b.y+b.h-18,mid,b.y+b.h*.64,rgba(PAL.ink,.16),1);
    var sweep=(t*.00006)%1,sx=lerp(left,mid,sweep);
    line(c,sx,b.y+26,sx,b.y+b.h-26,rgba(PAL.blue,.4),1);
    for(i=0;i<10;i++){
      var yy=b.y+b.h*.30+i*(b.h*.40/9);
      var len=36+hash(i*21)*68;
      line(c,mid+20,yy,mid+20+len,yy,i===3?PAL.pink:rgba(PAL.purple,.72),i===3?3:2);
      c.fillStyle=i===3?PAL.amber:PAL.blue;c.beginPath();c.arc(mid+24+len,yy,2.4,0,Math.PI*2);c.fill();
    }
    label(c,"16B+ POSSIBLE",left,b.y+18,8,rgba(PAL.ink,.55));
    label(c,"12,308 EXPLORED",mid,b.y+b.h*.23,8,rgba(PAL.blue,.82),"center");
    label(c,"10 PROGRAMMES",right,b.y+b.h*.22,8,rgba(PAL.pink,.82),"right");
    label(c,"ALGORITHMIC REDUCTION OF THE DESIGN SPACE",right,b.y+b.h-10,7.5,rgba(PAL.ink,.42),"right");
  }

  function drawWorld(v,t){
    var c=v.ctx,b=region(v);
    var centers=[
      [b.x+b.w*.30,b.y+b.h*.38,PAL.blue,"IMMUNE"],
      [b.x+b.w*.64,b.y+b.h*.33,PAL.rose,"TUMOUR"],
      [b.x+b.w*.52,b.y+b.h*.69,PAL.amber,"STROMA"]
    ];
    centers.forEach(function(d,i){
      glow(c,d[0],d[1],Math.min(b.w,b.h)*.23,d[2],.16);
      for(var ring=0;ring<4;ring++){
        c.beginPath();
        for(var k=0;k<=42;k++){
          var a=k/42*Math.PI*2;
          var r=(28+ring*18)*(1+.08*Math.sin(a*3+i+t*.00015));
          var x=d[0]+Math.cos(a)*r,y=d[1]+Math.sin(a)*r*.72;
          if(k===0)c.moveTo(x,y);else c.lineTo(x,y);
        }
        c.strokeStyle=rgba(d[2],.58-ring*.08);c.lineWidth=1;c.stroke();
      }
      label(c,d[3],d[0],d[1]+82,7.5,rgba(d[2],.82),"center");
    });
    curve(c,centers[0][0]+42,centers[0][1],b.x+b.w*.49,b.y+b.h*.15,centers[1][0]-38,centers[1][1],rgba(PAL.pink,.45),1.4);
    curve(c,centers[1][0],centers[1][1]+42,b.x+b.w*.76,b.y+b.h*.61,centers[2][0]+35,centers[2][1],rgba(PAL.orange,.42),1.4);
    curve(c,centers[2][0]-38,centers[2][1],b.x+b.w*.24,b.y+b.h*.71,centers[0][0],centers[0][1]+42,rgba(PAL.blue,.42),1.4);
    label(c,"ONE LIVING STATE",b.x+12,b.y+20,8,rgba(PAL.pink,.78));
    label(c,"OBSERVE → REASON → DESIGN → PREDICT",b.x+b.w-8,b.y+b.h-12,7.5,rgba(PAL.ink,.46),"right");
  }

  function draw(v,time){
    setupFrame(v);
    if(v.type==="immune-exclusion")drawImmune(v,time);
    else if(v.type==="resistance-map")drawResistance(v,time);
    else if(v.type==="antigen-escape")drawAntigen(v,time);
    else if(v.type==="bone-reseeding")drawBone(v,time);
    else if(v.type==="multi-site")drawMultiSite(v,time);
    else if(v.type==="combination-space")drawCombinationSpace(v,time);
    else drawWorld(v,time);
  }

  function makeVisual(host,type,hero){
    if(!host)return;
    host.classList.add("bio-art-host");
    var canvas=document.createElement("canvas");
    canvas.className="bio-art-canvas";canvas.setAttribute("aria-hidden","true");
    host.appendChild(canvas);
    var ctx=canvas.getContext("2d");if(!ctx)return;
    var v={host:host,canvas:canvas,ctx:ctx,type:type,hero:hero,active:true,w:0,h:0,dpr:1};
    function resize(){
      var r=host.getBoundingClientRect();
      v.w=Math.max(1,r.width);v.h=Math.max(1,r.height);v.dpr=Math.min(window.devicePixelRatio||1,2);
      canvas.width=Math.round(v.w*v.dpr);canvas.height=Math.round(v.h*v.dpr);
      canvas.style.width=v.w+"px";canvas.style.height=v.h+"px";
      try{draw(v,reduced?0:performance.now());}catch(e){}
    }
    if("ResizeObserver" in window)new ResizeObserver(resize).observe(host);
    else window.addEventListener("resize",resize);
    if("IntersectionObserver" in window)new IntersectionObserver(function(entries){v.active=entries[0].isIntersecting;},{rootMargin:"120px"}).observe(host);
    visuals.push(v);try{resize();}catch(e){}
  }

  var hero=document.querySelector(".hero");
  var pageType=body.getAttribute("data-bio-art")||"world-model";
  var heroBg=hero&&hero.querySelector(".hero-bg");
  if(heroBg){
    makeVisual(heroBg,pageType,true);
    // Skip the "WORLD MODEL / …" hero label on blog/article pages — that label
    // set describes the Solutions pages, not editorial content.
    var onBlog = location.pathname.indexOf("/blog") === 0;
    if(!onBlog){
      var meta=META[pageType]||META["world-model"];
      var hud=document.createElement("div");
      hud.className="inner-hero-hud";
      hud.innerHTML="<span>"+meta[0]+"</span><span>"+meta[1]+"</span>";
      hero.appendChild(hud);
    }
  }
  [].forEach.call(document.querySelectorAll(".bio-instrument[data-bio-art]"),function(host){
    makeVisual(host,host.getAttribute("data-bio-art"),false);
  });

  function loop(time){
    visuals.forEach(function(v){if(v.active){try{draw(v,time);}catch(e){}}});
    raf=requestAnimationFrame(loop);
  }
  if(!reduced)raf=requestAnimationFrame(loop);
  window.addEventListener("pagehide",function(){if(raf)cancelAnimationFrame(raf);});
})();
