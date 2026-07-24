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
  var reduced=window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var PAL=["#F6C982","#F19A6C","#EC7EA6","#CE6BA0","#96509A","#52223F"];
  var BLUE="#83B9FF";
  var RISK="#FF5F61";
  var INK="#F2EFEA";
  var MUTED="#9D98A1";
  var BG="#08090c";

  var SCENES=[
    ["00 — LIVING ECOLOGY","—","0","Cells interacting"],
    ["01 — EVOLVE","—","0","Ecology changing"],
    ["02 — POPULATION SHAPE","—","0","Muller resolved"],
    ["03 — BRANCH","—","29,870","Paths generated"],
    ["04 — OPTIMISE","08,412","29,870","Pareto selected"],
    ["05 — SEQUENCE","08,412","31,206","Schedule optimised"],
    ["06 — STRESS-TEST","08,412","34,119","Risk closed"],
    ["07 — PREDICT","08,412","34,119","Durable control"]
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
    ctx.fillStyle=color||INK;
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
    if(W<820) return {x:20,y:94,w:W-40,h:Math.min(H*.48,390)};
    return {x:Math.max(W*.435,470),y:Math.max(108,H*.14),w:W-Math.max(W*.435,470)-54,h:H-Math.max(108,H*.14)-132};
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
    ctx.strokeStyle="rgba(255,255,255,.13)";
    ctx.lineWidth=1;
    roundedRect(b.x,b.y,b.w,b.h,18);
    ctx.stroke();
    var c=15;
    line(b.x,b.y+c,b.x,b.y,"rgba(255,255,255,.3)",1);
    line(b.x,b.y,b.x+c,b.y,"rgba(255,255,255,.3)",1);
    line(b.x+b.w-c,b.y,b.x+b.w,b.y,"rgba(255,255,255,.3)",1);
    line(b.x+b.w,b.y,b.x+b.w,b.y+c,"rgba(255,255,255,.3)",1);
    line(b.x,b.y+b.h-c,b.x,b.y+b.h,"rgba(255,255,255,.3)",1);
    line(b.x,b.y+b.h,b.x+c,b.y+b.h,"rgba(255,255,255,.3)",1);
    line(b.x+b.w-c,b.y+b.h,b.x+b.w,b.y+b.h,"rgba(255,255,255,.3)",1);
    line(b.x+b.w,b.y+b.h-c,b.x+b.w,b.y+b.h,"rgba(255,255,255,.3)",1);
    text(label,b.x+16,b.y+24,9,"rgba(242,239,234,.52)","left","500");
    ctx.restore();
  }

  function mullerFractions(t,response){
    var cancer=lerp(.64,.10,response*smooth(clamp((t-.04)/.88,0,1)));
    var resistant=.08*Math.exp(-Math.pow((t-.34)*4.7,2))*(1-response*.72);
    var stroma=lerp(.22,.52,response*smooth(clamp((t-.16)/.76,0,1)));
    var immune=Math.max(.08,1-cancer-resistant-stroma);
    var total=cancer+resistant+stroma+immune;
    return [
      immune*.56/total,
      immune*.44/total,
      stroma*.62/total,
      stroma*.38/total,
      resistant/total,
      cancer/total
    ];
  }

  function drawMuller(alpha,now,response,annotate){
    var b=box();
    frame(b,"POPULATION DYNAMICS / 0–36 MONTHS",alpha);
    ctx.save();
    ctx.globalAlpha=alpha;
    roundedRect(b.x+1,b.y+34,b.w-2,b.h-35,0);
    ctx.clip();

    var top=b.y+42;
    var usable=b.h-75;
    var samples=86;
    var boundaries=[];
    var i,k;
    for(i=0;i<7;i++) boundaries.push([]);

    for(k=0;k<=samples;k++){
      var t=k/samples;
      var f=mullerFractions(t,response);
      var x=b.x+t*b.w;
      var drift=Math.sin(t*7.2+now*.00018)*usable*.015;
      var y=top+drift;
      boundaries[0].push([x,y]);
      for(i=0;i<6;i++){
        y+=f[i]*usable;
        boundaries[i+1].push([x,y]);
      }
    }

    for(i=0;i<6;i++){
      ctx.beginPath();
      ctx.moveTo(boundaries[i][0][0],boundaries[i][0][1]);
      for(k=1;k<=samples;k++) ctx.lineTo(boundaries[i][k][0],boundaries[i][k][1]);
      for(k=samples;k>=0;k--) ctx.lineTo(boundaries[i+1][k][0],boundaries[i+1][k][1]);
      ctx.closePath();
      var grad=ctx.createLinearGradient(b.x,0,b.x+b.w,0);
      grad.addColorStop(0,rgba(PAL[i],.78));
      grad.addColorStop(.55,PAL[i]);
      grad.addColorStop(1,rgba(PAL[i],.9));
      ctx.fillStyle=grad;
      ctx.fill();
      ctx.strokeStyle="rgba(255,255,255,.11)";
      ctx.lineWidth=.8;
      ctx.stroke();
    }

    var play=(now*.000038)%1;
    var px=b.x+play*b.w;
    line(px,b.y+36,px,b.y+b.h,"rgba(255,255,255,.6)",1);
    ctx.fillStyle=INK;
    ctx.beginPath();
    ctx.arc(px,b.y+36,2.4,0,Math.PI*2);
    ctx.fill();
    text(Math.round(play*36)+" MO",px+7,b.y+51,8,"rgba(242,239,234,.72)");

    if(annotate && W>760){
      var labels=[
        ["CD8+ EFFECTOR",PAL[0],.09],
        ["NORMALISED STROMA",PAL[2],.39],
        ["REACTIVE CAF",PAL[3],.64],
        ["RESISTANT CLONE",PAL[4],.77],
        ["CANCER / RESIDUAL",PAL[5],.88]
      ];
      labels.forEach(function(d){
        var y=b.y+43+d[2]*usable;
        line(b.x+b.w-88,y,b.x+b.w-12,y,rgba(d[1],.75),1);
        text(d[0],b.x+b.w-16,y-5,8,"rgba(242,239,234,.76)","right","500");
      });
    }
    ctx.restore();
  }

  function organicCell(x,y,r,color,seed,fillAlpha){
    ctx.save();
    ctx.translate(x,y);
    ctx.beginPath();
    for(var i=0;i<=30;i++){
      var a=i/30*Math.PI*2;
      var rr=r*(.86+hash(seed*43+i)*.2+Math.sin(a*3+seed)*.035);
      var px=Math.cos(a)*rr;
      var py=Math.sin(a)*rr;
      if(i===0) ctx.moveTo(px,py);
      else ctx.lineTo(px,py);
    }
    ctx.closePath();
    ctx.fillStyle=rgba(color,fillAlpha==null?.055:fillAlpha);
    ctx.fill();
    ctx.strokeStyle=rgba(color,.76);
    ctx.lineWidth=1.05;
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(r*.05,-r*.02,r*.31,r*.25,.35,0,Math.PI*2);
    ctx.fillStyle=rgba(color,.12);
    ctx.fill();
    ctx.strokeStyle=rgba(color,.36);
    ctx.stroke();
    ctx.restore();
  }

  function organicLoop(cx,cy,rx,ry,seed,color,width,dash){
    ctx.beginPath();
    for(var i=0;i<=72;i++){
      var a=i/72*Math.PI*2;
      var ripple=1+Math.sin(a*3+seed)*.035+Math.sin(a*7-seed*.6)*.018;
      var x=cx+Math.cos(a)*rx*ripple;
      var y=cy+Math.sin(a)*ry*ripple;
      if(i===0) ctx.moveTo(x,y);
      else ctx.lineTo(x,y);
    }
    ctx.closePath();
    ctx.strokeStyle=color;
    ctx.lineWidth=width||1;
    ctx.setLineDash(dash||[]);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  function bezier(x1,y1,c1x,c1y,c2x,c2y,x2,y2,color,width,dash){
    ctx.beginPath();
    ctx.moveTo(x1,y1);
    ctx.bezierCurveTo(c1x,c1y,c2x,c2y,x2,y2);
    ctx.strokeStyle=color;
    ctx.lineWidth=width||1;
    ctx.setLineDash(dash||[]);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  function cubicPoint(t,p0,p1,p2,p3){
    var u=1-t;
    return {
      x:u*u*u*p0.x+3*u*u*t*p1.x+3*u*t*t*p2.x+t*t*t*p3.x,
      y:u*u*u*p0.y+3*u*u*t*p1.y+3*u*t*t*p2.y+t*t*t*p3.y
    };
  }

  function drawPopulationContours(b,now,alpha){
    var top=b.y+42;
    var usable=b.h-75;
    var samples=64;
    var boundaries=[];
    var i,k;
    for(i=0;i<7;i++) boundaries.push([]);
    for(k=0;k<=samples;k++){
      var t=k/samples;
      var f=mullerFractions(t,.56);
      var x=b.x+t*b.w;
      var y=top+Math.sin(t*7.2+now*.00018)*usable*.015;
      boundaries[0].push([x,y]);
      for(i=0;i<6;i++){
        y+=f[i]*usable;
        boundaries[i+1].push([x,y]);
      }
    }
    ctx.save();
    ctx.globalAlpha*=alpha;
    for(i=0;i<7;i++){
      ctx.beginPath();
      ctx.moveTo(boundaries[i][0][0],boundaries[i][0][1]);
      for(k=1;k<=samples;k++) ctx.lineTo(boundaries[i][k][0],boundaries[i][k][1]);
      ctx.strokeStyle=rgba(PAL[Math.min(i,5)],i===0||i===6?.18:.34);
      ctx.lineWidth=i===0||i===6?.7:1;
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawLivingEcology(alpha,now,stage){
    var b=box();
    frame(b,stage?"CELL ECOLOGY / RESPONSE OVER TIME":"CELL ECOLOGY / SIGNAL + EXCLUSION",alpha);
    ctx.save();
    ctx.globalAlpha=alpha;
    roundedRect(b.x+1,b.y+34,b.w-2,b.h-35,0);
    ctx.clip();

    var opening=stage?.78:.12;
    var left=b.x+b.w*.14;
    var barrier=b.x+b.w*.49;
    var tumourX=b.x+b.w*.74;
    var tumourY=b.y+b.h*.55;
    var tumourR=Math.min(b.w,b.h)*(stage?.245:.285);
    var gateY=b.y+b.h*.48;

    if(stage) drawPopulationContours(b,now,.86);

    var aura=ctx.createRadialGradient(tumourX,tumourY,0,tumourX,tumourY,tumourR*2.15);
    aura.addColorStop(0,rgba(PAL[5],.34));
    aura.addColorStop(.52,rgba(PAL[4],.09));
    aura.addColorStop(1,rgba(PAL[4],0));
    ctx.fillStyle=aura;
    ctx.fillRect(b.x,b.y,b.w,b.h);

    for(var ring=0;ring<5;ring++){
      organicLoop(
        tumourX,tumourY,
        tumourR*(.82+ring*.17),tumourR*(.61+ring*.13),
        ring+now*.00005,
        rgba(ring<2?PAL[3]:PAL[4],.18-ring*.022),
        .8
      );
    }

    for(var f=0;f<10;f++){
      var spread=(f-4.5)*b.w*.025;
      var flex=Math.sin(f*1.73+now*.00035)*8;
      var gate=Math.abs(f-4.5)<1.35;
      var bend=gate?opening*45:opening*9;
      bezier(
        barrier+spread,b.y+36,
        barrier-34+spread+flex,b.y+b.h*.28,
        barrier+32+spread-flex+bend,b.y+b.h*.69,
        barrier-6+spread+bend,b.y+b.h-28,
        rgba(f%3===0?PAL[0]:PAL[1],gate?.27:.39),
        gate?1.1:1.45
      );
    }
    organicLoop(barrier+opening*38,gateY,30+opening*18,17+opening*7,4.2,rgba(PAL[2],.58),1.1,[4,5]);

    var tumourCount=stage?14:19;
    for(var i=0;i<tumourCount;i++){
      var angle=hash(i*5+2)*Math.PI*2;
      var radius=tumourR*Math.sqrt(hash(i*7+5));
      var tx=tumourX+Math.cos(angle)*radius;
      var ty=tumourY+Math.sin(angle)*radius*.68;
      var clone=i%6===0?PAL[4]:i%5===0?PAL[1]:PAL[3];
      organicCell(tx,ty,7+hash(i*11)*7,clone,50+i,.045);
    }

    var immuneCount=stage?10:7;
    for(i=0;i<immuneCount;i++){
      var baseX=left+hash(i*13)*b.w*.19;
      var iy=b.y+55+hash(i*17+4)*(b.h-105);
      var penetration=stage && i<5 ? b.w*(.29+hash(i)*.18) : 0;
      var ix=baseX+penetration+Math.sin(now*.0011+i)*4;
      organicCell(ix,iy,6.5+hash(i*3)*3.5,BLUE,120+i,.035);
      var endX=stage && i<5 ? tumourX-tumourR*.3 : barrier-17;
      var endY=lerp(iy,tumourY+(i-2)*14,stage?.55:.18);
      bezier(ix+8,iy,ix+b.w*.13,iy-18,barrier-38,endY+12,endX,endY,rgba(BLUE,stage?.31:.23),1,[4,5]);
    }

    for(i=0;i<5;i++){
      var start={x:tumourX-tumourR*.35,y:tumourY+(i-2)*tumourR*.2};
      var end={x:barrier-24,y:gateY+(i-2)*19};
      var p1={x:tumourX-b.w*.12,y:start.y-28};
      var p2={x:barrier+55,y:end.y+22};
      bezier(start.x,start.y,p1.x,p1.y,p2.x,p2.y,end.x,end.y,rgba(i%2?PAL[2]:PAL[0],.18),.9,[2,6]);
      var travel=(now*.000045+i*.17)%1;
      var particle=cubicPoint(travel,start,p1,p2,end);
      ctx.fillStyle=i%2?PAL[2]:PAL[0];
      ctx.beginPath();
      ctx.arc(particle.x,particle.y,1.7,0,Math.PI*2);
      ctx.fill();
    }

    if(stage){
      var resolve=(now*.00004)%1;
      var rx=b.x+resolve*b.w;
      line(rx,b.y+38,rx,b.y+b.h-28,"rgba(255,255,255,.24)",.8);
      text("LOCAL INTERACTIONS → POPULATION STATE",b.x+16,b.y+b.h-16,7.5,"rgba(242,239,234,.48)");
    }

    if(W>760){
      text("CD8+ EFFECTORS",left,b.y+52,7.5,rgba(BLUE,.78),"center","500");
      text(stage?"PERMEABLE STROMA":"REACTIVE STROMA",barrier,b.y+52,7.5,rgba(PAL[0],.74),"center","500");
      text(stage?"PRESSURE + ADAPTATION":"IMMUNE-EXCLUDED TUMOUR",tumourX,b.y+52,7.5,rgba(PAL[2],.78),"center","500");
      if(stage) text("ECOLOGY RESOLVING INTO SHAPE",b.x+b.w-16,b.y+b.h-16,7.5,rgba(PAL[2],.68),"right","500");
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
    frame(b,"BRANCHING INTERVENTION SPACE / 29,870 CANDIDATES",alpha);
    ctx.save();
    ctx.globalAlpha=alpha;
    roundedRect(b.x+1,b.y+34,b.w-2,b.h-35,0);
    ctx.clip();

    var top=b.y+48;
    var bottom=b.y+b.h-46;
    var usable=bottom-top;
    var originX=b.x+18;
    var splitX=b.x+b.w*.31;
    var samples=36;
    var bounds=[];
    var i,k;
    for(i=0;i<7;i++) bounds.push([]);
    for(k=0;k<=samples;k++){
      var tt=k/samples;
      var f=mullerFractions(tt,.56);
      var x=lerp(originX,splitX,tt);
      var y=top+Math.sin(tt*5.4+now*.00018)*usable*.012;
      bounds[0].push([x,y]);
      for(i=0;i<6;i++){
        y+=f[i]*usable;
        bounds[i+1].push([x,y]);
      }
    }
    for(i=0;i<6;i++){
      ctx.beginPath();
      ctx.moveTo(bounds[i][0][0],bounds[i][0][1]);
      for(k=1;k<=samples;k++) ctx.lineTo(bounds[i][k][0],bounds[i][k][1]);
      for(k=samples;k>=0;k--) ctx.lineTo(bounds[i+1][k][0],bounds[i+1][k][1]);
      ctx.closePath();
      var ribbon=ctx.createLinearGradient(originX,0,splitX,0);
      ribbon.addColorStop(0,rgba(PAL[i],.55));
      ribbon.addColorStop(1,rgba(PAL[i],.92));
      ctx.fillStyle=ribbon;
      ctx.fill();
      ctx.strokeStyle="rgba(255,255,255,.08)";
      ctx.lineWidth=.7;
      ctx.stroke();
    }

    var splitFractions=mullerFractions(1,.56);
    var cumulative=0;
    var sourceY=[];
    splitFractions.forEach(function(f){
      sourceY.push(top+(cumulative+f*.5)*usable);
      cumulative+=f;
    });

    var branchStart=splitX-1;
    var right=b.x+b.w-24;
    var branchW=right-branchStart;
    var routeCount=W<760?42:86;
    var scan=(now*.000048)%1;
    var scanX=lerp(branchStart,right,scan);
    for(i=0;i<routeCount;i++){
      var p=SEARCH_POINTS[i];
      var band=i%6;
      var sy=sourceY[band]+(hash(i*31)-.5)*Math.max(6,splitFractions[band]*usable*.72);
      var ey=top+10+p.y*(usable-20);
      var ex=branchStart+branchW*(.57+p.x*.43);
      var c1x=branchStart+branchW*(.17+hash(i*17)*.09);
      var c1y=sy+(hash(i*19)-.5)*usable*.18;
      var c2x=branchStart+branchW*(.48+hash(i*23)*.2);
      var c2y=ey+(hash(i*29)-.5)*usable*.24;
      var active=Math.abs(ex-scanX)<44;
      bezier(branchStart,sy,c1x,c1y,c2x,c2y,ex,ey,rgba(PAL[band],active?.74:.15),active?1.05:.65);
      ctx.fillStyle=rgba(p.q>.86?PAL[band]:"#6A6170",active?.9:.42);
      ctx.beginPath();
      ctx.arc(ex,ey,active?2.2:1.15,0,Math.PI*2);
      ctx.fill();
    }

    var scanGlow=ctx.createLinearGradient(scanX-54,0,scanX+54,0);
    scanGlow.addColorStop(0,rgba(BLUE,0));
    scanGlow.addColorStop(.5,rgba(BLUE,.11));
    scanGlow.addColorStop(1,rgba(BLUE,0));
    ctx.fillStyle=scanGlow;
    ctx.fillRect(scanX-54,top,108,usable);
    line(scanX,top,scanX,bottom,rgba(BLUE,.38),.8);

    var selectedBand=2;
    var selectedStart={x:branchStart,y:sourceY[selectedBand]};
    var selectedEnd={x:right-5,y:top+usable*.34};
    var selectedC1={x:branchStart+branchW*.22,y:selectedStart.y-usable*.1};
    var selectedC2={x:branchStart+branchW*.66,y:selectedEnd.y+usable*.16};
    bezier(
      selectedStart.x,selectedStart.y,
      selectedC1.x,selectedC1.y,
      selectedC2.x,selectedC2.y,
      selectedEnd.x,selectedEnd.y,
      rgba(PAL[2],.96),2
    );
    ["MECHANISM","SEQUENCE","DELIVERY"].forEach(function(name,n){
      var q=.28+n*.25;
      var node=cubicPoint(q,selectedStart,selectedC1,selectedC2,selectedEnd);
      ctx.fillStyle=BG;
      ctx.strokeStyle=PAL[2];
      ctx.lineWidth=1.2;
      ctx.beginPath();
      ctx.arc(node.x,node.y,4.2,0,Math.PI*2);
      ctx.fill();
      ctx.stroke();
      if(W>760) text(name,node.x,node.y-9,6.5,"rgba(242,239,234,.54)","center","500");
    });
    ctx.strokeStyle=rgba(PAL[2],.92);
    ctx.lineWidth=1.3;
    ctx.beginPath();
    ctx.arc(selectedEnd.x,selectedEnd.y,8+Math.sin(now*.004)*1.8,0,Math.PI*2);
    ctx.stroke();
    text("08,412",selectedEnd.x-13,selectedEnd.y-13,8,rgba(PAL[2],.96),"right","500");
    text("ONE BIOLOGICAL ORIGIN",originX,bottom+22,7.5,"rgba(242,239,234,.44)");
    text("COMBINATION × SEQUENCE × DELIVERY",right,bottom+22,7.5,"rgba(242,239,234,.44)","right");
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
      text(String(m).padStart(2,"0"),x,b.y+b.h-28,8,"rgba(242,239,234,.4)","center");
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
    ctx.fillStyle=INK;ctx.beginPath();ctx.arc(px,y0-24,2.5,0,Math.PI*2);ctx.fill();
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
    for(i=0;i<7;i++) bounds.push([]);
    for(k=0;k<=samples;k++){
      var t=k/samples,f=mullerFractions(t,response),y=cy-h/2;
      bounds[0].push([cx-w/2+t*w,y]);
      for(i=0;i<6;i++){ y+=f[i]*h; bounds[i+1].push([cx-w/2+t*w,y]); }
    }
    for(i=0;i<6;i++){
      ctx.beginPath();ctx.moveTo(bounds[i][0][0],bounds[i][0][1]);
      for(k=1;k<=samples;k++)ctx.lineTo(bounds[i][k][0],bounds[i][k][1]);
      for(k=samples;k>=0;k--)ctx.lineTo(bounds[i+1][k][0],bounds[i+1][k][1]);
      ctx.closePath();ctx.fillStyle=PAL[i];ctx.fill();
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
      line(x0,Y(g),x1,Y(g),"rgba(255,255,255,.075)",1);
      text(g+"",x0-9,Y(g)+3,7,"rgba(242,239,234,.4)","right");
    }
    for(var m=0;m<=60;m+=12) text(m+"",X(m),y1+20,7,"rgba(242,239,234,.4)","center");
    var combo=[[0,100],[6,99],[12,96],[18,92],[24,86],[30,80],[36,73],[42,66],[48,60],[54,55],[60,51]];
    var control=[[0,100],[6,90],[12,78],[18,64],[24,51],[30,40],[36,31],[42,24],[48,19],[54,15],[60,12]];
    stepPath(control,X,Y,"rgba(124,115,145,.82)",1.8);
    stepPath(combo,X,Y,rgba("#EC7EA6",.98),2.4);
    [[12,95],[24,84],[36,64],[48,58],[60,49]].forEach(function(p,i){
      ctx.fillStyle=BG;ctx.strokeStyle="#EC7EA6";ctx.lineWidth=1.4;
      ctx.beginPath();ctx.arc(X(p[0]),Y(p[1]),3.2,0,Math.PI*2);ctx.fill();ctx.stroke();
    });
    var tx=X(36),ty=Y(73);
    line(tx,ty,tx+68,ty-42,rgba("#EC7EA6",.5),1);
    text("SELECTED REGIMEN",tx+73,ty-45,8,rgba("#EC7EA6",.95),"left","500");
    text("DURABLE SEPARATION",tx+73,ty-31,7,"rgba(242,239,234,.5)");
    text("MONTHS",x1,y1+20,7,"rgba(242,239,234,.4)","right");
    ctx.restore();
  }

  function drawScene(index,alpha,now){
    if(alpha<=.001 || index<0 || index>7) return;
    if(index===0) drawLivingEcology(alpha,now,0);
    if(index===1) drawLivingEcology(alpha,now,1);
    if(index===2) drawMuller(alpha,now,.56,true);
    if(index===3) drawSearch(alpha,now);
    if(index===4) drawPareto(alpha,now);
    if(index===5) drawSequence(alpha,now);
    if(index===6) drawRisk(alpha,now);
    if(index===7) drawSurvival(alpha,now);
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
    }
  }

  function render(now){
    raf=0;
    if(!lastTime) lastTime=now;
    if(reduced) renderedScene=targetScene;
    else renderedScene=lerp(renderedScene,targetScene,.085);
    ctx.setTransform(DPR,0,0,DPR,0,0);
    ctx.clearRect(0,0,W,H);
    ctx.fillStyle=BG;ctx.fillRect(0,0,W,H);

    var base=Math.floor(renderedScene);
    var mix=smooth(renderedScene-base);
    var drawTime=reduced?0:now;
    drawScene(base,1-mix,drawTime);
    drawScene(Math.min(base+1,7),mix,drawTime);

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
