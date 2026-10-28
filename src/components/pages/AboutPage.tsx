import React from "react";
import { motion } from "motion/react";
import { Award, Eye, Landmark, MapPin, Scale, ShieldAlert, Users } from "lucide-react";

interface AboutPageProps {
  isDarkMode: boolean;
}

export const AboutPage: React.FC<AboutPageProps> = ({ isDarkMode }) => {
  return (
    <div className={`pt-32 pb-24 px-4 md:px-8 ${isDarkMode ? "bg-[#111110] text-[#F7F7F5]" : "bg-[#F7F7F5] text-[#1A1A1A]"} min-h-screen text-left`}>
      <div className="max-w-5xl mx-auto space-y-20">
        
        {/* Editorial Heading Column */}
        <div className="border-b border-[#E2E8F0]/30 pb-12">
          <span className="text-[10px] uppercase tracking-[0.4em] text-[#FF9E4A] font-bold block mb-4">
            LEGACY & FIDELITY
          </span>
          <h1 className="text-4xl md:text-7xl font-light tracking-tight leading-none mb-6">
            Haji Saud Zehri ki Sarbarahi Mein <br />
            <span className="italic font-serif text-[#FF9E4A]">Bismillah Real Estate</span>
          </h1>
          <p className={`max-w-2xl text-base md:text-lg font-light leading-relaxed italic ${isDarkMode ? "text-stone-300" : "text-stone-600"}`}>
            "Hum sirf zameen nahi bechty, hum aap ka khwab banatay hain. 100% legal registry aur mehfooz zameen ke sath apna ghar banayen."
          </p>
        </div>

        {/* Managing Partner profile split panel */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center">
          <div className="md:col-span-5 relative overflow-hidden aspect-[4/5] bg-black border border-stone-800">
            <img
              src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=80"
              alt="Haji Saud Zehri"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover grayscale brightness-90 contrast-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-6">
              <span className="font-serif italic text-white text-lg">Haji Saud Zehri</span>
              <span className="font-mono text-[9px] tracking-widest text-[#FF9E4A] uppercase mt-1">Founder / Managing Partner</span>
            </div>
          </div>

          <div className="md:col-span-7 space-y-6">
            <span className="font-mono text-[10px] tracking-widest text-[#FF9E4A] uppercase font-bold">
              PRINCIPAL STATEMENT
            </span>
            <h3 className="text-2xl md:text-3xl font-light tracking-tight leading-snug">
              Mukammal Legal Registry aur 100% Verified Zameen ki Guarantee
            </h3>
            
            <div className={`space-y-4 text-sm font-light leading-relaxed ${isDarkMode ? "text-stone-300" : "text-stone-600"}`}>
              <p>
                Bismillah Real Estate ki bunyad Haji Saud Zehri ne rakhi thi. Hamara maqsad Quetta ke logon ko behtareen aur legal registry wale premium plots aur schemes faraham karna hai takay aap ka sarmaya bilkul mehfooz rahay.
              </p>
              <p>
                Hum har plot, apartment aur home scheme ki documents file ko khud check kartay hain. Hum se zameen khareedna bilkul safe aur aasan hai. Hamaray har client ko mukammal legal verification aur safety guaranteed di jati hai.
              </p>
            </div>

            {/* Micro stats table */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-[#E2E8F0]/30 font-mono text-left">
              <div>
                <span className="text-[20px] font-bold text-[#FF9E4A]">100%</span>
                <span className="text-[9px] text-stone-400 block uppercase tracking-widest mt-0.5">Verified Deeds</span>
              </div>
              <div>
                <span className="text-[20px] font-bold text-[#FF9E4A]">25+</span>
                <span className="text-[9px] text-stone-400 block uppercase tracking-widest mt-0.5">Years Legacy</span>
              </div>
              <div>
                <span className="text-[20px] font-bold text-[#FF9E4A]">A-1</span>
                <span className="text-[9px] text-stone-400 block uppercase tracking-widest mt-0.5">City Location</span>
              </div>
            </div>
          </div>
        </div>

        {/* Core Pillars Grid */}
        <div className="space-y-8">
          <span className="font-mono text-[10px] tracking-widest text-[#FF9E4A] uppercase font-bold block text-left">
            THE ARCHITECTURAL MANIFESTO
          </span>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className={`p-8 border ${isDarkMode ? "bg-[#1A1A1A]/50 border-stone-800" : "bg-white border-stone-200"}`}>
              <Scale className="text-[#FF9E4A] mb-4 stroke-[1.5]" size={28} />
              <h4 className="text-lg font-display tracking-tight mb-2">Mehfooz Registry</h4>
              <p className={`text-xs font-light leading-relaxed ${isDarkMode ? "text-stone-400" : "text-stone-600"}`}>
                Zero legal grey areas. All files are 100% cleared and civilian registry deeds are ready to register on your name immediately.
              </p>
            </div>

            <div className={`p-8 border ${isDarkMode ? "bg-[#1A1A1A]/50 border-stone-800" : "bg-white border-stone-200"}`}>
              <Award className="text-[#FF9E4A] mb-4 stroke-[1.5]" size={28} />
              <h4 className="text-lg font-display tracking-tight mb-2">Shandaar Sazaawat</h4>
              <p className={`text-xs font-light leading-relaxed ${isDarkMode ? "text-stone-400" : "text-stone-600"}`}>
                Hamaray flats aur compounds strong foundation aur modern local stone decorations se premium standards par banaye jatay hain.
              </p>
            </div>

            <div className={`p-8 border ${isDarkMode ? "bg-[#1A1A1A]/50 border-stone-800" : "bg-white border-stone-200"}`}>
              <Users className="text-[#FF9E4A] mb-4 stroke-[1.5]" size={28} />
              <h4 className="text-lg font-display tracking-tight mb-2">Mehmaan-Nawazi</h4>
              <p className={`text-xs font-light leading-relaxed ${isDarkMode ? "text-stone-400" : "text-stone-600"}`}>
                Hum direct transparent communication par believe rakhte hain. Come with your family with complete security and peace.
              </p>
            </div>

          </div>
        </div>

        {/* Location & Safe Map context card */}
        <div className={`p-8 border rounded-3xl relative overflow-hidden ${isDarkMode ? "bg-[#1A1A1A]/40 border-stone-800" : "bg-[#E2E8F0]/20 border-stone-200"}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center text-left">
            <div className="space-y-4">
              <span className="font-mono text-[9px] text-[#FF9E4A] uppercase tracking-widest font-bold flex items-center gap-1.5">
                <MapPin size={12} /> BALOCHISTAN COMMAND CENTER
              </span>
              <h4 className="text-xl md:text-2xl font-light tracking-tight leading-snug">
                Located within A-1 City's High Security Sector C
              </h4>
              <p className={`text-xs font-light leading-relaxed ${isDarkMode ? "text-stone-400" : "text-stone-600"}`}>
                Our physical suite boasts armed perimeter security barriers, private client conference rooms, and beautifully scaled master layouts of standard housing segments in Quetta.
              </p>
            </div>
            
            <div className={`p-6 rounded-2xl ${isDarkMode ? "bg-black/40 border border-stone-800" : "bg-white border border-stone-200"} space-y-3 font-mono text-[10px]`}>
              <div className={`flex justify-between border-b pb-2 ${isDarkMode ? "border-stone-800" : "border-stone-100"}`}>
                <span className="text-stone-400">Headquarters</span>
                <span className="font-semibold text-[#FF9E4A]">Quetta Cantt Adjacent</span>
              </div>
              <div className={`flex justify-between border-b pb-2 ${isDarkMode ? "border-stone-800" : "border-stone-100"}`}>
                <span className="text-stone-400">Sector Phase</span>
                <span className={isDarkMode ? "text-stone-300" : "text-stone-800"}>Phase 3 Executive Belt</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Visitor Protocols</span>
                <span className={`uppercase font-medium ${isDarkMode ? "text-stone-300" : "text-stone-800"}`}>Invitation Required</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
