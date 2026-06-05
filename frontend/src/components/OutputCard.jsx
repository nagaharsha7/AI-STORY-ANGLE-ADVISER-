import React, { useState, useRef } from 'react';
import { 
  FiCopy, FiCheck, FiDownload, FiFileText, FiRefreshCw,
  FiCompass, FiClock, FiHelpCircle, FiSearch, FiShare2, FiGrid, FiTrendingUp
} from 'react-icons/fi';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

const OutputCard = ({ output, onRegenerate, isRegenerating }) => {
  const [activeTab, setActiveTab] = useState('angles');
  const [copied, setCopied] = useState(false);
  const pdfRef = useRef(null);

  if (!output) return null;

  const { title, category, editor, angles, followups, questions, investigations, socialIdeas } = output;

  const tabs = [
    { id: 'angles', name: 'Story Angles', count: angles?.length || 5, icon: <FiCompass /> },
    { id: 'followups', name: 'Follow-Ups', count: followups?.length || 5, icon: <FiClock /> },
    { id: 'questions', name: 'Audience Questions', count: questions?.length || 5, icon: <FiHelpCircle /> },
    { id: 'investigations', name: 'Investigations', count: investigations?.length || 3, icon: <FiSearch /> },
    { id: 'socialIdeas', name: 'Social Media', count: socialIdeas?.length || 5, icon: <FiShare2 /> }
  ];

  // Helper: Format entire report to text
  const formatReportText = () => {
    let report = `TELANGANA TODAY - AI STORY ADVISOR REPORT\n`;
    report += `==============================================\n`;
    report += `Title: ${title || 'Story Analysis'}\n`;
    report += `Category: ${category || 'General'}\n`;
    report += `Editor: ${editor || 'Editor'}\n`;
    report += `==============================================\n\n`;

    report += `1. NEW STORY ANGLES\n`;
    angles?.forEach((a, i) => {
      report += `[${a.angleType}] ${a.title}\n${a.description}\n\n`;
    });

    report += `2. FOLLOW-UP STORY IDEAS\n`;
    followups?.forEach((f, i) => {
      report += `(${f.timeline}) ${f.title}\n${f.description}\n\n`;
    });

    report += `3. TRENDING AUDIENCE QUESTIONS\n`;
    questions?.forEach((q, i) => {
      report += `- ${q.question} [Trending on: ${q.platform} (Interest: ${q.interestLevel})]\n`;
    });
    report += `\n`;

    report += `4. INVESTIGATIVE OPPORTUNITIES\n`;
    investigations?.forEach((inv, i) => {
      report += `Headline: ${inv.title}\nDescription: ${inv.description}\nPotential Sources: ${inv.potentialSources}\n\n`;
    });

    report += `5. SOCIAL MEDIA CONTENT IDEAS\n`;
    socialIdeas?.forEach((s, i) => {
      report += `[${s.platform}] Hook: "${s.hook}"\nContent Outline: ${s.content}\n\n`;
    });

    return report;
  };

  // Copy to Clipboard
  const handleCopy = async () => {
    try {
      const text = formatReportText();
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy report:", err);
    }
  };

  // Export to TXT
  const handleExportTxt = () => {
    const text = formatReportText();
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${(title || 'story_report').toLowerCase().replace(/[^a-z0-9]+/g, '_')}_advisor.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Export to PDF
  const handleExportPdf = async () => {
    const element = pdfRef.current;
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        scale: 2, // High resolution
        useCORS: true,
        backgroundColor: '#0a0a0c', // Preserve dark background
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210; // A4 size width in mm
      const pageHeight = 295; // A4 size height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      pdf.save(`${(title || 'story_report').toLowerCase().replace(/[^a-z0-9]+/g, '_')}_advisor.pdf`);
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      alert("An error occurred during PDF generation. Please try again.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Control Buttons header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-darkbg-card border border-darkbg-border rounded-xl p-4">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
          <span className="text-xs font-semibold text-gray-300 font-mono">Generation Ready</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Copy Report */}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-darkbg-border bg-darkbg-deep/50 text-xs text-gray-300 hover:text-brand transition-colors"
          >
            {copied ? <FiCheck className="text-green-500" size={13} /> : <FiCopy size={13} />}
            <span>{copied ? 'Copied' : 'Copy Text'}</span>
          </button>

          {/* Export TXT */}
          <button
            onClick={handleExportTxt}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-darkbg-border bg-darkbg-deep/50 text-xs text-gray-300 hover:text-brand transition-colors"
          >
            <FiFileText size={13} />
            <span>Export TXT</span>
          </button>

          {/* Export PDF */}
          <button
            onClick={handleExportPdf}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-brand/20 bg-brand/10 text-xs text-brand hover:bg-brand hover:text-white transition-all"
          >
            <FiDownload size={13} />
            <span>Export PDF</span>
          </button>

          {/* Regenerate */}
          <button
            onClick={onRegenerate}
            disabled={isRegenerating}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-darkbg-border bg-darkbg-deep/50 text-xs text-gray-300 hover:text-brand transition-colors disabled:opacity-50"
          >
            <FiRefreshCw className={isRegenerating ? 'animate-spin text-brand' : ''} size={13} />
            <span>{isRegenerating ? 'Regenerating...' : 'Regenerate'}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-darkbg-border overflow-x-auto gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-3 border-b-2 text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-brand text-brand'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            {tab.icon}
            <span>{tab.name}</span>
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
              activeTab === tab.id 
                ? 'bg-brand/20 text-brand' 
                : 'bg-darkbg-border text-gray-500'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* PDF Export Render Target */}
      <div ref={pdfRef} className="glass-panel rounded-2xl p-6 md:p-8 glow-orange-lg">
        {/* PDF Header (Visually integrated but highlights TT branding in PDF) */}
        <div className="flex items-center justify-between border-b border-darkbg-border pb-5 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-brand/15 text-brand px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                {category || 'General'}
              </span>
            </div>
            <h3 className="font-display font-extrabold text-2xl text-white mt-1.5 leading-tight">
              {title || 'Story Analysis Report'}
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              Prepared for Telangana Today Newsroom &bull; Advisor System
            </p>
          </div>
          <div className="text-right hidden sm:block">
            <span className="text-xs font-mono text-gray-500">Editor Account</span>
            <p className="text-xs font-semibold text-gray-300">{editor || 'editor@telanganatoday.com'}</p>
          </div>
        </div>

        {/* Tab content displays */}
        <div>
          {/* 1. STORY ANGLES */}
          {activeTab === 'angles' && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              {angles?.map((angle, idx) => (
                <div key={idx} className="border border-darkbg-border bg-darkbg-deep/30 rounded-xl p-5 hover:border-brand/35 transition-all">
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <h4 className="font-display font-bold text-base text-white">{angle.title}</h4>
                    <span className="text-[9px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      {angle.angleType}
                    </span>
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed">{angle.description}</p>
                </div>
              ))}
            </div>
          )}

          {/* 2. FOLLOW-UPS */}
          {activeTab === 'followups' && (
            <div className="space-y-4">
              {followups?.map((followup, idx) => (
                <div key={idx} className="flex flex-col md:flex-row gap-4 border border-darkbg-border bg-darkbg-deep/30 rounded-xl p-5 hover:border-brand/35 transition-all">
                  <div className="md:w-48 shrink-0 flex flex-row md:flex-col justify-between md:justify-start items-center md:items-start gap-2 border-b md:border-b-0 md:border-r border-darkbg-border pb-3 md:pb-0 md:pr-4">
                    <span className="text-xs font-mono font-bold text-brand uppercase">Follow-up {idx + 1}</span>
                    <span className="flex items-center gap-1 text-[10px] bg-brand/10 text-brand border border-brand/20 px-2.5 py-1 rounded-lg">
                      <FiClock size={11} />
                      <span className="font-semibold">{followup.timeline}</span>
                    </span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-display font-bold text-base text-white mb-1.5">{followup.title}</h4>
                    <p className="text-xs text-gray-300 leading-relaxed">{followup.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 3. AUDIENCE QUESTIONS */}
          {activeTab === 'questions' && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              {questions?.map((q, idx) => (
                <div key={idx} className="flex gap-4 border border-darkbg-border bg-darkbg-deep/30 rounded-xl p-5 hover:border-brand/35 transition-all">
                  <div className="h-10 w-10 rounded-full bg-brand/10 text-brand flex items-center justify-center font-display font-bold text-sm shrink-0">
                    ?
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-200">{q.question}</p>
                    <div className="flex gap-2">
                      <span className="text-[9px] bg-darkbg-border text-gray-400 px-2 py-0.5 rounded font-mono">
                        Platform: {q.platform}
                      </span>
                      <span className="text-[9px] bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded font-mono">
                        Interest: {q.interestLevel}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 4. INVESTIGATIVE OPPORTUNITIES */}
          {activeTab === 'investigations' && (
            <div className="space-y-4">
              {investigations?.map((inv, idx) => (
                <div key={idx} className="border border-darkbg-border bg-darkbg-deep/30 rounded-xl p-6 hover:border-brand/35 transition-all relative overflow-hidden">
                  {/* Subtle corner badge for investigations */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-brand/5 rotate-45 translate-x-12 -translate-y-12 border-b border-brand/20"></div>
                  
                  <h4 className="font-display font-bold text-lg text-white mb-2 pr-12 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-brand"></span>
                    {inv.title}
                  </h4>
                  <p className="text-xs text-gray-300 mb-4 leading-relaxed">{inv.description}</p>
                  
                  <div className="bg-darkbg-deep/60 rounded-lg p-3 border border-darkbg-border">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                      Potential Sources / Leads:
                    </span>
                    <p className="text-xs text-gray-300 font-mono">{inv.potentialSources}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 5. SOCIAL MEDIA IDEAS */}
          {activeTab === 'socialIdeas' && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              {socialIdeas?.map((social, idx) => (
                <div key={idx} className="border border-darkbg-border bg-darkbg-deep/30 rounded-xl p-5 hover:border-brand/35 transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="h-2 w-2 rounded-full bg-brand"></span>
                      <span className="text-xs font-bold text-brand uppercase tracking-wider font-mono">
                        {social.platform}
                      </span>
                    </div>
                    {/* Catchy Hook */}
                    <div className="border-l-2 border-brand bg-brand/5 p-3 rounded-r-lg mb-3">
                      <p className="text-xs italic text-gray-200">"{social.hook}"</p>
                    </div>
                    {/* Post Outline */}
                    <p className="text-xs text-gray-300 leading-relaxed mb-4">{social.content}</p>
                  </div>
                  
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`Hook: ${social.hook}\nContent: ${social.content}`);
                      alert("Social media idea copied to clipboard!");
                    }}
                    className="self-end flex items-center gap-1.5 text-[10px] text-gray-400 hover:text-brand transition-colors font-mono"
                  >
                    <FiCopy size={11} />
                    <span>Copy Content</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OutputCard;
