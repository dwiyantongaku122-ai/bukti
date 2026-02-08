import { Game } from "@shared/schema";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { X } from "lucide-react";

interface GameCardProps {
  game: Game;
  iconSize?: number;
  outlineAnimation?: string;
  animationSpeed?: number;
  outlineThickness?: number;
  cardBgColor?: string;
}

export function GameCard({ game, iconSize = 50, outlineAnimation = "pulse", animationSpeed = 3, outlineThickness = 2, cardBgColor = "#0c1929" }: GameCardProps) {
  const [showDetail, setShowDetail] = useState(false);
  const colorStart = game.outlineColor || "#ffffff";
  const colorEnd = game.outlineColorEnd || "#ff0000";
  const thickness = Math.max(1, outlineThickness);

  const animationClass =
    outlineAnimation === "rotate"
      ? "card-outline-rotate"
      : outlineAnimation === "pulse"
        ? "card-outline-pulse"
        : "";

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -4 }}
        transition={{ duration: 0.3 }}
        className="group relative rounded-md cursor-pointer"
        onClick={() => setShowDetail(true)}
        data-testid={`card-game-${game.id}`}
      >
        <div
          className={`absolute rounded-md z-0 ${animationClass}`}
          style={{
            inset: `-${thickness}px`,
            background: `linear-gradient(135deg, ${colorStart}, ${colorEnd} 50%, ${colorStart})`,
            backgroundSize: outlineAnimation === "rotate" ? "300% 300%" : "100% 100%",
            animationDuration: `${animationSpeed}s`,
          }}
        />

        <div className="relative z-10 rounded-md overflow-hidden" style={{ backgroundColor: cardBgColor }}>
          <div className="relative w-full aspect-square overflow-hidden">
            <img
              src={game.imageUrl}
              alt={game.name}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://placehold.co/300x300/1e293b/ffffff?text=${encodeURIComponent(game.name)}`;
              }}
            />
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none"
              style={{ background: `radial-gradient(circle at center, ${colorStart}, transparent 70%)` }}
            />
          </div>

          <div className="p-3 space-y-1">
            <div
              className="text-[10px] font-bold uppercase tracking-widest"
              style={{ color: colorStart }}
              data-testid={`text-provider-${game.id}`}
            >
              {game.provider}
            </div>

            <div className="text-sm font-bold text-white leading-tight" data-testid={`text-name-${game.id}`}>
              {game.name}
            </div>

            {(game.iconUrl || game.iconUrl2) && (
              <div className="flex items-center gap-1.5 pt-1">
                {game.iconUrl && (
                  <div
                    className="rounded-md overflow-hidden border border-white/20 bg-black/40"
                    style={{ width: iconSize, height: iconSize }}
                  >
                    <img src={game.iconUrl} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
                {game.iconUrl2 && (
                  <div
                    className="rounded-md overflow-hidden border border-white/20 bg-black/40"
                    style={{ width: iconSize, height: iconSize }}
                  >
                    <img src={game.iconUrl2} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            )}

            <div className="space-y-0.5 pt-1">
              <DataRow label="Deposit" value={game.deposit} color="#34d399" />
              <DataRow label="Withdraw" value={game.withdraw} color="#60a5fa" />
              <DataRow label="Bet" value={game.bet} color="#fbbf24" />
            </div>

            <div className="flex items-center gap-1.5 pt-1 border-t border-white/10">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-[10px] font-mono text-white/60" data-testid={`text-datetime-${game.id}`}>
                {game.dateTime}
              </span>
            </div>

            {game.description && (
              <p className="text-[10px] text-white/50 leading-snug pt-1 border-t border-white/10 line-clamp-3" data-testid={`text-desc-${game.id}`}>
                {game.description}
              </p>
            )}
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {showDetail && (
          <GameDetailModal game={game} colorStart={colorStart} colorEnd={colorEnd} onClose={() => setShowDetail(false)} />
        )}
      </AnimatePresence>
    </>
  );
}

function GameDetailModal({ game, colorStart, colorEnd, onClose }: { game: Game; colorStart: string; colorEnd: string; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-2 md:p-4"
      onClick={onClose}
      data-testid={`modal-game-${game.id}`}
    >
      <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" />

      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="relative z-10 w-full max-w-4xl max-h-[95vh] overflow-y-auto rounded-lg"
        onClick={(e) => e.stopPropagation()}
        style={{
          border: "2px solid transparent",
          borderImage: `linear-gradient(135deg, ${colorStart}, ${colorEnd}) 1`,
        }}
      >
        <div className="bg-[#0c1929]">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 z-20 p-2 rounded-full bg-black/60 text-white/70 transition-colors"
            data-testid="button-close-modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="relative">
            <img
              src={game.imageUrl}
              alt={game.name}
              className="w-full object-contain max-h-[70vh] bg-black/40"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://placehold.co/800x800/1e293b/ffffff?text=${encodeURIComponent(game.name)}`;
              }}
              data-testid="img-modal-game"
            />
          </div>

          <div className="p-4 space-y-3">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <div
                  className="text-[10px] font-bold uppercase tracking-widest mb-0.5"
                  style={{ color: colorStart }}
                >
                  {game.provider}
                </div>
                <h2 className="text-lg md:text-xl font-bold text-white">
                  {game.name}
                </h2>
              </div>

              {(game.iconUrl || game.iconUrl2) && (
                <div className="flex items-center gap-2">
                  {game.iconUrl && (
                    <div className="w-10 h-10 rounded-md overflow-hidden border border-white/20 bg-black/40">
                      <img src={game.iconUrl} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}
                  {game.iconUrl2 && (
                    <div className="w-10 h-10 rounded-md overflow-hidden border border-white/20 bg-black/40">
                      <img src={game.iconUrl2} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              )}
            </div>

            {game.description && (
              <p className="text-xs text-white/60 leading-relaxed" data-testid="text-modal-description">
                {game.description}
              </p>
            )}

            <div className="flex items-center gap-3 flex-wrap">
              <CompactStat label="Deposit" value={game.deposit} color="#34d399" />
              <CompactStat label="Withdraw" value={game.withdraw} color="#60a5fa" />
              <CompactStat label="Bet" value={game.bet} color="#fbbf24" />
              <div className="flex items-center gap-1.5 ml-auto">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-[10px] font-mono text-white/40">{game.dateTime}</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function CompactStat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex items-center gap-1.5 bg-white/5 rounded-md px-2.5 py-1.5 border border-white/5">
      <span className="text-[9px] uppercase tracking-wider text-white/40">{label}</span>
      <span className="text-xs font-bold font-mono" style={{ color }}>{value}</span>
    </div>
  );
}

function DataRow({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex items-center justify-between text-[11px]">
      <span className="text-white/40 uppercase text-[9px] tracking-wider">{label}</span>
      <span className="font-mono font-semibold" style={{ color }}>{value}</span>
    </div>
  );
}
