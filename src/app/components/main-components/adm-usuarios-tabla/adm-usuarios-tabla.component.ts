import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { TagModule } from 'primeng/tag';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ToastrService } from 'ngx-toastr';
import { RippleModule } from 'primeng/ripple';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TooltipModule } from 'primeng/tooltip';
import { TextareaModule } from 'primeng/textarea';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ChipModule } from 'primeng/chip';
import { forkJoin, Observable } from 'rxjs';

import { User } from '../../../models/auth/user.model';
import { Role } from '../../../models/auth/role.model';
import { UserService } from '../../../core/services/authentication/user.service';
import { Table } from 'primeng/table';



@Component({
  selector: 'app-adm-usuarios-tabla',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    ToastModule,
    ConfirmDialogModule,
    DialogModule,
    TagModule,
    IconFieldModule,
    InputIconModule,
    RippleModule,
    SelectButtonModule,
    TooltipModule,
    TextareaModule,
    ProgressSpinnerModule,
    ChipModule
  ],
  templateUrl: './adm-usuarios-tabla.component.html',
  styleUrl: './adm-usuarios-tabla.component.scss',
  providers: [MessageService, ConfirmationService]
})
export class AdmUsuariosTablaComponent implements OnInit {
  enableUser(user: User) {
    if (!user.idUser) return;
    const updated: User = { ...user, enabled: true };
    this.userService.update(user.idUser, updated).subscribe({
      next: () => {
        this.toastr.success('Usuario dado de alta correctamente.', 'Éxito');
        this.loadUsers();
      },
      error: () => {
        this.toastr.error('Error al dar de alta el usuario.', 'Error');
      }
    });
  }
  users: User[] = [];
  allUsers: User[] = [];
  loading = false;
  clonedUsers: { [s: string]: User } = {};
  editingRowKeys: { [s: string]: boolean } = {};
  newUserCounter = -1;
  showDeleteConfirmation = false;
  userToDelete: User | null = null;
  userToDeleteIndex: number | null = null;

  showAddRoleDialog = false;
  availableRoles: Role[] = [];
  selectedRoleId: number | null = null;
  userForRole: User | null = null;

  resettingUserId: number | null = null;

  @ViewChild('userTable') userTable!: Table;

  constructor(
    private userService: UserService,
    private toastr: ToastrService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.loading = true;
    this.userService.getAll().subscribe({
      next: (data) => {
        this.allUsers = data;
        this.users = [...data];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.toastr.error('Error al cargar los usuarios.', 'Error');
      }
    });
  }

  private loadAvailableRoles() {
    const allRoles: Role[] = this.allUsers.flatMap(u => u.roles || []);
    this.availableRoles = allRoles.filter((r, i, arr) => arr.findIndex(rr => rr.idRole === r.idRole) === i);
  }

  openAddRoleDialog(user: User) {
    this.userForRole = user;
    this.selectedRoleId = null;
    this.loadAvailableRoles();
    this.showAddRoleDialog = true;
  }

  cancelAddRole() {
    this.showAddRoleDialog = false;
    this.userForRole = null;
    this.selectedRoleId = null;
  }

  confirmAddRole() {
    if (this.userForRole && this.selectedRoleId) {
      const role = this.availableRoles.find(r => r.idRole === this.selectedRoleId);
      if (role) {
        this.userForRole.roles = [role];
        // Si es usuario nuevo, solo asigna localmente
        // Si es existente, llama a addRole
        if (this.userForRole.idUser && this.userForRole.idUser > 0) {
          this.addRole(this.userForRole, role);
        }
      }
    }
    this.cancelAddRole();
  }


  // Devuelve el username (parte antes de @) para el campo user
  getUserNameFromEmail(email: string): string {
    if (!email) return '';
    return email.split('@')[0].trim();
  }



  onRowEditInit(user: User) {
    this.clonedUsers[user.idUser!] = { ...user };
  }

  onRowEditSave(user: User) {
    // Generar username automáticamente desde el email antes de validar
    if (user.email?.trim()) {
      user.username = this.getUserNameFromEmail(user.email);
    }
    
    // Validar campos requeridos
    if (!this.isValidUser(user)) {
      this.toastr.error('Por favor ingrese un email válido', 'Error de validación');
      return;
    }
    
    // Al enviar, mandamos el username (parte antes de @) como 'user'
    const userPayload = { ...user, user: this.getUserNameFromEmail(user.email) };
    
    if (user.idUser && user.idUser > 0) {
      // Usuario existente - mantener el idUser para actualización
      this.userService.update(user.idUser, userPayload).subscribe({
        next: (updated) => {
          this.toastr.success('Usuario actualizado correctamente.', 'Éxito');
          const idx = this.users.findIndex(u => u.idUser === user.idUser);
          if (idx !== -1) {
            this.users[idx] = updated;
            this.users = [...this.users];
          }
        },
        error: () => {
          this.toastr.error('Error al actualizar el usuario.', 'Error');
          const cloned = this.clonedUsers[user.idUser!];
          if (cloned) {
            const idx = this.users.findIndex(u => u.idUser === user.idUser);
            if (idx !== -1) {
              this.users[idx] = { ...cloned };
              this.users = [...this.users];
            }
          }
        }
      });
    } else {
      // Usuario nuevo - eliminar idUser del payload para creación
      const { idUser, ...newUserPayload } = userPayload;
      this.userService.create(newUserPayload).subscribe({
        next: () => {
          this.toastr.success('Usuario creado correctamente.', 'Éxito');
          this.loadUsers();
        },
        error: () => {
          this.toastr.error('Error al crear el usuario.', 'Error');
          const idx = this.users.findIndex(u => u.idUser === user.idUser);
          if (idx !== -1) {
            this.users.splice(idx, 1);
            this.users = [...this.users];
          }
        }
      });
    }
    delete this.editingRowKeys[user.idUser!];
    delete this.clonedUsers[user.idUser!];
  }

