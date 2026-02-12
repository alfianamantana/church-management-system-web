import { PropsWithChildren, } from 'react';
import App from '../../App';

const BlankLayout = ({ children }: PropsWithChildren) => {
  return (
    <App>
      <div className="min-h-screen bg-muted text-foreground">{children}</div>
    </App>
  );
};

export default BlankLayout;
