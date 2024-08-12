import { Routes } from '@angular/router';
import { authGuard } from './user/auth.guard';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'covid-info',
        pathMatch: 'full'
    },    
    {
        path: 'register',        
        loadComponent: () => import('./user/register/register.component').then(m => m.RegisterComponent),
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
