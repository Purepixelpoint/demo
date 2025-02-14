'use client'
import { useState, useRef, useEffect } from 'react';

const ImageCarousel = ({ images, index }) => {
  const [currentIndex, setCurrentIndex] = useState(index);
  const [dragStartX, setDragStartX] = useState(0);
  const [currentTranslate, setCurrentTranslate] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [zoomState, setZoomState] = useState({ 
    scale: 1, 
    pan: { x: 0, y: 0 }, 
    activeIndex: -1 
  });
  
  const containerRef = useRef(null);
  const lastTapTime = useRef(0);
  const panStartRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    setZoomState({ scale: 1, pan: { x: 0, y: 0 }, activeIndex: -1 });
  }, [currentIndex]);

  const handleZoom = (clientX, clientY) => {
    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    const { scale } = zoomState;

    if (scale === 1) {
      const newScale = 2;
      const offsetX = clientX - rect.left;
      const offsetY = clientY - rect.top;

      const maxX = (container.offsetWidth * (newScale - 1)) / 2;
      const maxY = (container.offsetHeight * (newScale - 1)) / 2;

      const newPanX = Math.max(-maxX, Math.min(
        (container.offsetWidth/2 - offsetX) * (newScale - 1),
        maxX
      ));
      
      const newPanY = Math.max(-maxY, Math.min(
        (container.offsetHeight/2 - offsetY) * (newScale - 1),
        maxY
      ));

      setZoomState({
        scale: newScale,
        pan: { x: newPanX, y: newPanY },
        activeIndex: currentIndex
      });
    } else {
      setZoomState({ scale: 1, pan: { x: 0, y: 0 }, activeIndex: -1 });
    }
  };

  const handleTouchStart = (e) => {
    const currentTime = Date.now();
    const tapLength = currentTime - lastTapTime.current;

    if (tapLength < 300 && tapLength > 0) {
      e.preventDefault();
      const touch = e.touches[0];
      handleZoom(touch.clientX, touch.clientY);
      lastTapTime.current = 0;
    } else {
      lastTapTime.current = currentTime;
      if (zoomState.scale === 1) {
        setDragStartX(e.touches[0].clientX);
        setIsDragging(true);
      } else {
        panStartRef.current = { 
          x: e.touches[0].clientX, 
          y: e.touches[0].clientY 
        };
      }
    }
  };

  const handleTouchMove = (e) => {
    if (zoomState.scale > 1 && zoomState.activeIndex === currentIndex) {
      const currentX = e.touches[0].clientX;
      const currentY = e.touches[0].clientY;
      const deltaX = currentX - panStartRef.current.x;
      const deltaY = currentY - panStartRef.current.y;
      
      const container = containerRef.current;
      const maxX = (container.offsetWidth * (zoomState.scale - 1)) / 2;
      const maxY = (container.offsetHeight * (zoomState.scale - 1)) / 2;
      
      setZoomState(prev => ({
        ...prev,
        pan: {
          x: Math.max(-maxX, Math.min(prev.pan.x + deltaX, maxX)),
          y: Math.max(-maxY, Math.min(prev.pan.y + deltaY, maxY))
        }
      }));
      panStartRef.current = { x: currentX, y: currentY };
    } else if (isDragging) {
      const dragOffset = e.touches[0].clientX - dragStartX;
      setCurrentTranslate(dragOffset);
    }
  };

  const handleDragEnd = () => {
    if (zoomState.scale > 1) return;

    const containerWidth = containerRef.current.offsetWidth;
    const threshold = containerWidth * 0.2;
    
    if (Math.abs(currentTranslate) > threshold) {
      setCurrentIndex(prev => 
        currentTranslate > 0 ? 
        (prev === 0 ? images.length - 1 : prev - 1) : 
        (prev === images.length - 1 ? 0 : prev + 1)
      );
    }
    setCurrentTranslate(0);
    setIsDragging(false);
  };

  const goToSlide = (slideIndex) => setCurrentIndex(slideIndex);

  return (
    <div 
      ref={containerRef}
      className="relative h-96 w-full max-w-3xl mx-auto overflow-hidden rounded-lg"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleDragEnd}
      onTouchCancel={handleDragEnd}
      style={{ touchAction: zoomState.scale === 1 ? 'pan-y' : 'none' }}
    >
      <div 
        className={`flex transition-transform duration-300 ease-in-out ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
        style={{ 
          transform: `translateX(calc(-${currentIndex * 100}% + ${currentTranslate}px))`,
          transition: isDragging ? 'none' : undefined
        }}
      >
        {images.map((image, index) => (
          <div 
            key={index}
            className="min-w-full h-96 relative select-none overflow-hidden"
          >
            <img
              src={image}
              alt={`Slide ${index + 1}`}
              className="w-full h-full object-cover pointer-events-none transform origin-center"
              style={{
                transform: currentIndex === index ? 
                  `scale(${zoomState.scale}) translate(${zoomState.pan.x}px, ${zoomState.pan.y}px)` :
                  'scale(1) translate(0, 0)',
                transition: isDragging ? 'none' : 'transform 200ms ease-out'
              }}
              draggable="false"
            />
          </div>
        ))}
      </div>

      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {images.map((_, slideIndex) => (
          <button
            key={slideIndex}
            onClick={() => goToSlide(slideIndex)}
            className={`w-3 h-3 rounded-full transition-colors duration-300 ${
              slideIndex === currentIndex ? 'bg-white' : 'bg-white/50'
            }`}
            aria-label={`Go to slide ${slideIndex + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default ImageCarousel;