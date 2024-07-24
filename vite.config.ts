import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';
import basicSSL from '@vitejs/plugin-basic-ssl';

export default defineConfig({
	server: {
		proxy: {}
	},
	plugins: [
		sveltekit(),
		SvelteKitPWA({
			manifest: {
				name: "Tools",
				short_name: "Tools",
				description: "some web based tools",
				background_color: "rgb(247 247 248)",
				theme_color: "rgb(247 247 248)",
				lang: "ko-KR",
				icons: [
					{
						src: "favicon.png",
						sizes: "256x256",
						type: "image/png",
						purpose: "any maskable"
					}
				]
			},
			registerType: "autoUpdate"
		}),
		basicSSL({
			name: "tools-dfkdream-dev"
		})
	]
});
