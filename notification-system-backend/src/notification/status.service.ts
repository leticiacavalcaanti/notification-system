import { Injectable } from '@nestjs/common';

/**
 * Serviço simples para armazenar em memória
 * o status de cada mensagem processada.
 */
export type StatusMsg =
  | 'AGUARDANDO_PROCESSAMENTO'
  | 'PROCESSADO_SUCESSO'
  | 'FALHA_PROCESSAMENTO'
  | 'DESCONHECIDO';

@Injectable()
export class StatusService {
  private readonly mapa = new Map<string, StatusMsg>();

  set(id: string, status: StatusMsg) {
    this.mapa.set(id, status);
  }

  get(id: string): StatusMsg {
    return this.mapa.get(id) ?? 'DESCONHECIDO';
  }
}
