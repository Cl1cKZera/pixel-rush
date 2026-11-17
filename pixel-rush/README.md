# 🏎️🌴 PIXEL RUSH: MATHEMATICS OVERDRIVE (Vice City Edition)

![HTML5](https://img.shields.io/badge/HTML5-Canvas_2D-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-Arcade_CRT-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-Vanilla_ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Web Audio API](https://img.shields.io/badge/Web_Audio_API-Synthwave_Procedural-ff007f?style=for-the-badge)
![FATEC](https://img.shields.io/badge/FATEC-5º_Semestre_ADS-00f5d4?style=for-the-badge)

> **Jogo de corrida arcade Pseudo-3D em Pixel Art** com estética inspirada em clássicos como *OutRun*, *Top Gear*, *Slipstream* e temática **GTA VI / Vice City Vaporwave**, apresentado no **IX Congresso de Inovação e Tecnologia & XI Workshop de Iniciação Científica e Tecnológica (FATEC)**.

O projeto transforma o raciocínio matemático em parte natural da adrenalina de um jogo de corrida: enquanto pilota um superconversível pelas avenidas neon de Vice City, o jogador atravessa pórticos eletrônicos nas 3 faixas da rodovia para ativar o **Nitro Overdrive**, gerenciar o combustível do tanque e multiplicar sua pontuação.

---

## 👨‍💻 Autoria e Equipe Acadêmica

- **Desenvolvido por:** Artur Guimarães
- **Colaboração:** Wender Corsi, João P. Cavalli, Heitor Rubi e Pedro Carvalho
- **Instituição:** **FATEC | 5º Semestre – Análise e Desenvolvimento de Sistemas (ADS)**
- **Evento:** **IX Congresso de Inovação e Tecnologia & XI Workshop de Iniciação Científica e Tecnológica**

---

## ✨ Destaques do Projeto

- **Motor Pseudo-3D em HTML5 Canvas (`640x360` Pixel Art):** Projeção em perspectiva com ponto de fuga profundo, curvas dinâmicas, paralaxe de horizonte e cenário lateral temático de *Vice City* (Ocean Drive Art Deco, palmeiras tropicais, outdoors e reflexos neon nas águas de Vice Bay).
- **Sprites e Fonte em Pixel Art:** Carros, caminhões, palmeiras, hotéis neon, obstáculos, moedas e fonte bitmap `5x7` com acentuação completa em português e símbolos matemáticos.
- **Áudio Synthwave com Web Audio API:** Trilha sonora *Synthwave* e efeitos sonoros (ronco dinâmico do motor, derrapagem, nitro, colisão e portais) gerados em tempo real no navegador.
- **Pausa Tática nos Portais (`Pausa para Pensar`):** Ao se aproximar dos 3 portais (`ESQ | CEN | DIR`), o jogo realiza uma pausa tática para que qualquer visitante da feira possa calcular com calma, escolher a faixa certa e disparar com o carro.
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

## 🚀 Como Executar Localmente

1. Clone este repositório:
   ```bash
   git clone https://github.com/Cl1cKZera/drive-game.git
   ```
2. Abra o arquivo **`index.html`** diretamente em qualquer navegador moderno.
