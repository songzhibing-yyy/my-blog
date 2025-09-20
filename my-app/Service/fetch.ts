import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { ApiResponse } from '@/types/api';

// 创建自定义的axios实例类型
interface CustomAxiosInstance extends Omit<AxiosInstance, 'get' | 'post' | 'put' | 'delete'> {
    get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>>;
    post<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>>;
    put<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>>;
    delete<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>>;
}

const request = axios.create({
    baseURL: "/",
    timeout: 10000,
}) as CustomAxiosInstance;

request.interceptors.request.use(
    (config) => {
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

request.interceptors.response.use(
    (response: AxiosResponse) => {
        if (response?.status === 200) {
            return response.data;
        } else {
            return { code: -1, message: '未知错误', data: null };
        }
    },
    (error) => {
        console.error('请求错误:', error);
        return Promise.reject(error);
    }
);

export default request;
