import { PropsWithChildren, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import App from '../../App';

const BlankLayout = ({ children }: PropsWithChildren) => {
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');

        if (token && user) {
            navigate('/dashboard');
        }
    }, [navigate]);

    return (
        <App>
            <div className="min-h-screen bg-muted text-foreground">{children}</div>
        </App>
    );
};

export default BlankLayout;
