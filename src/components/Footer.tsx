
export function Footer() {
    return (
        <footer className="w-full py-6 mt-8 border-t border-border/40 bg-white">
            <div className="container flex flex-col items-center justify-center gap-4 px-4 md:flex-row md:gap-8">
                <div className="flex items-center gap-3">
                    <img
                        src="/logo_hmw.png"
                        alt="HMW AI Innovations"
                        className="h-20 w-auto object-contain"
                    />
                    <div className="flex flex-col">
                        <span className="text-sm font-semibold text-foreground/80">Developed by</span>
                        <span className="text-md font-bold text-primary">Magudeshwaran Hariharan</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
