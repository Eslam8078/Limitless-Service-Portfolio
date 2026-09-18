import { AfterViewInit, Component, HostListener, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { gsap } from 'gsap';
import * as THREE from 'three';

interface Project { title:string; category:string; image:string; index:string; }

@Component({ selector:'lm-root', standalone:true, imports:[CommonModule], templateUrl:'./app.component.html' })
export class AppComponent implements AfterViewInit, OnDestroy {
  menuOpen=false; selectedProject:Project|null=null; scrollProgress=0; loaded=false; activeSection='home';
  cursorX=0; cursorY=0; cursorVisible=false; soundOn=false;
  private observer?:IntersectionObserver; private sectionObserver?:IntersectionObserver; private resizeHandler?:()=>void;
  private webgl?: { renderer: THREE.WebGLRenderer; scene: THREE.Scene; camera: THREE.PerspectiveCamera; points: THREE.Points; geometry: THREE.BufferGeometry; material: THREE.PointsMaterial; frame: number };
  private pointer = { x: 0, y: 0 };
  projects:Project[] = Array.from({length:30},(_,i)=>({
    title:['Brand Activations','Retail Presence','Live Campaigns','People in Motion','Trade & Retail','Campaign Operations','Mobile Activations','TotalEnergies','On-ground Execution','Retail Campaigns','Mobinil','Experiential Marketing','Production & Branding','Fleet Branding','Market Coverage'][i%15],
    category:['Experiential / Events','POS / Field Marketing','Roadshows / B2B & B2C','Face-to-Face','Activation / Visibility','Field Marketing','Roadshows','Brand Activation','Field Marketing','POS Promotions','Brand Activation','Events','Design / Print','Production','Field Operations'][i%15],
    image:`assets/projects/project-${String((i%45)+1).padStart(2,'0')}.jpg`, index:String(i+1).padStart(2,'0')
  }));

  ngAfterViewInit(){
    requestAnimationFrame(()=>this.loaded=true);
    this.initWebGL();
    gsap.timeline().from('.hero-kicker',{y:25,opacity:0,duration:.8,ease:'power3.out',delay:.25})
      .from('.hero-title .line',{y:130,opacity:0,duration:1.25,stagger:.12,ease:'power4.out'},'-=.35')
      .from('.hero-bottom,.hero-top,.hero-meta,.hero-stamp',{y:22,opacity:0,duration:.8,stagger:.08,ease:'power3.out'},'-=.65');
    this.observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('is-visible')}),{threshold:.08,rootMargin:'0px 0px -7% 0px'});
    document.querySelectorAll('.reveal').forEach(el=>this.observer!.observe(el));
    this.sectionObserver=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)this.activeSection=e.target.id||this.activeSection}),{threshold:.3});
    document.querySelectorAll('section[id]').forEach(el=>this.sectionObserver!.observe(el));
    document.body.classList.add('ultimate');
  }
  ngOnDestroy(){
    this.observer?.disconnect();
    this.sectionObserver?.disconnect();
    if(this.resizeHandler)removeEventListener('resize',this.resizeHandler);
    if(this.webgl){
      cancelAnimationFrame(this.webgl.frame);
      this.webgl.geometry.dispose();
      this.webgl.material.dispose();
      this.webgl.renderer.dispose();
      this.webgl = undefined;
    }
  }
  @HostListener('window:scroll') onScroll(){const max=document.documentElement.scrollHeight-innerHeight;this.scrollProgress=max?scrollY/max*100:0;}
  @HostListener('document:mousemove',['$event']) onMouse(e:MouseEvent){this.cursorX=e.clientX;this.cursorY=e.clientY;this.cursorVisible=true;document.documentElement.style.setProperty('--mx',`${e.clientX}px`);document.documentElement.style.setProperty('--my',`${e.clientY}px`);this.pointer.x=(e.clientX/innerWidth-.5)*2;this.pointer.y=(e.clientY/innerHeight-.5)*2;}
  @HostListener('document:keydown',['$event']) onKey(e:KeyboardEvent){if(e.key==='Escape'){this.closeProject();this.menuOpen=false}}

  private initWebGL(){
    const canvas=document.getElementById('webgl-canvas') as HTMLCanvasElement|null; if(!canvas)return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true});
    } catch {
      canvas.style.display='none';
      return;
    }
    renderer.setPixelRatio(Math.min(devicePixelRatio,2));
    renderer.setSize(innerWidth,innerHeight);
    const scene=new THREE.Scene(); const camera=new THREE.PerspectiveCamera(45,innerWidth/innerHeight,.1,100); camera.position.z=5;
    const count=1100, pos=new Float32Array(count*3);
    for(let i=0;i<count;i++){const r=3+Math.random()*4.8,a=Math.random()*Math.PI*2;pos[i*3]=Math.cos(a)*r;pos[i*3+1]=(Math.random()-.5)*4.8;pos[i*3+2]=Math.sin(a)*r;}
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(pos,3));
    const mat=new THREE.PointsMaterial({color:0xff3b30,size:.016,transparent:true,opacity:.52,blending:THREE.AdditiveBlending});
    const points=new THREE.Points(geo,mat);scene.add(points);
    this.resizeHandler=()=>{renderer.setSize(innerWidth,innerHeight);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix()};addEventListener('resize',this.resizeHandler);
    const tick=()=>{points.rotation.y+=.00065;points.rotation.x+=.00018;points.position.x+=(this.pointer.x*.3-points.position.x)*.018;points.position.y+=(-this.pointer.y*.2-points.position.y)*.018;renderer.render(scene,camera);this.webgl!.frame=requestAnimationFrame(tick)};
    this.webgl={renderer,scene,camera,points,geometry:geo,material:mat,frame:requestAnimationFrame(tick)};
  }
  toggleMenu(){this.menuOpen=!this.menuOpen}
  scrollTo(id:string){document.getElementById(id)?.scrollIntoView({behavior:'smooth'});this.menuOpen=false}
  openProject(p:Project){this.selectedProject=p;document.body.classList.add('locked')}
  closeProject(){this.selectedProject=null;document.body.classList.remove('locked')}
  prevProject(){if(!this.selectedProject)return;const i=this.projects.findIndex(p=>p.index===this.selectedProject!.index);this.selectedProject=this.projects[(i-1+this.projects.length)%this.projects.length]}
  nextProject(){if(!this.selectedProject)return;const i=this.projects.findIndex(p=>p.index===this.selectedProject!.index);this.selectedProject=this.projects[(i+1)%this.projects.length]}
}
