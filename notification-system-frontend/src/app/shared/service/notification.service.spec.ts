import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { NotificationService } from './notification.service';

describe('NotificationService', () => {
  let service: NotificationService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(NotificationService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('deve fazer POST em /api/notificar e retornar a resposta 202', (done) => {
    const mensagemId = '123e4567-e89b-12d3-a456-426614174000' as any; // UUID mock
    const conteudoMensagem = 'olá mundo';

    service.notify(mensagemId, conteudoMensagem).subscribe((res) => {
      expect(res.status).toBe(202);
      expect(res.body).toEqual({ ok: true });
      done();
    });

    const req = httpMock.expectOne('/api/notificar');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ mensagemId, conteudoMensagem });

    req.flush({ ok: true }, { status: 202, statusText: 'Accepted' });
  });

  it('deve propagar erro quando backend retorna 400', (done) => {
    const mensagemId = '123e4567-e89b-12d3-a456-426614174000' as any;
    const conteudoMensagem = '';

    service.notify(mensagemId, conteudoMensagem).subscribe({
      next: () => {
        fail('esperava erro 400');
      },
      error: (err) => {
        expect(err.status).toBe(400);
        done();
      },
    });

    const req = httpMock.expectOne('/api/notificar');
    expect(req.request.method).toBe('POST');
    req.flush({ message: 'bad request' }, { status: 400, statusText: 'Bad Request' });
  });
});
