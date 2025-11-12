import { headers } from 'next/headers';
import { getImageAsset } from '@/lib/tenant-config';
import Image from 'next/image';
import React from 'react';

type Props = {
  src: string;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
};

export default async function EImg({ src, alt, className, style }: Props) {
  const hdrs = await headers();
  const host = hdrs.get('host');
  const asset = getImageAsset(src, host ?? undefined);

  if (!asset) {
    return null;
  }

  return (
    <Image
      src={asset}
      alt={alt ?? ''}
      className={className}
      style={style}
      sizes="100vw"
    />
  );
}
