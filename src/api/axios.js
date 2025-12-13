// api/axios.js
import axios from "axios";
import router from "@/router";

const BASE_URL = "/api";  // 프록시를 통해 요청

// 단일 Axios 인스턴스
export const api = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
    withCredentials: true, // 🔥 Cookie 자동 송수신 - Gateway가 accessToken 쿠키를 읽고 헤더 추가
    headers: {
        "Content-Type": "application/json",
    },
});

// 요청 인터셉터: 토큰과 memberId를 헤더에 추가
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        const memberId = localStorage.getItem('member_id');

        // 쿠키 확인 (디버깅용)
        console.log('요청 URL:', config.url);
        console.log('현재 쿠키:', document.cookie);
        console.log('localStorage token:', token);
        console.log('localStorage memberId:', memberId);

        // 토큰이 있고 'authenticated'가 아닌 실제 토큰인 경우에만 헤더에 추가
        if (token && token !== 'authenticated') {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // memberId가 있으면 헤더에 추가 (백엔드가 @RequestHeader(value = HeaderName.ID)로 받는 경우)
        if (memberId) {
            config.headers['X-Member-Id'] = memberId;
        }

        // 쿠키가 없으면 경고
        if (!document.cookie || !document.cookie.includes('accessToken')) {
            console.warn('⚠️ 쿠키에 accessToken이 없습니다! 로그인을 다시 해주세요.');
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 응답 인터셉터: 401 에러 시 로그인 페이지로 리다이렉트만
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // 401 = 인증 실패 (백엔드에서 토큰 갱신도 실패한 경우)
        if (error.response?.status === 401) {
            const currentPath = router.currentRoute.value.fullPath;

            // 이미 로그인 페이지가 아닌 경우에만 리다이렉트
            if (currentPath !== "/login" && currentPath !== "/register") {
                // 인증 정보 초기화
                localStorage.removeItem('access_token');
                localStorage.removeItem('user_role');
                localStorage.removeItem('user_email');
                localStorage.removeItem('member_id');

                router.push({
                    path: "/login",
                    query: { redirect: currentPath },
                });
            }
        }
        return Promise.reject(error);
    }
);

// 상품 관련 API
export const productApi = {
    createProduct: (data) => api.post("/products", data),
    getProductById: (productId) => api.get(`/products/${productId}`),
    getProducts: () => api.get("/products"), // 상품 목록 조회 (백엔드 API 필요)
    updateProduct: (productId, data) => api.patch(`/products/${productId}`, data),
    deleteProduct: (productId) => api.delete(`/products/${productId}`),
};

// 공동구매 관련 API
export const groupPurchaseApi = {
    createGroupPurchase: (data) => api.post("/purchases", data),
    getGroupPurchaseById: (purchaseId) => api.get(`/purchases/${purchaseId}`),
    getGroupPurchasesBySeller: (sellerId, page = 0, size = 10) =>
        api.get(`/purchases/seller/${sellerId}`, { params: { page, size } }),
    updateGroupPurchase: (purchaseId, data) => api.patch(`/purchases/${purchaseId}`, data),
    deleteGroupPurchase: (purchaseId) => api.delete(`/purchases/${purchaseId}`),
};

export default api;