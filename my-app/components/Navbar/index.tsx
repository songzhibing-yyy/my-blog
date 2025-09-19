'use client';

import type { NextPage } from 'next';
import {navs} from './config';
import Link from 'next/link';
import styles from './index.module.scss';
import { usePathname } from 'next/navigation';

const Navbar: NextPage = () => {
  const pathname = usePathname();
  console.log(pathname);
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
    </div>
  );
};

export default Navbar;