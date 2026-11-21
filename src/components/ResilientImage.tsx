import { useState } from 'react';
import { KeyRound } from 'lucide-react';

interface ResilientImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackLabel?: string;
  loading?: 'eager' | 'lazy';
  decoding?: 'async' | 'auto' | 'sync';
}

export function ResilientImage({
  src,
  alt,
  className = '',
  fallbackLabel = 'GameVault Key',
  loading = 'lazy',
  decoding = 'async',
}: ResilientImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return (
      <div
        className={`flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800 text-zinc-400 ${className}`}
        role="img"
        aria-label={alt}
      >
        <KeyRound className="h-7 w-7 text-amber-500/80" aria-hidden="true" />
        <span className="text-xs font-medium tracking-wide text-zinc-400">{fallbackLabel}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      loading={loading}
      decoding={decoding}
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
