import React, { useState } from 'react';
import { ChristmasScene } from './components/ChristmasScene';
import { UIOverlay } from './components/UIOverlay';
import { AppState } from './types';

// Default placeholders - using reliable Unsplash images
const DEFAULT_PHOTOS = [
  'https://images.unsplash.com/photo-1543589076-47a827c109fb?q=80&w=500&auto=format&fit=crop', // Winter Forest
  'https://images.unsplash.com/photo-1512474932049-782a02663d18?q=80&w=500&auto=format&fit=crop', // Christmas Ornaments
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=500&auto=format&fit=crop', // Portrait/Memory
];

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.ASSEMBLED);
  const [photos, setPhotos] = useState<string[]>(DEFAULT_PHOTOS);
  const [activePhotoIndex, setActivePhotoIndex] = useState<number | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);

  const handleUpload = (index: number, url: string) => {
    const newPhotos = [...photos];
    newPhotos[index] = url;
    setPhotos(newPhotos);
  };

  const handleResetPhotoView = () => {
      setAppState(AppState.SCATTERED);
      setActivePhotoIndex(null);
  };

  return (
    <div className="w-full h-screen bg-black relative">
      {/* 3D Scene Layer */}
      <div className="absolute inset-0 z-0">
        <ChristmasScene 
            appState={appState} 
            setAppState={setAppState}
            photos={photos}
            activePhotoIndex={activePhotoIndex}
            setActivePhotoIndex={setActivePhotoIndex}
            zoomLevel={zoomLevel}
        />
      </div>

      {/* UI Layer */}
      <UIOverlay 
        state={appState} 
        photos={photos} 
        onUpload={handleUpload}
        onReset={handleResetPhotoView}
        zoomLevel={zoomLevel}
        setZoomLevel={setZoomLevel}
      />
    </div>
  );
};

export default App;