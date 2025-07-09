export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-900 p-8 text-white">
      <div className="text-center space-y-6">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
          Welcome to Your Next.js App
        </h1>
        <p className="text-lg md:text-xl text-gray-300 max-w-2xl">
          This is your new homepage. You can start building your amazing application by editing the file at:
        </p>
        <code className="inline-block bg-gray-800 border border-gray-700 text-gray-300 px-4 py-2 rounded-lg text-sm md:text-base shadow-md">
          app/page.tsx
        </code>
      </div>
    </main>
  );
}
