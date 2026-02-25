import Phaser from 'phaser';
import GameScene from './GameScene';

export function getPhaserConfig(parent: string): Phaser.Types.Core.GameConfig {
	return {
		type: Phaser.AUTO,
		parent,
		width: 800,
		height: 600,
		scale: {
			mode: Phaser.Scale.FIT,
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
