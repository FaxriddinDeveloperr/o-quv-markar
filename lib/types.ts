// API javoblari uchun umumiy (front+back) tiplar

export interface RegionDTO {
  id: string;
  name: string;
  nameRu: string;
  order: number;
  districtsCount: number;
  centersCount: number;
}

export interface DistrictDTO {
  id: string;
  name: string;
  nameRu: string;
  order: number;
  regionId: string;
  centersCount: number;
}

export interface CourseDTO {
  id: string;
  name: string;
  nameRu: string;
  price: number;
  durationMonths: number;
  description: string | null;
}

export interface CenterResultDTO {
  id: string;
  title: string;
  imageUrl: string;
}

export interface CenterListItemDTO {
  id: string;
  name: string;
  logoUrl: string | null;
  rating: number;
  address: string;
  districtId: string;
  districtName: string;
  latitude: number;
  longitude: number;
  minPrice: number | null;
  coursesCount: number;
  isFavorite: boolean;
  distanceKm?: number | null;
}

export interface CenterDetailDTO extends CenterListItemDTO {
  description: string | null;
  descriptionRu: string | null;
  phone: string;
  telegramUrl: string | null;
  photos: string[];
  viewsCount: number;
  courses: CourseDTO[];
  results: CenterResultDTO[];
}

export interface SubjectDTO {
  name: string;
  nameRu: string;
}

export type SortOption = "priceAsc" | "priceDesc" | "rating" | "distance";
