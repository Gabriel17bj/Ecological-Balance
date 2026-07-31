import React, { useState } from 'react';
import { X, BookOpen, Gamepad2, Sparkles, Scale, AlertTriangle, Lightbulb, GraduationCap, CheckCircle2 } from 'lucide-react';
import { soundManager } from '../utils/sound';

interface EcosystemGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EcosystemGuideModal: React.FC<EcosystemGuideModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'howto' | 'foodchain' | 'tips' | 'science'>('howto');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 p-4 sm:p-5 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-white/20 rounded-2xl backdrop-blur-md">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight">📖 생태계 시뮬레이터 게임 설명서 & 학습 가이드</h2>
              <p className="text-xs text-emerald-100">중학교 과학 교육과정 연계 · 생태계 균형의 원리</p>
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

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 pt-2 gap-1 overflow-x-auto">
          {[
            { id: 'howto', label: '🎮 쉬운 조작법', icon: <Gamepad2 className="w-4 h-4" /> },
            { id: 'foodchain', label: '🌿 먹이사슬 관계', icon: <Scale className="w-4 h-4" /> },
            { id: 'tips', label: '💡 미션 성공 공략', icon: <Lightbulb className="w-4 h-4" /> },
            { id: 'science', label: '🧪 교과서 과학 개념', icon: <GraduationCap className="w-4 h-4" /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                soundManager.playClick();
                setActiveTab(tab.id as typeof activeTab);
              }}
              className={`flex items-center space-x-1.5 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all border-b-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-white text-emerald-800 border-emerald-600 shadow-xs'
                  : 'text-slate-500 border-transparent hover:text-slate-800 hover:bg-slate-100'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-slate-700 text-xs leading-relaxed flex-1">
          {/* TAB 1: HOW TO PLAY */}
          {activeTab === 'howto' && (
            <div className="space-y-4">
              <div className="bg-emerald-50/80 border border-emerald-200 p-4 rounded-2xl space-y-2">
                <h3 className="font-extrabold text-emerald-900 text-sm flex items-center gap-2">
                  🎯 게임의 목표
                </h3>
                <p className="text-emerald-800">
                  제한시간(20초~90초) 동안 <strong>풀(🌿), 토끼(🐇), 늑대(🐺)</strong> 등 모든 생물 종이 멸종하지 않고 서로 상호작용하며 건강한 균형을 유지하도록 수호하는 것입니다!
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs space-y-1.5">
                  <div className="font-bold text-slate-800 flex items-center gap-1.5 text-xs text-emerald-700">
                    <span className="p-1 bg-emerald-100 rounded-lg">1</span> 클릭 & 드래그로 배치
                  </div>
                  <p className="text-[11px] text-slate-600">
                    아래쪽 [도구함]에서 원하는 개체(풀, 토끼, 늑대)를 선택한 뒤, 맵 화면을 <strong>클릭하거나 마우스로 누른 채 슥 드래그</strong>하면 연속으로 쉽게 배치됩니다!
                  </p>
                </div>

                <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs space-y-1.5">
                  <div className="font-bold text-slate-800 flex items-center gap-1.5 text-xs text-blue-700">
                    <span className="p-1 bg-blue-100 rounded-lg">2</span> ⚡ 긴급 스마트 버튼 활용
                  </div>
                  <p className="text-[11px] text-slate-600">
                    토끼나 풀이 갑자기 줄어들면 우측 하단의 <strong>[⚡ 비상 풀 뿌리기]</strong> 또는 <strong>[⚡ 비상 먹이 공급]</strong> 버튼을 눌러 한 번에 구호할 수 있습니다.
                  </p>
                </div>

                <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs space-y-1.5">
                  <div className="font-bold text-slate-800 flex items-center gap-1.5 text-xs text-amber-700">
                    <span className="p-1 bg-amber-100 rounded-lg">3</span> 🛡️ 야생동물 보호구역 설정
                  </div>
                  <p className="text-[11px] text-slate-600">
                    늑대가 토끼를 너무 많이 잡아먹을 때 [보호구역] 도구를 선택하고 클릭하면 점선 보호 원이 생성되어 포식자가 들어오지 못합니다.
                  </p>
                </div>

                <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs space-y-1.5">
                  <div className="font-bold text-slate-800 flex items-center gap-1.5 text-xs text-purple-700">
                    <span className="p-1 bg-purple-100 rounded-lg">4</span> 🔍 개체 상세 정보 확인
                  </div>
                  <p className="text-[11px] text-slate-600">
                    [선택 / 탐색] 도구로 동물이나 풀을 클릭하면 현재 에너지, 나이, 행동 상태(사냥 중, 도망 중 등)를 실시간으로 관찰할 수 있습니다.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FOOD CHAIN */}
          {activeTab === 'foodchain' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-2xl text-center space-y-1">
                  <div className="text-3xl">🌿</div>
                  <div className="font-extrabold text-emerald-900 text-xs">1단계: 생산자 (풀)</div>
                  <p className="text-[10px] text-emerald-700">태양빛과 물을 흡수하여 유기물을 스스로 만드는 생태계의 기초</p>
                </div>

                <div className="bg-blue-50 border border-blue-200 p-3.5 rounded-2xl text-center space-y-1">
                  <div className="text-3xl">🐇</div>
                  <div className="font-extrabold text-blue-900 text-xs">2단계: 1차 소비자 (토끼)</div>
                  <p className="text-[10px] text-blue-700">풀을 먹고 에너지를 충전. 에너지 70% 이상 시 짝을 만나 머물며 [💕 번식 중] 상태로 새끼를 낳음</p>
                </div>

                <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-2xl text-center space-y-1">
                  <div className="text-3xl">🐺</div>
                  <div className="font-extrabold text-amber-900 text-xs">3단계: 2차 소비자 (늑대)</div>
                  <p className="text-[10px] text-amber-700">토끼를 사냥하는 육식동물. 토끼 수량을 조절하여 초원 사막화를 막음</p>
                </div>

                <div className="bg-purple-50 border border-purple-200 p-3.5 rounded-2xl text-center space-y-1">
                  <div className="text-3xl">🦅</div>
                  <div className="font-extrabold text-purple-900 text-xs">4단계: 최상위 포식자 (독수리)</div>
                  <p className="text-[10px] text-purple-700">하늘을 날며 토끼 및 어린 늑대를 포획하는 최상위 포식자</p>
                </div>
              </div>

              <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl space-y-2">
                <h4 className="font-extrabold text-rose-900 text-xs flex items-center gap-1.5">
                  💕 토끼의 번식 메커니즘 & 머무름 동작 안내
                </h4>
                <p className="text-[11px] text-rose-800 leading-relaxed">
                  · <strong>번식 유인 조건:</strong> 토끼가 충분한 양의 풀(🌿)을 마구 먹어서 <strong>에너지 수치가 70% 이상</strong>이 되고 성체(3초 이상)가 되면 짝짓기 준비 상태가 됩니다.<br />
                  · <strong>자리에 머무르는 이유 ([💕 번식 중...]):</strong> 에너지가 높은 다른 토끼와 근접(50픽셀 이내)하게 되면 이동을 멈추고 자리에 머무르며 <strong>[💕 번식 중...]</strong> 표시를 띄웁니다.<br />
                  · <strong>출산 및 에너토 소모:</strong> 약 1~2초간 머물며 번식을 마치면 <strong>1마리의 아기 토끼(🐇)</strong>가 출생하며, 부모 토끼는 출산 에너지 30이 소모됩니다.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-2">
                <h4 className="font-extrabold text-slate-800 text-xs flex items-center gap-1.5">
                  💀 분해자와 자원 순환 (사체 ➔ 거름)
                </h4>
                <p className="text-[11px] text-slate-600">
                  동물이 나이가 들거나 굶어서 죽으면 필드에 <strong>해골(💀 사체)</strong>이 생성됩니다. 사체는 미생물에 의해 분해되어 땅을 비옥하게 만들고 주변에 수풀이 무성하게 자라나게 하는 <strong>자연 순환 법칙</strong>을 보여줍니다.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: TIPS */}
          {activeTab === 'tips' && (
            <div className="space-y-3">
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl space-y-2">
                <h3 className="font-extrabold text-amber-900 text-xs flex items-center gap-1.5">
                  💡 단계별 클리어 꿀팁 모음
                </h3>
                <ul className="space-y-2 text-[11px] text-amber-800">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span><strong>풀은 항상 토끼보다 3배 이상 많아야 안전합니다:</strong> 토끼가 늘어나면 풀 소비 속도가 엄청나게 빨라지므로 씨앗(🌿)을 여유 있게 심어두세요.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span><strong>가뭄(Drought) 경보가 뜨면 단비(🌧️)를 내리세요:</strong> 가뭄이 오면 풀이 자라지 않습니다. 단비 도구나 상단 버튼으로 토양에 수분을 보충해 주면 초목이 신속하게 자랍니다.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span><strong>늑대 사냥터와 토끼 서식지 분리:</strong> [보호구역 🛡️]을 필드 가운데 설정하면 토끼가 그 안에서 안전하게 풀을 먹으며 번식할 수 있습니다.</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 4: SCIENCE */}
          {activeTab === 'science' && (
            <div className="space-y-3">
              <div className="bg-cyan-50 border border-cyan-200 p-4 rounded-2xl space-y-2">
                <h3 className="font-extrabold text-cyan-900 text-xs flex items-center gap-1.5">
                  🎓 중학교 과학 3학년: 생물과 환경 (생태계와 환경)
                </h3>
                <div className="space-y-2 text-[11px] text-cyan-800">
                  <div className="bg-white/80 p-2.5 rounded-xl border border-cyan-100">
                    <span className="font-bold block text-cyan-900">1. 생태계 Equilibrium (균형)</span>
                    생태계에 포함된 생물 요소(생산자, 소비자)와 비생물적 요인(햇빛, 물, 온도)이 상호작용하여 개체수가 일정 범위 내에서 유지되는 상태를 의미합니다.
                  </div>
                  <div className="bg-white/80 p-2.5 rounded-xl border border-cyan-100">
                    <span className="font-bold block text-cyan-900">2. 먹이 그물 (Food Web)</span>
                    하나의 생물이 여러 종을 먹거나 먹히면서 그물망처럼 복잡하게 얽혀 있는 관계입니다. 먹이 그물이 복잡할수록 한 종이 멸종하더라도 생태계 균형이 쉽게 무너지지 않습니다.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
          <span className="text-[11px] text-slate-500 font-semibold hidden sm:inline">
            Tip: 게임 도중 일시정지(⏸️)를 누르고 가이드를 확인해보세요!
          </span>
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-2xl text-xs transition-all shadow-md"
          >
            확인했습니다! 게임 시작하기
          </button>
        </div>
      </div>
    </div>
  );
};
