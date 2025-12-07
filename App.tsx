import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameState, Memory, BackgroundTheme } from './types';
import { MEMORIES, GAME_SPEED, CHECKPOINT_DISTANCE } from './constants';
import { PixelCharacter, PixelFlower } from './PixelCharacter';
import { generateLoveLetter } from './geminiService';

// --- SOUND ENGINE (Web Audio API) ---
class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private musicInterval: any = null;

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playTone(freq: number, type: OscillatorType, duration: number, vol: number = 0.1, startTime: number = 0) {
    if (!this.ctx || this.isMuted) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    const time = startTime || this.ctx.currentTime;
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, time);
    
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(vol, time + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.01, time + duration);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start(time);
    osc.stop(time + duration + 0.1);
  }

  playJump() {
    this.playTone(400, 'square', 0.1, 0.05);
  }

  playCorrect() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    this.playTone(600, 'sine', 0.1, 0.1, now);
    this.playTone(800, 'sine', 0.1, 0.1, now + 0.1);
    this.playTone(1200, 'sine', 0.2, 0.1, now + 0.2);
  }

  playWrong() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    this.playTone(300, 'sawtooth', 0.2, 0.1, now);
    this.playTone(200, 'sawtooth', 0.2, 0.1, now + 0.2);
  }

  playWin() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.50, 783.99, 1046.50].forEach((freq, i) => {
       this.playTone(freq, 'triangle', 0.3, 0.1, now + i * 0.15);
    });
  }

  // "All of Me" melody simulation
  playAllOfMe() {
    if (!this.ctx || this.isMuted) return;
    if (this.musicInterval) clearInterval(this.musicInterval);

    // Notes: F4, G4, Ab4, Bb4, C5, Db5, Eb5
    const F4 = 349.23;
    const G4 = 392.00;
    const Ab4 = 415.30;
    const Bb4 = 466.16;
    const C5 = 523.25;
    const Db5 = 554.37;
    const Eb5 = 622.25;

    // Simple Melody Sequence
    const sequence = [
      // Cause all of me
      { f: F4, d: 0.4 }, { f: G4, d: 0.4 }, { f: Ab4, d: 0.4 }, { f: C5, d: 0.8 },
      { f: 0, d: 0.2 }, // rest
      // Loves all of you
      { f: Bb4, d: 0.4 }, { f: Ab4, d: 0.4 }, { f: G4, d: 0.4 }, { f: F4, d: 0.8 },
      { f: 0, d: 0.4 },
      // Love your curves and all your edges
      { f: F4, d: 0.3 }, { f: G4, d: 0.3 }, { f: Ab4, d: 0.3 }, { f: Eb5, d: 0.4 }, { f: Db5, d: 0.3 }, { f: C5, d: 0.3 }, { f: Bb4, d: 0.3 }, { f: Ab4, d: 0.6 },
      { f: 0, d: 0.4 },
      // All your perfect imperfections
      { f: F4, d: 0.3 }, { f: G4, d: 0.3 }, { f: Ab4, d: 0.3 }, { f: Eb5, d: 0.4 }, { f: Db5, d: 0.3 }, { f: C5, d: 0.3 }, { f: Bb4, d: 0.3 }, { f: Ab4, d: 0.3 }, { f: G4, d: 0.3 }, { f: F4, d: 0.8 },
    ];

    let noteIndex = 0;
    
    const playNextNote = () => {
      if (!this.ctx) return;
      const note = sequence[noteIndex];
      if (note.f > 0) {
        this.playTone(note.f, 'sine', note.d, 0.05); // Soft sine wave for piano-ish feel
      }
      noteIndex = (noteIndex + 1) % sequence.length;
      
      // Schedule next note
      this.musicInterval = setTimeout(playNextNote, note.d * 1000);
    };

    playNextNote();
  }

  stopMusic() {
    if (this.musicInterval) clearTimeout(this.musicInterval);
  }
}

const soundEngine = new SoundEngine();


