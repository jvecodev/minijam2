"use client"

import { useEffect, useRef, useState } from "react"

type SoundType = "jump" | "hit" | "crystal" | "boost" | "shield" | "levelUp" | "gameOver"

// Create a dummy implementation for environments where audio isn't available
const createDummyAudio = () => {
  return {
    play: () => Promise.resolve(),
    pause: () => {},
    volume: 0,
    currentTime: 0,
  } as HTMLAudioElement
}

export function useSound(volume: number) {
  const [isUserInteracted, setIsUserInteracted] = useState(false)
  const [soundsLoaded, setSoundsLoaded] = useState(false)
  const soundsRef = useRef<Record<SoundType, HTMLAudioElement>>({
    jump: createDummyAudio(),
    hit: createDummyAudio(),
    crystal: createDummyAudio(),
    boost: createDummyAudio(),
    shield: createDummyAudio(),
    levelUp: createDummyAudio(),
    gameOver: createDummyAudio(),
  })

  // Track if a sound is currently playing to prevent overlapping plays
  const isPlayingRef = useRef<Record<SoundType, boolean>>({
    jump: false,
    hit: false,
    crystal: false,
    boost: false,
    shield: false,
    levelUp: false,
    gameOver: false,
  })

  // Listen for user interaction
  useEffect(() => {
    if (typeof window === "undefined") return

    const handleInteraction = () => {
      setIsUserInteracted(true)
    }

    window.addEventListener("click", handleInteraction)
    window.addEventListener("keydown", handleInteraction)
    window.addEventListener("touchstart", handleInteraction)

    return () => {
      window.removeEventListener("click", handleInteraction)
      window.removeEventListener("keydown", handleInteraction)
      window.removeEventListener("touchstart", handleInteraction)
    }
  }, [])

  // Initialize sounds after user interaction
  useEffect(() => {
    if (typeof window === "undefined" || !isUserInteracted) return

    // Only load sounds once
    if (soundsLoaded) return

    const loadSound = (type: SoundType, path: string) => {
      const audio = new Audio(path)
      audio.volume = volume

      // Preload the audio
      audio.load()

      return audio
    }

    try {
      // Create audio elements
      soundsRef.current = {
        jump: loadSound("jump", "/sounds/jump.mp3"),
        hit: loadSound("hit", "/sounds/hit.mp3"),
        crystal: loadSound("crystal", "/sounds/crystal.mp3"),
        boost: loadSound("boost", "/sounds/boost.mp3"),
        shield: loadSound("shield", "/sounds/shield.mp3"),
        levelUp: loadSound("levelUp", "/sounds/levelUp.mp3"),
        gameOver: loadSound("gameOver", "/sounds/gameOver.mp3"),
      }

      setSoundsLoaded(true)
    } catch (error) {
      console.error("Failed to load sounds:", error)
    }

    // Cleanup
    return () => {
      Object.values(soundsRef.current).forEach((sound) => {
        sound.pause()
        sound.currentTime = 0
      })
    }
  }, [isUserInteracted, volume, soundsLoaded])

  // Update volume when it changes
  useEffect(() => {
    if (!soundsLoaded) return

    Object.values(soundsRef.current).forEach((sound) => {
      sound.volume = volume
    })
  }, [volume, soundsLoaded])

  const playSound = (type: SoundType) => {
    // Don't try to play if sounds aren't loaded or user hasn't interacted
    if (!soundsLoaded || !isUserInteracted) return

    const sound = soundsRef.current[type]

    // If this sound is already playing, don't interrupt it
    if (isPlayingRef.current[type]) return

    try {
      // Mark as playing
      isPlayingRef.current[type] = true

      // Reset to beginning
      sound.currentTime = 0

      // Play the sound
      const playPromise = sound.play()

      // Handle the play promise
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            // Sound started playing successfully

            // Set up an event to mark when the sound is done
            const handleEnded = () => {
              isPlayingRef.current[type] = false
              sound.removeEventListener("ended", handleEnded)
            }

            sound.addEventListener("ended", handleEnded)

            // Also set a safety timeout in case the ended event doesn't fire
            setTimeout(() => {
              isPlayingRef.current[type] = false
            }, 1000) // Most sound effects should be shorter than 1 second
          })
          .catch((error) => {
            // Sound failed to play
            console.warn(`Sound play failed (${type}):`, error)
            isPlayingRef.current[type] = false
          })
      }
    } catch (error) {
      console.warn(`Error playing sound (${type}):`, error)
      isPlayingRef.current[type] = false
    }
  }

  return { playSound }
}
