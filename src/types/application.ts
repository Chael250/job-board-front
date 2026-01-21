export enum ApplicationStatus {
  APPLIED = 'applied',
  REVIEWED = 'reviewed',
  SHORTLISTED = 'shortlisted',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}

export interface Application {
  id: string;
  jobId: string;
  job?: {
    id: string;
    title: string;
    company?: {
      profile: {
        companyName: string;
      };
    };
  };
  jobSeekerId: string;
  jobSeeker?: {
    id: string;
    profile: {
      firstName: string;
      lastName: string;
      phone?: string;
      location?: string;
      resumeUrl?: string;
    };
  };
  status: ApplicationStatus;
  coverLetter?: string;
  resumeUrl?: string;
  appliedAt: string;
  updatedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface CreateApplicationData {
  jobId: string;
  coverLetter?: string;
  resumeUrl?: string;
}

export interface ApplicationFilters {
  status?: ApplicationStatus;
}