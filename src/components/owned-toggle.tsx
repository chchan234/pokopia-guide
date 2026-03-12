'use client';

export default function OwnedToggle({
  owned,
  onToggle,
  compact = false,
}: {
  owned: boolean;
  onToggle: () => void;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={owned}
      className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
        owned
          ? 'border-pk-green bg-pk-green text-white'
          : 'border-border bg-white text-muted-foreground hover:border-pk-green hover:text-pk-green-dark'
      } ${compact ? 'min-w-[72px]' : 'min-w-[88px]'}`}
    >
      {owned ? '보유 중' : '미보유'}
    </button>
  );
}
