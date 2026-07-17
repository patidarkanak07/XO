import { useState, useEffect, useCallback } from "react";

const WINNING_COMBOS = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];

function checkWinner(board) {
  for (let combo of WINNING_COMBOS) {
    const [a,b,c] = combo;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], combo };
    }
  }
  if (board.every(Boolean)) return { winner: "draw", combo: [] };
  return null;
}

// Minimax with alpha-beta pruning
function minimax(board, depth, isMaximizing, alpha, beta, aiSymbol, humanSymbol) {
  const result = checkWinner(board);
  if (result) {
    if (result.winner === aiSymbol) return 10 - depth;
    if (result.winner === humanSymbol) return depth - 10;
    return 0;
  }
  if (isMaximizing) {
    let best = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (!board[i]) {
        board[i] = aiSymbol;
        best = Math.max(best, minimax(board, depth+1, false, alpha, beta, aiSymbol, humanSymbol));
        board[i] = null;
        alpha = Math.max(alpha, best);
        if (beta <= alpha) break;
      }
    }
    return best;
  } else {
    let best = Infinity;
    for (let i = 0; i < 9; i++) {
      if (!board[i]) {
        board[i] = humanSymbol;
        best = Math.min(best, minimax(board, depth+1, true, alpha, beta, aiSymbol, humanSymbol));
        board[i] = null;
        beta = Math.min(beta, best);
        if (beta <= alpha) break;
      }
    }
    return best;
  }
}

function getBestMove(board, aiSymbol, humanSymbol, difficulty) {
  const empty = board.map((v,i) => v ? null : i).filter(i => i !== null);
  if (difficulty === "easy") return empty[Math.floor(Math.random() * empty.length)];

  if (difficulty === "medium") {
    // win
    for (let i of empty) {
      const b = [...board]; b[i] = aiSymbol;
      if (checkWinner(b)?.winner === aiSymbol) return i;
    }
    // block
    for (let i of empty) {
      const b = [...board]; b[i] = humanSymbol;
      if (checkWinner(b)?.winner === humanSymbol) return i;
    }
    // center
    if (!board[4]) return 4;
    return empty[Math.floor(Math.random() * empty.length)];
  }

  // hard — minimax
  let bestScore = -Infinity, bestMove = empty[0];
  for (let i of empty) {
    const b = [...board]; b[i] = aiSymbol;
    const score = minimax(b, 0, false, -Infinity, Infinity, aiSymbol, humanSymbol);
    if (score > bestScore) { bestScore = score; bestMove = i; }
  }
  return bestMove;
}

const DIFFICULTY_LABELS = { easy: "Easy 😊", medium: "Medium 🤔", hard: "Hard 🤖" };

const THEMES = {
  neon: {
    name: "Neon Aura 🌌",
    bg: "radial-gradient(ellipse at 20% 20%, #1a0533 0%, #060614 50%, #001233 100%)",
    colorX: "#00d4ff",
    colorO: "#ff006e",
    colorXBg: "rgba(0, 212, 255, 0.08)",
    colorOBg: "rgba(255, 0, 110, 0.08)",
    colorXBorder: "rgba(0, 212, 255, 0.25)",
    colorOBorder: "rgba(255, 0, 110, 0.25)",
    gradientTitle: "linear-gradient(135deg, #00d4ff 0%, #bf00ff 50%, #ff006e 100%)",
    shadowX: "rgba(0, 212, 255, 0.4)",
    shadowO: "rgba(255, 0, 110, 0.4)",
    starColor: "#ffffff",
  },
  cyberpunk: {
    name: "Cyberpunk ⚡",
    bg: "radial-gradient(ellipse at 20% 20%, #292203 0%, #080701 60%, #17001c 100%)",
    colorX: "#fcee0a",
    colorO: "#00f0ff",
    colorXBg: "rgba(252, 238, 10, 0.08)",
    colorOBg: "rgba(0, 240, 255, 0.08)",
    colorXBorder: "rgba(252, 238, 10, 0.25)",
    colorOBorder: "rgba(0, 240, 255, 0.25)",
    gradientTitle: "linear-gradient(135deg, #fcee0a 0%, #ff0055 100%)",
    shadowX: "rgba(252, 238, 10, 0.4)",
    shadowO: "rgba(0, 240, 255, 0.4)",
    starColor: "#fcee0a",
  },
  emerald: {
    name: "Emerald Matrix 🌲",
    bg: "radial-gradient(ellipse at 20% 20%, #022013 0%, #010604 60%, #051610 100%)",
    colorX: "#00ff9d",
    colorO: "#ffd700",
    colorXBg: "rgba(0, 255, 157, 0.08)",
    colorOBg: "rgba(255, 215, 0, 0.08)",
    colorXBorder: "rgba(0, 255, 157, 0.25)",
    colorOBorder: "rgba(255, 215, 0, 0.25)",
    gradientTitle: "linear-gradient(135deg, #00ff9d 0%, #00b3ff 100%)",
    shadowX: "rgba(0, 255, 157, 0.4)",
    shadowO: "rgba(255, 215, 0, 0.4)",
    starColor: "#00ff9d",
  },
  sunset: {
    name: "Sunset Mirage 🌅",
    bg: "radial-gradient(ellipse at 20% 20%, #260813 0%, #050104 60%, #1c0b02 100%)",
    colorX: "#ff7b00",
    colorO: "#ff007b",
    colorXBg: "rgba(255, 123, 0, 0.08)",
    colorOBg: "rgba(255, 0, 123, 0.08)",
    colorXBorder: "rgba(255, 123, 0, 0.25)",
    colorOBorder: "rgba(255, 0, 123, 0.25)",
    gradientTitle: "linear-gradient(135deg, #ff7b00 0%, #ff007b 100%)",
    shadowX: "rgba(255, 123, 0, 0.4)",
    shadowO: "rgba(255, 0, 123, 0.4)",
    starColor: "#ff7b00",
  }
};

