import fs from 'node:fs'

/** Datei mit Range-Unterstützung ausliefern (Spulen im Player). */
export async function dateiAntwort(req: Request, pfad: string, typ: string, extra: Record<string, string> = {}) {
  const groesse = (await fs.promises.stat(pfad)).size
  const range = req.headers.get('range')?.match(/bytes=(\d*)-(\d*)/)
  const kopf: Record<string, string> = { 'content-type': typ, 'accept-ranges': 'bytes', 'cache-control': 'private, max-age=300', ...extra }
  if (range) {
    const start = range[1] ? Number(range[1]) : 0
    const ende = range[2] ? Math.min(Number(range[2]), groesse - 1) : groesse - 1
    if (start >= groesse) return new Response(null, { status: 416, headers: { 'content-range': `bytes */${groesse}` } })
    const strom = fs.createReadStream(pfad, { start, end: ende })
    return new Response(strom as unknown as ReadableStream, { status: 206, headers: { ...kopf, 'content-range': `bytes ${start}-${ende}/${groesse}`, 'content-length': String(ende - start + 1) } })
  }
  return new Response(fs.createReadStream(pfad) as unknown as ReadableStream, { headers: { ...kopf, 'content-length': String(groesse) } })
}
