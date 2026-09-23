const P=require('pptxgenjs');
const C={INK:'1E2A38',INK2:'3D4E60',MUT:'7C8A99',LINE:'D9E0E7',PAPER:'F5F7F9',WHITE:'FFFFFF',
  ACC:'6E2639',ACC2:'A85C6E',POS:'2C6A4E',NEG:'8A2E26',WARN:'8F5510',BLUE:'2E5C8A',
  DKCARD:'26333F',DKLINE:'3A4854',DKTXT:'A8B5C0',TINT_A:'FBF1F3',TINT_AL:'E3CBD1',
  TINT_P:'F0F4F1',TINT_PL:'C9DCD1',TINT_B:'EEF3F8',TINT_BL:'C6D6E5',
  TINT_W:'F7F3EC',TINT_WL:'E0D3BE',F:'Meiryo'};
module.exports=function(){
  const p=new P(); p.layout='LAYOUT_WIDE';
  const F=C.F;
  const T=(s,t,o)=>s.addText(t,Object.assign({fontFace:F,isTextBox:true,margin:0},o));
  const dark=s=>s.background={color:C.INK}, light=s=>s.background={color:C.PAPER};
  function head(s,k,t,d){
    T(s,k,{x:0.7,y:0.42,w:11.9,h:0.28,fontSize:11,bold:true,charSpacing:2,color:d?C.ACC2:C.ACC});
    T(s,t,{x:0.7,y:0.74,w:11.9,h:0.72,fontSize:28,bold:true,color:d?C.WHITE:C.INK});
  }
  function card(s,x,y,w,h,fill,line){
    s.addShape(p.ShapeType.roundRect,{x,y,w,h,rectRadius:0.06,fill:{color:fill||C.WHITE},
      line:{color:line||C.LINE,width:1},
      shadow:{type:'outer',blur:8,offset:1,angle:90,color:'AAB4BE',opacity:0.18}});
  }
  function dcard(s,x,y,w,h,ln){
    s.addShape(p.ShapeType.roundRect,{x,y,w,h,rectRadius:0.06,fill:{color:C.DKCARD},
      line:{color:ln||C.DKLINE,width:ln?2:1}});
  }
  function stat(s,x,y,w,l,v,u,sub,col){
    T(s,l,{x,y,w,h:0.26,fontSize:11,color:C.MUT});
    T(s,[{text:v,options:{fontSize:30,bold:true,color:col||C.INK}},
         {text:u||'',options:{fontSize:13,bold:true,color:col||C.INK}}],{x,y:y+0.26,w,h:0.55});
    if(sub) T(s,sub,{x,y:y+0.82,w,h:0.26,fontSize:10,color:C.MUT});
  }
  function badge(s,x,y,w,txt,col,h){
    h=h||0.34;
    s.addShape(p.ShapeType.roundRect,{x,y,w,h,rectRadius:h/2,fill:{color:col}});
    T(s,txt,{x,y,w,h,fontSize:11.5,bold:true,color:C.WHITE,align:'center',valign:'middle'});
  }
  function num(s,x,y,d,txt,col){
    s.addShape(p.ShapeType.roundRect,{x,y,w:d,h:d,rectRadius:d/2,fill:{color:col}});
    T(s,txt,{x,y,w:d,h:d,fontSize:d>0.6?18:14,bold:true,color:C.WHITE,align:'center',valign:'middle'});
  }
  function dot(s,x,y,col,d){d=d||0.16;
    s.addShape(p.ShapeType.roundRect,{x,y,w:d,h:d,rectRadius:d/2,fill:{color:col}});}
  const TH={fill:C.INK,color:C.WHITE,bold:true,fontSize:11};
  const THR=Object.assign({align:'right'},TH), THC=Object.assign({align:'center'},TH);
  const tbl=(s,r,o)=>s.addTable(r,Object.assign({fontFace:F,fontSize:11.5,color:C.INK2,
    border:{type:'solid',color:C.LINE,pt:0.5},valign:'middle'},o));
  function cover(s,kicker,title,sub,date,meta,note){
    dark(s);
    T(s,kicker,{x:0.9,y:1.8,w:11.5,h:0.4,fontSize:14,bold:true,color:C.ACC2,charSpacing:3});
    T(s,title,{x:0.9,y:2.25,w:11.5,h:0.95,fontSize:40,bold:true,color:C.WHITE});
    T(s,sub,{x:0.9,y:3.3,w:11.2,h:0.45,fontSize:17,color:'B9C4CF'});
    T(s,date,{x:0.9,y:3.8,w:11,h:0.3,fontSize:13,color:C.ACC2});
    s.addShape(p.ShapeType.line,{x:0.9,y:4.24,w:3.2,h:0,line:{color:C.ACC,width:2}});
    meta.forEach((r,i)=>{
      T(s,r[0],{x:0.9,y:4.58+i*0.42,w:1.7,h:0.3,fontSize:10,color:C.MUT});
      T(s,r[1],{x:2.7,y:4.58+i*0.42,w:9.5,h:0.3,fontSize:12,color:'D5DDE5'});
    });
    T(s,note,{x:0.9,y:6.8,w:11.5,h:0.3,fontSize:9,color:'6D7A87'});
  }
  return {p,C,F,T,dark,light,head,card,dcard,stat,badge,num,dot,TH,THR,THC,tbl,cover,
          slide:()=>p.addSlide()};
};
