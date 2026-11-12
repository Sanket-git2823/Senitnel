import { apiClient } from './api-client';
import { Anomaly, AnomalyStatus, InvestigationContext, FilterState } from '../types/sentinel';
import { INITIAL_ANOMALIES, LAB_204_INVESTIGATION } from '../data/mockData';

export class IncidentService {
  /**
   * List campus anomalies with optional multi-facet filtering
   */
  public async getAnomalies(filters?: Partial<FilterState>): Promise<Anomaly[]> {
    const res = await apiClient.get<Anomaly[]>('/incidents/anomalies', INITIAL_ANOMALIES);
    let items = res.data;

    if (filters) {
      if (filters.status && filters.status !== 'All') {
        items = items.filter((a) => a.status.toLowerCase() === filters.status!.toLowerCase());
      }
      if (filters.anomaly && filters.anomaly !== 'All') {
        items = items.filter((a) => a.type.toLowerCase().includes(filters.anomaly!.toLowerCase()));
      }
      if (filters.building && filters.building !== 'All') {
        items = items.filter((a) => a.asset.toLowerCase().includes(filters.building!.toLowerCase()) || a.buildingId === filters.building);
      }
      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase();
        items = items.filter((a) => a.asset.toLowerCase().includes(q) || a.description.toLowerCase().includes(q) || a.id.toLowerCase().includes(q));
      }
    }

    return items;
  }

  /**
   * Get single anomaly by ID
   */
  public async getAnomalyById(id: string): Promise<Anomaly | undefined> {
    const anomalies = await this.getAnomalies();
    return anomalies.find((a) => a.id === id);
  }

  /**
   * Get deep investigation context for an anomaly/incident
   */
  public async getInvestigationContext(incidentId: string): Promise<InvestigationContext> {
    const res = await apiClient.get<InvestigationContext>(
      `/incidents/${incidentId}/investigation`,
      LAB_204_INVESTIGATION
    );
    return res.data;
  }

  /**
   * Update anomaly status (e.g. from New -> Investigating -> Resolved)
   */
  public async updateAnomalyStatus(id: string, status: AnomalyStatus): Promise<Anomaly | null> {
    const res = await apiClient.patch<Anomaly>(`/incidents/${id}/status`, { status }, {
      ...INITIAL_ANOMALIES[0],
      status
    });
    return res.data;
  }
}

export const incidentService = new IncidentService();
