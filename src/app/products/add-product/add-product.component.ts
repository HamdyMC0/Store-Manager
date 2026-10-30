import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Category, Product, Subcategory } from '../../models/product.model';
import { CategoryService } from '../../services/category.service';
import { ProductService } from '../../services/product.service';
import { SubcategoryService } from '../../services/subcategory.service';
import { ToastService } from '../../services/toast.service';

// this page is used for adding a product and for editing one
@Component({
  selector: 'app-add-product',
  templateUrl: './add-product.component.html',
  standalone: false
})
export class AddProductComponent implements OnInit, OnDestroy {

  categories: Category[] = [];
  subcategories: Subcategory[] = [];
  availableSubcategories: Subcategory[] = [];   // the subcategories of the chosen category

  // filled when the page is used to edit a product
  editId = '';
  loadingProduct = false;
  notFound = false;

  // these fields are connected to the form with [(ngModel)]
  title = '';
  price: number | null = null;
  stock: number | null = 10;
  description = '';
  categoryId = '';
  subcategoryId = '';

  // the picture
  imageFile: File | null = null;
  imagePreview = '';     // preview of the file the user chose
  currentImage = '';     // the picture the product already has (edit mode)
  imageError = '';

  saving = false;
  errorMessage = '';

  // the card on the right side of the form
  previewProduct: Product;

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private subcategoryService: SubcategoryService,
    private route: ActivatedRoute,
    private router: Router,
    private toastService: ToastService
  ) {
    this.previewProduct = this.buildPreview();
  }

  ngOnInit() {
    this.categoryService.categories$.subscribe(list => {
      this.categories = list;
      this.updateSubcategories();
      this.updatePreview();
    });
    this.categoryService.refresh();

    this.subcategoryService.getSubcategories().subscribe({
      next: (list) => {
        this.subcategories = list;
        this.updateSubcategories();
      },
      error: () => {
        // the subcategory is optional, so the form still works without the list
        this.subcategories = [];
      }
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.editId = id;
      this.loadProduct(id);
    }
  }

  ngOnDestroy() {
    if (this.imagePreview) {
      URL.revokeObjectURL(this.imagePreview);
    }
  }

  loadProduct(id: string) {
    this.loadingProduct = true;

    this.productService.getProduct(id).subscribe({
      next: (product) => {
        if (!product) {
          this.notFound = true;
        } else {
          this.title = product.title;
          this.price = product.price;
          this.stock = product.stock;
          this.description = product.description;
          this.categoryId = product.categoryId;
          this.subcategoryId = product.subcategoryId;
          this.currentImage = product.image;
          this.updateSubcategories();
          this.updatePreview();
        }
        this.loadingProduct = false;
      },
      error: (err) => {
        this.errorMessage = err.message;
        this.loadingProduct = false;
      }
    });
  }

  get priceIsValid(): boolean {
    return this.price !== null && this.price > 0;
  }

  get stockIsValid(): boolean {
    return this.stock !== null && this.stock >= 0 && Number.isInteger(this.stock);
  }

  get selectedCategoryName(): string {
    const found = this.categories.find(c => c.id === this.categoryId);
    return found ? found.name : '';
  }

  // the backend only tells the name of the category of a subcategory, so the names are compared
  updateSubcategories() {
    const name = this.selectedCategoryName;
    this.availableSubcategories = this.subcategories.filter(s => s.categoryName === name);
  }

  // when the category changes, the old subcategory is not valid any more
  onCategoryChange() {
    this.subcategoryId = '';
    this.updateSubcategories();
    this.updatePreview();
  }

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.imageError = '';

    if (!input.files || input.files.length === 0) {
      return;
    }

    const file = input.files[0];

    if (!file.type.startsWith('image/')) {
      this.imageError = 'Please choose an image file (png, jpg, webp...).';
      input.value = '';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.imageError = 'The image is too big. The maximum size is 5 MB.';
      input.value = '';
      return;
    }

    if (this.imagePreview) {
      URL.revokeObjectURL(this.imagePreview);
    }
    this.imageFile = file;
    this.imagePreview = URL.createObjectURL(file);
    this.updatePreview();
  }

  // a new object is created each time so the card can reload the image
  updatePreview() {
    this.previewProduct = this.buildPreview();
  }

  buildPreview(): Product {
    return {
      id: 'preview',
      title: this.title,
      price: this.price ? Number(this.price) : 0,
      description: this.description || 'The description of the product will show here.',
      stock: this.stock ? Number(this.stock) : 0,
      image: this.imagePreview || this.currentImage,
      categoryId: this.categoryId,
      category: this.selectedCategoryName || 'category',
      categorySlug: '',
      subcategoryId: this.subcategoryId,
      subcategory: this.availableSubcategories.find(s => s.id === this.subcategoryId)?.name || '',
      createdAt: new Date()
    };
  }

  onSubmit() {
    if (!this.priceIsValid || !this.stockIsValid) {
      return;
    }

    // a new product needs a picture, an old one can keep its picture
    if (!this.editId && !this.imageFile) {
      this.imageError = 'Please choose a picture for the product.';
      return;
    }

    this.saving = true;
    this.errorMessage = '';

    const data = {
      title: this.title.trim(),
      price: Number(this.price),
      stock: Number(this.stock),
      description: this.description.trim(),
      categoryId: this.categoryId,
      subcategoryId: this.subcategoryId,
      image: this.imageFile
    };

    const request = this.editId
      ? this.productService.updateProduct(this.editId, data)
      : this.productService.addProduct(data);

    request.subscribe({
      next: () => {
        this.toastService.show(this.editId ? 'The product was updated.' : 'The product was added to your store.', 'success');
        this.router.navigate(['/products']);
      },
      error: (err) => {
        this.errorMessage = err.message;
        this.saving = false;
      }
    });
  }
}
