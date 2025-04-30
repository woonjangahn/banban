'use client';

import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"
import Image from 'next/image';
import { cn } from "@/lib/utils"

interface AvatarProps {
  url: string | null | undefined;
  username: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Avatar({ 
  url, 
  username,
  size = 'md',
  className
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
      className={cn(
        "rounded-full overflow-hidden bg-muted flex items-center justify-center",
        className
      )}
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
        <div className={cn(
          "h-full w-full flex items-center justify-center bg-primary/10 text-primary",
          textSize
        )}>
          {username.charAt(0).toUpperCase()}
        </div>
      )}
    </div>
  );
}