export const preflightAuth = async () => {
    // const token = localStorage.getItem('token');
    // if (!token) {
    //     return false;
    // }
    // return true;
};

export const useAuth = () => {
    return { token: '123' };
};

useAuth.getState = () => {
    return {
        token: '123', clearAuthToken: () => { alert('clearing token') }
    }
}
