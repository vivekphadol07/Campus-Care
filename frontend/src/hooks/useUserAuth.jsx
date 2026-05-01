import { useUser } from '../context/userContext';

const useUserAuth = () => {
    const { user, isAuthenticated, login, logout } = useUser();
    return { user, isAuthenticated, login, logout, role: user?.role };
};

export default useUserAuth;
