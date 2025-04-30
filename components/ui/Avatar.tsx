'use client';

import Image from 'next/image';

interface AvatarProps {
  url: string | null | undefined;
  username: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Avatar({ 
  url, 
  username,
  size = 'md'
}: AvatarProps) {
  // Define sizes for different variants
  const sizeMap = {
    sm: { width: 32, height: 32, textSize: 'text-xs' },
    md: { width: 40, height: 40, textSize: 'text-sm' },
    lg: { width: 64, height: 64, textSize: 'text-xl' }
  };
  
  const { width, height, textSize } = sizeMap[size];
  
  return (
    <div 
      className={`rounded-full overflow-hidden bg-gray-100 flex items-center justify-center`}
      style={{ width, height }}
    >
      {url ? (
        <Image
          src={url}
          alt={`${username}'s avatar`}
          width={width}
          height={height}
          className="object-cover"
        />
      ) : (
        <div className={`h-full w-full flex items-center justify-center bg-blue-100 text-blue-600 ${textSize}`}>
          {username.charAt(0).toUpperCase()}
        </div>
      )}
    </div>
  );
}