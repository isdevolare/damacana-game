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
  private starting: Promise<void> | null = null;
  private loops: any[] = [];
  private lastScheduledTimes = new Map<string, number>();
  private lastArpTime = 0;
  private readonly scheduleEpsilon = 0.001;

  async init() {
    if (this.Tone) return;
    const T = await import('tone');
    this.Tone = T;
  }

  async start(level: number, settings: { master: number; music: number; sfx: number; muted: boolean }) {
    if (this.starting) {
      await this.starting;
      this.setSettings(settings);
      this.setLevel(level);
      return;
    }
    this.starting = this.startInternal(level, settings);
    try {
      await this.starting;
    } finally {
      this.starting = null;
    }
  }

  private async startInternal(level: number, settings: { master: number; music: number; sfx: number; muted: boolean }) {
    await this.init();
    if (!this.Tone) return;
    this.settings = settings;
    if (this.started) {
      await this.resumeContext();
      this.setLevel(level);
      return;
    }
    await this.Tone.start();

    this.masterGain = new this.Tone.Gain(settings.muted ? 0 : settings.master).toDestination();
    this.musicGain = new this.Tone.Gain(settings.music).connect(this.masterGain);
    this.sfxGain = new this.Tone.Gain(settings.sfx).connect(this.masterGain);

    this.buildLayers();
    this.Tone.Transport.bpm.value = 78;
    this.safeTransportStart();
    this.setLevel(level);
    this.started = true;
  }

  async unlock(level: number, settings: { master: number; music: number; sfx: number; muted: boolean }) {
    await this.start(level, settings);
    await this.resumeContext();
    return this.isUnlocked();
  }

  isUnlocked() {
    const state = this.getContextState();
    return this.started && (!state || state === 'running');
  }

  private async resumeContext() {
    const context = (this.Tone as any)?.context ?? (this.Tone as any)?.getContext?.().rawContext;
    if (context?.state === 'suspended') {
      await context.resume();
    }
  }

  private getContextState() {
    return (this.Tone as any)?.context?.state ?? (this.Tone as any)?.getContext?.().rawContext?.state;
  }

  private buildLayers() {
    if (!this.Tone || !this.musicGain) return;
    this.stopLoops();
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
      this.safeTrigger(pad, ['C2', 'G2', 'Eb3'], '4m', t, 'pad');
    }, '4m');
    this.safeStartLoop(padLoop);

    // Layer 1: slow bass pulse
    const bassGain = new T.Gain(0).connect(out);
    const bass = new T.MonoSynth({
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.05, decay: 0.5, sustain: 0.2, release: 0.5 },
      filter: { Q: 2, type: 'lowpass', rolloff: -24 },
      filterEnvelope: { attack: 0.05, decay: 0.4, sustain: 0.1, release: 0.4, baseFrequency: 200, octaves: 2 },
    }).connect(bassGain);
    const bassLoop = new T.Loop((t: number) => {
      this.safeTrigger(bass, 'C1', '8n', t, 'bass');
    }, '2n');
    this.safeStartLoop(bassLoop);

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
      const safeTime = this.safeScheduleTime('arp', Math.max(t, this.lastArpTime + this.scheduleEpsilon));
      this.lastArpTime = safeTime;
      this.safeTrigger(arp, arpNotes[arpStep % arpNotes.length], '16n', safeTime, 'arp');
      arpStep++;
    }, '16n');
    this.safeStartLoop(arpLoop);

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
      this.safeTrigger(lead, leadNotes[leadStep % leadNotes.length], '4n', t, 'lead');
      leadStep++;
    }, '2n');
    this.safeStartLoop(leadLoop);

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
      if (m === 0 || m === 4) this.safeTrigger(kick, 'C2', '8n', t, 'kick');
      if (m === 2 || m === 6 || m === 7) this.safeNoiseTrigger(noise, '16n', t, 'noise');
      percStep++;
    }, '8n');
    this.safeStartLoop(percLoop);

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
      this.safeTrigger(sub, 'C1', '4n', t, 'sub');
    }, '1m');
    this.safeStartLoop(subLoop);

    // Layer 6: chaos — bitcrushed everything
    const chaosGain = new T.Gain(0).connect(out);
    const crusher = new T.BitCrusher(4).connect(chaosGain);
    const chaosSynth = new T.PolySynth(T.Synth, {
      oscillator: { type: 'square' },
      envelope: { attack: 0.01, decay: 0.1, sustain: 0.3, release: 0.3 },
    }).connect(crusher);
    const chaosLoop = new T.Loop((t: number) => {
      const notes = ['C4', 'F#4', 'A4', 'C5'];
      this.safeTrigger(chaosSynth, notes[Math.floor(Math.random() * notes.length)], '32n', t, 'chaos');
    }, '16n');
    this.safeStartLoop(chaosLoop);

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

  private safeScheduleTime(key: string, requested?: number) {
    const now = this.T?.now?.() ?? 0;
    const last = this.lastScheduledTimes.get(key) ?? 0;
    const safe = Math.max(requested ?? now, now, last + this.scheduleEpsilon);
    this.lastScheduledTimes.set(key, safe);
    return safe;
  }

  private safeTrigger(synth: any, note: any, duration: any, time?: any, key = 'sfx') {
    try {
      const safeTime = typeof time === 'number' ? this.safeScheduleTime(key, time) : this.safeScheduleTime(key);
      synth.triggerAttackRelease(note, duration, safeTime);
    } catch (error) {
      this.disableFailedSound(key, error);
    }
  }

  private safeNoiseTrigger(synth: any, duration: any, time?: any, key = 'noise') {
    try {
      const safeTime = typeof time === 'number' ? this.safeScheduleTime(key, time) : this.safeScheduleTime(key);
      synth.triggerAttackRelease(duration, safeTime);
    } catch (error) {
      this.disableFailedSound(key, error);
    }
  }

  private safeTransportStart() {
    if (!this.Tone) return;
    try {
      if (this.Tone.Transport.state !== 'started') this.Tone.Transport.start();
    } catch (error) {
      this.disableFailedSound('transport', error);
    }
  }

  private safeStartLoop(loop: any) {
    try {
      if (loop.state !== 'started') loop.start(0);
      this.loops.push(loop);
    } catch (error) {
      this.disableFailedSound('loop', error);
      try {
        loop.dispose?.();
      } catch {
        // Ignore disposal failures from Tone internals.
      }
    }
  }

  private stopLoops() {
    for (const loop of this.loops) {
      try {
        loop.stop?.();
        loop.dispose?.();
      } catch {
        // Ignore stale Tone loop disposal failures.
      }
    }
    this.loops = [];
    this.lastScheduledTimes.clear();
    this.lastArpTime = 0;
  }

  private disableFailedSound(key: string, error: unknown) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`AudioEngine skipped ${key}`, error);
    }
  }

  // ---------- SFX ----------
  sfxTap(combo = 1) {
    if (!this.T || !this.sfxGain) return;
    try {
      const synth = new this.T.Synth({
        oscillator: { type: 'triangle' },
        envelope: { attack: 0.001, decay: 0.08, sustain: 0, release: 0.05 },
      }).connect(this.sfxGain);
      const base = 320 + combo * 30;
      const now = this.safeScheduleTime('tap');
      synth.frequency.setValueAtTime(base, now);
      synth.frequency.exponentialRampToValueAtTime(base / 2, now + 0.08);
      this.safeTrigger(synth, base, 0.08, now, 'tap');
      setTimeout(() => synth.dispose(), 200);
    } catch (error) {
      this.disableFailedSound('tap', error);
    }
  }

  sfxCrit() {
    if (!this.T || !this.sfxGain) return;
    try {
      const synth = new this.T.MetalSynth({
        envelope: { attack: 0.001, decay: 0.2, sustain: 0, release: 0.1 },
        harmonicity: 5,
        modulationIndex: 32,
        resonance: 4000,
        octaves: 1.5,
      } as any).connect(this.sfxGain);
      this.safeTrigger(synth, 'C5', 0.1, undefined, 'crit');
      setTimeout(() => synth.dispose(), 400);
    } catch (error) {
      this.disableFailedSound('crit', error);
    }
  }

  sfxBossHit() {
    if (!this.T || !this.sfxGain) return;
    try {
      const m = new this.T.MembraneSynth({ pitchDecay: 0.04, octaves: 4 }).connect(this.sfxGain);
      this.safeTrigger(m, 'C2', '16n', undefined, 'bossHit');
      setTimeout(() => m.dispose(), 250);
    } catch (error) {
      this.disableFailedSound('bossHit', error);
    }
  }

  sfxCombatHit(power = 1) {
    if (!this.T || !this.sfxGain) return;
    try {
      const s = new this.T.MonoSynth({
        oscillator: { type: 'triangle' },
        envelope: { attack: 0.002, decay: 0.08, sustain: 0, release: 0.08 },
        filter: { Q: 4, type: 'lowpass' },
        filterEnvelope: { attack: 0.002, decay: 0.08, sustain: 0, release: 0.08, baseFrequency: 1400, octaves: -2 },
      }).connect(this.sfxGain);
      const note = power > 8 ? 'G3' : power > 3 ? 'E3' : 'C3';
      this.safeTrigger(s, note, 0.09, undefined, 'combatHit');
      setTimeout(() => s.dispose(), 280);
    } catch (error) {
      this.disableFailedSound('combatHit', error);
    }
  }

  sfxCriticalRupture() {
    if (!this.T || !this.sfxGain) return;
    try {
      const now = this.safeScheduleTime('criticalRupture');
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
      this.safeTrigger(sweep, 1400, 0.2, now, 'criticalSweep');
      this.safeTrigger(metal, 'C5', 0.08, now, 'criticalMetal');
      setTimeout(() => {
        metal.dispose();
        sweep.dispose();
      }, 600);
    } catch (error) {
      this.disableFailedSound('criticalRupture', error);
    }
  }

  sfxPlayerHit() {
    if (!this.T || !this.sfxGain) return;
    try {
      const m = new this.T.MembraneSynth({ pitchDecay: 0.08, octaves: 3 }).connect(this.sfxGain);
      this.safeTrigger(m, 'A1', '16n', undefined, 'playerHit');
      setTimeout(() => m.dispose(), 260);
    } catch (error) {
      this.disableFailedSound('playerHit', error);
    }
  }

  sfxBossDeath(mega = false) {
    if (!this.T || !this.sfxGain) return;
    try {
      const m = new this.T.MembraneSynth({ pitchDecay: 0.12, octaves: 8 }).connect(this.sfxGain);
      this.safeTrigger(m, mega ? 'A1' : 'C2', mega ? '2n' : '4n', undefined, 'bossDeath');
      const noise = new this.T.NoiseSynth({
        noise: { type: 'white' },
        envelope: { attack: 0.01, decay: mega ? 0.8 : 0.3, sustain: 0 },
      }).connect(this.sfxGain);
      this.safeNoiseTrigger(noise, mega ? '2n' : '4n', undefined, 'bossDeathNoise');
      setTimeout(() => {
        m.dispose();
        noise.dispose();
      }, mega ? 1500 : 600);
    } catch (error) {
      this.disableFailedSound('bossDeath', error);
    }
  }

  sfxUpgrade() {
    if (!this.T || !this.sfxGain) return;
    try {
      const s = new this.T.Synth({
        oscillator: { type: 'sine' },
        envelope: { attack: 0.01, decay: 0.2, sustain: 0.1, release: 0.2 },
      }).connect(this.sfxGain);
      const now = this.safeScheduleTime('upgrade');
      this.safeTrigger(s, 'C5', '16n', now, 'upgrade');
      this.safeTrigger(s, 'G5', '16n', now + 0.1, 'upgrade');
      setTimeout(() => s.dispose(), 500);
    } catch (error) {
      this.disableFailedSound('upgrade', error);
    }
  }

  sfxTreeUnlock() {
    if (!this.T || !this.sfxGain) return;
    try {
      const s = new this.T.PolySynth(this.T.Synth, {
        oscillator: { type: 'triangle' },
        envelope: { attack: 0.01, decay: 0.3, sustain: 0.2, release: 0.4 },
      }).connect(this.sfxGain);
      const now = this.safeScheduleTime('treeUnlock');
      this.safeTrigger(s, 'C5', '8n', now, 'treeUnlock');
      this.safeTrigger(s, 'E5', '8n', now + 0.12, 'treeUnlock');
      this.safeTrigger(s, 'G5', '4n', now + 0.24, 'treeUnlock');
      setTimeout(() => s.dispose(), 1200);
    } catch (error) {
      this.disableFailedSound('treeUnlock', error);
    }
  }

  sfxEvolution() {
    if (!this.T || !this.sfxGain) return;
    try {
      const noise = new this.T.NoiseSynth({
        noise: { type: 'pink' },
        envelope: { attack: 0.1, decay: 2.0, sustain: 0 },
      }).connect(this.sfxGain);
      const reverb = new this.T.Reverb({ decay: 4, wet: 0.8 }).connect(this.sfxGain);
      const sweep = new this.T.Synth({
        oscillator: { type: 'sawtooth' },
        envelope: { attack: 1.5, decay: 0, sustain: 1, release: 1 },
      }).connect(reverb);
      const now = this.safeScheduleTime('evolution');
      sweep.frequency.setValueAtTime(100, now);
      sweep.frequency.exponentialRampToValueAtTime(2000, now + 1.5);
      this.safeTrigger(sweep, 100, 2, now, 'evolutionSweep');
      this.safeNoiseTrigger(noise, 2, now, 'evolutionNoise');
      setTimeout(() => {
        sweep.dispose();
        noise.dispose();
        reverb.dispose();
      }, 3000);
    } catch (error) {
      this.disableFailedSound('evolution', error);
    }
  }

  sfxAbility() {
    if (!this.T || !this.sfxGain) return;
    try {
      const s = new this.T.MonoSynth({
        oscillator: { type: 'sawtooth' },
        envelope: { attack: 0.01, decay: 0.4, sustain: 0, release: 0.3 },
        filter: { Q: 6, type: 'lowpass' },
        filterEnvelope: { attack: 0.01, decay: 0.3, sustain: 0, release: 0.3, baseFrequency: 4000, octaves: -4 },
      }).connect(this.sfxGain);
      this.safeTrigger(s, 'C4', 0.4, undefined, 'ability');
      setTimeout(() => s.dispose(), 800);
    } catch (error) {
      this.disableFailedSound('ability', error);
    }
  }

  sfxEventDing() {
    if (!this.T || !this.sfxGain) return;
    try {
      const s = new this.T.Synth({
        oscillator: { type: 'sine' },
        envelope: { attack: 0.001, decay: 0.4, sustain: 0, release: 0.4 },
      }).connect(this.sfxGain);
      const now = this.safeScheduleTime('eventDing');
      this.safeTrigger(s, 'E5', '16n', now, 'eventDing');
      this.safeTrigger(s, 'B5', '16n', now + 0.15, 'eventDing');
      setTimeout(() => s.dispose(), 700);
    } catch (error) {
      this.disableFailedSound('eventDing', error);
    }
  }

  sfxResearchCollected() {
    if (!this.T || !this.sfxGain) return;
    try {
      const synth = new this.T.PolySynth(this.T.Synth, {
        oscillator: { type: 'sine' },
        envelope: { attack: 0.01, decay: 0.18, sustain: 0.1, release: 0.5 },
      }).connect(this.sfxGain);
      const now = this.safeScheduleTime('researchCollected');
      this.safeTrigger(synth, ['C5', 'G5'], '16n', now, 'researchCollected');
      this.safeTrigger(synth, ['E5', 'B5'], '8n', now + 0.14, 'researchCollected');
      setTimeout(() => synth.dispose(), 900);
    } catch (error) {
      this.disableFailedSound('researchCollected', error);
    }
  }

  sfxPrestige() {
    if (!this.T || !this.sfxGain) return;
    try {
      const s = new this.T.Synth({
        oscillator: { type: 'sawtooth' },
        envelope: { attack: 0.05, decay: 2, sustain: 0, release: 0.5 },
      }).connect(this.sfxGain);
      const now = this.safeScheduleTime('prestige');
      s.frequency.setValueAtTime(2000, now);
      s.frequency.exponentialRampToValueAtTime(40, now + 2);
      this.safeTrigger(s, 2000, 2, now, 'prestige');
      setTimeout(() => {
        try {
          const chord = new this.T!.PolySynth(this.T!.Synth, {
            oscillator: { type: 'sine' },
            envelope: { attack: 0.05, decay: 2, sustain: 0.3, release: 2 },
          }).connect(this.sfxGain!);
          this.safeTrigger(chord, ['C3', 'Eb3', 'G3', 'Bb3'], '2n', undefined, 'prestigeChord');
          setTimeout(() => chord.dispose(), 3000);
        } catch (error) {
          this.disableFailedSound('prestigeChord', error);
        }
      }, 2100);
      setTimeout(() => s.dispose(), 2500);
    } catch (error) {
      this.disableFailedSound('prestige', error);
    }
  }
}

export const audio = new AudioEngine();
