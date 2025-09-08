import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { TableComponent } from '../shared/components/table/table.component';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { Message, Status } from '../shared/interface/message';
import { NotificationService } from '../shared/service/notification.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { takeWhile } from 'rxjs/operators';

@Component({
  selector: 'app-notificacao',
  imports: [CommonModule, MatToolbarModule, TableComponent, MatInputModule, MatFormFieldModule, ReactiveFormsModule, MatIconModule, MatDividerModule, MatButtonModule, MatSnackBarModule],
  templateUrl: './notificacao.component.html',
  styleUrl: './notificacao.component.scss'
})
export class NotificacaoComponent {
  messageControl!: FormControl;
  form: FormGroup;
  data: Message[] = [];


  constructor(private readonly notificationService: NotificationService, private readonly snackBar: MatSnackBar) {
    this.messageControl = new FormControl('', [Validators.required, Validators.minLength(1), Validators.maxLength(256)]);
    this.form = new FormGroup({
      message: this.messageControl,
    });
  }

  onSend(): void {
  const value = this.form.value.message.toString().trim();
  const mensagemId = this.generateUuid();

    this.notificationService.notify(mensagemId, value).subscribe({
      next: (res) => {
        if (res.status === 202) {
          this.data = [
            { id: mensagemId, message: value, status: Status.AGUARDANDO_PROCESSAMENTO, timestamp: new Date() },
            ...this.data,
          ];
          this.snackBar.open('Notificação recebida para processamento', 'OK', { duration: 3000 });
          this.subscribeStatus(mensagemId);
        }
      },
      error: () => {
        this.snackBar.open('Falha ao enviar notificação', 'OK', { duration: 3000 });
      }
    });

    this.form.reset();

  }

  private subscribeStatus(id: string): void {
    this.notificationService
      .openStatusStream(id)
      .pipe(
        takeWhile((status) => status === Status.AGUARDANDO_PROCESSAMENTO, true)
      )
      .subscribe((status) => {
        this.data = this.data.map(row =>
          String(row.id) === id ? { ...row, status, timestamp: new Date() } : row
        );
      });
  }

  private generateUuid(): string {
    const g = globalThis as any;
    if (g.crypto && typeof g.crypto.randomUUID === 'function') {
      return g.crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

}
