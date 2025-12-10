import React from 'react';
import { AppState } from '../types';

interface UIOverlayProps {
  state: AppState;
  photos: string[];
  onUpload: (index: number, url: string) => void;
  onReset: () => void;
  zoomLevel: number;
  setZoomLevel: (z: number) => void;
}

export const UIOverlay: React.FC<UIOverlayProps> = ({ state, photos, onUpload, onReset, zoomLevel, setZoomLevel }) => {
  const handleFileChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onUpload(index, event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between p-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-serif text-[#d4af37] drop-shadow-lg tracking-wider">
            Lumière de Noël
          </h1>
          <p className="text-[#a5b4a5] mt-2 font-light text-sm max-w-md drop-shadow-md">
            Click to disperse. Drag to rotate. Double-click to assemble.
            Click photos to zoom.
          </p>
        </div>
        
        <div className="pointer-events-auto flex gap-2">
           {state === AppState.PHOTO_VIEW && (
              <button 
                onClick={onReset}
                className="bg-[#c41e3a]/80 hover:bg-[#c41e3a] text-white px-6 py-2 rounded-full border border-[#d4af37] transition-all backdrop-blur-md font-serif"
              >
                Close Photo
              </button>
           )}
        </div>
      </div>

      <div className="flex-1 flex justify-between items-center pointer-events-none">
          {/* Left Spacer */}
          <div />

          {/* Right Side Controls Container */}
          <div className="flex flex-col gap-6 items-end pointer-events-auto">
            
            {/* Zoom Slider */}
            <div className="h-48 bg-black/40 backdrop-blur-md rounded-full border border-[#d4af37]/30 p-2 flex flex-col items-center justify-center">
                 <div className="text-[#d4af37] text-xs font-serif mb-2 rotate-0">Zoom</div>
                 <div className="h-full flex items-center">
                    <input
                        type="range"
                        min="0.5"
                        max="2.0"
                        step="0.01"
                        value={zoomLevel}
                        onChange={(e) => setZoomLevel(parseFloat(e.target.value))}
                        className="w-32 h-1 bg-[#d4af37]/50 rounded-lg appearance-none cursor-pointer -rotate-90 origin-center accent-[#d4af37]"
                    />
                 </div>
            </div>

            {/* Photo Controls */}
            <div className="bg-black/40 backdrop-blur-md p-4 rounded-xl border border-[#d4af37]/30">
                <h3 className="text-[#d4af37] font-serif mb-3 text-sm border-b border-[#d4af37]/20 pb-2">
                    Customize Memories
                </h3>
                <div className="flex flex-col gap-3">
                    {photos.map((photo, index) => (
                        <div key={index} className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full overflow-hidden border border-[#d4af37]">
                                <img src={photo} alt="mini" className="w-full h-full object-cover" />
                            </div>
                            <label className="cursor-pointer bg-[#1a472a] hover:bg-[#235e36] text-[#d4af37] text-xs px-3 py-1.5 rounded transition-colors border border-[#d4af37]/50">
                                Upload Photo {index + 1}
                                <input 
                                    type="file" 
                                    className="hidden" 
                                    accept="image/*"
                                    onChange={(e) => handleFileChange(index, e)}
                                />
                            </label>
                        </div>
                    ))}
                </div>
            </div>
          </div>
      </div>

      {/* Footer Status */}
      <div className="text-center pointer-events-none">
        <div className={`inline-block px-4 py-1 rounded-full text-xs tracking-widest uppercase transition-colors duration-500
          ${state === AppState.ASSEMBLED ? 'text-[#d4af37] bg-[#d4af37]/10' : 'text-[#c41e3a] bg-[#c41e3a]/10'}`}>
          {state === AppState.ASSEMBLED ? 'Tree Assembled' : state === AppState.SCATTERED ? 'Stars Scattered' : 'Viewing Memory'}
        </div>
      </div>
    </div>
  );
};