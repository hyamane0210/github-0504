export default function Loading() {
  return (
    <div className="container mx-auto p-4 md:p-8 max-w-5xl flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
        <p className="mt-4 text-muted-foreground">読み込み中...</p>
      </div>
    </div>
  )
}