const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.INTRO);
  const [distance, setDistance] = useState(0);
  const [currentMemoryIndex, setCurrentMemoryIndex] = useState(0);
  const [victoryMessage, setVictoryMessage] = useState<string>("");
  const [isBoyVisible, setIsBoyVisible] = useState(true);
  const [bgOffset, setBgOffset] = useState(0);
  const [failReason, setFailReason] = useState("");
  const [currentTheme, setCurrentTheme] = useState<BackgroundTheme>('default');

  // Refs for animation loop
  const requestRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  const clouds = [10, 150, 400, 650, 900];

  const startGame = () => {
    soundEngine.init();
    soundEngine.playCorrect();
    soundEngine.playAllOfMe(); // Start music
    setGameState(GameState.WALKING);
    setDistance(0);
    setCurrentMemoryIndex(0);
    setIsBoyVisible(true);
    setBgOffset(0);
    setCurrentTheme(MEMORIES[0].theme);
  };

  const handleCorrectChoice = () => {
    soundEngine.playCorrect();
    setGameState(GameState.WALKING);
    const nextIndex = currentMemoryIndex + 1;
    
    if (nextIndex >= MEMORIES.length) {
      setCurrentMemoryIndex(nextIndex); 
      setCurrentTheme('default');
      setTimeout(() => {
        setIsBoyVisible(false); // Boy disappears
        setGameState(GameState.WALKING_ALONE);
      }, 1000);
    } else {
      setCurrentMemoryIndex(nextIndex);
      setCurrentTheme(MEMORIES[nextIndex].theme);
    }
  };

  const handleWrongChoice = (reason: string) => {
    soundEngine.playWrong();
    soundEngine.stopMusic();
    setFailReason(reason);
    setGameState(GameState.GAME_OVER);
  };

  const handleVictory = useCallback(async () => {
    soundEngine.stopMusic();
    soundEngine.playWin(); // Play win fanfare then maybe silence or specific music
    setGameState(GameState.VICTORY);
    const passedMemories = MEMORIES.map(m => m.correctOption === 'A' ? m.optionA : m.optionB);
    const msg = await generateLoveLetter(passedMemories);
    setVictoryMessage(msg);
  }, []);

  const animate = useCallback((time: number) => {
    if (gameState === GameState.WALKING || gameState === GameState.WALKING_ALONE) {
      if (lastTimeRef.current !== undefined) {
        setDistance(prev => prev + GAME_SPEED);
        setBgOffset(prev => (prev + 3) % 2000);
      }
      lastTimeRef.current = time;
    }
    requestRef.current = requestAnimationFrame(animate);
  }, [gameState]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [animate]);

  useEffect(() => {
    if (gameState === GameState.WALKING) {
      const targetDistance = (currentMemoryIndex + 1) * CHECKPOINT_DISTANCE;
      if (distance >= targetDistance) {
        setGameState(GameState.QUESTION);
      }
    } else if (gameState === GameState.WALKING_ALONE) {
      const finalWalkDistance = (MEMORIES.length + 1) * CHECKPOINT_DISTANCE + 600;
      if (distance >= finalWalkDistance) {
        handleVictory();
      }
    }
  }, [distance, currentMemoryIndex, gameState, handleVictory]);

  const getThemeStyles = () => {
      switch(currentTheme) {
          case 'night': return { bg: 'bg-slate-900', ground: 'bg-slate-800', accent: 'border-slate-600', skyObj: 'moon' };
          case 'night_view_date': return { bg: 'bg-slate-950', ground: 'bg-[#2a2320]', accent: 'border-[#4a3b32]', skyObj: 'stars' };
          case 'school': return { bg: 'bg-orange-100', ground: 'bg-stone-300', accent: 'border-stone-400', skyObj: 'sun' };
          case 'bus_station': return { bg: 'bg-gray-400', ground: 'bg-gray-700', accent: 'border-gray-800', skyObj: 'rain' };
          case 'gym': return { bg: 'bg-blue-100', ground: 'bg-blue-300', accent: 'border-blue-500', skyObj: 'sun' };
          case 'restaurant': return { bg: 'bg-yellow-50', ground: 'bg-orange-200', accent: 'border-orange-400', skyObj: 'none' };
          case 'cafe': return { bg: 'bg-amber-50', ground: 'bg-amber-200', accent: 'border-amber-600', skyObj: 'sun' };
          default: return { bg: 'bg-sky-200', ground: 'bg-green-500', accent: 'border-green-700', skyObj: 'sun' };
      }
  };

  const styles = getThemeStyles();

  const renderIntro = () => (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 z-50 text-white font-pixel text-center p-4">
      <h1 className="text-3xl md:text-5xl text-pink-400 mb-8 animate-pulse shadow-red-500 drop-shadow-lg">Aşkımızın Piksel Yolculuğu</h1>
      <div className="flex gap-8 mb-8">
        <div className="animate-bounce-pixel">
            <PixelCharacter type="girl" isWalking={false} scale={3} />
        </div>
        <div className="animate-bounce-pixel" style={{ animationDelay: '0.2s' }}>
            <PixelCharacter type="boy" isWalking={false} scale={3} />
        </div>
      </div>
      <p className="mb-8 text-sm md:text-base leading-6 max-w-md text-gray-200">
        Soruları doğru cevapla ve anılarımızda yolculuk yap.<br/>
        Sesini açmayı unutma! 🎵
      </p>
      <button onClick={startGame} className="px-10 py-5 bg-pink-600 border-b-8 border-pink-800 hover:bg-pink-500 text-white font-bold text-xl rounded-lg">
        BAŞLA ❤️
      </button>
    </div>
  );

  const renderGameOver = () => (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-900/95 z-50 text-white font-pixel text-center p-4">
      <h2 className="text-3xl mb-4 text-red-300">Eyvah! 💔</h2>
      <p className="mb-8 text-lg">{failReason}</p>
      <button onClick={startGame} className="px-6 py-3 bg-white text-red-900 font-bold hover:bg-gray-100 rounded">
        TEKRAR DENE
      </button>
    </div>
  );

  const renderQuestion = () => {
    const memory = MEMORIES[currentMemoryIndex];
    if (!memory) return null;
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-start pt-20 z-40 font-pixel">
        <div className="bg-white/95 border-4 border-gray-800 p-6 rounded-xl shadow-2xl max-w-2xl w-full mx-4 text-center transform hover:scale-105 transition-transform duration-300">
          <div className="bg-pink-100 text-pink-600 px-3 py-1 rounded-full text-xs inline-block mb-4 font-bold tracking-wider">
            ANI #{currentMemoryIndex + 1}
          </div>
          <h3 className="text-lg md:text-2xl text-gray-800 mb-8 leading-normal min-h-[4rem] flex items-center justify-center">
            {memory.question}
          </h3>
          <div className="flex flex-col md:flex-row gap-6 justify-center w-full">
            <button onClick={() => memory.correctOption === 'A' ? handleCorrectChoice() : handleWrongChoice(memory.failMessage)} className="flex-1 py-6 px-6 bg-blue-50 hover:bg-blue-100 border-b-4 border-blue-300 rounded-lg text-blue-900 transition-all text-sm md:text-base">
              {memory.optionA}
            </button>
            <div className="flex items-center justify-center text-gray-400 font-bold text-xl">VS</div>
            <button onClick={() => memory.correctOption === 'B' ? handleCorrectChoice() : handleWrongChoice(memory.failMessage)} className="flex-1 py-6 px-6 bg-pink-50 hover:bg-pink-100 border-b-4 border-pink-300 rounded-lg text-pink-900 transition-all text-sm md:text-base">
              {memory.optionB}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderVictory = () => (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-50 text-white font-pixel text-center overflow-hidden">
      {/* Cinematic Spotlight */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-pink-900/40 via-black/80 to-black z-0 pointer-events-none"></div>

      {/* Floating Hearts Particles */}
      <div className="absolute inset-0 pointer-events-none z-0">
         {Array.from({ length: 30 }).map((_, i) => (
            <div key={i} className="absolute text-red-500 animate-pulse" 
                 style={{ 
                   left: `${Math.random() * 100}%`, 
                   top: `${Math.random() * 100}%`,
                   fontSize: `${Math.random() * 20 + 10}px`,
                   animationDuration: `${1 + Math.random() * 2}s`,
                   opacity: Math.random() * 0.5
                 }}>
               ♥
            </div>
         ))}
      </div>
      
      {/* Epic Character Scene */}
      <div className="relative z-10 flex items-end justify-center mb-16 h-64 w-full max-w-lg mx-auto">
         {/* Girl waiting */}
         <div className="absolute left-1/4 transform transition-all duration-[3000ms] translate-x-12">
             <PixelCharacter type="girl" isWalking={false} scale={4} />
         </div>
         
         {/* Boy walking in animation */}
         <div className="absolute right-0 animate-[slideIn_3s_ease-out_forwards] flex flex-col items-center">
             <div className="mb-[-10px] z-20 animate-pulse">
                <PixelFlower scale={5} />
             </div>
             <PixelCharacter type="boy" isWalking={false} scale={4} pose="holding_flowers" />
         </div>
         
         <style>{`
           @keyframes slideIn {
             0% { transform: translateX(100px); opacity: 0; }
             100% { transform: translateX(-80px); opacity: 1; }
           }
         `}</style>
      </div>

      <h1 className="text-4xl md:text-6xl text-pink-500 mb-8 animate-pulse z-10 drop-shadow-[0_0_10px_rgba(236,72,153,0.8)]">
        Seni Seviyorum
      </h1>

      <div className="bg-white/10 p-8 rounded-2xl border border-pink-500/30 max-w-2xl backdrop-blur-sm shadow-2xl z-10 mx-4">
         <p className="text-lg md:text-2xl leading-relaxed font-medium text-pink-100">
           {victoryMessage || "..."}
         </p>
      </div>

      <button 
        onClick={startGame}
        className="mt-12 px-8 py-3 bg-pink-600 hover:bg-pink-500 text-white font-bold rounded-full shadow-[0_0_20px_rgba(236,72,153,0.6)] border-2 border-pink-400 z-50 cursor-pointer transition-all hover:scale-110"
      >
        TEKRAR OYNA ↺
      </button>
    </div>
  );

  return (
    <div className={`relative w-full h-screen overflow-hidden transition-colors duration-1000 select-none ${styles.bg}`}>
      
      {/* --- BACKGROUND LAYERS --- */}
      
      {/* Sky Objects */}
      {styles.skyObj === 'sun' && (
        <div className="absolute top-10 right-10 w-20 h-20 bg-yellow-300 rounded-full shadow-[0_0_40px_rgba(253,224,71,0.8)] animate-pulse transition-all duration-1000"></div>
      )}
      {styles.skyObj === 'moon' && (
         <div className="absolute top-10 right-10 w-16 h-16 bg-gray-200 rounded-full shadow-[0_0_20px_rgba(255,255,255,0.8)]"></div>
      )}
      {(styles.skyObj === 'stars' || currentTheme === 'night') && Array.from({ length: 50 }).map((_, i) => (
          <div key={i} className="absolute bg-white rounded-full w-[2px] h-[2px] animate-pulse" 
               style={{ top: Math.random() * 50 + '%', left: Math.random() * 100 + '%' }} />
      ))}

      {/* Scenery */}
      {currentTheme === 'night_view_date' ? (
        // Custom Background for Memory 3 (Night Date)
        <>
          {/* City Lights Distant */}
          <div className="absolute bottom-40 left-0 w-full h-20 flex justify-center items-end gap-1 opacity-60">
             {Array.from({ length: 60 }).map((_, i) => (
               <div key={i} className={`w-1 h-1 rounded-full ${Math.random() > 0.5 ? 'bg-yellow-200' : 'bg-orange-200'} animate-pulse`} 
                    style={{ marginBottom: Math.random() * 10 + 'px' }}/>
             ))}
          </div>
          
          {/* Wooden Railing (Foreground) */}
          <div className="absolute bottom-0 w-full h-32 z-0">
             <div className="absolute bottom-20 w-full h-2 bg-[#5d4037]"></div> {/* Top Rail */}
             <div className="flex justify-around w-full h-full px-4">
               {Array.from({ length: 15 }).map((_, i) => (
                 <div key={i} className="w-2 h-32 bg-[#5d4037] border-r border-[#3e2723]"></div>
               ))}
             </div>
          </div>

          {/* Big Tree with Heart Lights (Right side) */}
          <div className="absolute bottom-20 right-[-50px] md:right-10 w-64 h-80 bg-green-900/80 blur-[1px] rounded-[50%] z-0">
             {/* Heart Shape Lights on Tree */}
             <div className="absolute top-10 left-10 w-40 h-40">
                <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_5px_rgba(253,224,71,0.8)]">
                  <path d="M50 85 L15 50 Q0 35 15 20 T50 20 Q65 5 85 20 T85 50 Z" fill="none" stroke="#fde047" strokeWidth="2" strokeDasharray="4 4" />
                </svg>
             </div>
          </div>
        </>
      ) : (
        // Standard Scenery
        <>
          {clouds.map((cloudX, i) => (
            <div key={i} className={`absolute top-20 bg-white/40 rounded-full h-12 w-24 blur-md`}
                style={{ 
                    left: `${((cloudX - bgOffset * 0.2) + 1000) % 1500 - 200}px`,
                    top: `${20 + (i * 30)}px`
                }}
            />
          ))}
          <div className="absolute bottom-32 left-0 h-64 w-[200%] flex opacity-80" style={{ transform: `translateX(-${bgOffset * 0.5}px)` }}>
             {Array.from({ length: 30 }).map((_, i) => (
                <div key={i} className={`w-20 h-40 mx-2 ${currentTheme === 'school' ? 'bg-orange-200' : 'bg-emerald-300'} rounded-t-lg transition-colors duration-1000`} style={{ transform: `scaleY(${0.8 + Math.random() * 0.4})` }} />
             ))}
          </div>
        </>
      )}

      {/* Ground */}
      <div className={`absolute bottom-0 w-full h-32 ${styles.ground} border-t-8 ${styles.accent} transition-colors duration-1000`}>
         <div className="w-[200%] h-4 border-t-4 border-dashed border-black/10 mt-2" style={{ transform: `translateX(-${bgOffset}px)` }} />
      </div>

      {/* --- GAME ENTITIES --- */}
      {gameState === GameState.WALKING && (
          <div className="absolute bottom-28 transition-transform duration-75" style={{ right: `${Math.max(-100, (currentMemoryIndex + 1) * CHECKPOINT_DISTANCE - distance + 100)}px` }}>
             {((currentMemoryIndex + 1) * CHECKPOINT_DISTANCE - distance) < 800 && (
                 <div className="flex flex-col items-center animate-bounce">
                    <div className="bg-red-500 text-white font-pixel text-[10px] p-1 shadow-md">SORU</div>
                    <div className="h-20 w-1 bg-gray-800"></div>
                 </div>
             )}
          </div>
      )}
      
      {gameState === GameState.WALKING_ALONE && (
         <div className="absolute bottom-32 transition-all duration-100 z-20" style={{ right: `${Math.max(100, ((MEMORIES.length + 1) * CHECKPOINT_DISTANCE + 600) - distance + 100)}px` }}>
            <div className="flex flex-col items-center">
                <div className="animate-pulse mb-[-10px] z-10"><PixelFlower scale={3} /></div>
                <PixelCharacter type="boy" isWalking={false} scale={3} pose="holding_flowers" />
            </div>
         </div>
      )}

      {/* Characters */}
      <div className="absolute bottom-28 left-6 md:left-32 flex gap-4 transition-all duration-500">
        <div className="relative z-10 drop-shadow-xl">
          {gameState === GameState.WALKING_ALONE && (
             <div className="absolute -top-12 -right-4 bg-white border-2 border-black p-2 rounded-lg font-pixel text-[10px] animate-bounce whitespace-nowrap">O nerede? ❤️</div>
          )}
          <PixelCharacter type="girl" isWalking={gameState === GameState.WALKING || gameState === GameState.WALKING_ALONE} scale={3} />
        </div>
        <div className={`relative drop-shadow-xl transition-opacity duration-500 ${isBoyVisible ? 'opacity-100' : 'opacity-0'}`}>
           <PixelCharacter type="boy" isWalking={gameState === GameState.WALKING} scale={3} />
        </div>
      </div>

      {gameState === GameState.INTRO && renderIntro()}
      {gameState === GameState.GAME_OVER && renderGameOver()}
      {gameState === GameState.QUESTION && renderQuestion()}
      {gameState === GameState.VICTORY && renderVictory()}

    </div>
  );
};

export default App;
