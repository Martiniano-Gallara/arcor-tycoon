/**
 * ProceduralMusic: Generador procedural de música nostálgica y ambientación rural.
 * 100% Web Audio API nativo. Cero archivos MP3 descargados.
 */
export class ProceduralMusic {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private isPlaying: boolean = false;

  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private ambientGain: GainNode | null = null;

  // Secuenciador
  private tempoBpm: number = 74; // 74 BPM nostálgico pampeano
  private currentStep: number = 0;
  private stepIntervalTimer: any = null;

  // Ruido de viento continuo
  private windNode: AudioNode | null = null;

  // Progresión armónica nostálgica de 8 compases (frecuencias en Hz)
  private chordProgression: { bass: number; notes: number[] }[] = [
    // 1. Do Mayor (C)
    { bass: 130.81, notes: [261.63, 329.63, 392.00, 523.25] },
    // 2. Sol con bajo en Si (G/B)
    { bass: 123.47, notes: [246.94, 293.66, 392.00, 493.88] },
    // 3. La menor (Am)
    { bass: 110.00, notes: [220.00, 261.63, 329.63, 440.00] },
    // 4. Mi menor (Em)
    { bass: 82.41, notes: [164.81, 196.00, 246.94, 329.63] },
    // 5. Fa Mayor (F)
    { bass: 87.31, notes: [174.61, 220.00, 261.63, 349.23] },
    // 6. Do con bajo en Mi (C/E)
    { bass: 82.41, notes: [196.00, 261.63, 329.63, 392.00] },
    // 7. Re menor 7 (Dm7)
    { bass: 73.42, notes: [146.83, 174.61, 220.00, 261.63] },
    // 8. Sol 7 dominante (G7)
    { bass: 98.00, notes: [196.00, 246.94, 293.66, 349.23] }
  ];

  // Callbacks para avisar a la UI cuando cambie el estado
  public onStateChanged?: (muted: boolean) => void;
  private listeners: Set<(muted: boolean) => void> = new Set();

  constructor() {
    // Cargar preferencia guardada
    try {
      const savedMute = localStorage.getItem('arcor_music_muted');
      if (savedMute !== null) {
        this.isMuted = savedMute === 'true';
      }
    } catch {
      this.isMuted = false;
    }
  }

  /**
   * Suscribirse a cambios en el estado de silencio de la música
   */
  public subscribe(cb: (muted: boolean) => void): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  /**
   * Inicializa el AudioContext con la primera interacción del usuario
   */
  public initContext(): void {
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtxClass();

      // Master Gain
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 1, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      // Music Gain (volumen suave de fondo)
      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(0.28, this.ctx.currentTime);
      this.musicGain.connect(this.masterGain);

      // Ambient Gain (brisa suave)
      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.setValueAtTime(0.06, this.ctx.currentTime);
      this.ambientGain.connect(this.masterGain);

      this.startAmbientWind();
    }

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  /**
   * Comienza la reproducción de la melodía procedural
   */
  public start(): void {
    this.initContext();
    if (this.isPlaying) return;
    this.isPlaying = true;

    const secondsPerBeat = 60 / this.tempoBpm; // ~0.81s por negra
    const stepDurationMs = (secondsPerBeat / 2) * 1000; // Corcheas (~405ms)

    this.currentStep = 0;
    this.stepIntervalTimer = setInterval(() => {
      this.tickSequencer();
    }, stepDurationMs);
  }

  public stop(): void {
    this.isPlaying = false;
    if (this.stepIntervalTimer) {
      clearInterval(this.stepIntervalTimer);
      this.stepIntervalTimer = null;
    }
  }

  public toggleMute(): boolean {
    return this.setMuted(!this.isMuted);
  }

  public setMuted(muted: boolean): boolean {
    this.isMuted = muted;
    try {
      localStorage.setItem('arcor_music_muted', String(this.isMuted));
    } catch {}

    if (this.isMuted) {
      // Silenciar: rampa suave a 0
      if (this.ctx && this.masterGain) {
        const now = this.ctx.currentTime;
        this.masterGain.gain.cancelScheduledValues(now);
        this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
        this.masterGain.gain.linearRampToValueAtTime(0, now + 0.15);
      }
    } else {
      // Activar: inicializar contexto, reanudar si estaba suspendido y rampa suave a 1
      this.initContext();
      if (this.ctx && this.masterGain) {
        if (this.ctx.state === 'suspended') {
          this.ctx.resume().catch(() => {});
        }
        const now = this.ctx.currentTime;
        this.masterGain.gain.cancelScheduledValues(now);
        this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
        this.masterGain.gain.linearRampToValueAtTime(1, now + 0.15);
      }
      if (!this.isPlaying) {
        this.start();
      }
    }

    if (this.onStateChanged) {
      this.onStateChanged(this.isMuted);
    }
    this.listeners.forEach(cb => cb(this.isMuted));

    return this.isMuted;
  }

