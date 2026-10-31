export interface Allergen {
  id: string;
  name: string;
  icon?: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  image: string;
  isAvailable: boolean;
  preparationTime?: number;
  allergens?: string[];
  badges?: ('chef_choice' | 'bestseller' | 'vegetarian' | 'spicy')[];
}

export interface MenuCategory {
  id: string;
  name: string;
  nameIt?: string;
  icon: string;
  description?: string;
  order: number;
}
