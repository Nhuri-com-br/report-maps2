# 🏛️ Report Maps &bull; Sistema Integrado de Zeladoria Urbana e GovTech

Plataforma inteligente para gestão de problemas públicos, triagem de ordens de serviço municipais por secretaria e participação cidadã com geolocalização e Inteligência Artificial.

> **Trabalho de Conclusão de Curso (TCC)** &bull; Análise e Desenvolvimento de Sistemas  
> Alinhado com a **Agenda 2030 da ONU** (ODS 11: Cidades Sustentáveis | ODS 16: Instituições Eficazes).

---

## 🚀 Como Fazer Deploy na Vercel

O projeto já está configurado com `vercel.json` e otimizado para Vite (SPA).

### Opção 1: Pelo Painel Web da Vercel (Recomendado)

1. Suba o projeto para um repositório no seu **GitHub** (`git push`).
2. Acesse [vercel.com](https://vercel.com) e clique em **Add New... > Project**.
3. Importe o seu repositório do **Report Maps**.
4. Configure os seguintes parâmetros (já vêm pré-configurados pelo `vercel.json`):
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. *(Opcional)* Em **Environment Variables**, adicione sua chave do Gemini se desejar:
   - `GEMINI_API_KEY`: sua chave da Google AI Studio
6. Clique em **Deploy**! 🚀

---

### Opção 2: Pela Linha de Comando (Vercel CLI)

1. Instale a Vercel CLI caso ainda não tenha:
   ```bash
   npm i -g vercel
   ```
2. Na pasta do projeto, execute:
   ```bash
   vercel
   ```
3. Para publicar diretamente em produção:
   ```bash
   vercel --prod
   ```

---

## 🛠️ Tecnologias Utilizadas

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Motion (Framer Motion) e Lucide Icons.
- **GIS & Mapas**: Leaflet, React-Leaflet, OpenStreetMap e Nominatim API (Geocodificação Reversa em tempo real).
- **Inteligência Artificial**: Google Gemini 2.5 Flash (`@google/genai`) para estruturação semântica de relatos e geração de minutas de despacho oficial.
- **Backend & Realtime**: Google Firebase Firestore e Firebase Auth.

---

## 💻 Executar Localmente

```bash
# 1. Instalar dependências
npm install

# 2. Iniciar servidor de desenvolvimento
npm run dev

# 3. Testar build de produção
npm run build
```

