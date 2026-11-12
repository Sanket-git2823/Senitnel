import { apiClient } from './api-client';
import { WorkOrder, WorkOrderStatus, ResolutionRecord, WorkOrderPriority, SubsystemType } from '../types/sentinel';
import { INITIAL_WORK_ORDERS } from '../data/mockData';

export interface CreateWorkOrderInput {
  title: string;
  priority: WorkOrderPriority;
  category: SubsystemType;
  location: string;
  assetId: string;
  assetName: string;
  description: string;
  recommendedAction: string;
  assignedTeam: string;
  assignedOperator?: string;
  dueDate?: string;
  relatedIncidentId?: string;
  impactKwhPerDay?: number;
  impactCostPerDay?: number;
  impactCo2PerDay?: number;
}

export class WorkOrderService {
  private localWorkOrders: WorkOrder[] = [...INITIAL_WORK_ORDERS];

  /**
   * Get all work orders with optional filtering
   */
  public async getWorkOrders(filterStatus?: string): Promise<WorkOrder[]> {
    const res = await apiClient.get<WorkOrder[]>('/work-orders', this.localWorkOrders);
    let items = res.data;
    if (filterStatus && filterStatus !== 'All') {
      items = items.filter((w) => w.status.toLowerCase() === filterStatus.toLowerCase());
    }
    return items;
  }

  /**
   * Get single work order by ID
   */
  public async getWorkOrderById(id: string): Promise<WorkOrder | undefined> {
    const orders = await this.getWorkOrders();
    return orders.find((w) => w.id === id);
  }

  /**
   * Create a new work order (e.g. from Anomaly or manual entry)
   */
  public async createWorkOrder(input: CreateWorkOrderInput): Promise<WorkOrder> {
    const newWo: WorkOrder = {
      id: `WO-${Math.floor(7830 + Math.random() * 500)}`,
      title: input.title,
      priority: input.priority,
      status: 'Open',
      assignedTo: input.assignedTeam,
      assignedOperator: input.assignedOperator || 'Assigned Lead',
      location: input.location,
      assetId: input.assetId,
      assetName: input.assetName,
      type: `${input.category} Maintenance`,
      category: input.category,
      detectedBy: 'Sentinel Operator Console',
      detectedAt: new Date().toLocaleTimeString('en-US', { hour12: false }) + ' IST',
      dueDate: input.dueDate || '2026-11-10 18:00 IST',
      description: input.description,
      impactKwhPerDay: input.impactKwhPerDay || 0,
      impactCostPerDay: input.impactCostPerDay || 0,
      impactCo2PerDay: input.impactCo2PerDay || 0,
      recommendedAction: input.recommendedAction,
      relatedIncidentId: input.relatedIncidentId || 'INC-MANUAL',
      steps: [
        { name: 'Work Order Created', timestamp: 'Just now', completed: true },
        { name: 'Assigned', completed: false, current: true },
        { name: 'Started', completed: false },
        { name: 'In Progress', completed: false },
        { name: 'Resolved', completed: false },
        { name: 'Verified', completed: false }
      ]
    };

    const res = await apiClient.post<WorkOrder, CreateWorkOrderInput>('/work-orders', input, newWo);
    this.localWorkOrders = [res.data, ...this.localWorkOrders];
    return res.data;
  }

  /**
   * Advance status in the 5-stage workflow
   */
  public async updateStatus(id: string, newStatus: WorkOrderStatus): Promise<WorkOrder | null> {
    const wo = this.localWorkOrders.find((w) => w.id === id);
    if (!wo) return null;

    const updatedSteps = wo.steps.map((step) => {
      if (step.name === newStatus) {
        return { ...step, completed: true, current: true, timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }) + ' IST' };
      }
      // If earlier step in sequence, make sure it is completed
      const order: WorkOrderStatus[] = ['Open', 'Assigned', 'Started', 'In Progress', 'Resolved', 'Verified'];
      const currentIndex = order.indexOf(newStatus);
      const stepIndex = order.indexOf(step.name as WorkOrderStatus);
      if (stepIndex < currentIndex) {
        return { ...step, completed: true, current: false };
      }
      return { ...step, current: false };
    });

    const updated: WorkOrder = {
      ...wo,
      status: newStatus,
      steps: updatedSteps
    };

    this.localWorkOrders = this.localWorkOrders.map((w) => (w.id === id ? updated : w));
    const res = await apiClient.patch<WorkOrder>(`/work-orders/${id}/status`, { status: newStatus }, updated);
    return res.data;
  }

  /**
   * Complete & verify work order with resolution record
   */
  public async resolveWorkOrder(id: string, resolution: ResolutionRecord): Promise<WorkOrder | null> {
    const wo = this.localWorkOrders.find((w) => w.id === id);
    if (!wo) return null;

    const resolved: WorkOrder = {
      ...wo,
      status: 'Verified',
      resolution,
      steps: wo.steps.map((s) => ({ ...s, completed: true, current: s.name === 'Verified' }))
    };

    this.localWorkOrders = this.localWorkOrders.map((w) => (w.id === id ? resolved : w));
    const res = await apiClient.post<WorkOrder>(`/work-orders/${id}/resolve`, resolution, resolved);
    return res.data;
  }
}

export const workOrderService = new WorkOrderService();
