export interface BranchInfo {
  name: string;
  slug: string;
  reviewLink: string;
  location: string;
}

export interface ReviewFormData {
  experience: string;
  service: string;
  customerName?: string;
}

export const BRANCHES: Record<string, BranchInfo> = {
  'gading-serpong': {
    name: 'Optik LOOV Gading Serpong',
    slug: 'gading-serpong',
    reviewLink: 'https://g.page/r/Ce4mikVtALdCEBM/review',
    location: 'Gading Serpong'
  },
  'kelapa-dua': {
    name: 'Optik LOOV Kelapa Dua',
    slug: 'kelapa-dua', 
    reviewLink: 'https://g.page/r/CWjrf0Yk00vBEBM/review',
    location: 'Kelapa Dua'
  },
  'green-lake-city': {
    name: 'Optik LOOV Green Lake City',
    slug: 'green-lake-city',
    reviewLink: 'https://g.page/r/CcpXHksDeSbDEBM/review',
    location: 'Green Lake City'
  }
};