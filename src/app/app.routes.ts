import { Routes } from '@angular/router';
import { authGuard } from './user/auth.guard';
import { LoginComponent } from './user/login/login.component';
import { RegisterComponent } from './user/register/register.component';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'covid-info',
        pathMatch: 'full'
    },
    {
        path: 'login',
        component: LoginComponent
    },
    {
        path: 'register',
        component: RegisterComponent
    },
    {
        path: 'covid-info',
        canActivate: [authGuard],
        loadChildren: () => import('./info/info.routes').then(m => m.routes)
    },
    {
        path: '**',
        redirectTo: '/covid-info',        
    }
];
