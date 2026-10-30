import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { authGuard, adminGuard, guestGuard } from './guards/auth.guard';

import { HomeComponent } from './core/home/home.component';
import { ContactComponent } from './core/contact/contact.component';
import { NotFoundComponent } from './core/not-found/not-found.component';
import { ProductListComponent } from './products/product-list/product-list.component';
import { ProductDetailsComponent } from './products/product-details/product-details.component';
import { AddProductComponent } from './products/add-product/add-product.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { ActivateComponent } from './auth/activate/activate.component';
import { ProfileComponent } from './auth/profile/profile.component';
import { CategoriesAdminComponent } from './admin/categories-admin/categories-admin.component';

const routes: Routes = [
  { path: '', component: HomeComponent, pathMatch: 'full', title: 'Store Manager' },

  // everybody can see the products
  { path: 'products', component: ProductListComponent, title: 'Products | Store Manager' },
  { path: 'products/:id', component: ProductDetailsComponent, title: 'Product Details | Store Manager' },

  // only the admin can add and edit products
  { path: 'add-product', component: AddProductComponent, canActivate: [adminGuard], title: 'Add Product | Store Manager' },
  { path: 'edit-product/:id', component: AddProductComponent, canActivate: [adminGuard], title: 'Edit Product | Store Manager' },
  { path: 'admin/categories', component: CategoriesAdminComponent, canActivate: [adminGuard], title: 'Categories | Store Manager' },

  // login and sign up
  { path: 'login', component: LoginComponent, canActivate: [guestGuard], title: 'Log in | Store Manager' },
  { path: 'register', component: RegisterComponent, canActivate: [guestGuard], title: 'Sign up | Store Manager' },
  { path: 'activate/:token', component: ActivateComponent, title: 'Activate Account | Store Manager' },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard], title: 'My Profile | Store Manager' },

  { path: 'contact', component: ContactComponent, title: 'Contact | Store Manager' },
  { path: '**', component: NotFoundComponent, title: 'Page Not Found | Store Manager' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    scrollPositionRestoration: 'enabled',
    anchorScrolling: 'enabled',
    scrollOffset: [0, 80]
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
