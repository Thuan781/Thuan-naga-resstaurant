import Link from "next/link";
import { Logo } from "./Logo";

export default function Footer({ phone, address }: { phone?: string | null; address?: string | null }) {
  return (
    <footer className="mt-16 bg-slate-950 text-slate-300">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3">
            <Logo size={48} glow />
            <div className="leading-tight">
              <p className="font-display text-lg font-bold text-white">Thuan Naga Restaurant</p>
              <p className="font-script text-sm text-gold">Naga flavours · warm hearts</p>
            </div>
          </div>
          <p className="mt-4 max-w-md text-sm leading-6 text-slate-400">
            From smoked pork with bamboo shoot to king chilli chicken — experience the bold,
            earthy flavours of the Naga hills, cooked fresh and delivered hot to your door.
          </p>
          <p className="mt-4 text-sm text-slate-400">
            📍 {address ?? "Phaibou Road, Tamenglong, Manipur 795141"}
            <br />
            📞 {phone ?? "+91 60099 21828"} · ✉️ kthuan781@gmail.com
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Explore</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li><Link href="/menu" className="hover:text-primary-300">Full Menu</Link></li>
            <li><Link href="/orders" className="hover:text-primary-300">My Orders</Link></li>
            <li><Link href="/account" className="hover:text-primary-300">My Account</Link></li>
            <li><Link href="/cart" className="hover:text-primary-300">Cart</Link></li>
            <li>
              <a href="/menu-poster.svg" target="_blank" rel="noopener noreferrer" className="hover:text-primary-300">
                ✨ Neon menu poster
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Good to know</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-slate-400">
            <li>🛵 Free delivery over ₹300</li>
            <li>💵 Cash on Delivery available</li>
            <li>🌶️ Spice levels from mild to bhut jolokia</li>
            <li>🥬 Vegan & vegetarian options</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-800">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-4 text-xs text-slate-500 sm:flex-row sm:px-6">
          <p>© {new Date().getFullYear()} Thuan Naga Restaurant · Tamenglong, Manipur</p>
          <Link href="/admin/login" className="hover:text-slate-300">Staff login</Link>
        </div>
      </div>
    </footer>
  );
}
