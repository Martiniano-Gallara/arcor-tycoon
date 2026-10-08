import { getSharedAudioContext } from './AudioContextHolder.ts';

/**
 * SoundFXManager: Síntesis de audio procedural avanzada mediante Web Audio API.
 * 100% libre de dependencias externas y sin consumo de ancho de banda.
 */
export class SoundFXManager {
  private ctx: AudioContext | null = null;
  private sfxVolume: number = 0.85;
  private isMuted: boolean = false;

  // Nodos de ambiente procedural
  private isNightAmbient: boolean = false;
  private ambientTimer: any = null;

  constructor() {
    try {
      const savedMute = localStorage.getItem('arcor_music_muted');
      if (savedMute !== null) {
        this.isMuted = savedMute === 'true';
      }
    } catch {
      this.isMuted = false;
    }
  }

  private initContext(): void {
    this.ctx = getSharedAudioContext();
  }

  public setVolume(vol: number): void {
    this.sfxVolume = Math.max(0, Math.min(1, vol));
  }

  public getVolume(): number {
    return this.sfxVolume;
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  /**
   * 1. Estallido táctil de burbuja de recompensa ("Juice" / Pop armónico)
   */
  public playBubblePop(): void {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // Pop percusivo
    const popOsc = this.ctx.createOscillator();
    const popGain = this.ctx.createGain();

    popOsc.type = 'sine';
    popOsc.frequency.setValueAtTime(650, now);
    popOsc.frequency.exponentialRampToValueAtTime(140, now + 0.055);

    popGain.gain.setValueAtTime(this.sfxVolume * 0.45, now);
    popGain.gain.exponentialRampToValueAtTime(0.001, now + 0.055);

    popOsc.connect(popGain);
    popGain.connect(this.ctx.destination);

    popOsc.start(now);
    popOsc.stop(now + 0.06);

    // Chime cristalino resonante ascendente (Do Mayor arpegio rápido)
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const chimeOsc = this.ctx.createOscillator();
      const chimeGain = this.ctx.createGain();

      chimeOsc.type = 'triangle';
      chimeOsc.frequency.setValueAtTime(freq, now + 0.02 + idx * 0.035);

      chimeGain.gain.setValueAtTime(0.001, now + 0.02 + idx * 0.035);
      chimeGain.gain.linearRampToValueAtTime(this.sfxVolume * 0.25, now + 0.02 + idx * 0.035 + 0.02);
      chimeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.02 + idx * 0.035 + 0.35);

      chimeOsc.connect(chimeGain);
      chimeGain.connect(this.ctx.destination);

      chimeOsc.start(now + 0.02 + idx * 0.035);
      chimeOsc.stop(now + 0.02 + idx * 0.035 + 0.38);
    });
  }

  /**
   * 2. Bocina vintage de camión de reparto 1950s (Doble tono F4 349Hz + A4 440Hz)
   */
  public playVintageHorn(): void {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const duration = 0.38;

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sawtooth';
    osc2.type = 'sawtooth';

    // Frecuencias características de bocinas Klaxon / Ford 1950
    osc1.frequency.setValueAtTime(349.23, now); // Fa4
    osc2.frequency.setValueAtTime(440.00, now); // La4

    // Filtro para sonido metálico de bocina antigua
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1400, now);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(this.sfxVolume * 0.4, now + 0.04);
    gain.gain.setValueAtTime(this.sfxVolume * 0.38, now + duration - 0.06);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + duration + 0.02);
    osc2.stop(now + duration + 0.02);
  }

  /**
   * 3. Silbido / Saludo de operario al tocarlo (Easter egg)
   */
  public playWorkerHello(): void {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // Doble silbido alegre ascendente
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now); // La5
    osc.frequency.exponentialRampToValueAtTime(1320, now + 0.08); // Mi6
    osc.frequency.setValueAtTime(1320, now + 0.12);
    osc.frequency.exponentialRampToValueAtTime(1760, now + 0.22); // La6

    gain.gain.setValueAtTime(this.sfxVolume * 0.28, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.26);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.28);
  }

  /**
   * 4. Bocanada de humo extra de chimenea (Easter egg)
   */
  public playChimneyPuff(): void {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.35;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(320, now);
    filter.frequency.linearRampToValueAtTime(180, now + 0.34);
    filter.Q.setValueAtTime(2.5, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(this.sfxVolume * 0.45, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(now);
    noise.stop(now + 0.36);
  }

  /**
   * 5. Lluvia de monedas doradas en cascada
   */
  public playCoinShower(): void {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const baseFreqs = [1046.5, 1174.6, 1318.5, 1567.9, 1760.0, 2093.0];
    const now = this.ctx.currentTime;

    for (let i = 0; i < 6; i++) {
      const delay = i * 0.065;
      const freq = baseFreqs[i % baseFreqs.length];

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + delay);

      gain.gain.setValueAtTime(0.001, now + delay);
      gain.gain.linearRampToValueAtTime(this.sfxVolume * 0.22, now + delay + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.22);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + delay);
      osc.stop(now + delay + 0.24);
    }
  }

  /**
   * 6. Arpegio festivo de victoria / hito mundial
   */
  public playVictoryArpeggio(): void {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const chords = [
      523.25, // C5
      659.25, // E5
      783.99, // G5
      1046.50, // C6
      1318.51  // E6
    ];

    const now = this.ctx.currentTime;

    chords.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0.001, now + idx * 0.08);
      gain.gain.linearRampToValueAtTime(this.sfxVolume * 0.3, now + idx * 0.08 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.55);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.6);
    });
  }

  /**
   * 7. Ambientación procedural de día y noche
   */
  public setAmbientEnvironment(isNight: boolean): void {
    if (this.isNightAmbient === isNight && this.ambientTimer) return;
    this.isNightAmbient = isNight;
    clearInterval(this.ambientTimer);

    if (this.isMuted) return;

    // Generar pequeños trinos o grillos procedurales periódicamente
    this.ambientTimer = setInterval(() => {
      if (this.isMuted || !this.ctx) return;
      if (this.isNightAmbient) {
        this.synthCricketChirp();
      } else {
        this.synthBirdChirp();
      }
    }, 4500 + Math.random() * 3500);
  }

  private synthBirdChirp(): void {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    const startF = 2400 + Math.random() * 400;
    osc.frequency.setValueAtTime(startF, now);
    osc.frequency.linearRampToValueAtTime(startF + 600, now + 0.06);
    osc.frequency.linearRampToValueAtTime(startF - 300, now + 0.12);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(this.sfxVolume * 0.08, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.16);
  }

  private synthCricketChirp(): void {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(4500, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(this.sfxVolume * 0.05, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.09);
  }

  // =========================================================================
  // SPRINT 8: AUDIO PROCEDURAL MATCH-3 "ARCOR CRUSH"
  // =========================================================================

  /** Deslizamiento suave de caramelo */
  public playCandySwap(): void {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(420, now);
    osc.frequency.exponentialRampToValueAtTime(620, now + 0.07);

    gain.gain.setValueAtTime(this.sfxVolume * 0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.09);
  }

  /** Match de caramelos con tono ascendente según el combo */
  public playCandyMatch(comboLevel: number = 1): void {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const baseFreqs = [523.25, 587.33, 659.25, 698.46, 783.99, 880.0, 987.77, 1046.5];
    const pitchIdx = Math.min(baseFreqs.length - 1, comboLevel - 1);
    const f = baseFreqs[pitchIdx];

    // Pop resonante dulce
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(f, now);
    osc1.frequency.exponentialRampToValueAtTime(f * 1.5, now + 0.12);

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(f * 2, now);
    osc2.frequency.exponentialRampToValueAtTime(f * 2.5, now + 0.12);

    gain.gain.setValueAtTime(this.sfxVolume * 0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.18);
    osc2.stop(now + 0.18);
  }

  /** Detonación de Caramelo Rayado (haz láser de fila/columna) */
  public playStripedBlast(): void {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(900, now);
    osc.frequency.exponentialRampToValueAtTime(150, now + 0.28);

    gain.gain.setValueAtTime(this.sfxVolume * 0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.32);
  }

  /** Explosión de Bomba de Chocolate 3x3 */
  public playBombExplode(): void {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // Golpe grave profundo
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.35);

    gain.gain.setValueAtTime(this.sfxVolume * 0.55, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.4);
  }

  /** Rayos multicolor del Rocklet Disco */
  public playDiscoZap(): void {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const arpeggio = [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98];

    arpeggio.forEach((f, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, now + idx * 0.04);

      gain.gain.setValueAtTime(0.001, now + idx * 0.04);
      gain.gain.linearRampToValueAtTime(this.sfxVolume * 0.3, now + idx * 0.04 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + idx * 0.04);
      osc.stop(now + idx * 0.04 + 0.28);
    });
  }

  /** Golpe de martillo de caramelo */
  public playBoosterHammer(): void {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.15);

    gain.gain.setValueAtTime(this.sfxVolume * 0.6, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.18);
  }

  /** Victoria de nivel con fanfarria de azúcar */
  public playLevelWin(): void {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const chords = [523.25, 659.25, 783.99, 1046.50];

    chords.forEach((f, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now + idx * 0.08);

      gain.gain.setValueAtTime(0.001, now + idx * 0.08);
      gain.gain.linearRampToValueAtTime(this.sfxVolume * 0.35, now + idx * 0.08 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.6);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.65);
    });
  }
}

export const soundFX = new SoundFXManager();

