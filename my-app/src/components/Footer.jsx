export const Footer = () => {
  return (
    <footer className="w-full border-t border-[#44484f]/15 bg-[#0a0e14] flex flex-col md:flex-row justify-between items-center px-12 py-10 gap-6 mt-auto">
      <div className="text-lg font-bold text-white font-headline">The Sovereign Ledger</div>
      <div className="flex flex-wrap justify-center gap-8 font-label text-xs uppercase tracking-widest text-[#a8abb3]">
        <a className="hover:text-[#95a9ff] transition-colors" href="#">Blockchain Verified</a>
        <a className="hover:text-[#95a9ff] transition-colors" href="#">DAO Governance</a>
        <a className="hover:text-[#95a9ff] transition-colors" href="#">Privacy Policy</a>
        <a className="hover:text-[#95a9ff] transition-colors" href="#">Terms</a>
      </div>
      <div className="text-[#a8abb3] text-[10px] uppercase tracking-widest">
        2026 The Sovereign Ledger. All rights reserved.
      </div>
    </footer>
  )
}
