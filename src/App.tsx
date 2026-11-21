import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Ticker } from './components/Ticker';
import { ProductShowcase } from './components/ProductShowcase';
import { Cart } from './components/Cart';
import { CheckoutForm } from './components/CheckoutForm';
import { OrderConfirmation } from './components/OrderConfirmation';
import { useCart } from './hooks/useCart';
import { useCheckout } from './hooks/useCheckout';
import { easeOutExpo, scrollToId } from './utils/motion';

export default function App() {
  const reduce = useReducedMotion() ?? false;
  const cart = useCart();
  // Cart is cleared only AFTER an order is confirmed; validation failures never touch it.
  const checkout = useCheckout({ lines: cart.lines, onOrderPlaced: cart.clear });

  const goCheckout = () => scrollToId('checkout', reduce);
  const startNewOrder = () => {
    checkout.reset();
    scrollToId('products', reduce);
  };

  return (
    <div className="min-h-svh overflow-x-clip">
      <a href="#checkout" onClick={(e) => { e.preventDefault(); goCheckout(); }} className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-black">
        Skip to checkout
      </a>
      <Navbar count={cart.count} total={cart.total} onCartClick={goCheckout} />

      <main>
        <Hero />
        <Ticker />
        <ProductShowcase lines={cart.lines} onAdd={cart.add} />

        <section id="checkout" aria-labelledby="checkout-heading" className="relative isolate px-4 pb-28 pt-12 sm:px-8 lg:px-12">
          <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
            <div className="animate-drift absolute left-[5%] top-[10%] h-[30rem] w-[30rem] rounded-full bg-[color:var(--color-violet)]/20 blur-[130px]" style={{ ['--dur' as string]: '26s' }} />
            <div className="animate-drift absolute bottom-0 right-[6%] h-[26rem] w-[26rem] rounded-full bg-[color:var(--color-cyan)]/14 blur-[130px]" style={{ ['--dur' as string]: '32s' }} />
          </div>

          <div className="mx-auto max-w-[1200px]">
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.9, ease: easeOutExpo }}
              className="mx-auto mb-12 max-w-2xl text-center"
            >
              <p className="eyebrow mb-4 text-[color:var(--color-cyan)]">Cart &amp; checkout</p>
              <h2 id="checkout-heading" tabIndex={-1} style={{ outline: 'none' }} className="display text-[clamp(2.2rem,5vw,3.8rem)]">
                Ready when <span className="text-gradient">you are.</span>
              </h2>
              <p className="body-copy mt-5 text-[color:var(--color-muted)]">Review your cart, tell us who it's for, and place your order.</p>
            </motion.div>

            <AnimatePresence mode="wait" initial={false}>
              {checkout.order ? (
                <OrderConfirmation key="confirmation" order={checkout.order} onNewOrder={startNewOrder} />
              ) : (
                <motion.div
                  key="checkout"
                  exit={reduce ? { opacity: 0 } : { opacity: 0, y: -16, scale: 0.98 }}
                  transition={{ duration: 0.3, ease: easeOutExpo }}
                  className="grid items-start gap-6 lg:grid-cols-[1.05fr_1fr] lg:gap-8"
                >
                  <Cart
                    lines={cart.lines}
                    total={cart.total}
                    count={cart.count}
                    locked={checkout.isProcessing}
                    onIncrement={cart.increment}
                    onDecrement={cart.decrement}
                    onRemove={cart.remove}
                    onBrowse={() => scrollToId('products', reduce)}
                  />
                  <CheckoutForm checkout={checkout} lines={cart.lines} total={cart.total} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 px-4 py-10 text-center text-sm text-[color:var(--color-muted)]">
        <p className="tracking-[0.22em] text-white/90">NEXORA</p>
        <p className="mt-2">Experience Commerce Beyond Ordinary. · Demo storefront built for the Fynd Hiring Hackathon — products are synthetic.</p>
      </footer>
    </div>
  );
}
