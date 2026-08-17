import { useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { Award, Download, ShieldCheck, Heart } from 'lucide-react';
import { toast } from 'react-toastify';
// @ts-ignore
import html2pdf from 'html2pdf.js';

export default function UserIdCardPage() {
  const { user } = useSelector((state: any) => state.auth);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = async () => {
    if (!cardRef.current || !user) return;
    try {
      setDownloadingPdf(true);
      const element = cardRef.current;
      const opt = {
        margin:       0.1,
        filename:     `${user.name.replace(/\s+/g, '_')}_Member_Card.pdf`,
        image:        { type: 'jpeg' as const, quality: 1.0 },
        html2canvas:  { 
          scale: 2.5, 
          useCORS: true, 
          logging: false, 
          letterRendering: true,
          scrollX: 0,
          scrollY: 0,
          windowWidth: element.scrollWidth,
          windowHeight: element.scrollHeight
        },
        jsPDF:        { 
          unit: 'px', 
          format: [element.offsetWidth + 20, element.offsetHeight + 20] as [number, number], 
          orientation: 'portrait' as const,
          hotfixes: ['px_scaling']
        },
        pagebreak:    { mode: ['avoid-all', 'css', 'legacy'], avoid: ['div', 'img', 'tr'] }
      };
      await html2pdf().from(element).set(opt).save();
      toast.success("Member Card PDF downloaded successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to download PDF");
    } finally {
      setDownloadingPdf(false);
    }
  };

  const getMemberId = () => {
    if (!user?._id) return "MEM-PENDING";
    // Construct a readable clean member ID from user ID
    return `MEM-${user._id.substring(user._id.length - 8).toUpperCase()}`;
  };

  return (
    <div className="p-6 space-y-6 w-full max-w-4xl mx-auto print:p-0 print:m-0 flex flex-col items-center">
      
      {/* Style injection to print ONLY the ID card when print is triggered */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * {
            visibility: hidden;
          }
          .print-card-only, .print-card-only * {
            visibility: visible;
          }
          .print-card-only {
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%) scale(1.3);
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
        }
        .id-card-container {
          page-break-inside: avoid !important;
          break-inside: avoid !important;
          display: block;
        }
      ` }} />

      {/* Header (hidden on print) */}
      <div className="print:hidden text-center max-w-md">
        <h1 className="text-2xl font-black text-slate-800 flex items-center justify-center gap-2">
          <Award className="text-[#3DB9A6]" size={24} /> My Digital ID Card
        </h1>
        <p className="text-sm text-slate-500 mt-1">View, print, and download your digital healthcare membership card badge.</p>
      </div>

      {user ? (
        <div className="flex flex-col items-center space-y-6 w-full print:p-0">
          
          {/* Action button */}
          <div className="print:hidden">
            <button
              onClick={handleDownloadPDF}
              disabled={downloadingPdf}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] text-white font-extrabold rounded-xl text-xs hover:shadow-md hover:scale-[1.02] transition-all shadow-xs disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {downloadingPdf ? (
                <>
                  <div className="inline-block animate-spin rounded-full h-3.5 w-3.5 border-2 border-white/30 border-t-white"></div>
                  Downloading PDF...
                </>
              ) : (
                <>
                  <Download size={14} /> Download / Print Member Card
                </>
              )}
            </button>
          </div>

          {/* ID Badge Rendered */}
          <div ref={cardRef} className="print-card-only id-card-container w-80 bg-white rounded-3xl overflow-hidden shadow-xl border border-slate-250/70 flex flex-col relative print:shadow-none print:border-slate-300" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
            {/* Card Header */}
            <div className="bg-gradient-to-r from-[#3DB9A6] to-[#63D64F] py-5 px-6 text-white text-center relative flex flex-col items-center gap-1">
              <div className="w-10 h-10 rounded-full bg-white/20 border border-white/30 flex items-center justify-center font-black text-lg text-white">
                <Heart className="w-5 h-5 text-white fill-white" />
              </div>
              <h3 className="text-[11px] uppercase tracking-widest font-black text-white leading-tight">General Medical Services</h3>
              <p className="text-[8px] text-white/90 font-bold tracking-wide">DIGITAL HEALTHCARE MEMBER</p>
            </div>

            {/* Card Body */}
            <div className="flex-1 p-6 flex flex-col items-center text-center">
              {/* User Avatar */}
              <div className="relative mb-4">
                <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-slate-100 shadow-sm bg-slate-50 flex items-center justify-center">
                  {user.profileImage ? (
                    <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl font-black text-slate-400 uppercase">
                      {user.name.charAt(0)}
                    </span>
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white w-7 h-7 rounded-full flex items-center justify-center border-4 border-white shadow-sm">
                  <ShieldCheck size={14} />
                </div>
              </div>

              {/* Name details */}
              <div className="mb-4">
                <h2 className="text-xl font-extrabold text-slate-800 leading-tight mb-1">{user.name}</h2>
                <p className="text-xs font-bold text-[#3DB9A6] uppercase tracking-wider">Verified Member</p>
              </div>

              {/* Information block */}
              <div className="w-full bg-slate-50 border border-slate-150/70 rounded-xl p-4 space-y-2.5 text-left mb-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase whitespace-nowrap">Member ID</span>
                  <span className="font-extrabold text-slate-800 font-mono text-xs">{getMemberId()}</span>
                </div>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase whitespace-nowrap flex-shrink-0">Email</span>
                  <span className="font-semibold text-slate-700 text-[10px] break-all text-right leading-tight">{user.email}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase whitespace-nowrap">Mobile</span>
                  <span className="font-semibold text-slate-700 text-xs">{user.phone}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase whitespace-nowrap">Blood Group</span>
                  <span className="font-extrabold text-red-600 text-xs">{user.bloodGroup || 'Unknown'}</span>
                </div>
                {user.pincode && (
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase whitespace-nowrap">Pincode</span>
                    <span className="font-semibold text-slate-700 text-xs">{user.pincode}</span>
                  </div>
                )}
              </div>

              {/* Bottom tag */}
              <div className="w-full text-center mt-2">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Healthcare at your doorstep</span>
              </div>

            </div>

            {/* Card Bottom Strip */}
            <div className="h-2 bg-gradient-to-r from-[#63D64F] to-[#3DB9A6]" />
          </div>

        </div>
      ) : (
        <div className="text-center text-slate-400 text-xs">Failed to prepare ID badge. Please contact admin.</div>
      )}

    </div>
  );
}
