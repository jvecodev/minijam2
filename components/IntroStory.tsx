"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import Image from "next/image"

export default function IntroStory() {
  const router = useRouter()
  const [currentScene, setCurrentScene] = useState(0)
  const [skipIntro, setSkipIntro] = useState(false)

  const scenes = [
    {
      text: "Ano 2157. A última nave de exploração humana, Celestial, descobre um planeta habitado por uma civilização desconhecida nos confins do Sistema Solar.",
      image: "bg-gradient-to-b from-purple-900 to-black",
      animation: "floating-stars"
    },
    {
      text: "Ao tentar estabelecer contato pacífico, a tripulação é recebida com hostilidade. Os alienígenas declaram guerra à humanidade.",
      image: "bg-gradient-to-b from-red-900 to-black",
      animation: "alert-pulse"
    },
    {
      text: "Sua nave, em desespero, tenta escapar da frota alienígena que se aproxima rapidamente. As naves inimigas disparam sem cessar.",
      image: "bg-gradient-to-b from-orange-900 to-black",
      animation: "ship-chase"
    },
    {
      text: "Seu combustível está acabando. O comandante ordena uma manobra arriscada em direção aos anéis de Saturno.",
      image: "bg-gradient-to-b from-blue-900 to-black",
      animation: "engine-failing"
    },
    {
      text: "As naves alienígenas continuam na perseguição, em maior número. A tripulação começa a entrar em pânico.",
      image: "bg-gradient-to-b from-indigo-900 to-black",
      animation: "multiple-enemies"
    },
    {
      text: "Um disparo certeiro atinge o motor principal da Celestial. O sistema de suporte vital falha. Você é o único sobrevivente.",
      image: "bg-gradient-to-b from-red-800 to-black",
      animation: "ship-damage"
    },
    {
      text: "Agora, cercado por naves inimigas nos anéis de Saturno, você tem apenas uma opção: destruir o núcleo do planeta alienígena antes que eles o destruam.",
      image: "bg-gradient-to-b from-purple-900 to-black",
      animation: "final-mission"
    }
  ]
  
  useEffect(() => {
    if (skipIntro) {
      router.push("/game")
      return
    }
    
    const timer = setTimeout(() => {
      if (currentScene < scenes.length - 1) {
        setCurrentScene(currentScene + 1)
      } else {
        router.push("/game")
      }
    }, 4500)

    return () => clearTimeout(timer)
  }, [currentScene, router, skipIntro, scenes.length])

  const handleSkip = () => {
    setSkipIntro(true)
  }
  
  const handleNext = () => {
    if (currentScene < scenes.length - 1) {
      setCurrentScene(currentScene + 1)
    } else {
      router.push("/game")
    }
  }

  // Componente para animar a nave e os alienígenas conforme a cena atual
  const SceneAnimation = ({ animation }: { animation: string }) => {
    switch (animation) {
      case "floating-stars":
        return (
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(30)].map((_, i) => (
              <motion.div 
                key={i}
                className="absolute bg-white rounded-full"
                style={{
                  width: Math.random() * 3 + 1,
                  height: Math.random() * 3 + 1,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`
                }}
                animate={{
                  opacity: [0.2, 1, 0.2],
                  scale: [1, 1.5, 1]
                }}
                transition={{
                  duration: 3 + Math.random() * 5,
                  repeat: Infinity,
                  repeatType: "loop"
                }}
              />
            ))}
          </div>
        )

      case "alert-pulse":
        return (
          <motion.div 
            className="absolute inset-0 bg-red-600 opacity-0"
            animate={{ opacity: [0, 0.3, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )

      case "ship-chase":
        return (
          <div className="absolute inset-0 overflow-hidden">
            {/* Nave principal */}
            <motion.div 
              className="absolute w-24 h-12 bg-gray-200 rounded-lg left-1/4 top-1/2"
              style={{ 
                clipPath: "polygon(0% 50%, 20% 0%, 100% 0%, 100% 100%, 20% 100%)",
                boxShadow: "0 0 15px rgba(255,255,255,0.8)"
              }}
              animate={{ 
                x: [-20, 20, -20],
                y: [-10, 10, -10]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            
            {/* Naves perseguidoras */}
            {[...Array(5)].map((_, i) => (
              <motion.div 
                key={i}
                className="absolute bg-red-500 rounded"
                style={{ 
                  width: 15 + Math.random() * 10,
                  height: 6 + Math.random() * 4,
                  left: `${60 + Math.random() * 30}%`,
                  top: `${30 + Math.random() * 40}%`
                }}
                animate={{ 
                  x: [50, -50],
                  opacity: [0.7, 1, 0.7]
                }}
                transition={{ 
                  duration: 2 + Math.random() * 2,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              />
            ))}
            
            {/* Disparos das naves alienígenas */}
            {[...Array(8)].map((_, i) => (
              <motion.div 
                key={`laser-${i}`}
                className="absolute bg-red-400 h-0.5"
                style={{ 
                  width: 10 + Math.random() * 20,
                  left: `${50 + Math.random() * 40}%`,
                  top: `${30 + Math.random() * 40}%`
                }}
                animate={{ 
                  x: [-100, -300],
                  opacity: [0, 1, 0]
                }}
                transition={{ 
                  duration: 0.8 + Math.random() * 0.5,
                  repeat: Infinity,
                  delay: Math.random() * 1
                }}
              />
            ))}
          </div>
        )

      case "engine-failing":
        return (
          <div className="absolute inset-0 overflow-hidden">
            {/* Nave com motor falhando */}
            <motion.div 
              className="absolute w-24 h-12 bg-gray-300 rounded-lg left-1/3 top-1/2"
              style={{ 
                clipPath: "polygon(0% 50%, 20% 0%, 100% 0%, 100% 100%, 20% 100%)"
              }}
              animate={{ 
                x: [-5, 5, -10, 10, -5],
                y: [-3, 3, -5, 5, -3]
              }}
              transition={{ duration: 0.5, repeat: Infinity }}
            >
              {/* Motor com falha */}
              <motion.div 
                className="absolute right-0 w-6 h-full bg-orange-500"
                animate={{ 
                  opacity: [0.2, 0.8, 0.2],
                  scale: [1, 1.2, 0.8, 1]
                }}
                transition={{ duration: 0.3, repeat: Infinity }}
              />
            </motion.div>
            
            {/* Saturno no fundo */}
            <div className="absolute rounded-full bg-amber-200 w-32 h-32 right-10 bottom-10 opacity-50">
              <div className="absolute w-40 h-8 bg-amber-100 opacity-30 top-1/2 -left-4 rotate-12"></div>
            </div>
          </div>
        )

      case "multiple-enemies":
        return (
          <div className="absolute inset-0 overflow-hidden">
            {/* Nave principal */}
            <motion.div 
              className="absolute w-24 h-12 bg-gray-200 rounded-lg left-1/4 top-1/2"
              style={{ 
                clipPath: "polygon(0% 50%, 20% 0%, 100% 0%, 100% 100%, 20% 100%)",
                boxShadow: "0 0 10px rgba(255,255,255,0.6)"
              }}
              animate={{ 
                x: [-10, 10, -10],
                y: [-5, 5, -5]
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            
            {/* Mais naves alienígenas */}
            {[...Array(12)].map((_, i) => (
              <motion.div 
                key={i}
                className="absolute bg-red-600 rounded"
                style={{ 
                  width: 10 + Math.random() * 15,
                  height: 5 + Math.random() * 8,
                  left: `${50 + Math.random() * 45}%`,
                  top: `${10 + Math.random() * 80}%`,
                  clipPath: "polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%)"
                }}
                animate={{ 
                  x: [-30, -60],
                  rotate: Math.random() * 360
                }}
                transition={{ 
                  duration: 3 + Math.random() * 3,
                  repeat: Infinity,
                  repeatType: "loop"
                }}
              />
            ))}
            
            {/* Disparos intensos */}
            {[...Array(20)].map((_, i) => (
              <motion.div 
                key={`shot-${i}`}
                className="absolute bg-red-500 h-0.5"
                style={{ 
                  width: 5 + Math.random() * 15,
                  left: `${60 + Math.random() * 30}%`,
                  top: `${10 + Math.random() * 80}%`
                }}
                animate={{ 
                  x: [-150, -400],
                  opacity: [0, 1, 0]
                }}
                transition={{ 
                  duration: 0.5 + Math.random() * 0.5,
                  repeat: Infinity,
                  delay: Math.random() * 2
                }}
              />
            ))}
          </div>
        )

      case "ship-damage":
        return (
          <div className="absolute inset-0 overflow-hidden">
            {/* Nave danificada */}
            <motion.div 
              className="absolute w-24 h-12 left-1/3 top-1/2"
              style={{ 
                background: "linear-gradient(90deg, #d4d4d8 50%, #ef4444 50%)",
                clipPath: "polygon(0% 50%, 20% 0%, 100% 0%, 100% 100%, 20% 100%)"
              }}
              animate={{ 
                rotate: [-2, 2, -2],
                y: [0, 5, 0]
              }}
              transition={{ duration: 0.8, repeat: Infinity }}
            >
              {/* Explosões pequenas */}
              {[...Array(3)].map((_, i) => (
                <motion.div 
                  key={i}
                  className="absolute bg-orange-500 rounded-full"
                  style={{ 
                    width: 4 + Math.random() * 8,
                    height: 4 + Math.random() * 8,
                    right: `${Math.random() * 10}px`,
                    top: `${Math.random() * 12}px`
                  }}
                  animate={{ 
                    opacity: [0, 1, 0],
                    scale: [0.5, 1.5, 0.5]
                  }}
                  transition={{ 
                    duration: 0.5 + Math.random() * 0.5,
                    repeat: Infinity,
                    repeatDelay: Math.random()
                  }}
                />
              ))}
            </motion.div>
            
            {/* Destroços da nave */}
            {[...Array(8)].map((_, i) => (
              <motion.div 
                key={`debris-${i}`}
                className="absolute bg-gray-400 w-1 h-1"
                style={{ 
                  left: `${30 + Math.random() * 10}%`,
                  top: `${40 + Math.random() * 20}%`
                }}
                animate={{ 
                  x: [0, 100 + Math.random() * 100],
                  y: [0, 30 * (Math.random() - 0.5)],
                  opacity: [1, 0]
                }}
                transition={{ 
                  duration: 2 + Math.random(),
                  repeat: Infinity
                }}
              />
            ))}
            
            {/* Naves alienígenas se aproximando */}
            {[...Array(7)].map((_, i) => (
              <motion.div 
                key={`enemy-${i}`}
                className="absolute bg-red-600 rounded"
                style={{ 
                  width: 10 + Math.random() * 15,
                  height: 5 + Math.random() * 8,
                  right: `${Math.random() * 30}%`,
                  top: `${20 + Math.random() * 60}%`,
                  clipPath: "polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%)"
                }}
                animate={{ 
                  x: [50, 0],
                  scale: [0.8, 1]
                }}
                transition={{ 
                  duration: 4 + Math.random() * 2,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              />
            ))}
          </div>
        )

      case "final-mission":
        return (
          <div className="absolute inset-0 overflow-hidden">
            {/* Nave do jogador */}
            <motion.div 
              className="absolute w-20 h-10 bg-blue-200 left-1/4 top-1/2"
              style={{ 
                clipPath: "polygon(0% 50%, 20% 0%, 100% 0%, 100% 100%, 20% 100%)",
                boxShadow: "0 0 15px rgba(59,130,246,0.8)"
              }}
              animate={{ 
                x: [-5, 5, -5],
                y: [-3, 3, -3]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            
            {/* Anéis de Saturno */}
            <div className="absolute w-full h-20 bg-amber-100 opacity-10 top-1/2 -rotate-6"></div>
            <div className="absolute w-full h-16 bg-amber-50 opacity-5 top-1/2 translate-y-5 -rotate-6"></div>
            
            {/* Naves alienígenas cercando */}
            {[...Array(10)].map((_, i) => (
              <motion.div 
                key={i}
                className="absolute bg-red-600 rounded"
                style={{ 
                  width: 8 + Math.random() * 12,
                  height: 4 + Math.random() * 6,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  clipPath: "polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%)"
                }}
                animate={{ 
                  rotate: Math.random() * 360,
                  scale: [0.9, 1.1, 0.9]
                }}
                transition={{ 
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity
                }}
              />
            ))}
            
            {/* Planeta alienígena com núcleo visível ao longe */}
            <div className="absolute w-24 h-24 rounded-full right-10 top-20">
              <motion.div 
                className="w-full h-full rounded-full bg-red-900"
                animate={{ 
                  boxShadow: ["0 0 20px rgba(220,38,38,0.3)", "0 0 40px rgba(220,38,38,0.5)", "0 0 20px rgba(220,38,38,0.3)"]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              />
              <motion.div 
                className="absolute w-8 h-8 rounded-full bg-red-500 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                animate={{ 
                  opacity: [0.6, 1, 0.6],
                  scale: [0.8, 1.1, 0.8]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
          </div>
        )

      default:
        return null
    }
  }
  return (
    <div className={`w-full h-screen flex flex-col items-center justify-center ${scenes[currentScene].image} relative`}>
      {/* Animação de fundo baseada na cena atual */}
      <SceneAnimation animation={scenes[currentScene].animation} />
      
      <motion.div
        key={currentScene}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl text-center p-8 bg-black bg-opacity-50 rounded-lg backdrop-blur-sm z-10"
      >
        <p className="text-2xl text-white mb-12 leading-relaxed">
          {scenes[currentScene].text}
        </p>

        <div className="flex justify-between w-full">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-2 bg-blue-700 text-white rounded-full font-bold text-lg shadow-lg hover:bg-blue-600 transition-colors"
            onClick={handleSkip}
          >
            Pular Introdução
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-2 bg-purple-700 text-white rounded-full font-bold text-lg shadow-lg hover:bg-purple-600 transition-colors"
            onClick={handleNext}
          >
            {currentScene < scenes.length - 1 ? "Próximo" : "Começar!"}
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}
