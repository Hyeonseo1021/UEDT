// ④ 내 영역 — CityScene.demo.tsx
// 임시 확인용. ③ App 통합 시 삭제.

import { useState } from 'react'
import { CityScene } from './CityScene'
import { MOCK_BUILDINGS, MOCK_STATE } from './mock'

const RISK_COLOR: Record<string, string> = {
  normal: '#22c55e', warning: '#f59e0b', danger: '#ef4444',
}

export function CitySceneDemo() {
  const [selectedId, setSelectedId] = useState<number | null>(null)

  const handleClick = (id: number) => {
    console.log('[Demo] building_id:', id)
    setSelectedId(prev => prev === id ? null : id)
  }

  const selected      = MOCK_BUILDINGS.find(b => b.building_id === selectedId)
  const selectedState = MOCK_STATE.buildings.find(b => b.building_id === selectedId)

  const danger  = MOCK_STATE.buildings.filter(b => b.risk === 'danger').length
  const warning = MOCK_STATE.buildings.filter(b => b.risk === 'warning').length
  const normal  = MOCK_STATE.buildings.filter(b => b.risk === 'normal').length

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      <CityScene
        buildings={MOCK_BUILDINGS}
        selectedId={selectedId}
        viewMode="status"
        onBuildingClick={handleClick}
      />

      {/* 좌상단 타이틀 */}
      <div style={{
        position: 'absolute', top: 20, left: 20,
        background: 'rgba(15,23,42,0.82)',
        backdropFilter: 'blur(10px)',
        border: '1px solid #1e3a5f',
        borderRadius: 10,
        padding: '12px 18px',
        fontFamily: 'ui-monospace, monospace',
        pointerEvents: 'none',
      }}>
        <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: 2, color: '#38bdf8',
          textShadow: '0 0 10px #38bdf880' }}>
          SUZHOU INDUSTRIAL PARK
        </div>
        <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 3, letterSpacing: 1 }}>
          DIGITAL TWIN · POWER LOAD MONITOR
        </div>
        <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
          {MOCK_STATE.timestamp} · {MOCK_STATE.weather.temperature}°C · {MOCK_STATE.weather.humidity}% RH
        </div>
      </div>

      {/* 우상단 범례 */}
      <div style={{
        position: 'absolute', top: 20, right: 20,
        background: 'rgba(15,23,42,0.88)',
        backdropFilter: 'blur(12px)',
        border: '1px solid #1e293b',
        borderRadius: 10,
        padding: '12px 16px',
        color: '#cbd5e1',
        fontFamily: 'ui-monospace, monospace',
        fontSize: 13,
        minWidth: 165,
        pointerEvents: 'none',
      }}>
        <div style={{ color: '#64748b', fontSize: 10, marginBottom: 8, letterSpacing: 1 }}>RISK STATUS</div>
        {[['danger','🚨 DANGER',danger],['warning','⚠️ WARNING',warning],['normal','✅ NORMAL',normal]].map(
          ([r, label, count]) => (
          <div key={r as string} style={{ display:'flex', justifyContent:'space-between', marginBottom: 5 }}>
            <span style={{ color: RISK_COLOR[r as string] }}>{label as string}</span>
            <span style={{ color: '#475569' }}>{count as number}</span>
          </div>
        ))}
        <div style={{ borderTop: '1px solid #1e293b', marginTop: 8, paddingTop: 8, fontSize: 12 }}>
          {[['#60a5fa','🏢 OFFICE',5],['#fb923c','🏘️ RESIDENTIAL',8],
            ['#7dd3fc','🏪 COMMERCIAL',4],['#fbbf24','🏛️ PUBLIC',3]].map(([c,l,n]) => (
            <div key={l as string} style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
              <span style={{ color: c as string }}>{l as string}</span>
              <span>{n}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 하단 선택 카드 */}
      {selected && selectedState && (
        <div style={{
          position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(15,23,42,0.94)',
          border: `2px solid ${RISK_COLOR[selectedState.risk]}`,
          borderRadius: 12, padding: '14px 28px',
          color: '#f1f5f9',
          fontFamily: 'ui-monospace, monospace', fontSize: 14,
          backdropFilter: 'blur(16px)',
          minWidth: 340, display: 'flex', gap: 28,
          boxShadow: `0 0 24px ${RISK_COLOR[selectedState.risk]}44`,
        }}>
          <div>
            <div style={{ color: '#94a3b8', fontSize: 10, letterSpacing: 1 }}>SELECTED</div>
            <div style={{ fontWeight: 700, fontSize: 16, color: '#38bdf8', marginTop: 2 }}>
              {selected.display_name}
            </div>
            <div style={{ color: '#64748b', fontSize: 11 }}>
              {selected.building_type.toUpperCase()} · ID {selected.building_id}
            </div>
          </div>
          <div style={{ borderLeft: '1px solid #1e293b', paddingLeft: 28 }}>
            <div style={{ color: RISK_COLOR[selectedState.risk], fontWeight: 700 }}>
              {selectedState.risk === 'danger' ? '🚨' : selectedState.risk === 'warning' ? '⚠️' : '✅'}{' '}
              {selectedState.risk.toUpperCase()}
            </div>
            <div style={{ color: '#cbd5e1', marginTop: 4 }}>
              Actual: <strong>{selectedState.load_kw.toFixed(0)}</strong> kW
            </div>
            <div style={{ color: '#94a3b8', fontSize: 12 }}>
              Pred: {selectedState.predicted_kw.toFixed(0)} kW
            </div>
          </div>
        </div>
      )}

      {!selectedId && (
        <div style={{
          position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)',
          color: '#475569', fontFamily: 'ui-monospace, monospace', fontSize: 12,
          pointerEvents: 'none',
        }}>
          드래그 회전 · 스크롤 줌 · 클릭으로 건물 선택
        </div>
      )}
    </div>
  )
}
