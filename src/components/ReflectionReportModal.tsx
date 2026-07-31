import React, { useState, useRef } from 'react';
import { X, FileText, Download, Sparkles, CheckCircle2, Award, Printer, HeartHandshake, BookOpen, User, GraduationCap } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { soundManager } from '../utils/sound';

interface ReflectionReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  levelTitle: string;
  balanceIndex: number;
  grassCount: number;
  rabbitCount: number;
  wolfCount: number;
  eagleCount: number;
  elapsedTime: number;
}

export const ReflectionReportModal: React.FC<ReflectionReportModalProps> = ({
  isOpen,
  onClose,
  levelTitle,
  balanceIndex,
  grassCount,
  rabbitCount,
  wolfCount,
  eagleCount,
  elapsedTime,
}) => {
  const [schoolName, setSchoolName] = useState<string>('');
  const [studentClass, setStudentClass] = useState<string>('');
  const [studentName, setStudentName] = useState<string>('');
  
  // Reflection Questions
  const [q1Observation, setQ1Observation] = useState<string>(
    '풀(생산자)이 부족해지면 토끼(1차 소비자)가 굶어 죽고, 이어서 늑대(2차 소비자)도 먹이가 없어 개체수가 연속으로 급감하는 먹이사슬 연쇄 반응을 관찰했습니다. 각 단계의 생물이 일정한 비율을 유지해야만 생태계가 안정됩니다.'
  );
  const [q2CrisisSolution, setQ2CrisisSolution] = useState<string>(
    '가뭄으로 풀이 마를 때는 단비를 내리고 비료를 공급하여 풀을 먼저 회복시켰으며, 늑대의 과도한 사냥을 막기 위해 토끼 보호구역(🛡️)을 설치하여 생태계 균형을 되찾았습니다.'
  );

  // Preset Action Checklist
  const [selectedActions, setSelectedActions] = useState<string[]>([
    '텀블러와 다회용 용기를 사용하여 일회용 플라스틱 줄이기',
    '사용하지 않는 전등 끄기 및 미사용 플러그 뽑기로 에너지 절약하기',
    '음식물을 남기지 않고 적당량만 조리하여 잔반 줄이기'
  ]);

  const [customAction, setCustomAction] = useState<string>(
    '가까운 거리는 자전거나 도보로 이동하여 탄소 배출 절감에 기여하겠습니다.'
  );

  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const reportRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const actionPresets = [
    '텀블러와 다회용 용기를 사용하여 일회용 플라스틱 줄이기',
    '사용하지 않는 전등 끄기 및 미사용 플러그 뽑기로 에너지 절약하기',
    '음식물을 남기지 않고 적당량만 조리하여 잔반 줄이기',
    '올바른 분리배출 방법으로 쓰레기 재활용률 높이기',
    '가까운 거리는 대중교통이나 걸어서 이동하기',
    '야생 동식물의 서식지를 보호하고 쓰레기 무단 투기 금지하기'
  ];

  const toggleAction = (action: string) => {
    soundManager.playClick();
    if (selectedActions.includes(action)) {
      setSelectedActions(selectedActions.filter((a) => a !== action));
    } else {
      setSelectedActions([...selectedActions, action]);
    }
  };

  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;
    soundManager.playClick();
    setIsGeneratingPdf(true);

    try {
      const element = reportRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210; // A4 width mm
      const pageHeight = 297; // A4 height mm
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

      const fileName = studentName
        ? `생태계_탐구보고서_${studentName}.pdf`
        : '생태계_탐구보고서_중학생.pdf';

      pdf.save(fileName);
    } catch (err) {
      console.error('PDF Generation Error:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handlePrint = () => {
    soundManager.playClick();
    window.print();
  };

  const todayDate = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-cyan-800 p-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-white/20 rounded-2xl backdrop-blur-md">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight">📝 생태계 탐구 보고서 & 실천 다짐 작성</h2>
              <p className="text-xs text-emerald-100">게임 체험 결과를 바탕으로 탐구 내용과 환경 실천 약속을 작성하고 PDF로 저장하세요.</p>
            </div>
          </div>
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="p-2 hover:bg-white/20 rounded-full transition-colors text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Content / Printable Area */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-slate-800">
          {/* Printable Report Paper Container */}
          <div
            id="ecosystem-reflection-report"
            ref={reportRef}
            className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6 max-w-3xl mx-auto font-sans"
          >
            {/* Title Block */}
            <div className="text-center pb-4 border-b-2 border-emerald-600 space-y-1">
              <div className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-black mb-1">
                🎓 중학교 과학과 생태계와 환경 수행평가 보고서
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                🌱 생태계 균형 탐구 및 환경 실천 보고서
              </h1>
              <p className="text-xs text-slate-500">작성일자: {todayDate}</p>
            </div>

            {/* Student Info Inputs */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-extrabold text-slate-600 mb-1 flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5 text-emerald-600" /> 학교명
                </label>
                <input
                  type="text"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  placeholder="예: 한국중학교"
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-slate-600 mb-1 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-emerald-600" /> 학년 / 반 / 번호
                </label>
                <input
                  type="text"
                  value={studentClass}
                  onChange={(e) => setStudentClass(e.target.value)}
                  placeholder="예: 3학년 2반 15번"
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-slate-600 mb-1 flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-emerald-600" /> 학생 이름
                </label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="예: 홍길동"
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Game Result Summary Card */}
            <div className="bg-emerald-50/70 border border-emerald-200 p-4 rounded-2xl space-y-3">
              <h3 className="text-xs font-extrabold text-emerald-900 flex items-center gap-1.5">
                📊 [시뮬레이션 체험 결과 요약]
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                <div className="bg-white p-2.5 rounded-xl border border-emerald-100 shadow-2xs">
                  <span className="text-[10px] text-slate-500 block">탐구 미션</span>
                  <span className="font-bold text-slate-800 text-xs truncate block">{levelTitle}</span>
                </div>

                <div className="bg-white p-2.5 rounded-xl border border-emerald-100 shadow-2xs">
                  <span className="text-[10px] text-slate-500 block">최고 균형 지수</span>
                  <span className="font-extrabold text-emerald-700 text-sm">{balanceIndex}점</span>
                </div>

                <div className="bg-white p-2.5 rounded-xl border border-emerald-100 shadow-2xs">
                  <span className="text-[10px] text-slate-500 block">최종 생물 개체수</span>
                  <span className="font-bold text-slate-800 text-xs">
                    🌿{grassCount} | 🐇{rabbitCount} | 🐺{wolfCount}
                  </span>
                </div>

                <div className="bg-white p-2.5 rounded-xl border border-emerald-100 shadow-2xs">
                  <span className="text-[10px] text-slate-500 block">탐구 유지 시간</span>
                  <span className="font-bold text-slate-800 text-xs">{elapsedTime}초</span>
                </div>
              </div>
            </div>

            {/* Section 1: Scientific Reflections */}
            <div className="space-y-4">
              <h3 className="text-sm font-black text-slate-900 border-b border-slate-200 pb-1 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-emerald-600" /> 1. 생태계 균형에 관한 나의 생각 및 관찰
              </h3>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-800">
                  Q1. 게임에서 생산자(풀), 초식동물(토끼), 육식동물(늑대)의 개체수가 변할 때 생태계에 어떤 영향이 있었나요?
                </label>
                <textarea
                  rows={3}
                  value={q1Observation}
                  onChange={(e) => setQ1Observation(e.target.value)}
                  className="w-full p-3 bg-white border border-slate-300 rounded-xl text-xs text-slate-700 leading-relaxed focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  placeholder="자신의 생각과 관찰 결과를 서술하세요."
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-800">
                  Q2. 생태계 위기(가뭄, 멸종 위기 등)를 극복하기 위해 가장 중요한 원리는 무엇인가요?
                </label>
                <textarea
                  rows={3}
                  value={q2CrisisSolution}
                  onChange={(e) => setQ2CrisisSolution(e.target.value)}
                  className="w-full p-3 bg-white border border-slate-300 rounded-xl text-xs text-slate-700 leading-relaxed focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  placeholder="생태계 보전과 복구 방법에 대한 생각을 서술하세요."
                />
              </div>
            </div>

            {/* Section 2: Action Commitment Checklist */}
            <div className="space-y-4">
              <h3 className="text-sm font-black text-slate-900 border-b border-slate-200 pb-1 flex items-center gap-1.5">
                <HeartHandshake className="w-4 h-4 text-emerald-600" /> 2. 지구 생태계 균형을 위한 나의 실천 약속
              </h3>
              <p className="text-xs text-slate-600">
                실생활에서 내가 실천할 수 있는 항목을 체크하거나 직접 약속을 작성해보세요!
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {actionPresets.map((preset, idx) => {
                  const isChecked = selectedActions.includes(preset);
                  return (
                    <div
                      key={idx}
                      onClick={() => toggleAction(preset)}
                      className={`p-2.5 rounded-xl border text-xs font-medium cursor-pointer transition-all flex items-start space-x-2 ${
                        isChecked
                          ? 'bg-emerald-50 border-emerald-400 text-emerald-900 font-bold shadow-2xs'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>{preset}</span>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-1.5 pt-2">
                <label className="block text-xs font-bold text-slate-800">
                  ✏️ 나만의 추가 실천 다짐:
                </label>
                <input
                  type="text"
                  value={customAction}
                  onChange={(e) => setCustomAction(e.target.value)}
                  placeholder="예: 쓰레기를 함부로 버리지 않고 야생 동물을 보호하겠습니다."
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Confirmation Seal Footer */}
            <div className="pt-6 border-t border-slate-200 text-center space-y-2">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-slate-100 rounded-full text-xs font-extrabold text-slate-700">
                <span>위 학생은 생태계 탐구 시뮬레이션 및 환경 실천 다짐을 성실히 이수하였음을 확인합니다.</span>
              </div>
              <div className="text-xs font-bold text-slate-500">
                {schoolName || '생태계 탐구 교실'} 지도교사 확인 란 [ 서명 / (인) ]
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500 font-medium hidden sm:block">
            💡 작성 후 [PDF 보고서 다운로드] 버튼을 누르면 문서로 저장할 수 있습니다.
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            <button
              onClick={handlePrint}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs transition-colors flex items-center space-x-1.5 border border-slate-300"
            >
              <Printer className="w-4 h-4" />
              <span>인쇄하기</span>
            </button>

            <button
              onClick={handleDownloadPDF}
              disabled={isGeneratingPdf}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-black rounded-2xl text-xs transition-all shadow-md flex items-center space-x-2 disabled:opacity-50"
            >
              {isGeneratingPdf ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>PDF 생성 중...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>📄 PDF 보고서 다운로드</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
