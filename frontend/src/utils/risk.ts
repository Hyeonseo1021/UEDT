import type { RiskLevel } from '../types/energy'

export function calculateLoadRate(consumption: number, threshold: number) {
  return Math.round((consumption / threshold) * 100)
}

export function calculateRiskLevel(loadRate: number): RiskLevel {
  // Risk level is calculated from predicted load rate
  // 예측 부하율 기준으로 정상/주의/위험 상태를 나눕니다.
  if (loadRate >= 90) {
    return 'danger'
  }

  if (loadRate >= 75) {
    return 'caution'
  }

  return 'normal'
}
