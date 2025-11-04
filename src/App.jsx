import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

/**
 * GymAI Frontend – Gemini 자동 생성 데모 (single-file React component)
 * --------------------------------------------------------------
 * ✅ 데모 목적
 * - 프론트엔드만으로 Gem﻿ini API를 호출해 헬스장 관련 콘텐츠/섹션을 "자동 생성"하고 화면에 즉시 렌더
 * - 3가지 탭 데모: (1) 운동 플랜 생성 (2) 마케팅 카피/배너 생성 (3) UI 섹션 자동 생성 & 즉시 렌더
 * - API Key는 로컬에서만 입력/저장 (localStorage). 깃허브에 올릴 땐 키 포함 금지!
 *
 * ⚠️ 보안 주의: 교육/데모용으로 클라이언트에서 직접 호출 예시를 제공합니다.
 *    실제 서비스에서는 반드시 서버 프록시를 통해 키를 보호하세요.
 *
 * 📦 사전 준비
 *   npm i react framer-motion @google/generative-ai
 *
 * ▶ 사용법
 *   1) 아래 컴포넌트를 App.jsx 등에 그대로 붙여넣기
 *   2) 실행 후 상단의 "API Key 설정"에 키를 입력하고 Save
 *   3) 각 탭에서 프롬프트/옵션 입력 → Generate 클릭
 */

// 클라이언트용 SDK (교육/데모 목적)
import { GoogleGenerativeAI } from "@google/generative-ai";

export default function GymAIDemo() {
  const [apiKey, setApiKey] = useState("");
  const [activeTab, setActiveTab] = useState("plan"); // plan | marketing | ui

  // 공통 모형 (빠른 반응성: 1.5-flash)
  const genAI = useMemo(() => {
    try {
      return apiKey ? new GoogleGenerativeAI(apiKey) : null;
    } catch (e) {
      console.error(e);
      return null;
    }
  }, [apiKey]);

  // 초기 로드 시 localStorage에서 키 복원
  useEffect(() => {
    const saved = localStorage.getItem("GEMINI_API_KEY");
    if (saved) setApiKey(saved);
  }, []);

  const saveKey = () => {
    localStorage.setItem("GEMINI_API_KEY", apiKey.trim());
    alert("API Key saved locally (browser localStorage).");
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Header />

      <div className="max-w-5xl mx-auto px-4 py-6">
        <KeyPanel apiKey={apiKey} setApiKey={setApiKey} onSave={saveKey} />

        <TabBar active={activeTab} onChange={setActiveTab} />

        <div className="mt-6">
          {activeTab === "plan" && <WorkoutPlanTab genAI={genAI} />}
          {activeTab === "marketing" && <MarketingTab genAI={genAI} />}
          {activeTab === "ui" && <UIAutoBuildTab genAI={genAI} />}
        </div>
      </div>

      <Footer />
    </div>
  );
}

function Header() {
  return (
    <header className="bg-white border-b">
      <div className="max-w-5xl mx-auto px-4 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-black/90 flex items-center justify-center text-white font-bold">AI</div>
          <div>
            <h1 className="text-xl font-semibold">GymAI – Gemini 자동 생성 데모</h1>
            <p className="text-sm text-gray-500">헬스장 프론트엔드 콘텐츠 · UI 섹션을 자연어로 생성하고 즉시 렌더</p>
          </div>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="mt-12 py-8 text-center text-xs text-gray-500">
      <p>Demo only. Do not commit any secret keys. © {new Date().getFullYear()} GymAI</p>
    </footer>
  );
}

function KeyPanel({ apiKey, setApiKey, onSave }) {
  return (
    <div className="bg-white border rounded-2xl p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-base font-semibold">API Key 설정</h2>
          <p className="text-sm text-gray-500">로컬 브라우저에만 저장됩니다 (localStorage). 배포 시 서버 프록시 사용 권장.</p>
        </div>
        <button className="px-4 py-2 rounded-xl bg-black text-white text-sm" onClick={onSave}>Save</button>
      </div>
      <input
        type="password"
        className="w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300"
        placeholder="Enter your Gemini API key"
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
      />
    </div>
  );
}

