# 🏎️🌴 PIXEL RUSH: MATHEMATICS OVERDRIVE (Vice Edition)

![HTML5](https://img.shields.io/badge/HTML5-Canvas_2D-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-Arcade_CRT-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-Vanilla_ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Web Audio API](https://img.shields.io/badge/Web_Audio_API-Synthwave_Procedural-ff007f?style=for-the-badge)
![FATEC](https://img.shields.io/badge/FATEC-5º_Semestre_ADS-00f5d4?style=for-the-badge)

> **Jogo de corrida arcade Pseudo-3D em Pixel Art** com estética inspirada em clássicos como *OutRun*, *Top Gear*, *Slipstream* e temática **GTA VI / Vice City Vaporwave**, desenvolvido para **Feiras de Matemática**.

O projeto transforma o raciocínio matemático em parte natural da adrenalina de um jogo de corrida: enquanto pilota um superconversível pelas avenidas neon de Vice City, o jogador atravessa pórticos eletrônicos nas 3 faixas da rodovia para ativar o **Nitro Overdrive**, gerenciar o combustível do tanque e multiplicar sua pontuação.

---

## 👨‍💻 Autoria e Equipe Acadêmica

- **Desenvolvido por:** Artur Guimarães
- **Colaboração:** Wender Corsi, João P. Cavalli, Heitor Rubi e Pedro Carvalho
- **Instituição:** **FATEC | 5º Semestre – Análise e Desenvolvimento de Sistemas (ADS)**
- **Evento:** **IX Congresso de Inovação e Tecnologia & XI Workshop de Iniciação Científica e Tecnológica**

---

## ✨ Destaques Técnicos

- **Motor Pseudo-3D em HTML5 Canvas (`640x360` Pixel Art):** Projeção em perspectiva com ponto de fuga profundo, curvas dinâmicas, paralaxe de horizonte e cenário lateral temático de *Vice City* (Ocean Drive Art Deco, palmeiras tropicais, outdoors e reflexos neon nas águas de Vice Bay).
- **100% Procedural (Zero Assets Externos):** Todos os sprites (carros, caminhões, palmeiras, hotéis neon, obstáculos, moedas e fonte bitmap `5x7` com acentuação completa em português e símbolos matemáticos) são gerados via código em Canvas.
- **Sintetizador Web Audio API Integrado:** Trilha sonora *Synthwave* e efeitos sonoros (ronco dinâmico do motor, derrapagem, nitro, colisão e portais) sintetizados em tempo real sem arquivos MP3/WAV externos.
- **Pausa Tática Inteligente nos Portais (`Pausa para Pensar`):** Ao se aproximar dos 3 portais (`ESQ | CEN | DIR`), o jogo realiza uma pausa tática para que qualquer visitante da feira possa calcular com calma, escolher a faixa certa e disparar com o carro.
- **Gestão Automática de Sessão para Feiras e Eventos:**
  - Partidas rápidas de **3 minutos**.
  - Retorno automático ao menu inicial caso o jogador fique ausente (**AFK**) na pergunta ou na corrida.
  - Ranking local **Top 10** salvo via `LocalStorage`.
  - Funcionamento **100% Offline** (sem necessidade de backend ou internet).

---

## 🎮 Controles

| Tecla / Ação | Função |
| :--- | :--- |
| **`A` / `D`** ou **`←` / `→`** | Mudar entre as 3 faixas da rodovia / Selecionar portal |
| **`W` / `↑` / `ESPAÇO` / `ENTER`** | Acelerar / Confirmar portal durante a *Pausa para Pensar* |
| **`1` / `2` / `3`** ou **Clique do Mouse** | Escolher diretamente o portal **Esquerda (`1`)**, **Centro (`2`)** ou **Direita (`3`)** |
| **`S`** ou **`↓`** | Frear no tráfego |
| **`ESPAÇO`** | Ativar **Nitro Overdrive** (quando a barra de Nitro ≥ 20%) |
| **`ESC`** ou **`P`** | Pausar a partida / Menu de áudio |
| **`M`** | Ativar / Silenciar o som |
| **`F`** | Alternar modo Tela Cheia |

---

## 🧮 As 5 Mecânicas Matemáticas Integradas

1. **Portais Matemáticos (`PORTAL`):** Tabuada, somas, subtrações, divisões, raízes quadradas exatas e potências nos pórticos da rodovia.
2. **Nitro Matemático (`NITRO`):** Operações rápidas que sobrecarregam a turbina com **+65% de Nitro** e ativam impulso imediato.
3. **Gestão de Combustível (`FUEL`):** Cálculos de porcentagem contextualizados com o nível real do tanque para recuperar combustível extra.
4. **Cinemática na Pista (`KINEMATICS`):** Desafios práticos relacionando velocidade (`km/h`), distância (`km`) e tempo de viagem.
5. **Desafios Surpresa (`SURPRISE`):** Sequências lógicas, dobros/metades e porcentagens rápidas.

---

## 🚀 Como Executar Localmente

Não é necessário instalar dependências nem rodar servidor:

1. Clone este repositório:
   ```bash
   git clone https://github.com/SEU-USUARIO/pixel-rush.git
   ```
2. Abra o arquivo **`index.html`** (ou **`pixel-rush/index.html`**) diretamente em qualquer navegador moderno.

---

## 📂 Arquitetura do Projeto

```text
├── index.html                  # Entrada principal na raiz (pronto para GitHub Pages / Vercel)
└── pixel-rush/
    ├── index.html              # Versão standalone
    ├── css/
    │   └── style.css           # Gabinete Arcade, efeito CRT scanlines e responsividade
    └── js/
        ├── main.js             # Inicialização e game loop em 60 FPS
        ├── core/
        │   ├── config.js       # Configurações de física, faixas e tempos de sessão
        │   ├── utils.js        # Funções matemáticas, PRNG e helpers de Canvas
        │   ├── storage.js      # Persistência em LocalStorage (Top 10 e áudio)
        │   ├── input.js        # Teclado, mouse e controles rápidos
        │   ├── session.js      # Controle automático de inatividade (AFK) para feiras
        │   └── game.js         # Máquina de estados, colisões, pontuação e ranks
        ├── gfx/
        │   ├── font.js         # Fonte bitmap 5x7 em pixel art com acentos e símbolos
        │   ├── sprites.js      # Gerador procedural de carros, palmeiras, hotéis e itens
        │   └── particles.js    # Partículas, chamas de nitro, faíscas e câmera shake
        ├── audio/
        │   └── audio.js        # Sintetizador Web Audio API (música synthwave e SFX)
        ├── math/
        │   └── math-engine.js  # Gerador procedural das 5 mecânicas matemáticas
        ├── world/
        │   └── background.js   # Motor Pseudo-3D da rodovia e cenário GTA VI / Vice City
        ├── entities/
        │   ├── player.js       # Física, câmbio/RPM e renderização do conversível
        │   └── traffic.js      # Tráfego inteligente, obstáculos, coletáveis e pórticos 3D
        └── ui/
            └── ui.js           # Menu, Como Jogar, Recordes, HUD analógico e Resultados
```
