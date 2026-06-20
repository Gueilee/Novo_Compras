-- ═══════════════════════════════════════════════════════════════
-- SHP — MIGRATION: Saving Dashboard
-- Adiciona coluna preco_original para rastrear o preço inicial
-- do fornecedor antes de qualquer negociação.
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE lances_fornecedor
  ADD COLUMN IF NOT EXISTS preco_original NUMERIC(12,2);

-- Backfill: registros existentes recebem preco_original = preco_unitario
UPDATE lances_fornecedor
SET preco_original = preco_unitario
WHERE preco_original IS NULL
  AND preco_unitario IS NOT NULL
  AND preco_unitario > 0;
