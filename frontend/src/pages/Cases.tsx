import React, { useEffect, useState } from 'react';
import { caseService } from '../services/api';
import { Case } from '../types/case';
import { MOCK_CASES } from '../data/mockData';
import { MessageSquare, Info, ShieldAlert, CheckCircle2, ArrowRight } from 'lucide-react';
import { translateEvidence } from '../utils/language';

interface CasesProps {
  onSelectAccount: (accId: string) => void;
}

export const Cases: React.FC<CasesProps> = ({ onSelectAccount }) => {
  const [cases, setCases] = useState<Case[]>(MOCK_CASES);
  const [selectedCase, setSelectedCase] = useState<Case | null>(MOCK_CASES[0]);
  const [noteText, setNoteText] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchCases = () => {
    caseService
      .list()
      .then((res) => {
        if (res && res.length > 0) {
          setCases(res);
          setSelectedCase(res[0]);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchCases();
  }, []);

  const handleUpdateStatus = async (newStatus: string) => {
    if (!selectedCase) return;
    try {
      const updated = await caseService.update(selectedCase.case_id, { status: newStatus });
      setSelectedCase(updated);
      fetchCases();
    } catch {
      const updated = { ...selectedCase, status: newStatus as any };
      setSelectedCase(updated);
      setCases((prev) => prev.map((c) => (c.case_id === selectedCase.case_id ? updated : c)));
    }
  };

  const handleAddNote = async () => {
    if (!selectedCase || !noteText.trim()) return;
    try {
      const updated = await caseService.update(selectedCase.case_id, { note_text: noteText });
      setSelectedCase(updated);
      setNoteText('');
      fetchCases();
    } catch {
      const updatedNote = {
        author: 'Analyst #1042',
        timestamp: new Date().toISOString(),
        text: noteText
      };
      const updated = {
        ...selectedCase,
        notes: [...selectedCase.notes, updatedNote]
      };
      setSelectedCase(updated);
      setNoteText('');
      setCases((prev) => prev.map((c) => (c.case_id === selectedCase.case_id ? updated : c)));
    }
  };

  const filteredCases = cases.filter((c) => statusFilter === 'ALL' || c.status === statusFilter);

  return (
    <div className="p-8 space-y-6">
      {/* Header Banner */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Cases</h1>
        <p className="text-xs text-slate-500 mt-1 font-medium">
          Track suspicious activity that needs investigation.
        </p>
      </div>

      {/* Workflow Tabs */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {['ALL', 'OPEN', 'UNDER_INVESTIGATION', 'ESCALATED', 'RESOLVED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold ${
                statusFilter === st
                  ? 'bg-blue-600 text-white font-bold'
                  : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {st.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
        <span className="text-xs text-slate-500 font-medium">{cases.length} Total Investigation Cases</span>
      </div>

      {/* 2 Column Case Explorer & Workstation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Cases Cards List */}
        <div className="space-y-3.5 max-h-[700px] overflow-y-auto pr-1">
          {filteredCases.map((c) => (
            <div
              key={c.case_id}
              onClick={() => setSelectedCase(c)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                selectedCase?.case_id === c.case_id
                  ? 'bg-blue-50/50 border-blue-600 shadow-2xs'
                  : 'bg-white border-slate-200/80 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono font-bold text-slate-500">{c.case_id}</span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  c.priority === 'CRITICAL' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}>
                  {c.priority} Priority
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{c.title}</h4>
              <p className="text-xs text-slate-500 font-medium">Primary: {c.involved_accounts[0] || 'Vikram Malhotra'}</p>
              
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                <span>{c.assigned_analyst}</span>
                <span className="px-2.5 py-0.5 bg-slate-100 rounded-full text-[10px] text-slate-700 font-semibold">{c.status.replace(/_/g, ' ')}</span>
              </div>
            </div>
          ))}
          {filteredCases.length === 0 && (
            <div className="p-8 text-center text-slate-500 text-xs bg-white rounded-2xl border border-slate-200">
              <p>No active investigations in this state.</p>
              <p className="mt-1 text-[11px] text-slate-400">Run the demo to create a suspicious network case.</p>
            </div>
          )}
        </div>

        {/* Right Selected Case Workstation */}
        <div className="lg:col-span-2">
          {selectedCase ? (
            <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-6">
              <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
                <div>
                  <span className="text-xs font-mono font-semibold text-slate-500">{selectedCase.case_id}</span>
                  <h2 className="text-lg font-bold text-slate-900">{selectedCase.title}</h2>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">Assigned Analyst: {selectedCase.assigned_analyst}</p>
                </div>

                {/* Status Action Buttons */}
                <div className="flex items-center gap-1.5">
                  {['OPEN', 'UNDER_INVESTIGATION', 'ESCALATED', 'RESOLVED'].map((st) => (
                    <button
                      key={st}
                      onClick={() => handleUpdateStatus(st)}
                      className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-all ${
                        selectedCase.status === st
                          ? 'bg-blue-600 text-white shadow-2xs'
                          : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      {st.replace(/_/g, ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Why this case was created */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-blue-600" />
                  <span>Why this case was created</span>
                </h4>
                <p className="text-xs text-slate-700 font-medium">
                  "Several connected transactions suggest that money was intentionally moved through multiple accounts in a short period."
                </p>
              </div>

              {/* People Involved & Findings */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">People Involved</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedCase.involved_accounts.map((accId, i) => (
                      <button
                        key={i}
                        onClick={() => onSelectAccount(accId)}
                        className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg font-semibold text-slate-800 hover:text-blue-600 hover:border-blue-300"
                      >
                        {accId}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Key Evidence Findings</span>
                  <ul className="space-y-1 text-slate-700 text-[11px] font-medium">
                    {selectedCase.evidence.map((ev, i) => (
                      <li key={i} className="flex items-start gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{translateEvidence(ev)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Notes & Analyst Log */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-blue-600" />
                  <span>Investigator Case Log & Notes</span>
                </h4>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {selectedCase.notes.map((note, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                      <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono mb-1">
                        <span className="font-bold text-slate-800">{note.author}</span>
                        <span>{new Date(note.timestamp).toLocaleString()}</span>
                      </div>
                      <p className="text-slate-700 font-medium">{note.text}</p>
                    </div>
                  ))}
                </div>

                {/* Add Note Input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add investigation note or case progress update..."
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                    className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white placeholder:text-slate-400"
                  />
                  <button
                    onClick={handleAddNote}
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl transition-colors shadow-2xs"
                  >
                    Post Note
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 bg-white rounded-2xl border border-slate-200 text-center text-slate-500 text-xs font-medium">
              Select an investigation case from the left list to view case details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
