import { AfterViewInit, Component, HostListener, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { gsap } from 'gsap';

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

  private revealObserver?: IntersectionObserver;
  private sectionObserver?: IntersectionObserver;

  // Curated only from the supplied company portfolio. Low-impact logos, duplicates and weak/dated visuals were removed from the gallery.
  private readonly projectData: Omit<Project, 'index'>[] = [
    { title: 'People & Brand Experience', category: 'Field Marketing', image: 'assets/projects/work-03.webp' },
    { title: 'Retail Activation', category: 'POS / Field Marketing', image: 'assets/projects/work-09.webp' },
    { title: 'Exhibition Presence', category: 'Brand Activation', image: 'assets/projects/work-12.webp' },
    { title: 'Experience Build', category: 'Design / Production', image: 'assets/projects/work-14.webp' },
    { title: 'Night Activation', category: 'Field Marketing', image: 'assets/projects/work-15.webp' },
    { title: 'Retail Experience', category: 'Brand Activation', image: 'assets/projects/work-18.webp' },
    { title: 'Live Event Stage', category: 'Face-to-Face', image: 'assets/projects/work-19.webp' },
    { title: 'Premium Brand Space', category: 'Experiential', image: 'assets/projects/work-20.webp' },
    { title: 'Retail Branding', category: 'Design / Printing', image: 'assets/projects/work-21.webp' },
    { title: 'Summit Experience', category: 'Event Activation', image: 'assets/projects/work-22.webp' },
    { title: 'Mobile Brand Activation', category: 'Field Marketing', image: 'assets/projects/work-43.webp' },
    { title: 'Campaign Launch', category: 'Brand Activation', image: 'assets/projects/work-44.webp' }
  ];

  projects: Project[] = this.projectData.map((project, index) => ({
    ...project,
    index: String(index + 1).padStart(2, '0')
  }));

  ngAfterViewInit(): void {
    window.setTimeout(() => (this.loaded = true), 450);
    document.body.classList.add('ultimate');

    gsap.timeline({ defaults: { ease: 'power3.out' } })
      .from('.hero-kicker', { y: 24, opacity: 0, duration: 0.7, delay: 0.15 })
      .from('.hero-title .line', { yPercent: 120, opacity: 0, duration: 1.05, stagger: 0.1, ease: 'power4.out' }, '-=.35')
      .from('.hero-bottom', { y: 18, opacity: 0, duration: 0.7 }, '-=.6')
      .from('.hero-stamp', { scale: 0.65, opacity: 0, rotate: -10, duration: 0.75 }, '-=.55')
      .from('.hero-photo', { scale: 1.08, opacity: 0, duration: 1.2 }, '<');

    this.revealObserver = new IntersectionObserver(
      entries => entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          if (entry.target.classList.contains('number')) {
            this.animateStat(entry.target as HTMLElement);
          }
          this.revealObserver?.unobserve(entry.target);
        }
      }),
      { threshold: 0.08, rootMargin: '0px 0px -8% 0px' }
    );

    document.querySelectorAll('.reveal').forEach((element, index) => {
      element.setAttribute('style', `--reveal-delay:${Math.min(index * 18, 180)}ms`);
      this.revealObserver!.observe(element);
    });

    this.sectionObserver = new IntersectionObserver(
      entries => entries.forEach(entry => {
        if (entry.isIntersecting) this.activeSection = entry.target.id || this.activeSection;
      }),
      { threshold: 0.18, rootMargin: '-12% 0px -58% 0px' }
    );

    document.querySelectorAll('section[id]').forEach(element => this.sectionObserver!.observe(element));

    const hash = window.location.hash.slice(1);
    if (hash) window.setTimeout(() => this.scrollTo(hash), 0);

  }

  ngOnDestroy(): void {
    this.revealObserver?.disconnect();
    this.sectionObserver?.disconnect();
    document.body.classList.remove('ultimate', 'menu-locked', 'locked');
  }

  @HostListener('window:scroll')
  onScroll(): void {
    const max = document.documentElement.scrollHeight - innerHeight;
    this.scrollProgress = max > 0 ? Math.min(100, Math.max(0, (scrollY / max) * 100)) : 0;
  }

  @HostListener('document:keydown', ['$event'])
  onKey(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.closeProject();
      this.menuOpen = false;
      document.body.classList.remove('menu-locked');
    }
  }

  @HostListener('window:resize')
  onResize(): void {
    if (innerWidth > 800 && this.menuOpen) {
      this.menuOpen = false;
      document.body.classList.remove('menu-locked');
    }
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
    gsap.to(state, {
      value: target,
      duration: 1.25,
      ease: 'power2.out',
      onUpdate: () => {
        strong.textContent = `${Math.round(state.value)}${suffix}`;
      }
    });
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
