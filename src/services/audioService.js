import { chessAudio } from '../utils/chessAudio';

class AudioService {
  constructor() {
    this.muted = false;
  }

  set Muted(val) {
    this.muted = val;
    chessAudio.setEnabled(!val);
  }

  get Muted() {
    return this.muted;
  }

  playMove() {
    if (this.muted) return;
    chessAudio.playMove();
  }

  playCapture() {
    if (this.muted) return;
    chessAudio.playCapture();
  }

  playCheck() {
    if (this.muted) return;
    chessAudio.playCheck();
  }

  playCastle() {
    if (this.muted) return;
    chessAudio.playMove();
  }

  playPromote() {
    if (this.muted) return;
    chessAudio.playMove();
  }

  playGameEnd() {
    if (this.muted) return;
    chessAudio.playGameEnd();
  }

  playIncorrect() {
    if (this.muted) return;
    chessAudio.playIncorrect();
  }
}

export const audio = new AudioService();
