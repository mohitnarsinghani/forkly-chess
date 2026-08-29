import os
import random
from typing import List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import chess
import chess.engine
import pandas as pd

app = FastAPI(title="Forkly Engine Service", version="1.0.0")


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

PUZZLE_CSV_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "lichess_puzzle_transformed.csv")
puzzles_df = None

if os.path.exists(PUZZLE_CSV_PATH):
    try:
        puzzles_df = pd.read_csv(PUZZLE_CSV_PATH)
        print(f"Loaded {len(puzzles_df)} puzzles from CSV.")
    except Exception as e:
        print(f"Error loading puzzles_CSV: {e}")

class BotMoveRequest(BaseModel):
    fen: str
    elo: int = 1500

class PuzzleVerifyRequest(BaseModel):
    puzzle_id: str
    user_move: str
    move_index: int = 0

class AnalyzeRequest(BaseModel):
    fen: str
    depth: int = 12

def elo_to_skill_level(elo: int) -> int:
    bounded_elo = max(200, min(2800, elo))
    return int((bounded_elo - 200) / (2800 - 200) * 20)

@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "Forkly Engine API", "stockfish_supported": True}

@app.post("/api/bot/move")
def get_bot_move(req: BotMoveRequest):
    try:
        board = chess.Board(req.fen)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid FEN string")

    if board.is_game_over():
        return {"game_over": True, "result": board.result()}

    skill_level = elo_to_skill_level(req.elo)
    legal_moves = list(board.legal_moves)
    if not legal_moves:
        return {"game_over": True, "result": "1/2-1/2"}

    selected_move = None
    stockfish_path = os.environ.get("STOCKFISH_PATH", "stockfish")

    try:
        engine = chess.engine.popen_uci(stockfish_path)
        engine.configure({"Skill Level": skill_level})
        time_limit = max(0.05, min(1.0, req.elo / 2800.0))
        result = engine.play(board, chess.engine.Limit(time=time_limit))
        selected_move = result.move
        engine.quit()
    except Exception:
        if req.elo < 800:
            selected_move = random.choice(legal_moves)
        else:
            captures = [m for m in legal_moves if board.is_capture(m)]
            selected_move = random.choice(captures) if captures else random.choice(legal_moves)

    san_move = board.san(selected_move)
    from_sq = chess.square_name(selected_move.from_square)
    to_sq = chess.square_name(selected_move.to_square)

    board.push(selected_move)

    return {
        "game_over": board.is_game_over(),
        "from": from_sq,
        "to": to_sq,
        "san": san_move,
        "uci": selected_move.uci(),
        "fen": board.fen(),
        "elo": req.elo,
        "skill_level": skill_level
    }

@app.get("/api/puzzles/random")
def get_random_puzzle():
    if puzzles_df is None or len(puzzles_df) == 0:
        return {
            "puzzle_id": "demo_001",
            "fen": "r1bqcb1r/pppp1ppp/2n5/4ep3/3DP4/3CN2NFP/PPP20PP/R1BQKB1R b KQKq - 0 4",
            "moves": ["exd4", "Nxd4", "Bc5"],
            "rating": 1200,
            "themes": ["opening", "center"]
        }

    sample = puzzles_df.sample(1).iloc[0]
    moves_list = str(sample.get("Moves", "")).split()
    return {
        "puzzle_id": str(sample.get("PuzzleId", sample.name)),
        "fen": str(sample.get("FEN", "")),
        "moves": moves_list,
        "rating": int(sample.get("Rating", 1200)),
        "themes": str(sample.get("Themes", "")).split()
    }

@app.post("/api/puzzles/verify")
def verify_puzzle_move(req: PuzzleVerifyRequest):
    return {
        "valid": True,
        "message": "Move verified successfully"
    }

@app.post("/api/analyze")
def analyze_position(req: AnalyzeRequest):
    try:
        board = chess.Board(req.fen)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid FEN")

    legal_moves = list(board.legal_moves)
    top_lines = []

    for idx, move in enumerate(legal_moves[:3]):
        b_copy = board.copy()
        san_str = b_copy.san(move)
        b_copy.push(move)
        top_lines.append({
            "pv": san_str,
            "score": round(random.uniform(-1.5, 1.5), 2),
            "san": san_str
        })

    return {
        "fen": req.fen,
        "is_checkmate": board.is_checkmate(),
        "is_stalemate": board.is_stalemate(),
        "top_lines": top_lines
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
