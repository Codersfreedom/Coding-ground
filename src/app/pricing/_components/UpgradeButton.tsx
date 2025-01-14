import { Zap } from "lucide-react";
import Link from "next/link";

export default function UpgradeButton() {
    const CHEKOUT_URL =
        "https://codingground.lemonsqueezy.com/buy/aa102c1e-164e-4df1-bf83-b7035d367db7";

    return (
        <Link
            href={CHEKOUT_URL}
            className="inline-flex items-center justify-center gap-2 px-8 py-4 text-white
        bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg
        hover:from-blue-600 hover:to-blue-700 transition-all"
        >
            <Zap className="w-5 h-5" />
            Upgrade to Pro
        </Link>
    );
}