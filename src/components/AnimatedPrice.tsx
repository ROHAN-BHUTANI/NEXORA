import { motion } from 'motion/react';
import { spring } from '../utils/motion';
import { formatINR } from '../utils/pricing';

interface Props {
  value: number;
  className?: string;
  'data-testid'?: string;
}

/**
 * Prices "roll in" whenever the value changes. The DOM always contains exactly the final text
 * (the previous value unmounts immediately), so assertions and screen readers never see a
 * half-animated number.
 */
export function AnimatedPrice({ value, className = '', ...rest }: Props) {
  return (
    <span className={`tnum inline-block overflow-hidden align-bottom ${className}`} {...rest}>
      <motion.span
        key={value}
        className="inline-block"
        initial={{ y: '55%', opacity: 0, filter: 'blur(5px)' }}
        animate={{ y: '0%', opacity: 1, filter: 'blur(0px)' }}
        transition={spring}
      >
        {formatINR(value)}
      </motion.span>
    </span>
  );
}
