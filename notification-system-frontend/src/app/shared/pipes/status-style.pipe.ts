import { Pipe, PipeTransform } from '@angular/core';
import { Status } from '../interface/message';

export interface StatusView {
  cls: string;
  icon: string;
  label: string;
}

@Pipe({
  name: 'statusStyle',
  standalone: true,
})
export class StatusStylePipe implements PipeTransform {

  transform(status: Status | string): StatusView {
    const value = typeof status === 'string' ? status : (status as Status);
    switch (value) {
      case Status.PROCESSADO_SUCESSO:
      case 'Processado com Sucesso':
        return { cls: 'status-success', icon: 'check_circle', label: Status.PROCESSADO_SUCESSO };
      case Status.FALHA_PROCESSAMENTO:
      case 'Falha no Processamento':
        return { cls: 'status-fail', icon: 'error', label: Status.FALHA_PROCESSAMENTO };
      case Status.AGUARDANDO_PROCESSAMENTO:
      case 'Aguardando Processamento':
      default:
        return { cls: 'status-pending', icon: 'schedule', label: Status.AGUARDANDO_PROCESSAMENTO };
    }
  }

}
