import Phaser from 'phaser';
import GameScene from './GameScene';

/**
 * Game size is set to the container size so the canvas fills the viewport (full screen).
 * RESIZE mode keeps the canvas matching the container on resize so no letterboxing and no stretch.
 */
export function getPhaserConfig(
	parent: string,
	width: number,
	height: number
): Phaser.Types.Core.GameConfig {
	return {
		type: Phaser.AUTO,
		parent,
		width,
		height,
		scale: {
			mode: Phaser.Scale.RESIZE,
			autoCenter: Phaser.Scale.CENTER_BOTH
		},
		scene: [GameScene],
		physics: {
			default: 'arcade',
			arcade: {
				debug: false
			}
		}
	};
}
