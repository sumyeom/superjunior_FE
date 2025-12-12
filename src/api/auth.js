import api from './axios.js'
export const authAPI = {
    // 이메일 인증 코드
    sendVerificationEmail: async(email) => {
        const response = await api.get(`/members/email/${email}`)
        return response.data;
    },
    // 이메일 인증 (토큰 기반)
    verifyEmail: async(token) => {
        const response = await api.get(`/members/email/verification/${token}`)
        return response.data;
    },
    // 이름 중복 체크
    checkNameDuplication: async(name) => {
        const response = await api.get(`/members/name/${name}`)
        return response.data;
    },
    // 회원 가입
    signUp: async(signUpDate) => {
        const response = await api.post(`/members`,{
            email: signUpDate.email,
            password: signUpDate.password,
            name: signUpDate.name,
            phoneNumber: signUpDate.phoneNumber,
        })
        return response.data;
    },
    // 로그인 (별도 인증 컨트롤러에 있을 것으로 추정)
    login: async(email, password) => {
        const response = await api.post(`/auth/login`,{
            email,
            password
        })
        return response.data;
    },
    // 로그아웃
    logout: async() => {
        const response = await api.post(`/auth/logout`)
        return response.data;
    }
}