# Margotti AI - TODO

## Fase 1: Estrutura e Configuração
- [ ] Configurar variáveis de ambiente (Supabase, Claude API, JWT)
- [ ] Criar arquivo .env.example com todas as variáveis necessárias

## Fase 2: Backend - Proxy API Flexível
- [x] Implementar rota `/api/trpc/generate-report` para proxy seguro de múltiplos provedores
- [x] Suporte a Claude (Anthropic), GPT (OpenAI) e DeepSeek
- [x] Criar sistema de prompts especializados para diagnóstico por imagem
- [x] Implementar validação de entrada (ignorar conversas informais)
- [x] Adicionar autenticação segura para requisições aos provedores
- [ ] Testes unitários do proxy API

## Fase 3: Frontend - Interface Médica Premium
- [x] Redesenhar layout com botão "Gerar Laudo" fixo no topo
- [x] Implementar aba "Digitar" (entrada de texto livre)
- [x] Implementar aba "Gravar" (transcrição de voz ao vivo com Web Speech API)
- [x] Implementar aba "Anexar" (upload de fotos JPG/PNG ou PDF)
- [x] Criar painel lateral de "Banco de Laudos" com filtros
- [x] Implementar visualização e exclusão de laudos históricos
- [x] Adicionar indicador visual de status da API (conectado/desconectado)
- [x] Implementar modal de configuração de API Key (Claude, GPT, DeepSeek) na parte inferior
- [x] Armazenar chaves de forma segura no localStorage
- [x] Adicionar badge visual mostrando qual API está ativa

## Fase 4: Integração Supabase
- [ ] Criar tabela `laudos` no Supabase (id, created_at, exam_type, classification, observation, report_text, doctor_name, doctor_crm)
- [ ] Implementar função de salvamento de laudos (Normal/Patológico)
- [ ] Implementar função de carregamento de laudos históricos
- [ ] Implementar função de exclusão de laudos
- [ ] Sincronizar templates padrão do Dr. Roberto com banco de dados

## Fase 5: Exportação PDF
- [ ] Implementar geração de PDF com cabeçalho médico profissional
- [ ] Adicionar dados do Dr. Roberto Margotti (CRM-BA 26929 | RQE: 21367)
- [ ] Implementar botão de download de PDF formatado
- [ ] Testes de exportação PDF

## Fase 6: Testes e Validação
- [ ] Testar modo "Digitar" com dados clínicos
- [ ] Testar modo "Gravar" com transcrição de voz
- [ ] Testar modo "Anexar" com imagens
- [ ] Validar substituição de medidas nos templates
- [ ] Testar persistência no Supabase
- [ ] Validar exportação PDF

## Fase 7: Deploy Vercel
- [ ] Conectar repositório GitHub ao Vercel
- [ ] Configurar variáveis de ambiente no Vercel
- [ ] Realizar deploy automático
- [ ] Validar funcionamento em produção
- [ ] Documentar processo de deployment

## Templates Médicos (Pré-configurados)
- [x] Obstétrico (com medidas biométricas)
- [x] Abdome Total
- [x] Endovaginal
- [x] Tireoide
- [x] Urinário (Rins e Vias Urinárias)
- [x] Mamas (com BI-RADS e TIRADS)

## Assinatura Médica
- [x] Dr. Roberto Freire Margotti
- [x] CRM-BA 26929
- [x] RQE: 21367
