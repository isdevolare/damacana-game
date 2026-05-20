'use client';

import type * as ToneNS from 'tone';

type ToneModule = typeof ToneNS;

interface Layer {
  enabled: boolean;
  setEnabled: (b: boolean) => void;
}

class AudioEngine {
  private Tone: ToneModule | null = null;
  private started = false;
  private masterGain: any = null;
  private musicGain: any = null;
  private sfxGain: any = null;
  private layers: Layer[] = [];
  private currentLevel = 0;
  private settings = { master: 0.7, music: 0.6, sfx: 0.8, muted: false };

  async init() {
    if (this.Tone) return;
    const T = await import('tone');
    this.Tone = T;
  }

  async start(level: number, settings: { master: number; music: number; sfx: number; muted: boolean }) {
    await this.init();
    if (!this.Tone) return;
    this.settings = settings;
    if (this.started) {
      this.setLevel(level);
      return;
    }
    await this.Tone.start();

    this.masterGain = new this.Tone.Gain(settings.muted ? 0 : settings.master).toDestination();
    this.musicGain = new this.Tone.Gain(settings.music).connect(this.masterGain);
    this.sfxGain = new this.Tone.Gain(settings.sfx).connect(this.masterGain);

    this.buildLayers();
    this.Tone.Transport.bpm.value = 78;
    this.Tone.Transport.start();
    this.setLevel(level);
    this.started = true;
  }

  private buildLayers() {
    if (!this.Tone || !this.musicGain) return;
    const T = this.Tone;
    const out = this.musicGain;

    // Layer 0: sparse pad
    const padGain = new T.Gain(0).connect(out);
    const padReverb = new T.Reverb({ decay: 12, wet: 0.6 }).connect(padGain);
    const pad = new T.PolySynth(T.Synth, {
      oscillator: { type: 'sine' },
      envelope: { attack: 4, decay: 1, sustain: 0.8, release: 6 },
    }).connect(padReverb);
    const padLoop = new T.Loop((t: number) => {
      pad.triggerAttackRelease(['C2', 'G2', 'Eb3'], '4m', t);
    }, '4m').start(0);

    // Layer 1: slow bass pulse
    const bassGain = new T.Gain(0).connect(out);
    const bass = new T.MonoSynth({
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.05, decay: 0.5, sustain: 0.2, release: 0.5 },
      filter: { Q: 2, type: 'lowpass', rolloff: -24 },
      filterEnvelope: { attack: 0.05, decay: 0.4, sustain: 0.1, release: 0.4, baseFrequency: 200, octaves: 2 },
    }).connect(bassGain);
    const bassLoop = new T.Loop((t: number) => {
      bass.triggerAttackRelease('C1', '8n', t);
    }, '2n').start(0);

    // Layer 2: ambient arp
    const arpGain = new T.Gain(0).connect(out);
    const arpFilter = new T.Filter(2000, 'lowpass').connect(arpGain);
    const arpDelay = new T.FeedbackDelay('8n.', 0.4).connect(arpFilter);
    const arp = new T.Synth({
      oscillator: { type: 'sine' },
      envelope: { attack: 0.01, decay: 0.2, sustain: 0.1, release: 0.4 },
    }).connect(arpDelay);
    const arpNotes = ['C4', 'Eb4', 'G4', 'Bb4', 'C5', 'Bb4', 'G4', 'Eb4'];
    let arpStep = 0;
    const arpLoop = new T.Loop((t: number) => {
      arp.triggerAttackRelease(arpNotes[arpStep % arpNotes.length], '16n', t);
      arpStep++;
    }, '16n').start(0);

