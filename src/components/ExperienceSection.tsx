import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ATMOSPHERE_MOMENTS } from '../data/cafeData';
import { Volume2, VolumeX, Clock, Sparkles, Coffee, Music, Wind } from 'lucide-react';

export const ExperienceSection: React.FC = () => {
  const [activeMomentId, setActiveMomentId] = useState<string>(ATMOSPHERE_MOMENTS[0].id);
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);
  const [audioVolume, setAudioVolume] = useState<number>(0.2);

  // Web Audio Context for warm ambient acoustic salon hum
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const noiseSourceRef = useRef<AudioNode | null>(null);

  const interiorImagePath = '/src/assets/images/luxury_cafe_interior_1792906517240.jpg';
  const activeMoment = ATMOSPHERE_MOMENTS.find((m) => m.id === activeMomentId) || ATMOSPHERE_MOMENTS[0];

  const toggleAmbianceAudio = () => {
    if (isAudioPlaying) {
      if (audioCtxRef.current && audioCtxRef.current.state === 'running') {
        audioCtxRef.current.suspend();
      }
      setIsAudioPlaying(false);
    } else {
      try {
        if (!audioCtxRef.current) {
          const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
          const ctx = new AudioContextClass();
          audioCtxRef.current = ctx;

          // Warm harmonic drone + subtle pink vinyl warmth generator
          const masterGain = ctx.createGain();
          masterGain.gain.setValueAtTime(audioVolume, ctx.currentTime);
          masterGain.connect(ctx.destination);
          gainNodeRef.current = masterGain;

          // Gentle low chord tones (warm Rhodes/piano harmonic fundamental)
          const osc1 = ctx.createOscillator();
          osc1.type = 'sine';
          osc1.frequency.setValueAtTime(130.81, ctx.currentTime); // C3
          const g1 = ctx.createGain();
          g1.gain.setValueAtTime(0.08, ctx.currentTime);
          osc1.connect(g1);
          g1.connect(masterGain);
          osc1.start();

          const osc2 = ctx.createOscillator();
          osc2.type = 'sine';
          osc2.frequency.setValueAtTime(196.0, ctx.currentTime); // G3
          const g2 = ctx.createGain();
          g2.gain.setValueAtTime(0.05, ctx.currentTime);
          osc2.connect(g2);
          g2.connect(masterGain);
          osc2.start();

          // Pink noise filter simulating warm café tape / vinyl air
          const bufferSize = ctx.sampleRate * 2;
          const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
          const output = noiseBuffer.getChannelData(0);
          let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
          for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            b0 = 0.99886 * b0 + white * 0.0555179;
            b1 = 0.99332 * b1 + white * 0.0750759;
            b2 = 0.96900 * b2 + white * 0.1538520;
            b3 = 0.86650 * b3 + white * 0.3104856;
            b4 = 0.55000 * b4 + white * 0.5329522;
            b5 = -0.7616 * b5 - white * 0.0168980;
            output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.015;
            b6 = white * 0.115926;
          }

          const whiteNoise = ctx.createBufferSource();
          whiteNoise.buffer = noiseBuffer;
          whiteNoise.loop = true;

          const filter = ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(450, ctx.currentTime);

          whiteNoise.connect(filter);
          filter.connect(masterGain);
          whiteNoise.start();

          noiseSourceRef.current = whiteNoise;
        }

        if (audioCtxRef.current.state === 'suspended') {
          audioCtxRef.current.resume();
        }
        setIsAudioPlaying(true);
      } catch (e) {
        console.warn('Audio context unavailable:', e);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  return (
    <section id="experience" className="relative py-28 sm:py-36 bg-[#0c0b0a] overflow-hidden">
      {/* Background divider */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#2d241e] to-transparent" />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 pb-8 border-b border-[#2d241e]">
          <div>
            <div className="flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-[#c5a880] mb-3">
              <span className="font-serif italic text-sm">Chapter III</span>
              <span className="w-8 h-[1px] bg-[#c5a880]/50" />
              <span>Spatial Atmosphere</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl text-[#faf7f2] font-normal tracking-tight">
              The Architecture of Calm
            </h2>
          </div>

          {/* Interactive Ambiance Audio Toggle */}
          <div className="flex items-center gap-3 bg-[#14110f] border border-[#2d241e] px-4 py-2.5">
            <button
              onClick={toggleAmbianceAudio}
              className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-[#faf7f2] hover:text-[#c5a880] transition-colors cursor-pointer"
              aria-label={isAudioPlaying ? 'Mute acoustic ambiance' : 'Play acoustic ambiance'}
            >
              {isAudioPlaying ? (
                <>
                  <Volume2 className="w-4 h-4 text-[#c5a880] animate-pulse" />
                  <span>Ambiance: Resonating</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-4 h-4 text-[#e8e2d5]/50" />
                  <span>Listen to Salon Acoustics</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Hero Editorial Composition with Overlapping Image & Banquette Mood */}
        <div className="relative mb-24">
          <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] overflow-hidden bg-[#14110f] border border-[#2d241e]">
            <img
              src={interiorImagePath}
              alt="Intimate leather banquettes and fluted walnut salon at Cafe 1911"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0c0b0a] via-[#0c0b0a]/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0c0b0a]/70 via-transparent to-[#0c0b0a]/70" />

            {/* Floating Editorial Quote Card */}
            <div className="absolute bottom-6 sm:bottom-10 left-6 sm:left-10 max-w-md bg-[#0c0b0a]/90 backdrop-blur-md p-6 border border-[#2d241e]/80 hidden sm:block">
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#c5a880] block mb-2">
                Curated Acoustic Sanctuary
              </span>
              <p className="font-serif italic text-base sm:text-lg text-[#faf7f2] leading-snug">
                “Every walnut slat is positioned to gently diffuse reverberation, creating pockets of quiet intimacy amidst the city.”
              </p>
            </div>
          </div>
        </div>

        {/* Time-of-Day Atmosphere Chronology */}
        <div>
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-xs uppercase tracking-[0.3em] text-[#c5a880] block mb-2">
              The Diurnal Rhythm
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl text-[#faf7f2] font-normal">
              Three Distinct Movements of Light & Taste
            </h3>
          </div>

          {/* Moment Tabs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {ATMOSPHERE_MOMENTS.map((moment) => {
              const isSelected = activeMomentId === moment.id;
              return (
                <div
                  key={moment.id}
                  onClick={() => setActiveMomentId(moment.id)}
                  className={`p-8 border transition-all duration-300 cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-[#14110f] border-[#c5a880]/60 shadow-[0_8px_30px_rgba(0,0,0,0.6)]'
                      : 'bg-[#0c0b0a] border-[#2d241e] hover:border-[#c5a880]/30 hover:bg-[#14110f]/40'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between text-xs tracking-[0.2em] uppercase text-[#c5a880] mb-4">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {moment.timeframe}
                      </span>
                      {isSelected && <span className="w-1.5 h-1.5 bg-[#c5a880] rotate-45" />}
                    </div>

                    <h4 className="font-serif text-2xl text-[#faf7f2] font-normal mb-3">
                      {moment.title}
                    </h4>

                    <p className="font-sans text-sm text-[#e8e2d5]/75 leading-relaxed font-light mb-6">
                      {moment.description}
                    </p>
                  </div>

                  <div className="pt-6 border-t border-[#2d241e]/60">
                    <div className="text-[10px] uppercase tracking-wider text-[#e8e2d5]/50 mb-2">
                      Sensory Signature:
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs text-[#c5a880]/90 font-light mb-4">
                      {moment.sensoryNotes.map((note, i) => (
                        <span key={note}>
                          {i > 0 && <span className="text-[#2d241e] mr-2">·</span>}
                          {note}
                        </span>
                      ))}
                    </div>

                    <div className="text-xs text-[#faf7f2] font-light">
                      <span className="font-serif italic text-[#c5a880]">Recommended: </span>
                      {moment.recommendedOrder}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
