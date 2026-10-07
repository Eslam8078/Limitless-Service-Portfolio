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
  private scrollFrame = 0;
  private touchStartX: number | null = null;
  private lastScrollY = 0;

  private readonly projectData: Omit<Project, 'index'>[] = [
    { title: 'Retail & Production Display', category: 'Production', image: 'assets/projects/work-11.webp' },
    { title: 'Live Campaign Experience', category: 'Events', image: 'assets/projects/work-10.webp' },
    { title: 'Total Brand Activation', category: 'Events', image: 'assets/projects/work-09.webp' },
    { title: 'Total Roadshow', category: 'Field Marketing', image: 'assets/projects/work-08.webp' },
    { title: 'Castrol Roadshow', category: 'Events', image: 'assets/projects/work-07.webp' },
    { title: 'Castrol Field Activation', category: 'Field Marketing', image: 'assets/projects/work-06.webp' },
    { title: 'Retail Brand Experience', category: 'Production', image: 'assets/projects/work-05.webp' },
    { title: 'Premium Display Install', category: 'Brand Activation', image: 'assets/projects/work-04.webp' },
    { title: 'Orange Exhibition Build', category: 'Production', image: 'assets/projects/work-03.webp' },
    { title: 'Pharma Brand Space', category: 'Events', image: 'assets/projects/work-02.webp' },
    { title: 'Open Stars Experience', category: 'Brand Activation', image: 'assets/projects/work-01.webp' }
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
    this.forceHeroStart();
    this.lastScrollY = 0;
    document.body.classList.add('ultimate');
    this.setScrollVars();
    this.setupIntroAnimation();
    this.setupRevealObserver();
    this.setupScrollAnimations();
    this.setupAdvancedMotion();
    this.setupHeroMicroMotion();
    this.syncActiveSection();

    this.finishLoaderWhenReady();
    window.setTimeout(() => ScrollTrigger.refresh(), 950);
  }

  private forceHeroStart(): void {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    history.replaceState(null, '', '#home');
    this.activeSection = 'home';
  }

  ngOnDestroy(): void {
    this.revealObserver?.disconnect();
    if (this.scrollFrame) cancelAnimationFrame(this.scrollFrame);
    ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    document.body.classList.remove('ultimate', 'menu-locked', 'locked', 'site-ready');
  }

  private finishLoaderWhenReady(): void {
    window.setTimeout(() => {
      this.loaded = true;
      document.body.classList.add('site-ready');
    }, 520);
  }

  private setupIntroAnimation(): void {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduceMotion) {
      document.querySelectorAll('.reveal').forEach(el => el.classList.add('is-visible'));
      return;
    }

    const intro = gsap.timeline({ defaults: { ease: 'power4.out' } });
    intro
      .from('.nav', { y: -24, opacity: 0, duration: 0.65 })
      .from('.hero-top span', { y: 10, opacity: 0, duration: 0.45, stagger: 0.08 }, '-=.35')
      .from('.hero-kicker', { y: 24, opacity: 0, duration: 0.6 }, '-=.25')
      .from('.hero-title .line', { yPercent: 125, opacity: 0, duration: 0.95, stagger: 0.09 }, '-=.25')
      .from('.hero-bottom > *', { y: 24, opacity: 0, duration: 0.6, stagger: 0.1 }, '-=.5')
      .from('.hero-panel', { x: 34, y: 12, opacity: 0, scale: .92, duration: .85 }, '-=.48')
      .from('.hero-scroll', { y: 14, opacity: 0, duration: .5 }, '-=.38')
      .from('.hero-meta span', { x: 10, opacity: 0, duration: .4, stagger: .07 }, '-=.35');
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

  private setupAdvancedMotion(): void {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    gsap.utils.toArray<HTMLElement>('.section-no').forEach((element) => {
      gsap.fromTo(element,
        { opacity: 0, x: -18 },
        {
          opacity: 1,
          x: 0,
          duration: .7,
          ease: 'power3.out',
          scrollTrigger: { trigger: element, start: 'top 88%', once: true }
        }
      );
    });

    gsap.utils.toArray<HTMLElement>('.client-logos span').forEach((element, index) => {
      gsap.fromTo(element,
        { opacity: 0, y: 18 },
        {
          opacity: 1,
          y: 0,
          duration: .55,
          delay: index * .055,
          ease: 'power3.out',
          scrollTrigger: { trigger: element.parentElement, start: 'top 86%', once: true }
        }
      );
    });

    gsap.fromTo('.contact-button',
      { scale: .94, opacity: 0 },
      {
        scale: 1,
        opacity: 1,
        duration: .8,
        ease: 'back.out(1.5)',
        scrollTrigger: { trigger: '.contact-button', start: 'top 88%', once: true }
      }
    );

    gsap.fromTo('.footer-main > *',
      { opacity: 0, y: 16 },
      {
        opacity: 1,
        y: 0,
        duration: .65,
        stagger: .1,
        ease: 'power3.out',
        scrollTrigger: { trigger: 'footer', start: 'top 95%', once: true }
      }
    );

    if (!finePointer) return;

    document.querySelectorAll<HTMLElement>('.project').forEach((card) => {
      const onMove = (event: MouseEvent): void => {
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - .5;
        const y = (event.clientY - rect.top) / rect.height - .5;
        card.style.setProperty('--tilt-x', (x * 4).toFixed(2));
        card.style.setProperty('--tilt-y', (y * 4).toFixed(2));
      };
      const onLeave = (): void => {
        card.style.setProperty('--tilt-x', '0');
        card.style.setProperty('--tilt-y', '0');
      };
      card.addEventListener('mousemove', onMove);
      card.addEventListener('mouseleave', onLeave);
    });
  }

  private setupHeroMicroMotion(): void {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (reduced || !finePointer) return;

    gsap.fromTo('.hero-panel-grid div',
      { opacity: 0, y: 14 },
      {
        opacity: 1,
        y: 0,
        duration: .55,
        stagger: .08,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.hero', start: 'top 72%', once: true }
      }
    );

    gsap.fromTo('.hero-meta span',
      { opacity: .18, x: 7 },
      {
        opacity: 1,
        x: 0,
        duration: .5,
        stagger: .09,
        ease: 'power3.out',
        delay: .35
      }
    );
  }

  onHeroPointerMove(event: PointerEvent): void {
    if (event.pointerType !== 'mouse' && event.pointerType !== 'pen') return;
    const hero = event.currentTarget as HTMLElement | null;
    if (!hero) return;

    const rect = hero.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    hero.style.setProperty('--hero-mx', `${x.toFixed(2)}%`);
    hero.style.setProperty('--hero-my', `${y.toFixed(2)}%`);
  }

  resetHeroPointer(): void {
    const hero = document.querySelector<HTMLElement>('.hero');
    hero?.style.setProperty('--hero-mx', '68%');
    hero?.style.setProperty('--hero-my', '42%');
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

  }

  @HostListener('window:scroll')
  onScroll(): void {
    if (this.scrollFrame) return;
    this.scrollFrame = requestAnimationFrame(() => {
      this.scrollFrame = 0;
      const current = window.scrollY;
      this.navHidden = false;
      this.lastScrollY = current;
      this.setScrollVars();
      this.syncActiveSection();
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
    if (innerWidth > 1080 && this.menuOpen) this.closeMenu();
    ScrollTrigger.refresh();
    this.syncActiveSection();
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
    this.activeSection = id;
    this.closeMenu();
    this.navHidden = false;
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.setTimeout(() => this.syncActiveSection(), 700);
  }

  private syncActiveSection(): void {
    const nav = document.querySelector<HTMLElement>('.nav');
    const marker = window.scrollY + (nav?.offsetHeight ?? 84) + 24;
    const sections = Array.from(document.querySelectorAll<HTMLElement>('main section[id]'));
    const positions = sections
      .map(section => ({
        id: section.id,
        top: section.getBoundingClientRect().top + window.scrollY
      }))
      .sort((a, b) => a.top - b.top);

    let currentId = positions[0]?.id ?? 'home';
    for (const section of positions) {
      if (section.top <= marker) currentId = section.id;
      else break;
    }

    if (window.scrollY <= 10) currentId = 'home';
    this.activeSection = currentId;
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
