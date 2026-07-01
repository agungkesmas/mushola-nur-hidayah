import React, { useState, useEffect } from "react";
import { BookOpen, Target, CalendarDays, ArrowRight, RefreshCw } from "lucide-react";

interface TargetKhatamWidgetProps {
  addToast: (title: string, body: string, type: "success" | "info" | "warning" | "notification") => void;
  onNavigateToQuran?: () => void;
}

export const TargetKhatamWidget: React.FC<TargetKhatamWidgetProps> = ({ addToast, onNavigateToQuran }) => {
  const [targetDays, setTargetDays] = useState<number>(30);
  const [currentProgress, setCurrentProgress] = useState<number>(0);
  const [isSettingMode, setIsSettingMode] = useState<boolean>(false);
  
  const TOTAL_JUZ = 30;
  const TOTAL_PAGES = 604;
  
  useEffect(() => {
    const savedTarget = localStorage.getItem("qd_target_khatam_days");
    if (savedTarget) setTargetDays(parseInt(savedTarget));
    
    // In a real app we'd fetch actual progress from bookmarks/tilawah
    const savedProgress = localStorage.getItem("qd_khatam_progress");
    if (savedProgress) setCurrentProgress(parseInt(savedProgress));
  }, []);

  const saveTarget = (days: number) => {
    setTargetDays(days);
    localStorage.setItem("qd_target_khatam_days", days.toString());
    setIsSettingMode(false);
    addToast("Target Diperbarui", `Target khatam diset untuk ${days} hari.`, "success");
  };

  const pagesPerDay = Math.ceil(TOTAL_PAGES / targetDays);
  
  return (
    <div className="bg-white rounded-3xl p-6 shadow-md border border-slate-100 flex flex-col gap-5 relative overflow-hidden">
      <div className="absolute -right-6 -top-6 w-32 h-32 bg-emerald-50 rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="flex justify-between items-start relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-100/50 rounded-2xl text-emerald-800">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">Target Khatam</h3>
            <p className="text-[11px] font-bold text-emerald-600 tracking-wider">Perencanaan Tilawah</p>
          </div>
        </div>
        {!isSettingMode && (
          <button onClick={() => setIsSettingMode(true)} className="p-2 cursor-pointer text-slate-400 hover:bg-slate-50 rounded-xl transition-colors">
             <RefreshCw className="w-4 h-4" />
          </button>
        )}
      </div>

      {isSettingMode ? (
         <div className="flex flex-col gap-3 relative z-10 animate-in fade-in zoom-in-95">
           <p className="text-xs text-slate-500 font-medium">Berapa hari target Anda untuk mengkhatamkan Al-Qur'an (30 Juz)?</p>
           <div className="flex flex-wrap gap-2">
             {[15, 30, 60, 90].map(days => (
               <button 
                key={days} 
                onClick={() => saveTarget(days)}
                className={`py-2 px-4 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${targetDays === days ? "bg-[#0F4C3A] text-white border-[#0F4C3A]" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"}`}
               >
                 {days} Hari
               </button>
             ))}
           </div>
           <p className="text-[10px] text-slate-400 italic">Target Ramadhan idealnya 30 Hari.</p>
         </div>
      ) : (
        <div className="flex flex-col gap-4 relative z-10">
          <div className="flex items-center justify-between p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100">
             <div className="flex flex-col">
               <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">REKOMENDASI HARIAN</span>
               <div className="text-xl font-bold font-serif text-[#0F4C3A] leading-none">
                 {pagesPerDay} <span className="text-sm font-sans font-semibold text-emerald-700">Halaman/Hari</span>
               </div>
             </div>
             <div className="p-2.5 bg-white shadow-sm rounded-xl border border-emerald-50 text-emerald-600">
                <BookOpen className="w-5 h-5" />
             </div>
          </div>
          
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center text-xs font-bold text-slate-500">
               <span>Pencapaian</span>
               <span className="text-[#0F4C3A]">{currentProgress}%</span>
            </div>
            <div className="h-2.5 bg-slate-100 rounded-full w-full overflow-hidden">
               <div className="h-full bg-gradient-to-r from-emerald-500 to-[#ECC17A] rounded-full transition-all" style={{ width: `${currentProgress}%` }}></div>
            </div>
          </div>

          <button 
           onClick={onNavigateToQuran}
           className="w-full mt-2 py-3 bg-slate-800 hover:bg-slate-900 transition-colors text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            Lanjutkan Bacaan
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
