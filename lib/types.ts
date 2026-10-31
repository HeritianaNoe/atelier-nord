export type ProductDTO = {
  id: string;
  title: string;
  description: string;
  price: number;
  imageUrl: string;
  isFeatured: boolean;
  stock: number;
  categoryId: string;
  categoryName: string;
};

export type CategoryDTO = { id: string; name: string };
