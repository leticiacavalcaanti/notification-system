import { IsString, IsUUID, MinLength } from 'class-validator';

export class NotificarDto {
  @IsUUID()
  mensagemId!: string;

  @IsString()
  @MinLength(1, { message: 'conteudoMensagem não pode ser vazio' })
  conteudoMensagem!: string;
}
