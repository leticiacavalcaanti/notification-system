
# Notification System - Rodando Local

Este projeto possui dois diretórios principais:
- `notification-system-backend` (NestJS)
- `notification-system-frontend` (Angular)

## Pré-requisitos
- Node.js 18+
- npm
- Docker (para RabbitMQ)

---

## 1. Subindo o RabbitMQ com Docker

Abra o terminal e execute:
```powershell
docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:management
```
Acesse a interface de gerenciamento: http://localhost:15672 (usuário/senha: guest/guest)

---

## 2. Configurando o Backend (NestJS)

```powershell
cd notification-system-backend
npm install
```

Crie o arquivo `.env` na pasta do backend com:
```env
AMQP_URL=amqp://guest:guest@localhost:5672
SEU_NOME=seunome
PORT=3000
```

Inicie o backend:
```powershell
npm run start:dev
```
O backend estará em: http://localhost:3000

---

## 3. Configurando o Frontend (Angular)

```powershell
cd notification-system-frontend
npm install
ng serve
```
O frontend estará em: http://localhost:4200

---

## Ordem Recomendada
1. Suba o RabbitMQ (Docker)
2. Inicie o backend
3. Inicie o frontend

---

## Dicas
- O backend precisa do RabbitMQ rodando para funcionar corretamente.
- O frontend consome a API do backend, então ambos devem estar ativos.
- Para testes, utilize as URLs locais informadas acima.
