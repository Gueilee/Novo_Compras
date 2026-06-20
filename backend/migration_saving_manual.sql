-- ═══════════════════════════════════════════════════════════════
-- SHP — MIGRATION: Saving Manual (Desconto Adicional via Conciliação)
-- Adiciona coluna para registrar o preço final negociado após a
-- seleção do fornecedor, permitindo capturar descontos obtidos
-- que não constavam na cotação original.
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE requisicoes
  ADD COLUMN IF NOT EXISTS preco_negociado_final NUMERIC(12,2);
