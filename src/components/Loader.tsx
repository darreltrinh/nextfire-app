import React from 'react';
import styles from '@/styles/Loader.module.css';

interface LoaderProps {
  show: boolean;
  className?: string;
}

const Loader: React.FC<LoaderProps> = ({ show, className }) => {
  return show ? <div className={`${styles.loader} ${className ?? ''}`}></div> : null;
};

export default Loader;
