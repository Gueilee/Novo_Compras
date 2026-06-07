-- ============================================================
--  SHP — Catálogo de Itens Padronizados
--  Execute este script no Supabase SQL Editor
-- ============================================================

-- 1. Tabela de catálogo (itens padronizados para seleção no intake)
CREATE TABLE IF NOT EXISTS catalogo_itens (
  id        BIGSERIAL PRIMARY KEY,
  descricao TEXT      NOT NULL,
  unidade   TEXT      NOT NULL DEFAULT 'UN',
  segmento  TEXT,
  ativo     BOOLEAN   NOT NULL DEFAULT true,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Índice full-text para busca rápida (português)
CREATE INDEX IF NOT EXISTS idx_catalogo_itens_desc_fts
  ON catalogo_itens USING gin(to_tsvector('portuguese', descricao));

-- Índice ILIKE para busca parcial simples
CREATE INDEX IF NOT EXISTS idx_catalogo_itens_desc_lower
  ON catalogo_itens (lower(descricao));

-- 2. Coluna origem em itens_requisicao
--    Valores: 'compra' (padrão) | 'estoque'
ALTER TABLE itens_requisicao
  ADD COLUMN IF NOT EXISTS origem TEXT NOT NULL DEFAULT 'compra';

-- ============================================================
-- Após criar a tabela, cole os itens do catálogo aqui:
-- INSERT INTO catalogo_itens (descricao, unidade, segmento) VALUES
--   ('PAPEL SULFITE A4 75G', 'RM', 'ESCRITÓRIO'),
--   ('CANETA ESFEROGRÁFICA AZUL', 'CX', 'ESCRITÓRIO'),
--   ...
-- ============================================================

-- ============================================================
--  Feature 5 — Aprovação do Gestor no Mapa de Cotação
--  Execute no Supabase SQL Editor
-- ============================================================
ALTER TABLE requisicoes ADD COLUMN IF NOT EXISTS aprovado_gestor_cnpj TEXT;
ALTER TABLE requisicoes ADD COLUMN IF NOT EXISTS aprovado_gestor_obs  TEXT;
ALTER TABLE requisicoes ADD COLUMN IF NOT EXISTS aprovado_gestor_em   TEXT;
