import { AfterViewInit, Component, HostListener, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { gsap } from 'gsap';
import * as THREE from 'three';

interface Project {
  title: string;
  category: string;
  image: string;
  index: string;
}

@Component({
  selector: 'lm-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.component.html'
})
export class AppComponent implements AfterViewInit, OnDestroy {
  menuOpen = false;
  selectedProject: Project | null = null;
  scrollProgress = 0;
  loaded = false;
  activeSection = 'home';
  cursorX = 0;
  cursorY = 0;
  cursorVisible = false;

  private observer?: IntersectionObserver;
  private sectionObserver?: IntersectionObserver;
  private resizeHandler?: () => void;
  private webgl?: {
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    points: THREE.Points;
    geometry: THREE.BufferGeometry;
    material: THREE.PointsMaterial;
    frame: number;
  };
  private pointer = { x: 0, y: 0 };

  // Curated from the supplied company images. Logos, duplicates and weak/low-impact visuals are intentionally excluded.
  private readonly projectData: Omit<Project, 'index'>[] = [
    { title: 'Field Activation', category: 'Experiential / Events', image: 'assets/projects/project-07.jpg' },
    { title: 'Retail Presence', category: 'POS / Field Marketing', image: 'assets/projects/project-08.jpg' },
    { title: 'Live Campaign', category: 'Face-to-Face', image: 'assets/projects/project-09.jpg' },
    { title: 'Campaign Display', category: 'Brand Activation', image: 'assets/projects/project-11.jpg' },
    { title: 'Outdoor Activation', category: 'Field Marketing', image: 'assets/projects/project-14.jpg' },
    { title: 'Retail Experience', category: 'Brand Activation', image: 'assets/projects/project-18.jpg' },
    { title: 'Event Experience', category: 'Face-to-Face', image: 'assets/projects/project-19.jpg' },
    { title: 'Retail Branding', category: 'Design / Production', image: 'assets/projects/project-21.jpg' },
    { title: 'Shell Retail', category: 'Production / Branding', image: 'assets/projects/project-27.jpg' },
    { title: 'Castrol Campaign', category: 'Brand Activation', image: 'assets/projects/project-41.jpg' }
  ];

  projects: Project[] = this.projectData.map((project, index) => ({
    ...project,
    index: String(index + 1).padStart(2, '0')
  }));

  ngAfterViewInit(): void {
    requestAnimationFrame(() => (this.loaded = true));
    this.initWebGL();

    gsap.timeline()
      .from('.hero-kicker', { y: 25, opacity: 0, duration: 0.8, ease: 'power3.out', delay: 0.25 })
      .from('.hero-title .line', { y: 130, opacity: 0, duration: 1.25, stagger: 0.12, ease: 'power4.out' }, '-=.35')
      .from('.hero-bottom,.hero-top,.hero-meta,.hero-stamp', { y: 22, opacity: 0, duration: 0.8, stagger: 0.08, ease: 'power3.out' }, '-=.65');

    this.observer = new IntersectionObserver(
      entries => entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('is-visible');
      }),
      { threshold: 0.08, rootMargin: '0px 0px -7% 0px' }
    );

    document.querySelectorAll('.reveal').forEach(element => this.observer!.observe(element));

    this.sectionObserver = new IntersectionObserver(
      entries => entries.forEach(entry => {
        if (entry.isIntersecting) this.activeSection = entry.target.id || this.activeSection;
      }),
      { threshold: 0.2, rootMargin: '-12% 0px -55% 0px' }
    );

    document.querySelectorAll('section[id]').forEach(element => this.sectionObserver!.observe(element));
    document.body.classList.add('ultimate');

    const hash = window.location.hash.slice(1);
    if (hash) setTimeout(() => this.scrollTo(hash), 0);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    this.sectionObserver?.disconnect();
    if (this.resizeHandler) removeEventListener('resize', this.resizeHandler);

    if (this.webgl) {
      cancelAnimationFrame(this.webgl.frame);
      this.webgl.geometry.dispose();
      this.webgl.material.dispose();
      this.webgl.renderer.dispose();
      this.webgl = undefined;
    }
  }

  @HostListener('window:scroll')
  onScroll(): void {
    const max = document.documentElement.scrollHeight - innerHeight;
    this.scrollProgress = max > 0 ? (scrollY / max) * 100 : 0;
  }

  @HostListener('document:mousemove', ['$event'])
  onMouse(event: MouseEvent): void {
    this.cursorX = event.clientX;
    this.cursorY = event.clientY;
    this.cursorVisible = true;
    document.documentElement.style.setProperty('--mx', `${event.clientX}px`);
    document.documentElement.style.setProperty('--my', `${event.clientY}px`);
    this.pointer.x = (event.clientX / innerWidth - 0.5) * 2;
    this.pointer.y = (event.clientY / innerHeight - 0.5) * 2;
  }

  @HostListener('document:keydown', ['$event'])
  onKey(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.closeProject();
      this.menuOpen = false;
      document.body.classList.remove('menu-locked');
    }
  }

  private initWebGL(): void {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const canvas = document.getElementById('webgl-canvas') as HTMLCanvasElement | null;
    if (!canvas) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
    } catch {
      canvas.style.display = 'none';
      return;
    }

    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    renderer.setSize(innerWidth, innerHeight);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, 0.1, 100);
    camera.position.z = 5;

    const count = innerWidth < 700 ? 450 : 900;
    const positions = new Float32Array(count * 3);

    for (let index = 0; index < count; index++) {
      const radius = 3 + Math.random() * 4.8;
      const angle = Math.random() * Math.PI * 2;
      positions[index * 3] = Math.cos(angle) * radius;
      positions[index * 3 + 1] = (Math.random() - 0.5) * 4.8;
      positions[index * 3 + 2] = Math.sin(angle) * radius;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: 0xff3b30,
      size: innerWidth < 700 ? 0.012 : 0.016,
      transparent: true,
      opacity: 0.42,
      blending: THREE.AdditiveBlending
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    this.resizeHandler = () => {
      renderer.setSize(innerWidth, innerHeight);
      camera.aspect = innerWidth / innerHeight;
      camera.updateProjectionMatrix();
    };
    addEventListener('resize', this.resizeHandler, { passive: true });

    const tick = () => {
      if (!this.webgl) return;
      points.rotation.y += 0.00055;
      points.rotation.x += 0.00015;
      points.position.x += (this.pointer.x * 0.3 - points.position.x) * 0.018;
      points.position.y += (-this.pointer.y * 0.2 - points.position.y) * 0.018;
      renderer.render(scene, camera);
      this.webgl.frame = requestAnimationFrame(tick);
    };

    this.webgl = {
      renderer,
      scene,
      camera,
      points,
      geometry,
      material,
      frame: requestAnimationFrame(tick)
    };
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
    document.body.classList.toggle('menu-locked', this.menuOpen);
  }

  navigate(event: Event, id: string): void {
    event.preventDefault();
    this.scrollTo(id);
  }

  scrollTo(id: string): void {
    const target = document.getElementById(id);
    if (!target) return;

    history.replaceState(null, '', `#${id}`);
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    this.menuOpen = false;
    document.body.classList.remove('menu-locked');
  }

  onLogoError(event: Event): void {
    const image = event.target as HTMLImageElement;
    image.style.visibility = 'hidden';
  }

  openProject(project: Project): void {
    this.selectedProject = project;
    document.body.classList.add('locked');
  }

  closeProject(): void {
    this.selectedProject = null;
    document.body.classList.remove('locked');
  }

  prevProject(): void {
    if (!this.selectedProject) return;
    const index = this.projects.findIndex(project => project.index === this.selectedProject!.index);
    this.selectedProject = this.projects[(index - 1 + this.projects.length) % this.projects.length];
  }

  nextProject(): void {
    if (!this.selectedProject) return;
    const index = this.projects.findIndex(project => project.index === this.selectedProject!.index);
    this.selectedProject = this.projects[(index + 1) % this.projects.length];
  }
}