  onRowEditCancel(user: User, index: number) {
    if (user.idUser && user.idUser > 0) {
      const cloned = this.clonedUsers[user.idUser];
      if (cloned) {
        const idx = this.users.findIndex(u => u.idUser === user.idUser);
        if (idx !== -1) {
          this.users[idx] = { ...cloned };
        }
      }
    } else {
      this.users.splice(index, 1);
      this.users = [...this.users];
    }
    delete this.editingRowKeys[user.idUser!];
    delete this.clonedUsers[user.idUser!];
  }

  addNewUser() {
    // Crea el usuario vacío y permite edición directa
    const newUser = {
      idUser: this.newUserCounter--,
      username: '',
      email: '',
      ldap: false,
      enabled: true,
      roles: []
    } as User;
    this.users = [...this.users, newUser];
    this.editingRowKeys[newUser.idUser as any] = true;
    // Forzar actualización y mover paginación
    setTimeout(() => {
      this.cdr.detectChanges();
      if (this.userTable) {
        const total = this.users.length;
        const rows = 9;
        const lastPage = Math.ceil(total / rows) - 1;
        this.userTable.first = lastPage * rows;
      }
    }, 0);
  }

  disableUser(user: User) {
    if (!user.idUser) return;
    const updated: User = { ...user, enabled: false };
    this.userService.update(user.idUser, updated).subscribe({
      next: () => {
        this.toastr.success('Usuario dado de baja correctamente.', 'Éxito');
        this.loadUsers();
      },
      error: () => {
        this.toastr.error('Error al dar de baja el usuario.', 'Error');
      }
    });
  }

  addRole(user: User, role: Role) {
    if (!user.idUser) return;
    // Si el usuario es nuevo (idUser < 0), solo modificar localmente
    if (user.idUser < 0) {
      user.roles = [role];
      return;
    }
    user.roles = [role];
    this.userService.addRole(user.idUser, role).subscribe({
      next: () => {
        this.toastr.success('Rol añadido correctamente.', 'Éxito');
        this.loadUsers();
      },
      error: () => {
        this.toastr.error('Error al añadir el rol.', 'Error');
      }
    });
  }

  removeRole(user: User, role: Role) {
    if (!user.idUser) return;
    // Si el usuario es nuevo (idUser < 0), solo modificar localmente
    if (user.idUser < 0) {
      user.roles = [];
      return;
    }
    this.userService.removeRole(user.idUser, role).subscribe({
      next: () => {
        this.toastr.success('Rol quitado correctamente.', 'Éxito');
        this.loadUsers();
      },
      error: () => {
        this.toastr.error('Error al quitar el rol.', 'Error');
      }
    });
  }

  isValidUser(user: User): boolean {
    // Solo validar email ya que username se genera automáticamente desde email
    const email = user.email?.trim();
    if (!email) return false;
    
    // Validación básica de formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  eliminarUsuario(index: number, user: User) {
    if (user.idUser && user.idUser > 0) {
      this.userToDelete = user;
      this.userToDeleteIndex = index;
      this.showDeleteConfirmation = true;
    } else {
      this.users.splice(index, 1);
      this.users = [...this.users];
      this.toastr.info('Usuario no guardado eliminado.', 'Información');
    }
  }

  confirmDelete() {
    if (this.userToDelete && this.userToDelete.idUser) {
      this.userService.delete(this.userToDelete.idUser).subscribe({
        next: () => {
          if (this.userToDeleteIndex !== null) {
            this.users.splice(this.userToDeleteIndex, 1);
            this.users = [...this.users];
          }
          this.toastr.success('Usuario eliminado correctamente.', 'Éxito');
          this.cancelDelete();
        },
        error: () => {
          this.toastr.error('Error al eliminar el usuario.', 'Error');
          this.cancelDelete();
        }
      });
    }
  }

  cancelDelete() {
    this.showDeleteConfirmation = false;
    this.userToDelete = null;
    this.userToDeleteIndex = null;
  }

  // Ya no se fuerza el dominio en el blur
  onEmailBlur(user: User) {
    // No hacer nada
  }

  resetPassword(user: User) {
    if (!user.idUser) return;
    this.resettingUserId = user.idUser;
    this.userService.resetPassword(user.idUser).subscribe({
      next: () => {
        this.toastr.success('La contraseña fue restablecida y enviada al correo institucional.', 'Éxito');
        this.resettingUserId = null;
      },
      error: () => {
        this.toastr.error('No se pudo restablecer la contraseña.', 'Error');
        this.resettingUserId = null;
      }
    });
  }
}
