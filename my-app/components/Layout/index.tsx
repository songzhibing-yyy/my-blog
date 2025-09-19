import type { NextPage } from 'next';
import type { ReactNode } from 'react';
import Navbar from '../Navbar';
import Footer from '../Footer';

interface LayoutProps {
  children: ReactNode;
}

const Layout: NextPage<LayoutProps> = ({ children }) => {
  return (
    <div> 
      <Navbar/>
        <main>{children}</main>
      <Footer/>
    </div>
  );
};

export default Layout;