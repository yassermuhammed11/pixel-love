import React from 'react';

interface PixelCharacterProps {
  type: 'boy' | 'girl';
  isWalking: boolean;
  scale?: number;
  pose?: 'default' | 'holding_flowers';
}

export const PixelCharacter: React.FC<PixelCharacterProps> = ({ type, isWalking, scale = 1, pose = 'default' }) => {
  const colors = {
    skin: '#ffdbac',
    // Boy: Beige jacket, brown undershirt, beige boots
    boyHair: '#4a3728', // Dark Brown
    boyJacket: '#F5F5DC', // Beige
    boyUndershirt: '#8B4513', // SaddleBrown
    boyPants: '#2f3e46', // Dark slate
    boyBoots: '#D2B48C', // Tan/Beige

    // Girl: Golden hair, Blue eyes, Dark red short dress
    girlHair: '#FFD700', // Gold
    girlEye: '#3B82F6', // Blue
    girlDress: '#8B0000', // Dark Red
    girlShoes: '#000000'
  };

  // We wrap the SVG in a div to separate the transform animations
  // Outer div handles the bounce (Y-axis)
  // Inner SVG handles the walk wobble (Rotation)
  const bounceStyle = isWalking ? { animation: 'bounce-pixel 0.5s infinite steps(2)' } : {};
  const walkStyle = isWalking ? { animation: 'walk 0.8s infinite steps(4)' } : {};

  const content = (
    <>
      {type === 'boy' ? (
        // Boy SVG Content
        <>
            {/* Hair */}
            <rect x="8" y="0" width="16" height="8" fill={colors.boyHair} />
            <rect x="4" y="4" width="4" height="8" fill={colors.boyHair} />
            <rect x="24" y="4" width="4" height="4" fill={colors.boyHair} />
            
            {/* Face */}
            <rect x="8" y="8" width="16" height="12" fill={colors.skin} />
            {/* Eyes */}
            <rect x="12" y="12" width="4" height="4" fill="black" />
            <rect x="20" y="12" width="4" height="4" fill="black" />
            
            {/* Brown Undershirt (Visible at neck/center) */}
            <rect x="14" y="20" width="4" height="16" fill={colors.boyUndershirt} />

            {/* Beige Jacket */}
            <rect x="4" y="20" width="10" height="16" fill={colors.boyJacket} /> {/* Left side */}
            <rect x="18" y="20" width="10" height="16" fill={colors.boyJacket} /> {/* Right side */}

            {/* Arms */}
            {pose === 'holding_flowers' ? (
              <>
                 {/* Arms raised forward/up to hold bouquet */}
                 <rect x="4" y="22" width="10" height="4" fill={colors.boyJacket} transform="rotate(-20 4 22)" />
                 <rect x="18" y="22" width="10" height="4" fill={colors.boyJacket} transform="rotate(20 18 22)" />
                 <rect x="12" y="20" width="4" height="4" fill={colors.skin} /> {/* Hands meeting */}
              </>
            ) : (
              <>
                 <rect x="0" y="20" width="4" height="12" fill={colors.boyJacket} />
                 <rect x="28" y="20" width="4" height="12" fill={colors.boyJacket} />
                 <rect x="0" y="32" width="4" height="4" fill={colors.skin} />
                 <rect x="28" y="32" width="4" height="4" fill={colors.skin} />
              </>
            )}
            
            {/* Pants */}
            <rect x="8" y="36" width="16" height="8" fill={colors.boyPants} />
            
            {/* Beige Boots */}
            <rect x="8" y="44" width="4" height="4" fill={colors.boyBoots} />
            <rect x="20" y="44" width="4" height="4" fill={colors.boyBoots} />
        </>
      ) : (
        // Girl SVG Content
        <>
            {/* Golden Hair - Long */}
            <rect x="8" y="0" width="16" height="8" fill={colors.girlHair} />
            <rect x="4" y="4" width="24" height="12" fill={colors.girlHair} />
            <rect x="2" y="16" width="6" height="20" fill={colors.girlHair} /> {/* Left Hair Strand Long */}
            <rect x="24" y="16" width="6" height="20" fill={colors.girlHair} /> {/* Right Hair Strand Long */}
            
            {/* Face */}
            <rect x="8" y="8" width="16" height="12" fill={colors.skin} />
            
            {/* Blue Eyes */}
            <rect x="10" y="12" width="4" height="4" fill={colors.girlEye} />
            <rect x="18" y="12" width="4" height="4" fill={colors.girlEye} />
            
            {/* Dark Red Short Dress */}
            <rect x="6" y="20" width="20" height="14" fill={colors.girlDress} />
            
            {/* Arms (Skin) */}
            <rect x="2" y="20" width="4" height="10" fill={colors.skin} />
            <rect x="26" y="20" width="4" height="10" fill={colors.skin} />
            
            {/* Legs (Skin - showing because short dress) */}
            <rect x="10" y="34" width="4" height="14" fill={colors.skin} />
            <rect x="18" y="34" width="4" height="14" fill={colors.skin} />
            
            {/* Shoes */}
            <rect x="10" y="46" width="4" height="2" fill={colors.girlShoes} />
            <rect x="18" y="46" width="4" height="2" fill={colors.girlShoes} />
        </>
      )}
    </>
  );

  return (
    <div style={{ width: 32 * scale, height: 48 * scale, ...bounceStyle }}>
      <svg 
        width={32 * scale} 
        height={48 * scale} 
        viewBox="0 0 32 48" 
        style={{ overflow: 'visible', ...walkStyle }}
      >
        {content}
      </svg>
    </div>
  );
};

interface FlowerProps {
  scale?: number;
}

export const PixelFlower: React.FC<FlowerProps> = ({ scale = 1 }) => (
  <svg width={32 * scale} height={32 * scale} viewBox="0 0 32 32" style={{ overflow: 'visible' }}>
     {/* Bouquet Wrapping */}
    <path d="M12 20 L20 20 L16 30 Z" fill="#D2B48C" />
    
    {/* Stems */}
    <rect x="15" y="18" width="2" height="6" fill="#22c55e" />
    
    {/* Flowers - Red Roses */}
    <rect x="10" y="10" width="6" height="6" fill="#ef4444" />
    <rect x="16" y="8" width="6" height="6" fill="#dc2626" />
    <rect x="20" y="12" width="6" height="6" fill="#ef4444" />
    
    {/* Sparkles */}
    <rect x="8" y="6" width="2" height="2" fill="white" className="animate-pulse" />
    <rect x="24" y="6" width="2" height="2" fill="white" className="animate-pulse" style={{ animationDelay: '0.2s'}} />
  </svg>
);
