interface MobileDesktopSwitchProps {
  mobile: React.ReactNode;
  desktop: React.ReactNode;
}

export function MobileDesktopSwitch({ mobile, desktop }: MobileDesktopSwitchProps) {
  return (
    <>
      <div className="sm:hidden">{mobile}</div>
      <div className="hidden sm:block">{desktop}</div>
    </>
  );
}
