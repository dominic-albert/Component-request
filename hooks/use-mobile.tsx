"use client"

import { useState, useEffect } from "react"

function getIsMobile() {
  return window.innerWidth <= 768
}

export function useMobile() {
  const [isMobile, setIsMobile] = useState(getIsMobile())

  useEffect(() => {
    function handleResize() {
      setIsMobile(getIsMobile())
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return isMobile
}
