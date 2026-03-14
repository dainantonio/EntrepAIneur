/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, Menu, X, Play, Mic, Waves, CheckCircle2, AlertCircle, MessageSquare, Sparkles, Send, Loader2, LogOut, User as UserIcon } from "lucide-react";
import { useState, useEffect, ChangeEvent, useRef, FormEvent } from "react";
import * as gemini from "./services/geminiService";
import { joinWaitlist, auth, db, googleProvider } from "./firebase";
import { onAuthStateChanged, signInWithPopup, signOut, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { OnboardingFlow } from "./components/OnboardingFlow";

const Navbar = ({ user, onLogin, onLogout }: { user: User | null, onLogin: () => void, onLogout: () => void }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <nav className="fixed top-0 left-0 w-full z-50">
      {/* Main Navbar Bar */}
      <div className="relative z-50 px-6 py-6 md:px-12 bg-espresso/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-amber-custom rounded-sm flex items-center justify-center">
              <span className="text-espresso font-display font-extrabold text-xl">E</span>
            </div>
            <span className="font-display font-bold text-2xl tracking-tight text-cream">
              Entrep<span className="text-amber-custom italic">AI</span>neur
            </span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#products" className="text-sm font-medium hover:text-amber-custom transition-colors">Products</a>
            <a href="#about" className="text-sm font-medium hover:text-amber-custom transition-colors">About</a>
            {user ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                  <img src={user.photoURL || ""} alt="" className="w-5 h-5 rounded-full" />
                  <span className="text-xs font-medium text-cream/70">{user.displayName?.split(' ')[0]}</span>
                </div>
                <button 
                  onClick={onLogout}
                  className="text-cream/40 hover:text-red-400 transition-colors"
                  title="Logout"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <button 
                onClick={onLogin}
                className="bg-cream text-espresso px-5 py-2 rounded-full text-sm font-bold hover:bg-amber-custom transition-all duration-300"
              >
                Login
              </button>
            )}
            <a 
              href="#waitlist" 
              className="border border-amber-custom/30 text-amber-custom px-5 py-2 rounded-full text-sm font-bold hover:bg-amber-custom hover:text-espresso transition-all duration-300"
            >
              Waitlist
            </a>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden text-cream p-2 -mr-2 z-50" 
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Overlay & Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-espresso/90 backdrop-blur-sm z-40 md:hidden"
            />
            
            {/* Slide-down Menu */}
            <motion.div 
              initial={{ y: "-100%" }}
              animate={{ y: 0 }}
              exit={{ y: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 w-full bg-espresso border-b border-white/10 pt-24 pb-12 px-6 z-40 md:hidden shadow-2xl"
            >
              <div className="flex flex-col gap-8">
                <a 
                  href="#products" 
                  className="text-3xl font-display font-bold text-cream hover:text-amber-custom transition-colors" 
                  onClick={() => setIsOpen(false)}
                >
                  Products
                </a>
                <a 
                  href="#about" 
                  className="text-3xl font-display font-bold text-cream hover:text-amber-custom transition-colors" 
                  onClick={() => setIsOpen(false)}
                >
                  About
                </a>
                <a 
                  href="#waitlist" 
                  className="text-3xl font-display font-bold text-amber-custom" 
                  onClick={() => setIsOpen(false)}
                >
                  Join Waitlist
                </a>

                {user ? (
                  <div className="mt-4 flex flex-col gap-4">
                    <div className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl border border-white/10">
                      <img src={user.photoURL || ""} alt="" className="w-10 h-10 rounded-full" />
                      <div>
                        <p className="font-bold text-cream">{user.displayName}</p>
                        <p className="text-xs text-cream/40">{user.email}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        onLogout();
                        setIsOpen(false);
                      }}
                      className="flex items-center justify-center gap-2 bg-red-500/10 text-red-400 py-4 rounded-2xl font-bold border border-red-500/20"
                    >
                      <LogOut size={20} /> Logout
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => {
                      onLogin();
                      setIsOpen(false);
                    }}
                    className="bg-cream text-espresso py-4 rounded-2xl font-bold text-xl hover:bg-amber-custom transition-all"
                  >
                    Login to EntrepAIneur
                  </button>
                )}
                
                <div className="mt-8 pt-8 border-t border-white/10">
                  <p className="text-sm text-cream/50 font-medium mb-4 uppercase tracking-widest">Connect with us</p>
                  <div className="flex gap-6">
                    <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-cream hover:bg-amber-custom hover:text-espresso transition-all">
                      <Send size={18} />
                    </div>
                    <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-cream hover:bg-amber-custom hover:text-espresso transition-all">
                      <MessageSquare size={18} />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setIsAuthReady(true);
      if (currentUser) {
        const docRef = doc(db, 'profiles', currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfile(docSnap.data());
          setShowOnboarding(false);
        } else {
          setShowOnboarding(true);
        }
      } else {
        setProfile(null);
        setShowOnboarding(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const [isListening, setIsListening] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    business: ''
  });
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    business: false
  });

  // AI States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showQualifier, setShowQualifier] = useState(false);
  const [qualifierData, setQualifierData] = useState<any>(null);
  const [qualifierAnswers, setQualifierAnswers] = useState<string[]>([]);
  
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<{role: string, text: string}[]>([
    { role: "model", text: "Hey — tell me about your business. What do you do, and where are you based?" }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const [pitchInput, setPitchInput] = useState({ type: '', market: '' });
  const [pitchResult, setPitchResult] = useState("");
  const [isPitchLoading, setIsPitchLoading] = useState(false);

  const [activeProduct, setActiveProduct] = useState<any>(null);
  const [productQuestion, setProductQuestion] = useState("");
  const [productAnswer, setProductAnswer] = useState("");
  const [isExplainerLoading, setIsExplainerLoading] = useState(false);
  const [productFilter, setProductFilter] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages]);

  // Speech Recognition
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setChatInput(transcript);
        setIsChatOpen(true);
        setIsListening(false);
      };

      rec.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        if (event.error === 'not-allowed') {
          alert("Microphone access was denied. Please enable it in your browser settings to use voice features.");
        } else {
          alert(`Speech recognition error: ${event.error}`);
        }
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      setRecognition(rec);
    }
  }, []);

  const toggleListening = () => {
    if (!recognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      recognition.start();
      setIsListening(true);
    }
  };

  const handleChatSubmit = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    const userMsg = { role: "user", text: chatInput };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput("");
    setIsChatLoading(true);
    setIsTyping(true);

    try {
      const history = chatMessages.map(m => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.text }]
      }));
      const response = await gemini.chatWithAI(chatInput, history);
      setChatMessages(prev => [...prev, { role: "model", text: response }]);
    } catch (error: any) {
      console.error(error);
      const errorMsg = error.message || "Sorry, I ran into an error. Please try again later.";
      setChatMessages(prev => [...prev, { role: "model", text: errorMsg }]);
      alert(`Chat Error: ${errorMsg}`);
    } finally {
      setIsChatLoading(false);
      setIsTyping(false);
    }
  };

  const renderMessageText = (text: string) => {
    const products = ["YardHub", "NotaryOS", "TrustFix", "FarmWise", "YardieBiz"];
    let parts: (string | any)[] = [text];

    products.forEach(product => {
      const newParts: (string | any)[] = [];
      parts.forEach(part => {
        if (typeof part === 'string') {
          const regex = new RegExp(`(${product})`, 'g');
          const split = part.split(regex);
          split.forEach(s => {
            if (s === product) {
              newParts.push(
                <span key={Math.random()} className="inline-block bg-amber-custom/20 border border-amber-custom/30 text-amber-custom px-2 py-0.5 rounded-md font-bold mx-1">
                  {s}
                </span>
              );
            } else if (s) {
              newParts.push(s);
            }
          });
        } else {
          newParts.push(part);
        }
      });
      parts = newParts;
    });

    return parts;
  };

  const handlePitchGenerate = async () => {
    if (!pitchInput.type || !pitchInput.market) return;
    setIsPitchLoading(true);
    try {
      const result = await gemini.generateElevatorPitch(pitchInput.type, pitchInput.market);
      setPitchResult(result);
    } catch (error: any) {
      console.error(error);
      alert(`Failed to generate pitch: ${error.message || "Unknown error"}`);
    } finally {
      setIsPitchLoading(false);
    }
  };

  const handleProductExplain = async () => {
    if (!productQuestion.trim() || !activeProduct) return;
    setIsExplainerLoading(true);
    try {
      const result = await gemini.explainProduct(activeProduct.name, productQuestion);
      setProductAnswer(result);
    } catch (error: any) {
      console.error(error);
      alert(`Failed to explain product: ${error.message || "Unknown error"}`);
    } finally {
      setIsExplainerLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isFieldValid('name', formData.name) || !isFieldValid('email', formData.email) || !isFieldValid('business', formData.business)) {
      setTouched({ name: true, email: true, business: true });
      return;
    }

    setIsSubmitting(true);
    try {
      const data = await gemini.getWaitlistQuestions(formData.business);
      setQualifierData(data);
      setQualifierAnswers(new Array(data.questions.length).fill(""));
      setShowQualifier(true);
      
      // Save to Firebase
      await joinWaitlist({
        name: formData.name,
        email: formData.email,
        business: formData.business,
        productInterest: data.recommendedProduct
      });
    } catch (error: any) {
      console.error(error);
      alert(`Failed to join waitlist: ${error.message || "Unknown error"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Auto-stop listening after 3 seconds for demo purposes
  useEffect(() => {
    if (isListening) {
      const timer = setTimeout(() => setIsListening(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isListening]);

  const validateEmail = (email: string) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

  const getFieldError = (name: string, value: string) => {
    if (!touched[name as keyof typeof touched]) return null;
    if (name === 'name' && value.length > 0 && value.length < 2) return "Name must be at least 2 characters";
    if (name === 'email' && value.length > 0 && !validateEmail(value)) return "Please enter a valid email address";
    if (name === 'business' && value.length > 0 && value.length < 10) return "Please tell us a bit more about your business";
    return null;
  };

  const isFieldValid = (name: string, value: string) => {
    if (value.length === 0) return false;
    return getFieldError(name, value) === null;
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  return (
    <div className="min-h-screen selection:bg-amber-custom selection:text-espresso">
      <Navbar user={user} onLogin={handleLogin} onLogout={handleLogout} />

      <AnimatePresence>
        {showOnboarding && (
          <OnboardingFlow onComplete={() => setShowOnboarding(false)} />
        )}
      </AnimatePresence>

      <main>
        <section className="relative min-h-screen flex flex-col justify-center overflow-hidden pt-32 pb-20">
          {/* Background Texture/Gradient */}
          <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,#CC7722_0%,transparent_50%)] opacity-30" />
            <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_80%,#F2A900_0%,transparent_40%)] opacity-20" />
          </div>

          <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
            
            {/* Text Content */}
            <div className="lg:col-span-7 flex flex-col gap-8">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <span className="inline-block px-3 py-1 bg-ochre/20 border border-ochre/30 text-ochre text-xs font-bold uppercase tracking-widest rounded-md mb-6">
                  Now in Private Beta
                </span>
                <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-extrabold leading-[1.1] tracking-tighter text-balance">
                  The AI built for <br />
                  <span className="text-amber-custom italic font-serif font-medium inline-block py-1">how you actually</span> work
                </h1>
              </motion.div>

              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-lg md:text-xl text-cream/70 max-w-xl leading-relaxed font-light"
              >
                Voice-first. WhatsApp-ready. Built for the builder the tools industry forgot. 
                Manage your shop, track your trades, and grow your business with the power of AI in your pocket.
              </motion.p>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="flex flex-col sm:flex-row gap-4 pt-4"
              >
                <button 
                  onClick={user ? () => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' }) : handleLogin}
                  className="group relative bg-amber-custom text-espresso px-8 py-4 rounded-full font-bold text-lg flex items-center justify-center gap-2 overflow-hidden transition-all hover:scale-105 active:scale-95"
                >
                  <span className="relative z-10">{user ? "View Products" : "Get Started"}</span>
                  <ArrowRight className="relative z-10 group-hover:translate-x-1 transition-transform" size={20} />
                  <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity" />
                </button>
                
                <a 
                  href="#waitlist" 
                  className="group border border-white/20 hover:border-white/40 px-8 py-4 rounded-full font-bold text-lg flex items-center justify-center gap-2 transition-all hover:bg-white/5 active:scale-95 text-white"
                >
                  <span>Join Waitlist</span>
                </a>
              </motion.div>

              {/* Trust Indicators */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 1 }}
                className="flex items-center gap-4 pt-8 border-t border-white/10 mt-4"
              >
                <div className="flex -space-x-3">
                  {['entrepreneur-1', 'entrepreneur-2', 'entrepreneur-3', 'entrepreneur-4'].map((seed, i) => (
                    <img 
                      key={i}
                      src={`https://picsum.photos/seed/${seed}/100/100`} 
                      alt="User" 
                      className="w-10 h-10 rounded-full border-2 border-espresso object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ))}
                </div>
                <p className="text-sm text-cream/50 font-medium">
                  Trusted by <span className="text-cream">500+ builders</span> across the Caribbean
                </p>
              </motion.div>
            </div>

            {/* Hero Image Container */}
            <div className="lg:col-span-5 relative">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, rotate: 2 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="relative aspect-[4/5] w-full max-w-md mx-auto"
              >
                {/* Image Frame */}
                <div className="absolute inset-0 border-2 border-amber-custom/30 rounded-3xl translate-x-4 translate-y-4 -z-10" />
                <div className="relative h-full w-full overflow-hidden rounded-3xl shadow-2xl border border-white/10">
                  <img 
                    src="https://picsum.photos/seed/caribbean-business-owner/800/1000" 
                    alt="Entrepreneur at work" 
                    className="w-full h-full object-cover grayscale-[0.1] contrast-110 brightness-105"
                    referrerPolicy="no-referrer"
                  />
                  {/* Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-espresso/80 via-transparent to-transparent" />
                  
                  {/* Floating UI Element (Subtle) */}
                  <motion.div 
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute bottom-8 left-8 right-8 bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl flex items-center gap-4"
                  >
                    <div className="w-10 h-10 bg-amber-custom rounded-full flex items-center justify-center">
                      <div className="w-4 h-4 bg-espresso rounded-full animate-pulse" />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-tighter text-amber-custom">Voice Assistant Active</p>
                      <p className="text-sm font-medium text-white">"Record 20 units of coffee sold..."</p>
                    </div>
                  </motion.div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-ochre/20 rounded-full blur-3xl" />
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-amber-custom/10 rounded-full blur-3xl" />
              </motion.div>
            </div>
          </div>

          {/* Floating Voice Action Button */}
          <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-4">
            <AnimatePresence>
              {isListening && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: 20 }}
                  className="bg-amber-custom text-espresso px-4 py-2 rounded-2xl shadow-2xl font-bold text-sm flex items-center gap-2 mb-2"
                >
                  <Waves className="animate-pulse" size={16} />
                  <span>Listening...</span>
                </motion.div>
              )}
            </AnimatePresence>
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleListening}
              className={`relative w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(242,169,0,0.3)] transition-colors duration-500 ${
                isListening ? 'bg-white text-ochre' : 'bg-amber-custom text-espresso'
              }`}
            >
              {/* Pulse Rings */}
              {isListening && (
                <>
                  <motion.div 
                    initial={{ scale: 1, opacity: 0.5 }}
                    animate={{ scale: 2, opacity: 0 }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="absolute inset-0 bg-amber-custom rounded-full"
                  />
                  <motion.div 
                    initial={{ scale: 1, opacity: 0.3 }}
                    animate={{ scale: 2.5, opacity: 0 }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                    className="absolute inset-0 bg-amber-custom rounded-full"
                  />
                </>
              )}
              
              <Mic size={isListening ? 32 : 36} className="relative z-10" />
              
              {/* Explanatory Tooltip */}
              <AnimatePresence>
                {!isListening && (
                  <motion.div
                    initial={{ opacity: 0, x: 20, scale: 0.8 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 20, scale: 0.8 }}
                    transition={{ delay: 1 }}
                    className="absolute right-full mr-4 top-1/2 -translate-y-1/2 whitespace-nowrap pointer-events-none"
                  >
                    <div className="bg-espresso/90 backdrop-blur-md border border-white/10 px-4 py-2 rounded-xl shadow-2xl">
                      <p className="text-xs font-bold text-cream flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-amber-custom rounded-full animate-pulse" />
                        Tap to speak to the AI assistant
                      </p>
                      {/* Tooltip Arrow */}
                      <div className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-2 bg-espresso rotate-45 border-r border-t border-white/10" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </section>

        {/* Feature Grid Preview (Brief) */}
        <section className="py-24 bg-cream text-espresso">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="flex flex-col gap-4">
                <div className="w-12 h-12 bg-ochre/10 rounded-xl flex items-center justify-center text-ochre">
                  <Menu size={24} />
                </div>
                <h3 className="font-display font-bold text-2xl">Inventory by Voice</h3>
                <p className="text-espresso/70">Just speak to your phone. We handle the counting, so you can handle the customers.</p>
              </div>
              <div className="flex flex-col gap-4">
                <div className="w-12 h-12 bg-ochre/10 rounded-xl flex items-center justify-center text-ochre">
                  <ArrowRight size={24} />
                </div>
                <h3 className="font-display font-bold text-2xl">WhatsApp Native</h3>
                <p className="text-espresso/70">No new apps to learn. Run your entire business through the chat you already use.</p>
              </div>
              <div className="flex flex-col gap-4">
                <div className="w-12 h-12 bg-ochre/10 rounded-xl flex items-center justify-center text-ochre">
                  <Play size={24} />
                </div>
                <h3 className="font-display font-bold text-2xl">Offline First</h3>
                <p className="text-espresso/70">Spotty connection? No problem. EntrepAIneur works wherever you are.</p>
              </div>
            </div>
          </div>
        </section>

        {/* WhatsApp Integration Section */}
        <section className="py-24 bg-espresso relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="order-2 lg:order-1"
              >
                <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl border border-white/10">
                  <img 
                    src="https://picsum.photos/seed/whatsapp-business/1200/800" 
                    alt="WhatsApp Business Interface" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-espresso/40 to-transparent" />
                </div>
              </motion.div>
              <div className="order-1 lg:order-2">
                <span className="text-amber-custom font-bold text-xs uppercase tracking-widest mb-4 block">Zero Learning Curve</span>
                <h2 className="font-display text-4xl md:text-5xl font-bold mb-6 leading-tight">Your business, <br /><span className="text-amber-custom">inside WhatsApp.</span></h2>
                <p className="text-cream/60 text-lg mb-8 leading-relaxed">
                  No new apps to download. No complex dashboards. EntrepAIneur lives where you already are. 
                  Send a voice note to track a sale. Snap a photo of a receipt to log an expense. 
                  It's that simple.
                </p>
                <ul className="space-y-4">
                  {[
                    "Voice-to-inventory tracking",
                    "Automated daily sales summaries",
                    "Customer debt reminders",
                    "Supplier price comparisons"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-cream/80">
                      <div className="w-5 h-5 bg-amber-custom/20 rounded-full flex items-center justify-center text-amber-custom">
                        <CheckCircle2 size={14} />
                      </div>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* AI Product Finder CTA */}
        <section className="py-24 bg-espresso border-y border-white/5 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-custom/5 via-transparent to-transparent opacity-50" />
          <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
            <h2 className="font-display text-4xl md:text-6xl font-bold mb-8 leading-tight">
              Not sure where to start? <br />
              <span className="text-amber-custom">Find your product in 60 seconds.</span>
            </h2>
            <p className="text-cream/50 text-lg mb-12 max-w-2xl mx-auto">
              Our AI assistant understands the hustle. Tell us what you do, and we'll point you to the right tool for your trade.
            </p>
            <button 
              onClick={() => setIsChatOpen(true)}
              className="bg-amber-custom text-espresso font-bold px-10 py-5 rounded-full text-xl hover:scale-105 transition-all shadow-[0_0_40px_rgba(242,169,0,0.2)]"
            >
              Start AI Consultation
            </button>
          </div>
        </section>

        {/* Products Grid Section */}
        <section id="products" className="py-24 bg-espresso relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
            <div className="text-center mb-16">
              <h2 className="font-display text-4xl md:text-6xl font-bold mb-6">Built for your vertical</h2>
              <p className="text-cream/60 max-w-2xl mx-auto">Specific tools for specific trades. No generic software, just AI that understands your business.</p>
              
              {productFilter && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8 flex items-center justify-center gap-4"
                >
                  <span className="text-sm text-cream/40 uppercase tracking-widest font-bold">Filtering by:</span>
                  <div className="flex items-center gap-2 bg-amber-custom/20 border border-amber-custom/30 px-4 py-2 rounded-full">
                    <span className="text-amber-custom font-bold text-sm">{productFilter}</span>
                    <button 
                      onClick={() => setProductFilter(null)}
                      className="text-amber-custom hover:text-white transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </motion.div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { 
                  name: "YardHub", 
                  desc: "Financial operating system for Caribbean informal vendors.", 
                  detailedDesc: "YardHub provides a full suite of financial tools designed specifically for the informal economy. From credit scoring based on alternative data to seamless WhatsApp-integrated payments, we help vendors professionalize and grow their businesses.",
                  image: "https://picsum.photos/seed/finance/800/600",
                  link: "#",
                  icon: "💰", 
                  color: "emerald" 
                },
                { 
                  name: "NotaryOS", 
                  desc: "Agentic AI platform for mobile notary professionals in the US.", 
                  detailedDesc: "NotaryOS automates the complex workflow of mobile notaries. It handles job scheduling, intelligent document generation, and strict compliance tracking, allowing professionals to focus on their clients instead of paperwork.",
                  image: "https://picsum.photos/seed/notary/800/600",
                  link: "#",
                  icon: "✒️", 
                  color: "amber" 
                },
                { 
                  name: "TrustFix", 
                  desc: "Home services marketplace connecting homeowners with vetted local trades.", 
                  detailedDesc: "TrustFix is a consumer-first platform that uses AI to vet and match local tradespeople with homeowners. We prioritize transparency, quality, and fair pricing in the home services industry.",
                  image: "https://picsum.photos/seed/trades/800/600",
                  link: "#",
                  icon: "🛠️", 
                  color: "blue" 
                },
                { 
                  name: "FarmWise", 
                  desc: "AI farming intelligence for smallholder farmers.", 
                  detailedDesc: "FarmWise brings high-tech agricultural insights to smallholder farms. Our AI analyzes weather patterns, soil data, and market pricing to provide actionable crop planning and yield optimization strategies.",
                  image: "https://picsum.photos/seed/farming/800/600",
                  link: "#",
                  icon: "🌱", 
                  color: "indigo" 
                },
                { 
                  name: "YardieBiz", 
                  desc: "WhatsApp AI business assistant for Jamaican food vendors.", 
                  detailedDesc: "YardieBiz lives where vendors already work: WhatsApp. Our AI assistant tracks daily sales, manages inventory, and provides simple financial summaries via voice or text messages.",
                  image: "https://picsum.photos/seed/food/800/600",
                  link: "#",
                  icon: "🍱", 
                  color: "pink" 
                }
              ].filter(p => !productFilter || p.name === productFilter).map((product, i) => (
                <motion.div
                  key={product.name}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -10 }}
                  className="group bg-white/5 border border-white/10 p-8 rounded-[2rem] hover:bg-white/10 transition-all flex flex-col"
                >
                  <div className="text-4xl mb-6">{product.icon}</div>
                  <h3 className="font-display text-2xl font-bold mb-3 group-hover:text-amber-custom transition-colors">{product.name}</h3>
                  <p className="text-cream/50 text-sm leading-relaxed mb-6 flex-1">{product.desc}</p>
                  <div className="flex flex-wrap gap-2 mb-6">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setProductFilter(product.name);
                      }}
                      className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full transition-all border ${
                        productFilter === product.name 
                          ? 'bg-amber-custom border-amber-custom text-espresso' 
                          : 'bg-white/5 border-white/10 text-cream/40 hover:border-amber-custom/50 hover:text-amber-custom'
                      }`}
                    >
                      {product.name}
                    </button>
                  </div>
                  <div className="flex flex-col gap-4">
                    <button 
                      onClick={() => {
                        setActiveProduct(product);
                        setProductAnswer("");
                        setProductQuestion("");
                      }}
                      className="w-full bg-white/5 border border-white/10 text-cream font-bold py-3 rounded-xl hover:bg-amber-custom hover:text-espresso transition-all flex items-center justify-center gap-2 text-sm"
                    >
                      View Details <ArrowRight size={16} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Elevator Pitch Generator Section */}
        <section className="py-24 bg-ochre/10 relative">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <Sparkles className="mx-auto text-amber-custom mb-6" size={48} />
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-8 text-cream">Generate Your Elevator Pitch</h2>
            <div className="bg-espresso/50 backdrop-blur-md p-8 rounded-[2rem] border border-white/10 shadow-2xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="text-left">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-ochre mb-2 block">Business Type</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Mobile Mechanic"
                    value={pitchInput.type}
                    onChange={(e) => setPitchInput(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-cream focus:outline-none focus:border-amber-custom"
                  />
                </div>
                <div className="text-left">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-ochre mb-2 block">Target Market</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Kingston, Jamaica"
                    value={pitchInput.market}
                    onChange={(e) => setPitchInput(prev => ({ ...prev, market: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-cream focus:outline-none focus:border-amber-custom"
                  />
                </div>
              </div>
              <button 
                onClick={handlePitchGenerate}
                disabled={isPitchLoading || !pitchInput.type || !pitchInput.market}
                className="bg-amber-custom text-espresso font-bold px-8 py-4 rounded-full hover:scale-105 transition-all disabled:opacity-50 disabled:scale-100"
              >
                {isPitchLoading ? <Loader2 className="animate-spin mx-auto" /> : "Generate Pitch"}
              </button>

              <AnimatePresence>
                {pitchResult && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-8 p-6 bg-white/5 rounded-2xl border border-amber-custom/20 text-left"
                  >
                    <p className="text-cream/90 italic leading-relaxed">"{pitchResult}"</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </section>

        {/* Waitlist Form Section */}
        <section id="waitlist" className="py-24 bg-espresso border-t border-white/10 relative overflow-hidden">
          {/* Subtle background element */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-ochre/5 rounded-full blur-[120px] pointer-events-none" />
          
          <div className="max-w-3xl mx-auto px-6 relative z-10">
            <div className="text-center mb-12">
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="font-display text-4xl md:text-5xl font-bold mb-4"
              >
                Join the Waitlist
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-cream/60"
              >
                Be the first to build with EntrepAIneur in your market. 
                Tell us what you do, and we'll reach out.
              </motion.p>
            </div>

            <motion.form 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="space-y-8 bg-white/5 backdrop-blur-sm border border-white/10 p-8 md:p-12 rounded-[2rem]"
              onSubmit={(e) => e.preventDefault()}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Full Name Field */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  className="flex flex-col gap-3"
                >
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-ochre">Full Name</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`w-full bg-espresso/50 border rounded-xl px-5 py-4 focus:outline-none transition-all text-cream placeholder:text-cream/20 ${
                        getFieldError('name', formData.name) 
                          ? 'border-red-500/50 focus:border-red-500' 
                          : isFieldValid('name', formData.name)
                            ? 'border-emerald-500/50 focus:border-emerald-500'
                            : 'border-white/10 focus:border-amber-custom'
                      }`} 
                      placeholder="e.g. Marcus Garvey" 
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      {isFieldValid('name', formData.name) && <CheckCircle2 className="text-emerald-500" size={20} />}
                      {getFieldError('name', formData.name) && <AlertCircle className="text-red-500" size={20} />}
                    </div>
                  </div>
                  <AnimatePresence>
                    {getFieldError('name', formData.name) && (
                      <motion.p 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-[10px] text-red-500 font-medium"
                      >
                        {getFieldError('name', formData.name)}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Email Field */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                  className="flex flex-col gap-3"
                >
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-ochre">Email Address</label>
                  <div className="relative">
                    <input 
                      type="email" 
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full bg-espresso/50 border rounded-xl px-5 py-4 focus:outline-none transition-all text-cream placeholder:text-cream/20 ${
                        getFieldError('email', formData.email) 
                          ? 'border-red-500/50 focus:border-red-500' 
                          : isFieldValid('email', formData.email)
                            ? 'border-emerald-500/50 focus:border-emerald-500'
                            : 'border-white/10 focus:border-amber-custom'
                      }`} 
                      placeholder="marcus@example.com" 
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      {isFieldValid('email', formData.email) && <CheckCircle2 className="text-emerald-500" size={20} />}
                      {getFieldError('email', formData.email) && <AlertCircle className="text-red-500" size={20} />}
                    </div>
                  </div>
                  <AnimatePresence>
                    {getFieldError('email', formData.email) && (
                      <motion.p 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-[10px] text-red-500 font-medium"
                      >
                        {getFieldError('email', formData.email)}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>

              {/* Business Description Field */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
                className="flex flex-col gap-3"
              >
                <div className="flex justify-between items-end">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-ochre">Tell us about your business</label>
                  <span className="text-[10px] text-cream/30 font-medium italic">Voice input enabled</span>
                </div>
                <div className="relative group">
                  <textarea 
                    name="business"
                    value={formData.business}
                    onChange={handleInputChange}
                    className={`w-full bg-espresso/50 border rounded-2xl px-5 py-5 pr-16 focus:outline-none transition-all text-cream placeholder:text-cream/20 min-h-[160px] resize-none ${
                      getFieldError('business', formData.business) 
                        ? 'border-red-500/50 focus:border-red-500' 
                        : isFieldValid('business', formData.business)
                          ? 'border-emerald-500/50 focus:border-emerald-500'
                          : 'border-white/10 focus:border-amber-custom'
                    }`} 
                    placeholder="I run a construction trade in Bridgetown and need to track materials..."
                  />
                  
                  {/* Voice Input Button in Form */}
                  <div className="absolute right-3 top-3 flex flex-col items-center gap-2">
                    <motion.button 
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setIsListening(!isListening)}
                      className={`relative p-3 rounded-xl transition-all flex items-center justify-center group/voice ${
                        isListening 
                          ? 'bg-white text-amber-custom shadow-[0_0_20px_rgba(255,255,255,0.2)]' 
                          : 'bg-white/5 text-cream/40 hover:text-amber-custom hover:bg-white/10'
                      }`}
                      title="Click to dictate"
                    >
                      {/* Pulse Rings for Form Button */}
                      {isListening && (
                        <>
                          <motion.div 
                            initial={{ scale: 1, opacity: 0.5 }}
                            animate={{ scale: 1.8, opacity: 0 }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="absolute inset-0 bg-white rounded-xl"
                          />
                        </>
                      )}

                      {isListening ? (
                        <div className="flex gap-1 items-center relative z-10">
                          <span className="text-[9px] font-bold uppercase tracking-tighter mr-1">Listening</span>
                          <motion.div animate={{ height: [6, 12, 6] }} transition={{ repeat: Infinity, duration: 0.5 }} className="w-0.5 bg-amber-custom rounded-full" />
                          <motion.div animate={{ height: [10, 4, 10] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-0.5 bg-amber-custom rounded-full" />
                          <motion.div animate={{ height: [4, 10, 4] }} transition={{ repeat: Infinity, duration: 0.4 }} className="w-0.5 bg-amber-custom rounded-full" />
                        </div>
                      ) : (
                        <Mic size={22} className="relative z-10" />
                      )}
                    </motion.button>
                    <div className="flex flex-col gap-1">
                      {isFieldValid('business', formData.business) && <CheckCircle2 className="text-emerald-500" size={20} />}
                      {getFieldError('business', formData.business) && <AlertCircle className="text-red-500" size={20} />}
                    </div>
                  </div>
                </div>
                <AnimatePresence>
                  {getFieldError('business', formData.business) && (
                    <motion.p 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-[10px] text-red-500 font-medium"
                    >
                      {getFieldError('business', formData.business)}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>

              <motion.button 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95, transition: { type: "spring", stiffness: 400, damping: 10 } }}
                disabled={isSubmitting}
                onClick={handleSubmit}
                className="w-full group relative bg-amber-custom text-espresso font-bold py-5 rounded-2xl overflow-hidden transition-all hover:shadow-[0_0_30px_rgba(242,169,0,0.2)] active:scale-[0.98] disabled:opacity-50"
              >
                <span className="relative z-10 flex items-center justify-center gap-2 text-lg">
                  {isSubmitting ? <Loader2 className="animate-spin" /> : "Submit Application"}
                  {!isSubmitting && <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />}
                </span>
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity" />
              </motion.button>
            </motion.form>
          </div>
        </section>

        {/* Waitlist Qualifier Modal */}
        <AnimatePresence>
          {showQualifier && qualifierData && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowQualifier(false)}
                className="absolute inset-0 bg-espresso/90 backdrop-blur-md"
              />
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="relative bg-white/5 border border-white/10 p-8 md:p-12 rounded-[2.5rem] max-w-2xl w-full shadow-2xl"
              >
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <span className="text-amber-custom font-bold text-xs uppercase tracking-widest mb-2 block">AI Qualifier</span>
                    <h2 className="font-display text-3xl font-bold">Welcome to the inner circle</h2>
                  </div>
                  <button onClick={() => setShowQualifier(false)} className="text-cream/40 hover:text-cream"><X /></button>
                </div>

                <div className="mb-8 p-6 bg-amber-custom/10 border border-amber-custom/20 rounded-2xl">
                  <p className="text-amber-custom font-bold mb-2">Recommended: {qualifierData.recommendedProduct}</p>
                  <p className="text-cream/70 text-sm">{qualifierData.reasoning}</p>
                </div>

                <div className="space-y-6">
                  {qualifierData.questions.map((q: string, i: number) => (
                    <div key={i} className="space-y-2">
                      <p className="text-sm font-medium text-cream/80">{q}</p>
                      <input 
                        type="text" 
                        value={qualifierAnswers[i]}
                        onChange={(e) => {
                          const newAnswers = [...qualifierAnswers];
                          newAnswers[i] = e.target.value;
                          setQualifierAnswers(newAnswers);
                        }}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-cream focus:outline-none focus:border-amber-custom"
                      />
                    </div>
                  ))}
                </div>

                <button 
                  onClick={() => setShowQualifier(false)}
                  className="w-full mt-8 bg-cream text-espresso font-bold py-4 rounded-xl hover:bg-amber-custom transition-all"
                >
                  Complete Profile
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Product Explainer Modal */}
        <AnimatePresence>
          {activeProduct && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setActiveProduct(null)}
                className="absolute inset-0 bg-espresso/90 backdrop-blur-md"
              />
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="relative bg-white/5 border border-white/10 p-8 md:p-12 rounded-[2.5rem] max-w-3xl w-full shadow-2xl overflow-y-auto max-h-[90vh]"
              >
                <div className="flex justify-between items-start mb-8">
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">{activeProduct.icon}</div>
                    <div>
                      <span className="text-amber-custom font-bold text-xs uppercase tracking-widest mb-1 block">Product Deep Dive</span>
                      <h2 className="font-display text-3xl font-bold">{activeProduct.name}</h2>
                    </div>
                  </div>
                  <button onClick={() => setActiveProduct(null)} className="text-cream/40 hover:text-cream"><X /></button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  <div className="rounded-2xl overflow-hidden border border-white/10 aspect-video md:aspect-square">
                    <img 
                      src={activeProduct.image} 
                      alt={activeProduct.name} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="flex flex-col justify-center">
                    <p className="text-cream/80 leading-relaxed mb-6">{activeProduct.detailedDesc}</p>
                    <a 
                      href={activeProduct.link}
                      className="inline-flex items-center gap-2 text-amber-custom font-bold hover:underline"
                    >
                      Learn more at official site <ArrowRight size={16} />
                    </a>
                  </div>
                </div>

                <div className="space-y-4 mb-8 pt-8 border-t border-white/10">
                  <p className="text-sm font-bold text-ochre uppercase tracking-widest">Ask AI about this product</p>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="How does this handle offline sales?"
                      value={productQuestion}
                      onChange={(e) => setProductQuestion(e.target.value)}
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-cream focus:outline-none focus:border-amber-custom"
                    />
                    <button 
                      onClick={handleProductExplain}
                      disabled={isExplainerLoading || !productQuestion.trim()}
                      className="bg-amber-custom text-espresso p-3 rounded-xl hover:scale-105 transition-all disabled:opacity-50"
                    >
                      {isExplainerLoading ? <Loader2 className="animate-spin" /> : <Send size={20} />}
                    </button>
                  </div>
                </div>

                <AnimatePresence>
                  {productAnswer && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-6 bg-white/5 rounded-2xl border border-amber-custom/20"
                    >
                      <p className="text-cream/90 text-sm leading-relaxed">{productAnswer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Chat Widget */}
        <div className="fixed bottom-32 right-8 z-[60] flex flex-col items-end gap-4">
          <AnimatePresence>
            {isChatOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20, transformOrigin: "bottom right" }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="w-[350px] md:w-[400px] h-[500px] bg-espresso border border-white/10 rounded-[2rem] shadow-2xl flex flex-col overflow-hidden"
              >
                <div className="p-6 bg-white/5 border-b border-white/10 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-amber-custom rounded-full flex items-center justify-center text-espresso">
                      <Sparkles size={16} />
                    </div>
                    <div>
                      <p className="font-bold text-sm">EntrepAIneur Assistant</p>
                      <p className="text-[10px] text-emerald-500 flex items-center gap-1">
                        <span className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
                        Online
                      </p>
                    </div>
                  </div>
                  <button onClick={() => setIsChatOpen(false)} className="text-cream/40 hover:text-cream"><X size={20} /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {chatMessages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] p-4 rounded-2xl text-sm ${
                        m.role === 'user' 
                          ? 'bg-amber-custom text-espresso font-medium rounded-tr-none' 
                          : 'bg-white/5 text-cream border border-white/10 rounded-tl-none'
                      }`}>
                        {renderMessageText(m.text)}
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-white/5 p-4 rounded-2xl rounded-tl-none border border-white/10 flex gap-1 items-center">
                        <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0 }} className="w-1.5 h-1.5 bg-amber-custom rounded-full" />
                        <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }} className="w-1.5 h-1.5 bg-amber-custom rounded-full" />
                        <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }} className="w-1.5 h-1.5 bg-amber-custom rounded-full" />
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                <form onSubmit={handleChatSubmit} className="p-4 bg-white/5 border-t border-white/10 flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Ask anything..."
                    value={chatInput}
                    disabled={isChatLoading}
                    onChange={(e) => setChatInput(e.target.value)}
                    className="flex-1 bg-espresso border border-white/10 rounded-xl px-4 py-2 text-sm text-cream focus:outline-none focus:border-amber-custom disabled:opacity-50"
                  />
                  <button 
                    type="submit"
                    disabled={isChatLoading || !chatInput.trim()}
                    className="bg-amber-custom text-espresso p-2 rounded-xl hover:scale-105 transition-all disabled:opacity-50"
                  >
                    <Send size={18} />
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsChatOpen(!isChatOpen)}
            className={`w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all ${
              isChatOpen ? 'bg-white text-espresso' : 'bg-ochre text-cream'
            }`}
          >
            {isChatOpen ? <X size={28} /> : <MessageSquare size={28} />}
          </motion.button>
        </div>
      </main>

      <footer className="bg-espresso py-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-amber-custom rounded-sm flex items-center justify-center">
              <span className="text-espresso font-display font-extrabold text-xs">E</span>
            </div>
            <span className="font-display font-bold text-lg tracking-tight text-cream">
              Entrep<span className="text-amber-custom italic">AI</span>neur
            </span>
          </div>
          <p className="text-cream/40 text-sm">© 2026 EntrepAIneur. Built for the builders.</p>
          <div className="flex gap-6">
            <a href="#" className="text-cream/40 hover:text-cream transition-colors text-sm">Twitter</a>
            <a href="#" className="text-cream/40 hover:text-cream transition-colors text-sm">LinkedIn</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
