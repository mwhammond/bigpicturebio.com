/* ==========================================================================
   Big Picture Bio — one three-colour gesture, continuously transformed.
   Survival → Muller populations → biology → generated intervention paths.
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
  var reduced=window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var BG="#08090C";
  var IVORY="#F2EFEA";
  var ROSE="#EC7EA6";
  var BLUE="#83B9FF";
  var COLORS=[ROSE,BLUE,IVORY];
  var SCENES=[
    "01 — SURVIVAL",
    "01 — SURVIVAL",
    "02 — EVOLVING POPULATIONS",
    "03 — BIOLOGICAL INTERACTION",
    "04 — GENERATE"
  ];

  var W=0,H=0,DPR=1;
  var targetScene=0;
  var renderedScene=0;
  var activeScene=-1;
  var visible=true;
  var raf=0;

  function clamp(v,a,b){ return Math.max(a,Math.min(b,v)); }
  function lerp(a,b,t){ return a+(b-a)*t; }
  function smooth(t){ return t*t*(3-2*t); }
  function rgba(hex,a){
    var n=parseInt(hex.slice(1),16);
    return "rgba("+((n>>16)&255)+","+((n>>8)&255)+","+(n&255)+","+a+")";
  }
  function text(str,x,y,size,color,align,weight,font){
    ctx.fillStyle=color||IVORY;
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
    ctx.lineCap="round";
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
    ctx.lineCap="round";
    ctx.lineJoin="round";
    ctx.setLineDash(dash||[]);
    ctx.stroke();
    ctx.setLineDash([]);
  }
  function panel(){
    if(W<820){
      return {x:20,y:88,w:W-40,h:Math.min(H*.48,400)};
    }
    return {
      x:Math.max(W*.475,540),
      y:Math.max(116,H*.16),
      w:W-Math.max(W*.475,540)-54,
      h:H-Math.max(116,H*.16)-116
    };
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

  function drawPlotFrame(b,title,alpha,yLabel){
    ctx.save();
    ctx.globalAlpha=alpha;
    var x0=b.x+b.w*.08;
    var x1=b.x+b.w*.96;
    var y0=b.y+b.h*.13;
    var y1=b.y+b.h*.88;

    text(title,b.x,b.y-18,9,rgba(IVORY,.56),"left","500");
    line(x0,y1,x1,y1,rgba(IVORY,.36),1.4);
    line(x0,y0,x0,y1,rgba(IVORY,.36),1.4);

    [0,12,24,36,48,60].forEach(function(month){
      var x=lerp(x0,x1,month/60);
      line(x,y1-4,x,y1+4,rgba(IVORY,.34),1);
      text(String(month),x,y1+20,8,rgba(IVORY,.45),"center");
    });
    [0,25,50,75,100].forEach(function(value){
      var y=lerp(y1,y0,value/100);
      line(x0-4,y,x0+4,y,rgba(IVORY,.34),1);
      if(value>0) text(value+"%",x0-10,y+3,8,rgba(IVORY,.45),"right");
    });
    text("MONTHS",x1,y1+20,8,rgba(IVORY,.44),"right");
    ctx.save();
    ctx.translate(x0-30,y0);
    ctx.rotate(-Math.PI/2);
    text(yLabel||"SURVIVAL",0,0,8,rgba(IVORY,.44),"right");
    ctx.restore();
    ctx.restore();
  }

  function stepPoints(values,b){
    var pts=[];
    var x0=b.x+b.w*.08;
    var x1=b.x+b.w*.96;
    var y0=b.y+b.h*.13;
    var y1=b.y+b.h*.88;
    values.forEach(function(value,i){
      var x=lerp(x0,x1,i/(values.length-1));
      var y=lerp(y1,y0,value/100);
      if(i>0) pts.push({x:x,y:pts[pts.length-1].y});
      pts.push({x:x,y:y});
    });
    return resample(pts,72);
  }

  function resample(points,count){
    var out=[];
    for(var i=0;i<count;i++){
      var q=i/(count-1)*(points.length-1);
      var lo=Math.floor(q);
      var hi=Math.min(points.length-1,lo+1);
      var t=q-lo;
      out.push({
        x:lerp(points[lo].x,points[hi].x,t),
        y:lerp(points[lo].y,points[hi].y,t)
      });
    }
    return out;
  }

  function wavePath(b,index){
    var out=[];
    for(var i=0;i<72;i++){
      var t=i/71;
      var x=lerp(b.x+b.w*.08,b.x+b.w*.96,t);
      var base=[.68,.34,.52][index];
      var amp=[.14,.105,.065][index];
      var phase=[.2,1.7,3.2][index];
      var y=b.y+b.h*(base+Math.sin(t*5.2+phase)*amp+Math.sin(t*10+phase)*.018);
      out.push({x:x,y:y});
    }
    return out;
  }

  function loopPath(b,index,now){
    var out=[];
    var cx=[.74,.49,.62][index];
    var cy=[.54,.56,.52][index];
    var rx=[.18,.105,.035][index];
    var ry=[.25,.16,.36][index];
    for(var i=0;i<72;i++){
      var t=i/71;
      var a=t*Math.PI*2-Math.PI;
      var wobble=1+Math.sin(a*(index===1?5:3)+index+now*.00008)*.045;
      var x=b.x+b.w*(cx+Math.cos(a)*rx*wobble);
      var y=b.y+b.h*(cy+Math.sin(a)*ry*wobble);
      if(index===2){
        x+=Math.sin(a*2.1)*b.w*.018;
      }
      out.push({x:x,y:y});
    }
    return out;
  }

  function branchPath(b,index,now){
    var out=[];
    var start={x:b.x+b.w*.22,y:b.y+b.h*.54};
    var end={
      x:b.x+b.w*.96,
      y:b.y+b.h*[.23,.50,.78][index]
    };
    var c1={x:b.x+b.w*.43,y:start.y+b.h*([-.04,.08,.05][index])};
    var c2={x:b.x+b.w*.67,y:end.y+b.h*([.14,-.08,-.13][index])};
    for(var i=0;i<72;i++){
      var t=i/71;
      var u=1-t;
      var x=u*u*u*start.x+3*u*u*t*c1.x+3*u*t*t*c2.x+t*t*t*end.x;
      var y=u*u*u*start.y+3*u*u*t*c1.y+3*u*t*t*c2.y+t*t*t*end.y;
      y+=Math.sin(t*14+index*1.7+now*.0005)*b.h*.006*t;
      out.push({x:x,y:y});
    }
    return out;
  }

  function pathFor(scene,index,b,now){
    if(scene<=1){
      var curves=[
        [100,99,96,92,87,81,75,69,64,59,55],
        [100,91,80,68,56,45,36,28,22,17,13],
        [100,98,95,91,85,79,73,68,63,59,56]
      ];
      return stepPoints(curves[index],b);
    }
    if(scene===2) return wavePath(b,index);
    if(scene===3) return loopPath(b,index,now);
    return branchPath(b,index,now);
  }

  function strokePath(points,color,width,alpha,dash){
    if(!points.length) return;
    ctx.save();
    ctx.globalAlpha=alpha;
    ctx.beginPath();
    ctx.moveTo(points[0].x,points[0].y);
    for(var i=1;i<points.length;i++) ctx.lineTo(points[i].x,points[i].y);
    ctx.strokeStyle=color;
    ctx.lineWidth=width;
    ctx.lineCap="round";
    ctx.lineJoin="round";
    ctx.setLineDash(dash||[]);
    ctx.shadowColor=rgba(color,.32);
    ctx.shadowBlur=width*1.35;
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }

  function drawMorphThreads(sceneFloat,now){
    var b=panel();
    var base=Math.floor(sceneFloat);
    var next=Math.min(SCENES.length-1,base+1);
    var mix=smooth(sceneFloat-base);
    var widths=[
      [5.8,4.6,3.2],
      [5.8,4.6,3.2],
      [10,8,7],
      [12,10,17],
      [8,8,8]
    ];

    [2,0,1].forEach(function(index){
      var a=pathFor(base,index,b,now);
      var c=pathFor(next,index,b,now);
      var points=a.map(function(p,i){
        return {x:lerp(p.x,c[i].x,mix),y:lerp(p.y,c[i].y,mix)};
      });
      var width=lerp(widths[base][index],widths[next][index],mix);
      var dash=index===2 && sceneFloat<1.7?[8,10]:[];
      strokePath(points,COLORS[index],width,index===2?.82:.96,dash);
    });
  }

  function drawSurvivalContext(alpha,now,detailed){
    var b=panel();
    drawPlotFrame(b,detailed?"PREDICTED VS. ACTUAL SURVIVAL":"THE OUTCOME TO CHANGE",alpha,"SURVIVAL");
    ctx.save();
    ctx.globalAlpha=alpha;
    var x0=b.x+b.w*.08;
    var x1=b.x+b.w*.96;
    var y0=b.y+b.h*.13;
    var y1=b.y+b.h*.88;
    var sweep=(now*.00005)%1;
    var sx=lerp(x0,x1,sweep);
    var glow=ctx.createLinearGradient(sx-60,0,sx+60,0);
    glow.addColorStop(0,rgba(BLUE,0));
    glow.addColorStop(.5,rgba(BLUE,.10));
    glow.addColorStop(1,rgba(BLUE,0));
    ctx.fillStyle=glow;
    ctx.fillRect(sx-60,y0,120,y1-y0);

    if(detailed){
      text("DESIGNED TRAJECTORY",x1-4,b.y+b.h*.49,8,rgba(ROSE,.92),"right","600");
      text("CURRENT OUTCOME",x1-4,b.y+b.h*.82,8,rgba(IVORY,.72),"right","600");
      text("MODEL",x1-4,b.y+b.h*.61,8,rgba(BLUE,.82),"right","600");
      [[.25,.34],[.50,.46],[.73,.58],[.90,.65]].forEach(function(p){
        var x=lerp(x0,x1,p[0]);
        var y=lerp(y0,y1,p[1]);
        line(x-4,y-4,x+4,y+4,rgba(ROSE,.9),1.6);
        line(x-4,y+4,x+4,y-4,rgba(ROSE,.9),1.6);
      });
      var deltaY=b.y+b.h*.59;
      line(b.x+b.w*.57,deltaY,b.x+b.w*.57,b.y+b.h*.78,rgba(ROSE,.55),2);
      line(b.x+b.w*.55,deltaY,b.x+b.w*.59,deltaY,rgba(ROSE,.55),2);
      line(b.x+b.w*.55,b.y+b.h*.78,b.x+b.w*.59,b.y+b.h*.78,rgba(ROSE,.55),2);
      text("TIME RETURNED",b.x+b.w*.59,b.y+b.h*.70,8,rgba(ROSE,.82),"left","600");
    }
    ctx.restore();
  }

  function mullerShares(t){
    var cancer=.58-.34*smooth(clamp((t-.10)/.82,0,1))+.08*Math.exp(-Math.pow((t-.78)*7,2));
    var immune=.13+.30*smooth(clamp((t-.04)/.76,0,1));
    var stroma=Math.max(.10,1-cancer-immune);
    var total=cancer+immune+stroma;
    return [cancer/total,immune/total,stroma/total];
  }

  function drawMullerContext(alpha){
    var b=panel();
    drawPlotFrame(b,"MULLER POPULATION LANDSCAPE / SAME TIMELINE",alpha,"POPULATION SHARE");
    var x0=b.x+b.w*.08;
    var x1=b.x+b.w*.96;
    var y0=b.y+b.h*.13;
    var y1=b.y+b.h*.88;
    var samples=80;
    var bounds=[[],[],[],[]];

    for(var k=0;k<=samples;k++){
      var t=k/samples;
      var shares=mullerShares(t);
      var x=lerp(x0,x1,t);
      var y=y0;
      bounds[0].push({x:x,y:y});
      for(var i=0;i<3;i++){
        y+=(y1-y0)*shares[i];
        bounds[i+1].push({x:x,y:y});
      }
    }

    ctx.save();
    ctx.globalAlpha=alpha;
    for(var band=0;band<3;band++){
      ctx.beginPath();
      ctx.moveTo(bounds[band][0].x,bounds[band][0].y);
      for(k=1;k<=samples;k++) ctx.lineTo(bounds[band][k].x,bounds[band][k].y);
      for(k=samples;k>=0;k--) ctx.lineTo(bounds[band+1][k].x,bounds[band+1][k].y);
      ctx.closePath();
      ctx.fillStyle=rgba(COLORS[band],band===2?.20:.26);
      ctx.fill();
      ctx.strokeStyle=rgba(COLORS[band],.84);
      ctx.lineWidth=3.6;
      ctx.lineJoin="round";
      ctx.stroke();
    }
    var labelX=b.x+b.w*.80;
    var labelT=.82;
    var s=mullerShares(labelT);
    var cumulative=0;
    ["CANCER CLONES","IMMUNE PRESSURE","STROMA"].forEach(function(label,i){
      var y=lerp(y0,y1,cumulative+s[i]*.5);
      text(label,labelX,y+3,8,rgba(COLORS[i],.94),"left","600");
      cumulative+=s[i];
    });
    text("THE CURVE OPENS INTO THE SYSTEM BENEATH IT",x0,y0-14,8,rgba(IVORY,.48),"left","500");
    ctx.restore();
  }

  function organicLoop(cx,cy,rx,ry,seed,color,width,alpha,now){
    ctx.save();
    ctx.globalAlpha=alpha;
    ctx.beginPath();
    for(var i=0;i<=72;i++){
      var a=i/72*Math.PI*2;
      var ripple=1+Math.sin(a*3+seed+now*.00008)*.045+Math.sin(a*7-seed)*.018;
      var x=cx+Math.cos(a)*rx*ripple;
      var y=cy+Math.sin(a)*ry*ripple;
      if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
    }
    ctx.closePath();
    ctx.strokeStyle=color;
    ctx.lineWidth=width;
    ctx.lineCap="round";
    ctx.lineJoin="round";
    ctx.stroke();
    ctx.restore();
  }

  function drawBiologyContext(alpha,now){
    var b=panel();
    ctx.save();
    ctx.globalAlpha=alpha;
    text("BIOLOGICAL INTERACTION / ZOOMED IN",b.x,b.y-18,9,rgba(IVORY,.56),"left","500");

    var tumourX=b.x+b.w*.74;
    var tumourY=b.y+b.h*.54;
    var immuneX=b.x+b.w*.49;
    var immuneY=b.y+b.h*.56;
    var barrierX=b.x+b.w*.62;

    organicLoop(tumourX-b.w*.06,tumourY-b.h*.07,b.w*.092,b.h*.13,1.2,rgba(ROSE,.70),5,1,now);
    organicLoop(tumourX+b.w*.06,tumourY-b.h*.02,b.w*.10,b.h*.14,3.1,rgba(ROSE,.78),5.5,1,now);
    organicLoop(tumourX,tumourY+b.h*.11,b.w*.105,b.h*.135,5.2,rgba(ROSE,.68),5,1,now);
    organicLoop(tumourX+b.w*.055,tumourY-b.h*.02,b.w*.035,b.h*.045,7,rgba(ROSE,.48),3,1,now);

    for(var f=-1;f<=1;f++){
      bezier(
        barrierX+f*13,b.y+b.h*.17,
        barrierX-24+f*13,b.y+b.h*.38,
        barrierX+24+f*13,b.y+b.h*.70,
        barrierX-3+f*13,b.y+b.h*.88,
        rgba(IVORY,.38+Math.abs(f)*.08),
        6
      );
    }

    organicLoop(immuneX,immuneY,b.w*.075,b.h*.11,4.4,rgba(BLUE,.92),6,1,now);
    for(var p=0;p<7;p++){
      var a=p/7*Math.PI*2;
      var x1=immuneX+Math.cos(a)*b.w*.073;
      var y1=immuneY+Math.sin(a)*b.h*.105;
      var x2=immuneX+Math.cos(a)*b.w*.105;
      var y2=immuneY+Math.sin(a)*b.h*.15;
      line(x1,y1,x2,y2,rgba(BLUE,.75),4);
    }
    organicLoop(immuneX,immuneY,b.w*.026,b.h*.038,2.3,rgba(BLUE,.55),3,1,now);

    var contactX=barrierX-3;
    var contactY=immuneY;
    line(immuneX+b.w*.08,immuneY,contactX-12,contactY,rgba(BLUE,.72),5);
    line(contactX+12,contactY,tumourX-b.w*.12,tumourY,rgba(ROSE,.65),5);
    ctx.fillStyle=IVORY;
    ctx.beginPath();
    ctx.arc(contactX,contactY,7+Math.sin(now*.004)*1.2,0,Math.PI*2);
    ctx.fill();

    text("CD8+ T CELL",immuneX,b.y+b.h*.25,8,rgba(BLUE,.98),"center","600");
    line(immuneX,b.y+b.h*.27,immuneX,immuneY-b.h*.14,rgba(BLUE,.55),1.4);
    text("STROMAL BARRIER",barrierX,b.y+b.h*.10,8,rgba(IVORY,.80),"center","600");
    line(barrierX,b.y+b.h*.12,barrierX,b.y+b.h*.18,rgba(IVORY,.48),1.4);
    text("CANCER CLONE",tumourX,b.y+b.h*.18,8,rgba(ROSE,.98),"center","600");
    line(tumourX,b.y+b.h*.20,tumourX,tumourY-b.h*.19,rgba(ROSE,.55),1.4);
    text("CONTACT",contactX,contactY+28,8,rgba(IVORY,.74),"center","600");
    ctx.restore();
  }

  function drawGenerateContext(alpha,now){
    var b=panel();
    ctx.save();
    ctx.globalAlpha=alpha;
    text("GENERATED INTERVENTION SPACE",b.x,b.y-18,9,rgba(IVORY,.56),"left","500");
    var ox=b.x+b.w*.22;
    var oy=b.y+b.h*.54;
    var branchColors=[ROSE,IVORY,BLUE,ROSE,BLUE,IVORY,ROSE,BLUE,IVORY];
    var branchYs=[.17,.24,.34,.43,.50,.59,.68,.77,.84];

    branchYs.forEach(function(yRatio,i){
      var endX=b.x+b.w*(.77+(i%3)*.085);
      var endY=b.y+b.h*yRatio;
      var c1x=b.x+b.w*.40;
      var c1y=oy+(i-4)*b.h*.012;
      var c2x=b.x+b.w*.62;
      var c2y=endY+Math.sin(i*1.8+now*.0004)*b.h*.055;
      bezier(ox,oy,c1x,c1y,c2x,c2y,endX,endY,rgba(branchColors[i],i===4?.96:.58),i===4?9:5.5);
    });

    ctx.fillStyle=IVORY;
    ctx.beginPath();
    ctx.arc(ox,oy,8+Math.sin(now*.004)*1.2,0,Math.PI*2);
    ctx.fill();
    ctx.strokeStyle=rgba(IVORY,.30);
    ctx.lineWidth=2;
    ctx.beginPath();
    ctx.arc(ox,oy,18+Math.sin(now*.003)*2,0,Math.PI*2);
    ctx.stroke();

    text("ONE BIOLOGICAL ORIGIN",ox,oy+36,8,rgba(IVORY,.64),"center","600");
    text("MECHANISM",b.x+b.w*.88,b.y+b.h*.14,8,rgba(ROSE,.84),"center","600");
    text("SEQUENCE",b.x+b.w*.92,b.y+b.h*.48,8,rgba(BLUE,.90),"center","600");
    text("DELIVERY",b.x+b.w*.88,b.y+b.h*.91,8,rgba(IVORY,.75),"center","600");

    text("12,308",b.x+b.w*.72,b.y+b.h*.66,44,rgba(IVORY,.96),"left","400",'"Source Serif 4", Georgia, serif');
    text("COMBINATIONS EXPLORED",b.x+b.w*.72,b.y+b.h*.70,8,rgba(IVORY,.58),"left","600");
    text("FROM 16 BILLION+ POSSIBLE COMBINATIONS + SEQUENCES",b.x+b.w*.72,b.y+b.h*.735,7,rgba(IVORY,.40),"left","500");
    ctx.restore();
  }

  function drawSceneContext(index,alpha,now){
    if(alpha<=.001) return;
    if(index===0) drawSurvivalContext(alpha*.70,now,false);
    if(index===1) drawSurvivalContext(alpha,now,true);
    if(index===2) drawMullerContext(alpha);
    if(index===3) drawBiologyContext(alpha,now);
    if(index===4) drawGenerateContext(alpha,now);
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
      if(sceneLabel) sceneLabel.textContent=SCENES[idx];
    }
  }

  function render(now){
    raf=0;
    renderedScene=reduced?targetScene:lerp(renderedScene,targetScene,.075);
    ctx.setTransform(DPR,0,0,DPR,0,0);
    ctx.clearRect(0,0,W,H);
    ctx.fillStyle=BG;
    ctx.fillRect(0,0,W,H);

    var glow=ctx.createRadialGradient(W*.77,H*.50,0,W*.77,H*.50,Math.max(W,H)*.65);
    glow.addColorStop(0,rgba(ROSE,.075));
    glow.addColorStop(.55,rgba(BLUE,.025));
    glow.addColorStop(1,rgba(BG,0));
    ctx.fillStyle=glow;
    ctx.fillRect(0,0,W,H);

    var base=Math.floor(renderedScene);
    var next=Math.min(SCENES.length-1,base+1);
    var mix=smooth(renderedScene-base);
    drawSceneContext(base,1-mix,now);
    if(next!==base) drawSceneContext(next,mix,now);
    drawMorphThreads(renderedScene,reduced?0:now);

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
      if(!visible && raf){
        cancelAnimationFrame(raf);
        raf=0;
      }
    },{rootMargin:"120px 0px"}).observe(story);
  }

  resize();
  updateStory();
  raf=requestAnimationFrame(render);

  window.addEventListener("pagehide",function(){
    visible=false;
    if(raf){
      cancelAnimationFrame(raf);
      raf=0;
    }
  });
})();
