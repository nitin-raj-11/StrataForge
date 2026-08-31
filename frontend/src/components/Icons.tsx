import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };
function Icon({ children, size = 18, ...props }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{children}</svg>;
}
export const ChartIcon = (p: IconProps) => <Icon {...p}><path d="M4 19V5"/><path d="M4 19h16"/><path d="m7 15 3-4 3 2 4-7"/></Icon>;
export const LayersIcon = (p: IconProps) => <Icon {...p}><path d="m12 3 8 4-8 4-8-4 8-4Z"/><path d="m4 12 8 4 8-4"/><path d="m4 17 8 4 8-4"/></Icon>;
export const BoltIcon = (p: IconProps) => <Icon {...p}><path d="m13 2-9 12h7l-1 8 9-13h-7l1-7Z"/></Icon>;
export const ClockIcon = (p: IconProps) => <Icon {...p}><circle cx="12" cy="12" r="8.5"/><path d="M12 7v5l3 2"/></Icon>;
export const CompareIcon = (p: IconProps) => <Icon {...p}><path d="M7 4v16"/><path d="M17 4v16"/><path d="M4 7h6"/><path d="M14 17h6"/></Icon>;
export const SaveIcon = (p: IconProps) => <Icon {...p}><path d="M5 3h11l3 3v15H5z"/><path d="M8 3v6h8V3"/><path d="M8 21v-7h8v7"/></Icon>;
export const SparkIcon = (p: IconProps) => <Icon {...p}><path d="m12 2 1.5 6.5L20 10l-6.5 1.5L12 18l-1.5-6.5L4 10l6.5-1.5L12 2Z"/><path d="m19 16 .7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7L19 16Z"/></Icon>;
export const ArrowIcon = (p: IconProps) => <Icon {...p}><path d="M5 12h13"/><path d="m13 6 6 6-6 6"/></Icon>;

export const SunIcon = (p: IconProps) => <Icon {...p}><circle cx="12" cy="12" r="3.5"/><path d="M12 2v2.2M12 19.8V22M4.93 4.93l1.55 1.55M17.52 17.52l1.55 1.55M2 12h2.2M19.8 12H22M4.93 19.07l1.55-1.55M17.52 6.48l1.55-1.55"/></Icon>;
export const MoonIcon = (p: IconProps) => <Icon {...p}><path d="M20 15.5A8.5 8.5 0 0 1 8.5 4a7 7 0 1 0 11.5 11.5Z"/></Icon>;

export function UserIcon({ size = 18 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="3.5"/><path d="M5 20c.8-3.2 3.1-5 7-5s6.2 1.8 7 5"/></svg>;
}
