import { AfterViewInit, Component, HostListener, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { gsap } from 'gsap';

interface Project {
  title: string;
  category: string;
  image: string;
  index: string;
}

type WorkFilter = 'All' | 'Field' | 'Activation' | 'Production' | 'Events';

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
  activeFilter: WorkFilter = 'All';

  readonly filters: WorkFilter[] = ['All', 'Field', 'Activation', 'Production', 'Events'];

  private revealObserver?: IntersectionObserver;
  private sectionObserver?: IntersectionObserver;
  private scrollFrame = 0;
  private touchStartX: number | null = null;

  private readonly projectData: Omit<Project, 'index'>[] = [
    { title: 'Exhibition Presence', category: 'Brand Activation', image: 'assets/projects/work-12.webp' },
    { title: 'Experience Build', category: 'Production', image: 'assets/projects/work-14.webp' },
    { title: 'Night Activation', category: 'Field Marketing', image: 'assets/projects/work-15.webp' },
    { title: 'Retail Experience', category: 'Brand Activation', image: 'assets/projects/work-18.webp' },
    { title: 'Live Event Stage', category: 'Events', image: 'assets/projects/work-19.webp' },
    { title: 'Premium Brand Space', category: 'Activation', image: 'assets/projects/work-20.webp' },
    { title: 'Retail Branding', category: 'Production', image: 'assets/projects/work-21.webp' },
    { title: 'Summit Experience', category: 'Events', image: 'assets/projects/work-22.webp' },
    { title: 'Mobile Brand Activation', category: 'Field Marketing', image: 'assets/projects/work-43.webp' },
    { title: 'Campaign Launch', category: 'Field Marketing', image: 'assets/projects/work-44.webp' }
  ];

  projects: Project[] = this.projectData.map((project, index) => ({
    ...project,
    index: String(index + 1).padStart(2, '0')
  }));

  get filteredProjects(): Project[] {
    if (this.activeFilter === 'All') return this.projects;

    return this.projects.filter(project => {
      if (this.activeFilter === 'Field') return project.category.includes('Field');
      if (this.activeFilter === 'Activation') return project.category.includes('Activation');
      if (this.activeFilter === 'Production') return project.category.includes('Production');
      return project.category.includes('Events');
    });
  }

  ngAfterViewInit(): void {
    window.setTimeout(() => (this.loaded = true), 700);
    document.body.classList.add('ultimate');
    this.setScrollVars();

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!reduceMotion) {
      gsap.timeline({ defaults: { ease: 'power3.out' } })
        .from('.hero-kicker', { y: 22, opacity: 0, duration: 0.65, delay: 0.08 })
        .from('.hero-title .line', { yPercent: 110, opacity: 0, duration: 0.95, stagger: 0.08, ease: 'power4.out' }, '-=.28')
        .from('.hero-bottom', { y: 18, opacity: 0, duration: 0.6 }, '-=.5')
        .from('.hero-stamp', { scale: 0.72, opacity: 0, rotate: -14, duration: 0.65 }, '-=.45')
        .from('.hero-photo', { scale: 1.06, opacity: 0, duration: 1.15 }, '<');
    } else {
      document.querySelectorAll('.reveal').forEach(el => el.classList.add('is-visible'));
    }

    this.revealObserver = new IntersectionObserver(
      entries => entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        if (entry.target.classList.contains('number')) this.animateStat(entry.target as HTMLElement);
        this.revealObserver?.unobserve(entry.target);
      }),
      { threshold: 0.08, rootMargin: '0px 0px -10% 0px' }
    );

    document.querySelectorAll('.reveal').forEach((element, index) => {
      element.setAttribute('style', `--reveal-delay:${Math.min(index * 22, 220)}ms`);
      this.revealObserver?.observe(element);
    });

    this.sectionObserver = new IntersectionObserver(
      entries => entries.forEach(entry => {
        if (entry.isIntersecting) this.activeSection = entry.target.id || this.activeSection;
      }),
      { threshold: 0.18, rootMargin: '-14% 0px -58% 0px' }
    );

    document.querySelectorAll('section[id]').forEach(element => this.sectionObserver?.observe(element));

    const hash = window.location.hash.slice(1);
    if (hash) window.setTimeout(() => this.scrollTo(hash), 120);
  }

  ngOnDestroy(): void {
    this.revealObserver?.disconnect();
    this.sectionObserver?.disconnect();
    if (this.scrollFrame) cancelAnimationFrame(this.scrollFrame);
    document.body.classList.remove('ultimate', 'menu-locked', 'locked');
  }

  @HostListener('window:scroll')
  onScroll(): void {
    if (this.scrollFrame) return;
    this.scrollFrame = requestAnimationFrame(() => {
      this.scrollFrame = 0;
      this.setScrollVars();
    });
  }

  private setScrollVars(): void {
    const max = Math.max(0, document.documentElement.scrollHeight - innerHeight);
    this.scrollProgress = max ? Math.min(100, Math.max(0, (scrollY / max) * 100)) : 0;
    document.documentElement.style.setProperty('--scroll-y', `${scrollY}px`);
  }

  @HostListener('document:keydown', ['$event'])
  onKey(event: KeyboardEvent): void {
    if (event.key !== 'Escape') return;
    if (this.selectedProject) this.closeProject();
    if (this.menuOpen) this.closeMenu();
  }

  @HostListener('window:resize')
  onResize(): void {
    if (innerWidth > 900 && this.menuOpen) this.closeMenu();
  }

  @HostListener('document:touchstart', ['$event'])
  onTouchStart(event: TouchEvent): void {
    if (this.selectedProject && event.touches.length === 1) this.touchStartX = event.touches[0].clientX;
  }

  @HostListener('document:touchend', ['$event'])
  onTouchEnd(event: TouchEvent): void {
    if (!this.selectedProject || this.touchStartX === null || event.changedTouches.length !== 1) return;
    const delta = event.changedTouches[0].clientX - this.touchStartX;
    this.touchStartX = null;
    if (Math.abs(delta) < 55) return;
    if (delta > 0) this.prevProject();
    else this.nextProject();
  }

  private animateStat(element: HTMLElement): void {
    if (element.dataset['animated'] === 'true') return;
    element.dataset['animated'] = 'true';

    const strong = element.querySelector<HTMLElement>('strong[data-count]');
    if (!strong) return;

    const target = Number(strong.dataset['count']);
    if (!Number.isFinite(target)) return;

    const suffix = strong.dataset['suffix'] ?? '';
    const state = { value: 0 };
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduced) {
      strong.textContent = `${target}${suffix}`;
      return;
    }

    gsap.to(state, {
      value: target,
      duration: 1.1,
      ease: 'power2.out',
      onUpdate: () => (strong.textContent = `${Math.round(state.value)}${suffix}`)
    });
  }

  toggleMenu(): void {
    this.menuOpen ? this.closeMenu() : this.openMenu();
  }

  openMenu(): void {
    this.menuOpen = true;
    document.body.classList.add('menu-locked');
  }

  closeMenu(): void {
    this.menuOpen = false;
    document.body.classList.remove('menu-locked');
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
    this.closeMenu();
  }

  setFilter(filter: WorkFilter): void {
    this.activeFilter = filter;
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

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
