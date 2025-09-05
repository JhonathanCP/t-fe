import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { TabMenuModule } from 'primeng/tabmenu';
import { MenuItem } from 'primeng/api';
import { MenubarComponent } from '../../components/utilities/menubar/menubar.component';
import { FooterComponent } from '../../components/utilities/footer/footer.component';
import { HistorialPrediccionesComponent } from '../../components/main-components/historial-predicciones/historial-predicciones.component';

@Component({
  selector: 'app-historial-page',
  imports: [
    CardModule,
    TabMenuModule,
    MenubarComponent,
    FooterComponent,
    HistorialPrediccionesComponent
  ],
  templateUrl: './historial-page.component.html',
  styleUrl: './historial-page.component.scss'
})
export class HistorialPageComponent implements OnInit {
  navigationItems: MenuItem[] = [];
  activeItem: MenuItem = {};

  constructor(private router: Router) {}

  ngOnInit() {
    this.navigationItems = [
      {
        label: 'Nueva Predicción',
        icon: 'pi pi-chart-line',
        command: () => this.router.navigate(['/menu'])
      },
      {
        label: 'Historial',
        icon: 'pi pi-history',
        command: () => this.router.navigate(['/historial'])
      }
    ];
    
    // Establecer el item activo basado en la ruta actual
    this.activeItem = this.navigationItems[1];
  }

  onTabChange(event: MenuItem) {
    this.activeItem = event;
  }
}
