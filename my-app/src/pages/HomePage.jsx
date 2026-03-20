import { useNavigate } from 'react-router-dom'
import { TopNavBar } from '../components/TopNavBar'
import { Footer } from '../components/Footer'

export const HomePage = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col">
      <TopNavBar activeTab="home" />
      <main className="relative flex-grow">
        <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-20">
          <div className="absolute inset-0 z-0">
            <div className="absolute top-[-10%] right-[-5%] w-[60%] h-[80%] bg-primary/10 rounded-full blur-[120px] opacity-50"></div>
            <div className="absolute bottom-[-10%] left-[-5%] w-[50%] h-[70%] bg-tertiary/10 rounded-full blur-[100px] opacity-30"></div>
            <img alt="Abstract digital waves" className="w-full h-full object-cover opacity-40 mix-blend-lighten scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAf8WfA3QlD9QHrUr7GnyFkZb7UKkn6cZler2TRUZI1VHubTunhhjd6dCp4J1SJml96Sspduq2c6p06e19eLZQd0N58HlROxpva9gRMDCbcuTZN4NNyqKEQ5OwbdZnUT-UrX6EPH2FJIx4Npaq4ptm-i8lCe50JpWGhHL5aOSqMSl2KhHk1_qATaPzfWPMVzbznVwY5UjW7yPEj4z6PAt1mcPtImeWfnrUTtcOW4rOsU7qwgbP8ottWrP0JzjSFEkdHF195OhSUopxo"/>
          </div>
          <div className="relative z-10 text-center px-4 max-w-6xl">
            <span className="inline-block font-headline font-bold tracking-[0.4em] text-primary mb-6 text-sm uppercase">2026 DIGITAL AWARDS</span>
            <h1 className="font-headline text-5xl md:text-8xl lg:text-9xl font-extrabold tracking-tighter leading-none mb-8 hero-gradient-text">
              NHÂN VẬT<br/>TRUYỀN CẢM HỨNG<br/>2026
            </h1>
            <p className="font-body text-on-surface-variant text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
              Vinh danh những giá trị nguyên bản và sức mạnh của sự tử tế thông qua nền tảng bầu chọn phi tập trung đầu tiên tại Việt Nam.
            </p>
            <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
              <button onClick={() => navigate('/nominees')} className="w-full md:w-auto px-10 py-4 bg-gradient-to-br from-primary to-primary-container text-on-primary-container rounded-full font-headline font-bold text-lg active:scale-95 transition-transform shadow-xl shadow-primary/20">
                Connect Wallet to Vote
              </button>
              <button onClick={() => navigate('/nominees')} className="w-full md:w-auto px-10 py-4 border border-outline-variant/30 text-white rounded-full font-headline font-bold text-lg hover:bg-white/5 transition-colors">
                View Nominees
              </button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
