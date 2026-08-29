import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, {
  Defs,
  LinearGradient,
  RadialGradient,
  Stop,
  Path,
  Circle,
  Polygon,
  G,
  Text as SvgText,
  Rect,
} from 'react-native-svg';

// 4-point diamond sparkle star SVG path helper
function renderSparkle(cx: number, cy: number, size: number, color: string = '#FFFFFF') {
  const d = `M ${cx} ${cy - size} Q ${cx} ${cy} ${cx + size} ${cy} Q ${cx} ${cy} ${cx} ${cy + size} Q ${cx} ${cy} ${cx - size} ${cy} Q ${cx} ${cy} ${cx} ${cy - size} Z`;
  return <Path key={`spk-${cx}-${cy}`} d={d} fill={color} />;
}

export type ExactBadgeArtType =
  | 'coffee'
  | 'salad'
  | 'spaghetti'
  | 'burger'
  | 'mountaineer'
  | 'taco'
  | 'camel_desert'
  | 'treasure_chest'
  | 'gold_star_shield'
  | 'city_skyline'
  | 'hexagon_25'
  | 'hexagon_50'
  | 'octagon_100'
  | 'celebration_party';

export interface ExactBadgeDef {
  artType: ExactBadgeArtType;
  customNumber?: string;
}

const BADGE_MAP: Record<string, ExactBadgeDef> = {
  // Onboarding & Novice
  first_step: { artType: 'coffee' },
  sharp_eye: { artType: 'city_skyline' },
  first_verifier: { artType: 'salad' },
  ready_scout: { artType: 'burger' },
  location_scout: { artType: 'mountaineer' },
  quick_responder: { artType: 'taco' },

  // Potholes & Roads
  pothole_novice: { artType: 'spaghetti' },
  pothole_patrol: { artType: 'camel_desert' },
  pothole_hunter: { artType: 'treasure_chest' },
  pothole_master: { artType: 'gold_star_shield' },
  road_guardian: { artType: 'hexagon_25', customNumber: '25' },
  asphalt_doctor: { artType: 'city_skyline' },
  crater_crusher: { artType: 'celebration_party' },
  smooth_streets: { artType: 'burger' },

  // Lighting & Streetlight
  lamp_spotter: { artType: 'coffee' },
  light_keeper: { artType: 'spaghetti' },
  dawn_patrol: { artType: 'camel_desert' },
  night_owl: { artType: 'taco' },
  grid_guardian: { artType: 'hexagon_50', customNumber: '50' },
  beacon_master: { artType: 'gold_star_shield' },

  // Waste & Sanitation
  eco_starter: { artType: 'salad' },
  eco_warrior: { artType: 'burger' },
  eco_sentinel: { artType: 'city_skyline' },
  zero_waste_hero: { artType: 'treasure_chest' },

  // Verification & Trust
  verify_bronze: { artType: 'coffee' },
  verify_silver: { artType: 'hexagon_25', customNumber: '25' },
  verify_gold: { artType: 'gold_star_shield' },
  verify_platinum: { artType: 'hexagon_50', customNumber: '50' },
  double_check: { artType: 'salad' },
  hawk_eye: { artType: 'mountaineer' },
  peer_trusted: { artType: 'celebration_party' },

  // Resolution & Champions
  fix_witness: { artType: 'city_skyline' },
  before_after: { artType: 'burger' },
  city_healer: { artType: 'treasure_chest' },

  // Streaks & Loyalty
  streak_3: { artType: 'taco' },
  streak_7: { artType: 'camel_desert' },
  streak_14: { artType: 'mountaineer' },
  streak_30: { artType: 'treasure_chest' },
  weekend_hero: { artType: 'coffee' },
  holiday_keeper: { artType: 'celebration_party' },

  // Milestones (Exact Numbers & Shields from Image)
  milestone_5: { artType: 'hexagon_25', customNumber: '5' },
  milestone_10: { artType: 'hexagon_25', customNumber: '10' },
  milestone_25: { artType: 'hexagon_25', customNumber: '25' },
  milestone_50: { artType: 'hexagon_50', customNumber: '50' },
  milestone_100: { artType: 'octagon_100', customNumber: '100' },
  milestone_250: { artType: 'hexagon_50', customNumber: '250' },
  milestone_500: { artType: 'octagon_100', customNumber: '500' },
  ai_visionary: { artType: 'gold_star_shield' },
  legendary_guardian: { artType: 'gold_star_shield' },
};

interface RealBadgeEmblemProps {
  id: string;
  size?: number;
  isUnlocked?: boolean;
}

