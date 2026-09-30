import { AfterViewInit, Component, HostListener, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

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
  navHidden = false;

  readonly filters: WorkFilter[] = ['All', 'Field', 'Activation', 'Production', 'Events'];

  private revealObserver?: IntersectionObserver;
  private sectionObserver?: IntersectionObserver;
  private scrollFrame = 0;
  private touchStartX: number | null = null;
  private lastScrollY = 0;

  private readonly projectData: Omit<Project, 'index'>[] = [
    { title: 'Open Stars Experience', category: 'Brand Activation', image: 'assets/projects/work-01.webp' },
    { title: 'Pharma Brand Space', category: 'Events', image: 'assets/projects/work-02.webp' },
    { title: 'Orange Exhibition Build', category: 'Production', image: 'assets/projects/work-03.webp' },
    { title: 'Premium Display Install', category: 'Brand Activation', image: 'assets/projects/work-04.webp' },
    { title: 'Retail Brand Experience', category: 'Production', image: 'assets/projects/work-05.webp' },
    { title: 'Castrol Field Activation', category: 'Field Marketing', image: 'assets/projects/work-06.webp' },
    { title: 'Castrol Roadshow', category: 'Events', image: 'assets/projects/work-07.webp' },
    { title: 'Total Roadshow', category: 'Field Marketing', image: 'assets/projects/work-08.webp' },
    { title: 'Total Brand Activation', category: 'Events', image: 'assets/projects/work-09.webp' },
    { title: 'Live Campaign Experience', category: 'Events', image: 'assets/projects/work-10.webp' },
    { title: 'Retail & Production Display', category: 'Production', image: 'assets/projects/work-11.webp' }
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
    this.lastScrollY = window.scrollY;
    document.body.classList.add('ultimate');
    this.setScrollVars();
    this.setupIntroAnimation();
    this.setupRevealObserver();
    this.setupSectionObserver();
    this.setupScrollAnimations();

    const hash = window.location.hash.slice(1);
    if (hash) window.setTimeout(() => this.scrollTo(hash, false), 120);

    window.setTimeout(() => (this.loaded = true), 760);
    window.setTimeout(() => ScrollTrigger.refresh(), 900);
  }

  ngOnDestroy(): void {
    this.revealObserver?.disconnect();
    this.sectionObserver?.disconnect();
    if (this.scrollFrame) cancelAnimationFrame(this.scrollFrame);
    ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    document.body.classList.remove('ultimate', 'menu-locked', 'locked');
  }

  private setupIntroAnimation(): void {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduceMotion) {
      document.querySelectorAll('.reveal').forEach(el => el.classList.add('is-visible'));
      return;
    }

    gsap.timeline({ defaults: { ease: 'power4.out' } })
      .from('.nav', { y: -18, opacity: 0, duration: 0.55 })
      .from('.hero-kicker', { y: 22, opacity: 0, duration: 0.55 }, '-=.25')
      .from('.hero-title .line', { yPercent: 120, opacity: 0, duration: 0.9, stagger: 0.08 }, '-=.2')
      .from('.hero-bottom > *', { y: 20, opacity: 0, duration: 0.55, stagger: 0.08 }, '-=.45')
      .from('.hero-stamp', { scale: 0.7, opacity: 0, rotate: -18, duration: 0.65 }, '-=.35')
      .from('.hero-photo', { scale: 1.08, opacity: 0, duration: 1.2 }, '<');
  }

  private setupRevealObserver(): void {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.revealObserver = new IntersectionObserver(
      entries => entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        if (entry.target.classList.contains('number')) this.animateStat(entry.target as HTMLElement);
        this.revealObserver?.unobserve(entry.target);
      }),
      { threshold: reduced ? 0 : 0.12, rootMargin: '0px 0px -8% 0px' }
    );

    document.querySelectorAll('.reveal').forEach((element, index) => {
      element.setAttribute('style', `--reveal-delay:${Math.min(index * 18, 180)}ms`);
      this.revealObserver?.observe(element);
    });
  }

  private setupSectionObserver(): void {
    this.sectionObserver = new IntersectionObserver(
      entries => entries.forEach(entry => {
        if (entry.isIntersecting) this.activeSection = entry.target.id || this.activeSection;
      }),
      { threshold: 0.16, rootMargin: '-16% 0px -58% 0px' }
    );

    document.querySelectorAll('section[id]').forEach(element => this.sectionObserver?.observe(element));
  }

  private setupScrollAnimations(): void {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    gsap.utils.toArray<HTMLElement>('.image-reveal').forEach(element => {
      gsap.fromTo(element,
        { clipPath: 'inset(0 0 100% 0)', scale: 1.04 },
        {
          clipPath: 'inset(0 0 0% 0)',
          scale: 1,
          duration: 1.15,
          ease: 'power3.out',
          scrollTrigger: { trigger: element, start: 'top 84%', once: true }
        }
      );
    });

    gsap.utils.toArray<HTMLElement>('.parallax-img').forEach(element => {
      gsap.to(element, {
        yPercent: 8,
        ease: 'none',
        scrollTrigger: { trigger: element.parentElement, start: 'top bottom', end: 'bottom top', scrub: 1.1 }
      });
    });

    gsap.utils.toArray<HTMLElement>('.service').forEach((element, index) => {
      gsap.fromTo(element,
        { x: -18 },
        {
          x: 0,
          duration: 0.7,
          delay: index * 0.035,
          ease: 'power3.out',
          scrollTrigger: { trigger: element, start: 'top 88%', once: true }
        }
      );
    });

    gsap.utils.toArray<HTMLElement>('.project').forEach(element => {
      gsap.fromTo(element,
        { y: 28 },
        {
          y: 0,
          duration: 0.7,
          ease: 'power3.out',
          scrollTrigger: { trigger: element, start: 'top 92%', once: true }
        }
      );
    });

    gsap.to('.statement-word', {
      xPercent: 9,
      ease: 'none',
      scrollTrigger: { trigger: '.statement', start: 'top bottom', end: 'bottom top', scrub: 1.5 }
    });

    gsap.to('.hero-photo', {
      scale: 1.11,
      yPercent: 6,
      ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1.2 }
    });
  }

  @HostListener('window:scroll')
  onScroll(): void {
    if (this.scrollFrame) return;
    this.scrollFrame = requestAnimationFrame(() => {
      this.scrollFrame = 0;
      const current = window.scrollY;
      const goingDown = current > this.lastScrollY + 4;
      const goingUp = current < this.lastScrollY - 4;
      if (!this.menuOpen && current > 140 && goingDown) this.navHidden = true;
      if (goingUp || current < 100) this.navHidden = false;
      this.lastScrollY = current;
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
    ScrollTrigger.refresh();
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
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      strong.textContent = `${target}${suffix}`;
      return;
    }
    gsap.to(state, {
      value: target,
      duration: 1.25,
      ease: 'power3.out',
      onUpdate: () => {
        strong.textContent = `${Math.round(state.value)}${suffix}`;
      }
    });
  }

  toggleMenu(): void {
    this.menuOpen ? this.closeMenu() : this.openMenu();
  }

  openMenu(): void {
    this.menuOpen = true;
    this.navHidden = false;
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

  scrollTo(id: string, updateHash = true): void {
    const target = document.getElementById(id);
    if (!target) return;
    if (updateHash) history.replaceState(null, '', `#${id}`);
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    this.closeMenu();
    this.navHidden = false;
  }

  setFilter(filter: WorkFilter): void {
    this.activeFilter = filter;
    window.setTimeout(() => ScrollTrigger.refresh(), 80);
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
