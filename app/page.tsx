import Link from "next/link"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-purple-900 to-black">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-white mb-6">Saturn Rings Runner</h1>
        <p className="text-xl text-purple-300 mb-10">Um endless runner orbital</p>

        <div className="space-y-4">
          <Link
            href="/menu"
            className="block w-64 py-3 bg-purple-600 text-white rounded-full font-bold text-lg shadow-lg hover:bg-purple-500 transition-colors mx-auto text-center"
          >
            Iniciar Jogo
          </Link>
        </div>
      </div>

      <div className="absolute bottom-4 text-purple-400 text-sm">Mini Jam - Tema: Órbita</div>
    </main>
  )
}
