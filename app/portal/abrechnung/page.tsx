import { redirect } from 'next/navigation'

/** Alte bzw. in der Doku genannte Adresse → Guthaben-Seite. */
export default function Abrechnung() {
  redirect('/portal/guthaben')
}
