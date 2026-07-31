import { bootstrapApplication } from '@angular/platform-browser';
import { Chart, registerables } from 'chart.js';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

// Registra todos os componentes do Chart.js (controladores, escalas, elementos) uma única vez,
// no início da aplicação - sem isso, os gráficos da tela de Estatísticas não renderizariam.
Chart.register(...registerables);

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
