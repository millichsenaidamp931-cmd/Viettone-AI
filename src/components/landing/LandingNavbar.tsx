import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, ChevronDown, Globe, Menu, X, Check, Sparkles, BookOpen, Layers, Users } from 'lucide-react';
import beLacAvatarImg from '../../assets/images/be_lac_character_1794143374801.jpg';

interface LandingNavbarProps {
  onGoToApp: () => void;
  onOpenLogin?: () => void;
}

export const LandingNavbar: React.FC<LandingNavbarProps> = ({ onGoToApp, onOpenLogin }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Dropdown states
  const [productDropdownOpen, setProductDropdownOpen] = useState(false);
  const [solutionDropdownOpen, setSolutionDropdownOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState<'VI' | 'EN'>('VI');

  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setProductDropdownOpen(false);
        setSolutionDropdownOpen(false);
        setLangDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    setProductDropdownOpen(false);
    setSolutionDropdownOpen(false);
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-3 sm:px-6 pt-3 sm:pt-4 transition-all duration-300 pointer-events-none">
      <div
        ref={navRef}
        className={`max-w-6xl mx-auto px-4 sm:px-5 py-2 rounded-full border transition-all duration-300 pointer-events-auto flex items-center justify-between shadow-lg ${
          scrolled
            ? 'bg-[#FFFBF5]/95 backdrop-blur-md border-amber-300/80 shadow-amber-950/10'
            : 'bg-[#FFF9F2]/95 backdrop-blur-md border-amber-200/90 shadow-amber-950/5'
        }`}
      >
        {/* Left: Brand Logo & Divider */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-2 group cursor-pointer"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden border-2 border-[#FF5500] bg-amber-100 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <img
                src={beLacAvatarImg}
                alt="Bé Lạc"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex items-baseline">
              <span className="text-base sm:text-lg font-black text-[#172333] tracking-tight">
                VietTone
              </span>
              <span className="text-base sm:text-lg font-black text-[#FF5500] ml-1">
                AI
              </span>
            </div>
          </a>

          {/* Thin Vertical Divider (as in reference image) */}
          <div className="hidden md:block w-px h-5 bg-stone-300 ml-1 mr-0.5" aria-hidden="true" />
        </div>

        {/* Center Navigation Links (Matching reference image) */}
        <nav className="hidden lg:flex items-center gap-5 text-xs font-bold text-stone-800">
          {/* 1. Sản phẩm ˅ */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setProductDropdownOpen(!productDropdownOpen);
                setSolutionDropdownOpen(false);
                setLangDropdownOpen(false);
              }}
              className="flex items-center gap-1 hover:text-[#FF5500] py-1 transition-colors cursor-pointer"
            >
              <span>Sản phẩm</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${productDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {productDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-2xl border border-amber-200/90 p-2 shadow-xl animate-in fade-in slide-in-from-top-1 duration-150 z-50">
                <a
                  href="#features"
                  onClick={(e) => handleScrollTo(e, '#features')}
                  className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-amber-50/70 text-slate-800 transition-colors"
                >
                  <Sparkles className="w-4 h-4 text-[#FF5500]" />
                  <div>
                    <div className="font-bold text-xs">AI 6 Thanh Điệu</div>
                    <div className="text-[10px] text-slate-500 font-normal">Nhận diện CNN Spectrogram</div>
                  </div>
                </a>
                <a
                  href="#f0-explained"
                  onClick={(e) => handleScrollTo(e, '#f0-explained')}
                  className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-amber-50/70 text-slate-800 transition-colors"
                >
                  <Layers className="w-4 h-4 text-cyan-600" />
                  <div>
                    <div className="font-bold text-xs">Đường cao độ F0</div>
                    <div className="text-[10px] text-slate-500 font-normal">Web Audio YIN & DTW 0-100</div>
                  </div>
                </a>
              </div>
            )}
          </div>

          {/* 2. Giải pháp ˅ */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setSolutionDropdownOpen(!solutionDropdownOpen);
                setProductDropdownOpen(false);
                setLangDropdownOpen(false);
              }}
              className="flex items-center gap-1 hover:text-[#FF5500] py-1 transition-colors cursor-pointer"
            >
              <span>Giải pháp</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${solutionDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {solutionDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-60 bg-white rounded-2xl border border-amber-200/90 p-2 shadow-xl animate-in fade-in slide-in-from-top-1 duration-150 z-50">
                <div
                  onClick={() => {
                    setSolutionDropdownOpen(false);
                    onGoToApp();
                  }}
                  className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-amber-50/70 text-slate-800 transition-colors cursor-pointer"
                >
                  <BookOpen className="w-4 h-4 text-emerald-600" />
                  <div>
                    <div className="font-bold text-xs">Dành cho Học sinh</div>
                    <div className="text-[10px] text-slate-500 font-normal">Luyện nghe, nói và phản hồi tức thì</div>
                  </div>
                </div>
                <div
                  onClick={() => {
                    setSolutionDropdownOpen(false);
                    onGoToApp();
                  }}
                  className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-amber-50/70 text-slate-800 transition-colors cursor-pointer"
                >
                  <Users className="w-4 h-4 text-purple-600" />
                  <div>
                    <div className="font-bold text-xs">Dành cho Giáo viên</div>
                    <div className="text-[10px] text-slate-500 font-normal">Quản lý file mẫu chuẩn âm học</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 3. Học & Khám phá */}
          <a
            href="#how-it-works"
            onClick={(e) => handleScrollTo(e, '#how-it-works')}
            className="hover:text-[#FF5500] py-1 transition-colors"
          >
            Học & Khám phá
          </a>

          {/* 4. Về VietTone AI */}
          <a
            href="#roadmap"
            onClick={(e) => handleScrollTo(e, '#roadmap')}
            className="hover:text-[#FF5500] py-1 transition-colors"
          >
            Về VietTone AI
          </a>
        </nav>

        {/* Right Actions: Lang picker, Sign in, Try free */}
        <div className="hidden sm:flex items-center gap-2 sm:gap-2.5">
          {/* Language Selector: 🌐 VI ˅ */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setLangDropdownOpen(!langDropdownOpen);
                setProductDropdownOpen(false);
                setSolutionDropdownOpen(false);
              }}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold text-stone-700 hover:bg-amber-100/60 transition-colors cursor-pointer"
              title="Chọn ngôn ngữ"
            >
              <Globe className="w-3.5 h-3.5 text-stone-600" />
              <span>{currentLang}</span>
              <ChevronDown className="w-3 h-3 text-stone-500" />
            </button>

            {langDropdownOpen && (
              <div className="absolute top-full right-0 mt-1 w-28 bg-white rounded-xl border border-amber-200/90 py-1 shadow-lg z-50">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentLang('VI');
                    setLangDropdownOpen(false);
                  }}
                  className="w-full px-3 py-1.5 text-xs text-left font-bold flex items-center justify-between hover:bg-amber-50 text-slate-800"
                >
                  <span>Tiếng Việt</span>
                  {currentLang === 'VI' && <Check className="w-3 h-3 text-[#FF5500]" />}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentLang('EN');
                    setLangDropdownOpen(false);
                  }}
                  className="w-full px-3 py-1.5 text-xs text-left font-bold flex items-center justify-between hover:bg-amber-50 text-slate-800"
                >
                  <span>English</span>
                  {currentLang === 'EN' && <Check className="w-3 h-3 text-[#FF5500]" />}
                </button>
              </div>
            )}
          </div>

          {/* Sign in Button: "Đăng nhập" */}
          <button
            type="button"
            onClick={onOpenLogin || onGoToApp}
            className="px-3.5 py-1.5 rounded-full bg-stone-100/90 hover:bg-stone-200/90 text-stone-800 font-bold text-xs transition-colors cursor-pointer shadow-2xs border border-stone-200/60"
          >
            Đăng nhập
          </button>

          {/* Primary CTA: "Dùng thử miễn phí →" */}
          <button
            type="button"
            onClick={onGoToApp}
            className="group inline-flex items-center gap-1.5 px-4 sm:px-4.5 py-1.5 sm:py-2 rounded-full bg-gradient-to-r from-[#FF5500] to-[#FF7700] hover:from-[#E64D00] hover:to-[#FF6600] text-white font-bold text-xs sm:text-xs shadow-md shadow-orange-500/25 hover:shadow-orange-500/35 transition-all duration-200 cursor-pointer"
          >
            <span>Dùng thử miễn phí</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-1.5 rounded-full text-slate-700 hover:bg-amber-100/70 transition-colors pointer-events-auto"
          aria-label="Toggle Menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-2 max-w-sm mx-auto bg-[#FFFBF5]/95 backdrop-blur-md rounded-3xl border border-amber-200/90 p-4 space-y-3 shadow-xl pointer-events-auto animate-in fade-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col space-y-1.5 text-xs font-bold text-stone-800">
            <a
              href="#features"
              onClick={(e) => handleScrollTo(e, '#features')}
              className="px-3 py-2 rounded-xl hover:bg-amber-100/60 transition-colors"
            >
              Sản phẩm
            </a>
            <a
              href="#how-it-works"
              onClick={(e) => handleScrollTo(e, '#how-it-works')}
              className="px-3 py-2 rounded-xl hover:bg-amber-100/60 transition-colors"
            >
              Giải pháp
            </a>
            <a
              href="#f0-explained"
              onClick={(e) => handleScrollTo(e, '#f0-explained')}
              className="px-3 py-2 rounded-xl hover:bg-amber-100/60 transition-colors"
            >
              Học & Khám phá
            </a>
            <a
              href="#roadmap"
              onClick={(e) => handleScrollTo(e, '#roadmap')}
              className="px-3 py-2 rounded-xl hover:bg-amber-100/60 transition-colors"
            >
              Về VietTone AI
            </a>
          </nav>

          <div className="pt-2 border-t border-amber-200/60 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                if (onOpenLogin) onOpenLogin();
                else onGoToApp();
              }}
              className="flex-1 py-2 rounded-full bg-stone-100 text-stone-800 font-bold text-xs text-center"
            >
              Đăng nhập
            </button>
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onGoToApp();
              }}
              className="flex-1 py-2 rounded-full bg-gradient-to-r from-[#FF5500] to-[#FF7700] text-white font-bold text-xs text-center shadow-sm"
            >
              Dùng thử miễn phí
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
