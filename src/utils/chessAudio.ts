/**
 * Official Lichess sound effects player with Web Audio API fallback.
 */

class ChessAudioEngine {
  private enabled: boolean = true;
  private moveAudio: HTMLAudioElement | null = null;
  private captureAudio: HTMLAudioElement | null = null;
  private checkAudio: HTMLAudioElement | null = null;
  private audioContext: AudioContext | null = null;

  constructor() {
    this.initAudio();
  }

  private initAudio() {
    if (typeof window === 'undefined') return;

    try {
      this.moveAudio = new Audio('https://lichess1.org/assets/sound/standard/Move.mp3');
      this.captureAudio = new Audio('https://lichess1.org/assets/sound/standard/Capture.mp3');
      this.checkAudio = new Audio('https://lichess1.org/assets/sound/standard/Check.mp3');

      // Preload
      this.moveAudio.preload = 'auto';
      this.captureAudio.preload = 'auto';
      this.checkAudio.preload = 'auto';
    } catch {
      // Ignore if Audio not available
    }
  }

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioContext) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.audioContext = new AudioContextClass();
      }
    }
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume().catch(() => {});
    }
    return this.audioContext;
  }

  private playWebAudioFallback(type: 'move' | 'capture' | 'check') {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'move') {
        // Crisp wooden tap
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(140, now + 0.08);
        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
        osc.start(now);
        osc.stop(now + 0.09);
      } else if (type === 'capture') {
        // Deep solid capture thud
        osc.type = 'sine';
        osc.frequency.setValueAtTime(450, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.12);
        gain.gain.setValueAtTime(0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.13);
        osc.start(now);
        osc.stop(now + 0.13);
      } else if (type === 'check') {
        // Resonant dual-tone chime
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now); // A5
        osc.frequency.exponentialRampToValueAtTime(440, now + 0.25);
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.26);
        osc.start(now);
        osc.stop(now + 0.26);
      }
    } catch {
      // Audio fallback fail safe
    }
  }

  public setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public playMove() {
    if (!this.enabled) return;
    if (this.moveAudio) {
      this.moveAudio.currentTime = 0;
      this.moveAudio.play().catch(() => {
        this.playWebAudioFallback('move');
      });
    } else {
      this.playWebAudioFallback('move');
    }
  }

  public playCapture() {
    if (!this.enabled) return;
    if (this.captureAudio) {
      this.captureAudio.currentTime = 0;
      this.captureAudio.play().catch(() => {
        this.playWebAudioFallback('capture');
      });
    } else {
      this.playWebAudioFallback('capture');
    }
  }

  public playCheck() {
    if (!this.enabled) return;
    if (this.checkAudio) {
      this.checkAudio.currentTime = 0;
      this.checkAudio.play().catch(() => {
        this.playWebAudioFallback('check');
      });
    } else {
      this.playWebAudioFallback('check');
    }
  }
}

export const chessAudio = new ChessAudioEngine();
