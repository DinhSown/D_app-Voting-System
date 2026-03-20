import { useState } from 'react'
import { TopNavBar } from '../components/TopNavBar'
import { Footer } from '../components/Footer'

export const VotePage = () => {
  const [showModal, setShowModal] = useState(false)
  const [voteSuccess, setVoteSuccess] = useState(false)

  const handleVote = () => {
    setShowModal(true)
    setTimeout(() => {
      setVoteSuccess(true)
    }, 2000)
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-on-background font-body">
      <TopNavBar activeTab="nominees" />
      <main className="pt-32 pb-20 px-8 max-w-7xl mx-auto flex flex-col gap-20 flex-grow">
        <section className="grid grid-cols-12 gap-8 items-end">
          <div className="col-span-12 md:col-span-7">
            <span className="text-primary font-headline font-bold tracking-widest uppercase text-xs mb-4 block">Current Governance Proposal</span>
            <h1 className="text-white font-headline font-bold text-6xl leading-tight tracking-tighter">
              Lead Protocol Developer Nominee: <span className="text-primary-dim">Dr. Elara Vance</span>
            </h1>
          </div>
        </section>
        <section className="grid grid-cols-12 gap-12">
          <div className="col-span-12 lg:col-span-4 group relative">
            <div className="relative bg-surface-container rounded-xl overflow-hidden shadow-2xl">
              <img className="w-full h-96 object-cover grayscale group-hover:grayscale-0 transition-all duration-700" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBRYRGlPOrUfsWljOa2-FUwesidAtkiACGenvL0Ox5ZYJCQ_HijTnmrvLV9AmgYUzupdxZz2EZZvAJRmznFar9pPx0ZODJVz0wwd27BVMKgXm64UwqDe8qPRf2KK_QW_4jpLW2HCJko9oORvN-iddUvmjeAZu3309BY5SYTLka6u1GC1LZqjJ76P5LdVFEgzI2K_2RhFAg6koyIw9eizzqCOUivsaxAsmEoC6YiU1mfXYJ0-DpKE4QEqaRKj-sM15HSyldbjsiuIREP"/>
              <div className="p-8 space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-2xl font-headline font-bold text-white">Elara Vance</h3>
                    <p className="text-on-surface-variant text-sm">Ethereum Foundation Contributor</p>
                  </div>
                </div>
                <button onClick={handleVote} className="w-full bg-surface-container-high py-4 rounded-full font-headline font-bold tracking-tight text-white border border-outline-variant/15 hover:bg-surface-container-highest transition-all active:scale-95">
                  Cast Your Vote
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {showModal && !voteSuccess && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-surface-container-lowest/80 backdrop-blur-md">
          <div className="glass-panel w-full max-w-lg rounded-xl shadow-[0_20px_40px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col items-center p-12 text-center space-y-8 relative">
            <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 text-on-surface-variant hover:text-white transition-colors">
              <span className="material-symbols-outlined">close</span>
            </button>
            <div className="space-y-4">
              <h2 className="text-white font-headline font-bold text-3xl tracking-tight">Processing Vote on Ethereum...</h2>
              <p className="text-on-surface-variant max-w-xs mx-auto text-sm leading-relaxed">
                Please confirm the transaction in your connected wallet. Your vote will be recorded on-chain once the block is finalized.
              </p>
            </div>
            <div className="relative w-24 h-24 flex items-center justify-center">
              <div className="absolute inset-0 border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
              <span className="material-symbols-outlined text-primary text-3xl animate-pulse">lock</span>
            </div>
          </div>
        </div>
      )}

      {voteSuccess && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-6 bg-surface-container-lowest/90 backdrop-blur-xl">
          <div className="glass-panel w-full max-w-lg rounded-xl shadow-[0_30px_60px_rgba(0,0,0,0.8)] p-12 text-center space-y-8">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
              <span className="material-symbols-outlined text-5xl" style={{fontVariationSettings: "'FILL' 1"}}>check_circle</span>
            </div>
            <div className="space-y-2">
              <h2 className="text-white font-headline font-bold text-4xl tracking-tight">Vote Success!</h2>
              <p className="text-on-surface-variant">Your voice has been etched into the ledger.</p>
            </div>
            <button onClick={() => { setShowModal(false); setVoteSuccess(false); }} className="w-full bg-gradient-to-r from-primary to-primary-container text-on-primary font-headline font-bold py-4 rounded-full active:scale-95 transition-all">
              Close & Return
            </button>
          </div>
        </div>
      )}
      <Footer />
    </div>
  )
}
