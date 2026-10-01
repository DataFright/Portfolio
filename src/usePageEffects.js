import { useEffect, useLayoutEffect } from "react"
import { snapVertical } from "./blueprint.js"
import { startEngagementTracking } from "./tracking/visitorTracker.js"

/**
 * Behaviour every sheet (page) needs: tab title, engagement tracking, and the
 * vertical snap that keeps panel heights on the 24px grid.
 */
export function usePageEffects(title) {
  useEffect(() => {
    if (title) document.title = title
  }, [title])

  useEffect(() => {
    const stop = startEngagementTracking()
    return stop
  }, [])

  useLayoutEffect(() => {
    let resizeFrame = 0

    const resnap = () => {
      if (resizeFrame) cancelAnimationFrame(resizeFrame)
      resizeFrame = requestAnimationFrame(() => {
        snapVertical()
        resizeFrame = 0
      })
    }

    // Snap every section's height to the 24px grid so tops cascade on-grid.
    // useLayoutEffect fires synchronously after DOM paint — ideal for layout measurement.
    snapVertical()
    // Re-snap after fonts finish loading (avoids measuring before web fonts render)
    document.fonts.ready.then(snapVertical)

    window.addEventListener("resize", resnap, { passive: true })

    return () => {
      window.removeEventListener("resize", resnap)
      if (resizeFrame) cancelAnimationFrame(resizeFrame)
    }
  }, [])
}
