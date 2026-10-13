-- =====================================================================
-- OMNICONNECT - SCHEMA RELACIONAL POSTGRESQL (SUPABASE)
-- =====================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABELA DE BENEFICIÁRIOS
CREATE TABLE IF NOT EXISTS public.beneficiarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome_completo VARCHAR(150) NOT NULL,
    cpf VARCHAR(14) NOT NULL UNIQUE,
    telefone VARCHAR(20) NOT NULL,
    observacoes TEXT,
    data_cadastro TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 2. TABELA DE AGENDAMENTOS
CREATE TABLE IF NOT EXISTS public.agendamentos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    beneficiario_id UUID NOT NULL REFERENCES public.beneficiarios(id) ON DELETE RESTRICT,
    profissional_nome VARCHAR(120) NOT NULL,
    data_hora_inicio TIMESTAMP WITH TIME ZONE NOT NULL,
    data_hora_fim TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Agendado',
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT chk_status CHECK (status IN ('Agendado', 'Confirmado', 'Concluido', 'Falta', 'Cancelado')),
    CONSTRAINT chk_intervalo_tempo CHECK (data_hora_fim > data_hora_inicio)
);

-- Índices para otimização de consultas
CREATE INDEX IF NOT EXISTS idx_agendamentos_profissional_data ON public.agendamentos (profissional_nome, data_hora_inicio);
CREATE INDEX IF NOT EXISTS idx_beneficiarios_cpf ON public.beneficiarios (cpf);

-- SEED DE DADOS FICTÍCIOS PARA HOMOLOGAÇÃO
INSERT INTO public.beneficiarios (id, nome_completo, cpf, telefone, observacoes)
VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Francisca das Chagas Silva', '123.456.789-00', '(11) 98765-4321', 'Família participante do projeto social de apoio comunitário'),
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Marcos Vinicius Lima', '234.567.890-11', '(11) 97654-3210', 'Interesse nas oficinas de capacitação profissional');

INSERT INTO public.agendamentos (beneficiario_id, profissional_nome, data_hora_inicio, data_hora_fim, status)
VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Dr. Carlos Mendes (Psicologia)', '2026-10-15 14:00:00+00', '2026-10-15 15:00:00+00', 'Confirmado'),
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Dr. Carlos Mendes (Psicologia)', '2026-10-15 16:00:00+00', '2026-10-15 17:00:00+00', 'Agendado');
