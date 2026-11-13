# PIXEL RUSH: MATHEMATICS OVERDRIVE 🏎️⚡

Jogo arcade 2D top-down em **Pixel Art** com estética **Cyber-Neon / Synthwave dos anos 90**, desenvolvido especialmente para **Feiras de Matemática**.

O jogo funciona **100% offline**, diretamente no navegador, utilizando **HTML5 Canvas**, **Web Audio API** (música eletrônica e efeitos sonoros gerados proceduralmente) e **LocalStorage** (recordes e configurações).

---

## 🚀 Como Abrir o Jogo no Navegador

Não é necessário instalar nada, nem utilizar servidor ou internet:

1. Abra a pasta do projeto no Windows Explorer.
2. Dê um **duplo clique** no arquivo **`pixel-rush/index.html`** (ou no atalho **`index.html`** na raiz).
3. O jogo abrirá imediatamente em qualquer navegador moderno (Google Chrome, Microsoft Edge, Mozilla Firefox).
4. **Dica para a Feira:** Pressione a tecla **`F`** (ou `F11` do navegador) para colocar o jogo em **Tela Cheia**.

---

## 🎮 Controles

| Tecla / Ação | Função |
| :--- | :--- |
| **`A` / `D`** ou **`←` / `→`** | Movimentar o carro entre as faixas (e escolher o portal na Pausa Matemática) |
| **`W` / `↑` / `ESPAÇO` / `ENTER`** | Acelerar / Confirmar o portal escolhido durante a **Pausa para Pensar** |
| **`1` / `2` / `3`** ou **Clique do Mouse** | Escolher diretamente o portal da **Esquerda (`1`)**, **Centro (`2`)** ou **Direita (`3`)** |
| **`S`** ou **`↓`** | Frear / desacelerar no tráfego |
| **`ESPAÇO`** | Ativar **Super Nitro Overdrive** durante a corrida (quando Nitro ≥ 20%) |
| **`ESC`** ou **`P`** | Pausar / Retomar a partida e ajustar volumes de áudio |
| **`M`** | Silenciar / Ativar o som instantaneamente |
| **`ENTER` / `ESPAÇO` / Mouse** | Selecionar opções nos menus |
| **`F`** | Alternar modo de Tela Cheia |

---

## 🧮 Mecânicas Matemáticas Integradas ao Gameplay

A matemática faz parte natural da pilotagem — sem interromper a adrenalina da corrida:

1. **Mecânica A — Portais Matemáticos (`ESQ | CEN | DIR`)**:
   - Operações de adição, subtração, multiplicação, divisão, porcentagem, potências (`2³`, `4²`, `12²`), raízes quadradas (`√64`, `√144`) e equações do 1º grau (`2X + 4 = 18`).
   - Atravesse o portal com o resultado correto para ganhar bônus de pontos, moedas, nitro e aumentar o **Multiplicador de Combo** (até `X6`).
2. **Mecânica B — Nitro Matemático**:
   - Portais especiais de sobrecarga que carregam até **+65% de Nitro** e acionam um jato imediato de velocidade ao acertar o cálculo.
3. **Mecânica C — Gestão de Combustível com Porcentagem (`%`)**:
   - Desafios contextualizados que leem o nível real do tanque do jogador (ex.: *"Seu tanque está com 40%. O galão recupera +25%: 40% + 25% = ?"*) e premiam com reabastecimento extra.
4. **Mecânica D — Física da Corrida (Distância, Velocidade e Tempo)**:
   - Cálculos reais envolvendo velocidade média (`km/h`), distância percorrida (`km`) e tempo (`h` e `min`).
5. **Mecânica E — Desafios Surpresa**:
   - Sequências numéricas (progressões aritméticas, geométricas, quadrados perfeitos, Fibonacci), conversões de unidades (`km` para `m`) e raciocínio rápido.

---

## 🎪 Sistema Automático de Sessão para a Feira de Matemática

- **Partidas de 3 minutos** (`180s`) com contagem regressiva inicial de 3 segundos e dificuldade progressiva (`Fácil` → `Médio` → `Difícil`).
- **Retorno Automático pós-corrida:** A tela de resultados permanece visível por no máximo **20 segundos** e retorna sozinha ao Menu Principal para o próximo visitante.
- **Detector de Inatividade:** Se o computador ficar **60 segundos** sem interação, exibe o aviso *"Sessão encerrada por inatividade. Preparando o próximo jogador..."* com contagem de **10 segundos**. Qualquer tecla ou movimento do mouse cancela o encerramento; caso contrário, a sessão é reiniciada limpando todos os dados da partida (preservando os recordes e configurações).
- **Offline-First:** Detecta quedas de rede discretamente e continua funcionando sem qualquer dependência externa.

---

## 📁 Estrutura de Arquivos Principais

```text
pixel-rush/
  index.html               # Página principal do jogo
  README.md                # Documentação e instruções
  DEVELOPMENT_STATUS.md    # Registro de etapas e verificação
  css/
    style.css              # Estilo visual do gabinete arcade, CRT scanlines e responsividade
  js/
    main.js                # Inicialização, redimensionamento responsivo e loop 60fps
    core/
      config.js            # Parâmetros globais da pista, física e timers de sessão
      utils.js             # Funções matemáticas, PRNG, interpolação e formatação
      storage.js           # Persistência em LocalStorage (Top 10 recordes e configurações)
      input.js             # Controles de teclado, mouse e toque
      session.js           # Gestão automática de sessão da feira (inatividade e offline)
      game.js              # Máquina de estados, colisões, pontuação e ranks
    gfx/
      font.js              # Fonte bitmap 5x7 em pixel art com acentos e símbolos matemáticos
      sprites.js           # Gerador procedural de sprites em pixel art (carros, caminhões, itens, cenário)
      particles.js         # Partículas, chamas de nitro, faíscas, derrapagem e câmera shake
    audio/
      audio.js             # Sintetizador Web Audio API (motor dinâmico, SFX e música synthwave)
    math/
      math-engine.js       # Gerador procedural das 5 mecânicas matemáticas
    world/
      background.js        # Cidade noturna neon em paralaxe e rodovia de 5 faixas
    entities/
      player.js            # Física e renderização do carro principal
      traffic.js           # Geração procedural justa de tráfego, obstáculos, itens e portais
    ui/
      ui.js                # Menu principal, Como Jogar, Recordes, HUD, Pausa e Resultados
```

