import { TestBed } from '@angular/core/testing';
import { AgendaService } from './agenda.service';

describe('AgendaService (Testes Unitários de Regras de Negócio)', () => {
  let service: AgendaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AgendaService);
  });

  it('deve ser instanciado com sucesso', () => {
    expect(service).toBeTruthy();
  });

  it('RF01: deve encontrar um beneficiário existente pelo CPF', (done) => {
    service.buscarBeneficiarioPorCpf('123.456.789-00').subscribe(beneficiario => {
      expect(beneficiario).toBeDefined();
      expect(beneficiario?.nome_completo).toContain('Francisca das Chagas');
      done();
    });
  });

  it('RF02: deve bloquear agendamento conflitante para o mesmo profissional (HTTP 409)', (done) => {
    const novoAgendamentoConflitante = {
      beneficiario_id: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
      beneficiario_nome: 'Marcos Vinicius Lima',
      profissional_nome: 'Dr. Carlos Mendes (Psicologia)',
      data: '2026-10-15',
      horario_inicio: '14:00', // Horário já ocupado na base
      horario_fim: '15:00',
      status: 'Agendado' as const
    };

    service.criarAgendamento(novoAgendamentoConflitante).subscribe({
      next: () => fail('Deveria ter disparado erro de conflito de horário.'),
      error: (err) => {
        expect(err.message).toContain('HTTP 409');
        done();
      }
    });
  });

  it('RF02: deve permitir novo agendamento caso o horário esteja livre', (done) => {
    const novoLivre = {
      beneficiario_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      beneficiario_nome: 'Francisca das Chagas Silva',
      profissional_nome: 'Dr. Carlos Mendes (Psicologia)',
      data: '2026-10-15',
      horario_inicio: '15:00', // Livre
      horario_fim: '16:00',
      status: 'Agendado' as const
    };

    service.criarAgendamento(novoLivre).subscribe(ag => {
      expect(ag.id).toBeDefined();
      expect(ag.horario_inicio).toBe('15:00');
      done();
    });
  });

  it('RF03: deve atualizar o status do agendamento para Cancelado', (done) => {
    service.atualizarStatus('sched-002', 'Cancelado').subscribe(ag => {
      expect(ag.status).toBe('Cancelado');
      done();
    });
  });
});
