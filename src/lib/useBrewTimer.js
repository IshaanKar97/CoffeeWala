import { useEffect, useRef, useState } from 'react'

/** Format milliseconds as mm:ss (count-up). */
export function fmt(ms) {
  const s = Math.max(0, Math.floor(ms / 1000))
  const m = Math.floor(s / 60)
  const r = s % 60
  return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`
}

/**
 * Brew Timer state (PRD §6.6): count-up stopwatch with per-step lap capture.
 * - start / stop (freeze) / reset (→ 00:00, confirmed if data present) / clear (no confirm).
 * - lap(key) records elapsed-from-start (mm:ss); re-tapping overwrites.
 * - editLap(key, value) allows manual mm:ss correction.
 * - Timing any step is optional; un-lapped steps stay blank.
 * Elapsed is derived from timestamps, so it stays accurate across tab throttling.
 */
export function useBrewTimer() {
  const [running, setRunning] = useState(false)
  const [accumulated, setAccumulated] = useState(0)
  const [now, setNow] = useState(0)
  const startRef = useRef(null)
  const [laps, setLaps] = useState({})

  useEffect(() => {
    if (!running) return
    const id = setInterval(() => setNow(Date.now()), 250)
    return () => clearInterval(id)
  }, [running])

  const elapsed = accumulated + (running && startRef.current ? now - startRef.current : 0)

  const start = () => {
    if (running) return
    startRef.current = Date.now()
    setNow(Date.now())
    setRunning(true)
  }
  // Stop freezes the elapsed time. If a finalKey is given (the terminal step,
  // e.g. last pour / drawdown end), that step's time is recorded as the stop time.
  const stop = (finalKey) => {
    if (!running) return
    const finalMs = accumulated + (Date.now() - startRef.current)
    setAccumulated(finalMs)
    startRef.current = null
    setRunning(false)
    if (finalKey) setLaps((l) => ({ ...l, [finalKey]: fmt(finalMs) }))
  }
  const clear = () => {
    setRunning(false)
    setAccumulated(0)
    startRef.current = null
    setNow(0)
    setLaps({})
  }
  const reset = () => {
    const hasData = accumulated > 0 || running || Object.keys(laps).length > 0
    if (hasData && !window.confirm('Reset the timer and clear all captured lap times?')) return
    clear()
  }
  const lap = (key) => setLaps((l) => ({ ...l, [key]: fmt(elapsed) }))
  const editLap = (key, value) => setLaps((l) => ({ ...l, [key]: value }))

  return { elapsed, running, laps, start, stop, reset, clear, lap, editLap }
}
