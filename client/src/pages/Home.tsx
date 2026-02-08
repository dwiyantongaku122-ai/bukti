import { useSettings } from "@/hooks/use-settings";
import { useGames } from "@/hooks/use-games";
import { useButtons } from "@/hooks/use-buttons";
import { GameCard } from "@/components/GameCard";
import { SnowEffect } from "@/components/SnowEffect";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const { settings, isLoading: settingsLoading } = useSettings();
  const { games, isLoading: gamesLoading } = useGames();
  const { buttons, isLoading: buttonsLoading } = useButtons();

  if (settingsLoading || gamesLoading || buttonsLoading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  const desktopCols = settings?.desktopColumns || 4;
  const mobileCols = settings?.mobileColumns || 3;
  const btnColor = settings?.buttonColor || "#3b82f6";
  const btnOutline = settings?.buttonOutlineColor || "#60a5fa";
  const btnShape = settings?.buttonShape || "rounded-full";
  const logoSize = settings?.logoSize || 220;
  const outlineAnimation = settings?.outlineAnimation || "pulse";
  const animationSpeed = settings?.outlineAnimationSpeed || 3;
  const cardSize = settings?.gameCardSize || 200;
  const outlineThickness = settings?.outlineThickness || 2;
  const snowEnabled = settings?.snowEnabled ?? false;
  const snowSpeed = settings?.snowSpeed || 5;
  const snowAmount = settings?.snowAmount || 50;
  const cardBgColor = settings?.cardBgColor || "#0c1929";
  const globalBtnHeight = settings?.buttonHeight || 48;
  const globalBtnWidth = settings?.buttonWidth || 300;
  const bgColor = settings?.bgColor || "#020617";
  const siteDescription = settings?.siteDescription || "";
  const siteDescriptionSize = settings?.siteDescriptionSize || 16;
  const siteDescriptionColor = settings?.siteDescriptionColor || "#ffffff";
  const marqueeText = settings?.marqueeText || "";
  const marqueeSpeed = settings?.marqueeSpeed || 10;
  const marqueeColor = settings?.marqueeColor || "#ffffff";
  const marqueeBgColor = settings?.marqueeBgColor || "#1e293b";
  const marqueeEnabled = settings?.marqueeEnabled ?? false;

  const visibleButtons = (buttons || []).filter(b => b.isVisible);

  return (
    <div
      className="min-h-screen text-white"
      style={{
        backgroundColor: bgColor,
        backgroundImage: settings?.backgroundUrl ? `url(${settings.backgroundUrl})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      <SnowEffect
        enabled={snowEnabled}
        speed={snowSpeed}
        amount={snowAmount}
        particleSize={settings?.snowParticleSize || 20}
        images={[
          settings?.snowImageUrl1 || "",
          settings?.snowImageUrl2 || "",
          settings?.snowImageUrl3 || "",
          settings?.snowImageUrl4 || "",
        ]}
      />

      <main className="relative z-10 container mx-auto px-3 py-6 md:py-10">
        <div className="flex flex-col items-center justify-center mb-8 space-y-6">
          <motion.div
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            style={{ width: logoSize, maxWidth: '90vw' }}
          >
            {settings?.logoUrl ? (
              <img
                src={settings.logoUrl}
                alt={settings.siteTitle || "Logo"}
                className="w-full h-auto drop-shadow-[0_0_20px_rgba(59,130,246,0.4)]"
                data-testid="img-logo"
              />
            ) : (
              <h1 className="text-3xl md:text-5xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50 tracking-tight uppercase">
                {settings?.siteTitle || "GAME SITE"}
              </h1>
            )}
          </motion.div>

          {siteDescription && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="text-center max-w-2xl leading-relaxed"
              style={{
                fontSize: siteDescriptionSize,
                color: siteDescriptionColor,
              }}
              data-testid="text-site-description"
            >
              {siteDescription}
            </motion.p>
          )}

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            className="flex flex-col items-center gap-3 w-full"
            style={{ maxWidth: Math.max(globalBtnWidth, 200) }}
          >
            {visibleButtons.map((btn, index) => (
              <motion.a
                key={btn.id}
                href={btn.url || "#"}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.05 }}
                className={`btn-3d group relative overflow-hidden ${btnShape} font-bold text-center text-sm border-2 w-full block`}
                style={{
                  background: `linear-gradient(135deg, ${btn.color || btnColor}, ${btn.color || btnColor}cc, ${btn.color || btnColor})`,
                  borderColor: btn.outlineColor || btnOutline,
                  height: globalBtnHeight,
                  lineHeight: `${globalBtnHeight - 4}px`,
                }}
                data-testid={`button-dynamic-${btn.id}`}
              >
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: `linear-gradient(135deg, ${btn.color || btnColor}dd, ${btn.outlineColor || btnOutline}60, ${btn.color || btnColor}dd)` }}
                />
                <span className="relative flex items-center justify-center gap-2 text-white drop-shadow-md h-full">
                  {btn.label}
                </span>
              </motion.a>
            ))}

            {visibleButtons.length === 0 && (
              <>
                <a
                  href={settings?.loginUrl || "#"}
                  className={`btn-3d group relative overflow-hidden ${btnShape} font-bold text-center text-sm border-2 w-full block`}
                  style={{
                    background: `linear-gradient(135deg, ${btnColor}, ${btnColor}cc, ${btnColor})`,
                    borderColor: btnOutline,
                    height: globalBtnHeight,
                    lineHeight: `${globalBtnHeight - 4}px`,
                  }}
                  data-testid="button-login"
                >
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ background: `linear-gradient(135deg, ${btnColor}dd, ${btnOutline}60, ${btnColor}dd)` }}
                  />
                  <span className="relative flex items-center justify-center gap-2 text-white drop-shadow-md h-full">
                    LOGIN
                  </span>
                </a>
                <a
                  href={settings?.registerUrl || "#"}
                  className={`btn-3d group relative overflow-hidden ${btnShape} font-bold text-center text-sm border-2 w-full block`}
                  style={{
                    background: `linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.1))`,
                    borderColor: btnOutline,
                    height: globalBtnHeight,
                    lineHeight: `${globalBtnHeight - 4}px`,
                  }}
                  data-testid="button-register"
                >
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ background: `linear-gradient(135deg, ${btnColor}30, ${btnOutline}20, ${btnColor}30)` }}
                  />
                  <span className="relative flex items-center justify-center gap-2 text-white h-full">
                    DAFTAR
                  </span>
                </a>
              </>
            )}
          </motion.div>

          {marqueeEnabled && marqueeText && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="w-full max-w-3xl overflow-hidden rounded-md relative"
              style={{ backgroundColor: marqueeBgColor }}
              data-testid="marquee-container"
            >
              <div
                className="marquee-single inline-block py-2.5 whitespace-nowrap font-medium tracking-wide"
                style={{
                  color: marqueeColor,
                  fontSize: 14,
                  animationDuration: `${Math.max(51 - marqueeSpeed * 5, 3)}s`,
                }}
                data-testid="text-marquee"
              >
                {marqueeText}
              </div>
            </motion.div>
          )}
        </div>

        <style>{`
          .marquee-single {
            animation: marquee-single-scroll linear infinite;
          }
          @keyframes marquee-single-scroll {
            0% { transform: translateX(100vw); }
            100% { transform: translateX(-100%); }
          }
          .game-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(${Math.max(cardSize, 120)}px, 1fr));
            gap: 0.75rem;
          }
          @media (max-width: 1023px) {
            .game-grid {
              grid-template-columns: repeat(${mobileCols}, minmax(0, 1fr));
            }
          }
          @media (min-width: 1024px) {
            .game-grid {
              grid-template-columns: repeat(${desktopCols}, minmax(${Math.max(cardSize, 120)}px, 1fr));
              gap: 1rem;
            }
          }
        `}</style>

        <div className="game-grid" data-testid="grid-games">
          {games?.filter(g => g.isPublished).map((game) => (
            <GameCard
              key={game.id}
              game={game}
              iconSize={settings?.gameIconSize || 50}
              outlineAnimation={outlineAnimation}
              animationSpeed={animationSpeed}
              outlineThickness={outlineThickness}
              cardBgColor={cardBgColor}
            />
          ))}
        </div>

        {(!games || games.length === 0) && (
          <div className="py-20 text-center text-white/30">
            <p className="text-xl">No games available yet.</p>
          </div>
        )}
      </main>

      <footer className="relative z-10 py-6 text-center text-white/20 text-xs">
        <p>&copy; {new Date().getFullYear()} {settings?.siteTitle}. All rights reserved.</p>
      </footer>
    </div>
  );
}