    // Layer 3: cyberpunk lead
    const leadGain = new T.Gain(0).connect(out);
    const leadReverb = new T.Reverb({ decay: 3, wet: 0.4 }).connect(leadGain);
    const lead = new T.MonoSynth({
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.05, decay: 0.3, sustain: 0.3, release: 0.6 },
      filter: { Q: 3, type: 'lowpass' },
      filterEnvelope: { attack: 0.05, decay: 0.4, sustain: 0.4, release: 0.5, baseFrequency: 600, octaves: 3 },
    }).connect(leadReverb);
    const leadNotes = ['C3', 'Eb3', 'G3', 'C4', 'Bb3', 'G3', 'Eb3', 'F3'];
    let leadStep = 0;
    const leadLoop = new T.Loop((t: number) => {
      lead.triggerAttackRelease(leadNotes[leadStep % leadNotes.length], '4n', t);
      leadStep++;
    }, '2n').start(0);

    // Layer 4: glitch percussion
    const percGain = new T.Gain(0).connect(out);
    const noise = new T.NoiseSynth({
      noise: { type: 'white' },
      envelope: { attack: 0.001, decay: 0.05, sustain: 0 },
    }).connect(percGain);
    const kick = new T.MembraneSynth({ pitchDecay: 0.05, octaves: 6 }).connect(percGain);
    let percStep = 0;
    const percLoop = new T.Loop((t: number) => {
      const m = percStep % 8;
      if (m === 0 || m === 4) kick.triggerAttackRelease('C2', '8n', t);
      if (m === 2 || m === 6 || m === 7) noise.triggerAttackRelease('16n', t);
      percStep++;
    }, '8n').start(0);

    // Layer 5: distorted sub-bass
    const subGain = new T.Gain(0).connect(out);
    const subDist = new T.Distortion(0.6).connect(subGain);
    const sub = new T.MonoSynth({
      oscillator: { type: 'square' },
      envelope: { attack: 0.05, decay: 0.4, sustain: 0.6, release: 0.6 },
      filter: { Q: 5, type: 'lowpass' },
      filterEnvelope: { attack: 0.1, decay: 0.6, sustain: 0.4, release: 0.5, baseFrequency: 80, octaves: 2 },
    }).connect(subDist);
    const subLoop = new T.Loop((t: number) => {
      sub.triggerAttackRelease('C1', '4n', t);
    }, '1m').start(0);

    // Layer 6: chaos — bitcrushed everything
    const chaosGain = new T.Gain(0).connect(out);
    const crusher = new T.BitCrusher(4).connect(chaosGain);
    const chaosSynth = new T.PolySynth(T.Synth, {
      oscillator: { type: 'square' },
      envelope: { attack: 0.01, decay: 0.1, sustain: 0.3, release: 0.3 },
    }).connect(crusher);
    const chaosLoop = new T.Loop((t: number) => {
      const notes = ['C4', 'F#4', 'A4', 'C5'];
      chaosSynth.triggerAttackRelease(notes[Math.floor(Math.random() * notes.length)], '32n', t);
    }, '16n').start(0);

    const layerGains = [padGain, bassGain, arpGain, leadGain, percGain, subGain, chaosGain];
    this.layers = layerGains.map((g) => ({
      enabled: false,
      setEnabled: (b: boolean) => {
        g.gain.rampTo(b ? 0.6 : 0, 1.5);
      },
    }));
  }

  setLevel(level: number) {
    this.currentLevel = level;
    this.layers.forEach((l, i) => {
      l.setEnabled(i <= level);
    });
  }

  setSettings(settings: Partial<{ master: number; music: number; sfx: number; muted: boolean }>) {
    this.settings = { ...this.settings, ...settings };
    if (this.masterGain) {
      this.masterGain.gain.rampTo(this.settings.muted ? 0 : this.settings.master, 0.1);
    }
    if (this.musicGain) this.musicGain.gain.rampTo(this.settings.music, 0.1);
    if (this.sfxGain) this.sfxGain.gain.rampTo(this.settings.sfx, 0.1);
  }

  private get T() {
    return this.Tone;
  }

  // ---------- SFX ----------
  sfxTap(combo = 1) {
    if (!this.T || !this.sfxGain) return;
    const synth = new this.T.Synth({
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.001, decay: 0.08, sustain: 0, release: 0.05 },
    }).connect(this.sfxGain);
    const base = 320 + combo * 30;
    synth.frequency.setValueAtTime(base, this.T.now());
    synth.frequency.exponentialRampToValueAtTime(base / 2, this.T.now() + 0.08);
    synth.triggerAttackRelease(base, 0.08);
    setTimeout(() => synth.dispose(), 200);
  }

  sfxCrit() {
    if (!this.T || !this.sfxGain) return;
    const synth = new this.T.MetalSynth({
      envelope: { attack: 0.001, decay: 0.2, sustain: 0, release: 0.1 },
      harmonicity: 5,
      modulationIndex: 32,
      resonance: 4000,
      octaves: 1.5,
    } as any).connect(this.sfxGain);
    synth.triggerAttackRelease('C5', 0.1);
    setTimeout(() => synth.dispose(), 400);
  }

  sfxBossHit() {
    if (!this.T || !this.sfxGain) return;
    const m = new this.T.MembraneSynth({ pitchDecay: 0.04, octaves: 4 }).connect(this.sfxGain);
    m.triggerAttackRelease('C2', '16n');
    setTimeout(() => m.dispose(), 250);
  }

  sfxCombatHit(power = 1) {
    if (!this.T || !this.sfxGain) return;
    const s = new this.T.MonoSynth({
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.002, decay: 0.08, sustain: 0, release: 0.08 },
      filter: { Q: 4, type: 'lowpass' },
      filterEnvelope: { attack: 0.002, decay: 0.08, sustain: 0, release: 0.08, baseFrequency: 1400, octaves: -2 },
    }).connect(this.sfxGain);
    const note = power > 8 ? 'G3' : power > 3 ? 'E3' : 'C3';
    s.triggerAttackRelease(note, 0.09);
    setTimeout(() => s.dispose(), 280);
  }

  sfxCriticalRupture() {
    if (!this.T || !this.sfxGain) return;
    const now = this.T.now();
    const metal = new this.T.MetalSynth({
      envelope: { attack: 0.001, decay: 0.25, sustain: 0, release: 0.12 },
      harmonicity: 8,
      modulationIndex: 18,
      resonance: 2800,
      octaves: 2,
    } as any).connect(this.sfxGain);
    const sweep = new this.T.Synth({
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.01, decay: 0.22, sustain: 0, release: 0.16 },
    }).connect(this.sfxGain);
    sweep.frequency.setValueAtTime(1400, now);
    sweep.frequency.exponentialRampToValueAtTime(120, now + 0.16);
    sweep.triggerAttackRelease(1400, 0.2, now);
    metal.triggerAttackRelease('C5', 0.08, now);
    setTimeout(() => {
      metal.dispose();
      sweep.dispose();
    }, 600);
  }

  sfxPlayerHit() {
    if (!this.T || !this.sfxGain) return;
    const m = new this.T.MembraneSynth({ pitchDecay: 0.08, octaves: 3 }).connect(this.sfxGain);
    m.triggerAttackRelease('A1', '16n');
    setTimeout(() => m.dispose(), 260);
  }

  sfxBossDeath(mega = false) {
    if (!this.T || !this.sfxGain) return;
    const m = new this.T.MembraneSynth({ pitchDecay: 0.12, octaves: 8 }).connect(this.sfxGain);
    m.triggerAttackRelease(mega ? 'A1' : 'C2', mega ? '2n' : '4n');
    const noise = new this.T.NoiseSynth({
      noise: { type: 'white' },
      envelope: { attack: 0.01, decay: mega ? 0.8 : 0.3, sustain: 0 },
    }).connect(this.sfxGain);
    noise.triggerAttackRelease(mega ? '2n' : '4n');
    setTimeout(() => {
      m.dispose();
      noise.dispose();
    }, mega ? 1500 : 600);
  }

  sfxUpgrade() {
    if (!this.T || !this.sfxGain) return;
    const s = new this.T.Synth({
      oscillator: { type: 'sine' },
      envelope: { attack: 0.01, decay: 0.2, sustain: 0.1, release: 0.2 },
    }).connect(this.sfxGain);
    const now = this.T.now();
    s.triggerAttackRelease('C5', '16n', now);
    s.triggerAttackRelease('G5', '16n', now + 0.1);
    setTimeout(() => s.dispose(), 500);
  }

  sfxTreeUnlock() {
    if (!this.T || !this.sfxGain) return;
    const s = new this.T.PolySynth(this.T.Synth, {
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.01, decay: 0.3, sustain: 0.2, release: 0.4 },
    }).connect(this.sfxGain);
    const now = this.T.now();
    s.triggerAttackRelease('C5', '8n', now);
    s.triggerAttackRelease('E5', '8n', now + 0.12);
    s.triggerAttackRelease('G5', '4n', now + 0.24);
    setTimeout(() => s.dispose(), 1200);
  }

  sfxEvolution() {
    if (!this.T || !this.sfxGain) return;
    const noise = new this.T.NoiseSynth({
      noise: { type: 'pink' },
      envelope: { attack: 0.1, decay: 2.0, sustain: 0 },
    }).connect(this.sfxGain);
    const reverb = new this.T.Reverb({ decay: 4, wet: 0.8 }).connect(this.sfxGain);
    const sweep = new this.T.Synth({
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 1.5, decay: 0, sustain: 1, release: 1 },
    }).connect(reverb);
    const now = this.T.now();
    sweep.frequency.setValueAtTime(100, now);
    sweep.frequency.exponentialRampToValueAtTime(2000, now + 1.5);
    sweep.triggerAttackRelease(100, 2);
    noise.triggerAttackRelease(2);
    setTimeout(() => {
      sweep.dispose();
      noise.dispose();
      reverb.dispose();
    }, 3000);
  }

  sfxAbility() {
    if (!this.T || !this.sfxGain) return;
    const s = new this.T.MonoSynth({
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.01, decay: 0.4, sustain: 0, release: 0.3 },
      filter: { Q: 6, type: 'lowpass' },
      filterEnvelope: { attack: 0.01, decay: 0.3, sustain: 0, release: 0.3, baseFrequency: 4000, octaves: -4 },
    }).connect(this.sfxGain);
    s.triggerAttackRelease('C4', 0.4);
    setTimeout(() => s.dispose(), 800);
  }

  sfxEventDing() {
    if (!this.T || !this.sfxGain) return;
    const s = new this.T.Synth({
      oscillator: { type: 'sine' },
      envelope: { attack: 0.001, decay: 0.4, sustain: 0, release: 0.4 },
    }).connect(this.sfxGain);
    const now = this.T.now();
    s.triggerAttackRelease('E5', '16n', now);
    s.triggerAttackRelease('B5', '16n', now + 0.15);
    setTimeout(() => s.dispose(), 700);
  }

  sfxResearchCollected() {
    if (!this.T || !this.sfxGain) return;
    const synth = new this.T.PolySynth(this.T.Synth, {
      oscillator: { type: 'sine' },
      envelope: { attack: 0.01, decay: 0.18, sustain: 0.1, release: 0.5 },
    }).connect(this.sfxGain);
    const now = this.T.now();
    synth.triggerAttackRelease(['C5', 'G5'], '16n', now);
    synth.triggerAttackRelease(['E5', 'B5'], '8n', now + 0.14);
    setTimeout(() => synth.dispose(), 900);
  }

  sfxPrestige() {
    if (!this.T || !this.sfxGain) return;
    const s = new this.T.Synth({
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.05, decay: 2, sustain: 0, release: 0.5 },
    }).connect(this.sfxGain);
    const now = this.T.now();
    s.frequency.setValueAtTime(2000, now);
    s.frequency.exponentialRampToValueAtTime(40, now + 2);
    s.triggerAttackRelease(2000, 2);
    setTimeout(() => {
      const chord = new this.T!.PolySynth(this.T!.Synth, {
        oscillator: { type: 'sine' },
        envelope: { attack: 0.05, decay: 2, sustain: 0.3, release: 2 },
      }).connect(this.sfxGain!);
      chord.triggerAttackRelease(['C3', 'Eb3', 'G3', 'Bb3'], '2n');
      setTimeout(() => chord.dispose(), 3000);
    }, 2100);
    setTimeout(() => s.dispose(), 2500);
  }
}

export const audio = new AudioEngine();
