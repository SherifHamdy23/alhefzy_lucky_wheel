import React, { useState, useRef } from 'react';
import { Settings, Plus, Trash2, Play } from 'lucide-react';

export default function LuckyWheel() {
  const [segments, setSegments] = useState([
    { text: 'تدريب', color: '#000000ff', textColor: '#FFFFFFFF' },
    { text: 'Prize 2', color: '#4ECDC4', textColor: '#FFFFFFFF' },
    { text: 'Prize 3', color: '#FFE66D', textColor: '#000000ff' },
    { text: 'Prize 4', color: '#95E1D3', textColor: '#000000ff' },
    { text: 'Prize 5', color: '#F38181', textColor: '#000000ff' },
    { text: 'Prize 6', color: '#AA96DA', textColor: '#000000ff' },
    { text: 'Prize 7', color: '#FCBAD3', textColor: '#000000ff' },
    { text: 'Prize 8', color: '#A8E6CF', textColor: '#000000ff' }
  ]);
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [pointerRotation, setPointerRotation] = useState(0);
  const canvasRef = useRef(null);
  const lastPinRef = useRef(-1);

  const drawWheel = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 10;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const segmentAngle = (2 * Math.PI) / segments.length;
    
    segments.forEach((segment, i) => {
      const startAngle = i * segmentAngle + (rotation * Math.PI / 180);
      const endAngle = startAngle + segmentAngle;
      
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = segment.color;
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 3;
      ctx.stroke();
      
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(startAngle + segmentAngle / 2);
      ctx.textAlign = 'center';
      ctx.fillStyle = segment.textColor || '#000';
      ctx.font = 'bold 16px Arial';
      ctx.fillText(segment.text, radius * 0.65, 5);
      ctx.restore();
    });
    
    // Draw decorative pins at segment boundaries
    segments.forEach((segment, i) => {
      const angle = i * segmentAngle + (rotation * Math.PI / 180);
      const pinX = centerX + Math.cos(angle) * (radius - 5);
      const pinY = centerY + Math.sin(angle) * (radius - 5);
      
      ctx.beginPath();
      ctx.arc(pinX, pinY, 8, 0, 2 * Math.PI);
      ctx.fillStyle = '#FFD700';
      ctx.fill();
      ctx.strokeStyle = '#B8860B';
      ctx.lineWidth = 2;
      ctx.stroke();
    });
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, 15, 0, 2 * Math.PI);
    ctx.fillStyle = '#333';
    ctx.fill();
  };

  React.useEffect(() => {
    drawWheel();
    
    // Check if a golden pin is passing the bottom pointer position
    const segmentAngle = 360 / segments.length;
    const normalizedRotation = ((rotation % 360) + 360) % 360;
    const bottomAngle = 270; // Bottom position
    
    // Find which segment is at the bottom
    const currentPin = Math.floor(((bottomAngle - normalizedRotation + 360) % 360) / segmentAngle);
    
    // If we crossed a pin boundary, rotate the pointer
    if (currentPin !== lastPinRef.current && spinning) {
      lastPinRef.current = currentPin;
      setPointerRotation(prev => prev + 15); // Quick rotation
      
      // Reset rotation after animation
      setTimeout(() => {
        setPointerRotation(0);
      }, 100);
    }
  }, [rotation, segments, spinning]);

  const spinWheel = () => {
    if (spinning) return;
    
    setSpinning(true);
    setWinner('');
    
    const spins = 5 + Math.random() * 5;
    const extraDegrees = Math.random() * 360;
    const totalRotation = spins * 360 + extraDegrees;
    
    const duration = 4000;
    const startTime = Date.now();
    const startRotation = rotation;
    
    const animate = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentRotation = startRotation + totalRotation * easeOut;
      
      setRotation(currentRotation % 360);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setSpinning(false);
        const finalAngle = (360 - (currentRotation % 360) + 90) % 360;
        const segmentAngle = 360 / segments.length;
        const winningIndex = Math.floor(finalAngle / segmentAngle);
        setWinner(segments[winningIndex].text);
      }
    };
    
    requestAnimationFrame(animate);
  };

  const addSegment = () => {
    const colors = ['#2f0404ff', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181', '#AA96DA', '#FCBAD3', '#A8E6CF'];
    setSegments([...segments, { 
      text: `Prize ${segments.length + 1}`, 
      color: colors[segments.length % colors.length] 
    }]);
  };

  const removeSegment = (index) => {
    if (segments.length > 2) {
      setSegments(segments.filter((_, i) => i !== index));
    }
  };

  const updateSegment = (index, field, value) => {
    const updated = [...segments];
    updated[index][field] = value;
    setSegments(updated);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-red-500 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-bold text-white text-center mb-2">Lucky Wheel</h1>
        <p className="text-white text-center mb-8 opacity-90">Spin to win!</p>
        
        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-6">
          <div className="flex justify-center mb-12 relative">
            <div className="relative inline-block">
              <canvas 
                ref={canvasRef} 
                width={400} 
                height={400}
                className="drop-shadow-2xl"
              />
              {/* Triangle pointer at the bottom - pointing UP into the wheel */}
              <div 
                className="absolute left-1/2 -translate-x-1/2 z-20 transition-transform duration-100" 
                style={{
                  bottom: '-15px',
                  transform: `translateX(-50%) rotate(${pointerRotation}deg)`,
                  transformOrigin: 'center top'
                }}
              >
                {/* Smaller triangle */}
                <svg width="40" height="35" className="drop-shadow-lg">
                  <polygon points="20,0 40,35 0,35" fill="#ffe100ff" stroke="#ffa200ff" strokeWidth="2"/>
                  <polygon points="20,3 35,30 5,30" fill="#ffa200ff"/>
                </svg>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center gap-4 mb-6">
            <button
              onClick={spinWheel}
              disabled={spinning}
              className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-full font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Play size={24} />
              {spinning ? 'Spinning...' : 'Spin Wheel'}
            </button>
            
            {/* <button
              onClick={() => setShowSettings(!showSettings)}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-4 rounded-full font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all flex items-center gap-2"
            >
              <Settings size={24} />
            </button> */}
          </div>
          
          {winner && (
            <div className="text-center">
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-8 py-4 rounded-2xl inline-block shadow-lg animate-pulse">
                <p className="text-sm font-semibold mb-1">Winner!</p>
                <p className="text-3xl font-bold">{winner}</p>
              </div>
            </div>
          )}
        </div>
        
        {showSettings && (
          <div className="bg-white rounded-3xl shadow-2xl p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Customize Segments</h2>
              <button
                onClick={addSegment}
                className="bg-green-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-600 transition-colors flex items-center gap-2"
              >
                <Plus size={20} />
                Add Segment
              </button>
            </div>
            
            <div className="space-y-4">
              {segments.map((segment, index) => (
                <div key={index} className="flex gap-3 items-center">
                  <input
                    type="color"
                    value={segment.color}
                    onChange={(e) => updateSegment(index, 'color', e.target.value)}
                    className="w-16 h-12 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={segment.text}
                    onChange={(e) => updateSegment(index, 'text', e.target.value)}
                    className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                    placeholder="Prize name"
                  />
                  <button
                    onClick={() => removeSegment(index)}
                    disabled={segments.length <= 2}
                    className="bg-red-500 text-white p-3 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="text-center mt-8 text-white opacity-75 text-sm">
          <p>Free & Open Source • Customize segments and colors • No limits!</p>
        </div>
      </div>
    </div>
  );
}