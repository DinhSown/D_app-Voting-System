import { Link } from 'react-router-dom'

export const TopNavBar = ({ activeTab }) => {
  return (
    <nav className="fixed top-0 w-full z-50 bg-[#0a0e14]/80 backdrop-blur-xl shadow-2xl shadow-black/40">
      <div className="flex justify-between items-center px-8 h-20 max-w-full">
        <Link to="/" className="text-2xl font-bold tracking-tighter text-white font-headline">The Sovereign Ledger</Link>
        <div className="hidden md:flex items-center space-gap-8 gap-x-8 font-headline font-bold tracking-tight">
          <Link to="/" className={`transition-colors ${activeTab === 'home' ? 'text-[#95a9ff] border-b-2 border-[#95a9ff] pb-1' : 'text-[#a8abb3] hover:text-white'}`}>Home</Link>
          <Link to="/nominees" className={`transition-colors ${activeTab === 'nominees' ? 'text-[#95a9ff] border-b-2 border-[#95a9ff] pb-1' : 'text-[#a8abb3] hover:text-white'}`}>Nominees</Link>
          <Link to="/results" className={`transition-colors ${activeTab === 'results' ? 'text-[#95a9ff] border-b-2 border-[#95a9ff] pb-1' : 'text-[#a8abb3] hover:text-white'}`}>Live Stats</Link>
        </div>
        <button className="bg-gradient-to-br from-primary to-primary-container text-on-primary-container px-6 py-2.5 rounded-full font-headline font-bold tracking-tight active:scale-95 transition-transform hover:shadow-[0_0_20px_rgba(149,169,255,0.4)]">
          Connect Wallet
        </button>
      </div>
    </nav>
  )
}