export const RealBadgeEmblem: React.FC<RealBadgeEmblemProps> = ({
  id,
  size = 56,
  isUnlocked = true,
}) => {
  const normId = (id || '').toLowerCase().trim();
  const def: ExactBadgeDef = BADGE_MAP[normId] || { artType: 'gold_star_shield' };

  // If locked, render a clean desaturated locked state
  if (!isUnlocked) {
    return (
      <View style={[styles.container, { width: size, height: size }]}>
        <Svg width={size} height={size} viewBox="0 0 100 100">
          <Circle cx="50" cy="50" r="46" fill="#475569" stroke="#94A3B8" strokeWidth="4" />
          <Circle cx="50" cy="50" r="35" fill="#334155" />
          {/* Padlock Icon */}
          <Path
            d="M 38 46 L 38 35 C 38 28.37 43.37 23 50 23 C 56.63 23 62 28.37 62 35 L 62 46"
            fill="none"
            stroke="#94A3B8"
            strokeWidth="5.5"
            strokeLinecap="round"
          />
          <Rect x="33" y="44" width="34" height="26" rx="6" fill="#1E293B" stroke="#64748B" strokeWidth="2" />
          <Circle cx="50" cy="55" r="3" fill="#94A3B8" />
          <Path d="M 50 57 L 50 63" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
        </Svg>
      </View>
    );
  }

  // 1. COFFEE CUP WITH STEAM (Ultra-Vibrant Rich Caramel & Cream)
  if (def.artType === 'coffee') {
    return (
      <View style={[styles.container, { width: size, height: size }]}>
        <Svg width={size} height={size} viewBox="0 0 100 100">
          <Defs>
            <LinearGradient id="coffeeRim" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="#C97A56" />
              <Stop offset="40%" stopColor="#9C5234" />
              <Stop offset="100%" stopColor="#542414" />
            </LinearGradient>
            <RadialGradient id="coffeeBg" cx="50%" cy="35%" r="65%">
              <Stop offset="0%" stopColor="#FFF3E0" />
              <Stop offset="70%" stopColor="#FFCC80" />
              <Stop offset="100%" stopColor="#FFA726" />
            </RadialGradient>
          </Defs>

          {/* Glossy Outer Rim */}
          <Circle cx="50" cy="50" r="47" fill="url(#coffeeRim)" stroke="#FFA07A" strokeWidth="2.5" />
          {/* Specular Top Shine */}
          <Path d="M 16 38 A 43 43 0 0 1 84 38" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" fill="none" opacity={0.6} />

          {/* Vibrant Inner Base */}
          <Circle cx="50" cy="50" r="36" fill="url(#coffeeBg)" stroke="#8D381A" strokeWidth="2" />

          {/* Deep Drop Shadow */}
          <Path d="M 28 66 L 74 66 L 68 76 L 22 76 Z" fill="#4E2010" opacity={0.45} />

          {/* Saucer */}
          <Path d="M 33 66 L 67 66 L 63 71 L 37 71 Z" fill="#FFFFFF" />
          <Path d="M 37 71 L 63 71 L 60 73 L 40 73 Z" fill="#FFD54F" />

          {/* Ceramic Cup */}
          <Path d="M 35 44 C 35 63 65 63 65 44 Z" fill="#FFFFFF" />
          <Path d="M 38 44 C 38 59 62 59 62 44 Z" fill="#FFF9C4" />
          {/* Cup Handle */}
          <Path d="M 64 47 C 74 47 74 58 63 58" fill="none" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" />

          {/* Steam Curves */}
          <Path d="M 44 38 Q 40 28 46 22" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" opacity={0.9} />
          <Path d="M 50 38 Q 55 26 48 18" fill="none" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" opacity={0.95} />
          <Path d="M 56 38 Q 52 30 58 24" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" opacity={0.9} />

          {/* Brilliant Sparkles */}
          {renderSparkle(26, 28, 5)}
          {renderSparkle(20, 54, 3.5)}
          {renderSparkle(80, 26, 4.5)}
        </Svg>
      </View>
    );
  }

  // 2. FRESH SALAD BOWL (Electric Cyan & Neon Lime)
  if (def.artType === 'salad') {
    return (
      <View style={[styles.container, { width: size, height: size }]}>
        <Svg width={size} height={size} viewBox="0 0 100 100">
          <Defs>
            <LinearGradient id="saladRim" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="#00E5FF" />
              <Stop offset="50%" stopColor="#0091EA" />
              <Stop offset="100%" stopColor="#01579B" />
            </LinearGradient>
            <RadialGradient id="saladBg" cx="50%" cy="35%" r="65%">
              <Stop offset="0%" stopColor="#E0F7FA" />
              <Stop offset="70%" stopColor="#80DEEA" />
              <Stop offset="100%" stopColor="#26C6DA" />
            </RadialGradient>
          </Defs>

          <Circle cx="50" cy="50" r="47" fill="url(#saladRim)" stroke="#80D8FF" strokeWidth="2.5" />
          <Path d="M 16 38 A 43 43 0 0 1 84 38" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" fill="none" opacity={0.6} />

          <Circle cx="50" cy="50" r="36" fill="url(#saladBg)" stroke="#006064" strokeWidth="2" />

          {/* Salad Greens & Tomato */}
          <Circle cx="44" cy="40" r="10" fill="#00E676" />
          <Circle cx="56" cy="38" r="11" fill="#76FF03" />
          <Circle cx="50" cy="34" r="9" fill="#B2FF59" />
          {/* Vivid Red Tomatoes */}
          <Circle cx="48" cy="35" r="5" fill="#FF1744" />
          <Circle cx="58" cy="40" r="4.5" fill="#D50000" />

          {/* White Glossy Bowl */}
          <Path d="M 28 44 C 28 67 72 67 72 44 Z" fill="#FFFFFF" />
          <Path d="M 33 44 C 33 61 67 61 67 44 Z" fill="#E1F5FE" />

          {/* Sparkles */}
          {renderSparkle(22, 26, 4.5)}
          {renderSparkle(78, 24, 4)}
        </Svg>
      </View>
    );
  }

  // 3. SPAGHETTI / PASTA PLATE (Neon Electric Lime & Golden Sun)
  if (def.artType === 'spaghetti') {
    return (
      <View style={[styles.container, { width: size, height: size }]}>
        <Svg width={size} height={size} viewBox="0 0 100 100">
          <Defs>
            <LinearGradient id="pastaRim" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="#EEFF41" />
              <Stop offset="40%" stopColor="#AEEA00" />
              <Stop offset="100%" stopColor="#64DD17" />
            </LinearGradient>
            <RadialGradient id="pastaBg" cx="50%" cy="35%" r="65%">
              <Stop offset="0%" stopColor="#F9FBE7" />
              <Stop offset="70%" stopColor="#F0F4C3" />
              <Stop offset="100%" stopColor="#DCE775" />
            </RadialGradient>
          </Defs>

          <Circle cx="50" cy="50" r="47" fill="url(#pastaRim)" stroke="#FFFF8D" strokeWidth="2.5" />
          <Path d="M 16 38 A 43 43 0 0 1 84 38" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" fill="none" opacity={0.65} />

          <Circle cx="50" cy="50" r="36" fill="url(#pastaBg)" stroke="#33691E" strokeWidth="2" />

          {/* Platter */}
          <Polygon points="30,71 77,47 71,40 24,64" fill="#B0BEC5" />
          <Polygon points="32,69 79,45 73,38 26,62" fill="#FFFFFF" />

          {/* Spaghetti Mound */}
          <Path d="M 40 56 C 40 38 64 38 64 56 Z" fill="#FFD600" />
          <Path d="M 43 54 C 43 40 61 40 61 54 Z" fill="#FFFF00" />
          {/* Vivid Tomato Sauce */}
          <Path d="M 46 44 Q 52 36 58 44 Q 54 48 46 44 Z" fill="#FF1744" />

          {/* Fork Twirl */}
          <Path d="M 52 40 L 73 19" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" />
          <Circle cx="54" cy="38" r="4.5" fill="#FF6D00" />

          {/* Sparkles */}
          {renderSparkle(24, 38, 4.5)}
          {renderSparkle(80, 36, 4.5)}
          {renderSparkle(42, 26, 3.5)}
        </Svg>
      </View>
    );
  }

  // 4. HAMBURGER (Glowing Emerald Teal & Flame Orange)
  if (def.artType === 'burger') {
    return (
      <View style={[styles.container, { width: size, height: size }]}>
        <Svg width={size} height={size} viewBox="0 0 100 100">
          <Defs>
            <LinearGradient id="burgerRim" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="#00E5FF" />
              <Stop offset="50%" stopColor="#00B8D4" />
              <Stop offset="100%" stopColor="#006064" />
            </LinearGradient>
            <RadialGradient id="burgerBg" cx="50%" cy="35%" r="65%">
              <Stop offset="0%" stopColor="#E0F7FA" />
              <Stop offset="70%" stopColor="#80DEEA" />
              <Stop offset="100%" stopColor="#4DD0E1" />
            </RadialGradient>
          </Defs>

          <Circle cx="50" cy="50" r="47" fill="url(#burgerRim)" stroke="#84FFFF" strokeWidth="2.5" />
          <Path d="M 16 38 A 43 43 0 0 1 84 38" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" fill="none" opacity={0.6} />

          <Circle cx="50" cy="50" r="36" fill="url(#burgerBg)" stroke="#004D40" strokeWidth="2" />

          {/* Top Bun */}
          <Path d="M 32 44 C 32 26 68 26 68 44 Z" fill="#FF9100" />
          <Path d="M 36 43 C 36 30 64 30 64 43 Z" fill="#FFAB40" />
          {/* Golden sesame seeds */}
          <Circle cx="44" cy="33" r="1.5" fill="#FFFF00" />
          <Circle cx="52" cy="31" r="1.5" fill="#FFFF00" />
          <Circle cx="60" cy="34" r="1.5" fill="#FFFF00" />

          {/* Tomato */}
          <Rect x="30" y="44" width="40" height="4.5" rx="2" fill="#FF1744" />
          {/* Melted Cheese */}
          <Polygon points="30,48.5 70,48.5 56,55" fill="#FFEA00" />
          {/* Juicy Patty */}
          <Rect x="28" y="49" width="44" height="6.5" rx="3" fill="#4E342E" />
          {/* Neon Green Lettuce */}
          <Path d="M 28 55 Q 35 60 42 55 Q 50 60 58 55 Q 65 60 72 55" stroke="#00E676" strokeWidth="4.5" fill="none" strokeLinecap="round" />
          {/* Bottom Bun */}
          <Rect x="32" y="59" width="36" height="7.5" rx="3.5" fill="#FF9100" />

          {/* Sparkles */}
          {renderSparkle(20, 34, 4.5)}
          {renderSparkle(82, 40, 4.5)}
        </Svg>
      </View>
    );
  }

  // 5. MOUNTAINEER / SUMMIT EXPLORER (High-Voltage Azure Blue)
  if (def.artType === 'mountaineer') {
    return (
      <View style={[styles.container, { width: size, height: size }]}>
        <Svg width={size} height={size} viewBox="0 0 100 100">
          <Defs>
            <LinearGradient id="mountRim" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="#00E5FF" />
              <Stop offset="50%" stopColor="#00B0FF" />
              <Stop offset="100%" stopColor="#0D47A1" />
            </LinearGradient>
            <LinearGradient id="mountSky" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="#E1F5FE" />
              <Stop offset="100%" stopColor="#4FC3F7" />
            </LinearGradient>
          </Defs>

          <Circle cx="50" cy="50" r="47" fill="url(#mountRim)" stroke="#80D8FF" strokeWidth="2.5" />
          <Path d="M 16 38 A 43 43 0 0 1 84 38" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" fill="none" opacity={0.65} />

          <Circle cx="50" cy="50" r="36" fill="url(#mountSky)" stroke="#01579B" strokeWidth="2" />

          {/* Clouds */}
          <Circle cx="30" cy="38" r="9" fill="#FFFFFF" opacity={0.9} />
          <Circle cx="44" cy="35" r="11" fill="#FFFFFF" opacity={0.9} />

          {/* Mountain Peaks with Snow */}
          <Polygon points="16,84 46,44 68,84" fill="#00838F" />
          <Polygon points="46,44 40,54 52,54" fill="#FFFFFF" />

          <Polygon points="44,84 76,48 94,84" fill="#004D40" />
          <Polygon points="76,48 70,58 82,58" fill="#FFFFFF" />

          {/* Hiker with Red Flag */}
          <Circle cx="76" cy="36" r="4.5" fill="#FFA726" />
          <Rect x="73" y="40" width="6.5" height="10" rx="2" fill="#2979FF" />
          <Rect x="78" y="40" width="4.5" height="8" rx="2" fill="#FF6D00" />
          <Path d="M 83 48 L 83 26" stroke="#212121" strokeWidth="2.5" strokeLinecap="round" />
          <Polygon points="83,26 95,32 83,38" fill="#FF1744" />

          {/* Sparkles */}
          {renderSparkle(24, 26, 4.5)}
        </Svg>
      </View>
    );
  }

  // 6. TACO (Electric Violet Purple & Golden Shell)
  if (def.artType === 'taco') {
    return (
      <View style={[styles.container, { width: size, height: size }]}>
        <Svg width={size} height={size} viewBox="0 0 100 100">
          <Defs>
            <LinearGradient id="tacoRim" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="#D500F9" />
              <Stop offset="50%" stopColor="#7C4DFF" />
              <Stop offset="100%" stopColor="#311B92" />
            </LinearGradient>
            <RadialGradient id="tacoBg" cx="50%" cy="35%" r="65%">
              <Stop offset="0%" stopColor="#F3E5F5" />
              <Stop offset="70%" stopColor="#D1C4E9" />
              <Stop offset="100%" stopColor="#B388FF" />
            </RadialGradient>
          </Defs>

          <Circle cx="50" cy="50" r="47" fill="url(#tacoRim)" stroke="#EA80FC" strokeWidth="2.5" />
          <Path d="M 16 38 A 43 43 0 0 1 84 38" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" fill="none" opacity={0.65} />

          <Circle cx="50" cy="50" r="36" fill="url(#tacoBg)" stroke="#311B92" strokeWidth="2" />

          {/* Taco Shell */}
          <G transform="rotate(-20 50 50)">
            <Circle cx="44" cy="40" r="5.5" fill="#00E676" />
            <Circle cx="50" cy="38" r="6.5" fill="#76FF03" />
            <Circle cx="58" cy="38" r="5.5" fill="#00E676" />
            <Circle cx="66" cy="42" r="5.5" fill="#76FF03" />
            <Circle cx="46" cy="39" r="3" fill="#FF1744" />
            <Circle cx="56" cy="37" r="3.5" fill="#FF1744" />
            <Circle cx="64" cy="40" r="3" fill="#FF1744" />

            <Path d="M 28 54 C 28 30 72 30 72 54 C 72 70 28 70 28 54 Z" fill="#FFAB00" />
            <Path d="M 32 54 C 32 36 68 36 68 54 C 68 66 32 66 32 54 Z" fill="#FFD600" />
          </G>

          {/* Sparkles */}
          {renderSparkle(22, 30, 4.5)}
          {renderSparkle(78, 66, 4.5)}
        </Svg>
      </View>
    );
  }

  // 7. DESERT SUNSET / CAMEL TRAVELER (Fiery Sunset Gradient)
  if (def.artType === 'camel_desert') {
    return (
      <View style={[styles.container, { width: size, height: size }]}>
        <Svg width={size} height={size} viewBox="0 0 100 100">
          <Defs>
            <LinearGradient id="camelRim" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="#FFE57F" />
              <Stop offset="50%" stopColor="#FF9100" />
              <Stop offset="100%" stopColor="#DD2C00" />
            </LinearGradient>
            <LinearGradient id="sunSky" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="#FF4081" />
              <Stop offset="45%" stopColor="#FF6E40" />
              <Stop offset="80%" stopColor="#FFD740" />
              <Stop offset="100%" stopColor="#FFF9C4" />
            </LinearGradient>
          </Defs>

          <Circle cx="50" cy="50" r="47" fill="url(#camelRim)" stroke="#FFE082" strokeWidth="2.5" />
          <Path d="M 16 38 A 43 43 0 0 1 84 38" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" fill="none" opacity={0.65} />

          <Circle cx="50" cy="50" r="36" fill="url(#sunSky)" stroke="#BF360C" strokeWidth="2" />

          {/* Glowing Sunset Sun */}
          <Circle cx="50" cy="38" r="15" fill="#FFFFFF" opacity={0.9} />

          {/* Purple Desert Dunes */}
          <Path d="M 14 70 Q 42 52 86 70 L 86 86 L 14 86 Z" fill="#9C27B0" />
          <Path d="M 14 76 Q 60 60 86 80 L 86 86 L 14 86 Z" fill="#4A148C" />

          {/* Silhouette Camel & Rider */}
          <G transform="translate(36, 44)">
            <Path d="M 12 18 C 12 14 16 12 20 14 C 23 12 28 12 30 16 C 32 20 28 24 20 24 C 14 24 12 22 12 18 Z" fill="#311B92" />
            <Path d="M 13 18 L 6 10 C 5 8 8 6 10 7 L 16 14 Z" fill="#311B92" />
            <Path d="M 13 24 L 11 36 M 16 24 L 16 35 M 24 24 L 26 36 M 28 24 L 30 35" stroke="#311B92" strokeWidth="2.2" strokeLinecap="round" />
            <Circle cx="21" cy="7" r="3.5" fill="#311B92" />
            <Path d="M 17 8 L 25 8" stroke="#311B92" strokeWidth="2" strokeLinecap="round" />
            <Path d="M 21 10 L 21 15" stroke="#311B92" strokeWidth="2.5" />
          </G>

          {/* Sparkles */}
          {renderSparkle(20, 24, 4)}
        </Svg>
      </View>
    );
  }

  // 8. TREASURE CHEST (Hot Magenta Pink & Gleaming Gold)
  if (def.artType === 'treasure_chest') {
    return (
      <View style={[styles.container, { width: size, height: size }]}>
        <Svg width={size} height={size} viewBox="0 0 100 100">
          <Defs>
            <LinearGradient id="chestRim" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="#FF4081" />
              <Stop offset="50%" stopColor="#F50057" />
              <Stop offset="100%" stopColor="#880E4F" />
            </LinearGradient>
            <RadialGradient id="chestBg" cx="50%" cy="35%" r="65%">
              <Stop offset="0%" stopColor="#FCE4EC" />
              <Stop offset="70%" stopColor="#F8BBD0" />
              <Stop offset="100%" stopColor="#FF80AB" />
            </RadialGradient>
          </Defs>

          <Circle cx="50" cy="50" r="47" fill="url(#chestRim)" stroke="#FF80AB" strokeWidth="2.5" />
          <Path d="M 16 38 A 43 43 0 0 1 84 38" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" fill="none" opacity={0.65} />

          <Circle cx="50" cy="50" r="36" fill="url(#chestBg)" stroke="#880E4F" strokeWidth="2" />

          {/* Golden Glow radiating */}
          <Polygon points="30,42 50,20 70,42" fill="#FFFF00" opacity={0.7} />

          {/* Open Chest Lid */}
          <Polygon points="26,38 74,38 68,25 32,25" fill="#8D6E63" stroke="#FFFFFF" strokeWidth="3.5" />
          <Polygon points="30,36 70,36 65,27 35,27" fill="#5D4037" />

          {/* Gold Bars inside */}
          <Rect x="36" y="37" width="28" height="9" rx="2" fill="#FFD600" />
          <Rect x="40" y="32" width="20" height="7" rx="2" fill="#FFFF00" />

          {/* Chest Base */}
          <Rect x="26" y="44" width="48" height="28" rx="4" fill="#5D4037" stroke="#FFFFFF" strokeWidth="3.5" />
          {/* Keyhole */}
          <Circle cx="50" cy="55" r="5" fill="#FFFFFF" />
          <Circle cx="50" cy="55" r="2.5" fill="#212121" />
          <Path d="M 50 56 L 50 61" stroke="#212121" strokeWidth="2.5" />

          {/* Sparkles */}
          {renderSparkle(20, 30, 4.5)}
          {renderSparkle(80, 28, 5)}
        </Svg>
      </View>
    );
  }

  // 9. CITY SKYLINE (Lush Emerald Neon Green)
  if (def.artType === 'city_skyline') {
    return (
      <View style={[styles.container, { width: size, height: size }]}>
        <Svg width={size} height={size} viewBox="0 0 100 100">
          <Defs>
            <LinearGradient id="cityRim" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="#76FF03" />
              <Stop offset="50%" stopColor="#00E676" />
              <Stop offset="100%" stopColor="#1B5E20" />
            </LinearGradient>
            <LinearGradient id="citySky" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="#E0F7FA" />
              <Stop offset="100%" stopColor="#80CBC4" />
            </LinearGradient>
          </Defs>

          <Circle cx="50" cy="50" r="47" fill="url(#cityRim)" stroke="#B9F6CA" strokeWidth="2.5" />
          <Path d="M 16 38 A 43 43 0 0 1 84 38" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" fill="none" opacity={0.65} />

          <Circle cx="50" cy="50" r="36" fill="url(#citySky)" stroke="#004D40" strokeWidth="2" />

          {/* Clouds */}
          <Circle cx="32" cy="38" r="9" fill="#FFFFFF" opacity={0.95} />
          <Circle cx="44" cy="35" r="11" fill="#FFFFFF" opacity={0.95} />

          {/* Skyscraper Buildings */}
          <G transform="rotate(-15 50 50)">
            <Polygon points="42,24 58,24 58,74 42,74" fill="#FFFFFF" />
            <Polygon points="58,24 68,30 68,74 58,74" fill="#80DEEA" />
            <Path d="M 50 14 L 50 24" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
            <Rect x="46" y="32" width="3.5" height="3.5" fill="#00838F" />
            <Rect x="52" y="32" width="3.5" height="3.5" fill="#00838F" />
            <Rect x="46" y="40" width="3.5" height="3.5" fill="#00838F" />
            <Rect x="52" y="40" width="3.5" height="3.5" fill="#00838F" />
            <Rect x="46" y="48" width="3.5" height="3.5" fill="#00838F" />
            <Rect x="52" y="48" width="3.5" height="3.5" fill="#00838F" />
            <Polygon points="64,36 78,36 78,74 64,74" fill="#E0F7FA" />
            <Polygon points="78,36 84,40 84,74 78,74" fill="#4DD0E1" />
            <Polygon points="26,44 40,44 40,74 26,74" fill="#B2DFDB" />
          </G>

          {/* Sparkles */}
          {renderSparkle(22, 26, 4.5)}
        </Svg>
      </View>
    );
  }

  // 10. CRYSTAL HEXAGON 25 (Luminous Cyan & Royal Blue 3D Crystal)
  if (def.artType === 'hexagon_25') {
    const num = def.customNumber || '25';
    return (
      <View style={[styles.container, { width: size, height: size }]}>
        <Svg width={size} height={size} viewBox="0 0 100 100">
          <Defs>
            <LinearGradient id="hex25Rim" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="#80D8FF" />
              <Stop offset="40%" stopColor="#00B0FF" />
              <Stop offset="100%" stopColor="#0D47A1" />
            </LinearGradient>
            <LinearGradient id="hex25Bg" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="#E1F5FE" />
              <Stop offset="100%" stopColor="#81D4FA" />
            </LinearGradient>
          </Defs>

          {/* Outer Beveled Hexagon */}
          <Polygon points="50,3 91,26 91,74 50,97 9,74 9,26" fill="url(#hex25Rim)" stroke="#E1F5FE" strokeWidth="2.5" />

          {/* Top Bevel Highlight */}
          <Polygon points="50,3 91,26 80,32 50,15 20,32 9,26" fill="#FFFFFF" opacity={0.6} />
          {/* Bottom Bevel Shadow */}
          <Polygon points="50,97 91,74 80,68 50,85 20,68 9,74" fill="#01579B" opacity={0.45} />

          {/* Inner Recessed Hexagon Canvas */}
          <Polygon points="50,15 80,32 80,68 50,85 20,68 20,32" fill="url(#hex25Bg)" stroke="#0288D1" strokeWidth="2" />

          {/* Bold 3D White Numeral */}
          <SvgText x="50" y={num.length > 2 ? 62 : 65} textAnchor="middle" fontSize={num.length > 2 ? 34 : 40} fontWeight="900" fill="#0D47A1">
            {num}
          </SvgText>
          <SvgText x="50" y={num.length > 2 ? 58 : 61} textAnchor="middle" fontSize={num.length > 2 ? 34 : 40} fontWeight="900" fill="#FFFFFF">
            {num}
          </SvgText>

          {/* Sparkles */}
          {renderSparkle(16, 26, 5)}
          {renderSparkle(84, 24, 4)}
          {renderSparkle(50, 93, 4.5)}
        </Svg>
      </View>
    );
  }

  // 11. CRYSTAL HEXAGON 50 (Sleek Chrome & Titanium Shield)
  if (def.artType === 'hexagon_50') {
    const num = def.customNumber || '50';
    return (
      <View style={[styles.container, { width: size, height: size }]}>
        <Svg width={size} height={size} viewBox="0 0 100 100">
          <Defs>
            <LinearGradient id="hex50Rim" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="#ECEFF1" />
              <Stop offset="40%" stopColor="#90A4AE" />
              <Stop offset="100%" stopColor="#263238" />
            </LinearGradient>
            <LinearGradient id="hex50Bg" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="#FFFFFF" />
              <Stop offset="100%" stopColor="#CFD8DC" />
            </LinearGradient>
          </Defs>

          <Polygon points="50,3 91,26 91,74 50,97 9,74 9,26" fill="url(#hex50Rim)" stroke="#FFFFFF" strokeWidth="2.5" />

          {/* Top Bevel Highlight */}
          <Polygon points="50,3 91,26 80,32 50,15 20,32 9,26" fill="#FFFFFF" opacity={0.7} />
          {/* Bottom Bevel Shadow */}
          <Polygon points="50,97 91,74 80,68 50,85 20,68 9,74" fill="#212121" opacity={0.45} />

          {/* Inner Recessed Hexagon Canvas */}
          <Polygon points="50,15 80,32 80,68 50,85 20,68 20,32" fill="url(#hex50Bg)" stroke="#455A64" strokeWidth="2" />

          {/* Bold 3D White Numeral */}
          <SvgText x="50" y={num.length > 2 ? 62 : 65} textAnchor="middle" fontSize={num.length > 2 ? 34 : 40} fontWeight="900" fill="#212121">
            {num}
          </SvgText>
          <SvgText x="50" y={num.length > 2 ? 58 : 61} textAnchor="middle" fontSize={num.length > 2 ? 34 : 40} fontWeight="900" fill="#FFFFFF">
            {num}
          </SvgText>

          {/* Sparkles */}
          {renderSparkle(16, 26, 5)}
          {renderSparkle(84, 24, 4)}
          {renderSparkle(50, 93, 4.5)}
        </Svg>
      </View>
    );
  }

  // 12. GOLD OCTAGON 100 (Sunburst Golden Octagon)
  if (def.artType === 'octagon_100') {
    const num = def.customNumber || '100';
    return (
      <View style={[styles.container, { width: size, height: size }]}>
        <Svg width={size} height={size} viewBox="0 0 100 100">
          <Defs>
            <LinearGradient id="oct100Rim" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="#FFFF00" />
              <Stop offset="30%" stopColor="#FFD600" />
              <Stop offset="70%" stopColor="#FF9100" />
              <Stop offset="100%" stopColor="#DD2C00" />
            </LinearGradient>
            <RadialGradient id="oct100Bg" cx="50%" cy="35%" r="65%">
              <Stop offset="0%" stopColor="#FFF9C4" />
              <Stop offset="70%" stopColor="#FFD54F" />
              <Stop offset="100%" stopColor="#FF6D00" />
            </RadialGradient>
          </Defs>

          <Polygon points="30,4 70,4 96,30 96,70 70,96 30,96 4,70 4,30" fill="url(#oct100Rim)" stroke="#FFFF8D" strokeWidth="3.5" />

          {/* Top Highlight Facets */}
          <Polygon points="30,4 70,4 63,15 37,15" fill="#FFFFFF" opacity={0.65} />
          <Polygon points="4,30 30,4 37,15 15,37" fill="#FFFFFF" opacity={0.55} />

          {/* Bottom Shadow Facets */}
          <Polygon points="30,96 70,96 63,85 37,85" fill="#BF360C" opacity={0.4} />
          <Polygon points="96,70 70,96 63,85 85,63" fill="#BF360C" opacity={0.35} />

          {/* Inner Recessed Octagon */}
          <Polygon points="37,15 63,15 85,37 85,63 63,85 37,85 15,63 15,37" fill="url(#oct100Bg)" stroke="#E65100" strokeWidth="2.5" />

          {/* Rotated 3D Bold White 100 Numeral */}
          <G transform="rotate(-25 50 50)">
            <SvgText x="50" y="63" textAnchor="middle" fontSize="34" fontWeight="900" fill="#BF360C">
              {num}
            </SvgText>
            <SvgText x="50" y="59" textAnchor="middle" fontSize="34" fontWeight="900" fill="#FFFFFF">
              {num}
            </SvgText>
          </G>

          {/* Sparkles */}
          {renderSparkle(12, 28, 5.5)}
          {renderSparkle(88, 26, 4.5)}
          {renderSparkle(28, 92, 5)}
          {renderSparkle(74, 90, 4)}
        </Svg>
      </View>
    );
  }

  // 13. CONFETTI PARTY (Neon Purple & Multicolored Confetti)
  if (def.artType === 'celebration_party') {
    return (
      <View style={[styles.container, { width: size, height: size }]}>
        <Svg width={size} height={size} viewBox="0 0 100 100">
          <Defs>
            <LinearGradient id="partyRim" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="#EA80FC" />
              <Stop offset="50%" stopColor="#AA00FF" />
              <Stop offset="100%" stopColor="#311B92" />
            </LinearGradient>
            <RadialGradient id="partyBg" cx="50%" cy="35%" r="65%">
              <Stop offset="0%" stopColor="#F3E5F5" />
              <Stop offset="70%" stopColor="#D1C4E9" />
              <Stop offset="100%" stopColor="#7E57C2" />
            </RadialGradient>
          </Defs>

          <Circle cx="50" cy="50" r="47" fill="url(#partyRim)" stroke="#E1BEE7" strokeWidth="2.5" />
          <Path d="M 16 38 A 43 43 0 0 1 84 38" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" fill="none" opacity={0.65} />

          <Circle cx="50" cy="50" r="36" fill="url(#partyBg)" stroke="#311B92" strokeWidth="2" />

          {/* Neon Confetti */}
          <Rect x="44" y="24" width="4.5" height="4.5" rx="1" fill="#FF1744" transform="rotate(20 44 24)" />
          <Rect x="58" y="28" width="5.5" height="3.5" rx="1" fill="#FFFF00" transform="rotate(-30 58 28)" />
          <Rect x="34" y="34" width="4.5" height="4.5" rx="1" fill="#00E5FF" transform="rotate(45 34 34)" />
          <Rect x="64" y="36" width="3.5" height="5.5" rx="1" fill="#00E676" transform="rotate(15 64 36)" />
          <Circle cx="50" cy="32" r="3" fill="#FF9100" />

          {/* Cheering Raised Hands */}
          <Path d="M 32 84 L 40 58 L 46 62 L 40 84 Z" fill="#FFA726" />
          <Path d="M 68 84 L 60 58 L 54 62 L 60 84 Z" fill="#FFA726" />
          <Polygon points="40,58 35,49 44,53" fill="#FF1744" />
          <Polygon points="60,58 65,49 56,53" fill="#00E5FF" />

          {/* Sparkles */}
          {renderSparkle(22, 24, 4.5)}
          {renderSparkle(78, 22, 4.5)}
        </Svg>
      </View>
    );
  }

  // 14. GIANT GOLD STAR SHIELD (Ultra-Saturated Sunburst Gold & Ruby Amber)
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Defs>
          <LinearGradient id="starOctRim" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#FFFF55" />
            <Stop offset="30%" stopColor="#FFD600" />
            <Stop offset="70%" stopColor="#FF9100" />
            <Stop offset="100%" stopColor="#DD2C00" />
          </LinearGradient>
          <RadialGradient id="starOctBg" cx="50%" cy="35%" r="65%">
            <Stop offset="0%" stopColor="#FFAB00" />
            <Stop offset="60%" stopColor="#FF6D00" />
            <Stop offset="100%" stopColor="#D50000" />
          </RadialGradient>
        </Defs>

        {/* Outer 8-sided Beveled Octagon */}
        <Polygon points="30,4 70,4 96,30 96,70 70,96 30,96 4,70 4,30" fill="url(#starOctRim)" stroke="#FFFF8D" strokeWidth="3.5" />

        {/* Top Highlight Bevels */}
        <Polygon points="30,4 70,4 63,15 37,15" fill="#FFFFFF" opacity={0.65} />
        <Polygon points="4,30 30,4 37,15 15,37" fill="#FFFFFF" opacity={0.55} />

        {/* Bottom Shadow Bevels */}
        <Polygon points="30,96 70,96 63,85 37,85" fill="#BF360C" opacity={0.45} />
        <Polygon points="96,70 70,96 63,85 85,63" fill="#BF360C" opacity={0.4} />

        {/* Inner Glowing Orange-Ruby Field */}
        <Polygon points="37,15 63,15 85,37 85,63 63,85 37,85 15,63 15,37" fill="url(#starOctBg)" stroke="#B71C1C" strokeWidth="2.5" />

        {/* Giant 3D Faceted 5-Point Star */}
        {/* Drop shadow */}
        <Path
          d="M 50 18 L 59 38 L 81 40 L 65 56 L 70 78 L 50 67 L 30 78 L 35 56 L 19 40 L 41 38 Z"
          fill="#5c0000"
          transform="translate(3, 4)"
          opacity={0.65}
        />
        {/* Left Facets (Glowing Platinum Gold) */}
        <Path d="M 50 18 L 50 52 L 41 38 Z" fill="#FFFFFF" />
        <Path d="M 50 52 L 50 67 L 30 78 Z" fill="#FFF59D" />
        <Path d="M 50 52 L 19 40 L 35 56 Z" fill="#FFFFFF" />
        <Path d="M 50 52 L 35 56 L 30 78 Z" fill="#FFF176" />
        <Path d="M 50 18 L 50 52 L 59 38 Z" fill="#FFF59D" />
        {/* Right Facets (Deep Amber Gold) */}
        <Path d="M 50 52 L 81 40 L 59 38 Z" fill="#FFD600" />
        <Path d="M 50 52 L 65 56 L 81 40 Z" fill="#FFAB00" />
        <Path d="M 50 52 L 70 78 L 65 56 Z" fill="#FF6D00" />
        <Path d="M 50 52 L 50 67 L 70 78 Z" fill="#FF9100" />

        {/* Brilliant Radiating Sparkles */}
        {renderSparkle(12, 28, 6)}
        {renderSparkle(88, 24, 5)}
        {renderSparkle(26, 92, 5.5)}
        {renderSparkle(78, 88, 4.5)}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
