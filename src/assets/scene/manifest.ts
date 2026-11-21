// Auto-derived from the supplied parallax_interactive_website_classic.spline (embedded raster layers).
// Each layer is cropped to its alpha bounding box; x/y/w/h are percentages of the original 1440×960 Spline canvas.
import sky from './sky.webp';
import horizon_clouds from './horizon-clouds.webp';
import lake from './lake.webp';
import hill from './hill.webp';
import puff from './puff.webp';
import tree from './tree.webp';
import ground from './ground.webp';
import figure_walker from './figure-walker.webp';
import figure_reclining from './figure-reclining.webp';
import figure_reaching from './figure-reaching.webp';
import europa_group from './europa-group.webp';

export interface SceneLayer { id: string; src: string; x: number; y: number; w: number; h: number; }

export const SCENE_LAYERS: Record<string, SceneLayer> = {
  'sky': { id: 'sky', src: sky, x: 0.000, y: 0.000, w: 100.000, h: 100.000 },
  'horizon-clouds': { id: 'horizon-clouds', src: horizon_clouds, x: 0.000, y: 55.417, w: 100.000, h: 44.583 },
  'lake': { id: 'lake', src: lake, x: 0.000, y: 15.625, w: 100.000, h: 45.104 },
  'hill': { id: 'hill', src: hill, x: 0.000, y: 0.000, w: 100.000, h: 100.000 },
  'puff': { id: 'puff', src: puff, x: 65.278, y: 20.312, w: 25.000, h: 25.938 },
  'tree': { id: 'tree', src: tree, x: 0.000, y: 0.000, w: 100.000, h: 100.000 },
  'ground': { id: 'ground', src: ground, x: 0.000, y: 80.521, w: 100.000, h: 41.458 },
  'figure-walker': { id: 'figure-walker', src: figure_walker, x: 62.292, y: 32.188, w: 18.403, h: 29.063 },
  'figure-reclining': { id: 'figure-reclining', src: figure_reclining, x: 48.819, y: 45.938, w: 27.986, h: 35.312 },
  'figure-reaching': { id: 'figure-reaching', src: figure_reaching, x: 49.097, y: 51.458, w: 36.944, h: 39.792 },
  'europa-group': { id: 'europa-group', src: europa_group, x: 3.889, y: 14.375, w: 62.778, h: 81.250 },
};
