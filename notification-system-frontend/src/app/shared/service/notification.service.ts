import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { io } from 'socket.io-client';
import { mapStringToStatusEnum, Status } from '../interface/message';
import { environment } from '../../enviroments/enviroments';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly BASE_URI = environment.BASE_URI;

  constructor(private readonly http: HttpClient) { }

  notify(mensagemId: string, conteudoMensagem: string): Observable<HttpResponse<unknown>> {
    const body = { mensagemId, conteudoMensagem };
    return this.http.post(`${this.BASE_URI}/api/notificar`, body, { observe: 'response' });
  }

  openStatusStream(mensagemId: string): Observable<Status> {
    return new Observable<Status>((observer) => {
      const socket = io(this.BASE_URI, { transports: ['websocket'] });
      const handler = (data: any) => {
        const status = mapStringToStatusEnum(data.status);
        observer.next(status);
        if (status === Status.PROCESSADO_SUCESSO || status === Status.FALHA_PROCESSAMENTO) {
          observer.complete();
        }
      };

      socket.on('notificacao_status', handler);
      return () => {
        socket.off('notificacao_status', handler);
      };
    });
  }
}
