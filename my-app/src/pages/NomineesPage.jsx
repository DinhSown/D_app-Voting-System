import { useNavigate } from 'react-router-dom'
import { TopNavBar } from '../components/TopNavBar'
import { Footer } from '../components/Footer'

export const NomineesPage = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col bg-background text-on-surface font-body selection:bg-primary/30 selection:text-white gradient-bg">
      <TopNavBar activeTab="nominees" />
      <main className="min-h-screen pt-32 pb-20 px-8 flex-grow">
        <header className="max-w-7xl mx-auto mb-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-2">
              <span className="text-primary-fixed-dim font-label text-xs uppercase tracking-[0.2em] font-bold">Immutable Selection</span>
              <h1 className="text-5xl md:text-7xl font-headline font-bold tracking-tighter text-white">Nominees</h1>
            </div>
          </div>
        </header>
        <section className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div key={item} className="group relative aspect-[3/4] rounded-xl overflow-hidden glass-card transition-all duration-500 hover:-translate-y-2 cursor-pointer" onClick={() => navigate('/vote')}>
              <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-transparent to-transparent z-10 opacity-80"></div>
              <img alt="Nominee Portrait" className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-105 group-hover:scale-100" src={`https://lh3.googleusercontent.com/aida-public/AB6AXuBns5Q_-jf7ie5adgSQIHqImYIMxE_4M8K36kOppnqCNO0caU-9T29hOEATE4nHhHpoXrS-rLsdrctoEbqa4CParuwOtpopf2R5EWdLi8PKno75JlgSX2RHaMkCN85zNNnwgkBzamiRZov5hliowjSghXFRpfTB71DHvhG8RyyKJ-15ZJEBhRdEfbkZhylXwDOoATdJdnVMepPXxfZrTyah2mTl2y4PZp3NmJavgdzGBuADtsFIEYQM9yH9lxJ8f0rHJSzSSxLsJQ7K`}/>
              <div className="absolute inset-x-0 bottom-0 p-8 z-20">
                <h3 className="text-3xl font-headline font-bold text-white mb-2">Elena Voss</h3>
                <p className="text-on-surface-variant text-sm mb-8 max-w-[90%] leading-relaxed">Pioneering algorithmic textures that bridge the gap between physical sensation and the metaverse.</p>
                <button className="w-full flex items-center justify-center gap-3 bg-surface-container-highest/40 border border-outline-variant/15 backdrop-blur-md py-4 rounded-full text-white font-headline font-bold group-hover:bg-primary group-hover:text-on-primary transition-all duration-300">
                  <span className="material-symbols-outlined text-lg">account_balance_wallet</span>
                  Vote with MetaMask
                </button>
              </div>
            </div>
          ))}
        </section>
      </main>
      <Footer />
    </div>
  )
}