function TabBar({ active, onChange }) {
  const tabs = [
    { id: "plan", label: "① 운동 플랜 생성" },
    { id: "marketing", label: "② 마케팅 카피/배너" },
    { id: "ui", label: "③ UI 섹션 자동 생성" },
  ];
  return (
    <div className="mt-6 grid grid-cols-3 gap-2">
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={`px-4 py-3 rounded-xl border bg-white text-sm font-medium transition ${
            active === t.id ? "ring-2 ring-black" : "hover:bg-gray-50"
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

// ① 운동 플랜 생성 탭
function WorkoutPlanTab({ genAI }) {
  const [goal, setGoal] = useState("체지방 감량 + 근력 유지");
  const [level, setLevel] = useState("초중급");
  const [days, setDays] = useState(4);
  const [timePerSession, setTimePerSession] = useState(60);
  const [equip, setEquip] = useState("덤벨, 바벨, 머신 기본 구비");
  const [notes, setNotes] = useState("무릎 약함, 고강도 인터벌은 1회/주만");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  async function generate() {
    if (!genAI) return alert("API Key를 먼저 설정하세요.");
    setLoading(true);
    setResult("");

    const prompt = `너는 인증된 피트니스 코치야. 아래 정보를 바탕으로 1주 운동 플랜을 표와 불릿으로 상세히 작성해줘.
- 목표: ${goal}
- 레벨: ${level}
- 주 ${days}회, 1회당 ${timePerSession}분
- 보유 장비: ${equip}
- 특이사항/제약: ${notes}

포함 요소:
1) 요일별 루틴(워밍업/본운동/마무리, 세트×반복, RPE 또는 %1RM)
2) 대체 운동(장비 없을 때)
3) 주간 프로그레션 권장안
4) 주의사항(부상 방지)
`; 

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const res = await model.generateContent(prompt);
      const text = await res.response.text();
      setResult(text.trim());
    } catch (e) {
      console.error(e);
      setResult("⚠️ 생성 중 오류가 발생했습니다. 콘솔을 확인해주세요.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card title="운동 플랜 생성" subtitle="목표/레벨/장비를 입력하고 Gemini로 1주 루틴을 자동 생성">
      <div className="grid md:grid-cols-2 gap-4">
        <LabeledInput label="목표" value={goal} onChange={setGoal} />
        <LabeledInput label="레벨" value={level} onChange={setLevel} />
        <LabeledInput label="주당 횟수" value={days} onChange={setDays} type="number" />
        <LabeledInput label="1회 시간(분)" value={timePerSession} onChange={setTimePerSession} type="number" />
        <LabeledInput label="보유 장비" value={equip} onChange={setEquip} />
        <LabeledInput label="특이사항/제약" value={notes} onChange={setNotes} />
      </div>
      <div className="mt-4 flex gap-2">
        <button onClick={generate} disabled={loading} className="px-4 py-2 rounded-xl bg-black text-white text-sm">
          {loading ? "Generating…" : "Generate"}
        </button>
        <button onClick={() => setResult("")} className="px-4 py-2 rounded-xl border text-sm">Clear</button>
      </div>

      {result && (
        <AIOutput text={result} />
      )}
    </Card>
  );
}

// ② 마케팅 카피/배너 생성 탭
function MarketingTab({ genAI }) {
  const [gymName, setGymName] = useState("GymAI Fitness");
  const [target, setTarget] = useState("20~30대 직장인");
  const [tone, setTone] = useState("담백하고 신뢰감");
  const [offer, setOffer] = useState("11월 신규회원 첫달 50% 할인 + PT 1회 제공");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  async function generate() {
    if (!genAI) return alert("API Key를 먼저 설정하세요.");
    setLoading(true);
    setResult("");

    const prompt = `너는 현직 피트니스 마케터야. 헬스장 배너/포스터/앱 배너용 문구와 소제목·해시태그·CTA를 만들어줘.
- 브랜드: ${gymName}
- 타겟: ${target}
- 톤앤매너: ${tone}
- 프로모션: ${offer}

결과물 요청 형식:
1) 상단 메인 헤드라인 (7~12자)
2) 서브헤드 2가지 (각 20~40자)
3) 본문 카피 1개 (100자 내외)
4) 앱/웹 배너용 초간단 슬로건 3개
5) 해시태그 6개
6) CTA 3개 (예: 지금 등록하기)
`;

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const res = await model.generateContent(prompt);
      const text = await res.response.text();
      setResult(text.trim());
    } catch (e) {
      console.error(e);
      setResult("⚠️ 생성 중 오류가 발생했습니다. 콘솔을 확인해주세요.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card title="마케팅 카피/배너" subtitle="앱·웹 배너나 포스터용 문구를 자동 생성">
      <div className="grid md:grid-cols-2 gap-4">
        <LabeledInput label="브랜드명" value={gymName} onChange={setGymName} />
        <LabeledInput label="타겟" value={target} onChange={setTarget} />
        <LabeledInput label="톤앤매너" value={tone} onChange={setTone} />
        <LabeledInput label="프로모션" value={offer} onChange={setOffer} />
      </div>
      <div className="mt-4 flex gap-2">
        <button onClick={generate} disabled={loading} className="px-4 py-2 rounded-xl bg-black text-white text-sm">
          {loading ? "Generating…" : "Generate"}
        </button>
        <button onClick={() => setResult("")} className="px-4 py-2 rounded-xl border text-sm">Clear</button>
      </div>

      {result && <AIOutput text={result} />}
    </Card>
  );
}

// ③ UI 섹션 자동 생성 & 즉시 렌더 탭
function UIAutoBuildTab({ genAI }) {
  const [instruction, setInstruction] = useState("신규회원 후기 카드 3개, 별점과 코멘트, 회원 사진 URL 포함");
  const [resultJSON, setResultJSON] = useState(null);
  const [raw, setRaw] = useState("");
  const [loading, setLoading] = useState(false);

  async function generate() {
    if (!genAI) return alert("API Key를 먼저 설정하세요.");
    setLoading(true);
    setResultJSON(null);
    setRaw("");

    const system = `너는 프론트엔드 UI 어시스턴트야. 반드시 유효한 JSON만 반환해.
