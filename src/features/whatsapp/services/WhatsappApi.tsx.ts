import axios, { type AxiosInstance } from 'axios'

// Types
export interface SendMessageRequest {
  studentIds?: string[]
  phoneNumber?: string
  templateName: string
  parameters: string[]
  scheduledAt?: string
}

export interface SendMessageResponse {
  success: boolean
  messageId?: string
  batchId?: string
  totalMessages?: number
  error?: string
}

export interface MessageStatus {
  id: string
  status: 'queued' | 'sent' | 'delivered' | 'read' | 'failed'
  sentAt?: string
  deliveredAt?: string
  readAt?: string
  errorMessage?: string
}

class WhatsAppApiService {
  private api: AxiosInstance

  constructor() {
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Add auth token to requests
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('authToken')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    })

    // Handle errors globally
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('API Error:', error)
        return Promise.reject(error)
      },
    )
  }

  // Configuration APIs
  async saveConfiguration(config: {
    phoneNumber: string
    phoneNumberId: string
    businessAccountId: string
    accessToken: string
  }) {
    const response = await this.api.post('/whatsapp/config', config)
    return response.data
  }

  async getConfiguration() {
    const response = await this.api.get('/whatsapp/config')
    return response.data
  }

  async testConnection() {
    const response = await this.api.post('/whatsapp/config/test')
    return response.data
  }

  // Message APIs
  async sendIndividualMessage(data: SendMessageRequest): Promise<SendMessageResponse> {
    const response = await this.api.post('/whatsapp/send', data)
    return response.data
  }

  async sendBulkMessage(data: SendMessageRequest): Promise<SendMessageResponse> {
    const response = await this.api.post('/whatsapp/send-bulk', data)
    return response.data
  }

  async getMessageStatus(messageId: string): Promise<MessageStatus> {
    const response = await this.api.get(`/whatsapp/messages/${messageId}`)
    return response.data
  }

  async getMessageHistory(filters?: {
    status?: string
    dateFrom?: string
    dateTo?: string
    search?: string
  }) {
    const response = await this.api.get('/whatsapp/messages', { params: filters })
    return response.data
  }

  // Template APIs
  async getTemplates() {
    const response = await this.api.get('/whatsapp/templates')
    return response.data
  }

  async createTemplate(template: {
    displayName: string
    templateName: string
    category: string
    body: string
    parameters: string[]
  }) {
    const response = await this.api.post('/whatsapp/templates', template)
    return response.data
  }

  async updateTemplate(templateId: string, updates: any) {
    const response = await this.api.put(`/whatsapp/templates/${templateId}`, updates)
    return response.data
  }

  async deleteTemplate(templateId: string) {
    const response = await this.api.delete(`/whatsapp/templates/${templateId}`)
    return response.data
  }

  // Analytics APIs
  async getDashboardStats() {
    const response = await this.api.get('/whatsapp/analytics/dashboard')
    return response.data
  }

  async getUsageStats(startDate?: string, endDate?: string) {
    const response = await this.api.get('/whatsapp/usage', {
      params: { startDate, endDate },
    })
    return response.data
  }

  // Student APIs
  async getStudents(filters?: { classId?: string; section?: string; search?: string }) {
    const response = await this.api.get('/students', { params: filters })
    return response.data
  }

  async getClasses() {
    const response = await this.api.get('/classes')
    return response.data
  }
}
export const whatsappApi = new WhatsAppApiService()
export default whatsappApi
