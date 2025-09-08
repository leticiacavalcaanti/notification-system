export enum Status {
  AGUARDANDO_PROCESSAMENTO = 'Aguardando Processamento',
  PROCESSADO_SUCESSO = 'Processado com Sucesso',
  FALHA_PROCESSAMENTO = 'Falha no Processamento'
}

export function mapStringToStatusEnum(code: string): Status {
  switch (code) {
    case 'AGUARDANDO_PROCESSAMENTO':
      return Status.AGUARDANDO_PROCESSAMENTO;
    case 'PROCESSADO_SUCESSO':
      return Status.PROCESSADO_SUCESSO;
    case 'FALHA_PROCESSAMENTO':
      return Status.FALHA_PROCESSAMENTO;
    default:
      return Status.FALHA_PROCESSAMENTO;
  }
}

export interface Message {
  id: string;
  message: string;
  status: Status;
  timestamp: Date;
}
