import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About | DE·NE",
  description: "Discover the story behind DE·NE and Neon Editorial.",
};

export default function AboutPage() {
  return (
    <main className="bg-surface text-on-surface font-body overflow-x-hidden pt-12 md:pt-24">
      {/* Hero Section: Editorial Impact */}
      <section className="relative min-h-[90vh] md:min-h-[921px] flex items-center px-6 md:px-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-surface via-surface/40 to-transparent z-10"></div>
          <img 
            alt="Cinematic night cityscape of Delhi with neon lights" 
            className="w-full h-full object-cover grayscale opacity-40" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDOoDFEEhGK0RALYkR3ZZNCXqrHcNTWvhdHZrdXOIIBRoyJ9fu4uslJ-EfIr3zyNYSwcx6_8nSgQZ4lZtq4oBZqVb7kVX3AIjgUFQFYB3bMwKGRUx5Aq2utEl-FgSd8p_pG_qSCYClj5hHEvaHum-yQHMd_3i-6jEPqFrleuc0-CobrM4fCkdHWE5bhRJ0bjcs4z8rJzz1OtpMdXa32NaDcyUV6asZX9YyY9N6AhnkXyRdvC9Ks8yXlKZXByRnsOZ4LIfdvZmfjMbk"
          />
        </div>
        <div className="relative z-20 max-w-5xl pt-24 md:pt-0">
          <p className="font-label text-secondary tracking-[0.3em] text-sm mb-6 uppercase">Since 2024 • The Electric Curator</p>
          <h1 className="font-headline text-[clamp(3.5rem,12vw,8rem)] font-black leading-[0.85] tracking-tighter uppercase mb-8 text-white">
            The <span className="text-primary italic">Electric</span> <br/>Pulse of Delhi.
          </h1>
          <div className="flex flex-col md:flex-row gap-12 items-start">
            <p className="text-on-surface-variant text-xl md:text-2xl leading-relaxed max-w-xl">
              DE·NE is more than a platform. It&apos;s a living archive of the subcultures, sounds, and spaces that define the capital&apos;s nocturnal soul.
            </p>
            <div className="h-20 w-[1px] bg-gradient-to-b from-primary to-transparent hidden md:block"></div>
          </div>
        </div>
      </section>

      {/* Our Story: Intentional Asymmetry */}
      <section className="py-32 px-6 md:px-20 bg-surface-container-low">
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-16 items-center">
          <div className="md:col-span-4 relative flex justify-center">
            <div className="absolute -top-6 -left-6 text-6xl md:text-8xl font-black text-white/5 font-headline select-none z-0">01</div>
            <img 
              alt="Our Story background" 
              className="rounded-lg shadow-2xl relative z-10 w-full max-w-[280px] aspect-[4/5] object-cover" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBMmto-SVjP-dYdAu-pTLS_hQST-L8q_EoPZK51u1EwSdVA6kweEh_lNhN5QurU0vz4uGx3POip-RC1fbuBIZkCsVyDIB-ulaA8eCUGkORwqOZLW_D0qlB0Y-T4nTBeXr4ucg2X8f43oTfzj3y_XI3Ry40AOpKazitPrXuAsltc8CDMfVDfgEsP8mDE03aexaCZghJPaBX-jU2Sxqa8AVmwbFYtitVTzzUqfKzTd-xDjaUx0VWAUhftIG5fZt7xvir8agHWoamZjwg"
            />
            <div className="absolute bottom-[-5%] right-[-5%] md:right-[-20%] bg-primary p-6 rounded-lg hidden lg:block z-20 shadow-2xl">
              <p className="font-headline font-bold text-xl text-on-primary-container leading-tight">Curating the <br/>Unexpected.</p>
            </div>
          </div>
          <div className="md:col-span-8 flex flex-col gap-8 relative z-10 lg:pl-16">
            <h2 className="font-headline text-[3rem] font-bold tracking-tighter text-white">Our Story</h2>
            <p className="text-on-surface-variant text-base leading-relaxed max-w-3xl">
              This platform was designed by passionate event managers who sat together in a room to envision the perfect discovery experience. We designed the whole platform so that users could effortlessly find events, engage with their communities, and learn from diverse experiences.
            </p>
            <p className="text-on-surface-variant text-base leading-relaxed max-w-3xl">
              Our ultimate goal is to help you explore, grow from your events, join together with like-minded individuals, and create unforgettable memories out of every experience.
            </p>
            <div className="pt-4">
              <button className="group flex items-center gap-4 text-primary font-bold text-base">
                Read the Manifesto
                <span className="w-12 h-[2px] bg-primary group-hover:w-20 transition-all duration-300"></span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* The Scene: Bento Grid Layout */}
      <section className="py-32 px-6 md:px-20">
        <div className="max-w-[1440px] mx-auto">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-20 gap-8">
            <div className="max-w-2xl">
              <h2 className="font-headline text-[clamp(2.5rem,6vw,4rem)] font-black uppercase tracking-tighter mb-4 text-white leading-none">The Scene</h2>
              <p className="text-tertiary font-label tracking-widest uppercase">Delhi / Noida Culture</p>
            </div>
            <p className="text-on-surface-variant max-w-sm lg:text-right font-medium text-lg lg:text-base">
              The twin cities are breathing. One rooted in history, the other reaching for the future. We live at the intersection.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-none md:grid-rows-2 gap-6 h-auto md:h-[600px] max-w-6xl mx-auto">
            {/* Large Feature */}
            <div className="md:col-span-2 md:row-span-2 relative group overflow-hidden rounded-lg bg-surface-container aspect-square md:aspect-auto">
              <img 
                alt="Luxury event in Delhi" 
                className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAy_Yv4t3lKF-MrB9-SHOqUNVQ6nHEfb7wCEY6nrnpPUiGW92By6P6IRxCu7Pl46LICkNy5cBrHttVuhlch6UlpZuZJ1o5Brk_x5tkOtG13aDhfPfsTeRERfg4C-6PZ9b2QSYzHX2kkx_dcqyTvKO0xt9qM72Gyhe4cI_HN-JlJUH2G8JVICRzeBxWTu60N4U0v1jhAFYnI5os2boMIRGtHEETfC8LRYT6AEB53J4Jyn-_s2eR6PkCG3k8omW69A4075pRKFXQF_kw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-surface-container via-transparent to-transparent"></div>
              <div className="absolute bottom-8 left-8 z-10">
                <span className="bg-secondary px-3 py-1 rounded-sm text-[0.65rem] font-bold uppercase tracking-widest text-on-secondary mb-4 inline-block">Trending</span>
                <h3 className="font-headline text-3xl font-bold text-white opacity-100">Capital Soundscapes</h3>
              </div>
            </div>
            {/* Vertical Card */}
            <div className="md:row-span-2 relative group overflow-hidden rounded-lg bg-surface-container aspect-[3/4] md:aspect-auto">
              <img 
                alt="Underground Noida scene" 
                className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuANCDoL8Jcus0Bznq5wAA8arYYJHemMS82qRyv4Qt85zGN1yGaFIoFM-gFKnsE5X7qxa2WuCIGmHPyI4zMP1QkH6pgB1Ha1FbZWMgGhPHCsyuLBipsjvKIFrkTQE-kQJ6nOfrm6Ese_FfMKgmzIs1uTPXR6NsTrubpx6ZzTyqtC2F97JM1L2_brVEsFDllJkl7fYxOnivqbp-bjIcykYnxv_V35SvQG7ywwIHq4X6dcBMLpPryjORHUfajWhKEU5IEPn0BqGDBVXlw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-surface-container via-transparent to-transparent"></div>
              <div className="absolute bottom-8 left-8 z-10">
                <h3 className="font-headline text-3xl font-bold leading-tight text-white">Noida <br/>Modernism</h3>
              </div>
            </div>
            {/* Horizontal Small 1 */}
            <div className="relative group overflow-hidden rounded-lg bg-surface-container min-h-[250px] md:min-h-0">
              <div className="absolute inset-0 bg-tertiary/10 mix-blend-overlay"></div>
              <div className="p-8 h-full flex flex-col justify-between relative z-10">
                <span className="material-symbols-outlined text-tertiary text-4xl">electric_bolt</span>
                <p className="font-headline font-bold text-xl uppercase tracking-tighter text-white">120+ Curated Venues</p>
              </div>
            </div>
            {/* Horizontal Small 2 */}
            <div className="relative group overflow-hidden rounded-lg bg-surface-container min-h-[250px] md:min-h-0">
              <img 
                alt="Electronic music decks" 
                className="absolute inset-0 w-full h-full object-cover opacity-30 grayscale group-hover:grayscale-0 transition-all duration-700" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCFgNasPa5IJgyQBqhevqyE8zvzznyWyvgSrSgutcGlgg90hJptHMj1xKpTgCKWDJ9mEXmvGAInZcTpjD3L49W5ORXkp0WKCpDoIjEDPOYZRNemYSz5LOFsVEaVxTTq9rz0i0_CXqr2xFSqa8yCUItTLTFepoLzbovB5kC_g8nf-HQASpkaF1r3NNJf37j7vyRbWrKMgTN8Y3w8VMlzzXVX7NZn6MaxA20SXNJgXOlZqJ8LDYHM0xgVWOLVf8aLNLjdx974IH6Nugg"
              />
              <div className="p-8 h-full flex flex-col justify-end relative z-10">
                <p className="font-headline font-bold text-xl uppercase tracking-tighter text-white">Exclusive Mixes</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Meet the Curators */}
      <section className="py-32 px-6 md:px-20 bg-surface-container-low">
        <div className="max-w-[1440px] mx-auto">
          <div className="mb-20 text-center">
            <h2 className="font-headline text-5xl font-black uppercase tracking-tighter mb-4 text-white">Meet The Curators</h2>
            <div className="w-24 h-[2px] bg-secondary mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Curator 1 */}
            <div className="flex flex-col gap-4 group">
              <div className="overflow-hidden rounded-lg aspect-[3/4] relative">
                <img 
                  alt="Yuvam profile" 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAeMt1TNl3H6CBB5FYUXA5WsRUdDsKKZwh5loUfmh8vlrompg_OOcl6AirCQAChvdgWnAaDFbgsrjEQSAhwUXllml8Ng_-TuCUVpYwAToYmaxuk0iSPPhrBtz_QXEo6GDBI0cHIhP2gEk_1hjC9wbSCKFk4Of8X7axmWN-ltyU7T2KVmJUe-CYYyxGhG3uDajBmuSvnGwTtLzwK6CBMmooPdGZIV4LHdty-BJ4b6YRR-AxLrxOnMKoILd69yVNKE53IzlNTK1MBK0w"
                />
                <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
              <div>
                <h4 className="font-headline text-xl font-bold text-white">Yuvam</h4>
                <p className="text-secondary font-label tracking-widest text-[10px] mb-2">FOUNDER / DELHI PRO</p>
                <p className="text-on-surface-variant text-sm italic">"My mission is to ensure that the spirit of the capital's underground never gets lost in the noise of the mainstream."</p>
              </div>
            </div>
            {/* Curator 2 */}
            <div className="flex flex-col gap-4 group">
              <div className="overflow-hidden rounded-lg aspect-[3/4] relative">
                <img 
                  alt="Aruna profile" 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAvuAZYfLocC-IGq8ZYKjvCv4GYV7bFh7DaEWrMlFBbs9JLTUGnzuu46KzFtMPb9TMPljONUxud-dlAcoXncflS28m1ro7ZTVmQsSsErnehqfU7IBYGfGdLzDbHAnwxB4kQZwmuxrWeMdyUwY5PBaiAWb12Sn5zTyiHja9Bej1SJ89l9Is0ZAWB_hXKVasb9go_qLxWgk5uUuaTELfbp935ZVNZS6YZWjyge3CvXiX0Zo5BDoRIN4c35y1Bluv3x84iTAAuMmtqnDc"
                />
              </div>
              <div>
                <h4 className="font-headline text-xl font-bold text-white">Aruna</h4>
                <p className="text-tertiary font-label tracking-widest text-[10px] mb-2">CREATIVE DIRECTOR & CO-FOUNDER</p>
                <p className="text-on-surface-variant text-sm italic">"We design experiences that challenge the status quo. If it's not electric, it's not DE·NE."</p>
              </div>
            </div>
            {/* Curator 3 */}
            <div className="flex flex-col gap-4 group">
              <div className="overflow-hidden rounded-lg aspect-[3/4] relative">
                <img 
                  alt="Abhishek profile" 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAWD6khvsXs6Z65ZYDBy7YzHntEKYwooZuNGnAEhIG7a8xSe-7MPqAKiQlD6P62mrswR_ZczcZg468b0CQ6N5KuADpnN9P2s_MJm4q51lalyS8qZXBJamu-cIAIM2aep2P2ml7WXqyet1Ft5VwTpBUC-OucXvdKvpA3QfmV2CFUUQ0tX3tV8upzw87ZDDrwJ9iY-a8leIHQkWqrHsjlEvHTzXNH6fMWW_7GMoDaEYefACRp_GClMzzqw3VXJWfdduPl4i2r1Z-HihQ"
                />
              </div>
              <div>
                <h4 className="font-headline text-xl font-bold text-white">Abhishek</h4>
                <p className="text-primary font-label tracking-widest text-[10px] mb-2">HEAD OF THE TALENT</p>
                <p className="text-on-surface-variant text-sm italic">"Searching for the artists who represent the next decade of the Delhi soundscape."</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 md:py-40 px-6 md:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-headline text-4xl md:text-5xl font-black uppercase mb-8 leading-[1.1] text-white">Ready to <br/><span className="text-primary">Join the Inner Circle?</span></h2>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/events" className="inline-block bg-secondary text-on-secondary px-8 py-3 rounded-full font-headline font-bold text-lg shadow-[0px_10px_30px_rgba(255,94,26,0.3)] hover:scale-105 transition-transform">
              Explore Events
            </Link>
            <Link href="/signin" className="inline-block glass-card border border-white/10 px-8 py-3 rounded-full font-headline font-bold text-lg text-white hover:bg-white/5 transition-colors">
              Partner With Us
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
