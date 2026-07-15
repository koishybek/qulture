type IconProps = {
  className?: string;
  size?: number;
};

export function ArrowIcon({ className, size = 22 }: IconProps) {
  return (
    <svg aria-hidden="true" className={className} fill="none" height={size} viewBox="0 0 24 24" width={size}>
      <path d="M4 12h15M14 7l5 5-5 5" stroke="currentColor" strokeLinecap="square" strokeWidth="1.25" />
    </svg>
  );
}

export function SearchIcon({ className, size = 20 }: IconProps) {
  return (
    <svg aria-hidden="true" className={className} fill="none" height={size} viewBox="0 0 24 24" width={size}>
      <circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" strokeWidth="1.35" />
      <path d="m15.5 15.5 5 5" stroke="currentColor" strokeWidth="1.35" />
    </svg>
  );
}

export function BagIcon({ className, size = 20 }: IconProps) {
  return (
    <svg aria-hidden="true" className={className} fill="none" height={size} viewBox="0 0 24 24" width={size}>
      <path d="M5.5 8.5h13l1 12h-15l1-12Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.3" />
      <path d="M9 9V6.5a3 3 0 0 1 6 0V9" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

export function MenuIcon({ className, size = 22 }: IconProps) {
  return (
    <svg aria-hidden="true" className={className} fill="none" height={size} viewBox="0 0 24 24" width={size}>
      <path d="M3 7h18M3 17h18" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

export function CloseIcon({ className, size = 22 }: IconProps) {
  return (
    <svg aria-hidden="true" className={className} fill="none" height={size} viewBox="0 0 24 24" width={size}>
      <path d="m5 5 14 14M19 5 5 19" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

export function SendIcon({ className, size = 22 }: IconProps) {
  return (
    <svg aria-hidden="true" className={className} fill="none" height={size} viewBox="0 0 24 24" width={size}>
      <path d="M12 20V4m0 0L6.5 9.5M12 4l5.5 5.5" stroke="currentColor" strokeWidth="1.35" />
    </svg>
  );
}

