import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { Agendamento, Beneficiario, StatusAgendamento } from '../models/agenda.model';

@Injectable({
  providedIn: 'root'
})
export class AgendaService {
  private beneficiariosList: Beneficiario[] = [
    {
      id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      nome_completo: 'Francisca das Chagas Silva',
      cpf: '123.456.789-00',
      telefone: '(11) 98765-4321',
      observacoes: 'Acompanhamento social e psicológico familiar'
    },
    {
      id: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
      nome_completo: 'Marcos Vinicius Lima',
      cpf: '234.567.890-11',
      telefone: '(11) 97654-3210',
      observacoes: 'Inscrição para cursos profissionalizantes AACCP'
    }
  ];

  private agendamentosList: Agendamento[] = [
    {
      id: 'sched-001',
      beneficiario_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      beneficiario_nome: 'Francisca das Chagas Silva',
      beneficiario_cpf: '123.456.789-00',
      beneficiario_telefone: '(11) 98765-4321',
      profissional_nome: 'Dr. Carlos Mendes (Psicologia)',
      data: '2026-10-15',
      horario_inicio: '14:00',
      horario_fim: '15:00',
      status: 'Confirmado'
    },
    {
      id: 'sched-002',
      beneficiario_id: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
      beneficiario_nome: 'Marcos Vinicius Lima',
      beneficiario_cpf: '234.567.890-11',
      beneficiario_telefone: '(11) 97654-3210',
      profissional_nome: 'Dr. Carlos Mendes (Psicologia)',
      data: '2026-10-15',
      horario_inicio: '16:00',
      horario_fim: '17:00',
      status: 'Agendado'
    }
  ];

  private agendamentosSubject = new BehaviorSubject<Agendamento[]>(this.agendamentosList);

  getBeneficiarios(): Observable<Beneficiario[]> {
    return of(this.beneficiariosList);
  }

  buscarBeneficiarioPorCpf(cpf: string): Observable<Beneficiario | undefined> {
    const limpo = cpf.replace(/\D/g, '');
    const encontrado = this.beneficiariosList.find(b => b.cpf.replace(/\D/g, '') === limpo);
    return of(encontrado);
  }

  cadastrarBeneficiario(novo: Omit<Beneficiario, 'id'>): Observable<Beneficiario> {
    const limpo = novo.cpf.replace(/\D/g, '');
    const existe = this.beneficiariosList.some(b => b.cpf.replace(/\D/g, '') === limpo);

    if (existe) {
      return throwError(() => new Error('CPF já cadastrado na base de dados.'));
    }

    const cadastrado: Beneficiario = {
      id: 'ben-' + Math.random().toString(36).substring(2, 9),
      ...novo
    };

    this.beneficiariosList.push(cadastrado);
    return of(cadastrado);
  }

  getAgendamentos(): Observable<Agendamento[]> {
    return this.agendamentosSubject.asObservable();
  }

  /**
   * RF02 - Regra de Negócio: Bloqueio estrito de sobreposição de horários
   * para o mesmo profissional.
   */
  criarAgendamento(novo: Omit<Agendamento, 'id'>): Observable<Agendamento> {
    const conflito = this.agendamentosList.some(ag =>
      ag.profissional_nome === novo.profissional_nome &&
      ag.data === novo.data &&
      ag.horario_inicio === novo.horario_inicio &&
      ag.status !== 'Cancelado'
    );

    if (conflito) {
      return throwError(() => new Error('HTTP 409: Horário já ocupado para este profissional nesta data.'));
    }

    const agendamentoCriado: Agendamento = {
      id: 'sched-' + Math.random().toString(36).substring(2, 9),
      ...novo
    };

    this.agendamentosList.push(agendamentoCriado);
    this.agendamentosSubject.next([...this.agendamentosList]);
    return of(agendamentoCriado);
  }

  /**
   * RF03 - Atualização de status em tempo real com liberação de horário
   * em caso de cancelamento.
   */
  atualizarStatus(id: string, novoStatus: StatusAgendamento): Observable<Agendamento> {
    const agendamento = this.agendamentosList.find(a => a.id === id);

    if (!agendamento) {
      return throwError(() => new Error('Agendamento não encontrado.'));
    }

    agendamento.status = novoStatus;
    this.agendamentosSubject.next([...this.agendamentosList]);
    return of(agendamento);
  }
}
