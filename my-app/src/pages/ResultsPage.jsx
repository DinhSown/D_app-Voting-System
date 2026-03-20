import { TopNavBar } from '../components/TopNavBar'
import { Footer } from '../components/Footer'

export const ResultsPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background text-on-surface font-body selection:bg-primary-container selection:text-on-primary-container">
      <TopNavBar activeTab="results" />
      <main className="pt-32 pb-20 px-8 max-w-[1440px] mx-auto flex-grow w-full">
        <div className="flex flex-col lg:flex-row gap-12">
          <div className="flex-1">
            <header className="mb-12">
              <h1 className="font-headline text-5xl md:text-7xl font-bold tracking-tighter mb-4 text-white">
                Live <span className="text-primary">Consensus</span>
              </h1>
            </header>
            <div className="space-y-6">
              <div className="group relative surface-container p-8 rounded-xl border-l-4 border-primary overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-end gap-6 relative z-10">
                  <div className="font-headline text-8xl font-bold text-primary-fixed-dim leading-none opacity-80">01</div>
                  <div className="flex-1">
                    <div className="flex justify-between items-baseline mb-4">
                      <h2 className="font-headline text-3xl font-bold text-white tracking-tight">The Decentralized Oracle</h2>
                      <span className="font-headline text-xl font-medium text-primary">12,482 VP</span>
                    </div>
                    <div className="w-full h-3 bg-surface-container-highest rounded-full overflow-hidden">
                      <div className="h-full w-[84%] bg-gradient-to-r from-primary to-tertiary"></div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Rank 2-5 placeholder */}
              {[2,3,4,5].map(rank => (
                <div key={rank} className="surface-container p-6 rounded-xl hover:bg-surface-container-high transition-colors">
                  <div className="flex items-center gap-6">
                    <div className="font-headline text-6xl font-bold text-on-surface-variant/30 leading-none min-w-[80px]">0{rank}</div>
                    <div className="flex-1">
                      <div className="flex justify-between items-baseline mb-3">
                        <h3 className="font-headline text-2xl font-semibold text-white">Project {rank}</h3>
                        <span className="font-headline text-lg text-on-surface-variant">{10000 - rank*1000} VP</span>
                      </div>
                      <div className="w-full h-2 bg-surface-container-highest rounded-full overflow-hidden">
                        <div className={`h-full bg-primary`} style={{width: `${100 - rank*10}%`}}></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
