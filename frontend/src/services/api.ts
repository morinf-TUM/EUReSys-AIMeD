// API Service for EU AI Medical Device Regulatory System
// Handles all communication with Django backend

import { ApiResponse, RegulatoryProfile, DocumentSet, UserSession, ChangeImpactAssessment, RegulatoryAnswer, RegulatoryQuestion, DeviceClassification, DocumentSection } from '../types/regulatory';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '/api';

class ApiService {
  private static instance: ApiService;
  private token: string | null = null;
  private userSession: UserSession | null = null;

  private constructor() {
    // Private constructor for singleton pattern
    const savedToken = localStorage.getItem('regulatoryToken');
    const savedSession = localStorage.getItem('regulatorySession');
    
    if (savedToken) {
      this.token = savedToken;
    }
    
    if (savedSession) {
      try {
        this.userSession = JSON.parse(savedSession);
      } catch (e) {
        console.error('Failed to parse saved session:', e);
      }
    }
  }

  public static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  // Authentication methods
  async login(email: string, password: string): Promise<ApiResponse<UserSession>> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.error || 'Login failed',
        };
      }

      const data = await response.json();
      this.token = data.data.token;
      this.userSession = data.data;
      
      // Save to localStorage
      localStorage.setItem('regulatoryToken', data.data.token);
      localStorage.setItem('regulatorySession', JSON.stringify(data.data));

      return {
        success: true,
        data: data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  async logout(): Promise<ApiResponse<null>> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/auth/logout/`, {
        method: 'POST',
        headers: headers,
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.error || 'Logout failed',
        };
      }

      // Clear session and temporary evaluation data
      this.token = null;
      this.userSession = null;
      localStorage.removeItem('regulatoryToken');
      localStorage.removeItem('regulatorySession');
      sessionStorage.removeItem('latestEvaluation');

      return {
        success: true,
        data: null,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  async register(username: string, email: string, password: string, company: string): Promise<ApiResponse<UserSession>> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password, company }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.error || 'Registration failed',
        };
      }

      const data = await response.json();
      return {
        success: true,
        data: data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // Regulatory Profile methods
  async createRegulatoryProfile(profileData: Omit<RegulatoryProfile, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<ApiResponse<RegulatoryProfile>> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/regulatory/profiles/`, {
        method: 'POST',
        headers: headers,
        credentials: 'include',
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.error || 'Failed to create regulatory profile',
        };
      }

      const data = await response.json();
      return {
        success: true,
        data: data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  async getRegulatoryProfile(id: string): Promise<ApiResponse<RegulatoryProfile>> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/regulatory/profiles/${id}/`, {
        headers: headers,
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.error || 'Failed to fetch regulatory profile',
        };
      }

      const data = await response.json();
      return {
        success: true,
        data: data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  async updateRegulatoryProfile(id: string, profileData: Partial<RegulatoryProfile>): Promise<ApiResponse<RegulatoryProfile>> {
    try {
      const response = await fetch(`${API_BASE_URL}/regulatory/profiles/${id}/`, {
        method: 'PATCH',
        headers: await this.getAuthHeaders(),
        credentials: "include",
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.error || 'Failed to update regulatory profile',
        };
      }

      const data = await response.json();
      return {
        success: true,
        data: data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  async getRegulatoryQuestions(step: number): Promise<ApiResponse<RegulatoryQuestion[]>> {
    try {
      console.log(`Fetching regulatory questions for step ${step}`);
      console.log(`API URL: ${API_BASE_URL}/regulatory/questions/?step=${step}`);
      
      const response = await fetch(`${API_BASE_URL}/regulatory/questions/?step=${step}`, {
        headers: await this.getAuthHeaders(),
        credentials: "include",
      });

      console.log(`Response status: ${response.status}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('API error:', errorData);
        return {
          success: false,
          error: errorData.error || 'Failed to fetch regulatory questions',
        };
      }

      const data = await response.json();
      console.log('API response data:', data);
      return {
        success: true,
        data: data,
      };
    } catch (error) {
      console.error('Network error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  async submitRegulatoryAnswers(profileId: string, answers: RegulatoryAnswer[]): Promise<ApiResponse<DeviceClassification>> {
    try {
      const response = await fetch(`${API_BASE_URL}/regulatory/profiles/${profileId}/answers/`, {
        method: 'POST',
        headers: await this.getAuthHeaders(),
        credentials: "include",
        body: JSON.stringify({ answers }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.error || 'Failed to submit regulatory answers',
          warnings: errorData.warnings,
        };
      }

      const data = await response.json();
      return {
        success: true,
        data: data.data,
        warnings: data.warnings,
        citations: data.citations,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // Recommendation Engine methods
  async getRecommendation(deviceInfo: any, intendedPurpose: string): Promise<ApiResponse<any>> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/regulatory/recommendation/`, {
        method: 'POST',
        headers: headers,
        credentials: 'include',
        body: JSON.stringify({ 
          deviceInfo: deviceInfo,
          intendedPurpose: intendedPurpose
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.error || 'Failed to get regulatory recommendation',
        };
      }

      const data = await response.json();
      return {
        success: true,
        data: data.data || data,  // Handle both nested and direct data structures
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // Input Quality Assessment methods
  async getInputQualityAssessment(baseData: any): Promise<ApiResponse<any>> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/regulatory/input-quality-assessment/`, {
        method: 'POST',
        headers: headers,
        credentials: 'include',
        body: JSON.stringify({ 
          baseData: baseData
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.error || 'Failed to get input quality assessment',
        };
      }

      const data = await response.json();
      return {
        success: true,
        data: data.data || data,  // Handle both nested and direct data structures
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }



  // Provisional Assessment methods
  async getProvisionalAssessment(baseData: any): Promise<ApiResponse<any>> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/regulatory/provisional-assessment/`, {
        method: 'POST',
        headers: headers,
        credentials: 'include',
        body: JSON.stringify({ 
          baseData: baseData
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.error || 'Failed to get provisional assessment',
        };
      }

      const data = await response.json();
      return {
        success: true,
        data: data.data || data,  // Handle both nested and direct data structures
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // Document Management methods
  async getDocumentSet(profileId: string, documentType: string): Promise<ApiResponse<DocumentSet>> {
    try {
      const response = await fetch(`${API_BASE_URL}/documents/profiles/${profileId}/?type=${documentType}`, {
        headers: await this.getAuthHeaders(),
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.error || 'Failed to fetch document set',
        };
      }

      const data = await response.json();
      return {
        success: true,
        data: data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  async updateDocumentSection(profileId: string, sectionId: string, content: string): Promise<ApiResponse<DocumentSection>> {
    try {
      const response = await fetch(`${API_BASE_URL}/documents/profiles/${profileId}/sections/${sectionId}/`, {
        method: 'PATCH',
        headers: await this.getAuthHeaders(),
        credentials: "include",
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.error || 'Failed to update document section',
        };
      }

      const data = await response.json();
      return {
        success: true,
        data: data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  async requestLLMDraft(profileId: string, sectionId: string, requirements: string): Promise<ApiResponse<string>> {
    try {
      const response = await fetch(`${API_BASE_URL}/llm/draft/`, {
        method: 'POST',
        headers: await this.getAuthHeaders(),
        credentials: "include",
        body: JSON.stringify({ 
          profile_id: profileId, 
          section_id: sectionId, 
          requirements: requirements
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.error || 'Failed to generate LLM draft',
        };
      }

      const data = await response.json();
      return {
        success: true,
        data: data.draft_text,
        warnings: data.warnings,
        citations: data.citations,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // Change Management methods
  async createChangeImpactAssessment(assessmentData: Omit<ChangeImpactAssessment, 'id' | 'approvalStatus' | 'approvedBy' | 'approvedAt'>): Promise<ApiResponse<ChangeImpactAssessment>> {
    try {
      const response = await fetch(`${API_BASE_URL}/change-management/assessments/`, {
        method: 'POST',
        headers: await this.getAuthHeaders(),
        credentials: "include",
        body: JSON.stringify(assessmentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.error || 'Failed to create change impact assessment',
        };
      }

      const data = await response.json();
      return {
        success: true,
        data: data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // Utility methods
  private async getAuthHeaders(): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Always use the current token from localStorage to avoid singleton issues
    const currentToken = localStorage.getItem('regulatoryToken');
    if (currentToken) {
      headers['Authorization'] = `Bearer ${currentToken}`;
    }

    // Get CSRF token from cookies
    let csrfToken = this.getCookie('csrftoken');
    
    // If no CSRF token in cookies, try to get one from the backend
    if (!csrfToken) {
      try {
        const csrfResponse = await fetch(`${API_BASE_URL}/auth/csrf/`, {
          method: 'GET',
          credentials: 'include',
        });
        
        if (csrfResponse.ok) {
          const csrfData = await csrfResponse.json();
          csrfToken = csrfData.csrfToken;
          // Store in cookie for future requests
          document.cookie = `csrftoken=${csrfToken}; path=/`;
        }
      } catch (error) {
        console.error('Failed to get CSRF token:', error);
      }
    }

    if (csrfToken) {
      headers['X-CSRFToken'] = csrfToken;
    }

    return headers;
  }

  private getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
  }

  getCurrentUser(): UserSession | null {
    return this.userSession;
  }

  isAuthenticated(): boolean {
    if (!this.token || !this.userSession) {
      return false;
    }

    // Check if token is expired
    try {
      const expiresAt = new Date(this.userSession.expiresAt);
      return expiresAt > new Date();
    } catch {
      return false;
    }
  }

  hasPermission(permission: string): boolean {
    return !!this.userSession?.permissions?.includes(permission);
  }

  // Regulatory source lookup
  async getRegulatorySource(reference: string): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_BASE_URL}/regulatory/sources/?reference=${encodeURIComponent(reference)}`, {
        headers: await this.getAuthHeaders(),
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.error || 'Failed to fetch regulatory source',
        };
      }

      const data = await response.json();
      return {
        success: true,
        data: data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }
}

export default ApiService.getInstance();