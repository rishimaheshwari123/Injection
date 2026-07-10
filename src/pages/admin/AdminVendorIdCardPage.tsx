import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { vendorAPI } from '../../services/api';
import { Award, Search, Download, ShieldCheck } from 'lucide-react';
import { toast } from 'react-toastify';
// @ts-ignore
import html2pdf from 'html2pdf.js';

export default function AdminVendorIdCardPage() {
  const [searchParams] = useSearchParams();
  const queryVendorId = searchParams.get('vendorId');

  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVendor, setSelectedVendor] = useState<any | null>(null);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  
  // State for fetched ID card config (logo, signature, etc.)
  const [cardDetails, setCardDetails] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    fetchVendors();
  }, []);

  useEffect(() => {
    if (vendors.length > 0 && queryVendorId) {
      const match = vendors.find(v => v._id === queryVendorId);
      if (match) {
        setSelectedVendor(match);
      }
    }
  }, [vendors, queryVendorId]);

  useEffect(() => {
    if (selectedVendor) {
      fetchCardDetails(selectedVendor._id);
    } else {
      setCardDetails(null);
    }
  }, [selectedVendor]);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const res = await vendorAPI.getAllVendors();
      if (res.data && res.data.success) {
        setVendors(res.data.data || []);
      }
    } catch (err: any) {
      console.error("Error fetching vendors:", err);
      toast.error("Failed to load vendors list");
    } finally {
      setLoading(false);
    }
  };

  const fetchCardDetails = async (vendorId: string) => {
    try {
      setLoadingDetails(true);
      const res = await vendorAPI.getIdCardDetails(vendorId);
      if (res.data && res.data.success) {
        setCardDetails(res.data.data);
      }
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to load ID card logo & signature settings");
    } finally {
      setLoadingDetails(false);
    }
  };

  const cardRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = async () => {
    if (!cardRef.current) return;
    try {
      setDownloadingPdf(true);
      const element = cardRef.current;
      const opt = {
        margin:       0,
        filename:     `${selectedVendor.name.replace(/\s+/g, '_')}_ID_Card.pdf`,
        image:        { type: 'jpeg' as const, quality: 1.0 },
        html2canvas:  { 
          scale: 3, 
          useCORS: true, 
          logging: false, 
          letterRendering: true,
          scrollX: 0,
          scrollY: 0
        },
        jsPDF:        { unit: 'in', format: [3.333, 5.1] as [number, number], orientation: 'portrait' as const },
        pagebreak:    { mode: ['avoid-all'] }
      };
      await html2pdf().from(element).set(opt).save();
      toast.success("ID Card PDF downloaded successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to download PDF");
    } finally {
      setDownloadingPdf(false);
    }
  };

  const filteredVendors = vendors.filter((v: any) =>
    v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (v.businessName && v.businessName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (v.vendorId && v.vendorId.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="p-6 space-y-6 w-full max-w-none print:p-0 print:m-0">
      
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
          }
        }
      ` }} />

      {/* Header (hidden on print) */}
      <div className="print:hidden">
        <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
          <Award className="text-[#3DB9A6]" size={24} /> Vendor Digital ID Cards
        </h1>
        <p className="text-sm text-slate-500 mt-1">Select a verified service partner to view, print and download their digital ID badge.</p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start print:block print:p-0">
        
        {/* Left Search / Selector Column (hidden on print) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 flex flex-col h-[550px] print:hidden">
          <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Search Vendor</label>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Name, ID or Business..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#3DB9A6]/30 focus:border-[#3DB9A6]"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {loading ? (
              <div className="py-10 text-center text-xs text-slate-400">Loading vendors list...</div>
            ) : filteredVendors.length === 0 ? (
              <div className="py-10 text-center text-xs text-slate-450 italic">No vendors match criteria.</div>
            ) : (
              filteredVendors.map((vendor) => (
                <button
                  key={vendor._id}
                  onClick={() => setSelectedVendor(vendor)}
                  className={`w-full text-left p-3 rounded-xl border text-xs flex items-center gap-3 transition-all ${
                    selectedVendor?._id === vendor._id
                      ? "border-[#3DB9A6] bg-[#3DB9A6]/5"
                      : "border-slate-100 hover:border-slate-200 bg-slate-50/30"
                  }`}
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-100 flex-shrink-0 flex items-center justify-center font-bold text-slate-500 uppercase">
                    {vendor.profileImage ? (
                      <img src={vendor.profileImage} alt={vendor.name} className="w-full h-full object-cover" />
                    ) : (
                      vendor.name.charAt(0)
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-800 truncate">{vendor.name}</h4>
                    <p className="text-[10px] text-slate-455 truncate mt-0.5">{vendor.vendorId || "Pending Verification"}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right Preview Column (displays ID card directly) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 flex flex-col items-center justify-center min-h-[550px] relative print:p-0 print:border-none print:shadow-none print:bg-transparent">
          
          {selectedVendor ? (
            loadingDetails ? (
              <div className="flex flex-col items-center gap-2">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-[#3DB9A6]"></div>
                <p className="text-xs text-slate-500 font-medium">Loading ID Card data...</p>
              </div>
            ) : cardDetails ? (
              <div className="flex flex-col items-center space-y-6 w-full print:p-0">
                {/* Print button on top */}
                <div className="print:hidden flex justify-end w-full max-w-sm">
                  <button
                    onClick={handleDownloadPDF}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] text-white font-extrabold rounded-xl text-xs hover:shadow-md hover:scale-[1.02] transition-all shadow-xs"
                  >
                    <Download size={14} /> Download / Print ID Card
                  </button>
                </div>

                {/* ID Badge Rendered */}
                <div ref={cardRef} className="print-card-only w-80 h-[480px] bg-white rounded-3xl overflow-hidden shadow-xl border border-slate-250/70 flex flex-col relative print:shadow-none print:border-slate-300">
                  {/* Card Header */}
                  <div className="bg-gradient-to-r from-[#3DB9A6] to-[#63D64F] py-4.5 px-6 text-white text-center relative flex flex-col items-center">
                    {cardDetails.setting?.logoUrl ? (
                      <img src={cardDetails.setting.logoUrl} alt="Logo" className="h-9 object-contain mb-1" />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-white/20 border border-white/30 flex items-center justify-center font-black text-md text-white mb-1">
                        +
                      </div>
                    )}
                    <h3 className="text-[10px] uppercase tracking-widest font-black text-[#dcffe3]">{cardDetails.setting?.title || 'General Medical Services'}</h3>
                    <p className="text-[8px] text-white/80 font-bold tracking-wide mt-0.5">REGISTERED MEDICAL PARTNER</p>
                  </div>

                  {/* Card Body */}
                  <div className="flex-1 p-5 flex flex-col items-center text-center justify-between">
                    {/* User Avatar */}
                    <div className="relative mb-2">
                      <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-slate-100 shadow-sm bg-slate-50 flex items-center justify-center">
                        {cardDetails.vendor.profileImage ? (
                          <img src={cardDetails.vendor.profileImage} alt={cardDetails.vendor.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-2xl font-black text-slate-400 uppercase">
                            {cardDetails.vendor.name.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white w-6.5 h-6.5 rounded-full flex items-center justify-center border-4 border-white shadow-xs">
                        <ShieldCheck size={12} />
                      </div>
                    </div>

                    {/* Name details */}
                    <div className="space-y-0.5">
                      <h2 className="text-lg font-extrabold text-slate-800 leading-tight">{cardDetails.vendor.name}</h2>
                      <p className="text-[11px] font-bold text-[#3DB9A6] uppercase tracking-wider">{cardDetails.vendor.specialization || 'General Partner'}</p>
                      <p className="text-[9px] font-semibold text-slate-400 mt-0.5">{cardDetails.vendor.businessName}</p>
                    </div>

                    {/* Information block */}
                    <div className="w-full bg-slate-50 border border-slate-150/70 rounded-xl p-3.5 space-y-1.5 text-left text-[11px]">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-bold text-slate-400 uppercase">Partner ID</span>
                        <span className="font-extrabold text-slate-700 font-mono">{cardDetails.vendor.vendorId}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-bold text-slate-400 uppercase">Email</span>
                        <span className="font-semibold text-slate-700 truncate max-w-[150px]">{cardDetails.vendor.email}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-bold text-slate-400 uppercase">Mobile</span>
                        <span className="font-semibold text-slate-700">{cardDetails.vendor.phone}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-bold text-slate-400 uppercase">Issue Date</span>
                        <span className="font-semibold text-slate-700">
                          {new Date(cardDetails.vendor.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                      </div>
                    </div>

                    {/* Signature block (QR REMOVED: centered signature) */}
                    <div className="w-full flex flex-col items-center mt-1">
                      {cardDetails.setting?.signatureUrl ? (
                        <img src={cardDetails.setting.signatureUrl} alt="Signature" className="h-9 object-contain mb-0.5" />
                      ) : (
                        <div className="font-mono italic text-[11px] text-slate-500 font-bold mb-1 h-5 flex items-end">
                          Auth Signatory
                        </div>
                      )}
                      <div className="w-24 border-t border-slate-350 my-0.5"></div>
                      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Authorized Sign</span>
                    </div>

                  </div>

                  {/* Card Bottom Strip */}
                  <div className="h-1.5 bg-gradient-to-r from-[#63D64F] to-[#3DB9A6]" />
                </div>
              </div>
            ) : (
              <div className="text-center text-slate-400 text-xs">Failed to prepare ID badge.</div>
            )
          ) : (
            <div className="text-center space-y-3 print:hidden">
              <Award className="mx-auto text-slate-200" size={64} />
              <div>
                <h3 className="font-bold text-slate-700 text-sm">No Vendor Selected</h3>
                <p className="text-xs text-slate-400 mt-1">Please select a vendor partner from the search list to generate and display their ID badge here.</p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
