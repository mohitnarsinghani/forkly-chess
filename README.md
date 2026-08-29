# ♟️ Forkly — Ultra-Premium Chess Web Application & Engine Suite

![Forkly Banner](https://img.shields.io/badge/Forkly-Ultra--Premium%20Chess-81b64c?style=for-the-badge&logo=chess)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100-009688?style=for-the-badge&logo=fastapi)
![Stockfish](https://img.shields.io/badge/Stockfish-18%20Engine-black?style=for-the-badge)

A high-performance, ultra-premium chess application featuring a **React + Tailwind CSS** frontend with a warm dark slate UI design (`#312e2b`, `#262421`, `#81b64c`), powered by a **Python FastAPI** backend running **Stockfish 18 UCI engine integration**, local WASM WebWorker fallbacks, tactical CSV puzzle datasets, PGN game replaying, and deep Multi-PV position analysis.

---

## ✨ Features Overview

- ♟️ **Pass & Play Mode**: 2-Player local match on a single device with legal move highlights, checkmate/stalemate detection, and turn timers.
- 🤖 **Bot Opponent Engine (200 - 2800 ELO)**: Accordion Skill Tier selection modal (New to Chess, Beginner, Novice, Intermediate, Master) with direct **PLAY** button and White/Black/Random color choice.
- 🧩 **CSV Tactical Puzzle Solver**: Dynamic tactical puzzle engine parsed from CSV datasets with interactive move validation and feedback.
- 🔬 **Stockfish 18 Board Analysis**: Live evaluation bar (-10.0 to +10.0), Multi-PV top 3 engine recommendations with visual board arrows, PGN/FEN input parser, and **Keyboard Arrow Navigation (`←` / `→`)**.
- 📹 **PGN Game Replayer**: Upload PGN text/files to auto-play and step through grandmaster games with move tables.
- 🏆 **Tournaments & Learn Placeholders**: Clean sidebar navigation featuring **Coming Soon** badges.

---

## 🛠️ Tech Stack & Architecture

### **Frontend**
- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS (Custom Dark Palette: `#312e2b`, `#262421`, `#383531`, `#81b64c` with 3D tactile buttons `0 5px 0 #457524`)
- **Chess Libraries**: `chess.js`, `react-chessboard`, custom Stockfish WebWorker WASM fallback

### **Backend**
- **Framework**: Python 3 + FastAPI (`uvicorn`, `pydantic`)
- **Engine Connector**: `python-chess` + Stockfish 18 UCI engine wrapper with Elo-to-UCI `Skill Level` (0-20) scaling
- **Data Engine**: `pandas` for parsing `lichess_puzzle_transformed.csv`

---

## 🚀 Quick Start Guide

### 1. Frontend Setup (React + Vite)

```bash
# Clone the repository
git clone https://github.com/your-username/forkly-chess.git
cd forkly-chess

# Install dependencies
npm install

# Start Vite local dev server
npm run dev
```

The frontend will be available at `http://localhost:3000`.

---

### 2. Backend Setup (Python FastAPI Engine API)

```bash
# Navigate to backend directory
cd backend

# Install Python requirements
pip install -r requirements.txt

# Start FastAPI server
python main.py
```

The FastAPI engine service will run at `http://localhost:8000` with active interactive documentation at `http://localhost:8000/docs`.

---

## 📡 API Endpoints Summary

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Service status check |
| `POST` | `/api/bot/move` | Calculates Stockfish bot move for given `{ fen, elo }` |
| `GET` | `/api/puzzles/random` | Returns a random tactical puzzle from CSV dataset |
| `POST` | `/api/puzzles/verify` | Verifies user puzzle move solution attempt |
| `POST` | `/api/analyze` | Generates Multi-PV top engine lines & position evaluation |

---

## 📜 License

MIT License. Designed and developed with ❤️ for chess enthusiasts.
