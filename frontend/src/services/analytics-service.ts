import { apiClient } from './api-client';
import {
  CAMPUS_ENERGY_DISTRIBUTION,
  BUILDING_ENERGY_COMPARISON,
  PEAK_DEMAND_CURVE
} from '../data/mockData';

export interface CampusAnalyticsSummary {
  totalConsumptionMWh: number;
  totalCostUsd: number;
  totalCarbonTons: number;
  activeAnomaliesCount: number;
  verifiedSavingsUsd: number;
  infrastructureHealthScore: number;
  distribution: typeof CAMPUS_ENERGY_DISTRIBUTION;
  buildingComparison: typeof BUILDING_ENERGY_COMPARISON;
  peakDemand: typeof PEAK_DEMAND_CURVE;
  subsystemAnomalyCount: { subsystem: string; count: number; resolvedCount: number }[];
}

export class AnalyticsService {
  /**
   * Get campus operational analytics bundle
   */
  public async getCampusAnalytics(timeRange: string = 'Today', isResolved: boolean = false): Promise<CampusAnalyticsSummary> {
    const mockData: CampusAnalyticsSummary = {
      totalConsumptionMWh: isResolved ? 9.85 : 10.36,
      totalCostUsd: isResolved ? 4768 : 4820,
      totalCarbonTons: isResolved ? 2.78 : 2.84,
      activeAnomaliesCount: isResolved ? 6 : 7,
      verifiedSavingsUsd: isResolved ? 692.40 : 640.00,
      infrastructureHealthScore: isResolved ? 96 : 92,
      distribution: CAMPUS_ENERGY_DISTRIBUTION,
      buildingComparison: BUILDING_ENERGY_COMPARISON,
      peakDemand: PEAK_DEMAND_CURVE,
      subsystemAnomalyCount: [
        { subsystem: 'HVAC', count: 4, resolvedCount: isResolved ? 2 : 1 },
        { subsystem: 'Lighting', count: 2, resolvedCount: 1 },
        { subsystem: 'Laboratory', count: 1, resolvedCount: isResolved ? 1 : 0 },
        { subsystem: 'Electrical', count: 2, resolvedCount: 2 }
      ]
    };

    const res = await apiClient.get<CampusAnalyticsSummary>(`/analytics/summary?range=${timeRange}`, mockData);
    return res.data;
  }
}

export const analyticsService = new AnalyticsService();
