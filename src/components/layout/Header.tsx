import LogoText from '@/assets/TraceAILogoText.png'

export function Header() {
  return (
    <header className="w-full border-b bg-background">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <img src={LogoText} alt="Trace AI" className="h-7 w-auto md:h-8" />
        <p className="text-sm text-muted-foreground">
          Bring composite sketches to life and predict appearance changes by time, place, and style.
        </p>
      </div>
    </header>
  )
}