  public setVolume(volume: number): void {
    const clamped = Math.max(0, Math.min(1, volume));
    this.initContext();
    if (this.ctx && this.musicGain) {
      const now = this.ctx.currentTime;
      this.musicGain.gain.cancelScheduledValues(now);
      this.musicGain.gain.linearRampToValueAtTime(clamped * 0.35, now + 0.1);
    }
  }

  public playPreview(): void {
    this.initContext();
    if (!this.ctx || !this.musicGain) return;
    const now = this.ctx.currentTime;
    this.playPluckNote(261.63, now, 0.45); // Do
    this.playPluckNote(329.63, now + 0.15, 0.45); // Mi
    this.playPluckNote(392.00, now + 0.30, 0.5); // Sol
    this.playPluckNote(523.25, now + 0.45, 0.55); // Do agudo
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Secuenciador rítmico de acordes y arpegios
   */
  private tickSequencer(): void {
    if (!this.ctx || !this.musicGain || this.isMuted) return;

    const barIndex = Math.floor(this.currentStep / 8) % this.chordProgression.length;
    const subStep = this.currentStep % 8; // 8 corcheas por compás (4/4)
    const chord = this.chordProgression[barIndex];

    const now = this.ctx.currentTime;

    // Nota de bajo acústico en tiempos fuertes (subStep 0 y 4)
    if (subStep === 0) {
      this.playBassNote(chord.bass, now, 0.9);
    } else if (subStep === 4) {
      this.playBassNote(chord.bass * 1.5, now, 0.5); // Quinta suave
    }

    // Arpegio estilo guitarra campestre / piano vertical
    // Patrón de arpegio punteado: 0: Nota1, 1: Nota2, 2: Nota3, 3: Nota4, 4: Nota3, 5: Nota2...
    const noteIndices = [0, 1, 2, 3, 2, 1, 2, 0];
    const noteIdx = noteIndices[subStep] % chord.notes.length;
    const noteFreq = chord.notes[noteIdx];

    // Variación sutil de octava o acento
    const velocity = subStep === 0 || subStep === 4 ? 0.35 : 0.22;
    this.playPluckNote(noteFreq, now, velocity);

    this.currentStep = (this.currentStep + 1) % (this.chordProgression.length * 8);
  }

  /**
   * Sintetiza una nota pulsada suave (estilo guitarra de cuerdas de nylon / piano nostálgico)
   */
  private playPluckNote(freq: number, startTime: number, velocity: number): void {
    if (!this.ctx || !this.musicGain) return;

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const noteGain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    // Filtro cálido paso-bajo con resonancia moderada
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(850, startTime);
    filter.frequency.exponentialRampToValueAtTime(320, startTime + 0.6);
    filter.Q.value = 2.0;

    // Combinación armónica rica y dulce
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(freq, startTime);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq * 2, startTime); // Armónico sutil
    const osc2Gain = this.ctx.createGain();
    osc2Gain.gain.value = 0.35;
    osc2.connect(osc2Gain);
    osc2Gain.connect(filter);

    osc1.connect(filter);
    filter.connect(noteGain);
    noteGain.connect(this.musicGain);

    // Envolvente de volumen tipo pulsación acústica
    noteGain.gain.setValueAtTime(0, startTime);
    noteGain.gain.linearRampToValueAtTime(velocity, startTime + 0.015);
    noteGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.7);

    osc1.start(startTime);
    osc2.start(startTime);
    osc1.stop(startTime + 0.72);
    osc2.stop(startTime + 0.72);
  }

  /**
   * Nota de bajo acústico redonda y profunda
   */
  private playBassNote(freq: number, startTime: number, velocity: number): void {
    if (!this.ctx || !this.musicGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(260, startTime);

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, startTime);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicGain);

    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(velocity * 0.45, startTime + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 1.2);

    osc.start(startTime);
    osc.stop(startTime + 1.25);
  }

  /**
   * Generador continuo de brisa de campo pampeana
   */
  private startAmbientWind(): void {
    if (!this.ctx || !this.ambientGain || this.windNode) return;

    // Buffer de 2 segundos de ruido blanco
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    // Filtro pasa banda para crear el sonido del viento
    const bandpass = this.ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.setValueAtTime(380, this.ctx.currentTime);
    bandpass.Q.setValueAtTime(1.8, this.ctx.currentTime);

    // LFO para modular la brisa lentamente
    const lfo = this.ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.2, this.ctx.currentTime); // Ciclo de 5 segundos
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(120, this.ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(bandpass.frequency);

    whiteNoise.connect(bandpass);
    bandpass.connect(this.ambientGain);

    whiteNoise.start();
    lfo.start();

    this.windNode = whiteNoise;
  }
}

export const proceduralMusic = new ProceduralMusic();
