import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Briefcase, 
  MapPin, 
  Phone, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  Loader2,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

interface OnboardingData {
  fullName: string;
  businessName: string;
  vertical: string;
  location: string;
  whatsappNumber: string;
}

const VERTICALS = [
  { id: 'food', label: 'Food & Beverage', icon: '🍱' },
  { id: 'notary', label: 'Notary Services', icon: '✒️' },
  { id: 'trades', label: 'Home Trades (Plumbing, etc)', icon: '🛠️' },
  { id: 'farming', label: 'Agriculture/Farming', icon: '🌱' },
  { id: 'retail', label: 'Retail/Market Vendor', icon: '🛍️' },
  { id: 'other', label: 'Other Service', icon: '✨' }
];

export const OnboardingFlow: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const [data, setData] = useState<OnboardingData>({
    fullName: '',
    businessName: '',
    vertical: '',
    location: '',
    whatsappNumber: ''
  });

  const totalSteps = 5;

  const nextStep = () => setStep(s => Math.min(s + 1, totalSteps - 1));
  const prevStep = () => setStep(s => Math.max(s - 1, 0));

  const handleComplete = async () => {
    if (!auth.currentUser) return;
    setLoading(true);
    const path = `profiles/${auth.currentUser.uid}`;
    try {
      await setDoc(doc(db, 'profiles', auth.currentUser.uid), {
        ...data,
        uid: auth.currentUser.uid,
        onboardingCompleted: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      onComplete();
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    } finally {
      setLoading(false);
    }
  };

  const validatePhone = (phone: string) => {
    if (!phone) return true; // Optional field
    const phoneRegex = /^(\+?\d{1,4}[\s-]?)?[\d\s-]{7,15}$/;
    return phoneRegex.test(phone);
  };

  const handlePhoneChange = (val: string) => {
    setData(d => ({ ...d, whatsappNumber: val }));
    if (val && !validatePhone(val)) {
      setPhoneError('Please enter a valid phone number format');
    } else {
      setPhoneError('');
    }
  };

  const steps = [
    {
      title: "Welcome to EntrepAIneur",
      subtitle: "Let's build your AI-powered business profile in 60 seconds.",
      content: (
        <div className="space-y-6 text-center">
          <div className="w-20 h-20 bg-amber-custom/20 rounded-full flex items-center justify-center mx-auto mb-8">
            <Sparkles className="text-amber-custom" size={40} />
          </div>
          <p className="text-cream/60 leading-relaxed">
            We're here to help you automate the boring stuff so you can focus on the hustle. 
            First, we need a few details about your business.
          </p>
        </div>
      )
    },
    {
      title: "Who are you?",
      subtitle: "Tell us your name and what you call your business.",
      content: (
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-ochre">Your Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-cream/30" size={20} />
              <input 
                type="text" 
                value={data.fullName}
                onChange={e => setData(d => ({ ...d, fullName: e.target.value }))}
                placeholder="e.g. Marcus Garvey"
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-cream focus:outline-none focus:border-amber-custom transition-all"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-ochre">Business Name</label>
            <div className="relative">
              <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-cream/30" size={20} />
              <input 
                type="text" 
                value={data.businessName}
                onChange={e => setData(d => ({ ...d, businessName: e.target.value }))}
                placeholder="e.g. Garvey's Global Goods"
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-cream focus:outline-none focus:border-amber-custom transition-all"
              />
            </div>
          </div>
        </div>
      )
    },
    {
      title: "What's your trade?",
      subtitle: "Select the category that best fits your business.",
      content: (
        <div className="grid grid-cols-2 gap-4">
          {VERTICALS.map(v => (
            <button
              key={v.id}
              onClick={() => setData(d => ({ ...d, vertical: v.id }))}
              className={`p-4 rounded-2xl border transition-all text-left flex flex-col gap-3 ${
                data.vertical === v.id 
                  ? 'bg-amber-custom/20 border-amber-custom shadow-[0_0_20px_rgba(242,169,0,0.1)]' 
                  : 'bg-white/5 border-white/10 hover:border-white/30'
              }`}
            >
              <span className="text-2xl">{v.icon}</span>
              <span className="text-xs font-bold text-cream">{v.label}</span>
            </button>
          ))}
        </div>
      )
    },
    {
      title: "Where do you operate?",
      subtitle: "This helps us tailor market insights for your area.",
      content: (
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-ochre">Primary Location</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-cream/30" size={20} />
              <input 
                type="text" 
                value={data.location}
                onChange={e => setData(d => ({ ...d, location: e.target.value }))}
                placeholder="e.g. Kingston, Jamaica"
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-cream focus:outline-none focus:border-amber-custom transition-all"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-ochre">WhatsApp Number (Optional)</label>
            <div className="relative">
              <Phone className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${phoneError ? 'text-red-400' : 'text-cream/30'}`} size={20} />
              <input 
                type="text" 
                value={data.whatsappNumber}
                onChange={e => handlePhoneChange(e.target.value)}
                placeholder="+1 (876) ..."
                className={`w-full bg-white/5 border rounded-xl pl-12 pr-4 py-4 text-cream focus:outline-none transition-all ${
                  phoneError ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-amber-custom'
                }`}
              />
            </div>
            {phoneError && (
              <motion.p 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-[10px] text-red-400 font-medium"
              >
                {phoneError}
              </motion.p>
            )}
          </div>
        </div>
      )
    },
    {
      title: "Ready to launch?",
      subtitle: "Review your details and start your AI-powered journey.",
      content: (
        <div className="space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-cream/40">Business</span>
              <span className="text-sm font-bold text-cream">{data.businessName}</span>
            </div>
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-cream/40">Vertical</span>
              <span className="text-sm font-bold text-cream">{VERTICALS.find(v => v.id === data.vertical)?.label}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold uppercase tracking-widest text-cream/40">Location</span>
              <span className="text-sm font-bold text-cream">{data.location}</span>
            </div>
          </div>
          <p className="text-xs text-cream/40 text-center italic">
            By clicking complete, we'll set up your personalized dashboard and AI assistants.
          </p>
        </div>
      )
    }
  ];

  const canGoNext = () => {
    if (step === 1) return data.fullName.length > 2 && data.businessName.length > 2;
    if (step === 2) return data.vertical !== '';
    if (step === 3) return data.location.length > 2 && !phoneError;
    return true;
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-espresso/95 backdrop-blur-xl"
      />
      
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="relative bg-white/5 border border-white/10 p-8 md:p-12 rounded-[3rem] max-w-xl w-full shadow-2xl overflow-hidden"
      >
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-white/5">
          <motion.div 
            className="h-full bg-amber-custom"
            initial={{ width: 0 }}
            animate={{ width: `${((step + 1) / totalSteps) * 100}%` }}
          />
        </div>

        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <span className="text-amber-custom font-bold text-[10px] uppercase tracking-[0.3em]">
              Step {step + 1} of {totalSteps}
            </span>
            {step > 0 && (
              <button onClick={prevStep} className="text-cream/40 hover:text-cream flex items-center gap-2 text-xs transition-colors">
                <ArrowLeft size={14} /> Back
              </button>
            )}
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-3 text-cream">{steps[step].title}</h2>
          <p className="text-cream/50 text-sm">{steps[step].subtitle}</p>
        </div>

        <div className="min-h-[300px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {steps[step].content}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-12">
          {step === totalSteps - 1 ? (
            <button 
              onClick={handleComplete}
              disabled={loading}
              className="w-full bg-amber-custom text-espresso font-bold py-5 rounded-2xl flex items-center justify-center gap-3 hover:scale-[1.02] transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" /> : (
                <>
                  Complete Setup <CheckCircle2 size={20} />
                </>
              )}
            </button>
          ) : (
            <button 
              onClick={nextStep}
              disabled={!canGoNext()}
              className="w-full bg-cream text-espresso font-bold py-5 rounded-2xl flex items-center justify-center gap-3 hover:scale-[1.02] transition-all disabled:opacity-50"
            >
              Continue <ChevronRight size={20} />
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};
