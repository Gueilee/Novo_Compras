-- ═══════════════════════════════════════════════════════════════
-- SHP — IMPORT: Fornecedores da Planilha Excel
-- Importa 9 fornecedores da base operacional para o banco,
-- preservando registros existentes (ON CONFLICT DO NOTHING para
-- dados que o fornecedor já preencheu no portal).
-- Colunas novas opcionais adicionadas com IF NOT EXISTS.
-- ═══════════════════════════════════════════════════════════════

-- Garante colunas necessárias caso ainda não existam
ALTER TABLE fornecedores ADD COLUMN IF NOT EXISTS contato_comercial_email TEXT;
ALTER TABLE fornecedores ADD COLUMN IF NOT EXISTS contato_comercial_tel   TEXT;
ALTER TABLE fornecedores ADD COLUMN IF NOT EXISTS contato_financeiro_email TEXT;
ALTER TABLE fornecedores ADD COLUMN IF NOT EXISTS contato_financeiro_tel  TEXT;
ALTER TABLE fornecedores ADD COLUMN IF NOT EXISTS contato_fiscal_email    TEXT;
ALTER TABLE fornecedores ADD COLUMN IF NOT EXISTS contato_fiscal_tel      TEXT;
ALTER TABLE fornecedores ADD COLUMN IF NOT EXISTS endereco_cep            TEXT;
ALTER TABLE fornecedores ADD COLUMN IF NOT EXISTS endereco_logradouro     TEXT;
ALTER TABLE fornecedores ADD COLUMN IF NOT EXISTS endereco_numero         TEXT;
ALTER TABLE fornecedores ADD COLUMN IF NOT EXISTS endereco_complemento    TEXT;
ALTER TABLE fornecedores ADD COLUMN IF NOT EXISTS endereco_bairro         TEXT;
ALTER TABLE fornecedores ADD COLUMN IF NOT EXISTS endereco_cidade         TEXT;
ALTER TABLE fornecedores ADD COLUMN IF NOT EXISTS endereco_uf             TEXT;
ALTER TABLE fornecedores ADD COLUMN IF NOT EXISTS segmentos_interesse     TEXT[];
ALTER TABLE fornecedores ADD COLUMN IF NOT EXISTS doc_cartao_cnpj         TEXT;
ALTER TABLE fornecedores ADD COLUMN IF NOT EXISTS doc_alvara_funcionamento TEXT;
ALTER TABLE fornecedores ADD COLUMN IF NOT EXISTS doc_alvara_sanitario    TEXT;
ALTER TABLE fornecedores ADD COLUMN IF NOT EXISTS doc_iso_9001            TEXT;
ALTER TABLE fornecedores ADD COLUMN IF NOT EXISTS doc_ultima_alteracao    TEXT;
ALTER TABLE fornecedores ADD COLUMN IF NOT EXISTS cadastro_completo       BOOLEAN DEFAULT FALSE;
ALTER TABLE fornecedores ADD COLUMN IF NOT EXISTS cadastrado_em           TIMESTAMPTZ;

-- ── Upsert dos fornecedores ──────────────────────────────────────
-- Estratégia: INSERT ... ON CONFLICT (cnpj) DO UPDATE
-- Para fornecedores que já passaram pelo portal (cadastro_completo=true),
-- NÃO sobrescreve os campos de cadastro completo — só atualiza os campos básicos.

