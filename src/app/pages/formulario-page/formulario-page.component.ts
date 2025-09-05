import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { TabMenuModule } from 'primeng/tabmenu';
import { MenuItem } from 'primeng/api';
import { FooterComponent } from '../../components/utilities/footer/footer.component';
import { MenubarComponent } from '../../components/utilities/menubar/menubar.component';
import { FormularioComponent } from '../../components/main-components/formulario/formulario.component';

@Component({
  selector: 'app-formulario-page',
  imports: [
    CommonModule,
    CardModule,
    TabMenuModule,
    MenubarComponent,
    FooterComponent,
    FormularioComponent
],
  templateUrl: './formulario-page.component.html',
  styleUrl: './formulario-page.component.scss'
})
export class FormularioPageComponent implements OnInit {
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
    this.activeItem = this.navigationItems[0];
  }

  onTabChange(event: MenuItem) {
    this.activeItem = event;
  }
}
