import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app.component';

if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.scrollTo({ top: 0, left: 0, behavior: 'auto' });

bootstrapApplication(AppComponent).catch((err: unknown) => console.error(err));
