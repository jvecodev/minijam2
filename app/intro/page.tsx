"use client"

import dynamic from "next/dynamic"

const DynamicIntroStory = dynamic(
  () => import("@/components/IntroStory"),
  {
    ssr: false,
    loading: () => (
      <div className="loading">
        <div className="loading-text">Preparando a missão...</div>
      </div>
    )
  }
)

export default function IntroPage() {
  return (
    <div className="w-full h-screen bg-black">
      <DynamicIntroStory />
      
      <style jsx>{`
        .loading {
          display: flex;
          height: 100vh;
          width: 100vw;
          justify-content: center;
          align-items: center;
          background: linear-gradient(to bottom, rgb(88, 28, 135), black);
        }

        .loading-text {
          padding: 20px;
          background-color: rgba(30, 30, 60, 0.7);
          border-radius: 10px;
          color: white;
          font-size: 1.5rem;
        }
      `}</style>
    </div>
  )
}
