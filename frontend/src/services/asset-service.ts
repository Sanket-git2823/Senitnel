import { apiClient } from './api-client';
import { BuildingNode, Floor, Room, Sensor } from '../types/sentinel';
import { INITIAL_BUILDINGS, CAMPUS_FLOORS_ACAD_A } from '../data/mockData';

export class AssetService {
  /**
   * Get all campus building nodes for maps, hierarchy, and digital twin
   */
  public async getBuildings(): Promise<BuildingNode[]> {
    const res = await apiClient.get<BuildingNode[]>('/assets/buildings', INITIAL_BUILDINGS);
    return res.data;
  }

  /**
   * Get specific building details
   */
  public async getBuildingById(id: string): Promise<BuildingNode | undefined> {
    const buildings = await this.getBuildings();
    return buildings.find((b) => b.id === id);
  }

  /**
   * Get floors and rooms hierarchy for a building
   */
  public async getBuildingFloors(buildingId: string): Promise<Floor[]> {
    const res = await apiClient.get<Floor[]>(`/assets/buildings/${buildingId}/floors`, CAMPUS_FLOORS_ACAD_A);
    return res.data;
  }

  /**
   * Get individual room details with sensor telemetry
   */
  public async getRoomDetails(buildingId: string, roomId: string): Promise<Room | null> {
    const floors = await this.getBuildingFloors(buildingId);
    for (const f of floors) {
      const room = f.rooms.find((r) => r.id === roomId);
      if (room) return room;
    }
    return null;
  }

  /**
   * Update thermostat setpoint or override command
   */
  public async setThermostatSetpoint(roomId: string, targetTempC: number): Promise<boolean> {
    const res = await apiClient.post<{ success: boolean }>(`/assets/rooms/${roomId}/controls/setpoint`, {
      targetTempC,
      operatorOverride: true
    }, { success: true });
    return res.success;
  }
}

export const assetService = new AssetService();