const playSound = (type, enabled) => {
  if (!enabled) return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'click-x') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.1); // G5
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } else if (type === 'click-o') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(392.00, ctx.currentTime); // G4
      osc.frequency.exponentialRampToValueAtTime(587.33, ctx.currentTime + 0.1); // D5
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } else if (type === 'win') {
      const now = ctx.currentTime;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
      osc.frequency.setValueAtTime(783.99, now + 0.16); // G5
      osc.frequency.setValueAtTime(1046.50, now + 0.24); // C6
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.3);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc.start(now);
      osc.stop(now + 0.5);
    } else if (type === 'draw') {
      const now = ctx.currentTime;
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(293.66, now); // D4
      osc.frequency.linearRampToValueAtTime(196.00, now + 0.25); // G3
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);
    } else if (type === 'reset') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(196.00, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(523.25, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    }
  } catch (e) {
    console.warn("Audio Context error", e);
  }
};

export default function XOArena() {
  const [screen, setScreen] = useState("menu");
  const [mode, setMode] = useState("pvp");
  const [difficulty, setDifficulty] = useState("medium");

  // Custom states
  const [theme, setTheme] = useState(() => localStorage.getItem("xo_theme") || "neon");
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem("xo_sound");
    return saved !== null ? saved === "true" : true;
  });

  const [playerNames, setPlayerNames] = useState(() => {
    const saved = localStorage.getItem("xo_names");
    return saved ? JSON.parse(saved) : { X: "Player X", O: "Player O" };
  });

  const [board, setBoard] = useState(Array(9).fill(null));
  const [currentTurn, setCurrentTurn] = useState("X");
  const [result, setResult] = useState(null);

  const [scores, setScores] = useState(() => {
    const saved = localStorage.getItem("xo_scores");
    return saved ? JSON.parse(saved) : { X: 0, O: 0, draw: 0 };
  });

  const [round, setRound] = useState(() => {
    const saved = localStorage.getItem("xo_round");
    return saved ? parseInt(saved, 10) : 1;
  });

  const [streak, setStreak] = useState(() => {
    const saved = localStorage.getItem("xo_streak");
    return saved ? JSON.parse(saved) : { player: null, count: 0 };
  });

  const [winningCombo, setWinningCombo] = useState([]);
  const [animCells, setAnimCells] = useState([]);
  const [aiThinking, setAiThinking] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [drawShake, setDrawShake] = useState(false);
  const [justPlaced, setJustPlaced] = useState(null);

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem("xo_theme", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("xo_sound", soundEnabled.toString());
  }, [soundEnabled]);

  useEffect(() => {
    localStorage.setItem("xo_names", JSON.stringify(playerNames));
  }, [playerNames]);

  useEffect(() => {
    localStorage.setItem("xo_scores", JSON.stringify(scores));
  }, [scores]);

  useEffect(() => {
    localStorage.setItem("xo_round", round.toString());
  }, [round]);

  useEffect(() => {
    localStorage.setItem("xo_streak", JSON.stringify(streak));
  }, [streak]);

  const startGame = () => {
    playSound('reset', soundEnabled);
    setBoard(Array(9).fill(null));
    setCurrentTurn("X");
    setResult(null);
    setWinningCombo([]);
    setAnimCells([]);
    setJustPlaced(null);
    setScreen("game");
  };

  const handleCellClick = useCallback((idx) => {
    if (board[idx] || result || aiThinking) return;
    if (mode === "ai" && currentTurn === "O") return;
    playMove(idx, currentTurn);
  }, [board, result, aiThinking, currentTurn, mode]);

  const playMove = useCallback((idx, symbol) => {
    playSound(symbol === 'X' ? 'click-x' : 'click-o', soundEnabled);

    const newBoard = [...board];
    newBoard[idx] = symbol;
    setBoard(newBoard);
    setJustPlaced(idx);
    setAnimCells(prev => [...prev, idx]);

    const res = checkWinner(newBoard);
    if (res) {
      setTimeout(() => {
        setResult(res);
        setWinningCombo(res.combo || []);
        if (res.winner === "draw") {
          playSound('draw', soundEnabled);
          setScores(s => ({ ...s, draw: s.draw + 1 }));
          setStreak({ player: null, count: 0 });
          setDrawShake(true);
          setTimeout(() => setDrawShake(false), 600);
        } else {
          playSound('win', soundEnabled);
          setScores(s => ({ ...s, [res.winner]: s[res.winner] + 1 }));
          setStreak(prev => prev.player === res.winner
            ? { player: res.winner, count: prev.count + 1 }
            : { player: res.winner, count: 1 }
          );
        }
      }, 200);
    } else {
      setCurrentTurn(symbol === "X" ? "O" : "X");
    }
  }, [board, soundEnabled]);

  // AI move
  useEffect(() => {
    if (mode !== "ai" || currentTurn !== "O" || result || screen !== "game") return;
    setAiThinking(true);
    const delay = difficulty === "easy" ? 400 : difficulty === "medium" ? 600 : 800;
    const timer = setTimeout(() => {
      const move = getBestMove(board, "O", "X", difficulty);
      if (move !== undefined && move !== null) playMove(move, "O");
      setAiThinking(false);
    }, delay);
    return () => clearTimeout(timer);
  }, [currentTurn, mode, board, result, screen, difficulty, playMove]);

  const playAgain = () => {
    playSound('reset', soundEnabled);
    setBoard(Array(9).fill(null));
    setCurrentTurn("X");
    setResult(null);
    setWinningCombo([]);
    setAnimCells([]);
    setJustPlaced(null);
    setRound(r => r + 1);
  };

  const goMenu = () => {
    playSound('reset', soundEnabled);
    setScreen("menu");
    setResult(null);
    setBoard(Array(9).fill(null));
    setWinningCombo([]);
    setRound(1);
    setAnimCells([]);
  };

  const resetScores = () => {
    playSound('reset', soundEnabled);
    setScores({ X: 0, O: 0, draw: 0 });
    setStreak({ player: null, count: 0 });
    setRound(1);
    setShowResetConfirm(false);
  };

  const xName = playerNames.X || "Player X";
  const oName = mode === "ai" ? "AI Bot 🤖" : (playerNames.O || "Player O");
  const activeTheme = THEMES[theme] || THEMES.neon;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Inter:wght@400;500;600&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          background: #060614;
          min-height: 100vh;
          font-family: 'Inter', sans-serif;
          overflow-x: hidden;
        }

        .xo-root {
          min-height: 100vh;
          background: var(--theme-bg);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          position: relative;
          overflow: hidden;
          transition: background 0.8s ease;
        }

        .xo-root {
          --theme-bg: ${activeTheme.bg};
          --color-x: ${activeTheme.colorX};
          --color-o: ${activeTheme.colorO};
          --color-x-bg: ${activeTheme.colorXBg};
          --color-o-bg: ${activeTheme.colorOBg};
          --color-x-border: ${activeTheme.colorXBorder};
          --color-o-border: ${activeTheme.colorOBorder};
          --gradient-title: ${activeTheme.gradientTitle};
          --shadow-x: ${activeTheme.shadowX};
          --shadow-o: ${activeTheme.shadowO};
          --star-color: ${activeTheme.starColor};
        }

        .xo-root::before {
          content: '';
          position: fixed;
          inset: 0;
          background:
            radial-gradient(circle at 15% 85%, rgba(0,212,255,0.06) 0%, transparent 40%),
            radial-gradient(circle at 85% 15%, rgba(255,0,110,0.06) 0%, transparent 40%);
          pointer-events: none;
        }

        /* ── AMBIENT STARS ── */
        .stars {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 0;
        }
        .star {
          position: absolute;
          width: 2px; height: 2px;
          background: var(--star-color);
          border-radius: 50%;
          animation: twinkle var(--d) ease-in-out infinite;
          opacity: 0;
          transition: background 0.8s ease;
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0; transform: scale(1); }
          50% { opacity: var(--o); transform: scale(1.5); }
        }

        /* ── GLASS CARD ── */
        .glass {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          backdrop-filter: blur(20px);
          border-radius: 24px;
        }

        /* ── TITLE ── */
        .title {
          font-family: 'Orbitron', monospace;
          font-weight: 900;
          font-size: clamp(2.2rem, 8vw, 3.5rem);
          letter-spacing: 0.08em;
          background: var(--gradient-title);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: titlePulse 3s ease-in-out infinite;
          text-align: center;
          line-height: 1.1;
        }
        @keyframes titlePulse {
          0%, 100% { filter: brightness(1); }
          50% { filter: brightness(1.3) drop-shadow(0 0 20px var(--shadow-x)); }
        }

        .subtitle {
          font-family: 'Inter', sans-serif;
          font-size: 0.75rem;
          letter-spacing: 0.3em;
          color: rgba(255,255,255,0.4);
          text-align: center;
          text-transform: uppercase;
          margin-top: 4px;
        }

        /* ── MODE BUTTONS ── */
        .mode-btn {
          border: 1.5px solid rgba(255,255,255,0.15);
          background: rgba(255,255,255,0.04);
          color: rgba(255,255,255,0.6);
          border-radius: 14px;
          padding: 14px 20px;
          cursor: pointer;
          font-family: 'Inter', sans-serif;
          font-size: 0.9rem;
          font-weight: 500;
          transition: all 0.2s ease;
          text-align: left;
          width: 100%;
        }
        .mode-btn:hover {
          background: rgba(255,255,255,0.08);
          border-color: rgba(255,255,255,0.3);
          color: #fff;
          transform: translateY(-1px);
        }
        .mode-btn.active-pvp {
          border-color: var(--color-x);
          background: var(--color-x-bg);
          color: var(--color-x);
          box-shadow: 0 0 20px var(--shadow-x);
        }
        .mode-btn.active-ai {
          border-color: var(--color-o);
          background: var(--color-o-bg);
          color: var(--color-o);
          box-shadow: 0 0 20px var(--shadow-o);
        }

        /* ── DIFFICULTY ── */
        .diff-btn {
          border: 1.5px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.03);
          color: rgba(255,255,255,0.5);
          border-radius: 12px;
          padding: 10px 0;
          cursor: pointer;
          font-family: 'Inter', sans-serif;
          font-size: 0.85rem;
          font-weight: 500;
          transition: all 0.2s;
          flex: 1;
        }
        .diff-btn:hover { background: rgba(255,255,255,0.07); color: #fff; }
        .diff-btn.diff-easy { border-color: #00ff88; background: rgba(0,255,136,0.1); color: #00ff88; box-shadow: 0 0 15px rgba(0,255,136,0.2); }
        .diff-btn.diff-medium { border-color: #ffbe00; background: rgba(255,190,0,0.1); color: #ffbe00; box-shadow: 0 0 15px rgba(255,190,0,0.2); }
        .diff-btn.diff-hard { border-color: #ff4040; background: rgba(255,64,64,0.1); color: #ff4040; box-shadow: 0 0 15px rgba(255,64,64,0.2); }

        /* ── INPUT ── */
        .name-input {
          background: rgba(255,255,255,0.05);
          border: 1.5px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          padding: 12px 16px;
          color: #fff;
          font-family: 'Inter', sans-serif;
          font-size: 0.9rem;
          width: 100%;
          outline: none;
          transition: border-color 0.2s;
        }
        .name-input:focus { border-color: rgba(255,255,255,0.35); }
        .name-input::placeholder { color: rgba(255,255,255,0.25); }

        /* ── START BUTTON ── */
        .start-btn {
          background: var(--gradient-title);
          border: none;
          border-radius: 16px;
          padding: 16px;
          color: #fff;
          font-family: 'Orbitron', monospace;
          font-size: 1rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          cursor: pointer;
          width: 100%;
          transition: all 0.2s;
          box-shadow: 0 4px 30px var(--shadow-x);
        }
        .start-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 40px var(--shadow-o);
          filter: brightness(1.1);
        }
        .start-btn:active { transform: translateY(0); }

        /* ── BOARD ── */
        .board-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
          width: min(90vw, 360px);
          margin: 0 auto;
        }

        .cell {
          aspect-ratio: 1;
          border-radius: 18px;
          background: rgba(255,255,255,0.04);
          border: 1.5px solid rgba(255,255,255,0.08);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: clamp(2rem, 10vw, 3.2rem);
          font-weight: 900;
          font-family: 'Orbitron', monospace;
          transition: all 0.18s ease;
          position: relative;
          overflow: hidden;
          user-select: none;
        }
        .cell::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 18px;
          opacity: 0;
          transition: opacity 0.2s;
        }
        .cell.empty:hover::before {
          opacity: 1;
          background: rgba(255,255,255,0.05);
        }
        .cell.empty:hover {
          border-color: rgba(255,255,255,0.25);
          transform: scale(1.03);
        }
        .cell.x-cell {
          color: var(--color-x);
          text-shadow: 0 0 20px var(--color-x), 0 0 40px var(--shadow-x);
          border-color: var(--color-x-border);
          background: var(--color-x-bg);
        }
        .cell.o-cell {
          color: var(--color-o);
          text-shadow: 0 0 20px var(--color-o), 0 0 40px var(--shadow-o);
          border-color: var(--color-o-border);
          background: var(--color-o-bg);
        }
        .cell.winning {
          animation: winPulse 0.8s ease-in-out infinite alternate;
          border-color: #ffd700 !important;
          background: rgba(255,215,0,0.1) !important;
          box-shadow: 0 0 30px rgba(255,215,0,0.4);
        }
        @keyframes winPulse {
          from { box-shadow: 0 0 15px rgba(255,215,0,0.3); }
          to { box-shadow: 0 0 40px rgba(255,215,0,0.7); }
        }
        .cell.pop {
          animation: cellPop 0.35s cubic-bezier(0.34,1.56,0.64,1);
        }
        @keyframes cellPop {
          0% { transform: scale(0.3); opacity: 0; }
          60% { transform: scale(1.12); }
          100% { transform: scale(1); opacity: 1; }
        }

        /* ── PLAYER BANNER ── */
        .player-banner {
          border-radius: 14px;
          padding: 10px 14px;
          flex: 1;
          text-align: center;
          border: 1.5px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.03);
          transition: all 0.3s;
        }
        .player-banner.active-x {
          border-color: var(--color-x);
          background: var(--color-x-bg);
          box-shadow: 0 0 20px var(--shadow-x);
        }
        .player-banner.active-o {
          border-color: var(--color-o);
          background: var(--color-o-bg);
          box-shadow: 0 0 20px var(--shadow-o);
        }

        .turn-dot {
          width: 8px; height: 8px;
          border-radius: 50%;
          display: inline-block;
          margin-right: 6px;
          animation: blink 1s ease-in-out infinite;
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.2; }
        }

        /* ── SCORE PILLS ── */
        .score-pill {
          border-radius: 12px;
          padding: 8px 14px;
          text-align: center;
          flex: 1;
        }

        /* ── RESULT OVERLAY ── */
        .overlay {
          position: fixed;
          inset: 0;
          background: rgba(6,6,20,0.85);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100;
          animation: fadeIn 0.3s ease;
          padding: 20px;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .result-card {
          border-radius: 28px;
          padding: 36px 28px;
          width: min(90vw, 380px);
          text-align: center;
          animation: slideUp 0.4s cubic-bezier(0.34,1.56,0.64,1);
        }
        @keyframes slideUp {
          from { transform: translateY(60px) scale(0.9); opacity: 0; }
          to { transform: translateY(0) scale(1); opacity: 1; }
        }

        .result-emoji {
          font-size: 4rem;
          animation: bounce 0.6s cubic-bezier(0.34,1.56,0.64,1);
        }
        @keyframes bounce {
          0% { transform: scale(0); }
          70% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }

        /* ── CONFETTI ── */
        .confetti-wrap {
          position: fixed; inset: 0; pointer-events: none; z-index: 99; overflow: hidden;
        }
        .confetti-piece {
          position: absolute;
          width: 8px; height: 8px;
          top: -10px;
          animation: confettiFall var(--dur) var(--delay) ease-in forwards;
          border-radius: var(--br);
        }
        @keyframes confettiFall {
          0% { transform: translateY(0) rotate(0deg) translateX(0); opacity: 1; }
          100% { transform: translateY(110vh) rotate(720deg) translateX(var(--drift)); opacity: 0; }
        }

        /* ── SHAKE ── */
        .shake {
          animation: shake 0.5s ease-in-out;
        }
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-6px); }
          80% { transform: translateX(6px); }
        }

        /* ── AI THINKING ── */
        .ai-thinking {
          display: flex; gap: 5px; align-items: center; justify-content: center;
        }
        .ai-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: var(--color-o);
          animation: aiPulse 0.6s ease-in-out infinite;
        }
        .ai-dot:nth-child(2) { animation-delay: 0.15s; }
        .ai-dot:nth-child(3) { animation-delay: 0.3s; }
        @keyframes aiPulse {
          0%,100% { transform: scale(0.6); opacity: 0.4; }
          50% { transform: scale(1.2); opacity: 1; }
        }

        /* ── ACTION BTNS ── */
        .action-btn {
          border-radius: 14px;
          padding: 13px 20px;
          font-family: 'Inter', sans-serif;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
          width: 100%;
        }
        .btn-primary {
          background: var(--gradient-title);
          color: #fff;
          box-shadow: 0 4px 20px var(--shadow-x);
        }
        .btn-primary:hover { filter: brightness(1.15); transform: translateY(-1px); }
        .btn-secondary {
          background: rgba(255,255,255,0.07);
          border: 1.5px solid rgba(255,255,255,0.12) !important;
          color: rgba(255,255,255,0.7);
        }
        .btn-secondary:hover { background: rgba(255,255,255,0.12); color: #fff; }
        .btn-danger {
          background: rgba(255,64,64,0.15);
          border: 1.5px solid rgba(255,64,64,0.3) !important;
          color: #ff4040;
        }
        .btn-danger:hover { background: rgba(255,64,64,0.25); }

        .label {
          font-size: 0.7rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.35);
          font-weight: 500;
        }

        .section-gap { display: flex; flex-direction: column; gap: 10px; }

        /* ── THEME DROPDOWN ── */
        .theme-select {
          background: rgba(255,255,255,0.06);
          border: 1.5px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          padding: 12px 16px;
          color: #fff;
          font-family: 'Inter', sans-serif;
          font-size: 0.9rem;
          width: 100%;
          outline: none;
          cursor: pointer;
          transition: border-color 0.2s;
        }
        .theme-select:focus { border-color: rgba(255,255,255,0.35); }
        .theme-select option {
          background: #060614;
          color: #fff;
        }

        /* Sound toggle button in header */
        .sound-toggle-btn {
          background: rgba(255, 255, 255, 0.05);
          border: 1.5px solid rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          width: 38px;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: rgba(255, 255, 255, 0.7);
          transition: all 0.2s;
        }
        .sound-toggle-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #fff;
          transform: scale(1.05);
        }
      `}</style>

      {/* Stars */}
      <div className="stars">
        {Array.from({length: 60}).map((_,i) => (
          <div key={i} className="star" style={{
            left: `${Math.random()*100}%`,
            top: `${Math.random()*100}%`,
            '--d': `${2 + Math.random()*4}s`,
            '--o': Math.random() * 0.6 + 0.2,
            animationDelay: `${Math.random()*4}s`
          }} />
        ))}
      </div>

      {/* Confetti on win */}
      {result && result.winner !== "draw" && (
        <div className="confetti-wrap">
          {Array.from({length: 50}).map((_,i) => (
            <div key={i} className="confetti-piece" style={{
              left: `${Math.random()*100}%`,
              background: [activeTheme.colorX, activeTheme.colorO, '#ffd700','#bf00ff','#00ff88'][i%5],
              '--dur': `${1.5 + Math.random()*2}s`,
              '--delay': `${Math.random()*0.8}s`,
              '--drift': `${(Math.random()-0.5)*200}px`,
              '--br': Math.random() > 0.5 ? '50%' : '2px',
              width: `${6 + Math.random()*8}px`,
              height: `${6 + Math.random()*8}px`,
            }} />
          ))}
        </div>
      )}

      <div className="xo-root" style={{zIndex:1}}>

        {/* ══════════ MENU SCREEN ══════════ */}
        {screen === "menu" && (
          <div className="glass" style={{width:'min(92vw,420px)', padding:'32px 28px', display:'flex', flexDirection:'column', gap:'24px'}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
              <div style={{flex: 1, textAlign: 'center', paddingLeft: '38px'}}>
                <div className="title">XO ARENA</div>
                <div className="subtitle">Ultimate Tic-Tac-Toe</div>
              </div>
              <button 
                className="sound-toggle-btn"
                onClick={() => setSoundEnabled(!soundEnabled)}
                title={soundEnabled ? "Mute Sounds" : "Unmute Sounds"}
              >
                {soundEnabled ? "🔊" : "🔇"}
              </button>
            </div>

            {/* Mode */}
            <div className="section-gap">
              <div className="label">Game Mode</div>
              <div style={{display:'flex', gap:'10px'}}>
                <button className={`mode-btn ${mode==='pvp' ? 'active-pvp' : ''}`} onClick={() => setMode('pvp')}>
                  <div style={{fontSize:'1.2rem', marginBottom:'2px'}}>👥</div>
                  <div style={{fontWeight:600, fontSize:'0.9rem'}}>Player vs Player</div>
                  <div style={{fontSize:'0.75rem', opacity:0.6, marginTop:'2px'}}>Same device</div>
                </button>
                <button className={`mode-btn ${mode==='ai' ? 'active-ai' : ''}`} onClick={() => setMode('ai')}>
                  <div style={{fontSize:'1.2rem', marginBottom:'2px'}}>🤖</div>
                  <div style={{fontWeight:600, fontSize:'0.9rem'}}>vs AI Bot</div>
                  <div style={{fontSize:'0.75rem', opacity:0.6, marginTop:'2px'}}>Challenge CPU</div>
                </button>
              </div>
            </div>

            {/* Difficulty */}
            {mode === 'ai' && (
              <div className="section-gap">
                <div className="label">AI Difficulty</div>
                <div style={{display:'flex', gap:'8px'}}>
                  {['easy','medium','hard'].map(d => (
                    <button
                      key={d}
                      className={`diff-btn ${difficulty===d ? `diff-${d}` : ''}`}
                      onClick={() => setDifficulty(d)}
                    >
                      {d === 'easy' ? '😊 Easy' : d === 'medium' ? '🤔 Med' : '🤖 Hard'}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Themes */}
            <div className="section-gap">
              <div className="label">Theme Settings</div>
              <select 
                className="theme-select"
                value={theme}
                onChange={e => setTheme(e.target.value)}
              >
                {Object.entries(THEMES).map(([k, v]) => (
                  <option key={k} value={k}>{v.name}</option>
                ))}
              </select>
            </div>

            {/* Names */}
            <div className="section-gap">
              <div className="label">Player Names</div>
              <div style={{position:'relative'}}>
                <span style={{position:'absolute', left:'14px', top:'50%', transform:'translateY(-50%)', color:activeTheme.colorX, fontWeight:700, fontSize:'0.85rem', fontFamily:'Orbitron, monospace'}}>X</span>
                <input
                  className="name-input"
                  style={{paddingLeft:'36px'}}
                  placeholder="Player X name"
                  value={playerNames.X}
                  onChange={e => setPlayerNames(p => ({...p, X: e.target.value}))}
                  maxLength={16}
                />
              </div>
              {mode === 'pvp' && (
                <div style={{position:'relative'}}>
                  <span style={{position:'absolute', left:'14px', top:'50%', transform:'translateY(-50%)', color:activeTheme.colorO, fontWeight:700, fontSize:'0.85rem', fontFamily:'Orbitron, monospace'}}>O</span>
                  <input
                    className="name-input"
                    style={{paddingLeft:'36px'}}
                    placeholder="Player O name"
                    value={playerNames.O}
                    onChange={e => setPlayerNames(p => ({...p, O: e.target.value}))}
                    maxLength={16}
                  />
                </div>
              )}
            </div>

            <button className="start-btn" onClick={startGame}>
              ⚡ START GAME
            </button>
          </div>
        )}

        {/* ══════════ GAME SCREEN ══════════ */}
        {screen === "game" && (
          <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap:'16px', width:'min(92vw, 400px)'}}>

            {/* Header */}
            <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', width:'100%'}}>
              <button
                className="action-btn btn-secondary"
                style={{width:'auto', padding:'8px 16px', fontSize:'0.8rem'}}
                onClick={goMenu}
              >← Menu</button>
              <div style={{textAlign:'center'}}>
                <div style={{fontFamily:'Orbitron, monospace', color:'rgba(255,255,255,0.5)', fontSize:'0.7rem', letterSpacing:'0.15em'}}>ROUND</div>
                <div style={{fontFamily:'Orbitron, monospace', color:'#fff', fontSize:'1.3rem', fontWeight:700}}>{round}</div>
              </div>
              <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
                <button 
                  className="sound-toggle-btn"
                  style={{width: '32px', height: '32px', fontSize: '0.78rem'}}
                  onClick={() => setSoundEnabled(!soundEnabled)}
                >
                  {soundEnabled ? "🔊" : "🔇"}
                </button>
                <button
                  className="action-btn btn-secondary"
                  style={{width:'auto', padding:'8px 16px', fontSize:'0.8rem'}}
                  onClick={playAgain}
                >Reset ↺</button>
              </div>
            </div>

            {/* Player banners */}
            <div style={{display:'flex', gap:'10px', width:'100%'}}>
              <div className={`player-banner ${!result && currentTurn==='X' ? 'active-x' : ''}`}>
                <div style={{fontFamily:'Orbitron, monospace', color:activeTheme.colorX, fontSize:'0.8rem', fontWeight:700}}>
                  {!result && currentTurn === 'X' && <span className="turn-dot" style={{background:activeTheme.colorX}} />}X
                </div>
                <div style={{color:'#fff', fontSize:'0.85rem', fontWeight:600, marginTop:'2px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{xName}</div>
              </div>
              <div style={{display:'flex', alignItems:'center', justifyContent:'center', color:'rgba(255,255,255,0.2)', fontFamily:'Orbitron, monospace', fontSize:'1rem', fontWeight:700, flexShrink:0}}>VS</div>
              <div className={`player-banner ${!result && currentTurn==='O' ? 'active-o' : ''}`}>
                <div style={{fontFamily:'Orbitron, monospace', color:activeTheme.colorO, fontSize:'0.8rem', fontWeight:700}}>
                  {!result && currentTurn === 'O' && <span className="turn-dot" style={{background:activeTheme.colorO}} />}O
                </div>
                <div style={{color:'#fff', fontSize:'0.85rem', fontWeight:600, marginTop:'2px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{oName}</div>
              </div>
            </div>

            {/* AI thinking */}
            {aiThinking && (
              <div style={{display:'flex', alignItems:'center', gap:'8px', color:activeTheme.colorO, fontSize:'0.8rem', opacity:0.8}}>
                <div className="ai-thinking">
                  <div className="ai-dot" /><div className="ai-dot" /><div className="ai-dot" />
                </div>
                AI is thinking...
              </div>
            )}

            {/* Board */}
            <div className={`board-grid ${drawShake ? 'shake' : ''}`}>
              {board.map((cell, idx) => {
                const isWinCell = winningCombo.includes(idx);
                const justPlacedHere = justPlaced === idx;
                return (
                  <div
                    key={idx}
                    className={[
                      'cell',
                      cell === 'X' ? 'x-cell' : cell === 'O' ? 'o-cell' : 'empty',
                      isWinCell ? 'winning' : '',
                      justPlacedHere ? 'pop' : ''
                    ].join(' ')}
                    onClick={() => handleCellClick(idx)}
                    style={{cursor: cell || result || aiThinking ? 'default' : 'pointer'}}
                  >
                    {cell}
                  </div>
                );
              })}
            </div>

            {/* Scores */}
            <div className="glass" style={{width:'100%', padding:'14px 16px', display:'flex', gap:'8px', alignItems:'stretch'}}>
              <div className="score-pill" style={{background:activeTheme.colorXBg, border:`1px solid ${activeTheme.colorXBorder}`}}>
                <div style={{color:activeTheme.colorX, fontFamily:'Orbitron, monospace', fontSize:'1.4rem', fontWeight:700}}>{scores.X}</div>
                <div style={{fontSize:'0.68rem', color:'rgba(255,255,255,0.4)', marginTop:'1px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{xName}</div>
              </div>
              <div className="score-pill" style={{background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)'}}>
                <div style={{color:'rgba(255,255,255,0.5)', fontFamily:'Orbitron, monospace', fontSize:'1.4rem', fontWeight:700}}>{scores.draw}</div>
                <div style={{fontSize:'0.68rem', color:'rgba(255,255,255,0.3)', marginTop:'1px'}}>Draw</div>
              </div>
              <div className="score-pill" style={{background:activeTheme.colorOBg, border:`1px solid ${activeTheme.colorOBorder}`}}>
                <div style={{color:activeTheme.colorO, fontFamily:'Orbitron, monospace', fontSize:'1.4rem', fontWeight:700}}>{scores.O}</div>
                <div style={{fontSize:'0.68rem', color:'rgba(255,255,255,0.4)', marginTop:'1px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{oName}</div>
              </div>
            </div>

            {/* Win streak */}
            {streak.count >= 2 && (
              <div style={{color:'#ffd700', fontSize:'0.85rem', fontWeight:600, textAlign:'center',
                textShadow:'0 0 15px rgba(255,215,0,0.5)', animation:'titlePulse 1.5s ease-in-out infinite'}}>
                🔥 {streak.count} Win Streak — {streak.player === 'X' ? xName : oName}!
              </div>
            )}

            {/* Reset scores */}
            {!showResetConfirm ? (
              <button className="action-btn btn-danger" style={{fontSize:'0.78rem', padding:'8px'}} onClick={() => setShowResetConfirm(true)}>
                Reset All Scores
              </button>
            ) : (
              <div style={{display:'flex', gap:'8px', width:'100%'}}>
                <button className="action-btn btn-danger" style={{fontSize:'0.8rem'}} onClick={resetScores}>Confirm Reset</button>
                <button className="action-btn btn-secondary" style={{fontSize:'0.8rem', border:'none'}} onClick={() => setShowResetConfirm(false)}>Cancel</button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ══════════ RESULT OVERLAY ══════════ */}
      {result && (
        <div className="overlay">
          <div className="glass result-card">
            <div className="result-emoji">
              {result.winner === 'draw' ? '🤝' : '🏆'}
            </div>
            <div style={{marginTop:'16px', fontFamily:'Orbitron, monospace', fontSize:'1.5rem', fontWeight:900,
              background: result.winner==='X' ? `linear-gradient(135deg, ${activeTheme.colorX}, #fff)` : result.winner==='O' ? `linear-gradient(135deg, ${activeTheme.colorO}, #fff)` : 'linear-gradient(135deg, #ffd700, #fff)',
              WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text'}}>
              {result.winner === 'draw' ? "IT'S A DRAW!" : result.winner === 'X' ? `${xName} WINS!` : `${oName} WINS!`}
            </div>
            {result.winner !== 'draw' && (
              <div style={{color:'rgba(255,255,255,0.5)', fontSize:'0.85rem', marginTop:'6px'}}>
                {result.winner === 'X' ? '⚡ X dominates the board' : '🔥 O takes the victory'}
              </div>
            )}

            {/* Updated scores inside modal */}
            <div style={{display:'flex', gap:'10px', marginTop:'20px'}}>
              <div style={{flex:1, background:activeTheme.colorXBg, border:`1px solid ${activeTheme.colorXBorder}`, borderRadius:'12px', padding:'10px', textAlign:'center'}}>
                <div style={{color:activeTheme.colorX, fontFamily:'Orbitron, monospace', fontSize:'1.3rem', fontWeight:700}}>{scores.X}</div>
                <div style={{color:'rgba(255,255,255,0.4)', fontSize:'0.7rem', marginTop:'2px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{xName}</div>
              </div>
              <div style={{flex:1, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'12px', padding:'10px', textAlign:'center'}}>
                <div style={{color:'rgba(255,255,255,0.5)', fontFamily:'Orbitron, monospace', fontSize:'1.3rem', fontWeight:700}}>{scores.draw}</div>
                <div style={{color:'rgba(255,255,255,0.3)', fontSize:'0.7rem', marginTop:'2px'}}>Draws</div>
              </div>
              <div style={{flex:1, background:activeTheme.colorOBg, border:`1px solid ${activeTheme.colorOBorder}`, borderRadius:'12px', padding:'10px', textAlign:'center'}}>
                <div style={{color:activeTheme.colorO, fontFamily:'Orbitron, monospace', fontSize:'1.3rem', fontWeight:700}}>{scores.O}</div>
                <div style={{color:'rgba(255,255,255,0.4)', fontSize:'0.7rem', marginTop:'2px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{oName}</div>
              </div>
            </div>

            {streak.count >= 2 && (
              <div style={{color:'#ffd700', fontSize:'0.85rem', fontWeight:600, marginTop:'12px',
                textShadow:'0 0 15px rgba(255,215,0,0.5)'}}>
                🔥 {streak.count} Win Streak — {streak.player === 'X' ? xName : oName}!
              </div>
            )}

            <div style={{display:'flex', gap:'10px', marginTop:'22px'}}>
              <button className="action-btn btn-primary" onClick={playAgain}>▶ Play Again</button>
              <button className="action-btn btn-secondary" style={{border:'1.5px solid rgba(255,255,255,0.12)'}} onClick={goMenu}>Menu</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
