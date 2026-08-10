/* ==========================================================================
   Big Picture Bio — living model homepage
   A single canvas state transforms as the narrative moves from disease
   observation to combination design, stress-testing and clinical prediction.
   ========================================================================== */
(function(){
  "use strict";

  var story=document.getElementById("model-story");
  var canvas=document.getElementById("model-canvas");
  if(!story || !canvas) return;

  var ctx=canvas.getContext("2d");
  if(!ctx) return;
  var beats=[].slice.call(story.querySelectorAll("[data-model-scene]"));
  var sceneLabel=document.getElementById("model-scene-label");
  var candidateEl=document.getElementById("model-candidate");
  var testedEl=document.getElementById("model-tested");
  var stateEl=document.getElementById("model-state");
  var modelKey=document.getElementById("model-key");
  var reduced=window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var PAL=["#F6C982","#F19A6C","#EC7EA6","#CE6BA0","#96509A","#52223F"];
  var BLUE="#83B9FF";
  var RISK="#FF5F61";
  var INK="#F2EFEA";
  var MUTED="#9D98A1";
  var BG="#08090c";

  // theme-aware colours: the canvas repaints per frame, so reading the
  // attribute here lets the whole story flip between dark and light.
  function isLight(){ return document.documentElement.getAttribute("data-theme")==="light"; }
  function cBG(){ return isLight()?"#F5F1E8":BG; }
  function cINK(){ return isLight()?"#26211C":INK; }
  function inkA(a){ return (isLight()?"rgba(38,33,28,":"rgba(242,239,234,")+a+")"; }
  function lineA(a){ return (isLight()?"rgba(40,32,24,":"rgba(255,255,255,")+a+")"; }

  var SCENES=[
    ["00 — STANDARD OF CARE","—","0","Standard of care"],
    ["01 — REDESIGN","—","0","Resistance held down"],
    ["02 — GENERATE & OPTIMISE","08,412","12,308","Pareto selected"],
    ["03 — PREDICT","08,412","12,308","Durable control"]
  ];

  var W=0,H=0,DPR=1;
  var targetScene=0;
  var renderedScene=0;
  var activeScene=-1;
  var raf=0;
  var lastTime=0;
  var visible=true;

  function clamp(v,a,b){ return Math.max(a,Math.min(b,v)); }
  function lerp(a,b,t){ return a+(b-a)*t; }
  function smooth(t){ return t*t*(3-2*t); }
  function hash(n){
    var x=Math.sin(n*127.1+311.7)*43758.5453123;
    return x-Math.floor(x);
  }
  function rgba(hex,a){
    var n=parseInt(hex.slice(1),16);
    return "rgba("+((n>>16)&255)+","+((n>>8)&255)+","+(n&255)+","+a+")";
  }
  function roundedRect(x,y,w,h,r){
    r=Math.min(r,w/2,h/2);
    ctx.beginPath();
    ctx.moveTo(x+r,y);
    ctx.arcTo(x+w,y,x+w,y+h,r);
    ctx.arcTo(x+w,y+h,x,y+h,r);
    ctx.arcTo(x,y+h,x,y,r);
    ctx.arcTo(x,y,x+w,y,r);
    ctx.closePath();
  }
  function text(str,x,y,size,color,align,weight,font){
    ctx.fillStyle=color||cINK();
    ctx.font=(weight||"400")+" "+size+"px "+(font||'"Geist Mono", monospace');
    ctx.textAlign=align||"left";
    ctx.textBaseline="alphabetic";
    ctx.fillText(str,x,y);
  }
  function line(x1,y1,x2,y2,color,width,dash){
    ctx.beginPath();
    ctx.moveTo(x1,y1);
    ctx.lineTo(x2,y2);
    ctx.strokeStyle=color;
    ctx.lineWidth=width||1;
    ctx.setLineDash(dash||[]);
    ctx.stroke();
    ctx.setLineDash([]);
  }
  function box(){
    if(W<1024) return {x:20,y:94,w:W-40,h:Math.min(H*.46,380)};
    var bx=Math.max(W*.5,560);
    return {x:bx,y:Math.max(108,H*.14),w:W-bx-54,h:H-Math.max(108,H*.14)-132};
  }
  function resize(){
    var r=canvas.getBoundingClientRect();
    W=Math.max(1,r.width);
    H=Math.max(1,r.height);
    DPR=Math.min(window.devicePixelRatio||1,2);
    canvas.width=Math.round(W*DPR);
    canvas.height=Math.round(H*DPR);
    ctx.setTransform(DPR,0,0,DPR,0,0);
  }

  function frame(b,label,alpha){
    ctx.save();
    ctx.globalAlpha=alpha;
    ctx.strokeStyle=lineA(.13);
    ctx.lineWidth=1;
    roundedRect(b.x,b.y,b.w,b.h,18);
    ctx.stroke();
    var c=15;
    line(b.x,b.y+c,b.x,b.y,lineA(.3),1);
    line(b.x,b.y,b.x+c,b.y,lineA(.3),1);
    line(b.x+b.w-c,b.y,b.x+b.w,b.y,lineA(.3),1);
    line(b.x+b.w,b.y,b.x+b.w,b.y+c,lineA(.3),1);
    line(b.x,b.y+b.h-c,b.x,b.y+b.h,lineA(.3),1);
    line(b.x,b.y+b.h,b.x+c,b.y+b.h,lineA(.3),1);
    line(b.x+b.w-c,b.y+b.h,b.x+b.w,b.y+b.h,lineA(.3),1);
    line(b.x+b.w,b.y+b.h-c,b.x+b.w,b.y+b.h,lineA(.3),1);
    text(label,b.x+16,b.y+24,9,inkA(.52),"left","500");
    ctx.restore();
  }

  function mullerFractions(t,mode){
    var response=typeof mode==="number" ? clamp(mode,0,1) : mode==="potential" ? 1 : 0;

    var contraction=smooth(clamp(t/.34,0,1));
    var relapse=smooth(clamp((t-.42)/.58,0,1));
    var socSensitive=lerp(lerp(.58,.12,contraction),.08,relapse);
    var socResistant=lerp(lerp(.04,.07,contraction),.52,relapse);
    var socStroma=lerp(lerp(.23,.36,contraction),.23,relapse);
    var socImmune=Math.max(.03,1-socSensitive-socResistant-socStroma);

    var elimination=smooth(clamp((t-.02)/.86,0,1));
    var potentialSensitive=lerp(.58,.012,elimination);
    var transientResistance=.05*Math.exp(-Math.pow((t-.30)*6.2,2));
    var potentialResistant=(.04+transientResistance)*(1-.92*elimination);
    var potentialStroma=lerp(.23,.44,elimination);
    var potentialImmune=Math.max(.03,1-potentialSensitive-potentialResistant-potentialStroma);

    var soc=[socImmune,socStroma,socResistant,socSensitive];
    var potential=[potentialImmune,potentialStroma,potentialResistant,potentialSensitive];
    var mixed=soc.map(function(value,i){ return lerp(value,potential[i],response); });
    var total=mixed.reduce(function(sum,value){ return sum+value; },0);
    return mixed.map(function(value){ return value/total; });
  }

  function drawMuller(alpha,now,mode,annotate){
    var b=box();
    var potential=mode==="potential" || typeof mode==="number" && mode>.5;
    frame(b,"TUMOUR POPULATION DYNAMICS / "+(potential?"WITH REDESIGNED COMBINATION":"STANDARD OF CARE")+" / 0–36 MONTHS",alpha);
    ctx.save();
    roundedRect(b.x+1,b.y+34,b.w-2,b.h-35,0);
    ctx.clip();

    var top=b.y+42;
    var usable=b.h-75;
    var samples=86;
    var colors=[PAL[0],PAL[2],PAL[4],PAL[5]];
    var boundaries=[];
    var i,k;
    for(i=0;i<5;i++) boundaries.push([]);

    for(k=0;k<=samples;k++){
      var t=k/samples;
      var f=mullerFractions(t,mode);
      var x=b.x+t*b.w;
      var drift=Math.sin(t*7.2+now*.00018)*usable*.015;
      var y=top+drift;
      boundaries[0].push([x,y]);
      for(i=0;i<4;i++){
        y+=f[i]*usable;
        boundaries[i+1].push([x,y]);
      }
    }

    function paintBands(strength){
      ctx.save();
      ctx.globalAlpha=alpha*strength;
      for(i=0;i<4;i++){
        ctx.beginPath();
        ctx.moveTo(boundaries[i][0][0],boundaries[i][0][1]);
        for(k=1;k<=samples;k++) ctx.lineTo(boundaries[i][k][0],boundaries[i][k][1]);
        for(k=samples;k>=0;k--) ctx.lineTo(boundaries[i+1][k][0],boundaries[i+1][k][1]);
        ctx.closePath();
        var grad=ctx.createLinearGradient(b.x,0,b.x+b.w,0);
        grad.addColorStop(0,rgba(colors[i],.80));
        grad.addColorStop(.55,colors[i]);
        grad.addColorStop(1,rgba(colors[i],.92));
        ctx.fillStyle=grad;
        ctx.fill();
        ctx.strokeStyle=lineA(.13);
        ctx.lineWidth=1;
        ctx.stroke();
      }
      ctx.restore();
    }

    var play=reduced ? .999 : (now*.000038)%1;
    var px=b.x+play*b.w;
    paintBands(.12);
    ctx.save();
    ctx.beginPath();
    ctx.rect(b.x,b.y+34,Math.max(0,px-b.x),b.h-34);
    ctx.clip();
    paintBands(1);
    ctx.restore();

    line(px,b.y+36,px,b.y+b.h,lineA(.72),1.2);
    ctx.fillStyle=cINK();
    ctx.beginPath();
    ctx.arc(px,b.y+36,2.4,0,Math.PI*2);
    ctx.fill();
    text(Math.round(play*36)+" MO",px+7,b.y+51,8,inkA(.72));

    if(annotate && W>760){
      var end=mullerFractions(.98,mode);
      var cumulative=0;
      var labels=["IMMUNE CONTROL","STROMA","RESISTANT CLONE","SENSITIVE CANCER"];
      end.forEach(function(fraction,index){
        var y=top+(cumulative+fraction*.5)*usable;
        if(!potential || index<2){
          line(b.x+b.w-104,y,b.x+b.w-12,y,rgba(colors[index],.78),1);
          text(labels[index],b.x+b.w-16,y-5,8,inkA(.8),"right","500");
        }
        cumulative+=fraction;
      });
      if(potential){
        var cancerTotal=Math.round((end[2]+end[3])*100);
        line(b.x+b.w-118,b.y+b.h-24,b.x+b.w-12,b.y+b.h-24,rgba(PAL[4],.80),1);
        text("TOTAL CANCER <"+Math.max(3,cancerTotal)+"%",b.x+b.w-16,b.y+b.h-30,8,inkA(.86),"right","500");
      }
    }
    ctx.restore();
  }

  var SEARCH_POINTS=[];
  for(var sp=0;sp<520;sp++){
    SEARCH_POINTS.push({
      x:hash(sp*3+1),
      y:hash(sp*3+2),
      q:hash(sp*3+3),
      c:1+Math.floor(hash(sp*5+7)*5)
    });
  }

  function drawSearch(alpha,now){
    var b=box();
    frame(b,"GENERATIVE SEARCH / 12,308 COMBINATIONS EXPLORED",alpha);
    ctx.save();
    ctx.globalAlpha=alpha;
    var x0=b.x+35,y0=b.y+48,w=b.w-70,h=b.h-90;
    var scan=(now*.000055)%1;
    var scanX=x0+scan*w;
    var g=ctx.createLinearGradient(scanX-70,0,scanX+70,0);
    g.addColorStop(0,"rgba(131,185,255,0)");
    g.addColorStop(.5,"rgba(131,185,255,.09)");
    g.addColorStop(1,"rgba(131,185,255,0)");
    ctx.fillStyle=g;
    ctx.fillRect(scanX-70,y0,140,h);
    line(scanX,y0,scanX,y0+h,"rgba(131,185,255,.58)",1);

    SEARCH_POINTS.forEach(function(p,i){
      var x=x0+p.x*w;
      var y=y0+p.y*h;
      var d=Math.abs(x-scanX);
      var active=d<36;
      var c=p.q>.91?PAL[p.c]:p.q>.72?(isLight()?"#7A7280":"#87718F"):(isLight()?"#B7AEA0":"#484650");
      var r=active?2.2+(36-d)/30:1.2;
      ctx.fillStyle=rgba(c,active?.95:.44);
      ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill();
    });

    var selected=SEARCH_POINTS[187];
    var sx=x0+selected.x*w,sy=y0+selected.y*h;
    ctx.strokeStyle=rgba("#EC7EA6",.9);
    ctx.lineWidth=1.4;
    ctx.beginPath(); ctx.arc(sx,sy,9+Math.sin(now*.004)*2,0,Math.PI*2); ctx.stroke();
    text("08,412",sx+14,sy+3,8,rgba("#EC7EA6",.95),"left","500");
    text("MECHANISM SPACE",x0,y0+h+22,8,inkA(.42));
    text("DELIVERY / TOX / CONTEXT",x0+w,y0+h+22,8,inkA(.42),"right");
    ctx.restore();
  }

  function paretoPoint(b,p){
    var x=b.x+48+p.x*(b.w-86);
    var efficacy=.18+.7*p.q-.16*p.x+Math.sin(p.x*8)*.045;
    var y=b.y+b.h-52-clamp(efficacy,.04,.94)*(b.h-100);
    return [x,y];
  }
  function drawPareto(alpha,now){
    var b=box();
    frame(b,"PARETO LANDSCAPE / EFFICACY × COMPLEXITY",alpha);
    ctx.save();
    ctx.globalAlpha=alpha;
    var x0=b.x+50,y0=b.y+48,x1=b.x+b.w-32,y1=b.y+b.h-48;
    line(x0,y1,x1,y1,"rgba(255,255,255,.25)",1);
    line(x0,y0,x0,y1,"rgba(255,255,255,.25)",1);
    text("CLINICAL COMPLEXITY →",x1,y1+23,8,"rgba(242,239,234,.45)","right");
    ctx.save(); ctx.translate(x0-28,y0); ctx.rotate(-Math.PI/2);
    text("PREDICTED EFFICACY →",0,0,8,"rgba(242,239,234,.45)","right"); ctx.restore();

    SEARCH_POINTS.slice(0,260).forEach(function(p){
      var q=paretoPoint(b,p);
      ctx.fillStyle=rgba(p.q>.82?"#9B6EA5":"#514D59",p.q>.82?.58:.3);
      ctx.beginPath(); ctx.arc(q[0],q[1],p.q>.82?2.3:1.5,0,Math.PI*2); ctx.fill();
    });

    var frontier=[];
    for(var i=0;i<=7;i++){
      var t=i/7;
      frontier.push([x0+t*(x1-x0),y1-(.28+.58*(1-Math.exp(-t*3.2)))*(y1-y0)]);
    }
    ctx.strokeStyle=rgba("#EC7EA6",.95);
    ctx.lineWidth=1.6;
    ctx.setLineDash([5,5]);
    ctx.beginPath(); ctx.moveTo(frontier[0][0],frontier[0][1]);
    frontier.forEach(function(p,i){ if(i) ctx.lineTo(p[0],p[1]); });
    ctx.stroke(); ctx.setLineDash([]);

    var t=.58;
    var sx=lerp(x0,x1,t);
    var sy=y1-(.28+.58*(1-Math.exp(-t*3.2)))*(y1-y0);
    var rr=10+Math.sin(now*.004)*2;
    ctx.fillStyle="#EC7EA6";
    ctx.beginPath();ctx.arc(sx,sy,4,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle=rgba("#EC7EA6",.85);ctx.lineWidth=1.2;
    ctx.beginPath();ctx.arc(sx,sy,rr,0,Math.PI*2);ctx.stroke();
    line(sx+rr,sy,sx+82,sy,"rgba(240,138,184,.65)",1);
    text("08,412 / SELECTED",sx+86,sy+3,8,"rgba(242,239,234,.8)","left","500");
    ctx.restore();
  }

  function drawSequence(alpha,now){
    var b=box();
    frame(b,"TEMPORAL OPTIMISATION / 0–36 MONTHS",alpha);
    ctx.save();
    ctx.globalAlpha=alpha;
    var x0=b.x+122,x1=b.x+b.w-34,y0=b.y+70;
    var rows=[
      ["PARPi",PAL[2],0.04,.64],
      ["RT / RADIOLIGAND",PAL[1],.10,.29],
      ["CHECKPOINT-i",BLUE,.25,.94],
      ["TME MODULATOR",PAL[4],.54,.88]
    ];
    for(var m=0;m<=36;m+=6){
      var x=lerp(x0,x1,m/36);
      line(x,y0-20,x,b.y+b.h-52,"rgba(255,255,255,.07)",1);
      text(String(m).padStart(2,"0"),x,b.y+b.h-28,8,inkA(.4),"center");
    }
    rows.forEach(function(r,i){
      var y=y0+i*68;
      var start=lerp(x0,x1,r[2]);
      var duration=Math.max(2,(x1-x0)*(r[3]-r[2]));
      text(r[0],b.x+24,y+19,8,"rgba(242,239,234,.67)","left","500");
      roundedRect(start,y,duration,26,13);
      var grad=ctx.createLinearGradient(x0,0,x1,0);
      grad.addColorStop(0,rgba(r[1],.55));grad.addColorStop(1,r[1]);
      ctx.fillStyle=grad;ctx.fill();
      roundedRect(x0,y,x1-x0,26,13);
      ctx.strokeStyle="rgba(255,255,255,.09)";ctx.lineWidth=1;ctx.stroke();
    });
    var play=(now*.000046)%1;
    var px=lerp(x0,x1,play);
    line(px,y0-24,px,b.y+b.h-50,"rgba(255,255,255,.65)",1);
    ctx.fillStyle=cINK();ctx.beginPath();ctx.arc(px,y0-24,2.5,0,Math.PI*2);ctx.fill();
    var riskX=lerp(x0,x1,.47);
    ctx.strokeStyle=RISK;ctx.lineWidth=1.4;
    ctx.beginPath();ctx.arc(riskX,y0+68*2+13,8+Math.sin(now*.005)*2,0,Math.PI*2);ctx.stroke();
    text("GATE OPENS",riskX+13,y0+68*2+17,8,rgba(RISK,.9),"left","500");
    ctx.restore();
  }

  function miniMuller(cx,cy,w,h,response,alpha){
    ctx.save();
    ctx.globalAlpha=alpha;
    var samples=30,bounds=[],i,k;
    var colors=[PAL[0],PAL[2],PAL[4],PAL[5]];
    for(i=0;i<5;i++) bounds.push([]);
    for(k=0;k<=samples;k++){
      var t=k/samples,f=mullerFractions(t,response),y=cy-h/2;
      bounds[0].push([cx-w/2+t*w,y]);
      for(i=0;i<4;i++){ y+=f[i]*h; bounds[i+1].push([cx-w/2+t*w,y]); }
    }
    for(i=0;i<4;i++){
      ctx.beginPath();ctx.moveTo(bounds[i][0][0],bounds[i][0][1]);
      for(k=1;k<=samples;k++)ctx.lineTo(bounds[i][k][0],bounds[i][k][1]);
      for(k=samples;k>=0;k--)ctx.lineTo(bounds[i+1][k][0],bounds[i+1][k][1]);
      ctx.closePath();ctx.fillStyle=colors[i];ctx.fill();
    }
    roundedRect(cx-w/2,cy-h/2,w,h,8);
    ctx.strokeStyle="rgba(255,255,255,.18)";ctx.lineWidth=1;ctx.stroke();
    ctx.restore();
  }
  function drawRisk(alpha,now){
    var b=box();
    frame(b,"MULTI-SITE STRESS TEST / ESCAPE ROUTES",alpha);
    ctx.save();
    ctx.globalAlpha=alpha;
    var sites=[
      [b.x+b.w*.26,b.y+b.h*.34,"PRIMARY",.92],
      [b.x+b.w*.69,b.y+b.h*.31,"LIVER",.80],
      [b.x+b.w*.53,b.y+b.h*.72,"MARROW",.68]
    ];
    line(sites[0][0],sites[0][1],sites[1][0],sites[1][1],"rgba(131,185,255,.28)",1,[4,5]);
    line(sites[0][0],sites[0][1],sites[2][0],sites[2][1],"rgba(131,185,255,.28)",1,[4,5]);
    line(sites[1][0],sites[1][1],sites[2][0],sites[2][1],"rgba(131,185,255,.28)",1,[4,5]);
    sites.forEach(function(s){
      miniMuller(s[0],s[1],Math.min(150,b.w*.25),72,s[3],1);
      text(s[2],s[0],s[1]+57,8,"rgba(242,239,234,.62)","center","500");
    });
    var rx=sites[2][0]+58,ry=sites[2][1]-18;
    var pulse=11+Math.sin(now*.006)*3;
    ctx.strokeStyle=rgba(RISK,.9);ctx.lineWidth=1.5;
    ctx.beginPath();ctx.arc(rx,ry,pulse,0,Math.PI*2);ctx.stroke();
    ctx.fillStyle=RISK;ctx.beginPath();ctx.arc(rx,ry,3,0,Math.PI*2);ctx.fill();
    line(rx+pulse,ry,rx+88,ry,rgba(RISK,.62),1);
    text("DORMANT RESERVOIR",rx+92,ry+3,8,rgba(RISK,.94),"left","500");
    text("CLOSED BY SEQUENCE 04",rx+92,ry+17,7,"rgba(242,239,234,.46)");
    ctx.restore();
  }

  function stepPath(points,X,Y,color,width){
    ctx.beginPath();
    ctx.moveTo(X(points[0][0]),Y(points[0][1]));
    for(var i=1;i<points.length;i++){
      ctx.lineTo(X(points[i][0]),Y(points[i-1][1]));
      ctx.lineTo(X(points[i][0]),Y(points[i][1]));
    }
    ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke();
  }
  function drawSurvival(alpha,now){
    var b=box();
    frame(b,"CLINICAL CONSEQUENCE / PREDICTED SURVIVAL",alpha);
    ctx.save();
    ctx.globalAlpha=alpha;
    var x0=b.x+52,x1=b.x+b.w-28,y0=b.y+54,y1=b.y+b.h-48;
    function X(t){return lerp(x0,x1,t/60);}
    function Y(v){return lerp(y1,y0,v/100);}
    for(var g=0;g<=100;g+=25){
      line(x0,Y(g),x1,Y(g),lineA(.09),1);
      text(g+"",x0-9,Y(g)+3,7,inkA(.4),"right");
    }
    for(var m=0;m<=60;m+=12) text(m+"",X(m),y1+20,7,inkA(.4),"center");
    var combo=[[0,100],[6,99],[12,96],[18,92],[24,86],[30,80],[36,73],[42,66],[48,60],[54,55],[60,51]];
    var control=[[0,100],[6,90],[12,78],[18,64],[24,51],[30,40],[36,31],[42,24],[48,19],[54,15],[60,12]];
    stepPath(control,X,Y,"rgba(124,115,145,.82)",1.8);
    stepPath(combo,X,Y,rgba("#EC7EA6",.98),2.4);
    [[12,95],[24,84],[36,64],[48,58],[60,49]].forEach(function(p,i){
      ctx.fillStyle=cBG();ctx.strokeStyle="#EC7EA6";ctx.lineWidth=1.4;
      ctx.beginPath();ctx.arc(X(p[0]),Y(p[1]),3.2,0,Math.PI*2);ctx.fill();ctx.stroke();
    });
    var tx=X(36),ty=Y(73);
    line(tx,ty,tx+68,ty-42,rgba("#EC7EA6",.5),1);
    text("SELECTED REGIMEN",tx+73,ty-45,8,rgba("#EC7EA6",.95),"left","500");
    text("DURABLE SEPARATION",tx+73,ty-31,7,inkA(.5));
    text("MONTHS",x1,y1+20,7,inkA(.4),"right");
    ctx.restore();
  }

  function drawScene(index,alpha,now){
    if(alpha<=.001 || index<0 || index>3) return;
    if(index===0) drawMuller(alpha,now,"soc",true);
    if(index===1) drawMuller(alpha,now,"potential",true);
    if(index===2) drawSearch(alpha,now);
    if(index===3) drawSurvival(alpha,now);
  }

  function updateStory(){
    var rect=story.getBoundingClientRect();
    var total=Math.max(1,story.offsetHeight-window.innerHeight);
    var p=clamp(-rect.top/total,0,1);
    targetScene=p*(SCENES.length-1);
    var idx=clamp(Math.round(targetScene),0,SCENES.length-1);
    if(idx!==activeScene){
      activeScene=idx;
      beats.forEach(function(beat,i){ beat.classList.toggle("is-active",i===idx); });
      var meta=SCENES[idx];
      if(sceneLabel) sceneLabel.textContent=meta[0];
      if(candidateEl) candidateEl.textContent=meta[1];
      if(testedEl) testedEl.textContent=meta[2];
      if(stateEl) stateEl.textContent=meta[3];
      if(modelKey){
        modelKey.style.opacity=idx<=1?"1":"0";
        modelKey.style.visibility=idx<=1?"visible":"hidden";
      }
    }
  }

  function render(now){
    raf=0;
    if(!lastTime) lastTime=now;
    if(reduced) renderedScene=targetScene;
    else renderedScene=lerp(renderedScene,targetScene,.16);
    ctx.setTransform(DPR,0,0,DPR,0,0);
    ctx.clearRect(0,0,W,H);
    ctx.fillStyle=cBG();ctx.fillRect(0,0,W,H);

    var base=Math.floor(renderedScene);
    var mix=smooth(clamp(((renderedScene-base)-.44)/.12,0,1));
    var drawTime=reduced?0:now;
    drawScene(base,1-mix,drawTime);
    drawScene(Math.min(base+1,3),mix,drawTime);

    lastTime=now;
    if(!reduced && visible) raf=requestAnimationFrame(render);
  }

  var ticking=false;
  window.addEventListener("scroll",function(){
    if(ticking) return;
    ticking=true;
    requestAnimationFrame(function(){
      updateStory();
      if(reduced && visible && !raf) raf=requestAnimationFrame(render);
      ticking=false;
    });
  },{passive:true});
  window.addEventListener("resize",function(){
    resize();
    updateStory();
    if(visible && !raf) raf=requestAnimationFrame(render);
  });

  if("IntersectionObserver" in window){
    new IntersectionObserver(function(entries){
      visible=entries[0].isIntersecting;
      if(visible && !raf) raf=requestAnimationFrame(render);
      if(!visible && raf){ cancelAnimationFrame(raf); raf=0; }
    },{rootMargin:"120px 0px"}).observe(story);
  }

  resize();
  updateStory();
  raf=requestAnimationFrame(render);

  window.addEventListener("pagehide",function(){
    visible=false;
    if(raf){ cancelAnimationFrame(raf); raf=0; }
  });
})();
