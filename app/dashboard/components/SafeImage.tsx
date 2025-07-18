'use client'

import { useState } from 'react'
import Image from 'next/image'

interface SafeImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
}

export default function SafeImage({
  src,
  alt,
  width = 64,
  height = 64,
  className = '',
}: SafeImageProps) {
  const [imgSrc, setImgSrc] = useState(src || '/default-avatar.png')

  return (
    <Image
      src={imgSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      onError={() => setImgSrc('/default-avatar.png')}
    />
  )
}
