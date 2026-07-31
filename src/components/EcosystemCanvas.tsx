import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Entity, EntityType, WeatherCondition, ToolType, SanctuaryZone, FloatingText } from '../types';
import { soundManager } from '../utils/sound';

interface EcosystemCanvasProps {
  entities: Entity[];
  setEntities: React.Dispatch<React.SetStateAction<Entity[]>>;
  weather: WeatherCondition;
  activeTool: ToolType;
  isPaused: boolean;
  gameSpeed: number;
  sanctuaries: SanctuaryZone[];
  setSanctuaries: React.Dispatch<React.SetStateAction<SanctuaryZone[]>>;
  floatingTexts: FloatingText[];
  addFloatingText: (text: string, x: number, y: number, color?: string) => void;
  onEntityClick?: (entity: Entity) => void;
  selectedEntityId?: string | null;
}

export const EcosystemCanvas: React.FC<EcosystemCanvasProps> = ({
  entities,
  setEntities,
  weather,
  activeTool,
  isPaused,
  gameSpeed,
  sanctuaries,
  setSanctuaries,
  floatingTexts,
  addFloatingText,
  onEntityClick,
  selectedEntityId
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null);

  // Resize handler using ResizeObserver for responsive canvas
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current && canvasRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        if (width > 0 && height > 0) {
          canvasRef.current.width = width;
          canvasRef.current.height = height;
        }
      }
    };

    updateSize();

    const observer = new ResizeObserver(updateSize);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    window.addEventListener('resize', updateSize);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateSize);
    };
  }, []);

  // Main simulation loop
  useEffect(() => {
    if (isPaused) return;

    let animId: number;
    let lastTime = performance.now();

    const updateSimulation = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1) * gameSpeed;
      lastTime = now;

      setEntities((prevEntities) => {
        const canvas = canvasRef.current;
        if (!canvas) return prevEntities;
        const width = canvas.width || 600;
        const height = canvas.height || 500;

        const newEntities: Entity[] = [];
        const spawnedEntities: Entity[] = [];

        // Weather multipliers
        const grassGrowthFactor = weather === 'rainy' ? 2.2 : weather === 'drought' ? 0.2 : 1.0;

        prevEntities.forEach((entity) => {
          // Clone entity to update
          const updated = { ...entity };
          updated.age += dt;

          // 1. Grass behavior
          if (updated.type === 'grass') {
            // Grow slowly over time
            if (updated.energy < updated.maxEnergy) {
              updated.energy = Math.min(updated.maxEnergy, updated.energy + dt * 5 * grassGrowthFactor);
              updated.size = 12 + (updated.energy / updated.maxEnergy) * 10;
            }
            // Spontaneous seed reproduction if mature
            if (updated.energy >= updated.maxEnergy && Math.random() < 0.005 * dt * grassGrowthFactor) {
              if (prevEntities.filter((e) => e.type === 'grass').length < 65) {
                const spreadDist = 25 + Math.random() * 45;
                const angle = Math.random() * Math.PI * 2;
                const newX = Math.max(20, Math.min(width - 20, updated.x + Math.cos(angle) * spreadDist));
                const newY = Math.max(20, Math.min(height - 20, updated.y + Math.sin(angle) * spreadDist));
                spawnedEntities.push({
                  id: `grass_${Date.now()}_${Math.random()}`,
                  type: 'grass',
                  x: newX,
                  y: newY,
                  vx: 0,
                  vy: 0,
                  energy: 20,
                  maxEnergy: 100,
                  age: 0,
                  maxAge: 120,
                  size: 12,
                  state: 'idle',
                  birthTime: now
                });
              }
            }
            newEntities.push(updated);
            return;
          }

          // 2. Carcass behavior (decomposes into fertilizer)
          if (updated.type === 'carcass') {
            updated.energy -= dt * 10;
            if (updated.energy <= 0) {
              // Spawn 2-3 grasses around decomposition spot
              for (let i = 0; i < 2; i++) {
                const angle = Math.random() * Math.PI * 2;
                const dist = 15 + Math.random() * 20;
                spawnedEntities.push({
                  id: `grass_carcass_${Date.now()}_${i}`,
                  type: 'grass',
                  x: Math.max(15, Math.min(width - 15, updated.x + Math.cos(angle) * dist)),
                  y: Math.max(15, Math.min(height - 15, updated.y + Math.sin(angle) * dist)),
                  vx: 0,
                  vy: 0,
                  energy: 40,
                  maxEnergy: 100,
                  age: 0,
                  maxAge: 120,
                  size: 14,
                  state: 'idle',
                  birthTime: now
                });
              }
            } else {
              newEntities.push(updated);
            }
            return;
          }

          // 3. Animal Energy loss
          const energyLoss = updated.type === 'rabbit' ? 2.5 : updated.type === 'wolf' ? 3.2 : 2.0;
          updated.energy -= dt * energyLoss;

          // Death check
          if (updated.energy <= 0 || updated.age > updated.maxAge) {
            // Turn into carcass
            spawnedEntities.push({
              id: `carcass_${Date.now()}_${Math.random()}`,
              type: 'carcass',
              x: updated.x,
              y: updated.y,
              vx: 0,
              vy: 0,
              energy: 100,
              maxEnergy: 100,
              age: 0,
              maxAge: 15,
              size: 16,
              state: 'idle',
              birthTime: now
            });
            addFloatingText('💀 멸종/사망', updated.x, updated.y, '#9ca3af');
            return;
          }

          // Movement AI based on Entity Type
          if (updated.type === 'rabbit') {
            // Check predators nearby (wolf / eagle)
            const predator = prevEntities.find((e) => {
              if (e.type !== 'wolf' && e.type !== 'eagle') return false;
              const dx = e.x - updated.x;
              const dy = e.y - updated.y;
              return Math.sqrt(dx * dx + dy * dy) < 120;
            });

            if (predator) {
              // Flee from predator!
              updated.state = 'fleeing';
              const dx = updated.x - predator.x;
              const dy = updated.y - predator.y;
              const dist = Math.sqrt(dx * dx + dy * dy) || 1;
              updated.vx = (dx / dist) * 75;
              updated.vy = (dy / dist) * 75;
            } else {
              // Find nearest grass if hungry
              const nearbyGrass = prevEntities
                .filter((e) => e.type === 'grass' && e.energy > 15)
                .map((g) => ({
                  entity: g,
                  dist: Math.hypot(g.x - updated.x, g.y - updated.y)
                }))
                .sort((a, b) => a.dist - b.dist)[0];

              if (nearbyGrass && nearbyGrass.dist < 180) {
                updated.state = 'grazing';
                const dx = nearbyGrass.entity.x - updated.x;
                const dy = nearbyGrass.entity.y - updated.y;
                const dist = Math.hypot(dx, dy) || 1;
                updated.vx = (dx / dist) * 45;
                updated.vy = (dy / dist) * 45;

                // Eat grass on contact
                if (dist < 16) {
                  nearbyGrass.entity.energy -= 40;
                  updated.energy = Math.min(updated.maxEnergy, updated.energy + 35);
                  soundManager.playRabbitEat();
                  addFloatingText('+35 🌿', updated.x, updated.y - 10, '#22c55e');
                }
              } else {
                // Random wander
                updated.state = 'idle';
                if (Math.random() < 0.05) {
                  const angle = Math.random() * Math.PI * 2;
                  updated.vx = Math.cos(angle) * 35;
                  updated.vy = Math.sin(angle) * 35;
                }
              }

              // Rabbit reproduction if high energy & partner nearby
              if (updated.energy > 75 && updated.age > 5) {
                const partner = prevEntities.find((e) => {
                  if (e.type !== 'rabbit' || e.id === updated.id || e.energy <= 75) return false;
                  return Math.hypot(e.x - updated.x, e.y - updated.y) < 25;
                });

                if (partner && Math.random() < 0.08 * dt) {
                  updated.energy -= 30;
                  spawnedEntities.push({
                    id: `rabbit_baby_${Date.now()}_${Math.random()}`,
                    type: 'rabbit',
                    x: updated.x + (Math.random() - 0.5) * 20,
                    y: updated.y + (Math.random() - 0.5) * 20,
                    vx: (Math.random() - 0.5) * 30,
                    vy: (Math.random() - 0.5) * 30,
                    energy: 50,
                    maxEnergy: 100,
                    age: 0,
                    maxAge: 70,
                    size: 14,
                    state: 'idle',
                    birthTime: now,
                    isBaby: true
                  });
                  soundManager.playRabbitHop();
                  addFloatingText('💕 번식!', updated.x, updated.y - 15, '#ec4899');
                }
              }
            }
          } else if (updated.type === 'wolf') {
            // Wolf behavior: hunt rabbits
            // Repelled by Sanctuary Zones
            const inSanctuary = sanctuaries.find((s) => Math.hypot(s.x - updated.x, s.y - updated.y) < s.radius + 15);

            if (inSanctuary) {
              // Flee out of sanctuary
              const dx = updated.x - inSanctuary.x;
              const dy = updated.y - inSanctuary.y;
              const dist = Math.hypot(dx, dy) || 1;
              updated.vx = (dx / dist) * 80;
              updated.vy = (dy / dist) * 80;
            } else {
              // Find nearest rabbit outside sanctuaries
              const targetRabbit = prevEntities
                .filter((e) => {
                  if (e.type !== 'rabbit') return false;
                  // check if rabbit is inside sanctuary
                  return !sanctuaries.some((s) => Math.hypot(s.x - e.x, s.y - e.y) < s.radius);
                })
                .map((r) => ({
                  entity: r,
                  dist: Math.hypot(r.x - updated.x, r.y - updated.y)
                }))
                .sort((a, b) => a.dist - b.dist)[0];

              if (targetRabbit && targetRabbit.dist < 220) {
                updated.state = 'hunting';
                const dx = targetRabbit.entity.x - updated.x;
                const dy = targetRabbit.entity.y - updated.y;
                const dist = Math.hypot(dx, dy) || 1;
                updated.vx = (dx / dist) * 60;
                updated.vy = (dy / dist) * 60;

                // Catch rabbit
                if (dist < 20) {
                  targetRabbit.entity.energy = 0; // Kills rabbit
                  updated.energy = Math.min(updated.maxEnergy, updated.energy + 55);
                  soundManager.playWolfHowl();
                  addFloatingText('🍖 사냥 성공!', updated.x, updated.y - 12, '#ef4444');
                }
              } else {
                // Wandering
                updated.state = 'idle';
                if (Math.random() < 0.04) {
                  const angle = Math.random() * Math.PI * 2;
                  updated.vx = Math.cos(angle) * 40;
                  updated.vy = Math.sin(angle) * 40;
                }
              }

              // Wolf reproduction if energy is high
              if (updated.energy > 80 && updated.age > 8) {
                const partner = prevEntities.find((e) => {
                  if (e.type !== 'wolf' || e.id === updated.id || e.energy <= 80) return false;
                  return Math.hypot(e.x - updated.x, e.y - updated.y) < 30;
                });

                if (partner && Math.random() < 0.05 * dt) {
                  updated.energy -= 40;
                  spawnedEntities.push({
                    id: `wolf_baby_${Date.now()}_${Math.random()}`,
                    type: 'wolf',
                    x: updated.x + (Math.random() - 0.5) * 20,
                    y: updated.y + (Math.random() - 0.5) * 20,
                    vx: (Math.random() - 0.5) * 35,
                    vy: (Math.random() - 0.5) * 35,
                    energy: 60,
                    maxEnergy: 120,
                    age: 0,
                    maxAge: 90,
                    size: 16,
                    state: 'idle',
                    birthTime: now,
                    isBaby: true
                  });
                  addFloatingText('🐺 새끼 늑대!', updated.x, updated.y - 15, '#f59e0b');
                }
              }
            }
          } else if (updated.type === 'eagle') {
            // Eagle swoops in sky
            const targetPrey = prevEntities
              .filter((e) => (e.type === 'rabbit' || (e.type === 'wolf' && e.isBaby)) && !sanctuaries.some((s) => Math.hypot(s.x - e.x, s.y - e.y) < s.radius))
              .map((p) => ({
                entity: p,
                dist: Math.hypot(p.x - updated.x, p.y - updated.y)
              }))
              .sort((a, b) => a.dist - b.dist)[0];

            if (targetPrey && targetPrey.dist < 260) {
              const dx = targetPrey.entity.x - updated.x;
              const dy = targetPrey.entity.y - updated.y;
              const dist = Math.hypot(dx, dy) || 1;
              updated.vx = (dx / dist) * 75;
              updated.vy = (dy / dist) * 75;

              if (dist < 22) {
                targetPrey.entity.energy = 0;
                updated.energy = Math.min(updated.maxEnergy, updated.energy + 60);
                addFloatingText('🦅 독수리 포획!', updated.x, updated.y - 15, '#8b5cf6');
              }
            } else {
              if (Math.random() < 0.03) {
                const angle = Math.random() * Math.PI * 2;
                updated.vx = Math.cos(angle) * 55;
                updated.vy = Math.sin(angle) * 55;
              }
            }
          }

          // Boundary bounce update position
          updated.x += updated.vx * dt;
          updated.y += updated.vy * dt;

          if (updated.x < 20) {
            updated.x = 20;
            updated.vx *= -1;
          }
          if (updated.x > width - 20) {
            updated.x = width - 20;
            updated.vx *= -1;
          }
          if (updated.y < 20) {
            updated.y = 20;
            updated.vy *= -1;
          }
          if (updated.y > height - 20) {
            updated.y = height - 20;
            updated.vy *= -1;
          }

          // Baby growth check
          if (updated.isBaby && updated.age > 15) {
            updated.isBaby = false;
            updated.size = updated.type === 'rabbit' ? 20 : 24;
          }

          newEntities.push(updated);
        });

        return [...newEntities.filter((e) => e.energy > 0), ...spawnedEntities];
      });

      animId = requestAnimationFrame(updateSimulation);
    };

    animId = requestAnimationFrame(updateSimulation);
    return () => cancelAnimationFrame(animId);
  }, [isPaused, gameSpeed, weather, setEntities, sanctuaries, addFloatingText]);

  // Canvas Drawing Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // 1. Clear Canvas FIRST
    ctx.clearRect(0, 0, width, height);

    // 2. Draw Ground Base Color based on Weather
    if (weather === 'drought') {
      ctx.fillStyle = '#fef08a'; // Dry prairie yellowish ground
    } else if (weather === 'rainy') {
      ctx.fillStyle = '#dbeafe'; // Wet meadow bluish ground
    } else {
      ctx.fillStyle = '#dcfce7'; // Lush green meadow ground
    }
    ctx.fillRect(0, 0, width, height);

    // Grid pattern background
    ctx.strokeStyle = weather === 'drought' ? 'rgba(217, 119, 6, 0.12)' : 'rgba(22, 163, 74, 0.12)';
    ctx.lineWidth = 1;
    const gridSize = 40;
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // 3. Draw Natural Landscape Map Elements
    // Water Pond in Top-Right
    const pondX = width - 110;
    const pondY = 90;
    const pondRadius = 65;
    
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(pondX, pondY, pondRadius, pondRadius * 0.7, Math.PI / 6, 0, Math.PI * 2);
    ctx.fillStyle = '#38bdf8'; // Water blue
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#0284c7';
    ctx.stroke();

    // Water ripple effect
    ctx.beginPath();
    ctx.ellipse(pondX - 10, pondY + 5, pondRadius * 0.5, pondRadius * 0.35, Math.PI / 6, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Water label & Lilypad
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🪷', pondX - 20, pondY - 10);
    ctx.fillText('🌊 생태 연못', pondX, pondY + 12);
    ctx.restore();

    // Rock Cluster in Bottom-Left
    const rockX = 100;
    const rockY = height - 80;
    ctx.save();
    ctx.font = '18px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🪨', rockX, rockY);
    ctx.fillText('🪨', rockX + 22, rockY + 10);
    ctx.fillText('🪨', rockX - 18, rockY + 12);
    ctx.font = '10px font-semibold sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText('바위 쉼터', rockX + 2, rockY + 28);
    ctx.restore();

    // Wood / Border Fence Map Frame
    ctx.save();
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 4;
    ctx.strokeRect(6, 6, width - 12, height - 12);
    // Corner posts
    const corners = [
      { x: 6, y: 6 },
      { x: width - 6, y: 6 },
      { x: 6, y: height - 6 },
      { x: width - 6, y: height - 6 }
    ];
    corners.forEach((c) => {
      ctx.fillStyle = '#78350f';
      ctx.beginPath();
      ctx.arc(c.x, c.y, 6, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();

    // 4. Draw Sanctuaries
    sanctuaries.forEach((s) => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(34, 197, 94, 0.2)';
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#16a34a';
      ctx.setLineDash([6, 6]);
      ctx.stroke();
      ctx.restore();

      ctx.font = 'bold 11px sans-serif';
      ctx.fillStyle = '#15803d';
      ctx.textAlign = 'center';
      ctx.fillText('🛡️ 야생동물 보호구역', s.x, s.y - s.radius - 6);
    });

    // 5. Draw Entities with Health & Action Badges
    entities.forEach((e) => {
      ctx.save();
      ctx.translate(e.x, e.y);

      const isSelected = e.id === selectedEntityId;

      if (isSelected) {
        ctx.beginPath();
        ctx.arc(0, 0, e.size + 12, 0, Math.PI * 2);
        ctx.strokeStyle = '#2563eb';
        ctx.lineWidth = 3;
        ctx.stroke();
      }

      if (e.type === 'grass') {
        ctx.font = `${Math.floor(e.size)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🌿', 0, 0);
      } else if (e.type === 'rabbit') {
        const emoji = e.isBaby ? '🐇' : '🐰';
        ctx.font = `${e.isBaby ? 18 : 24}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(emoji, 0, 0);

        // State indicator icon
        if (e.state === 'fleeing') {
          ctx.font = '10px sans-serif';
          ctx.fillText('💨', 12, -12);
        } else if (e.state === 'grazing') {
          ctx.font = '10px sans-serif';
          ctx.fillText('🍽️', 12, -12);
        }

        // Energy Bar
        const barW = 22;
        const barH = 4;
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(-barW / 2, -18, barW, barH);
        ctx.fillStyle = e.energy > 40 ? '#22c55e' : '#ef4444';
        ctx.fillRect(-barW / 2, -18, Math.max(0, (e.energy / e.maxEnergy) * barW), barH);
      } else if (e.type === 'wolf') {
        ctx.font = `${e.isBaby ? 20 : 28}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🐺', 0, 0);

        // State indicator icon
        if (e.state === 'hunting') {
          ctx.font = '11px sans-serif';
          ctx.fillText('🏹', 14, -14);
        }

        // Energy Bar
        const barW = 26;
        const barH = 4;
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(-barW / 2, -22, barW, barH);
        ctx.fillStyle = e.energy > 40 ? '#f59e0b' : '#ef4444';
        ctx.fillRect(-barW / 2, -22, Math.max(0, (e.energy / e.maxEnergy) * barW), barH);
      } else if (e.type === 'eagle') {
        ctx.shadowColor = 'rgba(0,0,0,0.3)';
        ctx.shadowOffsetY = 12;
        ctx.font = '32px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🦅', 0, 0);
      } else if (e.type === 'carcass') {
        ctx.font = '20px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('💀', 0, 0);
      }

      ctx.restore();
    });

    // 6. Draw Weather Overlay Effects
    if (weather === 'rainy') {
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 50; i++) {
        const rx = (Math.sin(i * 99 + Date.now() * 0.005) * 0.5 + 0.5) * width;
        const ry = ((Date.now() * 0.8 + i * 40) % height);
        ctx.beginPath();
        ctx.moveTo(rx, ry);
        ctx.lineTo(rx - 4, ry + 14);
        ctx.stroke();
      }
    } else if (weather === 'drought') {
      const gradient = ctx.createRadialGradient(width - 40, 40, 10, width - 40, 40, width);
      gradient.addColorStop(0, 'rgba(251, 146, 60, 0.2)');
      gradient.addColorStop(1, 'rgba(251, 146, 60, 0.0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
    }

    // 7. Top Map HUD Banner Legend
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.fillRect(16, 14, 280, 26);
    ctx.strokeStyle = 'rgba(203, 213, 225, 0.8)';
    ctx.lineWidth = 1;
    ctx.strokeRect(16, 14, 280, 26);

    ctx.font = 'bold 11px sans-serif';
    ctx.fillStyle = '#1e293b';
    ctx.textAlign = 'left';
    ctx.fillText('🗺️ 생태계 탐사 지도 (연못 🌊 | 바위 🪨 | 울타리 🪵)', 24, 31);
    ctx.restore();

    // 5. Draw Active Tool Cursor Preview
    if (hoverPos && activeTool !== 'select') {
      ctx.save();
      ctx.translate(hoverPos.x, hoverPos.y);

      if (activeTool === 'sanctuary') {
        ctx.beginPath();
        ctx.arc(0, 0, 80, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(34, 197, 94, 0.2)';
        ctx.fill();
        ctx.strokeStyle = '#22c55e';
        ctx.stroke();
      } else {
        const toolIconMap: Record<string, string> = {
          grass: '🌿',
          rabbit: '🐇',
          wolf: '🐺',
          eagle: '🦅',
          rain: '🌧️',
          fertilizer: '🧪',
          remove: '🧹'
        };
        ctx.font = '24px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.globalAlpha = 0.7;
        ctx.fillText(toolIconMap[activeTool] || '✨', 0, 0);
      }
      ctx.restore();
    }
  }, [entities, weather, activeTool, sanctuaries, selectedEntityId, hoverPos]);

  const [isMouseDown, setIsMouseDown] = useState<boolean>(false);
  const lastDragSpawnTime = useRef<number>(0);

  // Helper to spawn at x,y
  const spawnOrActAt = useCallback(
    (x: number, y: number, isDrag: boolean = false) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      if (activeTool === 'select') return;

      const now = performance.now();
      // Throttle drag spawning so it doesn't create thousands instantly
      if (isDrag && now - lastDragSpawnTime.current < 120) return;
      lastDragSpawnTime.current = now;

      if (activeTool === 'grass') {
        soundManager.playPlantSeed();
        const count = isDrag ? 1 : 3;
        for (let i = 0; i < count; i++) {
          const offsetX = (Math.random() - 0.5) * 20;
          const offsetY = (Math.random() - 0.5) * 20;
          const newG: Entity = {
            id: `grass_${Date.now()}_${i}_${Math.random()}`,
            type: 'grass',
            x: Math.max(15, Math.min(canvas.width - 15, x + offsetX)),
            y: Math.max(15, Math.min(canvas.height - 15, y + offsetY)),
            vx: 0,
            vy: 0,
            energy: 40,
            maxEnergy: 100,
            age: 0,
            maxAge: 120,
            size: 14,
            state: 'idle',
            birthTime: performance.now()
          };
          setEntities((prev) => [...prev, newG]);
        }
        if (!isDrag) addFloatingText('+🌿 풀 심기', x, y, '#22c55e');
      } else if (activeTool === 'rabbit') {
        soundManager.playRabbitHop();
        const newR: Entity = {
          id: `rabbit_${Date.now()}_${Math.random()}`,
          type: 'rabbit',
          x,
          y,
          vx: (Math.random() - 0.5) * 35,
          vy: (Math.random() - 0.5) * 35,
          energy: 70,
          maxEnergy: 100,
          age: 2,
          maxAge: 80,
          size: 20,
          state: 'idle',
          birthTime: performance.now()
        };
        setEntities((prev) => [...prev, newR]);
        if (!isDrag) addFloatingText('+🐇 토끼 방사', x, y, '#3b82f6');
      } else if (activeTool === 'wolf') {
        soundManager.playWolfHowl();
        const newW: Entity = {
          id: `wolf_${Date.now()}_${Math.random()}`,
          type: 'wolf',
          x,
          y,
          vx: (Math.random() - 0.5) * 40,
          vy: (Math.random() - 0.5) * 40,
          energy: 80,
          maxEnergy: 120,
          age: 3,
          maxAge: 100,
          size: 26,
          state: 'idle',
          birthTime: performance.now()
        };
        setEntities((prev) => [...prev, newW]);
        if (!isDrag) addFloatingText('+🐺 늑대 방사', x, y, '#f59e0b');
      } else if (activeTool === 'eagle') {
        soundManager.playClick();
        const newE: Entity = {
          id: `eagle_${Date.now()}_${Math.random()}`,
          type: 'eagle',
          x,
          y,
          vx: (Math.random() - 0.5) * 60,
          vy: (Math.random() - 0.5) * 60,
          energy: 90,
          maxEnergy: 150,
          age: 4,
          maxAge: 120,
          size: 28,
          state: 'idle',
          birthTime: performance.now()
        };
        setEntities((prev) => [...prev, newE]);
        if (!isDrag) addFloatingText('+🦅 독수리 등장', x, y, '#8b5cf6');
      } else if (activeTool === 'rain') {
        soundManager.playRain();
        if (!isDrag) addFloatingText('🌧️ 단비 내림!', x, y, '#0284c7');
        setEntities((prev) =>
          prev.map((e) => {
            if (e.type === 'grass' && Math.hypot(e.x - x, e.y - y) < 120) {
              return { ...e, energy: Math.min(e.maxEnergy, e.energy + 30) };
            }
            return e;
          })
        );
      } else if (activeTool === 'fertilizer') {
        soundManager.playPlantSeed();
        if (!isDrag) addFloatingText('🧪 비료 공급!', x, y, '#16a34a');
        for (let i = 0; i < (isDrag ? 2 : 4); i++) {
          const angle = Math.random() * Math.PI * 2;
          const dist = Math.random() * 35;
          setEntities((prev) => [
            ...prev,
            {
              id: `grass_fert_${Date.now()}_${i}_${Math.random()}`,
              type: 'grass',
              x: Math.max(15, Math.min(canvas.width - 15, x + Math.cos(angle) * dist)),
              y: Math.max(15, Math.min(canvas.height - 15, y + Math.sin(angle) * dist)),
              vx: 0,
              vy: 0,
              energy: 80,
              maxEnergy: 100,
              age: 0,
              maxAge: 120,
              size: 16,
              state: 'idle',
              birthTime: performance.now()
            }
          ]);
        }
      } else if (activeTool === 'sanctuary' && !isDrag) {
        soundManager.playClick();
        const newS: SanctuaryZone = {
          id: `sanc_${Date.now()}`,
          x,
          y,
          radius: 85
        };
        setSanctuaries((prev) => [...prev, newS]);
        addFloatingText('🛡️ 야생동물 보호구역 설정', x, y, '#22c55e');
      } else if (activeTool === 'remove') {
        soundManager.playClick();
        setEntities((prev) => prev.filter((e) => Math.hypot(e.x - x, e.y - y) > 35));
        setSanctuaries((prev) => prev.filter((s) => Math.hypot(s.x - x, s.y - y) > s.radius));
        if (!isDrag) addFloatingText('🧹 제거 완료', x, y, '#ef4444');
      }
    },
    [activeTool, setEntities, setSanctuaries, addFloatingText]
  );

  // Click Interaction to spawn or perform actions
  const handleCanvasMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      setIsMouseDown(true);
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (activeTool === 'select') {
        const clicked = entities.find((ent) => Math.hypot(ent.x - x, ent.y - y) < ent.size + 10);
        if (clicked && onEntityClick) {
          onEntityClick(clicked);
        }
        return;
      }

      spawnOrActAt(x, y, false);
    },
    [activeTool, entities, onEntityClick, spawnOrActAt]
  );

  const handleCanvasMouseUp = () => {
    setIsMouseDown(false);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setHoverPos({ x, y });

    if (isMouseDown && activeTool !== 'select') {
      spawnOrActAt(x, y, true);
    }
  };

  const handleMouseLeave = () => {
    setHoverPos(null);
  };

  const getToolHint = () => {
    switch (activeTool) {
      case 'select':
        return '👆 개체를 클릭하면 나이, 건강 상태, 행동 정보를 볼 수 있습니다.';
      case 'grass':
        return '🌿 마우스를 누른 채 슥- 드래그하면 풀을 빠르게 심을 수 있습니다!';
      case 'rabbit':
        return '🐇 클릭하거나 드래그해서 초원에 토끼를 방사해보세요.';
      case 'wolf':
        return '🐺 클릭해서 포식자 늑대를 방사해보세요.';
      case 'eagle':
        return '🦅 하늘의 최상위 포식자 독수리를 방사해보세요.';
      case 'rain':
        return '🌧️ 클릭하거나 드래그해서 토양에 촉촉한 단비를 내립니다.';
      case 'fertilizer':
        return '🧪 클릭하여 영양만점 비료를 투입해 풀을 급성장시킵니다.';
      case 'sanctuary':
        return '🛡️ 클릭해서 늑대가 들어오지 못하는 토끼 보호 원을 만듭니다.';
      case 'remove':
        return '🧹 마우스로 쓱 지나가며 필요 없는 개체를 정리합니다.';
      default:
        return '도구를 선택한 후 맵을 클릭하거나 드래그해보세요.';
    }
  };

  return (
    <div ref={containerRef} className="relative w-full h-[480px] bg-emerald-950/5 rounded-2xl border-2 border-emerald-500/20 shadow-inner overflow-hidden select-none">
      {/* Top Interactive Tool Action Banner */}
      <div className="absolute top-3 right-3 z-10 bg-slate-900/80 backdrop-blur-md text-white px-3.5 py-1.5 rounded-full text-[11px] font-bold shadow-lg border border-slate-700/60 flex items-center gap-1.5 animate-in fade-in">
        <span className="animate-pulse text-amber-400">✨</span>
        <span>{getToolHint()}</span>
      </div>

      <canvas
        ref={canvasRef}
        onMouseDown={handleCanvasMouseDown}
        onMouseUp={handleCanvasMouseUp}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => {
          handleMouseLeave();
          handleCanvasMouseUp();
        }}
        className="w-full h-full cursor-crosshair block"
      />

      {/* Floating Animated Text Badges */}
      {floatingTexts.map((ft) => (
        <div
          key={ft.id}
          className="absolute pointer-events-none font-bold text-xs px-2 py-0.5 rounded-full shadow-md animate-bounce border"
          style={{
            left: ft.x,
            top: ft.y - 15,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            color: ft.color,
            borderColor: ft.color
          }}
        >
          {ft.text}
        </div>
      ))}
    </div>
  );
};
