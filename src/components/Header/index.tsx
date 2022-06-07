import Link from 'next/link';

import classes from './header.module.scss';

interface HeaderProps {
  className?: string;
}

export default function Header({ className = '' }: HeaderProps): JSX.Element {
  return (
    <header className={`${classes.wrapper} ${className}`}>
      <Link href="/">
        <a>
          <img src="/img/logo.svg" alt="logo" />
        </a>
      </Link>
    </header>
  );
}
