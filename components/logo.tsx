import Image from "next/image"

export function Logo({
  className = "",
  width = 150,
  height = 50,
}: { className?: string; width?: number; height?: number }) {
  return (
    <div className={className}>
      <Image src="/cemex-logo.png" alt="Cemex Logo" width={width} height={height} priority />
    </div>
  )
}
