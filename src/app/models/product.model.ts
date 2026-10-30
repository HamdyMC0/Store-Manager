export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  stock: number;
  image: string;
  categoryId: string;
  category: string;
  categorySlug: string;
  subcategoryId: string;
  subcategory: string;
  createdAt: Date;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
}

export interface Subcategory {
  id: string;
  name: string;
  categoryName: string;
}

// the values of the add / edit product form
export interface ProductFormData {
  title: string;
  price: number;
  stock: number;
  description: string;
  categoryId: string;
  subcategoryId: string;
  image: File | null;
}
