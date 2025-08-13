import axios from 'axios';
import config from '../config';

export interface IRegistration {
  _id: string;
  eventId: {
    _id: string;
    name: string;
    game: string;
    startDate: string;
    registrationDeadline?: string;
  };
  name: string;
  email: string;
  phoneNumber: string;
  gameName: string;
  gameId?: string;
  team?: string;
  message?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export interface RegistrationFormData {
  eventId: string;
  name: string;
  email: string;
  phoneNumber: string;
  gameName: string;
  gameId?: string;
  team?: string;
  message?: string;
}

export interface RegistrationStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  byEvent: { [eventId: string]: number };
}

class RegistrationService {
  private apiUrl = `${config.apiUrl}/registrations`;

  // Get all registrations
  async getAllRegistrations(): Promise<{ registrations: IRegistration[], pagination: any } | IRegistration[]> {
    try {
      const response = await axios.get(this.apiUrl);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch registrations');
    }
  }

  // Get registrations by event ID
  async getRegistrationsByEvent(eventId: string): Promise<IRegistration[]> {
    try {
      const response = await axios.get(`${this.apiUrl}/event/${eventId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch event registrations');
    }
  }

  // Get single registration by ID
  async getRegistrationById(id: string): Promise<IRegistration> {
    try {
      const response = await axios.get(`${this.apiUrl}/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch registration');
    }
  }

  // Create new registration
  async createRegistration(data: RegistrationFormData): Promise<IRegistration> {
    try {
      const response = await axios.post(this.apiUrl, data);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create registration');
    }
  }

  // Update registration status
  async updateRegistrationStatus(id: string, status: 'pending' | 'approved' | 'rejected'): Promise<IRegistration> {
    try {
      const response = await axios.patch(`${this.apiUrl}/${id}/status`, { status });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update registration status');
    }
  }

  // Delete registration
  async deleteRegistration(id: string): Promise<void> {
    try {
      await axios.delete(`${this.apiUrl}/${id}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete registration');
    }
  }

  // Get registration statistics
  async getRegistrationStats(): Promise<RegistrationStats> {
    try {
      const registrationsResponse = await this.getAllRegistrations();
      
      // Handle both paginated and non-paginated responses
      const registrations = Array.isArray(registrationsResponse) 
        ? registrationsResponse 
        : registrationsResponse.registrations;
      
      const stats: RegistrationStats = {
        total: registrations.length,
        pending: registrations.filter(r => r.status === 'pending').length,
        approved: registrations.filter(r => r.status === 'approved').length,
        rejected: registrations.filter(r => r.status === 'rejected').length,
        byEvent: {}
      };

      // Group by event
      registrations.forEach(registration => {
        const eventId = registration.eventId._id;
        stats.byEvent[eventId] = (stats.byEvent[eventId] || 0) + 1;
      });

      return stats;
    } catch (error: any) {
      throw new Error('Failed to calculate registration statistics');
    }
  }

  // Bulk update registration statuses
  async bulkUpdateStatus(registrationIds: string[], status: 'pending' | 'approved' | 'rejected'): Promise<void> {
    try {
      await Promise.all(
        registrationIds.map(id => this.updateRegistrationStatus(id, status))
      );
    } catch (error: any) {
      throw new Error('Failed to bulk update registration statuses');
    }
  }

  // Bulk delete registrations
  async bulkDeleteRegistrations(registrationIds: string[]): Promise<void> {
    try {
      await Promise.all(
        registrationIds.map(id => this.deleteRegistration(id))
      );
    } catch (error: any) {
      throw new Error('Failed to bulk delete registrations');
    }
  }

  // Export registrations to CSV
  async exportRegistrations(eventId?: string): Promise<string> {
    try {
      const registrationsResponse = eventId 
        ? await this.getRegistrationsByEvent(eventId)
        : await this.getAllRegistrations();

      // Handle both paginated and non-paginated responses
      const registrations = Array.isArray(registrationsResponse) 
        ? registrationsResponse 
        : registrationsResponse.registrations;

      const headers = [
        'Name',
        'Email',
        'Phone',
        'Game Name',
        'Game ID',
        'Team',
        'Event',
        'Status',
        'Registration Date',
        'Message'
      ];

      const csvData = registrations.map(reg => [
        reg.name,
        reg.email,
        reg.phoneNumber,
        reg.gameName,
        reg.gameId || '',
        reg.team || '',
        reg.eventId.name,
        reg.status,
        new Date(reg.createdAt).toLocaleDateString(),
        reg.message || ''
      ]);

      const csvContent = [
        headers.join(','),
        ...csvData.map(row => row.map(field => `"${field}"`).join(','))
      ].join('\n');

      return csvContent;
    } catch (error: any) {
      throw new Error('Failed to export registrations');
    }
  }
}

const registrationService = new RegistrationService();
export default registrationService;
