import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AgendaService } from '../../services/agenda.service';
import { Agendamento, Beneficiario, StatusAgendamento } from '../../models/agenda.model';

@Component({
  selector: 'app-agenda',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './agenda.component.html',
  styleUrls: ['./agenda.component.css']
})
export class AgendaComponent implements OnInit {
  dataSelecionada = '2026-10-15';
  profissionalSelecionado = 'Dr. Carlos Mendes (Psicologia)';
  agendamentos: Agendamento[] = [];
  gradeHorarios = ['14:00', '15:00', '16:00', '17:00'];

  // Modais e Feedback
  modalAberto = false;
  toastMensagem = '';
  toastTipo: 'sucesso' | 'erro' = 'sucesso';

  // Forms
  agendaForm: FormGroup;
  buscaCpfForm: FormGroup;
  beneficiarioLocalizado: Beneficiario | null = null;
  horarioSelecionadoSlot = '';

  constructor(
    private fb: FormBuilder,
    private agendaService: AgendaService,
    private router: Router
  ) {
    this.buscaCpfForm = this.fb.group({
      cpf: ['', [Validators.required]]
    });

    this.agendaForm = this.fb.group({
      profissional: [this.profissionalSelecionado, Validators.required],
      data: [this.dataSelecionada, Validators.required],
      horario: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.carregarAgendamentos();
  }

  get vagasLivres(): number {
    return this.gradeHorarios.filter(h => !this.getAgendamentoPorHorario(h)).length;
  }

  carregarAgendamentos(): void {
    this.agendaService.getAgendamentos().subscribe(list => {
      this.agendamentos = list.filter(
        a => a.data === this.dataSelecionada && a.profissional_nome === this.profissionalSelecionado
      );
    });
  }

  getAgendamentoPorHorario(horario: string): Agendamento | undefined {
    return this.agendamentos.find(a => a.horario_inicio === horario && a.status !== 'Cancelado');
  }

  abrirModalAgendamento(horario: string): void {
    this.horarioSelecionadoSlot = horario;
    this.agendaForm.patchValue({ horario });
    this.modalAberto = true;
  }

  fecharModal(): void {
    this.modalAberto = false;
    this.beneficiarioLocalizado = null;
    this.buscaCpfForm.reset();
  }

  buscarCpf(): void {
    const cpf = this.buscaCpfForm.get('cpf')?.value;
    if (!cpf) return;

    this.agendaService.buscarBeneficiarioPorCpf(cpf).subscribe(b => {
      if (b) {
        this.beneficiarioLocalizado = b;
      } else {
        this.beneficiarioLocalizado = null;
        this.exibirToast('Beneficiário não localizado. Verifique o CPF.', 'erro');
      }
    });
  }

  salvarAgendamento(): void {
    if (!this.beneficiarioLocalizado) {
      this.exibirToast('Localize o beneficiário antes de confirmar.', 'erro');
      return;
    }

    const { profissional, data, horario } = this.agendaForm.value;

    // Cálculo de término (1 hora)
    const horaInt = parseInt(horario.split(':')[0], 10);
    const horaFim = `${String(horaInt + 1).padStart(2, '0')}:00`;

    this.agendaService.criarAgendamento({
      beneficiario_id: this.beneficiarioLocalizado.id,
      beneficiario_nome: this.beneficiarioLocalizado.nome_completo,
      beneficiario_cpf: this.beneficiarioLocalizado.cpf,
      beneficiario_telefone: this.beneficiarioLocalizado.telefone,
      profissional_nome: profissional,
      data,
      horario_inicio: horario,
      horario_fim: horaFim,
      status: 'Confirmado'
    }).subscribe({
      next: () => {
        this.exibirToast(`Agendamento confirmado para ${this.beneficiarioLocalizado?.nome_completo} às ${horario}!`, 'sucesso');
        this.fecharModal();
      },
      error: (err) => {
        this.exibirToast(err.message, 'erro');
      }
    });
  }

  alterarStatus(agendamento: Agendamento, novoStatus: StatusAgendamento): void {
    this.agendaService.atualizarStatus(agendamento.id, novoStatus).subscribe({
      next: () => {
        if (novoStatus === 'Cancelado') {
          this.exibirToast(`Horário das ${agendamento.horario_inicio} liberado com sucesso para novos atendimentos.`, 'sucesso');
        } else {
          this.exibirToast(`Status alterado para ${novoStatus}.`, 'sucesso');
        }
      }
    });
  }

  exibirToast(msg: string, tipo: 'sucesso' | 'erro'): void {
    this.toastMensagem = msg;
    this.toastTipo = tipo;
    setTimeout(() => { this.toastMensagem = ''; }, 4000);
  }

  logout(): void {
    this.router.navigate(['/login']);
  }
}
