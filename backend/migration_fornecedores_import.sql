-- ═══════════════════════════════════════════════════════════════
-- SHP — IMPORT: Fornecedores da Planilha Excel (versão corrigida)
-- Importa 9 fornecedores da base operacional para o banco.
-- NÃO existe coluna "segmento" — usa "segmentos_interesse" (TEXT[]).
-- ═══════════════════════════════════════════════════════════════

-- ── 1. Remove registros com CNPJ no formato antigo (legado) ─────
-- CNPJs antigos foram salvos com formatação (ex: 37.064.364/0001-45).
-- O padrão atual é numérico puro (37064364000145). Esta linha limpa
-- os duplicados com formato legado antes do upsert.
DELETE FROM fornecedores WHERE cnpj ~ '[.\-/]';

-- ── 2. Upsert dos fornecedores ───────────────────────────────────
-- COALESCE preserva dados já preenchidos pelo fornecedor via portal.
INSERT INTO fornecedores (cnpj, razao_social, email, telefone, segmentos_interesse, contato_comercial_email, contato_comercial_tel, cadastro_completo)
VALUES
  ('92534593000860', 'BIGFER-INDUSTRIA E COMERCIO DE FERRAGENS LTDA',    'tspack00@gmail.com',                   '47 9915-0197',  ARRAY['FILME STRETCH'],                               'tspack00@gmail.com',                   '47 9915-0197',  FALSE),
  ('15380802000303', 'FUTURA INDUSTRIA DE ARTEFATOS PLASTICOS LTDA',     'gentilmatias@hotmail.com',             '47 98895-8908', ARRAY['FILME STRETCH'],                               'gentilmatias@hotmail.com',             '47 98895-8908', FALSE),
  ('22329753000188', 'FLEXOARTE ETIQUETAS E ROTULOS LTDA - ME',          'vendas@flexoarte.com.br',              '47 2125-1362',  ARRAY['ETIQUETA'],                                    'vendas@flexoarte.com.br',              '47 2125-1362',  FALSE),
  ('34604407000140', 'TAPE PRINT EMBALAGENS E FITAS ADESIVAS LTDA',      'comercial@tapeprint.com.br',           '47 3376-5583',  ARRAY['FILME STRETCH'],                               'comercial@tapeprint.com.br',           '47 3376-5583',  FALSE),
  ('10516563000190', 'INFONAVE INFORMATICA E ALARMES',                   NULL,                                   '47 92000-8012', ARRAY['MATERIAL ELETRONICO'],                          NULL,                                   '47 92000-8012', FALSE),
  ('11682367000159', 'EGON MATERIAIS DE CONSTRUCAO LTDA',                'egonmateusalves@gmail.com',            '47 98469-7612', ARRAY['MATERIAL DE CONSTRUCAO'],                      'egonmateusalves@gmail.com',            '47 98469-7612', FALSE),
  ('47810773000105', 'DISTRIBUIDORA SCHMITT BRASIL LTDA',                'pedro.distribuidoraschmitt@gmail.com', '47 8876-5635',  ARRAY['MATERIAL DE ESCRITORIO','MATERIAL DE LIMPEZA'],'pedro.distribuidoraschmitt@gmail.com', '47 8876-5635',  FALSE),
  ('37064364000145', 'BF LIMPEZA LTDA',                                  'rcpapeis@rcpapeis.com.br',             '47 99190-4207', ARRAY['MATERIAL DE ESCRITORIO','MATERIAL DE LIMPEZA'],'rcpapeis@rcpapeis.com.br',             '47 99190-4207', FALSE),
  ('30714185000167', 'CSO SUPRIMENTOS CORPORATIVOS EIRELI',              'vendas03@csosuprimentos.com.br',       '47 9678-0654',  ARRAY['MATERIAL DE ESCRITORIO','MATERIAL DE LIMPEZA'],'vendas03@csosuprimentos.com.br',       '47 9678-0654',  FALSE)
ON CONFLICT (cnpj) DO UPDATE SET
  razao_social            = EXCLUDED.razao_social,
  email                   = COALESCE(fornecedores.email,                   EXCLUDED.email),
  telefone                = COALESCE(fornecedores.telefone,                EXCLUDED.telefone),
  segmentos_interesse     = CASE
    WHEN fornecedores.segmentos_interesse IS NULL OR array_length(fornecedores.segmentos_interesse, 1) IS NULL
    THEN EXCLUDED.segmentos_interesse
    ELSE fornecedores.segmentos_interesse
  END,
  contato_comercial_email = COALESCE(fornecedores.contato_comercial_email, EXCLUDED.contato_comercial_email),
  contato_comercial_tel   = COALESCE(fornecedores.contato_comercial_tel,   EXCLUDED.contato_comercial_tel);

-- Resultado: 9 fornecedores + fornecedores que já se cadastraram pelo portal
SELECT cnpj, razao_social, email, cadastro_completo FROM fornecedores ORDER BY razao_social;
