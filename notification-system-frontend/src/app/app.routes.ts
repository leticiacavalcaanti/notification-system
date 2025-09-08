import { Component } from '@angular/core';
import { Routes } from '@angular/router';
import { NotificacaoComponent } from './notificacao/notificacao.component';

export const routes: Routes = [

  { path: '', redirectTo: 'notifications', pathMatch: 'full' },
  { path: 'notifications', component: NotificacaoComponent }

];
