interface LauncherProps {
  open: boolean;
  onToggle: () => void;
}

export function Launcher({ onToggle }: LauncherProps) {
  return (
    <button
      type="button"
      class="fab"
      aria-label="Open SiteKit"
      onClick={onToggle}
    >
      &#10022;
    </button>
  );
}