JSON 스키마:
{
  "sections": [
    {
      "type": "cards",
      "title": string,
      "items": [
        {
          "avatar": string, // 이미지 URL
          "name": string,
          "rating": number, // 0~5
          "comment": string
        }
      ]
    }
  ]
}
코드블록, 주석, 설명 없이 JSON만 반환.`;

    const user = `요청: ${instruction}`;

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const res = await model.generateContent([
        { role: "user", parts: [{ text: system }] },
        { role: "user", parts: [{ text: user }] },
      ]);
      const text = await res.response.text();
      setRaw(text.trim());

      const parsed = safeJSON(text);
      if (!parsed) throw new Error("JSON parse failed");
      setResultJSON(parsed);
    } catch (e) {
      console.error(e);
      setRaw((prev) => prev + "\n\n⚠️ JSON 파싱 실패 – 프롬프트를 조정하거나 다시 시도하세요.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card title="UI 섹션 자동 생성" subtitle="자연어 요구 → JSON → 즉시 렌더 (카드/리스트 등 확장 가능)">
      <LabeledTextArea label="UI 요구사항 (한글/영문)" value={instruction} onChange={setInstruction} rows={3} />
      <div className="mt-4 flex gap-2">
        <button onClick={generate} disabled={loading} className="px-4 py-2 rounded-xl bg-black text-white text-sm">
          {loading ? "Generating…" : "Generate"}
        </button>
        <button onClick={() => { setResultJSON(null); setRaw(""); }} className="px-4 py-2 rounded-xl border text-sm">Clear</button>
      </div>

      {/* 원문 출력 */}
      {raw && (
        <div className="mt-4 bg-gray-900 text-gray-100 rounded-xl p-4 text-sm overflow-auto">
          <div className="font-medium mb-2">Model Output (raw)</div>
          <pre className="whitespace-pre-wrap">{raw}</pre>
        </div>
      )}

      {/* 즉시 렌더 */}
      {resultJSON && (
        <div className="mt-6 space-y-6">
          {resultJSON.sections?.map((sec, idx) => (
            <motion.div key={idx} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <h3 className="text-lg font-semibold mb-3">{sec.title || "Generated Section"}</h3>
              {sec.type === "cards" && <CardsGrid items={sec.items || []} />}
            </motion.div>
          ))}
        </div>
      )}
    </Card>
  );
}

function CardsGrid({ items }) {
  return (
    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
      {items.map((it, i) => (
        <div key={i} className="bg-white border rounded-2xl p-4 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <img src={it.avatar} alt={it.name} className="w-12 h-12 rounded-full object-cover border" />
            <div>
              <div className="font-medium">{it.name}</div>
              <div className="text-xs text-gray-500">★ {Number(it.rating ?? 0).toFixed(1)} / 5.0</div>
            </div>
          </div>
          <p className="text-sm text-gray-700">{it.comment}</p>
        </div>
      ))}
    </div>
  );
}

// 공통 UI 컴포넌트
function Card({ title, subtitle, children }) {
  return (
    <div className="bg-white border rounded-2xl p-5 mt-4">
      <div className="mb-4">
        <h2 className="text-lg font-semibold">{title}</h2>
        {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

function LabeledInput({ label, value, onChange, type = "text" }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-sm font-medium">{label}</span>
      <input
        type={type}
        className="border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300"
        value={value}
        onChange={(e) => onChange(type === "number" ? Number(e.target.value) : e.target.value)}
      />
    </label>
  );
}

function LabeledTextArea({ label, value, onChange, rows = 5 }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-sm font-medium">{label}</span>
      <textarea
        rows={rows}
        className="border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

function AIOutput({ text }) {
  return (
    <div className="mt-4 bg-gray-900 text-gray-100 rounded-xl p-4 text-sm overflow-auto">
      <div className="font-medium mb-2">Result</div>
      <pre className="whitespace-pre-wrap">{text}</pre>
    </div>
  );
}

// 모델이 코드블록으로 감싸거나 앞뒤에 설명을 붙였을 때를 대비한 파서
function safeJSON(maybeJSON) {
  try {
    const cleaned = maybeJSON
      .replace(/^```json\n?/i, "")
      .replace(/^```\n?/i, "")
      .replace(/```$/i, "")
      .trim();
    return JSON.parse(cleaned);
  } catch (_) {
    return null;
  }
}
