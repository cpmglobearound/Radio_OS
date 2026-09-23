import Image from 'next/image'
import Link from 'next/link'

/** Klarframe-Logo + „Radio" wie auf der Startseite. */
export default function Logo({ href = '/', label, klein = false }: { href?: string; label: string; klein?: boolean }) {
  return (
    <Link href={href} aria-label={label} className="flex min-w-0 shrink-0 items-center gap-2.5">
      <Image src="/marke/klarframe-logo-black.png" alt="Klarframe" width={47} height={40} priority className={klein ? 'h-8 w-auto' : 'h-10 w-auto'} />
      <span aria-hidden="true" className={`w-px bg-linie-2 ${klein ? 'h-6' : 'h-7'}`} />
      <span className={`font-display font-medium leading-none tracking-[-.04em] text-text ${klein ? 'text-[1.15rem]' : 'text-[1.35rem]'}`}>Radio</span>
    </Link>
  )
}
