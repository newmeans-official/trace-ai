import { Header } from '@/components/layout/Header'
import { ImageUploader } from '@/components/domain/ImageUploader'
import { TargetInfoForm } from '@/components/domain/TargetInfoForm'
import { LocationSelector } from '@/components/domain/LocationSelector'
import { ResultView } from '@/components/domain/ResultView'

export function MainPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto grid max-w-6xl gap-8 px-4 py-8">
        <section className="grid gap-6 md:grid-cols-2">
          <ImageUploader />
          <TargetInfoForm />
        </section>

        <section>
          <LocationSelector />
        </section>

        <section>
          <ResultView />
        </section>
      </main>
    </div>
  )
}

export default MainPage


