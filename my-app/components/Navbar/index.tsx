'use client';
import { useState } from 'react';
import type { NextPage } from 'next';
import {navs} from './config';
import Link from 'next/link';
import styles from './index.module.scss';
import { usePathname } from 'next/navigation';
import { Button } from 'antd';
import Login from '../Login';
const Navbar: NextPage = () => {
  const pathname = usePathname();
  console.log(pathname);
  const [isShowLogin, setIsShowLogin] = useState(false);
  const handleGotoEditorPage = () => {
    window.open('/editor');
  }
  const handleLogin = () => {
    setIsShowLogin(true);
  }
  const handleClose = () => {
    setIsShowLogin(false);
  }
  return (
    <div className={styles.navbar}> 
        <section className={styles.logArea}>BLOG-C</section>
        <section className={styles.linkArea}>
          {navs.map((nav) => (
            <Link key={nav?.label} href={nav?.value} 
            className={pathname === nav?.value ? styles.active : ''}>
              {nav.label}
            </Link>
          ))}
        </section>
        <section className={styles.operateArea}>
          <Button onClick={handleGotoEditorPage}>写文章</Button>
          <Button type="primary" onClick={handleLogin}>登录</Button>
        </section>
        <Login isShow={isShowLogin} onClose={handleClose}/>
    </div>
  );
};

export default Navbar;