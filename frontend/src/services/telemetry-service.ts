import { apiClient, WsSubscriptionCallback } from './api-client';
import { TelemetryPoint } from '../types/sentinel';
import { LAB_204_TELEMETRY, LAB_204_TELEMETRY_RESOLVED, TELEMETRY_TEMP_SERIES, TELEMETRY_OCCUPANCY_SERIES } from '../data/mockData';

export class TelemetryService {
  /**
   * Get power time-series for an asset
   */
  public async getPowerSeries(assetId: string, isResolved: boolean = false): Promise<TelemetryPoint[]> {
    const defaultData = isResolved ? LAB_204_TELEMETRY_RESOLVED : LAB_204_TELEMETRY;
    const res = await apiClient.get<TelemetryPoint[]>(`/telemetry/power?asset=${assetId}&resolved=${isResolved}`, defaultData);
    return res.data;
  }

  /**
   * Get temperature telemetry time-series
   */
  public async getTempSeries(assetId: string): Promise<TelemetryPoint[]> {
    const res = await apiClient.get<TelemetryPoint[]>(`/telemetry/temperature?asset=${assetId}`, TELEMETRY_TEMP_SERIES);
    return res.data;
  }

  /**
   * Get occupancy count time-series
   */
  public async getOccupancySeries(assetId: string): Promise<TelemetryPoint[]> {
    const res = await apiClient.get<TelemetryPoint[]>(`/telemetry/occupancy?asset=${assetId}`, TELEMETRY_OCCUPANCY_SERIES);
    return res.data;
  }

  /**
   * Subscribe to live real-time telemetry stream
   */
  public subscribeToAssetTelemetry(assetId: string, callback: WsSubscriptionCallback<TelemetryPoint>): () => void {
    const topic = `telemetry/${assetId}`;
    return apiClient.subscribeToStream<TelemetryPoint>(topic, callback);
  }
}

export const telemetryService = new TelemetryService();
