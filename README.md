# SorteiON

> **Sorteios simples, rápidos e transparentes.**

O **SorteiON** é um sorteador gratuito que funciona diretamente no navegador. A proposta inicial é realizar sorteios de nomes ou números sem cadastro, sem backend e sem depender de uma API para gerar o resultado.

## 🌐 Projeto

**GitHub:**  
https://github.com/RaikanKleberson/SorteiON

**GitHub Pages:**  
Adicione aqui o endereço quando publicar.

## ✨ Funcionalidades

- Sorteio de nomes
- Sorteio de números
- Vários vencedores em um único sorteio
- Sem repetição de vencedores no mesmo sorteio
- Importação de TXT e CSV
- Remoção de nomes duplicados
- Histórico local dos últimos sorteios
- Copiar resultado
- Modo apresentação/tela cheia
- Interface responsiva
- Sem cadastro
- Sem backend
- Geração aleatória local no navegador

## 🧠 Como funciona

O projeto foi pensado para GitHub Pages e não precisa de servidor para realizar o sorteio.

```text
Usuário
   ↓
SorteiON
   ↓
JavaScript no navegador
   ↓
Crypto API do navegador
   ↓
Resultado
```

Para selecionar os vencedores, o projeto usa `crypto.getRandomValues()` e seleção com rejeição para evitar o viés de módulo na escolha de índices.

## 🔒 Privacidade

Na versão atual, os participantes e configurações usados no sorteio ficam no navegador do usuário.

O histórico dos resultados é armazenado apenas no `localStorage` do navegador.

O projeto não precisa enviar a lista de participantes para um backend próprio.

## 💻 Executar localmente

Não existe etapa de build.

Basta abrir:

```text
index.html
```

Ou usar um servidor local:

```bash
npx serve .
```

## ☁️ GitHub Pages

O projeto é compatível com GitHub Pages.

Estrutura:

```text
SorteiON/
├── index.html
├── style.css
├── app.js
├── README.md
└── .gitignore
```

## 📌 Roadmap

### V1
- [x] Nomes
- [x] Números
- [x] Múltiplos vencedores
- [x] Importação TXT/CSV
- [x] Histórico local
- [x] Modo apresentação
- [x] GitHub Pages

### V2
- [ ] Animação visual mais avançada
- [ ] Efeitos sonoros opcionais
- [ ] Exportação do resultado
- [ ] Logo e identidade visual personalizável
- [ ] Modelos de sorteio
- [ ] Compartilhamento de resultado

### V3
- [ ] Sessões compartilháveis
- [ ] Página pública do sorteio
- [ ] Relatório/certificado do resultado
- [ ] Conta de usuário
- [ ] Dashboard
- [ ] Recursos para empresas

## ⚠️ Uso em promoções comerciais

O SorteiON é uma ferramenta técnica de seleção aleatória e não pretende substituir requisitos legais ou regulatórios aplicáveis a promoções comerciais.

Para promoções, campanhas ou concursos, verifique previamente as regras e autorizações que possam ser exigidas no seu país e jurisdição.

## 🤝 Contribuição

Contribuições são bem-vindas.

```bash
git clone https://github.com/RaikanKleberson/SorteiON.git
cd SorteiON
git checkout -b minha-feature
```

Depois:

```bash
git add .
git commit -m "feat: nova funcionalidade"
git push origin minha-feature
```

Abra um Pull Request no GitHub.

## 📄 Licença

Defina a licença do projeto antes de abrir contribuições externas ou redistribuir versões oficiais.

---

## 🇧🇷 Feito no Brasil

**SorteiON**

Sorteios simples, rápidos e transparentes.
