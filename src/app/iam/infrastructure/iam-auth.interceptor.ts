import {inject} from '@angular/core';
import {HttpInterceptorFn} from '@angular/common/http';
import {SessionStore} from '../../shared/application/session.store';
import {environment} from '../../../environments/environment';
export const iamAuthInterceptor:HttpInterceptorFn=(req,next)=>{
  const token=inject(SessionStore).session()?.token;
  return next(token&&req.url.startsWith(environment.webServiceApiBaseUrl)&&!req.url.endsWith('/auth/login')
    ?req.clone({setHeaders:{Authorization:`Bearer ${token}`}}):req);
};
