import React from 'react';
import { X, ShieldCheck, Lock, UserCheck, Server, AlertCircle } from 'lucide-react';
import { soundManager } from '../utils/sound';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-2xl">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight">🔒 개인정보 처리방침 (Privacy Policy)</h2>
              <p className="text-xs text-slate-400">생태계 균형 맞추기 게임 · 학운위(에듀집) 및 도름스(dorms-check) 준수 기준</p>
            </div>
          </div>
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-300 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-slate-700 text-xs leading-relaxed flex-1">
          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl text-emerald-900 space-y-2">
            <h3 className="font-extrabold text-sm flex items-center gap-1.5 text-emerald-900">
              🌱 서비스 제작 목적 및 개발자 정보
            </h3>
            <p className="text-xs text-emerald-800 leading-relaxed">
              본 웹 애플리케이션은 <strong>중학생 들이 생태계 균형을 직접 만들어 보고 게임을 통하여 자신의 생각을 정리하며 생태계 보전에 대한 학습을 할 수 있도록 만든 교육용 시뮬레이터</strong>입니다.
            </p>
            <div className="text-[11px] text-emerald-700 font-bold pt-1 border-t border-emerald-200/80">
              개발자: Gabriel Math (Gabriel Byeongje Jeon) | 문의: gabriel@gabrielmath.kr
            </div>
          </div>

          <div className="space-y-4">
            <section className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-1.5">
              <h4 className="font-black text-slate-900 text-xs flex items-center gap-1">
                제1조 (개인정보의 처리 목적)
              </h4>
              <p className="text-slate-600">
                본 앱은 학생의 웹 시뮬레이션 상태 저장 및 학습 결과물(탐구 보고서 PDF) 생성을 목적으로 하며, 수집된 정보는 어떠한 경우에도 외부 서버로 전송되거나 상업적으로 이용되지 않습니다.
              </p>
            </section>

            <section className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-1.5">
              <h4 className="font-black text-slate-900 text-xs flex items-center gap-1">
                제2조 (수집하는 개인정보 항목 및 수집 방법)
              </h4>
              <ul className="list-disc list-inside text-slate-600 space-y-1">
                <li><strong>수집 항목:</strong> 학교명, 학년/반/번호, 학생 이름(선택 사항), 탐구 서술문 및 실천 다짐글</li>
                <li><strong>수집 및 저장 방식:</strong> 학생이 작성한 정보는 외부 서버로 전송되지 않고, 학생 본인 기기의 웹 브라우저 메모리(Local Client Memory) 상에서만 일시적으로 처리된 후 PDF 생성 즉시 소멸됩니다.</li>
              </ul>
            </section>

            <section className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-1.5">
              <h4 className="font-black text-slate-900 text-xs flex items-center gap-1">
                제3조 (개인정보의 보유 및 파기)
              </h4>
              <p className="text-slate-600">
                본 앱은 별도의 회원가입 및 중앙 데이터베이스 서버를 운영하지 않습니다. 따라서 학생이 브라우저 탭을 닫거나 새롭게 새로고침하는 순간 모든 입력 정보는 즉시 완전히 파기됩니다.
              </p>
            </section>

            <section className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-1.5">
              <h4 className="font-black text-slate-900 text-xs flex items-center gap-1">
                제4조 (개인정보의 안전성 확보 조치)
              </h4>
              <p className="text-slate-600">
                본 웹 앱은 보안 전송(HTTPS, TLS)을 강제 적용하며, Content-Security-Policy(CSP), X-Frame-Options, Strict-Transport-Security 등 최신 웹 보안 헤더를 적용하여 학생 정보의 유출 및 악성 스크립트 공격(XSS, 클릭재킹)을 근본적으로 차단합니다.
              </p>
            </section>

            <section className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-1.5">
              <h4 className="font-black text-slate-900 text-xs flex items-center gap-1">
                제5조 (정보주체의 권리·의무 및 행사방법)
              </h4>
              <p className="text-slate-600">
                학생 및 보호자는 언제든지 입력한 정보를 수정하거나 완전히 삭제(새로고침 또는 창 닫기)할 수 있으며, 어떠한 개인 식별 데이터도 남아있지 않습니다.
              </p>
            </section>

            <section className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-1.5">
              <h4 className="font-black text-slate-900 text-xs flex items-center gap-1">
                제6조 (만 14세 미만 아동의 개인정보 보호)
              </h4>
              <p className="text-slate-600">
                본 앱은 만 14세 미만 중학생 및 초등학생을 위해 설계되었습니다. 학생의 이름 및 작성 내용은 외부 클라우드나 외부 AI API로 절대 전송되지 않으며, 학생 기기 로컬 단에서만 단독 처리되어 법적 아동 개인정보 침해 요소가 전혀 없습니다.
              </p>
            </section>

            <section className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-1.5">
              <h4 className="font-black text-slate-900 text-xs flex items-center gap-1">
                제7조 (제3자 제공 및 처리 위탁)
              </h4>
              <p className="text-slate-600">
                본 앱은 학생의 개인정보를 제3자에게 제공하거나 외부에 위탁(서버, 백엔드 DB, 외부 AI)하지 않습니다. 모든 로직은 클라이언트 사이드 단독으로 구동됩니다.
              </p>
            </section>

            <section className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-1.5">
              <h4 className="font-black text-slate-900 text-xs flex items-center gap-1">
                제8조 (개인정보 보호책임자 및 담당자)
              </h4>
              <div className="text-slate-600 space-y-0.5">
                <p>• <strong>개인정보 보호책임자:</strong> Gabriel Math (Gabriel Byeongje Jeon)</p>
                <p>• <strong>이메일 문의:</strong> gabriel@gabrielmath.kr</p>
                <p>• <strong>적용 일자:</strong> 2026년 7월 30일 시행</p>
              </div>
            </section>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex justify-between items-center shrink-0">
          <span className="text-[11px] text-slate-500 font-medium">
            ✅ 본 앱은 개인정보보호법 및 학교운영위원회(에듀집) 보안 기준을 완벽하게 준수합니다.
          </span>
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-colors"
          >
            확인 및 닫기
          </button>
        </div>
      </div>
    </div>
  );
};
