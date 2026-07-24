/* ==========================================================================
   Big Picture Bio — illustrated scientific folio.
   A Muller landscape is opened, zoomed into biology, branched into possible
   interventions and redrawn by the selected design.
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
  var sourceImage=new Image();
  sourceImage.src="/img/muller-folio.png";

  var BG="#08090C";
  var PAPER="#EEDFC8";
  var PAPER_DARK="#D8C3A4";
  var INK="#17283B";
  var INK_SOFT="#3A4652";
  var GOLD="#E3A43E";
  var CORAL="#E98355";
  var ROSE="#D75079";
  var PLUM="#5A294B";
  var LILAC="#8A6BA0";
  var BLUE="#8CACCD";
  var PALETTE=[GOLD,CORAL,ROSE,PLUM,LILAC,BLUE];
  var SCENES=[
    "01 — EVOLVING POPULATIONS",
    "01 — EVOLVING POPULATIONS",
    "02 — ZOOM INTO BIOLOGY",
    "03 — GENERATE",
    "04 — REDRAW THE LANDSCAPE"
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
  function hash(n){
    var x=Math.sin(n*127.1+311.7)*43758.5453123;
    return x-Math.floor(x);
  }
  function text(str,x,y,size,color,align,weight,font){
    ctx.fillStyle=color||INK;
    ctx.font=(weight||"400")+" "+size+"px "+(font||'"Geist Mono", monospace');
    ctx.textAlign=align||"left";
    ctx.textBaseline="alphabetic";
    ctx.fillText(str,x,y);
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
  function resize(){
    var r=canvas.getBoundingClientRect();
    W=Math.max(1,r.width);
    H=Math.max(1,r.height);
    DPR=Math.min(window.devicePixelRatio||1,2);
    canvas.width=Math.round(W*DPR);
    canvas.height=Math.round(H*DPR);
    ctx.setTransform(DPR,0,0,DPR,0,0);
  }
  function folio(){
    if(W<820){
      var mw=W-32;
      return {x:16,y:78,w:mw,h:Math.min(H*.48,mw*.58),r:16};
    }
    var x=Math.max(W*.43,500);
    var w=W-x-42;
    return {x:x,y:Math.max(118,H*.16),w:w,h:Math.min(H*.68,w*.57),r:18};
  }

  function paper(b,alpha){
    ctx.save();
    ctx.globalAlpha=alpha;
    ctx.shadowColor="rgba(0,0,0,.52)";
    ctx.shadowBlur=44;
    ctx.shadowOffsetY=18;
    roundedRect(b.x,b.y,b.w,b.h,b.r);
    ctx.fillStyle=PAPER;
    ctx.fill();
    ctx.shadowColor="transparent";
    ctx.clip();

    var wash=ctx.createLinearGradient(b.x,b.y,b.x+b.w,b.y+b.h);
    wash.addColorStop(0,"rgba(255,249,233,.58)");
    wash.addColorStop(.52,"rgba(238,223,200,.08)");
    wash.addColorStop(1,"rgba(197,168,132,.18)");
    ctx.fillStyle=wash;
    ctx.fillRect(b.x,b.y,b.w,b.h);

    for(var i=0;i<300;i++){
      var px=b.x+hash(i*3+1)*b.w;
      var py=b.y+hash(i*3+2)*b.h;
      var radius=.35+hash(i*3+3)*1.25;
      ctx.fillStyle=i%3===0?"rgba(99,71,47,.025)":"rgba(255,255,255,.045)";
      ctx.beginPath();
      ctx.arc(px,py,radius,0,Math.PI*2);
      ctx.fill();
    }
    ctx.restore();
  }

  function clipFolio(b,alpha,fn){
    ctx.save();
    ctx.globalAlpha=alpha;
    roundedRect(b.x,b.y,b.w,b.h,b.r);
    ctx.clip();
    fn();
    ctx.restore();
  }

  function drawSourceMuller(alpha,now,annotate,zoom){
    var b=folio();
    paper(b,alpha);
    clipFolio(b,alpha,function(){
      if(sourceImage.complete && sourceImage.naturalWidth){
        var iw=sourceImage.naturalWidth;
        var ih=sourceImage.naturalHeight;
        var z=zoom||0;
        var sx=lerp(0,iw*.31,z);
        var sy=lerp(0,ih*.13,z);
        var sw=lerp(iw,iw*.62,z);
        var sh=lerp(ih,ih*.72,z);
        ctx.drawImage(sourceImage,sx,sy,sw,sh,b.x,b.y,b.w,b.h);
      }

      var sweep=(now*.000035)%1;
      var sx2=b.x+b.w*sweep;
      var glow=ctx.createLinearGradient(sx2-50,0,sx2+50,0);
      glow.addColorStop(0,"rgba(255,255,255,0)");
      glow.addColorStop(.5,"rgba(255,250,237,.17)");
      glow.addColorStop(1,"rgba(255,255,255,0)");
      ctx.fillStyle=glow;
      ctx.fillRect(sx2-50,b.y,100,b.h);
    });

    if(!annotate) return;
    ctx.save();
    ctx.globalAlpha=alpha;
    text("MULLER POPULATION LANDSCAPE",b.x+24,b.y+31,9,rgba(INK,.72),"left","600");
    text("0",b.x+24,b.y+b.h-20,8,rgba(INK,.55));
    text("36 MONTHS",b.x+b.w-24,b.y+b.h-20,8,rgba(INK,.55),"right");
    line(b.x+24,b.y+b.h-35,b.x+b.w-24,b.y+b.h-35,rgba(INK,.22),1.2);
    ["IMMUNE PRESSURE","SENSITIVE CLONE","RESISTANT CLONE"].forEach(function(label,i){
      var lx=b.x+b.w*.83;
      var ly=b.y+b.h*[.25,.48,.71][i];
      text(label,lx,ly,8,rgba(INK,.68),"left","600");
      line(lx-62,ly-3,lx-10,ly-3,rgba(PALETTE[[0,2,4][i]],.86),2);
    });
    ctx.restore();
  }

  function watercolorBlob(cx,cy,rx,ry,color,seed,alpha){
    ctx.save();
    ctx.globalAlpha=alpha;
    for(var layer=0;layer<7;layer++){
      ctx.beginPath();
      for(var i=0;i<=44;i++){
        var a=i/44*Math.PI*2;
        var ripple=1+Math.sin(a*3+seed+layer)*.04+Math.sin(a*7-seed)*.025;
        var x=cx+Math.cos(a)*rx*ripple+(hash(layer*31+seed)-.5)*4;
        var y=cy+Math.sin(a)*ry*ripple+(hash(layer*37+seed)-.5)*4;
        if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
      }
      ctx.closePath();
      ctx.fillStyle=rgba(color,.055);
      ctx.fill();
    }
    ctx.beginPath();
    for(i=0;i<=56;i++){
      a=i/56*Math.PI*2;
      ripple=1+Math.sin(a*3+seed)*.045+Math.sin(a*8-seed)*.018;
      x=cx+Math.cos(a)*rx*ripple;
      y=cy+Math.sin(a)*ry*ripple;
      if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
    }
    ctx.closePath();
    ctx.strokeStyle=rgba(INK,.74);
    ctx.lineWidth=1.9;
    ctx.stroke();
    ctx.restore();
  }

  function drawBiology(alpha,now,transition){
    var b=folio();
    paper(b,alpha);
    clipFolio(b,alpha,function(){
      var tumourX=b.x+b.w*.73;
      var tumourY=b.y+b.h*.55;
      var immuneX=b.x+b.w*.29;
      var immuneY=b.y+b.h*.55;
      var barrierX=b.x+b.w*.50;

      for(var f=-2;f<=2;f++){
        bezier(
          barrierX+f*10,b.y+b.h*.12,
          barrierX-28+f*11,b.y+b.h*.34,
          barrierX+28+f*9,b.y+b.h*.69,
          barrierX-4+f*12,b.y+b.h*.90,
          rgba(GOLD,.36),
          4.5
        );
      }

      watercolorBlob(tumourX-b.w*.07,tumourY-b.h*.08,b.w*.09,b.h*.14,ROSE,2.2,.95);
      watercolorBlob(tumourX+b.w*.07,tumourY-b.h*.02,b.w*.10,b.h*.15,PLUM,4.1,.95);
      watercolorBlob(tumourX,tumourY+b.h*.13,b.w*.105,b.h*.15,CORAL,6.5,.95);
      watercolorBlob(immuneX,immuneY,b.w*.085,b.h*.14,BLUE,8.2,.95);

      for(var p=0;p<7;p++){
        var a=p/7*Math.PI*2;
        line(
          immuneX+Math.cos(a)*b.w*.078,
          immuneY+Math.sin(a)*b.h*.13,
          immuneX+Math.cos(a)*b.w*.115,
          immuneY+Math.sin(a)*b.h*.18,
          rgba(INK,.58),
          2
        );
      }
      watercolorBlob(immuneX,immuneY,b.w*.028,b.h*.045,LILAC,9.8,.72);

      var contactX=barrierX;
      line(immuneX+b.w*.09,immuneY,contactX-13,immuneY,rgba(BLUE,.78),3);
      line(contactX+13,immuneY,tumourX-b.w*.15,tumourY,rgba(ROSE,.72),3);
      ctx.fillStyle=INK;
      ctx.beginPath();
      ctx.arc(contactX,immuneY,6+Math.sin(now*.004)*1.1,0,Math.PI*2);
      ctx.fill();

      if(transition>0){
        ctx.globalAlpha*=1-transition;
      }
    });

    ctx.save();
    ctx.globalAlpha=alpha;
    text("ZOOM / BIOLOGICAL INTERACTION",b.x+24,b.y+31,9,rgba(INK,.72),"left","600");
    text("CD8+ T CELL",b.x+b.w*.29,b.y+b.h*.22,8,rgba(INK,.67),"center","600");
    text("STROMAL BARRIER",b.x+b.w*.50,b.y+b.h*.09,8,rgba(INK,.67),"center","600");
    text("CANCER CLONES",b.x+b.w*.73,b.y+b.h*.18,8,rgba(INK,.67),"center","600");
    text("ACCESS DECIDES THE ENCOUNTER",b.x+b.w*.50,b.y+b.h*.94,8,rgba(INK,.50),"center","500");
    ctx.restore();
  }

  function branchRibbon(b,sy,ey,color,width,alpha,phase,now){
    var ox=b.x+b.w*.22;
    var ex=b.x+b.w*.94;
    var c1x=b.x+b.w*.40;
    var c2x=b.x+b.w*.67;
    var wobble=Math.sin(now*.00045+phase)*b.h*.018;
    ctx.save();
    ctx.globalAlpha=alpha;
    bezier(ox,sy,c1x,sy+wobble,c2x,ey-wobble,ex,ey,rgba(color,.78),width);
    bezier(ox,sy,c1x,sy+wobble,c2x,ey-wobble,ex,ey,rgba(INK,.28),1.2);
    ctx.restore();
  }

  function drawGenerate(alpha,now,selected){
    var b=folio();
    paper(b,alpha);
    clipFolio(b,alpha,function(){
      var ox=b.x+b.w*.22;
      var oy=b.y+b.h*.51;
      bezier(b.x-10,b.y+b.h*.29,b.x+b.w*.04,b.y+b.h*.44,b.x+b.w*.12,oy,ox,oy,rgba(INK,.82),3);

      var ys=[.16,.27,.39,.51,.63,.75,.86];
      ys.forEach(function(y,i){
        var isSelected=selected && i===4;
        branchRibbon(
          b,
          oy+(i-3)*2,
          b.y+b.h*y,
          PALETTE[i%PALETTE.length],
          isSelected?32:18+(i%3)*4,
          isSelected?.94:(selected?.24:.76),
          i,
          now
        );
      });

      ctx.fillStyle=INK;
      ctx.beginPath();
      ctx.arc(ox,oy,7,0,Math.PI*2);
      ctx.fill();
      text("12,308",b.x+b.w*.68,b.y+b.h*.56,56,rgba(INK,.88),"left","400",'"Source Serif 4", Georgia, serif');
      text("COMBINATIONS EXPLORED",b.x+b.w*.68,b.y+b.h*.61,8,rgba(INK,.58),"left","600");
    });

    ctx.save();
    ctx.globalAlpha=alpha;
    text(selected?"ONE DESIGNED PATH":"GENERATE / COMBINATION × SEQUENCE × DELIVERY",b.x+24,b.y+31,9,rgba(INK,.72),"left","600");
    text("ONE BIOLOGICAL ORIGIN",b.x+b.w*.22,b.y+b.h*.59,8,rgba(INK,.55),"center","600");
    if(selected){
      text("SELECTED FOR WHOLE-SYSTEM CHANGE",b.x+b.w*.94,b.y+b.h*.69,8,rgba(ROSE,.82),"right","600");
    }else{
      text("FROM 16 BILLION+ POSSIBLE DESIGNS",b.x+b.w-24,b.y+b.h-20,8,rgba(INK,.52),"right","600");
    }
    ctx.restore();
  }

  function drawRedrawnLandscape(alpha,now){
    var b=folio();
    paper(b,alpha);
    clipFolio(b,alpha,function(){
      var x0=b.x+b.w*.08;
      var x1=b.x+b.w*.96;
      var top=b.y+b.h*.15;
      var bottom=b.y+b.h*.87;
      var samples=70;
      var bounds=[[],[],[],[]];
      for(var k=0;k<=samples;k++){
        var t=k/samples;
        var cancer=.58-.43*smooth(clamp((t-.08)/.86,0,1));
        var immune=.13+.39*smooth(clamp((t-.04)/.72,0,1));
        var stroma=Math.max(.12,1-cancer-immune);
        var shares=[immune,stroma,cancer];
        var total=immune+stroma+cancer;
        var y=top;
        bounds[0].push([lerp(x0,x1,t),y]);
        for(var i=0;i<3;i++){
          y+=(bottom-top)*shares[i]/total;
          bounds[i+1].push([lerp(x0,x1,t),y]);
        }
      }
      var colors=[BLUE,GOLD,ROSE];
      for(var band=0;band<3;band++){
        ctx.beginPath();
        ctx.moveTo(bounds[band][0][0],bounds[band][0][1]);
        for(k=1;k<=samples;k++) ctx.lineTo(bounds[band][k][0],bounds[band][k][1]);
        for(k=samples;k>=0;k--) ctx.lineTo(bounds[band+1][k][0],bounds[band+1][k][1]);
        ctx.closePath();
        ctx.fillStyle=rgba(colors[band],.58);
        ctx.fill();
        ctx.strokeStyle=rgba(PAPER,.92);
        ctx.lineWidth=6;
        ctx.stroke();
      }
      var sweep=(now*.00004)%1;
      line(lerp(x0,x1,sweep),top,lerp(x0,x1,sweep),bottom,rgba(INK,.24),1.2);
    });
    ctx.save();
    ctx.globalAlpha=alpha;
    text("DESIGNED MULLER LANDSCAPE / 0–36 MONTHS",b.x+24,b.y+31,9,rgba(INK,.72),"left","600");
    text("CANCER CONTRACTS",b.x+b.w*.80,b.y+b.h*.73,8,rgba(ROSE,.88),"left","600");
    text("IMMUNE CONTROL EXPANDS",b.x+b.w*.72,b.y+b.h*.27,8,rgba(INK,.68),"left","600");
    text("THE INTERVENTION REDRAWS THE SYSTEM",b.x+b.w-24,b.y+b.h-20,8,rgba(INK,.56),"right","600");
    ctx.restore();
  }

  function drawScene(index,alpha,now){
    if(alpha<=.002) return;
    if(index===0) drawSourceMuller(alpha,now,false,0);
    if(index===1) drawSourceMuller(alpha,now,true,0);
    if(index===2) drawBiology(alpha,now,0);
    if(index===3) drawGenerate(alpha,now,false);
    if(index===4) drawRedrawnLandscape(alpha,now);
  }

  function transitionGesture(base,mix,now){
    if(mix<=.02 || mix>=.98) return;
    var b=folio();
    ctx.save();
    ctx.globalAlpha=Math.sin(mix*Math.PI)*.34;
    if(base===1){
      var cx=lerp(b.x+b.w*.56,b.x+b.w*.50,mix);
      var cy=lerp(b.y+b.h*.48,b.y+b.h*.55,mix);
      var radius=lerp(b.w*.08,b.w*.30,mix);
      ctx.strokeStyle=rgba(INK,.42);
      ctx.lineWidth=2;
      ctx.beginPath();
      ctx.arc(cx,cy,radius,0,Math.PI*2);
      ctx.stroke();
    }
    if(base===2){
      var ox=lerp(b.x+b.w*.50,b.x+b.w*.22,mix);
      var oy=b.y+b.h*.53;
      for(var i=0;i<5;i++){
        bezier(ox,oy,b.x+b.w*.50,oy,b.x+b.w*.65,b.y+b.h*(.2+i*.15),b.x+b.w*.94,b.y+b.h*(.16+i*.17),rgba(PALETTE[i],.55),lerp(3,14,mix));
      }
    }
    if(base===3){
      text("ONE PATH RETURNS TO THE LANDSCAPE",b.x+b.w*.50,b.y+b.h*.94,8,rgba(INK,.72),"center","600");
    }
    ctx.restore();
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
    renderedScene=reduced?targetScene:lerp(renderedScene,targetScene,.072);
    ctx.setTransform(DPR,0,0,DPR,0,0);
    ctx.clearRect(0,0,W,H);
    ctx.fillStyle=BG;
    ctx.fillRect(0,0,W,H);

    var base=Math.floor(renderedScene);
    var next=Math.min(SCENES.length-1,base+1);
    var mix=smooth(renderedScene-base);
    drawScene(base,1-mix,now);
    if(next!==base) drawScene(next,mix,now);
    transitionGesture(base,mix,now);

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

  sourceImage.addEventListener("load",function(){
    if(visible && !raf) raf=requestAnimationFrame(render);
  });
  resize();
  updateStory();
  raf=requestAnimationFrame(render);
  window.addEventListener("pagehide",function(){
    visible=false;
    if(raf) cancelAnimationFrame(raf);
  });
})();
