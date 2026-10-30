import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';

import { Category, Subcategory } from '../../models/product.model';
import { CategoryService } from '../../services/category.service';
import { SubcategoryService } from '../../services/subcategory.service';
import { ToastService } from '../../services/toast.service';

// the thing the admin wants to delete
interface DeleteTarget {
  type: 'category' | 'subcategory';
  id: string;
  name: string;
}

@Component({
  selector: 'app-categories-admin',
  templateUrl: './categories-admin.component.html',
  standalone: false
})
export class CategoriesAdminComponent implements OnInit, OnDestroy {
  categories: Category[] = [];
  subcategories: Subcategory[] = [];

  loading = true;
  errorMessage = '';

  // category form
  catEditId = '';
  catName = '';
  catImage: File | null = null;
  catPreview = '';          // preview of the new picture
  catCurrentImage = '';     // the picture of the category that is being edited
  catImageError = '';
  catError = '';
  catSaving = false;

  // subcategory form
  subEditId = '';
  subName = '';
  subCategoryId = '';
  subError = '';
  subSaving = false;

  deleteTarget: DeleteTarget | null = null;
  deleting = false;

  constructor(
    private categoryService: CategoryService,
    private subcategoryService: SubcategoryService,
    private toastService: ToastService
  ) { }

  ngOnInit() {
    // the list updates by itself when a category is added, edited or deleted
    this.categoryService.categories$.subscribe(list => {
      this.categories = list;
    });

    this.loadAll();
  }

  ngOnDestroy() {
    if (this.catPreview) {
      URL.revokeObjectURL(this.catPreview);
    }
  }

  loadAll() {
    this.loading = true;
    this.errorMessage = '';

    this.categoryService.getCategories().subscribe({
      next: () => {
        this.loadSubcategories();
      },
      error: (err) => {
        this.errorMessage = err.message;
        this.loading = false;
      }
    });
  }

  loadSubcategories() {
    this.subcategoryService.getSubcategories().subscribe({
      next: (list) => {
        this.subcategories = list;
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = err.message;
        this.loading = false;
      }
    });
  }

  countSubcategories(categoryName: string): number {
    return this.subcategories.filter(s => s.categoryName === categoryName).length;
  }

  // ---------- categories ----------

  onCategoryFile(event: Event) {
    const input = event.target as HTMLInputElement;
    this.catImageError = '';

    if (!input.files || input.files.length === 0) {
      return;
    }

    const file = input.files[0];

    if (!file.type.startsWith('image/')) {
      this.catImageError = 'Please choose an image file (png, jpg, webp...).';
      input.value = '';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.catImageError = 'The image is too big. The maximum size is 5 MB.';
      input.value = '';
      return;
    }

    if (this.catPreview) {
      URL.revokeObjectURL(this.catPreview);
    }
    this.catImage = file;
    this.catPreview = URL.createObjectURL(file);
  }

  startEditCategory(category: Category) {
    this.catEditId = category.id;
    this.catName = category.name;
    this.catCurrentImage = category.image;
    this.catImage = null;
    this.catPreview = '';
    this.catError = '';
    this.catImageError = '';
  }

  resetCategoryForm(form: NgForm, fileInput: HTMLInputElement) {
    form.resetForm();
    fileInput.value = '';
    if (this.catPreview) {
      URL.revokeObjectURL(this.catPreview);
    }
    this.catEditId = '';
    this.catName = '';
    this.catImage = null;
    this.catPreview = '';
    this.catCurrentImage = '';
    this.catError = '';
    this.catImageError = '';
  }

  saveCategory(form: NgForm, fileInput: HTMLInputElement) {
    if (form.invalid) {
      return;
    }

    // a new category needs a picture, an old one can keep its picture
    if (!this.catEditId && !this.catImage) {
      this.catImageError = 'Please choose a picture for the category.';
      return;
    }

    this.catSaving = true;
    this.catError = '';

    const name = this.catName.trim();
    const isEdit = this.catEditId !== '';

    const request = isEdit
      ? this.categoryService.updateCategory(this.catEditId, name, this.catImage)
      : this.categoryService.addCategory(name, this.catImage as File);

    request.subscribe({
      next: () => {
        this.toastService.show(isEdit ? 'The category was updated.' : 'The category was added.', 'success');
        this.catSaving = false;
        this.resetCategoryForm(form, fileInput);
        // the name of a category can change, so the subcategories are loaded again
        this.loadSubcategories();
      },
      error: (err) => {
        this.catError = err.message;
        this.catSaving = false;
      }
    });
  }

  // ---------- subcategories ----------

  startEditSubcategory(sub: Subcategory) {
    this.subEditId = sub.id;
    this.subName = sub.name;
    // the backend gives the name of the category, so the id is found from the name
    const parent = this.categories.find(c => c.name === sub.categoryName);
    this.subCategoryId = parent ? parent.id : '';
    this.subError = '';
  }

  resetSubcategoryForm(form: NgForm) {
    form.resetForm({ subCategoryId: '' });
    this.subEditId = '';
    this.subName = '';
    this.subCategoryId = '';
    this.subError = '';
  }

  saveSubcategory(form: NgForm) {
    if (form.invalid) {
      return;
    }

    this.subSaving = true;
    this.subError = '';

    const name = this.subName.trim();
    const isEdit = this.subEditId !== '';

    const request = isEdit
      ? this.subcategoryService.updateSubcategory(this.subEditId, name, this.subCategoryId)
      : this.subcategoryService.addSubcategory(name, this.subCategoryId);

    request.subscribe({
      next: () => {
        this.toastService.show(isEdit ? 'The subcategory was updated.' : 'The subcategory was added.', 'success');
        this.subSaving = false;
        this.resetSubcategoryForm(form);
        this.loadSubcategories();
      },
      error: (err) => {
        this.subError = err.message;
        this.subSaving = false;
      }
    });
  }

  // ---------- delete ----------

  askToDelete(type: 'category' | 'subcategory', id: string, name: string) {
    this.deleteTarget = { type: type, id: id, name: name };
  }

  cancelDelete() {
    if (!this.deleting) {
      this.deleteTarget = null;
    }
  }

  confirmDelete() {
    if (!this.deleteTarget) {
      return;
    }

    const target = this.deleteTarget;
    this.deleting = true;

    const request = target.type === 'category'
      ? this.categoryService.deleteCategory(target.id)
      : this.subcategoryService.deleteSubcategory(target.id);

    request.subscribe({
      next: () => {
        this.toastService.show('Deleted "' + target.name + '".', 'success');
        this.deleting = false;
        this.deleteTarget = null;

        // a deleted category also deletes its subcategories
        this.loadSubcategories();
      },
      error: (err) => {
        this.toastService.show(err.message, 'danger');
        this.deleting = false;
        this.deleteTarget = null;
      }
    });
  }
}