INSERT INTO fornecedores (cnpj, razao_social, email, telefone, segmento, segmentos_interesse, contato_comercial_email, contato_comercial_tel, cadastro_completo)
VALUES
  ('92534593000860', 'BIGFER-INDUSTRIA E COMERCIO DE FERRAGENS LTDA',    'tspack00@gmail.com',                     '47 9915-0197',   'FILME STRETCH',        ARRAY['FILME STRETCH'],                     'tspack00@gmail.com',                     '47 9915-0197',   FALSE),
  ('15380802000303', 'FUTURA INDUSTRIA DE ARTEFATOS PLASTICOS LTDA',      'gentilmatias@hotmail.com',               '47 98895-8908',  'FILME STRETCH',        ARRAY['FILME STRETCH'],                     'gentilmatias@hotmail.com',               '47 98895-8908',  FALSE),
  ('22329753000188', 'FLEXOARTE ETIQUETAS E ROTULOS LTDA - ME',           'vendas@flexoarte.com.br',                '47 2125-1362',   'ETIQUETA',             ARRAY['ETIQUETA'],                          'vendas@flexoarte.com.br',                '47 2125-1362',   FALSE),
  ('34604407000140', 'TAPE PRINT EMBALAGENS E FITAS ADESIVAS LTDA',       'comercial@tapeprint.com.br',             '47 3376-5583',   'FILME STRETCH',        ARRAY['FILME STRETCH'],                     'comercial@tapeprint.com.br',             '47 3376-5583',   FALSE),
  ('10516563000190', 'INFONAVE INFORMATICA E ALARMES',                    NULL,                                     '47 92000-8012',  'MATERIAL ELETRONICO',  ARRAY['MATERIAL ELETRONICO'],               NULL,                                     '47 92000-8012',  FALSE),
  ('11682367000159', 'EGON MATERIAIS DE CONSTRUCAO LTDA',                 'egonmateusalves@gmail.com',              '47 98469-7612',  'MATERIAL DE CONSTRUCAO', ARRAY['MATERIAL DE CONSTRUCAO'],          'egonmateusalves@gmail.com',              '47 98469-7612',  FALSE),
  ('47810773000105', 'DISTRIBUIDORA SCHMITT BRASIL LTDA',                 'pedro.distribuidoraschmitt@gmail.com',   '47 8876-5635',   'MATERIAL DE ESCRITORIO', ARRAY['MATERIAL DE ESCRITORIO','MATERIAL DE LIMPEZA'], 'pedro.distribuidoraschmitt@gmail.com', '47 8876-5635', FALSE),
  ('37064364000145', 'BF LIMPEZA LTDA',                                   'rcpapeis@rcpapeis.com.br',               '47 99190-4207',  'MATERIAL DE LIMPEZA',  ARRAY['MATERIAL DE ESCRITORIO','MATERIAL DE LIMPEZA'], 'rcpapeis@rcpapeis.com.br',            '47 99190-4207', FALSE),
  ('30714185000167', 'CSO SUPRIMENTOS CORPORATIVOS EIRELI',               'vendas03@csosuprimentos.com.br',         '47 9678-0654',   'MATERIAL DE ESCRITORIO', ARRAY['MATERIAL DE ESCRITORIO','MATERIAL DE LIMPEZA'], 'vendas03@csosuprimentos.com.br',      '47 9678-0654', FALSE)
ON CONFLICT (cnpj) DO UPDATE SET
  -- Atualiza apenas os campos básicos da planilha (não sobrescreve dados do portal)
  razao_social          = EXCLUDED.razao_social,
  email                 = COALESCE(fornecedores.email, EXCLUDED.email),
  telefone              = COALESCE(fornecedores.telefone, EXCLUDED.telefone),
  segmento              = COALESCE(fornecedores.segmento, EXCLUDED.segmento),
  segmentos_interesse   = CASE
    WHEN fornecedores.segmentos_interesse IS NULL OR array_length(fornecedores.segmentos_interesse, 1) IS NULL
    THEN EXCLUDED.segmentos_interesse
    ELSE fornecedores.segmentos_interesse
  END,
  contato_comercial_email = COALESCE(fornecedores.contato_comercial_email, EXCLUDED.contato_comercial_email),
  contato_comercial_tel   = COALESCE(fornecedores.contato_comercial_tel,   EXCLUDED.contato_comercial_tel);

-- Resultado esperado: 9 fornecedores inseridos ou atualizados
SELECT cnpj, razao_social, segmento, email, cadastro_completo FROM fornecedores ORDER BY razao_social;
